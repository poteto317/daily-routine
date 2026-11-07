import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useLocalTodayKey: jest.fn(),
}));

import { useLocalTodayKey } from "@/hooks/useToday";
import { BudgetExpenseForm } from "../components/BudgetExpenseForm";

const props = {
  categories: [],
  expenseAmount: "0",
  expenseCategoryId: "",
  expenseDate: "2026-03-06",
  scrollRequestKey: 0,
  onAdd: jest.fn(),
  onAmountChange: jest.fn(),
  onCancel: jest.fn(),
  onCategoryIdChange: jest.fn(),
  onDateChange: jest.fn(),
};

// 0 円の通知の判定に使う今日は、共通フック useLocalTodayKey の値で決める。
// 時計（2026-03-07）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）。
// 直す前（描画のたびに new Date()）では時計の日で判定されるので、このテストは落ちる
describe("BudgetExpenseForm の 0 円の通知の今日は共通フック useLocalTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの今日（2026-03-05）では 03-06 は今日より前ではないので、0 円を通知する", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-05");

    render(<BudgetExpenseForm {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "0 円は、今日より前の日付だけ記録できます",
    );
  });

  it("フックの今日（2026-03-09）では 03-08 は今日より前なので、0 円を通知しない", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-09");

    render(<BudgetExpenseForm {...props} expenseDate="2026-03-08" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-06");
    const { rerender } = render(<BudgetExpenseForm {...props} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-07");
    rerender(<BudgetExpenseForm {...props} expenseCategoryId="c1" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
