-- School_story — account + cloud-save schema for Cloudflare D1 (SQLite).
--
-- Run these from the worker/ directory, where wrangler.toml lives (Wrangler
-- resolves its config from the current directory):
--   cd worker
--   npx wrangler d1 execute school-story-db --file=schema.sql --remote
-- Use --local instead of --remote to exercise the local dev database.
-- From the repository root the same command needs an explicit config:
--   npx wrangler d1 execute school-story-db --file=worker/schema.sql --remote \
--     -c worker/wrangler.toml
--
-- The whole file is idempotent (IF NOT EXISTS), so re-running it is safe.
--
-- DOWN / reset — this destroys every account and save. Deliberate, not routine:
--   DROP TABLE IF EXISTS sessions;
--   DROP TABLE IF EXISTS saves;
--   DROP TABLE IF EXISTS users;

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- users
-- id is Google's stable `sub` claim, taken from a *verified* ID token. It is
-- never supplied by the client. `email` is the verified address (Google may
-- reissue a `sub` per client), name/picture are display data refreshed on login.
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL DEFAULT '',
  picture     TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ------------------------------------------------------------- sessions
-- Only the SHA-256 hex digest of the bearer token is stored, so database
-- contents (a backup, a dump, a support export) cannot be replayed as live
-- sessions. `expires_at` is compared in SQL on every authenticated request;
-- a row past its expiry is treated exactly like a missing one.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- ----------------------------------------------------------------- saves
-- One cloud save per account. The payload is the game's save object stored
-- opaquely as JSON text (v, savedAt, chapter, beat, flags, intel, trust,
-- scores, notes, journal, choicesMade, marks, objectiveOverride, position,
-- playtime, ...). Storing it as text rather than typed columns is the point:
-- the game's save shape may grow without a schema migration here. The Worker
-- caps a single payload at 256 KB.
CREATE TABLE IF NOT EXISTS saves (
  user_id     TEXT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saves_updated ON saves (updated_at);
