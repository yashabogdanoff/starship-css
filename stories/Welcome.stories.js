// `Welcome` — Storybook landing page. Single static story explaining what
// the framework is, how to drop it into a page, what widgets exist, and how
// to recolor the palette. No interactive content — it's a navigational hub.
//
// Title is plain `Welcome` (no group prefix) so it sits at the root of the
// Storybook sidebar; `parameters.options.storySort` in `.storybook/preview.js`
// pins it to the top of the list.

/** @type { import('@storybook/html-vite').Meta } */
const meta = {
  title: "Welcome",
  parameters: { layout: "padded" },
};

export default meta;

const CARD = ({ title, story, desc }) => `
  <a href="?path=/story/${story}"
     target="_top"
     style="display: block;
            text-decoration: none;
            background: var(--ss-recessed);
            border: 1px solid var(--ss-dropdown-outline);
            border-radius: var(--ss-radius);
            padding: 12px 14px;
            color: var(--ss-foreground);
            transition: border-color 80ms ease;">
    <div style="font-family: var(--ss-font); font-size: 13px; font-weight: var(--ss-weight-bold); color: var(--ss-foreground-hover); margin-bottom: 4px;">${title}</div>
    <div style="font-family: var(--ss-font); font-size: 11px; line-height: 1.45;">${desc}</div>
  </a>
`;

const WIDGETS = [
  { title: "Button", story: "buttons-button--matrix", desc: "Default / Primary / Simple, with icon, icon-only, toggle, all states." },
  { title: "Input", story: "inputs-input--matrix", desc: "Text input, textarea, bare modifier, field-row layout." },
  { title: "Checkbox", story: "inputs-checkbox--matrix", desc: "Unchecked / checked / indeterminate × enabled / disabled." },
  { title: "Radio", story: "inputs-radio--matrix", desc: "Radio group, individual states." },
  { title: "Segmented", story: "inputs-segmented--matrix", desc: "Text + icon-only, parent-state via `:has()`." },
  { title: "Slider", story: "inputs-slider--matrix", desc: "Native range input styled to Slate." },
  { title: "Numeric", story: "inputs-numeric--matrix", desc: "SpinBox + NumericEntryBox + No-spin variants." },
  { title: "Search", story: "inputs-search--default", desc: "Pill-shaped search box with glass icon." },
  { title: "Inline edit", story: "inputs-inlineedit--matrix", desc: "Span that promotes to contenteditable." },
  { title: "Combo", story: "selectors-combo--matrix", desc: "SComboBox with options + selection writeback." },
  { title: "Menu", story: "selectors-menu--default", desc: "Generic menu: menubar / toolbar / submenu / context." },
  { title: "Menubar", story: "selectors-menubar--matrix", desc: "Horizontal strip of pull-down triggers." },
  { title: "Toolbar", story: "containers-toolbar--default", desc: "Button + Toggle + Combo + Split + Separator." },
  { title: "Tabs", story: "containers-tabs--four", desc: "Radio-hack tabs, Major + Minor, up to 32." },
  { title: "Progress", story: "feedback-progress--matrix", desc: "Determinate + marquee indeterminate, disabled." },
  { title: "Colors", story: "foundations-colors--all", desc: "All 45 UE EStyleColor tokens grouped by semantics." },
];

const SECTION_TITLE = (text) => `
  <h2 style="font-family: var(--ss-font);
             font-size: 11px;
             font-weight: var(--ss-weight-bold);
             text-transform: uppercase;
             letter-spacing: 0.06em;
             color: var(--ss-foreground-header);
             margin: 24px 0 12px;">${text}</h2>
`;

export const Welcome = {
  render: () => `
    <div style="max-width: 920px; margin: 0 auto; font-family: var(--ss-font); color: var(--ss-foreground); line-height: 1.5;">

      <header style="margin-bottom: 24px;">
        <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;">
          <h1 style="margin: 0;
                     font-family: var(--ss-font);
                     font-size: var(--ss-font-size-xl);
                     font-weight: var(--ss-weight-bold);
                     color: var(--ss-foreground-hover);">starship-css</h1>
          <code style="font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
                       font-size: 11px;
                       color: var(--ss-foreground);
                       background: var(--ss-input);
                       padding: 2px 7px;
                       border: 1px solid var(--ss-input-outline);
                       border-radius: 2px;">v0.0.3</code>
        </div>
        <p style="margin: 8px 0 0;
                  font-family: var(--ss-font);
                  font-size: 13px;
                  color: var(--ss-foreground);
                  max-width: 760px;">
          A CSS framework that styles plain HTML to look like the Unreal Engine 5 editor
          (Slate UI). Pure-CSS base, opt-in JS for the interactive bits.
          <strong style="color: var(--ss-foreground-hover);">No build step required</strong>
          — drop in a <code>&lt;link&gt;</code> tag and write semantic HTML with
          <code>ss-</code> classes.
        </p>
      </header>

      ${SECTION_TITLE("Drop into a page")}
      <pre style="margin: 0;
                  padding: 12px 14px;
                  background: var(--ss-input);
                  border: 1px solid var(--ss-input-outline);
                  border-radius: var(--ss-radius);
                  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
                  font-size: 11.5px;
                  color: var(--ss-foreground-hover);
                  line-height: 1.5;
                  overflow-x: auto;"><code>&lt;link rel="stylesheet"
      href="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.css"&gt;
&lt;script src="https://cdn.jsdelivr.net/gh/yashabogdanoff/starship-css@main/dist/starship.min.js"&gt;&lt;/script&gt;

&lt;label class="ss-label"&gt;Name&lt;/label&gt;
&lt;input class="ss-input" type="text" value="Cube_42"&gt;
&lt;button class="ss-btn ss-btn--primary"&gt;Save&lt;/button&gt;
&lt;button class="ss-btn"&gt;Cancel&lt;/button&gt;</code></pre>
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--ss-foreground);">
        The <code>&lt;script&gt;</code> is opt-in. Pure-CSS widgets work without it
        (buttons, inputs, checkbox, radio, segmented, slider, progress). Combo, menus,
        numeric drag, inline edit, tab close-button, and per-OS font polish need it.
      </p>

      ${SECTION_TITLE("Widgets")}
      <div style="display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                  gap: 10px;">
        ${WIDGETS.map(CARD).join("")}
      </div>

      ${SECTION_TITLE("Recolor the palette")}
      <p style="font-size: 13px; margin: 0 0 8px;">
        Every UE Slate <code>EStyleColor</code> is exposed as a CSS custom property on
        <code>:root</code>. Override any of them and the whole framework follows —
        disabled tints, marquee progress, focus rings, hover states all derive via
        <code>color-mix</code>:
      </p>
      <pre style="margin: 0;
                  padding: 12px 14px;
                  background: var(--ss-input);
                  border: 1px solid var(--ss-input-outline);
                  border-radius: var(--ss-radius);
                  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
                  font-size: 11.5px;
                  color: var(--ss-foreground-hover);
                  line-height: 1.5;
                  overflow-x: auto;"><code>:root {
  --ss-primary:       #FF6B00;   /* orange brand */
  --ss-primary-hover: #FF8533;
  --ss-primary-press: #B24E00;
}</code></pre>
      <p style="margin: 6px 0 0; font-size: 11px; color: var(--ss-foreground);">
        See <a href="?path=/story/foundations-colors--all" target="_top"
               style="color: var(--ss-highlight); text-decoration: none;">Foundations/Colors</a>
        for the full catalog of 45 UE tokens with live hex values.
      </p>

      ${SECTION_TITLE("Browser support")}
      <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
        <li><strong style="color: var(--ss-foreground-hover);">Chromium 125+</strong> — recommended (combo / menu popovers use CSS Anchor Positioning).</li>
        <li><strong style="color: var(--ss-foreground-hover);">Firefox / Safari</strong> — most widgets work; combo / menu popovers position at viewport top-left until a JS fallback ships.</li>
      </ul>

      ${SECTION_TITLE("Accessibility")}
      <p style="font-size: 12px; margin: 0;">
        Targets <strong style="color: var(--ss-foreground-hover);">WCAG 2.1 AA</strong>
        for visible/active states. Verified via <code>@storybook/addon-a11y</code> on every
        story. Two documented exemptions follow the UE Slate visual contract:
        <code>:disabled</code> contrast (per WCAG 1.4.3) and <code>.ss-menu__heading</code>
        muted-section style. See README for the full table.
      </p>

      ${SECTION_TITLE("Where to look")}
      <ul style="margin: 0; padding-left: 20px; font-size: 12px;">
        <li><a href="https://github.com/yashabogdanoff/starship-css" target="_blank" rel="noreferrer noopener" style="color: var(--ss-highlight); text-decoration: none;">github.com/yashabogdanoff/starship-css</a> — source.</li>
        <li>Storybook (you're here) — per-component state matrix and palette explorer. Hosted at <a href="https://yashabogdanoff.github.io/starship-css/" target="_blank" rel="noreferrer noopener" style="color: var(--ss-highlight); text-decoration: none;">yashabogdanoff.github.io/starship-css</a>.</li>
      </ul>

    </div>
  `,
};
