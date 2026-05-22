import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MonitoredLinesList } from "./MonitoredLinesList";
import type { MonitoredLine } from "../state/constants";

const meta = {
  title: "Features/Settings/MonitoredLinesList",
  component: MonitoredLinesList,
  parameters: {
    layout: "padded",
  },
  args: {
    handleRemoveLine: fn(),
  },
} satisfies Meta<typeof MonitoredLinesList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleLines: MonitoredLine[] = [
  { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
  { lineId: "chuo", lineName: "中央線", company: "JR東日本" },
  { lineId: "den-en-toshi", lineName: "田園都市線", company: "東急電鉄" },
];

export const Empty: Story = {
  args: { monitoredLines: [] },
};

export const SingleLine: Story = {
  args: {
    monitoredLines: [
      { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
    ],
  },
};

export const MultipleLines: Story = {
  args: { monitoredLines: sampleLines },
};

export const RemoveLine: Story = {
  args: { monitoredLines: sampleLines },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const removeButtons = canvas.getAllByRole("button");
    await userEvent.click(removeButtons[0]);
    expect(args.handleRemoveLine).toHaveBeenCalledWith("yamanote");
  },
};
