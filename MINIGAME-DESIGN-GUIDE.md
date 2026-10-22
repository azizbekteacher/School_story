# Minigame design guide

How to build a minigame for **School_story** that teaches something, rather than
a quiz wearing an animation.

Read [AGENTS.md](AGENTS.md) §9 first for the host contract in brief. This file is
the procedure and the craft.

---

## 1. The host contract

### 1.1 Geometry — exactly

The host draws a panel and hands you a clipped, translated canvas. Verified from
`js/game/minigames.js:137` and the draw path:

```js
var px = 40, py = 30, pw = W - 80, ph = H - 60;   // W=960, H=600
// panel:  40,30  880,540
ctx.rect(px + 14, py + 78, pw - 28, ph - 78 - 44);
ctx.clip();
ctx.translate(px + 14, py + 78);
```

So:

| | value |
|---|---|
| **content space** | **852 × 418** |
| **content origin** | **(54, 108)** in 960×600 screen space |
| draw at | `(0,0)` to `(852,418)` — origin is already applied |
| `api.mouse` | **960×600 screen space** — subtract `(54,108)` to hit your rects |
| `onPointer(x,y)` | also **960×600 screen space** |

> **Stale-number trap:** some older minigame source comments say `872×478`. That
> is from an earlier host geometry and is wrong. `chapter2.js` uses 852×418 and
> is correct; the extra 20×60 is simply clipped for `gift.js`/`travel.js`/`ball.js`.
> Copy the numbers from this table, not from those comments.

The host reserves:
- top ~78px: its own panel header (title at `py+42`, subtitle at `py+64`)
- bottom ~44px: the controls footer, which fades after ~4s

### 1.2 The `api` object

```js
{
  w: 852, h: 418,          // content space
  cfg: <node.config>,      // whatever the story node's config field holds
  state: {                 // live-ish snapshot at create time
    flags, intel, trust, beat, scores
  },
  mouse: { x, y },         // updated every frame, SCREEN space
  sound: { blip, tick, select, good, bad, win },
  finish(result)           // call EXACTLY ONCE
}
```

`api.state.intel` is an **array of intel ids** — not an object. The shipped
pattern is:

```js
var intel = (api.state && api.state.intel) || [];
function has(i) { return intel.indexOf(i) >= 0; }
```

### 1.3 Lifecycle

```js
G.minigames.register(id, {
  title: "…",            // host draws this
  subtitle: "…",         // optional
  controls: "…",         // footer, fades after ~4s
  principleIds: ["C2-003"],   // optional, older key name
  create: function (api) {
    return {
      update:   function (dt) {},        // dt seconds, capped 0.05
      draw:     function (ctx) {},       // content space
      onKey:    function (key) {},       // "1".."9","enter","space","escape",
                                         // arrows, "a","d","w","s","r","tab"
      onPointer:function (x, y, type) {} // type "down"; SCREEN coords
    };
  }
});
```

### 1.4 Finish exactly once

```js
var finished = false;
function done(result) {
  if (finished) return;
  finished = true;
  api.finish(result);
}
```

The host also guards with its own `done` flag, but **you** should guard too.
Never call `finish` inside `draw` — it belongs in `update` or an input handler.

### 1.5 Result shape

```js
{
  win: true,                       // routes to node.onWin / node.onLose
  choiceId: "CH2_MG_NINETY_WIN",   // recorded; needs a choiceNotes entry
  detail: "…",                     // shown in the debrief
  notes: [ { principle: "C2-001", text: "…", verdict: "good" } ],
  effects: [ /* effect DSL, applied by the engine */ ]
}
```

### 1.6 Missing game fallback

A `game:` id with no registration resolves as a **win** with a "game not found"
detail, so the mission never soft-locks. That is safety, not a licence — the
validator fails an unregistered id.

### 1.7 Minimal conforming skeleton

```js
(function () {
  var W = window.G;
  var MOUSE_X = 54, MOUSE_Y = 108;   // content origin in screen space

  W.minigames.register("exampleGame", {
    title: "Misol: tanlang",
    subtitle: "Uch variantdan bittasi",
    controls: "Sichqoncha yoki 1-3 tugmalari",
    principleIds: ["C3-001"],

    create: function (api) {
      var finished = false, sel = -1;

      var boxes = [
        { x: 40,  y: 60, w: 240, h: 90, label: "Birinchi" },
        { x: 306, y: 60, w: 240, h: 90, label: "Ikkinchi" },
        { x: 572, y: 60, w: 240, h: 90, label: "Uchinchi" }
      ];

      function pick(i) {
        if (finished || i < 0 || i >= boxes.length) return;
        sel = i;
        api.sound.select();
        finished = true;
        api.finish({
          win: i === 1,
          choiceId: i === 1 ? "CH3_MG_RIGHT" : "CH3_MG_WRONG",
          detail: "Siz " + boxes[i].label.toLowerCase() + " variantni tanladingiz.",
          notes: [{ principle: "C3-001", text: "…", verdict: i === 1 ? "good" : "weak" }],
          effects: []
        });
      }

      return {
        update: function () {},
        draw: function (ctx) {
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          for (var i = 0; i < boxes.length; i++) {
            var b = boxes[i];
            ctx.fillStyle = sel === i ? "rgba(52,40,26,.98)" : "rgba(28,23,19,.94)";
            ctx.fillRect(b.x, b.y, b.w, b.h);
            ctx.strokeStyle = sel === i ? "#d9a44c" : "rgba(217,164,76,.30)";
            ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
            ctx.fillStyle = "#e6dac8";
            ctx.font = "15px 'Segoe UI', system-ui, sans-serif";
            ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
          }
          ctx.textAlign = "left";   // leave the context as you found it
        },
        onKey: function (key) {
          var n = parseInt(key, 10);
          if (n >= 1 && n <= boxes.length) pick(n - 1);
        },
        onPointer: function (x, y) {
          var cx = x - MOUSE_X, cy = y - MOUSE_Y;
          for (var i = 0; i < boxes.length; i++) {
            var b = boxes[i];
            if (cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h) { pick(i); return; }
          }
        }
      };
    }
  });
})();
```

---

## 2. The archetype taxonomy

Derived from the six shipped games. These are the *kinds of decision* that work
in this engine — not the games themselves.

| # | archetype | the player must… | shipped example | length |
|---|---|---|---|---|
| 1 | **Choose with hidden information** | pick from a set where one option is only right if you learned something earlier | `giftShop` (ch1) — the expensive gift *cannot* win; the football gift does, if you asked | 15–25s |
| 2 | **Self-framing sequence** | commit to a small number of moves *in order*, where the first move sets the frame that prices the rest | `firstNinety` (ch2) — 3 of 6 moves; the first one doubles the cost of the axis you neglected (`chapter2.js:181-185`) | 15–30s |
| 3 | **Timing / aim skill** | execute a physical action inside a window | `ballPlay` (ch1) — five kicks, strike the sweeping marker | 20–30s |
| 4 | **Cumulative chain** | answer a run of moments in different registers; no single answer decides, the sum does | `travelTalk` (ch1) — five moments × lead / soft / trap, win at `trust >= 7` of 10 | 40–60s |
| 5 | **Match against intel** | connect a specific fact to a specific person | `complimentRun` (ch2) — the right sentence for *this* pupil, given the fact card | 30–45s |
| 6 | **Allocation under a budget** | spend a scarce resource across competing claims, where you cannot have everything | `registerRun` (ch2) — 70s buys 14 names (3s) or details (4s); wrong names cost 5s **and** trust | 70s clock |

> **`registerRun` is dead code.** It is registered at
> `js/data/minigames/chapter2.js:580` (~420 lines) but **no story node ever
> references it** — the only `game:` nodes in chapter 2 are `firstNinety`
> (`chapter2.js:367`) and `complimentRun` (`chapter2.js:723`). The `names` beat
> is delivered by an NPC scene instead. It passes every gate, because nothing
> checks that a registered game is actually reachable. **See §8, anti-pattern 7.**
>
> Its intel branch is inert too: the ids it pre-fills (`intel_zarina`,
> `intel_bekzod`, `intel_jasur`, `chapter2.js:608-620`) are never granted
> anywhere. The granted ids are `intel_zarina_leader`, `intel_bekzod_new`,
> `intel_bekzod_way`, `intel_jasur_joke`, `intel_jasur_leader`. Wiring the game
> without mapping those ids would leave §4.2's pattern unreachable.

### Which archetype for which beat

| the beat is about… | use |
|---|---|
| noticing something specific about a person | 5 (match against intel) |
| choosing under incomplete knowledge | 1 (hidden info) |
| prioritising when you cannot do everything | 6 (allocation) |
| a procedure under time, where one thing must be sacrificed | 6 (allocation) — *not* a new "record it all" archetype |
| a physical/social skill with a window | 3 (timing) |
| planning a short sequence | 2 (self-framing sequence) |
| a relationship built over several exchanges | 4 (cumulative chain) |

---

## 3. The "is it a minigame?" test

The project standard, stated in
[CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md):

> **A minigame must demonstrate, not quiz. If it would work as a multiple-choice
> question, it is not a minigame yet.**

Operational version. Your beat needs a minigame **only if all four are true**:

1. **The player must *do* the thing, not recognise it.** Reading four options
   and picking one is recognition. Ordering, aiming, allocating, matching under
   time — that is doing.
2. **There is a state the player can get wrong in a way they can feel.** If the
   worst case is "you picked option 3 and it was wrong", it is a quiz.
3. **Intel changes how it plays**, not merely the text around it. (See §4 — this
   is the non-negotiable one.)
4. **Failure costs something but does not dead-end.** A loss routes to
   `onLose`, which continues the chapter with a worse state.

If any is false, **do not build a minigame** — use a `choice` node. A chapter
with no minigame is fine. A chapter with a fake minigame is worse than one with
a plain choice, because it wastes the player's time and teaches them the game is
not serious.

### Pass / fail examples from the shipped set

| | passes / fails | why |
|---|---|---|
| gift shop where the expensive item cannot win | **passes** | the *choice* is a test of whether you listened; you cannot brute-force it |
| "Which gift is best? A, B, or C" as a choice node | **fails** | it is a quiz; the interaction adds nothing |
| firstNinety: 3 of 6 moves under a first-move frame | **passes** | the frame makes the neglected axis expensive, so the sequence is a real priority decision |
| "How many pupils should you greet? 3/7/14" | **fails** | a number, not a skill |
| complimentRun: match the specific thing to the specific pupil | **passes** | mis-matching produces a *specific* wrong compliment, which the debrief can name |
| a memory game unrelated to the lesson | **fails** | construct-irrelevant: it measures memory, not hospitality |

---

## 4. How the teaching is wired mechanically

**This is the most important section in the file.** A minigame teaches only when
the intel the player gathered changes the game itself.

There are five wired patterns. Use them in this order of strength: **4.4 change
the scoring** is the strongest, **4.1 unlock an option** the most legible.

### 4.1 Unlock an option, and keep the lock visible

`travel.js:144, 353-366` — two topics exist only if you learned them, and the
locked one is still *drawn*:

```js
if (opt.intel && !has(opt.intel)) { sfx("bad"); lockedFlash = 1.6; return; }
txt(ctx, locked ? opt.text + "  (daftarda yo'q)" : opt.text, 74, y + 22, ...);
```

The locked row **is** the lesson: the player sees the sentence they could have
said. Never silently drop a gated option — that hides the cost of not listening.

> **Do not copy chapter 2 here.** Its story data has **zero `requires` and zero
> `lockedText`**; all 17 of its intel ids are write-only, so its information
> economy is decorative. Chapter 1 gates three real options in
> `timur_start/tm_q` (`intel_football`, `intel_sick`, `intel_quiet`). A chapter
> with no gate cannot teach the player that what they learned mattered.

### 4.2 Reveal information the player already owns

The register-pre-fill shape — notebook entries become visible starting state:

```js
var intel = (api.state && api.state.intel) || [];
function has(i) { return intel.indexOf(i) >= 0; }
if (has("intel_zarina")) pre.push("Zarina");
```

The player who asked three questions walks in with three names already filled in;
the player who asked none learns them under time pressure. **The minigame is the
same game; the *experience* is different.** That is the standard.

`gift.js` does the visible half (`drawNotes()`, 355-372): it renders a
"DAFTARINGIZDAN" chip column of the intel it is about to use. Do both — consume
the intel *and* show the receipt.

> **Caveat, verified:** the shipped example of this pattern is `registerRun`
> (`chapter2.js:608-620`), which is **dead code** — and the ids it tests
> (`intel_zarina`, `intel_bekzod`, `intel_jasur`) are **never granted anywhere**.
> The granted ids are `intel_zarina_leader`, `intel_bekzod_new`,
> `intel_bekzod_way`, `intel_jasur_joke`, `intel_jasur_leader`. So even once
> wired, its branch would never fire. Copy the *shape*, and check that your intel
> ids are the ones your scenes actually hand out.

### 4.3 The five wiring modes

| # | mode | mechanism | when |
|---|---|---|---|
| 1 | **Unlock an option** | an otherwise-disabled choice becomes available | the intel is a fact that enables a specific action |
| 2 | **Reveal information** | pre-fill, annotate, or highlight in the game UI | the intel is data the player can use at a glance |
| 3 | **Reduce difficulty** | fewer items, more time, clearer cues, one fewer distractor | the intel is understanding that makes the task easier |
| 4 | **Change scoring** | a choice scores better/worse depending on intel | the intel changes what *correct* means |
| 5 | **Change the narrative result** | the ending text / `onWin` differs by what you knew | the intel changes what the outcome means |

### 4.4 Code pattern for each

**1 — unlock an option**

```js
var canDoSpecific = has("intel_zarina");
// in draw: grey it out if !canDoSpecific; in onPointer: return early if !canDoSpecific
```

**2 — reveal information**

```js
if (has("intel_bekzod_tomorrow")) {
  ctx.fillStyle = "#d9a44c";
  ctx.fillText("(ertaga qaytadi)", x, y);   // an annotation only you can see
}
```

**3 — reduce difficulty**

```js
var distractors = has("intel_names_method") ? 2 : 4;   // knowing the method removes noise
var timeLimit   = has("intel_rule_reason") ? 20 : 12;  // knowing why buys time
```

**4 — change scoring**

```js
var bestCompliment = has("intel_bekzod_way") ? "specific" : "safe";
var win = (choice === bestCompliment);
```

**5 — change the narrative result**

```js
api.finish({
  win: true,
  choiceId: has("intel_jasur_leader") ? "CH2_MG_JASUR_BEST" : "CH2_MG_JASUR_OK",
  detail: has("intel_jasur_leader")
    ? "Jasur kuldi — va bu safar kulish bilan birga o'rindiqqa o'tirdi."
    : "Jasur jim qoldi. Bu g'alaba emas — lekin mag'lubiyat ham emas.",
  effects: []
});
```

### 4.5 The rule

> **If the minigame plays identically whether or not the player did the earlier
> work, the teaching is in the debrief only — and the minigame is decoration.**

A minigame like that should probably be a `choice` node. Build a minigame when
you can point at the line of code where the earlier intel changes something.

---

## 5. Scoring and the win/lose contract

### 5.1 Partial wins

Do not make every result binary. `complimentRun` emits three distinct choice ids
(`CH2_MG_COMPLIMENT_WRONG`, `_OK`, `_BEST`) mapped to three notes. The player
learns *how* they did, not just whether they passed.

**Pattern: 2–3 outcome tiers, each with its own `choiceId` and `choiceNotes`
entry.** Every `choiceId` must exist in `choiceNotes` or the validator fails.

### 5.2 Notes carry the teaching

```js
notes: [{
  principle: "C2-005",                 // must be a real principle id
  text: "Siz uning aytgan gapini takrorladingiz — o'z so'zingiz bilan aytmadingiz.",
  verdict: "weak"                      // good | ok | weak | bad
}]
```

`verdict` drives the score: `good` +1, `bad` −1, `ok`/`weak` no change but they
still appear in the debrief. Use `weak` for "you did it but it did not land".

### 5.3 A loss must not dead-end

```js
onWin:  "ns_win",
onLose: "ns_lose"
```

Both must route to a node that continues the chapter. The `onLose` scene should
**name the cost** — a trust hit, a missed intel, a worse ending — and then move
on. See `ns_lose` in `js/data/chapter2.js`.

**Never** make a lost minigame retry-until-win. It destroys the scarcity that
makes the choice matter, and it teaches that the game can be beaten by
persistence rather than by attention.

### 5.4 What the debrief needs from the result

- a `detail` string a human can read (shown on the `Natija` tab)
- at least one note with a principle
- a `choiceId` with a `choiceNotes` entry (`why`, `cost`, `alternative`)

Without these the minigame is invisible in the teaching payload.

---

## 6. Feel and readability without assets

There are no image files. Every pixel is canvas drawing, so readability is a
discipline.

### 6.1 Palette

Warm, low-contrast-outside / high-contrast-inside panels:

| role | value |
|---|---|
| panel fill | `rgba(28,23,19,.94)` |
| selected fill | `rgba(52,40,26,.98)` |
| border | `rgba(217,164,76,.30)` |
| selected border | `#d9a44c` |
| body text | `#e6dac8` |
| bright text | `#fff5e2` |
| muted text | `rgba(180,170,155,.7)` |
| success | `#7fb86b` |
| failure | `#c4553f` |

Run `node tools/color-inventory.js` to see the real inventory before inventing a
colour.

### 6.2 Typography

`'Segoe UI', system-ui, sans-serif`. Sizes in the shipped games: title 17–20px,
body 13–15px, small 11–12px. **Anything under 11px is not readable on a phone.**

### 6.3 Hit targets

Minimum **44 × 44 content-space px** (Apple/Android guidance), and the shipped
games are larger. A row you can only hit with a precise click is a bug on touch.

### 6.4 Affordances

Every interactive element must show all four states:
`idle` → `hover` → `selected/active` → `disabled`.

### 6.5 Pointer AND keyboard — both, always

This is a **standing project constraint** and it is tested separately, because a
canvas surface can look perfect and be untouchable.

- `onPointer` receives **screen** coords: subtract `(54,108)`.
- `onKey` receives `"1".."9"`, `"enter"`, `"space"`, `"escape"`, arrows,
  `"a"/"d"/"w"/"s"`, `"r"`, `"tab"`.
- Both must be able to complete the game. A pointer-only minigame is unplayable
  for a keyboard player; a keyboard-only minigame is unplayable on a phone.

### 6.6 The textAlign trap

`ctx.textAlign` and `ctx.textBaseline` are **sticky across draw calls**. If you
`fillText` at an x you computed by adding a left margin, set
`ctx.textAlign = "left"` first. Six separate bugs in this project came from this.

### 6.7 Verify readability with the real tool

```powershell
node tools/audit-text.js
```

It measures real canvas metrics against the 960×600 viewport. A red result means
a player can see the problem. Do not loosen its thresholds.

---

## 7. Build order for a new minigame

1. **Confirm the beat needs one** — run the §3 four-part test.
2. **Pick the archetype** — §2, from what the beat is *about*.
3. **Name the intel that will change it** — §4. If there is none, stop; use a
   choice node.
4. **Decide the outcome tiers and their `choiceId`s.** Prefix them
   (`C3_MG_*`). Write the ids as **full string literals** — the validator finds
   them by regexing `"C3_[A-Z0-9_]+"`, so a concatenated id escapes validation
   silently.
5. **Write `create(api)`** — state, boxes/entities, `update`, `draw`, `onKey`,
   `onPointer`, a guarded `finish`.
6. **Register it** in a file that loads before `js/main.js`.
7. **Reference it** from a story node: `{ type: "minigame", game: "id",
   onWin: "…", onLose: "…", config: {} }`.
8. **Add `choiceNotes`** for every `choiceId`.
9. **Run the gates:**
   ```powershell
   node tools/validate-chapterN.js     # registration + choiceNotes coverage
   node tools/audit-text.js            # overflow
   node tools/playtest.js --chapter=chN # it can be reached and completed
   node tools/probe-mobile.js          # touch still works
   ```
10. **Prove it is reachable.** Nothing checks this automatically — see §8.7.
11. **Try to break it:** mash keys, click outside every box, resize, press escape
    mid-game, finish twice.

---

## 8. Anti-patterns

1. **The quiz in a costume.** Four options, one right, animated. *Fix:* the §3
   test — the player must *do* something.
2. **Intel does not matter.** The game plays the same regardless of what was
   learned. *Fix:* wire one of the five modes in §4.3.
3. **Pointer-only or keyboard-only.** Half the players cannot play it. *Fix:* both
   routes into every action, tested separately.
4. **A loss dead-ends or forces a retry.** Destroys scarcity. *Fix:* `onLose`
   routes forward and the cost is named.
5. **Drawn outside 852×418.** Silently clipped; the player sees a chopped UI.
   *Fix:* lay out inside the content rect; the host already translated for you.
6. **`finish()` called twice, or from `draw`.** Undefined routing. *Fix:* the
   `finished` guard, called from `update`/input only.
7. **Registered but unreachable — the `registerRun` bug.** ~460 lines of dead
   code shipped in chapter 2 because nothing asserts a registered game is
   referenced by a node. *Fix:* after registering, grep the story data for the
   game id, and add the assertion to your chapter validator. **A registered game
   that no node reaches passes every gate.**
8. **Too long.** A minigame that takes more than ~90 seconds breaks the pacing of
   a 45-minute chapter and makes a re-play tedious. *Fix:* target 15–60 seconds
   (the shipped five run 15–60s; `registerRun` is the only 70s outlier and it is
   unused); time it for real.
9. **The teaching is only in the post-hoc note.** The player learns the principle
   from the debrief text but the game itself never required it. *Fix:* §4.5 —
   point at the line where intel changes the play.
10. **Ignoring the controls footer.** The player does not know the keys. *Fix:*
    fill in `controls` with the real keys, and support pointer as well.

---

## 9. The minigame checklist

- [ ] The beat passed the §3 four-part test.
- [ ] It fits one of the six archetypes, or you can justify a new one.
- [ ] **At least one intel id changes how it plays** (name the line of code).
- [ ] Every `choiceId` is a full string literal, prefixed, and has a
      `choiceNotes` entry.
- [ ] `win` + `onWin` / `onLose` both route forward; neither dead-ends.
- [ ] `finish()` is guarded and called exactly once, never from `draw`.
- [ ] Content drawn entirely inside 852×418; mouse hit-tests subtract (54,108).
- [ ] Both pointer and keyboard can complete it.
- [ ] All interactive elements show idle / hover / selected / disabled.
- [ ] Hit targets ≥ 44×44 content px.
- [ ] `ctx.textAlign` set explicitly wherever text is drawn at a computed x.
- [ ] Plays in 15–60 seconds when timed for real.
- [ ] **Referenced by an actual story node** (the `registerRun` bug).
- [ ] `audit-text.js` green; `playtest --chapter=chN` reaches the debrief.
