# Birinchi kun — Unreasonable Hospitality

A small top-down 2D adventure game that teaches **one** principle of *Unreasonable Hospitality* by making you live through it.

You are **Azizbek**, a new maths teacher at Sulton School. It is your first day. Over one school day you talk to the deputy head, an exhausted colleague, a mother at the gate, a boy called Timur, and the man in the corner shop. You buy a gift, walk a boy home, and report back to his mother.

Nothing you do is scored as "correct". Everything you do is remembered.

---

## Play it

**Double-click `index.html`.** That is the whole install.

No server, no build step, no npm, no network. It runs from `file://` in any modern browser.

### Controls

| Key | Action |
|---|---|
| `W A S D` / arrows | walk |
| `E` / `Space` | talk, advance, interact |
| `1`–`4` or `↑ ↓` + `Enter` | pick a dialogue option |
| `Space` | strike the ball / continue |
| `TAB` | notebook (what you learned, what you chose, principles met) |
| `Esc` | close notebook |

The debrief at the end has four tabs: `Natija` (result), `Tanlovlar` (your choices), `G'oyalar` (things you could do Monday), `Qiyinchiliklar` (why they are hard).

---

## The one principle

> **Service is black and white. Hospitality is colour.**
> Thoughtfulness beats luxury.

Service is the timetable, the test, the mark in the register. It is real and it is measurable. Hospitality is the specific, noticed, unmeasurable thing on top: the detail you knew about one child, the sentence at the gate, the walk home, the gift that cost nothing.

The game never says this. It stages it, then shows you the bill.

### How the design teaches it

Every choice is tagged with a principle and a verdict (`good`, `ok`, `weak`, `bad`). The verdict is not about being nice — it is about **whether you knew enough to act specifically**.

- Ask the mother what her son loves *(good: you now have intel)*
- Buy the expensive boots *(bad: money instead of knowledge)*
- Open the lesson with football *(good: same maths, different door)*
- Call a silent boy to the board *(bad: you used him to keep the room)*

The gift minigame makes the point mechanically: **the expensive item always fails.** The boots cost 480 000 so'm and cannot win. The empty box with a ribbon costs nothing and is the strongest ending in the game. What you put inside it is what you learned about him earlier — the intel you gathered from his mother, from Oqil, from watching him.

So the gift is a **test of whether you listened**, not a test of whether you can afford things.

---

## Structure

One mission, ten beats, five characters, three minigames.

```
arrive → staffroom → oqil → mother → lesson → timur → gift → walk → report → done
```

| Beat | Place | What happens |
|---|---|---|
| `arrive` | gate | opening; you know nobody |
| `staffroom` | staff office | **Abu Bakr**: timetable, and a question about what the school is *for* |
| `oqil` | staff office | **Oqil**: seven lessons a day, and a verdict on Timur you can accept or question |
| `mother` | gate | **Nodira opa**: two minutes, two questions — choose them carefully |
| `lesson` | classroom | first lesson with 5-B: how do you open? |
| `timur` | classroom | **Timur**: you may only say something you actually earned the right to say |
| `gift` | shop | **Sardor aka** + the gift minigame |
| `walk` | street → yard | the walk home (conversation minigame) + football (timing minigame) |
| `report` | gate | back to Nodira opa: what do you tell her? |

### The three minigames

1. **Gift shop** — browse four items, choose one. Which items can win depends on the intel you collected earlier. The expensive item can never win.
2. **The walk home** — five moments on the way home; at each one you choose a line. Every moment offers a teacher-trap ("what did you get on the test?") and a way to follow the boy's lead. Trust moves; below 7 he stays guarded.
3. **Football** — a timing bar, five kicks, three hits to win. Knowing he loves football makes the marker slower and the target wider: **knowledge literally makes the game easier.**

### The gate

Choices are gated on intel. At the classroom you are offered three specific opening lines, and each is only available if you learned the matching fact earlier:

- mention his football boots → needs `intel_football` (from his mother)
- mention the two weeks he was ill → needs `intel_sick` (from his mother)
- mention the drawings in the margin → needs `intel_quiet` (from his mother)

If you never asked, the option is shown **locked**, with the reason: *"buni bilish uchun avval so'rash kerak edi."* You see the door you failed to open. That is the lesson.

---

## What you get at the end

The debrief adapts to how you played. It will show:

- **An archetype** — one of five, from *"The listener — siz bolani ko'rdingiz"* (you saw the child) to *"The technician — dars bo'ldi, uchrashuv bo'lmadi"* (the lesson happened, the meeting didn't). Each has a `watchOut` describing the failure mode of *that* style.
- **Principle scores** — six principles, good vs bad tallies.
- **Choice feedback** — for each decision: what it cost, why it mattered, and a sharper alternative you could have said instead.
- **10 concrete ideas** — each with *what*, **three concrete ways to actually do it**, the effort and cost, and the specific reason it usually fails.
- **8 difficulties** — the real obstacles, including the uncomfortable ones: no time and that is not an excuse, colleagues read it as showing off, parents are suspicious of a new male teacher walking a boy home, and nobody can put "he looked at me differently" into a report.

The ideas are written to be usable the Monday after you play. Coffee with Oqil. Five minutes at the door. One handwritten sentence in the margin. A pre-stocked drawer so a gesture takes twenty seconds instead of a trip to the bazaar.

---

## Files

```
index.html                  the shell; fixed script order, no modules
css/style.css               warm Bukhara palette
js/core/util.js             clamp, lerp, dist, hash, wrapText, roundRect, rng
js/core/input.js            keyboard + pointer, logical coordinate mapping
js/core/audio.js            fully synthesised WebAudio — no sound files
js/core/render.js           characters, panels, bubbles, progress bars
js/world/map.js             tile map, zones, anchors, collision
js/world/world.js           camera, movement, NPC instances, drawing
js/game/state.js            flags, intel, trust, beat, notes, journal, scores
js/game/minigames.js        minigame host: overlay, input routing, finish contract
js/game/dialogue.js         scene interpreter, effects, gating, typewriter
js/game/notebook.js         TAB overlay — intel / journal / principles
js/game/quest.js            HUD, minimap, zone triggers, interaction
js/game/debrief.js          the teaching payoff, four tabs
js/game/debug.js            test bridge (harmless in play, used by tools/)
js/data/story.js            the mission script — scenes, nodes, effects, NPCs
js/data/learning.js         6 principles, 44 choice notes, 5 archetypes,
                            10 ideas, 8 difficulties
js/data/minigames/*.js      gift.js, travel.js, ball.js
tools/                      validators, headless playtests, screenshot + text audits
```

### Data-driven by design

The engine is a small interpreter. `js/data/story.js` is pure data: scenes of typed nodes (`say`, `choice`, `multi`, `minigame`, `end`) with an effect list.

```js
effects: [
  { beat: "oqil" },                                    // advance the mission
  { intel: "intel_football" },                         // learn a fact
  { trust: 2 },                                        // move the meter
  { note: { principle: "I-028", verdict: "good",
            text: "..." } },                           // teaching moment
  { journal: "..." }, { objective: "..." }, { endMission: true }
]
```

Adding a scene or a mission is a data edit, not a code change.

---

## Verification

The repository ships its own checks. Run them with Node (only needed for development — the game itself has no dependencies).

```bash
node tools/validate.js                  # contract check: ids, scenes, coverage
node tools/playtest.js                  # headless best-path playthrough
node tools/playtest.js --strategy=worst # worst-path playthrough
node tools/playtest.js --strategy=random
node tools/audit-text.js                # real canvas metrics: text overflow
node tools/shots.js                     # headless screenshots → tools/shots/
node tools/verify-file-protocol.js      # boots and completes from file://
```

Current state:

| Check | Result |
|---|---|
| `validate.js` | PASSED — 0 errors, 0 warnings |
| best / worst / random playthroughs | all reach `done` → debrief, 0 exceptions |
| trust spread across paths | 8 (best) / 1 (random) / 0 (worst) |
| `audit-text.js` | PASSED — 0 overflow across 10 surfaces, 0 runtime errors |
| screenshots | 13 frames, all distinct, warm palette |
| `file://` double-click | PASSED — boots and completes the mission |

**Content coverage:** 10 scenes, 119 nodes, 21 story choice ids, all 21 documented (0 missing, 0 orphaned), 44 choice notes total, 3 minigames, 10 beats, 30 concrete "how" steps across 10 ideas, 8 difficulties, 5 archetypes.

---

## Notes

- **Language:** the game is in Uzbek. The *teaching* content in the debrief mixes Uzbek (scene text, notes, headings) and English (archetype descriptions, choice explanations, ideas) — deliberately, so it doubles as reading practice and stays usable for a teacher who reads both.
- **No assets.** Every pixel is canvas drawing and every sound is WebAudio synthesis. There is nothing to lose or forget.
- **Deterministic.** No randomness in outcomes; the same choices always give the same result. Randomness is only used for dust particles and typewriter sound.
- **Accessibility-ish:** all dialogue is skippable by pressing `E`/`Space` (first press completes the typewriter, second advances), and there is no timing pressure outside the football minigame.

---

*"Service is black and white. Hospitality is colour."*
