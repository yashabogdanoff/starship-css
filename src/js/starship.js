/*!
 * starship-css — optional helpers.
 *
 * The base framework is CSS-only. This script is opt-in and contains the
 * small bits of behaviour that CSS can't do on its own:
 *
 *   1) Per-OS class on <html> for font-weight compensation (ss-os-{win|mac|…}).
 *   2) Unified popover wiring for combos, menus, submenus, menubars, and
 *      toolbar dropdowns (any element with `data-popover-target`).
 *   3) NumericEntryBox / SpinBox drag-to-change + click-to-edit (.ss-numeric).
 *   4) Inline-editable text (`[data-inline-edit]`).
 *   5) Toggle button aria-pressed flip (.ss-btn--toggle and friends).
 *   6) Tab close-button wiring.
 *
 * Popover markup contract — one shape for combos, menus, toolbar dropdowns,
 * and submenus alike. Trigger has `data-popover-target="<id>"`. Popover has
 * `popover="manual"` + matching id and a `role` that determines behaviour
 * (`listbox` → combo with option-select-and-writeback, `menu` → menu with
 * cascading submenus / menubar group / parent search lock).
 *
 *   <!-- Combo -->
 *   <div class="ss-combo">
 *     <button class="ss-combo__trigger" type="button"
 *             data-popover-target="my-combo" aria-haspopup="listbox">
 *       <span class="ss-combo__label">Label</span>
 *       <span class="ss-combo__chevron" aria-hidden="true"></span>
 *     </button>
 *     <div class="ss-popover ss-combo__menu" popover="manual" id="my-combo"
 *          role="listbox">
 *       <button class="ss-combo__option" type="button" role="option">A</button>
 *       <button class="ss-combo__option" type="button" role="option">B</button>
 *     </div>
 *   </div>
 *
 *   <!-- Menu -->
 *   <nav class="ss-menubar" aria-label="...">
 *     <button class="ss-menubar__item" data-popover-target="menu-1"
 *             aria-haspopup="menu">Menu 1</button>
 *   </nav>
 *   <div class="ss-popover ss-menu" popover="manual" id="menu-1" role="menu">
 *     <button class="ss-menu__entry" type="button" role="menuitem">...</button>
 *   </div>
 *
 * SpinBox markup contract (mirrors Slate's SSpinBox<float> constructor):
 *
 *   <div class="ss-numeric ss-numeric--filled"
 *        data-num-min="-1000"           MinValue (hard clamp)
 *        data-num-max="1000"            MaxValue (hard clamp)
 *        data-num-min-slider="-500"     fill 0% anchor (default: MinValue)
 *        data-num-max-slider="500"      fill 100% anchor (default: MaxValue)
 *        data-num-value="0"             initial value (default: midpoint)
 *        data-num-delta="0.5">          step (reserved)
 *     <div class="ss-numeric__fill"></div>
 *     <input class="ss-numeric__input" type="text">
 *   </div>
 *
 * Loading this script auto-wires every `[data-popover-target]` on the page:
 * opens on mousedown (Slate's pattern), closes on outside-mousedown or
 * Escape, sets `aria-selected` on combo options, writes label back into
 * the combo trigger, cascades submenus, manages menubar activation mode,
 * and locks parent-menu search while a submenu is open.
 *
 * Anchor for CSS Anchor Positioning is wired by injecting `anchor-name` and
 * `position-anchor` rules into a constructed `CSSStyleSheet` attached to
 * `document.adoptedStyleSheets`. Constructed stylesheets are NOT considered
 * "inline styles" by CSP, so the framework works under a strict
 * `Content-Security-Policy: style-src 'self'` (no `unsafe-inline`) on
 * browsers that support CSS Anchor Positioning.
 *
 * On browsers without that support (Firefox / Safari as of 2026-05) a JS
 * positioner sets `top` / `left` on the popover after each `showPopover()`
 * (see `placePopover` below). Those `style.top` / `style.left` writes are
 * inline-style mutations and would be blocked by `style-src 'self'`
 * without `unsafe-inline` — that's an unavoidable trade-off until the
 * fallback browsers ship native anchor positioning.
 *
 * init* functions are idempotent: re-running them after dynamically adding
 * markup wires only the new elements. Per-element guard via
 * `data-ss-inited="popover"` (or similar) prevents double-binding.
 */
(function () {
  'use strict';

  // ----- OS detection ------------------------------------------------------
  //
  // Adds one of `ss-os-{win|mac|linux|cros|android|ios|other}` to <html>.
  // Used by `_variables.scss` to drop `--ss-weight` to 300 / 600 on Windows
  // (DirectWrite paints small Roboto ~30% heavier than UE's bundled
  // FreeType). Exposes the result as `window.starship.os`.
  var ua = (navigator && navigator.userAgent) || '';
  var os = 'other';
  if (/Win(dows|32|64)|WOW64/.test(ua))         os = 'win';
  else if (/CrOS/.test(ua))                     os = 'cros';
  else if (/Android/.test(ua))                  os = 'android';
  else if (/iPhone|iPad|iPod/.test(ua))         os = 'ios';
  else if (/Mac OS X|Macintosh/.test(ua))       os = 'mac';
  else if (/Linux|X11/.test(ua))                os = 'linux';

  var html = document.documentElement;
  if (html && html.classList) {
    html.classList.add('ss-os-' + os);
  }
  window.starship = window.starship || {};
  window.starship.os = os;

  // ----- Popover wiring (combos + menus + submenus + menubars + dropdowns) -
  //
  // One function handles every `[data-popover-target]` on the page. Behaviour
  // branches on the popover's `role`:
  //
  //   role="listbox"  → combo: option click sets aria-selected + writes the
  //                      option's text back into `.ss-combo__label`, then
  //                      closes the popover.
  //   role="menu"     → menu: cascading submenus, menubar "activation mode"
  //                      (hover-to-switch once first click activates the bar),
  //                      parent-menu `.ss-menu__search` lock while a submenu
  //                      is open, stack-close on regular-entry click.
  //   any other role  → generic: open/close + outside-dismiss + Escape.
  //
  // Global single-menu rule: opening any top-level popover (menubar item or
  // standalone trigger that's not inside another menu) closes every other
  // open popover on the page, except submenus that are descendants of the
  // newly-opened menu.
  //
  // Idempotency:
  //   * `data-ss-inited="popover"` per trigger and per popover container
  //     prevents double-binding when initPopovers() runs again after
  //     dynamically added markup.
  //   * The document-level `mousedown` / `keydown` listeners are attached
  //     exactly once on first call (module-level singleton flag).

  // Module-level state shared across re-invocations.
  var pairs = [];                          // { trigger, menu }[]
  var barStates = (typeof WeakMap === 'function') ? new WeakMap() : null;
  var popoverGlobalsInited = false;

  // Feature-detect CSS Anchor Positioning. Chromium 125+ supports it
  // natively (the popover renders at `top: anchor(bottom); left: anchor(left)`
  // against its anchor element). Firefox / Safari (as of 2026-05) do not,
  // so an open popover with no native anchor support would land at the
  // viewport's top-left corner. `placePopover` below positions it manually
  // via `getBoundingClientRect()` on those browsers.
  var anchorSupported = (typeof CSS !== 'undefined' &&
                         typeof CSS.supports === 'function' &&
                         CSS.supports('anchor-name', '--x'));

  // Constructed stylesheet for per-pair `anchor-name` / `position-anchor`
  // rules. CSSStyleSheet (constructable) + adoptedStyleSheets is CSP-safe
  // — these are not "inline styles" so `style-src 'self'` doesn't block.
  // Falls back to `<style>` element when the constructor is unavailable
  // (Safari < 16.4); that fallback IS blocked by strict CSP, but Safari
  // also lacks anchor positioning anyway and falls through to placePopover.
  var anchorSheet = null;
  function getAnchorSheet() {
    if (anchorSheet) return anchorSheet;
    try {
      anchorSheet = new CSSStyleSheet();
      document.adoptedStyleSheets =
        document.adoptedStyleSheets.concat([anchorSheet]);
    } catch (_) {
      var el = document.createElement('style');
      el.setAttribute('data-ss-anchor', '');
      document.head.appendChild(el);
      anchorSheet = el.sheet;
    }
    return anchorSheet;
  }
  function wireAnchorPair(triggerEl, popoverEl, targetId) {
    if (!anchorSupported) return;
    var name = '--ss-anchor-' + targetId;
    var sheet = getAnchorSheet();
    try {
      sheet.insertRule(
        '[data-popover-target="' + targetId + '"] { anchor-name: ' + name + '; }',
        sheet.cssRules.length
      );
      sheet.insertRule(
        '#' + CSS.escape(targetId) + ' { position-anchor: ' + name + '; }',
        sheet.cssRules.length
      );
    } catch (_) {
      // Selector escape failed or insertRule rejected — silent fallback
      // means the popover will fall through to placePopover at open time.
    }
  }

  // Position a popover relative to its trigger when the browser lacks
  // CSS Anchor Positioning. Mirrors the `_popover.scss` / `_menu.scss`
  // CSS rules: default popovers open `bottom-start` of their trigger;
  // submenus open `right-start` (i.e. to the right, top-aligned).
  // Top-layer popovers are positioned in viewport coords, so `getBounding`
  // values map 1:1 to `style.top` / `style.left` (no scrollY offset).
  function placePopover(trigger, menu) {
    if (anchorSupported) return;
    var r = trigger.getBoundingClientRect();
    // Submenu = the trigger lives inside an `.ss-menu` (not a `.ss-menubar`).
    var isSubmenu = !!(trigger.closest && trigger.closest('.ss-menu'));
    if (isSubmenu) {
      menu.style.top  = r.top  + 'px';
      menu.style.left = r.right + 'px';
    } else {
      menu.style.top  = r.bottom + 'px';
      menu.style.left = r.left   + 'px';
    }
  }

  // While popovers are open and the browser is in fallback mode, scroll or
  // resize moves the anchor — re-place every open popover. Cheap when nothing
  // is open (early-return after the support gate + matches check).
  function repositionOpenPopovers() {
    if (anchorSupported) return;
    for (var i = 0; i < pairs.length; i++) {
      var p = pairs[i];
      if (p.menu.matches(':popover-open')) placePopover(p.trigger, p.menu);
    }
  }

  function getBarState(bar) {
    if (!barStates) return { activated: false };
    var s = barStates.get(bar);
    if (!s) { s = { activated: false }; barStates.set(bar, s); }
    return s;
  }

  // Close every open popover except `keep` and `keep`'s ancestors. When
  // `keep` is null, every open popover gets hidden unconditionally.
  function closeAllExcept(keep) {
    pairs.forEach(function (p) {
      if (p.menu === keep) return;
      if (!p.menu.matches(':popover-open')) return;
      if (keep && p.menu.contains(keep)) return;   // ancestor of `keep`
      p.menu.hidePopover();
    });
  }

  // Within `parentMenu`, close every open submenu except the one whose
  // trigger is `except`. Used by submenu mouseenter and regular-entry hover
  // (so the submenu doesn't linger after the cursor moves off its trigger).
  function closeSiblingSubmenus(parentMenu, except) {
    var triggers = parentMenu.querySelectorAll('[data-popover-target]');
    Array.prototype.forEach.call(triggers, function (t) {
      if (t === except) return;
      var m = document.getElementById(t.dataset.popoverTarget);
      if (m && m.matches(':popover-open')) m.hidePopover();
    });
  }

  function initPopovers() {
    var newTriggers = document.querySelectorAll(
      '[data-popover-target]:not([data-ss-inited])'
    );

    Array.prototype.forEach.call(newTriggers, function (trigger) {
      var targetId = trigger.dataset.popoverTarget;
      var menu = document.getElementById(targetId);
      if (!menu) return;

      pairs.push({ trigger: trigger, menu: menu });

      // Bind anchor-name / position-anchor via a constructed stylesheet.
      // Selectors are `[data-popover-target="<id>"]` (trigger) and
      // `#<id>` (popover), so each pair is uniquely scoped without any
      // inline-style writes — CSP-clean on every browser that supports
      // anchor positioning. See `wireAnchorPair` above for the fallback path.
      wireAnchorPair(trigger, menu, targetId);

      var bar = trigger.closest && trigger.closest('.ss-menubar');
      var inParentMenu = !bar && trigger.closest && trigger.closest('.ss-menu');
      var role = menu.getAttribute('role');

      // Trigger mousedown — matches Slate's open-on-press (not mouseup).
      trigger.addEventListener('mousedown', function (e) {
        // preventDefault keeps focus from shifting and suppresses the
        // synthesised click event that would otherwise reach the popover
        // light-dismiss heuristics in user agents that still implement them.
        e.preventDefault();
        if (bar) {
          var s = getBarState(bar);
          if (menu.matches(':popover-open')) {
            menu.hidePopover();
            s.activated = false;
          } else {
            closeAllExcept(menu);
            menu.showPopover();
            placePopover(trigger, menu);
            s.activated = true;
          }
        } else if (inParentMenu) {
          // Submenu trigger inside an .ss-menu — toggle in place. Parent
          // menu must stay open; sibling submenus get closed by the hover
          // handler below (and a re-click here won't reopen our own parent).
          if (menu.matches(':popover-open')) menu.hidePopover();
          else {
            closeSiblingSubmenus(inParentMenu, trigger);
            menu.showPopover();
            placePopover(trigger, menu);
          }
        } else {
          // Standalone trigger (combo / toolbar combo / split-options).
          // Enforce the global single-menu rule — opening one closes every
          // other top-level popover.
          if (menu.matches(':popover-open')) {
            menu.hidePopover();
          } else {
            closeAllExcept(menu);
            menu.showPopover();
            placePopover(trigger, menu);
          }
        }
      });

      // Hover behaviour:
      //  * Bar items: once the bar has been activated by an initial click,
      //    hovering a sibling bar item switches the open menu. Matches
      //    Slate / native menubars.
      //  * Submenu triggers: hover opens the submenu (no click needed) and
      //    closes any sibling submenu of the same parent. Slate's cascading
      //    menu behaviour.
      if (bar) {
        trigger.addEventListener('mouseenter', function () {
          var s = getBarState(bar);
          if (!s.activated) return;
          if (menu.matches(':popover-open')) return;
          closeAllExcept(menu);
          menu.showPopover();
          placePopover(trigger, menu);
        });
      } else if (inParentMenu) {
        trigger.addEventListener('mouseenter', function () {
          if (menu.matches(':popover-open')) return;
          closeSiblingSubmenus(inParentMenu, trigger);
          menu.showPopover();
          placePopover(trigger, menu);
        });
      }

      // Popover-side wiring (option select / entry click / toggle handler).
      // Guard so re-running initPopovers() doesn't double-bind menu listeners
      // when only new triggers were added.
      if (!menu.hasAttribute('data-ss-inited')) {
        if (role === 'listbox') {
          // Combo behaviour — option click selects + writes back + closes.
          menu.addEventListener('mousedown', function (e) {
            var opt = e.target.closest && e.target.closest('.ss-combo__option');
            if (!opt) return;
            e.preventDefault();
            var others = menu.querySelectorAll('.ss-combo__option');
            Array.prototype.forEach.call(others, function (o) {
              o.removeAttribute('aria-selected');
            });
            opt.setAttribute('aria-selected', 'true');
            var label = trigger.querySelector('.ss-combo__label');
            if (label) label.textContent = opt.textContent;
            menu.hidePopover();
          });
        } else if (role === 'menu') {
          // Menu behaviour — regular-entry hover closes sibling submenus
          // (so the submenu doesn't linger after the cursor leaves its
          // trigger), regular-entry click closes the entire menu stack.
          var regulars = menu.querySelectorAll(
            '.ss-menu__entry:not([data-popover-target])'
          );
          Array.prototype.forEach.call(regulars, function (entry) {
            entry.addEventListener('mouseenter', function () {
              closeSiblingSubmenus(menu, null);
            });
            entry.addEventListener('click', function () {
              var current = menu;
              while (current && current.matches && current.matches(':popover-open')) {
                current.hidePopover();
                var ownerPair = pairs.find(function (pp) { return pp.menu === current; });
                if (!ownerPair) break;
                var ancestor = ownerPair.trigger.closest &&
                               ownerPair.trigger.closest('.ss-menu');
                current = ancestor || null;
              }
            });
          });
        }

        // Toggle event — sync aria-expanded, handle parent search lock and
        // cascade-close + bar deactivation on close. Applies to all roles
        // (combo gets aria-expanded too, even though no cascade applies).
        menu.addEventListener('toggle', function (e) {
          var open = e.newState === 'open';
          trigger.setAttribute('aria-expanded', open ? 'true' : 'false');

          if (role !== 'menu') return;

          // Slate locks the parent menu's filter while a submenu is open.
          // Find the parent menu that owns this submenu's trigger and toggle
          // its .ss-menu__search input's disabled flag in lockstep with the
          // submenu's open state. When the submenu closes we only re-enable
          // the search if no OTHER submenu of the same parent is still open.
          var parentMenu = trigger.closest && trigger.closest('.ss-menu');
          if (parentMenu) {
            var search = parentMenu.querySelector(
              '.ss-menu__search .ss-input, .ss-input.ss-menu__search'
            );
            if (search) {
              if (open) {
                search.disabled = true;
              } else {
                var anySubOpen = false;
                var siblingTriggers = parentMenu.querySelectorAll(
                  '[data-popover-target]'
                );
                Array.prototype.forEach.call(siblingTriggers, function (t) {
                  var m = document.getElementById(t.dataset.popoverTarget);
                  if (m && m.matches(':popover-open')) anySubOpen = true;
                });
                if (!anySubOpen) search.disabled = false;
              }
            }
          }

          if (open) return;
          // Cascade-close any of this menu's submenus on close.
          var children = menu.querySelectorAll('[data-popover-target]');
          Array.prototype.forEach.call(children, function (t) {
            var child = document.getElementById(t.dataset.popoverTarget);
            if (child && child.matches(':popover-open')) child.hidePopover();
          });
          // Bar deactivation: if every menu in the parent bar is now
          // closed, drop out of activation mode so future hovers don't
          // re-open anything.
          if (bar) {
            var s = getBarState(bar);
            var anyOpen = false;
            var siblings = bar.querySelectorAll('[data-popover-target]');
            Array.prototype.forEach.call(siblings, function (t) {
              var m = document.getElementById(t.dataset.popoverTarget);
              if (m && m.matches(':popover-open')) anyOpen = true;
            });
            if (!anyOpen) s.activated = false;
          }
        });

        menu.setAttribute('data-ss-inited', 'popover');
      }

      trigger.setAttribute('data-ss-inited', 'popover');
    });

    // Document-level listeners attached exactly once across the lifetime of
    // the module. Re-running initPopovers() never adds duplicates.
    if (!popoverGlobalsInited && pairs.length) {
      document.addEventListener('mousedown', function (e) {
        var inside = pairs.some(function (p) {
          return p.menu.matches(':popover-open') &&
            (p.menu.contains(e.target) || p.trigger.contains(e.target));
        });
        if (inside) return;
        pairs.forEach(function (p) {
          if (p.menu.matches(':popover-open')) p.menu.hidePopover();
        });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        pairs.forEach(function (p) {
          if (p.menu.matches(':popover-open')) p.menu.hidePopover();
        });
      });
      // Anchor-fallback mode only: re-position open popovers when the page
      // or any scroll container moves, or when the viewport resizes. No-op
      // when the browser supports CSS Anchor Positioning natively.
      if (!anchorSupported) {
        window.addEventListener('scroll', repositionOpenPopovers, true);
        window.addEventListener('resize', repositionOpenPopovers);
      }
      popoverGlobalsInited = true;
    }
  }

  // ----- Numeric entry box wiring ------------------------------------------
  //
  // Slate's SSpinBox / SNumericEntryBox(AllowSpin) responds to two distinct
  // mouse gestures on the same widget:
  //   * mousedown + drag horizontally → change value (delta proportional to
  //     pixels moved; full widget width = one full MinSlider→MaxSlider span)
  //   * mousedown + release without drag → enter text-edit mode (focus the
  //     input, select all)
  // Enter / Escape / blur exit edit mode. The fill bar tracks the value's
  // position between MinSliderValue and MaxSliderValue (0–100%). The
  // .ss-numeric--no-spin modifier turns off drag and edit-mode entirely:
  // the input is always editable, no fill bar, hard-clamp on commit.
  // Idempotency:
  //   * Per-element `data-ss-inited="numeric"` skips already-wired widgets.
  //   * `document.mousemove` and `mouseup` are attached once via module-
  //     level singleton flag — re-running initNumerics() never duplicates.
  //   * Per-element state lives in `numericStates` WeakMap so the singleton
  //     document handlers can route the event to the currently-armed widget.
  var DRAG_THRESHOLD_PX = 3;
  var numericStates = (typeof WeakMap === 'function') ? new WeakMap() : null;
  var numericArmed = null;
  var numericGlobalsInited = false;
  // Frame-locked update so drag-fill renders at display refresh rate even
  // when Chrome coalesces mousemove events (e.g. under OS-level
  // reduce-motion, battery saver, or background-tab throttling).
  // The mousemove handler stores the latest cursor X here; a single RAF
  // callback consumes it once per paint frame.
  var numericPendingX = null;
  var numericRafPending = false;

  function initNumerics() {
    var nums = document.querySelectorAll('.ss-numeric:not([data-ss-inited])');

    Array.prototype.forEach.call(nums, function (num) {
      var input = num.querySelector('.ss-numeric__input');
      if (!input) return;
      var fill = num.querySelector('.ss-numeric__fill');
      // .ss-numeric--no-spin disables drag entirely (AllowSpin=false). The
      // input is always editable, no fill bar, and value commits go through
      // the native blur / Enter path with hard-clamp only.
      var noSpin = num.classList.contains('ss-numeric--no-spin');

      var d = num.dataset;
      var min       = parseFloat(d.numMin);           if (isNaN(min)) min = -Infinity;
      var max       = parseFloat(d.numMax);           if (isNaN(max)) max =  Infinity;
      var minSlider = parseFloat(d.numMinSlider);     if (isNaN(minSlider)) minSlider = isFinite(min) ? min : 0;
      var maxSlider = parseFloat(d.numMaxSlider);     if (isNaN(maxSlider)) maxSlider = isFinite(max) ? max : 1;
      var value     = parseFloat(d.numValue);         if (isNaN(value)) value = (minSlider + maxSlider) / 2;

      // Slate uses two different clamps for two different gestures:
      //   * text-input commit → bounded by MinValue / MaxValue (hard limit).
      //   * drag             → bounded by the *intersection* of both pairs,
      //                        i.e. [max(Min, MinSlider), min(Max, MaxSlider)].
      function clampHard(v) { return Math.max(min, Math.min(max, v)); }
      function clampDrag(v) {
        var lo = Math.max(min, minSlider);
        var hi = Math.min(max, maxSlider);
        return Math.max(lo, Math.min(hi, v));
      }
      function fillPercent(v) {
        var span = maxSlider - minSlider;
        if (span <= 0) return 0;
        var t = (v - minSlider) / span;
        return Math.max(0, Math.min(1, t)) * 100;
      }
      function render() {
        // Show ".0" on integer values (Slate's LexToString convention).
        var trimmed = String(parseFloat(state.value.toPrecision(10)));
        if (!/[.eE]/.test(trimmed)) trimmed += '.0';
        input.value = trimmed;
        if (fill) {
          // Fill spans the inset area (padding-box width minus 2 px on each
          // side for the InsetPadding(1)). Compute in px so the percent
          // isn't pulled past the inset.
          var innerW = num.clientWidth - 2;
          if (innerW < 0) innerW = 0;
          fill.style.width = (innerW * fillPercent(state.value) / 100) + 'px';
        }
      }
      function exitEdit(commit) {
        if (!state.editing) return;
        if (commit) {
          var v = parseFloat(input.value);
          if (!isNaN(v)) state.value = clampHard(v);
        }
        state.editing = false;
        num.classList.remove('is-editing');
        render();
      }

      // Per-element state, kept in module-level WeakMap so the singleton
      // document mousemove/mouseup handlers below can find it.
      var state = {
        value: value,
        armed: false,
        dragging: false,
        editing: false,
        downX: 0,
        downValue: 0,
        minSlider: minSlider,
        maxSlider: maxSlider,
        clampDrag: clampDrag,
        render: render,
      };
      if (numericStates) numericStates.set(num, state);

      if (!noSpin) {
        num.addEventListener('mousedown', function (e) {
          if (input.disabled) return;     // <input disabled> halts drag/edit-mode
          if (state.editing) return;      // let native text input handle clicks
          if (e.button !== 0) return;
          e.preventDefault();
          state.downX = e.clientX;
          state.downValue = state.value;
          state.armed = true;
          state.dragging = false;
          numericArmed = num;             // mark for singleton document handlers
        });
      }

      if (noSpin) {
        // No drag/edit-mode toggle — input is always editable, clamp on
        // blur or Enter via hard limits (MinValue/MaxValue only — drag
        // semantics don't apply).
        var commitNoSpin = function () {
          var v = parseFloat(input.value);
          if (!isNaN(v)) state.value = clampHard(v);
          render();
        };
        input.addEventListener('blur', commitNoSpin);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { commitNoSpin(); input.blur(); }
        });
      } else {
        input.addEventListener('blur', function () { exitEdit(true); });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter')      { exitEdit(true);  input.blur(); }
          else if (e.key === 'Escape'){ exitEdit(false); input.blur(); }
        });
      }

      // Re-render whenever the widget's layout changes — e.g. the user
      // switches to the tab that contains it and clientWidth flips from 0
      // to its real px (initNumerics runs at DOMContentLoaded, before any
      // visibility flip in our CSS-tab page).
      // Self-disconnects when the observed element leaves the DOM, so
      // single-page apps that mount/unmount numerics don't leak observers.
      if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(function () {
          if (!num.isConnected) { ro.disconnect(); return; }
          render();
        });
        ro.observe(num);
      }
      render();
      num.setAttribute('data-ss-inited', 'numeric');
    });

    // Singleton document listeners — attached on first init only.
    if (!numericGlobalsInited && numericStates) {
      // Apply the latest cursor position to the armed widget exactly once
      // per paint frame. Decouples drag-fill rendering from mousemove
      // dispatch rate (Chrome throttles mousemove under reduce-motion,
      // battery saver, or when a singleton document handler outpaces the
      // compositor; RAF callbacks run in the rendering pipeline and are
      // frame-locked instead).
      function flushNumericFrame() {
        numericRafPending = false;
        if (numericPendingX == null || !numericArmed) return;
        var s = numericStates.get(numericArmed);
        if (!s || !s.armed || s.editing) { numericPendingX = null; return; }
        var x = numericPendingX;
        numericPendingX = null;
        var dx = x - s.downX;
        if (!s.dragging && Math.abs(dx) >= DRAG_THRESHOLD_PX) {
          s.dragging = true;
          numericArmed.classList.add('is-dragging');
          // If the starting value sits outside the visible-fill range
          // (text input could have committed 1000 with MaxSliderValue=500),
          // snap it back to the nearest reachable edge AND re-anchor X to
          // the current cursor.
          var clampedStart = s.clampDrag(s.value);
          if (clampedStart !== s.value) {
            s.value = clampedStart;
            s.render();
          }
          s.downX = x;
          s.downValue = s.value;
          return;
        }
        if (s.dragging) {
          var rect = numericArmed.getBoundingClientRect();
          // Full width drag = one full MinSlider→MaxSlider span (sensitivity
          // derived from the visible-fill range).
          var sensitivity = (s.maxSlider - s.minSlider) / rect.width;
          s.value = s.clampDrag(s.downValue + dx * sensitivity);
          s.render();
        }
      }

      document.addEventListener('mousemove', function (e) {
        if (!numericArmed) return;
        numericPendingX = e.clientX;
        if (!numericRafPending) {
          numericRafPending = true;
          requestAnimationFrame(flushNumericFrame);
        }
      });

      document.addEventListener('mouseup', function () {
        if (!numericArmed) return;
        var s = numericStates.get(numericArmed);
        if (!s || !s.armed) { numericArmed = null; return; }
        s.armed = false;
        if (s.dragging) {
          s.dragging = false;
          numericArmed.classList.remove('is-dragging');
        } else {
          // mouseup without drag → enter edit mode.
          s.editing = true;
          numericArmed.classList.add('is-editing');
          var input = numericArmed.querySelector('.ss-numeric__input');
          if (input) { input.focus(); input.select(); }
        }
        numericArmed = null;
      });
      numericGlobalsInited = true;
    }
  }

  // ----- Inline editable text wiring ---------------------------------------
  //
  // Slate's SInlineEditableTextBlock starts as a static text block, then
  // enters edit mode on double-click (or F2). We replicate that with a
  // single <span data-inline-edit> that becomes contenteditable on user
  // activation. Enter or blur commits, Escape reverts to the cached text.
  // aria-disabled="true" disables the gesture.
  function initInlineEditables() {
    // Skip elements that already have inline-edit wiring (idempotent).
    var nodes = document.querySelectorAll('[data-inline-edit]:not([data-ss-inited])');
    Array.prototype.forEach.call(nodes, function (el) {
      // Keep the span keyboard-focusable so F2 / Enter can promote it to
      // edit mode without a mouse. The author can pre-set tabindex; only
      // backfill when missing so we don't fight an explicit choice.
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

      var original = '';

      function isDisabled() {
        return el.getAttribute('aria-disabled') === 'true';
      }

      function enterEdit() {
        if (isDisabled() || el.isContentEditable) return;
        original = el.textContent;
        // plaintext-only is preferred (Chromium / Edge / Firefox 89+); the
        // engine falls back to "true" if it doesn't recognise the value, so
        // setAttribute is safe across browsers either way.
        el.setAttribute('contenteditable', 'plaintext-only');
        el.focus();
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
      }

      function exitEdit(commit) {
        if (!el.isContentEditable) return;
        if (!commit) el.textContent = original;
        el.removeAttribute('contenteditable');
        el.blur();
      }

      el.addEventListener('dblclick', enterEdit);
      el.addEventListener('keydown', function (e) {
        if (!el.isContentEditable) {
          // Slate's F2 (rename) shortcut. Enter on a focused, non-edit span
          // is the natural keyboard activation.
          if (e.key === 'F2' || e.key === 'Enter') {
            e.preventDefault();
            enterEdit();
          }
          return;
        }
        if (e.key === 'Enter')      { e.preventDefault(); exitEdit(true); }
        else if (e.key === 'Escape'){ e.preventDefault(); exitEdit(false); }
      });
      el.addEventListener('blur', function () { exitEdit(true); });
      el.setAttribute('data-ss-inited', 'inline-edit');
    });
  }

  // ----- Toggle button (aria-pressed) --------------------------------------
  //
  // Toolbar toggle buttons (`<button class="ss-toolbar__btn--toggle">` and
  // `<button class="ss-toolbar__split-btn--toggle">`) paint via the
  // `[aria-pressed]` selector. Browsers don't flip the attribute on click
  // for plain `<button>` elements — that's authored behaviour. This helper
  // flips aria-pressed between "true" and "false" on every click,
  // mirroring Slate's IsToggled state. Buttons that are disabled
  // (or aria-disabled) are skipped.
  // Idempotent — re-running ignores buttons that already carry the marker.
  //
  // `.ss-btn--toggle` is intentionally NOT handled here: it's a CSS-only
  // widget built on `<label>` + hidden `<input type="checkbox">` + `:has()`,
  // and `aria-pressed` is not a valid ARIA attribute on `<label>` (axe
  // flags it as critical).
  function initToggleButtons() {
    var buttons = document.querySelectorAll(
      '.ss-toolbar__btn--toggle:not([data-ss-inited]),' +
      '.ss-toolbar__split-btn--toggle:not([data-ss-inited])'
    );
    Array.prototype.forEach.call(buttons, function (btn) {
      // Make sure the attribute exists so the framework's selector resolves
      // to a known state on first paint.
      if (!btn.hasAttribute('aria-pressed')) {
        btn.setAttribute('aria-pressed', 'false');
      }
      btn.addEventListener('click', function () {
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        var pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      });
      btn.setAttribute('data-ss-inited', 'toggle');
    });
  }

  // ----- Tabs: close-button wiring -----------------------------------------
  //
  // Tab activation is pure CSS (radio-hack), but the close × on each tab
  // needs JS to remove the tab + its panel from the DOM and reactivate a
  // neighbour. Markup contract is defined in _tabs.scss:
  //
  //   <div class="ss-tabs">
  //     <input class="ss-tabs__input" type="radio" name="grp" id="t-1" checked>
  //     ...
  //     <div class="ss-tab-well">
  //       <label for="t-1" class="ss-tab">
  //         <span class="ss-tab__label">…</span>
  //         <button class="ss-tab__close" type="button"></button>
  //       </label>
  //       ...
  //     </div>
  //     <section class="ss-tab-panel">…</section>
  //     ...
  //   </div>
  //
  // The Nth radio drives the Nth `.ss-tab` and the Nth `.ss-tab-panel`. When
  // the user clicks ×, we remove the trio (radio, label, panel) and pick the
  // previous sibling — or, failing that, the first remaining tab — as the
  // new active tab.
  //
  // There is intentionally no programmatic "addTab" API — the framework
  // doesn't impose a templating choice. Consumers who want spawn-style
  // creation should append the three elements themselves and re-run
  // `window.starship.initTabs()` to wire fresh close buttons.
  function initTabs() {
    // Idempotent — skip close buttons that already carry the marker.
    var closes = document.querySelectorAll('.ss-tab__close:not([data-ss-inited])');
    Array.prototype.forEach.call(closes, function (btn) {
      // The close button sits inside a `<label>` whose default click would
      // also toggle the associated radio. We intercept on mousedown to keep
      // the label from forwarding the click to the input. preventDefault is
      // belt-and-braces — Chromium already routes the click to the button as
      // an interactive descendant, but Safari has historically been less
      // strict here.
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var label = btn.closest && btn.closest('.ss-tab');
        if (!label) return;
        var tabs = label.parentNode;                          // .ss-tab-well
        var container = label.closest('.ss-tabs');
        if (!container) return;

        // Find the input whose id matches the label's `for` attribute.
        var inputId = label.getAttribute('for');
        var input = inputId ? document.getElementById(inputId) : null;

        // Locate the panel by index — the Nth panel pairs with the Nth tab.
        var labels = Array.prototype.slice.call(
          tabs.querySelectorAll('.ss-tab')
        );
        var idx = labels.indexOf(label);
        var panels = container.querySelectorAll(
          ':scope > .ss-tab-panel, :scope > .ss-tab-panel--minor'
        );
        // Older browsers without `:scope` fall back to the indexed lookup.
        if (!panels.length) {
          panels = Array.prototype.filter.call(
            container.children,
            function (c) { return c.classList && c.classList.contains('ss-tab-panel'); }
          );
        }
        var panel = panels[idx];
        var wasActive = !!(input && input.checked);

        // Reactivate a neighbouring tab BEFORE removing the current input so
        // the CSS `:checked` selector stays satisfied across the transition.
        // Preference: previous sibling (idx − 1); fall back to the next one.
        if (wasActive && input) {
          var siblings = container.querySelectorAll(
            'input.ss-tabs__input[name="' + input.name + '"]'
          );
          var inputIdx = -1;
          for (var k = 0; k < siblings.length; k++) {
            if (siblings[k] === input) { inputIdx = k; break; }
          }
          var target = null;
          if (inputIdx > 0) {
            target = siblings[inputIdx - 1];
          } else if (inputIdx + 1 < siblings.length) {
            target = siblings[inputIdx + 1];
          }
          if (target) target.checked = true;
        }

        if (input && input.parentNode) input.parentNode.removeChild(input);
        if (label.parentNode) label.parentNode.removeChild(label);
        if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
      });
      btn.setAttribute('data-ss-inited', 'tab-close');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initPopovers();
      initNumerics();
      initInlineEditables();
      initToggleButtons();
      initTabs();
    });
  } else {
    initPopovers();
    initNumerics();
    initInlineEditables();
    initToggleButtons();
    initTabs();
  }

  window.starship.initPopovers = initPopovers;
  window.starship.initNumerics = initNumerics;
  window.starship.initInlineEditables = initInlineEditables;
  window.starship.initToggleButtons = initToggleButtons;
  window.starship.initTabs = initTabs;
})();
