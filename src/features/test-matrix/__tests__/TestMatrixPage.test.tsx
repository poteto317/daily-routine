import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/features/auth", () => ({
  useAuth: jest.fn(() => ({
    isAdmin: true,
    loading: false,
    isAdminLoading: false,
  })),
}));

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

  it("管理者ではないユーザーにはアクセス拒否画面を表示する", () => {
    const { useAuth } = jest.requireMock("@/features/auth");
    useAuth.mockReturnValueOnce({
      isAdmin: false,
      loading: false,
      isAdminLoading: false,
    });

    render(<TestMatrixPage />);

    expect(screen.getByText("アクセス権限がありません")).toBeInTheDocument();
    expect(
      screen.getByText("このページは管理者のみ閲覧できます。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("📋 機能テストマトリクス"),
    ).not.toBeInTheDocument();
  });

  it("loading 中は非管理者でもローディング表示にとどまり本体を描画しない", () => {
    const { useAuth } = jest.requireMock("@/features/auth");
    useAuth.mockReturnValueOnce({
      isAdmin: false,
      loading: true,
      isAdminLoading: false,
    });

    render(<TestMatrixPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(
      screen.queryByText("アクセス権限がありません"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("📋 機能テストマトリクス"),
    ).not.toBeInTheDocument();
  });

  it("isAdminLoading 中は non-admin でもローディング表示にとどまりアクセス拒否を出さない", () => {
    const { useAuth } = jest.requireMock("@/features/auth");
    useAuth.mockReturnValueOnce({
      isAdmin: false,
      loading: false,
      isAdminLoading: true,
    });

    render(<TestMatrixPage />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    expect(
      screen.queryByText("アクセス権限がありません"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("📋 機能テストマトリクス"),
    ).not.toBeInTheDocument();
  });

  describe("サマリー・ツールバー・凡例", () => {
    it("進捗の割合と ok / ng / 未確認 / 全件を表示し、バーの幅に反映する", () => {
      localStorage.setItem(
        "test-matrix-data",
        JSON.stringify([
          {
            id: "auth",
            items: [
              { id: "1-1", pc: "ok", sp: "ok", note: "" },
              { id: "1-2", pc: "unchecked", sp: "unchecked", note: "" },
            ],
          },
        ]),
      );

      const { container } = render(<TestMatrixPage />);

      expect(screen.getByText("進捗:")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("✅ 1")).toBeInTheDocument();
      expect(screen.getByText("❌ 0")).toBeInTheDocument();
      expect(screen.getByText("⬜ 1")).toBeInTheDocument();
      expect(screen.getByText("/ 2 項目")).toBeInTheDocument();
      const bar = container.querySelector(".bg-blue-500") as HTMLElement;
      expect(bar.style.width).toBe("50%");
    });

    it("フィルターの変更が表示に届き、select の値が選択中のフィルターになる", () => {
      localStorage.setItem(
        "test-matrix-data",
        JSON.stringify([
          {
            id: "auth",
            items: [
              { id: "1-1", pc: "ok", sp: "ok", note: "" },
              { id: "1-2", pc: "unchecked", sp: "unchecked", note: "" },
            ],
          },
        ]),
      );

      render(<TestMatrixPage />);
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("all");
      expect(screen.getByText("ログイン")).toBeInTheDocument();

      fireEvent.change(select, { target: { value: "ng" } });

      expect(select.value).toBe("ng");
      expect(screen.queryByText("ログイン")).toBeNull();

      fireEvent.change(select, { target: { value: "ok" } });

      expect(select.value).toBe("ok");
      expect(screen.getByText("ログイン")).toBeInTheDocument();
      expect(screen.queryByText("新規登録")).toBeNull();
    });

    it("ステータス凡例の 4 つの文言を表示する", () => {
      render(<TestMatrixPage />);

      expect(screen.getByText("ステータス:")).toBeInTheDocument();
      expect(screen.getByText("✅ OK")).toBeInTheDocument();
      expect(screen.getByText("❌ NG")).toBeInTheDocument();
      expect(screen.getByText("➖ 対象外")).toBeInTheDocument();
      expect(screen.getByText("⬜ 未確認")).toBeInTheDocument();
    });
  });
});
