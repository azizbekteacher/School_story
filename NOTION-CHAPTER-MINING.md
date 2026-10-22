# Mining Notion for chapter material

How to get the raw material for a chapter out of the user's Notion workspace —
and, more importantly, how to tell which of it is usable.

This file assumes you have read [CHAPTER-CREATION-GUIDE.md](CHAPTER-CREATION-GUIDE.md)
§3. It is the detailed procedure for **Stage 1 — Harvest**, source 1.

> **Never print, commit, or paste the Notion token.** It lives in the `notion`
> skill file (`~/.agents/skills/notion/SKILL.md`) and in the API headers at call
> time, nowhere else. This repository is public.

---

## 1. What is actually in there

One workspace is in scope: **Sulton School**. The pages that matter for a
chapter, in the order you should read them:

| page | id | size | what it gives a chapter |
|---|---|---|---|
| **Umumiy ma'lumotlar** | `3fe2d18e-3d59-80dd-b180-d14b06eac5fb` | small | **the biography.** Start here. |
| **Logs** | `3fe2d18e-3d59-8043-a847-ff7e329d51d9` | medium, nested toggles | **his actual situation.** The richest source for *why this chapter, now.* |
| **Book insights** | `4002d18e-3d59-8187-a7bd-c9e21cf223a3` | **223 highlights, 7 notes**, deeply nested | the book, in his own highlights. The authority for quotations. |
| **Ai review** | `3ff2d18e-3d59-8054-b6e1-cea7afa470c8` | 744 blocks, batch extractions | fast orientation to the book's arguments. **Secondary source — see §4.** |
| **Book recommendations** | `3ff2d18e-3d59-8121-831b-fd38b1cb4c74` | 8 books | what else he is reading; useful for a chapter's wider reading |
| **Tasks** (database) | `3ff2d18e-3d59-8099-ab10-f21d07681404` | 11 rows | what he has actually committed to doing |
| **Role & workload plan** | `3ff2d18e-3d59-81d4-ae31-c7e829c2a3d9` | medium | his workload argument: the real constraints a chapter must respect |
| **Innovation tasks** | `3ff2d18e-3d59-80e8-8b01-d6b96b54c591` | medium | the professional context |
| **Extra info** | `4002d18e-3d59-8190-b53e-e9372914a594` | small | long-term memory; durable facts |
| **People** (database) | `d3d2d18e-3d59-82df-b0d8-014512d331ec` | 1 row | who's who |

**How to read the table:** for a chapter, read **Top 2 (biography + Logs) first**,
then the book sources, then everything else. Do not start with the book — the
book is what you already have in
[UNREASONABLE-HOSPITALITY-RESEARCH.md](UNREASONABLE-HOSPITALITY-RESEARCH.md) in
verified form. What Notion adds is **him**.

---

## 2. The mining procedure

Run this in order. Each step produces something the next step needs.

### Step 0 — get the token without exposing it

```powershell
$token = (Select-String -Path "$env:USERPROFILE\.agents\skills\notion\SKILL.md" `
  -Pattern 'ntn_[A-Za-z0-9]+').Matches[0].Value
$headers = @{
  "Authorization" = "Bearer $token"
  "Notion-Version" = "2022-06-28"
  "Content-Type"  = "application/json"
}
```

Never `Write-Host $token`. Never put it in a file under the repo.

### Step 1 — the biography (5 minutes)

```powershell
Invoke-RestMethod "https://api.notion.com/v1/blocks/3fe2d18e-3d59-80dd-b180-d14b06eac5fb/children?page_size=100" -Headers $headers
```

This page is flat. Read every block. You are looking for: role, dates, class,
colleagues, ambitions, constraints, and anything that would make a choice in a
chapter personal.

**Output:** the first half of your dossier. Mark each fact CONFIRMED (he said
it / it is written here) vs INFERRED.

### Step 2 — the Logs page (the expensive one)

`Logs` is **entirely nested toggles**. One call gets you the toggle blocks, not
their content. You must descend twice:

```powershell
# level 1: the toggles
$top = Invoke-RestMethod "https://api.notion.com/v1/blocks/3fe2d18e-3d59-8043-a847-ff7e329d51d9/children?page_size=100" -Headers $headers

# level 2: each toggle's children
foreach ($b in $top.results | Where-Object { $_.type -eq 'toggle' }) {
  Invoke-RestMethod "https://api.notion.com/v1/blocks/$($b.id)/children?page_size=100" -Headers $headers
}
```

Some entries are themselves child pages (`has_children` with `type: child_page`);
those need a third call on the page id.

Read the **most recent 10–15 entries first.** You are looking for:
- what he is dealing with this week
- what he tried that did not work
- what he is worried about
- the words he uses for his own problems

**Those are your beats.** A chapter that stages his actual week is worth ten that
stage an abstract principle.

### Step 3 — the book highlights

`Book insights` has **223 highlights and 7 notes**. The page opens with
paragraphs and the content is nested in toggles.

Paginate properly — do not assume one call gets everything:

```powershell
$cursor = $null
do {
  $url = "https://api.notion.com/v1/blocks/4002d18e-3d59-8187-a7bd-c9e21cf223a3/children?page_size=100"
  if ($cursor) { $url += "&start_cursor=$cursor" }
  $r = Invoke-RestMethod $url -Headers $headers
  $r.results
  $cursor = if ($r.has_more) { $r.next_cursor } else { $null }
} while ($cursor)
```

Then descend into any `toggle` block, same as Logs.

**This is the only page where a quotation may be sourced.** If a line is not
here, do not put quotation marks around it in a chapter.

### Step 4 — the AI review (orientation only)

744 blocks of batch extractions. Useful for finding *which chapter of the book*
covers a theme, fast. **Not** a source of quotations — see §4.

### Step 5 — record provenance as you go

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

If yes, run the five-column transformation:

| raw insight | → principle | → beat | → the choice the player gets | → what the wrong option costs |
|---|---|---|---|---|

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

Verified as **not** safely attributable, and already checked against the research
file:

| claim | status |
|---|---|
| “Service is black and white, hospitality is colour” | a **distillation** — usable as an idea, not as a quotation |
| “one size fits one” | **could not be verified** — treat as unattributed |
| “the answer is yes — what is the question?” | **not in this book** |
| postcard / granola / umbrella as gifts | **not in the book** |
| birthday cake | appears **only negatively** |

### The right way to handle a strong phrase you cannot source

Chapter 2 ships a principle *named* **“One size fits one”**, whose `source` field
points at real chapters (“Ch. 16 — earning informality; Ch. 3 — enlightened
hospitality is not one recipe”). The **idea** is sourced and true; the **phrase**
is not a quotation. So it is used as a principle **name** (the chapter's own
words), never as a quoted line of Guidara's.

**Rule:** if you cannot verify the words, use the idea and write your own words.

---

## 5. Citation discipline

Every chapter's research notes must let a later agent check the work. Minimum:

1. **A provenance line per fact** — `CONFIRMED`/`INFERRED`/`UNKNOWN`, plus where.
2. **Quotations kept verbatim**, with the source (page + block id, or the
   research file's entry id like `I-028`).
3. **A “not used” list** — material you found and rejected, and why. This stops
   the next agent re-mining it.
4. **No paraphrase presented as quotation.** If you shorten a quote, mark it.
5. **The UNKNOWN list** — with a note on which unknown would most improve the
   chapter if the user answered it. That is a question worth asking him.

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

## 6. A mining checklist

Before you say Stage 1 is done:

- [ ] Read the biography page in full; dossier started with CONFIRMED/UNKNOWN.
- [ ] Read the 10–15 most recent Logs entries; the current situation is written
      down in one paragraph.
- [ ] Harvested the book highlights; **223 highlights** is the expected order of
      magnitude — if you got 20, you did not descend the toggles.
- [ ] Every intended quotation traced to a real highlight.
- [ ] Three or more insights run through the five-column filter into actual beats.
- [ ] A “not used” list exists.
- [ ] An UNKNOWN list exists, with the one question most worth asking the user.
- [ ] Token never printed; no raw dump committed.
