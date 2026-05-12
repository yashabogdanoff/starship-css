// `.ss-combo` — Slate SComboBox. Two variants:
//
//   .ss-combo                    Default text trigger (label + chevron).
//   .ss-combo.ss-combo--simple   Icon-only trigger (transparent, hover-fill).
//
// Closed-state stories render the trigger only. Open-state stories render
// the popover statically (inline `position: static; display: block`) so the
// content is visible without invoking the popover API. The popover toggle
// path itself is exercised in `docs/index.html`, not here — stories are
// for visual chrome regression.

import { ICONS } from "./_icons.js";

function closedTrigger({ label = "Label", simple = false, icon = null, disabled = false }) {
  const wrapCls = simple ? "ss-combo ss-combo--simple" : "ss-combo";
  const iconSlot = (simple || icon)
    ? `<span class="ss-combo__icon" aria-hidden="true">${icon || ICONS.box}</span>`
    : "";
  const labelSlot = simple ? "" : `<span class="ss-combo__label">${label}</span>`;
  return `
    <div class="${wrapCls}">
      <button class="ss-combo__trigger" type="button"
              ${disabled ? "disabled" : ""}
              aria-haspopup="listbox" aria-label="${label}">
        ${iconSlot}
        ${labelSlot}
        <span class="ss-combo__chevron" aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function openPopover({ options = ["Option A", "Option B", "Option C"], selectedIndex = -1 }) {
  const rows = options.map((label, i) => `
    <button class="ss-combo__option" role="option" type="button"
            ${i === selectedIndex ? 'aria-selected="true"' : ""}>${label}</button>
  `).join("");
  return `
    <div class="ss-popover ss-combo__menu" role="listbox"
         style="display: block; position: static; min-width: 160px;">
      ${rows}
    </div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Selectors/Combo",
  render: (args) => closedTrigger(args),
};

export default meta;

// ----- Closed (trigger only) ----------------------------------------------

export const Default = { args: { label: "Label" } };
export const WithSelection = { args: { label: "Pyramid" } };
export const Simple = { args: { simple: true, label: "Box" } };
export const Disabled = { args: { label: "Label", disabled: true } };

// ----- Trigger forced states ----------------------------------------------

export const HoverTrigger = {
  args: { label: "Label" },
  parameters: { pseudo: { hover: ".ss-combo__trigger" } },
};

export const FocusTrigger = {
  args: { label: "Label" },
  parameters: { pseudo: { focusVisible: ".ss-combo__trigger" } },
};

export const ActiveTrigger = {
  args: { label: "Label" },
  parameters: { pseudo: { active: ".ss-combo__trigger" } },
};

// ----- Open popover (rendered statically) ---------------------------------

export const Open = {
  render: () => `
    <div style="display: inline-flex; flex-direction: column; gap: 0;">
      ${closedTrigger({ label: "Label" })}
      ${openPopover({ options: ["Option A", "Option B", "Option C", "Option D"] })}
    </div>
  `,
};

export const OpenWithSelection = {
  render: () => `
    <div style="display: inline-flex; flex-direction: column; gap: 0;">
      ${closedTrigger({ label: "Option C" })}
      ${openPopover({
        options: ["Option A", "Option B", "Option C", "Option D"],
        selectedIndex: 2,
      })}
    </div>
  `,
};

export const OpenHoverOption = {
  parameters: { pseudo: { hover: '.ss-combo__option[data-state="hover"]' } },
  render: () => `
    <div style="display: inline-flex; flex-direction: column; gap: 0;">
      ${closedTrigger({ label: "Label" })}
      <div class="ss-popover ss-combo__menu" role="listbox"
           style="display: block; position: static; min-width: 160px;">
        <button class="ss-combo__option" role="option" type="button">Option A</button>
        <button class="ss-combo__option" role="option" type="button" data-state="hover">Option B</button>
        <button class="ss-combo__option" role="option" type="button">Option C</button>
        <button class="ss-combo__option" role="option" type="button">Option D</button>
      </div>
    </div>
  `,
};

export const LongList = {
  render: () => `
    <div style="display: inline-flex; flex-direction: column; gap: 0;">
      ${closedTrigger({ label: "Label" })}
      ${openPopover({
        options: Array.from({ length: 24 }, (_, i) => `Option ${String.fromCharCode(65 + (i % 26))} ${Math.floor(i / 26) + 1}`),
      })}
    </div>
  `,
};

// ----- Side-by-side state matrix ------------------------------------------

export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: {
      hover: '.ss-combo__trigger[data-state="hover"]',
      focusVisible: '.ss-combo__trigger[data-state="focus"]',
      active: '.ss-combo__trigger[data-state="active"]',
    },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content max-content max-content; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div></div><div>Default</div><div>Simple</div>

      <div>Normal</div>
      <div><div class="ss-combo"><button class="ss-combo__trigger" type="button" aria-haspopup="listbox">
        <span class="ss-combo__label">Label</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
      <div><div class="ss-combo ss-combo--simple"><button class="ss-combo__trigger" type="button" aria-haspopup="listbox" aria-label="Box">
        <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>

      <div>Hover</div>
      <div><div class="ss-combo"><button class="ss-combo__trigger" type="button" data-state="hover" aria-haspopup="listbox">
        <span class="ss-combo__label">Label</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
      <div><div class="ss-combo ss-combo--simple"><button class="ss-combo__trigger" type="button" data-state="hover" aria-haspopup="listbox" aria-label="Box">
        <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>

      <div>Focus</div>
      <div><div class="ss-combo"><button class="ss-combo__trigger" type="button" data-state="focus" aria-haspopup="listbox">
        <span class="ss-combo__label">Label</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
      <div><div class="ss-combo ss-combo--simple"><button class="ss-combo__trigger" type="button" data-state="focus" aria-haspopup="listbox" aria-label="Box">
        <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>

      <div>Active</div>
      <div><div class="ss-combo"><button class="ss-combo__trigger" type="button" data-state="active" aria-haspopup="listbox">
        <span class="ss-combo__label">Label</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
      <div><div class="ss-combo ss-combo--simple"><button class="ss-combo__trigger" type="button" data-state="active" aria-haspopup="listbox" aria-label="Box">
        <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>

      <div>Disabled</div>
      <div><div class="ss-combo"><button class="ss-combo__trigger" type="button" disabled aria-haspopup="listbox">
        <span class="ss-combo__label">Label</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
      <div><div class="ss-combo ss-combo--simple"><button class="ss-combo__trigger" type="button" disabled aria-haspopup="listbox" aria-label="Box">
        <span class="ss-combo__icon" aria-hidden="true">${ICONS.box}</span><span class="ss-combo__chevron" aria-hidden="true"></span>
      </button></div></div>
    </div>
  `,
};
