# Building chapter N+1

A repeatable recipe for adding a chapter to School_story. Read
[AGENTS.md](AGENTS.md) first — it explains the machine. This file is the
procedure.

The reference implementation is **chapter 2**, and the best model for a new
chapter is to read `js/data/chapter2.js` + `js/data/chapter2-learning.js` +
`tools/validate-chapter2.js` side by side with this guide. Chapter 1 is
**not** a model for a new chapter: it predates the chapter registry, its NPCs do
not key beats, and it must not be touched.

---

## 0. The shape of a good chapter here

What makes a chapter work in this game, concretely:

- **One tight focus, expressible as a single question.** Chapter 2 is *"fourteen
  strangers are deciding who you are in the first ninety seconds — what do you
  do?"* Chapter 1 is *"one boy, one day, and what you do with what you learned
  about him."* If you cannot write your chapter's question as one sentence, the
  chapter is two chapters.
- **A real teaching arc, not a topic list.** The player should be able to make a
  *wrong* choice that feels reasonable, feel its cost later, and see that cost
  named in the debrief. The three temptations must be genuinely tempting:
  Chapter 2's Jasur is not a villain, he is a boy testing whether the new teacher
  is real.
- **A minigame that *demonstrates* rather than quizzes.** The gift shop is not
  "pick the right present" — it is a test of whether you listened earlier, and
  the expensive item *cannot win*. Knowing the boy loves football literally makes
  the football game easier. If your minigame would work as a multiple-choice
  question, it is not a minigame yet.
- **A debrief that lands.** The debrief is the teaching payload: per-principle
  scores, choice-by-choice feedback, an archetype with a warning about that
  style's failure mode, concrete Monday ideas, and honest difficulties. Write it
  as the actual lesson, not as flavour text.
- **Depth over breadth.** One principle taught properly beats five mentioned.
  This is a standing user constraint, stated more than once.

Length reference: chapter 1 is ~1,020 lines of story (10 scenes, 119 nodes);
chapter 2 is ~1,600 lines (17 scenes, 191 nodes, 41 options). Both learning
files are 700–730 lines. Do not ship a 200-line chapter — it will read as a
placeholder.

---

## 1. Step 1 — decide the question, and 5–6 principles

Write these down before any code.

**The question.** One sentence. The whole chapter must be usable as an answer to
it. Chapter 2's: *fourteen strangers are choosing who you are, and you are
choosing who they are — what do you do in the first ninety seconds?*

**Five or six principles, in your own namespace.** Give them ids that cannot
collide with another chapter's: chapter 2 uses `C2-001` … `C2-006`. Do not reuse
chapter 1's `I-*`/`F-*` ids, and do not extend chapter 1's learning object.

Map each principle to a beat. Chapter 2's six principles are one per part of the
lesson:

| id | principle | beat it lives in |
|---|---|---|
| `C2-001` | the room decides who you are before you speak | `before`, `door` |
| `C2-002` | attention is mutual — children audit it | `open` |
| `C2-003` | a name is the smallest unit of hospitality | `names` |
| `C2-004` | expectations are service; the reason is colour | `rules`, `task` |
| `C2-005` | the moment it breaks is the impression | `wobble` |
| `C2-006` | the last minute is what they carry out | `exit` |

Each principle object needs, and the validator enforces:
`id, name, source, gist, atSulton` (≥2 concrete Sulton examples), `spotIt`
(≥2 ways to notice it in a real day).

**Write `gist` as an argument, not a definition.** Chapter 2's `C2-001` gist is
three sentences about how a first impression is a verdict the room reaches, not
a speech you give. That is the register.

---

## 2. Step 2 — define the beats

**A beat is a progress marker.** It is a plain string that drives three things at
once:

1. **the objective** shown in the HUD (`objectives[beat]`),
2. **NPC routing** (`npc.entry[beat]` picks which scene that NPC speaks),
3. **triggers** (a trigger fires when the player enters its zone while its beat
   is current).

A beat is reached by an **effect** `{ beat: "id" }` inside a scene — never by
position. That is the single most important mechanical rule in the story layer.

Design rules for the beat list:

- **7–10 beats.** `validate-chapter2.js` fails outside that range.
- **The first key of `objectives` is the chapter's first beat.** `main.js` starts
  the chapter on `Object.keys(objectives)[0]`, so insertion order is load-bearing.
  Chapter 2's first key is `before`, and the chapter spawn is in the corridor.
- **Every beat must be set by some `{ beat }` effect**, and every `{ beat }`
  effect must name an existing objective key. The validator checks both
  directions — a beat that is declared but never reached fails, and a typo in a
  beat effect fails.
- **The last beat should be terminal** (`done`), set in the same effect list as
  `{ endMission: true }`.
- **Objective strings must fit one HUD line, ~34 characters.** The validator
  warns above 34; longer strings clip.

Chapter 2's beats, for shape:

```
before → door → open → names → rules → task → wobble → exit → done
```

Each one is a *change in the situation*, not a new location. `wobble` is the
mid-lesson moment where the plan breaks and you choose whose desk to walk to.
That is a beat because it is a decision point, not because the player moved.

**Write the beat table down before the script.** For each beat: what the player
is doing, what changes, which NPC or trigger delivers it, and which principle it
teaches.

---

## 3. Step 3 — write the story object

Put the chapter in **new files**: `js/data/chapter3.js` and
`js/data/chapter3-learning.js`. Never edit `story.js` or `learning.js` to add a
chapter.

### 3.1 Skeleton

```js
window.G = window.G || {};
G.data = G.data || {};

(function () {
  var P = {
    FIRST: "C3-001",
    NAME:  "C3-002"
    // … one constant per principle, used in every note
  };

  G.data.chapter3 = {
    id: "ch3",                              // must be "ch3" for a third chapter
    title: "Keyingi kun: …",                // shown large on the title card
    subtitle: "Sulton School — …",
    startZone: "classroom",                 // must be a zone that has anchors
    startAnchor: 0,                         // 0..5
    opening: "intro",                       // scene started automatically

    brief: [                                 // chapter 2 requires exactly 3 lines
      "line one",
      "line two",
      "line three"
    ],

    npcs: [ /* §3.2 */ ],
    triggers: [ /* §3.2 */ ],
    objectives: { /* §2 — first key is the first beat */ },
    scenes: { /* §3.3 */ }
  };
})();
```

Field names are exact. `validate-chapter2.js` checks
`id title subtitle startZone startAnchor opening brief npcs triggers objectives
scenes` all exist, that `title`/`subtitle` are non-empty strings, that `brief` is
an array of exactly 3 non-empty lines, that `startZone` has an anchor list and is
a real map zone, and that `startAnchor` is within that zone's anchors (`0..5`).

### 3.2 NPCs and triggers

```js
npcs: [
  {
    id: "pupil_zarina",                 // unique
    name: "Zarina",
    role: "5-B o'quvchisi",
    zone: "classroom",                  // must have an anchor list
    at: 5,                              // anchor index 0..5
    palette: "teacher_female",          // see the palette list in AGENTS.md §6.3
    facing: "down",
    entry: {
      default: "zarina_default",        // always provide default
      names:   "names_start",           // beat-keyed scene
      wobble:  "wob_zarina"
    }
  }
],

triggers: [
  { zone: "classroom", beat: "door", scene: "door", once: true },
  { zone: "corridor",  beat: "exit", scene: "exit_start", once: true }
]
```

Rules the validators enforce:

- `id`, `name`, `role`, `zone`, `at`, `entry` all required; ids unique.
- `zone` must be one of the **anchor zones**: `staffroom classroom gate yard shop
  street corridor`. (`corridor2` is a real map zone but has no anchors, so an NPC
  cannot stand there. A *trigger* may use `corridor2`.)
- `at` must be `0..5` (each anchor zone has 6 positions).
- Every value in `entry` must name an existing scene.
- Every trigger needs `zone` + `scene`, `once: true`, a `beat` that exists in
  `objectives`, and a zone that is a real map zone.
- A trigger whose `beat` is not current will never fire — triggers do **not**
  queue across beats.

**Use existing zones and anchors. You do not need new art, new tiles or new map
zones.** Reusing anchors is normal and expected: chapter 2 puts six pupils in the
same classroom on anchors 0–5. `G.map.anchor(zone, index)` turns `{zone, at}`
into pixels; never write raw coordinates in content.

Do give each NPC a **beat-keyed entry** for the beats where they matter. This is
what makes the generic playtest walker able to play your chapter — it looks for
an NPC whose `entry` has the current beat as a key. Chapter 1 only keys `default`
and consequently cannot be walked generically.

### 3.3 Nodes

A scene is `{ start: "firstNodeId", nodes: { id: { …node } } }`. All
`next`/`onWin`/`onLose`/option `next` targets must exist **in the same scene** —
scenes never jump to each other. A scene is entered only by an NPC entry, a
trigger, or `opening`.

Node types: `say`, `choice`, `multi`, `minigame`, `end`.

**A say node** — narration (`speaker: ""`) or speech:

```js
in_1: {
  type: "say", speaker: "",
  text: "8:52. Koridor. Devorda «5-B» yozuvi, eshik yopiq, ichkarida stullar shovqini.",
  next: "in_2"
},
zd_2: {
  type: "say", speaker: "Zarina",
  text: "O'qituvchi, siz Oqil akani taniysizmi?",
  next: "zd_3"
}
```

`next` omitted or `null` ends the scene. `speaker: ""` renders in the italic
narration style (the hero's inner voice) — use it for everything the player
thinks and everything nobody says.

**A choice node, with a `choiceNote` for every option id:**

```js
dr_q: {
  type: "choice",
  prompt: "Ular yonidan o'tmoqda. Nima qilasiz?",
  options: [
    {
      id: "CH3_DOOR_1",
      text: "Eshikda turaman va har biriga ko'zga qarab «salom» deyman.",
      next: "dr_r1",
      effects: [
        { note: { principle: P.FIRST, verdict: "ok",
                  text: "Bugun eshikda turgan odam bo'ldingiz — ertaga ham shu yerda turishingiz kerak." } },
        { flag: "c3_door_soft" }
      ]
    },
    {
      id: "CH3_DOOR_2",
      text: "«Zarina, salom. Bekzod, sen o'ng tomonda o'tirasan.»",
      next: "dr_r2",
      requires: { intel: "intel_zarina" },
      lockedText: "«Zarina, salom...» — lekin bu ismlarni qayerdan bilasiz? Siz ularni kuzatmadingiz.",
      effects: [
        { note: { principle: P.NAME, verdict: "good",
                  text: "Eshikda ism aytdingiz, va ism to'g'ri chiqdi." } },
        { trust: 1 }
      ]
    }
  ]
}
```

Every option needs `id`, `text`, and `next`. The gated option needs
`requires` **and** `lockedText`: when the gate is unmet the option is displayed
locked with `lockedText` as the reason, so the player sees the door they failed
to open. That is the lesson — never gate silently, and never assume the player
has the intel.

**Design rule: every gate needs a fallback.** At least one ungated option must
always be available, or the player is stuck. Chapter 2's door scene is five
options, only one gated.

**A multi node** — pick up to `max` questions from a list (chapter 1's mother
scene is the canonical use):

```js
mom_q: {
  type: "multi",
  prompt: "Nima so'raysiz? Ikki savolga vaqtingiz bor.",
  max: 2,
  next: "mom_wait",
  options: [
    {
      id: "MOM_Q2",
      text: "«Uydan tashqari nima bilan shug'ullanadi?»",
      intel: "intel_football",      // multi options grant intel via `intel`
      next: "mom_a2"
    }
  ]
}
```

Each picked option runs its `next` node, then returns to the same list; when
`max` is reached or the player presses ENTER, play continues at `next`. `max` is
required and numeric.

**A minigame node:**

```js
g_mg: {
  type: "minigame",
  game: "giftShop",                     // must be registered
  config: {},                           // handed to create(api) as api.cfg
  onWin: "g_win",
  onLose: "g_lose"
}
```

Without `onWin`/`onLose` the engine falls back to `next`, so always provide both.

**An end node** — the only way out of a scene:

```js
dr_end: {
  type: "end",
  effects: [
    { journal: "Sinf jim bo'ldi. Siz birinchi marta o'n to'rt yuzni ko'rdingiz." },
    { beat: "open" }
  ]
}
```

### 3.4 Effects — the whole DSL

| Effect | What it does |
|---|---|
| `{ flag: "x" }` | sets a boolean flag (`{ flag:"x", value:false }` clears) |
| `{ intel: "intel_x" }` | records a fact; unlocks gated options; shows in notebook |
| `{ trust: 2 }` | moves the 0–10 trust meter |
| `{ beat: "names" }` | advances the beat and therefore the objective |
| `{ journal: "…" }` | free notebook note |
| `{ note: { principle, verdict, text } }` | a scored teaching moment |
| `{ objective: "…" }` | temporary objective override |
| `{ endMission: true }` | show the debrief |

`verdict` must be exactly `good` | `ok` | `weak` | `bad`. The validators reject
anything else, including plausible-looking words like `great`.

**Notes are the scoring primitive and the teaching record.** The debrief shows
per-principle good/bad tallies, so: one `note` on every meaningful choice, with
the principle it expresses and one sentence saying why it lands or fails. Chapter
2 has 114 principle references across 45 choice notes; a chapter with 15 notes is
under-written.

Notes and journals are stamped with the beat *before* any `beat` effect in the
same list (`dialogue.js` captures `priorBeat`), so put `{ beat }` last in an
effect list if you care about the stamp.

---

## 4. Step 4 — place NPCs and triggers on existing anchors

Nothing new is needed in `js/world/map.js`. The anchor zones each have six
positions. Pick existing ones:

| zone | anchors | typical use |
|---|---|---|
| `classroom` | 6 | pupils, a colleague, the lesson |
| `staffroom` | 6 | the deputy head, a colleague |
| `gate` | 6 | a parent waiting |
| `yard` | 6 | the boy, football, a walk |
| `shop` | 6 | the shopkeeper |
| `street` | 6 | the outer gate, arrival |
| `corridor` | 6 | the bell, the queue, the exit |

Rules of thumb:

- Put the NPC for a beat where that beat happens, and give it an `entry` keyed to
  that beat. The playtest walker depends on this.
- A trigger handles "the player walks in and something happens"; an NPC handles
  "the player chooses to talk". Chapter 2 uses triggers for the two crossings
  (into the classroom, out to the corridor) and NPCs for everything optional.
- Everything the player *can* do outside the main line should be an NPC with a
  `default` entry, so the world feels inhabited. Chapter 2 gives every pupil a
  `default` scene and a `wobble` scene.
- `startZone` must be a zone with anchors. Chapter 2 starts in `corridor` at
  anchor 0; chapter 1's spawn is special-cased and must not be imitated.

If you truly need a new zone, that is engine work in `js/world/map.js` plus
`ZONES` + `ANCHORS` — Lead-owned, and it is not required for a new chapter.

---

## 5. Step 5 — write the learning object

New file `js/data/chapter3-learning.js`:

```js
window.G = window.G || {};
G.data = G.data || {};

G.data.chapter3Learning = {
  principles: { /* ONE OBJECT keyed by id — not an array */ },
  intel: { /* notebook labels for every intel id the script grants */ },
  choiceNotes: { /* one entry per option id AND per minigame choiceId */ },
  archetypes: [ /* 3 or more, contiguous score bands */ ],
  ideas: [ /* 6–8 for a new chapter */ ],
  difficulties: [ /* 5–7 */ ]
};
```

**`principles` — an object keyed by id.** Six entries, ids `C3-001` … `C3-006`,
each with `id, name, source, gist, atSulton[≥2], spotIt[≥2]`. Ids must match
their keys and be in order.

**`choiceNotes` — one for every choice id, with no orphans.** This is the strictest
rule in the whole pipeline:

- every option `id` in your story must have an entry,
- every `choiceId` your minigame can emit must have an entry,
- every entry must correspond to an id that something actually emits (an orphan
  fails the build),
- each entry needs `principle` (an existing one), `verdict`, `title`, `why`
  (plus optional `cost`, `alternative`).

Entry shape:

```js
CH3_DOOR_2: {
  principle: "C3-002", verdict: "good",
  title: "Two names, both correct",
  why: "A name at the door, used correctly, is the cheapest proof of attention
        that exists. Zarina's question was not about memory — it was a test of
        whether the watching was real.",
  cost: null,
  alternative: "Add the detail you saw: 'Sen boshqalarga tushuntirib turarding.'"
}
```

`why` should say **why this lands or fails**, not restate the choice. `cost` is
what it costs later — use `null` when there is genuinely no cost. `alternative`
is a sharper way to do the same moment; this is the most useful field for a real
teacher.

**`intel` — a label for every intel id.** Every `{ intel: "x" }` the script
grants, and every `requires.intel`, needs `{ label, usedFor }` here, or the
notebook shows a raw id.

```js
intel: {
  "intel_zarina": { label: "Zarina boshqalarga tushuntiradi", usedFor: "door names, group work" }
}
```

**`archetypes` — an array with contiguous score bands, and the trap to avoid.**
`debrief.js pickArchetype()` computes `avg` in the range −1…2 and keeps the
matching band with the highest `minAvg`:

```js
archetypes: [
  { id: "arch-host",      when: { minAvg: 1.5 },              title, text, watchOut },
  { id: "arch-performer", when: { minAvg: 0.8, maxAvg: 1.5 }, title, text, watchOut },
  { id: "arch-gatekeeper",when: { maxAvg: 0.8 },              title, text, watchOut }
]
```

- Bands must be **contiguous and non-overlapping**, covering −1…2, with the
  highest band last-checked by `minAvg` and the lowest using only `maxAvg`. If
  bands leave a gap, the fallback is `archetypes[0]`, which may be the wrong
  style entirely.
- `minAvg`/`maxAvg` must be within −1…2, and `minAvg ≤ maxAvg` or the validator
  fails.
- `requiresIntel` entries must have labels in `intel`.
- 3+ archetypes. Each needs `title`, `text`, `watchOut` — and `watchOut` should
  be the *failure mode of that style*, not a generic warning.

**Why chapters never merge their learning objects:** `principles` is an object so
two chapters' principles could coexist, but `archetypes` is an array of score
bands. Merging chapter 1's and chapter 2's arrays lets chapter 1's bands win. This
is measured, not hypothetical — a chapter-2 run averaging 1.9 gets chapter 1's
`arch-listener` from a merged array instead of chapter 2's `arch-host`. So: one
complete learning object per chapter, swapped wholesale by `activate()`. Never
`Object.assign` two chapters together, and never append your principles/archetypes
into `learning.js`.

**`ideas` — 6–8 concrete, cheap, Sulton-specific implementations.** Each needs
`id, title, what, how` (**exactly 3 steps**), `effort`, `cost`, `difficulty`,
`principle`, and optional `firstWeek: true`. `difficulty` names the real obstacle.
`how` being exactly three steps is enforced.

**`difficulties` — 5–7 honest obstacles.** Each needs `id, title, why, mitigation,
principle`. Include the uncomfortable ones: no time, colleagues reading it as
showing off, parents suspicious, no budget, burnout.

**Every principle must actually be used** by some note, idea or difficulty — the
validator warns on a defined-but-unreferenced principle, and a principle taught by
nothing is a principle you did not write.

---

## 6. Step 6 — a minigame, if the chapter needs one

Only if the chapter has a moment that must be *performed*, not chosen. Put it in
`js/data/minigames/chapter3.js`.

```js
/* chapter3.js — activities for chapter 3.
   The host clips us to 852x418 logical pixels and draws the title, subtitle and
   controls footer, so every coordinate below lives in 0..852 x 0..418. */

(function () {
  "use strict";
  window.G = window.G || {};
  var G = window.G;
  G.minigames = G.minigames || {};
  G.minigames.list = G.minigames.list || {};
  G.minigames.order = G.minigames.order || [];
  if (typeof G.minigames.register !== "function") {
    G.minigames.register = function (id, def) {
      if (!id || !def) return;
      this.list[id] = def;
      if (this.order.indexOf(id) < 0) this.order.push(id);
    };
  }

  var W = 852, H = 418;          // CONTENT space, not 960x600
  var MOUSE_X = 54, MOUSE_Y = 108;   // content origin inside the 960x600 canvas

  G.minigames.register("thirdThing", {
    title: "Uchinchi narsa",
    subtitle: "Bir harakat — va u keyingi daqiqani belgilaydi.",
    controls: "1-4 — tanlash · ENTER — tasdiqlash · sichqoncha bilan ham bo'ladi",
    principles: ["C3-001"],       // optional; copied onto result if you omit principleIds

    create: function (api) {
      var finished = false;
      var t = 0;

      function pick(i) {
        if (finished) return;
        finished = true;
        var win = i === 2;
        if (api.sound) api.sound[win ? "win" : "bad"]();
        api.finish({
          win: win,
          choiceId: win ? "CH3_MG_WIN" : "CH3_MG_LOSE",
          detail: "…what happened, in one line…",
          notes: [
            { principle: "C3-001", verdict: win ? "good" : "weak",
              text: "…why this lands or fails…" }
          ],
          effects: win ? [{ trust: 1 }] : []
        });
      }

      return {
        update: function (dt) { t += dt; },

        draw: function (ctx) {
          ctx.save();
          ctx.fillStyle = "#4a3f33";
          ctx.fillRect(0, 0, W, H);          // content space only
          ctx.restore();
        },

        onKey: function (key) {
          if (key >= "1" && key <= "4") pick(parseInt(key, 10) - 1);
          else if (key === "enter" || key === "space") pick(2);
        },

        onPointer: function (x, y, type) {
          if (type !== "down") return;
          var p = { x: x - MOUSE_X, y: y - MOUSE_Y };   // 960x600 -> content
          if (p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H) pick(2);
        }
      };
    }
  });
})();
```

Host contract, the parts that bite:

- **Content space is 852×418**, already clipped and translated — draw at
  `(0,0)`–`(852,418)`. The host draws the panel, title, subtitle and a fading
  controls footer around you.
  Some older minigame files (`gift.js`, `travel.js`, `ball.js`) still say
  `872×478` in comments and constants; that is stale. Use 852×418.
- **`api.mouse` and `onPointer` coordinates are 960×600 screen space.** Subtract
  `54, 108` before hit-testing your own rects.
- **`api.finish(result)` exactly once.** Guard with your own `finished` flag; the
  host also ignores duplicate calls, but never call it from `draw`.
- `api.cfg` is the node's `config` object. `api.state` gives `flags`, `intel`,
  `trust`, `beat`, `scores` — **read `intel` and change the game's behaviour with
  it.** That is the whole point: knowledge should make the game winnable.
- `api.sound`: `blip(freq)`, `tick()`, `select()`, `good()`, `bad()`, `win()`.
- Keyboard is the requirement; mouse is a bonus. Keys routed to you: `1`–`9`,
  `enter`, `space`, `escape`, arrows, `a d w s r`, `tab`.
- **Every choiceId you emit needs a `choiceNotes` entry** in the learning file.
  The validator regexes string literals out of your minigame source, so write
  `choiceId: "CH3_MG_WIN"` as a literal.

---

## 7. Step 7 — register the chapter

Four edits, in this order.

**7.1 Create the data files.**

```
js/data/chapter3.js            (story)
js/data/chapter3-learning.js   (teaching payload)
js/data/minigames/chapter3.js  (only if you wrote a minigame)
```

Register the story and learning globals: `G.data.chapter3` and
`G.data.chapter3Learning`. Follow the existing naming exactly — the registry
reads those two property names.

**7.2 Add script tags to `index.html`.** **The Lead owns this file — do not edit
it.** Report the three (or two) lines to add, in this position:

```html
<script src="js/data/chapter2.js"></script>
<script src="js/data/chapter2-learning.js"></script>
<script src="js/data/chapters.js"></script>          <!-- after ALL data -->
...
<script src="js/data/minigames/chapter2.js"></script>
<script src="js/data/chapter3.js"></script>           <!-- story/learning above chapters.js -->
<script src="js/data/chapter3-learning.js"></script>
<script src="js/data/minigames/chapter3.js"></script> <!-- minigames before main.js -->
```

The constraint that matters: **story/learning files must load before
`js/data/chapters.js`**, because the registry captures chapter 1's references at
load. Minigame files must load before `main.js`.

**7.3 Add one line to `js/data/chapters.js`.** Also Lead-owned; report the line.
It follows the chapter-2 pattern exactly:

```js
var c3 = make("ch3", 3, G.data.chapter3, G.data.chapter3Learning,
  (G.data.chapter3 && G.data.chapter3.startZone) || "classroom",
  (G.data.chapter3 && G.data.chapter3.startAnchor) || 0,
  G.data.chapter3 ? "ready" : "missing");
if (c3) CHAPTERS.push(c3);
```

`make()` derives `title`, `subtitle`, `brief`, `firstBeat` and `objectives` from
the story — do not duplicate them. **No lock, no prerequisite, no unlock flag.**
Every chapter is playable from the start; `playableFromStart()` exists to keep it
that way.

**7.4 Copy the validator.** Copy `tools/validate-chapter2.js` to
`tools/validate-chapter3.js` and adapt:

- `FILES`: point at your map/minigame/story/learning files.
- `CH` / `L`: `G.data.chapter3` / `G.data.chapter3Learning`.
- `REQUIRED`: the top-level field list.
- Id assertions: `id === "ch3"`, principle ids `C3-001…C3-006` in order.
- The option-id prefix regex `/^CH2_/` → `/^CH3_/`.
- The minigame-source path and the `CH2_` literal regex.
- Counts: 6 principles, 3 archetypes, 6–8 ideas, 5–7 difficulties.

Keep every check. They are all there because something failed without them.

---

## 8. The full checklist

Everything the validators will catch. Get it right the first time.

### Story / scenes

- [ ] `id` is `"chN"` and matches the registry entry.
- [ ] `title`, `subtitle` non-empty; `brief` is 3 non-empty lines.
- [ ] `startZone` is a real map zone **with anchors**; `startAnchor` is `0..5`.
- [ ] `opening` names a scene that exists.
- [ ] `objectives` has 7–10 beats; **the first key is the first beat**.
- [ ] Every beat is set by some `{ beat }` effect, and every `{ beat }` names an
      existing objective.
- [ ] Trigger `beat`s exist in `objectives`; every trigger has `once: true`.
- [ ] Objective strings ≤ ~34 chars.
- [ ] Every scene has a `start` node that exists.

### Nodes

- [ ] Every node has a valid `type` (`say choice multi minigame end`).
- [ ] `say` nodes have non-empty `text`.
- [ ] `choice`/`multi` nodes have a non-empty `prompt` and a non-empty `options`
      array; `multi` has a numeric `max ≥ 1`.
- [ ] Every option has `id`, `text`, `next`; every `next` resolves **in the same
      scene**.
- [ ] Option ids are unique across the whole chapter.
- [ ] **Every option id carries the chapter prefix** (`CH3_…`).
- [ ] Every gated option has `requires` **and** `lockedText`.
- [ ] Every `requires.intel` is granted somewhere in the script.
- [ ] Every `minigame` node has a `game` id that is registered, plus `onWin` and
      `onLose`.
- [ ] Every `next`/`onWin`/`onLose` target exists.
- [ ] No node references a node in another scene.
- [ ] Every note has `principle` and a `verdict` in `good|ok|weak|bad`.
- [ ] **Exactly one** node sets `{ endMission: true }`, and it also sets a beat.
- [ ] Every scene is reachable from `opening`, an NPC `entry`, or a trigger.
- [ ] Every scene has a terminal node (`type: "end"`, or `next: null`).
- [ ] **No orphaned nodes** — every node is reachable from its scene's `start`.

### NPCs / triggers

- [ ] NPC `id`s unique; `name`, `role`, `zone`, `at`, `entry` present.
- [ ] `zone` is an anchor zone; `at` is `0..5`.
- [ ] Every `entry` value names an existing scene.
- [ ] Every NPC has `entry.default`.
- [ ] Beat-keyed entries exist where the beat matters (needed for the generic
      playtest walker).

### Learning

- [ ] `principles` is an **object** keyed by id; ids in order; each has
      `name, source, gist, atSulton[≥2], spotIt[≥2]`.
- [ ] **A `choiceNotes` entry for every option id and every minigame choiceId.**
- [ ] **No orphan choiceNotes** — every note id is actually emitted.
- [ ] Each note has `principle` (existing), valid `verdict`, `title`, `why`.
- [ ] Every principle is referenced by at least one note/idea/difficulty.
- [ ] Every principle referenced anywhere exists.
- [ ] `intel`: a label for every granted id and every gated-on id.
- [ ] `archetypes`: 3+, contiguous non-overlapping bands covering −1…2, each with
      `title`, `text`, `watchOut`, and `requiresIntel` ids that have labels.
- [ ] `ideas`: 6–8, each with `how` of **exactly 3** steps and a real `difficulty`.
- [ ] `difficulties`: 5–7, each with `why` and `mitigation`.
- [ ] Every `idea.principle` / `difficulty.principle` exists.

### Engine / harness

- [ ] New story/learning files load **before** `js/data/chapters.js`.
- [ ] New minigame file loads **before** `js/main.js`.
- [ ] Exactly one `make(...)` line added to `js/data/chapters.js`; no lock.
- [ ] `js/data/story.js` and `js/data/learning.js` untouched.
- [ ] `js/world/map.js` untouched (no new zones needed).
- [ ] Line endings LF.
- [ ] `tools/test-chapters.js` updated (it asserts exactly two chapters) and
      `tools/validate.js` updated (`FILES` + `gidFile()` for a new minigame id),
      or a note in your report saying they now need it.

---

## 9. The gate commands

Run **in this order**, from the repository root. All of these are green on the
current two-chapter tree.

```powershell
node tools/validate.js
```

Expected tail: a summary block (`scenes`, `nodes`, `story choice ids`,
`registered minigames`, `objectives`, `choiceNotes documented`, `principles`,
`ideas`, `difficulties`, `archetypes`) ending in

```
PASSED — 0 errors, 0 warnings
```

```powershell
node tools/validate-chapter2.js
```

This is the **model** for your own chapter validator. Expected: the info lines
including `mission ends at: exit_start/ex_end`, `minigame choice ids: …`, then a
counts block (`scenes 17 / nodes 191 / options 41 / principles 6 / choiceNotes
45 / ideas 8 / difficulties 7 / archetypes 3 / npcs 6 / triggers 2`) ending in
`PASSED — 0 errors, 0 warnings`.

```powershell
node tools/playtest.js
node tools/playtest.js --strategy=worst
node tools/playtest.js --chapter=ch2
```

Each should report `beats reached: done`, `debrief shown: true` and
`PASSED — mission completed to debrief with no exceptions`. A new chapter needs
`--chapter=chN` and its **NPCs must key beats** or the generic walker stalls.

```powershell
node tools/test-chapters.js
```

Expected: `CHAPTER TEST PASSED — both chapters play, switch and resume correctly`.
This one asserts there are exactly two chapters, so it will go red when you add a
third — that is the harness needing an update, not a content bug.

```powershell
node tools/verify-file-protocol.js
```

The contract gate. Expected:
`FILE:// VERIFICATION PASSED — boots and completes the mission by double-click`.

```powershell
node tools/test-memory.js
```

Expected: `MEMORY TEST PASSED — save/resume works across a reload`.

```powershell
node tools/probe-hero.js 1
node tools/probe-hero.js 2
```

Expected: `PASS  the hero is on screen (screen 336,302 of 960x600)` and
`(screen 480,301 …)`. For a new chapter: `node tools/probe-hero.js 3`.

Then, if you touched anything visual:

```powershell
node tools/audit-text.js
node tools/analyze-facing.js
```

`TEXT AUDIT PASSED — no overflow, no runtime errors` and
`PASS  the nose points the way the hero is walking, in both directions`.

**A red gate means your change is wrong.** Fix the change; never edit the test to
match. If a gate was already red before you started, say so in your report with
the verbatim output rather than silently working around it.

---

## 10. Common mistakes

Written as "if you see X, check Y".

**"The chapter isn't on the title screen."**
Check: the story/learning script tags are **above** `js/data/chapters.js` in
`index.html`, and the `make(...)` line exists in `chapters.js`. If
`chapters.js` ran first it captured nothing and your chapter is `missing`.

**"The title screen shows the chapter but refuses to start it."**
Check: the registry entry's `status`. It is `"missing"` when the story object is
absent — almost always a wrong global name (`G.data.chapter3` vs
`G.data.chapter_3`) or a script tag pointing at the wrong path.

**"It starts on the wrong objective / the HUD objective is empty."**
Check: the **first key** of `objectives` is the first beat. `firstBeatOf()` reads
`Object.keys(objectives)[0]`; JS preserves insertion order, so a beat inserted
earlier in the literal silently becomes the opening beat.

**"The player walks into the room and nothing happens."**
Check the trigger's `beat`. Triggers only fire while their beat is current — they
do not queue. If the beat has already advanced, either drop the trigger's `beat`
or key the scene on the NPC instead.

**"The playtest stalls and never reaches the debrief."**
Check: your NPCs have **beat-keyed** entries. The generic walker
(`advanceWorldGeneric()`) looks for an NPC whose `entry` contains the current
beat, then falls back to trigger zones, then sweeps every zone. Chapter 1 only
keys `default` and is walked by a hand-written `BEAT_PLAN` instead — do not copy
that pattern for a new chapter. Also check that the current beat's objective is
actually reachable: a beat with no NPC and no trigger is a dead end.

**"The debrief shows the wrong archetype / a chapter-1 archetype."**
Check: your chapter's learning object is its own complete object and activation
swapped it. If archetypes were merged, chapter 1's bands shadow yours — measured:
a chapter-2 run at avg 1.9 becomes `arch-listener` instead of `arch-host`. Never
merge learning objects.

**"The debrief says `undefined` for a choice I made."**
Check: `choiceNotes` has an entry for that exact id. The debrief looks up
`learning.choiceNotes[cid]` and skips silently if missing — but the chapter
validator should have failed you first, so this usually means a **minigame**
choiceId (validators only find ids they can regex out of source) or an id built
by string concatenation.

**"The validator says `choiceNotes is missing an entry for option X`."**
Check: you added or renamed an option id and did not update the learning file.
Every option id needs a note, in both directions.

**"The validator says `orphan choiceNote`."**
Check: a note exists for an id nothing emits any more. Deleting an option without
deleting its note is the usual cause.

**"`validate-chapter3.js` says an option id is not prefixed."**
Check: the prefix regex in your copied validator and the prefix in your option
ids agree (`CH3_`). The prefix rule exists so two chapters' ids can never collide
in one save/`choiceNotes` space.

**"NPC is invisible or in the wrong place."**
Check: `zone` is an **anchor** zone (`staffroom classroom gate yard shop street
corridor`) — not `corridor2`, which has no anchors. `at` must be `0..5`. An NPC
with `activeWhen` may be hidden by the current beat or flag; neither shipped
chapter uses it, so if you added it, check it.

**"The minigame draws off-centre / clicks miss."**
Check: you are drawing in **852×418 content space**, and subtracting
`MOUSE_X = 54, MOUSE_Y = 108` from pointer coordinates (which arrive in 960×600
space). The stale `872×478` figure in the older minigame files is not the current
geometry.

**"The minigame never ends / the story hangs."**
Check: `api.finish()` is called exactly once, and only from `update`/`onKey`/
`onPointer` — never from `draw`. Also check the node has `onWin`/`onLose`.

**"A gate is shown but the player can never open it."**
Check: the `requires.intel` id is granted by some effect earlier in the chapter.
The validator catches a gate on intel that is never granted. And every gate needs
at least one ungated sibling option.

**"The chapter validator passes but the game breaks."**
Check: `validate-chapter2.js`-style checks are static. They cannot prove the
minigame is playable, the pacing works, or text fits. Run `playtest.js
--chapter=chN`, `verify-file-protocol.js`, and `audit-text.js`.

**"Chapter 1 broke while I was adding a chapter."**
Revert. Chapter 1 is a fixed point. Check anything you changed that is shared:
`main.js` (the `ch.id !== "ch1"` spawn guard), `chapters.js` (the once-at-load
capture), `index.html` ordering, and `js/game/*`. The user's standing instruction
is to revert chapter 1 rather than re-engineer it.

**"The `git diff` includes files I never touched."**
Someone ran `git add -A` while another agent had work in the tree — this has
happened twice in this repo's history. Stage explicit paths only; if you are not
the Lead, do not run `git add`/`commit`/`push` at all.

---

## 11. Worked mini-example — a hypothetical chapter 3

Not a full script; enough to make the shape concrete and to show every seam.

**The question.** Chapter 1 was *what you do with what you learned about one boy*.
Chapter 2 was *the first ninety seconds of a first lesson*. Chapter 3 is
**the parent at the gate who has heard a version of you already**: the thing you
say to a mother is not heard in isolation — a colleague, a mark and a corridor
rumour got there first. Question: *what do you do when the story about you
arrives before you do?*

**Principles (6, `C3-…`).**

| id | principle | beat |
|---|---|---|
| `C3-001` | you do not get the first word about yourself | `brief` |
| `C3-002` | a report is a story, not a score | `report` |
| `C3-003` | listen for the version they already believe | `listen` |
| `C3-004` | specific beats reassuring | `specific` |
| `C3-005` | what you refuse to promise is also information | `promise` |
| `C3-006` | the parent leaves with a sentence, not a summary | `exit` |

**Beats (9).** `brief → corridor → report → listen → specific → promise →
wobble → exit → done`. First key `brief`; `startZone: "gate"`, `startAnchor: 0`.

**NPCs (4, on existing anchors).**

```js
npcs: [
  { id: "nodira", name: "Nodira opa", role: "Timurning onasi",
    zone: "gate", at: 1, palette: "mother", facing: "down",
    entry: { default: "mom_wait", listen: "mom_listen", promise: "mom_promise",
             exit: "mom_exit" } },
  { id: "oqil", name: "Oqil", role: "Matematika o'qituvchisi",
    zone: "staffroom", at: 4, palette: "teacher_male", facing: "down",
    entry: { default: "oqil_default", corridor: "oqil_leak" } },
  { id: "abubakr", name: "Abu Bakr", role: "Direktor o'rinbosari",
    zone: "staffroom", at: 2, palette: "adult_male", facing: "down",
    entry: { default: "abq_default", report: "abq_report" } },
  { id: "timur", name: "Timur", role: "5-B o'quvchisi",
    zone: "yard", at: 3, palette: "boy", facing: "down",
    entry: { default: "timur_default", wobble: "timur_wobble" } }
],

triggers: [
  { zone: "staffroom", beat: "corridor", scene: "oqil_leak", once: true },
  { zone: "gate", beat: "exit", scene: "mom_exit", once: true }
]
```

**One choice node with a gate and a fallback.**

```js
rep_q: {
  type: "choice",
  prompt: "U sizdan hisobot so'raydi. Nima deysiz?",
  options: [
    { id: "CH3_REP_1",
      text: "«Bahosi past. Nazoratdan keyin gaplashamiz.»",
      next: "rep_r1",
      effects: [
        { note: { principle: P.REPORT, verdict: "weak",
                  text: "Raqam — bu hisobot emas, bu hisobotning yorlig'i. U o'sha raqamni sizdan oldin bilardi." } },
        { trust: -1 }
      ] },
    { id: "CH3_REP_2",
      text: "«Bugun bir narsani ko'rdim: u jim, lekin daftar chetiga chizadi. Ertaga shundan boshlayman.»",
      next: "rep_r2",
      requires: { intel: "intel_timur_margin" },
      lockedText: "«Daftar chetiga chizadi...» — lekin siz u chetda nima borligini bilmaysiz.",
      effects: [
        { note: { principle: P.SPECIFIC, verdict: "good",
                  text: "Bitta aniq kuzatuv, bitta aniq qadam. U birinchi marta bolasi haqida yangi gap eshitdi." } },
        { note: { principle: P.REPORT, verdict: "good",
                  text: "Hisobot — hikoya, raqam emas: nima ko'rdingiz, nima qilasiz, qachon qaytasiz." } },
        { trust: 2 },
        { flag: "c3_rep_good" }
      ] },
    { id: "CH3_REP_3",
      text: "«Xavotir olmang, men uni yaxshi o'quvchi qilaman.»",
      next: "rep_r3",
      effects: [
        { note: { principle: P.PROMISE, verdict: "bad",
                  text: "Va'da berish oson. U bunday gaplarni avval ham eshitgan — va ular bajarilmagan." } },
        { trust: -1 }
      ] }
  ]
}
```

**The learning object for it** (abbreviated, but every seam present):

```js
G.data.chapter3Learning = {
  principles: {
    "C3-001": { id: "C3-001", name: "You do not get the first word about yourself",
      source: "Unreasonable Hospitality — the story arrives before the guest",
      gist: "…",
      atSulton: ["…", "…"], spotIt: ["…", "…"] },
    // … C3-002 … C3-006
  },
  intel: {
    "intel_timur_margin": { label: "Timur daftar chetiga chizadi", usedFor: "report, exit" },
    "intel_oqil_version": { label: "Oqil siz haqingizda gap tarqatgan", usedFor: "report honesty" }
  },
  choiceNotes: {
    CH3_REP_1: { principle: "C3-002", verdict: "weak",  title: "A number is not a story",
      why: "…", cost: "…", alternative: "…" },
    CH3_REP_2: { principle: "C3-004", verdict: "good",  title: "One observation, one next step",
      why: "…", cost: null, alternative: "…" },
    CH3_REP_3: { principle: "C3-005", verdict: "bad",   title: "A promise you cannot keep",
      why: "…", cost: "…", alternative: "…" }
    // … one per option id, plus CH3_MG_* if you ship a minigame
  },
  archetypes: [
    { id: "arch-broker",  when: { minAvg: 1.5 },               title: "…", text: "…", watchOut: "…" },
    { id: "arch-clerk",   when: { minAvg: 0.8, maxAvg: 1.5 },  title: "…", text: "…", watchOut: "…" },
    { id: "arch-defender",when: { maxAvg: 0.8 },               title: "…", text: "…", watchOut: "…" }
  ],
  ideas: [
    { id: "idea-gate-sentence", title: "Darvozada bitta jumla",
      what: "Give every parent one specific sentence about their child.",
      how: ["Come out two minutes early.", "Say one observed thing, no marks.",
            "Say what you will do next and when you will report back."],
      effort: "low", cost: "none",
      difficulty: "Parents arrive in a wave at 13:10 and two of them want to talk for ten minutes.",
      principle: "C3-004", firstWeek: true }
    // … 6–8 total
  ],
  difficulties: [
    { id: "d-version", title: "Siz haqingizdagi versiya allaqachon tarqalgan",
      why: "…", mitigation: "…", principle: "C3-003" }
    // … 5–7 total
  ]
};
```

**Registry line** (Lead adds it): the chapter-2 `make(...)` pattern with
`"ch3"`, `3`, `G.data.chapter3`, `G.data.chapter3Learning`, and
`(G.data.chapter3 && G.data.chapter3.startZone) || "gate"`.

Then the checklist in §8, then the gates in §9 — and `test-chapters.js` will need
its "exactly two chapters" assertion updated, which is expected work for adding a
chapter, not a regression.

---

*"Service is black and white. Hospitality is colour."*
