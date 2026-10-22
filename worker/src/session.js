/* Session tokens and cookies.
 *
 * The cookie carries a random 256-bit bearer token. D1 only ever sees its
 * SHA-256 hex digest, so a dump of the database cannot be replayed as a set of
 * live sessions. Tokens are high-entropy random values, which is exactly why a
 * plain (unpeppered) SHA-256 is appropriate here — there is no dictionary to
 * attack, and a pepper would only add a secret to operate.
 */

export const SESSION_COOKIE_NAME = "ss_session";
export const SESSION_TTL_DAYS = 30;
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
export const SESSION_TTL_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;

const TOKEN_BYTES = 32; // 256 bits

/** 32 random bytes, base64url without padding (43 chars, cookie-safe). */
export function createSessionToken() {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export function base64UrlEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** SHA-256 hex digest — what actually gets stored in D1. */
export async function hashSessionToken(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

/* -------------------------------------------------------------------- cookies */

/** `Cookie: a=1; ss_session=xyz` -> { a: "1", ss_session: "xyz" } */
export function parseCookies(header) {
  const out = {};
  if (typeof header !== "string" || header.length === 0) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const name = part.slice(0, eq).trim();
    if (!name || Object.prototype.hasOwnProperty.call(out, name)) continue;
    out[name] = part.slice(eq + 1).trim();
  }
  return out;
}

export function readSessionCookie(request) {
  const cookies = parseCookies(request.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function buildSessionCookie(token, options = {}) {
  const maxAgeSeconds = options.maxAgeSeconds ?? SESSION_TTL_SECONDS;
  const sameSite = options.sameSite || "Lax";
  const secure = options.secure !== false;
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    secure ? "Secure" : null,
    `SameSite=${sameSite}`,
    `Max-Age=${maxAgeSeconds}`
  ].filter(Boolean);
  return parts.join("; ");
}

export function buildClearedSessionCookie(options = {}) {
  const sameSite = options.sameSite || "Lax";
  const secure = options.secure !== false;
  return [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    secure ? "Secure" : null,
    `SameSite=${sameSite}`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  ].filter(Boolean).join("; ");
}

/**
 * Cookie SameSite for this request.
 *
 * The brief's default is `SameSite=Lax`. That is correct and strongest for the
 * same-site cases: the Worker reached on localhost (any port) or on the same
 * host as the game. When the game is served from a different site (GitHub Pages
 * -> *.workers.dev), browsers refuse to attach a Lax cookie to the API fetch at
 * all, so we downgrade to `None; Secure` for exactly those requests. SameSite is
 * a CSRF control, and the Origin allow-list check in index.js is what actually
 * blocks cross-site writes; `Secure` and `HttpOnly` stay on either way.
 */
export function sameSiteFor(request, env) {
  const configured = typeof env?.COOKIE_SAMESITE === "string" ? env.COOKIE_SAMESITE.trim() : "";
  if (configured) return configured;
  const origin = request.headers.get("origin");
  if (!origin) return "Lax";
  let requestHost;
  let originHost;
  try {
    requestHost = new URL(request.url).hostname;
    originHost = new URL(origin).hostname;
  } catch (_err) {
    return "Lax";
  }
  /* Same hostname (different ports included, e.g. :8000 -> :8787) is same-site. */
  if (requestHost === originHost) return "Lax";
  return "None";
}
