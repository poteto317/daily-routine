import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Routine } from "@/types/routine";
import { SortableRoutineEditModeItem } from "./SortableRoutineEditModeItem";

const withSortableContext: Decorator = (Story) => (
  <DndContext>
    <SortableContext items={["r-1"]} strategy={verticalListSortingStrategy}>
      <Story />
    </SortableContext>
  </DndContext>
);

const meta = {
  title: "Features/Routine/SortableRoutineEditModeItem",
  component: SortableRoutineEditModeItem,
  parameters: { layout: "padded" },
  decorators: [withSortableContext],
  args: {
    onEditAction: fn(),
    onDeleteAction: fn(),
    onSwipeAction: fn(),
    swipeActionType: "delete",
  },
} satisfies Meta<typeof SortableRoutineEditModeItem>;

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
  args: { routine, swipeActionType: "delete" },
};

export const Completed: Story = {
  args: {
    routine: { ...routine, isCompleted: true },
    swipeActionType: "delete",
  },
};

export const SwipeEdit: Story = {
  args: { routine, swipeActionType: "edit" },
};

export const ClickEdit: Story = {
  args: { routine, swipeActionType: "delete" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editButton = canvas.getByRole("button", { name: /編集/ });
    await userEvent.click(editButton);
    expect(args.onEditAction).toHaveBeenCalledOnce();
  },
};

export const ClickDelete: Story = {
  args: { routine, swipeActionType: "delete" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDeleteAction).toHaveBeenCalledOnce();
  },
};
