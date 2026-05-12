# starship-css

> A CSS framework that styles plain HTML to look like the Unreal Engine 5 editor (Slate UI).
> CSS-first: most components are pure CSS. A small opt-in `starship.js` (~12 KB minified) wires the few widgets HTML/CSS can't drive on their own (combobox, menus, numeric drag, inline edit, toolbar toggle / split-button, tab close) and applies cross-OS font polish. No build step for users — just `<link>`, optionally `<script>`, write semantic HTML with `ss-` prefixed classes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Disclaimer

Inspired by the visual design of the Unreal Engine 5 editor (Slate UI). Not affiliated with, sponsored by, or endorsed by Epic Games, Inc. "Unreal Engine" is a trademark of Epic Games.

This project ships only CSS authored by its contributors. No Epic-bundled assets (textures, icons, fonts) are redistributed. Hex color values referenced from public Unreal Engine source code are not copyrightable.

---

## Quick Start

Load straight from jsDelivr — no install step, no build:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.css">
<!-- Optional — needed for combo, menus, tabs, numeric drag, inline edit, toggle, per-OS font polish. -->
<script src="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.js"></script>
```

Pin to a release tag once tags exist (`@v0.0.3` etc.) — `@main` floats with development and may carry breaking changes between releases.

Then write semantic HTML with `ss-` prefixed classes:

```html
<label class="ss-label">Name</label>
<input class="ss-input" type="text" value="Cube_42">

<button class="ss-btn ss-btn--primary">Save</button>
<button class="ss-btn">Cancel</button>
```

The `<script>` is opt-in. Pure-CSS widgets (buttons including `--toggle`, inputs, checkbox, radio, segmented, slider, progress) work without it. Anything with a popover (combo, menus, menubar, toolbar dropdowns), interactive numeric drag, inline edit, toolbar `__btn--toggle` / split-button `aria-pressed` flip, or tab close-button needs it. Loading the script auto-wires every supported component on the page via `data-*` markers.

---

## Widgets

| Group | Class(es) | Needs `<script>`? | Source |
|---|---|---|---|
| **Buttons** | `.ss-btn`, `--primary`, `--simple`, `--icon-only`, `--toggle` | No (`--toggle` is CSS-only: `<label>` + hidden `<input type="checkbox">`) | `_buttons.scss` |
| **Inputs** | `.ss-input`, `.ss-textarea`, `--bare` | No | `_inputs.scss` |
| **Search** | `.ss-search` + nested `.ss-input` + `.ss-search__icon` | No | `_inputs.scss` |
| **Inline edit** | `.ss-inline-edit` + `[data-inline-edit]` | Yes (`initInlineEditables`) | `_inputs.scss` + `starship.js` |
| **Field row** | `.ss-field` + `.ss-label` | No | `_inputs.scss` |
| **Checkbox** | `.ss-checkbox` (native `<input>`) | No | `_checkbox.scss` |
| **Radio** | `.ss-radio` (native `<input>`) | No | `_checkbox.scss` |
| **Segmented control** | `.ss-segmented` + `--alt` icon-only | No (`:checked` radio hack) | `_segmented.scss` |
| **Slider** | `.ss-slider` (native `<input type="range">`) | No | `_slider.scss` |
| **Numeric (SpinBox)** | `.ss-numeric`, `--filled`, `--no-spin` + `data-num-*` | Yes (`initNumerics` — drag + edit) | `_numeric.scss` + `starship.js` |
| **Combo** | `.ss-combo`, `--simple`; popover via `.ss-popover .ss-combo__menu role="listbox"` | Yes (`initPopovers`) | `_combo.scss` + `_popover.scss` |
| **Menu** | `.ss-menu` inside `.ss-popover`; covers menubar pull-down, toolbar dropdown, submenu, and right-click context menu — single primitive | Yes (`initPopovers`) | `_menu.scss` + `_popover.scss` |
| **Menubar** | `.ss-menubar` + `.ss-menubar__item[data-popover-target]` | Yes (`initPopovers` — activation mode + hover-switch) | `_menu.scss` + `starship.js` |
| **Toolbar** | `.ss-toolbar`, `__btn`, `__btn--toggle`, `__combo`, `__split`, `__sep` | Yes (toggle + combo dropdowns) | `_toolbar.scss` + `starship.js` |
| **Tabs** | `.ss-tabs` (`<input type="radio">` + `<label.ss-tab>` + `<section.ss-tab-panel>`) — major / `--minor` | Only for close-buttons (`initTabs`) | `_tabs.scss` + `starship.js` |
| **Progress bar** | `.ss-progress`, `--marquee`, `aria-disabled="true"` | No | `_progress.scss` |

All widgets respect `prefers-reduced-motion` globally. Every `init*` JS function is idempotent — re-running them after dynamically adding markup wires only the new elements.

---

## Accessibility

Target: **WCAG 2.1 AA** for visible/active states. Widgets ship with native HTML semantics (`<button>`, `<input>`, `<label>`, `<textarea>`), correct ARIA roles (`role="menu"` / `listbox"` / `radiogroup"`), and full keyboard support. `prefers-reduced-motion` is honoured.

We verify with `@storybook/addon-a11y` (axe-core) on every story. Two known categories of `color-contrast` warnings are intentional and follow the Unreal Engine Slate visual contract:

| Where | What | Why we keep it |
|---|---|---|
| `:disabled` states (inputs, buttons, combos, etc.) | Foreground at `var(--ss-foreground)` 45% over panel ≈ 3:1 | WCAG 2.1 SC 1.4.3 explicitly exempts text in inactive UI components from the contrast threshold. axe rarely flags this in practice (recognises `[disabled]` / `[aria-disabled]`); if a custom palette ever brings it over, swap a base token. |
| `.ss-menu__heading` (section headers inside menus) | `var(--ss-white-25)` (#FFFFFF @ 25%) on panel ≈ 3:1 | UE Slate Menu.Heading style — sectional captions inside menus are intentionally muted vs. menu entries. Override `--ss-white-25` in your `:root` if your project needs AA-strict headings. |

Anything else flagged by axe is a bug — please open an issue.

---

## Browser support

The framework targets modern Chromium-class browsers. Specific features and their floor:

| Feature | Used for | Required browser |
|---|---|---|
| CSS Anchor Positioning (`anchor()`, `position-anchor`) | Combo / menu popover positioning relative to trigger | Chromium 125+, Edge 125+. **Firefox / Safari fallback positions at viewport top-left until a JS positioner is added** (open). |
| HTML5 Popover API (`popover="manual"`, `showPopover()`, `:popover-open`) | All combo and menu state | Chromium 114+, Firefox 125+, Safari 17+ |
| `:has()` selector | Parent-state paint (e.g. `.ss-segmented:has(input:disabled)`, `.ss-search:has(.ss-input:disabled)`) | Chromium 105+, Firefox 121+, Safari 15.4+ |
| `color-mix(in srgb, …)` | Disabled tints, progress stripe derivations | Chromium 111+, Firefox 113+, Safari 16.2+ |
| `prefers-reduced-motion` | Animations / marquee suppression | All evergreen |

In practice: a recent Chromium-class browser (Chrome / Edge / Brave / Arc / Opera, late 2024 onwards) renders the framework correctly. Firefox and Safari work for everything except the combo/menu anchor positioning (Chromium-only until a fallback ships).

---

## Customising the palette

Every UE Slate `EStyleColor` is exposed as a CSS custom property on `:root` (`--ss-foreground`, `--ss-primary`, `--ss-input`, etc.). Override any of them to recolor the framework:

```css
:root {
  --ss-primary:       #FF6B00;
  --ss-primary-hover: #FF8533;
  --ss-primary-press: #B24E00;
}
```

Override propagates everywhere — buttons, combo / menu / segmented checked state, slider thumb, progress marquee (auto-derived via `color-mix`), focus rings, disabled tints (auto-derived via `color-mix(in srgb, var(--ss-foreground) 45%, transparent)`). No need to override `--ss-progress-stripe-*` or `--ss-foreground-disabled` — they don't exist; everything chains off the base palette.

See `Foundations/Colors` story in Storybook for the live catalog of all 45 UE tokens.

---

## Developing on the framework

```bash
npm install
npm run build       # compiles src/ → dist/ with sourcemaps
npm run watch       # sass watch on src/scss/starship.scss
npm run storybook   # launches Storybook on http://localhost:6006
```

Storybook is the canonical dev surface — every widget has a state matrix story under its semantic category (`Buttons/`, `Inputs/`, `Selectors/`, `Containers/`, `Feedback/`, `Foundations/`). The `Welcome` story is pinned to the top of the sidebar as a landing page. Two addons run on every story:

- **`storybook-addon-pseudo-states`** — force-applies `:hover` / `:focus-visible` / `:active` per cell, so a single screenshot captures every state without real cursor interaction.
- **`@storybook/addon-a11y`** (axe-core) — runs accessibility checks on every story; results appear in the Accessibility panel.

Most atom widgets (Button, Checkbox, Input, Radio, Segmented, Slider, Numeric, Search, InlineEdit, Combo, Menubar, Tabs) expose live **Controls** via `argTypes` — flip variants and states from the addon panel without editing code.

`docs/index.html` is the public overview gallery (deployed to GitHub Pages). After Storybook landed it is **frozen** as a stable visual reference; all new component states/behaviour go into `stories/*.stories.js`.

---

## Live demo

[**yashabogdanoff.github.io/starship-css**](https://yashabogdanoff.github.io/starship-css/) — overview gallery rendered with the latest build.

---

## License

[MIT](./LICENSE).

**Roboto** is loaded from Google Fonts (Apache-2.0); the font is not bundled in the npm package. Icons in the showcase use [Lucide](https://lucide.dev/) (MIT) and/or [Tabler Icons](https://tabler.io/icons) (MIT). Internal chevron / search-glass icons are inlined as `data:` URIs in `_combo.scss`, `_menu.scss`, and `_inputs.scss` so the framework ships without an external SVG sprite.
