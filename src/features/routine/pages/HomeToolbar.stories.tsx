import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HomeToolbar } from "./HomeToolbar";
import { baseDisplay, createBaseView, sampleTrainDelay } from "./__fixtures__/homeStoryFixtures";

// HomeToolbar は純粋な props コンポーネント。localStorage / API 依存なし。

const baseView = createBaseView();

const meta = {
  title: "Features/Routine/HomeToolbar",
  component: HomeToolbar,
  parameters: { layout: "padded" },
  args: {
    view: baseView,
    display: baseDisplay,
    trainDelays: [],
    onAddRoutineAction: fn(),
    showAddButton: true,
  },
} satisfies Meta<typeof HomeToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HolidayMode: Story = {
  args: {
    view: {
      ...baseView,
      isTodayHoliday: true,
      viewMode: "holiday",
    },
  },
};

export const WithTrainDelay: Story = {
  args: { trainDelays: [sampleTrainDelay] },
};

export const AllCompleted: Story = {
  args: {
    display: { completedMinutes: 90, totalMinutes: 90, progressPercentage: 100 },
  },
};

export const NoAddButton: Story = {
  args: { showAddButton: false },
};

export const CategoryFiltered: Story = {
  args: {
    view: { ...baseView, filterCategory: "health" },
  },
};

export const ClickAddButton: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /ルーティンを追加/i }));
    expect(args.onAddRoutineAction).toHaveBeenCalledTimes(1);
  },
};
