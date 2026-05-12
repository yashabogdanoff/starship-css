// `Foundations/Colors` — palette catalog for the 45 UE Slate `EStyleColor`
// tokens we mirror, grouped by the editor's own semantic sections.
//
// Each swatch resolves its computed value live via `getComputedStyle`, so if
// a consumer overrides a token in `:root`, the displayed hex updates without
// recompiling Storybook.
//
// Reference: tmp/Dark.json (UE Editor Preferences → Themes → Export). All
// 44 of UE's non-User EStyleColor entries map bit-exact to our tokens
// (White25 differs only in CSS formatting, not value).

const GROUPS = [
  {
    title: "Surfaces",
    desc: "Window chrome, panel backgrounds, input fields. Order roughly darkest → lightest.",
    swatches: [
      ["ss-background",      "Window canvas"],
      ["ss-title",           "Title bar"],
      ["ss-window-border",   "Window chrome outline"],
      ["ss-foldout",         "Collapsible region bg"],
      ["ss-input",           "Input field bg"],
      ["ss-input-outline",   "Input field border"],
      ["ss-recessed",        "Inset / nested panel"],
      ["ss-panel",           "Standard panel surface"],
      ["ss-header",          "Section header strip"],
      ["ss-dropdown",        "Dropdown / combo bg"],
      ["ss-dropdown-outline","Dropdown / combo border"],
      ["ss-hover",           "Hover tint"],
      ["ss-hover-2",         "Stronger hover tint"],
      ["ss-secondary",       "Default button bg"],
    ],
  },
  {
    title: "Foreground",
    desc: "Text and icon colours. Hover always reads brighter than idle.",
    swatches: [
      ["ss-foreground",          "Idle body text"],
      ["ss-foreground-hover",    "Active / hover text (white)"],
      ["ss-foreground-inverted", "Text on light surface"],
      ["ss-foreground-header",   "Section header text"],
    ],
  },
  {
    title: "Primary",
    desc: "Brand blue family. Used for selection, focus, marquee progress, toggle-pressed.",
    swatches: [
      ["ss-highlight",     "Synonym for Primary"],
      ["ss-primary",       "Brand / active state"],
      ["ss-primary-hover", "Primary hover"],
      ["ss-primary-press", "Primary pressed"],
    ],
  },
  {
    title: "Select",
    desc: "Selection-state tints for lists, tree rows, content browser items.",
    swatches: [
      ["ss-select",          "Active selection fill / ring"],
      ["ss-select-inactive", "Selection when panel unfocused"],
      ["ss-select-parent",   "Parent-of-selected row tint"],
      ["ss-select-hover",    "Hover over a selectable row"],
    ],
  },
  {
    title: "Accents",
    desc: "Categorical hues for tags, syntax tokens, content-browser asset types.",
    swatches: [
      ["ss-accent-blue",   "Blue accent"],
      ["ss-accent-purple", "Purple accent"],
      ["ss-accent-pink",   "Pink accent"],
      ["ss-accent-red",    "Red accent"],
      ["ss-accent-orange", "Orange accent"],
      ["ss-accent-yellow", "Yellow accent"],
      ["ss-accent-green",  "Green accent"],
      ["ss-accent-brown",  "Brown accent"],
      ["ss-accent-black",  "Black accent (panel-ish)"],
      ["ss-accent-gray",   "Gray accent"],
      ["ss-accent-white",  "White accent"],
      ["ss-accent-folder", "Folder accent"],
    ],
  },
  {
    title: "Status",
    desc: "Feedback colours for notifications, warnings, errors, success states.",
    swatches: [
      ["ss-warning",       "Warning state (amber)"],
      ["ss-error",         "Error state (red)"],
      ["ss-success",       "Success state (green)"],
      ["ss-notifications", "Notification chrome"],
    ],
  },
  {
    title: "Neutral",
    desc: "Pure tones and translucent overlays.",
    swatches: [
      ["ss-black",    "Pure black"],
      ["ss-white",    "Pure white"],
      ["ss-white-25", "25% white (separators / muted strokes)"],
    ],
  },
];

// Convert any computed CSS color string to a normalised hex / rgba string
// suitable for display (handles rgb(), rgba(), #hex, named colours).
function colorToDisplayHex(input) {
  if (!input) return "";
  // CSS already returns "rgb(R, G, B)" or "rgba(R, G, B, A)" for getComputedStyle.
  const rgb = input.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (!rgb) return input.trim();
  const [, r, g, b, a] = rgb;
  const hex = "#" + [r, g, b].map((c) =>
    Math.round(parseFloat(c)).toString(16).padStart(2, "0").toUpperCase()
  ).join("");
  if (a !== undefined && parseFloat(a) < 1) {
    const pct = Math.round(parseFloat(a) * 100);
    return `${hex} · ${pct}%`;
  }
  return hex;
}

function swatchNode([token, desc]) {
  const cell = document.createElement("div");
  cell.style.cssText = "display: flex; flex-direction: column; gap: 6px; font-family: var(--ss-font); font-size: 11px;";
  cell.innerHTML = `
    <div data-swatch
         style="height: 64px;
                background: var(--${token});
                border: 1px solid var(--ss-dropdown-outline);
                border-radius: var(--ss-radius);"></div>
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 6px;">
      <code style="font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
                   font-size: 10.5px;
                   color: var(--ss-foreground-hover);
                   background: var(--ss-input);
                   padding: 1px 5px;
                   border: 1px solid var(--ss-input-outline);
                   border-radius: 2px;">--${token}</code>
      <span data-hex
            style="color: var(--ss-foreground);
                   font-family: ui-monospace, monospace;
                   font-size: 10px;
                   letter-spacing: 0.02em;"></span>
    </div>
    <div style="color: var(--ss-foreground); font-size: 10.5px; line-height: 1.4;">${desc}</div>
  `;
  // Resolve computed hex post-mount.
  queueMicrotask(() => {
    const swatch = cell.querySelector("[data-swatch]");
    const hexEl = cell.querySelector("[data-hex]");
    if (swatch && hexEl) {
      const cs = getComputedStyle(swatch).backgroundColor;
      hexEl.textContent = colorToDisplayHex(cs);
    }
  });
  return cell;
}

function groupNode({ title, desc, swatches }) {
  const section = document.createElement("section");
  section.style.cssText = "margin-bottom: 32px;";

  const heading = document.createElement("div");
  heading.style.cssText = "margin-bottom: 12px;";
  heading.innerHTML = `
    <h3 style="margin: 0 0 4px;
               font-family: var(--ss-font);
               font-size: var(--ss-font-size-sm);
               font-weight: var(--ss-weight-bold);
               text-transform: uppercase;
               letter-spacing: 0.06em;
               color: var(--ss-foreground-header);">${title}</h3>
    <p style="margin: 0;
              font-family: var(--ss-font);
              font-size: 11px;
              color: var(--ss-foreground);
              max-width: 700px;
              line-height: 1.4;">${desc}</p>
  `;

  const grid = document.createElement("div");
  grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;";
  swatches.forEach((s) => grid.appendChild(swatchNode(s)));

  section.appendChild(heading);
  section.appendChild(grid);
  return section;
}

function renderAll(groups) {
  const root = document.createElement("div");
  root.style.cssText = "padding: 16px;";
  groups.forEach((g) => root.appendChild(groupNode(g)));
  return root;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Foundations/Colors",
  parameters: { layout: "padded" },
};

export default meta;

function group(title) {
  return GROUPS.find((g) => g.title === title);
}

// Full catalog — scroll through all 45 UE Dark tokens by group.
export const All = { render: () => renderAll(GROUPS) };

// Focused single-group stories for inspection.
export const Surfaces   = { render: () => renderAll([group("Surfaces")]) };
export const Foreground = { render: () => renderAll([group("Foreground")]) };
export const Primary    = { render: () => renderAll([group("Primary")]) };
export const Select     = { render: () => renderAll([group("Select")]) };
export const Accents    = { render: () => renderAll([group("Accents")]) };
export const Status     = { render: () => renderAll([group("Status")]) };
export const Neutral    = { render: () => renderAll([group("Neutral")]) };
