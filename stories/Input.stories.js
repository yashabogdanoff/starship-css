// `.ss-input`, `.ss-textarea`, and their `--bare` modifiers + `.ss-label`
// + `.ss-field` wrapper. `.ss-search` and `.ss-inline-edit` live in
// separate story files because they have their own JS wiring.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Input",
  argTypes: {
    placeholder: { control: "text" },
    value: { control: "text" },
    bare: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  render: ({
    placeholder = "Placeholder",
    value = "",
    bare = false,
    disabled = false,
    readOnly = false,
  }) => {
    const cls = ["ss-input"];
    if (bare) cls.push("ss-input--bare");
    const attrs = [
      `class="${cls.join(" ")}"`,
      `type="text"`,
      placeholder ? `placeholder="${placeholder}"` : "",
      value ? `value="${value}"` : "",
      disabled ? "disabled" : "",
      readOnly ? "readonly" : "",
    ].filter(Boolean).join(" ");
    return `<input ${attrs}>`;
  },
};

export default meta;

export const Default = {
  args: { placeholder: "Type here..." },
};

export const WithValue = {
  args: { value: "Cube_42" },
};

export const Disabled = {
  args: { value: "Locked", disabled: true },
};

export const ReadOnly = {
  args: { value: "Read-only", readOnly: true },
};

export const Bare = {
  args: { value: "Borderless until focus", bare: true },
};

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 1fr; gap: 8px 12px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px; max-width: 480px;">
      <div>Default</div>
      <div><input class="ss-input" type="text" placeholder="Type here..."></div>

      <div>With value</div>
      <div><input class="ss-input" type="text" value="Cube_42"></div>

      <div>Disabled</div>
      <div><input class="ss-input" type="text" value="Locked" disabled></div>

      <div>Read-only</div>
      <div><input class="ss-input" type="text" value="Read-only" readonly></div>

      <div>Bare</div>
      <div><input class="ss-input ss-input--bare" type="text" value="Click to focus"></div>

      <div>Textarea</div>
      <div><textarea class="ss-textarea" rows="3">This is multi-line
editable text.</textarea></div>

      <div>Textarea bare</div>
      <div><textarea class="ss-textarea ss-textarea--bare" rows="3">This is a multi-line editable text box (bare)</textarea></div>
    </div>
  `,
};

// `.ss-label` + `.ss-field` layout — label-on-left form pattern.
export const FieldLayout = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="max-width: 480px;">
      <label class="ss-label">Section</label>

      <div class="ss-field">
        <label class="ss-label" for="f1">Name</label>
        <input class="ss-input" id="f1" type="text" value="Cube_42">
      </div>

      <div class="ss-field">
        <label class="ss-label" for="f2">Description</label>
        <input class="ss-input" id="f2" type="text" placeholder="Optional...">
      </div>

      <div class="ss-field">
        <label class="ss-label" for="f3">Notes</label>
        <textarea class="ss-textarea" id="f3" rows="3"></textarea>
      </div>
    </div>
  `,
};
