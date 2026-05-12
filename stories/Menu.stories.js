// `.ss-menu` — Slate pull-down + submenu content over the `.ss-popover` base
// chrome. Stories render the menu statically (inline `position: static`,
// `display: block`) so contents are visible without invoking the popover
// API. Open/close machinery (cascade, hover-switch, parent search lock) is
// exercised in `docs/index.html`.

import { ICONS } from "./_icons.js";

function entry({ label, icon = null, disabled = false, expanded = false, submenu = false }) {
  const role = "menuitem";
  const attrs = [
    `class="ss-menu__entry"`,
    `type="button"`,
    `role="${role}"`,
    disabled ? 'aria-disabled="true"' : "",
    submenu ? `aria-haspopup="menu" aria-expanded="${expanded ? "true" : "false"}"` : "",
  ].filter(Boolean).join(" ");
  const iconSlot = `<span class="ss-menu__icon" aria-hidden="true">${icon || ""}</span>`;
  const chevron = submenu
    ? `<span class="ss-menu__chevron" aria-hidden="true"></span>`
    : "";
  return `
    <button ${attrs}>
      ${iconSlot}
      <span class="ss-menu__label">${label}</span>
      ${chevron}
    </button>
  `;
}

function menu({ children, width = 240 }) {
  return `
    <div class="ss-popover ss-menu" role="menu"
         style="display: block; position: static; width: ${width}px;">
      ${children}
    </div>
  `;
}

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Selectors/Menu",
  render: () => menu({
    children: [
      `<div class="ss-menu__heading">Menu Header 1</div>`,
      entry({ label: "Menu Entry 1" }),
      entry({ label: "Menu Entry 2" }),
      entry({ label: "Menu Entry 3" }),
      entry({ label: "Menu Entry 4" }),
      entry({ label: "Sub Menu 1", submenu: true }),
      `<div class="ss-menu__heading">Menu Header 2</div>`,
      entry({ label: "Menu Entry 5" }),
      entry({ label: "Menu Entry 6" }),
      entry({ label: "Menu Entry 7" }),
      entry({ label: "Menu Entry 8" }),
    ].join(""),
  }),
};

export default meta;

// ----- Content variations -------------------------------------------------

export const Default = {};

export const Plain = {
  render: () => menu({
    children: [
      entry({ label: "New File" }),
      entry({ label: "Open" }),
      entry({ label: "Save" }),
      entry({ label: "Save As…" }),
    ].join(""),
  }),
};

export const WithHeadings = {
  render: () => menu({
    children: [
      `<div class="ss-menu__heading">File</div>`,
      entry({ label: "New" }),
      entry({ label: "Open" }),
      `<div class="ss-menu__heading">Edit</div>`,
      entry({ label: "Undo" }),
      entry({ label: "Redo" }),
    ].join(""),
  }),
};

export const WithSeparators = {
  render: () => menu({
    children: [
      entry({ label: "Cut" }),
      entry({ label: "Copy" }),
      entry({ label: "Paste" }),
      `<div class="ss-menu__separator"></div>`,
      entry({ label: "Find" }),
      entry({ label: "Replace" }),
      `<div class="ss-menu__separator"></div>`,
      entry({ label: "Select All" }),
    ].join(""),
  }),
};

export const WithIcons = {
  render: () => menu({
    children: [
      entry({ label: "Box", icon: ICONS.box }),
      entry({ label: "Cylinder", icon: ICONS.cylinder }),
      entry({ label: "Pyramid", icon: ICONS.pyramid }),
      entry({ label: "Sphere", icon: ICONS.globe }),
    ].join(""),
  }),
};

export const WithDisabledItems = {
  render: () => menu({
    children: [
      entry({ label: "Cut" }),
      entry({ label: "Copy" }),
      entry({ label: "Paste", disabled: true }),
      `<div class="ss-menu__separator"></div>`,
      entry({ label: "Delete", disabled: true }),
    ].join(""),
  }),
};

export const WithSearch = {
  render: () => menu({
    width: 280,
    children: [
      `<div class="ss-search ss-menu__search">
         <span class="ss-search__icon" aria-hidden="true"></span>
         <input class="ss-input" type="search" placeholder="Start typing to search" aria-label="Search menu">
       </div>`,
      `<div class="ss-menu__heading">Recent</div>`,
      entry({ label: "Cube_42" }),
      entry({ label: "Cylinder_07" }),
      entry({ label: "Pyramid_03" }),
      `<div class="ss-menu__separator"></div>`,
      entry({ label: "All Shapes" }),
    ].join(""),
  }),
};

export const WithOpenSubmenu = {
  render: () => menu({
    children: [
      entry({ label: "Menu Entry 1" }),
      entry({ label: "Menu Entry 2" }),
      entry({ label: "Sub Menu 1", submenu: true, expanded: true }),
      entry({ label: "Menu Entry 3" }),
    ].join(""),
  }),
};

export const LongList = {
  render: () => `
    <div class="ss-popover ss-menu" role="menu"
         style="display: block; position: static; width: 240px; max-height: 300px; overflow-y: auto;">
      ${Array.from({ length: 24 }, (_, i) =>
        entry({ label: `Menu Entry ${i + 1}` })
      ).join("")}
    </div>
  `,
};

// `.ss-menu` is a *generic* menu container — the same widget powers
// menubar pull-downs, toolbar dropdowns, submenus, AND right-click context
// menus. This story demonstrates the context-menu pattern: right-click the
// target area, `.ss-menu` opens at the cursor via the Popover API.
//
// We don't use `initPopovers` here because there's no `data-popover-target`
// trigger — the menu is invoked imperatively from `contextmenu`. Outside-
// click and Escape are wired locally; in a real consumer codebase you'd
// likely route this through your own context-menu manager.
export const ContextMenuExample = {
  parameters: { layout: "padded" },
  render: () => {
    const root = document.createElement("div");
    const id = "ctx-menu-" + Math.random().toString(36).slice(2, 9);
    root.innerHTML = `
      <div data-ctx-target
           style="padding: 80px 24px;
                  border: 1px dashed var(--ss-dropdown-outline);
                  border-radius: var(--ss-radius);
                  background: var(--ss-panel);
                  color: var(--ss-foreground);
                  font-family: var(--ss-font);
                  font-size: 13px;
                  text-align: center;
                  user-select: none;
                  cursor: context-menu;">
        Right-click anywhere inside this area<br>
        <span style="color: var(--ss-foreground-header); font-size: 11px;">
          ESC or click outside dismisses. The same .ss-menu also serves as
          menubar pull-down / toolbar dropdown / submenu.
        </span>
      </div>
      <div class="ss-popover ss-menu" role="menu" popover="manual" id="${id}"
           style="position: fixed; margin: 0; width: 200px;">
        ${entry({ label: "Cut" })}
        ${entry({ label: "Copy" })}
        ${entry({ label: "Paste", disabled: true })}
        <div class="ss-menu__separator"></div>
        ${entry({ label: "Find" })}
        ${entry({ label: "Replace" })}
        <div class="ss-menu__separator"></div>
        ${entry({ label: "Properties…" })}
      </div>
    `;
    const target = root.querySelector("[data-ctx-target]");
    const menu = root.querySelector(`#${id}`);

    function open(e) {
      e.preventDefault();
      menu.style.left = e.clientX + "px";
      menu.style.top = e.clientY + "px";
      if (!menu.matches(":popover-open")) menu.showPopover();
    }
    function close() {
      if (menu.matches(":popover-open")) menu.hidePopover();
    }
    function onDocDown(e) {
      if (menu.matches(":popover-open") && !menu.contains(e.target)) close();
    }
    function onKey(e) {
      if (e.key === "Escape") close();
    }

    target.addEventListener("contextmenu", open);
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    // Regular entries (no submenu) dismiss the menu on activation.
    menu.querySelectorAll(".ss-menu__entry").forEach((el) => {
      el.addEventListener("click", () => {
        if (el.getAttribute("aria-disabled") === "true") return;
        close();
      });
    });
    return root;
  },
};

// ----- Force pseudo on entries -------------------------------------------

export const HoverEntry = {
  parameters: { pseudo: { hover: '.ss-menu__entry[data-state="hover"]' } },
  render: () => `
    <div class="ss-popover ss-menu" role="menu"
         style="display: block; position: static; width: 240px;">
      <button class="ss-menu__entry" type="button" role="menuitem">
        <span class="ss-menu__icon" aria-hidden="true"></span>
        <span class="ss-menu__label">Menu Entry 1</span>
      </button>
      <button class="ss-menu__entry" type="button" role="menuitem" data-state="hover">
        <span class="ss-menu__icon" aria-hidden="true"></span>
        <span class="ss-menu__label">Menu Entry 2 (hover)</span>
      </button>
      <button class="ss-menu__entry" type="button" role="menuitem">
        <span class="ss-menu__icon" aria-hidden="true"></span>
        <span class="ss-menu__label">Menu Entry 3</span>
      </button>
    </div>
  `,
};

// ----- Side-by-side state matrix -----------------------------------------

export const Matrix = {
  parameters: {
    layout: "padded",
    pseudo: { hover: '.ss-menu__entry[data-state="hover"]' },
  },
  render: () => `
    <div style="display: grid; grid-template-columns: max-content 240px; gap: 16px; align-items: start; color: var(--ss-foreground); font-family: var(--ss-font); font-size: 11px;">
      <div>Plain</div>
      <div>${menu({ children: [
        entry({ label: "Entry 1" }),
        entry({ label: "Entry 2" }),
        entry({ label: "Entry 3" }),
      ].join("") })}</div>

      <div>With separator</div>
      <div>${menu({ children: [
        entry({ label: "Entry 1" }),
        entry({ label: "Entry 2" }),
        `<div class="ss-menu__separator"></div>`,
        entry({ label: "Entry 3" }),
      ].join("") })}</div>

      <div>With heading</div>
      <div>${menu({ children: [
        `<div class="ss-menu__heading">Section</div>`,
        entry({ label: "Entry 1" }),
        entry({ label: "Entry 2" }),
      ].join("") })}</div>

      <div>Hover entry</div>
      <div><div class="ss-popover ss-menu" role="menu" style="display:block;position:static;width:240px;">
        <button class="ss-menu__entry" type="button" role="menuitem"><span class="ss-menu__icon" aria-hidden="true"></span><span class="ss-menu__label">Entry 1</span></button>
        <button class="ss-menu__entry" type="button" role="menuitem" data-state="hover"><span class="ss-menu__icon" aria-hidden="true"></span><span class="ss-menu__label">Entry 2 (hover)</span></button>
        <button class="ss-menu__entry" type="button" role="menuitem"><span class="ss-menu__icon" aria-hidden="true"></span><span class="ss-menu__label">Entry 3</span></button>
      </div></div>

      <div>Open submenu</div>
      <div>${menu({ children: [
        entry({ label: "Entry 1" }),
        entry({ label: "Sub Menu", submenu: true, expanded: true }),
        entry({ label: "Entry 2" }),
      ].join("") })}</div>

      <div>Disabled items</div>
      <div>${menu({ children: [
        entry({ label: "Entry 1" }),
        entry({ label: "Entry 2 (disabled)", disabled: true }),
        entry({ label: "Entry 3" }),
      ].join("") })}</div>
    </div>
  `,
};
