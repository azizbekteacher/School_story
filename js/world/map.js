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
    { id: "gate",      x: 14 * T, y: 24 * T, w: 6 * T, h: 14 * T },
    { id: "yard",      x: 18 * T, y: 0,   w: 27 * T, h: 40 * T },
    { id: "shop",      x: 3 * T,  y: 3 * T, w: 11 * T, h: 11 * T },
    { id: "corridor",  x: 46 * T, y: 20 * T, w: 3 * T, h: 17 * T },
    { id: "corridor2", x: 46 * T, y: 34 * T, w: 17 * T, h: 4 * T },
    { id: "staffroom", x: 50 * T, y: 20 * T, w: 7 * T, h: 13 * T },
    { id: "classroom", x: 58 * T, y: 20 * T, w: 5 * T, h: 13 * T }
  ];

  // Named anchors used by the story data (zone + index -> pixel position)
  var ANCHORS = {
    staffroom: [
      { x: 52, y: 24 }, { x: 55, y: 27 }, { x: 52, y: 30 },
      { x: 54, y: 22 }, { x: 51, y: 26 }, { x: 55, y: 23 }
    ],
    classroom: [
      { x: 60, y: 28 }, { x: 60, y: 24 }, { x: 59, y: 22 },
      { x: 61, y: 30 }, { x: 60, y: 26 }, { x: 59, y: 29 }
    ],
    gate: [
      { x: 16, y: 32 }, { x: 16, y: 28 }, { x: 15, y: 34 },
      { x: 17, y: 30 }, { x: 16, y: 26 }, { x: 15, y: 31 }
    ],
    yard: [
      { x: 30, y: 26 }, { x: 24, y: 20 }, { x: 38, y: 22 },
      { x: 28, y: 14 }, { x: 34, y: 30 }, { x: 22, y: 30 }
    ],
    shop: [
      { x: 8, y: 6 }, { x: 6, y: 8 }, { x: 11, y: 9 },
      { x: 9, y: 11 }, { x: 5, y: 6 }, { x: 11, y: 5 }
    ],
    street: [
      { x: 10, y: 30 }, { x: 8, y: 22 }, { x: 12, y: 18 },
      { x: 9, y: 36 }, { x: 6, y: 26 }, { x: 13, y: 24 }
    ],
    corridor: [
      { x: 47, y: 30 }, { x: 47, y: 35 }, { x: 52, y: 35 },
      { x: 58, y: 35 }, { x: 47, y: 24 }, { x: 55, y: 36 }
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

    // ============ SHOP (x2..14, y2..14) ============
    strokeRect(2, 2, 13, 13, TILE.WALL);
    clearRect(3, 3, 11, 11, TILE.FLOOR);
    // door in the east wall -> street
    set(14, 7, TILE.DOOR);
    set(14, 8, TILE.DOOR);
    set(14, 9, TILE.DOOR);
    // shelves along the north wall (the four items sit here)
    fillRect(4, 3, 1, 1, TILE.SHELF);
    fillRect(6, 3, 1, 1, TILE.SHELF);
    fillRect(8, 3, 1, 1, TILE.SHELF);
    fillRect(10, 3, 1, 1, TILE.SHELF);
    fillRect(12, 3, 1, 1, TILE.SHELF);
    // counter
    fillRect(4, 11, 6, 1, TILE.SHELF);
    decor.push({ type: "rug", x: 8 * T, y: 8 * T, w: 7 * T, h: 4 * T, color: "#5a3a2e" });
    decor.push({ type: "lamp", x: 7 * T, y: 5 * T });
    decor.push({ type: "lamp", x: 12 * T, y: 9 * T });
    decor.push({ type: "sign", x: 8 * T, y: 2 * T - 6, text: "SARDOR SAVDO" });

    // ============ SCHOOL BUILDING (x45..63, y19..38) ============
    fillRect(45, 19, 19, 20, TILE.WALL);
    clearRect(46, 20, 17, 17, TILE.FLOOR);

    // corridor L
    fillRect(46, 34, 17, 3, TILE.CARPET);   // horizontal
    fillRect(46, 20, 3, 17, TILE.CARPET);    // vertical

    // staffroom box  x49..57, y19..33
    strokeRect(49, 19, 9, 15, TILE.WALL);
    clearRect(50, 20, 7, 13, TILE.FLOOR);
    // staffroom door (south wall)
    set(52, 33, TILE.DOOR);
    set(53, 33, TILE.DOOR);
    set(54, 33, TILE.DOOR);

    // classroom box x57..63, y19..33
    strokeRect(57, 19, 6, 15, TILE.WALL);
    clearRect(58, 20, 5, 13, TILE.FLOOR);
    // classroom door (south wall)
    set(59, 33, TILE.DOOR);
    set(60, 33, TILE.DOOR);
    set(61, 33, TILE.DOOR);

    // school outer door (west wall) -> yard path
    set(45, 35, TILE.DOOR);
    set(45, 36, TILE.DOOR);

    // staffroom furniture: table + chairs + cabinet
    fillRect(51, 22, 3, 2, TILE.DESK);
    fillRect(51, 26, 2, 1, TILE.DESK);
    fillRect(55, 30, 1, 1, TILE.SHELF);
    decor.push({ type: "rug", x: 50 * T, y: 24 * T, w: 6 * T, h: 5 * T, color: "#3d4a52" });
    decor.push({ type: "board", x: 53 * T, y: 19 * T + 2, w: 3 * T, h: 10, text: "JADVAL" });
    decor.push({ type: "plant", x: 50 * T + 10, y: 31 * T });
    decor.push({ type: "plant", x: 56 * T + 6, y: 21 * T });

    // classroom: desks in rows + blackboard
    var dx, dy;
    for (dy = 0; dy < 3; dy++) {
      for (dx = 0; dx < 2; dx++) {
        fillRect(59 + dx * 2, 22 + dy * 3, 1, 1, TILE.DESK);
      }
    }
    decor.push({ type: "blackboard", x: 58 * T, y: 19 * T + 4, w: 5 * T, h: 26 });
    decor.push({ type: "plant", x: 58 * T + 8, y: 31 * T });
    decor.push({ type: "poster", x: 62 * T - 6, y: 24 * T, text: "5-B" });

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
      [20, 4], [24, 3], [40, 4], [43, 8], [20, 26], [42, 26],
      [24, 32], [40, 32], [36, 3], [22, 12], [41, 14], [19, 18],
      [43, 20], [26, 36], [37, 36]
    ];
    for (var t = 0; t < treeSpots.length; t++) {
      set(treeSpots[t][0], treeSpots[t][1], TILE.TREE);
    }
    // benches
    fillRect(28, 25, 2, 1, TILE.BENCH);
    fillRect(35, 16, 1, 2, TILE.BENCH);

    // planters near the school door
    decor.push({ type: "plant", x: 44 * T - 14, y: 34 * T + 8 });
    decor.push({ type: "plant", x: 46 * T - 14, y: 34 * T + 8 });

    // hoops / football lines in the yard corner (for ball play)
    decor.push({ type: "goal", x: 24 * T, y: 33 * T + 10 });
    decor.push({ type: "balllines", x: 26 * T, y: 31 * T, w: 6 * T, h: 4 * T });

    // ============ STREET DECOR ============ (x0..14)
    decor.push({ type: "gatearch", x: 18 * T, y: 34 * T - 4 });
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
      buildSpots.push({ x: (5 + s * 2) * T, y: 3 * T + 8, index: s });
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
