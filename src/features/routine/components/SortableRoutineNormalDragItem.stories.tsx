import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Routine } from "@/types/routine";
import { SortableRoutineNormalDragItem } from "./SortableRoutineNormalDragItem";

const withSortableContext: Decorator = (Story) => (
  <DndContext>
    <SortableContext items={["r-1"]} strategy={verticalListSortingStrategy}>
      <Story />
    </SortableContext>
  </DndContext>
);

const meta = {
  title: "Features/Routine/SortableRoutineNormalDragItem",
  component: SortableRoutineNormalDragItem,
  parameters: { layout: "padded" },
  decorators: [withSortableContext],
  args: {
    onToggleAction: fn(),
    isDragActive: false,
  },
} satisfies Meta<typeof SortableRoutineNormalDragItem>;

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
  args: { routine, isDragActive: false },
};

export const Completed: Story = {
  args: { routine: { ...routine, isCompleted: true }, isDragActive: false },
};

export const DragActive: Story = {
  args: { routine, isDragActive: true },
};

export const ClickToToggle: Story = {
  args: { routine, isDragActive: false },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText("朝のストレッチ");
    await userEvent.click(card);
    expect(args.onToggleAction).toHaveBeenCalledWith("r-1");
  },
};

export const NoToggleWhileDragging: Story = {
  args: { routine, isDragActive: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByText("朝のストレッチ");
    await userEvent.click(card);
    expect(args.onToggleAction).not.toHaveBeenCalled();
  },
};
