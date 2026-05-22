import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MealHeader } from "./MealHeader";

const meta = {
  title: "Features/Meal/MealHeader",
  component: MealHeader,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof MealHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
