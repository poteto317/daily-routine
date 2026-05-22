import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HourlyForecastSection } from "./HourlyForecastSection";
import type { HourlyWeatherForecast } from "@/types/routine";

const meta = {
  title: "Features/Weather/HourlyForecastSection",
  component: HourlyForecastSection,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HourlyForecastSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const hourly: HourlyWeatherForecast[] = [
  { time: "2026-05-22T06:00:00", weather: "sunny",        temperature: 18, precipitation: 5,  humidity: 60, windSpeed: 3 },
  { time: "2026-05-22T09:00:00", weather: "sunny",        temperature: 22, precipitation: 5,  humidity: 55, windSpeed: 4 },
  { time: "2026-05-22T12:00:00", weather: "partly-cloudy", temperature: 26, precipitation: 10, humidity: 50, windSpeed: 5 },
  { time: "2026-05-22T15:00:00", weather: "partly-cloudy", temperature: 28, precipitation: 15, humidity: 48, windSpeed: 6 },
  { time: "2026-05-22T18:00:00", weather: "cloudy",        temperature: 24, precipitation: 30, humidity: 60, windSpeed: 4 },
  { time: "2026-05-22T21:00:00", weather: "cloudy",        temperature: 20, precipitation: 20, humidity: 70, windSpeed: 3 },
];

export const Today: Story = {
  args: { hourly },
};

export const WithDateLabel: Story = {
  args: { hourly, selectedDateLabel: "2026年5月22日（金）の時間帯別予報" },
};

export const Empty: Story = {
  args: { hourly: [] },
};
