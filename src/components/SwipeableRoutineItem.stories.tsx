import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SwipeableRoutineItem } from "./SwipeableRoutineItem";

type Props = React.ComponentProps<typeof SwipeableRoutineItem>;

const SampleContent = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      朝のストレッチ
    </span>
    <span className="text-xs text-gray-400">07:00〜07:15</span>
  </div>
);

// children は Storybook Controls で扱えないため wrapper で固定する
const SwipeableRoutineItemWrapper = (args: Omit<Props, "children">) => (
  <SwipeableRoutineItem {...args}>
    <SampleContent />
  </SwipeableRoutineItem>
);

const meta = {
  title: "Components/SwipeableRoutineItem",
  component: SwipeableRoutineItemWrapper,
  parameters: { layout: "padded" },
  args: {
    onSwipeAction: fn(),
    swipeActionType: "delete",
    isEditMode: false,
  },
  argTypes: {
    swipeActionType: { control: { type: "select" }, options: ["delete", "edit", "indent"] },
  },
} satisfies Meta<typeof SwipeableRoutineItemWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DeleteSwipe: Story = {
  args: { swipeActionType: "delete", isEditMode: false },
};

export const EditSwipe: Story = {
  args: { swipeActionType: "edit", isEditMode: false },
};

export const IndentSwipe: Story = {
  args: { swipeActionType: "indent", isEditMode: false },
};

export const EditModeSwipeActive: Story = {
  args: { swipeActionType: "delete", isEditMode: true },
};

export const WithButtonChild: Story = {
  args: { swipeActionType: "delete", isEditMode: false },
  render: (args) => (
    <SwipeableRoutineItem {...args}>
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <button
          type="button"
          className="text-sm font-medium text-blue-600"
        >
          クリックできるボタン
        </button>
      </div>
    </SwipeableRoutineItem>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "クリックできるボタン" });
    await userEvent.click(button);
    expect(args.onSwipeAction).not.toHaveBeenCalled();
  },
};
