# Changelog

All notable changes to `starship-css` will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
