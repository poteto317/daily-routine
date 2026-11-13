import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Routine } from "@/types/routine";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { RoutineItem } from "./RoutineItem";

// RoutineItem は useSwipeActionSetting() で設定を読む。localStorage が空のときは
// DEFAULT_SETTINGS の値になるため、追加モックなしで描画可能。swipeAction バリエーションのみ beforeEach で設定する。

const meta = {
  title: "Features/Routine/RoutineItem",
  component: RoutineItem,
  parameters: { layout: "padded" },
  args: {
    onToggle: fn(),
    onEdit: fn(),
    onDelete: fn(),
    isEditMode: false,
  },
} satisfies Meta<typeof RoutineItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const routine: Routine = {
  id: "r-1",
  title: "朝のストレッチ",
  startTime: "07:00",
  duration: 15,
  category: "health",
  daysOfWeek: [1, 2, 3, 4, 5],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00+09:00",
  updatedAt: "2026-01-01T00:00:00+09:00",
};

export const Default: Story = {
  args: { routine, isEditMode: false },
};

export const Completed: Story = {
  args: { routine: { ...routine, isCompleted: true }, isEditMode: false },
};

export const EditMode: Story = {
  args: { routine, isEditMode: true },
};

export const SwipeActionEdit: Story = {
  args: { routine, isEditMode: false },
  beforeEach() {
    saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    return () => saveSettings(DEFAULT_SETTINGS);
  },
};

export const ClickToggle: Story = {
  args: { routine, isEditMode: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText("朝のストレッチ");
    await userEvent.click(card);
    expect(args.onToggle).toHaveBeenCalledWith("r-1");
  },
};

export const ClickEditButton: Story = {
  args: { routine, isEditMode: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onEdit).toHaveBeenCalledOnce();
  },
};

export const ClickDeleteButton: Story = {
  args: { routine, isEditMode: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDelete).toHaveBeenCalledWith("r-1");
  },
};
