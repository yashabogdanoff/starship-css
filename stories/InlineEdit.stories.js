// `.ss-inline-edit` + `[data-inline-edit]` — span that becomes
// contenteditable on dblclick (or F2 / Enter when focused). Enter/blur
// commits; Escape reverts. Wired by `initInlineEditables()` in
// starship.js. `aria-disabled="true"` blocks the gesture.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/InlineEdit",
  argTypes: {
    text: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: ({ text = "Inline Editable Text", disabled = false }) => `
    <span class="ss-inline-edit"
          data-inline-edit
          ${disabled ? 'aria-disabled="true"' : ""}
          aria-label="Inline editable text">${text}</span>
  `,
};

export default meta;

export const Default = {};

export const Disabled = {
  args: { disabled: true, text: "Locked" },
};

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 1fr; gap: 12px 16px; align-items: baseline; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Default</div>
      <div><span class="ss-inline-edit" data-inline-edit>Double-click to edit</span></div>

      <div>Disabled</div>
      <div><span class="ss-inline-edit" data-inline-edit aria-disabled="true">Locked text</span></div>
    </div>
  `,
};
