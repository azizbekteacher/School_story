/* Touch controls — feeds the same G.input events the keyboard produces, so
   nothing downstream needs to know whether a thumb or a key drove it.

   Design:
   - The buttons are real DOM buttons over the canvas (see #touch-ui in
     index.html), so the browser gives us focus, hit-areas and accessibility for
     free. `touchstart` presses a virtual key, `touchend`/`touchcancel` releases
     it. A `pointerdown` fallback covers devices that report a fine pointer but
     are driven by a finger.
   - Pressing a virtual key calls `G.input.pressVirtual(k)`, which sets the same
     `down`/`pressed` state a real keydown sets and then clears `pressed` at the
     end of the frame exactly like the keyboard path. Nothing downstream changes.
   - The canvas is letterboxed; `toGame` maps a CSS-pixel point back through the
     same transform, so taps land where they look.
   - Only shown on touch devices, or when there is no fine pointer. Desktop
     players never see a d-pad.

   This module must never throw at load time: index.html loads it before
   main.js, and a broken stub here once took the whole boot down. */

window.G = window.G || {};

G.touch = (function () {
  var enabled = false;
  var active = {};          // key -> true while held
  var installed = false;
  var uiEl = null;

  function isTouchDevice() {
    if (typeof window === "undefined") return false;
    if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
    return typeof window.matchMedia === "function" &&
      !!window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  }

  /* Map a pointer position in CSS pixels to logical canvas coordinates. */
  function toGame(clientX, clientY) {
    if (typeof document === "undefined") return { x: 0, y: 0 };
    var cv = document.getElementById("game");
    if (!cv || !cv.getBoundingClientRect) return { x: 0, y: 0 };
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return { x: 0, y: 0 };
    return {
      x: (clientX - r.left) * (cv.width / r.width),
      y: (clientY - r.top) * (cv.height / r.height)
    };
  }

  /* Press a virtual key through the normal input path. */
  function press(k) {
    if (!k) return;
    active[k] = true;
    if (G.input && G.input.pressVirtual) G.input.pressVirtual(k);
  }

  function release(k) {
    if (!k) return;
    delete active[k];
    if (G.input && G.input.releaseVirtual) G.input.releaseVirtual(k);
  }

  function releaseAll() {
    var keys = Object.keys(active);
    for (var i = 0; i < keys.length; i++) release(keys[i]);
    active = {};
  }

  function bindButton(btn) {
    var key = btn.getAttribute("data-key");
    if (!key) return;

    var downAt = 0;

    function onDown(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      downAt = Date.now();
      btn.classList.add("is-down");
      press(key);
    }
    function onUp(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      btn.classList.remove("is-down");
      release(key);
    }

    btn.addEventListener("touchstart", onDown, { passive: false });
    btn.addEventListener("touchend", onUp, { passive: false });
    btn.addEventListener("touchcancel", onUp, { passive: false });
    // Pointer fallback for hybrid devices. Deduplicated against the touch
    // handlers by only acting when the pointer type is not "touch".
    btn.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      onDown(e);
    });
    btn.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") return;
      onUp(e);
    });
    btn.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "touch") return;
      onUp(e);
    });
    // Keyboard accessibility on the button itself.
    btn.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); press(key); }
    });
    btn.addEventListener("keyup", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); release(key); }
    });
    // Stop a long-press from opening the context menu / selecting text.
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  function install() {
    if (installed) return enabled;
    installed = true;

    enabled = isTouchDevice();
    if (typeof document === "undefined") return enabled;

    uiEl = document.getElementById("touch-ui");

    if (enabled && uiEl) {
      uiEl.classList.add("on");
      uiEl.setAttribute("aria-hidden", "false");
      var btns = uiEl.querySelectorAll(".tbtn");
      for (var i = 0; i < btns.length; i++) bindButton(btns[i]);
    }

    // If the window loses focus mid-press (a phone call, app switch), a key
    // would otherwise stay held forever and the hero would walk off on his own.
    if (typeof window !== "undefined") {
      window.addEventListener("blur", releaseAll);
      window.addEventListener("visibilitychange", function () {
        if (document.hidden) releaseAll();
      });
      // A finger sliding off the button leaves it held; a global touchend sweep
      // is cheap insurance.
      window.addEventListener("touchend", function () {
        if (!Object.keys(active).length) return;
        releaseAll();
      }, { passive: true });
    }

    return enabled;
  }

  function isEnabled() { return enabled; }
  function held() { return Object.keys(active); }
  function isHeld(k) { return !!active[k]; }

  /* Which keys are "direction" keys, for a caller that wants to know whether
     the player is steering with a thumb. */
  function direction() {
    if (active.arrowup) return "up";
    if (active.arrowdown) return "down";
    if (active.arrowleft) return "left";
    if (active.arrowright) return "right";
    return null;
  }

  return {
    install: install,
    isEnabled: isEnabled,
    isTouchDevice: isTouchDevice,
    toGame: toGame,
    held: held,
    isHeld: isHeld,
    direction: direction,
    press: press,
    release: release,
    releaseAll: releaseAll
  };
})();
