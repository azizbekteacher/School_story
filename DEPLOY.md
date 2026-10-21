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

A run takes about a minute. Progress and history:

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

`node tools/check-pages.js` fetches the live URL and the three asset paths
(`js/main.js`, `css/style.css`, `memory.js`) and fails if any is not HTTP 200
or if the HTML does not contain `Sulton School`.

## Refreshing a stale deploy

If the live site lags behind `master`, or a deploy failed, re-run the
workflow without a new commit:

```powershell
gh workflow run pages.yml --repo azizbekteacher/School_story
```
