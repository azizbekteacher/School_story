/* Account layer — Google sign-in and cloud save sync against the Cloudflare
   Worker in worker/.

   OPTIONAL BY DESIGN. If this script is absent, if the Worker is unreachable, or
   if the player never signs in, the game behaves exactly as it does today
   (localStorage + memory.js + memory.md). Nothing here may throw at load time or
   block the boot, because index.html loads it before main.js and the game has to
   survive a double-click with no network at all.

   Contract used by the rest of the game:
     G.account.available()   -> is there a Worker to talk to
     G.account.user()        -> { id, email, name, picture } or null
     G.account.init()        -> restore a session, then settle (never rejects)
     G.account.signIn()      -> Google sign-in; resolves when settled
     G.account.signOut()
     G.account.onChange(cb)
     G.account.sync(save)    -> push a save (best effort, never throws)
     G.account.pull()        -> { save, updatedAt } or null

   Design notes that matter:
   - The Worker verifies the Google ID token server-side. This file never decides
     who the player is: it sends the credential and trusts only what /me returns.
   - The session is an HttpOnly cookie, so there is no token for JavaScript to
     store and none to leak. We only ever ask the browser to include credentials.
   - Sign-in is progressive: the game is fully playable signed out, and the
     Google script is loaded only when the player actually asks to sign in. That
     keeps the no-network default intact. */
window.G = window.G || {};

G.account = (function () {
  /* Where the Worker lives. Empty means "not configured": the account UI hides
     itself and the game plays exactly as before. Change this one line after
     `wrangler deploy`, or set it from the console during development. */
  var DEFAULT_API_BASE = "";

  var listeners = [];
  var currentUser = null;
  var config = {
    enabled: false,
    clientId: "",
    apiBase: "",
    reached: false,      // did we ever successfully talk to the Worker
    lastError: ""
  };

  var gisPromise = null;   // loaded Google Identity Services script
  var inited = false;
  var initPromise = null;

  function emit() {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](currentUser); } catch (e) { /* a listener must not break the loop */ }
    }
  }

  function onChange(cb) {
    if (typeof cb !== "function") return function () {};
    listeners.push(cb);
    return function () {
      var i = listeners.indexOf(cb);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  function available() { return !!(config.enabled && config.clientId && config.apiBase); }
  function user() { return currentUser; }
  function isSignedIn() { return !!currentUser; }

  /* ---- transport ------------------------------------------------------- */

  function api(path, opts) {
    opts = opts || {};
    var url = config.apiBase.replace(/\/$/, "") + path;
    var init = {
      method: opts.method || "GET",
      // The session cookie is HttpOnly; the browser must be told to send it.
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store"
    };
    if (opts.body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    return fetch(url, init).then(function (res) {
      config.reached = true;
      var ct = (res.headers && res.headers.get && res.headers.get("content-type")) || "";
      var parsed = ct.indexOf("json") !== -1 ? res.json() : res.text().then(function (t) { return { raw: t }; });
      return parsed.then(function (body) {
        return { ok: res.ok, status: res.status, body: body };
      });
    }, function (err) {
      config.reached = false;
      config.lastError = String(err && err.message ? err.message : err);
      return { ok: false, status: 0, body: null, networkError: true };
    });
  }

  /* ---- Google Identity Services --------------------------------------- */

  function loadGis() {
    if (gisPromise) return gisPromise;
    gisPromise = new Promise(function (resolve, reject) {
      if (typeof document === "undefined") { reject(new Error("no document")); return; }
      if (window.google && window.google.accounts && window.google.accounts.id) {
        resolve(window.google.accounts.id); return;
      }
      var s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.onload = function () {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          resolve(window.google.accounts.id);
        } else {
          reject(new Error("Google Identity Services did not initialise"));
        }
      };
      s.onerror = function () { reject(new Error("could not load Google Identity Services")); };
      document.head.appendChild(s);
    });
    return gisPromise;
  }

  function exchangeCredential(credential) {
    return api("/auth/google", { method: "POST", body: { credential: credential } })
      .then(function (r) {
        if (!r.ok) {
          config.lastError = (r.body && (r.body.message || r.body.error)) || ("HTTP " + r.status);
          return null;
        }
        currentUser = r.body && r.body.user ? r.body.user : null;
        emit();
        return currentUser;
      });
  }

  /* ---- session restore ------------------------------------------------- */

  function init() {
    if (inited) return initPromise || Promise.resolve(currentUser);
    inited = true;
    config.apiBase = (window.G_ACCOUNT_API || DEFAULT_API_BASE || "").replace(/\/$/, "");

    // No Worker configured: settle immediately and stay inert. This is the
    // double-click / file:// case and must not make a single network request.
    if (!config.apiBase) {
      initPromise = Promise.resolve(null);
      return initPromise;
    }

    initPromise = api("/auth/config").then(function (r) {
      if (!r.ok || !r.body) {
        config.enabled = false;
        return null;
      }
      config.enabled = !!r.body.enabled;
      config.clientId = r.body.clientId || "";
      if (!config.enabled) return null;
      // Has this browser got a live session cookie already?
      return api("/me").then(function (me) {
        if (me.ok && me.body) {
          currentUser = {
            id: me.body.id || me.body.sub || "",
            email: me.body.email || "",
            name: me.body.name || ""
          };
          emit();
        }
        return currentUser;
      });
    }).catch(function (e) {
      // A Worker that is down must never break the game.
      config.enabled = false;
      config.lastError = String(e && e.message ? e.message : e);
      return null;
    });

    return initPromise;
  }

  /* ---- sign in / out --------------------------------------------------- */

  function signIn() {
    if (!config.apiBase) return Promise.resolve(null);
    return init().then(function () {
      if (!available()) {
        config.lastError = "Hisob tizimi sozlanmagan";
        return null;
      }
      return loadGis().then(function (gis) {
        return new Promise(function (resolve) {
          var settled = false;
          function settle(u) {
            if (settled) return;
            settled = true;
            resolve(u);
          }
          try {
            gis.initialize({
              client_id: config.clientId,
              callback: function (resp) {
                if (!resp || !resp.credential) { settle(null); return; }
                exchangeCredential(resp.credential).then(settle, function () { settle(null); });
              },
              auto_select: false,
              cancel_on_tap_outside: true
            });
            // One Tap is unreliable on file:// and on some mobile browsers; the
            // prompt call is best effort and the button fallback below is what
            // actually matters.
            if (gis.prompt) {
              try {
                gis.prompt(function () { /* dismissed; the callback may still fire */ });
              } catch (e) { /* ignore */ }
            }
            // Also render a real Google button into a detached container and
            // click it, which is what works when prompt() is suppressed.
            var host = document.getElementById("gsi-hidden");
            if (!host) {
              host = document.createElement("div");
              host.id = "gsi-hidden";
              host.style.position = "fixed";
              host.style.left = "-9999px";
              host.style.top = "0";
              document.body.appendChild(host);
            }
            host.innerHTML = "";
            gis.renderButton(host, {
              type: "standard",
              size: "large",
              theme: "outline",
              text: "signin_with"
            });
            var btn = host.querySelector("div[role=button], button");
            if (btn) { try { btn.click(); } catch (e) { /* ignore */ } }
          } catch (e) {
            config.lastError = String(e && e.message ? e.message : e);
            settle(null);
          }
          // Never leave the caller hanging if GIS silently does nothing.
          setTimeout(function () { settle(currentUser); }, 60000);
        });
      });
    }).catch(function (e) {
      config.lastError = String(e && e.message ? e.message : e);
      return null;
    });
  }

  function signOut() {
    currentUser = null;
    emit();
    if (!config.apiBase) return Promise.resolve(true);
    return api("/auth/logout", { method: "POST" }).then(function () { return true; }, function () { return false; });
  }

  function deleteAccount() {
    if (!config.apiBase) return Promise.resolve(false);
    return api("/me", { method: "DELETE" }).then(function (r) {
      if (r.ok) { currentUser = null; emit(); }
      return !!r.ok;
    });
  }

  /* ---- save sync ------------------------------------------------------- */

  /* Push a save. Always resolves; a failed push is not an error the player needs
     to see mid-game. Returns true only if the Worker accepted it. */
  function sync(save) {
    if (!available() || !currentUser || !save) return Promise.resolve(false);
    return api("/save", { method: "PUT", body: { save: save } }).then(function (r) {
      if (r.ok) {
        config.lastSavedAt = (r.body && r.body.updatedAt) || new Date().toISOString();
        return true;
      }
      // 401 means the cookie expired: drop the stale local idea of a session.
      if (r.status === 401) { currentUser = null; emit(); }
      return false;
    }, function () { return false; });
  }

  /* Newest remote save, or null.
     Returns { save, updatedAt }. The caller (main.js) decides how to merge: the
     rule is newest-wins, and the losing copy is kept rather than discarded, so a
     clock skew between devices can never destroy someone's progress. */
  function pull() {
    if (!available() || !currentUser) return Promise.resolve(null);
    return api("/save").then(function (r) {
      if (!r.ok || !r.body || !r.body.save) return null;
      return { save: r.body.save, updatedAt: r.body.updatedAt || "" };
    }, function () { return null; });
  }

  return {
    available: available,
    user: user,
    isSignedIn: isSignedIn,
    init: init,
    signIn: signIn,
    signOut: signOut,
    deleteAccount: deleteAccount,
    onChange: onChange,
    sync: sync,
    pull: pull,
    config: config,
    _emit: emit,
    // test hooks
    __setApiBase: function (base) { config.apiBase = (base || "").replace(/\/$/, ""); },
    __setUser: function (u) { currentUser = u; emit(); }
  };
})();
