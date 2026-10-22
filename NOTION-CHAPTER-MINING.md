# Mining Notion for chapter material

How to get the raw material for a chapter out of the user's Notion workspace —
and, more importantly, how to tell which of it is usable.

This file assumes you have read [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md)
§3. It is the detailed procedure for **Stage 1 — Harvest**, source 1.

> **Never print, commit, or paste the Notion token.** It lives in the `notion`
> skill's `reference.md` (`~/.agents/skills/notion/reference.md`) and in the API
> headers at call time, nowhere else. This repository is public.

---

## 1. What is actually in there

One workspace is in scope: **Sulton School**. Every count below was measured by
walking the block tree on 2026-10-22 (`page_size=100`, paginating on `has_more`,
descending every `has_children` block). "Own" means the page's own subtree
**excluding child pages** — a distinction that matters twice (see the two traps
below the table).

| page | id | blocks | what it gives a chapter |
|---|---|---|---|
| **Extra info** | `4002d18e-3d59-8190-b53e-e9372914a594` | **8** (flat) | **the standing design rulings. Read this first — it is 8 blocks and it outranks your taste.** §2 step 0 |
| **Umumiy ma'lumotlar** | `3fe2d18e-3d59-80dd-b180-d14b06eac5fb` | **13 own** / 205 with child page | **the biography** — and it is *six bullets*, not a page. The other 192 blocks are the Fast English sales doc |
| **Logs** | `3fe2d18e-3d59-8043-a847-ff7e329d51d9` | **15 top / 158 all** | **his actual situation.** 10 dated toggles + 1 child page. The richest source for *why this chapter, now* |
| **Different insights** | `4002d18e-3d59-8062-aa66-cc0fecefe2d0` | **10** (flat) | **four concrete things he wants to do with a child.** Highest beat-per-block ratio in the workspace |
| **Book insights** | `4002d18e-3d59-8187-a7bd-c9e21cf223a3` | **1215, zero nesting** | the book, in his own highlights — **223 highlights + 7 notes**. The authority for quotations. **Its shape is not what you expect: see below** |
| **Ai review** | `3ff2d18e-3d59-8054-b6e1-cea7afa470c8` | **744 top / 828 all** | fast orientation to the book's arguments. **Secondary source — see §4.** 7 of its blocks are tables you lose if you read one page |
| **Ota-onalar bilan muloqot** | `3ff2d18e-3d59-80a3-b568-c86afd050f36` | **57 top / 77 all** | **a parent-conversation script**: 15–20 min, timed steps, literal Uzbek lines, stated success criterion. A scene already written — and not in the book |
| **1-dars** | `4002d18e-3d59-8016-80ab-d71fd70f2c30` | **11** | his own skeleton of lesson one: `Tanishuv` → olympiad → `Matematika foydalari` → `Madrasa` → `Sovg'alar berish` |
| **Role & workload plan** | `3ff2d18e-3d59-81d4-ae31-c7e829c2a3d9` | **58** (flat) | his workload argument: the real constraints a chapter must respect |
| **Tasks** (database) | `3ff2d18e-3d59-8099-ab10-f21d07681404` | **12 rows** (not 11) | what he has actually committed to doing. **5 of the 12 row-pages are empty** — see the row-by-row table below |
| **Book recommendations** | `3ff2d18e-3d59-8121-831b-fd38b1cb4c74` | 58 | what else he is reading; wider reading for a chapter. Noise for beats |
| **Innovation tasks** | `3ff2d18e-3d59-80e8-8b01-d6b96b54c591` | **6** | almost empty — one `Innovation insights` toggle with 3 filled lines ("its well-planned across all parties: teacher, student, parents, tarbiyachilar…", "Use principles from Ai review", "Design language: should be like O'quvchilardan yozma feedback") plus an unread child database. **Not "medium"** |
| **People** (database) | `d3d2d18e-3d59-82df-b0d8-014512d331ec` | **1 row** ("Azizbek") | who's who. One row is not a who's who — no chapter has ever needed it |

**The 12 Tasks rows, measured.** This is the table to check before planning a
chapter around "what he has committed to doing", because half of it is empty:

| row | blocks | is it usable? |
|---|---|---|
| `Haftalik test` `…-80b5-b319-e72f0e557f7d` | **157** | yes — a real weekly-test programme |
| `Har bir o'quvchi bilan og'zaki muloqot` `…-8064-80e8-e8cc8ae20ea2` | **154** | partly — real goals, then unanswered template prompts |
| `Avtobusda aylanishga olib chiqish` `…-80e3-b348-de5ae3f1029b` | 125 | **no** — a *proposal template*: real headings, a quote and a 12-item checklist, but every bullet is a prompt to be filled ("Muammoni bir jumlada ifodalang…") |
| `O'quvchilardan yozma feedback` `…-80a3-8118-d02c061e67f3` | **84** | yes — a real feedback-system design |
| `Ota-onalar bilan muloqot` `…-80a3-b568-c86afd050f36` | **77** | yes — the parent-meeting script (see §1) |
| `Teacher Training` `…-80f7-8379-cf989b9a9733` | 12 | marginally — a title, a "what is it" line, one goal, and empty headings |
| `Different insights` `4002d18e-…-8062-aa66-cc0fecefe2d0` | 10 | yes — 4 concrete ideas |
| `Podcast g'oya` `…-8070-8ade-d9161d7bd151` | **0** | empty |
| `Innovatsion muhit yaratish` `…-8058-a6d2-f331822d49f3` | **0** | empty |
| `Ingliz tili dars berishni zamonaviylashtirish` `…-80dd-84e1-d6e479f96064` | **0** | empty |
| `O'quv dasturlarni tizimlashtirish` `…-80cd-b5de-d12210fc1a32` | **0** | empty |
| `Tarbiya mutaxassisi` `…-80c0-9de0-fabac50f98b2` | **0** | empty |

**How to read the table:** **Extra info first** (8 blocks, and it contains the
rulings that kill bad ideas before you build them), then **biography + Logs +
Different insights**, then the book sources, then everything else. Do not start
with the book — the book is what you already have in
[UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) in
verified form. What Notion adds is **him**.

### Two shape traps that will waste your afternoon

**1. The 1215-block book page has zero nesting.** `has_children` is `false` on all
1215 blocks — I checked every one. It is **not** "deeply nested" and there are
**no toggles in it**. It is a Readwise export flattened into paragraph blocks,
**one per physical line**, so a quotation you want is split across 3–8 consecutive
blocks. The literal first blocks are:

```
idx 0  "Unreasonable Hospitality - Will Guidara (Highlight: 223; Note: 7)"
idx 1  ""
idx 2  "───────────────"
idx 3  ""
idx 4  "▪ ▪ The best part for me was scrolling through that private Instagram…"
```

**2. `Umumiy ma'lumotlar` is 205 blocks of which 192 are a different document.**
Its own subtree is 13 blocks; the biography proper is **six bullets** under the
heading `Azizbek Zubaydullayev`. The rest is the *Fast English* child page
(`88a2d18e-3d59-8287-8fad-81f480d70785`, 192 blocks, 34 toggles) — an
English-course product doc. Likewise `O'quv dastur`
(`4002d18e-3d59-8080-9ffb-d244f83f9183`) is literally one `child_page` block and
nothing else. **Always count a page's own subtree separately from its child
pages**, or you will plan a chapter around a sales brochure.

---

## 2. The mining procedure

Run this in order. Each step produces something the next step needs.

### Step 0 — the rulings, before anything else (1 call, 8 blocks)

```powershell
Invoke-RestMethod "https://api.notion.com/v1/blocks/4002d18e-3d59-8190-b53e-e9372914a594/children?page_size=100" -Headers $headers
```

Three bullets here are prior user rulings and they **outrank anything you like
better**. Verbatim:

> "Design framing for the school game is now two-layer: (1) the individual student
> must be seen as a specific person; (2) any gesture must become a repeatable
> system others can run, or it dies with the hero's energy. The two layers are in
> tension, not harmony."

> "Azizbek sees himself as wanting to 'completely revolutionize the school', not
> merely teach. Game missions must therefore never let the hero announce that
> ambition - it must be earned through one undeniable result the institution then
> wants to copy."

> "Rejected the tea-pouring mission concept as 'pointless, un-understandable,
> un-useful'. Kept and praised the visual design language ('felt like another
> universe'). Standing test for any mission: is it unusable at work, is the lesson
> illegible, is there no real stake."

That third one has already killed a concept. If your idea fails it, stop before you
spend 13 requests on the book.

The other three bullets are facts rather than rulings, and they are the ones that
make a chapter *specific* — the people in it and the date it starts:

> "2026-10-22: Sulton School starts Saturday 24 October 2026 as mathematics
> teacher; manager Abu Bakr; recruiter/colleague Oqil (math teacher)."

> "2026-10-22: Working Notion workspace is Sulton School only. Skill rewritten to
> drop all other workspaces; personal access token integration bot 'ss' connected."

> "2026-10-22: Game genre pivoted to GTA-like top-down adventure (walkable school
> zones, NPCs, decisions, mini-games) instead of a linear chain of abstract ritual
> mini-games."

Note the shape of this page: it opens with an instruction to itself — *"Append one
bullet per durable fact … Append-only: never rewrite or delete existing blocks"* —
which is why it is 8 blocks and trustworthy. It is the one page in the workspace
that is designed not to drift. **Read all six bullets; do not stop at the three
that happen to mention the game.** Abu Bakr and Oqil are people chapter 1 already
uses, and "starts Saturday 24 October 2026" is a date a chapter can hang a scene on.

### Step 1 — get the token without exposing it

```powershell
$token = (Select-String -Path "$env:USERPROFILE\.agents\skills\notion\reference.md" `
  -Pattern 'ntn_[A-Za-z0-9]+').Matches[0].Value
$headers = @{
  "Authorization" = "Bearer $token"
  "Notion-Version" = "2022-06-28"
  "Content-Type"  = "application/json"
}
```

Read it from **`reference.md`**. The token also appears in `SKILL.md` (same value
— I hashed both without printing them), but `reference.md` is the documented
location and the one place to look. The trap is not the file, it is **that the
token is a `ntn_` string prefixed with `Bearer ` in the header** — copy the
`ntn_…` part only, or you send `Bearer Bearer ntn_…` and get a 401 that says
`invalid token` and tells you nothing.

Never `Write-Host $token`. Never put it in a file under the repo.

### Step 2 — the biography (1 call, 13 blocks)

```powershell
Invoke-RestMethod "https://api.notion.com/v1/blocks/3fe2d18e-3d59-80dd-b180-d14b06eac5fb/children?page_size=100" -Headers $headers
```

This page is flat and it is **13 blocks**. Read every one. You are looking for:
role, dates, colleagues, ambitions, constraints, and anything that would make a
choice in a chapter personal. The six biography bullets are:

```
Me
IELTS 7,5
Teaching General English since 2019ʼ. Worked in Samarkand, Bukhara, Tashkent, online
Has been chempion of Bukhara regional olympiad in my 9th grade
Has studied in Kukaldash madrasa
Have been pplied in Sulton School as a math teacher, but want to completely
  revolutionize the school - bcs I am so interested in this field and the boss is
  open-minded for new ideas and innovations
```

**Output:** the first half of your dossier. Mark each fact CONFIRMED (he said it /
it is written here) vs INFERRED. Do not tidy his spelling — `chempion`, `pplied`,
`soʻrashv` are his, and a quotation you clean up is no longer a quotation.

### Step 3 — the Logs page (12 calls)

`Logs` is **entirely nested toggles**. One call gets you the toggle blocks, not
their content. You must descend twice:

```powershell
# level 1: 15 blocks — 1 unsupported, 10 toggles, 3 paragraph, 1 child_page
$top = Invoke-RestMethod "https://api.notion.com/v1/blocks/3fe2d18e-3d59-8043-a847-ff7e329d51d9/children?page_size=100" -Headers $headers

# level 2: each toggle's children
foreach ($b in $top.results | Where-Object { $_.has_children }) {
  Invoke-RestMethod "https://api.notion.com/v1/blocks/$($b.id)/children?page_size=100" -Headers $headers
}
```

Careful: `has_children` is true on **both** the toggles and the `child_page`,
and the two need different treatment — a toggle's children are its body text,
a child page's children are a *different document*. Handle `child_page` by its
own id (`GET /v1/blocks/<child_page_id>/children`), never by recursion into the
generic loop, or you will silently paste a second page into your notes.

**The first block is an `unsupported` block** (a "button", id
`3fe2d18e-3d59-8093-95ec-f5b0ee123cf2`) with no readable content.
**A walker that throws on unknown types dies on block zero of the most important
page.** Skip by type, never assume a known set.

The ten toggles, in **API return order** — the page is *not* sorted by date, so
"read the most recent first" is not something you can do by position. Read all ten;
there are only 158 blocks. (Titles carry a `Sulton School: ` prefix, trimmed here
for width.)

| # | toggle id | title | kids |
|---|---|---|---|
| 1 | `3fe2d18e-3d59-8087-8c8a-ee536eb320c6` | 2026.10.18 — yangi ishga qabul qilindim | 25 |
| 2 | `3fe2d18e-3d59-801a-9896-e3e61f720c4e` | 2026.10.18 — rahbar va maktab haqidagi yangi taassurotlar | 14 |
| 3 | `3fe2d18e-3d59-808c-b926-e383499f9c56` | 2026.10.18 — key context for future work | 3 |
| 4 | `3fe2d18e-3d59-80fb-8f21-e3dd6e4ab049` | 2026.10.18 — Sulton School vision clarified | 2 |
| 5 | `8938a1f2-85d4-4990-a40f-000f82e662a8` | **2026.10.22 — Vibe-coded educational RPG** | 20 |
| 6 | `b83645fb-90cc-4390-8c8c-cfcf49066431` | 2026.10.20 — ota-onalar bilan yuzma-yuz suhbat | 9 |
| 7 | `c5952925-f3ad-4b17-8217-be304cf79bde` | 2026.10.20 — Learning preference | 9 |
| 8 | `081f2061-a931-47c1-877d-f9316bd9a953` | 2026.10.20 — o'quvchilardan foydali feedback olish | 17 |
| 9 | `af7eed41-facc-48e8-8aad-4b0a7b39d498` | 2026.10.20 — student feedback system v1 | 16 |
| 10 | `2cd619e2-f7b4-471f-8505-1659646b6a45` | 2026.10.21 — project mindset and sustainable innovation | 8 |
| — | `3ff2d18e-3d59-8133-9f09-d468b68fd236` | *(child_page, not a toggle)* 2026.10.20 — workload and innovation time | 20 |

Two of the 15 top-level blocks are worth knowing about because they are easy to
miss: block 5 is the literal paragraph `"AI insights - newest firsy"` (his typo —
it is a *signpost*, which is why the newest toggle sits below older ones), and the
other two are empty paragraphs acting as spacers. The kid counts sum to
25+14+3+2+20+9+9+17+16+8+20 = **143**, plus the 15 top-level blocks = **158**,
which is the `all` figure in the inventory. That sum is the check that you
descended everything.

Read them for:
- what he is dealing with this week
- what he tried that did not work
- what he is worried about
- the words he uses for his own problems

**Those are your beats.** A chapter that stages his actual week is worth ten that
stage an abstract principle.

### Step 3b — the four ideas (1 call, 10 blocks)

```powershell
Invoke-RestMethod "https://api.notion.com/v1/blocks/4002d18e-3d59-8062-aa66-cc0fecefe2d0/children?page_size=100" -Headers $headers
```

All four, verbatim — this is the cheapest place to find something the player can
actually *do*:

```
[heading_3]       Iliq kutib olish
[bulleted_list]   Ota-ona bilan ilk uchrashganda issiq, xushbo'y hidl choy quiyb
                  berish. Hol-ahvol so'rash
[heading_3]       Darsdan so'ng har kuni kimlar bilandir yengil suhbat
[bulleted_list]   O'qish haqida emas, hayoti haqida
[heading_4]       Sevgan mashg'ulotlarini birga bajarish
[bulleted_list]   Hamma nimalargadir qiziqadi. Birga bajarish samimiylik olib keladi
[bulleted_list]   Diqqat bilan kuzatish - nimalar qiladi, nega…
```

The last bullet is **cut off mid-thought** in the source. Do not build a beat on
the missing half.

### Step 4 — the book highlights

`Book insights` has **230 records = 223 highlights + 7 notes**. The page opens with
a title line and a rule; the content is **not nested in toggles** (see the shape
trap in §1). Two passes:

**Pass A — fetch and cache the flat page (13 requests, 1215 blocks, ~6 s).**
Paginate properly; `page_size` clamps to 100 *silently* (asking for 150 or 200
returns 100 with `has_more: true`, so a loop that ignores `has_more` loses 90%):

```powershell
$cursor = $null; $all = @()
do {
  $url = "https://api.notion.com/v1/blocks/4002d18e-3d59-8187-a7bd-c9e21cf223a3/children?page_size=100"
  if ($cursor) { $url += "&start_cursor=$cursor" }
  $r = Invoke-RestMethod $url -Headers $headers
  $all += $r.results
  $cursor = if ($r.has_more) { $r.next_cursor } else { $null }
} while ($cursor)
```

**Pass B — reconstruct records, then read the reconstruction, not the blocks.**
A record starts at a `▪` and runs until a **blank block** (verified: all 230 close
on a blank, so the delimiter is exact — no heuristic needed). Continuation lines
are glued with a space. §8 has a complete, runnable version of this; the core is:

```js
for (let i = 0; i < blocks.length; i++) {
  const t = blocks[i].text.replace(/\s+$/, "");
  if (t.trim().startsWith("▪")) {                    // new highlight
    cur = { id: blocks[i].id, start: i, text: t.trim().replace(/^▪\s*/, "") };
    recs.push(cur); last = cur; continue;
  }
  if (!t.trim()) { cur = null; continue; }            // blank closes it
  if (cur)  { cur.text += " " + t.trim(); continue; } // continuation
  if (last) { last.text += " " + t.trim(); last.orphan = true; }  // see below
}
```

Three things fall out of the measurement, all verified:

- **One continuation line is orphaned** — block idx 29, because a note wrapped past
  a blank line. Without the `last.orphan` branch you silently **drop a line of his
  text**. Check `orphans: 1` in the script's output (§8) — if that line is
  silently dropped you will not notice, because the sentence still reads.
- **Cite the block that carries the `▪`** — the *first* block of the record, not
  the middle one where the good phrase sits. Every quotation below gives it.
- **28 of the 230 records begin with a lower-case letter**, which means the export
  cut the sentence immediately before them. A few begin **mid-word** — block 50 is
  `"tranded out there.""` (from "stranded"), block 1016 is `"ractically speaking…"`.
  Others are merely mid-sentence (`"said. "As amazing as the restaurants…"`). **The
  practical rule: if a record does not open on a capital letter or a quotation
  mark, do not quote from its beginning** — quote from the first capital letter
  inside it, or not at all.

**This is the only page where a quotation may be sourced.** If a line is not here,
do not put quotation marks around it in a chapter.

### Step 5 — the AI review (orientation only)

744 top-level / 828 total. Useful for finding *which chapter of the book* covers a
theme, fast. **Not** a source of quotations — see §4.

Read three parts, not all of it:

1. **The 7 tables** (37 rows). They are the only place the canonical ID registers
   exist. Fetch each `table` block's children and read `table_row.cells` — a
   `table_row`'s own `rich_text` is **empty**, so a naive extractor returns `""`
   for all 37 and the page looks far emptier than it is.
2. **`F-013`** (`3ff2d18e-3d59-806b-8a56-e4f5e2d7a36a`) — the ASCII diagram:
   Intelligence Gathering → Scenario Classification (one-off vs pattern) →
   Dreamweaver Execution / Systemized Toolkit → Delivery → Story Creation
   ("Legend"). It is literally a game loop.
3. **The `INSIGHT-01…28` sections** — each has the same nine labelled fields
   (`Plain Language`, `Explanation from the Book`, `Reasoning`,
   `Evidence from Source`, `Practical Meaning`, `Educational Application`,
   `Conditions and Cautions`, `Action Options`, `Source Location`), so they are
   cheap to triage.

### Step 6 — record provenance as you go

Every fact you intend to use gets a line:

```
[CONFIRMED] Buxoro viloyat olimpiadasi — regional olympiad champion
  where: Umumiy ma'lumotlar (paragraph 4); PROMPT-LIBRARY 2026-10-21 entry
[CONFIRMED] studied at Kukaldash madrasa
  where: Umumiy ma'lumotlar
[UNKNOWN]  which grade he taught before Sulton
  why it matters: a chapter about his first-ever class would need it
```

If you cannot fill in `where`, it is UNKNOWN and does not go in a chapter.

---

## 3. The selection filter — insight to beat

Notion gives you material. The engine can only express a small set of things:

`say` · `choice` · `multi` · `minigame` · effect (`flag`/`intel`/`trust`/`beat`/
`journal`/`note`/`objective`/`endMission`) · NPC · trigger.

So the filter is one question:

> **Can this insight be staged as a decision someone makes under pressure?**

If no, it is a quotation or a principle for the learning object — useful, but not
a beat.

If yes, run the five-column transformation. Here it is filled in for a real
capability of his, so you can see the shape before the three worked examples
below:

| raw insight | → principle | → beat | → the choice the player gets | → what the wrong option costs |
|---|---|---|---|---|
| "Has been champion of Bukhara regional olympiad in my 9th grade" — and he said Bukhara is the strongest maths region in Uzbekistan | a maths teacher's credential is a *door opener*, but only if used to make someone else feel capable — not to win the room | the staffroom, first morning: a colleague tests the new teacher in front of others | (a) answer the hard problem fast and correctly; (b) say "I don't know yet — show me how you teach it"; (c) deflect with a joke | (a) wins the argument and loses the colleague, who reads him as showing off — the exact obstacle he named; (b) costs visible status in the moment and buys an ally |
| his own notes in the book margins (`Har bir sinf kuzatuvchi biriktirish`) | systemise what is unique, so it survives you | the report beat: he must name one thing to keep doing | (a) write the plan alone; (b) ask the colleague who already does it to own it | (a) the plan dies when he is busy — `F-013` unmet; (b) he gives up credit, which is the point |

### The six checks that make "can this be staged?" testable

"Under pressure" is a feeling, not a test. Six questions, each mapping to a field
the engine actually has. An insight passes only if **all six** are yes.

| # | Check | Engine field | Fails when |
|---|---|---|---|
| 1 | Is there an **actor** who could do it in one scene? | `npcs[]`, `speaker` | it is about an organisation, a policy, or "culture" |
| 2 | Is there a **fact the player can learn first** that changes the choice? | `intel` + `requires.intel` + `lockedText` | nothing to learn — a coin flip, not a lesson |
| 3 | Are there **two defensible options**, not one right one? | `options[]` | the wrong option is obviously stupid; that is a quiz |
| 4 | Does the wrong option cost something felt **inside this chapter**? | `trust`, `note.verdict`, a harder `minigame` | the cost is abstract ("the school's reputation") |
| 5 | Can the cost be **named in one sentence** in the debrief? | `choiceNotes[id].cost` | you need a paragraph — the principle is not distilled yet |
| 6 | Would a **real teacher at Sulton** recognise the situation? | `difficulties[]` honesty | it needs a restaurant, a budget, or authority he does not have |

Check 3 is the one that is failed most often and hurt most. **A chapter where every
non-optimal choice is `bad` teaches the player to game the notes.** Use `ok` for the
defensible-but-cheaper option. `verdict` is `good | ok | weak | bad` and the
validators reject anything else.

### Fail cases, from real Notion material

So you can recognise them:

| raw material | why it fails |
|---|---|
| `I-046 — Creativity Is a Discipline` ("schedule bi-weekly Pedagogy Design Labs") | fails #1 and #4: no single scene, no felt cost. A calendar policy. **Usable as an `idea`, never a beat.** |
| `I-042 — Promote People Before They Are 100% Ready` | fails #1: Azizbek has no reports on day one |
| `INSIGHT-08 — Equal Partnership Across "Both Sides of the Wall"` | fails #1 and #6: a chef/GM relationship |
| `I-045 — Remove Transactional Barriers` ("podiumless welcome, greet by name from photo cheat-sheets") | fails #6: a first-week maths teacher cannot remove the reception desk. It can be a *line an NPC says*, not a choice |
| The 34 toggle titles in Fast English | fail all six: a sales document |
| `Avtobusda aylanishga olib chiqish` (125 blocks) | fails #2: every block is a template prompt. No fact to learn |

### Worked example 1 — the credential

**Raw** (Logs + biography): he was regional olympiad champion in Buxoro, and he
stressed that Buxoro is the strongest maths region in Uzbekistan. It is a real
achievement and it is genuinely useful for establishing credibility with a new
class.

**Principle:** “the impressive move and the hospitable move are never the same
move.” (`C2-008`, the enemy is ‘reasonable’ — competent is not the goal.)

**Beat:** `before` / `open` — the first ninety seconds.

**The choice:** in the corridor, with two minutes and a register full of names,
does he open with the credential or with a question?

**Cost of the wrong option:** the room decides he is a performer. Trust may even
go *up* briefly — which is exactly the trap, and exactly why the construct-validity
test in the plot guide matters. The cost is paid at `wobble`, when a pupil tests
whether he is real and he has no relationship to fall back on.

### Worked example 2 — the madrasa

**Raw:** he studied at Kukaldash madrasa. A place where he was a *student*, not a
champion.

**Principle:** authority can come from having learned, not from having won.

**Beat:** `wobble` — the moment the plan breaks.

**The choice:** when Bekzod solves a problem a different way, does he correct him
back to the textbook method, or put Bekzod's method on the board?

**Cost of the wrong option:** “Bekzod usuli” never reaches the board. The child
who had the better idea learns that his idea does not count. And the hero loses
the one source of authority he actually had — being someone who is still learning.

**The ending image:** the board, with “Bekzod usuli” on it, and the open question
of whether he wipes it off.

### Worked example 3 — the overloaded colleague

**Raw** (Logs + workload plan): Oqil is a maths colleague, schoolmate, olympiad
colleague — and overloaded. He is sceptical of innovation because he has no time.

**Principle:** hospitality to colleagues is also hospitality; the obstacle is
structural, not personal.

**Beat:** `rules` / `exit` — or a staffroom scene in a later chapter.

**The choice:** does the hero ask Oqil for help (taking his time), or work around
him (faster, and quietly insulting)?

**Cost of the wrong option:** the chapter can end with the lesson going well and
the colleague deciding the new teacher is a show-off. **That is a real outcome
the user has named** — *“colleagues reading it as showing off”* is listed as an
honest difficulty in this project.

Notice what all three have in common: **the insight becomes a trade, and the
wrong answer is what a reasonable, busy, ambitious person would actually do.**

---

## 4. The trap — AI extractions are not the book

This project has already been burned by an agent quoting a plausible line that
turned out to be an AI paraphrase from the **Ai review** page.

The rule:

| source | may be quoted? |
|---|---|
| **Book insights** — a real highlight with a page/kindle location | **yes** |
| **Ai review** — batch extraction prose | **no** — ideas only |
| [UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) | yes, it distinguishes the two explicitly |
| anything from a web summary | **no** |

### Do not attribute these to Guidara

Every "not in the highlights" below was **measured** by searching the reconstructed
230 records on 2026-10-22. "Not in the highlights" is not the same as "not in the
book" — but it does mean **you cannot source it from Notion**, which is the only
thing that matters here.

| claim | status in the 230 records | what to do |
|---|---|---|
| "Service is black and white, hospitality is colour" | **0 hits** for `black and white`; **0** for `colour`; the only `color` is `"A watercolor portrait of their new home in the country"` — **block 119**, `4002d18e-3d59-8114-82ed-fc05114bddcd` | a **distillation**. Usable as an idea in the debrief, never as a quotation. Quote what *is* there: `"Luxury means just giving more; hospitality means being more thoughtful."` — **block 61**, `4002d18e-3d59-8164-b0d3-f1c46a0a0cfe` |
| "one size fits one" | **1 hit — block 587** | **verified**, and the research file is out of date. See the upgrade note below |
| "the answer is yes — what is the question?" | **0 hits** for `answer is yes` | **not in this book.** Do not attribute |
| "the 2-minute check-in" | **0 hits** for `2-minute` / `two-minute` | generic training device |
| postcard / granola / umbrella as gifts | **0 / 0 / 1**, and the one `umbrella` is `"…they drowned their disappointment in tropical daiquiris decorated with little umbrellas"` — **block 113**, `4002d18e-3d59-8134-97ed-dfb72d7cd657` — a drink garnish in the "private beach" story, not a gift | **not in the book.** The verified travel gift is a **snack box** (block 66) |
| birthday cake | **0 hits** | the research file's "appears only negatively" is **not checkable from Notion**. Drop the claim or cite the research file |
| "Maya Angelou said people will never forget how you made them feel" | **0 hits** for `Angelou`. The line itself **is** in the records; the name is only in `Ai review`'s "Connections" bullet | quote it as Guidara quoting *someone*, name unknown from Notion |
| "he removed the podium and greeted guests from photo cheat-sheets" | **0 hits** for `podium` and `cheat sheet`. Asserted by `Ai review` `I-045` (`3ff2d18e-3d59-80ea-b532-f2fe32ba543e`) | verify against the book, or present it as the extraction's claim, or leave it out |
| "the Dreamweaver was invented for a banker who wanted 100 Grand bars" | **0 hits** for `100 Grand`. It is in `Ai review` (`3ff2d18e-3d59-8081-9bfc-c288f66af40d`), not in the highlights | use the verified part: `"Christine McGrath was a host and reservationist, as well as a skilled calligrapher"` and the hangover kit — *"a bag of strong ground coffee, some Alka-Seltzer tablets, and a muffin"* |
| `[476–479]`-style location numbers | **283 blocks** in `Ai review` carry them | they are extraction artefacts, not page numbers. Never copy one into a `source` |

### Upgrade: "one size fits one" *is* verified

The research file (§1.5) says *could not verify; treat as unattributed*. The
highlights settle it. Verbatim, record starting at **block 587**,
id `4002d18e-3d59-814d-a260-e064dbcb5c0a`:

> "One of Richard Coraine's most often repeated sayings was "One size fits one." He
> was referring to the hospitality experience: some guests love it when you hang out
> at the table and schmooze, while others want you to take their order and disappear.
> It's your job to read the guest and to serve them how they want to be served"

Two consequences:

1. **The attribution is Coraine's, quoted by Guidara — not Guidara's own coinage.**
   If you quote it, say "Richard Coraine's saying, quoted by Guidara".
2. Chapter 2 already ships a principle **named** `C2-004` "One size fits one", with
   a `source` of *"Ch. 16 — earning informality; Ch. 3 — enlightened hospitality is
   not one recipe"*. That `source` is about the idea and is correct. The **name** is
   now also quotable, which it was not when chapter 2 was written. Do not
   "fix" the name — but a future chapter may now quote the line and cite block 587.

### The right way to handle a strong phrase you cannot source

If the words are unverifiable, use the **idea** and write **your own words** — as a
principle *name*, never as a quoted line of Guidara's. That is exactly what
`C2-004` did while the source was in doubt, and it is why the principle survived
long enough for the highlight to be found.

**Rule:** if you cannot verify the words, use the idea and write your own words.

---

## 5. Citation discipline

Every chapter's research notes must let a later agent check the work. Minimum:

1. **A provenance line per fact** — `CONFIRMED`/`INFERRED`/`UNKNOWN`, plus where.
2. **Quotations kept verbatim**, with the source (page + block id, or the
   research file's entry id like `I-028`).
3. **A "not used" list** — material you found and rejected, and why. This stops
   the next agent re-mining it.
4. **No paraphrase presented as quotation.** If you shorten a quote, mark it.
5. **The UNKNOWN list** — with a note on which unknown would most improve the
   chapter if the user answered it. That is a question worth asking him.

### Cite the block, not the page

A page id alone is not a citation — the book page has 1215 blocks. For a highlight
that spans blocks, cite the **first** block (the one carrying `▪`). Quote exactly,
**including truncation**: if the block ends `"Their perception is our reality` with
no closing quote, write it that way and add `[block ends here]`. Do not close the
quote for him.

Four `confidence` words, no prose: `verified` (read it in the block), `his words`
(a note, not the book), `distillation` (a model's summary), `elsewhere` (verified,
but in another file). The research file's `(a)/(b)/(c)` scheme stays in that file.

### Where the verified material already lives

Do not re-derive what is already checked:

- **[UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md)**
  — the book, with citation discipline: which lines are Guidara's, which are
  distillations, which are not in the book at all. Verified anchors include
  `I-028`, `I-044`, `F-013`, the $2 hot dog, the Dreamweaver role, earning
  informality, 95/5.
- **[PROMPT-LIBRARY.md](PROMPT-LIBRARY.md)** — what he actually asked for, in his
  own words, and what he rejected. Read the standing constraints and the recent
  dated entries before you mine anything.
- **`js/data/chapter2-learning.js`** — eight worked examples of a principle
  written to the required shape.

---

## 6. Appendix — the quotations that are actually in the highlights

Verified on 2026-10-22 against the live page. Each was found by searching the 230
reconstructed records; each gives the **block index of the record's first block**
and its block id. Use these instead of re-mining, and re-check the block before you
ship a quote (a page can change).

| block | id | line | starts |
|---|---|---|---|
| 56 | `4002d18e-3d59-81b1-8a7d-c4a95f52fb1f` | "To anyone else, it would have been a worthless piece of splintered wood… but not to her client, who wept when she realized what it was. (Total cost: $0.)" | record start |
| 61 | `4002d18e-3d59-8164-b0d3-f1c46a0a0cfe` | "Luxury means just giving more; hospitality means being more thoughtful." | record start |
| 66 | `4002d18e-3d59-8123-b496-cd24f7c36f48` | "…the value of a gift isn't about what went into giving it, but how the person receiving it feels. Maybe it was the thirtieth time we'd handed a traveling guest a snack box…" | record start |
| 73 | `4002d18e-3d59-812c-ba19-d18ea4439967` | "…the Dreamweavers put together a little morning rescue kit—a bag of strong ground coffee, some Alka-Seltzer tablets, and a muffin…" | record start |
| 131 | `4002d18e-3d59-81df-ba9f-c45218098b72` | "Christine McGrath was a host and reservationist, as well as a skilled calligrapher" | record start |
| 153 | `4002d18e-3d59-81ab-9b50-e810773fd993` | "The chair at Spago… wasn't scalable… But the hot dog was proof that we didn't have to call in a furniture maker to blow someone's mind. All we had to do was pay attention" | record start |
| 319 | `4002d18e-3d59-814a-96d8-d9122a2e9ddf` | "At every P&L meeting in those days, Danny's partner Paul Bolles-Beaven liked to remind us, "Raindrops make oceans."" | record start |
| 344 | `4002d18e-3d59-8155-baea-f48a980e86e3` | "if you made eye contact with a colleague and touched your lapel, it meant "I need help."" | record start (mid-sentence) |
| 351 | `4002d18e-3d59-8140-8e13-df763e515c06` | "I invited Andrew to pre-meal to tell the team about DBC, the idea that a few deep breaths can be all it takes…" | record start |
| 587 | `4002d18e-3d59-814d-a260-e064dbcb5c0a` | "One of Richard Coraine's most often repeated sayings was "One size fits one." … It's your job to read the guest and to serve them how they want to be served" | record start |
| 670 | `4002d18e-3d59-81b5-b890-eb0fdbeea362` | "It was then that a new mantra at EMP was born: "Their perception is our reality" **[block ends here]** | record start |
| 673 | `4002d18e-3d59-8170-890d-deecb77fa1fb` | "If, in that final inch, a zucchini flower tumbled because of your carelessness, you were letting a lot of people down—including the guest, who'd trusted you with a few hours of their life…" | **mid-record** |
| 1020 | `4002d18e-3d59-8112-aea7-cf8401c1776d` | "We would spend the next ten years coming up with systemized and intentional ways to…" | **mid-record** |
| 1035 | `4002d18e-3d59-81a1-ac81-dc5adbecee6b` | "Attendance was mandatory. The meetings started on time, at eleven and five, and lasted exactly thirty minutes." | **mid-record** |
| 1140 | `4002d18e-3d59-81cb-b412-e6759869ed51` | "Manage 95 percent of your business down to the penny; spend the last 5 percent "foolishly."" | record start |
| 1177 | `4002d18e-3d59-8168-957b-e4650ad13269` | "My favorite was "Make the charitable assumption," a reminder to assume the best of people, even when (or perhaps especially when) they weren't behaving particularly well." | record start |
| 1208 | `4002d18e-3d59-8111-be7e-f318416fd401` | ""People will forget what you do; they'll forget what you said. But they'll never forget how you made them feel" **[block ends here]** | record start |

Two caveats that apply to the whole table. **The line-break gluing is mine** — the
words and punctuation are the source's, but the joining spaces between blocks are
reconstructed, so do not reproduce a row here as though it were one continuous
sentence in the export. And **three rows are marked mid-record**: the block index
is still the right citation, but the quoted text is an excerpt from partway
through that record, not its opening. If you need the opening, fetch the record.
**28 of the 230 records open on a lower-case letter** (the export cut the preceding
sentence), so check before quoting a record not in this table; none of the
"record start" rows above begins mid-sentence except block 344, which is flagged.

### The seven notes that are his, not the book's

The header says `Highlight: 223; Note: 7` and that is exactly right — **7 records
carry his own parenthesis, 223 do not**. But **14 records contain a parenthesis**,
because Guidara uses them too (`(Total cost: $0.)` at block 56, `(if you're giving
a gift, it should be awesome)` at 301, and 5 more). **A regex for `\(.*\)` gives you
14; you must read all 14 and classify by voice.** His seven:

| block | his note | reads as |
|---|---|---|
| 4 | `(instada qoʻyib borish)` | "post it on Instagram" |
| 11 | `(Aylanishga olib chiqish mumkin)` | "you could take [him] on a trip" |
| 14 | `(Vazifalarni bajarganlar uchun sovgʻa safari uyudhtirish mumkin - moslashtirilgan)` | "a gift trip / accommodation for those who did the tasks — customised" |
| 21 | `(Foydali narsalar sovgʻaqilish mumkin Ismli soʻrvnomada nimani xohlashini soʻrash mumkin)` | "you could gift useful things… you can ask what they want in a survey" |
| 31 | `(chatgpt dan gift idea soʻrashv mumkin)` | "you can ask ChatGPT for gift ideas" |
| 34 | `(Har bir sinf kuzatuvchi biriktirish)` | "assign one observer per class" |
| 43 | `(Barchadan muammolarini soʻrash)` | "ask everyone about their problems" |

These are the **most valuable blocks on the page for this project**: they are the
user reading Guidara and immediately writing down a school mechanic. They are also
**his words, not the book's** — never quote one as Guidara, and do not tidy his
spelling (`uyudhtirish`, `soʻrashv`, `sovgʻaqilish`). Block 21 is the orphan case
from §2 step 4: its note wrapped past a blank line, and a naive reconstruction
splits it into two records.

---

## 7. A mining checklist

Before you say Stage 1 is done:

- [ ] Read **Extra info** (8 blocks) and can state the three standing rulings.
- [ ] Read the biography page in full; dossier started with CONFIRMED/UNKNOWN.
- [ ] Read **all ten** Logs toggles (158 blocks); the current situation is written
      down in one paragraph. (The page is not date-sorted, so "read the newest
      first" is not something position can give you.)
- [ ] Harvested the book highlights and got **230 records / 223 highlights + 7
      notes** — if you got 20, your pagination loop ignored `has_more`; if you got
      1215, you never reconstructed records; if you got 14 notes, you counted
      Guidara's parentheses as his.
- [ ] Every intended quotation traced to a real block id, and it does not start
      mid-word.
- [ ] Three or more insights run through the six-check filter into actual beats,
      each with a `requires.intel` gate and a `lockedText`.
- [ ] Every option id has a `choiceNotes` entry with a `cost` you can say in one
      sentence.
- [ ] A "not used" list exists.
- [ ] An UNKNOWN list exists, with the one question most worth asking the user.
- [ ] Token never printed; no raw dump committed.

---

## 8. The one script you need — and why it is not in the repo

`tools/_*.js` is **not** gitignored here (only `tools/*.tmp.js` is), so a scratch
script left behind becomes a tracked-file candidate. The scripts used to write
this guide were deleted for that reason. Do not go looking for
`tools/_records.js` — it is not there. **Rebuild it in twenty lines instead**,
which is cheaper than trusting a stale copy:

```js
// tools/_mine.js — run: node tools/_mine.js [phrase ...]
const fs = require("fs");
const REF = process.env.USERPROFILE + "/.agents/skills/notion/reference.md";
const token = fs.readFileSync(REF, "utf8").match(/ntn_[A-Za-z0-9]+/)[0];
const H = { Authorization: "Bearer " + token,
            "Notion-Version": "2022-06-28", "Content-Type": "application/json" };
const BOOK = "4002d18e-3d59-8187-a7bd-c9e21cf223a3";

(async () => {
  const blocks = [];
  let uri = `https://api.notion.com/v1/blocks/${BOOK}/children?page_size=100`;
  while (uri) {
    const j = await (await fetch(uri, { headers: H })).json();
    for (const b of j.results) {
      const rt = b[b.type] && b[b.type].rich_text;
      blocks.push({ id: b.id, text: Array.isArray(rt) ? rt.map(x => x.plain_text).join("") : "" });
    }
    uri = j.has_more
      ? `https://api.notion.com/v1/blocks/${BOOK}/children?page_size=100&start_cursor=${j.next_cursor}`
      : null;
  }
  const recs = []; let cur = null, last = null;
  for (let i = 0; i < blocks.length; i++) {
    const t = blocks[i].text.replace(/\s+$/, "");
    if (t.trim().startsWith("▪")) { cur = { id: blocks[i].id, start: i,
        text: t.trim().replace(/^▪\s*/, "") }; recs.push(cur); last = cur; continue; }
    if (!t.trim()) { cur = null; continue; }
    if (cur)  { cur.text += " " + t.trim(); continue; }
    if (last) { last.text += " " + t.trim(); last.orphan = true; }
  }
  console.log(`blocks ${blocks.length}  records ${recs.length}  orphans ${recs.filter(r => r.orphan).length}`);
  console.log(`notes ${recs.filter(r => /\([^)]*\)\s*$/.test(r.text)).length}  (expect 14, of which 7 are his)`);
  for (const p of process.argv.slice(2)) {
    const hits = recs.filter(r => r.text.toLowerCase().includes(p.toLowerCase()));
    console.log(`\n=== "${p}" : ${hits.length} hit(s)`);
    hits.forEach(r => console.log(`  block ${r.start}  ${r.id}\n    ${r.text.slice(0, 260)}`));
  }
})();
```

Run it bare first and check the invariants: **`blocks 1215`, `records 230`,
`orphans 1`**. If records is not 230, your reconstruction is broken and nothing
you print from it is safe to quote. Then pass phrases:

```powershell
node tools/_mine.js "one size fits one" "charitable assumption"
```

Two things this script does that a naive one does not: it keeps the **block id of
the record's first block** (the citation you need), and it prints the **orphan
count** so the one dropped line is visible rather than silent.

Other one-off queries worth rebuilding the same way, rather than copying a script:
the Logs toggle walk (§2 step 3 — recurse `has_children`, but treat `child_page`
separately), the Tasks row-by-row block count (query the database, then walk each
row page), and the `has_children` census that proves the book page is flat.

**Delete the script before you report.** Run
`git status --porcelain` and confirm only the files you meant to change are listed.
