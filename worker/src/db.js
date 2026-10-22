/* All D1 access lives here so index.js stays a router.
 *
 * Every statement is parameterised. Nothing is concatenated from request data.
 * Functions take the `DB` binding explicitly, which is also what makes the
 * tests able to pass an in-memory fake.
 */

/** A user row as stored in D1 (snake_case). */
function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email || "",
    name: row.name || "",
    picture: row.picture || "",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

/** The public shape the game consumes: `{ id, email, name, picture }`. */
export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, picture: user.picture };
}

export function nowIso(nowMs = Date.now()) {
  return new Date(nowMs).toISOString();
}

/* ------------------------------------------------------------------ users */

export async function getUserById(db, id) {
  const row = await db
    .prepare("SELECT id, email, name, picture, created_at, updated_at FROM users WHERE id = ?")
    .bind(id)
    .first();
  return mapUserRow(row);
}

/**
 * Insert the Google identity, or refresh the mutable profile fields on return.
 * `id` is the verified `sub` and is never taken from the request body.
 */
export async function upsertUser(db, profile) {
  const timestamp = profile.updatedAt || nowIso();
  await db
    .prepare(
      `INSERT INTO users (id, email, name, picture, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         updated_at = excluded.updated_at`
    )
    .bind(
      profile.id,
      profile.email || "",
      profile.name || "",
      profile.picture || "",
      timestamp,
      timestamp
    )
    .run();
  return getUserById(db, profile.id);
}

export async function deleteUser(db, userId) {
  /* The schema declares ON DELETE CASCADE, and D1 does enforce foreign keys by
   * default (equivalent to `PRAGMA foreign_keys = on`), so deleting the user row
   * alone would normally suffice. We still delete the children explicitly:
   *   - account deletion must not depend on a connection-level pragma or on a
   *     future schema edit dropping the REFERENCES clause;
   *   - it keeps the behaviour identical on any SQLite that has FKs off, which
   *     is what makes the test stub and a local file behave the same way.
   * Order matters: children first, so it is also valid without cascade. */
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
  await db.prepare("DELETE FROM saves WHERE user_id = ?").bind(userId).run();
  await db.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
}

/* --------------------------------------------------------------- sessions */

export async function createSession(db, tokenHash, userId, expiresAtIso, createdAtIso = nowIso()) {
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, userId, expiresAtIso, createdAtIso)
    .run();
}

/** Session + owning user, or null when absent/expired. Expiry is enforced in SQL. */
export async function getSessionWithUser(db, tokenHash, nowIsoValue = nowIso()) {
  const row = await db
    .prepare(
      `SELECT s.token_hash, s.expires_at AS session_expires_at,
              u.id, u.email, u.name, u.picture, u.created_at, u.updated_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .bind(tokenHash, nowIsoValue)
    .first();
  if (!row) return null;
  return { session: { tokenHash: row.token_hash, expiresAt: row.session_expires_at }, user: mapUserRow(row) };
}

export async function deleteSession(db, tokenHash) {
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export async function deleteSessionsForUser(db, userId) {
  await db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
}

/** Cheap housekeeping on sign-in; keeps the sessions table from growing forever. */
export async function deleteExpiredSessions(db, nowIsoValue = nowIso()) {
  await db.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(nowIsoValue).run();
}

/* -------------------------------------------------------------------- saves */

export async function getSave(db, userId) {
  const row = await db
    .prepare("SELECT payload, updated_at FROM saves WHERE user_id = ?")
    .bind(userId)
    .first();
  if (!row) return null;
  return { save: parsePayload(row.payload), updatedAt: row.updated_at };
}

/** Upsert the opaque JSON text. Returns the timestamp written. */
export async function putSave(db, userId, payloadText, updatedAtIso = nowIso()) {
  await db
    .prepare(
      `INSERT INTO saves (user_id, payload, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`
    )
    .bind(userId, payloadText, updatedAtIso)
    .run();
  return updatedAtIso;
}

export async function deleteSave(db, userId) {
  await db.prepare("DELETE FROM saves WHERE user_id = ?").bind(userId).run();
}

/* ------------------------------------------------------------------ helpers */

/** Stored text is JSON, but an unreadable row must not throw the endpoint. */
export function parsePayload(text) {
  if (typeof text !== "string" || text.length === 0) return null;
  try {
    return JSON.parse(text);
  } catch (_err) {
    return null;
  }
}
