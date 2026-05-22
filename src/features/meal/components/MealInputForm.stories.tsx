import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MealInputForm } from "./MealInputForm";

const meta = {
  title: "Features/Meal/MealInputForm",
  component: MealInputForm,
  parameters: {
    layout: "padded",
  },
  args: {
    onCancel: fn(),
    onDescriptionChange: fn(),
    onMealTypeChange: fn(),
    onNotesChange: fn(),
    onSave: fn(),
    onTimeChange: fn(),
  },
} satisfies Meta<typeof MealInputForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BreakfastEmpty: Story = {
  args: {
    mealTypeInput: "breakfast",
    timeInput: "07:30",
    descriptionInput: "",
    notesInput: "",
  },
};

export const LunchWithContent: Story = {
  args: {
    mealTypeInput: "lunch",
    timeInput: "12:15",
    descriptionInput: "カレーライス、サラダ、味噌汁",
    notesInput: "少し食べすぎた",
  },
};

export const DinnerWithContent: Story = {
  args: {
    mealTypeInput: "dinner",
    timeInput: "19:00",
    descriptionInput: "鶏むね肉のソテー、ブロッコリー、玄米",
    notesInput: "",
  },
};

export const Snack: Story = {
  args: {
    mealTypeInput: "snack",
    timeInput: "15:00",
    descriptionInput: "ナッツ、ヨーグルト",
    notesInput: "",
  },
};

export const ClickSave: Story = {
  args: {
    mealTypeInput: "lunch",
    timeInput: "12:00",
    descriptionInput: "サンドイッチ",
    notesInput: "",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const saveButton = canvas.getByRole("button", { name: /保存|記録/ });
    await userEvent.click(saveButton);
    expect(args.onSave).toHaveBeenCalledOnce();
  },
};
