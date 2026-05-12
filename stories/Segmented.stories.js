// `.ss-segmented` — Slate's SSegmentedControl. Radio-hack: `<input type="radio">`
// + `<label class="ss-segmented__option">` pairs. The `.ss-segmented--alt`
// modifier is the icon-only variant (32×22 segments).
//
// Parent-state via `:has()` — `.ss-segmented:has(> input:disabled)` repaints
// the entire group when ANY child input is disabled. The Disabled story
// verifies that rule lives in `src/scss/` (CLAUDE.md "Where widget logic
// lives" strict rule).

import { ICONS } from "./_icons.js";

let groupCounter = 0;
function newName() { return `ss-seg-grp-${++groupCounter}`; }

function segment({ name, value, label, icon, checked, disabled }) {
  const id = `${name}-${value}`;
  const ariaLabel = label ? "" : `aria-label="${value}"`;
  return `
    <input id="${id}" type="radio" name="${name}"
           ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
    <label for="${id}" class="ss-segmented__option" ${ariaLabel}>
      ${icon ? `<span class="ss-segmented__icon">${icon}</span>` : ""}
      ${label || ""}
    </label>
  `;
}

function defaultSegmented({ alt = false, disabled = false } = {}) {
  const name = newName();
  const cls = alt ? "ss-segmented ss-segmented--alt" : "ss-segmented";
  const labelMode = !alt;
  return `
    <div class="${cls}" role="radiogroup" aria-label="Shape">
      ${segment({ name, value: "box", label: labelMode ? "Box" : null, icon: ICONS.box, checked: !alt, disabled })}
      ${segment({ name, value: "cyl", label: labelMode ? "Cylinder" : null, icon: ICONS.cylinder, disabled })}
      ${segment({ name, value: "pyr", label: labelMode ? "Pyramid" : null, icon: ICONS.pyramid, checked: alt, disabled })}
      ${segment({ name, value: "sph", label: labelMode ? "Sphere" : null, icon: ICONS.globe, disabled })}
    </div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Segmented",
  argTypes: {
    alt: { control: "boolean", description: "Icon-only variant" },
    disabled: { control: "boolean", description: "Disable all segments (triggers parent-state :has() rule)" },
  },
  render: (args) => defaultSegmented(args),
};

export default meta;

export const Default = { args: {} };
export const Alt = { args: { alt: true } };
export const Disabled = { args: { disabled: true } };
export const AltDisabled = { args: { alt: true, disabled: true } };

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 1fr; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Default</div>
      <div>${defaultSegmented({})}</div>

      <div>Disabled<br><span style="color: var(--ss-white-25); font-size: 10px;">(parent :has)</span></div>
      <div>${defaultSegmented({ disabled: true })}</div>

      <div>Alt (icon-only)</div>
      <div>${defaultSegmented({ alt: true })}</div>

      <div>Alt disabled</div>
      <div>${defaultSegmented({ alt: true, disabled: true })}</div>
    </div>
  `,
};
