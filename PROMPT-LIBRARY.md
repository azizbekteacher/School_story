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

## 2026-10-22, ≈08:00 (Tashkent) — the wave: chapter 2 recreated on separate worktree and deployed on localhost:3005

> re-create chapter 2. you don't have to change everything, keep good parts
> do it on seperate worktree and deploy localhost 3005

**What it establishes, and these are the binding parts:**

- **Worktree isolation**: Developed on a separate git worktree `_ch2-worktree` on branch `recreate-chapter-2` and deployed to `http://localhost:3005/`.
- **Preserved the good parts**: Kept the 5-B classroom setting, the 45-minute lesson arc, the 6 core NPCs (Zarina, Dilnoza, Jasur, Bekzod, Nafisa, Timur), the 8 principles (`C2-001`..`C2-008`), the minigames (`firstNinety`, `complimentRun`), the "Bekzod usuli" gesture, and the 95/5 closing at the door.
- **Biographic & Notion truth restored**:
  - Replaced fabricated madrasa details ("twenty pupils, on the floor, one book") with authentic Kukaldash madrasa truth: *adab* — understanding that knowledge is a duty to serve and honor others' dignity, not an excuse for arrogance.
  - Staged the three mathematical themes from Notion `1-dars`: asking students first ("O'zlaridan so'rash"), Pavel Durov & algorithms/logical architecture, and Al-Khwarizmi/Islamic scientific heritage.
- **The information economy is now active, not decorative**:
  - Replaced write-only intel with real gated choices using `{ requires: { intel: ... }, lockedText: "..." }`.
  - Seven real gates wired: `intel_bekzod_way` (gates "Bekzod usuli" and tomorrow's challenge), `intel_jasur_joke` (gates the partnership agreement), `intel_jasur_leader` (gates Jasur's ownership of the rule), `intel_timur_bread` (gates the morning bread breakfast invite), `intel_dilnoza_explains` (gates recognizing her teaching instinct), `intel_zarina_leader` (gates acknowledging her room leadership), and `intel_nafisa_quiet` (gates the quiet 1-on-1 validation).
- **The third minigame (`registerRun`) is wired into the story**:
  - `names_start` now actively calls `registerRun` for the interactive name-learning and detail-matching exercise.
  - The pre-fill logic in `registerRun` was corrected to check the actual story intel IDs (`intel_zarina_leader`, `intel_bekzod_way`, `intel_jasur_joke`, `intel_dilnoza_explains`, `intel_timur_bread`).
- **Defects removed**:
  - Fixed Cyrillic `aytaсан` -> `aytasan`.
  - Fixed dead `P.MUTUAL ? P.MUTUAL : P.NOTICE` reference -> `P.NOTICE`.
- **What it produced**:
  - Cleaned & enhanced `js/data/chapter2.js` (220 nodes, 42 options, 3 minigames).
  - Cleaned & enhanced `js/data/chapter2-learning.js` (49 choice notes, accurate Kukaldash madrasa intel).
  - Enhanced `js/data/minigames/chapter2.js` (working multi-intel pre-fill for `registerRun`).
  - Active HTTP server on `http://localhost:3005` serving `_ch2-worktree`.
  - Both `tools/validate-chapter2.js` (0 errors, 0 warnings) and `tools/test-chapters.js` (full end-to-end play of both chapters) 100% green.

---

## 2026-10-22, ≈07:42 (Tashkent) — the wave: mining his Notion, measured rather than assumed

> Produce the definitive recipe for how a future agent mines the user's Notion
> workspace for chapter material … with exactly five sections: inventory, the
> mining procedure, a selection filter, the traps, citation discipline.

Sub-task of the 07:20 guide-set wave: the **Notion-mining** guide, the one guide
that had to be written by *actually calling the API and counting blocks* rather
than by describing what is presumably on the pages.

**What it establishes, and these are the binding parts:**

- **The book page has a header that is also a test.** `Highlight: 223; Note: 7`,
  and the reconstruction measures exactly **230 records, 223 without a note, 7
  with**. A future agent has a self-check: if your parse does not reproduce
  223 + 7, your reconstruction is wrong, and you must not quote from it. This
  replaces the previous vague "~223 highlights" with a verifiable invariant.
- **A regex for `\(.*\)` gives 14 notes, not 7.** Guidara uses parentheses too.
  Any agent that trusts the regex will attribute five of his own asides
  (`(Total cost: $0.)`, `(if you're giving a gift, it should be awesome)`) to the
  223. The seven real ones are enumerated by block index in the guide, so this is
  now a lookup, not a judgement call.
- **"One size fits one" is verified and the research file is wrong about it.** It
  is a highlight at block 587, Guidara quoting Richard Coraine. The guide records
  this as an *upgrade*. Precedent for the general rule: when a live read
  contradicts a prose file, the live read wins and the prose file gets corrected —
  the same rule `AGENTS.md` §15 already applies to the validators.
- **The black-and-white slogan stays a distillation, now with evidence:** zero
  hits in 230 records for `black and white`, `black-and-white`, `colour`,
  `Service is black and white`. It was previously "we believe this is a
  distillation"; it is now "we searched and it is not there".
- **A quotation is a block range, not a line.** The page is a Readwise export
  flattened to one paragraph per physical line, at *zero* nesting. So a citation
  is a block index plus the id of the block carrying the `▪`, and the gluing
  spaces between blocks are reconstructed rather than source. Both facts are
  written into the citation-discipline section so nobody mistakes a stitched quote
  for a verbatim one.
- **Half the Tasks database is empty, and the empty half is the tempting half.**
  Measured row by row: 5 of 12 row-pages have 0 blocks, and the largest
  (Avtobusda, 125 blocks) is a *proposal template* whose bullets are prompts to be
  filled. This is the finding that stops a chapter being planned around a
  commitment that does not exist yet.
- **Never print the token, and never put a raw dump in the repo.** The token is at
  `~/.agents/skills/notion/reference.md` (also present in `SKILL.md`, same value,
  verified by hash — the earlier claim that `SKILL.md` has none was wrong);
  dumps are `tools/_*.js` scratch, which is *not* gitignored and must be cleaned
  before reporting.

**What it produced:** [NOTION-CHAPTER-MINING.md](NOTION-CHAPTER-MINING.md), a
measured procedure with block counts for all 14 pages, the reconstruction loop,
17 verified quotations with block ids, the seven notes transcribed, a six-check
selection filter with three worked examples, and a "do not attribute this to
Guidara" list. Corrections landed in
[CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) §3.1, which had said the
book page had "nested toggles" — it has none, and that single false sentence
would have sent the next agent looking for a structure that does not exist.

**The general lesson, worth carrying past this file:** every number in this guide
was measured, and several were wrong on the first pass — the Tasks row count
(11 → 12), Avtobusda ("all placeholder" → a real quote, a real checklist and one
empty table), the Innovation page ("medium" → 6 blocks), the number of mid-word
records (13 → 28 lower-case starts, of which only two are truly mid-word), and the
token's file. Each was caught by re-running the query, not by re-reading the
prose. **A count you did not fetch this session is a guess with a number attached
to it.**

---

## 2026-10-22, ≈07:20 (Tashkent) — the wave: a guide set for building chapters, and the rule that we may ask him

> After you are done and pushed / Create a super "Chapter creation guide", I mean,
> plan updating it / When creating chapters, different subagents might:
> - personalize the story to me
> - deeply look at AI insights or bookmarks page in Notion
> - surf the web on best advices on this particular situation
> - gather main points to build the plot around
> - create interesting plot (this itself needs its "Plot creation guide", its own
>   research - bcs its the center of the chapter)
> - create mini games, interactions
> / Use multiple agents in this planning

Follow-ups, verbatim, in order:

> right, keep that in mind when creating next chapters. Work on the creation guide

> After you are done and pushed / answer this question: Where can I see the
> currently available project instructions / code, non code etc? Like all the
> different md files

> after you are done, you can use new system to recreate chapter 2

> its not necessarily rejected, just don't look at it deeply yet. there are some
> good parts in it

> don't reverse engineer chapters deeply, I didn't like chapter 2 yet

> also, the personalizing or any other agent can ask me personal questions before
> creating the chapter

**What it establishes.** This is the wave where the *process* of making a chapter
became a written, delegated, multi-agent pipeline — because the user named the
jobs himself and asked for them to be distributed across agents. Five binding
decisions came out of it, and the last two only arrived because I guessed wrong
and he corrected me.

1. **Plot is the centre, and it needs its own guide.** His parenthetical is the
   specification: *"this itself needs its 'Plot creation guide', its own research
   - bcs its the center of the chapter."* So plot is not a stage of the build; it
   is the thing everything else serves. `PLOT-CREATION-GUIDE.md` exists because he
   said so in the middle of a request about something else.
2. **The guide must be a *system*, not one document.** He listed six different
   agent jobs, three of which are research. That maps to: research → distill →
   plot → interactions → encode → verify, with a companion file per specialism.
3. **Multiple agents are expected, and they need coordination rules.** Hence the
   subagent section: nine roles, an ordering rule, disjoint write scopes, and
   "verifier is never the encoder". The failure mode this guards against already
   happened in this wave — four of five delegated agents stalled for twelve
   minutes and produced nothing.
4. **Chapter 2 is NOT the reference implementation.** This is the correction that
   mattered most. I had built both guides treating chapter 2 as the exemplar and
   started fixing its defects. He stopped me twice: *"don't reverse engineer
   chapters deeply, I didn't like chapter 2 yet"* and *"its not necessarily
   rejected, just don't look at it deeply yet. there are some good parts in it."*
   Both clauses are load-bearing. It is **not approved** (so do not hold it up as
   the standard) and it is **not worthless** (so do not throw it away). The guides
   now say: mine it for *mechanisms that demonstrably work*, and for the **data
   format**, which the validators define — but treat its plot, length, idea
   density and use of his biography as open questions.
5. **Agents may ask him personal questions.** *"the personalizing or any other
   agent can ask me personal questions before creating the chapter."* This is a
   new capability, and it inverts the old rule. It used to be *"we do not know, so
   do not guess"*; it is now **"we do not know, so ask."** Guessing stays
   forbidden. This matters because the project already shipped the opposite: a
   fabricated madrasa memory in the hero's own mouth, promoted into the notebook
   as self-knowledge, passing every gate.

**What it produced.**

- **`CHAPTER-CREATION-GUIDE.md`** — rewritten as the operating manual. 17 sections:
  the pipeline in one page, the seven stages (three of them research), the brief,
  harvesting from four sources, distilling to a teaching payload, plotting,
  interactions, the story object, NPCs and triggers, the learning object,
  minigames, registration, the full checklist, the gate commands **and what each
  gate cannot see**, common mistakes, a worked mini-example, working with
  subagents, and where to look first.
- **`PLOT-CREATION-GUIDE.md`** — new, and the centrepiece. The three questions
  (want/need/cost), the six-line dramatic spine with a worked table, Kishōtenketsu
  as an alternative to three-act, the chapter skeleton, choice design (foldback,
  consequence without locks, gated choices, the **construct-validity test**,
  delayed branching), information economy, tension without combat, dialogue
  craft, endings, a 16-item readiness checklist, 10 anti-patterns, and
  personalisation. **§0.1 now quotes his own rejection criteria verbatim** and
  translates each line into an operational requirement.
- **`PERSONALISATION-GUIDE.md`** — new. The verified dossier, the five levers, the
  **"one fact, three treatments"** technique, hard rules, a 10-question
  checklist, the brief template to fill in *before* plotting, and **§7: the
  question queue to ask him**, 12 questions marked BLOCKING / SHAPE / FLAVOUR.
- **`MINIGAME-DESIGN-GUIDE.md`** — new. The host contract with verified geometry,
  six archetypes, the "is it a minigame?" four-part test, **the five ways to wire
  intel into a game mechanically**, the win/lose contract, readability without
  assets, build order, 10 anti-patterns.
- **`NOTION-CHAPTER-MINING.md`** — new. Page-ID inventory, the six-step mining
  procedure, the 5-column insight→beat filter with worked examples, the
  AI-extraction trap, citation discipline.
- **`AGENTS.md`** — three false claims corrected (see below), the new guides
  registered in §15, and **two new standing constraints** (10: ask him; 11:
  chapter 2 is a work in progress, not a template).

**Verified corrections shipped into `AGENTS.md` — every one found by running the
code, none by reading prose.**

| claimed | actual |
|---|---|
| "Chapter 2 uses `requires.flag`" | chapter 2 has **zero** `requires` and **zero** `lockedText`. All 17 intel ids are write-only. Chapter 1 has the only three real gates. |
| "`C2-001`…`C2-006`" | it ships **eight** principles; the validator allows **6–10** |
| `validate-chapter2.js` counts `17 / 191 / 41 / 6` | actually `21 / 203 / 36 / 8` |

**Why this matters more than the guides themselves.** Three separate factual
claims about the only reference chapter sat in the project's orientation file and
were repeated into the guides. A new author would have inherited every one of
them. The rule now written into `AGENTS.md` §15: **`show-contract.js` and the
validators beat every prose file, including `AGENTS.md`.**

**Also found, and deliberately not fixed:** three real defects in
`js/data/chapter2.js` — an invented madrasa memory in the hero's mouth (`:766`,
promoted into `intel_madrasa`), the only Cyrillic in the file (`:1165`,
`aytaсан`), and a dead `P.MUTUAL` reference that always falls through (`:1243`).
Recorded in `PERSONALISATION-GUIDE.md` §8 rather than patched, because he told me
not to work on chapter 2 yet. Fixing `P.MUTUAL` and `aytaсан` would have been
zero-risk; I reverted both edits once he said to leave chapter 2 alone, and
`js/data/chapter2.js` is byte-identical to `HEAD`. **The instruction was about the
whole chapter, not just its plot.**

**The mistake worth recording.** I spent the early part of this wave
reverse-engineering chapter 2 — measuring its beats, its branching, its
archetype bands, its defects — because that is what I had done in previous waves
and the tests were green. He had to say twice that chapter 2 is not the target.
The lesson is not "measure less". It is: **when the user rejects a thing and then
asks you to build the system that will replace it, the thing is a source of parts,
not a specification.** The guide set is the deliverable; the autopsy was
scaffolding I mistook for the work.

### Follow-up: `_guide-notes/minigame-design.md` had to be written by hand

The minigame agent returned a 6 KB stub (§1 host contract + an empty §2 heading)
after a full turn, and never recovered. Rather than re-dispatch a third time I
wrote the file myself from the verified findings — archetypes, the "is it a
minigame?" test, the five intel-wiring modes, the win/lose contract, readability,
build order, anti-patterns. It became `MINIGAME-DESIGN-GUIDE.md` (588 lines).
**Recorded because the delegation failed silently**: the agent reported nothing,
the file existed, and only reading it end-to-end revealed it stopped at a stub.

### Follow-up: the minigame guide's archetype table was wrong, and a second pass caught it

Reading the shipped guide against the code a second time found four claims that
would have mis-taught the next author. All four are now fixed in
`MINIGAME-DESIGN-GUIDE.md` §2, §4 and §8:

| claimed | actual |
|---|---|
| `firstNinety` = "allocation under a budget, 90 seconds, 14 pupils" | it is a **self-framing sequence**: 3 of 6 moves, the first move sets a frame that doubles the cost of the neglected axis (`chapter2.js:181-185`), win `tw>=7 && to>=4`. The 70s/14-name allocation game is `registerRun` — the dead one. |
| `travelTalk` = "route / sequence planning" | it is a **cumulative chain**: five moments × three registers, no single answer decides, win at `trust >= 7` of 10. Nothing is sequenced. |
| every duration "30–90s" / "45–90s" | the five *reachable* games run **15–60s**. Only the unused `registerRun` has a 70s clock. A 90s target would have taught an author to ship a game twice as long as any working example. |
| `principleIds` = "optional, older key name" | it is **documentation only**. The host copies `def.principles` → `result.principleIds` (`minigames.js:92`) and **nothing reads it**; `def.principleIds` is never read at all. Teaching must travel in `notes[]`. |

Also corrected: `registerRun` is **463** lines (580→1042), not "~420/~460", and
its intel branch is inert as well as unreachable — the ids it tests
(`intel_zarina`, `intel_bekzod`, `intel_jasur`) are **never granted anywhere**;
the granted ids are `intel_zarina_leader`, `intel_bekzod_new`,
`intel_bekzod_way`, `intel_jasur_joke`, `intel_jasur_leader`. So wiring the game
without remapping the ids would leave §4.2's pattern unreachable — the guide now
says that explicitly instead of holding the dead game up as the reference.

**The durable lesson, and it is the same one as the AGENTS.md table above:** a
guide can pass every gate (it is prose; no validator reads it) and still teach
the wrong taxonomy. The archetype list was *derived by reading*, not *measured*,
and two of six entries were assigned to the wrong game. **When a guide names a
shipped example, check the example's win condition in the source, not the
guide's own summary of it.**

### Follow-up: an encoding bug that only a real check caught

`_guide-notes/part-front.md` had 77 double-encoded characters — a middle dot, em dash, right arrow,
î, and § each stored as two or three cp1252-misread bytes, re-saved as UTF-8. Two earlier
`enc.js` runs had reported "problems: none" because that checker only looked for
`\u00e2` patterns and the file had been re-saved through a Windows console
codepage in between. The repair is now a tool (`_guide-notes/repair-encoding.js`):
map chars back to cp1252 bytes and take the **shortest prefix that is valid
UTF-8**, because each damaged run is exactly one intended character. Longest-
prefix decoding swallowed the rest of the line.

**The durable lesson:** "the checker says clean" is not evidence unless the
checker was written to catch the specific defect. This project has now had that
lesson twice — a probe that passed for months without calling `map.build()`, and
an encoding check that passed on a file that was visibly broken.

### Follow-up: four defects in `MINIGAME-DESIGN-GUIDE.md` that survived its own review pass

The reference guide was written and then re-read against the code, and the
archetype table was fixed. A third pass, checking the guide's *contract* claims
line by line against `js/game/minigames.js` and `js/game/debrief.js`, found four
more. Each is a plausible-sounding sentence that contradicts the source, so each
would have been copied by the next author:

| guide says | code says |
|---|---|
| §1.2 `w: 852, h: 418, // content space` | `minigames.js:27` is `w: W, h: H` = **960, 600**. The content size is what `ctx.clip()` uses, not what `api.w` reports. Laying out from `api.w` and subtracting `(54,108)` double-corrects. |
| §1.5 `detail` "shown in the debrief" | `debrief.js` never reads `detail` — `applyMinigameResult` (`dialogue.js:107-120`) touches only `choiceId`, `effects`, `notes`. `registerRun`'s carefully built `"ismlar 5/14, …"` (`mg-chapter2.js:729`) is shown to nobody. |
| §6.2 font `'Segoe UI', system-ui, sans-serif` | zero `Segoe UI` occurrences in `js/data/minigames/`; the shipped constant is `"system-ui, sans-serif"` (`gift.js:26`, `mg-chapter2.js:40`) and §2 forbids web fonts. |
| §6.3 "Minimum 44 × 44" | the shipped minimum is **42** (`mg-chapter2.js:738, :741`). 44 is the target most elements exceed; stating it as the floor makes correct code look non-conforming. |

Also found: the guide treats the `registerRun` intel pre-fill as the model for
"reveal information", but that block tests ids the story never grants (§4.2 of
the same wave), so the pattern's only canonical example never executes.

**Two lessons.** (1) A prose guide passes every gate — no validator reads it — so
"we reviewed the guide" has to mean *checking its claims against source*, not
re-reading it for tone. Every one of these four is a sentence that reads as
authoritative. (2) The archetype table was caught by re-reading; these were
caught by **grepping the code for each claim**, which is the only method that
scales.

### Follow-up: two files are both called `chapter2.js`, and every citation in the guides was ambiguous

`js/data/chapter2.js` (the **story script**, 1,642 lines) and
`js/data/minigames/chapter2.js` (the **minigames**, 1,403 lines) share a basename
in different directories. Guides cited both as `chapter2.js:NNN`, including for
the `c2_room_cold` flag (story, `:400`) and the intel grant sites (story,
`:183/:491/:866/:1015/:1034/:1171`) — while the intel *reads* are in the minigame
file.

Both files are 1,000+ lines, so **nearly every in-range line number exists in
both**. A citation "resolves" either way and can silently point at unrelated
code: `mg-chapter2.js:400` is pupil-drawing, `story-chapter2.js:400` is the flag.
This is worse than a broken reference, because there is nothing to notice.

The authoring-depth guide now disambiguates explicitly — `mg-chapter2.js` for the
minigame file, `story-chapter2.js` for the story file, and an unprefixed
`chapter2.js` means the *minigame* file by convention — and says so in a header a
reader cannot miss.

**The durable lesson:** when two tracked files share a basename, a line-number
citation without its directory is **not a citation**. Check the path, never just
that the line exists.

## 2026-10-22, ≈07:00 (Tashkent) — the wave: Coolify documented, and three ways it can silently not serve

> explain in "C:\Users\bluep\(1d) game\AGENTS.md" that - the project's Coolify
> credentials, and other useful info

**What it establishes.** The project now has a second production target besides
GitHub Pages, and AGENTS.md §14 is the authority on it: the instance facts, the
**locations** of the credentials, and the gotchas. The important part is what the
request *implies* rather than says — the user has been deploying this game to his
own VPS and the repo's own docs never mentioned it, so anyone (human or model)
reading the repo would not know the Coolify app exists, would not know it is
already in the right project, and would re-diagnose the same four failures.

**Standing decision: credentials are referenced by location, never by value.**
The repo is public and Standing constraint 2 already forbids secrets in it. So
§14 documents *where* the Coolify token and SSH key live
(`~/.config/coolify/api_token`, `~/.ssh/coolify_localhost`) and never reproduces
them. A future model that needs the token reads the file at run time; it does not
find it in the documentation. This is the pattern for any future operator note.

**What it records as verified, not assumed.** Every gotcha in §14 was reproduced
before it was written down: the `main`-vs-`master` clone failure (`exit 128`,
"Remote branch main not found"), the frozen base64 `custom_labels` overriding
`ports_exposes` and returning 502, auto-deploy being `true` while the GitHub repo
has **zero webhooks**, and Coolify serving `tools/` + `play-stable.bat` that Pages
deliberately excludes. The `AGENTS.md` 404 was the tell that Coolify builds from
GitHub and not from disk.

**What it produced.** AGENTS.md §14 (new) and §15 renumbering; the "Where to look
first" table gained a Coolify row. No code, no config change — this wave is
documentation about production, not a change to production.

**Not done, deliberately.** The repo stays **public** (the user considered private
and reversed: "nvm, stay public for now"), and Coolify still has no webhook, so
deploys there remain manual. Both are decisions, not oversights.

---

## 2026-10-22, ≈06:51 (Tashkent) — the wave: two HUD buttons, and a chapter list you can reopen mid-game

> also, add "Xulosalar" button that does the function of current menu button.
> Current menu button should lead to the chapter list. Re-tapping the current
> chapter should show 2 buttons: "Davom etish" "Boshidan boshlash". Completed
> chapters should start from beginning if re-tapped on menu

**What it establishes.** The HUD had exactly one button, MENYU, and it opened the
coaching overview. That single button was carrying two unrelated jobs: *read what
I have learned* and *get me out of / into a chapter*. The user's request splits
them, and the split has a direction — **the reading surface keeps the old
behaviour, the navigation moves to the new one.** So `XULOSALAR` is the renamed
MENYU (same `G.debrief.openOverview()`, same four tabs, same Escape route), and
`MENYU` becomes the chapter list.

The chapter list is a new surface but not a new concept: it is the title screen's
chapter picker, available mid-game. That is the real gain — before this, changing
chapter meant reloading the page. The rules that make it safe are the user's own,
spelled out in the three sentences:

1. **Re-tapping the chapter you are in asks a question instead of guessing.**
   Two buttons, `DAVOM ETISH` and `BOSHIDAN BOSHLASH`. This is the first time the
   game has ever offered a destructive choice, so the modal is deliberate: an
   accidental tap on your own chapter must not silently erase a run.
2. **A completed chapter restarts from the beginning.** There is nothing to
   resume — a finished run's save sits on the terminal debrief — so "continue"
   would be a lie. One tap, straight to the first beat.
3. Implicitly: **completion has to outlive a single run.** This is the part that
   needed engine work, and the reason the wave is not purely UI.

**Why "completed" needed a new store.** The save file holds *one* chapter: the
run in progress. Whether a chapter was ever finished is a different fact, and it
must survive starting another chapter and starting this one fresh. It cannot live
in `G.state` either — `reset()` clears it, and `G.memory.snapshot()` lists fields
explicitly and would drop it. So completion got its own tiny record,
`sulton.progress.v1`, deliberately **outside** the save: starting a chapter from
the top must not erase the memory that you once finished it. Shape:
`{ ch1: { completed, times, at } }`. `times` is there so the menu can say
"tugatilgan · 2 marta" — replaying is not a failure, and the game should not
pretend it did not happen.

**What it produced.**

- `js/game/memory.js` — `progress()`, `markCompleted()`, `isCompleted()`,
  `clearCompleted()` over `sulton.progress.v1`. `markCompleted` is idempotent, so
  re-entering the debrief cannot inflate the count.
- `js/game/dialogue.js` — `finishMission()` records the completion *before*
  showing the debrief, so the menu is correct the instant the player can open it.
  Guarded with `if (G.memory && G.memory.markCompleted)` because the headless vm
  harnesses do not always provide it.
- `js/main.js` — two pills in the left HUD column (`XULOSALAR` 20,116 / `MENYU`
  132,116, both 104×28), the chapter overlay, and `GAME.__menu` test hooks.
  `escape` now opens the chapter list (was: the overview) — the reading surface
  is still one tap away, and Escape is the "get unstuck" key, not the "read"
  key.
- `tools/probe-chapter-menu.js` — new gate, 30 assertions in four groups
  (A the two buttons, B the two-action confirm, C restart-from-top, D safety).

**Two bugs this found, both worth remembering.**

1. **A branch that returns early cannot be click-tested.** The confirm row was
   drawn correctly and was completely dead: `updateChapterMenu` handled the
   confirm *keyboard* branch and returned before the mouse hit-test ran. The
   panel looked perfect. Fix: mouse hit-testing happens **first**, before any
   branching, because pointer input has no fallback path.
2. **Synthetic `keydown` without `keyup` fires exactly once.** `input.js` only
   sets `pressed[k]` when `!down[k]`, so a probe that dispatches bare keydowns
   advances one dialogue line and then hangs forever — and the *game* looks
   broken while the probe is the broken thing. Every key in a probe needs both
   halves.

**Standing constraint added** (see [Standing constraints](#standing-constraints)):
menu surfaces must be reachable by pointer *and* keyboard, and the two must be
tested separately.

---

## 2026-10-22, ≈06:21 (Tashkent) — the wave: a third chapter-2 minigame, "To'g'ri maqtov"

> TASK: add ONE new minigame to `js/data/minigames/chapter2.js`, appended at the
> end of the file (do not modify the two existing registrations `firstNinety` and
> `registerRun` — another process depends on them byte-for-byte).
> Register it with id: `complimentRun`
> THE GAME: "To'g'ri maqtov" — giving the right compliment to the right pupil.
> …the book's rule is that a compliment must be *specific and true*, not generic.

**What it establishes.** The "I could give active students compliments" line from
the chapter-2 rewrite is now a mechanic, not a line of dialogue. The rule the
game enforces is Guidara's, applied to a classroom: *a compliment is a fact about
a person, said at the moment it is true.* Four pupils, four pieces of intel, and
in every round exactly one of four lines is specific-and-true. The three wrong
kinds are named, because naming them is the teaching:

- **generic** — "Barakalla, juda yaxshi." True of everyone, therefore of no one.
- **flattering-but-false** — claims something the pupil knows is untrue
  ("sen hech qachon xato qilmaysan" to the girl who stayed behind to fix an error).
- **backhanded** — "yaxshi, hech bo'lmasa bir marta urinib ko'rding."

Scoring: 3-4 specific compliments is a win; one generic line among the wins
downgrades it. This is the chapter-2 principle split in mechanical form —
`C2-004` (service is the rule, colour is the reason) and `C2-005` (the moment it
breaks is the impression), reused rather than given new ids.

**What it produced.** ~455 appended lines in `js/data/minigames/chapter2.js`, no
deletions (verified: `git diff --numstat` = `455 0`, one hunk at EOF). Three
choice ids with full string literals so the validator's regex sees them:
`CH2_MG_COMPLIMENT_BEST` / `_OK` / `_WRONG`. Wins grant `intel_compliment`.

**Standing decisions this wave made, worth keeping:**

- **A mis-click must not skip the lesson.** During the feedback beat only the
  feedback panel itself advances the round; a stray click does nothing. The
  sentence explaining *why* a line was wrong is the content — it is not allowed to
  be dismissible by accident.
- **Append, never rewrite.** A sibling process was rewriting
  `js/data/chapter2-learning.js` and the story file the whole time. Anchoring the
  `edit` on the file's final `})();` and verifying `455 0` afterwards is the
  pattern for adding to a file another agent owns.
- **The three ids failing `validate-chapter2.js` is expected, not a regression.**
  The validator requires a `choiceNotes` entry per minigame choice id and the
  learning file is being rewritten by someone else. Do not edit
  `chapter2-learning.js` to silence it; report the failure verbatim.

---

## 2026-10-22, ≈06:17 (Tashkent) — the wave: the shop, the borders, the centring, and chapter 2 rewritten from the book

> move Sardor aka's shop on above the school. make it smallar, give the shop a
> more "shoppy" look
> When on desktop there are two thick brown borders on right and left of game UI.
> Make game UI fully cover the screen
> the messages, option texts are being pulled to the left of their box, leaving
> them. Make it align center, like as before
> all chapters should be playable without completing the previous ones
> [chapter 2] I didn't like it, like, at all
> It doesn't have genuine ideas - like really profound ideas, either from
> internet or Unreasonable Hospitality book on giving best impression. it needs
> strong ideas
> it didn't use almost none of the ideas from Unreasonable Hospitality book -
> like connecting with them, giving them small gifts, learning about them, giving
> personalized attention - it felt like it didn't look at Notion nor web on that
> book's insights
> it also didn't take into account my personal info - I was regional chempion of
> olympiad in Bukhara - the strongest region in uzb on math. I studied madrasa -
> really interesting place
> I could give active students compliments
> the agent needs to deeply learn the book - and teach it to me
> it also felt like really short - don't restrain from teaching many principles
> Also make classroom bigger - both in size and in assets: blcakboard, mini
> gifts, teacher table, flowers - it should really feel like a classroom - bcs
> most of my time will be spent there
> The chapter story should also be legendary - like the reader should feel "Wow,
> this guy nailed the first lesson" when completing the chapter. it should really
> feel like a really good fiction

**What it establishes.** Four separate things, and only one of them is polish.

1. **The presentation corrections are real bugs, not taste.** The brown side bars
   were the letterboxed `#stage` (`width: min(100vw,160vh)`) letting the page
   background show through on wide monitors. The left-pulled text was the
   `ctx.textAlign` stickiness trap showing up for the *fifth* time — centring had
   been happening by inheritance, so any surface that set `align="left"` and did
   not reset it dragged dialogue text off its box. Fix the cause, not the symptom:
   **centring must be explicit at every draw site that assumes it.**
2. **"All chapters playable without completing the previous ones" is already
   true in the code and must stay true.** There are no unlock flags and no
   carry-over state; `G.chapters.playableFromStart(id)` exists precisely so a
   future chapter cannot introduce a lock. This is a standing constraint now, and
   it needs a *test*, not a claim.
3. **Chapter 2's problem was depth, and the user named the source of depth
   themselves: the book, Notion, and his own life.** "It doesn't have genuine
   ideas" is not a request for more scenes — it is a request for *fewer, heavier*
   ideas that a teacher could actually use on Monday. The verbatim line that
   should guide every future chapter rewrite is: **"the agent needs to deeply
   learn the book - and teach it to me."** Studying the source is not preparation
   for writing the chapter; it *is* the chapter.
4. **His biography is content, not decoration.** Regional olympiad champion in
   **Bukhara** — the strongest maths region in Uzbekistan — and a **madrasa**
   student, a place where the teacher knew every name from the first day. Both
   are dramatically useful: the olympiad medal is the *temptation* (prove yourself
   in ten seconds), the madrasa is the *alternative* (be known before you
   perform). A chapter that does not make him choose between those two is not
   about him.
5. **"I could give active students compliments"** is the user handing over a
   mechanic. Specific, observed praise is the cheapest hospitality in a classroom
   and the one he most wanted to practise; it became a minigame, not a paragraph.

**What "legendary" means, concretely.** The bar is *"the reader should feel 'Wow,
this guy nailed the first lesson'"* — so the chapter must be winnable in a way
that feels earned, must end on a moment worth retelling, and must be built so the
impressive move and the hospitable move are **never the same move**. Every beat is
a fork: be excellent at maths, or excellent at people.

**Produced.**

- **Chapter 2 rewritten from scratch** — `js/data/chapter2.js`, a ten-beat
  first lesson (8:52 to 9:45): corridor intel-gathering before the bell, the door,
  the first ninety seconds, names, the agreement, the olympiad temptation, the
  torn page, the last ten minutes, the exit. Six pupils, each with a beat-keyed
  entry and a distinct need.
- **`js/data/chapter2-learning.js` rewritten** — eight principles `C2-001`…
  `C2-008` mapped to verified book material: the verdict is reached before you
  speak · a name is the smallest unit of hospitality · somebody's job is to
  notice (the Dreamweaver) · one size fits one · specific beats generic · the
  gesture nobody asked for (the $2 hot dog, systemised) · the last minute is the
  impression they keep · the enemy is "reasonable".
- **A `complimentRun` minigame** — four pupils, specific-vs-generic praise,
  grants `intel_compliment`. This is the "I could give active students
  compliments" line turned into something playable.
- **A verified research report** — `UNREASONABLE-HOSPITALITY-RESEARCH.md`, plus a
  Notion extraction of the user's own 1,215 book highlights and the 48-insight
  "Ai review" page. Every principle now cites a real chapter of the real book.
- **CSS**: `#stage` fills the viewport; `body` background is the page's own warm
  black instead of a gradient that read as bars.
- **`js/game/dialogue.js`**: five explicit `textAlign` sites (body, narration
  label, choice prompt, choice option, multi option).
- **`AGENTS.md` §0** — the PROMPT-LIBRARY rule, hard-coded at the top of the
  file, because *this* is the wave where it was forgotten again.

**The mistake this wave records, so it stops repeating.** The rule was written
into `AGENTS.md` and into the standing constraints, and then the very first
turn after writing it again shipped code without touching this file. The user
had to say *"prompt librar still didt change"*. The lesson is not "remember
harder" — it is that a rule stated in prose loses to a rule checked by a
command. The check is now in `AGENTS.md` §0 as a copy-pasteable one-liner, and
the correct trigger is **before writing the final summary**, not after.

**Design decisions worth not re-litigating.**

- **The chapter does not say the theme out loud.** It stages it, then the debrief
  shows the bill. That is the engine's whole point and chapter 1 already does it.
- **The olympiad credential must be withholdable.** A version where he simply
  mentions it and everyone is impressed teaches nothing. The strong choice is to
  mention it *and redirect it* — "this gave me nothing; one teacher gave me
  something, she knew my name on day one".
- **"Legendary" is earned by a callback, not by stakes.** The moment that makes
  the chapter land is Bekzod's method written on the board under his own name —
  and the exit choice is whether he wipes it off. Cheap, small, and the exact
  thing Guidara says about the hot dog: the cost is irrelevant, the specificity
  is everything.
- **Every beat needs a trigger or a beat-keyed NPC**, because the generic
  playtest walker only advances the mission through those two doors. This is a
  hard engineering constraint on any future chapter rewrite, not a style note.

## 2026-10-22, ≈04:45 (Tashkent) — the wave: ship it, account for it, and make it playable on a phone

> First, create a plan.
> Connect this project to github, repository: School_story , github details are in
> C:\Users\bluep\Tilsevar-V2 - my other project. Use that github account
> Also add account creation process via google. I want to use it via Cloudflare
> workers. it should remember my account and data. Account creation and memory
> details are also in Tilsevar-V2 folder
> This game should also be played in mobile
> Create AGENTS.md for future models, with essential details
> Create chapter-creation-guide md for future models.
> Make each chapter playable from get-go
> Move mini map to further right, so that it doesn't cover the playable area
> Add copy button to every message
> Add "Xulosalar" tab on menu. It should just describe the insight on existing
> interactions. its the whole point of chapter: what insights does the chapter
> want to teach. Such as "O'ta akademik bo'lmaslik" "Birgalikda mashg'ulot
> qilish" paired with definitions, in uzbek. Make whole menu uzbek.
> Add menu button on top left, which is the current overview window shown at
> chapter end
> IN Menu, add "Qaydlar" tab to add, edit notes
> in chapter 1 - Make Nodira opa and shop closer to the school

**What it establishes.** This is the first turn that treats the project as a
*product* rather than a prototype. Four of the eleven items are distribution and
durability (GitHub, accounts + cloud save, mobile, docs for future models), one
is a structural promise (every chapter playable from the start), and the rest
are UX corrections that all point the same way: **the player must be able to see
and revisit what the chapter taught.** `Xulosalar` is the clearest statement of
intent in the whole file — *"its the whole point of chapter: what insights does
the chapter want to teach"*. The menu is not a settings screen; it is the
syllabus.

**Decisions taken (asked and answered):** repo **public**; accounts as a
**Cloudflare Worker + D1** with the Google ID token verified **server-side**
(not trusting the browser); **responsive web + touch controls**, no PWA and no
native wrapper. `Tilsevar-V2` was the reference for both the GitHub account and
the Google flow — but note its sign-in is Firebase Auth, so no Worker exists
there to copy; the Worker was built fresh.

**Produced.** `AGENTS.md` and `CHAPTER-CREATION-GUIDE.md`; the repo at
`github.com/azizbekteacher/School_story` deployed to Pages; `worker/` (Google
ID-token verification with WebCrypto RS256, D1 `users`/`sessions`/`saves`,
hashed session tokens in HttpOnly cookies) with an 87-assertion test suite; the
menu rebuilt in Uzbek with **Xulosalar** and **Qaydlar**; a MENYU button that
opens the debrief overview at any time; copy buttons on every message; the
minimap moved off the play area; touch controls; and the chapter-1 shop moved
from a 56-tile trek to a 23-tile walk.

**The judgment call worth remembering.** Chapter 1 was moved anyway — the user
had previously said *"Chapter 1 doesn't need editing"*, and this request
contradicts it. The resolution is that the earlier rule protects the chapter's
**logic and script**, while this asks for a **map-geometry** change that is
data-only and provable by a probe. Both hold: the chapter's story was not
touched, and the map change is covered by `tools/probe-distances.js`. When a
fixed-point rule meets a new explicit request, the rule narrows to what it was
actually protecting.

### Follow-up to the same wave: the correction that mattered

> you are forgetting to update prompt library

**What it establishes.** A standing rule, and an unusually direct one: **the
library is part of the deliverable, not documentation written afterwards.** When
a wave lands, the file that records *why* it landed is updated in the same
breath. It is the one artefact the user checks by name, which makes it the
truest signal of whether a model treated the project as a system or as a diff.

The practical consequence: when a turn is finished, the last step is always
`PROMPT-LIBRARY.md` (and `AGENTS.md` for anything a future model must not
rediscover). Leaving it stale is treated as the work being incomplete.

**What the follow-up found and fixed.** Writing the entry honestly forced a
re-audit, and the re-audit is what surfaced the real defects:

- **`audit-text.js` was red — 60 overflow — and it was my own map change that
  turned it red.** The temptation was to widen the threshold; the honest read was
  that a player can see the problem. Chasing it found **five** `textAlign` bugs
  of the same shape (a draw function assuming `"left"` while an earlier surface
  left `"center"`, so text centred on an explicit left margin and hung off the
  panel) in `quest.js`, `dialogue.js` and `debrief.js`, plus a real one in
  `world.js` where an NPC name tag was cut in half at the screen edge. Fixed at
  the cause; audit green on all ten surfaces.
- **`multi` had never routed to its answers.** Chapter 1's mother scene asked two
  questions and skipped both replies: four nodes dead, and the intel they were
  meant to teach granted by accident. The validators missed it because their
  orphan scan counts an option's `next` as an edge, so the answers *looked*
  reachable. This is the strongest argument in the file for probes that **play**
  a scene rather than analyse it statically.
- **A new state field was silently dropped from the save.** `memory.js` builds
  the save by listing fields explicitly, so `userNotes` was written by the state
  layer, validated by `restore()`, and never actually persisted. Two places to
  touch, and only one was obvious.

**Produced.** This follow-up entry; `AGENTS.md` corrected where it had gone
stale (it still described the account client as a no-op stub and the text audit
as permanently red); `tools/probe-multi.js`, `tools/probe-multi-next.js` and
`tools/check-menu.js` as new gates; and a green run of all seventeen.

**The lesson worth keeping.** Every one of those three defects was invisible to
the gates that existed when the wave "shipped". A green suite is evidence about
the things it already checks, and nothing about the rest. The follow-up was
cheaper than the user finding them.

---

## 2026-10-22T04:29:12+05:00

> chapter 1 was working fine - now it is not showing the hero, the camera stuck
> on top left corner.
> Just revert that to previous state. Chpater 1 doesn't need editing
> Be faster

**What it establishes:** Three things, all binding.

- **Chapter 1 is finished and must not be disturbed.** When new work breaks it,
  the fix is to revert, not to re-engineer chapter 1. Existing, working content
  is a fixed point, not a draft. (The map-geometry request of 04:45 narrows this
  to the chapter's *script and logic* — the walk being shorter is a data change
  the user asked for explicitly, and it is proven by a probe.)
- **Report regressions in player terms** — "the hero is not showing", "the
  camera is stuck" — and expect them to be believed immediately over the code's
  apparent correctness. The logic looked right; the *spawn override* was the
  cause, and it only ever needed to apply to new chapters.
- **"Be faster."** Prefer the direct fix over exhaustive diagnosis when the
  regression is already described. Verify with the narrowest test that proves
  the reported symptom is gone (here: is the hero inside the viewport?), then run
  the full suite once.

**Produced:** Guarded the chapter spawn override so it no longer touches
chapter 1; `tools/probe-hero.js`, which asserts the hero's *screen* position is
inside the 960x600 viewport (chapter 1: 336,302; chapter 2: 480,301 —
centred). Full suite re-run green, chapter 2 committed.

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
8. **Every chapter is playable from the start.** No unlock flags, no
   prerequisites, no carry-over state. A chapter may not gate another one.
9. **The repo is public.** Config a browser legitimately needs (a Google OAuth
   client id) may be committed. Server secrets never: they live in Cloudflare via
   `wrangler secret put`, and `.dev.vars` never leaves the machine.
10. **The account layer is optional.** The game must behave identically with no
    network, no sign-in and no Worker. Signing in adds memory across devices; it
    must never become a requirement to play.
11. **`PROMPT-LIBRARY.md` is finished work, not follow-up work.** Update it in the
    same turn a wave lands. The user checks this file by name; a stale library
    means the turn is not done. **This rule is hard-coded as `AGENTS.md` §0**, at
    the top of the file rather than in a list, because stating it in prose twice
    was not enough — it was still skipped twice. The enforcement is a command, run
    before writing any final summary:

    ```powershell
    Select-String -Path PROMPT-LIBRARY.md -Pattern '^## ' | Select-Object -First 3
    ```

    If the top hit is not this wave, stop and write the entry first.
12. **Every menu surface works by pointer *and* by keyboard, and both are
    tested separately.** The HUD is canvas-drawn, so a menu can look completely
    correct and be untouchable: the chapter-list confirm buttons were drawn,
    hovered and highlighted while being entirely dead, because the update
    function hit a keyboard branch that `return`ed before the mouse hit-test
    ran. Two rules follow. (a) In an overlay's update function, hit-test the
    pointer **before** branching on keys — pointer input has no second route
    into the surface. (b) A probe that dispatches a synthetic `keydown` without a
    matching `keyup` fires **once** and then goes dead (`input.js` sets
    `pressed[k]` only when `!down[k]`), so keyboard paths must be driven with
    both halves or the probe will report the game broken when the probe is.
12. **A green suite is not a passing grade.** Every defect this wave shipped had
    a green run behind it. When a gate is red, fix the cause; when a surface has
    no gate, write one that *plays* the thing (a probe) rather than only reading
    the data (a validator).

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
- **Report regressions in player terms** — "the hero is not showing", "the
  camera is stuck" — and expect them to be believed immediately over the code's
  apparent correctness. The logic looked right; the *spawn override* was the
  cause, and it only ever needed to apply to new chapters.
- **"Be faster."** Prefer the direct fix over exhaustive diagnosis when the
  regression is already described. Verify with the narrowest test that proves
  the reported symptom is gone (here: is the hero inside the viewport?), then run
  the full suite once.

**Produced:** Guarded the chapter spawn override so it no longer touches
chapter 1; `tools/probe-hero.js`, which asserts the hero's *screen* position is
inside the 960x600 viewport (chapter 1: 336,302; chapter 2: 480,301 —
centred). Full suite re-run green, chapter 2 committed.