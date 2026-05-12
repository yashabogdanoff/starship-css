# starship-css ROADMAP

This document tracks **widget coverage progression** — what's been ported from Unreal Engine, what's next, and the long-term shape of the framework.

Process docs (build, conventions, visual-fidelity workflow, accessibility, Storybook setup) live in `CLAUDE.md` and `notes/PROJECT_NOTES.md`. This file is **only about which widgets we ship**.

---

## Scope and ambition

| Surface | Widget types | Status |
|---|---|---|
| **Starship Gallery** (UE test harness — `SStarshipGallery.cpp`) | ~21 | ✅ ~100% covered |
| **Slate `StarshipCoreStyle`** (base brushes) | ~50 entries × variations | Buttons / inputs / chrome covered; specialty brushes deferred |
| **Slate `StarshipStyle`** (editor-specific, 558 KB — **4× larger** than Core) | ~200+ types | ~5% covered (toolbar, menubar, tabs, basic menus) |
| **Full Unreal Editor** (Outliner, DetailsView, BlueprintEditor, MaterialEditor, etc.) | composite of everything above | ~3% covered |

The asymmetry is real: **Starship Gallery is the tip of an iceberg.** The editor itself is roughly 5-6× as much widget surface, plus all the composite views (DetailsView is the single largest contributor — it composes ~15 atom widgets plus property-type machinery).

We do **not** aim to recreate the entire editor in v1.0. Phases below carve the work into shippable releases.

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

## Phase 6 — Pickers & inline editors

> **Why next:** Details panel rows are 80% pickers (color, vector, asset, class, enum). Without these, even a covered DetailsView scaffold (Phase 8) renders as empty boxes.

**Target: `v0.2.0`.** Estimate: ~3-4 weeks.

| Widget | UE source | Notes | Effort |
|---|---|---|---|
| **Color picker** | `SColorPicker` | Standard HSV wheel + saturation/value plane + alpha slider + hex input + sRGB toggle. The most universally needed picker. Both pop-up and inline forms. | L |
| **Vector / Rotator input** | `SVectorInputBox`, `SRotatorInputBox` | Three `.ss-numeric` boxes side-by-side with R/G/B (or X/Y/Z) colour-coded labels. Mostly composition, very little new CSS. | S |
| **Enum combo** | `SEnumComboBox` | Variant of combo with icon per entry + text. Mostly markup convention; no real new widget. | S |
| **Color grading wheel** | `SColorGradingPicker` | Trigonometric color picker for HDR. Specialized. Defer unless asked. | XL |
| **Asset picker / Class picker** | `SAssetPicker`, `SClassPicker` | UE-content-specific (knows about `.uasset` files). We can ship the **chrome** as `.ss-asset-picker` — empty thumbnail box + name + browse button — without the asset-system machinery. Consumer wires their own data. | M |

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

## Phase 8 — Property Editor compositions

> **Why later:** this is **the** signature UE widget, but it's a composite of all of Phase 5-7. Doing it earlier means inventing pickers and structural widgets ad-hoc inside the DetailsView code, which we'd then have to refactor out.

**Target: `v0.4.0`.** Estimate: ~3-6 weeks depending on depth.

| Widget | UE source | Notes | Effort |
|---|---|---|---|
| **Details panel scaffold** | `SDetailsView`, `IDetailsView` | Category headers (= `SExpandableArea`) + property rows (label-left, editor-right two-column layout). Static composition; **no property-type introspection** (consumer wires what widget appears per row). | L |
| **Property row** | `SDetailRow`, `FPropertyDetails` | Label cell + editor cell + optional reset-to-default arrow + optional edit-conditions chevron. Indent levels for nested struct properties. | M |
| **Search/filter bar for details** | `SSearchBox` inside DetailsView | We have `.ss-search`. Add "filtered rows highlight" + "no matches" empty state. | S |
| **Object property entry** | `SObjectPropertyEntryBox` | The asset-picker compound (thumbnail + name + browse + clear). Builds on Phase 6 asset-picker. | M |

---

## Phase 9 — Advanced specialized widgets

> Long-tail. Pick individual ones if a real need surfaces; we don't aim for full coverage.

| Widget | UE source | Status |
|---|---|---|
| Curve editor | `SCurveEditor` | Out of scope unless someone really needs it. Heavy SVG / Canvas. |
| Graph panel (Blueprint nodes) | `SGraphPanel`, `SGraphNode` | Out of scope. This is the *content* of Blueprint editor, not a reusable widget. |
| Asset thumbnail | `SAssetThumbnail` | Static box + name; full thumbnail machinery requires UE asset system. Ship chrome only. |
| Viewport chrome | `SLevelViewport` border, gizmo overlays | Specialized; defer. |
| Dock tab system | `SDockTab`, `SDockArea` | Whole floating-window manager. Multi-week project on its own. Likely a separate library. |
| Status bar | Editor bottom-bar | Composable from Toolbar + Notification — likely doesn't need a new widget. |

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

## Stretch goal — Full Unreal Editor replica

Aspirational only. Would require Phases 5-9 done + composite views (Outliner panel, full DetailsView with property-type machinery, Content Browser frame, Blueprint editor frame) + asset thumbnail system + viewport chrome.

Rough estimate if pursued: **3-6 months of focused work** for one person. Likely needs to become a separate project (`starship-editor-css` or similar) — at that point it's no longer a CSS framework, it's a UE-editor mockup site.

Decision deferred until after Phase 8 ships and we see whether real consumers ask for it.

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

## What this roadmap does NOT cover

- Build system, Sass/PostCSS pipeline, CI — see `package.json` and `.github/workflows/`.
- Conventions (class names, BEM, `:has()` rules, no-transition rule) — see `CLAUDE.md`.
- Visual verification workflow (Reflector snapshot → source → DOM diff) — see `CLAUDE.md` § "Visual fidelity workflow" and `tools/README.md`.
- Accessibility scope and exemptions — see `README.md` § "Accessibility".
- Storybook setup, addon configuration — see `notes/STORYBOOK_PLAN.md`.
- Audit findings and follow-ups — see `notes/AUDIT.md`.
