import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useLocalTodayKey: jest.fn(),
}));

import { useLocalTodayKey } from "@/hooks/useToday";
import { BudgetExpenseEditForm } from "../components/BudgetExpenseEditForm";

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00.000Z" },
  { id: "cat-book", name: "書籍", createdAt: "2026-05-01T00:00:00.000Z" },
];

const props = {
  categories,
  editingExpenseDate: "2026-05-21",
  editingExpenseAmount: "0",
  editingExpenseCategoryId: "cat-lunch",
  onCancelEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onEditDateChange: jest.fn(),
  onEditAmountChange: jest.fn(),
  onEditCategoryIdChange: jest.fn(),
};

// 0 円の通知の判定に使う今日は、共通フック useLocalTodayKey の値で決める。
// 時計（2026-05-22）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）。
// 直す前（描画のたびに new Date()）では時計の日で判定されるので、このテストは落ちる
describe("BudgetExpenseEditForm の 0 円の通知の今日は共通フック useLocalTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-05-22T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの今日（2026-05-20）では 05-21 は今日より前ではないので、0 円を通知する", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-20");

    render(<BudgetExpenseEditForm {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "0 円は、今日より前の日付だけ記録できます",
    );
  });

  it("フックの今日（2026-05-24）では 05-23 は今日より前なので、0 円を通知しない", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-24");

    render(
      <BudgetExpenseEditForm {...props} editingExpenseDate="2026-05-23" />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-21");
    const { rerender } = render(<BudgetExpenseEditForm {...props} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-22");
    rerender(
      <BudgetExpenseEditForm {...props} editingExpenseCategoryId="cat-book" />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
