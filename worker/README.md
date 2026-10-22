# The account + cloud-save Worker

This folder is the small server that lets a player **sign in with Google** and
keep their save in the cloud instead of only in this browser.

It is the only part of School_story that is not a plain static file. The game
itself still runs by double-clicking `index.html`, with no network and no
account; this Worker is strictly optional. If it is down, or if you never set it
up, the game plays exactly as it does today. It is a convenience, not a
requirement.

Written for someone who is **not** a backend engineer. Every command is meant to
be copied and pasted. Allow about 20 minutes the first time.

---

## What it does, in one paragraph

The game asks Google who the player is. Google hands the browser a signed
token. The browser sends that token to this Worker. The Worker checks the
signature against Google's published public keys, so it can be sure the token is
real and was meant for *this* game — the browser cannot fake it. If the token
checks out, the Worker creates a session and sets an `HttpOnly` cookie. From then
on the browser just carries that cookie with each request; the save is stored
against the account behind it. There is exactly one cloud save per account.

Two things follow from that design, and they are worth knowing:

- **The browser is never trusted** to say who it is. No user id, email or other
  identity is ever taken from a request body. Identity comes only from a token
  whose signature the Worker checked.
- **The database stores only a hash of each session token**, never the token
  itself. Someone who obtains a database dump cannot turn it back into a working
  login.

---

## What you need before starting

- A **Google account** (yours is fine — it is only used to create the OAuth
  client).
- A **Cloudflare account**, free tier is enough. <https://dash.cloudflare.com/sign-up>
- **Node.js 18 or newer** on your computer. Check with `node --version`.
- This repository on your computer.

You do **not** need a domain, a credit card, or any npm package. The Worker has
zero dependencies.

---

## Step 1 — Create the Google OAuth client

> This is the one step that cannot be automated and that nobody else can do for
> you: it needs your Google account, and Google's consent screens are tied to the
> account that owns the project.

1. Go to <https://console.cloud.google.com/>.
2. At the top, create a project (or pick an existing one). Something like
   `school-story` is fine. Wait a few seconds for it to be created, then make
   sure it is the selected project in the top bar.
3. In the left menu find **APIs & Services → OAuth consent screen**
   (newer consoles label it **Google Auth Platform → Branding**).
   - Choose **External** as the user type.
   - Fill in an app name (`School_story`), your email as support email, and your
     email as developer contact. Save.
   - You do **not** need to submit for verification. The game only asks Google
     for a name and email address, which are non-sensitive scopes, so it works
     for anyone with a Google account while the app is in "Testing" — but a
     project in **Testing** mode only allows test users you list explicitly. If
     you want *any* player to sign in, use **Publish app** on that screen. It is
     a single button and does not require Google review for these scopes.
4. Go to **APIs & Services → Credentials** (or **Google Auth Platform →
   Clients**).
5. Click **Create credentials → OAuth client ID**.
6. **Application type: Web application.** This matters — a "Desktop" or "Android"
   client will not work, because the sign-in happens in a browser.
7. Name it something you will recognise later, e.g. `School_story web`.
8. Under **Authorised JavaScript origins**, add these two entries. They are
   origins only — no path, no trailing slash:
   ```
   https://azizbekteacher.github.io
   http://localhost:8000
   ```
   The first is the deployed game. The second is for playing locally. If you
   serve the game on a different local port, add that origin too (`wrangler.toml`
   already accepts any localhost port on the Worker side; Google is stricter and
   needs the exact origin listed).
9. Leave **Authorised redirect URIs** empty. The sign-in used here is a JavaScript
   popup/button flow, not a server redirect, so there is nothing to add.
10. Click **Create**. A dialog shows a **Client ID** and a **Client secret**.
    Copy the **Client ID**. It looks like:
    ```
    123456789012-abcdefghijklmnop.apps.googleusercontent.com
    ```
    Keep it somewhere for the next steps.

> **About the client secret:** this Worker does not use it, because it never makes
> a server-to-server call to Google — it verifies the token locally. You can
> ignore the secret. **Never** put a secret in this repository; it is public.
> (The client ID, by contrast, is public by nature: the browser has to know it.)

---

## Step 2 — Create the database

From the `worker/` folder:

```powershell
cd worker
npx wrangler login
npx wrangler d1 create school-story-db
```

`npx wrangler login` opens a browser window to authorise Cloudflare. Do this once
per computer.

`d1 create` prints a block like this:

```
✅ Successfully created DB 'school-story-db' in region EEUR
Created your new D1 Database.

[[d1_databases]]
binding = "DB"
database_name = "school-story-db"
database_id = "1a2b3c4d-5e6f-7890-abcd-ef1234567890"
```

Copy the **`database_id`** value (the long hyphenated id, not the name) and put it
into `worker/wrangler.toml`, replacing the placeholder:

```toml
[[d1_databases]]
binding = "DB"
database_name = "school-story-db"
database_id = "1a2b3c4d-5e6f-7890-abcd-ef1234567890"   # <-- your id here
```

If you are in Europe, `--location=eeur` picks a nearby region and gives slightly
faster saves:

```powershell
npx wrangler d1 create school-story-db --location=eeur
```

Any of `weur eeur apac oc wnam enam` is valid. It is only a preference; the
default works fine.

---

## Step 3 — Create the tables

Still in `worker/`:

```powershell
npx wrangler d1 execute school-story-db --file=schema.sql --remote
```

`--remote` is essential: without it you would only be modifying a database on
your own laptop. The command is safe to re-run — every statement is
`CREATE ... IF NOT EXISTS`.

You should see a list of statements with `"success": true`. If you see
`no such table` later, this step did not run against `--remote`.

To confirm:

```powershell
npx wrangler d1 execute school-story-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expect `users`, `sessions`, `saves` (plus an internal `_cf_METADATA` table that
Cloudflare creates itself — ignore it).

---

## Step 4 — Give the Worker the client ID

This is a **secret**, not a config value, so it is not in `wrangler.toml` and
never in git:

```powershell
npx wrangler secret put GOOGLE_CLIENT_ID
```

It will prompt:

```
✔ Enter a secret value: ›
```

Paste the client ID from step 1 and press Enter. Nothing is echoed back, which is
normal. The value now lives in Cloudflare and is only readable by the Worker.

> **Why a secret and not a variable?** The Worker only needs it to check the
> `aud` (audience) claim of each token. The browser learns it through
> `GET /auth/config`. Keeping it out of `wrangler.toml` means all
> deployment-specific values sit in one place and the public repo can never be
> mistaken for a working configuration.

Check it took:

```powershell
npx wrangler secret list
```

Expect `GOOGLE_CLIENT_ID`.

---

## Step 5 — Deploy

```powershell
npx wrangler deploy
```

It prints the URL, something like:

```
https://school-story-account.<your-subdomain>.workers.dev
```

Write that URL down — it is the `apiBase` the game's account code needs. Check it
is alive:

```powershell
Invoke-RestMethod https://school-story-account.<your-subdomain>.workers.dev/health
```

which prints a small table:

```
  ok service
  -- -------
True school-story-worker
```

```powershell
Invoke-RestMethod https://school-story-account.<your-subdomain>.workers.dev/auth/config
```

```
enabled clientId
------- --------
   True 123456789012-....apps.googleusercontent.com
```

(On macOS or Linux, `curl <url>` works the same way and prints the raw JSON.)

If `/auth/config` returns `enabled: False`, the Worker did not see a
`GOOGLE_CLIENT_ID` that looks like a real client id — repeat step 4, then deploy
again. The check is a shape check on purpose: it is better for sign-in to be
visibly off than to deploy a login that cannot succeed.

Finally, tell the game where the Worker lives, and add the deployed origin if you
have not already (step 1, item 8). `ALLOWED_ORIGINS` in `wrangler.toml` already
lists the GitHub Pages origin; if you deploy the game somewhere else, add that
origin and redeploy.

---

## Step 6 — Test it

**A. Is the Worker up?**

```powershell
Invoke-RestMethod https://school-story-account.<subdomain>.workers.dev/health
```

**B. Does it offer sign-in?**

```powershell
Invoke-RestMethod https://school-story-account.<subdomain>.workers.dev/auth/config
```

`enabled` must be `true` and `clientId` must match step 1. A client ID mismatch
is the most common cause of "Google says the app is not configured".

**C. Does it refuse to be lied to?** This must fail:

```powershell
try {
  Invoke-RestMethod -Method Post `
    -Uri "https://school-story-account.<subdomain>.workers.dev/auth/google" `
    -ContentType "application/json" `
    -Body '{"credential":"not-a-real-token"}'
} catch {
  "HTTP $([int]$_.Exception.Response.StatusCode)"
  $_.ErrorDetails.Message
}
```

Expect:

```
HTTP 401
{"error":"malformed_token","message":"Google ID token verification failed."}
```

If this ever returns a user object instead of 401, stop and do not use the
Worker — that would mean the signature check is broken.

> These examples are PowerShell, where `curl` is an alias for
> `Invoke-WebRequest` and does not take `-H`/`-d`. If you are using cmd.exe or a
> Unix shell, plain `curl -X POST <url> -H "content-type: application/json" -d
> "{\"credential\":\"not-a-real-token\"}"` works and prints the same JSON. Using
> `curl.exe` in PowerShell also works as long as the JSON is quoted carefully.

**D. Locally, end to end**

```powershell
copy .dev.vars.example .dev.vars
# edit .dev.vars: paste your real client id, and leave COOKIE_SECURE="false"
npx wrangler dev --local
```

Then serve the game on <http://localhost:8000> and sign in from the game's own
screen. This is the only way to see a real Google token verified by the real
code; everything else above tests the plumbing around it.

`wrangler dev` uses a **local** D1 database in `worker/.wrangler/`, separate from
the deployed one, so local experiments never touch real player saves.

---

## Rotating the client ID (if it leaks)

The client ID is public by nature — it is in every browser that loads the game —
so a leaked client ID is not by itself a break-in. It becomes a problem only if
someone uses it to impersonate your app to Google. The remedy is to replace it.

1. Google Cloud Console → **APIs & Services → Credentials**.
2. Delete the old OAuth client (or create a new one first, then delete).
3. Create a replacement **Web application** client with the same authorised
   JavaScript origins (step 1).
4. `npx wrangler secret put GOOGLE_CLIENT_ID` with the new id.
5. `npx wrangler deploy`.
6. Update the client ID wherever the game reads it, and reload the game.

Existing sessions keep working — they are this Worker's own cookies and have
nothing to do with the Google client id. Only new sign-ins use the new client.

To force everyone to sign in again, clear the sessions table:

```powershell
npx wrangler d1 execute school-story-db --remote --command "DELETE FROM sessions"
```

---

## Housekeeping

**Watch the metrics.** `wrangler.toml` has `[observability] enabled = true`, so
the Cloudflare dashboard shows requests, errors and CPU time for this Worker.

**Delete a player's account.** They can do it themselves from the game
(`DELETE /me` when signed in). If you must do it manually, delete the `sessions`
and `saves` rows for that user as well as the `users` row. D1 does enforce the
`ON DELETE CASCADE` in the schema, so deleting the user row alone would also
work, but the Worker deletes all three explicitly — account deletion should not
depend on a pragma or on a future schema edit.

```powershell
npx wrangler d1 execute school-story-db --remote --command "DELETE FROM sessions WHERE user_id='<google-sub>'; DELETE FROM saves WHERE user_id='<google-sub>'; DELETE FROM users WHERE id='<google-sub>'"
```

The id is Google's stable `sub` claim, which `/me` returns as `id`.

**Reset everything.** At the top of `schema.sql` there are commented-out `DROP
TABLE` statements. This destroys every account and save. Run them deliberately:

```powershell
npx wrangler d1 execute school-story-db --remote --command "DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS saves; DROP TABLE IF EXISTS users;"
```

then re-run step 3.

**Change the allowed origins.** Edit `ALLOWED_ORIGINS` in `wrangler.toml`
(comma-separated, scheme and port included, `*` allowed as the port) and
redeploy. Requests from an origin that is not listed get `403
origin_not_allowed`.

**Cost.** D1 free tier and Workers free tier both cover a classroom-sized number
of players many times over. Saves are capped at 256 KB each by the Worker, so a
runaway client cannot fill the database.

---

## The API, if you are wiring up the client

Base URL: `https://school-story-account.<subdomain>.workers.dev`

All responses are JSON. All errors look like `{ "error": "<code>", "message":? }`.
The browser must send cookies: `fetch(url, { credentials: "include" })`.

| Method | Path | Body | Success response |
|---|---|---|---|
| `GET` | `/health` | — | `{ ok, service }` |
| `GET` | `/auth/config` | — | `{ enabled, clientId }` |
| `POST` | `/auth/google` | `{ credential }` (Google ID token) | `{ user: {id,email,name,picture}, expiresAt }` + session cookie |
| `POST` | `/auth/logout` | — | `{ ok: true }` + cleared cookie |
| `GET` | `/me` | — | `{ id, email, name, picture }` |
| `DELETE` | `/me` | — | `{ ok: true, deleted: true, userId }` + cleared cookie |
| `GET` | `/save` | — | `{ save, updatedAt }`, or `404 { error: "no_save" }` |
| `PUT` | `/save` | `{ save }` (the game's save object) | `{ updatedAt }` |

Error codes you may see: `401 unauthorized`, `401 <token failure code>` from
`/auth/google` (e.g. `token_expired`, `invalid_audience`, `invalid_signature`),
`403 origin_not_allowed`, `404 no_save`, `405 method_not_allowed`, `413
payload_too_large`, `415 unsupported_media_type`, `400 invalid_json` /
`missing_credential` / `invalid_save`, `503 auth_disabled`.

`save` is stored opaquely, exactly as the game wrote it. This is deliberate: the
game already validates its own save on load and rejects fields it does not
recognise, so the Worker does not need to know the save's shape — and does not
have to change every time the save grows a field.

---

## Running the tests

No dependencies to install:

```powershell
cd worker
node test/run.js
```

87 cases, exit code 0 only if all pass. It needs no network and no Cloudflare
account: signing keys are generated in memory at run time, and the database tests
run both against a stub and against a real SQLite file built from `schema.sql`.
`node test/run.js --verbose` lists every case.

Before deploying a change, also confirm the bundle builds:

```powershell
npx wrangler deploy --dry-run
```

`--dry-run` does **not** start the runtime, so it cannot catch every mistake. For
that, `npx wrangler dev --local` and hit `/health` — a Worker that fails to boot
still passes `--dry-run`.

---

## Files in this folder

| File | What it is |
|---|---|
| `src/index.js` | routes, CORS, the 256 KB cap — the one file with a `fetch` handler |
| `src/google.js` | Google ID-token verification (RS256 via WebCrypto) + key cache |
| `src/session.js` | session token creation, hashing, cookie building |
| `src/db.js` | every SQL query, in one place |
| `src/config.js` | env parsing, size limits, origin matching |
| `schema.sql` | the three tables; idempotent; down/reset at the top |
| `wrangler.toml` | Worker name, D1 binding, non-secret vars |
| `.dev.vars.example` | copy to `.dev.vars` for local dev (git-ignored) |
| `test/` | the 87-case suite: fixtures, a fake D1, a real SQLite D1 |

---

## Things that can go wrong

| Symptom | Cause |
|---|---|
| `/auth/config` says `enabled: false` | `GOOGLE_CLIENT_ID` missing or not shaped like a real client id. Step 4, then redeploy. |
| Google: "Error 400: redirect_uri_mismatch" / "not a valid origin" | The origin the game is served from is not in step 1, item 8. Add it exactly, with no trailing slash or path. |
| Sign-in works, then the very next request is 401 | Cookies are being dropped. Check the game is calling `fetch` with `credentials: "include"`, and that `COOKIE_SECURE` is `"false"` when developing over plain `http://localhost`. |
| 403 `origin_not_allowed` | The page's origin is not in `ALLOWED_ORIGINS`. Edit `wrangler.toml`, redeploy. |
| 500 `server_misconfigured` | The `DB` binding is missing — `database_id` in `wrangler.toml` is still the placeholder, or `[[d1_databases]]` was edited wrongly. |
| 503 `auth_disabled` on `/auth/google` | Same as the first row. |
| `no such table: users` | Step 3 was run without `--remote`, so the deployed database has no tables. |
| Everything 401s after a redeploy | Expected if you cleared `sessions`. Players sign in again. |

---

*The game must keep working without any of this. If the Worker is ever the thing
standing between a player and their game, the Worker is wrong.*
