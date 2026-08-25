import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { WeeklyForecastSection } from "./WeeklyForecastSection";
import type { WeatherForecast } from "@/types/routine";

const meta = {
  title: "Features/Weather/WeeklyForecastSection",
  component: WeeklyForecastSection,
  parameters: { layout: "padded" },
  args: { onSelectDate: fn() },
} satisfies Meta<typeof WeeklyForecastSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const forecasts: WeatherForecast[] = [
  {
    date: "2026-05-22",
    dayOfWeek: "金",
    weather: "sunny",
    temperature: { high: 28, low: 16 },
    precipitation: 10,
    description: "晴れ",
  },
  {
    date: "2026-05-23",
    dayOfWeek: "土",
    weather: "partly-cloudy",
    temperature: { high: 25, low: 15 },
    precipitation: 20,
    description: "晴れ時々曇り",
  },
  {
    date: "2026-05-24",
    dayOfWeek: "日",
    weather: "cloudy",
    temperature: { high: 20, low: 13 },
    precipitation: 40,
    description: "曇り",
  },
  {
    date: "2026-05-25",
    dayOfWeek: "月",
    weather: "rainy",
    temperature: { high: 17, low: 12 },
    precipitation: 80,
    description: "雨",
  },
  {
    date: "2026-05-26",
    dayOfWeek: "火",
    weather: "rainy",
    temperature: { high: 16, low: 11 },
    precipitation: 70,
    description: "曇り時々雨",
  },
  {
    date: "2026-05-27",
    dayOfWeek: "水",
    weather: "sunny",
    temperature: { high: 24, low: 14 },
    precipitation: 15,
    description: "晴れ",
  },
  {
    date: "2026-05-28",
    dayOfWeek: "木",
    weather: "sunny",
    temperature: { high: 26, low: 15 },
    precipitation: 10,
    description: "晴れ",
  },
];

export const NoneSelected: Story = {
  args: { forecasts, selectedDate: null },
};

export const TodaySelected: Story = {
  args: { forecasts, selectedDate: "2026-05-22" },
};

export const MidWeekSelected: Story = {
  args: { forecasts, selectedDate: "2026-05-25" },
};

/** 天気カードをクリック → onSelectDate が呼ばれる */
export const ClickForecastCard: Story = {
  args: { forecasts, selectedDate: null },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const [firstCard] = canvas.getAllByRole("button");
    await userEvent.click(firstCard);
    expect(args.onSelectDate).toHaveBeenCalledWith("2026-05-22");
  },
};
