// `.ss-btn` state matrix.
//
// CSS `:hover` and `:focus-visible` cannot be force-applied in Storybook
// without `@storybook/addon-pseudo-states`. Stories cover everything that
// IS forceable from markup:
//   - Default vs --primary vs --simple vs --icon-only
//   - With icon (.ss-btn__icon)
//   - --toggle on / off (via aria-pressed)
//   - :disabled (via disabled attribute)
// Hover and focus-visible are verified by hovering / tabbing inside the
// Storybook iframe.

import { ICONS } from "./_icons.js";

const BOX_ICON = ICONS.box;

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Buttons/Button",
  argTypes: {
    label: { control: "text" },
    primary: { control: "boolean" },
    simple: { control: "boolean" },
    iconOnly: { control: "boolean" },
    withIcon: { control: "boolean" },
    toggle: { control: "boolean" },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: ({
    label = "Label",
    primary = false,
    simple = false,
    iconOnly = false,
    withIcon = false,
    toggle = false,
    pressed = false,
    disabled = false,
  }) => {
    const cls = ["ss-btn"];
    if (primary) cls.push("ss-btn--primary");
    if (simple) cls.push("ss-btn--simple");
    if (iconOnly) cls.push("ss-btn--icon-only");
    if (toggle) cls.push("ss-btn--toggle");

    const icon = (withIcon || iconOnly)
      ? `<span class="ss-btn__icon">${BOX_ICON}</span>`
      : "";
    const text = iconOnly ? "" : label;

    // Toggle uses CSS-only markup: <label> wraps a hidden <input type="checkbox">.
    // No JS needed — clicking the label toggles the input natively,
    // `:has(input:checked)` paints the pressed look.
    if (toggle) {
      const inputAttrs = [
        `type="checkbox"`,
        `class="ss-toggle__input"`,
        pressed ? "checked" : "",
        disabled ? "disabled" : "",
      ].filter(Boolean).join(" ");
      return `<label class="${cls.join(" ")}" ${iconOnly ? `aria-label="${label}"` : ""}>
        <input ${inputAttrs}>
        ${icon}${text}
      </label>`;
    }

    // Non-toggle: regular <button>.
    const attrs = [];
    if (disabled) attrs.push("disabled");
    if (iconOnly) attrs.push(`aria-label="${label}"`);
    return `<button class="${cls.join(" ")}" ${attrs.join(" ")}>${icon}${text}</button>`;
  },
};

export default meta;

export const Default = {
  args: { label: "Cancel" },
};

export const Primary = {
  args: { label: "Save", primary: true },
};

// Force-state stories via storybook-addon-pseudo-states. Story parameters
// `pseudo: { hover: true }` etc. wrap the iframe root with classes the
// addon's stylesheet maps to real `:hover` paint — so screenshots / visual
// regression catch hover/focus/active without real cursor interaction.

export const Hover = {
  args: { label: "Cancel" },
  parameters: { pseudo: { hover: true } },
};

export const Focus = {
  args: { label: "Cancel" },
  parameters: { pseudo: { focusVisible: true } },
};

export const Active = {
  args: { label: "Cancel" },
  parameters: { pseudo: { active: true } },
};

export const PrimaryHover = {
  args: { label: "Save", primary: true },
  parameters: { pseudo: { hover: true } },
};

export const PrimaryFocus = {
  args: { label: "Save", primary: true },
  parameters: { pseudo: { focusVisible: true } },
};

export const Simple = {
  args: { label: "Label", simple: true },
};

export const WithIcon = {
  args: { label: "Label", primary: true, withIcon: true },
};

export const IconOnly = {
  args: { label: "Box", primary: true, iconOnly: true },
};

export const Toggle = {
  args: { label: "Label", toggle: true, pressed: false },
};

export const TogglePressed = {
  args: { label: "Label", toggle: true, pressed: true },
};

// Legacy `<button aria-pressed>` toggle — still supported by the CSS but
// requires `Starship.initToggleButtons()` to flip `aria-pressed` on click.
// Prefer the `<label>` + hidden `<input type="checkbox">` markup above
// (CSS-only, no JS dependency).
export const ToggleLegacyAriaPressed = {
  parameters: { docs: { description: { story: "Legacy markup requiring starship.js initToggleButtons() — kept for backward compat." } } },
  render: () => `
    <div style="display: inline-flex; gap: 12px;">
      <button class="ss-btn ss-btn--toggle" aria-pressed="false">Off</button>
      <button class="ss-btn ss-btn--toggle" aria-pressed="true">On</button>
    </div>
  `,
};

export const Disabled = {
  args: { label: "Cancel", disabled: true },
};

export const PrimaryDisabled = {
  args: { label: "Save", primary: true, disabled: true },
};

// Full state matrix — Default / Primary / Simple × Normal / Hover / Focus /
// Active / Disabled in one screenshot. The pseudo-states addon targets
// individual cells via `data-state` selectors so each row appears in the
// requested state without real cursor interaction.
//
// Below the state grid: a variant matrix (With icon / Icon only / Toggle)
// in resting state — variant chrome regression separate from state regression.
export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: {
      hover: '.ss-btn[data-state="hover"]',
      focusVisible: '.ss-btn[data-state="focus"]',
      active: '.ss-btn[data-state="active"]',
    },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content repeat(3, max-content); gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div></div>
      <div style="text-align: center;">Default</div>
      <div style="text-align: center;">Primary</div>
      <div style="text-align: center;">Simple</div>

      <div>Normal</div>
      <div><button class="ss-btn">Cancel</button></div>
      <div><button class="ss-btn ss-btn--primary">Save</button></div>
      <div><button class="ss-btn ss-btn--simple">Label</button></div>

      <div>Hover</div>
      <div><button class="ss-btn" data-state="hover">Cancel</button></div>
      <div><button class="ss-btn ss-btn--primary" data-state="hover">Save</button></div>
      <div><button class="ss-btn ss-btn--simple" data-state="hover">Label</button></div>

      <div>Focus</div>
      <div><button class="ss-btn" data-state="focus">Cancel</button></div>
      <div><button class="ss-btn ss-btn--primary" data-state="focus">Save</button></div>
      <div><button class="ss-btn ss-btn--simple" data-state="focus">Label</button></div>

      <div>Active</div>
      <div><button class="ss-btn" data-state="active">Cancel</button></div>
      <div><button class="ss-btn ss-btn--primary" data-state="active">Save</button></div>
      <div><button class="ss-btn ss-btn--simple" data-state="active">Label</button></div>

      <div>Disabled</div>
      <div><button class="ss-btn" disabled>Cancel</button></div>
      <div><button class="ss-btn ss-btn--primary" disabled>Save</button></div>
      <div><button class="ss-btn ss-btn--simple" disabled>Label</button></div>

      <div style="grid-column: 1 / -1; margin-top: 12px; opacity: 0.6; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;">Variants (resting)</div>

      <div>With icon</div>
      <div><button class="ss-btn"><span class="ss-btn__icon">${BOX_ICON}</span>Label</button></div>
      <div><button class="ss-btn ss-btn--primary"><span class="ss-btn__icon">${BOX_ICON}</span>Label</button></div>
      <div><button class="ss-btn ss-btn--simple"><span class="ss-btn__icon">${BOX_ICON}</span>Label</button></div>

      <div>Icon only</div>
      <div><button class="ss-btn ss-btn--icon-only" aria-label="Box"><span class="ss-btn__icon">${BOX_ICON}</span></button></div>
      <div><button class="ss-btn ss-btn--primary ss-btn--icon-only" aria-label="Box"><span class="ss-btn__icon">${BOX_ICON}</span></button></div>
      <div><button class="ss-btn ss-btn--simple ss-btn--icon-only" aria-label="Box"><span class="ss-btn__icon">${BOX_ICON}</span></button></div>

      <div>Toggle</div>
      <div><label class="ss-btn ss-btn--toggle"><input type="checkbox" class="ss-toggle__input">Off</label></div>
      <div><label class="ss-btn ss-btn--toggle"><input type="checkbox" class="ss-toggle__input" checked>On</label></div>
      <div></div>
    </div>
  `,
};
