import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { RoutineFormCoreFields } from "./RoutineFormCoreFields";

const meta = {
  title: "Features/Routine/RoutineFormCoreFields",
  component: RoutineFormCoreFields,
  parameters: {
    layout: "padded",
  },
  args: {
    setCategory: fn(),
    toggleDay: fn(),
    setTitle: fn(),
  },
} satisfies Meta<typeof RoutineFormCoreFields>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {
    routine: undefined,
    title: "",
    category: "health",
    daysOfWeek: [1, 2, 3, 4, 5],
  },
};

export const CreateModeNoDaysSelected: Story = {
  args: {
    routine: undefined,
    title: "朝のストレッチ",
    category: "health",
    daysOfWeek: [],
  },
};

export const EditMode: Story = {
  args: {
    routine: {
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
    },
    title: "朝のストレッチ",
    category: "health",
    daysOfWeek: [1, 2, 3, 4, 5],
  },
};

export const ToggleDay: Story = {
  args: {
    routine: undefined,
    title: "ランニング",
    category: "health",
    daysOfWeek: [1, 2, 3, 4, 5],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saturdayButton = canvas.getByRole("button", { name: /土/ });
    await userEvent.click(saturdayButton);
    expect(args.toggleDay).toHaveBeenCalledWith(6);
  },
};

export const SelectCategory: Story = {
  args: {
    routine: undefined,
    title: "ギター練習",
    category: "health",
    daysOfWeek: [1, 2, 3, 4, 5],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const hobbyButton = canvas.getByRole("button", { name: /趣味/ });
    await userEvent.click(hobbyButton);
    expect(args.setCategory).toHaveBeenCalledWith("hobby");
  },
};
