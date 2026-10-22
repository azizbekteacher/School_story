# Deploy

## Live URL

**https://azizbekteacher.github.io/School_story/**

The game runs there exactly as it does from a double-clicked `index.html`:
no build step, no npm, no server-side code. It is served from the
`/School_story/` subpath, which works because every asset reference in
`index.html` (`css/...`, `js/...`, `memory.js`) is relative.

## How the deploy works

`.github/workflows/pages.yml` runs on every push to `master`:

1. checks out the repository,
2. copies the repository root to `_site/`, leaving out dev-only material
   (`.git`, `.github`, `tools/`, `_stable-play/`, `play-stable.bat`),
3. uploads `_site/` as the Pages artefact,
4. deploys it with `actions/deploy-pages`.

GitHub Pages is configured with **GitHub Actions** as its source
(`build_type: workflow`), not "deploy from a branch". The site is the
repository root, so `index.html` is the entry point.

The workflow's `deploy` job runs in the `github-pages` environment. That
environment was created with a deployment branch policy that allowed only
`main`, so the first deploy from `master` was rejected with *"Branch
"master" is not allowed to deploy to github-pages due to environment
protection rules."* The fix, already applied, is to allow `master`:

```powershell
gh api -X POST /repos/azizbekteacher/School_story/environments/github-pages/deployment-branch-policies `
  -f name=master -f type=branch
```

A run takes under a minute. Progress and history:

```powershell
gh run list --repo azizbekteacher/School_story --workflow pages.yml
gh run watch --repo azizbekteacher/School_story
```

## How to update it

Push to `master`:

```powershell
git push origin master
```

That is the whole deploy. There is no build output to commit and nothing to
clean up.

## Checking the live site

`node tools/check-pages.js` verifies the real deployment:

- the live URL returns HTTP 200 and the HTML contains `Sulton School`,
- `js/main.js`, `css/style.css` and `memory.js` all return 200 (the classic
  subpath bug is a 404 on these),
- no `src`/`href` in the served HTML is root-absolute,
- dev-only paths (`tools/`, `play-stable.bat`) are not served,
- headless Chrome loads the URL, reaches the title screen, presses Enter and
  confirms the game state moves to `play` with a player in the world — failing
  on any console error, uncaught exception or failed request.

Add `--no-browser` to skip the Chrome part, or pass a base URL as the first
argument to check a different deployment.

## Refreshing a stale deploy

If the live site lags behind `master`, or a deploy failed, re-run the
workflow without a new commit:

```powershell
gh workflow run pages.yml --repo azizbekteacher/School_story
```

## The account service (optional, separate deploy)

The game itself needs nothing beyond the static site above. Accounts and
cross-device save live in `worker/` and are deployed separately to Cloudflare —
they are not part of the Pages build and never block it.

**The game runs identically without it.** With no API base configured the client
makes no network requests at all, which is the only possible state for the
`file://` build.

### What is already done

- `worker/` exists and is committed: a Cloudflare Worker in modules format with
  D1 storage (`users`, `sessions`, `saves`), Google ID-token verification with
  WebCrypto RS256, hashed session tokens in HttpOnly cookies, and an origin
  allowlist. `cd worker && node test/run.js` → **87 passed, 0 failed**, with no
  network access.
- `js/game/account.js` is the matching client.

### What only Azizbek can do

These need his accounts and cannot be automated:

1. **Google Cloud Console** → create an OAuth 2.0 **Web** client. Authorised
   JavaScript origins: `https://azizbekteacher.github.io` and
   `http://localhost:8788` for local work. Copy the **client id** — it is public.
   The client secret is not used by this flow and must not be committed.
2. **`wrangler login`** with the Cloudflare account.
3. **`cd worker && wrangler d1 create school-story-db`** → paste the returned
   `database_id` into `worker/wrangler.toml`.
4. **`wrangler d1 execute school-story-db --remote --file=schema.sql`** to create
   the tables.
5. **`wrangler secret put GOOGLE_CLIENT_ID`** and paste the client id.
6. **`wrangler deploy`** → note the `*.workers.dev` URL.
7. **Point the game at it**: set `window.G_ACCOUNT_API` (in the Pages build, add
   it to `index.html` or a small config script) to the Worker URL, then commit
   and push so Pages redeploys.

`worker/README.md` has the same steps with more detail, plus the request
contract and the security notes.

### Verifying it

```powershell
node tools/probe-account.js      # the client's offline contract
cd worker; node test/run.js      # the server's contract (no network)
node tools/check-pages.js        # the static deploy is still healthy
```

`probe-account.js` proves the property that actually keeps the game playable: the
account layer is **inert** unless a Worker is configured. It loads the real
`index.html` over `file://`, spies on every `fetch` and `XMLHttpRequest`, and
asserts boot makes **zero** network requests; that `G.account` reports itself
unavailable with no user; that `init`, `signIn`, `pull`, `sync`, `signOut` and
`deleteAccount` all settle without throwing and without making a call; that a
forged `__setUser` cannot change chapter or beat; and that the game still reaches
play afterwards. 17 checks.

**What is still unverified, honestly:** a real sign-in. That needs the deployed
Worker, a live Google OAuth client and a valid ID token. The server side is
covered by its own suite; the client's *online* half is covered by nothing. First
time you deploy, sign in once with both consoles open.
