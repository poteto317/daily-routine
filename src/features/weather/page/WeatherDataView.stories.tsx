import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import type { WeatherData } from "../api";
import { WeatherDataView } from "./WeatherDataView";

const meta = {
  title: "Features/Weather/WeatherDataView",
  component: WeatherDataView,
  parameters: { layout: "padded" },
  args: {
    isLocationLoading: false,
    hasPreferredLocation: false,
    onUseCurrentLocation: fn(),
    onResetPreferredLocation: fn(),
  },
} satisfies Meta<typeof WeatherDataView>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: WeatherData = {
  location: "東京",
  lastUpdated: "2026-05-22T08:00:00+09:00",
  forecasts: [
    {
      date: "2026-05-22",
      dayOfWeek: "金",
      weather: "sunny",
      temperature: { high: 26, low: 18 },
      precipitation: 0,
      description: "晴れ",
    },
    {
      date: "2026-05-23",
      dayOfWeek: "土",
      weather: "partly-cloudy",
      temperature: { high: 24, low: 17 },
      precipitation: 10,
      description: "晴れ時々曇り",
    },
    {
      date: "2026-05-24",
      dayOfWeek: "日",
      weather: "rainy",
      temperature: { high: 20, low: 16 },
      precipitation: 80,
      description: "雨",
    },
    {
      date: "2026-05-25",
      dayOfWeek: "月",
      weather: "cloudy",
      temperature: { high: 22, low: 15 },
      precipitation: 20,
      description: "曇り",
    },
    {
      date: "2026-05-26",
      dayOfWeek: "火",
      weather: "sunny",
      temperature: { high: 25, low: 17 },
      precipitation: 0,
      description: "晴れ",
    },
    {
      date: "2026-05-27",
      dayOfWeek: "水",
      weather: "sunny",
      temperature: { high: 27, low: 19 },
      precipitation: 0,
      description: "晴れ",
    },
    {
      date: "2026-05-28",
      dayOfWeek: "木",
      weather: "partly-cloudy",
      temperature: { high: 25, low: 18 },
      precipitation: 10,
      description: "晴れ時々曇り",
    },
  ],
  hourly: [
    { time: "2026-05-22T06:00:00+09:00", weather: "sunny", temperature: 19, precipitation: 0, humidity: 60, windSpeed: 3 },
    { time: "2026-05-22T09:00:00+09:00", weather: "sunny", temperature: 22, precipitation: 0, humidity: 55, windSpeed: 4 },
    { time: "2026-05-22T12:00:00+09:00", weather: "sunny", temperature: 25, precipitation: 0, humidity: 50, windSpeed: 5 },
    { time: "2026-05-22T15:00:00+09:00", weather: "partly-cloudy", temperature: 26, precipitation: 0, humidity: 52, windSpeed: 4 },
    { time: "2026-05-22T18:00:00+09:00", weather: "partly-cloudy", temperature: 23, precipitation: 0, humidity: 58, windSpeed: 3 },
    { time: "2026-05-22T21:00:00+09:00", weather: "cloudy", temperature: 20, precipitation: 5, humidity: 65, windSpeed: 2 },
  ],
};

export const Default: Story = {
  args: { data: sampleData },
};

export const WithPreferredLocation: Story = {
  args: { data: sampleData, hasPreferredLocation: true },
};

export const LocationLoading: Story = {
  args: { data: sampleData, isLocationLoading: true },
};

export const NoHourly: Story = {
  args: { data: { ...sampleData, hourly: undefined } },
};
