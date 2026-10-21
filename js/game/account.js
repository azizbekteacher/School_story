/* Account layer — Google sign-in and remote save sync against the Cloudflare
   Worker. OPTIONAL BY DESIGN: if this script is absent, if the Worker is
   unreachable, or if the player never signs in, the game behaves exactly as it
   does today (localStorage + memory.js + memory.md).

   Contract used by the rest of the game:
     G.account.available()   -> is there a Worker to talk to
     G.account.user()        -> { id, email, name, picture } or null
     G.account.init()        -> restore a session, then settle
     G.account.signIn()      -> open Google sign-in; resolves when settled
     G.account.signOut()
     G.account.onChange(cb)
     G.account.sync(save)    -> push a save object (best effort, never throws)
     G.account.pull()        -> newest remote save, or null

   This file is a stub until the account integration lands. It must never throw
   at load time. */
window.G = window.G || {};

G.account = (function () {
  var listeners = [];
  var currentUser = null;
  var config = { enabled: false, clientId: "", apiBase: "" };

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](currentUser); } catch (e) { /* a listener must not break the loop */ }
    }
  }

  function onChange(cb) {
    if (typeof cb === "function") listeners.push(cb);
  }

  function available() { return !!config.enabled; }
  function user() { return currentUser; }

  function init() {
    // failsafe: resolve quickly so boot never waits on the network
    return Promise.resolve(null);
  }

  function signIn() { return Promise.resolve(null); }
  function signOut() { currentUser = null; emit(); return Promise.resolve(); }
  function sync() { return Promise.resolve(false); }
  function pull() { return Promise.resolve(null); }

  return {
    available: available,
    user: user,
    init: init,
    signIn: signIn,
    signOut: signOut,
    onChange: onChange,
    sync: sync,
    pull: pull,
    config: config,
    _emit: emit
  };
})();
