import {
  createBudgetMonthNavigationDate,
  createInitialBudgetViewState,
  createOpenedExpenseFormState,
} from "../budgetViewStateActions";

describe("budgetViewStateActions", () => {
  it("初期 state を作る", () => {
    const initialDate = new Date("2026-03-07T12:00:00+09:00");
    const initialSnapshot = {
      monthKey: "2026-03",
      expenses: [
        {
          id: "e-mar",
          date: "2026-03-03",
          amount: 1000,
          createdAt: "2026-03-03T00:00:00.000Z",
        },
      ],
      defaultExpenseDate: "2026-03-07",
    };

    expect(createInitialBudgetViewState(initialDate, initialSnapshot)).toEqual({
      currentDate: initialDate,
      expenses: initialSnapshot.expenses,
      showExpenseForm: false,
      expenseAmount: "",
      expenseCategoryId: "",
      expenseDate: "2026-03-07",
    });
  });

  it("月移動先の日付を作る", () => {
    const currentDate = new Date("2026-03-07T12:00:00+09:00");

    expect(
      createBudgetMonthNavigationDate({
        direction: "current",
        currentDate,
        today: new Date("2026-03-10T12:00:00+09:00"),
      }),
    ).toEqual(new Date("2026-03-10T12:00:00+09:00"));
    // next/previous は shiftMonthToFirstDay を経由するため、日は保持されず常に
    // 移動先の月の1日になる（shiftMonthToFirstDayのオーバーフロー対策と仕様が揃っている）。
    expect(
      createBudgetMonthNavigationDate({ direction: "next", currentDate }),
    ).toEqual(new Date("2026-04-01T00:00:00+09:00"));
    expect(
      createBudgetMonthNavigationDate({ direction: "previous", currentDate }),
    ).toEqual(new Date("2026-02-01T00:00:00+09:00"));
  });

  it("月末日でも次月/前月の計算がオーバーフローしない（shiftMonthToFirstDayの回帰）", () => {
    // 31日を含む月の月末（例: 3/31）を基準にnext/previousを計算しても、
    // 素朴な setMonth の日オーバーフローで月がさらに1つ先に進んでしまう
    // ことがないことを確認する。
    const endOfMonth = new Date("2026-03-31T12:00:00+09:00");

    expect(
      createBudgetMonthNavigationDate({
        direction: "next",
        currentDate: endOfMonth,
      }),
    ).toEqual(new Date("2026-04-01T00:00:00+09:00"));
    expect(
      createBudgetMonthNavigationDate({
        direction: "previous",
        currentDate: endOfMonth,
      }),
    ).toEqual(new Date("2026-02-01T00:00:00+09:00"));
  });

  it("支出フォーム open state を作る", () => {
    expect(createOpenedExpenseFormState()).toEqual({
      showExpenseForm: true,
    });
  });
});
