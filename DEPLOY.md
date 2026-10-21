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
