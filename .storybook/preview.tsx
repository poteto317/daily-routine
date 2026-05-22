import "../src/app/globals.css";
import type { Decorator, Preview } from "@storybook/nextjs-vite";

// globals.css の @variant dark (&:is(.dark *)) に対応するため、
// ツールバーで選択したテーマに応じて <html> に .dark クラスを付け外しする
const withDarkMode: Decorator = (Story, context) => {
  const isDark = context.globals["theme"] === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  return <Story />;
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "カラーテーマ",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [withDarkMode],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
