import "../dist/starship.css";
import "../dist/starship.js";

/** @type { import('@storybook/html-vite').Preview } */
const preview = {
  parameters: {
    // Atoms (Button, Input, Checkbox, ...) center nicely in the dark canvas.
    // Matrix / Group / FieldLayout / Toolbar stories override to "padded"
    // (grids and full-width composites can't be centered without distorting
    // their layout).
    layout: "centered",
    options: {
      // Welcome first; then walk the groups in the same order as the file-ownership
      // table in CLAUDE.md (Foundations → Buttons → Inputs → Selectors → Containers
      // → Feedback). Anything not listed sorts alphabetically after.
      storySort: {
        order: [
          "Welcome",
          "Gallery",
          "Foundations",
          "Buttons",
          "Inputs",
          "Selectors",
          "Containers",
          "Feedback",
          "*",
        ],
      },
    },
  },
  decorators: [
    (story) => {
      const el = story();
      // starship.js IIFE wires the DOM once at preview load. Story navigation
      // replaces the iframe DOM, so re-run each init after every mount.
      // All init* are idempotent — per-element `data-ss-inited` guards plus
      // module-level singleton flags ensure re-calls only wire new elements
      // and never double-bind document-level listeners.
      queueMicrotask(() => {
        const s = window.starship;
        if (!s) return;
        s.initPopovers?.();
        s.initNumerics?.();
        s.initInlineEditables?.();
        s.initToggleButtons?.();
        s.initTabs?.();
      });
      return el;
    },
  ],
};

export default preview;
