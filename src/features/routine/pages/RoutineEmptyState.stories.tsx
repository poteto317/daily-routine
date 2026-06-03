import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineEmptyState } from "./RoutineEmptyState";

const meta = {
  title: "Features/Routine/RoutineEmptyState",
  component: RoutineEmptyState,
  parameters: { layout: "padded" },
  args: { onAddRoutineAction: fn() },
} satisfies Meta<typeof RoutineEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoRoutinesAtAll: Story = {
  args: {
    allRoutinesCount: 0,
    displayRoutinesCount: 0,
    filteredRoutinesCount: 0,
    isEditMode: false,
    viewMode: 1,
  },
};

export const NoRoutinesEditMode: Story = {
  args: {
    allRoutinesCount: 0,
    displayRoutinesCount: 0,
    filteredRoutinesCount: 0,
    isEditMode: true,
    viewMode: 1,
  },
};

export const NoDayRoutines: Story = {
  args: {
    allRoutinesCount: 5,
    displayRoutinesCount: 0,
    filteredRoutinesCount: 0,
    isEditMode: false,
    viewMode: 0,
  },
};

export const NoCategoryRoutines: Story = {
  args: {
    allRoutinesCount: 5,
    displayRoutinesCount: 3,
    filteredRoutinesCount: 0,
    isEditMode: false,
    viewMode: 1,
  },
};

/** 「最初のルーティンを追加」ボタンをクリック → onAddRoutineAction が呼ばれる */
export const ClickAddFirst: Story = {
  args: {
    allRoutinesCount: 0,
    displayRoutinesCount: 0,
    filteredRoutinesCount: 0,
    isEditMode: true,
    viewMode: 1,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", { name: /ルーティンを追加/ });
    await userEvent.click(addButton);
    expect(args.onAddRoutineAction).toHaveBeenCalledOnce();
  },
};
