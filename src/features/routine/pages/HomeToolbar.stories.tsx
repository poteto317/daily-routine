import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { HomeToolbar } from "./HomeToolbar";
import { baseDisplay, createBaseView, sampleTrainDelay } from "./__fixtures__/homeStoryFixtures";

// HomeToolbar は純粋な props コンポーネント。localStorage / API 依存なし。

// ストーリーごとに独立した fn() インスタンスを持つため、meta.args は使わずに
// 各ストーリーでこのファクトリを呼び出す。
const createBaseArgs = () => ({
  view: createBaseView(),
  display: baseDisplay,
  trainDelays: [],
  onAddRoutineAction: fn(),
  showAddButton: true,
});

const meta = {
  title: "Features/Routine/HomeToolbar",
  component: HomeToolbar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HomeToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: createBaseArgs(),
};

export const HolidayMode: Story = {
  args: (() => {
    const { view, ...rest } = createBaseArgs();
    return { ...rest, view: { ...view, isTodayHoliday: true, viewMode: "holiday" } };
  })(),
};

export const WithTrainDelay: Story = {
  args: { ...createBaseArgs(), trainDelays: [sampleTrainDelay] },
};

export const AllCompleted: Story = {
  args: {
    ...createBaseArgs(),
    display: { completedMinutes: 90, totalMinutes: 90, progressPercentage: 100 },
  },
};

export const NoAddButton: Story = {
  args: { ...createBaseArgs(), showAddButton: false },
};

export const CategoryFiltered: Story = {
  args: (() => {
    const { view, ...rest } = createBaseArgs();
    return { ...rest, view: { ...view, filterCategory: "health" } };
  })(),
};

export const ClickAddButton: Story = {
  args: createBaseArgs(),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /ルーティンを追加/i }));
    expect(args.onAddRoutineAction).toHaveBeenCalledTimes(1);
  },
};
