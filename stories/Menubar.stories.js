// `.ss-menubar` — horizontal strip of pull-down triggers. JS via
// `initPopovers`: first click on a bar item activates the bar; while
// activated, hovering another bar item switches the open menu without a
// second click. `aria-expanded="true"` paints the trigger in Primary.

let bar = 0;
function newBar() { return `mb-${++bar}`; }

function menubar({ items }) {
  return `
    <nav class="ss-menubar" aria-label="Menu Bar">
      ${items.map((it) => `
        <button class="ss-menubar__item" type="button"
                ${it.expanded ? 'aria-expanded="true"' : 'aria-expanded="false"'}
                ${it.disabled ? "disabled" : ""}>${it.label}</button>
      `).join("")}
    </nav>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Selectors/Menubar",
  argTypes: {
    labels: { control: "text", description: "Comma-separated item labels" },
    openIndex: { control: "number", description: "Index of opened pull-down (-1 = none)" },
    disabledIndex: { control: "number", description: "Index of disabled item (-1 = none)" },
  },
  render: ({ labels = "Menu 1, Menu 2, Menu 3", openIndex = -1, disabledIndex = -1 }) =>
    menubar({
      items: labels.split(",").map((s, i) => ({
        label: s.trim(),
        expanded: i === openIndex,
        disabled: i === disabledIndex,
      })),
    }),
};

export default meta;

export const Default = {
  args: { labels: "Menu 1, Menu 2, Menu 3", openIndex: -1, disabledIndex: -1 },
};

export const WithOpenItem = {
  render: () => menubar({
    items: [
      { label: "Menu 1", expanded: true },
      { label: "Menu 2" },
      { label: "Menu 3" },
    ],
  }),
};

export const WithDisabledItem = {
  render: () => menubar({
    items: [
      { label: "Menu 1" },
      { label: "Menu 2", disabled: true },
      { label: "Menu 3" },
    ],
  }),
};

export const HoverItem = {
  parameters: { pseudo: { hover: '.ss-menubar__item[data-state="hover"]' } },
  render: () => `
    <nav class="ss-menubar" aria-label="Menu Bar">
      <button class="ss-menubar__item" type="button">Menu 1</button>
      <button class="ss-menubar__item" type="button" data-state="hover">Menu 2 (hover)</button>
      <button class="ss-menubar__item" type="button">Menu 3</button>
    </nav>
  `,
};

export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: { hover: '.ss-menubar__item[data-state="hover"]' },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content max-content; gap: 12px 16px; align-items: center; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Default</div>
      <div>${menubar({ items: [{ label: "Menu 1" }, { label: "Menu 2" }] })}</div>

      <div>Open (Menu 1)</div>
      <div>${menubar({ items: [{ label: "Menu 1", expanded: true }, { label: "Menu 2" }] })}</div>

      <div>Hover (Menu 2)</div>
      <div><nav class="ss-menubar" aria-label="bar">
        <button class="ss-menubar__item" type="button">Menu 1</button>
        <button class="ss-menubar__item" type="button" data-state="hover">Menu 2</button>
      </nav></div>

      <div>Disabled (Menu 2)</div>
      <div>${menubar({ items: [{ label: "Menu 1" }, { label: "Menu 2", disabled: true }] })}</div>
    </div>
  `,
};
