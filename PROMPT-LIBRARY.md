# Prompt library

These are the prompts that set direction — the ones that define what this project
is, not the ones that just said "continue". Newest first.

**Why this file exists.** Each entry records not only what was asked but what it
*reveals about the intent*, so a future model (or a future me) can pick this up
without guessing. If you are working on this project, read this before making
design decisions. The standing constraints near the bottom are binding.

**How to add an entry.** Newest at the top, under the same heading pattern.
Quote the request exactly as written, including typos. Then say what it changes.
Never put credentials, tokens or workspace secrets in this file.

---

## 2026-10-22, ≈03:40 (Tashkent) — *timestamp not sampled*

> you yourself be done with coloring - it doesn't matter much, move on to next tasks

**What it establishes:** Polish is not the point; the *teaching* is. When a task
is cosmetic and good enough, stop and spend the remaining effort on substance.
This is a signal about priority ordering: **content and clarity over visual
finish**.

**Produced:** Stopped the palette work mid-verification (it was already applied
and green) and moved to save/resume, the git tree, and this file.

---

## 2026-10-22, ≈03:30 (Tashkent) — *timestamp not sampled*

> the plot for the chapter 2 should be entirely about first lesson at class -
> how he gives great first impression to pupils

**What it establishes:** The scope correction. Chapter 2 is *not* another day of
school — it is **one lesson**, tightly focused on first impressions. This shows
a preference for **depth over breadth**: given a choice between covering more
ground and going deeper on one thing, choose depth. The whole chapter should be
usable as a single answer to one question.

**Produced:** Re-briefed the Chapter 2 author with the scope locked to the
classroom and the lesson only — no gate, no mother, no shop, no report.

---

## 2026-10-22T03:27:51+05:00

> create subagent now for chapter 2: it needs to be about how Azizbek gives great
> first impression on his first ever lesson to students

**What it establishes:** Wants parallel execution and does not need to review the
approach first. Gives the *subject* and trusts the implementation. Notice the
framing — **"how Azizbek gives"** — not "what happens". The deliverable is a
demonstration of a technique, wrapped in story, not a story with a lesson bolted
on.

**Produced:** Spawned the Chapter 2 authoring subagent with the full engine
contract, a required self-validator, and an explicit write scope.

---

## 2026-10-22T03:06:33+05:00

> go on.
> also, liked chapter 1
> Start chapter 2

**What it establishes:** Chapter 1 is **approved**, which is important — the
style, length, register and difficulty of Chapter 1 are the reference standard
for everything that follows. "Start chapter 2" means chapters are a real,
continuing structure, not a one-off. The brevity also shows trust in the
existing direction; no course correction was requested.

**Produced:** Chapter 2 work begun; Chapter 1 committed as the `stable-ch1`
tag so it stays playable.

---

## 2026-10-22T02:54:49+05:00

> game's good, playing on index.html
> Now
> 1. Create a memory.md file that actively edits current positions
> 2. Future index html files use to load up memory, so that I can play from last pos.
> 3. Create local git tree - so that I can play last version while new version being built
> 4. Make design a bit more lightly colored, too dark didn't like
> 5. Hero is looking left when I am moving right. Fix
> 6. Also create "Prompt library" md where all my strategically-valuable prompts
>    (design, story choices ... not simple commands like "go on") are stored with
>    timastamp, newest first - so that you and future models understand my vision

**What it establishes:** The most informative prompt in the project so far.

- **"playing on index.html"** — the delivery mechanism is confirmed correct.
  Double-click, no server, no build. Keep it that way.
- **"actively edits current positions"** — persistence must be *live*, not a
  manual export. "Current positions" means the hero's actual coordinates, not
  just progress flags.
- **"Future index html files use to load up memory"** — forward compatibility is
  a requirement. The save format must survive future versions of the game.
- **"play last version while new version being built"** — they want to keep
  playing while work continues. A stable/branching workflow as a *first-class*
  need, not a nice-to-have.
- **"too dark didn't like"** — taste signal. The Bukhara dusk palette read as
  gloomy. Wants daylight and warmth.
- **"Hero is looking left when I am moving right"** — reported as a bug the way
  a player notices it, without diagnosis. Trust the player's report over the
  code's apparent correctness: the logic looked right and the *art* was wrong.
- **The prompt library itself** — they want their reasoning externalised and
  preserved. This is a **durable-artifact mindset**: build things that outlive
  the conversation. And the exclusion of "simple commands like go on" shows they
  distinguish *intent* from *instruction*.

**Produced:** `memory.md` + `memory.js` + `js/game/memory.js` (three-layer save),
`play-stable.bat` (git worktree of the verified tag), the daylight palette pass,
the hero profile-sprite rewrite, and this file.

---

## Earlier this session, before 02:54 — *exact time not captured*

> can you see my Notion
> … Sulton School workspace?
> in skills, erase all other workspace references, I only want to work on
> Sulton School workspace

**What it establishes:** **Sulton School is the only workspace that matters.**
Every other workspace (Oxdord LC, Yetakchi, Almazz) is explicitly out of scope
and was removed from the skill. Do not reintroduce them. This is a hard boundary,
not a preference.

**Produced:** Rewrote `~/.agents/skills/notion/{SKILL.md,reference.md,examples.md}`
scoped to Sulton School only; verified zero residue of the other workspaces.

---

## Earlier this session, before 02:54 — *exact time not captured*

> Now you know me, what I do, what I want to do at school / I want to apply
> principles from Unreasonable Hospitality / You need to create simple design,
> top down 2d game to teach me those principles / It will be gta-like adventure
> game, missions, places to go, things to do / The hero will have missions
> (talking to a child, talking to his mother, going to get a gift, playing with
> him, touring with him, so on) - based on preferences of student and
> instructions of parent. / Now create first mission / Use multiple subagents /
> it needs to genuinely give me ideas on how that particular principle is
> applied, what difficulties one might face when implementing it, what is
> different ways to implement it - ideas / The mission should be genuinely
> engaging, story-rich where hero goes from one place to another, makes
> decisions, talks to people, plays a mini game that shows how that principle is
> applied ( like choosing a gift from shop or travelling with student bonding
> with him)

**What it establishes:** The founding brief. Everything here is binding.

- **"simple design"** — the visual bar is deliberate simplicity, not fidelity.
- **"gta-like adventure"** — a world you move around in, places, missions. Not a
  menu, not a visual novel.
- **"based on preferences of student and instructions of parent"** — the core
  mechanic. The hero acts on **intel gathered from other people**. That is why
  the game gates choices on `intel` and why knowing a child loves football makes
  a minigame easier and a gift choice succeed. This is the spine of the design.
- **"genuinely give me ideas … what difficulties one might face … what is
  different ways to implement it"** — three distinct deliverables, all about
  transfer to real life. Ideas, obstacles, and *alternatives*. Not a summary of
  the book.
- **"genuinely engaging, story-rich"** — the word *genuinely* appears twice.
  Real human detail, not filler. This is the quality bar that Chapter 1 was
  judged against.
- **"plays a mini game that shows how that principle is applied"** — minigames
  must *demonstrate*, not decorate. The gift shop is a test of whether you
  listened; the football game gets easier if you did.

**Produced:** Chapter 1 — "Birinchi kun" — `SPEC.md`, the engine, 10 scenes,
119 nodes, 3 minigames, and the debrief that carries the teaching content.

---

## Standing constraints

These hold across every prompt above and are not renegotiated per task.

1. **Runs by double-clicking `index.html`.** No build step, no npm, no server,
   no network, no external assets, no ES modules. Anything that breaks this is
   wrong regardless of how good it looks.
2. **Sulton School only.** Never reference or write to the other Notion
   workspaces. No tokens or secrets in the repo or in this file.
3. **Teaching content must transfer to a real classroom.** The user is a real
   maths teacher starting at Sulton School. Ideas must be doable on a Monday,
   with real obstacles named honestly — including the uncomfortable ones
   (no time, colleagues reading it as showing off, parents suspicious of a new
   male teacher).
4. **The player is trusted.** Report a bug the way it appears; fix the cause, not
   the symptom, and verify with a real browser.
5. **Keep the stable version playable.** Commit and tag before structural change.
6. **Depth over breadth.** One principle taught properly beats five mentioned.
7. **Uzbek for the game, mixed English/Uzbek for the teaching content.** Match
   the existing register: warm, plain, adult, no exclamation-mark cheerfulness.

---

## 2026-10-22T04:29:12+05:00

> chapter 1 was working fine - now it is not showing the hero, the camera stuck
> on top left corner.
> Just revert that to previous state. Chpater 1 doesn't need editing
> Be faster

**What it establishes:** Three things, all binding.

- **Chapter 1 is finished and must not be disturbed.** When new work breaks it,
  the fix is to revert, not to re-engineer chapter 1. Existing, working content
  is a fixed point, not a draft.
- **Report regressions in player terms** � "the hero is not showing", "the
  camera is stuck" � and expect them to be believed immediately over the code's
  apparent correctness. The logic looked right; the *spawn override* was the
  cause, and it only ever needed to apply to new chapters.
- **"Be faster."** Prefer the direct fix over exhaustive diagnosis when the
  regression is already described. Verify with the narrowest test that proves
  the reported symptom is gone (here: is the hero inside the viewport?), then run
  the full suite once.

**Produced:** Guarded the chapter spawn override so it no longer touches
chapter 1; `tools/probe-hero.js`, which asserts the hero's *screen* position is
inside the 960x600 viewport (chapter 1: 336,302; chapter 2: 480,301 �
centred). Full suite re-run green, chapter 2 committed.