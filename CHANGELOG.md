# Changelog

All notable changes to `starship-css` will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Storybook `@storybook/addon-a11y`** wired in `.storybook/main.js` —
  axe-core runs on every story; violations show up in the Accessibility
  panel. WCAG 2.1 AA target declared in `README.md` with two documented
  exemptions (`:disabled` per WCAG 1.4.3, `.ss-menu__heading` per UE
  Menu.Heading style).
- **Storybook Controls** (`argTypes` + parametrized render) on Combo /
  Input (incl. `textarea` toggle + `Textarea` / `TextareaBare` stories) /
  Tabs / Menubar — all atom widgets now have live Controls.
- **`Welcome` story** pinned to top of Storybook sidebar via
  `parameters.options.storySort`.
- **CSS-only `.ss-btn--toggle`** — `<label>` + hidden
  `<input type="checkbox">` + `:has(input:checked)` + `:focus-within`.
  No JS required.

### Changed

- **`.ss-btn--toggle` is now CSS-only.** The legacy
  `<button class="ss-btn--toggle" aria-pressed>` markup is **removed**
  (selector dropped from `_buttons.scss`, story dropped from
  `Button.stories.js`, `initToggleButtons()` no longer targets
  `.ss-btn--toggle`). `aria-pressed` on `<label>` is invalid ARIA and
  was the only reason JS was needed here.
- **`initToggleButtons()`** now only wires `.ss-toolbar__btn--toggle`
  and `.ss-toolbar__split-btn--toggle` (real `<button>` elements where
  `aria-pressed` is semantically correct).
- **Matrix story captions** (`Button` / `Numeric` / `Slider` / `Progress`
  variants section, `Segmented` parent-state hint) — bumped contrast
  from `opacity: 0.6` / `--ss-white-25` to `var(--ss-foreground-header)`
  so axe-core stops flagging them.
- **Matrix story inputs/checkboxes** (`Input` / `Checkbox`) now carry
  `aria-label` so axe `label` rule passes.
- **`Menubar` story** — unique `aria-label` per `<nav>` instance to
  satisfy axe `landmark-unique` when several menubars sit on one page.

### Removed

- `Button/ToggleLegacyAriaPressed` story (no users yet — back-compat
  path deleted instead of preserved; see `CLAUDE.md` "Project phase").

## [0.0.3] — 2026-05-12

### Added

- **`_text.scss`** — Slate `FTextBlockStyle` registry mapped to SCSS mixins
  (`ss-text-normal`, `ss-text-small`, `ss-text-menu-heading`,
  `ss-text-section-label`). Forwarded through `_variables.scss` so any
  partial that does `@use "variables" as *` gets the mixins automatically.
  8 component partials replaced inline `font-size` / `font-weight` rules
  with `@include` calls.
- **`Foundations/Colors` Storybook story** — visual catalog of all 45 UE
  `EStyleColor` tokens grouped by semantics (Surfaces / Foreground /
  Primary / Select / Accents / Status / Neutral). Hex values resolved
  via `getComputedStyle` so palette overrides update in real time.
- **`Selectors/Menu/ContextMenuExample` story** — demonstrates that the
  same `.ss-menu` widget powers menubar pull-downs, toolbar dropdowns,
  submenus, AND right-click context menus. Single primitive, multiple
  use cases — mirrors UE Slate's `FSlateApplication::PushMenu()`.
- **CSS Anchor Positioning fallback note** — explicit Firefox/Safari
  caveat in plan + AUDIT.md (still Chromium 125+ only for combo/menu
  popover positioning).
- **Sourcemaps** in `dist/` (`.css.map`, `.min.css.map`, `.min.js.map`).
- **`exports` field** in `package.json` for modern bundlers; `main`
  now correctly points at JS, with conditional `./css` / `./js` /
  `./css.min` / `./js.min` subpath exports.
- **`storybook-addon-pseudo-states`** dev-dependency — state matrix
  stories can now force `:hover` / `:focus-visible` / `:active` per
  cell, producing single-screenshot regression baselines.

### Changed

- **Progress marquee colors** derived via `color-mix(in srgb, …)` from
  `--ss-primary-hover` (light stripe), 7% black-darken (dark stripe),
  and `--ss-foldout`/`--ss-panel` cumulative-α composite (disabled
  state). 5 progress-specific tokens removed from `_variables.scss` —
  the marquee now follows `--ss-primary-hover` overrides automatically.
- **46 hardcoded `rgba(…, 0.45)` disabled-tint literals** replaced
  with `color-mix(in srgb, var(--ss-X) 45%, transparent)` across 10
  partials (buttons, checkbox, combo, inputs, menu, numeric, segmented,
  slider, tabs, toolbar). Disabled colors now derive from base tokens —
  overriding `--ss-foreground` or `--ss-primary` propagates.
- **Tabs limit** raised from 16 to 32 (`@for $i from 1 through 32`).
  Hard cap remains but doubles the headroom.
- **`prefers-reduced-motion`** honored globally in `_reset.scss`. WCAG
  2.3.3 — marquee progress becomes a static frame, transitions clamp
  to 0.01 ms.
- **`.ss-combo__trigger:focus-visible`** is now visually distinct from
  `:hover` (WCAG 2.4.7) — Primary-colored border + 1 px outline ring,
  not the Hover gray. Same fix for `.ss-combo--simple` trigger.
- **`init*` functions are now idempotent** across the board (Phase 2.5
  did `initPopovers`; this release does `initNumerics`,
  `initInlineEditables`, `initToggleButtons`, `initTabs`).
  `data-ss-inited="<name>"` guards prevent double-binding;
  `initNumerics` moves its `document.mousemove` / `mouseup` handlers
  to module-level singletons keyed off a `WeakMap` state registry.
- **Storybook canvas background** matches UE Slate panel surface
  (`#242424`) instead of window background (`#151515`). Widgets in
  UE Starship Gallery sit on panels, so the panel surface is the
  more representative canvas.
- **Storybook category structure** reorganized to mirror UE Starship
  Gallery: `Buttons/`, `Inputs/`, `Selectors/`, `Containers/`,
  `Feedback/`, `Foundations/`, `Surfaces/`.

### Removed

- `_select.scss` + `.ss-select` class — duplicate of `.ss-combo`
  (different palette + worse implementation). `.ss-combo` is now the
  sole selector primitive. `--ss-select` and `--ss-select-*` color
  tokens kept (they are referenced by `.ss-combo` aria-selected ring).
- `_details.scss` + `.ss-details` class — vestigial, never used in
  `docs/index.html` gallery. Will return when Slate's
  `SExpandableArea` is actually implemented.
- `_panels.scss` + `.ss-panel*` classes — vestigial scope-creep
  from an earlier session. Not in UE Slate Gallery.
- `_tooltip.scss` + `.ss-tooltip` class — vestigial.
- `_scrollbar.scss` + global custom-scrollbar rules — vestigial.
- `_typography.scss` + `h1`-`h6`/`p`/`code`/`blockquote`/`ul`/`ol`
  rules — blog-style typography never present in Slate. Widgets
  inherit font from `_reset.scss` body defaults.
- Search-clear button (`.ss-search__clear`) removed from CSS, JS,
  HTML, and Storybook — UE Slate's `SSearchBox` doesn't have one.
- `Selectors/Popover` Storybook story removed — `.ss-popover` is an
  internal paint primitive, not a standalone widget.

### Fixed

- Combo / menu hover focus now visually distinct from mouse hover
  (WCAG 2.4.7 — was a regression from copying UE behaviour 1:1).
- `npm install` workaround documented: the `package-lock.json`
  generated on Windows is committed because fresh resolution on WSL
  hangs in npm's undici HTTP/2 path (known npm/cli issue). Existing
  lockfile installs in seconds via the `npm ci` code path.

## [0.0.2] — 2026-05-12

### BREAKING

- **Unified popover API.** `data-combo-target` and `data-menu-target` are
  replaced by a single `data-popover-target`. Combo dropdowns, menus,
  submenus, menubar items, and toolbar combos all share the same trigger
  attribute. The JS entry points `Starship.initCombos` and
  `Starship.initMenus` are removed; use `Starship.initPopovers` instead.
  Behaviour branches on the popover's `role` attribute (`listbox` →
  combo with option-select-and-writeback, `menu` → cascading menu with
  menubar activation mode and parent-search lock).
- **Inline `style="anchor-name: ..."` and `style="position-anchor: ..."`
  are no longer required** in HTML. `Starship.initPopovers` assigns both
  properties programmatically from the `data-popover-target` value,
  resolving CSP `style-src 'self'` incompatibility (closes AUDIT.md
  critique #6).

### Added

- New SCSS base class `.ss-popover` holds the chrome shared by combo
  dropdowns and menus (background `--ss-dropdown`, outline
  `--ss-dropdown-outline`, position-anchor wiring). Apply alongside the
  component class: `<div class="ss-popover ss-menu" role="menu" popover="manual">`.
- New SCSS partial `_popover.scss`.

### Changed

- `Starship.initPopovers` (and all sibling `init*` functions) are now
  idempotent. Per-element guards (`data-ss-inited="popover"` on triggers
  and popover containers) prevent double-binding, and a module-level
  singleton ensures the document-level `mousedown` / `keydown`
  listeners are attached exactly once. Re-running an init after
  dynamically adding markup only wires the new elements (closes
  AUDIT.md §4 "Idempotency: нет").
- `_combo.scss` and `_menu.scss` keep only content-specific styling
  (option rows / entries / icons / search box / submenu chevron).
  Shared chrome moved to `_popover.scss`.

### Migration guide (HTML)

```html
<!-- Before (v0.0.1) -->
<button data-combo-target="my-combo"
        style="anchor-name: --my-combo;">Trigger</button>
<div class="ss-combo__menu" popover="manual" id="my-combo"
     style="position-anchor: --my-combo;" role="listbox"> ... </div>

<!-- After (v0.0.2) -->
<button data-popover-target="my-combo">Trigger</button>
<div class="ss-popover ss-combo__menu" popover="manual" id="my-combo"
     role="listbox"> ... </div>
```

```js
// Before
window.starship.initCombos();
window.starship.initMenus();

// After
window.starship.initPopovers();
```

## [0.0.1] — 2026-05-09

Initial release.
