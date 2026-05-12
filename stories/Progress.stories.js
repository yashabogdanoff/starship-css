// `.ss-progress` — Slate SProgressBar. Two variants:
//
//   .ss-progress             — determinate bar with explicit value via
//                               inner `.ss-progress__bar` width.
//   .ss-progress--marquee    — indeterminate marquee animation (no value).
//
// `aria-disabled="true"` paints the disabled tint (framework reads ARIA
// attribute rather than `disabled` since `<div>` doesn't natively accept
// `disabled`).

function bar({ value = 50, marquee = false, disabled = false }) {
  const cls = marquee ? "ss-progress ss-progress--marquee" : "ss-progress";
  const ariaBusy = marquee ? ' aria-busy="true"' : "";
  const ariaDisabled = disabled ? ' aria-disabled="true"' : "";
  const ariaValue = marquee
    ? ""
    : ` aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"`;
  const inner = marquee ? "" : `<div class="ss-progress__bar" style="width: ${value}%;"></div>`;
  return `<div class="${cls}" role="progressbar"${ariaValue}${ariaBusy}${ariaDisabled}
       aria-label="Progress" style="width: 240px;">${inner}</div>`;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Feedback/Progress",
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    marquee: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  render: (args) => bar(args),
};

export default meta;

export const Determinate = { args: { value: 50 } };
export const Empty = { args: { value: 0 } };
export const Full = { args: { value: 100 } };
export const Marquee = { args: { marquee: true } };
export const Disabled = { args: { value: 50, disabled: true } };
export const MarqueeDisabled = { args: { marquee: true, disabled: true } };

export const Matrix = {
  parameters: { layout: "padded" },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 240px; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Empty</div>
      <div>${bar({ value: 0 })}</div>

      <div>Mid</div>
      <div>${bar({ value: 50 })}</div>

      <div>Full</div>
      <div>${bar({ value: 100 })}</div>

      <div>Disabled<br><span style="font-size:10px;color:var(--ss-foreground-header);">aria-disabled</span></div>
      <div>${bar({ value: 50, disabled: true })}</div>

      <div style="grid-column: 1 / -1; margin-top: 12px; font-size: 10px; color: var(--ss-foreground-header); text-transform: uppercase; letter-spacing: 0.06em;">Marquee (indeterminate)</div>

      <div>Marquee</div>
      <div>${bar({ marquee: true })}</div>

      <div>Marquee disabled</div>
      <div>${bar({ marquee: true, disabled: true })}</div>
    </div>
  `,
};
