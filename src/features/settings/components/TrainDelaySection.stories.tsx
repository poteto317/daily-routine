import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TrainDelaySection } from "./TrainDelaySection";
import { AVAILABLE_LINES } from "../state/constants";

const meta = {
  title: "Features/Settings/TrainDelaySection",
  component: TrainDelaySection,
  parameters: {
    layout: "padded",
  },
  args: {
    setTrainDelayEnabled: fn(),
    setSelectedLineInput: fn(),
    handleAddLine: fn(),
    handleRemoveLine: fn(),
  },
} satisfies Meta<typeof TrainDelaySection>;

export default meta;
type Story = StoryObj<typeof meta>;

const availableLines = AVAILABLE_LINES.map((l) => ({
  id: l.id,
  name: l.name,
  company: l.company,
}));

export const Disabled: Story = {
  args: {
    trainDelayEnabled: false,
    selectedLineInput: "",
    availableLines,
    monitoredLines: [],
  },
};

export const EnabledNoLines: Story = {
  args: {
    trainDelayEnabled: true,
    selectedLineInput: "",
    availableLines,
    monitoredLines: [],
  },
};

export const EnabledWithLines: Story = {
  args: {
    trainDelayEnabled: true,
    selectedLineInput: "",
    availableLines,
    monitoredLines: [
      { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
      { lineId: "chuo", lineName: "中央線", company: "JR東日本" },
    ],
  },
};

export const LineSelected: Story = {
  args: {
    trainDelayEnabled: true,
    selectedLineInput: "ginza",
    availableLines,
    monitoredLines: [
      { lineId: "yamanote", lineName: "山手線", company: "JR東日本" },
    ],
  },
};

export const ToggleEnable: Story = {
  args: {
    trainDelayEnabled: false,
    selectedLineInput: "",
    availableLines,
    monitoredLines: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByRole("button");
    await userEvent.click(toggleButton);
    expect(args.setTrainDelayEnabled).toHaveBeenCalledWith(true);
  },
};
