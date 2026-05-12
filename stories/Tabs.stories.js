// `.ss-tabs` — radio-hack tabs (no JS for activation; only close-buttons
// need JS via `initTabs`). Stories cover the 16-tab limit baked into
// `_tabs.scss:245-287` `@for $i from 1 through 16`. Tabs above index 16
// silently fail to activate — `TooMany` story makes that visible.
//
// Variants:
//   .ss-tab          Major tab (Slate's SDockTab default).
//   .ss-tab--minor   Minor tab (sub-navigation inside a major panel).
//
// Each story uses a unique `name` for the radio group so multiple tab
// strips can coexist on one page without state collision.

import { ICONS } from "./_icons.js";

let groupCounter = 0;
function newGroup() { return `ss-tabs-grp-${++groupCounter}`; }

function tabs({ count = 4, minor = false, withIcons = false, activeIndex = 0, width = 480 }) {
  const grp = newGroup();
  const tabClass = minor ? "ss-tab ss-tab--minor" : "ss-tab";
  const panelClass = minor ? "ss-tab-panel ss-tab-panel--minor" : "ss-tab-panel";

  const inputs = Array.from({ length: count }, (_, i) => `
    <input class="ss-tabs__input" type="radio" name="${grp}" id="${grp}-${i}"
           ${i === activeIndex ? "checked" : ""}>
  `).join("");

  const labels = Array.from({ length: count }, (_, i) => `
    <label for="${grp}-${i}" class="${tabClass}">
      ${withIcons ? `<span class="ss-tab__icon">${ICONS.box}</span>` : ""}
      <span class="ss-tab__label">Tab ${i + 1}</span>
      ${minor ? "" : `<button class="ss-tab__close" type="button" aria-label="Close"></button>`}
    </label>
  `).join("");

  const panels = Array.from({ length: count }, (_, i) => `
    <section class="${panelClass}">
      <div style="padding: 16px; color: var(--ss-foreground); font-size: 13px;">
        Tab ${i + 1} content
      </div>
    </section>
  `).join("");

  return `
    <div class="ss-tabs" style="width: ${width}px;">
      ${inputs}
      <div class="ss-tab-well">${labels}</div>
      ${panels}
    </div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Containers/Tabs",
  argTypes: {
    count: { control: { type: "range", min: 1, max: 32, step: 1 } },
    activeIndex: { control: "number" },
    withIcons: { control: "boolean" },
    minor: { control: "boolean", description: "`.ss-tab--minor` (sub-nav)" },
    width: { control: { type: "range", min: 200, max: 1600, step: 20 } },
  },
  render: (args) => tabs(args),
};

export default meta;

export const Default = {
  args: { count: 4, withIcons: true, activeIndex: 0, width: 480 },
};

export const Two = { render: () => tabs({ count: 2, withIcons: true }) };
export const Four = { render: () => tabs({ count: 4, withIcons: true }) };
export const Eight = { render: () => tabs({ count: 8, withIcons: true, width: 720 }) };
export const Sixteen = { render: () => tabs({ count: 16, withIcons: false, width: 1280 }) };

// `@for $i from 1 through 16` in _tabs.scss caps at 16 — the 17th tab's
// label click doesn't activate the panel. Story below makes this visible.
export const TooMany = {
  render: () => tabs({ count: 18, withIcons: false, width: 1400 }),
};

// Minor (sub-tabs inside a major panel) — no close-button, smaller padding.
export const Minor = { render: () => tabs({ count: 5, minor: true }) };

export const MinorMany = { render: () => tabs({ count: 8, minor: true, width: 720 }) };

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content; gap: 24px; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Major (2 tabs)</div>
      <div>${tabs({ count: 2, withIcons: true, width: 360 })}</div>

      <div>Major (4 tabs)</div>
      <div>${tabs({ count: 4, withIcons: true, width: 480 })}</div>

      <div>Minor (4 tabs)</div>
      <div>${tabs({ count: 4, minor: true, width: 360 })}</div>

      <div>Without icons</div>
      <div>${tabs({ count: 3, withIcons: false, width: 320 })}</div>
    </div>
  `,
};
