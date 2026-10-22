/* Tile map for Sulton School. Hand-built regions, 64x40 tiles of 32px.
   Tile ids and zone rects only — no rendering here. */
window.G = window.G || {};

G.map = (function () {

  var T = 32;               // tile size in pixels
  var COLS = 64;
  var ROWS = 40;

  var TILE = {
    GROUND: 0,   // packed dust / brick
    GRASS: 1,
    PATH: 2,
    FLOOR: 3,    // indoor tile
    WALL: 4,
    WATER: 5,
    TREE: 6,
    BENCH: 7,
    SHELF: 8,
    DESK: 9,
    DOOR: 10,
    CARPET: 11
  };

  var BLOCKED = {};
  BLOCKED[TILE.WALL] = true;
  BLOCKED[TILE.WATER] = true;
  BLOCKED[TILE.TREE] = true;
  BLOCKED[TILE.BENCH] = true;
  BLOCKED[TILE.SHELF] = true;
  BLOCKED[TILE.DESK] = true;

  // ---- zones: pixel rects, top-left inclusive, bottom-right exclusive ----
  var ZONES = [
    { id: "street",    x: 0,   y: 0,   w: 18 * T, h: 40 * T },
    { id: "gate",      x: 24 * T, y: 24 * T, w: 6 * T, h: 14 * T },
    { id: "shop",      x: 52 * T, y: 12 * T, w: 7 * T,  h: 6 * T },
    { id: "yard",      x: 18 * T, y: 0,   w: 45 * T, h: 40 * T },
    { id: "corridor",  x: 44 * T, y: 20 * T, w: 3 * T, h: 17 * T },
    { id: "corridor2", x: 44 * T, y: 34 * T, w: 19 * T, h: 4 * T },
    { id: "staffroom", x: 48 * T, y: 20 * T, w: 7 * T, h: 13 * T },
    // The classroom is the room the player spends most of chapter 2 in, so it
    // was widened from 5 to 7 tiles (160px -> 224px of a 960px view). The space
    // came from moving the whole school 2 tiles west, NOT from shrinking the
    // staffroom: chapter 1 lives in the staffroom and is a fixed point.
    { id: "classroom", x: 56 * T, y: 20 * T, w: 7 * T, h: 13 * T }
  ];

  // Named anchors used by the story data (zone + index -> pixel position)
  var ANCHORS = {
    staffroom: [
      { x: 50, y: 24 }, { x: 53, y: 27 }, { x: 50, y: 30 },
      { x: 52, y: 22 }, { x: 49, y: 25 }, { x: 53, y: 23 }
    ],
    // Classroom anchors now spread over a 7x13 room (x56..62 interior). Six is
    // still the contract; they are simply spread wider so the six pupils of 5-B
    // do not stand on top of each other, and so "walk the room" is a real walk.
    //
    // Every one of these must be a WALKABLE tile: desks are in BLOCKED, and the
    // desk bank sits at x57/59/61 × y22/25/28 with the teacher's table at
    // x56,y21-22. Two of these anchors originally landed on desk tiles (Oqil in
    // the staffroom, Bekzod and Jasur in the classroom), which drew them standing
    // on the furniture. probe-distances.js and tools/_geom were both blind to it
    // because neither called map.build() — see the note in probe-distances.js.
    classroom: [
      { x: 59, y: 27 }, { x: 59, y: 23 }, { x: 58, y: 21 },
      { x: 62, y: 30 }, { x: 61, y: 24 }, { x: 57, y: 29 }
    ],
    gate: [
      { x: 29, y: 35 }, { x: 28, y: 32 }, { x: 27, y: 36 },
      { x: 29, y: 30 }, { x: 28, y: 28 }, { x: 27, y: 33 }
    ],
    yard: [
      { x: 30, y: 26 }, { x: 24, y: 20 }, { x: 33, y: 18 },
      { x: 28, y: 14 }, { x: 31, y: 28 }, { x: 22, y: 30 }
    ],
    shop: [
      { x: 55, y: 14 }, { x: 55, y: 15 }, { x: 54, y: 16 },
      { x: 56, y: 16 }, { x: 57, y: 14 }, { x: 54, y: 14 }
    ],
    street: [
      { x: 10, y: 30 }, { x: 8, y: 22 }, { x: 12, y: 18 },
      { x: 9, y: 36 }, { x: 6, y: 26 }, { x: 13, y: 24 }
    ],
    // The corridor is an L: a vertical leg (x44..46) and a horizontal leg
    // (corridor2, y34..37). Both are "corridor" for logic, so anchors 1/2/3 and
    // 5 legitimately sit in the horizontal leg — that is why they carry y35/36.
    // The vertical-leg anchors moved west with the building (x47 -> x45).
    corridor: [
      { x: 45, y: 30 }, { x: 45, y: 35 }, { x: 52, y: 35 },
      { x: 58, y: 35 }, { x: 45, y: 24 }, { x: 55, y: 36 }
    ]
  };

  var grid = [];
  var decor = [];      // { type, x, y, ... } pixel space, drawn in world layer
  var buildSpots = [];

  function idx(cx, cy) { return cy * COLS + cx; }

  function inBounds(cx, cy) {
    return cx >= 0 && cy >= 0 && cx < COLS && cy < ROWS;
  }

  function set(cx, cy, tile) {
    if (!inBounds(cx, cy)) return;
    grid[idx(cx, cy)] = tile;
  }

  function get(cx, cy) {
    if (!inBounds(cx, cy)) return TILE.WALL;
    return grid[idx(cx, cy)];
  }

  function fillRect(x, y, w, h, tile) {
    for (var cy = y; cy < y + h; cy++) {
      for (var cx = x; cx < x + w; cx++) set(cx, cy, tile);
    }
  }

  function strokeRect(x, y, w, h, tile) {
    for (var cx = x; cx < x + w; cx++) { set(cx, y, tile); set(cx, y + h - 1, tile); }
    for (var cy = y; cy < y + h; cy++) { set(x, cy, tile); set(x + w - 1, cy, tile); }
  }

  function clearRect(x, y, w, h, tile) {
    fillRect(x, y, w, h, tile);
  }

  function isBlockedTile(cx, cy) {
    return !!BLOCKED[get(cx, cy)];
  }

  function build() {
    grid = [];
    decor = [];
    buildSpots = [];

    // ---- base terrain ----
    fillRect(0, 0, COLS, ROWS, TILE.GROUND);

    // grass patches in the yard
    fillRect(19, 2, 25, 30, TILE.GRASS);
    fillRect(18, 30, 27, 8, TILE.GROUND);

    // main path: street -> gate -> school door
    fillRect(0, 34, 46, 4, TILE.PATH);
    // north path branch toward shop
    fillRect(14, 6, 4, 3, TILE.PATH);
    fillRect(14, 6, 2, 30, TILE.PATH);
    // yard cross path
    fillRect(30, 8, 3, 26, TILE.PATH);

    // ---- outer boundary walls ----
    fillRect(0, 0, COLS, 1, TILE.WALL);
    fillRect(0, ROWS - 1, COLS, 1, TILE.WALL);
    fillRect(0, 0, 1, ROWS, TILE.WALL);
    fillRect(COLS - 1, 0, 1, ROWS, TILE.WALL);

    // ============ (the shop is north of the school now — see below) ============

    // ============ SCHOOL BUILDING (x43..63, y19..38) ============
    // Widened 2 tiles west (was x45..63) to give the classroom a 7-tile width.
    // The yard is 45 tiles wide so there is room; nothing in chapter 1 depends
    // on the building's west edge except the outer door, which moved with it.
    fillRect(43, 19, 21, 20, TILE.WALL);
    clearRect(44, 20, 19, 17, TILE.FLOOR);

    // corridor L
    fillRect(44, 34, 19, 3, TILE.CARPET);   // horizontal
    fillRect(44, 20, 3, 17, TILE.CARPET);    // vertical

    // staffroom box  x47..55, y19..33  (same 7x13 interior as before, moved west)
    strokeRect(47, 19, 9, 15, TILE.WALL);
    clearRect(48, 20, 7, 13, TILE.FLOOR);
    // staffroom door (south wall)
    set(50, 33, TILE.DOOR);
    set(51, 33, TILE.DOOR);
    set(52, 33, TILE.DOOR);

    // classroom box x55..63, y19..33 — 7x13 interior (was 5x13)
    strokeRect(55, 19, 9, 15, TILE.WALL);
    clearRect(56, 20, 7, 13, TILE.FLOOR);
    // classroom door (south wall)
    set(58, 33, TILE.DOOR);
    set(59, 33, TILE.DOOR);
    set(60, 33, TILE.DOOR);

    // school outer door (west wall) -> yard path
    set(43, 35, TILE.DOOR);
    set(43, 36, TILE.DOOR);

    // staffroom furniture: table + chairs + cabinet
    fillRect(49, 22, 3, 2, TILE.DESK);
    fillRect(49, 26, 2, 1, TILE.DESK);
    fillRect(53, 30, 1, 1, TILE.SHELF);
    decor.push({ type: "rug", x: 48 * T, y: 24 * T, w: 6 * T, h: 5 * T, color: "#3d4a52" });
    decor.push({ type: "board", x: 51 * T, y: 19 * T + 2, w: 3 * T, h: 10, text: "JADVAL" });
    decor.push({ type: "plant", x: 48 * T + 10, y: 31 * T });
    decor.push({ type: "plant", x: 54 * T + 6, y: 21 * T });

    /* ---- classroom interior (x56..62, y20..32) --------------------------
       The user's words: "make classroom bigger — both in size and in assets:
       blackboard, mini gifts, teacher table, flowers — it should really feel
       like a classroom — bcs most of my time will be spent there."

       So this is not just a bigger empty box. Reading it as a real room:
         north wall  — the blackboard, full width, with a chalk ledge
         west side   — the teacher's table, angled to face the desks
         centre      — 3 columns x 3 rows of pupil desks (18 seats for 14)
         east wall   — a window bay, poster wall, and the "5-B" plaque
         south-east  — flowers and a plant, because a room people live in
                       has something growing in it
       Everything below is decor + DESK tiles; collision is only the walls and
       the furniture tiles, so the room stays walkable. */
    var cdx, cdy;
    // pupil desks: 3 columns x 3 rows, leaving an aisle down the middle
    for (cdy = 0; cdy < 3; cdy++) {
      for (cdx = 0; cdx < 3; cdx++) {
        var deskX = 57 + cdx * 2;
        var deskY = 22 + cdy * 3;
        if (deskX > 61) continue;                 // keep the east aisle clear
        fillRect(deskX, deskY, 1, 1, TILE.DESK);
      }
    }
    // teacher's table: two tiles, west of the front desks, facing the room
    fillRect(56, 21, 1, 2, TILE.DESK);

    // blackboard across the north wall — wider than the old one, which is the
    // single most important piece of classroom furniture
    decor.push({ type: "blackboard", x: 56 * T + 4, y: 19 * T + 3, w: 7 * T - 8, h: 30, text: "5-B  MATEMATIKA" });
    // chalk ledge under the board
    decor.push({ type: "board", x: 56 * T + 40, y: 19 * T + 34, w: 3 * T, h: 8, text: "" });

    // teacher's table has a flower on it — the smallest possible signal that
    // this room is looked after by a person, not a timetable
    decor.push({ type: "flowers", x: 56 * T + 14, y: 21 * T + 10 });
    // window bay on the east wall
    decor.push({ type: "window", x: 62 * T + 6, y: 21 * T, w: 18, h: 3 * T });
    // posters — the room's walls should say something
    decor.push({ type: "poster", x: 56 * T + 6, y: 24 * T, text: "5-B" });
    decor.push({ type: "poster", x: 56 * T + 6, y: 27 * T, text: "MATEMATIKA" });
    decor.push({ type: "wallPoster", x: 62 * T - 4, y: 26 * T, text: "OLIMPIADA" });
    // flowers by the door and on the window sill
    decor.push({ type: "flowers", x: 61 * T + 20, y: 31 * T + 12 });
    decor.push({ type: "plant", x: 56 * T + 10, y: 31 * T + 4 });
    decor.push({ type: "plant", x: 62 * T - 2, y: 30 * T });
    // a rug under the front of the room, so the eye finds the board
    decor.push({ type: "rug", x: 57 * T, y: 20 * T + 40, w: 6 * T, h: 2 * T, color: "#4a3b46" });
    // mini gifts on the shelf: the chapter's own theme, physically in the room
    decor.push({ type: "gifts", x: 61 * T + 4, y: 28 * T + 6 });
    // a lamp so the room is lit warmly rather than by the ceiling grid
    decor.push({ type: "lamp", x: 59 * T + 12, y: 26 * T + 12 });

    // ============ SHOP (x52..58, y12..17) — directly ABOVE the school =======
    // The user's words: "move Sardor aka's shop on above the school. make it
    // smallar, give the shop a more 'shoppy' look".
    //
    // So it is no longer a kiosk standing in the yard: it is a small stall on the
    // school's north side, facing it across a one-tile lane. "Above" is literal
    // on screen — the school runs x43..63, y19..38 and the shop sits at y12..17
    // with the school's roof directly underneath it.
    // 7x6 tiles including its own walls (the old kiosk was 11x11, so it is now
    // less than half the footprint) but dressed like a real dukon: a shelf wall,
    // an L-counter, a price board, a shopfront window, posters, lamps, a rug out
    // front and plants.
    strokeRect(52, 12, 7, 6, TILE.WALL);
    clearRect(53, 13, 5, 4, TILE.FLOOR);          // interior x53..57, y13..16
    // door in the south wall, onto the lane between the shop and the school
    set(54, 17, TILE.DOOR);
    set(55, 17, TILE.DOOR);
    set(56, 17, TILE.DOOR);
    // shelving along the back (north) wall — the four gift items sit here
    fillRect(53, 13, 5, 1, TILE.SHELF);
    // L-counter down the west side, display table on the east
    set(53, 14, TILE.SHELF);
    set(53, 15, TILE.SHELF);
    set(57, 15, TILE.SHELF);
    // Short route: a back door out of the school corridor (north end), then the
    // lane along the school's north wall joining it to the shop door. Without
    // this the shop would only be reachable by walking right round the school.
    // The back door sits on the corridor's north wall at x45 (the corridor now
    // starts at x44 after the school moved two tiles west).
    set(45, 19, TILE.DOOR);
    fillRect(33, 18, 24, 1, TILE.PATH);
    // ---- stall dressing: this must read as a little bazaar counter, not a shed.
    // The signboard hangs over the doorway; the price board is nailed up inside.
    decor.push({ type: "sign", x: 55 * T + T / 2, y: 17 * T + 20, text: "SARDOR SAVDO" });
    decor.push({ type: "board", x: 53 * T + 8, y: 12 * T + 4, w: 3 * T - 16, h: 14, text: "NARX" });
    // A shopfront window either side of the door: the single strongest signal
    // that this is a shop and not a hut. It is drawn as glass on the front wall.
    decor.push({ type: "window", x: 52 * T + 6, y: 17 * T + 6, w: 18, h: 18 });
    decor.push({ type: "window", x: 57 * T + 8, y: 17 * T + 6, w: 18, h: 18 });
    // goods actually visible inside: the chapter's gift motif on the shelves,
    // plus a small basket of produce by the counter
    decor.push({ type: "gifts", x: 53 * T + 10, y: 13 * T + 4 });
    decor.push({ type: "flowers", x: 57 * T + 16, y: 16 * T + 16 });
    // posters on the interior walls — a dukon's walls are never bare
    decor.push({ type: "wallPoster", x: 53 * T + 2, y: 14 * T + 4, text: "SOVGA" });
    decor.push({ type: "wallPoster", x: 57 * T + 6, y: 14 * T + 4, text: "YANGI" });
    // lamps at the doorway, a rug out front, plants flanking the entrance
    decor.push({ type: "lamp", x: 52 * T + 4, y: 18 * T + 4 });
    decor.push({ type: "lamp", x: 58 * T + 22, y: 18 * T + 4 });
    decor.push({ type: "rug", x: 54 * T, y: 18 * T + 6, w: 3 * T, h: 20, color: "#6b3f2c" });
    decor.push({ type: "plant", x: 52 * T + 8, y: 18 * T + 24 });
    decor.push({ type: "plant", x: 58 * T + 26, y: 18 * T + 24 });

    // ============ YARD DECOR ============
    // fountain at crossroads
    var fx = 31, fy = 20;
    for (var yy = -2; yy <= 2; yy++) {
      for (var xx = -2; xx <= 2; xx++) {
        if (xx * xx + yy * yy <= 5) set(fx + xx, fy + yy, TILE.WATER);
      }
    }
    decor.push({ type: "fountain", x: fx * T + T / 2, y: fy * T + T / 2 });

    // trees
    var treeSpots = [
      [20, 4], [24, 3], [40, 4], [43, 8], [20, 26],
      [24, 32], [36, 3], [22, 12], [41, 14], [19, 18],
      [43, 20], [26, 36], [37, 36]
    ];
    for (var t = 0; t < treeSpots.length; t++) {
      set(treeSpots[t][0], treeSpots[t][1], TILE.TREE);
    }
    // benches
    fillRect(28, 25, 2, 1, TILE.BENCH);
    fillRect(35, 16, 1, 2, TILE.BENCH);

    // planters near the school door
    decor.push({ type: "plant", x: 42 * T - 14, y: 34 * T + 8 });
    decor.push({ type: "plant", x: 44 * T - 14, y: 34 * T + 8 });

    // hoops / football lines in the yard corner (for ball play)
    decor.push({ type: "goal", x: 24 * T, y: 33 * T + 10 });
    decor.push({ type: "balllines", x: 26 * T, y: 31 * T, w: 6 * T, h: 4 * T });

    // ============ STREET DECOR ============ (x0..14)
    decor.push({ type: "gatearch", x: 28 * T, y: 34 * T - 4 });
    decor.push({ type: "lamppost", x: 6 * T, y: 33 * T });
    decor.push({ type: "lamppost", x: 12 * T, y: 33 * T });
    decor.push({ type: "bench_street", x: 4 * T, y: 26 * T });
    decor.push({ type: "wallPoster", x: 2 * T + 6, y: 20 * T + 6, text: "SOTILADI" });
    decor.push({ type: "wallPoster", x: 2 * T + 6, y: 24 * T + 6, text: "USTOZ KERAK" });

    // a couple of parked cars for street feel
    decor.push({ type: "car", x: 3 * T, y: 8 * T, color: "#8a8f96" });
    decor.push({ type: "car", x: 9 * T, y: 20 * T, color: "#6b5540" });

    // bicycle racks
    fillRect(16, 10, 1, 3, TILE.BENCH);

    // build shop item pedestals (used by the gift minigame overlay, not collisions)
    for (var s = 0; s < 4; s++) {
      buildSpots.push({ x: (53 + s * 1.25) * T + 6, y: 13 * T + 8, index: s });
    }
  }

  function tileAtPixel(px, py) {
    var cx = Math.floor(px / T);
    var cy = Math.floor(py / T);
    return get(cx, cy);
  }

  function blockedAtPixel(px, py) {
    var cx = Math.floor(px / T);
    var cy = Math.floor(py / T);
    return isBlockedTile(cx, cy);
  }

  // circle-vs-tile collision for the player's feet
  function canStand(px, py, radius) {
    radius = radius || 7;
    var pts = [
      [px - radius, py - radius], [px + radius, py - radius],
      [px - radius, py + radius], [px + radius, py + radius],
      [px, py - radius], [px, py + radius],
      [px - radius, py], [px + radius, py]
    ];
    for (var i = 0; i < pts.length; i++) {
      if (blockedAtPixel(pts[i][0], pts[i][1])) return false;
    }
    return true;
  }

  function zoneAtPixel(px, py) {
    // innermost zone wins: iterate in reverse priority order
    var order = ["staffroom", "classroom", "shop", "corridor2", "corridor", "gate", "yard", "street"];
    for (var i = 0; i < order.length; i++) {
      for (var z = 0; z < ZONES.length; z++) {
        var Z = ZONES[z];
        if (Z.id !== order[i]) continue;
        if (px >= Z.x && px < Z.x + Z.w && py >= Z.y && py < Z.y + Z.h) {
          return Z.id;
        }
      }
    }
    return "street";
  }

  // corridor2 folds into corridor for logic
  function zoneLogical(px, py) {
    var z = zoneAtPixel(px, py);
    return z === "corridor2" ? "corridor" : z;
  }

  function anchor(zone, index) {
    var arr = ANCHORS[zone] || ANCHORS.yard;
    var a = arr[(index || 0) % arr.length];
    return { x: a.x * T + T / 2, y: a.y * T + T / 2 + 6 };
  }

  function worldSize() { return { w: COLS * T, h: ROWS * T }; }

  return {
    T: T, COLS: COLS, ROWS: ROWS, TILE: TILE,
    ZONES: ZONES, ANCHORS: ANCHORS,
    build: build,
    get: get,
    set: set,
    tileAtPixel: tileAtPixel,
    blockedAtPixel: blockedAtPixel,
    canStand: canStand,
    zoneAtPixel: zoneAtPixel,
    zoneLogical: zoneLogical,
    anchor: anchor,
    worldSize: worldSize,
    decor: function () { return decor; },
    buildSpots: function () { return buildSpots; }
  };
})();
