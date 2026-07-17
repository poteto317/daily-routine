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
    expect(
      createBudgetMonthNavigationDate({ direction: "next", currentDate }),
    ).toEqual(new Date("2026-04-07T12:00:00+09:00"));
    expect(
      createBudgetMonthNavigationDate({ direction: "previous", currentDate }),
    ).toEqual(new Date("2026-02-07T12:00:00+09:00"));
  });

  it("支出フォーム open state を作る", () => {
    expect(createOpenedExpenseFormState()).toEqual({
      showExpenseForm: true,
    });
  });
});
