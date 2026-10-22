# AGENTS.md — working on School_story

Read this file, then [WAVE-A-BRIEF.md](WAVE-A-BRIEF.md), then
[PROMPT-LIBRARY.md](PROMPT-LIBRARY.md). Those three are the contract. This file
is the orientation a model needs before it touches anything.

If you are adding a chapter, [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md)
is the recipe. This file explains the machine; that one explains the procedure.

---

## 0. THE FIRST RULE — update PROMPT-LIBRARY.md before you answer

**Every wave ends with an edit to [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md). Not
"sometime later", not "in the next turn", not "once the tests are green" — in
the same turn, before the final report.**

The user has had to correct this more than once, in these words:

> "you are again forgetting to update prompt library"

That is a standing instruction with the same weight as "the game must run by
double-clicking `index.html`". Treat a turn where code changed and
`PROMPT-LIBRARY.md` did not as an **unfinished turn**, even if every gate is
green and every feature works.

What "update it" means, concretely:

1. Append a new dated `##` section at the **top of the dated list** (below the
   intro, above older entries — newest first is the house style).
2. Quote the user's request **verbatim** in a blockquote. Keep their spelling and
   typos; it is a record, not marketing copy.
3. Say **what it establishes** — the binding decisions, not a changelog.
4. Say **what it produced** — files, principles, gates.
5. If a later correction changed the direction, add a `### Follow-up` subsection
   to the same wave entry rather than a separate entry.
6. If the wave taught a **new standing constraint**, add it to
   [Standing constraints](#standing-constraints) at the bottom as well, so it is
   not buried in a dated entry.

**Checklist you can run before reporting:**

```powershell
# newest entry should be this wave, with today's date
Select-String -Path PROMPT-LIBRARY.md -Pattern '^## ' | Select-Object -First 3
```

If the top hit is not this wave, the turn is not finished.

A useful tell that you are about to forget: you are writing the final summary.
**Stop, update the library first, then answer.** The library is input for the
next model, including the next version of you — it is the only reason this
project has survived many sessions of context loss.

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
css/menu.css            placeholder — the menu is drawn on canvas, not in CSS
css/hud.css             the touch layer only: d-pad, action buttons, rotate hint
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
worker/                                       Cloudflare Worker + D1 for accounts (optional)
tools/                                        validators, playtests, probes, audits — dev only
```

`css/hud.css` exists only to style the DOM touch layer — the HUD itself (minimap,
objective, trust) is canvas-drawn in `quest.js`. Don't go looking for HUD styling
in CSS; there is none.

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

`js/game/account.js` is the **optional** account client for the Cloudflare Worker
in `worker/`: Google sign-in and cloud save sync. Optional is the operative word
— with no API base configured (the default, and the only state the `file://` build
can be in) it settles without making a single network request, and boot never
waits on it. `G_ACCOUNT_API` overrides the base at runtime. Read
[worker/README.md](worker/README.md) for the server side and the six manual steps;
the client contract is in §7.1.

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
  - `play`: world, dialogue, minigame overlay, notebook (TAB), the XULOSALAR
    overview and the MENYU chapter list. The game loop hands control to exactly
    one of notebook / minigame / dialogue / free-roam, in that priority order.
    - **TAB opens the notebook menu** (`js/game/notebook.js`), four Uzbek tabs:
      `Xulosalar` (what each of your choices taught, built from
      `learning.choiceNotes` for the ids in `G.state.choicesMade`), `Qaydlar`
      (the player's own notes), `Ma'lumot` (intel + principles) and `Kundalik`
      (journal, by beat). `←`/`→` switch tabs, click works too.
    - **Qaydlar is edited in a real DOM `<textarea>`**, not on canvas: it is the
      only way to get a phone's native keyboard and IME. It is absolutely
      positioned over the canvas from the canvas's live scale, so it tracks the
      letterbox on resize/rotate. `input.js` ignores key events whose target is a
      text field — without that, typing a note moves the hero.
    - **XULOSALAR** (on-screen button) opens the same overview the chapter-end
      debrief shows, without ending the mission — this was MENYU's job until the
      two-button split.
    - **MENYU** (button, or `escape`) opens the **chapter list**: every
      registered chapter, startable mid-game. Re-tapping the chapter you are in
      offers `DAVOM ETISH` / `BOSHIDAN BOSHLASH`; a completed chapter restarts
      from its first beat on one tap. Completion is tracked outside the save, in
      `sulton.progress.v1` (`G.memory.markCompleted/isCompleted/progress`), so
      restarting a chapter does not erase the fact that it was finished.
      `tools/probe-chapter-menu.js` is the gate.
      **In an overlay's update function, hit-test the pointer before branching
      on keys** — pointer input has no second route in, and returning early on a
      keyboard branch makes drawn buttons dead.
  - `debrief`: the teaching payoff — four tabs (`Natija`, `Tanlovlar`,
    `G'oyalar`, `Qiyinchiliklar`). Entered when a node sets
    `{ endMission: true }`.
- **Overlays are modal by early-return**, not by z-index: `main.js` checks
  notebook → minigame → dialogue → free roam and returns after handling one.
- **Mobile:** the same build runs on a phone. `js/core/touch.js` binds a d-pad
  and two action buttons in `#touch-ui` (see `css/hud.css`) to the virtual key
  layer (`G.input.pressVirtual`), so touch and keyboard share one code path. The
  layout is landscape-first with a rotate hint. `tools/probe-mobile.js` is the
  gate: real CDP touch emulation on an 844×390 DPR-3 phone, tapping the d-pad and
  the action button.
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
  `multi`'s `nextAfter: { intel, true, false }` / `nextFallback`. These work;
  prefer the documented `requires.intel` shape for gates at the lesson.
  **Chapter 1 uses all three of its real gates** (`intel_football`,
  `intel_sick`, `intel_quiet` in `timur_start/tm_q`).
  **Chapter 2 now has four real gates**, each with `lockedText`:
  `CH2_NM_2` needs `intel_jasur_joke`, `CH2_GF_3` needs `intel_bekzod_new`,
  `CH2_HK_4` needs `intel_dilnoza_explains`, `CH2_EX_3` needs
  `intel_rule_reason`. It grants 17 intel ids and reads 4 of them in a gate, so the
  rest are still write-only — a known, deliberate remainder, not a claim.
  (For weeks this line said chapter 2 had **zero** gates while an even older line
  claimed it used `requires.flag`. Both were wrong. The lesson is at §11:
  *a green gate is not evidence that a feature exists* — `validate-chapter2.js`
  cannot tell a reachable gate from an absent one, and a prose changelog cannot
  tell the truth from a wish. Count them in the live file.)

**`multi` is the "ask several questions" node** — a question menu with a budget:

```js
{ type: "multi", prompt: "Nimani so'rasan?", max: 2, options: [
    { id: "Q1", text: "…", intel: "intel_sick", next: "mom_a1" },
    { id: "Q2", text: "…", intel: "intel_football", next: "mom_a2" } ] }
```

`max` is how many questions the player may ask; each picked option grants its
`intel` and **routes to its own `next`** (the answer scene). When that answer's
`next` points back at the `multi` node, the menu **resumes** — remaining
questions still list, already-asked ones stay consumed — and finishes when the
budget is spent. `dialogue.js` tracks this with a `multiReturn` marker set when
picking and cleared on `startScene`.

**This routing did not exist until recently and was a silent content-loss bug.**
`pickMulti()` used to ignore `next` entirely and jump straight out of the menu, so
chapter 1's mother scene asked two questions and skipped both answers — four
reply nodes were dead and their intel arrived by accident. The validators never
caught it because their orphan scan counts an option's `next` as an edge, so the
answer nodes looked reachable. `tools/probe-multi.js` now plays the scene for
real; `tools/probe-multi-next.js` statically proves every answer a `multi` option
routes to is itself reachable. Run both after touching `multi` or that scene.

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
execution engine. Chapter 2 uses its own namespace — **`C2-001`…`C2-008`, eight
principles, not six.** The validator allows **6–10** (`validate-chapter2.js:411`
is `if (principleIds.length < 6 || principleIds.length > 10)`); ids must be
contiguous from `C2-001` (`:417`). An earlier version of this line said
`C2-001`…`C2-006`, which would have led a new chapter to ship too few principles
— and "felt like really short / don't restrain from teaching many principles" is
one of the user's explicit complaints.

### 6.3 NPC entry

```js
{ id, name, role, zone, at, palette, facing, entry }
```

`entry` maps a beat id to a scene: `{ default: "abq_start", staffroom: "abq_start2" }`.
Routing is `entry[beat] || entry.default || first value` (`quest.js`
`npcEntryScene`).

**Chapter 1 keys `default`** on every NPC, plus `report` for Nodira (so she has a
different scene once the beat is `report`). **Chapter 2 keys `default` plus beat
keys plus `wobble`** on every pupil. This difference is a design choice, not a
bug — see §11 for what it does to the generic playtest walker.

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
  objective, trust, trustLabel, intel, flags, notes, journal, userNotes,
  choicesMade, marks, scores, objectiveOverride, started, finished, playSeconds,
  summary, avgQuality, savedBy }
```

**`chapter` is part of the save.** That is how a chapter-2 save resumes into
chapter 2. `G.state.snapshot()/restore()` carry the state fields; `G.memory`
wraps them with position, playtime and metadata.

**`userNotes` is the player's own writing** from the menu's Qaydlar tab:
`[{ id, text, at }]`, added/edited/deleted through `G.state.addUserNote`,
`updateUserNote` and `removeUserNote`. It is not the same thing as `journal`,
which the *story* writes. Distinct from `notes`, which are the scored teaching
moments. Three note-shaped concepts, three different owners — keep them straight.

`G.memory.snapshot()` lists fields **explicitly** rather than spreading
`G.state.snapshot()`. That is deliberate (it controls what lands in the readable
`memory.md`), but it means **a new state field is silently dropped from the save
unless you add it in both places.** `G.state.restore()` will happily read
`userNotes`, but it only ever sees it if `G.memory.snapshot()` passed it through.

`G.state.restore()` validates every field and **rejects** bad ones rather than
trusting the file: it returns a list of rejected field names, which `main.js`
logs, and the game continues with the good fields. Consequences for you: a
hand-edited or older `memory.md` can never corrupt live state, and adding a
state field means touching `snapshot()`, `restore()` and the shape above
together. `apply()` also restores the player position over the chapter spawn.

Resuming mid-conversation **replays the scene** — deliberate, so an interrupted
scene can never soft-lock you.

### 7.1 The account client (`js/game/account.js`)

Optional, and it must stay optional. `worker/` holds a Cloudflare Worker + D1 that
verifies a Google ID token server-side and stores one save per account. The
client is a **thin** layer over it:

```js
G.account.config          // { enabled, clientId, apiBase, reached, lastError }
G.account.init()          // GET /auth/config, then GET /me if a session cookie exists
G.account.signIn() / signOut() / deleteAccount()
G.account.sync(save)      // PUT /save   — newest-wins, keeps the losing copy
G.account.pull()          // GET /save
G.account.user()          // the signed-in user, or null
```

Rules that matter if you touch it:

- **`apiBase` defaults to `""`, and for the `file://` build it can never be
  anything else.** With no base the client settles immediately without one
  network call. `window.G_ACCOUNT_API` (or `G.account.__setApiBase`) overrides it.
  **Boot must never await it**, and `main.js` wraps `initAccount()` so a throw
  cannot stop the game.
- It uses `fetch`, which is CORS-blocked from `file://`. That is fine — the game
  is fully playable signed-out, and `verify-file-protocol.js` proves it.
- `credentials: "include"` + `cache: "no-store"` on every request: the session is
  an HttpOnly cookie, and a cached `/me` would lie after sign-out.
- Sync is debounced ~4s off `G.state.onChange` and is **newest-wins by `savedAt`**,
  never blind-overwriting. When a remote save is newer than the local one the
  player is *offered* it, not silently overwritten.
- Google Identity Services is loaded lazily from `https://accounts.google.com/gsi/client`
  — the only external request in the project, and only when the API base is
  configured. It is not an asset dependency; nothing renders without it.
- The client never stores the Google credential. It is exchanged once at
  `POST /auth/google` and only the session cookie comes back.

The Worker has its own tests (`cd worker && node test/run.js`, 87 assertions, no
network) and its own operator guide in `worker/README.md`. The client's **offline
contract** is gated by `tools/probe-account.js` (17 checks): it loads the real
`index.html` over `file://`, spies on `fetch` and `XMLHttpRequest`, and proves
boot makes zero network requests, `G.account` is inert, every method settles
without throwing or calling out, a forged `__setUser` cannot change chapter or
beat, and the game still reaches play.

**What is still unverified: a real sign-in.** That needs the deployed Worker, a
live Google OAuth client and a valid ID token, so it needs Azizbek's accounts and
cannot be automated here. Do not claim it works — say the offline contract is
green and the online path is untested.

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

These also exist; run them for the areas they cover. **All are green right now:**

```powershell
node tools/audit-text.js            # real canvas metrics: text overflow on all 10 surfaces
node tools/check-menu.js            # menu: 4 Uzbek tabs, Xulosalar content, notes round-trip
node tools/probe-multi.js           # plays ch1's question scene, proves answers are reachable
node tools/probe-multi-next.js      # static: every multi option's answer node is reachable
node tools/probe-account.js         # account layer is inert, never breaks boot
node tools/probe-hud.js             # minimap clear of play area, MENYU overview, copy control
node tools/probe-mobile.js          # real CDP touch emulation: d-pad moves hero, buttons work
node tools/probe-chapter-menu.js    # XULOSALAR/MENYU split, Davom etish / Boshidan boshlash, restart-from-top
node tools/probe-distances.js       # ch1 gate/shop are closer, anchors still walkable
node tools/analyze-facing.js        # hero sprite nose points the way he walks
node tools/shots.js                 # headless screenshots -> tools/shots/
node tools/color-inventory.js       # palette inventory
node tools/show-contract.js         # prints the exact live data shapes
node tools/check-pages.js           # deployed Pages build: live URL + assets + boot
```

### `audit-text.js` and the textAlign trap

`audit-text.js` was red for a while (`60 overflow`) after `93b36c8` moved the shop
and gate east. That was a real regression, and chasing it found **five** bugs, all
of the same shape: **a draw function assumed `textAlign` was `"left"` while an
earlier surface had left it `"center"`.** Canvas `textAlign` is sticky across
draw calls, and `ctx.save()/restore()` only protects you if every surface actually
sets it. Centred text drawn at an explicit left-hand `x` extends `width/2` to the
left, which pushed the mission objective, every long dialogue choice, the debrief
header and all four debrief page bodies off the left edge of their panels.

**The rule: if you `fillText` at an `x` you computed by adding a left margin, set
`ctx.textAlign = "left"` first.** Do not assume the previous surface restored it.

The same audit also caught two genuine world-layer issues:

- NPC name tags are now clamped inside the 960px viewport (`world.js`). A pupil
  standing near the screen edge used to have their name cut in half.
- `world.js drawDecor()` culls decor outside the camera. Off-camera decor was
  still being drawn under the camera translate — wasted work, and the reason the
  audit kept reporting the shop sign, which legitimately scrolls into view.

Do not "fix" a red audit by loosening its thresholds. It measures real canvas
metrics against a 960×600 viewport; a red result means a player can see the
problem.

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

### A green gate is not evidence that a feature exists

This is the most expensive gotcha in the file, and it has now happened twice.

A wave wrote into `PROMPT-LIBRARY.md` that chapter 2 had seven active `requires`
gates and a `registerRun` minigame wired into the story. The live file had
**zero** `requires`, zero `lockedText`, and a 463-line `registerRun` that **no
node referenced**. Every gate was green throughout, because the validators check
what a chapter claims *structurally* — ids present, notes covered, one
`endMission` — and none of them can tell a gate that exists from a gate that was
merely written about, or a minigame that is registered from one that is
reachable.

Three separate false claims about chapter 2 lived in this file and the guides for
weeks (zero `requires` gates, `C2-001`…`C2-006`, "chapter 2 uses
`requires.flag`") and every one was caught only by running the code or reading
the live file — never by reading the previous changelog.

**The rule:** before you write "X is wired", "Y is gated", or "Z is reachable",
run something that proves the *behaviour*:

- a gate is real → it has `requires` **and** `lockedText` in the live file, and
  the intel it names is granted somewhere (`dialogue.js` gates show locked when
  unmet, so an ungranted intel means a permanently-locked door);
- a minigame is reachable → some node names it, and
  `playtest.js --chapter=ch2` actually plays it;
- a minigame *works* → drive it in a vm harness and force **both** a win and a
  loss. `G.debug.forceMinigame(win)` is the host hook; timers need real
  `update(dt)` frames, so a driver must call `G.minigameHost.update(dt)` too.

Verify against the live file, never against the last changelog — including this
one.

### The trigger never fires while the player stands still (`quest.js`)

Reported as *"it is getting stuck on birinchi 90 soniya … some dialogs with
students but not next step appearing."* It looked like thin content. It was an
engine bug.

`quest.js` armed `pendingTriggerZone` **only when the player changed zone**. But
chapter 2's `door` scene runs *inside* the classroom and advances the beat to
`open`, whose trigger is **also** on the classroom. The zone never changed, so
`pendingTriggerZone` stayed null and the trigger could never fire — the objective
hung until the player happened to leave the room and re-enter it.

Fixed in `quest.js` (`5ee34c0`) by re-arming on **beat change** as well as zone
change:

```js
var beatNow = beat();
if (zone !== lastZone) { lastZone = zone; pendingTriggerZone = zone; lastBeat = beatNow; }
else if (beatNow !== lastBeat) { lastBeat = beatNow; pendingTriggerZone = zone; }
```

The generalisable lesson: **a trigger is a function of (zone, beat), so both
inputs are change-detectors.** Any beat that is set from *within* the same zone
its trigger lives in depends on this. When adding a chapter whose scenes advance a
beat without moving the player, test it standing still — not by walking around.

### An option's `next` is a NODE id, never a scene id

`choice`/`multi` option `next` values resolve **inside the same scene's `nodes`
map**. Scenes are only entered by `triggers[].scene`, `npc.entry[beat]`, or
`story.opening`. Writing a scene id in `next` produces the validator's
"missing node" and "no terminal node" errors together, which is a confusing pair
until you know this.

This bit during the chapter 2 recreation: the `wobble` beat's options pointed at
scene ids (`wob_zarina`, …). The correct shape is the one the original used —
the scene **ends**, and the player physically walks to a pupil, whose
`npc.entry.wobble` starts that pupil's scene. Every `endMission` node is likewise
a terminal `end` node inside a scene, not a scene of its own.

### Chapter 2's beat list, and why it changed

The recreated chapter (`2026-10-22`) runs, in order:

```
before > door > open > intro > hook > names > gift > wobble > exit > done
```

The old list was `before door open names rules task gift wobble exit done`. The
change is the user's own running order, and it is binding: introduce yourself →
why the subject is useful and can be fun → get to know them and one fact each →
**announce what gifts they get if they answer correctly** → only then formal
work. The old chapter jumped to exercises after two names, which was the
complaint. `rules` and `task` folded into `names`/`hook`/`gift`.

Triggers: one per beat after `before`, all `once: true`; `exit` on the corridor,
the rest on the classroom. `names` and `hook` are **also** NPC-beat keyed so the
generic playtest walker can advance them (§11, `BEAT_PLAN`).

### There is no documented one-lesson turnaround — do not fake one

The chapter-2 recreation asked for real precedents of someone turning a bored
class into an excited one. The research is in
`_ch2-research/class-turnarounds.md` and its **headline finding is negative**:
there is no documented, named, first-person account of turning a hostile class
around in a single 45-minute lesson. Everything documented works over a week, a
term, a semester or a year.

So chapter 2 stages a **first lesson** honestly — a beginning, not a conversion —
and says so in its header. Do not let a future edit claim a one-lesson miracle,
and do not paste the PGD numbers (`engaged time 58.75% → 79.70%`) in as if the
greeting alone caused them: the study's own caveat is that its teachers had "low
baseline levels of classroom management practices", so part of the gain may be
the training rather than the greeting. Also: **zero Uzbek-context sources
exist** for this technique set (all US/UK) — a live risk, flagged, not solved.

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

Chapter 1's NPCs key `entry.default` on all five, plus `report` on Nodira only.
A **generic** walker (the `advanceWorldGeneric()` path used for chapters after
ch1) advances a beat by finding an NPC whose `entry` is keyed to the current
beat, then by entering a trigger zone, then by sweeping every zone. For chapter 1
only the `report` beat has a keyed NPC — every other beat has no beat-keyed NPC
and no trigger for it either, so the generic walker stalls. That is why the plan
above exists: it is data the game itself does not contain. `test-chapters.js`
says as much: chapter 1 "keeps its beat→NPC map in the playtest harness".

Do not "clean this up" by deleting `BEAT_PLAN`: chapter 1 would stop being
verifiable. If you add a chapter, the generic path is what will exercise it — so
give your NPCs beat-keyed entries for the beats where they matter, and give every
remaining beat a trigger. Chapter 2 does both: `names` and `hook` are NPC-keyed,
`wobble` is NPC-keyed on all six pupils, and the rest (`before`/`door`/`open`/
`intro`/`gift`/`exit`) are delivered by triggers.

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
9. **Every menu surface works by pointer *and* by keyboard, and both are tested
   separately.** The HUD is canvas-drawn, so a menu can look correct and be
   untouchable. In an overlay's update function, hit-test the pointer **before**
   branching on keys — pointer input has no second route into the surface.
   And a probe that dispatches a synthetic `keydown` without a matching `keyup`
   fires exactly once and then goes dead, because `input.js` sets `pressed[k]`
   only when `!down[k]`.
10. **Ask him before you invent him.** Any agent creating a chapter **may ask the
    user personal questions** — he said so directly. The question bank, the
    asking discipline and the fallback are in
    [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md) §7. Two rules make it
    safe: **ask before plotting** (a biography answer can change the chapter's
    whole shape, and finding it after encoding costs a rewrite), and **if you
    cannot ask, do not guess** — build on verified material only and leave a
    `QUESTIONS.md`. This constraint exists because the opposite already happened:
    a chapter put a specific, invented memory in the hero's own mouth, promoted it
    into the notebook as self-knowledge, and it passed every gate. **A verified
    fact is not a licence to invent its details.**
11. **Chapter 2 is a work in progress, not a template.** The user has said *"I
    didn't like chapter 2 yet"* — while also saying *"there are some good parts in
    it."* Mine it for mechanisms that demonstrably work (the brief format, the
    one-fact-three-treatments technique, the foldback shape, the ending image) and
    for its **data format**, which the validators define. Do **not** copy its
    editorial choices — plot, length, idea density, use of his biography — as if
    they were approved. He has said chapter 2 can be **recreated with these
    guides**, which is the real quality bar for the guide set.

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

## 14. Production deploy: GitHub Pages *and* Coolify

There are **two** deploys of the same static site, and they are not the same thing.

| | GitHub Pages | Coolify |
|---|---|---|
| URL | https://azizbekteacher.github.io/School_story/ | http://3jh6dtoqcwuhghpx7wggj57l.169.58.215.190.sslip.io |
| Triggered by | push to `master` (`.github/workflows/pages.yml`) | **also a push to `master`** — auto-detected by polling, no webhook needed (see gotcha 4) |
| Serves | repo root **minus** `.git`, `.github`, `tools/`, `_stable-play/`, `play-stable.bat` | repo root, so `tools/` and `play-stable.bat` **are** publicly reachable |

[GitHub Pages](https://azizbekteacher.github.io/School_story/) is the
player-facing one. The Coolify copy is a self-hosted mirror on the user's own
VPS. A change is not "deployed" until you have pushed to `master`, whatever
Coolify says — Coolify clones from GitHub, never from your disk.

### The instance

| Item | Value |
|---|---|
| Dashboard | `http://169.58.215.190:8000` (Coolify `4.4.7`) |
| Host | `vmi3524831` — Docker 29.7.2; reverse proxy is `coolify-proxy` (Traefik v3.6) |
| Server uuid | `hfgx8josjctjmxlvanv4ig3r` |
| Project | **School story** — uuid `fwmu7asdhngigjne9mwx3hti` |
| Environment | `production` — uuid `olxcarr1pigufbjxbnc4vjic` |
| Application | `school_story:main-mpj3oqzlwhs6bwkv9ipn6gkg` — uuid `3jh6dtoqcwuhghpx7wggj57l` |
| Source | `github.com/azizbekteacher/School_story`, branch `master` |
| Build | build pack `static` → `nginx:alpine`, container port **80** |

The application name is auto-generated by Coolify's "add public repo" flow from
`<repo>:<branch>-<hash>`; it is **not** the project name and it does not mean the
repo lives somewhere else. One repo, one app, and it already sits in
**School story** — do not go looking for it under `Bots` or `Tilsevar`.

### Credentials — where they are, never what they are

**This repository is public.** Never commit a token, and never paste one into
`AGENTS.md`, `PROMPT-LIBRARY.md`, a commit message or a chat report — see
Standing constraint 2. Document the *location*; read the value only when a
command needs it.

| Credential | Lives at (local only, outside the repo) | Used for |
|---|---|---|
| Coolify API token (root) | `~/.config/coolify/api_token` | REST calls to `/api/v1` |
| Root SSH key | `~/.ssh/coolify_localhost` | `ssh coolify` → full root on the VPS |
| SSH alias | `Host coolify` in `~/.ssh/config` | `ssh coolify` |

That SSH key is Coolify's own "localhost" server key, so it has full root on the
host. Use it to **inspect** production (`docker ps`, `docker logs`, `/data/coolify`),
not to hand-patch it — real deploys go through Coolify.

```powershell
# read the token without printing it
$h = @{ Authorization = "Bearer $((Get-Content "$env:USERPROFILE\.config\coolify\api_token").Trim())"; Accept = "application/json" }

# what the app is doing
Invoke-RestMethod "http://169.58.215.190:8000/api/v1/applications/3jh6dtoqcwuhghpx7wggj57l" -Headers $h |
  Select-Object status, git_branch, build_pack, ports_exposes, fqdn
```

```powershell
# deploy current origin/master — POST, not GET
Invoke-RestMethod "http://169.58.215.190:8000/api/v1/deploy?uuid=3jh6dtoqcwuhghpx7wggj57l&force=false" `
  -Headers $h -Method Post -Body '{}'
```

`GET /deploy` returns **405** with *"This endpoint has changed to a POST request."*
A healthy deploy ends `status: finished`; then fetch the `sslip.io` URL and look
for `Sulton School` in the HTML.

### Gotchas that have already bitten this app

Every one of these produced a resource that looked correctly configured in the UI
and still did not serve a page. Check them in this order when the site is down.

1. **Branch `main` vs `master`.** The repo's only branch is `master`; the app was
   created pointing at `main`, so every build died in four seconds with
   *"Remote branch main not found in upstream origin."* The default branch of the
   repository is the only correct value here.
2. **Build pack `railpack` vs `static`.** The repo has no `package.json` and no
   build step — it is hand-written HTML/CSS/JS. `static` is correct; a language
   build pack will try to install dependencies that do not exist.
3. **Port 3000 vs 80.** Coolify defaults new apps to `3000`. `nginx:alpine` listens
   on **80**. Fixing `ports_exposes` was **not** enough: Coolify had frozen the old
   port into `custom_labels`, a **base64-encoded** blob holding
   `...loadbalancer.server.port=3000` and `caddy_0...{{upstreams 3000}}`. Stored
   labels are re-applied on every deploy and override the config, so the container
   kept routing to a closed port and the edge returned **502**. Change the port in
   the UI *and* regenerate those labels, or the fix silently reverts. Diagnose on
   the host: `docker inspect <container> --format '{{json .Config.Labels}}'`.
4. **Auto-deploy DOES work — do not "fix" it by hand.** An earlier version of
   this gotcha claimed auto-deploy was inert because the GitHub repo has **zero
   webhooks** (`gh api repos/azizbekteacher/School_story/hooks` → `[]`) and the
   source is the anonymous "Public GitHub" app. That reasoning was wrong, and the
   user corrected it: *"its not manual, it can detect automatically."* Coolify
   detects the push by **polling** the public repo, so no webhook is involved —
   which is exactly why looking for a webhook finds nothing and proves nothing.
   Verified empirically: push `830b8c2..268cf31`, then fetch the new guides from
   the sslip.io URL — all five return **HTTP 200 with the current text** (e.g.
   `AGENTS.md` serves "Ask him before you invent him"). So: **push to `master` and
   wait**; both Pages and Coolify update on their own. POST `/deploy` is only for
   forcing a redeploy when you have *not* pushed (e.g. after changing Coolify's own
   env vars), not the normal path.

   **The general lesson, since this is the second time:** "I looked for mechanism X
   and found nothing" is not evidence that the effect does not happen. Test the
   *effect* — here, whether the served bytes changed — before writing down a
   mechanism. A wrong gotcha is worse than no gotcha, because it tells the next
   agent to do manual work that can actively fight the automation.
5. **Coolify builds from GitHub, not your working tree.** Local commits that have
   never been pushed do not exist for Coolify. This file itself 404'd on the
   Coolify URL while local `master` was four commits ahead of `origin/master`.
   `git status` being clean does not mean it is deployed — check
   `git rev-list --left-right --count origin/master...HEAD`. (Auto-deploy does not
   remove this: it triggers on the *push*, so unpushed work is still invisible.)
6. **Static pack copies the whole repo.** `tools/`, `play-stable.bat` and every
   `.md` in the root are reachable on the Coolify URL, because only `.git`,
   `Dockerfile`, `docker-compose.yaml` and `.env` are stripped. GitHub Pages is
   the deploy that excludes dev-only material, so do not treat the Coolify URL as
   the "clean" one.

### `master` is a live deploy on both targets

There is no build to gate, so the gate is §10 (`node tools/validate.js`,
`node tools/check-pages.js`) and it must pass before you push — `master` is what
both deployments serve.

---

## 15. Where to look first

| You want… | Read |
|---|---|
| the binding contract | [SPEC.md](SPEC.md), [WAVE-A-BRIEF.md](WAVE-A-BRIEF.md) |
| the user's intent and priorities | [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) |
| **how to add a chapter (start here)** | [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) |
| **what the chapter is about / plot craft** | [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) |
| **the user's own requirements, verbatim** | [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) §0.1 |
| **making a chapter about *him*** | [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md) |
| **designing a minigame** | [MINIGAME-DESIGN-GUIDE.md](MINIGAME-DESIGN-GUIDE.md) |
| **mining his Notion for material** | [NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md) |
| what the book actually says | [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) |
| the real data shapes | `node tools/show-contract.js` |
| how a scene is interpreted | `js/game/dialogue.js` |
| how effects land | `js/game/dialogue.js` `applyEffects()` |
| what a correct chapter's *data* looks like | `tools/validate-chapter2.js` — **copy it** |
| chapter 2's content | `js/data/chapter2.js` — **work in progress, a source of parts, not a standard** |
| the player-facing story | [README.md](README.md) |
| deploy / live URL | [DEPLOY.md](DEPLOY.md) |
| the Coolify mirror, its credentials' locations, and its gotchas | §14 above |

**Which of these is authoritative when they disagree:** `node tools/show-contract.js`
and the validators beat every prose file, including this one. Prose describes
intent; the data and the gates describe reality. Three separate false claims
about chapter 2 lived in this file and the guides for weeks (zero `requires`
gates, `C2-001`…`C2-006`, "chapter 2 uses `requires.flag`") and every one of them
was only caught by running the code.

*"Service is black and white. Hospitality is colour."*
