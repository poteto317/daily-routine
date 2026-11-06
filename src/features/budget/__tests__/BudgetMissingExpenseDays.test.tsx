import { fireEvent, render, screen, within } from "@testing-library/react";
import { BudgetMissingExpenseDays } from "../components/BudgetMissingExpenseDays";

describe("BudgetMissingExpenseDays", () => {
  it("未入力の日が無ければ、何も描画しない", () => {
    const { container } = render(
      <BudgetMissingExpenseDays dates={[]} onSelectDate={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("見出しに日数を出し、説明を出す。欄は見出しの名前の region として取れる", () => {
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04", "2026-11-05"]}
        onSelectDate={jest.fn()}
      />,
    );

    const region = screen.getByRole("region", {
      name: "📝 未入力の日（3日）",
    });
    expect(
      within(region).getByText(/支出の記録が無い日です/),
    ).toBeInTheDocument();
    expect(within(region).getByText(/0 円で記録すると/)).toBeInTheDocument();
  });

  it("日付のボタンを dates の順に、短い表記と読み上げ名で並べる", () => {
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04", "2026-11-05"]}
        onSelectDate={jest.fn()}
      />,
    );

    const buttons = within(screen.getByRole("list")).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual([
      "2日(月)",
      "4日(水)",
      "5日(木)",
    ]);
    expect(
      screen.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    ).toHaveTextContent("4日(水)");
    expect(
      within(screen.getByRole("list")).getAllByRole("listitem"),
    ).toHaveLength(3);
  });

  it("日付のボタンを押すと、その日付で onSelectDate を 1 回呼ぶ", () => {
    const onSelectDate = jest.fn();
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04"]}
        onSelectDate={onSelectDate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    );

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith("2026-11-04");
  });
});
