/* School_story account + cloud-save Worker.
 *
 * Plain ES module in Wrangler's modules format. Zero dependencies.
 *
 *   GET    /health       -> { ok, service }              (ops probe, no data)
 *   GET    /auth/config  -> { enabled, clientId }
 *   POST   /auth/google  <- { credential }               (Google ID token)
 *   POST   /auth/logout  -> { ok: true }
 *   GET    /me           -> { id, email, name, picture }
 *   DELETE /me           -> { ok, deleted, userId }
 *   GET    /save         -> { save, updatedAt } | 404
 *   PUT    /save         <- { save }                     -> { updatedAt }
 *
 * Security model, in one paragraph: the browser is never trusted to say who it
 * is. The only identity accepted comes out of a Google-signed ID token that was
 * verified against Google's published JWKS with WebCrypto (src/google.js).
 * The session cookie is a random 256-bit bearer token; D1 stores only its
 * SHA-256 digest (src/session.js). Saves are scoped to the session's user id,
 * never to an id supplied in the request body.
 *
 * NOTE ON EXPORTS: this file exports exactly one thing, the default handler.
 * In the Workers modules format every *named* export of the entry module is
 * registered as an entry-point handler, so exporting a constant here makes
 * workerd refuse to boot ("Incorrect type for map entry '…'"). Helpers live in
 * src/config.js, src/google.js, src/session.js and src/db.js. `wrangler deploy
 * --dry-run` does not catch that mistake; only a real runtime boot does.
 */

import { createJwksCache, getSharedJwksCache, verifyGoogleIdToken, TokenError } from "./google.js";
import {
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionToken,
  hashSessionToken,
  readSessionCookie,
  SESSION_TTL_MS,
  SESSION_TTL_SECONDS,
  sameSiteFor
} from "./session.js";
import {
  createSession,
  deleteExpiredSessions,
  deleteSession,
  deleteUser,
  getSave,
  getSessionWithUser,
  nowIso,
  publicUser,
  putSave,
  upsertUser
} from "./db.js";
import {
  MAX_JSON_BODY_BYTES,
  MAX_SAVE_BODY_BYTES,
  matchesOriginPattern,
  readConfig
} from "./config.js";

/* --------------------------------------------------------------- responses */

class HttpError extends Error {
  constructor(status, code, message) {
    super(message || code);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders
    }
  });
}

function errorResponse(status, code, message, extraHeaders = {}) {
  const body = { error: code };
  if (message) body.message = message;
  return jsonResponse(body, status, extraHeaders);
}

/* -------------------------------------------------------------------- CORS */

/* A plain object, not a Headers: response headers are built by spreading, and
 * spreading a Headers instance silently yields nothing at all. */
function corsHeaders(request, allowedOrigins) {
  const origin = request.headers.get("origin");
  const headers = { vary: "origin" };
  if (!origin) return headers;
  if (allowedOrigins.some((pattern) => matchesOriginPattern(origin, pattern))) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
    headers["access-control-allow-methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["access-control-allow-headers"] = "content-type";
    headers["access-control-max-age"] = "86400";
    /* Chrome's Private Network Access: lets a public page call a LAN address
     * during local development against `wrangler dev`. */
    if (request.headers.get("access-control-request-private-network") === "true") {
      headers["access-control-allow-private-network"] = "true";
    }
  }
  return headers;
}

/* ------------------------------------------------------------- request body */

function assertJsonContentType(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!/^application\/json\b/i.test(contentType)) {
    throw new HttpError(415, "unsupported_media_type", "Send Content-Type: application/json.");
  }
}

async function readJsonBody(request, maxBytes) {
  assertJsonContentType(request);
  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > maxBytes) {
    throw new HttpError(413, "payload_too_large", `Body must be ${maxBytes} bytes or less.`);
  }
  /* The byte check after buffering is the real one: a streamed body has no
   * Content-Length, so the header can never be the only guard. */
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    throw new HttpError(413, "payload_too_large", `Body must be ${maxBytes} bytes or less.`);
  }
  if (buffer.byteLength === 0) throw new HttpError(400, "empty_body");
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(buffer));
  } catch (_err) {
    throw new HttpError(400, "invalid_json");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new HttpError(400, "invalid_json", "Body must be a JSON object.");
  }
  return parsed;
}

/* -------------------------------------------------------------------- auth */

function sessionCookieHeaders(request, env, config, token) {
  return {
    "set-cookie": buildSessionCookie(token, {
      secure: config.secureCookies,
      sameSite: config.fixedSameSite || sameSiteFor(request, env),
      maxAgeSeconds: SESSION_TTL_SECONDS
    })
  };
}

function clearedCookieHeaders(request, env, config) {
  return {
    "set-cookie": buildClearedSessionCookie({
      secure: config.secureCookies,
      sameSite: config.fixedSameSite || sameSiteFor(request, env)
    })
  };
}

/**
 * Resolve the session cookie to a user, or null. A null result means 401 —
 * there is no "anonymous but allowed" state in this Worker.
 */
async function authenticate(request, env) {
  const token = readSessionCookie(request);
  if (!token) return null;
  const db = env.DB;
  if (!db) throw new HttpError(500, "server_misconfigured", "D1 binding DB is missing.");
  const tokenHash = await hashSessionToken(token);
  const found = await getSessionWithUser(db, tokenHash, nowIso());
  if (!found) return null;
  return { user: found.user, tokenHash };
}

/* ------------------------------------------------------------------ routes */

async function handleAuthConfig(config, cors) {
  return jsonResponse(
    { enabled: config.clientIdValid, clientId: config.clientIdValid ? config.clientId : "" },
    200,
    cors
  );
}

async function handleGoogleSignIn(request, env, config, cors) {
  if (!config.clientIdValid) {
    return errorResponse(503, "auth_disabled", "GOOGLE_CLIENT_ID is not configured on the Worker.", cors);
  }
  const body = await readJsonBody(request, MAX_JSON_BODY_BYTES);
  const credential = body.credential;
  if (typeof credential !== "string" || credential.length === 0) {
    return errorResponse(400, "missing_credential", "Body must be { credential: '<google id token>' }.", cors);
  }

  const db = env.DB;
  if (!db) return errorResponse(500, "server_misconfigured", "D1 binding DB is missing.", cors);

  let identity;
  try {
    identity = await verifyGoogleIdToken(credential, {
      clientId: config.clientId,
      getKeys: (opts) => getSharedJwksCache().getKeys(opts)
    });
  } catch (error) {
    /* Never echo the token. `code` is a fixed identifier, safe to return and
     * useful when debugging a real sign-in failure. */
    if (error instanceof TokenError) {
      return errorResponse(401, String(error.code || "invalid_token"), "Google ID token verification failed.", cors);
    }
    return errorResponse(401, "invalid_token", "Google ID token verification failed.", cors);
  }

  /* Only fields from the *verified* payload are used. A body-supplied id,
   * email or user object is never read. */
  const user = await upsertUser(db, {
    id: identity.sub,
    email: identity.email,
    name: identity.name,
    picture: identity.picture,
    updatedAt: nowIso()
  });

  const token = createSessionToken();
  const tokenHash = await hashSessionToken(token);
  const nowMs = Date.now();
  await deleteExpiredSessions(db, nowIso(nowMs));
  await createSession(db, tokenHash, user.id, nowIso(nowMs + SESSION_TTL_MS), nowIso(nowMs));

  return jsonResponse(
    { user: publicUser(user), expiresAt: nowIso(nowMs + SESSION_TTL_MS) },
    200,
    { ...cors, ...sessionCookieHeaders(request, env, config, token) }
  );
}

async function handleLogout(request, env, config, cors) {
  const db = env.DB;
  if (db) {
    const token = readSessionCookie(request);
    if (token) await deleteSession(db, await hashSessionToken(token));
  }
  return jsonResponse({ ok: true }, 200, { ...cors, ...clearedCookieHeaders(request, env, config) });
}

async function handleMe(config, cors, session) {
  if (!session) return errorResponse(401, "unauthorized", "Sign in first.", cors);
  return jsonResponse(publicUser(session.user), 200, cors);
}

async function handleGetSave(env, cors, session) {
  if (!session) return errorResponse(401, "unauthorized", "Sign in first.", cors);
  const stored = await getSave(env.DB, session.user.id);
  if (!stored) return errorResponse(404, "no_save", "No cloud save for this account yet.", cors);
  return jsonResponse({ save: stored.save, updatedAt: stored.updatedAt }, 200, cors);
}

async function handlePutSave(request, env, config, cors, session) {
  if (!session) return errorResponse(401, "unauthorized", "Sign in first.", cors);
  const body = await readJsonBody(request, MAX_SAVE_BODY_BYTES);
  const save = body.save;
  if (!save || typeof save !== "object" || Array.isArray(save)) {
    return errorResponse(400, "invalid_save", "Body must be { save: <object> }.", cors);
  }
  /* Stored opaquely as JSON text so the game's save shape can evolve without a
   * schema migration. The save's own field validity is the game's business:
   * G.state.restore() already rejects bad fields, and a stricter Worker would
   * go stale the next time the save grows a field. */
  const payloadText = JSON.stringify(save);
  if (new TextEncoder().encode(payloadText).byteLength > MAX_SAVE_BODY_BYTES) {
    return errorResponse(413, "payload_too_large", `Save must be ${MAX_SAVE_BODY_BYTES} bytes or less.`, cors);
  }
  const updatedAt = await putSave(env.DB, session.user.id, payloadText, nowIso());
  return jsonResponse({ updatedAt }, 200, cors);
}

async function handleDeleteAccount(request, env, config, cors, session) {
  if (!session) return errorResponse(401, "unauthorized", "Sign in first.", cors);
  await deleteUser(env.DB, session.user.id);
  return jsonResponse(
    { ok: true, deleted: true, userId: session.user.id },
    200,
    { ...cors, ...clearedCookieHeaders(request, env, config) }
  );
}

function allowHeaderFor(path) {
  switch (path) {
    case "/me":
      return "GET, DELETE, OPTIONS";
    case "/auth/google":
    case "/auth/logout":
      return "POST, OPTIONS";
    case "/save":
      return "GET, PUT, OPTIONS";
    default:
      return "GET, OPTIONS";
  }
}

/* --------------------------------------------------------------- dispatch */

export default {
  async fetch(request, env) {
    const config = readConfig(env);
    const cors = corsHeaders(request, config.allowedOrigins);
    const origin = request.headers.get("origin");

    /* Origin gate. A browser request carrying a disallowed Origin is refused
     * outright, before any route runs. Requests with no Origin (curl, uptime
     * checks, the test harness) pass — they cannot carry a victim's cookie.
     * This, not SameSite, is what actually blocks cross-site writes. */
    if (
      origin &&
      !config.allowedOrigins.some((pattern) => matchesOriginPattern(origin, pattern))
    ) {
      return errorResponse(403, "origin_not_allowed", "This origin is not allowed to use this API.");
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: new Headers(cors) });
    }

    let path;
    try {
      path = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    } catch (_err) {
      return errorResponse(400, "bad_request", "Unparseable request URL.", cors);
    }
    const method = request.method.toUpperCase();

    try {
      if (path === "/health" && method === "GET") {
        return jsonResponse({ ok: true, service: "school-story-worker" }, 200, cors);
      }
      if (path === "/auth/config" && method === "GET") {
        return await handleAuthConfig(config, cors);
      }
      if (path === "/auth/google" && method === "POST") {
        return await handleGoogleSignIn(request, env, config, cors);
      }
      if (path === "/auth/logout" && method === "POST") {
        return await handleLogout(request, env, config, cors);
      }

      const needsSession =
        (path === "/me" && (method === "GET" || method === "DELETE")) ||
        (path === "/save" && (method === "GET" || method === "PUT"));
      const session = needsSession ? await authenticate(request, env) : null;

      if (path === "/me" && method === "GET") return await handleMe(config, cors, session);
      if (path === "/me" && method === "DELETE") return await handleDeleteAccount(request, env, config, cors, session);
      if (path === "/save" && method === "GET") return await handleGetSave(env, cors, session);
      if (path === "/save" && method === "PUT") return await handlePutSave(request, env, config, cors, session);

      const known = ["/health", "/auth/config", "/auth/google", "/auth/logout", "/me", "/save"];
      if (known.includes(path)) {
        return errorResponse(405, "method_not_allowed", `${method} is not allowed on ${path}.`, {
          ...cors,
          allow: allowHeaderFor(path)
        });
      }
      return errorResponse(404, "not_found", "No such endpoint.", cors);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.status, error.code, error.message, cors);
      }
      /* Unexpected failures never leak internals to the client. */
      console.error("unhandled worker error", error && error.stack ? error.stack : error);
      return errorResponse(500, "internal_error", "Unexpected server error.", cors);
    }
  }
};
