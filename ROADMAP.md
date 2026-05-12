# starship-css ROADMAP

This document tracks **widget coverage progression** — what's been ported from Unreal Engine, what's next, and the long-term shape of the framework.

Process docs (build, conventions, visual-fidelity workflow, accessibility, Storybook setup) live in `CLAUDE.md` and `notes/PROJECT_NOTES.md`. This file is **only about which widgets we ship**.

---

## Scope and ambition

### What we ship

**Widget primitives and visual styles** — the building blocks. For each widget:

- CSS partial that matches UE Slate's appearance pixel-for-pixel (states, brushes, paddings).
- HTML/markup contract — exact semantic elements and class names.
- Minimal JS in `starship.js` for mechanics the consumer can't get from native HTML/CSS alone: open/close a popover, drag-resize a splitter, drag-fill a numeric, expand a `<details>`, flip `aria-pressed`. No business logic, no data binding, no application state.

### What we explicitly DON'T ship

- **Color math** for the picker (HSV ↔ RGB conversion, gamma, color space transforms). We ship the chrome (sliders, swatches, hex input layout). Consumer wires the conversion.
- **Property-type introspection** for a "live" DetailsView. We ship the row layout + category headers. Consumer maps their data shape to the right child widget themselves.
- **Asset thumbnail / drag-drop / asset-system integration.** We ship the thumbnail box chrome. Consumer wires the asset backend.
- **Anything resembling an application framework** — no state store, no router, no data fetching helpers.

The mental model: **starship-css is to UE Slate what Bootstrap is to a generic admin theme.** Bootstrap ships a `<div class="modal">` that opens and closes; what's *inside* the modal is your job. Same here — `.ss-details-row` is layout, what data fills it is your job.

The Unreal Editor replica mentioned as a stretch goal in §"Stretch" below is **a demonstration** that the primitives are complete enough to assemble it — not a deliverable component. Building the editor itself, with real logic, would be the consumer's project on top of us.

### Surface scope

| Surface | Widget types | Status |
|---|---|---|
| **Starship Gallery** (UE test harness — `SStarshipGallery.cpp`) | ~21 | ✅ ~100% covered |
| **Slate `StarshipCoreStyle`** (base brushes) | ~50 entries × variations | Buttons / inputs / chrome covered; specialty brushes deferred |
| **Slate `StarshipStyle`** (editor-specific, 558 KB — **4× larger** than Core) | ~200+ types | ~5% covered (toolbar, menubar, tabs, basic menus) |
| **Full Unreal Editor** (Outliner, DetailsView, BlueprintEditor, MaterialEditor, etc.) | composite of everything above | "We provide the bricks; not building the house ourselves." |

The asymmetry is real: **Starship Gallery is the tip of an iceberg.** The editor itself is roughly 5-6× as much widget surface — but we ship the *primitives* it's built from, not the editor itself.

---

## Where we are now

**Shipped** in `v0.0.3` + `[Unreleased]` (CHANGELOG):

### Atoms (16)
- Button (Default / Primary / Simple / Icon-only / Toggle CSS-only)
- Checkbox (3-state: unchecked / checked / indeterminate)
- Radio
- Input (text + textarea + bare modifier + read-only)
- Search
- Inline-edit (dblclick-to-edit span)
- Segmented control (radio-hack)
- Slider (native range styled)
- Numeric (SpinBox + EntryBox + no-spin)
- Combo box (default + simple variants)
- Menu (single primitive covers menubar pull-down, toolbar dropdown, submenu, context menu)
- Menubar
- Toolbar (button + toggle + combo + split + separator)
- Tabs (major + minor, up to 32, close-button)
- Progress (determinate + marquee + disabled)

### Foundations
- 45 `EStyleColor` design tokens (palette catalog)
- Slate `FTextBlockStyle` mixins (`ss-text-normal`, `ss-text-small`, `ss-text-menu-heading`, `ss-text-section-label`)
- Per-OS font compensation (`:root.ss-os-win` weight overrides)
- Disabled tint via `color-mix(in srgb, var(--ss-X) 45%, transparent)`
- `prefers-reduced-motion` honoured globally

**Goal of next release (`v0.1.0`):** finish Phase 5 below — structural widgets that unlock "panel-shaped UI" use-cases (Project Settings, Editor Preferences, Outliner, Components, Details panel scaffolding).

---

## Phase 5 — Structural / "panel UI" foundation

> **Why this phase first:** every other UE window is assembled from these. Without them we can render *contents* of a panel but not the *shape* of a panel. Once Phase 5 ships, a consumer can build a UE-looking Project Settings or Outliner with our framework alone.

**Target: `v0.1.0`.** Estimate: ~2-4 weeks for one person.

| Widget | UE source | Where it appears in UE | Key behaviour | Effort |
|---|---|---|---|---|
| **Expandable area** | `SExpandableArea`, `FExpandableAreaStyle` | Project Settings categories, Details panel sections, almost every collapsible block in the editor | Toggle chevron rotates, content slides (instant — no anim per `feedback_no_transitions`), `<details>`/`<summary>` semantics, indent levels nesting cleanly | M |
| **Splitter** | `SSplitter` | Between Viewport / Outliner / Details, between any docked pair | Horizontal + vertical orientations, drag-resize via JS (mouse + pointer events), min/max constraints, double-click resets to default ratio | M |
| **Tree view** | `STreeView` | Outliner, Settings sidebar, Components tree in Blueprint editor | Expand/collapse rows, indent per depth, selection (single + range), keyboard nav (Arrow up/down/left/right + Home/End), no virtualization yet | L |
| **List view** | `SListView` | Asset list mode, history panels | Selection (single + range + multi via Ctrl), keyboard nav, alternating row tint optional | M |
| **Scroll box** | `SScrollBox`, `SScrollBar` | Anywhere content overflows; styled scrollbar across the editor | UE-styled scrollbar (we previously had `_scrollbar.scss`, retired in v0.0.2 — revisit), shadow-fade at top/bottom edges on overflow | S |
| **Breadcrumb trail** | `SBreadcrumbTrail` | Content Browser path nav, Settings deep links | Clickable segments, chevron separator, ellipsis when overflowing | S |

**Definition of done for Phase 5:**
- Each widget has a `_<name>.scss` partial, a state matrix story, default-state visual match against UE reference (Reflector snapshot + screenshot side-by-side).
- Tree + List are NOT virtualized (gracefully renders 10-1000 items; consumers virtualize themselves if needed).
- Splitter has a `ResizeObserver`-based JS handler in `starship.js` (RAF-throttled like `initNumerics`).
- Storybook Welcome card grid extended to 22 widgets.

---

## Phase 6 — Picker & input chrome

> **Scope reminder:** we ship the *visual* of pickers, not the *logic*. Consumer plugs in their data and (if needed) math.

**Target: `v0.2.0`.** Estimate: ~3-4 weeks.

| Widget | UE source | What we ship | What consumer wires | Effort |
|---|---|---|---|---|
| **Color picker chrome** | `SColorPicker` | The HSV plane background gradient + cursor dot CSS, hue/value slider rails styled, hex/RGB input row layout, "OK / Cancel" button row, eye-dropper button slot. Markup: `<div class="ss-color-picker">` with named slots. | HSV↔RGB conversion math, drag-to-pick on the plane, click-on-swatch logic, hex parsing. | M |
| **Vector / Rotator input** | `SVectorInputBox`, `SRotatorInputBox` | Three `.ss-numeric` boxes side-by-side with X/Y/Z (or pitch/yaw/roll) colour-coded labels — composition layout. | The three values are independent `.ss-numeric` instances; consumer reads each. | S |
| **Enum combo** | `SEnumComboBox` | Variant of combo with icon per entry + text. Markup convention `.ss-combo__option` already supports nested icons. | The enum values themselves; consumer fills options. | S |
| **Color grading control** | `SColorGradingPicker` | (Optional) the four-wheel layout chrome (lift/gamma/gain/offset boxes). | All the HDR math. **Defer unless we need the chrome.** | M chrome only |
| **Asset / class slot** | `SAssetPicker`, `SClassPicker` | `.ss-asset-slot` — empty thumbnail box (gray border + name placeholder) + "browse" button + clear ×. Tight Slate-look chrome. | The asset system itself (file-type detection, thumbnail rendering, browse-dialog opening). | M |

---

## Phase 7 — Feedback & overlays

> **Why before Phase 8:** Details panel uses tooltips on every field. Toolbar buttons show tooltips on hover. Modal dialogs are needed for any confirmation/setting workflow.

**Target: `v0.3.0`.** Estimate: ~1-2 weeks.

| Widget | UE source | Notes | Effort |
|---|---|---|---|
| **Tooltip (rich)** | `SToolTip`, `FToolTipStyle` | Native `title` attribute is too plain. UE tooltips have heading + body + sometimes a small icon. Use Popover API + `:hover` + slight delay (CSS only, no JS). | S |
| **Notification toast** | `SNotificationItem`, `SNotificationList` | Bottom-right stack, fade-in / fade-out (we'd suspend the no-transitions rule for these — they're explicitly animated in UE via `FCurveSequence`), success / warning / error variants, optional action button + dismiss × | M |
| **Modal dialog** | `SWindow` (modal), `SCustomDialog` | Native `<dialog>` element, UE chrome (titlebar with close, footer button row, scroll inner content). | M |
| **Section header / divider** | `SExpandableArea` heading, `SSeparator` | Already partly covered by `.ss-menu__heading`. Reusable across panels. | S |

---

## Phase 8 — DetailsView markup recipes

> **Scope reminder:** this is **the** signature UE widget, but we ship it as a **static markup recipe** + supporting partials. No JS reads "this is a Vector3" and renders three numeric boxes — that's the consumer's job. We just guarantee that if the consumer writes the documented HTML, it looks like UE.

**Target: `v0.4.0`.** Estimate: ~3-6 weeks depending on depth.

| Widget | UE source | What we ship | What consumer wires | Effort |
|---|---|---|---|---|
| **Details panel scaffold** | `SDetailsView`, `IDetailsView` | `.ss-details` container, `.ss-details-section` (uses `.ss-expandable`), `.ss-details-row` (label-left, editor-right two-column layout). Indent levels for nested struct properties (CSS counter-based). | Which child widget appears in `.ss-details-editor` slot per row (`.ss-numeric` for floats, `.ss-checkbox` for bools, `.ss-color-picker` chrome for colors, etc.). | L |
| **Property row** | `SDetailRow`, `FPropertyDetails` | Label cell + editor cell + optional reset-to-default arrow slot + optional edit-conditions chevron slot. | Whether to show the reset arrow (i.e. "is the value different from default") and what clicking it does. | M |
| **Search bar with row filtering** | `SSearchBox` inside DetailsView | `.ss-search` (already shipped) + `.ss-details-row[hidden]` rule for filtered rows + "no matches" empty-state markup. | Which rows match the query — consumer iterates and toggles `hidden`. | S |

The point is consumers write something like (in their React / Vue / vanilla):

```html
<div class="ss-details">
  <details class="ss-details-section" open>
    <summary class="ss-expandable__header">Transform</summary>
    <div class="ss-details-row">
      <label class="ss-details-label">Location</label>
      <div class="ss-details-editor">
        <div class="ss-vector-input">
          <input class="ss-numeric ss-numeric--filled" data-num-value="0">
          <!-- × 3 for X/Y/Z -->
        </div>
      </div>
    </div>
  </details>
</div>
```

…and it looks like UE's Details panel. **The mapping from `Transform.Location` to that markup is the consumer's code.** We just guarantee the chrome.

---

## Phase 9 — Specialized chrome (long-tail)

> Long-tail. Pick individual ones if a real need surfaces. **All are "chrome only" — visual scaffolding consumer fills with their logic.**

| Widget | UE source | What chrome we'd ship | Status |
|---|---|---|---|
| Curve editor chrome | `SCurveEditor` | Grid background + axis labels + handle/point dot styles. Bezier math = consumer. | Defer. |
| Graph panel chrome | `SGraphPanel`, `SGraphNode` | Node card styles, pin shapes, connection line stroke. Drag / connect / snap = consumer. | Defer. |
| Asset thumbnail chrome | `SAssetThumbnail` | Square card with name strip, optional colored asset-type border, hover overlay. Real thumbnail bytes = consumer. | Ship if asked. |
| Viewport chrome | `SLevelViewport` border, gizmo overlays | Just border + corner-button slots. Actual 3D = consumer. | Defer. |
| Dock tab system | `SDockTab`, `SDockArea` | Tab strip already covered. The drag-out-to-float + tab-snap-zones logic is **out of scope** — that's an application framework concern. | Defer. |
| Status bar | Editor bottom-bar | Composable from Toolbar + Notification — likely no new widget needed. | n/a |

---

## Ongoing — Modifiers on existing widgets

These are **not phases**; they accumulate as we hit them. Each is a 1-5-line addition to an existing partial.

### Toolbar variants spotted in UE Editor
- `.ss-toolbar__btn--lg` — bigger 3-dot menu button (Content Browser style).
- `.ss-toolbar__split--reverse` — split-button with the options arrow on the **left** of the action button (Slate's `EMultiBlockLocation::Start`). Add via `flex-direction: row-reverse` or `order` shuffle.
- `.ss-toolbar__btn--tiny` — small icon-only square (sub-toolbars inside floating panels).
- `.ss-toolbar__cog` — gear/settings dropdown variant.

### Button variants
- `.ss-btn--sm` / `--lg` — size modifiers.
- `.ss-btn--danger` — destructive action (red bg). Not in Gallery but obvious need.
- `.ss-btn--ghost` — Slate has `SimpleButton` (covered); we could add an even-lighter variant.

### Input variants
- Numeric drag with `Shift` for fine / `Ctrl` for coarse step.
- Input prefix/suffix slots (`$` / `°` / `m` decorators).
- Multi-line auto-grow.

### Combo / Menu variants
- Submenu opens on hover (currently only on click — UE menus open on hover after a delay).
- Search-as-you-type inside long combo lists.

Mark these as completed inline in the table above when shipped. When the table grows past ~20 items, promote to a real phase.

---

## Stretch goal — Editor-replica showcase (demo, not deliverable)

Once Phases 5-9 ship, the framework's primitives should be **sufficient** to assemble a static Unreal-Editor mockup page — Outliner shape, Details panel layout, Content Browser frame, Blueprint editor frame chrome. This would be **a demonstration** that the brick set is complete, hosted alongside the Storybook (e.g. on a `/editor-demo/` route). It's not a deliverable component — there'd be no JS reading "open this blueprint" or dragging assets. Just markup composed from our primitives.

If it ever happens, it would be a Storybook story group (e.g. `Demos/UnrealEditor`) rather than a separate package. The point is: a consumer who wants to build a real editor-like product reads our markup recipe and writes their own application logic on top.

**No fixed timeline.** Decision deferred until after Phase 8 ships.

---

## How to use this roadmap

1. Open the highest-numbered phase that still has unchecked items.
2. Pick a single widget. Don't bundle.
3. Read the UE source for it (`grep -nr S<WidgetName> /mnt/g/Epic\ Games/UE_5.7/Engine/Source/`).
4. Capture a Widget Reflector snapshot from the running editor in the state you care about.
5. Implement via the **Visual fidelity workflow** in `CLAUDE.md` — snapshot → source → SCSS → DOM verify → screenshot cross-check.
6. Ship: SCSS partial + Storybook story (Default + Matrix + force-states) + CHANGELOG `[Unreleased]` entry. Check the box here.
7. When all items in a phase are checked, bump the minor version and tag.

**One widget per branch / commit cycle.** "Phase 5" is a label, not a single commit.

---

## Where we sit in the web UI library landscape

| Category | Examples | Are we this? |
|---|---|---|
| **CSS framework + thin JS for mechanics** | Bootstrap, Foundation, Pico (this is the closest analogue) | ✅ **Yes — this is us.** |
| **CSS-only framework** | Tailwind, Tachyons | Almost — we have a small `starship.js` for behaviour native HTML can't do |
| **Headless behaviour library** | Radix UI, React Aria, Headless UI | No — they ship behaviour without styles; we ship styles |
| **Component library / Design system (framework-bound)** | Material UI, Ant Design, Chakra, shadcn/ui | No — those ship React components with built-in state, prop-driven generation, data binding |
| **Component library (framework-agnostic)** | Shoelace, Lit + Web Components | No — those ship custom elements with internal state |
| **Application framework** | Electron + chrome, Tauri, full editor SDKs | No — we don't manage application state, routing, or asset systems |

Our package shape: **one npm package, one CSS bundle, one optional JS bundle**. Same as Bootstrap. Consumer brings their own framework (React, Vue, Solid, vanilla — anything) and composes our primitives.

---

## What this roadmap does NOT cover

- Build system, Sass/PostCSS pipeline, CI — see `package.json` and `.github/workflows/`.
- Conventions (class names, BEM, `:has()` rules, no-transition rule) — see `CLAUDE.md`.
- Visual verification workflow (Reflector snapshot → source → DOM diff) — see `CLAUDE.md` § "Visual fidelity workflow" and `tools/README.md`.
- Accessibility scope and exemptions — see `README.md` § "Accessibility".
- Storybook setup, addon configuration — see `notes/STORYBOOK_PLAN.md`.
- Audit findings and follow-ups — see `notes/AUDIT.md`.
