/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.stories.@(js|mjs|ts)"],
  addons: ["storybook-addon-pseudo-states", "@storybook/addon-a11y"],
  framework: "@storybook/html-vite",
};
export default config;
