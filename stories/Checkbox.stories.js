// `.ss-checkbox` — native checkbox styled to match Slate's CheckBox.
// :checked / :indeterminate states paint via the framework CSS; the
// `indeterminate` property only exists as a runtime flag (no HTML attr),
// so stories set it via JS after the input is in the DOM.

function makeCheckbox({ checked = false, indeterminate = false, disabled = false, label }) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.className = "ss-checkbox";
  if (checked) input.checked = true;
  if (disabled) input.disabled = true;
  if (label) input.setAttribute("aria-label", label);
  // `indeterminate` is a runtime-only property, set AFTER attach.
  if (indeterminate) queueMicrotask(() => { input.indeterminate = true; });
  return input;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Checkbox",
  argTypes: {
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  render: (args) => makeCheckbox({ ...args, label: args.label || "Checkbox" }),
};

export default meta;

export const Unchecked = { args: {} };
export const Checked = { args: { checked: true } };
export const Indeterminate = { args: { indeterminate: true } };
export const Disabled = { args: { disabled: true } };
export const DisabledChecked = { args: { disabled: true, checked: true } };

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display: grid; grid-template-columns: max-content repeat(3, max-content); gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;";
    const row = (label, cells) => {
      const head = document.createElement("div");
      head.textContent = label;
      wrap.appendChild(head);
      cells.forEach((c) => {
        const cell = document.createElement("div");
        cell.appendChild(c);
        wrap.appendChild(cell);
      });
    };
    // header
    ["", "Unchecked", "Checked", "Indeterminate"].forEach((t) => {
      const h = document.createElement("div");
      h.textContent = t;
      h.style.textAlign = "left";
      wrap.appendChild(h);
    });
    row("Enabled", [
      makeCheckbox({}),
      makeCheckbox({ checked: true }),
      makeCheckbox({ indeterminate: true }),
    ]);
    row("Disabled", [
      makeCheckbox({ disabled: true }),
      makeCheckbox({ disabled: true, checked: true }),
      makeCheckbox({ disabled: true, indeterminate: true }),
    ]);
    return wrap;
  },
};
