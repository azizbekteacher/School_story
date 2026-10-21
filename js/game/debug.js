/* Debug bridge for automated playtesting. Exposed always (harmless), used by tools/playtest.js */
window.G = window.G || {};

G.debug = {
  // force-activate a minigame node's game directly, bypassing the story node lookup
  activeMinigame: function () { return G.minigameHost.getActiveId(); },
  minigameDone: function () { return !G.minigameHost.isActive(); },

  // Auto-resolve whatever minigame is showing, by pressing its own keys via input.
  // Falls back to directly finishing with a win.
  // force-resolve the running minigame (test only)
  forceMinigame: function (win) {
    return G.minigameHost.forceFinish(win === false ? { win: false } : { win: true });
  },

  canAutoPlayMinigame: function () { return G.minigameHost.isActive(); },

  state: function () {
    return {
      beat: G.state.beat,
      trust: G.state.trust,
      intel: G.state.intel.slice(),
      notes: G.state.notes.length,
      choices: G.state.choicesMade.length,
      flags: Object.keys(G.state.flags)
    };
  },

  scene: function () {
    return G.dialogue.isActive() ? G.dialogue.getSceneKey() : null;
  },

  nodeId: function () {
    return G.dialogue.isActive() ? G.dialogue.debugNodeId() : null;
  },

  // returns description of the current dialogue node
  inspectNode: function () {
    if (!G.dialogue.isActive()) return null;
    var n = G.dialogue.debugNode();
    if (!n) return null;
    var opts = G.dialogue.debugOptions();
    return {
      type: n.type,
      speaker: n.speaker || "",
      text: n.text || "",
      prompt: n.prompt || "",
      typing: G.dialogue.debugTyping(),
      options: opts.map(function (o) { return { id: o.id || "", text: o.text || "", locked: !!o.locked }; })
    };
  },

  advance: function () { return G.dialogue.debugPick(0); },
  pick: function (i) { return G.dialogue.debugPick(i); },
  finishMulti: function () { G.dialogue.debugFinishMulti(); },

  // skip the typewriter so the playtest does not need to wait frames
  revealText: function () {
    // advance once reveals the full text of a say node (see dialogue: endsTyping)
    return G.dialogue.debugPick(0);
  },

  isDebrief: function () { return G.debrief.isVisible(); },

  // teleport helpers so a headless run can reach each NPC
  gotoZone: function (zone, index) {
    var a = G.map.anchor(zone, index || 0);
    G.world.setPlayerPos(a.x, a.y);
    G.quest.clearCooldown();
    return { x: a.x, y: a.y, zone: G.world.playerZone() };
  },

  playerZone: function () { return G.world.playerZone(); },
  npcs: function () {
    var story = G.data.story;
    if (!story || !story.npcs) return [];
    return story.npcs.map(function (n) {
      var inst = G.world.npcById(n.id);
      return {
        id: n.id,
        zone: n.zone,
        visible: inst ? G.world.npcVisible(inst) : false,
        entry: n.entry
      };
    });
  },
  interact: function (npcId) {
    var inst = G.world.npcById(npcId);
    if (!inst) return null;
    var e = inst.entry || {};
    var key = e[G.state.beat] || e["default"] || Object.keys(e).map(function (k) { return e[k]; })[0];
    if (!key) return null;
    G.quest.startScene(key);
    return key;
  },
  beat: function () { return G.state.beat; },
  objective: function () { return G.state.currentObjective(); },

  // force beat progression without the dialogue, for smoke tests
  setBeat: function (b) { G.state.setBeat(b); },

  summary: function () {
    return {
      beat: G.state.beat,
      trust: G.state.trust,
      intel: G.state.intel.length,
      notes: G.state.notes.length,
      choices: G.state.choicesMade.length,
      finished: G.state.finished
    };
  }
};
