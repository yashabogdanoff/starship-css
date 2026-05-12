// `Gallery / Starship Widgets` — single-column interactive gallery.
//
// One row per widget: [ disable-checkbox ] [ label ] [ widget instance ].
// Tick the checkbox in column 1 and the widget on that row becomes disabled
// — the same row-cb → native `disabled` attribute sync the legacy
// `docs/index.html` uses, kept here as a tiny in-story QA shim. None of
// this paint logic belongs in `src/scss/` — it is gallery scaffolding only,
// allowed inline per the same rule that `docs/assets/gallery.css` follows
// for chrome-around-widgets.
//
// Inspired by UE's Starship Gallery → Widgets tab; not a port of
// `docs/index.html` (that file remains as a frozen public overview).
// Written from scratch around a clean grid: 24 px checkbox column, fixed
// label column, fluid widget column. No 2-column SGridPanel like UE has.
//
// Each section heading spans all three grid columns. Composite widgets
// (Toolbar, Tabs, Menubar, Progress) live in the same fluid third column;
// the widget cell is `1fr`, so the components grow with the page width.

import { ICONS } from "./_icons.js";

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Gallery",
  parameters: { layout: "padded" },
};

export default meta;

// ---------------------------------------------------------------------------
// Row helpers — return raw HTML strings. The render() function wires them
// into a real DOM tree and attaches the disable-sync handlers.
// ---------------------------------------------------------------------------

let _id = 0;
const nextId = (prefix) => `${prefix}-${++_id}`;

function rowMarkup({ label, widgetHtml, noDisable = false }) {
  // `display: contents` on the wrapper means it doesn't consume a grid
  // track; its three children flow into the parent grid's cells directly,
  // so we keep semantic grouping (per-row state) without breaking layout.
  //
  // `noDisable: true` swaps the checkbox cell for an empty spacer — used
  // for structural widgets where a "disabled" state doesn't make sense
  // (tabs, menubar, toolbar).
  const cbCell = noDisable
    ? `<span aria-hidden="true"></span>`
    : `<input type="checkbox" class="ss-checkbox ss-gallery-row__cb"
              aria-label="Disable ${label}">`;
  return `
    <div class="ss-gallery-row" style="display: contents;">
      ${cbCell}
      <div class="ss-gallery-row__label"
           style="font-family: var(--ss-font); font-size: 13px; color: var(--ss-foreground); user-select: none;">
        ${label}
      </div>
      <div class="ss-gallery-row__widget"
           style="display: flex; align-items: center; gap: 12px; min-width: 0;">
        ${widgetHtml}
      </div>
    </div>
  `;
}

function section(title) {
  return `
    <div style="grid-column: 1 / -1; margin-top: 18px; padding-bottom: 4px;
                border-bottom: 1px solid var(--ss-dropdown-outline);
                font-family: var(--ss-font); font-size: 11px;
                font-weight: var(--ss-weight-bold); text-transform: uppercase;
                letter-spacing: 0.06em; color: var(--ss-foreground-header);">
      ${title}
    </div>
  `;
}

// Markup snippets per widget — kept short so the render() body reads as
// a flat table-of-contents.

const BTN_DEFAULT  = `<button class="ss-btn">Cancel</button>`;
const BTN_PRIMARY  = `<button class="ss-btn ss-btn--primary">Save</button>`;
const BTN_SIMPLE   = `<button class="ss-btn ss-btn--simple">Label</button>`;
const BTN_WITHICON = `<button class="ss-btn ss-btn--primary"><span class="ss-btn__icon">${ICONS.box}</span>Spawn</button>`;
const BTN_ICONONLY = `<button class="ss-btn ss-btn--primary ss-btn--icon-only" aria-label="Box"><span class="ss-btn__icon">${ICONS.box}</span></button>`;
const BTN_TOGGLE   = `
  <label class="ss-btn ss-btn--toggle">
    <input type="checkbox" class="ss-toggle__input">
    Mute
  </label>
  <label class="ss-btn ss-btn--toggle">
    <input type="checkbox" class="ss-toggle__input" checked>
    Solo
  </label>
`;

const INPUT_TEXT  = `<input class="ss-input" type="text" value="Cube_42" aria-label="Text input">`;
const INPUT_READ  = `<input class="ss-input" type="text" value="Read-only value" readonly aria-label="Read-only input">`;
const INPUT_BARE  = `<input class="ss-input ss-input--bare" type="text" value="Click to focus" aria-label="Bare input">`;
const TEXTAREA    = `<textarea class="ss-textarea" rows="3" aria-label="Multi-line text"
                       style="width: 280px;">Multi-line editable text. Resizes naturally; tab inserts a line break.</textarea>`;

const SEARCH = `
  <div class="ss-search" style="width: 260px;">
    <span class="ss-search__icon" aria-hidden="true"></span>
    <input class="ss-input" type="search" placeholder="Search" aria-label="Search">
  </div>
`;

const INLINE_EDIT = `<span class="ss-inline-edit" data-inline-edit>Double-click to edit me</span>`;

const CHECK_UNCHECKED     = `<input type="checkbox" class="ss-checkbox" aria-label="Unchecked sample">`;
const CHECK_CHECKED       = `<input type="checkbox" class="ss-checkbox" checked aria-label="Checked sample">`;
const CHECK_INDETERMINATE = `<input type="checkbox" class="ss-checkbox" data-indeterminate aria-label="Indeterminate sample">`;

function radioGroup() {
  const n = nextId("gallery-radio");
  return `
    <div role="radiogroup" aria-label="Radio sample" style="display: inline-flex; gap: 8px; align-items: center;">
      <input class="ss-radio" type="radio" name="${n}" aria-label="A">
      <input class="ss-radio" type="radio" name="${n}" checked aria-label="B">
      <input class="ss-radio" type="radio" name="${n}" aria-label="C">
    </div>
  `;
}

function segmented(alt = false) {
  const n = nextId("gallery-seg");
  const cls = alt ? "ss-segmented ss-segmented--alt" : "ss-segmented";
  if (alt) {
    return `
      <div class="${cls}" role="radiogroup" aria-label="Shape (icons)">
        <input type="radio" name="${n}" id="${n}-box" checked>
        <label for="${n}-box" class="ss-segmented__option" aria-label="Box"><span class="ss-segmented__icon">${ICONS.box}</span></label>
        <input type="radio" name="${n}" id="${n}-cyl">
        <label for="${n}-cyl" class="ss-segmented__option" aria-label="Cylinder"><span class="ss-segmented__icon">${ICONS.cylinder}</span></label>
        <input type="radio" name="${n}" id="${n}-pyr">
        <label for="${n}-pyr" class="ss-segmented__option" aria-label="Pyramid"><span class="ss-segmented__icon">${ICONS.pyramid}</span></label>
        <input type="radio" name="${n}" id="${n}-sph">
        <label for="${n}-sph" class="ss-segmented__option" aria-label="Sphere"><span class="ss-segmented__icon">${ICONS.globe}</span></label>
      </div>
    `;
  }
  return `
    <div class="${cls}" role="radiogroup" aria-label="Shape">
      <input type="radio" name="${n}" id="${n}-box" checked>
      <label for="${n}-box" class="ss-segmented__option"><span class="ss-segmented__icon">${ICONS.box}</span>Box</label>
      <input type="radio" name="${n}" id="${n}-cyl">
      <label for="${n}-cyl" class="ss-segmented__option"><span class="ss-segmented__icon">${ICONS.cylinder}</span>Cylinder</label>
      <input type="radio" name="${n}" id="${n}-pyr">
      <label for="${n}-pyr" class="ss-segmented__option"><span class="ss-segmented__icon">${ICONS.pyramid}</span>Pyramid</label>
      <input type="radio" name="${n}" id="${n}-sph">
      <label for="${n}-sph" class="ss-segmented__option"><span class="ss-segmented__icon">${ICONS.globe}</span>Sphere</label>
    </div>
  `;
}

const SLIDER  = `<input class="ss-slider" type="range" min="0" max="100" value="50" aria-label="Slider"
                        style="width: 220px;">`;

function spinbox({ value = 250, min = 0, max = 500, minSlider = -500, maxSlider = 500, noSpin = false } = {}) {
  const cls = noSpin ? "ss-numeric ss-numeric--no-spin" : "ss-numeric ss-numeric--filled";
  const fill = noSpin ? "" : `<div class="ss-numeric__fill"></div>`;
  return `
    <div class="${cls}"
         data-num-min="${min}" data-num-max="${max}"
         data-num-min-slider="${minSlider}" data-num-max-slider="${maxSlider}"
         data-num-value="${value}"
         style="width: 220px;">
      ${fill}
      <input class="ss-numeric__input" type="text" aria-label="Numeric">
    </div>
  `;
}

function combo({ label = "Cube", simple = false } = {}) {
  const id = nextId("gallery-combo");
  if (simple) {
    return `
      <div class="ss-combo ss-combo--simple">
        <button class="ss-combo__trigger" type="button"
                data-popover-target="${id}"
                aria-haspopup="listbox" aria-label="Pick shape">
          <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span>
          <span class="ss-combo__chevron" aria-hidden="true"></span>
        </button>
      </div>
      <div class="ss-popover ss-combo__menu" role="listbox" popover="manual" id="${id}">
        <button class="ss-combo__option" role="option" type="button" aria-selected="true">Box</button>
        <button class="ss-combo__option" role="option" type="button">Cylinder</button>
        <button class="ss-combo__option" role="option" type="button">Pyramid</button>
        <button class="ss-combo__option" role="option" type="button">Sphere</button>
      </div>
    `;
  }
  return `
    <div class="ss-combo" style="min-width: 140px;">
      <button class="ss-combo__trigger" type="button"
              data-popover-target="${id}"
              aria-haspopup="listbox">
        <span class="ss-combo__label">${label}</span>
        <span class="ss-combo__chevron" aria-hidden="true"></span>
      </button>
    </div>
    <div class="ss-popover ss-combo__menu" role="listbox" popover="manual" id="${id}">
      <button class="ss-combo__option" role="option" type="button" aria-selected="true">Cube</button>
      <button class="ss-combo__option" role="option" type="button">Cylinder</button>
      <button class="ss-combo__option" role="option" type="button">Pyramid</button>
      <button class="ss-combo__option" role="option" type="button">Sphere</button>
    </div>
  `;
}

function menubar() {
  const a = nextId("gallery-mb");
  const b = nextId("gallery-mb");
  const sub = nextId("gallery-mb-sub");
  return `
    <nav class="ss-menubar" aria-label="Sample menubar">
      <button class="ss-menubar__item" type="button" data-popover-target="${a}" aria-haspopup="menu" aria-expanded="false">File</button>
      <button class="ss-menubar__item" type="button" data-popover-target="${b}" aria-haspopup="menu" aria-expanded="false">Edit</button>
    </nav>
    <div class="ss-popover ss-menu" role="menu" popover="manual" id="${a}" style="width: 200px;">
      <div class="ss-menu__heading">File</div>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">New</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Open…</span></button>
      <div class="ss-menu__separator"></div>
      <button class="ss-menu__entry" role="menuitem" type="button"
              data-popover-target="${sub}"
              aria-haspopup="menu" aria-expanded="false">
        <span class="ss-menu__icon"></span>
        <span class="ss-menu__label">Recent</span>
        <span class="ss-menu__chevron" aria-hidden="true"></span>
      </button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Save</span></button>
      <div class="ss-popover ss-menu ss-menu--submenu" role="menu" popover="manual" id="${sub}" style="width: 220px;">
        <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Cube_42.uasset</span></button>
        <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Pyramid_07.uasset</span></button>
        <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Sphere_03.uasset</span></button>
      </div>
    </div>
    <div class="ss-popover ss-menu" role="menu" popover="manual" id="${b}" style="width: 200px;">
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Undo</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Redo</span></button>
      <div class="ss-menu__separator"></div>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Cut</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Copy</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Paste</span></button>
    </div>
  `;
}

function toolbar() {
  const dropdownId = nextId("gallery-tb");
  const splitOptId = nextId("gallery-tb");
  return `
    <div class="ss-toolbar" role="toolbar" aria-label="Sample toolbar" style="width: 100%;">
      <button class="ss-toolbar__btn" type="button">
        <span class="ss-toolbar__icon">${ICONS.box}</span>
        <span class="ss-toolbar__label">Add</span>
      </button>
      <button class="ss-toolbar__btn ss-toolbar__btn--toggle" type="button" aria-pressed="true">
        <span class="ss-toolbar__icon">${ICONS.cylinder}</span>
        <span class="ss-toolbar__label">Snap</span>
      </button>
      <button class="ss-toolbar__combo" type="button"
              data-popover-target="${dropdownId}"
              aria-haspopup="menu" aria-expanded="false">
        <span class="ss-toolbar__icon">${ICONS.pyramid}</span>
        <span class="ss-toolbar__label">Modes</span>
        <span class="ss-toolbar__chevron" aria-hidden="true"></span>
      </button>
      <div class="ss-toolbar__sep" aria-hidden="true"></div>
      <div class="ss-toolbar__split">
        <button class="ss-toolbar__split-btn" type="button">
          <span class="ss-toolbar__icon">${ICONS.globe}</span>
          <span class="ss-toolbar__label">Build</span>
        </button>
        <button class="ss-toolbar__split-options" type="button"
                data-popover-target="${splitOptId}"
                aria-haspopup="menu" aria-expanded="false" aria-label="Build options">
          <span class="ss-toolbar__ellipsis" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <div class="ss-popover ss-menu" role="menu" popover="manual" id="${dropdownId}" style="width: 180px;">
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Wireframe</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Unlit</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Lit</span></button>
    </div>
    <div class="ss-popover ss-menu" role="menu" popover="manual" id="${splitOptId}" style="width: 180px;">
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Build Lighting Only</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Build Reflections</span></button>
      <button class="ss-menu__entry" role="menuitem" type="button"><span class="ss-menu__icon"></span><span class="ss-menu__label">Build All Levels</span></button>
    </div>
  `;
}

function tabs() {
  const grp = nextId("gallery-tabs");
  return `
    <div class="ss-tabs" style="width: 100%;">
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-1" checked>
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-2">
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-3">
      <div class="ss-tab-well">
        <label for="${grp}-1" class="ss-tab">
          <span class="ss-tab__icon">${ICONS.box}</span>
          <span class="ss-tab__label">Viewport</span>
          <button class="ss-tab__close" type="button" aria-label="Close"></button>
        </label>
        <label for="${grp}-2" class="ss-tab">
          <span class="ss-tab__icon">${ICONS.pyramid}</span>
          <span class="ss-tab__label">Outliner</span>
          <button class="ss-tab__close" type="button" aria-label="Close"></button>
        </label>
        <label for="${grp}-3" class="ss-tab">
          <span class="ss-tab__icon">${ICONS.globe}</span>
          <span class="ss-tab__label">Details</span>
          <button class="ss-tab__close" type="button" aria-label="Close"></button>
        </label>
      </div>
      <section class="ss-tab-panel">
        <div style="padding: 16px; color: var(--ss-foreground); font-size: 13px;">Viewport tab content.</div>
      </section>
      <section class="ss-tab-panel">
        <div style="padding: 16px; color: var(--ss-foreground); font-size: 13px;">Outliner tab content.</div>
      </section>
      <section class="ss-tab-panel">
        <div style="padding: 16px; color: var(--ss-foreground); font-size: 13px;">Details tab content.</div>
      </section>
    </div>
  `;
}

function tabsMinor() {
  const grp = nextId("gallery-tabs-m");
  return `
    <div class="ss-tabs" style="width: 100%;">
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-1" checked>
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-2">
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-3">
      <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-4">
      <div class="ss-tab-well">
        <label for="${grp}-1" class="ss-tab ss-tab--minor"><span class="ss-tab__label">Overview</span></label>
        <label for="${grp}-2" class="ss-tab ss-tab--minor"><span class="ss-tab__label">Materials</span></label>
        <label for="${grp}-3" class="ss-tab ss-tab--minor"><span class="ss-tab__label">Physics</span></label>
        <label for="${grp}-4" class="ss-tab ss-tab--minor"><span class="ss-tab__label">Rendering</span></label>
      </div>
      <section class="ss-tab-panel ss-tab-panel--minor">
        <div style="padding: 12px; color: var(--ss-foreground); font-size: 13px;">Overview content.</div>
      </section>
      <section class="ss-tab-panel ss-tab-panel--minor">
        <div style="padding: 12px; color: var(--ss-foreground); font-size: 13px;">Materials content.</div>
      </section>
      <section class="ss-tab-panel ss-tab-panel--minor">
        <div style="padding: 12px; color: var(--ss-foreground); font-size: 13px;">Physics content.</div>
      </section>
      <section class="ss-tab-panel ss-tab-panel--minor">
        <div style="padding: 12px; color: var(--ss-foreground); font-size: 13px;">Rendering content.</div>
      </section>
    </div>
  `;
}

const PROGRESS_50      = `<div class="ss-progress" style="width: 220px;" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><div class="ss-progress__bar" style="width: 50%;"></div></div>`;
const PROGRESS_MARQUEE = `<div class="ss-progress ss-progress--marquee" style="width: 220px;" role="progressbar" aria-busy="true"></div>`;

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export const StarshipWidgets = {
  name: "Starship Widgets",
  parameters: { layout: "padded" },
  render: () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="ss-gallery"
           style="display: grid;
                  grid-template-columns: 24px 200px 1fr;
                  gap: 14px 20px;
                  align-items: center;
                  max-width: 760px;
                  padding: 16px 8px;
                  font-family: var(--ss-font);
                  color: var(--ss-foreground);">

        ${section("Buttons")}
        ${rowMarkup({ label: "Default Button",   widgetHtml: BTN_DEFAULT  })}
        ${rowMarkup({ label: "Primary Button",   widgetHtml: BTN_PRIMARY  })}
        ${rowMarkup({ label: "Simple Button",    widgetHtml: BTN_SIMPLE   })}
        ${rowMarkup({ label: "With Icon",        widgetHtml: BTN_WITHICON })}
        ${rowMarkup({ label: "Icon-only",        widgetHtml: BTN_ICONONLY })}
        ${rowMarkup({ label: "Toggle (CSS-only)", widgetHtml: BTN_TOGGLE  })}

        ${section("Text inputs")}
        ${rowMarkup({ label: "Input",         widgetHtml: INPUT_TEXT  })}
        ${rowMarkup({ label: "Read-only",     widgetHtml: INPUT_READ  })}
        ${rowMarkup({ label: "Bare",          widgetHtml: INPUT_BARE  })}
        ${rowMarkup({ label: "Textarea",      widgetHtml: TEXTAREA    })}
        ${rowMarkup({ label: "Search",        widgetHtml: SEARCH      })}
        ${rowMarkup({ label: "Inline-edit",   widgetHtml: INLINE_EDIT })}

        ${section("Selectors")}
        ${rowMarkup({ label: "Checkbox",          widgetHtml: CHECK_UNCHECKED })}
        ${rowMarkup({ label: "Checkbox checked",  widgetHtml: CHECK_CHECKED })}
        ${rowMarkup({ label: "Checkbox indeterminate", widgetHtml: CHECK_INDETERMINATE })}
        ${rowMarkup({ label: "Radio group",       widgetHtml: radioGroup() })}
        ${rowMarkup({ label: "Segmented",         widgetHtml: segmented() })}
        ${rowMarkup({ label: "Segmented (icons)", widgetHtml: segmented(true) })}
        ${rowMarkup({ label: "Slider",            widgetHtml: SLIDER })}
        ${rowMarkup({ label: "SpinBox (0–500)",   widgetHtml: spinbox({ value: 250 }) })}
        ${rowMarkup({ label: "NumericEntryBox",   widgetHtml: spinbox({ value: 500, min: -1000, max: 1000 }) })}
        ${rowMarkup({ label: "No-spin Numeric",   widgetHtml: spinbox({ value: 0, noSpin: true }) })}
        ${rowMarkup({ label: "Combo",             widgetHtml: combo({ label: "Cube" }) })}
        ${rowMarkup({ label: "Combo (icon-only)", widgetHtml: combo({ simple: true }) })}

        ${section("Containers")}
        ${rowMarkup({ label: "Menubar",     widgetHtml: menubar(),   noDisable: true })}
        ${rowMarkup({ label: "Toolbar",     widgetHtml: toolbar(),   noDisable: true })}
        ${rowMarkup({ label: "Tabs",        widgetHtml: tabs(),      noDisable: true })}
        ${rowMarkup({ label: "Tabs (minor)", widgetHtml: tabsMinor(), noDisable: true })}

        ${section("Feedback")}
        ${rowMarkup({ label: "Progress (50%)",   widgetHtml: PROGRESS_50 })}
        ${rowMarkup({ label: "Progress (marquee)", widgetHtml: PROGRESS_MARQUEE })}
      </div>
    `;

    // QA-shim: row-cb → native `disabled` attribute sync on every form
    // control in the same row. Mirrors the legacy docs/index.html behaviour
    // so the gallery's disable column drives the framework's own
    // `:disabled` / `[aria-disabled]` rules — no gallery-side disabled
    // paint. Same rule, same selectors.
    function syncDisabled(cb) {
      const row = cb.closest(".ss-gallery-row");
      const cell = row.querySelector(".ss-gallery-row__widget");
      const on = cb.checked;

      // Form controls — native disabled. Skip the row's own checkbox (it
      // lives outside `.ss-gallery-row__widget`, but be defensive).
      cell.querySelectorAll("button, input, textarea, select").forEach((el) => {
        if (el === cb) return;
        el.disabled = on;
      });

      // Spans / divs that signal disabled via aria-disabled — inline-edit,
      // progress bar, menu entries (when their popover is open in disabled
      // state). For inline-edit the framework's `initInlineEditables`
      // checks `aria-disabled="true"` to block the dblclick → edit gesture.
      cell.querySelectorAll("[data-inline-edit], .ss-progress").forEach((el) => {
        if (on) el.setAttribute("aria-disabled", "true");
        else    el.removeAttribute("aria-disabled");
      });

      // Menu / menubar / toolbar items are <button>s — covered by the
      // first selector above.
    }

    root.querySelectorAll(".ss-gallery-row__cb").forEach((cb) => {
      cb.addEventListener("change", () => syncDisabled(cb));
    });

    // QA-shim: native `[indeterminate]` is a JS-only property — set it
    // after the input lands in the DOM.
    root.querySelectorAll('input[data-indeterminate]').forEach((el) => {
      queueMicrotask(() => { el.indeterminate = true; });
    });

    return root;
  },
};
