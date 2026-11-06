import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetMissingExpenseDays } from "./BudgetMissingExpenseDays";

// 日付は固定の値を使う（実行日から求める相対日付を使わない）
const octoberFirstThirtyDays = Array.from(
  { length: 30 },
  (_, index) => `2026-10-${String(index + 1).padStart(2, "0")}`,
);

const meta = {
  title: "Features/Budget/BudgetMissingExpenseDays",
  component: BudgetMissingExpenseDays,
  parameters: {
    layout: "padded",
  },
  args: {
    onSelectDate: fn(),
  },
} satisfies Meta<typeof BudgetMissingExpenseDays>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未入力の日が数日。日付のボタンを押すと onSelectDate が呼ばれる */
export const FewDays: Story = {
  args: {
    dates: ["2026-11-02", "2026-11-04", "2026-11-05"],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    );
    await expect(args.onSelectDate).toHaveBeenCalledWith("2026-11-04");
  },
};

/** 月末に今月の記録が 1 件も無い（30 件。折り返しの確認） */
export const ManyDaysAtMonthEnd: Story = {
  args: {
    dates: octoberFirstThirtyDays,
  },
};

/** 未入力の日が無い（何も表示しない） */
export const NoDays: Story = {
  args: {
    dates: [],
  },
};
