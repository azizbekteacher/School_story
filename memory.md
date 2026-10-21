# Game memory — Sulton School

<!-- Written automatically by the game. Safe to read; edit the JSON block only
     if you know what you are doing, and keep it valid JSON. -->

**Saved:** never — no game played yet  
**Chapter:** `ch1`  
**Beat:** `arrive`  
**Position:** —  
**Objective:** Maktabga kir, o'qituvchilar xonasini top  
**Trust:** 0/10  
**Playtime:** 0m 0s  
**Saved by:** `seed`

## Resume

Open `index.html` and choose **Davom etish** (Continue). The game reads this
file's JSON block, or `memory.js` if this file cannot be read.

If this file says "never", there is nothing to resume and the title screen will
offer **Boshlash** (Start) instead.

## How saving works

| Layer | What it is | When it updates |
|---|---|---|
| `localStorage` | instant, silent, per-browser | on every beat, choice and note |
| `memory.js` | the same save as a script the game can load from `file://` | when writing to the folder is allowed |
| `memory.md` | this file — the human- and model-readable save | when writing to the folder is allowed |

To let the game write this file by itself, press **F** in game and pick the
folder that contains `index.html`. That grant is remembered, and from then on
`memory.md` is rewritten in place as you play. Without it, press **M** to save to
the browser and choose **Davom etish** next time.

## Raw save

```json
null
```

---

*Service is black and white. Hospitality is colour.*
