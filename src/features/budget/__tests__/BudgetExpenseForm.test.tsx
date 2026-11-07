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
      scrollRequestKey={0}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
};

const renderFormWithRerender = () => {
  const props = {
    categories: [],
    expenseAmount: "",
    expenseCategoryId: "",
    expenseDate: "2026-03-07",
    scrollRequestKey: 0,
    onAdd: jest.fn(),
    onAmountChange: jest.fn(),
    onCancel: jest.fn(),
    onCategoryIdChange: jest.fn(),
    onDateChange: jest.fn(),
  };
  const { rerender } = render(<BudgetExpenseForm {...props} />);
  return { rerender, props };
};

describe("BudgetExpenseForm", () => {
  describe("開いたときのスクロール", () => {
    // jsdom は scrollIntoView を実装していないため、このブロックの中だけ差し替える
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    let scrollIntoView: jest.Mock;

    beforeEach(() => {
      scrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    });

    it("マウント時に 1 回、フォームの外枠を block: nearest で見える位置へスクロールする", () => {
      renderForm();

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
      const scrolledElement = scrollIntoView.mock.contexts[0] as HTMLElement;
      expect(scrolledElement).toContainElement(
        screen.getByRole("heading", { name: "支出を記録" }),
      );
      expect(scrolledElement).toContainElement(
        screen.getByRole("button", { name: "追加" }),
      );
    });

    it("日付が同じ再描画（金額・カテゴリの入力など）では、スクロールは増えない", () => {
      const { rerender, props } = renderFormWithRerender();

      rerender(<BudgetExpenseForm {...props} expenseAmount="1200" />);
      rerender(
        <BudgetExpenseForm
          {...props}
          expenseAmount="1200"
          expenseCategoryId="c1"
        />,
      );

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it("開く操作（scrollRequestKey の変化）があると、もう一度 block: nearest で見える位置へスクロールする", () => {
      const { rerender, props } = renderFormWithRerender();
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      rerender(<BudgetExpenseForm {...props} scrollRequestKey={1} />);

      expect(scrollIntoView).toHaveBeenCalledTimes(2);
      expect(scrollIntoView).toHaveBeenLastCalledWith({ block: "nearest" });
      const scrolledElement = scrollIntoView.mock.contexts[1] as HTMLElement;
      expect(scrolledElement).toContainElement(
        screen.getByRole("heading", { name: "支出を記録" }),
      );

      // scrollRequestKey が変わらない再描画では増えない
      rerender(
        <BudgetExpenseForm
          {...props}
          scrollRequestKey={1}
          expenseAmount="800"
        />,
      );
      expect(scrollIntoView).toHaveBeenCalledTimes(2);
    });

    it("同じ日付のまま scrollRequestKey が変わっても（同じ日付のボタンの押し直し）、スクロールする", () => {
      const { rerender, props } = renderFormWithRerender();
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      rerender(<BudgetExpenseForm {...props} scrollRequestKey={1} />);
      rerender(<BudgetExpenseForm {...props} scrollRequestKey={2} />);

      expect(scrollIntoView).toHaveBeenCalledTimes(3);
    });

    it("expenseDate だけが変わる再描画（月の移動・日付欄の手動変更）では、スクロールしない", () => {
      const { rerender, props } = renderFormWithRerender();
      expect(scrollIntoView).toHaveBeenCalledTimes(1);

      rerender(<BudgetExpenseForm {...props} expenseDate="2026-03-05" />);
      rerender(<BudgetExpenseForm {...props} expenseDate="2026-04-01" />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

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
          scrollRequestKey={0}
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

    // Jest（ts-jest）は React Compiler を通さないので、このテストは直す前（描画のたびに new Date()）でも通る
    // （コンパイラによる固定は検出しない。L-690）。直した後も判定が描画時の新しい今日になる経路の固定として置く。
    // 赤は BudgetExpenseForm.useToday.test.tsx（共通フックのモック）と契約テストで作る
    it("今日の日付で 0 円の通知が出たまま 0 時をまたぐと、再描画で通知が消える（またいだ後は「昨日」の 0 円は記録できる）", () => {
      jest.setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
      const { rerender, props } = renderFormWithRerender();
      rerender(<BudgetExpenseForm {...props} expenseAmount="0" />);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
      rerender(
        <BudgetExpenseForm
          {...props}
          expenseAmount="0"
          expenseCategoryId="c1"
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("例: 1500")).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });
  });
});
