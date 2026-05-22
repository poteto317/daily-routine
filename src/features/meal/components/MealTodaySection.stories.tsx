import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { MealTodaySection } from "./MealTodaySection";
import type { MealRecord } from "@/types/routine";

const meta = {
  title: "Features/Meal/MealTodaySection",
  component: MealTodaySection,
  parameters: {
    layout: "padded",
  },
  args: {
    today: "2026-05-22",
    showForm: false,
    form: null,
    onDeleteMeal: fn(),
    onOpenForm: fn(),
  },
} satisfies Meta<typeof MealTodaySection>;

export default meta;
type Story = StoryObj<typeof meta>;

const todayMeals: MealRecord[] = [
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
    date: "2026-05-22",
    mealType: "lunch",
    time: "12:15",
    description: "鶏むね肉のサラダ、玄米",
    notes: "タンパク質多め",
    createdAt: "2026-05-22T12:15:00+09:00",
    updatedAt: "2026-05-22T12:15:00+09:00",
  },
];

export const Empty: Story = {
  args: { meals: [] },
};

export const WithMeals: Story = {
  args: { meals: todayMeals },
};

export const ShowingForm: Story = {
  args: {
    meals: todayMeals,
    showForm: true,
    form: (
      <div className="mt-4 p-4 bg-white rounded-lg border border-green-200 text-sm text-gray-500">
        （フォームコンポーネントはここに挿入されます）
      </div>
    ),
  },
};
