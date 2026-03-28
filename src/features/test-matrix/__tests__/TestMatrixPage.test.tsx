import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("../initialData", () => ({
  buildInitialData: jest.fn(() => [
    {
      id: "auth",
      title: "認証",
      badge: { text: "実装済", color: "bg-green-500" },
      items: [
        {
          id: "1-1",
          label: "ログイン",
          pc: "unchecked",
          sp: "unchecked",
          note: "",
        },
        {
          id: "1-2",
          label: "新規登録",
          pc: "unchecked",
          sp: "unchecked",
          note: "",
        },
      ],
    },
  ]),
}));

jest.mock("../detailedTestCases", () => ({
  DETAILED_TEST_CASES: {
    "1-2": [
      {
        id: "case-1",
        scenario: "正常系",
        expected: "登録できる",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
    ],
  },
}));

import { TestMatrixPage } from "../TestMatrixPage";

describe("TestMatrixPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.confirm as jest.Mock).mockRestore();
  });

  it("保存済みデータをマージして表示する", () => {
    localStorage.setItem(
      "test-matrix-data",
      JSON.stringify([
        {
          id: "auth",
          items: [
            { id: "1-1", pc: "ok", sp: "ng", note: "saved" },
            { id: "1-2", pc: "unchecked", sp: "unchecked", note: "" },
          ],
        },
      ]),
    );

    render(<TestMatrixPage />);

    expect(screen.getByDisplayValue("saved")).toBeInTheDocument();
    expect(screen.getByTitle("PC: OK")).toBeInTheDocument();
    expect(screen.getByTitle("SP: NG")).toBeInTheDocument();
  });

  it("一覧でステータス変更・メモ更新・折りたたみができる", async () => {
    render(<TestMatrixPage />);

    fireEvent.click(screen.getByTitle("PC: 未確認"));
    fireEvent.change(screen.getAllByPlaceholderText("メモ...")[0], {
      target: { value: "確認済み" },
    });
    fireEvent.click(screen.getByText("📁 すべて折りたたみ"));

    await waitFor(() => {
      expect(screen.getByText("📂 すべて展開")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("📂 すべて展開"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("確認済み")).toBeInTheDocument();
      expect(screen.getByTitle("PC: OK")).toBeInTheDocument();
    });
  });

  it("詳細パネルを開いて詳細ケースを更新し、リセットできる", async () => {
    render(<TestMatrixPage />);

    fireEvent.click(screen.getByText("新規登録"));

    await waitFor(() => {
      expect(screen.getByText("テストシナリオ")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTitle("PC: 未確認")[1]);
    fireEvent.change(screen.getAllByPlaceholderText("メモ...")[1], {
      target: { value: "detail note" },
    });
    fireEvent.click(screen.getByTitle("閉じる"));
    fireEvent.click(screen.getByText("🗑️ リセット"));

    await waitFor(() => {
      expect(screen.queryByDisplayValue("detail note")).toBeNull();
      expect(screen.getByText("進捗:")).toBeInTheDocument();
    });
  });
});
