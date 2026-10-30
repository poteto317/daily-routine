import { fireEvent, render, screen, within } from "@testing-library/react";
import { DetailPanel } from "../DetailPanel";
import type { DetailTestCase } from "../detailedTestCases";

const makeCase = (
  id: string,
  pc: DetailTestCase["pc"],
  sp: DetailTestCase["sp"],
  note = "",
): DetailTestCase => ({
  id,
  scenario: `シナリオ-${id}`,
  expected: `期待-${id}`,
  pc,
  sp,
  note,
});

const cases: DetailTestCase[] = [
  makeCase("a", "ok", "ok"), // ok
  makeCase("b", "ok", "ng"), // ng
  makeCase("c", "unchecked", "ok"), // unchecked
  makeCase("d", "na", "na"), // どれにも数えない
  makeCase("e", "ok", "ok", "メモE"),
];

const renderPanel = (list: DetailTestCase[] = cases) => {
  const props = {
    itemId: "1-1",
    itemLabel: "ログイン機能",
    cases: list,
    onClose: jest.fn(),
    onToggleStatus: jest.fn(),
    onUpdateNote: jest.fn(),
  };
  render(<DetailPanel {...props} />);
  return props;
};

const getRow = (scenario: string): HTMLElement =>
  screen.getByText(scenario).closest("tr") as HTMLElement;

describe("DetailPanel", () => {
  it("OK・NG・未確認・全件の件数を表示する", () => {
    renderPanel();

    expect(screen.getByText("✅ 2")).toBeInTheDocument();
    expect(screen.getByText("❌ 1")).toBeInTheDocument();
    expect(screen.getByText("⬜ 1")).toBeInTheDocument();
    expect(screen.getByText("/ 5 ケース")).toBeInTheDocument();
  });

  it("見出しに項目 ID と項目名を表示する", () => {
    renderPanel();

    expect(screen.getByText("1-1")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ログイン機能" }),
    ).toBeInTheDocument();
  });

  it("行番号は 1 始まりの連番で、シナリオと期待結果を表示する", () => {
    renderPanel();

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows).toHaveLength(5);
    rows.forEach((row, index) => {
      expect(within(row).getAllByRole("cell")[0]).toHaveTextContent(
        String(index + 1),
      );
    });
    expect(screen.getByText("期待-b")).toBeInTheDocument();
  });

  it("PC / SP のボタンがそれぞれ対応する field で onToggleStatus を呼ぶ", () => {
    const props = renderPanel();
    const row = within(getRow("シナリオ-b"));

    fireEvent.click(row.getByTitle("PC: OK"));
    expect(props.onToggleStatus).toHaveBeenLastCalledWith("b", "pc");

    fireEvent.click(row.getByTitle("SP: NG"));
    expect(props.onToggleStatus).toHaveBeenLastCalledWith("b", "sp");
    expect(props.onToggleStatus).toHaveBeenCalledTimes(2);
  });

  it("備考の入力が onUpdateNote を呼ぶ", () => {
    const props = renderPanel();

    fireEvent.change(screen.getByDisplayValue("メモE"), {
      target: { value: "更新" },
    });

    expect(props.onUpdateNote).toHaveBeenCalledWith("e", "更新");
  });

  it("ケースが 0 件なら空の文言を表示する", () => {
    renderPanel([]);

    expect(
      screen.getByText("詳細テストケースが未定義です"),
    ).toBeInTheDocument();
    expect(screen.getByText("/ 0 ケース")).toBeInTheDocument();
  });

  it("ケースがあれば空の文言を表示しない", () => {
    renderPanel();

    expect(screen.queryByText("詳細テストケースが未定義です")).toBeNull();
  });

  it("背景と閉じるボタンが onClose を呼ぶ", () => {
    const props = renderPanel();

    fireEvent.click(screen.getByTitle("閉じる"));
    expect(props.onClose).toHaveBeenCalledTimes(1);

    const backdrop = document.querySelector(".bg-black\\/40") as HTMLElement;
    fireEvent.click(backdrop);
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });
});
