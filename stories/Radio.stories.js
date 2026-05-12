// `.ss-radio` — native radio styled to match Slate's CheckBox(Style=Radio).
// Group via shared `name`. Stories use stable random group names to keep
// state isolated across story navigations.

let groupCounter = 0;
function newName() { return `ss-radio-grp-${++groupCounter}`; }

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Radio",
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: ({ checked = false, disabled = false }) => `
    <input class="ss-radio" type="radio" name="${newName()}"
           ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}
           aria-label="Radio">
  `,
};

export default meta;

export const Unchecked = { args: {} };
export const Checked = { args: { checked: true } };
export const Disabled = { args: { disabled: true } };
export const DisabledChecked = { args: { disabled: true, checked: true } };

export const Group = {
  parameters: { layout: "padded" },
  render: () => {
    const name = newName();
    return `
      <div role="radiogroup" aria-label="Group example"
           style="display: inline-flex; gap: 8px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
        <input class="ss-radio" type="radio" name="${name}" aria-label="0">
        <input class="ss-radio" type="radio" name="${name}" aria-label="1">
        <input class="ss-radio" type="radio" name="${name}" aria-label="2">
        <input class="ss-radio" type="radio" name="${name}" aria-label="3" checked>
        <input class="ss-radio" type="radio" name="${name}" aria-label="4">
      </div>
    `;
  },
};

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content repeat(2, max-content); gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div></div><div>Unchecked</div><div>Checked</div>

      <div>Enabled</div>
      <div><input class="ss-radio" type="radio" name="${newName()}" aria-label="off"></div>
      <div><input class="ss-radio" type="radio" name="${newName()}" aria-label="on" checked></div>

      <div>Disabled</div>
      <div><input class="ss-radio" type="radio" name="${newName()}" disabled aria-label="off"></div>
      <div><input class="ss-radio" type="radio" name="${newName()}" disabled checked aria-label="on"></div>
    </div>
  `,
};
