import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetMonthlyExport } from "../components/BudgetMonthlyExport";
import { downloadJsonFile } from "@/lib/downloadJsonFile";

jest.mock("@/lib/downloadJsonFile", () => ({ downloadJsonFile: jest.fn() }));
const download = jest.mocked(downloadJsonFile);
const expenses = [
  {
    id: "zero",
    date: "2026-11-01",
    amount: 0,
    createdAt: "2026-11-01T00:00:00Z",
  },
];
const label = "この月の支出を JSON でエクスポート";

describe("BudgetMonthlyExport", () => {
  beforeEach(() => {
    download.mockReset();
  });

  it("空月は理由を表示してボタンを実際に無効化する", () => {
    render(
      <BudgetMonthlyExport
        month="2026-12"
        expenses={expenses}
        categories={[]}
      />,
    );
    expect(screen.getByRole("button", { name: label })).toBeDisabled();
    expect(
      screen.getByText("この月の支出の記録がありません"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(download).not.toHaveBeenCalled();
  });

  it("0円の記録があればエクスポートできる", () => {
    render(
      <BudgetMonthlyExport
        month="2026-11"
        expenses={expenses}
        categories={[]}
      />,
    );
    expect(screen.getByRole("button", { name: label })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(download).toHaveBeenCalledWith("daily-routine-budget-2026-11.json", {
      budgetData: { expenses: { "2026-11": expenses } },
      budgetCategories: [],
    });
  });

  it("失敗を通知し、再試行が成功すると開始表示に切り替わる", () => {
    download.mockImplementationOnce(() => {
      throw new Error("failed");
    });
    render(
      <BudgetMonthlyExport
        month="2026-11"
        expenses={expenses}
        categories={[]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "書き出しに失敗しました",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "JSON のダウンロードを開始しました",
    );
  });
});
