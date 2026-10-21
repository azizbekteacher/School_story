/* Game state: flags, intel, trust, beat, scores, journal. Single source of truth. */
window.G = window.G || {};

G.state = (function () {
  var flags = {};
  var intel = [];
  var trust = 0;
  var beat = "arrive";
  var scores = {};          // principleId -> { good, bad, notes: [] }
  var notes = [];           // every scored moment, in order
  var journal = [];         // free notes
  var choicesMade = [];     // ordered choice ids
  var marks = {};           // choiceId -> true
  var objectiveOverride = null;
  var started = false;
  var finished = false;
  var chapter = "ch1";      // which chapter is live

  function reset() {
    flags = {};
    intel = [];
    trust = 0;
    beat = "arrive";
    scores = {};
    notes = [];
    journal = [];
    choicesMade = [];
    marks = {};
    objectiveOverride = null;
    started = false;
    finished = false;
    // `chapter` deliberately survives reset: the caller chooses the chapter,
    // and the save file needs it to know what to resume into.
  }

  /* ---- change notification: lets the memory layer autosave on real progress
     rather than on a timer alone ---- */
  var listeners = [];
  function onChange(cb) {
    if (typeof cb === "function" && listeners.indexOf(cb) === -1) listeners.push(cb);
    return cb;
  }
  function emit(what) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](what); } catch (e) { console.warn("state listener error", e); }
    }
  }

  function setFlag(name, value) {
    flags[name] = (value === undefined) ? true : value;
    emit("flag");
  }

  function hasFlag(name) { return !!flags[name]; }

  function addIntel(id) {
    if (!id) return false;
    if (intel.indexOf(id) !== -1) return false;
    intel.push(id);
    G.audio.blip(760);
    emit("intel");
    return true;
  }

  function hasIntel(id) { return intel.indexOf(id) !== -1; }

  function addTrust(delta) {
    var before = trust;
    trust = G.util.clamp(trust + (delta || 0), 0, 10);
    emit("trust");
    return trust - before;
  }

  function setBeat(id) {
    if (!id || id === beat) return false;
    beat = id;
    G.audio.door();
    emit("beat");
    return true;
  }

  function addNote(n, beatOverride) {
    if (!n) return;
    var principle = n.principle || "I-001";
    var text = n.text || "";
    if (!scores[principle]) scores[principle] = { good: 0, bad: 0, notes: [] };
    var verdict = n.verdict || "ok";
    if (verdict === "good") scores[principle].good += 1;
    else if (verdict === "bad") scores[principle].bad += 1;
    scores[principle].notes.push({ text: text, verdict: verdict });
    notes.push({ principle: principle, text: text, verdict: verdict, beat: beatOverride || beat });
    emit("note");
  }

  function addJournal(text, beatOverride) {
    if (!text) return;
    journal.push({ text: text, beat: beatOverride || beat });
    emit("journal");
  }

  function recordChoice(id) {
    if (!id) return;
    if (marks[id]) { /* still push, repeated visits are meaningful */ }
    marks[id] = true;
    choicesMade.push(id);
    emit("choice");
  }

  function hasChosen(id) { return !!marks[id]; }

  function setObjectiveOverride(text) { objectiveOverride = text; emit("objective"); }

  function currentObjective() {
    if (objectiveOverride) return objectiveOverride;
    var st = G.data.story;
    if (!st || !st.objectives) return "";
    return st.objectives[beat] || "";
  }

  function trustLabel() {
    if (trust <= 2) return "Uzoq";
    if (trust <= 4) return "Ehtiyotkor";
    if (trust <= 6) return "Ochilyapti";
    if (trust <= 8) return "Ishonch";
    return "Ishonch to'la";
  }

  function scoreSummary() {
    var total = 0, count = 0;
    for (var k in scores) {
      if (!scores.hasOwnProperty(k)) continue;
      total += scores[k].good * 2 + scores[k].bad * -1;
      count++;
    }
    var avg = notes.length ? total / notes.length : 0;
    return { total: total, avg: avg, principles: count, notes: notes.length };
  }

  function avgQuality() {
    if (!notes.length) return 0;
    var sum = 0;
    for (var i = 0; i < notes.length; i++) {
      var v = notes[i].verdict;
      sum += v === "good" ? 2 : (v === "ok" ? 1 : (v === "weak" ? 0 : -1));
    }
    return sum / notes.length;
  }

  /* ---- serialisation: the whole game state, plain JSON-able ---- */
  function snapshot() {
    return {
      v: 1,
      flags: flags,
      intel: intel.slice(),
      trust: trust,
      beat: beat,
      scores: scores,
      notes: notes,
      journal: journal,
      choicesMade: choicesMade.slice(),
      marks: marks,
      objectiveOverride: objectiveOverride,
      chapter: chapter,
      started: started,
      finished: finished
    };
  }

  /* Restore a snapshot produced by snapshot(). Defensive: every field is
     validated against the expected type so a hand-edited or older memory.md
     can never corrupt live state. Returns the list of fields rejected. */
  function restore(s) {
    var bad = [];
    if (!s || typeof s !== "object") return ["(not an object)"];
    function isObj(o) { return o && typeof o === "object" && !Array.isArray(o); }

    if (isObj(s.flags)) flags = s.flags; else if (s.flags !== undefined) bad.push("flags");
    if (Array.isArray(s.intel)) intel = s.intel.filter(function (x) { return typeof x === "string"; });
    else if (s.intel !== undefined) bad.push("intel");
    if (typeof s.trust === "number" && isFinite(s.trust)) trust = G.util.clamp(s.trust, 0, 10);
    else if (s.trust !== undefined) bad.push("trust");
    if (typeof s.beat === "string") beat = s.beat;
    else if (s.beat !== undefined) bad.push("beat");
    if (isObj(s.scores)) scores = s.scores; else if (s.scores !== undefined) bad.push("scores");
    if (Array.isArray(s.notes)) notes = s.notes; else if (s.notes !== undefined) bad.push("notes");
    if (Array.isArray(s.journal)) journal = s.journal; else if (s.journal !== undefined) bad.push("journal");
    if (Array.isArray(s.choicesMade)) choicesMade = s.choicesMade.slice();
    else if (s.choicesMade !== undefined) bad.push("choicesMade");
    if (isObj(s.marks)) marks = s.marks; else if (s.marks !== undefined) bad.push("marks");
    if (typeof s.objectiveOverride === "string" || s.objectiveOverride === null) objectiveOverride = s.objectiveOverride;
    if (typeof s.chapter === "string") chapter = s.chapter;
    if (typeof s.started === "boolean") started = s.started;
    if (typeof s.finished === "boolean") finished = s.finished;
    return bad;
  }

  return {
    reset: reset,
    onChange: onChange,
    snapshot: snapshot,
    restore: restore,
    setFlag: setFlag,
    hasFlag: hasFlag,
    addIntel: addIntel,
    hasIntel: hasIntel,
    addTrust: addTrust,
    setBeat: setBeat,
    addNote: addNote,
    addJournal: addJournal,
    recordChoice: recordChoice,
    hasChosen: hasChosen,
    setObjectiveOverride: setObjectiveOverride,
    currentObjective: currentObjective,
    trustLabel: trustLabel,
    scoreSummary: scoreSummary,
    avgQuality: avgQuality,
    get flags() { return flags; },
    get intel() { return intel; },
    get trust() { return trust; },
    get beat() { return beat; },
    get notes() { return notes; },
    get journal() { return journal; },
    get choicesMade() { return choicesMade; },
    get scores() { return scores; },
    get marks() { return marks; },
    set chapter(v) { chapter = v; },
    get chapter() { return chapter; },
    set started(v) { started = v; },
    get started() { return started; },
    set finished(v) { finished = v; },
    get finished() { return finished; }
  };
})();
