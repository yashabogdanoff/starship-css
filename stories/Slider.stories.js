// `.ss-slider` — native `<input type="range">` styled to match Slate's
// SSlider. Pure CSS, no JS init. Track + thumb paint via vendor pseudo-
// elements (`::-webkit-slider-runnable-track`, `::-moz-range-track`).
//
// `:hover` / `:focus-visible` / `:active` / `:disabled` are stylable via
// pseudo-states addon.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Slider",
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
  render: ({ value = 50, min = 0, max = 100, step = 1, disabled = false }) => `
    <input class="ss-slider" type="range"
           min="${min}" max="${max}" step="${step}" value="${value}"
           ${disabled ? "disabled" : ""}
           aria-label="Slider"
           style="width: 240px;">
  `,
};

export default meta;

export const Default = { args: { value: 50 } };
export const Min = { args: { value: 0 } };
export const Max = { args: { value: 100 } };
export const Disabled = { args: { value: 50, disabled: true } };

export const Hover = {
  args: { value: 50 },
  parameters: { pseudo: { hover: true } },
};

export const Focus = {
  args: { value: 50 },
  parameters: { pseudo: { focusVisible: true } },
};

export const Active = {
  args: { value: 50 },
  parameters: { pseudo: { active: true } },
};

// Full state matrix — Normal / Hover / Focus / Active / Disabled in one
// screenshot. Each row's slider gets `data-state` that the pseudo-states
// addon targets via selector. Below: value-range variants (Min/Mid/Max/
// Fractional) in resting state.
export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: {
      hover: '.ss-slider[data-state="hover"]',
      focusVisible: '.ss-slider[data-state="focus"]',
      active: '.ss-slider[data-state="active"]',
    },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 240px; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Normal</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="50" aria-label="normal"></div>

      <div>Hover</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="50" data-state="hover" aria-label="hover"></div>

      <div>Focus</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="50" data-state="focus" aria-label="focus"></div>

      <div>Active</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="50" data-state="active" aria-label="active"></div>

      <div>Disabled</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="50" disabled aria-label="disabled"></div>

      <div style="grid-column: 1 / -1; margin-top: 12px; opacity: 0.6; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;">Value range (resting)</div>

      <div>Min</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="0" aria-label="min"></div>

      <div>Max</div>
      <div><input class="ss-slider" type="range" min="0" max="100" value="100" aria-label="max"></div>

      <div>Fractional (step 0.001)</div>
      <div><input class="ss-slider" type="range" min="0" max="1" step="0.001" value="0.5" aria-label="fraction"></div>
    </div>
  `,
};
