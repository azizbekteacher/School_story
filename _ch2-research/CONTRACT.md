# CH2 RECREATION — BINDING CONTRACT

The Lead owns `js/data/chapter2.js`. Do not edit it. This file is the single
source of truth for ids; if you need something not listed here, ask the Lead.

## Why we are recreating it (user's words)

> "it still doesn't feel like taken from the book. after he entered the class,
> and called 2 students, it immediately moved to question giving. 'Birinchi 90
> soniya' - then nothing else coming up. some dialogs with students but not next
> step appearing. Also, he should not hurry to give them exercises: he should
> first introduce himself, introduce how the subject is useful and can be fun,
> get to know students and interesting facts about them, announce what gifts they
> will be getting if they answer correct to the exercises - so much to be done
> before moving to formal work."

> "Dialogs with students leading to nothing - weird. The personalization game,
> introducing myself were good - but not showing up in new version ... Build a
> tension more, the plot should be very interesting ... Every story will have bad
> beginning, unexpected clever action by hero, interesting experiences, turning
> over the atmosphere, interesting characters."

So: same chapter id (`ch2`), same file paths, same 6 pupils, same 3-line brief.
New order of events: he sets up the room BEFORE any formal work.

## The 10 beats, in order (validator allows 7-10)

| # | beat | objective (<=34 chars) | what happens |
|---|---|---|---|
| 1 | `before` | `Koridorda: ikki daqiqa` | corridor, 8:52. Gather intel, budget 2 of 4. UNCHANGED in shape. |
| 2 | `door` | `Eshikni oching` | the threshold. Cold. Jasur blocks the door. 3 ways in. |
| 3 | `open` | `Birinchi 90 soniya` | INSIDE. Board already written. Greet by name. minigame `firstNinety`. |
| 4 | `intro` | `O'zingizni tanishtiring` | he introduces himself — verified facts only. Zarina asks about the certificate. |
| 5 | `hook` | `Bitta savol, javobsiz` | why maths is useful + fun: ONE hard question, no method. The room argues. |
| 6 | `names` | `O'n to'rt ism, o'n to'rt fakt` | one fact per pupil. minigame `cardRun`. INTEL PAYS OFF HERE. |
| 7 | `gift` | `Sovg'a va'da qilindi` | he announces the gifts — then discovers the shortage. TENSION. |
| 8 | `wobble` | `Kimning oldiga borasiz?` | foldback: six `wob_*` scenes, one per pupil. |
| 9 | `exit` | `Koridorga chiqing` | last five minutes: THEY say the summary. The turn. |
| 10 | `done` | `Birinchi dars tugadi` | endMission (exactly one node in the file) |

## Scene ids (all under `scenes`)

`intro` (beat before), `door` (door), `ninety_start` (open), `intro_start`
(intro), `hook_start` (hook), `names_start` (names), `gift_start` (gift),
`wobble_start` (wobble), `wob_zarina`, `wob_dilnoza`, `wob_jasur`,
`wob_nafisa`, `wob_bekzod`, `wob_timur`, `exit_start` (exit), plus six NPC
default scenes: `zarina_default`, `dilnoza_default`, `jasur_default`,
`nafisa_default`, `bekzod_default`, `timur_default`.

## Triggers (classroom unless noted) — every beat after `door` must be reachable

```
{ zone:"classroom", beat:"door",   scene:"door",         once:true }
{ zone:"classroom", beat:"open",   scene:"ninety_start", once:true }
{ zone:"classroom", beat:"intro",  scene:"intro_start",  once:true }
{ zone:"classroom", beat:"hook",   scene:"hook_start",   once:true }
{ zone:"classroom", beat:"gift",   scene:"gift_start",   once:true }
{ zone:"classroom", beat:"wobble", scene:"wobble_start", once:true }
{ zone:"corridor",  beat:"exit",   scene:"exit_start",   once:true }
```
`names` and `hook` are ALSO reachable via NPC beat-keyed entries, so the generic
walker in `tools/playtest.js` can advance them.

## INTEL — the economy must have gates this time

Ch2 shipped with ZERO `requires` gates and 17 write-only intel ids. That is
explicitly a defect. Every intel id below must be (a) granted somewhere and
(b) read by at least one `requires` or by `chapter2-learning.js`.

Corridor (`intro` multi, max 2, 4 options):
- `intel_dilnoza_explains`
- `intel_timur_bread`
- `intel_bekzod_new`
- `intel_jasur_joke`

Granted later:
- `intel_named_two` (door), `intel_names_method` (names), `intel_bekzod_way`
  (gift), `intel_rule_reason` (hook), `intel_madrasa` (intro, redirect branch
  only), `intel_compliment` (gift), `intel_bekzod_named` (names),
  `intel_zarina_leader` (hook), `intel_zarina_leads` (wobble),
  `intel_jasur_leader` (door), `intel_nafisa_quiet` (names),
  `intel_bekzod_tomorrow` (wobble), `intel_timur_alone` (gift).

REQUIRED GATES (at least 3, with `lockedText`). Suggested:
- `names_start`: one option `requires: { intel: "intel_jasur_joke" }` — you know
  his humour, so you can defuse him by name.
- `gift_start`: one option `requires: { intel: "intel_bekzod_new" }` — you know
  Bekzod is new, so the shortage resolves in his favour.
- `hook_start` or `wobble_start`: one option `requires: { intel: "intel_dilnoza_explains" }`.

## Option id prefixes (must be unique, all start `CH2_`)

`CH2_Q_*` corridor multi · `CH2_DR_*` door · `CH2_IN_*` intro · `CH2_HK_*` hook ·
`CH2_NM_*` names · `CH2_GF_*` gift · `CH2_WZ_*` wobble choice ·
`CH2_WD/WJ/WN/WB/WT_*` per-pupil foldback · `CH2_EX_*` exit.

Minigame choiceIds come from `js/data/minigames/chapter2.js` and are also
`CH2_MG_*`. The Lead will tell you the exact list once games are settled.

## Principles — `C2-001` … `C2-008` (exactly 8, contiguous from C2-001)

Book-grounded only. Cite `UNREASONABLE-HOSPITALITY-RESEARCH.md` and
`NOTION-CHAPTER-MINING.md`; do not attribute a distillation to Guidara.
`C2-001` is "one size fits one" — verified in the Notion highlights but it is
**Richard Coraine's** phrase, quoted by Guidara. Attribute accordingly.

## The three minigames

1. `firstNinety` — EXISTING id, reworked content. Mechanism kept: self-framing
   sequence, choose 3 of 6 moves; `warm`/`order` axes; win `tw>=7 && to>=4`.
   New content: the five PGD components (greet by name at threshold,
   pre-corrective statement, structured task already ready, quiet word to a
   struggling pupil, behaviour-specific praise).
2. `cardRun` — NEW id (replaces the dead `registerRun`, 463 lines, referenced by
   no node — that is the "personalisation game ... not showing up"). One fact per
   pupil; the player allocates limited attention across 14 pupils and must use
   the intel he actually has.
3. `giftRun` — reworked from `complimentRun` (mechanism kept: match against
   intel). "One size fits one": match the right small gift to the right pupil.

Each must end with `notes: [{ principle, text, verdict }]` because **teaching
travels in `notes[]` only** — `detail` is never shown, `principleIds` is never
read. Content space is 852x418; `api.mouse` is 960x600 (subtract 54,108).

## Style

Uzbek, warm/plain/adult, no exclamation marks, ASCII apostrophes (`o'`, `g'`).
Body text <= 180 chars (median 117, p90 162, hard cap 204). No invented
biography: verified facts only. If a fact is not verified, do not use it.
