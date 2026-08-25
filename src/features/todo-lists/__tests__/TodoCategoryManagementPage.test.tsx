import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { TodoCategoryManagementPage } from "../TodoCategoryManagementPage";

jest.mock("@/components", () => ({
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/lib/isImeComposingKeyDown", () => ({
  isImeComposingKeyDown: jest.fn(() => false),
}));

jest.mock("../storage", () => ({
  getTodoCategories: jest.fn(),
  saveTodoCategories: jest.fn(),
}));

import { getTodoCategories, saveTodoCategories } from "../storage";

const mockGetTodoCategories = getTodoCategories as jest.MockedFunction<
  typeof getTodoCategories
>;
const mockSaveTodoCategories = saveTodoCategories as jest.MockedFunction<
  typeof saveTodoCategories
>;

describe("TodoCategoryManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodoCategories.mockReturnValue([]);
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    (window.confirm as jest.Mock).mockRestore();
  });

  it("カテゴリがない場合は空状態を表示する", () => {
    render(<TodoCategoryManagementPage />);
    expect(screen.getByText("カテゴリはまだありません")).toBeInTheDocument();
  });

  it("新しいカテゴリを追加できる", async () => {
    render(<TodoCategoryManagementPage />);

    fireEvent.click(screen.getByText("＋ 新しいカテゴリを追加"));
    fireEvent.change(screen.getByPlaceholderText("カテゴリ名"), {
      target: { value: "仕事" },
    });
    fireEvent.click(screen.getByText("作成"));

    await waitFor(() => {
      expect(screen.getByText("🏷️ 仕事")).toBeInTheDocument();
    });
    expect(mockSaveTodoCategories).toHaveBeenCalledWith([
      expect.objectContaining({ name: "仕事" }),
    ]);
  });

  it("色を選択してカテゴリを追加すると色付きで保存される", async () => {
    render(<TodoCategoryManagementPage />);

    fireEvent.click(screen.getByText("＋ 新しいカテゴリを追加"));
    fireEvent.change(screen.getByPlaceholderText("カテゴリ名"), {
      target: { value: "仕事" },
    });
    const createFormRadiogroup = screen.getByRole("radiogroup", {
      name: "背景色",
    });
    fireEvent.click(
      within(createFormRadiogroup).getByRole("radio", { name: "青" }),
    );
    fireEvent.click(screen.getByText("作成"));

    await waitFor(() => {
      expect(mockSaveTodoCategories).toHaveBeenCalledWith([
        expect.objectContaining({ name: "仕事", color: "bg-blue-50" }),
      ]);
    });
  });

  it("カテゴリ名をクリックして編集できる", async () => {
    mockGetTodoCategories.mockReturnValue([
      { id: "cat-1", name: "仕事", createdAt: "2026-03-07T00:00:00.000Z" },
    ]);

    render(<TodoCategoryManagementPage />);
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    fireEvent.change(screen.getByDisplayValue("仕事"), {
      target: { value: "業務" },
    });
    fireEvent.keyDown(screen.getByDisplayValue("業務"), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("🏷️ 業務")).toBeInTheDocument();
    });
    expect(mockSaveTodoCategories).toHaveBeenCalledWith([
      expect.objectContaining({ id: "cat-1", name: "業務" }),
    ]);
  });

  it("色スウォッチボタンから既存カテゴリの色を変更できる", async () => {
    mockGetTodoCategories.mockReturnValue([
      { id: "cat-1", name: "仕事", createdAt: "2026-03-07T00:00:00.000Z" },
    ]);

    render(<TodoCategoryManagementPage />);
    fireEvent.click(screen.getByLabelText("仕事 の背景色を変更"));

    const popoverRadiogroup = screen.getByRole("radiogroup", {
      name: "背景色",
    });
    fireEvent.click(
      within(popoverRadiogroup).getByRole("radio", { name: "緑" }),
    );

    await waitFor(() => {
      expect(mockSaveTodoCategories).toHaveBeenCalledWith([
        expect.objectContaining({ id: "cat-1", color: "bg-green-50" }),
      ]);
    });
    // 色選択後にピッカーが閉じる
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("確認後にカテゴリを削除できる", async () => {
    mockGetTodoCategories.mockReturnValue([
      { id: "cat-1", name: "仕事", createdAt: "2026-03-07T00:00:00.000Z" },
    ]);

    render(<TodoCategoryManagementPage />);
    fireEvent.click(screen.getByLabelText("仕事 を削除"));

    await waitFor(() => {
      expect(screen.getByText("カテゴリはまだありません")).toBeInTheDocument();
    });
    expect(mockSaveTodoCategories).toHaveBeenCalledWith([]);
  });
});
