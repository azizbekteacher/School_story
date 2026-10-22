#!/usr/bin/env node
/* School_story Worker test suite — plain Node, no dependencies, no network.
 *
 *   cd worker && node test/run.js
 *   node test/run.js --verbose      # also print the SQL each check exercised
 *
 * The Google JWKS endpoint is never contacted: every token below is signed with
 * a private key generated in this process, and the JWKS is injected through
 * `createJwksCache({ fetchImpl })`. That is what makes this suite honest
 * evidence for the security claims — it proves the *verification path* rejects
 * bad tokens, not that a live Google request works.
 *
 * Exit code 0 = every case passed, 1 = at least one failed.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  decodeJwt,
  createJwksCache,
  parseMaxAgeMs,
  verifyGoogleIdToken,
  TokenError,
  GOOGLE_JWKS_URL
} from "../src/google.js";
import {
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionToken,
  hashSessionToken,
  parseCookies,
  readSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sameSiteFor
} from "../src/session.js";
import {
  deleteUser,
  getSave,
  getSessionWithUser,
  getUserById,
  putSave,
  upsertUser
} from "../src/db.js";
import worker from "../src/index.js";
import {
  DEFAULT_ALLOWED_ORIGINS,
  MAX_SAVE_BODY_BYTES,
  matchesOriginPattern,
  parseAllowedOrigins,
  readConfig
} from "../src/config.js";
import { getSharedJwksCache, setSharedJwksCache } from "../src/google.js";
import {
  FakeD1,
  createSqliteD1,
  loadNodeSqlite
} from "./fake-d1.js";
import {
  generateJwks,
  generateTestKey,
  googleClaims,
  jwksResponse,
  resignWithClaims,
  signToken
} from "./fixtures.js";

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, "..");
const schemaSql = readFileSync(join(workerRoot, "schema.sql"), "utf8");
const VERBOSE = process.argv.includes("--verbose");

/* ----------------------------------------------------------------- harness */

let passed = 0;
let failed = 0;
const failures = [];
const groupTotals = new Map();
let currentGroup = "(ungrouped)";
const verboseLines = [];

function group(name) {
  currentGroup = name;
  if (!groupTotals.has(name)) groupTotals.set(name, { pass: 0, fail: 0 });
  console.log(`\n${name}`);
  console.log("-".repeat(Math.min(72, name.length)));
}

async function test(name, fn) {
  const totals = groupTotals.get(currentGroup) || { pass: 0, fail: 0 };
  groupTotals.set(currentGroup, totals);
  try {
    const detail = await fn();
    passed += 1;
    totals.pass += 1;
    console.log(`  PASS  ${name}`);
    if (VERBOSE && detail) verboseLines.push(`${currentGroup} :: ${name}\n        ${detail}`);
    return true;
  } catch (error) {
    failed += 1;
    totals.fail += 1;
    const message = error && error.message ? error.message : String(error);
    failures.push({ group: currentGroup, name, message, stack: error && error.stack });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${message.split("\n")[0]}`);
    return false;
  }
}

/** Assert a TokenError with any code is thrown (for codes that legitimately vary). */
async function assertAnyTokenError(promiseThunk, label) {
  let thrown = null;
  try {
    await promiseThunk();
  } catch (error) {
    thrown = error;
  }
  if (!thrown) throw new Error(`${label || "token"}: expected a TokenError but the token was accepted`);
  if (!(thrown instanceof TokenError)) {
    throw new Error(`${label || "token"}: expected TokenError, got ${thrown.name}: ${thrown.message}`);
  }
  return thrown.code;
}

/* -------------------------------------------------------------------------- */

function assert(condition, message) {
  if (!condition) throw new Error(message || "assertion failed");
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label || "value"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${label || "value"}: expected ${b}, got ${a}`);
}

/** Assert a TokenError with a specific code is thrown. */
async function assertTokenError(promiseThunk, expectedCode, label) {
  try {
    await promiseThunk();
  } catch (error) {
    if (!(error instanceof TokenError)) {
      throw new Error(`${label || "token"}: expected TokenError(${expectedCode}), got ${error && error.name}: ${error && error.message}`);
    }
    if (error.code !== expectedCode) {
      throw new Error(`${label || "token"}: expected code "${expectedCode}", got "${error.code}"`);
    }
    return error;
  }
  throw new Error(`${label || "token"}: expected TokenError(${expectedCode}) but nothing was thrown`);
}

/* ------------------------------------------------------------ worker harness */

function makeEnv(overrides = {}) {
  return {
    DB: new FakeD1(),
    GOOGLE_CLIENT_ID: "123456789012-testclient.apps.googleusercontent.com",
    ALLOWED_ORIGINS: DEFAULT_ALLOWED_ORIGINS.join(","),
    COOKIE_SECURE: "true",
    ...overrides
  };
}

/** Call the Worker's fetch with a real Request. */
async function callWorker(env, method, path, { body, headers = {}, origin, cookie } = {}) {
  const requestHeaders = new Headers(headers);
  let requestBody;
  if (body !== undefined) {
    requestBody = typeof body === "string" ? body : JSON.stringify(body);
    if (!requestHeaders.has("content-type")) requestHeaders.set("content-type", "application/json");
  }
  if (origin) requestHeaders.set("origin", origin);
  if (cookie) requestHeaders.set("cookie", cookie);
  const request = new Request(`https://school-story-account.test${path}`, {
    method,
    headers: requestHeaders,
    body: requestBody
  });
  const response = await worker.fetch(request, env);
  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (_err) {
      json = null;
    }
  }
  return { response, status: response.status, json, text, headers: response.headers };
}

function sessionCookieFrom(response) {
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) return null;
  const match = /ss_session=([^;]*)/.exec(setCookie);
  return match ? match[1] : null;
}

/* ================================================================ the suite */

async function main() {
  console.log("=".repeat(72));
  console.log("School_story Worker — test suite");
  console.log(`node ${process.version}  ·  no network  ·  no dependencies`);
  console.log("=".repeat(72));

  await keyAndJwksTests();
  await tokenVerificationTests();
  await sessionTests();
  await dbTests();
  await apiTests();
  await httpEdgeTests();

  /* ------------------------------------------------------------- summary */
  console.log(`\n${"=".repeat(72)}`);
  for (const [name, totals] of groupTotals) {
    const state = totals.fail === 0 ? "ok  " : "FAIL";
    console.log(`  ${state}  ${name}  (${totals.pass} passed, ${totals.fail} failed)`);
  }
  console.log("-".repeat(72));
  console.log(`  ${passed} passed, ${failed} failed`);

  if (VERBOSE && verboseLines.length) {
    console.log("\nverbose detail\n--------------");
    for (const line of verboseLines) console.log(`  ${line}`);
  }

  if (failed > 0) {
    console.log(`\nFAILED CASES (${failed})`);
    for (const failure of failures) {
      console.log(`\n  [${failure.group}] ${failure.name}`);
      console.log(`  ${failure.message}`);
    }
    console.log(`\nRESULT: FAIL (${passed} passed, ${failed} failed)`);
    process.exitCode = 1;
    return;
  }
  console.log(`\nRESULT: PASS (${passed} passed, 0 failed)`);
}

/* ------------------------------------------------------- A. keys and JWKS */

async function keyAndJwksTests() {
  group("A. local RSA keys + JWKS shape (no network)");

  const key = generateTestKey("kid-alpha");
  const jwks = generateJwks(key);

  await test("generating a 2048-bit RSA key pair and a Google-shaped JWKS works", () => {
    assert(key.jwk.kty === "RSA", "kty");
    assert(key.jwk.alg === "RS256", "alg");
    assertEqual(key.jwk.use, "sig", "use");
    assertEqual(key.jwk.kid, "kid-alpha", "kid");
    assert(typeof key.jwk.n === "string" && key.jwk.n.length > 200, "modulus n is base64url of 2048-bit key");
    assertEqual(key.jwk.e, "AQAB", "exponent");
    assertDeepEqual(generateJwks(key), jwks, "jwks");
    return `kid=${key.jwk.kid} n.length=${key.jwk.n.length}`;
  });

  await test("the injected JWKS cache never calls the network when given a fake fetch", async () => {
    let fetchCount = 0;
    const cache = createJwksCache({
      fetchImpl: async (url) => {
        fetchCount += 1;
        assertEqual(url, GOOGLE_JWKS_URL, "fetched URL");
        return jwksResponse(jwks);
      }
    });
    const keys = await cache.getKeys();
    assertEqual(keys.length, 1, "key count");
    assertEqual(fetchCount, 1, "fetch count");
    return `url=${GOOGLE_JWKS_URL}`;
  });

  await test("JWKS is reused from memory until Cache-Control max-age expires, then refetched", async () => {
    let fetchCount = 0;
    let nowMs = 1000000;
    const cache = createJwksCache({
      now: () => nowMs,
      fetchImpl: async () => {
        fetchCount += 1;
        return jwksResponse(jwks, 600); // 10 minutes
      }
    });
    await cache.getKeys();
    assertEqual(fetchCount, 1, "initial fetch");
    nowMs += 599 * 1000;
    await cache.getKeys();
    assertEqual(fetchCount, 1, "cached within max-age");
    nowMs += 2 * 1000; // now past the 600s window
    await cache.getKeys();
    assertEqual(fetchCount, 2, "refetch after max-age");
    return "max-age=600 honoured";
  });

  await test("Cache-Control parsing: max-age extracted, missing/garbage falls back", () => {
    assertEqual(parseMaxAgeMs("public, max-age=1234", 7), 1234 * 1000, "standard");
    assertEqual(parseMaxAgeMs("max-age=0", 7), 0, "zero");
    assertEqual(parseMaxAgeMs("public,max-age=\"60\"", 7), 60000, "quoted");
    assertEqual(parseMaxAgeMs("no-cache", 7), 7, "fallback");
    assertEqual(parseMaxAgeMs(null, 7), 7, "missing header fallback");
    assertEqual(parseMaxAgeMs("", 7), 7, "empty fallback");
  });

  await test("an unknown kid triggers exactly one forced refetch (key rotation), then reuses", async () => {
    const rotated = generateTestKey("kid-rotated");
    let fetchCount = 0;
    const cache = createJwksCache({
      now: () => 5000000,
      fetchImpl: async () => {
        fetchCount += 1;
        return jwksResponse(fetchCount === 1 ? jwks : generateJwks(rotated));
      }
    });
    const first = await cache.getKeys();
    assertEqual(first[0].kid, "kid-alpha", "first key set");
    const afterMiss = await cache.getKeys({ forceRefresh: true });
    assertEqual(afterMiss[0].kid, "kid-rotated", "refreshed key set");
    assertEqual(fetchCount, 2, "one forced refetch");
    await cache.getKeys({ forceRefresh: true });
    assertEqual(fetchCount, 2, "forced refetch rate-limited inside cooldown");
    return "rotation path exercised";
  });
}

/* ------------------------------------------------- B. token verification */

async function tokenVerificationTests() {
  group("B. Google ID-token verification (RS256, WebCrypto)");

  const key = generateTestKey("kid-sec");
  const otherKey = generateTestKey("kid-other");
  const clientId = "123456789012-testclient.apps.googleusercontent.com";
  const jwks = generateJwks(key);

  function verifier(options = {}) {
    const cache = createJwksCache({ fetchImpl: async () => jwksResponse(jwks), now: options.now });
    return async (token) =>
      verifyGoogleIdToken(token, {
        clientId: options.clientId || clientId,
        getKeys: (opts) => cache.getKeys(opts),
        now: options.now
      });
  }

  const verify = verifier();

  await test("valid token from the injected JWKS verifies and returns the verified identity", async () => {
    const token = signToken(key, googleClaims(clientId));
    const identity = await verify(token);
    assertEqual(identity.sub, "109876543210987654321", "sub");
    assertEqual(identity.email, "azizbek@example.com", "email");
    assertEqual(identity.name, "Azizbek", "name");
    assertEqual(identity.picture, "https://lh3.googleusercontent.com/a/test-avatar", "picture");
    assertEqual(identity.emailVerified, true, "email_verified");
    return `sub=${identity.sub} iss=${identity.issuer}`;
  });

  await test("both Google issuer spellings are accepted", async () => {
    for (const issuer of ["accounts.google.com", "https://accounts.google.com"]) {
      const token = signToken(key, googleClaims(clientId, { iss: issuer }));
      const identity = await verify(token);
      assertEqual(identity.issuer, issuer, `iss=${issuer}`);
    }
  });

  await test("NEGATIVE: wrong audience (a different app's Google client id) fails", async () => {
    const token = signToken(key, googleClaims("999999999999-otherapp.apps.googleusercontent.com"));
    await assertTokenError(() => verify(token), "invalid_audience", "wrong aud");
  });

  await test("NEGATIVE: audience as an array containing ours but not equal fails (aud is not trusted loosely)", async () => {
    const token = signToken(key, googleClaims([clientId]));
    await assertTokenError(() => verify(token), "invalid_audience", "array aud");
  });

  await test("NEGATIVE: wrong issuer fails", async () => {
    const token = signToken(key, googleClaims(clientId, { iss: "https://evil.example.com" }));
    await assertTokenError(() => verify(token), "invalid_issuer", "wrong iss");
  });

  await test("NEGATIVE: absent issuer fails", async () => {
    const token = signToken(key, googleClaims(clientId, { iss: undefined }));
    await assertTokenError(() => verify(token), "invalid_issuer", "missing iss");
  });

  await test("NEGATIVE: expired token fails", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = signToken(key, googleClaims(clientId, { exp: nowSeconds - 1, iat: nowSeconds - 3600 }));
    await assertTokenError(() => verify(token), "token_expired", "expired");
  });

  await test("NEGATIVE: token expiring exactly now fails (boundary is exclusive)", async () => {
    const frozen = 1_800_000_000_000;
    const verifyAt = verifier({ now: () => frozen });
    const token = signToken(key, googleClaims(clientId, {
      exp: Math.floor(frozen / 1000),
      iat: Math.floor(frozen / 1000) - 60
    }));
    await assertTokenError(() => verifyAt(token), "token_expired", "exp == now");
  });

  await test("NEGATIVE: missing exp fails", async () => {
    const token = signToken(key, googleClaims(clientId, { exp: undefined }));
    await assertTokenError(() => verify(token), "missing_exp", "no exp");
  });

  await test("NEGATIVE: iat absurdly far in the future fails", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const token = signToken(key, googleClaims(clientId, { iat: nowSeconds + 3600 }));
    await assertTokenError(() => verify(token), "invalid_iat", "future iat");
  });

  await test("NEGATIVE: tampered signature fails", async () => {
    const token = signToken(key, googleClaims(clientId));
    const parts = token.split(".");
    /* Flip one character of the signature and re-base64url it. */
    const sigBytes = Buffer.from(parts[2], "base64url");
    sigBytes[0] ^= 0xff;
    const tampered = `${parts[0]}.${parts[1]}.${sigBytes.toString("base64url")}`;
    await assertTokenError(() => verify(tampered), "invalid_signature", "tampered sig");
  });

  await test("NEGATIVE: payload tampered after signing (sub swapped) fails on signature", async () => {
    const token = signToken(key, googleClaims(clientId));
    const [header, , signature] = token.split(".");
    const evilPayload = Buffer.from(JSON.stringify(googleClaims(clientId, {
      sub: "attacker-controlled-sub",
      email: "attacker@evil.example"
    }))).toString("base64url");
    const tampered = `${header}.${evilPayload}.${signature}`;
    await assertTokenError(() => verify(tampered), "invalid_signature", "swapped payload");
  });

  await test("NEGATIVE: token signed by a different RSA key (wrong kid in JWKS) fails", async () => {
    /* Signed with `otherKey` but claims to be `kid-sec`, so the verifier imports
     * the real kid-sec public key and the signature must not match. */
    const token = signToken(otherKey, googleClaims(clientId), { kid: "kid-sec" });
    await assertTokenError(() => verify(token), "invalid_signature", "wrong key");
  });

  await test("NEGATIVE: alg none is rejected before any signature work", async () => {
    const token = signToken(key, googleClaims(clientId), { alg: "none" });
    await assertTokenError(() => verify(token), "unsupported_alg", "alg none");
  });

  await test("NEGATIVE: alg HS256 (algorithm confusion attempt) is rejected", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", kid: "kid-sec" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify(googleClaims(clientId))).toString("base64url");
    const fakeSig = Buffer.from("not-a-real-signature").toString("base64url");
    await assertTokenError(() => verify(`${header}.${payload}.${fakeSig}`), "unsupported_alg", "HS256");
  });

  await test("NEGATIVE: unsigned / garbage token strings fail", async () => {
    const headerB64 = Buffer.from('{"alg":"RS256","kid":"kid-sec"}').toString("base64url");
    const payloadB64 = Buffer.from(JSON.stringify(googleClaims(clientId))).toString("base64url");
    const cases = [
      ["garbage", "a-random-string"],
      ["empty", ""],
      ["two parts", "aaa.bbb"],
      ["four parts", "a.b.c.d"],
      ["non-jwt json", JSON.stringify({ sub: "x" })],
      ["empty signature", `${headerB64}.${payloadB64}.`],
      ["not base64url", "@@@.###.$$$"],
      ["header not object", `${Buffer.from('"just a string"').toString("base64url")}.${payloadB64}.AAAA`],
      ["payload not object", `${headerB64}.${Buffer.from('"nope"').toString("base64url")}.AAAA`]
    ];
    const codes = [];
    for (const [label, token] of cases) {
      codes.push(await assertAnyTokenError(() => verify(token), label));
    }
    assert(codes.every((code) => typeof code === "string" && code.length > 0), "every case threw a TokenError code");
    return codes.join(",");
  });

  await test("NEGATIVE: missing kid in header fails", async () => {
    const token = signToken(key, googleClaims(clientId), { kid: null });
    await assertTokenError(() => verify(token), "missing_kid", "no kid");
  });

  await test("NEGATIVE: unknown kid not present in JWKS fails", async () => {
    const token = signToken(key, googleClaims(clientId), { kid: "kid-does-not-exist" });
    await assertTokenError(() => verify(token), "unknown_signing_key", "unknown kid");
  });

  await test("NEGATIVE: missing sub fails even with a valid signature", async () => {
    const token = signToken(key, googleClaims(clientId, { sub: undefined }));
    await assertTokenError(() => verify(token), "missing_sub", "no sub");
  });

  await test("NEGATIVE: empty sub fails", async () => {
    const token = signToken(key, googleClaims(clientId, { sub: "" }));
    await assertTokenError(() => verify(token), "missing_sub", "empty sub");
  });

  await test("NEGATIVE: a token for a valid Google client id but signed by an unknown key never falls through", async () => {
    const attackerKey = generateTestKey("kid-sec"); // same kid, different RSA material
    const token = signToken(attackerKey, googleClaims(clientId), { kid: "kid-sec" });
    await assertTokenError(() => verify(token), "invalid_signature", "impostor kid");
  });

  await test("verifyGoogleIdToken refuses to run without a configured client id", async () => {
    const token = signToken(key, googleClaims(clientId));
    await assertTokenError(
      () => verifyGoogleIdToken(token, { clientId: "", getKeys: async () => jwks.keys }),
      "server_misconfigured",
      "no client id"
    );
  });

  await test("decodeJwt parses a valid token's header and payload", async () => {
    const token = signToken(key, googleClaims(clientId, { nonce: "abc123" }));
    const decoded = decodeJwt(token);
    assertEqual(decoded.header.alg, "RS256", "alg");
    assertEqual(decoded.payload.sub, "109876543210987654321", "sub");
    assertEqual(decoded.payload.nonce, "abc123", "extra claim preserved");
    assert(decoded.signature.length > 0, "signature bytes");
    assert(decoded.signedData.length > 0, "signed data bytes");
  });

  await test("a valid token still verifies after a JWKS refetch (cache expiry does not break login)", async () => {
    let nowMs = 7_000_000_000;
    let fetchCount = 0;
    const cache = createJwksCache({
      now: () => nowMs,
      fetchImpl: async () => {
        fetchCount += 1;
        return jwksResponse(jwks, 60);
      }
    });
    const verifyWithClock = (token) =>
      verifyGoogleIdToken(token, { clientId, getKeys: (opts) => cache.getKeys(opts), now: () => nowMs });

    const issuedAt = Math.floor(nowMs / 1000);
    const token = signToken(key, googleClaims(clientId, { iat: issuedAt, exp: issuedAt + 7200 }));
    await verifyWithClock(token);
    nowMs += 120 * 1000; // JWKS max-age elapsed
    await verifyWithClock(token);
    assertEqual(fetchCount, 2, "refetched once");
    return `fetches=${fetchCount}`;
  });
}

/* ------------------------------------------------------- C. sessions */

async function sessionTests() {
  group("C. session tokens and cookies");

  await test("session tokens are 256-bit random, base64url, and never repeat", () => {
    const seen = new Set();
    for (let i = 0; i < 200; i += 1) {
      const token = createSessionToken();
      assert(/^[A-Za-z0-9_-]{43}$/.test(token), `token shape: ${token}`);
      assert(!seen.has(token), "collision");
      seen.add(token);
    }
    /* 32 bytes -> ceil(32/3)*4 - padding = 43 chars. */
    assertEqual(Buffer.from(createSessionToken(), "base64url").length, 32, "decoded length");
    return "200 unique tokens, 43 chars each";
  });

  await test("hashSessionToken is a deterministic 64-char SHA-256 hex digest", async () => {
    const token = createSessionToken();
    const a = await hashSessionToken(token);
    const b = await hashSessionToken(token);
    assertEqual(a, b, "deterministic");
    assert(/^[0-9a-f]{64}$/.test(a), `hex shape: ${a}`);
    assertEqual(a.length, 64, "length");
    const other = await hashSessionToken(createSessionToken());
    assert(a !== other, "different tokens hash differently");
    return `hash prefix=${a.slice(0, 16)}… (not the token)`;
  });

  await test("session cookie is HttpOnly, Secure, SameSite=Lax, Path=/ and 30 days", async () => {
    const cookie = buildSessionCookie("tok123", { sameSite: "Lax" });
    assert(cookie.includes(`${SESSION_COOKIE_NAME}=tok123`), "name=value");
    assert(cookie.includes("HttpOnly"), "HttpOnly");
    assert(cookie.includes("Secure"), "Secure");
    assert(cookie.includes("SameSite=Lax"), "SameSite=Lax");
    assert(cookie.includes("Path=/"), "Path=/");
    const maxAge = /Max-Age=(\d+)/.exec(cookie);
    assert(maxAge, "Max-Age present");
    assertEqual(Number(maxAge[1]), 30 * 24 * 60 * 60, "Max-Age seconds");
    assertEqual(SESSION_TTL_MS, 30 * 24 * 60 * 60 * 1000, "TTL ms");
    assert(!/token|ss_session=[^;]*;.*Domain=/i.test(cookie), "no Domain attribute");
    return cookie;
  });

  await test("clearing the cookie expires it immediately", () => {
    const cookie = buildClearedSessionCookie();
    assert(cookie.includes(`${SESSION_COOKIE_NAME}=;`), "emptied");
    assert(cookie.includes("Max-Age=0"), "Max-Age=0");
    assert(cookie.includes("Expires=Thu, 01 Jan 1970"), "epoch expiry");
    assert(cookie.includes("HttpOnly"), "HttpOnly kept");
  });

  await test("parseCookies finds the session cookie among others", () => {
    const cookies = parseCookies("a=1; ss_session=abc.def; theme=dark");
    assertEqual(cookies.ss_session, "abc.def", "session");
    assertEqual(cookies.a, "1", "other");
    assertEqual(cookies.theme, "dark", "other2");
    assertDeepEqual(parseCookies(""), {}, "empty");
    assertDeepEqual(parseCookies(undefined), {}, "undefined");
    assertDeepEqual(parseCookies("novalue; =x; b=2"), { b: "2" }, "malformed entries skipped");
  });

  await test("readSessionCookie reads from a Request header", () => {
    const request = new Request("https://x.test/me", { headers: { cookie: "ss_session=xyz789; a=1" } });
    assertEqual(readSessionCookie(request), "xyz789", "token");
    const missing = new Request("https://x.test/me");
    assertEqual(readSessionCookie(missing), null, "absent");
  });

  await test("sameSiteFor: localhost origins stay Lax, cross-site (Pages -> workers.dev) needs None", () => {
    const local = new Request("http://localhost:8787/me", { headers: { origin: "http://localhost:8000" } });
    assertEqual(sameSiteFor(local, {}), "Lax", "localhost same host");
    const loopback = new Request("http://127.0.0.1:8787/me", { headers: { origin: "http://127.0.0.1:8000" } });
    assertEqual(sameSiteFor(loopback, {}), "Lax", "127.0.0.1 same host");
    const crossSite = new Request("https://school-story-account.workers.dev/me", {
      headers: { origin: "https://azizbekteacher.github.io" }
    });
    assertEqual(sameSiteFor(crossSite, {}), "None", "cross-site");
    const overridden = new Request("https://x.workers.dev/me", { headers: { origin: "https://azizbekteacher.github.io" } });
    assertEqual(sameSiteFor(overridden, { COOKIE_SAMESITE: "Lax" }), "Lax", "env override");
  });

  await test("session lookup in D1 rejects an expired session and accepts a live one", async () => {
    const db = new FakeD1();
    const nowIso = new Date().toISOString();
    await upsertUser(db, { id: "u1", email: "a@b.c", name: "A", picture: "", updatedAt: nowIso });
    await db
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind("hash-live", "u1", new Date(Date.now() + 60000).toISOString(), nowIso)
      .run();
    await db
      .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind("hash-dead", "u1", new Date(Date.now() - 1000).toISOString(), nowIso)
      .run();
    const live = await getSessionWithUser(db, "hash-live");
    assert(live, "live session found");
    assertEqual(live.user.id, "u1", "user id");
    const dead = await getSessionWithUser(db, "hash-dead");
    assertEqual(dead, null, "expired session ignored");
    const unknown = await getSessionWithUser(db, "hash-nope");
    assertEqual(unknown, null, "unknown session ignored");
  });
}

/* ------------------------------------------------------------- D. database */

async function dbTests() {
  group("D. D1 schema + queries (hand stub and real SQLite)");

  const sqlite = await loadNodeSqlite();
  const environments = [{ label: "FakeD1", make: () => new FakeD1() }];
  if (sqlite) {
    environments.push({
      label: "node:sqlite + schema.sql",
      make: () => createSqliteD1(schemaSql)
    });
  } else {
    console.log("  (node:sqlite unavailable on this runtime — real-SQLite checks skipped)");
  }

  for (const environment of environments) {
    const suffix = ` [${environment.label}]`;

    await test(`users upsert inserts once then refreshes profile fields${suffix}`, async () => {
      const db = await environment.make();
      const created = await upsertUser(db, {
        id: "google-sub-1",
        email: "first@example.com",
        name: "First",
        picture: "p1",
        updatedAt: "2026-01-01T00:00:00.000Z"
      });
      assertEqual(created.id, "google-sub-1", "id");
      assertEqual(created.email, "first@example.com", "email");
      assertEqual(created.createdAt, "2026-01-01T00:00:00.000Z", "created_at");

      const again = await upsertUser(db, {
        id: "google-sub-1",
        email: "second@example.com",
        name: "Second",
        picture: "p2",
        updatedAt: "2026-02-02T00:00:00.000Z"
      });
      assertEqual(again.email, "second@example.com", "email refreshed");
      assertEqual(again.name, "Second", "name refreshed");
      assertEqual(again.picture, "p2", "picture refreshed");
      assertEqual(again.createdAt, "2026-01-01T00:00:00.000Z", "created_at preserved");
      assertEqual(again.updatedAt, "2026-02-02T00:00:00.000Z", "updated_at advanced");
      const fetched = await getUserById(db, "google-sub-1");
      assertEqual(fetched.email, "second@example.com", "readback");
      return `created=${again.createdAt} updated=${again.updatedAt}`;
    });

    await test(`getUserById returns null for an unknown user${suffix}`, async () => {
      const db = await environment.make();
      assertEqual(await getUserById(db, "nobody"), null, "unknown");
    });

    await test(`save round-trip preserves the full game save JSON${suffix}`, async () => {
      const db = await environment.make();
      await upsertUser(db, { id: "saver", email: "s@e", name: "S", picture: "", updatedAt: "2026-01-01T00:00:00.000Z" });
      const save = {
        v: 1,
        savedAt: "2026-01-02T03:04:05.000Z",
        chapter: "ch2",
        beat: "wobble",
        flags: { met_abu_bakr: true, gave_gift: false },
        intel: ["intel_sick", "intel_football"],
        trust: 7,
        scores: { ABQ_2: { good: 2, bad: 0 } },
        notes: [{ principle: "hospitality", verdict: "good" }],
        journal: [{ text: "Timurga qalam berdim", at: "2026-01-02T03:00:00.000Z" }],
        choicesMade: ["ABQ_2", "OQ_2"],
        marks: { gate: true },
        objectiveOverride: null,
        position: { x: 123.5, y: 78, facing: "left" },
        playtime: 1234
      };
      const payloadText = JSON.stringify(save);
      assertEqual(await getSave(db, "saver"), null, "no save before put");
      const updatedAt = await putSave(db, "saver", payloadText, "2026-01-02T03:04:05.000Z");
      assertEqual(updatedAt, "2026-01-02T03:04:05.000Z", "returned timestamp");
      const stored = await getSave(db, "saver");
      assert(stored, "save found");
      assertDeepEqual(stored.save, save, "payload round-trip");
      assertEqual(stored.updatedAt, "2026-01-02T03:04:05.000Z", "stored updated_at");
      return `bytes=${Buffer.byteLength(payloadText)}`;
    });

    await test(`PUT /save semantics overwrite in place (one save per user)${suffix}`, async () => {
      const db = await environment.make();
      await upsertUser(db, { id: "u-over", email: "", name: "", picture: "", updatedAt: "2026-01-01T00:00:00.000Z" });
      await putSave(db, "u-over", JSON.stringify({ v: 1, beat: "arrive" }), "2026-01-01T00:00:00.000Z");
      await putSave(db, "u-over", JSON.stringify({ v: 1, beat: "done" }), "2026-01-03T00:00:00.000Z");
      const stored = await getSave(db, "u-over");
      assertDeepEqual(stored.save, { v: 1, beat: "done" }, "overwritten");
      assertEqual(stored.updatedAt, "2026-01-03T00:00:00.000Z", "new timestamp");
    });

    await test(`deleteUser removes the user, sessions and saves together${suffix}`, async () => {
      const db = await environment.make();
      await upsertUser(db, { id: "gone", email: "", name: "", picture: "", updatedAt: "2026-01-01T00:00:00.000Z" });
      await db
        .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
        .bind("h1", "gone", "2099-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z")
        .run();
      await putSave(db, "gone", "{}", "2026-01-01T00:00:00.000Z");
      await deleteUser(db, "gone");
      assertEqual(await getUserById(db, "gone"), null, "user deleted");
      assertEqual(await getSave(db, "gone"), null, "save deleted");
      assertEqual(await getSessionWithUser(db, "h1"), null, "session deleted");
    });

    await test(`the schema is idempotent (re-applying it does not throw)${suffix}`, async () => {
      if (environment.label !== "node:sqlite + schema.sql") return "n/a for hand stub";
      const sqlite2 = await loadNodeSqlite();
      const db = new sqlite2.DatabaseSync(":memory:");
      try {
        db.exec(schemaSql);
        db.exec(schemaSql);
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((r) => r.name);
        assert(tables.includes("users") && tables.includes("sessions") && tables.includes("saves"), "tables exist");
        const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name").all().map((r) => r.name);
        for (const expected of ["idx_saves_updated", "idx_sessions_expires", "idx_sessions_user", "idx_users_email"]) {
          assert(indexes.includes(expected), `index ${expected}`);
        }
        return tables.join(",");
      } finally {
        db.close();
      }
    });

    await test(`expired-session sweep deletes only expired rows${suffix}`, async () => {
      const db = await environment.make();
      await upsertUser(db, { id: "sweep", email: "", name: "", picture: "", updatedAt: "2026-01-01T00:00:00.000Z" });
      const insert = db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)");
      await insert.bind("old", "sweep", "2020-01-01T00:00:00.000Z", "2019-01-01T00:00:00.000Z").run();
      await insert.bind("new", "sweep", "2099-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z").run();
      const { deleteExpiredSessions } = await import("../src/db.js");
      await deleteExpiredSessions(db, new Date().toISOString());
      assertEqual(await getSessionWithUser(db, "old"), null, "expired removed");
      assert(await getSessionWithUser(db, "new"), "live kept");
    });
  }
}

/* ----------------------------------------------------------------- E. API */

async function apiTests() {
  group("E. Worker HTTP API (end to end against FakeD1)");

  const key = generateTestKey("kid-api");
  const jwks = generateJwks(key);
  const clientId = "123456789012-testclient.apps.googleusercontent.com";
  const pagesOrigin = "https://azizbekteacher.github.io";

  /* One shared fake JWKS fetch for the whole API group. */
  const cache = createJwksCache({ fetchImpl: async () => jwksResponse(jwks) });
  setJwksCacheForTests(cache);

  function freshEnv() {
    return makeEnv({ GOOGLE_CLIENT_ID: clientId });
  }

  await test("GET /auth/config reports enabled with the public client id", async () => {
    const result = await callWorker(freshEnv(), "GET", "/auth/config");
    assertEqual(result.status, 200, "status");
    assertEqual(result.json.enabled, true, "enabled");
    assertEqual(result.json.clientId, clientId, "clientId");
    assertEqual(result.headers.get("cache-control"), "no-store", "no-store");
  });

  await test("GET /auth/config reports disabled when GOOGLE_CLIENT_ID is a placeholder", async () => {
    const env = freshEnv();
    env.GOOGLE_CLIENT_ID = "REPLACE_WITH_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
    const result = await callWorker(env, "GET", "/auth/config");
    assertEqual(result.status, 200, "status");
    assertEqual(result.json.enabled, false, "enabled");
    assertEqual(result.json.clientId, "", "no fake clientId served");
  });

  await test("GET /auth/config with no client id configured reports disabled", async () => {
    const env = freshEnv();
    delete env.GOOGLE_CLIENT_ID;
    const result = await callWorker(env, "GET", "/auth/config");
    assertEqual(result.json.enabled, false, "enabled");
  });

  await test("POST /auth/google verifies the token, upserts the user, and sets a session cookie", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const result = await callWorker(env, "POST", "/auth/google", {
      body: { credential: token },
      origin: pagesOrigin
    });
    assertEqual(result.status, 200, `status (body: ${result.text})`);
    assertDeepEqual(result.json.user, {
      id: "109876543210987654321",
      email: "azizbek@example.com",
      name: "Azizbek",
      picture: "https://lh3.googleusercontent.com/a/test-avatar"
    }, "user");
    const cookie = result.response.headers.get("set-cookie");
    assert(cookie, "set-cookie present");
    assert(/ss_session=[A-Za-z0-9_-]{43}/.test(cookie), "random bearer token in cookie");
    assert(cookie.includes("HttpOnly"), "HttpOnly");
    assert(cookie.includes("Secure"), "Secure");
    assert(cookie.includes("SameSite=None"), "cross-site Pages origin needs SameSite=None");
    /* D1 stores the hash, never the token itself. */
    const rawToken = sessionCookieFrom(result.response);
    const stored = [...env.DB.sessions.values()];
    assertEqual(stored.length, 1, "one session row");
    assert(stored[0].token_hash !== rawToken, "raw token not stored");
    assertEqual(stored[0].token_hash, await hashSessionToken(rawToken), "stored row is the SHA-256 digest");
    assertEqual(stored[0].user_id, "109876543210987654321", "session bound to verified sub");
    return `user=${result.json.user.id} cookie=${cookie}`;
  });

  await test("POST /auth/google NEVER trusts a body-supplied user id or email", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const result = await callWorker(env, "POST", "/auth/google", {
      body: { credential: token, id: "attacker-id", sub: "attacker-sub", email: "attacker@evil.example", user: { id: "x" } },
      origin: pagesOrigin
    });
    assertEqual(result.status, 200, "status");
    assertEqual(result.json.user.id, "109876543210987654321", "verified sub used");
    assertEqual(result.json.user.email, "azizbek@example.com", "verified email used");
    const roles = [...env.DB.users.keys()];
    assertDeepEqual(roles, ["109876543210987654321"], "only the verified user exists");
  });

  await test("POST /auth/google rejects an invalid token with 401 and no cookie", async () => {
    const env = freshEnv();
    const result = await callWorker(env, "POST", "/auth/google", {
      body: { credential: "not.a.jwt" },
      origin: pagesOrigin
    });
    assertEqual(result.status, 401, "status");
    assertEqual(result.response.headers.get("set-cookie"), null, "no session issued");
    assertEqual(env.DB.sessions.size, 0, "no session row");
    assertEqual(env.DB.users.size, 0, "no user created");
  });

  await test("POST /auth/google rejects a token signed for another client id with 401", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims("999999999999-other.apps.googleusercontent.com"));
    const result = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    assertEqual(result.status, 401, "status");
    assertEqual(result.json.error, "invalid_audience", "error code");
  });

  await test("POST /auth/google rejects a tampered token with 401", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const [h, p] = token.split(".");
    const result = await callWorker(env, "POST", "/auth/google", { body: { credential: `${h}.${p}.AAAA` } });
    assertEqual(result.status, 401, "status");
  });

  await test("POST /auth/google returns 503 when auth is not configured (never trusts blindly)", async () => {
    const env = freshEnv();
    env.GOOGLE_CLIENT_ID = "";
    const token = signToken(key, googleClaims(clientId));
    const result = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    assertEqual(result.status, 503, "status");
    assertEqual(result.json.error, "auth_disabled", "code");
  });

  await test("sign-in -> GET /me -> PUT /save -> GET /save -> DELETE /me, full lifecycle", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));

    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token }, origin: pagesOrigin });
    assertEqual(signIn.status, 200, "sign-in");
    const cookie = `ss_session=${sessionCookieFrom(signIn.response)}`;

    const me = await callWorker(env, "GET", "/me", { cookie, origin: pagesOrigin });
    assertEqual(me.status, 200, "me status");
    assertDeepEqual(me.json, signIn.json.user, "me matches sign-in user");

    const emptySave = await callWorker(env, "GET", "/save", { cookie });
    assertEqual(emptySave.status, 404, "no save yet");
    assertEqual(emptySave.json.error, "no_save", "error code");

    const save = {
      v: 1, savedAt: "2026-01-05T00:00:00.000Z", chapter: "ch1", beat: "mother",
      flags: { talked_to_nodira: true }, intel: ["intel_sick"], trust: 5,
      scores: { MOM_Q1: { good: 1, bad: 0 } }, notes: [], journal: [],
      choicesMade: ["MOM_Q1"], marks: {}, objectiveOverride: null,
      position: { x: 420, y: 260, facing: "up" }, playtime: 900
    };
    const put = await callWorker(env, "PUT", "/save", { body: { save }, cookie, origin: pagesOrigin });
    assertEqual(put.status, 200, `put status (${put.text})`);
    assert(typeof put.json.updatedAt === "string" && put.json.updatedAt.length > 0, "updatedAt returned");

    const fetched = await callWorker(env, "GET", "/save", { cookie });
    assertEqual(fetched.status, 200, "save read back");
    assertDeepEqual(fetched.json.save, save, "save round-trip");
    assertEqual(fetched.json.updatedAt, put.json.updatedAt, "timestamps match");

    /* Overwrite. */
    save.beat = "lesson";
    save.playtime = 1800;
    const put2 = await callWorker(env, "PUT", "/save", { body: { save }, cookie });
    assertEqual(put2.status, 200, "second put");
    const fetched2 = await callWorker(env, "GET", "/save", { cookie });
    assertDeepEqual(fetched2.json.save, save, "overwritten save");

    const logout = await callWorker(env, "POST", "/auth/logout", { cookie });
    assertEqual(logout.status, 200, "logout");
    assert(/ss_session=;/.test(logout.response.headers.get("set-cookie")), "cookie cleared");
    assertEqual(env.DB.sessions.size, 0, "session row deleted");
    const afterLogout = await callWorker(env, "GET", "/me", { cookie });
    assertEqual(afterLogout.status, 401, "cookie is dead after logout");

    /* Sign in again, then delete the account. */
    const reSignIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const cookie2 = `ss_session=${sessionCookieFrom(reSignIn.response)}`;
    const dropped = await callWorker(env, "DELETE", "/me", { cookie: cookie2 });
    assertEqual(dropped.status, 200, "delete me");
    assertEqual(dropped.json.deleted, true, "deleted flag");
    assertEqual(env.DB.users.size, 0, "user row gone");
    assertEqual(env.DB.saves.size, 0, "save row gone");
    assertEqual(env.DB.sessions.size, 0, "session rows gone");
    assertEqual(/ss_session=;/.test(dropped.response.headers.get("set-cookie")), true, "cookie cleared");
    return `lifecycle ok, updatedAt=${put.json.updatedAt}`;
  });

  await test("GET /me with no cookie, a forged cookie, or a deleted session is 401", async () => {
    const env = freshEnv();
    assertEqual((await callWorker(env, "GET", "/me")).status, 401, "no cookie");
    assertEqual((await callWorker(env, "GET", "/me", { cookie: "ss_session=forged" })).status, 401, "forged cookie");
    assertEqual(
      (await callWorker(env, "GET", "/me", { cookie: "ss_session=" + createSessionToken() })).status,
      401,
      "random but unstored token"
    );
  });

  await test("an expired session cannot read or write saves", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const rawToken = sessionCookieFrom(signIn.response);
    /* Force the stored row into the past, exactly as 30 days of wall clock would. */
    const hash = await hashSessionToken(rawToken);
    env.DB.sessions.get(hash).expires_at = new Date(Date.now() - 1000).toISOString();
    const cookie = `ss_session=${rawToken}`;
    assertEqual((await callWorker(env, "GET", "/me", { cookie })).status, 401, "me");
    assertEqual((await callWorker(env, "GET", "/save", { cookie })).status, 401, "get save");
    assertEqual((await callWorker(env, "PUT", "/save", { body: { save: { v: 1 } }, cookie })).status, 401, "put save");
  });

  await test("saves are scoped to the session's user — another account cannot read them", async () => {
    const env = freshEnv();
    const tokenA = signToken(key, googleClaims(clientId, { sub: "user-a", email: "a@example.com" }));
    const tokenB = signToken(key, googleClaims(clientId, { sub: "user-b", email: "b@example.com" }));
    const a = await callWorker(env, "POST", "/auth/google", { body: { credential: tokenA } });
    const b = await callWorker(env, "POST", "/auth/google", { body: { credential: tokenB } });
    const cookieA = `ss_session=${sessionCookieFrom(a.response)}`;
    const cookieB = `ss_session=${sessionCookieFrom(b.response)}`;
    await callWorker(env, "PUT", "/save", { body: { save: { v: 1, secret: "a-only" } }, cookie: cookieA });
    const bRead = await callWorker(env, "GET", "/save", { cookie: cookieB });
    assertEqual(bRead.status, 404, "b has no save");
    const aRead = await callWorker(env, "GET", "/save", { cookie: cookieA });
    assertDeepEqual(aRead.json.save, { v: 1, secret: "a-only" }, "a still has it");
  });

  await test("PUT /save rejects a missing or non-object save with 400", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const cookie = `ss_session=${sessionCookieFrom(signIn.response)}`;
    assertEqual((await callWorker(env, "PUT", "/save", { body: {}, cookie })).status, 400, "missing save");
    assertEqual((await callWorker(env, "PUT", "/save", { body: { save: "a string" }, cookie })).status, 400, "string save");
    assertEqual((await callWorker(env, "PUT", "/save", { body: { save: [1, 2] }, cookie })).status, 400, "array save");
  });

  await test("PUT /save returns 413 beyond 256 KB (declared Content-Length)", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const cookie = `ss_session=${sessionCookieFrom(signIn.response)}`;
    const big = "x".repeat(MAX_SAVE_BODY_BYTES + 100);
    const result = await callWorker(env, "PUT", "/save", {
      body: JSON.stringify({ save: { blob: big } }),
      cookie
    });
    assertEqual(result.status, 413, `status (${result.text.slice(0, 120)})`);
    assertEqual(result.json.error, "payload_too_large", "error code");
  });

  await test("PUT /save returns 413 beyond 256 KB even without a Content-Length header", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const cookie = `ss_session=${sessionCookieFrom(signIn.response)}`;
    /* A streamed body has no content-length; the byte counter must still catch it. */
    const oversized = JSON.stringify({ save: { blob: "y".repeat(MAX_SAVE_BODY_BYTES + 10) } });
    const request = new Request("https://school-story-account.test/save", {
      method: "PUT",
      headers: { "content-type": "application/json", cookie },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(oversized));
          controller.close();
        }
      }),
      duplex: "half"
    });
    const response = await worker.fetch(request, env);
    assertEqual(response.status, 413, "status");
  });

  await test("PUT /save at exactly 256 KB is accepted (boundary)", async () => {
    const env = freshEnv();
    const token = signToken(key, googleClaims(clientId));
    const signIn = await callWorker(env, "POST", "/auth/google", { body: { credential: token } });
    const cookie = `ss_session=${sessionCookieFrom(signIn.response)}`;
    /* Build a body whose serialised byte length is just under the cap. */
    const overhead = Buffer.byteLength(JSON.stringify({ save: { blob: "" } }));
    const blob = "z".repeat(MAX_SAVE_BODY_BYTES - overhead);
    const body = JSON.stringify({ save: { blob } });
    assertEqual(Buffer.byteLength(body), MAX_SAVE_BODY_BYTES, "body is exactly the cap");
    const result = await callWorker(env, "PUT", "/save", { body, cookie });
    assertEqual(result.status, 200, `status (${result.text.slice(0, 120)})`);
  });

  await test("OPTIONS preflight is answered with CORS for an allowed origin", async () => {
    const env = freshEnv();
    const result = await callWorker(env, "OPTIONS", "/save", {
      origin: pagesOrigin,
      headers: {
        "access-control-request-method": "PUT",
        "access-control-request-headers": "content-type"
      }
    });
    assertEqual(result.status, 204, "status");
    assertEqual(result.headers.get("access-control-allow-origin"), pagesOrigin, "allow-origin echoes");
    assertEqual(result.headers.get("access-control-allow-credentials"), "true", "credentials");
    assert(/PUT/.test(result.headers.get("access-control-allow-methods")), "PUT allowed");
    assert(/content-type/i.test(result.headers.get("access-control-allow-headers")), "content-type allowed");
    assertEqual(result.headers.get("vary"), "origin", "vary");
  });

  await test("CORS: disallowed origin gets 403 and never an allow-origin header", async () => {
    const env = freshEnv();
    const result = await callWorker(env, "POST", "/auth/google", {
      body: { credential: "x" },
      origin: "https://evil.example.com"
    });
    assertEqual(result.status, 403, "status");
    assertEqual(result.headers.get("access-control-allow-origin"), null, "no allow-origin");
    assertEqual(result.json.error, "origin_not_allowed", "code");
  });

  await test("CORS: localhost and 127.0.0.1 on any port are allowed", async () => {
    const env = freshEnv();
    for (const origin of ["http://localhost:8000", "http://localhost:5500", "http://127.0.0.1:8080", "http://127.0.0.1:3000"]) {
      const result = await callWorker(env, "GET", "/auth/config", { origin });
      assertEqual(result.status, 200, origin);
      assertEqual(result.headers.get("access-control-allow-origin"), origin, `allow-origin for ${origin}`);
    }
  });

  await test("CORS: http vs https scheme mismatch and a lookalike host are refused", async () => {
    const env = freshEnv();
    const cases = [
      "https://localhost:8000",
      "http://azizbekteacher.github.io",
      "https://azizbekteacher.github.io.evil.example",
      "https://evil-azizbekteacher.github.io"
    ];
    for (const origin of cases) {
      const result = await callWorker(env, "GET", "/auth/config", { origin });
      assertEqual(result.status, 403, origin);
    }
  });

  await test("requests with no Origin header still work (curl/health checks, no cookie possible)", async () => {
    const env = freshEnv();
    const result = await callWorker(env, "GET", "/auth/config");
    assertEqual(result.status, 200, "status");
    assertEqual(result.headers.get("access-control-allow-origin"), null, "no CORS header needed");
  });

  await test("ALLOWED_ORIGINS is configurable", async () => {
    const env = freshEnv();
    env.ALLOWED_ORIGINS = "https://game.example.com,http://localhost:*";
    const ok = await callWorker(env, "GET", "/auth/config", { origin: "https://game.example.com" });
    assertEqual(ok.status, 200, "configured origin allowed");
    const pages = await callWorker(env, "GET", "/auth/config", { origin: pagesOrigin });
    assertEqual(pages.status, 403, "unlisted origin refused");
  });

  await test("405 for a known path with the wrong method, 404 for an unknown path", async () => {
    const env = freshEnv();
    const wrong = await callWorker(env, "DELETE", "/auth/config");
    assertEqual(wrong.status, 405, "wrong method");
    assert(wrong.headers.get("allow"), "Allow header present");
    const missing = await callWorker(env, "GET", "/nope");
    assertEqual(missing.status, 404, "unknown path");
  });
}

/* -------------------------------------------------------- F. HTTP edges */

async function httpEdgeTests() {
  group("F. HTTP edges and origin matching units");

  await test("matchesOriginPattern: exact, wildcard port, and default ports", () => {
    assert(matchesOriginPattern("https://azizbekteacher.github.io", "https://azizbekteacher.github.io"), "exact https");
    assert(matchesOriginPattern("http://localhost:8000", "http://localhost:*"), "wildcard port");
    assert(matchesOriginPattern("http://127.0.0.1:5501", "http://127.0.0.1:*"), "127 wildcard");
    assert(!matchesOriginPattern("https://localhost:8000", "http://localhost:*"), "scheme mismatch");
    assert(!matchesOriginPattern("http://localhost.evil.com:8000", "http://localhost:*"), "suffix attack");
    assert(!matchesOriginPattern("http://127.0.0.1.evil.com:8000", "http://127.0.0.1:*"), "suffix attack 2");
    assert(matchesOriginPattern("https://example.com", "https://example.com:443"), "default https port");
    assert(matchesOriginPattern("http://example.com", "http://example.com:80"), "default http port");
    assert(!matchesOriginPattern("https://example.com", "https://example.com:8443"), "explicit port mismatch");
    assert(!matchesOriginPattern("", "https://x"), "empty origin");
    assert(!matchesOriginPattern("not a url", "https://x"), "garbage origin");
    assert(!matchesOriginPattern("https://x", ""), "empty pattern");
    assert(!matchesOriginPattern("https://x", "*"), "bare wildcard refused");
  });

  await test("parseAllowedOrigins splits, trims, and falls back to the documented defaults", () => {
    assertDeepEqual(parseAllowedOrigins("a, b , c"), ["a", "b", "c"], "split");
    assertDeepEqual(parseAllowedOrigins(""), DEFAULT_ALLOWED_ORIGINS, "empty -> defaults");
    assertDeepEqual(parseAllowedOrigins(undefined), DEFAULT_ALLOWED_ORIGINS, "undefined -> defaults");
    assert(DEFAULT_ALLOWED_ORIGINS.includes("https://azizbekteacher.github.io"), "pages origin default");
  });

  await test("readConfig: valid vs placeholder client id, secure cookie default", () => {
    const good = readConfig({ GOOGLE_CLIENT_ID: "123456789012-abc.apps.googleusercontent.com" });
    assertEqual(good.clientIdValid, true, "valid");
    for (const bad of [
      "",
      "1234",
      "abc.apps.googleusercontent.com",
      "123456789012-abc.apps.googleusercontent.com.evil",
      "REPLACE_WITH_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
    ]) {
      assertEqual(readConfig({ GOOGLE_CLIENT_ID: bad }).clientIdValid, false, `invalid: ${bad}`);
    }
    assertEqual(readConfig({}).secureCookies, true, "secure by default");
    assertEqual(readConfig({ COOKIE_SECURE: "false" }).secureCookies, false, "explicit false");
  });

  await test("POST bodies must be JSON (415 otherwise)", async () => {
    const env = makeEnv();
    const request = new Request("https://school-story-account.test/auth/google", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "credential=abc"
    });
    const response = await worker.fetch(request, env);
    assertEqual(response.status, 415, "status");
  });

  await test("malformed JSON bodies return 400, not 500", async () => {
    const env = makeEnv();
    const result = await callWorker(env, "POST", "/auth/google", {
      body: "{not json",
      headers: { "content-type": "application/json" }
    });
    assertEqual(result.status, 400, "status");
    assertEqual(result.json.error, "invalid_json", "code");
  });

  await test("a missing credential field is 400", async () => {
    const env = makeEnv();
    const result = await callWorker(env, "POST", "/auth/google", { body: {} });
    assertEqual(result.status, 400, "status");
    assertEqual(result.json.error, "missing_credential", "code");
  });

  await test("responses are JSON, no-store, and nosniff", async () => {
    const env = makeEnv();
    const result = await callWorker(env, "GET", "/auth/config");
    assert(/application\/json/.test(result.headers.get("content-type")), "content-type");
    assertEqual(result.headers.get("cache-control"), "no-store", "cache-control");
    assertEqual(result.headers.get("x-content-type-options"), "nosniff", "nosniff");
  });

  await test("GET /health is unauthenticated and leaks no configuration", async () => {
    const env = makeEnv();
    const result = await callWorker(env, "GET", "/health");
    assertEqual(result.status, 200, "status");
    assertEqual(result.json.ok, true, "ok");
    assertEqual(JSON.stringify(result.json).includes("clientId"), false, "no clientId");
  });

  await test("a missing D1 binding returns 500, never a crash or a fake success", async () => {
    const env = makeEnv();
    delete env.DB;
    const result = await callWorker(env, "GET", "/me", { cookie: "ss_session=abc" });
    assertEqual(result.status, 500, "status");
    assertEqual(result.json.error, "server_misconfigured", "code");
  });

  await test("the module-scope JWKS cache is a singleton (survives across requests)", () => {
    const cache = getJwksCache();
    assert(cache && typeof cache.getKeys === "function", "cache available");
  });
}

main().catch((error) => {
  console.error("\nFATAL: the test harness itself threw before finishing:");
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
