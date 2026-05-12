// Lucide icons used by Storybook stories (decorative).
//
// These do NOT ship with the framework — `dist/starship.{css,js}` is icon-free
// on purpose (Lucide and Tabler are MIT-licensed; we don't redistribute
// Lucide's SVG bundle from inside our CSS). Stories use Lucide icons the
// same way `docs/index.html` does — inline `<svg>` snippets per component
// sample. This file just centralises the four shape icons that the UE
// Starship Gallery uses.
//
// `_` prefix keeps Storybook's `**/*.stories.*` glob from picking this up
// as a story file.

const SVG_ATTRS =
  `viewBox="0 0 24 24" width="16" height="16" fill="none" ` +
  `stroke="currentColor" stroke-width="2" stroke-linecap="round" ` +
  `stroke-linejoin="round" aria-hidden="true"`;

export const ICONS = {
  // Lucide `box` — full 3-path cube with visible front + top edges.
  box: `<svg ${SVG_ATTRS}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>`,

  // Lucide `cylinder` — ellipse top + side walls.
  cylinder: `<svg ${SVG_ATTRS}>
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
  </svg>`,

  // Lucide `pyramid` — tetrahedral with visible front edge.
  pyramid: `<svg ${SVG_ATTRS}>
    <path d="M2.5 16.88a1 1 0 0 1-.32-1.43l9-13.02a1 1 0 0 1 1.64 0l9 13.01a1 1 0 0 1-.32 1.44l-8.51 4.86a2 2 0 0 1-2 0Z"/>
    <path d="M12 2v20"/>
  </svg>`,

  // Lucide `globe` — sphere with meridian + equator (UE gallery "Sphere" slot).
  globe: `<svg ${SVG_ATTRS}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>`,
};
