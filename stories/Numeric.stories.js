// `.ss-numeric` — SpinBox / NumericEntryBox. Wired by `initNumerics()`:
// mousedown + drag → change value, mousedown + release → enter edit mode.
//
// Variants:
//   `.ss-numeric--filled`   — SSpinBox (with fill bar between MinSlider/MaxSlider)
//   `.ss-numeric--no-spin`  — SNumericEntryBox(AllowSpin=false) — input always
//                              editable, no drag, no fill.
//
// Parent-state: `.ss-numeric:has(.ss-numeric__input:disabled)` repaints the
// entire widget when the input is :disabled. Tested via the Disabled story.

function spin({ min = -1000, max = 1000, minSlider = -500, maxSlider = 500, value = 0, noSpin = false, disabled = false }) {
  const cls = noSpin ? "ss-numeric ss-numeric--no-spin" : "ss-numeric ss-numeric--filled";
  const fill = noSpin ? "" : `<div class="ss-numeric__fill"></div>`;
  return `
    <div class="${cls}"
         data-num-min="${min}" data-num-max="${max}"
         data-num-min-slider="${minSlider}" data-num-max-slider="${maxSlider}"
         data-num-value="${value}"
         style="width: 240px;">
      ${fill}
      <input class="ss-numeric__input" type="text" ${disabled ? "disabled" : ""} aria-label="numeric">
    </div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Inputs/Numeric",
  argTypes: {
    value: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    minSlider: { control: "number" },
    maxSlider: { control: "number" },
    noSpin: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => spin(args),
};

export default meta;

export const SpinBox = {
  args: { min: 0, max: 500, minSlider: -500, maxSlider: 500, value: 250 },
};

export const NumericEntryBox = {
  args: { min: -1000, max: 1000, minSlider: -500, maxSlider: 500, value: 500 },
};

export const NoSpin = {
  args: { value: 0, noSpin: true },
};

export const Disabled = {
  args: { value: 250, disabled: true },
};

export const Hover = {
  args: { value: 250 },
  parameters: { pseudo: { hover: true } },
};

export const Focus = {
  args: { value: 250 },
  parameters: { pseudo: { focusWithin: true } },
};

export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: {
      hover: '.ss-numeric[data-state="hover"]',
      focusWithin: '.ss-numeric[data-state="focus"]',
    },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 240px; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Normal</div>
      <div>${spin({ value: 250 })}</div>

      <div>Hover<br><span style="font-size:10px;color:var(--ss-foreground-header);">(parent + fill)</span></div>
      <div><div class="ss-numeric ss-numeric--filled" data-state="hover"
                data-num-min="0" data-num-max="500"
                data-num-min-slider="-500" data-num-max-slider="500"
                data-num-value="250"
                style="width: 240px;">
        <div class="ss-numeric__fill"></div>
        <input class="ss-numeric__input" type="text" aria-label="hover">
      </div></div>

      <div>Focus-within<br><span style="font-size:10px;color:var(--ss-foreground-header);">(input focused)</span></div>
      <div><div class="ss-numeric ss-numeric--filled" data-state="focus"
                data-num-min="0" data-num-max="500"
                data-num-min-slider="-500" data-num-max-slider="500"
                data-num-value="250"
                style="width: 240px;">
        <div class="ss-numeric__fill"></div>
        <input class="ss-numeric__input" type="text" aria-label="focus">
      </div></div>

      <div>Disabled<br><span style="font-size:10px;color:var(--ss-foreground-header);">(parent :has)</span></div>
      <div>${spin({ value: 250, disabled: true })}</div>

      <div style="grid-column: 1 / -1; margin-top: 12px; font-size: 10px; color: var(--ss-foreground-header); text-transform: uppercase; letter-spacing: 0.06em;">Variants</div>

      <div>SpinBox (0..500)<br><span style="font-size:10px;color:var(--ss-foreground-header);">min/max ≠ minSlider/maxSlider</span></div>
      <div>${spin({ min: 0, max: 500, minSlider: -500, maxSlider: 500, value: 250 })}</div>

      <div>NumericEntryBox<br><span style="font-size:10px;color:var(--ss-foreground-header);">(-1000..1000)</span></div>
      <div>${spin({ min: -1000, max: 1000, minSlider: -500, maxSlider: 500, value: 500 })}</div>

      <div>No-spin<br><span style="font-size:10px;color:var(--ss-foreground-header);">always editable, no fill</span></div>
      <div>${spin({ value: 0, noSpin: true })}</div>
    </div>
  `,
};
