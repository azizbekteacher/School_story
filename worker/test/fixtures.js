/* Locally generated RSA keys, a Google-shaped JWKS, and ID-token minting.
 *
 * Every key here is generated at runtime by node:crypto. Nothing secret is
 * committed: the private keys exist only in memory for the duration of the
 * test process. The JWKS uses the exact shape Google's
 * https://www.googleapis.com/oauth2/v3/certs returns (kty/alg/use/kid/n/e).
 */

import { generateKeyPairSync, sign as nodeSign } from "node:crypto";

export function generateTestKey(kid = "test-key-1") {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = publicKey.export({ format: "jwk" });
  return {
    kid,
    privateKey,
    jwk: { kty: "RSA", alg: "RS256", use: "sig", kid, n: jwk.n, e: jwk.e }
  };
}

export function generateJwks(...keys) {
  return { keys: keys.map((key) => key.jwk) };
}

export function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

/**
 * Mint a compact RS256 JWT.
 *
 * @param {object} key  from generateTestKey()
 * @param {object} claims payload claims
 * @param {{ alg?: string, kid?: string|null, typ?: string }} [header]
 */
export function signToken(key, claims, header = {}) {
  const headerJson = { alg: header.alg || "RS256", typ: header.typ || "JWT" };
  if (header.kid !== null && header.kid !== undefined) headerJson.kid = header.kid;
  else if (key && key.kid && header.kid === undefined) headerJson.kid = key.kid;

  const signingInput = `${base64Url(JSON.stringify(headerJson))}.${base64Url(JSON.stringify(claims))}`;

  if (header.alg === "none") return `${signingInput}.`;

  const signature = nodeSign("sha256", Buffer.from(signingInput), key.privateKey);
  return `${signingInput}.${signature.toString("base64url")}`;
}

/** Standard, valid claim set for a token aimed at `audience`. */
export function googleClaims(audience, overrides = {}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    iss: "accounts.google.com",
    aud: audience,
    sub: "109876543210987654321",
    email: "azizbek@example.com",
    email_verified: true,
    name: "Azizbek",
    picture: "https://lh3.googleusercontent.com/a/test-avatar",
    iat: nowSeconds - 30,
    exp: nowSeconds + 3600,
    ...overrides
  };
}

/** Re-sign with a mutated payload, producing a *validly signed but tampered* token. */
export function resignWithClaims(key, token, mutate) {
  const [headerB64, payloadB64] = token.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
  const claims = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  mutate(claims);
  return signToken(key, claims, { alg: header.alg, kid: header.kid });
}

/** A JWKS response as Google would send it, with an injectable fetch counter. */
export function jwksResponse(jwks, maxAgeSeconds = 3600) {
  return new Response(JSON.stringify(jwks), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${maxAgeSeconds}`
    }
  });
}
