import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Routine } from "@/types/routine";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { SortableRoutineItem } from "./SortableRoutineItem";

// isEditMode=true のとき内部で SortableRoutineEditModeItem → useSortable が使われるため
// DnD コンテキストが必要。isEditMode=false のときは不要だが decorator は無害。
const withSortableContext: Decorator = (Story) => (
  <DndContext>
    <SortableContext items={["r-1"]} strategy={verticalListSortingStrategy}>
      <Story />
    </SortableContext>
  </DndContext>
);

const meta = {
  title: "Features/Routine/SortableRoutineItem",
  component: SortableRoutineItem,
  parameters: { layout: "padded" },
  decorators: [withSortableContext],
  args: {
    onToggle: fn(),
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof SortableRoutineItem>;

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

export const ViewMode: Story = {
  args: { routine, isEditMode: false },
};

export const EditMode: Story = {
  args: { routine, isEditMode: true },
};

export const CompletedViewMode: Story = {
  args: { routine: { ...routine, isCompleted: true }, isEditMode: false },
};

export const CompletedEditMode: Story = {
  args: { routine: { ...routine, isCompleted: true }, isEditMode: true },
};

export const SwipeActionEdit: Story = {
  args: { routine, isEditMode: false },
  beforeEach() {
    saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    return () => saveSettings(DEFAULT_SETTINGS);
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
