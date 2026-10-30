import { fireEvent, render, screen, within } from "@testing-library/react";
import { MatrixCategoryCard } from "../MatrixCategoryCard";
import type { DetailData } from "../matrixComputations";
import type { TestCategory } from "../types";

const category: TestCategory = {
  id: "cat-1",
  title: "認証機能",
  items: [
    { id: "1-1", label: "ログイン", pc: "ok", sp: "ng", note: "既存メモ" },
    {
      id: "1-2",
      label: "新規登録",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
};

// 1-2 だけ詳細あり: PC は 2 件中 1 件 ok、SP は 2 件中 2 件 ok
const detailData: DetailData = {
  "1-2": [
    {
      id: "d-1",
      scenario: "正常系",
      expected: "登録できる",
      pc: "ok",
      sp: "ok",
      note: "",
    },
    {
      id: "d-2",
      scenario: "異常系",
      expected: "エラー",
      pc: "unchecked",
      sp: "ok",
      note: "",
    },
  ],
};

const renderCard = (
  overrides: Partial<Parameters<typeof MatrixCategoryCard>[0]> = {},
) => {
  const props = {
    category,
    detailData,
    filterStatus: "all" as const,
    isCollapsed: false,
    onToggleCollapse: jest.fn(),
    onToggleStatus: jest.fn(),
    onUpdateNote: jest.fn(),
    onOpenDetail: jest.fn(),
    ...overrides,
  };
  const result = render(<MatrixCategoryCard {...props} />);
  return { ...result, props };
};

const getRow = (label: string): HTMLElement =>
  screen.getByText(label).closest("tr") as HTMLElement;

describe("MatrixCategoryCard", () => {
  it("絞り込みで 0 件なら何も描画しない", () => {
    const { container } = renderCard({ filterStatus: "na" });

    expect(container).toBeEmptyDOMElement();
  });

  it("折りたたみ中は表を描画しない", () => {
    renderCard({ isCollapsed: true });

    expect(screen.getByText("認証機能")).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("詳細なしの項目は PC / SP のボタンがそれぞれ対応する field で onToggleStatus を呼ぶ", () => {
    const { props } = renderCard();
    const row = within(getRow("ログイン"));

    fireEvent.click(row.getByTitle("PC: OK"));
    expect(props.onToggleStatus).toHaveBeenLastCalledWith("cat-1", "1-1", "pc");

    fireEvent.click(row.getByTitle("SP: NG"));
    expect(props.onToggleStatus).toHaveBeenLastCalledWith("cat-1", "1-1", "sp");
    expect(props.onToggleStatus).toHaveBeenCalledTimes(2);
  });

  it("詳細ありの項目はボタンでなく title 付きの表示になり、PC・SP の ok 件数を出す", () => {
    const { props } = renderCard();
    const row = within(getRow("新規登録"));

    expect(row.queryByRole("button", { name: /PC:/ })).toBeNull();
    // PC は ok/unchecked → unchecked、SP は ok/ok → ok
    const pc = row.getByTitle("PC: 未確認 (詳細画面から自動計算)");
    const sp = row.getByTitle("SP: OK (詳細画面から自動計算)");
    expect(pc.tagName).toBe("DIV");
    expect(sp.tagName).toBe("DIV");
    fireEvent.click(pc);
    expect(props.onToggleStatus).not.toHaveBeenCalled();

    expect(row.getByText("1/2")).toBeInTheDocument();
    expect(row.getByText("2/2")).toBeInTheDocument();
  });

  it("項目名のボタンは詳細ありの項目だけ onOpenDetail を呼ぶ", () => {
    const { props } = renderCard();

    fireEvent.click(screen.getByText("ログイン"));
    expect(props.onOpenDetail).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("新規登録"));
    expect(props.onOpenDetail).toHaveBeenCalledTimes(1);
    expect(props.onOpenDetail).toHaveBeenCalledWith("1-2");
  });

  it("備考の入力が onUpdateNote を呼ぶ", () => {
    const { props } = renderCard();

    fireEvent.change(screen.getByDisplayValue("既存メモ"), {
      target: { value: "更新" },
    });

    expect(props.onUpdateNote).toHaveBeenCalledWith("cat-1", "1-1", "更新");
  });
});
