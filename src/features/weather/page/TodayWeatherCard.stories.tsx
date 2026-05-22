import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TodayWeatherCard } from "./TodayWeatherCard";

const meta = {
  title: "Features/Weather/TodayWeatherCard",
  component: TodayWeatherCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof TodayWeatherCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sunny: Story = {
  args: {
    forecast: {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "sunny",
      temperature: { high: 28, low: 16 },
      precipitation: 10,
      description: "晴れ時々曇り",
    },
  },
};

export const Rainy: Story = {
  args: {
    forecast: {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "rainy",
      temperature: { high: 18, low: 12 },
      precipitation: 80,
      description: "一日中雨",
    },
  },
};

export const Snowy: Story = {
  args: {
    forecast: {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "snowy",
      temperature: { high: 2, low: -3 },
      precipitation: 90,
      description: "大雪の恐れあり",
    },
  },
};

export const PartlyCloudy: Story = {
  args: {
    forecast: {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "partly-cloudy",
      temperature: { high: 22, low: 14 },
      precipitation: 30,
      description: "晴れ一時曇り",
    },
  },
};

export const Cloudy: Story = {
  args: {
    forecast: {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "cloudy",
      temperature: { high: 19, low: 13 },
      precipitation: 50,
      description: "曇り",
    },
  },
};
