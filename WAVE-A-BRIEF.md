# Wave A — shared brief

Read this first. It is the contract for every agent working on School_story.

## What the project is

A 2D top-down "GTA-like" adventure game that teaches the principles of
*Unreasonable Hospitality* (Will Guidara) through a realistic Uzbek school.
Hero: **Azizbek**, a maths teacher on his first day at **Sulton School**.
Two chapters exist and are verified green.

## The non-negotiable contract

**The game must keep running by double-clicking `index.html`.** That means:

- No build step. No npm. No bundler. No ES modules (`import`/`export`).
- No external assets, no CDN, no fonts, no images from the network.
- Classic `<script>` tags only, in the fixed order set by `index.html`.
- Every file attaches to `window.G` and is wrapped in an IIFE.
- Line endings LF for `js/**` files.

Anything that breaks this is wrong no matter how good it looks. The `file://`
verify (below) is the gate that proves it.

## Architecture in one page

```
index.html              script order — the Lead owns this file, nobody else edits it
memory.js               save twin the browser can read from file://
memory.md               human/model-readable save
js/core/    util input audio render touch
js/world/   map world
js/game/    state minigames dialogue notebook quest debrief debug memory account
js/data/    story learning chapter2 chapter2-learning chapters minigames/*
js/main.js  boot, update, draw, title screen
css/style.css
```

Canvas is **960x600 logical pixels**. Tilemap 64x40 tiles at 32px.
Zones: `street gate yard shop corridor corridor2 staffroom classroom`.

### Data shapes (verified — do not invent fields)

Story chapter object: `{ id, title, subtitle, opening, brief, npcs, triggers, objectives, scenes }`
- `scenes` is an object of `sceneId -> { start, nodes }`
- `objectives` is `beat -> string`, and **its first key is the chapter's first beat**
- `npcs` entries: `{ id, name, role, zone, at, palette, facing, entry }`
  - `entry` is `{ default: "sceneId", <beat>: "sceneId", ... }`. Chapter 1 keys only
    `default` (plus `report` for Nodira); chapter 2 keys `default` + `wobble` + others.
- `triggers` entries fire on entering a zone at an anchor

Node types: `say` `choice` `multi` `minigame` `end`
- node fields: `type, speaker, text, next, effects, prompt, options, max, game, config, onWin, onLose`
- option fields: `id, text, next, effects, intel, requires, lockedText`

Effects DSL keys: `flag intel trust beat journal note objective endMission`

Learning object: `{ principles, intel, choiceNotes, archetypes, ideas, difficulties, ... }`
- `principles` is an **object keyed by id** (not an array)
- `choiceNotes` is keyed by choice id: `{ principle, verdict, title, why, cost, alternative }`
- `archetypes` is an array with score bands — **this is why chapters get their own
  learning set and are never merged** (chapter 1's bands would shadow chapter 2's)

### Chapter registry

`js/data/chapters.js` exposes `G.chapters.list() / get(id) / indexOf(id) / activate(id) / current() / firstBeatOf(story)`.
`activate(id)` swaps `G.data.story` + `G.data.learning` and sets `G.state.chapter`.
Chapter 1 is captured once at load; never re-derive it from `G.data.story`.

### Minigame host contract (verified)

`G.minigames.register(id, def)`; `def.create(api)` returns `{update, draw, onKey, onPointer}`.
`api.finish(result)` exactly once. `result.win` routes to `onWin`/`onLose`.
The content area is clipped to **852x418 local space** and already translated for you —
draw at (0,0)-(852,418). The host draws its own title, subtitle and control hints.

### Save shape (the thing account sync will carry)

`{ v, savedAt, chapter, beat, flags, intel, trust, scores, notes, journal,
   choicesMade, marks, objectiveOverride, position:{x,y,facing}, playtime }`

Chapter is part of the save. `G.state.restore()` validates every field and rejects
bad ones rather than trusting the file.

## Gates — run these before you report

```powershell
node tools/validate.js                     # chapter 1 contract, 0 errors
node tools/validate-chapter2.js            # chapter 2 contract, 0 errors
node tools/playtest.js                     # ch1 best path reaches debrief
node tools/playtest.js --strategy=worst    # ch1 worst path too
node tools/playtest.js --chapter=ch2       # ch2 reaches debrief
node tools/verify-file-protocol.js         # boots + completes from file://
node tools/test-memory.js                  # save -> reload -> resume
node tools/probe-hero.js 1                 # hero on screen in ch1
node tools/probe-hero.js 2                 # hero on screen in ch2
```

All of these are green right now. If your change makes one red, your change is
wrong — fix it, do not edit the test to match.

Headless browser pattern: tools spawn real Chrome with `--headless=new` and drive
it over the DevTools Protocol with a hand-rolled WebSocket (no npm). Copy the
boilerplate from `tools/test-memory.js` or `tools/probe-hero.js`.

**PowerShell cannot reliably inline `node -e` with quotes or regex.** Write a
`.js` file under `tools/` and run it.

## Write scopes — one owner per file

The Lead owns `index.html`, `js/main.js`, and all `git` operations. Do not run
`git add`/`commit`/`push`; do not edit `index.html`.

Overlapping another agent's files is the one thing that will break this wave.
If you believe you must edit a file outside your scope, stop and report why
instead of doing it.

## Secrets

**Never print, hardcode or commit a token, key, client secret or connection
string.** This repo is public. Config values the browser legitimately needs
(like a Google OAuth client id) are public by nature and fine to commit — server
secrets go through `wrangler secret put` and live in Cloudflare only.

## Style

Uzbek for in-game text, in the existing register: warm, plain, adult, no
exclamation marks, ASCII apostrophes (`o'`, `g'`). Teaching content may mix
English terms where a real Uzbek teacher would.

## Reporting

Report: what you changed (file by file), the gate output verbatim, what you
verified beyond the gate, and anything you could not verify or deliberately
left out. An honest omission is worth more than a confident claim.
