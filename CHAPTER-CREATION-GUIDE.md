# Building chapter N+1

A repeatable recipe for adding a chapter to School_story.

Read in this order:

1. [AGENTS.md](AGENTS.md) — the machine, the rules, the constraints.
2. [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) — **what the chapter is
   about.** Do not skip this. Plot is the centre of the work.
3. **This file** — how to research it, then how to build it.

The reference implementation is **chapter 2** — but read the next paragraph
before you treat it as a template.

> **Chapter 2 is a work in progress, not a finished model.** The user's words on
> an earlier version were *"[chapter 2] I didn't like it, like, at all"*, and on
> the current one: *"I didn't like chapter 2 yet"* — but also *"there are some
> good parts in it."* A rewrite wave has since addressed a lot of the original
> complaints.
>
> So use chapter 2 as a **source of parts, not a standard to copy whole.** It is
> the only complete chapter on the current engine, and several of its pieces are
> genuinely good and worth reusing (see the list below). But do **not** deep
> reverse-engineer its overall shape and assume that shape is right: the plot,
> the density of ideas, and the use of his biography are still being judged.
>
> **The practical rule:** mine chapter 2 for *mechanisms that demonstrably work*,
> and treat its *editorial choices* — length, pacing, how many ideas, which
> biography facts — as open questions that
> [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) and
> [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md) exist to answer. The user
> has said chapter 2 can be recreated with this guide set, which is the real test
> of whether the guides are good enough.

**Good parts of chapter 2 worth reusing, with confidence:**

| part | why it works |
|---|---|
| the three-line `brief` | situation · asset · trap, in 3 lines. A model for any chapter's opening card. |
| the **bean-count of the temptation** — the credential is named as easy *and* its refusal costs something | the choice is real because the easy path is genuinely attractive |
| **one fact, three treatments** (perform / withhold / redirect) | a reusable technique for turning biography into choice — see `PERSONALISATION-GUIDE.md` §3 |
| **six parallel `wob_*` scenes** for the final choice | gives the player a *specific person* instead of an abstraction, without six plots |
| the **ending image** ("Bekzod usuli" in chalk) | a small, specific, retellable residue rather than a speech |
| **foldback structure** — short terminating scenes, one mission exit | the only branching shape that fits the budget |
| `complimentRun` | his own sentence ("I could give active students compliments") turned into a mechanic |

Treat as settled, and copy without hesitation:

- the **data contract** — verified by `tools/validate-chapter2.js` and
  `tools/show-contract.js`, not by prose
- the **engine patterns** — effects, beats, intel, minigames, the registry
- the **gates** — §13

Chapter 1 is **not** a model for a new chapter either: it predates the chapter
registry, its NPCs do not key beats, and it must not be touched. It is a fixed
point, not a template.

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
  named in the debrief. The temptation must be genuinely tempting: chapter 2's
  Jasur is not a villain, he is a boy testing whether the new teacher is real.
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
chapter 2 is ~1,642 lines (21 scenes, 203 nodes, 36 options). Both learning files
are 758–831 lines. **Do not ship a 200-line chapter** — it will read as a
placeholder.

---

## 1. The pipeline in one page

**A chapter is made in seven stages, and three of them are research.** Nearly
every bad chapter is bad because stages 0–3 were skipped and coding started at 5.

```
Stage 0   BRIEF        what is this chapter for, for him, this week
Stage 1   HARVEST      Notion · the book · his biography · the web
Stage 2   DISTILL      the main points → 6-10 principles → the single question
Stage 3   PLOT         the story, its spine, its choices   → PLOT-CREATION-GUIDE.md
Stage 4   INTERACTIONS beats · what is a decision vs a line · minigames
Stage 5   ENCODE       story data · learning object · minigames · registry
Stage 6   VERIFY       gates · playtest · the honesty pass
```

Stages 0–4 produce **documents, not code.** Write them down. A chapter that
exists only in a chat history is lost; a chapter that exists as five short
markdown files can be reviewed, argued with, and handed to another agent.

The expected artifacts, in a scratch directory (not committed):

| file | produced at | contains |
|---|---|---|
| `BRIEF.md` | stage 0 | the situation this week, the question, what must not be said |
| `RESEARCH.md` | stage 1 | the mined material, with provenance |
| `POINTS.md` | stage 2 | the main points, the principles, the question |
| `PLOT.md` | stage 3 | the spine, the beats, the choice list |
| `INTERACTIONS.md` | stage 4 | per-beat: what the player does, minigame specs |
| `js/data/chapterN.js` | stage 5 | the chapter |
| `js/data/chapterN-learning.js` | stage 5 | the teaching payload |

**A stage is not done until its artifact exists.** This is the single most useful
discipline in this document.

---

## 2. Stage 0 — the brief

Before research, write one page about **why this chapter, now.**

The trap is building a chapter about an abstract principle. Chapter 2 was written
after the user said the previous attempt *"didn't use almost none of the ideas
from Unreasonable Hospitality"* and *"didn't take into account my personal
info"*. The correction was not "add quotes" — it was **find the real dilemma he
is actually living and answer it with the book.**

The brief answers:

1. **What is his actual situation this week?** Read the most recent entries in
   the Notion **Logs** page (`3fe2d18e-3d59-8043-a847-ff7e329d51d9`). What is he
   dealing with — a class, a colleague, a manager, a pilot programme?
2. **What does he want to be true that is not?** The gap is the chapter.
3. **Which parts of the book speak to it?** Not "which are my favourite" —
   which actually answer this situation.
4. **What is the chapter's question, in one sentence?** Try to write it now. If
   you cannot, the brief is not ready.
5. **What must NOT be said?** Things that would be cheap, wrong, or hurt a real
   colleague. Write them down so a later stage cannot drift into them.

Keep the brief short. It is a compass, not a plan.

### Sizing the brief

| good brief | bad brief |
|---|---|
| 1 page, 5 short answers | 5 pages of theme notes |
| names a specific real situation | "about hospitality in schools" |
| states the question | states a topic |
| names what to avoid | no boundaries |

---

## 3. Stage 1 — harvest: where the material comes from

Four sources, in this priority order. You do not need all four for every chapter,
but **you must consciously choose** which you are using.

| # | source | what it gives | where |
|---|---|---|---|
| 1 | **The user's Notion** | his own words, his real situation, the book's highlights, AI extractions | `api.notion.com`, see [NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md) |
| 2 | **The book, verified** | what Guidara actually says vs what the internet claims | [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) |
| 3 | **His biography** | the details that make choices personal | `Umumiy ma'lumotlar` page + this repo's docs |
| 4 | **The web** | how this is handled in real practice, by named practitioners | `web_search` / `web_fetch` |

### 3.1 Mining Notion

The full procedure, with API calls and worked examples, is in
[NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md). The short version:

- **Logs** (`3fe2d18e-3d59-8043-a847-ff7e329d51d9`) — his dated reflections.
  This is the richest source for *his actual situation*. Nested toggles: you must
  descend two levels (`/v1/blocks/<block_id>/children`).
- **Book insights** (`4002d18e-3d59-8187-a7bd-c9e21cf223a3`) — **223 highlights,
  7 notes**, plus nested toggles.
- **Ai review** (`3ff2d18e-3d59-8054-b6e1-cea7afa470c8`) — batch AI extractions of
  the book. Fast to scan, but it is a *secondary* source: quote the highlight, not
  the extraction, when accuracy matters.
- **Umumiy ma'lumotlar** (`3fe2d18e-3d59-80dd-b180-d14b06eac5fb`) — the
  biography. Start here.

Rules:

- **Never print the token.** Get it from the skill file at read time; do not
  paste it into a report, a commit, or a markdown file.
- Paginate. Every page endpoint takes `page_size=100` and returns `has_more` +
  `next_cursor`. Most of these pages are >100 blocks.
- Dump raw responses into a scratch directory. You will re-read them, and Notion
  rate-limits.
- Never write to Notion from a chapter task. Read-only.

**A trap:** the AI review pages are *extractions*, not the book. This project has
already been burned by an agent quoting a plausible line that was an AI
paraphrase. If a quotation matters, find it in the **highlights** page, and if it
is not there, [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md)
is the authority on whether it exists.

### 3.2 The book — verified vs. distillation

Read [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md)
before you write a single principle. It distinguishes, with citations:

- lines that are **Guidara's own words**
- lines that are **distillations** of his argument (usable as ideas, not as quotes)
- things **attributed to the book that are not in it**

Known traps — do not put these in a chapter as quotations:

| claim | status |
|---|---|
| "Service is black and white, hospitality is colour" | **a distillation**, not a verified Guidara quotation |
| "one size fits one" | **could not be verified** — treat as unattributed |
| "the answer is yes — what is the question?" | **not in this book** |
| postcard / granola / umbrella as gifts | **not in the book** |
| birthday cake | appears **only negatively** |

**A shipped example of the trap:** chapter 2's principle `C2-004` is *named*
"One size fits one", and its `source` correctly points at real chapters
("Ch. 16 — earning informality; Ch. 3 — enlightened hospitality is not one
recipe"). The *idea* is sound and sourced; the *phrase* is not a quote. That is
the right way to handle it — but if you ever print a quotation in a chapter, it
must be verifiable.

**Chapter 2's eight principles, as a model of sourcing:**

| id | name | what it argues |
|---|---|---|
| `C2-001` | The verdict is reached before you speak | the room decides who you are before you act |
| `C2-002` | A name is the smallest unit of hospitality | the maître d' who confirmed the reservation himself |
| `C2-003` | Somebody's job is to notice | the Dreamweaver role; the $2 hot dog as a gift |
| `C2-004` | One size fits one | earning informality; enlightened hospitality is not one recipe |
| `C2-005` | Specific beats generic | the guest remembers the specific gesture, not the correct one |
| `C2-006` | The gesture nobody asked for | the hot dog systemised; 95% / 5% |
| `C2-007` | The last minute is the impression they keep | the closing exchange outweighs the middle |
| `C2-008` | The enemy is 'reasonable' | competence is not the goal |

Note the shape: each is an **argument**, not a label. "Be thoughtful" is a label.
"Specific beats generic" is an argument you can disagree with.

### 3.3 His biography

Read [PLOT-CREATION-GUIDE.md §10](PLOT-CREATION-GUIDE.md) for how biography
becomes plot. For harvesting, the target is a short dossier of **verified** facts
with provenance, and an explicit UNKNOWN list. Do not invent.

The verified personalisation hooks used by chapter 2:

- **Buxoro viloyat olimpiadasi** — regional olympiad champion, and Buxoro as the
  strongest maths region. Used as the chapter's *temptation*.
- **Kukaldash madrasa** — where he studied. Used as the *alternative* source of
  authority: the teacher who learned, not the teacher who won.
- **5-B** — the real class.
- **Abu Bakr** (manager) and **Oqil** (maths colleague) — real people, portrayed
  with dignity.
- **The pilot idea** — his own 30-day plan, which the ideas tab can build on.

The chapter-2 `brief` is three lines and encodes the whole personalisation:

```
5-B. O'n to'rt begona. Qirq besh daqiqa.
Sizda bitta guvohnoma bor — Buxoro viloyat olimpiadasi.
Uni ko'rsatish oson. Ishlatmaslik qiyin.
```

Three lines: the situation, the asset, and the trap. **That is the standard for a
chapter brief.**

### 3.4 Web research

Research the **real situation**, not the theme. If the chapter is about a new
teacher's credibility, research what actually happens to new male teachers in
Central Asian schools; what the literature says about first-impression effects on
student compliance; what named practitioners actually do about it.

Rules:

- Prefer practitioners and named frameworks over SEO listicles.
- **Do not import claims you cannot source.** If the web says something
  surprising, it either gets a citation in the research file or it does not go in
  the chapter.
- The teaching content must be **usable on a Monday**. A principle that requires
  budget, permission, or colleagues' buy-in needs that difficulty named honestly
  in the `difficulties` tab.
- Keep a `RESEARCH.md` with links. Another agent must be able to check you.

---

## 4. Stage 2 — distill: material into a teaching payload

This is the hinge. You have material; here you turn it into something that can
teach. Four outputs.

### 4.1 The single question

One sentence. The whole chapter must be usable as an answer to it. Chapter 2:

> *Fourteen strangers are choosing who you are, and you are choosing who they
> are — what do you do in the first ninety seconds?*

Test it: can you imagine two defensible answers? If only one answer is
defensible, it is not a question, it is an instruction.

### 4.2 The principles — 6 to 10, own namespace

The validator's real rule is **6–10 principles**
(`tools/validate-chapter2.js:411`), ids **contiguous in order**
(`C2-001`, `C2-002`, …). The old version of this guide claimed "exactly six" —
that was wrong. Chapter 2 ships **8**.

Each principle needs: `id, name, source, gist, atSulton` (≥2 concrete Sulton
examples), `spotIt` (≥2 ways to notice it in a real day).

**Use a namespace that cannot collide:** chapter 1 uses `I-*` / `F-*`, chapter 2
uses `C2-*`. A new chapter gets `C3-*`, and so on.

**Write `gist` as an argument, not a definition.** `C2-001`'s gist is three
sentences about how a first impression is a verdict the room reaches, not a
speech you give. That is the register.

**Map each principle to a beat.** Chapter 2, 8 principles across 10 beats:

| id | principle | beats it lives in |
|---|---|---|
| `C2-001` | the verdict is reached before you speak | `before`, `door` |
| `C2-002` | a name is the smallest unit of hospitality | `open`, `names` |
| `C2-003` | somebody's job is to notice | `names`, `rules` |
| `C2-004` | one size fits one | `rules`, `task` |
| `C2-005` | specific beats generic | `task`, `gift` |
| `C2-006` | the gesture nobody asked for | `gift` |
| `C2-007` | the last minute is the impression they keep | `exit`, `done` |
| `C2-008` | the enemy is 'reasonable' | `wobble` |

### 4.3 The main-points table

The bridge from research to plot. One row per point you intend to teach:

| # | main point | from (provenance) | principle | beat | how the player *does* it |
|---|---|---|---|---|---|
| 1 | the room judges before you speak | Ch.1 arrival; Logs 2026.10.18 | `C2-001` | `before` | 2-minute window, 2 of 4 questions |
| 2 | a name is the cheapest luxury | Ch.1 maître d' | `C2-002` | `names` | register minigame pre-fills from intel |
| … | | | | | |

**A main point with no "how the player does it" cell is not ready.** It is a
lecture line. Either find the action, or drop the point.

This table is also the debrief's skeleton: `choiceNotes` are rows of it, seen from
the choice side.

### 4.4 Personalisation — the five levers

Before plotting, decide which levers you are pulling. Full treatment in
[PLOT-CREATION-GUIDE.md §10](PLOT-CREATION-GUIDE.md).

| # | lever | example from ch2 |
|---|---|---|
| 1 | **naming** | 5-B; Buxoro; Abu Bakr; Oqil |
| 2 | **backstory** | olympiad champion; madrasa student |
| 3 | **dilemma** | a new teacher's credibility vs. seeing the child |
| 4 | **principle → his problem** | "specific beats generic" answers his overload-and-scale problem |
| 5 | **debrief speaks to this week** | the `ideas` tab is doable tomorrow |

Levers 1–2 are cheap; 3–5 are what make it his. **Decide 3–5 explicitly, or the
chapter will be generic no matter how good the plot is.**

### 4.5 Register check before you plot

You now have principles and points. Read them and ask: *would a real teacher say
this to another real teacher without embarrassment?* If any line sounds like a
training deck, fix it now. It is far cheaper than fixing it in 1,600 lines of
dialogue.

---

## 5. Stage 3 — plot

**Go to [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) and do not come back
until you have a `PLOT.md`.**

That guide covers the dramatic spine, the seven-move skeleton, choice design
(foldback, consequence without locks, gated choices), the information economy,
tension devices, dialogue craft, and the ending. This document will not
re-teach it — it is the centre of the work and deserves its own file.

What you must bring back from stage 3:

1. **The spine**, six lines (want · inciting · pressure · reversal · choice · residue).
2. **The beat list**, 7–10 beats, each a *change in the situation*, with the
   person or trigger that delivers it.
3. **The choice list**: every choice, what it changes (two things), and its
   verdict.
4. **The ending image**, and the debrief's argument.
5. **The plot readiness checklist**, all yes.

If the plot cannot survive the checklist, do not proceed to encoding. A weak
spine encoded well is still a weak chapter, and it is much harder to see once it
is 1,600 lines of data.

---

## 6. Stage 4 — interactions: beats, and what needs a minigame

Before writing data, decide for each beat: **what does the player physically
do?** There are only four answers, and choosing the wrong one is how chapters
become passive.

| mode | the player… | use when |
|---|---|---|
| **walk + talk** | moves to a person or zone and plays a scene | delivering information, establishing character |
| **choice** | picks one of 2–4 options that change state | the decision is the teaching moment |
| **multi** | spends a budget of questions | information has a cost |
| **minigame** | performs a small scored task | the skill/attention itself must be practised |

### 6.1 The minigame test

> **If the beat would work as a multiple-choice question, it is not a minigame.**

A minigame earns its place only if it makes the player **perform** the thing
being taught, under a constraint. Examples from the shipped games:

- **gift shop** (ch1): tests whether you listened earlier; the expensive item
  *cannot* win
- **firstNinety** (ch2): allocation under a ninety-second budget
- **complimentRun** (ch2): match the specific thing you noticed to the specific
  pupil, using intel
- **ballPlay / travelTalk** (ch1): timing, and route planning

Note what is common: **intel changes how the game plays, not just the text
around it.** That is the requirement.

> **A warning about copy-pasting from chapter 2.** `js/data/minigames/chapter2.js`
> registers **three** games, but only **two** are ever referenced by a story node
> — `registerRun` (~460 lines) is **dead code**. It passes every gate, because
> nothing checks that a registered game is reachable. See
> [MINIGAME-DESIGN-GUIDE.md](MINIGAME-DESIGN-GUIDE.md) §2 and §8.7.

**Go deeper:** [MINIGAME-DESIGN-GUIDE.md](MINIGAME-DESIGN-GUIDE.md) is the full
craft file — the host contract, the six archetypes, the five ways to wire intel
into a game mechanically, the win/lose contract, readability rules, and the
anti-patterns.

### 6.2 The interaction contract

Beats and minigames are fully specified later (§ "Step 6 — a minigame"). Before
you encode, the `INTERACTIONS.md` must state per beat:

- the mode (walk+talk / choice / multi / minigame)
- who or what delivers it (NPC with a beat-keyed `entry`, or a trigger zone)
- for a choice: the options and **what each changes** (two things)
- for a multi: the budget and what each question grants
- for a minigame: the input, the win condition, the lose condition, the intel
  that alters it, and the *proportional* consequence

### 6.3 Every beat needs a door

This is a mechanical trap worth stating early: **a beat is only advanceable
through two things — an NPC whose `entry` is keyed to that beat, or a trigger
zone for that beat.** A beat with neither cannot be reached, and the generic
playtest walker will stall on it.

Chapter 1's map between beats and NPCs lives in the *playtest harness*, not in
the data — that is why chapter 1 is not a model. **For a new chapter, key your
NPCs and give every remaining beat a trigger.**

---

---

## 7. Write the story object

Put the chapter in **new files**: `js/data/chapter3.js` and
`js/data/chapter3-learning.js`. Never edit `story.js` or `learning.js` to add a
chapter.

### 7.1 Skeleton

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

### 7.2 NPCs and triggers

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
  cannot stand there; a *trigger* may use `corridor2` — the validator exempts it.)
- `at` must be `0..5` (each anchor zone has 6 positions).
- `entry` is required and must be non-empty; a missing `entry.default` is a
  warning, not an error — but always supply one.
- Every value in `entry` must name an existing scene.
- Every trigger **must** have `zone` + `beat` + `scene`, and `once: true`
  (missing `once` is only a warning, but it is required by contract).
- Trigger `zone` must be a real map zone (or `corridor2`); `beat` must exist in
  `objectives`.
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

### 7.3 Nodes

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
      next: "mom_a2"                // see the trap below — this is NOT followed
    }
  ]
}
```

**The multi trap:** a `multi` option's `next` is **ignored by the engine**
(`dialogue.js` reads `o.next` only in `pickChoice`, never in `pickMulti`). Picking
an option grants its `intel`, applies its `effects`, records the choice id, and
returns to the same list — it never navigates. When `max` picks are made, or the
player presses ENTER, play continues at the node's own **`next`** (or
`nextAfter` / `nextFallback`). So chapter 1's `MOM_Q2.next: "mom_a2"` is dead
data: in the mother scene, 9 of 17 nodes are reachable by the engine and
`mom_a1 … mom_a4b` (8 nodes) are **not reachable at all**, because nothing else
points at them.

Worse, this is **invisible to the validators**: `validate-chapter2.js`'s orphan
scan pushes `(n.options || []).forEach(o => push(o && o.next))` for *every* node
type, so it credits multi options' `next` as a reachable edge. A new chapter with
this mistake passes the validator and silently loses those reply nodes. Chapter 2
happens not to contain a single `multi` node, which is why the gap has never
shown up.

So: do not copy chapter 1's multi pattern. Route your replies from the multi
node's `next`, and if you need per-answer replies, use a `choice` node instead —
`choice` *does* follow `o.next`. If you must use `multi` with per-option `next`,
verify reachability yourself against the engine's real edge set (a `multi` node's
only outgoing edge is its own `next`).

`max` is required and numeric (`validate-chapter2.js` errors without it).

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

### 7.4 Effects — the whole DSL

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
2 emits **114 principle references** in total (scene notes + choiceNotes + ideas +
difficulties) and needs **45 `choiceNotes`**; a chapter with 15 notes is
under-written.

Notes and journals are stamped with the beat *before* any `beat` effect in the
same list (`dialogue.js` captures `priorBeat`), so put `{ beat }` last in an
effect list if you care about the stamp.

---

## 8. Place NPCs and triggers on existing anchors

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

## 9. Write the learning object

New file `js/data/chapter3-learning.js`:

```js
window.G = window.G || {};
G.data = G.data || {};

G.data.chapter3Learning = {
  principles: { /* ONE OBJECT keyed by id — not an array */ },
  intel: { /* notebook labels for every intel id the script grants */ },
  choiceNotes: { /* one entry per option id AND per minigame choiceId */ },
  archetypes: [ /* EXACTLY 3, contiguous score bands */ ],
  ideas: [ /* 6–8 for a new chapter */ ],
  difficulties: [ /* 5–7 */ ]
};
```

**`principles` — an object keyed by id.** **6 to 10 entries.** The real rule
(`tools/validate-chapter2.js:411`) is
`if (principleIds.length < 6 || principleIds.length > 10) err(...)`. An older
version of this guide claimed "exactly six" — that was wrong; chapter 2 ships
**8**. Ids `C3-001` … `C3-00N`, **contiguous and in order** (the validator checks
`pid !== want`), each with `id, name, source, gist, atSulton[≥2], spotIt[≥2]`.
Ids must match their keys. Use your own namespace (`C3-*`) — never chapter 1's
`I-*`/`F-*`, never chapter 2's `C2-*`.

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
- **Exactly 3 archetypes** — the chapter-2 validator hard-fails on any other
  count (`if (arch.length !== 3)`), even 4. Each needs `title`, `text`,
  `watchOut` — and `watchOut` should be the *failure mode of that style*, not a
  generic warning. Chapter 1 has 5, which is why its validator is not the one to
  copy.

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

## 10. A minigame, if the chapter needs one

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

## 11. Register the chapter

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
<script src="js/data/story.js"></script>
<script src="js/data/learning.js"></script>
<script src="js/data/chapter2.js"></script>
<script src="js/data/chapter2-learning.js"></script>
<script src="js/data/chapter3.js"></script>            <!-- NEW: your story -->
<script src="js/data/chapter3-learning.js"></script>   <!-- NEW: your teaching payload -->
<script src="js/data/chapters.js"></script>            <!-- MUST stay after every story/learning file -->
<script src="js/data/minigames/gift.js"></script>
<script src="js/data/minigames/travel.js"></script>
<script src="js/data/minigames/ball.js"></script>
<script src="js/data/minigames/chapter2.js"></script>
<script src="js/data/minigames/chapter3.js"></script>  <!-- NEW: only if you wrote one -->
<script src="js/main.js"></script>                     <!-- MUST stay last -->
```

The two constraints that matter: **story/learning files must load above
`js/data/chapters.js`**, because the registry captures chapter 1's references at
load; and **`js/main.js` stays last**. A minigame file only has to load before
`main.js` — the registry stores minigame *ids*, and definitions are looked up
when a minigame node runs, so the block above puts yours after `chapters.js`
alongside the existing ones.

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

---

## 12. The full checklist

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
- [ ] Every gated option has `requires` **and** `lockedText` (missing `lockedText`
      is a warning, but treat it as an error — the player must see the reason).
- [ ] Every `requires.intel` has a label in `learning.intel`. (The chapter-2
      validator enforces the *label*. It does **not** check that the intel is ever
      granted — `validate.js` does that for chapter 1 via
      `option ... requires intel "x" that is never granted`. For a new chapter,
      check this yourself: search the script for a grant of every gate's intel.)
- [ ] Every `minigame` node has a registered `game` id. `onWin`/`onLose` missing
      is only a warning (the engine falls back to `next`), but supply both.
- [ ] Every `next`/`onWin`/`onLose` target exists.
- [ ] No node references a node in another scene.
- [ ] Every note has `principle` and a `verdict` in `good|ok|weak|bad`.
- [ ] **Exactly one** node sets `{ endMission: true }`, and it also sets a beat.
- [ ] Every scene is reachable from `opening`, an NPC `entry`, or a trigger.
- [ ] Every scene has a terminal node (`type: "end"`, or `next: null`).
- [ ] **No orphaned nodes** — every node is reachable from its scene's `start`
      **by the edges the engine actually follows**. A `multi` node's only outgoing
      edge is its own `next`; its options' `next` values are dead. Do not trust
      the validator here (see §3.3 "The multi trap").

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
- [ ] `archetypes`: **exactly 3**, contiguous non-overlapping bands covering −1…2,
      each with `title`, `text`, `watchOut`, and `requiresIntel` ids that have
      labels.
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

## 13. The gate commands

Run **in this order**, from the repository root.

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

This is the **model** for your own chapter validator — copy it and change the
data references. Verified current output on the shipped chapter 2:

```
scenes 21 / nodes 203 / options 36 / principles 8 / choiceNotes 43
ideas 8 / difficulties 7 / archetypes 3 / npcs 6 / triggers 6
```

ending in `PASSED — 0 errors, 0 warnings`.

> **Do not trust a counts block you have not just run.** The numbers above were
> measured, not recalled. An earlier version of this guide quoted
> `17 / 191 / 41 / 6 / 45 / 2` — every one of those was wrong, and a reader
> comparing their real output to a stale baseline would think their chapter was
> broken (or, worse, force it to match).

```powershell
node tools/playtest.js                       # ch1 best path
node tools/playtest.js --strategy=worst      # ch1 worst path
node tools/playtest.js --chapter=ch2         # ch2 reaches the debrief
node tools/verify-file-protocol.js           # THE contract gate: file:// boot + full mission
node tools/test-memory.js                    # save -> reload -> resume
node tools/test-chapters.js                  # both chapters play, switch, resume
node tools/probe-hero.js 1                   # hero on screen, ch1
node tools/probe-hero.js 2                   # hero on screen, ch2
node tools/audit-text.js                     # real canvas text metrics
node tools/probe-mobile.js                   # CDP touch emulation
node tools/probe-chapter-menu.js             # XULOSALAR / MENYU split
node tools/show-contract.js                  # prints the live data shapes
```

### 13.1 What each gate cannot see

This is the part that matters, and it is the part no gate prints. These are
**classes of bug that pass every existing check**, all found by inspection in the
shipped chapter 2:

| blind spot | what ships broken | how to catch it |
|---|---|---|
| **a terminal path that never sets a beat** | the HUD freezes on the previous objective and the next trigger never fires. The player is stuck with no error. | walk every path; assert each terminal ends on `exit` or `done`. See §13.2 |
| **an intel id that nothing gates on** | the player gathers a fact that changes nothing — the whole information economy is decorative | assert every granted `intel` appears in at least one `requires` |
| **a flag that is written and never read** | dead state; the scene that should branch on it silently does not | assert every `flag` in effects is read by a `requires` or a minigame |
| **a registered minigame no node references** | ~460 lines of unreachable code that passes validation | assert every registered game id appears in a `game:` node |
| **the coldest archetype band being unreachable** | the worst possible run is awarded a middle label, so the debrief flatters a bad lesson | compute the worst reachable average; assert it lands in the lowest band |
| **an important choice that records no `choiceId`** | the biggest decision never reaches the debrief's `Tanlovlar` tab and has no `choiceNotes` entry | assert every branch-defining node emits a `choice` |

**Chapter 2 fails four of these six.** They are all inherited silently by any
chapter copied from it, which is the strongest argument for writing the checks
before writing the data.

### 13.2 The two checks worth writing first

They are cheap and they catch the two defects that actually hurt a player.

**Check 1 — every terminal path sets a beat.** Walk the node graph from each
scene's `start`, carrying the current beat through each node's effects; at every
terminal (`type: "end"`, or a node with no outgoing edge) assert the carried beat
is the chapter's final beat.

```js
// sketch — adapt to your validator's sandbox
function terminalBeats(story) {
  const out = [];
  (function walk(sceneId, nodeId, beat, seen) {
    const sc = story.scenes[sceneId];
    const n = sc && sc.nodes[nodeId];
    if (!n || seen.has(nodeId)) return;
    let b = beat;
    for (const e of n.effects || []) if (e.beat) b = e.beat;
    const nexts = [];
    if (n.next) nexts.push(n.next);
    for (const o of n.options || []) if (o.next) nexts.push(o.next);
    if (n.onWin) nexts.push(n.onWin);
    if (n.onLose) nexts.push(n.onLose);
    if (n.type === "end" || nexts.length === 0) { out.push({ nodeId, beat: b }); return; }
    for (const nx of nexts) walk(sceneId, nx, b, new Set(seen).add(nodeId));
  })(sceneId, story.scenes[sceneId].start, null, new Set());
  return out;
}
```

Then fail if any terminal beat is not the final beat. **Note:** a terminal that
is not itself the mission end may legitimately hand off to another scene; in that
case assert the handoff exists rather than asserting `exit`.

**Check 2 — every intel id gates something.** Collect every `intel` granted by
any effect, option, or minigame result; collect every id named in any
`requires.intel` / `requires.intelAny`; assert the first set is a subset of the
second.

The existing `validate-chapter2.js` **already knows about this one and warns
without failing.** It prints `intel granted but not gating an option` for 14 of
chapter 2's 17 ids and still exits 0. A warning that always fires is a warning
nobody reads — in your validator, make it an error.

### 13.3 When a gate goes red

A red gate is information, not an obstacle. Do not loosen the threshold — that
has been done once in this project's history and it hid a real text-overflow
regression for weeks. Report the verbatim output.

The exception is a *stale assertion*, like `test-chapters.js` hard-coding exactly
two chapters. When you add a chapter that assertion must be updated, and you say
so in your report.

---

## 14. Common mistakes

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

**"I wrote reply nodes after a `multi` node and the player never sees them."**
Check: `multi` options' `next` is never followed — only the multi node's own
`next`. See §3.3 "The multi trap". The validator will not catch this, because its
orphan scan wrongly counts option `next` as a reachable edge for every node type.
Use a `choice` node if you need per-answer replies.

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

---

## 15. Worked mini-example — a hypothetical chapter 3

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

---

## 16. Working with subagents

A chapter is a large, parallelisable piece of work, and the project has already
been burned by concurrent edits. This section is the division of labour, the
ordering, and the merge discipline.

### 16.1 The roles

Nine roles. Not every chapter needs all nine, but every chapter needs the
research ones done before the writing ones.

| role | does | produces | writes |
|---|---|---|---|
| **brief** | stage 0: the situation this week, the question, what to avoid | `BRIEF.md` | nothing in `js/**` |
| **harvester** | mines Notion (Logs, Book insights, Ai review) | `RESEARCH-notion.md` | nothing in `js/**` |
| **biographer** | verified dossier + personalisation brief | `RESEARCH-who.md` | nothing in `js/**` |
| **situation-researcher** | web research on the real dilemma | `RESEARCH-context.md` | nothing in `js/**` |
| **distiller** | main points, 6–10 principles, the question | `POINTS.md` | nothing in `js/**` |
| **plotter** | **the plot** — spine, beats, choices, ending | `PLOT.md` | nothing in `js/**` |
| **interaction-designer** | per-beat mode, minigame specs | `INTERACTIONS.md` | nothing in `js/**` |
| **encoder** | story data, learning object, minigames, registry | the chapter | `js/data/chapterN*.js` |
| **verifier** | gates, read-through, honesty pass | a report | nothing |

### 16.2 The ordering rule

**Research strictly precedes writing. Plot strictly precedes encoding.**

```
BRIEF ─┬─ harvest ─┐
       ├─ bio ─────┼─ DISTILL ─ PLOT ─ INTERACTIONS ─ ENCODE ─ VERIFY
       └─ context ─┘
```

The three research agents can run **in parallel** — they touch different
sources and write different files. Everything after `DISTILL` is sequential.

Why the ordering is not negotiable: the single most expensive failure in this
project's history was writing 1,600 lines of chapter data around a weak idea and
then having to rewrite all of it. Encoding is the *expensive* stage. Change your
mind before it, not after.

### 16.3 Write scopes

**One writer per file. No exceptions.** Assign scopes in the task board before
work starts:

| scope | owner |
|---|---|
| `_research/**` (or the scratch dir) | each research agent, one subdirectory or one file each |
| `PLOT.md` | plotter |
| `POINTS.md` | distiller |
| `INTERACTIONS.md` | interaction-designer |
| `js/data/chapterN.js` | encoder |
| `js/data/chapterN-learning.js` | encoder |
| `js/data/minigames/chapterN.js` | encoder |
| `js/data/chapters.js` | **Lead** (registry line only) |
| `index.html` | **Lead** |
| `js/main.js` | **Lead** |
| `tools/validate-chapterN.js` | verifier |
| **all git operations** | **Lead** |

Research agents must never touch `js/**`. Encoders must never invent content
that is not in `PLOT.md` / `INTERACTIONS.md` — if the plot does not say what a
scene does, the encoder stops and reports, rather than improvising.

### 16.4 Never `git add -A`

This has actually caused a bug in this repo, twice. In-flight changes from other
agents got swept into unrelated commits, deleting files nobody intended to
delete. Stage explicit paths, review `git diff --cached`, then commit. If you are
not the Lead, do not run `git add` / `commit` / `push` at all.

### 16.5 The verifier must not be the encoder

This is not a formality. **Every vacuous-test bug in this repository was found by
someone other than the person who wrote the thing being tested:**

- `probe-distances.js` had never called `map.build()`, so its tile grid was empty
  and every walkability assertion passed for months. The probe was green while
  testing nothing. A second agent reading it caught it.
- Three NPC anchors were standing on `DESK` tiles — one of them a shipped
  chapter-1 bug (Oqil on the teacher's desk) — invisible until the tile grid was
  actually populated.
- A canvas menu's buttons were dead while looking perfect: keyboard branching
  returned before the pointer hit-test. The author could not see it because they
  only tested with the keyboard.

The encoder cannot see their own blind spots, because their mental model is what
produced the code. **Assign the verification to a different agent**, and tell it
to try to break the thing rather than confirm it.

### 16.6 The human gate before encoding

The plot is the cheapest place to change your mind and the most expensive place
to be wrong. **Show the human `PLOT.md` before anyone writes data.** One page, the
spine, the beats, the choice list. If the plot is wrong, this costs a
conversation; if it is wrong after encoding, it costs a rewrite.

The project's own history supports this: the chapter-2 corrections the user gave
(*"it also felt like really short — don't restrain from teaching many
principles"*, *"didn't take into account my personal info"*) were **plot and
content** corrections. No amount of good code fixes a plot that is not his.

### 16.7 A worked task board

```
# tasks are created first, unowned, then claimed

1. [brief]        Write BRIEF.md                          (no deps)
2. [harvest]      Mine Notion -> RESEARCH-notion.md       (no deps)
3. [bio]          Verified dossier -> RESEARCH-who.md     (no deps)
4. [context]      Web research -> RESEARCH-context.md     (no deps)
5. [distill]      POINTS.md                               (blocked by 1,2,3,4)
6. [plot]         PLOT.md                                 (blocked by 5)
7. [interactions] INTERACTIONS.md                         (blocked by 6)
8. [encode]       chapter data files                      (blocked by 7)
9. [verify]       gates + read-through                    (blocked by 8)
10. [docs]        update PROMPT-LIBRARY.md + this guide   (blocked by 9)
```

Rules of thumb:

- **research agents are launched together**, in one message, so they overlap.
- **the plotter is one agent, not three.** A plot written by committee reads
  like one.
- **the encoder is one agent per file**, and may be several agents if the files
  are disjoint — but the story file and its learning file are tightly coupled and
  should be one owner.
- **the verifier runs last and is never the encoder.**

### 16.8 What to tell a subagent

A subagent starts with no context. A brief that works has:

1. **the exact files to read first** (paths, not descriptions)
2. **the deliverable path and shape** (a file, with the section list)
3. **what it must not do** (touch `js/**`, invent facts, print the token)
4. **the evidence standard** (cite the block/page; mark UNKNOWN rather than guess)
5. **what to report back** (the few findings the Lead needs, not a transcript)

A brief that says "research hospitality and write a chapter" produces confident
garbage. The five-line structure above produces something checkable.

---

---

## 17. Where to look first

| you want… | read |
|---|---|
| the machine, the rules, the constraints | [AGENTS.md](AGENTS.md) |
| **what the chapter is about** | [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) |
| **his own requirements, verbatim** | [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) §0.1 |
| **how to make it *his*** | [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md) |
| **how to design a minigame** | [MINIGAME-DESIGN-GUIDE.md](MINIGAME-DESIGN-GUIDE.md) |
| **how to mine his Notion** | [NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md) |
| what the book actually says | [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) |
| what the user asked for, over time | [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) |
| chapter 2 — format reference, **work in progress** | `js/data/chapter2.js` |
| chapter 2's teaching payload | `js/data/chapter2-learning.js` |
| the validator to copy | `tools/validate-chapter2.js` |
| chapter 2's minigames (**`registerRun` is dead code**) | `js/data/minigames/chapter2.js` |
| the real data shapes | `node tools/show-contract.js` |
| how a scene is interpreted | `js/game/dialogue.js` (`applyEffects`, `conditionMet`) |
| how the debrief scores | `js/game/debrief.js`, `js/game/state.js` (`addNote`) |

### The guide set, and what each one owns

Five documents. They overlap deliberately at the seams, but each has one job:

| file | owns |
|---|---|
| [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) | **what happens and why it matters** — spine, skeleton, choice design, intel economy, tension, dialogue craft, ending, anti-patterns. Plus his verbatim criteria in §0.1. |
| [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md) | **making it about one man** — verified dossier, five levers, the "one fact, three treatments" technique, hard rules, the brief template, UNKNOWNs. |
| [MINIGAME-DESIGN-GUIDE.md](MINIGAME-DESIGN-GUIDE.md) | **interactions** — host contract, six archetypes, the five ways to wire intel mechanically, win/lose contract, readability, anti-patterns. |
| [NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md) | **stage-1 research** — page IDs, the mining procedure, insight→beat filter, the AI-extraction trap, citation discipline. |
| **this file** | **the pipeline and the encoding** — stages 0–6, the data contract, the gates, subagent orchestration. |

### The one-paragraph version

Write a one-page brief about the situation this week. Mine Notion and the
verified book research for material, and check his biography. Distil it into one
question and 6–10 principles written as arguments. **Then write the plot —
using [PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) — and get it approved
before writing any data.** Decide what the player physically does in each beat
and whether any of them earns a minigame. Only then encode the story object, the
learning object, the minigames, and the registry line. Run the gates, and have
someone who is not the author try to break it.

### The three things most likely to go wrong

1. **Skipping the plot.** Encoding is the expensive stage; changing your mind
   there costs a rewrite. Everything before it is cheap.
2. **A green test that tests nothing.** This repo has had two probes pass for
   months while asserting nothing (`probe-distances.js` never called
   `map.build()`). When a gate passes first time, check it can fail.
3. **A chapter that would fit any teacher.** If nothing in it is *his*, the plot
   is not finished no matter how competent it is.

---

*"Service is black and white. Hospitality is colour."*
