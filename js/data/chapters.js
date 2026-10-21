/* Chapter registry.
   Each chapter is a complete mission: its own story, beats, characters and
   teaching content. The engine is shared; activating a chapter swaps two
   references (G.data.story and G.data.learning) and nothing else.

   Load order: after every js/data/story*.js, js/data/learning*.js and
   js/data/minigames/*.js file, and before js/main.js. The references are
   captured once, at load, so activating a chapter can never overwrite the
   chapter-1 base with a chapter-2 object. */
window.G = window.G || {};
G.data = G.data || {};

G.chapters = (function () {
  /* Captured once, at script-load time. Do not re-derive from G.data.story
     later — by then it points at whichever chapter is active. */
  var CH1_STORY = G.data.story || null;
  var CH1_LEARNING = G.data.learning || null;

  function firstBeatOf(story) {
    if (!story || !story.objectives) return "arrive";
    var keys = Object.keys(story.objectives);
    return keys.length ? keys[0] : "arrive";
  }

  function make(id, num, story, learning, startZone, startAnchor, status) {
    if (!story) return null;
    return {
      id: id,
      num: num,
      title: story.title || id,
      subtitle: story.subtitle || "",
      brief: story.brief || [],
      story: story,
      learning: learning || CH1_LEARNING,
      startZone: startZone || "street",
      startAnchor: startAnchor || 0,
      firstBeat: firstBeatOf(story),
      objectives: story.objectives || {},
      status: status || "ready"
    };
  }

  var CHAPTERS = [];

  /* Chapter 1 is the original single-story game. Its spawn is world.init()'s own
     spawn, so startZone is only a label here; main.js deliberately leaves
     chapter 1's spawn and camera alone. */
  var c1 = make("ch1", 1, CH1_STORY, CH1_LEARNING, "street", 0, "ready");
  if (c1) CHAPTERS.push(c1);

  var c2 = make("ch2", 2, G.data.chapter2, G.data.chapter2Learning,
    (G.data.chapter2 && G.data.chapter2.startZone) || "corridor",
    (G.data.chapter2 && G.data.chapter2.startAnchor) || 0,
    G.data.chapter2 ? "ready" : "missing");
  if (c2) CHAPTERS.push(c2);

  /* Every chapter is playable from the start: no unlock flags, no prerequisites,
     no carry-over state from another chapter. A new chapter is added by defining
     its data and adding one make(...) call above — nothing else. This helper
     exists so a future chapter cannot accidentally introduce a lock. */
  function playableFromStart(id) {
    var ch = get(id);
    return !!(ch && ch.status === "ready" && ch.story && ch.story.scenes);
  }

  function list() { return CHAPTERS.slice(); }

  function get(id) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].id === id) return CHAPTERS[i];
    }
    return CHAPTERS[0] || null;
  }

  function indexOf(id) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].id === id) return i;
    }
    return 0;
  }

  /* Make a chapter live. Swaps the story the engine reads and the teaching
     content the debrief/notebook read, and records the id in state so the
     save file knows which chapter to resume into. */
  function activate(id) {
    var ch = get(id);
    if (!ch) return null;
    G.data.story = ch.story;
    if (ch.learning) G.data.learning = ch.learning;
    G.state.chapter = ch.id;
    return ch;
  }

  /* Which chapter is live, according to the engine's own data pointer. Used
     when no state exists yet (fresh boot). */
  function current() {
    if (G.state && G.state.chapter) return get(G.state.chapter);
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].story === G.data.story) return CHAPTERS[i];
    }
    return get("ch1");
  }

  return {
    list: list,
    get: get,
    indexOf: indexOf,
    activate: activate,
    current: current,
    firstBeatOf: firstBeatOf,
    playableFromStart: playableFromStart,
    count: function () { return CHAPTERS.length; }
  };
})();
