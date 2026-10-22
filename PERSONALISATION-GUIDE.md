# Personalisation — how to write a chapter for one man

> **Read this as a technique, not an endorsement.** The worked example below
> dissects chapter 2 because it is the only chapter that uses his biography at
> all — but chapter 2 is a **work in progress**. The user said of an earlier
> version "I didn't like it, like, at all", and of the current one "I didn't
> like chapter 2 yet", while also noting **"there are some good parts in it."**
>
> So mine §3 for the *technique* (one fact, three treatments, verified
> separately below), which is sound and worth copying. Do not conclude that
> chapter 2's execution is the target; where it is weak, §3 says so — including
> a fabricated madrasa memory that must be replaced with verified material.


For any chapter, including a **recreation of chapter 2**. Corrects and expands
[PLOT-CREATION-GUIDE.md](PLOT-CREATION-GUIDE.md) §10.

**Why this file exists.** Chapter 2 as first written was rejected in his words:

> it also didn't take into account my personal info - I was regional chempion of
> olympiad in Bukhara - the strongest region in uzb on math. I studied madrasa -
> really interesting place

*(PROMPT-LIBRARY.md:197-199, verbatim, his spelling)*

Not "add a detail about me" — **take what actually happened to me and make the
chapter depend on it.** ✓ = re-verified in the repo while writing this. N = from
Notion (*Umumiy ma'lumotlar*, *Logs*, *Role/Workload plan*, *Fast English*), **not**
re-checked here: re-confirm before it reaches a page.

---

## 1. Verified dossier

| Status | Means | Build on it? |
|---|---|---|
| **C-P** ✓ | **CONFIRMED** — his own words, verbatim in PROMPT-LIBRARY.md | Yes |
| **C-N** N | **CONFIRMED** — stated by him in Notion | Yes, if re-checked |
| **G** ✓ | **INVENTED** — game canon: an author made it up and it shipped | Continuity only; **never** re-assert as biography |
| **I** | **INFERRED** — plausible reading, never stated by him | Only as labelled fiction |
| **U** | **UNKNOWN** — §7 | **No.** Ask |

*(The brief asks for CONFIRMED / INFERRED / UNKNOWN. C-P and C-N are both CONFIRMED and
are kept apart only because a Notion number may have drifted since it was read; G is the
category that did not exist and needed inventing, because "invented but shipped" is a
different thing from "inferred", and confusing the two is how §1.2 happened.)*

**The trap: G drifts into C by repetition.** Four load-bearing "biography" facts in
chapter 2 are G, not biography — the madrasa interior, 5-B/14 pupils, Abu Bakr's
title, and the two named branches (last four rows of §1.1).

### 1.1 The dossier

| Fact | Where verified | Status |
|---|---|---|
| **Azizbek Zubaydullayev**, maths teacher, **Sulton School**, Tashkent | *Umumiy ma'lumotlar*; AGENTS.md §1 ✓ | C-N |
| Joined from MyPro; terms **19 Oct 2026**; starts **Sat 24 Oct 2026** (genuinely a Saturday — checked) | *Logs* 10.18/10.20; *Role plan* | C-N |
| **Bukhara regional olympiad champion** | PROMPT-LIBRARY:197 ✓; Notion adds "9th grade" (N) | C-P / C-N |
| **Bukhara = strongest maths region in Uzbekistan**, and it matters to him | PROMPT-LIBRARY:197 ✓ | C-P |
| Studied at **Kukaldash madrasa** — "a really interesting place" | PROMPT-LIBRARY:199 ✓; Notion N | C-N / C-P |
| **IELTS 7.5** (Reading 8.5); English since 2019, 7 yrs, 2000+ students | *Umumiy ma'lumotlar*; *Fast English* (numbers N) | C-N |
| Own product **Fast English**: 90-day Starter→B1, 800 pp, 650k so'm/mo | *Fast English*. N | C-N |
| **"Buxorolik bo'lganim uchun qattiqqo'lman"** — strict because from Bukhara | *Fast English* → "Jonli dars". N | C-N |
| Learns by volume: one month of graded stories took him Elementary→Upper-Int | *Fast English*. N | C-N |
| Manager **Abu Bakr**: ex-Yuksalish (14 branches), open-minded, plans branches, offered a podcast (no date) | *Logs* 10.18. N | C-N |
| **Oqil**: maths teacher, **schoolmate**, **fellow olympiad competitor**, **invited him to Sulton** | *Logs* 10.18. N | C-N |
| Oqil's day — **7 classes + 2h break + 3h extra** — is the **anti-pattern** | *Role plan*; `story.js:268` ✓ | C-N |
| Wants **~3 classes/day + protected innovation time** negotiated **before** the timetable is fixed; **30-day pilot** + weekly review | *Role plan*. N | C-N |
| Wants to **"completely revolutionize the school"** — never *announced*; earned by one result | *Umumiy*, *Extra info* 10.22. N | C-N |
| Self-rule: **credibility through maths first**, then one or two problems | *Logs* 10.18/10.21. N | C-N |
| **Class 5-B**, its **sinf rahbari**, **14 pupils** | `SPEC.md:45,420`; `story.js:48,53,75`; `chapter2.js:65` ✓ | **G — never in Notion** |
| Abu Bakr's title **"Direktor o'rinbosari"** | `story.js:38` ✓ (Notion says *rahbar/manager*) | **G — invented title, real person** |
| Next year's branches **"Buxoro markazida va G'ijduvonda"** | `story.js:214` ✓ (Notion: "yangi filiallar" only) | **G** |
| Madrasa: **no desks, on the floor, ~20 pupils, one book, teacher knew every name day one** | `chapter2.js:667` ✓, `:766` ✓ (hero's mouth), `chapter2-learning.js:218` ✓ | **G — AND THIS IS THE PROBLEM** |

### 1.2 The defect that must not spread

The hero says, as a memory of his own:

> «Pola o'tirardik. Yigirma kishi, bitta kitob, va ustoz hammamizni ism bilan
> chaqirardi.» — `chapter2.js:766` ✓

and it is promoted into `intel_madrasa` (`chapter2-learning.js:218` ✓), so the
notebook now states it as something he knows about himself. Verified: he studied at
a madrasa and found it interesting. **Not verified: the desks, the floor, the twenty
pupils, the book, the names.**

1. **A verified fact is not a licence to furnish its interior.** "Studied at a
   madrasa" is a container; every concrete noun added inside it is a new claim.
2. **It was fabricated for a structural reason** — the technique needs a humble
   counter-fact and there wasn't one, so one was invented. The fix is procedural:
   **the counter-fact must be verified before plotting, or the option cannot exist.**

**Unused and free:** IELTS/English career, Fast English, "qattiqqo'lman", the 30-day
pilot, the protected-time negotiation, and **24 Oct 2026** — the game shipped on the
22nd. The player is being written for a man who has not yet walked in.

---

## 2. The five levers, surface → deep

Levers 1–2 are cheap; always use them. **3–5 are what make a chapter his.** A chapter
with only 1–2 is the draft that got rejected.

**1 · Naming.** `Sulton School`, `5-B`, `Abu Bakr`, `Oqil` — in `title`, `subtitle`,
`brief`, `npcs[].name`, first narration. Real: `chapter2.js:58` ✓ `"Birinchi dars:
5-B"` / `"Sulton School — 8:52, qirq besh daqiqa"`. Two proper nouns and a clock beat
a paragraph.
*Failure:* personalisation that is only a name — delete it; if nothing is lost it was
decoration. Or naming a real person then writing words they never said (§1.1,
"Direktor o'rinbosari").

**2 · Backstory.** The fact arrives as something he *has*, with the cost attached.
Real: `chapter2.js:64-68` ✓ — *"Sizda bitta guvohnoma bor…"* then *"Uni ko'rsatish
oson. Ishlatmaslik qiyin."* Line 2 is biography; line 3 turns it into plot by making
it **already loaded**.
*Failure:* **the résumé** — credential mentioned, everyone impressed; a boast with a
dialogue box. Test: does it create a **temptation** or a **liability**? Second: true
but **inert** — colours a scene, changes no choice.

**3 · Dilemma.** A `choice` where both options are doable on Monday and one is
institutionally risky; a colleague would recognise the fork, not just the theme.
Real: `story.js:152-199` ✓ — Abu Bakr offers 18 h/week (*"jadval hali qotib
qolmagan"*); `ABQ_3` is his real position near-verbatim (*"Men 3 darsdan ko'proq o'ta
olmayman…"*, :193) and is scored **weak**, because `abq_r3b` answers *"Avval shu
yerda o'zingizni ko'rsating."* His own self-rule ("credibility through maths first",
§1.1) turned into a cost — **the
best lever-3 moment in the repo and almost nobody notices it.**
*Failure:* **intellectual hospitality** — a problem the player cannot act on. "How
should Sulton systemise innovation?" is an essay; "Do you raise the timetable in hour
one, or after a result?" is a dilemma. Worse: **resolving a negotiation that is
open**. A chapter where Abu Bakr grants three classes and a pilot is a lie about the
future.

**4 · Principle answering a problem he raised.** `atSulton`/`spotIt` written against
his stated problem, plus a minigame that makes the answer physical. Real: his line
*"I could give active students compliments"* (PROMPT-LIBRARY:200 ✓) became
`complimentRun` — four pupils, four intel, three wrong kinds named (generic,
flattering-but-false, backhanded). **The mechanic is his sentence.**
*Failure:* the principle answers a problem *you* invented. Test: quote the sentence
where he raised it. If it came from the book it is teaching — fine — but do not call
it personalisation. Second: the minigame that quizzes; if it works as multiple choice
it has demonstrated nothing.

**5 · Debrief speaks to a decision he makes this week.** Not scene text: `ideas[]`,
`difficulties[]`, `watchOut` — the only surface addressing him as a professional.
Real: `chapter2-learning.js:654-774` keeps the uncomfortable ones (no time, warmth
read as showing off, parents wary, warmth exhausts); `arch-showman` (:633 ✓) — *"wins
the first day and wears out by the second month."*
*Failure:* **flattery** (the game's own rule is specific-beats-generic); **words in
his mouth** (rule 7); ideas Monday-doable for a *generic* teacher.

| Lever | Strength | Cost to author |
|---|---|---|
| 1 Naming | low, necessary | minutes |
| 2 Backstory | medium | one verified fact + a cost |
| 3 Dilemma | **high** | you must know his week |
| 4 Principle → his problem | **high** | you must have his sentence |
| 5 Debrief → this week | **highest** | honesty about money, time, colleagues |

---

## 3. THE WORKED EXAMPLE — olympiad as temptation, madrasa as alternative

Chapter 2's `task` beat rests on two facts: the olympiad (C-P/C-N) and the madrasa
(C-N, with invented interior). The staging, verified beat by beat:

| # | Beat | What it does |
|---|---|---|
| 1 | `brief[1]` `:66` ✓ | **Fact as possession.** True before the player moves. No scene, no choice. |
| 2 | `tk_1` `:655-659` ✓ | **Restated as *his*.** Narration supplies the C-P superlative: *"Buxoro — respublikada matematika bo'yicha eng kuchli viloyat"* (:657). This is what makes the credential feel big to *him*, not to a generic hero. |
| 3 | `tk_2` `:660-664` ✓ | **Temptation named out loud:** *"Buni bir gapda aytish mumkin. O'n soniya… Bu ishlaydi."* The chapter admits the cheap move works — so refusing it costs something. Without this the choice is free and therefore fake. |
| 4 | `tk_3` `:665-669` ✓ | **The counter-fact — the hinge.** *"Shuningdek: madrasada o'qiganman."* A humbler fact from the same life, right after the strong one, explicitly contrasted: *"Buxoroda matematikani o'rgatishgan — lekin madrasada odamni tanishtirishgan."* **Without it the only options are boast or hide, and hiding is boring.** |
| 5 | `tk_q` `:670-709` ✓ | **Three treatments of one fact**, not good/neutral/bad. `CH2_TK_1` withhold + hand the work over · `CH2_TK_2` show, then redirect into the madrasa · `CH2_TK_3` show and solve the hardest example yourself. Prompt: *"Guvohnomani nima qilasiz?"* |
| 6 | `:674-707` ✓ | **Priced asymmetrically.** withhold → trust **+1**, notes `C2-001`/`C2-008`, flag `_withheld`; the note praises the *harder half* (:680). redirect → trust **+2**, `C2-002`/`C2-003`, **`intel_madrasa`**, flag `_redirected` — **the only branch that gives the class something**. perform → trust **+1**, `C2-008`/`C2-004`, flag `_shown`. Doing nothing and doing too much both score 1. |
| 7 | `tk_r1/r2/r3` `:711-799` ✓ | **Witnessed.** `r1`: the class goes quiet, then pencils work. `r2`: a pupil asks about the madrasa, the room leans in; the answer is the fabricated quotation (:766). `r3`: Jasur asks *"Ustoz, siz buni qanday bilasiz?"* and the answer changes nothing. A private score is a lesson nobody sees. |
| 8 | `tk_mg` `:721` ✓ | **Foldback** — all three branches converge on `complimentRun`. The cost is paid in trust, notes, flags, tone — never a dead end. |
| 9 | `ex_q` `:1453-1486` ✓ | **Residue in a different object.** Stand at the door with names (`good`) · wipe the board (`weak`) · "ertaga davom etamiz" (`ok`). The credential is never mentioned again. What survives is **"Bekzod usuli"** — written at `:920` ✓, named as the thing not to erase (`:1473` ✓, `:1515` ✓, journal `:1522` ✓). **The ending image is not the medal. It is a child's name, in chalk, still there tomorrow.** |
| 10 | `chapter2-learning.js:373-396` ✓ | **Teaching lands in the debrief.** `CH2_TK_2`'s `alternative` (:379 ✓) teaches the redirect even to a player who chose to hide. |

**(a) The flags are almost all inert — but exactly one is not, and that one is the
lesson.** `c2_credential_*` (`:682,694,705` ✓) are read nowhere, and `chapter2.js`
has **zero** `requires` (verified: 0 hits). I then audited all **18** distinct `c2_*`
flags against all **26** `.js` files under `js/`: **17 are write-only, 1 is read.**

| flag | set at | read at | effect |
|---|---|---|---|
| `c2_room_cold` | `chapter2.js:400` ✓ | `minigames/chapter2.js:596` ✓ | the names minigame starts the player **one trust lower** |

That single live flag is the most instructive thing in the chapter and the pattern
chapter 3 should copy. It is not a gate and not a lock — it is a **carried price**: a
bad first ninety seconds makes the *next* minigame harder, and the player feels it as
difficulty instead of reading it as text. That is "personalisation with a cost"
expressed mechanically, and it is the one place chapter 2 delivers it.

So a biography beat earns weight from trust, notes and the debrief, not from gating.
But if you want lever 2 **structural**, give the fact a downstream consumer the way
`c2_room_cold` has one — a starting condition on a later minigame, a `wob_*` scene, a
flag-chosen `watchOut`. Chapter 3 should have one.

**(b) A second inert mechanic, and it is a lever-1 warning.** The names minigame was
built to reward pre-bell intel: `js/data/minigames/chapter2.js:608-620` ✓ checks
`intel_zarina`, `intel_bekzod` and `intel_jasur` and pre-fills those three names if
present. **None of the three is ever granted anywhere in the project** — each string
appears exactly once, at that read. Chapter 2 grants `intel_zarina_leader`,
`intel_bekzod_new` and `intel_jasur_joke` instead: different ids. So the reward path
is unreachable and the minigame can never pay off the gathering the chapter made the
player do.

That is *the personalisation that is only a name* — committed in code rather than in
prose: a naming mechanic that looks wired to his chapter and is inert. **When you
build a lever-1 or lever-2 payoff, grep the id you check and confirm something grants
it.** A one-line audit before shipping would have caught it.

**(c) One `endMission` node** (`:1579-1585` ✓, `ex_done`), reached by every exit; the
word appears twice because of the comment at `:1576` — a grep count of 2 is not two
endings.

### 3.1 The repeatable technique — one fact, three treatments

> Take one strong **verified** fact. State it as something he owns. Name the cheap
> way to use it **out loud**, so the player feels the pull. Place beside it a second,
> humbler, **verified** fact from the same life. Offer three treatments — perform,
> withhold, redirect into the humble one — and make **the redirect the only one that
> gives something away**. Witness every outcome in front of people. Fold all three
> back. Let the debrief name the cost and teach the redirect to whoever missed it.

**Six steps from biography fact → choice with a cost:**

1. **Find the fact's *use*, not its pride.** What could he *do* with it in a room in
   thirty seconds? The olympiad's use is prestige — hence a temptation.
2. **State the use out loud and let it work.** If using it would not land, the choice
   is fake. `tk_2` says *"Bu ishlaydi"* — and the class reacts.
3. **Find the counter-fact: same life, humbler, verified.** This is the step that
   failed. No counter-fact ⇒ only boast-or-hide ⇒ **cut the option, do not invent
   one.** Fallback needing no biography: an observed fact from the scene —
   *"Bekzod, sen bugun o'z usulingni aytding"* (`:859` ✓) redirects the credential
   into a pupil's work, the move chapter 2 found for its ending and could have used
   in the choice.
4. **Write three *uses*, not three morals** — all ways to handle the *same true
   thing*, or the player picks a personality instead of making a decision.
5. **Price it asymmetrically.** Two defensible; the best costs something real. Never
   a straw man.
6. **Pay in the right currency, leave a different object.** Cost = trust + notes +
   witnessed reaction. Residue = a name in chalk, not the medal.

---

## 4. Hard rules

1. **Never invent a biographical fact.** Not in §1.1 with a source ⇒ not on the page.
2. **Never invent the details *inside* a verified fact** — the madrasa interior is
   spoken by the hero (`chapter2.js:766` ✓). See §1.2.
3. **Never make him a wish-fulfilment hero.** The wrong choice must be reasonable and
   *his*; a straw man flatters with a decision that could not be lost.
4. **Personalisation never replaces the teaching.** The principle is the point; the
   biography is the situation.
5. **Real colleagues get dignity and no invented words.** **Abu Bakr** may be
   demanding, busy, hard to read — never obstructive, foolish, or the obstacle; his
   **title must not be invented**. **Oqil** invited him here, is his schoolmate and
   fellow olympiad competitor; his overloaded schedule is the **anti-pattern**, not
   his character — tired, not cynical; sceptical, not a villain. Neither is humiliated
   so the hero looks good, and the hero never wins an argument at his expense.
6. **His faith and madrasa are treated with respect, never as novelty.** No comic
   beat, no exotic detail, no music cue, not a metaphor for discipline. Do not
   attribute religious practice — he said he *studied* there.
7. **Never put words in his mouth in the debrief.** It may say *"siz shunday
   qildingiz"* and what it cost; not what he thought or felt.
8. **No real student names** unless he gives them. The six `pupil_*` NPCs
   (`chapter2.js:70-84` ✓ — Zarina, Dilnoza, Jasur, Nafisa, Bekzod, Timur) plus
   `Nodira opa` are invented. Fine as fiction; never presented as his class.
9. **Aspirations are not duties.** Never stage him being *given* Tarbiya, systems,
   English or innovation — the record says these are intentions Abu Bakr may not
   even know about (§1.1).
10. **Do not let the game win an argument he has not won.** Timetable, protected time
    and the 30-day pilot are open as of 22 Oct 2026. Stage the *asking* (ch1 does,
    and scores the early ask weak); never the *granting*.
11. **Do not resolve a relationship he has not resolved** — the podcast offer is an
    offer with no date.
12. **Do not use his English career as a superiority prop, or invent its stigma.**
    "The English guy teaching maths" is **I** — do not stage colleagues dismissing
    him for it.
13. **No flattery, anywhere** — `note`, archetype, `journal`, `brief`. `C2-005`
    applies to the game's voice *about him*.
14. **The failure must be survivable.** The classroom gives tomorrow; the game must
    too.
15. **Do not put a real name on an invented fact** — titles, branch locations
    (§1.1), schedules, opinions. Verify, or use a role.
16. **Do not use his life to make a point about Uzbekistan.** Regional pride and the
    madrasa are his material, not local colour.
17. **When in doubt, ask — ship nothing rather than something false.** A gap is
    recoverable; a false memory in the hero's mouth survives every gate, because the
    validators check structure, never truth.

---

## 5. The 10-question checklist

Any "no" is a rewrite, not a polish.

1. **Would this fit any teacher?** The test he applied implicitly. If another maths
   teacher could star unchanged, lever 3 is missing.
2. **Does the biography fact carry a cost, or only prestige?** (*"Uni ko'rsatish
   oson. Ishlatmaslik qiyin."*)
3. **Is every assertion traceable to §1.1 — and free of invented interior detail?**
4. **Is the wrong choice reasonable, and is it his?** Otherwise it is a trap.
5. **Would the principle still be worth teaching if the hero were someone else?** If
   not, biography is carrying the chapter.
6. **Can you quote the sentence where he raised this problem?** If not, it is
   teaching but not personalisation — fine, if not labelled as such.
7. **Are Abu Bakr and Oqil recognisable from the record, with no invented words,
   titles or decisions?**
8. **Would he read the madrasa scene aloud to a colleague without flinching?**
9. **Does the debrief address a decision he makes this week — without telling him
   what he feels?**
10. **Is anything resolved that is actually open**, or is any line flattering?

**The five-part conjunction he actually applied** (PROMPT-LIBRARY:189-208 ✓):

| His words | The test |
|---|---|
| *"It doesn't have genuine ideas"* | An idea deep enough to change how he teaches on Monday? |
| *"didn't use almost none of the ideas from Unreasonable Hospitality"* | Every principle traceable to verified book material, not a vibe? |
| *"didn't take into account my personal info"* | Does the chapter **depend** on a verified fact about him? |
| *"felt like really short"* | One principle taught properly, not five mentioned. |
| *"make classroom bigger… should really feel like a classroom"* | Does the room he will live in feel real? |

Bar from the same wave: *"the reader should feel 'Wow, this guy nailed the first
lesson'"* — earned by a **callback** (a name left on a board), never by a character
telling him he did well.

---

## 6. The brief — fill in BEFORE plotting

A blank line means the chapter is not ready. If a fact cannot be sourced the answer
is **UNKNOWN** and the option that needed it is cut.

```
PERSONALISATION BRIEF — chapter __
==================================
1. HIS SITUATION THIS WEEK (verified, dated)
   Where he is:                      What changed in 14 days:
   Still open / unresolved:          Source(s):

2. THE DILEMMA OF THE WEEK
   The fork, in one sentence:
   Option A (reasonable) — costs:    Option B (harder) — costs:
   Who else is affected, by name, and what the record says:
   Source(s):

3. THE BIOGRAPHY FACTS IN PLAY (max 2)
   Strong fact:                      Status: C-P / C-N / G
   Source:                           Why it is a temptation, not a boast:
   What he could DO with it in 30 seconds (its use):
   Counter-fact (humble, same life):  Status:        Source:
   If UNKNOWN -> the option that needed it is CUT, or an observed fact from the
   scene replaces it (name it):

4. THE PRINCIPLE THAT ANSWERS IT
   Principle id + name:
   The sentence where HE raised this problem (quote + source):
   The principle's cost in his situation:
   What the player does with their hands (not just reads):

5. WHAT MUST NOT BE SAID
   - Facts I must not assert (the UNKNOWNs this chapter touches):
   - Real people who must not get words/titles/decisions:
   - Open negotiations I must not resolve:
   - The flattering sentence I am most tempted to write, and why I cut it:

6. THE FIRST-WEEK ACTION (lever 5)
   The one thing he could do in the 7 days after playing:
   Why it is possible for him (time, money, permission):
   The obstacle that will actually stop him, named honestly:

7. HONESTY PASS (after the draft exists)
   Facts grepped against §1.1:                      pass / fail
   No detail invented inside a container fact:      pass / fail
   No colleague invented, titled, or humiliated:    pass / fail
   Nothing open resolved:                           pass / fail
   No flattery in the game's voice:                 pass / fail
   Read aloud without flinching:                    pass / fail
```

---

## 7. ASK HIM — the question queue

**Any agent creating a chapter may ask the user personal questions before
starting.** He said so directly. This section is the question bank to draw from,
ordered by how much the answer would improve the chapter.

This changes what "UNKNOWN" means in this project. It is no longer *"we do not
know, so do not guess"* — it is **"we do not know, so ask."** Guessing stays
forbidden. Asking is now expected.

### 7.1 How to ask well

A bad question wastes the one interruption you may get.

| do | don't |
|---|---|
| ask 3–6 questions in one numbered batch | drip-feed one question per turn |
| ask about **his actual situation** first | open with "tell me about yourself" |
| offer 2–3 concrete options plus "other" | ask open questions with no shape |
| say **why** ("this decides whether the lesson is set in your real class") | ask without context |
| mark which are blocking vs nice-to-have | make everything sound critical |
| record "skipped" as still-UNKNOWN and move on | re-ask a question he skipped |

The best questions here have been narrow and concrete. *"What was the madrasa
actually like?"* is answerable in three sentences. *"What does hospitality mean
to you?"* is not.

**Ask before plotting, not after.** A biography answer can change the chapter's
whole shape; discovering it after encoding costs a rewrite.

### 7.2 The question bank

**[BLOCKING]** = do not plot without it. **[SHAPE]** = changes the plot
materially. **[FLAVOUR]** = improves texture.

| # | question | status | why it matters |
|---|---|---|---|
| Q1 | **What was the madrasa actually like?** Why "really interesting" — the room, the teaching, the teachers, whether names were used, whether it was in Bukhara | **[BLOCKING]** | It is the counter-fact the only biography technique rests on, and the shipped chapter **fabricates** it in the hero's mouth. A few sentences turns a defect into the strongest material in the game |
| Q2 | **What are you actually teaching from 24 Oct?** Is it 5-B? How many pupils? How many classes? Are you *sinf rahbari*? | **[BLOCKING]** | Levers 1 and 3 depend on it. Everything shipped is game canon — the project may be writing about a class he does not teach |
| Q3 | **What is the hardest thing about this week?** | **[BLOCKING]** | Stage 0's entire input. The chapter should answer his real situation |
| Q4 | **Why did the olympiad matter to you?** The competition, the region, a teacher, a way out? | **[SHAPE]** | The chapter uses the fact but not the meaning, so the beat becomes about status rather than about him |
| Q5 | **What is Abu Bakr's actual title, and what does he want from you?** | **[SHAPE]** | The game calls a real person "Direktor o'rinbosari". His real remit may also be the chapter's pressure |
| Q6 | **Are the next branches really Bukhara and G'ijduvon?** | **[FLAVOUR]** | A real plan with invented locations (`story.js:214`) |
| Q7 | **Do you want Fast English / Tilsevar mentioned at Sulton at all?** | **[SHAPE]** | Largest unused verified asset, most sensitive — a side business at a new job. Must not be assumed either way |
| Q8 | **What did you actually teach in Samarkand / Bukhara / Tashkent — which levels, what ages?** | **[SHAPE]** | Unlocks a whole class of material: his own students' successes |
| Q9 | **Does Oqil know about the olympiad record, and what does he think of it?** | **[SHAPE]** | The one relationship where the credential has a verified history — Oqil recruited him through it |
| Q10 | **Is "the English guy teaching maths" something people actually say, or just an example?** | **[FLAVOUR]** | Only support is a hypothetical in the plot guide. Do not build a dilemma on it if it is not real |
| Q11 | **How do you want your faith and the madrasa represented?** | **[SHAPE]** | His call, not the author's — ask plainly rather than infer |
| Q12 | Age, family, the madrasa years | [FLAVOUR] | Any timeline detail risks a false memory. Only ask if a specific scene needs it |

### 7.3 What to do with the answers

1. **Record them as CONFIRMED** in the dossier (§1), dated, marked "asked
   directly".
2. **Append durable facts to Notion** *Extra info*, one bullet per fact as
   `YYYY-MM-DD: fact` — that is the workspace's long-term memory convention.
3. **Update the UNKNOWN list** — remove what was answered, keep what was skipped.
4. **If an answer contradicts shipped content**, say so plainly. Do not quietly
   change the game to match a new fact without telling him.
5. **Never invent the gaps around an answer.** "I studied at a madrasa" plus an
   author's imagination produced the fabrication in §1.2. A verified fact is not
   a licence to fill in its details.

### 7.4 If asking is not possible

If there is no human in the loop, the older rule still holds: **do not guess.**
Build on verified material only, and leave a `QUESTIONS.md` beside the chapter
listing what you would have asked. A chapter made from less material is better
than one made from invented material — the invented material ends up in the
hero's mouth and is inherited by every later chapter that reuses it.

---

## 8. Defects found while writing this — for the Lead, not in this file's scope

Three real ones in `js/data/chapter2.js`, all verified. This is a notes file, so they
are recorded rather than fixed.

1. **`:766` — an invented madrasa memory spoken by the hero** (rules 1–2), promoted
   into `intel_madrasa` (`chapter2-learning.js:218` ✓). §1.2. **This is the one that
   needs a decision**, not just a fix: either he supplies the real detail (U1), or the
   line is cut back to what is verified.
2. **`:1165` — the only Cyrillic in the file**: *"Ertaga ham sen ayta**сан**"* should
   be `aytasan`. Three characters, and a player can see them.
3. **`:1243` — `P.MUTUAL` is not in the `P` map** (`:45-54`, eight keys: `FIRST, NAME,
   NOTICE, ONE, SPECIFIC, GESTURE, LAST, REASONABLE`), so `P.MUTUAL ? P.MUTUAL :
   P.NOTICE` always falls through to `C2-003`. Dead code pretending to be a principle.

**And the escalation chain, because it is the mechanism worth understanding.** This is
how a fact he stated became a memory he never had — three steps, none of them a
deliberate lie:

| Step | Where | What it claims |
|---|---|---|
| 1 | PROMPT-LIBRARY.md:233 ✓ | *"a **madrasa** student, **a place where the teacher knew every name from the first day**"* — an agent's gloss in a wave summary, turning a fact he stated into a claim about what happened there |
| 2 | `chapter2.js:667` ✓ | hardened into narration, plus **no desks**, **everyone on the floor** |
| 3 | `chapter2.js:766` ✓ | the hero **speaks** it as first-person memory: **"Yigirma kishi, bitta kitob"** |

At step 3 it is indistinguishable on the page from the verified olympiad fact two
nodes earlier. Each step was a plausible elaboration of the one before — which is
exactly why the rule has to be mechanical rather than well-intentioned. **The test
that stops it: could you point to the sentence where he said it?** For "madrasa",
yes. For "twenty pupils, one book", no.

**Also before copying chapter 2:** it sets 18 `c2_*` flags of which 17 are never
read (§3), it contains zero `requires`/`lockedText` gates (chapter 1 has three, on
`intel_football`/`intel_sick`/`intel_quiet`), and `registerRun` reads three intel ids
that nothing grants. None is fatal; all are inherited silently by a copy.

---

*Service is black and white. Hospitality is colour. His biography is neither — it is
the situation the colour has to be chosen in.*
