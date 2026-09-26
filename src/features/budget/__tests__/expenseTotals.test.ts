import type { Expense } from "@/types/routine";
import { calculateExpenseTotals } from "../utils/expenseTotals";

describe("calculateExpenseTotals", () => {
  const todayKey = "2026-03-07";

  it("支出が空配列の場合は 0 を返す", () => {
    expect(calculateExpenseTotals([], todayKey)).toEqual({
      todayExpense: 0,
      totalExpense: 0,
    });
  });

  it("今日以外の支出のみの場合、totalExpense に合算され todayExpense は 0", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1500, createdAt: "" },
      { id: "e2", date: "2026-03-05", amount: 2500, createdAt: "" },
    ];
    expect(calculateExpenseTotals(expenses, todayKey)).toEqual({
      todayExpense: 0,
      totalExpense: 4000,
    });
  });

  it("今日の支出のみの場合、totalExpense と todayExpense の両方に合算される", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-07", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-07", amount: 800, createdAt: "" },
    ];
    expect(calculateExpenseTotals(expenses, todayKey)).toEqual({
      todayExpense: 1800,
      totalExpense: 1800,
    });
  });

  it("今日と他日の支出が混在する場合、正しく振り分けて集計される", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-07", amount: 2000, createdAt: "" },
      { id: "e3", date: "2026-03-07", amount: 500, createdAt: "" },
      { id: "e4", date: "2026-03-08", amount: 3000, createdAt: "" },
    ];
    expect(calculateExpenseTotals(expenses, todayKey)).toEqual({
      todayExpense: 2500,
      totalExpense: 6500,
    });
  });
});
