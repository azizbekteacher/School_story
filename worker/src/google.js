/* Google ID-token verification — the security-critical half of this Worker.
 *
 * The game signs a player in with Google Identity Services (GIS) in the
 * browser. GIS hands the page a signed JWT ("credential"). The client is not
 * trusted at all: this module verifies that JWT against Google's published
 * RS256 public keys before any identity is read out of it.
 *
 * Everything here is dependency-free: WebCrypto (`crypto.subtle`) for the
 * signature, `fetch` for the JWKS, no npm.
 *
 * `crypto.subtle.verify` is the only place the payload earns its trust: the
 * claim checks (iss/aud/exp/iat) run *after* the signature check and are a
 * second line of defence, not the first.
 */

export const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

/* Google's ID tokens use both spellings depending on how they were minted. */
export const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];

/* Fallback only; Google normally sends an explicit Cache-Control max-age. */
export const DEFAULT_JWKS_MAX_AGE_MS = 60 * 60 * 1000;

/* How far ahead of our clock we tolerate a token's `iat`. Google's own docs
 * suggest ~5 minutes of clock skew. Anything further out is a red flag. */
export const MAX_IAT_FUTURE_SKEW_MS = 5 * 60 * 1000;

/* When a token carries an unknown `kid` we refetch the JWKS once. This is the
 * floor between forced refetches, so a stream of bogus kids cannot turn into a
 * stream of requests to Google. */
export const KID_MISS_REFRESH_INTERVAL_MS = 30 * 1000;

const MAX_TOKEN_LENGTH = 8192;
const MAX_SUB_LENGTH = 255;

/** Every verification failure is one of these; `code` is safe to log/inspect. */
export class TokenError extends Error {
  constructor(code, message) {
    super(message || code);
    this.name = "TokenError";
    this.code = code;
  }
}

/* ------------------------------------------------------------------ base64url */

export function base64UrlToBytes(value) {
  if (typeof value !== "string") throw new TokenError("malformed_token");
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new TokenError("malformed_token");
  if (value.length % 4 === 1) throw new TokenError("malformed_token");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") +
    (value.length % 4 ? "=".repeat(4 - (value.length % 4)) : "");
  let binary;
  try {
    binary = atob(padded);
  } catch (_err) {
    throw new TokenError("malformed_token");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function bytesToBase64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeJsonObject(b64, errorCode) {
  const bytes = base64UrlToBytes(b64);
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch (_err) {
    throw new TokenError(errorCode);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TokenError(errorCode);
  }
  return parsed;
}

/* ------------------------------------------------------------------ JWT shape */

/**
 * Split and structurally validate a compact JWS. Does NOT verify anything yet.
 * @returns {{ header: object, payload: object, signedData: Uint8Array, signature: Uint8Array }}
 */
export function decodeJwt(token) {
  if (typeof token !== "string" || token.length < 20 || token.length > MAX_TOKEN_LENGTH) {
    throw new TokenError("malformed_token");
  }
  const parts = token.split(".");
  if (parts.length !== 3) throw new TokenError("malformed_token");
  const [headerB64, payloadB64, signatureB64] = parts;
  if (!headerB64 || !payloadB64) throw new TokenError("malformed_token");

  const header = decodeJsonObject(headerB64, "malformed_header");
  const payload = decodeJsonObject(payloadB64, "malformed_payload");

  /* Reject before touching the signature: `alg: none` must never be honoured. */
  if (header.alg !== "RS256") throw new TokenError("unsupported_alg");
  if (typeof header.kid !== "string" || header.kid.length === 0) {
    throw new TokenError("missing_kid");
  }
  if (!signatureB64) throw new TokenError("missing_signature");

  return {
    header,
    payload,
    signedData: new TextEncoder().encode(`${headerB64}.${payloadB64}`),
    signature: base64UrlToBytes(signatureB64)
  };
}

/* ------------------------------------------------------------- JWKS handling */

/** Parse `Cache-Control: public, max-age=1234`; returns `fallbackMs` if absent. */
export function parseMaxAgeMs(cacheControl, fallbackMs = DEFAULT_JWKS_MAX_AGE_MS) {
  if (typeof cacheControl !== "string") return fallbackMs;
  const match = /(?:^|,)\s*max-age\s*=\s*"?(\d+)"?\s*(?:,|$)/i.exec(cacheControl);
  if (!match) return fallbackMs;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds < 0) return fallbackMs;
  return seconds * 1000;
}

/**
 * In-memory JWKS cache with an injectable fetcher, so the tests never touch the
 * network. One cache per isolate is normal; a Worker may serve many requests
 * from the same cache.
 *
 * @param {{
 *   fetchImpl?: typeof fetch,
 *   now?: () => number,
 *   url?: string,
 *   defaultMaxAgeMs?: number
 * }} [options]
 * @returns {{ getKeys: (opts?: { forceRefresh?: boolean }) => Promise<object[]>, reset: () => void, state: () => object }}
 */
export function createJwksCache(options = {}) {
  const fetchImpl = options.fetchImpl || ((...args) => fetch(...args));
  const now = options.now || (() => Date.now());
  const url = options.url || GOOGLE_JWKS_URL;
  const defaultMaxAgeMs = options.defaultMaxAgeMs ?? DEFAULT_JWKS_MAX_AGE_MS;

  let keys = null;
  let expiresAt = 0;
  let lastSuccessfulFetchAt = 0;
  let lastForcedFetchAt = 0;
  let inflight = null;
  let lastError = null;

  async function fetchKeys() {
    const response = await fetchImpl(url, { headers: { accept: "application/json" } });
    if (!response || !response.ok) {
      throw new TokenError("jwks_http_error", `JWKS fetch failed with status ${response ? response.status : "?"}`);
    }
    let body;
    try {
      body = await response.json();
    } catch (_err) {
      throw new TokenError("jwks_malformed");
    }
    if (!body || !Array.isArray(body.keys) || body.keys.length === 0) {
      throw new TokenError("jwks_malformed");
    }
    const maxAgeMs = parseMaxAgeMs(
      typeof response.headers?.get === "function" ? response.headers.get("cache-control") : null,
      defaultMaxAgeMs
    );
    const fetchedAt = now();
    keys = body.keys.filter((key) => key && typeof key === "object" && key.kty === "RSA");
    expiresAt = fetchedAt + maxAgeMs;
    lastSuccessfulFetchAt = fetchedAt;
    if (keys.length === 0) throw new TokenError("jwks_malformed");
    return keys;
  }

  async function refresh(force) {
    const nowMs = now();

    if (!force && keys && nowMs < expiresAt) return keys;

    /* Forced refetches (unknown kid) are rate-limited against *each other*: a
     * flood of bogus kids gets at most one extra request to Google per interval,
     * and verification then fails honestly as unknown_signing_key. The interval
     * starts at the forced attempt, not at the last cache fill, so a legitimate
     * key rotation right after a normal refresh is still picked up. */
    if (force) {
      if (keys && nowMs - lastForcedFetchAt < KID_MISS_REFRESH_INTERVAL_MS) return keys;
      lastForcedFetchAt = nowMs;
    }
    if (inflight) return inflight;

    inflight = (async () => {
      try {
        return await fetchKeys();
      } catch (error) {
        lastError = error;
        /* Serving a stale-but-valid key set beats refusing every login while
         * Google's certs endpoint has a bad minute. If we have never fetched,
         * the error is the only honest answer. */
        if (keys) return keys;
        if (error instanceof TokenError) throw error;
        throw new TokenError("jwks_unavailable");
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  }

  return {
    getKeys(opts = {}) {
      return refresh(Boolean(opts.forceRefresh));
    },
    reset() {
      keys = null;
      expiresAt = 0;
      lastSuccessfulFetchAt = 0;
      lastForcedFetchAt = 0;
      inflight = null;
      lastError = null;
    },
    state() {
      return { keys, expiresAt, lastSuccessfulFetchAt, lastForcedFetchAt, lastError };
    }
  };
}

/* --------------------------------------------------------- shared cache */

/* One JWKS cache per isolate: Google's keys are global, so keying it by client
 * id would only fragment it. Tests swap in their own via setSharedJwksCache. */
let sharedJwksCache = null;

export function getSharedJwksCache() {
  if (!sharedJwksCache) sharedJwksCache = createJwksCache();
  return sharedJwksCache;
}

export function setSharedJwksCache(cache) {
  sharedJwksCache = cache;
}

/* --------------------------------------------------------------- verification */

async function importVerifyKey(jwk) {
  if (!jwk || jwk.kty !== "RSA" || typeof jwk.n !== "string" || typeof jwk.e !== "string") {
    throw new TokenError("jwks_malformed");
  }
  try {
    return await crypto.subtle.importKey(
      "jwk",
      { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
  } catch (_err) {
    throw new TokenError("jwks_malformed");
  }
}

async function verifySignature(decoded, jwk) {
  const key = await importVerifyKey(jwk);
  let ok = false;
  try {
    ok = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      decoded.signature,
      decoded.signedData
    );
  } catch (_err) {
    ok = false;
  }
  if (!ok) throw new TokenError("invalid_signature");
}

function optionalString(value) {
  return typeof value === "string" ? value : "";
}

/**
 * Verify a Google ID token end to end.
 *
 * @param {string} token raw compact JWT from Google Identity Services
 * @param {{
 *   clientId: string,
 *   getKeys: (opts?: { forceRefresh?: boolean }) => Promise<object[]>,
 *   now?: () => number,
 *   maxIatSkewMs?: number
 * }} options
 * @returns {Promise<{ sub: string, email: string, name: string, picture: string,
 *   emailVerified: boolean, issuer: string, audience: string,
 *   expiresAt: number, issuedAt: number }>}
 * @throws {TokenError}
 */
export async function verifyGoogleIdToken(token, options) {
  const { clientId } = options || {};
  if (typeof clientId !== "string" || clientId.length === 0) {
    throw new TokenError("server_misconfigured", "GOOGLE_CLIENT_ID is not configured");
  }
  if (typeof options.getKeys !== "function") {
    throw new TokenError("server_misconfigured", "getKeys was not provided");
  }
  const now = options.now || (() => Date.now());
  const maxIatSkewMs = options.maxIatSkewMs ?? MAX_IAT_FUTURE_SKEW_MS;

  const decoded = decodeJwt(token);

  /* 1. Signature first. Everything after this point may read the payload. */
  let jwk = (await options.getKeys()).find((key) => key && key.kid === decoded.header.kid);
  if (!jwk) {
    /* The signing key may have rotated since we cached the JWKS. */
    const refreshed = await options.getKeys({ forceRefresh: true });
    jwk = (refreshed || []).find((key) => key && key.kid === decoded.header.kid);
  }
  if (!jwk) throw new TokenError("unknown_signing_key");
  await verifySignature(decoded, jwk);

  /* 2. Claims, on a payload that is now provably Google's. */
  const payload = decoded.payload;
  const nowMs = now();

  if (typeof payload.iss !== "string" || GOOGLE_ISSUERS.indexOf(payload.iss) === -1) {
    throw new TokenError("invalid_issuer");
  }
  if (typeof payload.aud !== "string" || payload.aud !== clientId) {
    throw new TokenError("invalid_audience");
  }
  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
    throw new TokenError("missing_exp");
  }
  if (payload.exp * 1000 <= nowMs) throw new TokenError("token_expired");
  if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat)) {
    throw new TokenError("missing_iat");
  }
  if (payload.iat * 1000 > nowMs + maxIatSkewMs) throw new TokenError("invalid_iat");
  if (payload.nbf !== undefined) {
    if (typeof payload.nbf !== "number" || !Number.isFinite(payload.nbf)) {
      throw new TokenError("invalid_nbf");
    }
    if (payload.nbf * 1000 > nowMs + maxIatSkewMs) throw new TokenError("token_not_yet_valid");
  }
  if (typeof payload.sub !== "string" || payload.sub.length === 0) {
    throw new TokenError("missing_sub");
  }
  if (payload.sub.length > MAX_SUB_LENGTH) throw new TokenError("invalid_sub");

  return {
    sub: payload.sub,
    email: optionalString(payload.email),
    name: optionalString(payload.name),
    picture: optionalString(payload.picture),
    emailVerified: payload.email_verified === true,
    issuer: payload.iss,
    audience: payload.aud,
    expiresAt: payload.exp * 1000,
    issuedAt: payload.iat * 1000
  };
}
