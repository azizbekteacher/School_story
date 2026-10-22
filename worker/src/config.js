/* Configuration, size limits and origin matching.
 *
 * Kept out of src/index.js on purpose: in the Workers modules format every
 * *named* export of the entry module is registered as an entry-point handler,
 * so an exported constant makes the runtime refuse to boot with
 *   "Incorrect type for map entry 'MAX_JSON_BODY_BYTES'"
 * `wrangler deploy --dry-run` does not catch that; only starting workerd does.
 * src/index.js therefore has exactly one export: the default handler.
 */

export const MAX_SAVE_BODY_BYTES = 256 * 1024; // 256 KB
export const MAX_JSON_BODY_BYTES = 16 * 1024; // auth bodies are tiny

/* Included so a fresh deploy is usable before ALLOWED_ORIGINS is touched, and
 * so local dev on any port works without configuration. */
export const DEFAULT_ALLOWED_ORIGINS = [
  "https://azizbekteacher.github.io",
  "http://127.0.0.1:*",
  "http://localhost:*"
];

export const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

/* Real Google web client ids look like
 *   1234567890-abc123.apps.googleusercontent.com
 * A placeholder in wrangler.toml therefore leaves the feature *off* instead of
 * deploying a login that cannot work. */
export const GOOGLE_CLIENT_ID_RE = /^\d+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/;

/* ------------------------------------------------------------------- CORS */

/** True for `scheme://host:port` patterns; the port may be a number or `*`. */
export function matchesOriginPattern(origin, pattern) {
  if (typeof origin !== "string" || typeof pattern !== "string") return false;
  const cleaned = pattern.trim();
  if (!cleaned) return false;
  const match = /^(https?):\/\/([^/:]+)(?::(\*|\d{1,5}))?$/i.exec(cleaned);
  if (!match) return false;
  let url;
  try {
    url = new URL(origin);
  } catch (_err) {
    return false;
  }
  const scheme = match[1].toLowerCase();
  const host = match[2].toLowerCase();
  const port = match[3];
  if (url.protocol.replace(":", "").toLowerCase() !== scheme) return false;
  if (url.hostname.toLowerCase() !== host) return false;
  /* The URL API normalises the scheme's default port to "" — compare explicitly. */
  const defaultPort = scheme === "https" ? "443" : "80";
  const actualPort = url.port || defaultPort;
  if (port === undefined) return actualPort === defaultPort;
  if (port === "*") return true;
  return actualPort === port;
}

export function parseAllowedOrigins(value) {
  if (typeof value !== "string" || value.trim() === "") return DEFAULT_ALLOWED_ORIGINS.slice();
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Resolve env into the typed config the handlers use. */
export function readConfig(env) {
  const rawClientId = typeof env?.GOOGLE_CLIENT_ID === "string" ? env.GOOGLE_CLIENT_ID.trim() : "";
  const clientIdValid =
    GOOGLE_CLIENT_ID_RE.test(rawClientId) && !/your|placeholder|example/i.test(rawClientId);
  return {
    clientId: rawClientId,
    clientIdValid,
    allowedOrigins: parseAllowedOrigins(env?.ALLOWED_ORIGINS),
    secureCookies: String(env?.COOKIE_SECURE || "true").toLowerCase() !== "false",
    fixedSameSite:
      typeof env?.COOKIE_SAMESITE === "string" && env.COOKIE_SAMESITE.trim()
        ? env.COOKIE_SAMESITE.trim()
        : null
  };
}
