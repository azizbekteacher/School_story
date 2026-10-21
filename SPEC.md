# SPEC — "Sulton School: Birinchi kun" (Unreasonable Hospitality mission 1)

Top-down 2D, GTA-like (walk around a world, talk, choose, play small activities).
Vanilla HTML/CSS/JS. **No build step. No ES modules. No external assets. No network.**
Every file is a classic script that attaches to the global `window.G`.

## 0. Hard rules for every contributor

1. No `import` / `export`. No npm packages. No image/audio files — draw and synthesize everything.
2. Never `fetch`, never `XMLHttpRequest`. Runs by double-clicking `index.html`.
3. Attach to globals only:
   ```js
   window.G = window.G || {};
   G.data = G.data || {};
   ```
4. Do not redefine another contributor's globals. You own only the file assigned to you.
5. Plain ES2019 JavaScript that runs in Chrome/Edge. No optional chaining needed but allowed.
6. All user-facing text in **Uzbek** (Latin script), conversational. English only for code comments.
7. Keep every line you write inside the file boundaries of your assignment.

## 1. Files and ownership

| File | Owner | Purpose |
|---|---|---|
| `index.html`, `css/style.css` | Lead | shell |
| `js/core/*.js` | Lead | input, render, audio, util |
| `js/world/map.js`, `js/world/world.js` | Lead | tilemap, camera, player, NPCs |
| `js/game/dialogue.js`, `quest.js`, `state.js`, `notebook.js`, `debrief.js`, `minigames.js` | Lead | systems |
| `js/main.js` | Lead | boot + loop |
| `js/data/story.js` | **Agent A** | mission script |
| `js/data/minigames/gift.js`, `travel.js`, `ball.js` | **Agent B** | the three activities |
| `js/data/learning.js` | **Agent C** | principles, debrief, ideas, difficulties |

Load order in `index.html` (fixed):
`util → input → audio → render → map → world → state → minigames → dialogue → notebook → quest → debrief → data/story → data/learning → data/minigames/* → main`

`js/data/story.js` must **not** assume `G.data.learning` exists at load time; only at runtime.
`js/data/learning.js` must **not** assume story exists at load time.

---

## 2. THE MISSION (canonical beats, choice IDs — do not rename)

Hero: **Azizbek**, first day as mathematics teacher at Sulton School.
Student: **Timur**, 5-B, silent, "behind in maths". Mother: **Nodira opa**.
Manager: **Abu Bakr**. Colleague: **Oqil** (cynic who says Timur is hopeless).
Shopkeeper near the gate: **Sardor aka**.

Theme the mission teaches:
> **Service is black and white — hospitality is color. Thoughtfulness beats luxury.**

Beats, in order. The `beat` id string is the flag the engine uses to route dialogue and objectives:

| # | beat id | Where | Objective shown to player |
|---|---|---|---|
| 1 | `arrive` | gate | `O'qituvchilar xonasiga kir` |
| 2 | `staffroom` | staffroom | `Abu Bakr bilan gaplash` |
| 3 | `oqil` | staffroom | `Oqil bilan gaplash` |
| 4 | `mother` | gate | `Nodira opa bilan gaplash` |
| 5 | `lesson` | classroom | `5-B sinfiga kir` |
| 6 | `timur` | classroom | `Timur bilan gaplash` |
| 7 | `gift` | shop | `Timur uchun kichik bir narsa top` |
| 8 | `walk` | yard | `Timurni uyiga kuzatib bor` |
| 9 | `report` | gate | `Nodira opaga hisobot ber` |
| 10 | `done` | — | `Birinchi kun tugadi` |

Each beat is reached by an effect `{ "beat": "<id>" }` inside the relevant scene, not by position.

### Required choice IDs (scoring keys — must exist exactly once each)

Dialogue choices:
- `ABQ_1` agree flatly with timetable-first → service only
- `ABQ_2` ask about the school's bigger vision → hospitality-curious (best)
- `ABQ_3` push back / lecture the manager → overreach
- `OQ_1` accept "Timur is hopeless, just check homework" → complicit efficiency
- `OQ_2` ask Oqil what he has actually observed about Timur → intel-oriented (best)
- `OQ_3` dismiss Oqil's cynicism aggressively → friction
- `MOM_Q1` ask about the illness / missed weeks → intel `intel_sick`
- `MOM_Q2` ask what Timur loves outside lessons → intel `intel_football`
- `MOM_Q3` ask when Timur went quiet → intel `intel_quiet`
- `MOM_Q4` ask what changed at home → intel `intel_home`
  *(These four are gathered with a "pick 2 of 4" node — engine supports it.)*
- `LES_1` open the lesson with the textbook, page 1 → service only
- `LES_2` open with something from Timur's world → hospitality (best)
- `LES_3` call Timur out in front of everyone → harm
- `NOT_1` notice the football socks / boots → uses `intel_football`
- `NOT_2` notice he came back after being ill → uses `intel_sick`
- `NOT_3` notice he writes in the margins of his notebook → uses `intel_quiet`
- `NOT_4` notice nothing, just mention the test → cold
- `REP_1` report: "u dangasa, uy vazifasini qilmadi" → labelling (worst)
- `REP_2` report one specific observation + one next step → best
- `REP_3` report only the grade/mark → service only
- `REP_4` over-promise that Timur will be top of class → overreach

Minigame choice ids come from minigames: `GIFT_<itemId>`, `TRAVEL_<topicId>`, `BALL_<result>`.

### Intel flags (set via `{ "intel": "id" }`)

`intel_sick`, `intel_football`, `intel_quiet`, `intel_home`, `intel_oqil` (from Oqil if you ask),
`intel_budget` (mother says the school has no money to spend on gifts — engine grants this at beat `mother`).
Intel shows up in the notebook (GTA-style) and unlocks gated options.

Guidance is content, not code: **every** gated option must have a fallback when the intel is missing (so the player is never stuck).

---

## 3. Contract — `js/data/story.js` (Agent A)

```js
window.G = window.G || {}; G.data = G.data || {};

G.data.story = {
  id: "mission1",
  title: "Birinchi kun: Timur",
  subtitle: "Sulton School — 1-kun",
  brief: [ "line", "line" ],          // 2-4 short lines, shown on the title card

  npcs: [
    {
      id: "abubakr",                   // unique
      name: "Abu Bakr",
      role: "Direktor o'rinbosari",
      zone: "staffroom",               // see zone list below
      at: 0,                           // anchor index inside that zone, 0-5
      palette: "adult_male",           // "adult_male" | "adult_female" | "boy" | "shopkeeper" | "teacher_female"
      facing: "down",
      activeWhen: null,                // optional { flag: "x" } or { beat: "y" } or { notBeat: "z" }
      entry: {                         // which scene node starts when player presses E
        default: "abq_start",
        staffroom: "abq_start2"        // keyed by current beat id; falls back to default
      }
    }
  ],

  triggers: [                          // automatic on entering a zone with a beat active
    { zone: "classroom", beat: "lesson", scene: "classroom_arrival", once: true }
  ],

  objectives: { arrive: "O'qituvchilar xonasiga kir", /* one per beat */ },

  scenes: {
    abq_start: {
      nodes: {
        abq_start: {
          type: "say",
          speaker: "Abu Bakr",
          text: "Xush kelibsiz! ...",
          next: "abq_q1"
        },
        abq_q1: {
          type: "choice",
          prompt: "Nima deysiz?",
          options: [
            { id: "ABQ_1", text: "...", next: "abq_r1", effects: [] },
            { id: "ABQ_2", text: "...", next: "abq_r2", effects: [] }
          ]
        },
        abq_r1: { type: "say", speaker: "Abu Bakr", text: "...", next: "abq_end" },
        abq_end: { type: "end", effects: [ { seed: true } ] }
      }
    }
  }
};
```

### Node types (exact)

```js
{ type:"say", speaker:"Name", text:"...", next:"nodeId", effects:[] }
//   speaker may be "" for narration / the hero's inner voice → style it differently.
//   `next` omitted or null ends the scene.

{ type:"choice", prompt:"...", options:[
    { id:"ABQ_1", text:"...", next:"nodeId", effects:[...],
      requires:{ intel:"intel_football" },      // optional gate
      lockedText:"..." }                        // optional text shown for locked option
], effects:[] }

{ type:"multi", prompt:"...", max:2, options:[
    { id:"MOM_Q1", text:"...", intel:"intel_sick", next:"mom_a1" }
], next:"nodeId", effects:[] }
//   Player picks up to `max` (press 1-9 / click). Each chosen option runs its `next` node
//   then returns to the same multi list; when max reached or player presses ENTER,
//   continue to `next`. Options already chosen are marked and disabled.

{ type:"minigame", game:"giftShop", config:{}, onWin:"nodeId", onLose:"nodeId", effects:[] }

{ type:"end", effects:[...] }
```

### Effect DSL (exact — engine applies)

```js
{ flag:"met_oqil" }                 // set boolean flag true
{ flag:"x", value:false }           // set explicit value
{ intel:"intel_football" }          // add to notebook intel
{ trust:2 }                         // add to trust meter (-5..+10)
{ beat:"oqil" }                     // advance mission beat (also updates objective)
{ journal:"short note" }            // free note appended to notebook
{ note:{ principle:"I-043", text:"..." } }   // scored moment, logged for debrief
{ objective:"free text" }           // temporary objective override
{ endMission:true }                 // jump to debrief screen
```

`note` is the scoring primitive: whenever a choice reflects a principle (good or bad),
emit a `note` with the principle id and one-line reason. Do this on **every** meaningful choice.

### Writing requirements for the mission script

- 700–1200 lines. This is the heart of the game — write full, lived-in dialogue, not placeholders.
- The three "reasonable" temptations must feel genuinely reasonable, not strawmen:
  Oqil is tired and has 7 classes; Abu Bakr is protecting a fragile timetable; the mother
  only wants homework done. The player should feel the pull.
- Show the School's real texture: timetable, corridor noise, tarbiya, parents waiting at the gate.
- The mother scene must make "pick 2 of 4" feel like a hard trade-off (she is in a hurry).
- `NOT_*` options: `NOT_1`, `NOT_2`, `NOT_3` are gated by their intel; `NOT_4` always available.
- `REP_*` scene must pay off what the player actually did (use `requires` on flags).
- End the mission with `{ endMission:true }` inside the `report` scene success branch.
- Never leave a `next` pointing to a node id that does not exist in the same scene file.
- Do not invent new effect keys. Do not invent new node types.

---

## 4. Contract — minigames (Agent B)

Three files, each registering one game. Engine provides a 960×600 logical canvas overlay.

```js
window.G = window.G || {};
G.minigames = G.minigames || { list: {}, order: [], register: function (id, def) { this.list[id] = def; this.order.push(id); } };

G.minigames.register("giftShop", {
  title: "Sardor akaning do'koni",
  subtitle: "Timur uchun kichik bir narsa tanlang",
  controls: "1-4 yoki sichqoncha — tanlash · ENTER — tasdiqlash",
  principleIds: ["I-043"],
  create: function (api) {
    // api: see below
    return {
      update: function (dt) {},          // dt in seconds, capped at 0.05
      draw: function (ctx) {},           // draw into 960x600 logical space
      onKey: function (key) {},          // "1".."9","enter","escape","arrowleft","arrowright","arrowup","arrowdown","space"
      onPointer: function (x, y, type) {} // type: "down"
    };
  }
});
```

`api` object:

```js
{
  w: 960, h: 600,
  cfg: {},                     // node.config from the story
  state: {                     // live read-only view of the run
    flags: {}, intel: ["intel_football"], trust: 3, beat: "gift", scores: {}
  },
  mouse: { x: 0, y: 0 },       // logical coords of pointer
  sound: {
    blip: function (freq) {},  // short blip, freq optional
    good: function () {},
    bad: function () {},
    win: function () {}
  },
  finish: function (result) {} // call EXACTLY ONCE, then the engine takes over
}
```

`result` shape:

```js
{
  win: true,
  choiceId: "GIFT_ball",       // must be unique, see naming below
  detail: "Arzon koptok — onasi pul sarflashni xohlamaydi, lekin bu uning dunyosiga tegadi.",
  notes: [ { principle: "I-043", text: "..." } ],  // optional extra scored moments
  effects: [ { intel: "intel_ball_given" }, { trust: 2 } ]  // optional, same DSL as story
}
```

### Game 1 — `giftShop` (`js/data/minigames/gift.js`)

Shopkeeper **Sardor aka**. Four items on shelves, each with a price in so'm.
Player reads item descriptions, picks one, confirms. Shopkeeper reacts.

Items (ids fixed):
- `GIFT_boots` — 480 000 so'm, expensive football boots. Too much; mother said don't spend.
- `GIFT_ball` — 45 000 so'm, cheap ball. Best if player has `intel_football`.
- `GIFT_notebook` — 18 000 so'm, notebook. Good if `intel_quiet` (he writes in margins).
- `GIFT_box` — 0 so'm, an empty box + ribbon: the hero makes something himself.
  Best overall (thoughtfulness > luxury) — and it is the only choice that respects
  the mother's "don't spend money" instruction **and** creates a personal moment.

Scoring rules the game should embody:
- `GIFT_boots` → win:false, price objection + mother's instruction broken.
- `GIFT_ball` → win:true if `intel_football` in `api.state.intel`, else win:false (random guess).
- `GIFT_notebook` → win:true if `intel_quiet`, else weak win (generic).
- `GIFT_box` → always win:true, but the game should let the player see that it costs nothing
  and that *what you put in it* is the point. Give it the strongest note.
`api.state.intel` tells the game what the player learned. Read it — behaviour must differ.

Interaction: 1-4 or arrows to move a selection cursor across the shelf, ENTER to confirm,
then a short shopkeeper reaction line, then `api.finish(...)`.

### Game 2 — `travelTalk` (`js/data/minigames/travel.js`)

Walking Timur home. A bonding gauntlet: 5 conversational moments, each with 3 topics.
A **trust meter** (0–10) rises/falls. Topics are gated by intel and by trust level.
Must include at least 2 moments where the naive "teacher" topic is a trap
(e.g. asking about marks kills the mood) and the right answer is to follow *his* lead.
Reaching trust ≥ 7 = win. Below = soft fail (still continues story, different payoff).

`choiceId` scheme: `TRAVEL_<n>_<a|b|c>` — e.g. `TRAVEL_1_b`.
Also emit `notes` for principles.

Make it feel like an actual bus/walk: parallax background, the boy beside you, mood indicator.
5 moments, 3 options each, no timers required (but a subtle idle nudge is fine).

### Game 3 — `ballPlay` (`js/data/minigames/ball.js`)

Short skill game: Timur kicks the ball, hero must keep it up / pass back.
Simplify to: a moving timing bar, press SPACE when the marker is in the green zone; 5 rounds.
3+ hits = win. Draw the yard, the boy, the ball, a simple arc.
`choiceId`: `BALL_win` / `BALL_lose`. Emit a note about play as relationship, not reward.

### Requirements for all three

- Must be playable with keyboard alone. Mouse is a bonus.
- Show the controls line on screen for the first ~4 seconds.
- Never call `api.finish` twice. Never call it inside `draw`.
- No external fonts/images.
- 250–450 lines each. Poor-man's polish: gradients, shadows, easing — but no libraries.

---

## 5. Contract — `js/data/learning.js` (Agent C)

This is the *teaching payload*. It must genuinely teach, not decorate.

```js
window.G = window.G || {}; G.data = G.data || {};

G.data.learning = {
  principles: {                        // keyed by id
    "I-001": {
      id: "I-001",
      name: "Service b/w, hospitality color",
      source: "Unreasonable Hospitality, Ch. 1",
      gist: "1-2 sentences.",
      atSulton: [ "concrete thing at Sulton School", "..." ],
      spotIt: [ "how you notice this in a real day", "..." ]
    }
  },

  intel: {                             // notebook labels
    "intel_football": { label: "Timur futbolni yaxshi ko'radi", usedFor: "gift, lesson hook" }
  },

  // One entry per choice id in SPEC §2. Engine shows these in the debrief.
  choiceNotes: {
    "ABQ_1": {
      principle: "I-001",
      verdict: "good" | "ok" | "weak" | "bad",   // drives colour
      title: "Short verdict line",
      why: "Why this lands or fails, in plain language.",
      cost: "What it costs you later (optional, may be null).",
      alternative: "A different way to do the same moment."
    }
  },

  // Data-driven debrief narrative. All optional; engine has fallbacks.
  archetypes: [
    {
      id: "artist",
      when: { minAvg: 1.6 },           // { minAvg, maxAvg, requiresIntel:[], requiresFlags:[] }
      title: "Unvon",
      text: "Paragraph describing the player's pattern today.",
      watchOut: "The risk of this style."
    }
  ],

  ideas: [                             // concrete implementations to try at Sulton School
    {
      id: "idea-corner",
      title: "...",
      what: "One line.",
      how: [ "step", "step", "step" ],
      effort: "low" | "medium" | "high",
      cost: "so'm / none",
      difficulty: "What actually gets in the way, honestly.",
      principle: "I-043",
      firstWeek: true                 // include in the "try this Monday" list
    }
  ],

  difficulties: [                      // honest obstacles of the whole approach
    {
      id: "d-time",
      title: "...",
      why: "Why it is genuinely hard.",
      mitigation: "What actually helps.",
      principle: "I-028"
    }
  ]
};
```

### Content requirements for Agent C

- `principles`: exactly these six ids (copy gist accurately from the book extraction):
  `I-001` service vs hospitality, `I-002` enlightened hospitality (employees first),
  `I-028` being present vs being attentive, `I-043` thoughtfulness not luxury,
  `I-044` systemize what is unique, `F-013` the unreasonable-hospitality execution engine
  (listen → classify one-off vs pattern → execute → retain the story).
- `choiceNotes`: cover **every** choice id listed in SPEC §2 (all `ABQ_*`, `OQ_*`, `MOM_Q*`,
  `LES_*`, `NOT_*`, `REP_*`) plus `GIFT_boots|ball|notebook|box`, `TRAVEL_*` (you may key
  `TRAVEL_1_a` style precisely; if unsure, also provide `TRAVEL_win`/`TRAVEL_lose` fallbacks),
  and `BALL_win`/`BALL_lose`.
- `ideas`: 8–10 concrete, cheap, Sulton-specific implementations. Each must name the real
  obstacle. Ground them in his context: 5-B, 14-student groups, parents at the gate,
  classes in Almazz/Buxoro, timetable pressure, no budget, tarbiya, future branches.
- `difficulties`: 6–8 honest ones (time, colleagues' cynicism, boundaries, doing it for
  every child, parent suspicion, being seen as showing off, no budget, burnout).
- Language: **English** is fine here (he plans in English) but Uzbek for a few vivid lines.
  Keep each `why` under ~45 words.
- 500–800 lines. Rich but every entry must be genuinely usable, not filler.

---

## 6. Engine behaviour the data can rely on

- Player walks with WASD/arrows. `E` or `SPACE` interacts with the nearest NPC within reach.
- Objective text always shown top-left. Minimap top-right. `TAB` opens the notebook
  (intel + journal + principles read so far + current trust).
- `ESC` pauses (no data involvement).
- Trust meter 0–10, starts 0, clamp.
- The debrief screen appears automatically at `endMission` or after the report scene,
  and lists: score by principle, every `note` collected, matched archetype, all
  `choiceNotes` for choices actually made, then `ideas` and `difficulties`.
- Missing data must never crash: engine guards every lookup.
