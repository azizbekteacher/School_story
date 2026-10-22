/* In-memory fake D1 for the tests — no dependencies, no network.
 *
 * Two implementations of the same tiny D1 surface
 * (`prepare(sql).bind(...).first()/run()/all()`):
 *
 *   1. `FakeD1` — a hand-written stub that stores rows in Maps and dispatches
 *      on the exact statements `src/db.js` issues. It throws on unknown SQL, so
 *      if db.js ever drifts away from what the tests cover, the suite fails
 *      loudly instead of silently passing.
 *   2. `SqliteD1` — the same surface backed by node's built-in SQLite, loaded
 *      with the *real* `schema.sql`. Where the runtime has `node:sqlite`, the
 *      DB contract tests run against both, which proves the schema and the SQL
 *      in db.js are real SQLite and not just stub-shaped.
 */

/* ------------------------------------------------------------- hand stub */

export class FakeD1 {
  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.saves = new Map();
    this.calls = [];
  }

  prepare(sql) {
    return new FakeStatement(this, normalize(sql));
  }
}

function normalize(sql) {
  return String(sql).replace(/\s+/g, " ").trim();
}

class FakeStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.params = [];
  }

  bind(...params) {
    this.params = params;
    return this;
  }

  async first() {
    this.db.calls.push({ sql: this.sql, params: this.params, op: "first" });
    const p = this.params;

    if (this.sql.startsWith("SELECT id, email, name, picture, created_at, updated_at FROM users WHERE id =")) {
      return this.db.users.get(p[0]) || null;
    }

    if (this.sql.startsWith("SELECT s.token_hash") && this.sql.includes("JOIN users")) {
      const session = this.db.sessions.get(p[0]);
      if (!session) return null;
      if (!(session.expires_at > p[1])) return null;
      const user = this.db.users.get(session.user_id);
      if (!user) return null;
      return {
        token_hash: session.token_hash,
        session_expires_at: session.expires_at,
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    }

    if (this.sql.startsWith("SELECT payload, updated_at FROM saves WHERE user_id =")) {
      const row = this.db.saves.get(p[0]);
      return row ? { payload: row.payload, updated_at: row.updated_at } : null;
    }

    throw new Error(`FakeD1: unsupported .first() SQL: ${this.sql}`);
  }

  async run() {
    this.db.calls.push({ sql: this.sql, params: this.params, op: "run" });
    const p = this.params;
    let changes = 0;

    if (this.sql.startsWith("INSERT INTO users")) {
      const exists = this.db.users.has(p[0]);
      this.db.users.set(p[0], {
        id: p[0],
        email: p[1],
        name: p[2],
        picture: p[3],
        created_at: exists ? this.db.users.get(p[0]).created_at : p[4],
        updated_at: p[5]
      });
      changes = 1;
    } else if (this.sql.startsWith("INSERT INTO sessions")) {
      this.db.sessions.set(p[0], {
        token_hash: p[0],
        user_id: p[1],
        expires_at: p[2],
        created_at: p[3]
      });
      changes = 1;
    } else if (this.sql.startsWith("INSERT INTO saves")) {
      this.db.saves.set(p[0], { user_id: p[0], payload: p[1], updated_at: p[2] });
      changes = 1;
    } else if (this.sql === "DELETE FROM sessions WHERE user_id = ?") {
      for (const [hash, session] of [...this.db.sessions]) {
        if (session.user_id === p[0]) {
          this.db.sessions.delete(hash);
          changes += 1;
        }
      }
    } else if (this.sql === "DELETE FROM sessions WHERE token_hash = ?") {
      changes = this.db.sessions.delete(p[0]) ? 1 : 0;
    } else if (this.sql === "DELETE FROM sessions WHERE expires_at <= ?") {
      for (const [hash, session] of [...this.db.sessions]) {
        if (session.expires_at <= p[0]) {
          this.db.sessions.delete(hash);
          changes += 1;
        }
      }
    } else if (this.sql === "DELETE FROM saves WHERE user_id = ?") {
      changes = this.db.saves.delete(p[0]) ? 1 : 0;
    } else if (this.sql === "DELETE FROM users WHERE id = ?") {
      changes = this.db.users.delete(p[0]) ? 1 : 0;
    } else {
      throw new Error(`FakeD1: unsupported .run() SQL: ${this.sql}`);
    }

    return { success: true, meta: { changes } };
  }

  async all() {
    this.db.calls.push({ sql: this.sql, params: this.params, op: "all" });
    throw new Error(`FakeD1: unsupported .all() SQL: ${this.sql}`);
  }
}

/* ---------------------------------------------------------- real SQLite */

let sqliteModule = null;

/** node:sqlite shipping with this Node (stable from Node 24, present earlier behind a flag). */
export async function loadNodeSqlite() {
  if (sqliteModule !== null) return sqliteModule;
  try {
    sqliteModule = await import("node:sqlite");
  } catch (_err) {
    sqliteModule = false;
  }
  return sqliteModule;
}

class SqliteStatement {
  constructor(statement) {
    this.statement = statement;
    this.params = [];
  }

  bind(...params) {
    this.params = params;
    return this;
  }

  async first() {
    const row = this.statement.get(...this.params);
    return row ? { ...row } : null;
  }

  async run() {
    const info = this.statement.run(...this.params);
    return { success: true, meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } };
  }

  async all() {
    return { results: this.statement.all(...this.params).map((row) => ({ ...row })) };
  }
}

/** D1-shaped adapter over real SQLite, pre-loaded with schemaSql. */
export async function createSqliteD1(schemaSql) {
  const sqlite = await loadNodeSqlite();
  if (!sqlite) return null;
  const db = new sqlite.DatabaseSync(":memory:");
  if (schemaSql) db.exec(schemaSql);
  return {
    __kind: "sqlite",
    prepare(sql) {
      return new SqliteStatement(db.prepare(sql));
    },
    close() {
      db.close();
    }
  };
}
