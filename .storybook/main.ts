import { fileURLToPath } from "url";
import path from "path";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };

    config.server ??= {};
    config.server.watch ??= {};
    config.server.watch.ignored = [
      "**/.git/**",
      "**/.claude/**",
      "**/node_modules/**",
      "**/.next/**",
    ];

    return config;
  },
};

export default config;
