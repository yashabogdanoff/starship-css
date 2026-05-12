// `.ss-search` — pill-shaped search box with glass icon at left. Slate's
// SSearchBox doesn't carry a clear-X button (the framework strips Chromium's
// native cancel button too) — the glass icon is the only chrome ornament.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Search",
  argTypes: {
    placeholder: { control: "text" },
    value: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: ({
    placeholder = "Search",
    value = "",
    disabled = false,
  }) => `
    <div class="ss-search" style="max-width: 320px;">
      <span class="ss-search__icon" aria-hidden="true"></span>
      <input class="ss-input" type="search"
             placeholder="${placeholder}"
             value="${value}"
             ${disabled ? "disabled" : ""}
             aria-label="Search">
    </div>
  `,
};

export default meta;

export const Default = {};

export const WithValue = {
  args: { value: "Cube" },
};

export const Disabled = {
  args: { value: "Locked", disabled: true },
};
