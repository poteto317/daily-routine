import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CategoryFilter } from "./CategoryFilter";

const meta = {
  title: "Features/Routine/CategoryFilter",
  component: CategoryFilter,
  parameters: { layout: "padded" },
  args: { onFilterChangeAction: fn() },
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  args: { filterCategory: "all" },
};

export const Health: Story = {
  args: { filterCategory: "health" },
};

export const Study: Story = {
  args: { filterCategory: "study" },
};

export const Work: Story = {
  args: { filterCategory: "work" },
};
