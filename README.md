# starship-css

> A CSS framework that styles plain HTML to look like the Unreal Engine 5 editor (Slate UI).
> CSS-first: most components are pure CSS. A small opt-in `starship.js` (~3 KB minified) wires the few widgets HTML/CSS can't drive on their own (combobox, dropdowns, numeric drag, menus, tabs) and applies cross-OS font polish. No build step for users — just `<link>`, optionally `<script>`, write semantic HTML.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Disclaimer

Inspired by the visual design of the Unreal Engine 5 editor (Slate UI). Not affiliated with, sponsored by, or endorsed by Epic Games, Inc. "Unreal Engine" is a trademark of Epic Games.

This project ships only CSS authored by its contributors. No Epic-bundled assets (textures, icons, fonts) are redistributed. Hex color values referenced from public Unreal Engine source code are not copyrightable.

---

## Quick Start

Load straight from jsDelivr — no install step, no build:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.css">
<!-- Optional — needed for combobox, menus, tabs, numeric drag, per-OS font polish. -->
<script src="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.js"></script>
```

Pin to a specific release tag (`@v0.0.1`) instead of `@main` once tags exist.

Then write semantic HTML with `ss-` prefixed classes:

```html
<div class="ss-panel">
  <h2>Details</h2>
  <label class="ss-label">Name</label>
  <input class="ss-input" type="text" value="Cube_42">

  <button class="ss-btn ss-btn--primary">Save</button>
  <button class="ss-btn">Cancel</button>
</div>
```

The `<script>` is opt-in. Pure-CSS widgets (buttons, inputs, panels, segmented control, checkbox, radio, scrollbar, typography, progress bar) work without it; combobox, menus, tabs, numeric drag, and per-OS font compensation need it.

---

## Live demo

[**yashabogdanoff.github.io/starship-css**](https://yashabogdanoff.github.io/starship-css/) — the full widget gallery rendered with the latest build.

---

## License

[MIT](./LICENSE).

Static **Roboto** is loaded from Google Fonts (Apache-2.0); the font is not bundled in the npm package. Icons in the showcase use [Lucide](https://lucide.dev/) (MIT) and/or [Tabler Icons](https://tabler.io/icons) (MIT).
