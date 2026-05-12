// `.ss-toolbar` — Slate SHorizontalToolBar. Holds buttons, toggle buttons,
// dropdown combos, split-buttons (button + caret-options), separators, and
// settings regions. JS init: `.ss-toolbar__btn--toggle` flips aria-pressed
// (`initToggleButtons`); `.ss-toolbar__combo` and `.ss-toolbar__split-options`
// open menus via `data-popover-target` (`initPopovers`).

import { ICONS } from "./_icons.js";

function tbBtn({ label = "Button", toggle = false, pressed = false, disabled = false, icon = ICONS.box }) {
  const cls = toggle ? "ss-toolbar__btn ss-toolbar__btn--toggle" : "ss-toolbar__btn";
  const attrs = [
    toggle ? `aria-pressed="${pressed ? "true" : "false"}"` : "",
    disabled ? "disabled" : "",
  ].filter(Boolean).join(" ");
  return `
    <button class="${cls}" type="button" ${attrs}>
      <span class="ss-toolbar__icon">${icon}</span>
      <span class="ss-toolbar__label">${label}</span>
    </button>
  `;
}

function tbCombo({ label = "Dropdown", disabled = false }) {
  return `
    <button class="ss-toolbar__combo" type="button"
            ${disabled ? "disabled" : ""}
            aria-haspopup="menu" aria-expanded="false">
      <span class="ss-toolbar__icon">${ICONS.box}</span>
      <span class="ss-toolbar__label">${label}</span>
      <span class="ss-toolbar__chevron" aria-hidden="true"></span>
    </button>
  `;
}

function tbSplit({ label = "Button", toggle = false, pressed = false, disabled = false }) {
  const btnCls = toggle
    ? "ss-toolbar__split-btn ss-toolbar__split-btn--toggle"
    : "ss-toolbar__split-btn";
  const btnAttrs = [
    toggle ? `aria-pressed="${pressed ? "true" : "false"}"` : "",
    disabled ? "disabled" : "",
  ].filter(Boolean).join(" ");
  return `
    <div class="ss-toolbar__split">
      <button class="${btnCls}" type="button" ${btnAttrs}>
        <span class="ss-toolbar__icon">${ICONS.box}</span>
        <span class="ss-toolbar__label">${label}</span>
      </button>
      <button class="ss-toolbar__split-options" type="button"
              ${disabled ? "disabled" : ""}
              aria-haspopup="menu" aria-expanded="false" aria-label="Options">
        <span class="ss-toolbar__ellipsis" aria-hidden="true"></span>
      </button>
    </div>
  `;
}

const SEP = `<div class="ss-toolbar__sep" aria-hidden="true"></div>`;

function toolbar({ children, width = 496 }) {
  return `
    <div class="ss-toolbar" role="toolbar" aria-label="Toolbar"
         style="width: ${width}px;">${children}</div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Containers/Toolbar",
};

export default meta;

export const Default = {
  render: () => toolbar({
    children: [
      tbBtn({ label: "Button" }),
      tbBtn({ label: "Toggle", toggle: true, pressed: true }),
      tbCombo({ label: "Dropdown" }),
      SEP,
      tbSplit({ label: "Button" }),
      tbSplit({ label: "Toggle", toggle: true, pressed: true }),
    ].join(""),
  }),
};

export const ButtonsOnly = {
  render: () => toolbar({
    width: 264,
    children: [
      tbBtn({ label: "New" }),
      tbBtn({ label: "Open" }),
      tbBtn({ label: "Save" }),
    ].join(""),
  }),
};

export const WithDropdown = {
  render: () => toolbar({
    width: 200,
    children: tbCombo({ label: "Insert" }),
  }),
};

export const SplitButtons = {
  render: () => toolbar({
    width: 220,
    children: [
      tbSplit({ label: "Button" }),
      tbSplit({ label: "Toggle", toggle: true, pressed: false }),
    ].join(""),
  }),
};

export const Disabled = {
  render: () => toolbar({
    children: [
      tbBtn({ label: "Button", disabled: true }),
      tbBtn({ label: "Toggle", toggle: true, disabled: true }),
      tbCombo({ label: "Dropdown", disabled: true }),
      SEP,
      tbSplit({ label: "Button", disabled: true }),
    ].join(""),
  }),
};

export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: {
      hover: '.ss-toolbar__btn[data-state="hover"], .ss-toolbar__combo[data-state="hover"], .ss-toolbar__split-btn[data-state="hover"]',
    },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content max-content; gap: 16px; align-items: start; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Default</div>
      <div>${toolbar({ children: [
        tbBtn({ label: "Button" }),
        tbBtn({ label: "Toggle", toggle: true, pressed: false }),
        tbCombo({ label: "Dropdown" }),
        SEP,
        tbSplit({ label: "Button" }),
      ].join("") })}</div>

      <div>Toggle pressed</div>
      <div>${toolbar({ children: [
        tbBtn({ label: "Button" }),
        tbBtn({ label: "Toggle", toggle: true, pressed: true }),
        tbSplit({ label: "Toggle", toggle: true, pressed: true }),
      ].join("") })}</div>

      <div>Hover button</div>
      <div><div class="ss-toolbar" role="toolbar" style="width: 264px;">
        <button class="ss-toolbar__btn" type="button" data-state="hover">
          <span class="ss-toolbar__icon">${ICONS.box}</span><span class="ss-toolbar__label">Hover</span>
        </button>
        <button class="ss-toolbar__btn" type="button">
          <span class="ss-toolbar__icon">${ICONS.box}</span><span class="ss-toolbar__label">Normal</span>
        </button>
      </div></div>

      <div>Disabled</div>
      <div>${toolbar({ children: [
        tbBtn({ label: "Button", disabled: true }),
        tbBtn({ label: "Toggle", toggle: true, pressed: true, disabled: true }),
        tbCombo({ label: "Dropdown", disabled: true }),
        SEP,
        tbSplit({ label: "Button", disabled: true }),
      ].join("") })}</div>
    </div>
  `,
};
