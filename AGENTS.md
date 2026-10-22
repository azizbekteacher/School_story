# AGENTS.md — working on School_story

Read this file, then [WAVE-A-BRIEF.md](WAVE-A-BRIEF.md), then
[PROMPT-LIBRARY.md](PROMPT-LIBRARY.md). Those three are the contract. This file
is the orientation a model needs before it touches anything.

If you are adding a chapter, [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md)
is the recipe. This file explains the machine; that one explains the procedure.

---

## 1. What this is

A top-down 2D "GTA-like" adventure game that teaches the principles of
*Unreasonable Hospitality* (Will Guidara) through a realistic Uzbek school.

- **Hero:** Azizbek, a maths teacher on his first day at **Sulton School**.
- **Theme, verbatim:** *Service is black and white — hospitality is colour.*
  Thoughtfulness beats luxury.
- **Why it exists:** the user is a real maths teacher at Sulton School who wants
  to apply the book. The game is how he *lives through* a principle instead of
  reading it. Teaching content must be usable on a Monday.
- **The core mechanic:** the hero acts on **intel gathered from other people**.
  That is why choices are gated on `intel`, and why knowing a boy loves football
  makes a gift choice succeed and a minigame easier. The game never says the
  theme out loud — it stages it, then shows the bill in the debrief.

Two chapters exist, both verified green:

| # | id | Title | Scope |
|---|---|---|---|
| 1 | `ch1` | Birinchi kun: Timur | A whole first day: gate, staffroom, a mother, a gift, a walk home, a report |
| 2 | `ch2` | Birinchi dars: 5-B | One lesson, 45 minutes, fourteen strangers' first impression |

Each chapter is a self-contained mission with its own beats, characters and
teaching content. The engine is shared; only the data changes.

---

## 2. The one absolute rule

**The game must keep running by double-clicking `index.html`.**

That means, concretely:

- No build step. No npm. No bundler. No ES modules — no `import` / `export`.
- No external assets of any kind: no CDN, no web fonts, no image files, no audio
  files. Every pixel is canvas drawing; every sound is WebAudio synthesis.
- Classic `<script>` tags only, in the fixed order set by `index.html`.
- Every file is wrapped in an IIFE and attaches to the global `window.G`.
- No `fetch`, no `XMLHttpRequest`, no network at runtime.
- Line endings LF for `js/**` files.

**Why:** the user plays it that way. This is not a preference to be optimised
away — it was stated explicitly ("playing on index.html", "future index html
files use to load up memory") and it is what makes the game survivable: there is
nothing to lose or forget, and a save can outlive the version that wrote it.

**What enforces it:** `tools/verify-file-protocol.js`. It opens the real
`index.html` over `file://` in headless Chrome, boots it, and plays a full
mission to the debrief. If that passes, a double-click works.

Anything that breaks this is wrong no matter how good it looks.

A related consequence worth internalising: **a classic `<script>` tag is not
CORS-restricted from `file://`, but `fetch()` is.** That single fact explains
the whole save design (see §7) and why `memory.js` exists as a twin of
`memory.md`.

---

## 3. Repo map

```
index.html              the shell: fixed script order. The Lead owns this file.
css/style.css           the page shell: warm palette, #stage letterbox, CRT vignette
css/menu.css            empty placeholder (title/menu UI is drawn on canvas)
css/hud.css             empty placeholder (HUD is drawn on canvas)
memory.js               the save as a plain script — what the browser reads at file://
memory.md               the same save, human- and model-readable
play-stable.bat         opens a git worktree of a stable tag so play survives edits

js/core/   util input audio render touch      engine primitives (Lead-owned)
js/world/  map world                          tilemap data + camera/player/NPCs (Lead-owned)
js/game/   state minigames dialogue notebook quest debrief debug memory account
                                              systems (Lead-owned)
js/data/   story learning chapter2 chapter2-learning chapters
           minigames/{gift,travel,ball,chapter2}
                                              ALL content lives here
js/main.js                                    boot, title screen, loop, state machine (Lead)
tools/                                        validators, playtests, probes, audits — dev only
```

**Content vs. logic — the distinction that matters most:**

- **Content = `js/data/**`.** Chapter script, learning payload, chapter registry
  entries, minigame definitions. Editing content is routine; most work is here.
- **Logic = `js/core/`, `js/world/`, `js/game/`, `js/main.js`.** The interpreter.
  Change it only when the data contract genuinely cannot express what you need,
  and then re-run every gate, because both chapters ride on it.
- **`js/data/chapters.js` is a hybrid:** small logic (the registry helper
  functions) driven by one `make(...)` line per chapter.
- **`tools/**` and `_stable-play/` are dev-only.** They are not deployed
  (`.github/workflows/pages.yml` excludes them); the game never loads them.

`js/game/account.js` is a deliberate no-op stub: Google sign-in and remote sync
are scaffolding, and the game must behave identically without them. Do not make
boot wait on it.

---

## 4. Load order, and why it matters

`index.html` script order is a **real dependency graph**, not a style choice.
Each file assumes the ones above it already defined their globals:

```
memory.js                  (window.G_MEMORY — read at boot)
util → input → audio → render → touch
map → world
state → minigames → dialogue → notebook → quest → debrief → debug → memory → account
data/story → data/learning → data/chapter2 → data/chapter2-learning
data/chapters               ← must be AFTER every story/learning file
data/minigames/gift → travel → ball → chapter2
main.js                     ← must be last: it boots on DOM ready
```

Three rules that follow from this, and that are easy to get wrong:

1. **A new data file goes above `js/data/chapters.js`.** The registry captures
   chapter 1's story and learning **once, at load**, out of `G.data.story` and
   `G.data.learning`. If `chapters.js` runs before your new file, your chapter
   is invisible to the registry.
2. **A new minigame file must load before `js/main.js`** but may load after
   `chapters.js` — the registry only records minigame *ids*, and minigame
   definitions are looked up when a minigame node runs.
3. **`js/main.js` stays last.** It calls `G.map.build()` and boots on DOM ready.

`js/data/story.js` must not assume `G.data.learning` exists at load time, and
`js/data/learning.js` must not assume the story exists. Cross-references are
resolved at runtime only.

**You do not edit `index.html`.** The Lead owns it (see §10).

---

## 5. Architecture in one page

- **Canvas: 960×600 logical pixels.** Everything on screen is drawn with the 2D
  context; the DOM is just `<canvas>` plus touch buttons and a rotate hint.
- **Tilemap:** 64×40 tiles at 32px = 2048×1280 world. `js/world/map.js` owns tile
  ids, zone rectangles, anchors and collision. `js/world/world.js` owns the
  camera, player movement, NPC instances and drawing.
- **Zones:** `street gate yard shop corridor corridor2 staffroom classroom`.
  `corridor2` folds into `corridor` for logic. Zone rectangles are in pixels;
  the innermost zone wins.
- **Anchors:** `G.map.ANCHORS[zone]` is a list of 6 positions, and
  `G.map.anchor(zone, index)` converts one to a pixel position. Content refers to
  positions as `{ zone, at }` — never raw coordinates. **Reusing anchors is
  normal.** New art and new map zones are not required to add a chapter.
- **`window.G` modules:** every file does `window.G = window.G || {}` and adds
  one namespace (`G.state`, `G.dialogue`, `G.minigames`, `G.data`, …). Modules
  expose small objects with functions and getters. There are no classes and no
  imports.
- **The game loop:** `js/main.js` runs `requestAnimationFrame`, computes `dt`
  capped at 0.05s, then `update(dt)` + `draw(dt)` inside a try/catch so one bad
  frame logs instead of killing the game. `G.input.endFrame()` clears
  per-frame pressed/clicked state.
- **The screen state machine:** exactly three states —
  `title` → `play` → `debrief`.
  - `title`: chapter picker (arrows or 1–9), ENTER starts, N restarts the
    selected chapter. A save only offers *continue* when `save.chapter` matches
    the selected chapter.
  - `play`: world, dialogue, minigame overlay, notebook (TAB), HUD. The game
    loop hands control to exactly one of notebook / minigame / dialogue /
    free-roam, in that priority order.
  - `debrief`: the teaching payoff — four tabs (`Natija`, `Tanlovlar`,
    `G'oyalar`, `Qiyinchiliklar`). Entered when a node sets
    `{ endMission: true }`.
- **Overlays are modal by early-return**, not by z-index: `main.js` checks
  notebook → minigame → dialogue → free roam and returns after handling one.
- **Determinism:** outcomes are deterministic; randomness is used only for dust
  particles and typewriter blips.

**A subtle but important rule:** `G.state.reset()` deliberately preserves
`chapter`, because the caller chooses the chapter and the save needs it.
`main.js` then sets the beat to the chapter's own first beat — reset() leaves it
at chapter 1's `arrive`.

---

## 6. The data contract

`tools/show-contract.js` prints the live shapes; `tools/validate.js` and
`tools/validate-chapter2.js` enforce them. Trust those three over any prose,
including this page. The essentials:

### 6.1 Chapter (story) object

```js
G.data.story = {
  id: "mission1",
  title: "Birinchi kun: Timur",
  subtitle: "Sulton School — 1-kun",
  opening: "opening",            // scene id started automatically on begin
  brief: ["line", "line", "line"],   // title-card lines (chapter 2 requires exactly 3)
  startZone: "corridor",         // chapters after ch1 only
  startAnchor: 0,
  npcs: [ /* see 6.3 */ ],
  triggers: [ /* see 6.4 */ ],
  objectives: { arrive: "O'qituvchilar xonasiga kir", /* … */ },
  scenes: { sceneId: { start: "nodeId", nodes: { nodeId: { /* node */ } } } }
};
```

`objectives` is `beat -> string`, and **its first key is the chapter's first
beat** — `G.chapters.firstBeatOf()` reads `Object.keys(objectives)[0]`, and
`main.js` starts the chapter on that beat. Insertion order is load-bearing.

Node types are exactly `say` `choice` `multi` `minigame` `end`.

Node fields: `type, speaker, text, next, effects, prompt, options, max, game,
config, onWin, onLose`.
Option fields: `id, text, next, effects, intel, requires, lockedText`.
Option `intel` (on `multi` only) grants intel when that question is picked.

**Effects DSL** — the engine applies these keys and ignores everything else:

| Effect | Meaning |
|---|---|
| `{ flag: "x" }` | set a boolean flag true (`{ flag:"x", value:false }` to clear) |
| `{ intel: "intel_x" }` | add a fact to the notebook, unlock gated options |
| `{ trust: 2 }` | move the trust meter (clamped 0–10) |
| `{ beat: "oqil" }` | advance the mission beat and thus the objective |
| `{ journal: "…" }` | free note appended to the notebook |
| `{ note: { principle, verdict, text } }` | a scored teaching moment |
| `{ objective: "…" }` | temporary objective override |
| `{ choice: "X" }` | record a choice id without an option (rare) |
| `{ endMission: true }` | jump to the debrief |

`note` is the scoring primitive. Emit one on **every** meaningful choice.
`verdict` must be one of `good | ok | weak | bad` — the validators reject
anything else.

Journals and notes are stamped with the **previous** beat (`dialogue.js` reads
`priorBeat` before applying `beat`), deliberately: the note describes the moment
that just finished.

`say` with `speaker: ""` is narration / the hero's inner voice and is styled
differently. `next` omitted or null ends the scene.

Choices and their gates:

- `requires: { intel: "intel_football" }` — a gate. When unmet, the option is
  shown **locked** using `lockedText`. **Always supply `lockedText`**: the
  player must see the door they failed to open. That is the lesson.
- Beyond documented usage, `dialogue.js` also understands
  `requires: { intelAny: [], flag, notFlag, chosen, notChosen, trustMin }` and
  `multi`'s `nextAfter: { intel, true, false }` / `nextFallback`. Chapter 2 uses
  `requires.flag`. These work; prefer the documented `requires.intel` shape for
  gates at the lesson.

### 6.2 The learning object

```js
G.data.learning = {
  principles: {                       // OBJECT keyed by id — not an array
    "I-001": { id, name, source, gist, atSulton: [..], spotIt: [..] }
  },
  intel: {                            // notebook labels
    "intel_football": { label, usedFor }
  },
  choiceNotes: {                      // one per choice id the player can make
    "ABQ_1": { principle, verdict, title, why, cost, alternative }
  },
  archetypes: [                       // ARRAY with score bands
    { id, when: { minAvg, maxAvg, requiresIntel: [], requiresFlags: [] },
      title, text, watchOut }
  ],
  ideas: [                            // concrete things to try at Sulton
    { id, title, what, how: ["step","step","step"], effort, cost,
      difficulty, principle, firstWeek }
  ],
  difficulties: [                     // honest obstacles
    { id, title, why, mitigation, principle }
  ]
};
```

**The trap, and why chapters never share one merged learning object:**
`principles` is an object keyed by id — two chapters can coexist in one object
as long as the ids differ. But `archetypes` is an **array with score bands**
(`when.minAvg` / `when.maxAvg`). `debrief.js pickArchetype()` scans the array in
order and keeps the best-matching band; a merged array lets chapter 1's bands
shadow chapter 2's. This is not theoretical — with the real bands merged,
a chapter-2 run scoring avg 1.9 gets *`arch-listener`*, a chapter-1 archetype:

```
avg=1.9 | ch2-only: arch-host | merged: arch-listener   <<< wrong
avg=0.6 | ch2-only: arch-gatekeeper | merged: arch-technician  <<< wrong
```

So: **each chapter ships its own complete learning object** (`learning.js` for
chapter 1, `chapter2-learning.js` for chapter 2), and activation swaps the whole
reference. Never `Object.assign` two chapters' teaching content together.

Chapter 1's six principle ids are fixed: `I-001` service vs hospitality,
`I-002` enlightened hospitality, `I-028` present vs attentive, `I-043`
thoughtfulness not luxury, `I-044` systemise what is unique, `F-013` the
execution engine. Chapter 2 uses its own namespace (`C2-001`…`C2-006`).

### 6.3 NPC entry

```js
{ id, name, role, zone, at, palette, facing, entry }
```

`entry` maps a beat id to a scene: `{ default: "abq_start", staffroom: "abq_start2" }`.
Routing is `entry[beat] || entry.default || first value` (`quest.js`
`npcEntryScene`).

**Chapter 1 keys `default`** (plus `report` for Nodira, so she has a different
scene once the beat is `report`). **Chapter 2 keys `default` plus beat keys plus
`wobble`** on every pupil. This difference is a design choice, not a bug: a
generic walker that only looks for a beat-keyed scene cannot walk chapter 1
(see §11).

`activeWhen` (optional) hides an NPC: `{ beat }`, `{ notBeat }`, `{ beatIn: [] }`,
`{ flag }`, `{ notFlag }`. Neither shipped chapter uses it.

`palette` values available: `adult_male`, `adult_female`, `teacher_male`,
`teacher_female`, `boy`, `mother`, `shopkeeper`.

### 6.4 Triggers

```js
triggers: [ { zone: "classroom", beat: "lesson", scene: "lesson_start", once: true } ]
```

A trigger fires when the player **enters** `zone` while `beat` is current
(`beat` omitted = any beat). `once: true` records a `__trig_<index>` flag.
There is a 1.2s zone cooldown; the engine remembers the pending zone so a
trigger blocked by the cooldown still fires afterwards.

---

## 7. The save system

Three layers, because `file://` cannot read a file the way a server can:

| Layer | What it is | Written when |
|---|---|---|
| `localStorage` | instant, silent, per-browser | on every beat, choice and note (debounced 3s), on M, on visibility change, on unload |
| `memory.js` | the same save as a plain script (`window.G_MEMORY`) | when a folder grant exists |
| `memory.md` | the readable save with a fenced JSON block | when a folder grant exists (granted once with F) |

The browser reads `memory.js` first because classic scripts are not restricted
from `file://`; `memory.md` is authoritative only when the page is served over
HTTP. **`location` is undefined in the headless vm sandbox, so never reference
it bare** — the existing guard is
`(typeof location !== "undefined" && location && location.protocol) || ""`.

The save object (from `G.memory.snapshot()`):

```js
{ v, savedAt, chapter, chapterTitle, beat, position: { x, y, facing }, zone,
  objective, trust, trustLabel, intel, flags, notes, journal, choicesMade,
  marks, scores, objectiveOverride, started, finished, playSeconds,
  summary, avgQuality, savedBy }
```

**`chapter` is part of the save.** That is how a chapter-2 save resumes into
chapter 2. `G.state.snapshot()/restore()` carry the state fields; `G.memory`
wraps them with position, playtime and metadata.

`G.state.restore()` validates every field and **rejects** bad ones rather than
trusting the file: it returns a list of rejected field names, which `main.js`
logs, and the game continues with the good fields. Consequences for you: a
hand-edited or older `memory.md` can never corrupt live state, and adding a
state field means touching `snapshot()`, `restore()` and the shape above
together. `apply()` also restores the player position over the chapter spawn.

Resuming mid-conversation **replays the scene** — deliberate, so an interrupted
scene can never soft-lock you.

## 8. The chapter registry

`js/data/chapters.js` exposes:

```js
G.chapters.list() / get(id) / indexOf(id) / current() / count()
G.chapters.activate(id)      // swaps G.data.story + G.data.learning, sets G.state.chapter
G.chapters.firstBeatOf(story)   // Object.keys(story.objectives)[0]
G.chapters.playableFromStart(id)
```

`activate(id)` swaps **two references** and records the id. Nothing else.

**Chapter 1 is captured once, at script-load time:**

```js
var CH1_STORY = G.data.story || null;
var CH1_LEARNING = G.data.learning || null;
```

Never re-derive chapter 1 from `G.data.story` later — by then it points at
whichever chapter is active. `chapters.js` must therefore load after every
story/learning file and before `main.js`.

**Every chapter is playable from the start.** There are no unlock flags, no
prerequisites and no carry-over state between chapters. `playableFromStart()`
exists so a future chapter cannot accidentally introduce a lock. When you add a
chapter you add one `make(...)` line; you do **not** add a gate.

A chapter with missing data is registered with `status: "missing"`, and the
title screen refuses to start it rather than opening a broken mission.

## 9. The minigame host contract

```js
G.minigames.register(id, {
  title, subtitle, controls,
  principleIds: ["I-043"],       // optional; note the older key name
  create: function (api) {
    return {
      update: function (dt) {},        // dt seconds, ≤0.05
      draw: function (ctx) {},         // draw in content space
      onKey: function (key) {},        // "1".."9","enter","space","escape",
                                       // arrows, "a","d","w","s","r","tab"
      onPointer: function (x, y, type) {}   // type "down"
    };
  }
});
```

- **Content space is 852×418**, already clipped and translated for you: draw at
  `(0,0)`–`(852,418)`. The host draws its own panel, title, subtitle and a
  controls footer that fades after ~4s. Content space is
  `px+14, py+78` where the panel is `40,30,880,540`.
  *Some older minigame source comments and constants say 872×478 — that is a
  stale number from an earlier host geometry. The host really is 852×418
  (`chapter2.js` uses 852×418 and is correct; the extra 20×60 is simply clipped
  for `gift.js`/`travel.js`/`ball.js`).*
- **`api.mouse` is in 960×600 screen space, not content space.** Subtract the
  content origin to hit your drawn rects: chapter 2 uses `MOUSE_X = 54`,
  `MOUSE_Y = 108`. Pointer coordinates reaching `onPointer` are also 960×600.
- **`api.finish(result)` exactly once.** The host sets a `done` flag and ignores
  repeats, but you should still guard with your own `finished` flag — never call
  it inside `draw`, never twice.
- **`result`:** `{ win, choiceId, detail, notes: [{ principle, text, verdict? }],
  effects: [ /* effect DSL */ ] }`. `win` routes to the node's `onWin`/`onLose`;
  `choiceId` is recorded; `effects` and `notes` are applied by the engine.
- **`api` exposes:** `w`, `h`, `cfg` (the node's `config`), `state` (a live-ish
  snapshot: `flags`, `intel`, `trust`, `beat`, `scores`), `mouse`, `sound`
  (`blip, tick, select, good, bad, win`), and `finish`.
- A **missing** minigame never blocks the mission: the host resolves the node as
  a win with a "game not found" detail. That is safety, not a licence — the
  validators still fail an unregistered `game:` id.
- Naming: chapter 2 minigame choice ids are `CH2_MG_*`; chapter 1's are
  `GIFT_*`, `TRAVEL_*`, `BALL_*`.

## 10. How to verify

Run these from the repository root. **All of these are green right now.** If
your change makes one red, your change is wrong — fix the change, never the
test to match.

```powershell
node tools/validate.js                   # ch1 data contract: ids, scenes, coverage → 0 errors
node tools/validate-chapter2.js          # ch2 contract: 11 groups incl. orphan notes, 1 endMission
node tools/playtest.js                   # ch1 best path reaches the debrief
node tools/playtest.js --strategy=worst  # ch1 worst path also completes
node tools/playtest.js --chapter=ch2     # ch2 reaches the debrief
node tools/verify-file-protocol.js       # boots AND completes from file:// (the real gate)
node tools/test-memory.js                # save -> reload -> resume round-trip
node tools/test-chapters.js              # both chapters play, switch, resume, and don't leak
node tools/probe-hero.js 1               # hero is on screen in ch1
node tools/probe-hero.js 2               # hero is on screen in ch2
```

What each one actually proves:

| Command | Proves |
|---|---|
| `validate.js` | chapter-1 script/learning cross-references resolve; required choices and 6 principles exist; minigames registered |
| `validate-chapter2.js` | the full chapter contract: shape, prefixed unique option ids, no orphan nodes, terminal nodes, exactly one `endMission`, beats all set, npc/trigger zones valid, choiceNotes cover every id with no orphans, principle references valid |
| `playtest.js` | the mission can actually be walked to the debrief with no exceptions |
| `verify-file-protocol.js` | **the contract gate** — headless Chrome, `file://`, boots and completes |
| `test-memory.js` | position, trust and intel survive a reload; `memory.md` round-trips losslessly |
| `test-chapters.js` | real-browser chapter switching; ch2 scores C2 principles only; ch1 unaffected afterwards |
| `probe-hero.js N` | the hero's *screen* position is inside 960×600 (ch1 336,302; ch2 480,301) |

These also exist and are green; run them for the areas they cover:

```powershell
node tools/audit-text.js            # real canvas metrics: text overflow — 0 over 10 surfaces
node tools/analyze-facing.js        # hero sprite nose points the way he walks
node tools/shots.js                 # headless screenshots -> tools/shots/
node tools/color-inventory.js       # palette inventory
node tools/show-contract.js         # prints the exact live data shapes
node tools/check-pages.js           # deployed Pages build: live URL + assets + boot
```

Useful argument forms: `playtest.js --strategy=random`, `--verbose`.

**PowerShell cannot reliably inline `node -e` with quotes.** Simple
`node -e "console.log(1+1)"` works, and regex like `/\d/` often works, but an
escaped double quote inside the expression (`'a\"b'`) breaks the parser, and a
bare `$` is expanded by PowerShell before node ever sees it. When you need a
one-off script, **write a `.js` file under `tools/` and run it** — that is what
the existing tools do. Delete scratch files before you report; they are dev
noise (`tools/*.tmp.js` is gitignored, `tools/_*.js` is not).

Headless-browser pattern for anything visual: the tools spawn real Chrome with
`--headless=new` and drive it over the DevTools Protocol with a hand-rolled
WebSocket, because there is no npm. Copy the boilerplate from
`tools/test-memory.js` or `tools/probe-hero.js` rather than inventing it.
`analyze-facing.js` also shows a `file://` vs `http://` distinction: it serves
the repo over a tiny `http.createServer` because it needs `getImageData`, which
`file://` may refuse.

**A red gate is information, not an obstacle.** Report the verbatim output.

## 11. Gotchas that have actually bitten

### The hero facing bug — art, not logic

Reported as *"Hero is looking left when I am moving right."* The movement logic
was correct; the sprite was drawn wrong. If you touch the hero sprite, measure
the **head-band silhouette**, not dark pixels: hair and eye colours are
identical, so a dark-pixel scan just finds hair on the back of the head and
tells you the opposite. `tools/analyze-facing.js` scans the head band
(`y=-38..-26` at 10×) and asserts the nose side matches the walk direction
(`L > R + 3` facing left, `R > L + 3` facing right), plus exact mirror symmetry.
The fix was a profile sprite whose nose pokes out. Run that tool after any
sprite change.

### `location` is undefined in the headless vm sandbox

Never write `location.protocol` bare in engine code. `G.memory.load()` is called
during boot inside a vm context that has no `location`, so the guard matters:
`typeof location !== "undefined" && location && location.protocol`. The same
class of mistake (assuming a browser global in code that boot loads under
`vm.runInContext`) has broken the save round-trip before.

### Chapter 1's beat→NPC map lives in `tools/playtest.js`, not in the data

`playtest.js` contains a hand-written `BEAT_PLAN` for chapter 1:

```js
{ beat: "staffroom", goto: ["staffroom", 0], npc: "abubakr" }, …
```

Chapter 1's NPCs key only `entry.default`, plus Nodira's `report`. A **generic**
walker (the `advanceWorldGeneric()` path used for chapters after ch1) looks for
an NPC whose `entry` is keyed to the current beat, and chapter 1 has none — so
the generic walker cannot finish chapter 1. This is why `test-chapters.js`
comments that chapter 1 "keeps its beat→NPC map in the playtest harness".
Do not "clean this up" by deleting `BEAT_PLAN`: chapter 1 would stop being
verifiable. If you add a chapter, the generic path is what will exercise it, so
make sure its NPCs *do* key beats (chapter 2 does).

### Chapter 1's spawn and camera must not be overridden

`main.js` deliberately reads:

```js
if (ch.id !== "ch1") { /* set player pos + camera from ch.startZone/anchor */ }
```

Chapter 1 keeps `world.init()`'s original spawn. When the chapter-spawn code was
first written without that guard, chapter 1 lost its hero and the camera stuck
in the top-left corner. The user's instruction then was explicit:
*"Just revert that to previous state. Chapter 1 doesn't need editing."*
**Chapter 1 is a fixed point — revert rather than re-engineer it.** If a change
to shared code breaks chapter 1, the fix is to make the change not apply to
chapter 1.

`tools/probe-hero.js N` is the narrow test that proves the symptom is gone.

### The title chapter picker fits three chapters, not four

`main.js drawTitle()` lays out chapter cards at 268px + 18px gap. Two chapters
total 554px, three total 840px — both fit in 960. **Four chapters total 1126px
and overflow off both sides.** Adding a fourth chapter means fixing the title
layout, not just adding a registry entry.

### `tools/validate.js` carries chapter 1's assumptions

It is not a generic validator. It hardcodes chapter 1's required choice ids and
principle ids and, when scanning minigame `choiceId`s, maps game ids to
filenames via `gidFile()`. A new minigame whose id is not in `gidFile()` makes
`validate.js` crash with `ENOENT` trying to read `js/data/minigames/<id>.js`.
The contract for a new chapter is enforced by **`validate-chapter2.js`**, which
is written to be copied and adapted.

Also note `validate.js` (unlike the chapter-2 validator) does **not** fail
orphan `choiceNotes` and does not require every option id to have a note — it
only warns. Do not rely on it for a new chapter.

### `tools/test-chapters.js` asserts exactly two chapters

It checks `chapters.length === 2`, ids `ch1`/`ch2`, and chapter 2's
`firstBeat === "before"` / `startZone === "corridor"`. Adding chapter 3 turns
`test-chapters.js` red even if nothing is broken. That is expected — update the
harness as part of adding the chapter, and say so in your report. The same goes
for `probe-hero.js`'s `[chapterNumber]` argument, which presses that number on
the title screen.

### Minigame choice ids must be traceable from source

`validate-chapter2.js` finds minigame choice ids by regexing
`"CH2_[A-Z0-9_]+"` string literals out of `js/data/minigames/chapter2.js`, then
requires a `choiceNotes` entry for each. If you build a choice id by
concatenation, the validator can still see the literal prefix form — but keep
ids as full literals wherever you can, or they will silently escape the check.

## 12. Standing constraints

From `PROMPT-LIBRARY.md`; these are not renegotiated per task.

1. **Runs by double-clicking `index.html`.** No build, no npm, no server, no
   network, no external assets, no ES modules.
2. **Sulton School only.** Never reference or write to the other Notion
   workspaces (Oxdord LC, Yetakchi, Almazz). **No tokens, keys, client secrets or
   connection strings in the repo** — it is public. Config the browser
   legitimately needs (e.g. an OAuth client id) is public by nature; server
   secrets go through `wrangler secret put` and live in Cloudflare only.
3. **Teaching content must transfer to a real classroom.** Ideas have to be
   doable on a Monday, with the real obstacles named honestly — no time,
   colleagues reading it as showing off, parents suspicious of a new male
   teacher, no budget. Uncomfortable truths stay in.
4. **The player is trusted.** Report a regression the way a player notices it
   ("the hero is not showing", "the camera is stuck") and act on it over the
   code's apparent correctness.
5. **Keep the stable version playable.** Commit and tag before structural
   change. `play-stable.bat` opens a worktree of `stable-ch1`.
6. **Depth over breadth.** One principle taught properly beats five mentioned.
   Chapter 2's scope correction is the precedent: *one lesson*, not another day.
7. **Chapter 1 is finished and must not be disturbed.** Existing working content
   is a fixed point, not a draft.
8. **Style:** Uzbek for in-game text — warm, plain, adult, no exclamation-mark
   cheerfulness, **ASCII apostrophes** (`o'`, `g'`). Teaching content may mix
   English terms where a real Uzbek teacher would.

## 13. Working discipline

### One owner per file

Multiple agents work in this repo at once. **Edit only the files in your assigned
scope.** If you believe you must edit outside it, stop and report why instead of
doing it. `index.html`, `js/main.js` and **all git operations** belong to the
Lead. Content authors own their chapter's files and validator.

### Do not run `git add -A` while others are working

This has actually caused a bug. The chapter-2 commit (`3e25037`) and the
save/resume commit (`6a442a7`) both swept in edits nobody intended to ship:
`6a442a7` deleted `tools/wire-memory.js`, `tools/wire-memory2.js`,
`tools/peek-main.js`, `tools/probe-anchor.js` and `_ch2shot.html`, and
`3e25037` rewrote the `LOAD` arrays of six unrelated `tools/` scripts because an
in-flight change was sitting in the working tree.

The safe pattern: stage explicit paths (`git add js/data/chapter2.js
tools/validate-chapter2.js`), review `git diff --cached` and `git status`, and
commit. If you are not the Lead, **do not run `git add` / `commit` / `push` at
all** — report and let the Lead commit.

### Scratch files

PowerShell + `node -e` is unreliable for anything with quotes or regex (§10).
Write a `.js` file under `tools/` instead. `tools/*.tmp.js` and `tools/shots/*.png`
are gitignored; anything else you create is a tracked-file candidate, so clean up
before reporting. `tools/_*.js` and `tools/_tmpprompt.txt` are **not** ignored.

### Line endings

`js/**` files are LF. `git config core.autocrlf` is `false` here; there is no
`.gitattributes`. Writing a file with CRLF will show up as a whole-file diff.

### Report like this

What you changed (file by file), the gate output verbatim, what you verified
beyond the gate, and anything you could not verify or deliberately left out. An
honest omission is worth more than a confident claim.

---

## 14. Where to look first

| You want… | Read |
|---|---|
| the binding contract | [SPEC.md](SPEC.md), [WAVE-A-BRIEF.md](WAVE-A-BRIEF.md) |
| the user's intent and priorities | [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) |
| how to add a chapter | [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) |
| the real data shapes | `node tools/show-contract.js` |
| how a scene is interpreted | `js/game/dialogue.js` |
| how effects land | `js/game/dialogue.js` `applyEffects()` |
| what a correct chapter looks like | `tools/validate-chapter2.js`, `js/data/chapter2.js` |
| the player-facing story | [README.md](README.md) |
| deploy / live URL | [DEPLOY.md](DEPLOY.md) |

*"Service is black and white. Hospitality is colour."*
