import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { MealRecentSection } from "./MealRecentSection";
import type { MealRecord } from "@/types/routine";

const meta = {
  title: "Features/Meal/MealRecentSection",
  component: MealRecentSection,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-22",
    onDeleteMeal: fn(),
  },
} satisfies Meta<typeof MealRecentSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const recentMeals: MealRecord[] = [
  {
    id: "meal-1",
    date: "2026-05-22",
    mealType: "breakfast",
    time: "07:30",
    description: "オートミール、ゆで卵、バナナ",
    createdAt: "2026-05-22T07:30:00+09:00",
    updatedAt: "2026-05-22T07:30:00+09:00",
  },
  {
    id: "meal-2",
    date: "2026-05-21",
    mealType: "dinner",
    time: "19:00",
    description: "鶏むね肉のソテー、ブロッコリー、玄米",
    notes: "ヘルシーな夕食",
    createdAt: "2026-05-21T19:00:00+09:00",
    updatedAt: "2026-05-21T19:00:00+09:00",
  },
  {
    id: "meal-3",
    date: "2026-05-21",
    mealType: "lunch",
    time: "12:00",
    description: "カレーライス",
    createdAt: "2026-05-21T12:00:00+09:00",
    updatedAt: "2026-05-21T12:00:00+09:00",
  },
];

export const Empty: Story = {
  args: { meals: [] },
};

export const WithTodayMeals: Story = {
  args: { meals: [recentMeals[0]] },
};

export const MultiDayHistory: Story = {
  args: { meals: recentMeals },
};

export const ClickDelete: Story = {
  args: { meals: [recentMeals[0]] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deleteButton = canvas.getByRole("button", { name: /削除/ });
    await userEvent.click(deleteButton);
    expect(args.onDeleteMeal).toHaveBeenCalledWith("2026-05-22", "meal-1");
  },
};
