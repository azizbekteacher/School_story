# Plot creation guide

How to build the story of a chapter of **School_story**.

This file is about the **plot** — what happens, why it matters, and why a player
will feel something at the end. It is not about data formats. When you know the
plot, go to [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) to encode it.

Read in this order:

1. [AGENTS.md](AGENTS.md) — the machine, the constraints, the standing rules.
2. **This file** — what the chapter is about.
3. [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) — how to build it.
4. [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) —
   what the book actually says, and what it does not.

> **How to read the chapter-2 examples below.** Chapter 2 is the only complete
> chapter built on the current engine, so it is quoted throughout — but it is a
> **work in progress**: the user said of an earlier version *"I didn't like it,
> like, at all"*, and of the current one *"I didn't like chapter 2 yet"* — while
> also noting **"there are some good parts in it."**
>
> So read every "chapter 2 does X" as *"here is a worked example of the
> technique"*, **not** *"this is how it should be done."* Where chapter 2's own
> choices look weak, this guide says so. Mine it for mechanisms and for the parts
> that work; do not copy its overall shape as if it were approved.
>
> The standard is not chapter 2. The standard is the **user's own criteria** —
> see §0.1.

---

## 0. Why plot is the centre

A chapter has one job: **make the player feel the cost of a choice they made
freely.** Everything else — the map, the sprites, the minigames, the notebook —
is apparatus in service of that moment.

This is why the plot cannot be assembled from a principles list. You cannot
begin with "teach principle 4" and arrive at a story. You begin with a person in
a situation where two goods conflict, and the principle falls out of what they
do under pressure. The debrief then *names* what the player just lived.

The failure mode to avoid is the **topic list wearing a plot's clothes**:

> Hero arrives. Someone explains hospitality. Hero picks the kind option from
> three options. Hero is praised. Chapter ends.

Everything in this file exists to prevent that. The test is brutal and simple:

> **Would a player who skipped the teaching text still feel the lesson?**
>
> If yes, the plot works. If the lesson only exists because someone says it,
> there is no plot — only a lecture with arrow keys.

### 0.1 The binding specification — his own words

This is the most important section in the file, because it is the only part that
is **not** my opinion. These are the user's requirements, quoted verbatim from
[PROMPT-LIBRARY.md](PROMPT-LIBRARY.md), in the form he gave them after rejecting
an earlier chapter-2 draft:

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

> The chapter story should also be legendary - like the reader should feel "Wow,
> this guy nailed the first lesson" when completing the chapter. it should really
> feel like a really good fiction

Read those carefully. **They are not a list of features — they are a diagnosis**,
and each line has a specific operational consequence:

| his words | what it actually requires |
|---|---|
| "needs strong ideas" | fewer, heavier ideas. One idea that is genuinely profound beats five that are true-but-obvious. |
| "didn't use almost none of the ideas from the book" | the book's actual mechanisms must be *in the fiction* — connecting, small gifts, learning about them, personalised attention. Not quoted. Staged. |
| "it felt like it didn't look at Notion nor web" | the research stage is not optional. He can tell the difference between a chapter that consulted the material and one that did not. |
| "didn't take into account my personal info" | his biography is **content**, not decoration — see [PERSONALISATION-GUIDE.md](PERSONALISATION-GUIDE.md). |
| "I could give active students compliments" | he hands over mechanics, not themes. Turn his sentences into interactions. |
| "the agent needs to deeply learn the book — and teach it to me" | studying the source is not preparation for the chapter; **it is the chapter.** |
| "felt like really short" | length is a *density* requirement, not a word-count one. Short means *it did not teach enough principles properly.* |
| "should feel like a really good fiction" | the plot must stand as fiction. A competent teaching scenario that is not a good story fails this line. |

**Two criteria worth stating separately, because they are the ones easiest to
miss:**

1. **"Legendary"** is not spectacle. His gloss is *"the reader should feel 'Wow,
   this guy nailed the first lesson'"* — so the chapter must be **winnable in a
   way that feels earned**, and must end on a moment worth retelling. Chapter 2's
   best piece of this is a child's name in chalk on a board, not a medal. The bar
   is *specificity*, not stakes.
2. **The impressive move and the hospitable move must never be the same move.**
   If being excellent at maths and being excellent at people are the same action,
   the chapter has no dilemma and cannot teach anything.

### 0.2 How to use these criteria

Before you consider a plot finished, reread his words and ask, for each one,
*would he say this line about my chapter?* A chapter that fails any of them is
not ready to encode no matter how clean the data is.

### The three questions a chapter must answer

Before you write a line of dialogue, you must be able to answer these in one
sentence each. If you cannot, you are not ready to plot.

1. **What does the hero want?** (and it must be something the player also wants)
2. **What does the hero need?** (usually in conflict with the want)
3. **What does it cost to choose the need over the want?**

Chapter 2, worked through:

| question | answer |
|---|---|
| want | To be taken seriously as a real teacher — to be *the* maths teacher, credible, in control |
| need | To see fourteen individual people instead of one class |
| cost | The credential that earns credibility instantly (Buxoro olimpiadasi) has to go unused. The impressive move and the hospitable move are never the same move. |

That third line is where the teaching lives. Notice that it is not a moral — it
is a **trade**. The player gives up something they genuinely want. That is what
makes the debrief land.

---

## 1. The dramatic spine

Every chapter gets a spine. Write it down in six lines before anything else.
Use this shape — it is the one both shipped chapters use.

```
1. WANT        what the hero is trying to get, in the first 30 seconds
2. INCITING    the thing that makes the day not-normal
3. PRESSURE    the force that will not let them take the easy route
4. REVERSAL    the moment the plan visibly breaks, in front of witnesses
5. CHOICE      the one decision the whole chapter was built to reach
6. RESIDUE     the last image, and what the hero carries out
```

### Worked: chapter 2 "Birinchi dars: 5-B"

| # | element | what it is |
|---|---|---|
| 1 | **want** | Survive the first ninety seconds of a new class with authority intact. The brief states it: *"Sizda bitta guvohnoma bor — Buxoro viloyat olimpiadasi. Uni ko'rsatish oson. Ishlatmaslik qiyin."* |
| 2 | **inciting incident** | The bell. *"O'n to'rt juft ko'z sizda, va siz hali bir og'iz gapirmadingiz."* — the room has already written its sentence about him. |
| 3 | **pressure** | Fourteen pupils are continuously auditing him, and one of them (Jasur) narrates the audit out loud. *"Ana, yangi o'qituvchi. Yaxshi bo'ldi — bugun matematika bo'lmaydi."* |
| 4 | **reversal** | `wobble` — the lesson breaks, and he must choose whose desk to walk to. |
| 5 | **choice** | Whether to use the olympiad credential as leverage or to answer the specific person in front of him. |
| 6 | **residue** | *"Bekzod usuli"* goes up on the board — and whether he wipes it off. |

### Why the reversal must be public

Chapter 2's `wobble` beat works because the break happens **in front of the
class**, not in private. A private failure can be rationalised. A public one
cannot: it changes what the room thinks, and the player feels the room change.

**Rule:** put the reversal where a witness can see it. Private reversals teach
nothing; witnessed reversals teach everything.

### An alternative outer shape: Kishōtenketsu

The six-line spine above is the **dramatic** shape, and it is the one both
shipped chapters use. But three-act / conflict-driven structure is not the only
option, and for a chapter about *thoughtfulness* it is worth knowing the
alternative.

**Kishōtenketsu** is a four-part East Asian narrative form:

| part | does |
|---|---|
| **ki** (introduction) | establish the ordinary situation |
| **shō** (development) | deepen it; things get more involved |
| **ten** (twist) | introduce an element that reframes everything so far |
| **ketsu** (conclusion) | a quiet landing that resolves both |

Its defining property is that **it does not require conflict**. Three-act
structure needs an antagonist and escalating stakes; Kishōtenketsu can carry a
chapter about a teacher being quietly, specifically thoughtful where there is no
villain and no fight to win.

**When to use it:** a chapter whose tension is internal or social rather than
oppositional. **When to use the six-line spine:** a chapter with a clear
antagonist-shaped pressure (chapter 2's Jasur and the 45-minute clock).

Either way, the **`ten` is the same thing as the reversal** — the moment that
reframes what came before. Both shapes need it. The difference is whether the
story is built around conflict or around reframing.

**Do not force hero's-journey or Save-the-Cat shape onto this material.** They
are rites of passage; they produce an unearned "and so he became a real teacher"
tone that the register of this game cannot support.

### Why the want must be legitimate

Azizbek's desire to be taken seriously is not a flaw. He *is* a real teacher; he
*does* have the credential; using it would work. The story only bites if the
temptation is genuinely good. If the want is embarrassing or villainous, the
player feels manipulated instead of caught.

**Rule:** the easy option must be something a reasonable person would do.

---

## 2. The chapter skeleton

Both shipped chapters, stripped of their content, are the same seven moves. This
is the reusable skeleton. Deviate from it knowingly, not by accident.

| # | beat | what must be true | chapter 2 |
|---|---|---|---|
| 1 | **Arrival under judgement** | You are already being assessed before you act. Something is visible to others that you cannot control. | corridor, bell, 14 pupils |
| 2 | **The first small test** | A low-stakes interaction where the player can behave well or badly, and learns that choices are noticed. | asking questions, `intro` multi |
| 3 | **Earning information** | The only way to later act well is to have asked someone something now. This is the engine's core mechanic. | `intel_*` from 4 pupils |
| 4 | **The visible mistake** | The plan breaks in front of witnesses. Not caused by the player necessarily — but *handled* by the player. | `wobble` |
| 5 | **The specific response** | The player chooses one person to respond to. Specificity is the lesson; "the class" cannot be helped. | six `wob_*` scenes, one per pupil |
| 6 | **The exit line** | The last minute. What people carry out with them. | `exit`, corridor |
| 7 | **The bill** | The debrief names what happened and what it cost. | 4 debrief tabs |

### Where the author has freedom

The skeleton fixes **shape**, not content. You choose:

- the situation (a lesson, a parent meeting, a staffroom conflict, a school event)
- who judges the hero and how they show it
- what information is worth having, and who has it
- what breaks, and why it is the hero's to handle
- which person the final choice is about
- what the last image is

### What must not change

- **the hero never wins by being impressive.** Ch2's spine is that the impressive
  move and the hospitable move are different moves. If a chapter lets Azizbek
  solve the problem by being excellent at maths, it has broken the thesis.
- **the audience is always present.** Hospitality only means something when
  someone else is watching the difference.
- **there is exactly one mission exit.** Many scenes end; one path leaves.

---

## 3. Choice design

This is the craft most chapters get wrong. The engine gives you exactly three
currencies and one structural pattern. Learn them.

### 3.1 The structural pattern: foldback

Both shipped chapters use **foldback**, not a branching tree:

- a choice routes the player into a short scene
- that scene **always terminates** (`type: "end"`)
- the player is then returned to the main line
- consequence accumulates in **state**, not in a divergent plot

Measured from the shipped data:

| | chapter 1 | chapter 2 |
|---|---|---|
| options | 21 | 36 |
| options that route somewhere | 21/21 | 36/36 |
| unreachable nodes | 0 | 0 |
| terminal `end` nodes | few | **38** |
| nodes that end the mission | 1 | 1 |
| scenes | 10 | 21 |
| `{requires}` gates | 3 | **0** |

Chapter 2 uses **21 scenes for 203 nodes** with 38 terminal nodes and exactly one
mission exit. That is foldback: many small scenes, each self-terminating, all
funnelling back, with consequence carried by trust and by scored notes.

**Why foldback and not a tree:** a 10-beat chapter with 3-way branching at each
beat needs 59,049 leaf paths. Foldback needs one voice track plus a handful of
short scenes. It is the only structure that fits the authoring budget — and it is
not a compromise, because *consequence* is what players remember, not
*divergence*.

### 3.2 Consequence without locks — the primary pattern

Chapter 2 gates nothing. It has **zero `requires` options.** Instead:

- **23 of 36 options move trust.** Trust is visible in the HUD at all times.
  That is the player's running bill.
- **32 of 36 options carry a scored note.** Every meaningful choice is judged,
  and the judgement appears in the debrief's `Tanlovlar` tab.
- **intel changes what you *can do*, not what you *may pick*.** Asking the
  three names during the two-minute window pre-fills them in the register
  minigame:

  ```js
  var intel = (api.state && api.state.intel) || [];
  function has(i) { return intel.indexOf(i) >= 0; }
  if (has("intel_zarina")) pre.push("Zarina");
  if (has("intel_bekzod")) pre.push("Bekzod");
  if (has("intel_jasur"))  pre.push("Jasur");
  ```

So the cost of not asking is a **worse game and a lower score**, not a missing
door. This is the right pattern for this game: the player is never told they
failed, they discover it in the debrief.

### 3.3 Gated choices — the secondary pattern

Chapter 1 uses real gates, three of them, all in the mother scene
(`timur_start/tm_q`):

```js
{ id: "NOT_1", requires: { intel: "intel_football" }, lockedText: "…" }
```

The engine supports seven conditions:

| condition | means |
|---|---|
| `intel` | you must have this fact |
| `intelAny` | you must have at least one of these |
| `flag` | this flag must be set |
| `notFlag` | this flag must be clear |
| `chosen` | you must have made this choice |
| `notChosen` | you must not have made this choice |
| `trustMin` | trust must be at least n |

**Use a gate when the player must SEE the door they could not open.**
`lockedText` is mandatory in spirit — the validator warns without it. A locked
option with no explanation is a bug, not a lesson. The point is: *"I could have
done that, if I had asked."*

**Do not use a gate to punish.** Use it to make information valuable.

### 3.4 What makes a choice feel real

The player must be able to *tell the options apart* and *predict roughly what
each costs*. A choice where all three options read as "be nice" is not a choice.

The usable patterns, in order of strength:

1. **Two goods in conflict.** Both options are defensible; they trade different
   values. (Use the credential to establish authority vs. use the time to see one
   child.) This is the strongest and the only one that teaches.
2. **Good vs. easy.** One option is right but costs something visible — time,
   status, admitting a mistake.
3. **Good vs. understandable cowardice.** The bad option is what a tired person
   actually does. Honest, not cartoonish.
4. **Information asymmetry.** The player has intel that makes one option
   obviously better — this is the game rewarding attention.

**Never:** three flavours of the same behaviour, or one obviously-good option
surrounded by straw men. Players notice, and they stop believing the choices.

### 3.5 The two-things-at-once rule

A good choice should change **two** things at once: one visible (trust, the
scene you get) and one hidden (a note, a flag that will matter later). If a
choice only moves one number, it is bookkeeping.

### 3.6 The construct-validity test — the one that catches a broken chapter

This is the most important check in this section, and it comes from the
assessment literature rather than from game writing.

A scored teaching game has a measurement problem. Stealth-assessment research
names its own central failure mode: **the score must reflect the intended skill,
not "construct-irrelevant variance" from the game's mechanics.** If *every* warm
option also raises `trust`, then trust is not measuring hospitality — it is
measuring **agreeableness**. The player learns to pick the nice-sounding option
and the debrief congratulates them for it.

The diagnostic is mechanical. Take every choice in the chapter, sort it by
verdict, and compare two sets:

```
set A = choices with verdict "good"
set B = choices the player would experience as "warm / kind / pleasing"
```

> **If set A and set B are the same set, the instrument is broken.**
> The chapter is teaching compliance, and it is calling it hospitality.

Hospitality in this book is not niceness. It is *thoughtfulness with a cost* —
the specific gesture, the thing nobody asked for, the uncomfortable honest
answer. A chapter where being pleasant is always correct has staged the opposite
of the thesis.

**The fix:** **at least one `good` choice per chapter must be uncomfortable.**
Not rude — uncomfortable. The honest answer that will not be welcome. The choice
that costs trust *now* and earns it three beats later. The one where the warm
option is `ok` and the right option is a small refusal.

And the corollary, from choice-design practice: **do not fix an unclear choice by
hiding information.** It is tempting to make the right option unguessable so the
player must "really get it". That just converts one mistake into another by
removing the player's basis for deciding. The cost must be *nameable in the
fiction before the choice* — "if I stay with this boy, the meeting starts without
me" — even when its size is unknown. Unknown magnitude is tension. Unknown
dimension is confusion.

The rule that follows, and it is the ethics of this whole game:

> **An option may be punished only for information obtainable in this
> playthrough.**

If the boy's football obsession was findable and the player never asked, that is
a lesson. If it was never findable, that is a bug wearing a lesson's clothes.

### 3.7 Delayed branching — what makes a choice matter

A choice that changes only the **next node** is decoration. A choice that changes
what is **possible three beats later** is the game.

The engine gives you exactly the right tools for this, and they are the reason
the game is not a visual novel:

| mechanism | effect lands | example |
|---|---|---|
| `intel` | immediately, but consumed later | knowing three names pre-fills the register minigame |
| `flag` | later, via `requires` | chapter 1's mother scene options |
| `trust` | continuously, and gated on `trustMin` | the HUD shows the bill as you go |
| archetype `when.requiresIntel` | at the debrief | which ending you get |

**Author's test:** for each choice, ask *"what does this make possible or
impossible later?"* If the answer is "nothing", the choice is a mood, not a
decision. One or two moods per chapter is fine. A chapter of moods is not a
game.

---

## 4. The information economy

This is the game's core mechanic and the reason it is not a visual novel.

> **The hero can only be hospitable to someone he has paid attention to first.**

Mechanically: intel is gathered by asking, and intel is what makes the specific
gesture possible. Chapter 2 has **17 intel labels, each granted exactly once, all
17 matched to a label in the learning object** — a clean economy.

### The intel → consequence chain

```
ask a question  →  intel label  →  (a) minigame content changes
                                   (b) a note references it
                                   (c) an archetype band requires it
                                   (d) a story line can name the person
```

### The rule: every intel must have a buyer

An intel that changes nothing is decoration. Before you add one, name its
consumer:

- does it pre-fill / unlock / change a minigame? (best)
- does it gate an option? (chapter 1's pattern)
- does it change which ending note you get?
- does an archetype require it?

If you cannot name one, delete the intel. The chapter-2 validator explicitly
warns about intel that is granted but never gates anything — treat that warning
as a prompt to check whether the intel is doing *anything*.

### The two-minute window

Chapter 2's opening gives the player **2 questions out of 4** in a `multi` node.
That budget is the whole design in miniature:

- you cannot learn everything
- what you chose to learn determines what you can do later
- the unchosen options are visible, so you feel the missed information

**Use a question budget in every chapter.** Free unlimited questioning removes
the mechanic.

### Writing the answer scenes

An answer is not just the fact. It is a **characterisation opportunity plus the
fact**. From the shipped chapter:

> **[Timur]** Oshxonada non har doim bor. Faqat katta tanaffusda. Men erta
> kelaman — shuning uchun hozir yeyapman.
>
> *[narration]* U kulib javob berdi va darhol devorga qaytdi. Erta keladi.
> Oshxonaga yolg'iz boradi. Buni yodda tuting.

The fact (comes early, eats alone) is welded to the behaviour (answers, turns
back to the wall) and the hero's inference (remember this). Three lines, one
person, one usable fact. That is the template.

---

## 5. Tension without combat

There is no violence, no timer countdown, no fail state that ends the game. All
pressure must be social. The catalogue, with what each one actually does:

| device | how it works | ch2 usage |
|---|---|---|
| **the clock** | a stated deadline creates scarcity | 45-minute lesson; 2 minutes in the corridor |
| **the audience** | people watching means you cannot retry | 14 pupils; the bell turns all eyes on him |
| **the auditor** | one character narrates the judgement aloud | Jasur: *"bugun matematika bo'lmaydi"* |
| **the budget** | limited questions/moves force prioritisation | `multi` max 2 of 4 |
| **the witness to failure** | the mistake happens publicly | `wobble` |
| **an obligation** | someone is waiting on an outcome | the lesson must be taught |
| **a person who needs something** | a specific child's need is the stakes | six `wob_*` scenes |
| **the closing minute** | the last moments carry disproportionate weight | `exit` beat |

### The antagonist who is not a villain

This is chapter 2's best structural decision and the one most worth copying.
Jasur is not evil. He is a boy testing whether the new teacher is real. If the
antagonist is a villain, the player's choice is trivial — of course you oppose
the villain. If the antagonist is a *person with a reasonable position*, the
choice becomes a real dilemma.

**Rule:** the person making the hero's life hard must have a comprehensible
reason, and the story must eventually show it.

---

## 6. Dialogue craft

The register is fixed by standing constraint 8: Uzbek in-game, **warm, plain,
adult, no exclamation-mark cheerfulness, ASCII apostrophes**. Here is what that
means at line level, with evidence from the shipped chapter.

### Hard rules

1. **One idea per `say` node.** Median shipped length is **117 characters**
   (~2 lines); the ceiling is **204** and the renderer **hard-drops anything past
   6 lines**. Write one thought, then advance.
2. **Narration carries the inference.** The hero's inner voice states what the
   player should have noticed. *"U javob berdi — va gapirayotganda sizga emas,
   o'z qo'llariga qaradi."* Not "he seemed nervous."
3. **Characters speak in their own register.** Dilnoza explains (she likes
   explaining). Timur answers shortly and returns to the wall. Bekzod looks at
   his hands. Jasur performs for an audience. You should be able to delete the
   speaker labels and still know who is talking.
4. **No character explains the theme.** Nobody in the shipped chapter says the
   words "hospitality", "service", or "unreasonable".
5. **Concrete over abstract.** Not "he was poor" but *"Qo'lida daftar yo'q,
   faqat yirtilgan bitta varaq. Ustida juda tartibli yozuv."*
6. **No exclamation marks.** Not one, anywhere.
7. **ASCII apostrophes only** (`o'`, `g'`). Never `'` or `ʼ`.
8. **Silence is a line.** Some beats are best delivered by a short narration and
   no dialogue at all.
9. **The option text is the hero's intent, not the outcome.** Write what he
   does, not what it achieves.
10. **Never let an option promise a reward.** No "(+2 trust)". The player should
    choose because it is right, not because it is scored.

### The register test

Read your line aloud in the voice of a tired, competent adult who respects the
person he is talking to. If it sounds like a children's cartoon, or like a
LinkedIn post, rewrite it.

### Narration vs. speech

`speaker: ""` is the hero's inner voice and is styled differently (italic). Use
it for:
- what he notices (*the torn page, the careful handwriting*)
- what he infers (*early arrival, eats alone*)
- the situation advancing (*the bell; the noise changes*)

Use a real speaker for anything a person would actually say out loud.

---

## 7. The ending

The ending is not the last scene. It is **the last image** plus **the bill**.

### The last image

Chapter 2 lands on *"Bekzod usuli"* — Bekzod's method — written on the board,
and the open question of whether the hero wipes it off. That image contains the
whole chapter: a boy who had a different way of solving the problem, and a
teacher who can either preserve it or erase it.

**Your chapter needs one image like that.** Not a summary, not a moral, not a
speech. An image that is the argument.

### The bill

The debrief is where the teaching is named. It has four tabs, and each does a
different job:

| tab | job |
|---|---|
| **Natija** | the score, the archetype, the warning about that archetype's failure mode |
| **Tanlovlar** | choice by choice: what you did, why it mattered, what it cost, what else you could have done |
| **G'oyalar** | 6–8 concrete things to try at Sulton on Monday |
| **Qiyinchiliklar** | 5–7 honest obstacles, with a mitigation and no false comfort |

The debrief must be written **as the actual lesson**, not as flavour text. This
is the artifact the user takes into a real classroom.

### The archetype bands must tile

`pickArchetype()` scans the array and keeps the **highest `minAvg` satisfied**.
Bands must cover the whole range with no gap and no overlap, or a player can
score an average that matches no archetype. Chapter 2's real bands:

```
arch-gatekeeper  -1.00 .. -0.10
arch-host        -0.10 ..  0.35
arch-showman      0.35 ..  2.00
```

Do the arithmetic on your own bands before shipping.

---

## 8. Plot readiness checklist

Do not write dialogue data until every one of these is **yes**. This is the
cheapest place to change your mind.

- [ ] Can I state the chapter's single question in one sentence?
- [ ] Is the hero's **want** something the player also wants?
- [ ] Is the **need** in genuine conflict with the want?
- [ ] Is the **cost** of choosing the need real, and does the story make the
      player pay it?
- [ ] Is the temptation genuinely reasonable — would a good teacher do it?
- [ ] Does the reversal happen **in front of witnesses**?
- [ ] Is there **exactly one** person the final choice is about (not "the class")?
- [ ] Does every intel have a named consumer (minigame / gate / note / archetype)?
- [ ] Is there a question **budget**, so the player cannot learn everything?
- [ ] Does every choice change **two** things (one visible, one hidden)?
- [ ] Does the antagonist have a comprehensible reason, and is it shown?
- [ ] Do I have **one final image** that is the argument, not a summary?
- [ ] Do 6–10 principles map onto beats, one principle per beat?
- [ ] Are 7–10 beats enough to carry this without padding?
- [ ] Does the debrief teach something usable on a Monday?
- [ ] Have I checked that the impressive move and the hospitable move are
      **not the same move**?

If any answer is no, stop. A chapter with a weak spine cannot be fixed in the
encoding stage — you will just write 1,600 lines of a bad idea.

---

## 9. Anti-patterns

Ten ways a plot in this project goes wrong. Each is recognisable in a draft.

1. **The topic list in a plot costume.** The hero moves between people who each
   explain a principle. No conflict, no cost. *Fix:* find one situation where two
   goods conflict.
2. **The hero who is always right.** Every option is a chance to be admirable and
   the worst option is a straw man. *Fix:* make the wrong choice reasonable.
3. **The lecture ending.** The final scene is a character explaining the lesson.
   *Fix:* end on an image. Let the debrief talk.
4. **Consequence with no visibility.** Choices silently set flags nobody sees.
   *Fix:* move trust, or emit a scored note, or change the minigame.
5. **Divergent branches that cannot be finished.** A real tree the author can no
   longer complete. *Fix:* foldback — short scenes, all terminating.
6. **A minigame that quizzes.** The "game" is a multiple-choice question with
   animation. *Fix:* see [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) §
   minigames — it must use intel mechanically.
7. **The antagonist is a villain.** Makes the moral choice trivial. *Fix:* give
   him a reason.
8. **Intellectual hospitality.** The chapter is about a school problem the player
   cannot act on. *Fix:* make the choice about one person in front of you.
9. **The personalisation that is only a name.** A real detail is mentioned once
   and never matters. *Fix:* turn biography into a choice with a cost (§10).
10. **The unearned emotional ending.** The music swells over a moment the player
    did not create. *Fix:* the final image must be the consequence of the
    player's choice.

---

## 10. Personalisation — making it *his* chapter

This game exists because one specific person wanted to live the book. A chapter
that would fit any teacher is a failure even if it is well plotted.
[UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) has
the verified biography and the citation discipline; this section is about
**plotting** with it.

### The five levers, surface to deep

| # | lever | what it looks like | strength |
|---|---|---|---|
| 1 | **naming** | his real class (5-B), real colleagues, real school | low — decoration |
| 2 | **backstory** | the Bukhara olympiad, the Kukaldash madrasa as the hero's history | medium — makes choices personal |
| 3 | **dilemma** | stage a problem he actually has: a new male teacher's credibility, being seen as "the English guy teaching maths", a manager's expectations | **high** |
| 4 | **principle → his problem** | a principle answers something he actually raised in his Notion logs | **high** |
| 5 | **the debrief speaks to this week** | the idea list is something he could do tomorrow | highest |

Levers 1 and 2 are cheap and you should use them. Levers 3–5 are what make the
chapter his.

### The worked example: credential as temptation

Chapter 2 takes one biographical fact — *he was regional olympiad champion in
Buxoro, the strongest maths region* — and does not use it as a boast. It makes it
the **temptation**:

- it is stated in the brief, in three lines, as a thing he *has*
- it is framed as easy: *"Uni ko'rsatish oson. Ishlatmaslik qiyin."*
- the chapter's whole question is whether he uses it to establish authority or
  spends the time seeing one child

And it pairs it with a **counter-fact** — the madrasa, where he was a student
rather than a champion — which becomes the alternative source of authority: the
teacher who *learned* rather than the teacher who *won*.

**This is the technique.** Take the strongest fact about him, and make it the
thing he must choose *not* to lead with. Take the humbler fact, and make it the
better answer. That is how a biography becomes a plot instead of a résumé.

### Hard rules

1. **Never invent a biographical fact.** If it is not verified, it does not go in.
   Mark unknowns as unknown.
2. **Never make him a wish-fulfilment hero.** He must be capable of being wrong,
   and the wrong choice must be his.
3. **Personalisation never replaces the teaching.** The principle still has to be
   the point; the biography is the situation.
4. **Real colleagues get dignity.** Abu Bakr and Oqil are real people. Oqil is
   portrayed as overloaded and sceptical — an anti-pattern, not a villain. Never
   make a real colleague the butt of the lesson.
5. **His faith and madrasa background are treated with respect**, never as
   novelty or quirk.
6. **Never put words in his mouth in the debrief.** The debrief teaches; it does
   not pretend to be his own reflection.
7. **No real student names** unless he has given them.

### The personalisation test

For any scene, ask:

> Would this work identically for a generic teacher in a generic school?

If yes, it is not personalised yet. The fix is usually lever 3 — replace the
generic situation with his actual one.

---

## 11. Worked example — chapter 2 dissected

The reference implementation. Read `js/data/chapter2.js` alongside this.

**Beats:** `before → door → open → names → rules → task → gift → wobble → exit → done`

**21 scenes · 203 nodes · 36 options · 8 principles · 17 intel · 6 NPCs · 6 triggers**

Notice the scene count versus the beat count: 21 scenes for 10 beats, because
the final choice (`wobble`) is **six parallel scenes**, one per pupil. That is
how a chapter gives the player a *specific* person to respond to instead of an
abstraction, without writing six different plots: the six scenes converge, the
consequence is which person you helped and what you said to them.

The dramatic spine, restated:

> A new teacher has 45 minutes and one credential. He can be impressive or he
> can be present, and the chapter is the 45 minutes in which that choice is
> made — in front of fourteen people who are deciding who he is before he
> speaks.

That is a plot. It is not a topic. Every scene in the chapter is downstream of
that sentence, and the debrief is the bill.

---

## 12. Where to look first

| you want… | read |
|---|---|
| the machine and constraints | [AGENTS.md](AGENTS.md) |
| the book, verified | [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) |
| his intent, in his own words | [PROMPT-LIBRARY.md](PROMPT-LIBRARY.md) |
| the reference plot | `js/data/chapter2.js` |
| the reference teaching payload | `js/data/chapter2-learning.js` |
| how to encode a plot | [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md) |
| the real data shapes | `node tools/show-contract.js` |

*"Service is black and white. Hospitality is colour."*
