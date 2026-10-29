import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetExpenseList } from "../components/BudgetExpenseList";

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00.000Z" },
];

const createProps = (overrides: Record<string, unknown> = {}) => ({
  categories,
  expenses: [],
  editingExpenseId: null as string | null,
  editingExpenseDate: "",
  editingExpenseAmount: "",
  editingExpenseCategoryId: "",
  onStartEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onEditDateChange: jest.fn(),
  onEditAmountChange: jest.fn(),
  onEditCategoryIdChange: jest.fn(),
  onDelete: jest.fn(),
  ...overrides,
});

describe("BudgetExpenseList", () => {
  it("支出が無い場合は空状態を表示する", () => {
    render(<BudgetExpenseList {...createProps()} />);

    expect(screen.getByText("まだ支出の記録がありません")).toBeInTheDocument();
  });

  it("カテゴリが解決できる支出には🏷️タグを表示する", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              categoryId: "cat-lunch",
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("🏷️ ランチ")).toBeInTheDocument();
  });

  it("categoryIdが無い、または解決できない支出には🏷️タグを表示しない", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
            {
              id: "e2",
              date: "2026-05-21",
              amount: 300,
              categoryId: "cat-404",
              createdAt: "2026-05-21T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    expect(screen.queryByText(/🏷️/)).not.toBeInTheDocument();
  });

  it("削除ボタンは支出ごとに区別できるaria-labelを持ち、押すとonDeleteへexpenseIdを渡す", () => {
    const onDelete = jest.fn();
    render(
      <BudgetExpenseList
        {...createProps({
          onDelete,
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              categoryId: "cat-lunch",
              createdAt: "2026-05-22T00:00:00.000Z",
            },
            {
              id: "e2",
              date: "2026-05-21",
              amount: 300,
              createdAt: "2026-05-21T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    const deleteButtons = screen.getAllByRole("button", { name: /削除/ });
    expect(deleteButtons).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "5月22日の支出を削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "5月21日の支出を削除" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "5月21日の支出を削除" }),
    );

    expect(onDelete).toHaveBeenCalledWith("e2");
  });

  it("削除ボタンにtype=buttonが設定されている", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    expect(screen.getByRole("button", { name: /削除/ })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("編集ボタンを押すとonStartEditへ対象の支出を渡す", () => {
    const onStartEdit = jest.fn();
    const expense = {
      id: "e1",
      date: "2026-05-22",
      amount: 850,
      categoryId: "cat-lunch",
      createdAt: "2026-05-22T00:00:00.000Z",
    };
    render(
      <BudgetExpenseList
        {...createProps({ onStartEdit, expenses: [expense] })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "5月22日の支出を編集" }),
    );

    expect(onStartEdit).toHaveBeenCalledWith(expense);
  });

  it("編集中の行は入力フィールドと保存/キャンセルボタンを表示し、編集/削除ボタンを表示しない", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          editingExpenseId: "e1",
          editingExpenseDate: "2026-05-22",
          editingExpenseAmount: "850",
          editingExpenseCategoryId: "cat-lunch",
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              categoryId: "cat-lunch",
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    expect(screen.getByLabelText("日付（月）")).toHaveValue("2026-05");
    expect(screen.getByLabelText("日付（日）")).toHaveValue("2026-05-22");
    expect(screen.getByLabelText(/金額/)).toHaveValue(850);
    expect(screen.getByLabelText(/カテゴリ/)).toHaveValue("cat-lunch");
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /編集/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /削除/ }),
    ).not.toBeInTheDocument();
  });

  it("編集中でない行は通常表示のまま残る", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          editingExpenseId: "e1",
          editingExpenseDate: "2026-05-22",
          editingExpenseAmount: "850",
          editingExpenseCategoryId: "",
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
            {
              id: "e2",
              date: "2026-05-21",
              amount: 300,
              createdAt: "2026-05-21T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    expect(
      screen.getByRole("button", { name: "5月21日の支出を編集" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "5月21日の支出を削除" }),
    ).toBeInTheDocument();
  });

  it("編集フィールドの変更が対応するハンドラへ委譲される", () => {
    const onEditDateChange = jest.fn();
    const onEditAmountChange = jest.fn();
    const onEditCategoryIdChange = jest.fn();
    render(
      <BudgetExpenseList
        {...createProps({
          editingExpenseId: "e1",
          editingExpenseDate: "2026-05-22",
          editingExpenseAmount: "850",
          editingExpenseCategoryId: "",
          onEditDateChange,
          onEditAmountChange,
          onEditCategoryIdChange,
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText("日付（日）"), {
      target: { value: "2026-05-25" },
    });
    fireEvent.change(screen.getByLabelText(/金額/), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText(/カテゴリ/), {
      target: { value: "cat-lunch" },
    });

    expect(onEditDateChange).toHaveBeenCalledWith("2026-05-25");
    expect(onEditAmountChange).toHaveBeenCalledWith("1000");
    expect(onEditCategoryIdChange).toHaveBeenCalledWith("cat-lunch");
  });

  it("編集中の日付の「月」を前後の月に変更すると、その月の同じ日でonEditDateChangeが呼ばれる", () => {
    const onEditDateChange = jest.fn();
    render(
      <BudgetExpenseList
        {...createProps({
          editingExpenseId: "e1",
          editingExpenseDate: "2026-05-22",
          editingExpenseAmount: "850",
          editingExpenseCategoryId: "",
          onEditDateChange,
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    fireEvent.change(screen.getByLabelText("日付（月）"), {
      target: { value: "2026-06" },
    });

    expect(onEditDateChange).toHaveBeenCalledWith("2026-06-22");
  });

  it("保存/キャンセルボタンがonSaveEdit/onCancelEditを呼ぶ", () => {
    const onSaveEdit = jest.fn();
    const onCancelEdit = jest.fn();
    render(
      <BudgetExpenseList
        {...createProps({
          editingExpenseId: "e1",
          editingExpenseDate: "2026-05-22",
          editingExpenseAmount: "850",
          editingExpenseCategoryId: "",
          onSaveEdit,
          onCancelEdit,
          expenses: [
            {
              id: "e1",
              date: "2026-05-22",
              amount: 850,
              createdAt: "2026-05-22T00:00:00.000Z",
            },
          ],
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onSaveEdit).toHaveBeenCalledTimes(1);
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("同じ日付・同じ分に追加された支出でも、時間（記録日時）の降順で描画する", () => {
    render(
      <BudgetExpenseList
        {...createProps({
          expenses: [
            {
              id: "first-added",
              date: "2026-09-06",
              amount: 500,
              createdAt: "2026-09-06T05:08:10.000Z",
              usedTime: "14:08",
            },
            {
              id: "second-added",
              date: "2026-09-06",
              amount: 1200,
              createdAt: "2026-09-06T05:08:40.000Z",
              usedTime: "14:08",
            },
            {
              id: "previous-day",
              date: "2026-09-05",
              amount: 300,
              createdAt: "2026-09-05T12:00:00.000Z",
              usedTime: "21:00",
            },
          ],
        })}
      />,
    );

    const amounts = screen
      .getAllByText(/[¥￥]/)
      .map((element) => element.textContent);
    expect(amounts).toEqual(["￥1,200", "￥500", "￥300"]);
  });
});
