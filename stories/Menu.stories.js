// Smoke stories for `.ss-menu` semantic content over `.ss-popover` chrome.
// The popover is rendered INLINE (display:block + position:static) so the
// menu shows its full content for visual inspection — open/close machinery
// (mousedown toggle, cascade, menubar activation) is exercised in
// `docs/index.html`, not in stories.

const ENTRY = (label) => `
  <button class="ss-menu__entry" type="button" role="menuitem">
    <span class="ss-menu__icon" aria-hidden="true"></span>
    <span class="ss-menu__label">${label}</span>
  </button>
`;

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Selectors/Menu",
  render: () => `
    <div class="ss-popover ss-menu" role="menu"
         style="display: block; position: static;">
      <div class="ss-menu__heading">Menu Header 1</div>
      ${ENTRY("Menu Entry 1")}
      ${ENTRY("Menu Entry 2")}
      ${ENTRY("Menu Entry 3")}
      ${ENTRY("Menu Entry 4")}
      <button class="ss-menu__entry" type="button" role="menuitem"
              aria-haspopup="menu" aria-expanded="false">
        <span class="ss-menu__icon" aria-hidden="true"></span>
        <span class="ss-menu__label">Sub Menu 1</span>
        <span class="ss-menu__chevron" aria-hidden="true"></span>
      </button>
      <div class="ss-menu__heading">Menu Header 2</div>
      ${ENTRY("Menu Entry 5")}
      ${ENTRY("Menu Entry 6")}
      ${ENTRY("Menu Entry 7")}
      ${ENTRY("Menu Entry 8")}
    </div>
  `,
};

export default meta;

export const Default = {};
