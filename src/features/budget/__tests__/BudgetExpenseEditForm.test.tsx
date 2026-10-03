import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseEditForm } from "../components/BudgetExpenseEditForm";

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00.000Z" },
  { id: "cat-book", name: "書籍", createdAt: "2026-05-01T00:00:00.000Z" },
];

const renderForm = (overrides: Record<string, unknown> = {}) => {
  const handlers = {
    onCancelEdit: jest.fn(),
    onSaveEdit: jest.fn(),
    onEditDateChange: jest.fn(),
    onEditAmountChange: jest.fn(),
    onEditCategoryIdChange: jest.fn(),
  };
  render(
    <BudgetExpenseEditForm
      categories={categories}
      editingExpenseDate="2026-05-22"
      editingExpenseAmount="850"
      editingExpenseCategoryId="cat-lunch"
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

describe("BudgetExpenseEditForm", () => {
  it("編集中の日付・金額・カテゴリを入力欄に表示する", () => {
    renderForm();

    expect(screen.getByLabelText("日付（月）")).toHaveValue("2026-05");
    expect(screen.getByLabelText("日付（日）")).toHaveValue("2026-05-22");
    expect(screen.getByLabelText(/金額/)).toHaveValue(850);
    expect(screen.getByLabelText(/カテゴリ/)).toHaveValue("cat-lunch");
  });

  it("カテゴリの選択肢に、「選択しない」と全カテゴリを表示する", () => {
    renderForm();

    const options = screen
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(options).toEqual(
      expect.arrayContaining(["選択しない", "ランチ", "書籍"]),
    );
  });

  it("時刻の入力欄は表示しない（追加時刻であり、実際に使った時刻ではないため）", () => {
    renderForm();

    expect(screen.queryByLabelText("時刻")).not.toBeInTheDocument();
    expect(document.querySelector('input[type="time"]')).toBeNull();
  });

  it("入力の変更が、対応するハンドラへ委譲される", () => {
    const handlers = renderForm();

    fireEvent.change(screen.getByLabelText("日付（日）"), {
      target: { value: "2026-05-25" },
    });
    fireEvent.change(screen.getByLabelText(/金額/), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/カテゴリ/), {
      target: { value: "cat-book" },
    });

    expect(handlers.onEditDateChange).toHaveBeenCalledWith("2026-05-25");
    expect(handlers.onEditAmountChange).toHaveBeenCalledWith("1000");
    expect(handlers.onEditCategoryIdChange).toHaveBeenCalledWith("cat-book");
  });

  it("保存・キャンセルのボタンで、それぞれのハンドラを呼ぶ", () => {
    const handlers = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(handlers.onSaveEdit).toHaveBeenCalledTimes(1);
    expect(handlers.onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("編集・削除のボタンは表示しない（編集専用）", () => {
    renderForm();

    expect(
      screen.queryByRole("button", { name: /の支出を編集/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /の支出を削除/ }),
    ).not.toBeInTheDocument();
  });

  describe("0 円が保存できない組み合わせの通知", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-05-22T12:00:00+09:00"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("今日の日付の支出を 0 円にすると、理由を通知し、金額欄を無効（aria-invalid）にする", () => {
      renderForm({
        editingExpenseDate: "2026-05-22",
        editingExpenseAmount: "0",
      });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "0 円は、今日より前の日付だけ記録できます",
      );
      const amountInput = screen.getByLabelText(/金額/);
      expect(amountInput).toHaveAttribute("aria-invalid", "true");
      expect(amountInput).toHaveAttribute(
        "aria-describedby",
        screen.getByRole("alert").getAttribute("id"),
      );
    });

    it("過去の日付の支出を 0 円にしても、通知しない", () => {
      renderForm({
        editingExpenseDate: "2026-05-21",
        editingExpenseAmount: "0",
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText(/金額/)).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });

    it("0 円以外の金額は、今日の日付でも通知しない", () => {
      renderForm({
        editingExpenseDate: "2026-05-22",
        editingExpenseAmount: "850",
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
