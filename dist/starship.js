/*!
 * starship-css — optional helpers.
 *
 * The base framework is CSS-only. This script is opt-in and contains the
 * small bits of behaviour that CSS can't do on its own:
 *
 *   1) Per-OS class on <html> for font-weight compensation (ss-os-{win|mac|…}).
 *   2) ComboBox open/close + selection wiring (.ss-combo[data-combo-target]).
 *   3) NumericEntryBox / SpinBox drag-to-change + click-to-edit (.ss-numeric).
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
 * Mark up a combobox like Slate's SComboBox:
 *
 *   <div class="ss-combo">
 *     <button class="ss-combo__trigger" type="button"
 *             data-combo-target="my-combo" style="anchor-name: --my-combo;">
 *       <span class="ss-combo__label">Label</span>
 *       <span class="ss-combo__chevron" aria-hidden="true"><svg .../></span>
 *     </button>
 *     <div class="ss-combo__menu" popover="manual" id="my-combo"
 *          style="position-anchor: --my-combo;" role="listbox">
 *       <button class="ss-combo__option" type="button" role="option">A</button>
 *       <button class="ss-combo__option" type="button" role="option">B</button>
 *     </div>
 *   </div>
 *
 * Loading this script auto-wires every `.ss-combo__trigger[data-combo-target]`
 * on the page: opens on mousedown (Slate's pattern, not click=mouseup),
 * closes on outside-mousedown or Escape, sets aria-selected on the picked
 * row, and (for text triggers with a `.ss-combo__label`) writes the picked
 * row's text back into the trigger.
 *
 * If you'd rather wire it yourself, leave the `data-combo-target` attribute
 * off — this script ignores those.
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

  // ----- Combobox wiring ---------------------------------------------------
  //
  // The Popover API's default `popover` value is `auto` — it auto-dismisses
  // on the next pointerdown whose target is outside the popover and its
  // invoker. Without a `popovertarget` HTML attribute, the trigger is NOT
  // an invoker, so auto-dismiss closes the popover immediately on mouseup.
  // We use `popover="manual"` to disable that and implement dismissal here.
  function initCombos() {
    var combos = [];
    var triggers = document.querySelectorAll(
      '.ss-combo__trigger[data-combo-target]'
    );
    Array.prototype.forEach.call(triggers, function (trigger) {
      var menu = document.getElementById(trigger.dataset.comboTarget);
      if (!menu) return;
      combos.push({ trigger: trigger, menu: menu });

      trigger.addEventListener('mousedown', function (e) {
        // preventDefault keeps focus from shifting and suppresses the
        // synthesised click event that would otherwise reach the popover
        // light-dismiss heuristics in user agents that still implement them.
        e.preventDefault();
        if (menu.matches(':popover-open')) menu.hidePopover();
        else menu.showPopover();
      });

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
    });

    if (!combos.length) return;

    // Click-outside (Slate's SMenuAnchor closes on any click outside the
    // anchor or menu). We listen on `mousedown` to mirror Slate's mouseDown
    // intent and to align with the trigger's own mousedown open behaviour.
    document.addEventListener('mousedown', function (e) {
      combos.forEach(function (c) {
        if (!c.menu.matches(':popover-open')) return;
        if (c.menu.contains(e.target) || c.trigger.contains(e.target)) return;
        c.menu.hidePopover();
      });
    });
    // Escape — close any open popover.
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      combos.forEach(function (c) {
        if (c.menu.matches(':popover-open')) c.menu.hidePopover();
      });
    });
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
  function initNumerics() {
    var DRAG_THRESHOLD_PX = 3;
    var nums = document.querySelectorAll('.ss-numeric');
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

      var armed = false, dragging = false, editing = false;
      var downX = 0, downValue = 0;

      // Slate uses two different clamps for two different gestures:
      //   * text-input commit → bounded by MinValue / MaxValue (hard limit).
      //   * drag             → bounded by the *intersection* of both pairs,
      //                        i.e. [max(Min, MinSlider), min(Max, MaxSlider)].
      //                        Example (SSpinBox): Min=0, Max=500,
      //                        MinSlider=-500, MaxSlider=500 → drag clamps
      //                        to [0, 500], so the fill can't go below 50 %
      //                        even though MinSlider would allow it.
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
        // Show ".0" on integer values (Slate's LexToString convention) and
        // keep the rest at full precision the user requested.
        var trimmed = String(parseFloat(value.toPrecision(10)));
        if (!/[.eE]/.test(trimmed)) trimmed += '.0';
        input.value = trimmed;
        if (fill) {
          // Fill spans the inset area (padding-box width minus 2 px on each
          // side for the InsetPadding(1)). Compute in px so the percent
          // isn't pulled past the inset.
          var innerW = num.clientWidth - 2;
          if (innerW < 0) innerW = 0;
          fill.style.width = (innerW * fillPercent(value) / 100) + 'px';
        }
      }

      if (!noSpin) {
      num.addEventListener('mousedown', function (e) {
        if (input.disabled) return;  // <input disabled> halts drag/edit-mode
        if (editing) return;     // let native text input handle clicks
        if (e.button !== 0) return;
        e.preventDefault();
        downX = e.clientX;
        downValue = value;
        armed = true;
        dragging = false;
      });

      document.addEventListener('mousemove', function (e) {
        if (!armed || editing) return;
        var dx = e.clientX - downX;
        if (!dragging && Math.abs(dx) >= DRAG_THRESHOLD_PX) {
          dragging = true;
          num.classList.add('is-dragging');
          // If the starting value sits outside the visible-fill range
          // (text input could have committed 1000 with MaxSliderValue=500),
          // snap it back to the nearest reachable edge AND re-anchor X to
          // the current cursor. Without the re-anchor the cursor has to
          // travel a "dead zone" of (originalValue - edge)/sensitivity
          // pixels before value starts reacting again.
          var clampedStart = clampDrag(value);
          if (clampedStart !== value) {
            value = clampedStart;
            render();
          }
          downX = e.clientX;
          downValue = value;
          return;                  // wait for the next event to read delta
        }
        if (dragging) {
          var rect = num.getBoundingClientRect();
          // Full width drag = one full MinSlider→MaxSlider span (sensitivity
          // derived from the visible-fill range). The final value still
          // intersects with Min/Max so SSpinBox can't drag below MinValue=0
          // even though MinSliderValue=-500 would allow visually.
          var sensitivity = (maxSlider - minSlider) / rect.width;
          value = clampDrag(downValue + dx * sensitivity);
          render();
        }
      });

      document.addEventListener('mouseup', function () {
        if (!armed) return;
        armed = false;
        if (dragging) {
          dragging = false;
          num.classList.remove('is-dragging');
        } else {
          // mouseup without drag → enter edit mode.
          editing = true;
          num.classList.add('is-editing');
          input.focus();
          input.select();
        }
      });
      } // end !noSpin

      function exitEdit(commit) {
        if (!editing) return;
        if (commit) {
          var v = parseFloat(input.value);
          if (!isNaN(v)) value = clampHard(v);
        }
        editing = false;
        num.classList.remove('is-editing');
        render();
      }

      if (noSpin) {
        // No drag/edit-mode toggle — input is always editable, clamp on
        // blur or Enter via hard limits (MinValue/MaxValue only — drag
        // semantics don't apply).
        function commitNoSpin() {
          var v = parseFloat(input.value);
          if (!isNaN(v)) value = clampHard(v);
          render();
        }
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
      if (typeof ResizeObserver === 'function') {
        new ResizeObserver(render).observe(num);
      }
      render();
    });
  }

  // ----- Inline editable text wiring ---------------------------------------
  //
  // Slate's SInlineEditableTextBlock starts as a static text block, then
  // enters edit mode on double-click (or F2). We replicate that with a
  // single <span data-inline-edit> that becomes contenteditable on user
  // activation. Enter or blur commits, Escape reverts to the cached text.
  // aria-disabled="true" disables the gesture.
  function initInlineEditables() {
    var nodes = document.querySelectorAll('[data-inline-edit]');
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
    });
  }

  // ----- Toggle button (aria-pressed) --------------------------------------
  //
  // .ss-btn--toggle paints itself via the [aria-pressed] selector but
  // browsers don't toggle the attribute on click for plain <button>s —
  // that's an authored behaviour. This helper flips aria-pressed between
  // "true" and "false" on every click, mirroring Slate's IsToggled state.
  // Buttons that are disabled (or aria-disabled) are skipped.
  function initToggleButtons() {
    var buttons = document.querySelectorAll(
      '.ss-btn--toggle, .ss-toolbar__btn--toggle, .ss-toolbar__split-btn--toggle'
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
    });
  }

  // ----- Menu bar + pull-down menus + submenus -----------------------------
  //
  // Slate's MenuBar matches the platform menubar idiom:
  //   • click a bar item     → opens its pull-down (and "activates" the bar)
  //   • once activated, *hovering* a sibling bar item switches the open
  //     menu — no second click — and clicking outside / Escape closes it
  //     and deactivates the bar
  //   • only one menu in a bar is ever open at a time; the bar maintains
  //     an "activated" state while any of its menus are open
  //   • inside a menu, clicking an entry that has data-menu-target opens
  //     a submenu anchored to that entry; clicking a regular entry closes
  //     the entire stack
  //
  // Triggers get aria-expanded toggled via the popover toggle event so
  // the framework's Primary-fill paint (matching Slate's
  // `WindowMenuBar.Button.SubMenuOpen`) stays in sync regardless of how
  // the menu was opened or dismissed.
  function initMenus() {
    var allTriggers = document.querySelectorAll('[data-menu-target]');
    if (!allTriggers.length) return;

    var pairs = [];
    // Group menubar siblings so we can implement the bar's "activation
    // mode" (hover-to-switch). A trigger that's not inside a .ss-menubar
    // is a standalone or submenu trigger — handled the simple way.
    var bars = [];
    document.querySelectorAll('.ss-menubar').forEach(function (bar) {
      var triggers = Array.prototype.slice.call(
        bar.querySelectorAll('[data-menu-target]')
      );
      bars.push({ bar: bar, triggers: triggers, activated: false });
    });

    function groupOf(trigger) {
      for (var i = 0; i < bars.length; i++) {
        if (bars[i].triggers.indexOf(trigger) >= 0) return bars[i];
      }
      return null;
    }

    // Global single-menu rule — opening any top-level trigger (menubar item
    // or standalone combo / split-options) closes every other open popover on
    // the page except submenus that are descendants of `keep` (a menu whose
    // siblings/cousins remain open as part of the same cascade). When
    // `keep` is null, every other popover gets hidden unconditionally.
    function closeAllExcept(keep) {
      pairs.forEach(function (p) {
        if (p.menu === keep) return;
        if (!p.menu.matches(':popover-open')) return;
        if (keep && p.menu.contains(keep)) return;   // ancestor of `keep`
        p.menu.hidePopover();
      });
    }

    Array.prototype.forEach.call(allTriggers, function (trigger) {
      var menu = document.getElementById(trigger.dataset.menuTarget);
      if (!menu) return;
      pairs.push({ trigger: trigger, menu: menu });

      var group = groupOf(trigger);
      // Submenu triggers sit inside an .ss-menu popover. Their open/close
      // logic must NOT close the parent menu — only sibling submenus of the
      // same parent.
      var inParentMenu = !group && trigger.closest && trigger.closest('.ss-menu');

      trigger.addEventListener('mousedown', function (e) {
        e.preventDefault();   // matches Slate's open-on-press, not mouseup
        if (group) {
          if (menu.matches(':popover-open')) {
            menu.hidePopover();
            group.activated = false;
          } else {
            closeAllExcept(menu);
            menu.showPopover();
            group.activated = true;
          }
        } else if (inParentMenu) {
          // Submenu trigger inside an .ss-menu — toggle in place. Parent
          // menu must stay open; sibling submenus get closed by the hover
          // handler below (and a re-click here won't reopen our own parent).
          if (menu.matches(':popover-open')) menu.hidePopover();
          else {
            closeSiblingSubmenus(inParentMenu, trigger);
            menu.showPopover();
          }
        } else {
          // Standalone trigger (toolbar combo / split-options). Enforce the
          // global single-menu rule — opening one closes every other.
          if (menu.matches(':popover-open')) {
            menu.hidePopover();
          } else {
            closeAllExcept(menu);
            menu.showPopover();
          }
        }
      });

      // Bar-only: hover switches between sibling menus once the bar has
      // been activated by an initial click. Hovering before any click in
      // the bar does nothing — that mirrors Slate / native menubars.
      if (group) {
        trigger.addEventListener('mouseenter', function () {
          if (!group.activated) return;
          if (menu.matches(':popover-open')) return;
          closeAllExcept(menu);
          menu.showPopover();
        });
      } else if (inParentMenu) {
        // Submenu trigger — hover opens the submenu (no click needed) and
        // closes any sibling submenu of the same parent. Matches Slate's
        // cascading menu behaviour.
        trigger.addEventListener('mouseenter', function () {
          if (menu.matches(':popover-open')) return;
          closeSiblingSubmenus(inParentMenu, trigger);
          menu.showPopover();
        });
      }
    });

    function closeSiblingSubmenus(parentMenu, except) {
      var triggers = parentMenu.querySelectorAll('[data-menu-target]');
      Array.prototype.forEach.call(triggers, function (t) {
        if (t === except) return;
        var m = document.getElementById(t.dataset.menuTarget);
        if (m && m.matches(':popover-open')) m.hidePopover();
      });
    }

    // Regular entries (no submenu) — hovering one closes any submenu open
    // in the same parent menu. Slate users rely on this when scanning
    // through entries; the submenu shouldn't linger after the cursor
    // leaves its trigger.
    document.querySelectorAll('.ss-menu').forEach(function (menu) {
      var regulars = menu.querySelectorAll(
        '.ss-menu__entry:not([data-menu-target])'
      );
      Array.prototype.forEach.call(regulars, function (entry) {
        entry.addEventListener('mouseenter', function () {
          closeSiblingSubmenus(menu, null);
        });
      });
    });

    pairs.forEach(function (p) {
      p.menu.addEventListener('toggle', function (e) {
        var open = e.newState === 'open';
        p.trigger.setAttribute('aria-expanded', open ? 'true' : 'false');

        // Slate locks the parent menu's filter while a submenu is open.
        // Find the parent menu that owns this submenu's trigger and
        // toggle its .ss-menu__search input's disabled flag in lockstep
        // with the submenu's open state. When the submenu closes we only
        // re-enable the search if no OTHER submenu of the same parent
        // is still open.
        var parentMenu = p.trigger.closest && p.trigger.closest('.ss-menu');
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
                '[data-menu-target]'
              );
              Array.prototype.forEach.call(siblingTriggers, function (t) {
                var m = document.getElementById(t.dataset.menuTarget);
                if (m && m.matches(':popover-open')) anySubOpen = true;
              });
              if (!anySubOpen) search.disabled = false;
            }
          }
        }

        if (open) return;
        // Cascade-close any of this menu's submenus on close.
        var children = p.menu.querySelectorAll('[data-menu-target]');
        Array.prototype.forEach.call(children, function (t) {
          var child = document.getElementById(t.dataset.menuTarget);
          if (child && child.matches(':popover-open')) child.hidePopover();
        });
        // Bar deactivation: if every menu in the parent bar is now
        // closed, drop out of activation mode so future hovers don't
        // re-open anything.
        var group = groupOf(p.trigger);
        if (group) {
          var anyOpen = group.triggers.some(function (t) {
            var m = document.getElementById(t.dataset.menuTarget);
            return m && m.matches(':popover-open');
          });
          if (!anyOpen) group.activated = false;
        }
      });

      // Regular entries close the entire menu stack on click.
      var entries = p.menu.querySelectorAll(
        '.ss-menu__entry:not([data-menu-target])'
      );
      Array.prototype.forEach.call(entries, function (entry) {
        entry.addEventListener('click', function () {
          var current = p.menu;
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
    });

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
    var closes = document.querySelectorAll('.ss-tab__close');
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
    });
  }

  // ----- Search box clear button -------------------------------------------
  //
  // Slate's SSearchBox shows a glass icon on the left and a clear (×) button
  // on the right that becomes visible while the field has content. The
  // visibility is pure CSS (`:has(.ss-input:not(:placeholder-shown))`); this
  // helper only wires the click behaviour — empty the field, dispatch an
  // input event so listeners and the `:placeholder-shown` selector re-fire,
  // and return focus to the input.
  function initSearchBoxes() {
    var clears = document.querySelectorAll('.ss-search__clear');
    Array.prototype.forEach.call(clears, function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var search = btn.closest && btn.closest('.ss-search');
        if (!search) return;
        var input = search.querySelector('.ss-input');
        if (!input) return;
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCombos();
      initNumerics();
      initInlineEditables();
      initSearchBoxes();
      initToggleButtons();
      initMenus();
      initTabs();
    });
  } else {
    initCombos();
    initNumerics();
    initInlineEditables();
    initSearchBoxes();
    initToggleButtons();
    initMenus();
    initTabs();
  }

  window.starship.initCombos = initCombos;
  window.starship.initNumerics  = initNumerics;
  window.starship.initInlineEditables = initInlineEditables;
  window.starship.initSearchBoxes = initSearchBoxes;
  window.starship.initToggleButtons = initToggleButtons;
  window.starship.initMenus = initMenus;
  window.starship.initTabs = initTabs;
})();
