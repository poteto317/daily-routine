import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseForm } from "../components/BudgetExpenseForm";

const renderForm = (overrides: Record<string, unknown> = {}) => {
  const handlers = {
    onAdd: jest.fn(),
    onAmountChange: jest.fn(),
    onCancel: jest.fn(),
    onCategoryIdChange: jest.fn(),
    onDateChange: jest.fn(),
  };
  render(
    <BudgetExpenseForm
      categories={[]}
      expenseAmount=""
      expenseCategoryId=""
      expenseDate="2026-03-07"
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

describe("BudgetExpenseForm", () => {
  it("0 円の入力の案内（今日より前の日付のみ、残り日数に含めない）を表示する", () => {
    renderForm();

    const hint = screen.getByText(/0 を入力して記録できます/);
    expect(hint).toHaveTextContent("今日より前の日付のみ");
    expect(hint).toHaveTextContent("残り日数に含めません");
  });

  it("案内は、金額の入力欄に関連付けられている（スクリーンリーダーで読み上げられる）", () => {
    renderForm();

    const amountInput = screen.getByPlaceholderText("例: 1500");
    const describedBy = amountInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      "0 を入力して記録できます",
    );
  });

  it("金額の入力と追加ボタンが、ハンドラへ委譲される", () => {
    const handlers = renderForm();

    fireEvent.change(screen.getByPlaceholderText("例: 1500"), {
      target: { value: "0" },
    });
    fireEvent.click(screen.getByRole("button", { name: "追加" }));

    expect(handlers.onAmountChange).toHaveBeenCalledWith("0");
    expect(handlers.onAdd).toHaveBeenCalledTimes(1);
  });

  describe("0 円が保存できない組み合わせの通知", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("今日の日付で 0 円を入力すると、理由を通知し、金額欄を無効（aria-invalid）にする", () => {
      renderForm({ expenseAmount: "0", expenseDate: "2026-03-07" });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "0 円は、今日より前の日付だけ記録できます",
      );
      const amountInput = screen.getByPlaceholderText("例: 1500");
      expect(amountInput).toHaveAttribute("aria-invalid", "true");
      const describedBy = amountInput.getAttribute("aria-describedby") ?? "";
      expect(describedBy.split(" ")).toContain(
        screen.getByRole("alert").getAttribute("id"),
      );
    });

    it("未来の日付で 0 円を入力したときも、通知する", () => {
      renderForm({ expenseAmount: "0", expenseDate: "2026-03-08" });

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("今日より前の日付の 0 円は、通知しない（記録できる）", () => {
      renderForm({ expenseAmount: "0", expenseDate: "2026-03-06" });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("例: 1500")).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });

    it("0 円以外の金額・空の金額は、今日の日付でも通知しない", () => {
      const { unmount } = render(
        <BudgetExpenseForm
          categories={[]}
          expenseAmount="100"
          expenseCategoryId=""
          expenseDate="2026-03-07"
          onAdd={jest.fn()}
          onAmountChange={jest.fn()}
          onCancel={jest.fn()}
          onCategoryIdChange={jest.fn()}
          onDateChange={jest.fn()}
        />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      unmount();

      renderForm({ expenseAmount: "", expenseDate: "2026-03-07" });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
