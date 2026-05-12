// Smoke stories for the `.ss-popover` base chrome. Stories render the
// popover element INLINE (display:block + position:static) — the popover
// API + anchor-positioning machinery is exercised in `docs/index.html`,
// not here. Stories are for visual chrome regression only.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Selectors/Popover",
  render: ({ width, content }) => `
    <div class="ss-popover" style="display: block; position: static; width: ${width}px;">
      ${content}
    </div>
  `,
  argTypes: {
    width: { control: { type: "number", min: 80, max: 600, step: 10 } },
    content: { control: "text" },
  },
};

export default meta;

export const Empty = {
  args: {
    width: 200,
    content: `<div style="padding: 8px; color: var(--ss-foreground); font-size: 13px;">(empty popover)</div>`,
  },
};

export const WithContent = {
  args: {
    width: 240,
    content: `
      <div style="padding: 12px;">
        <div style="font-size: 13px; color: var(--ss-foreground); margin-bottom: 8px;">
          Arbitrary HTML inside .ss-popover.
        </div>
        <button class="ss-btn ss-btn--primary">Action</button>
      </div>
    `,
  },
};
