import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BudgetCategoryManagementPage } from "../components/BudgetCategoryManagementPage";
import { useBudgetCategoryManagementPageState } from "../useBudgetCategoryManagementPageState";

jest.mock("../useBudgetCategoryManagementPageState", () => ({
  useBudgetCategoryManagementPageState: jest.fn(),
}));

const mockUsePageState =
  useBudgetCategoryManagementPageState as jest.MockedFunction<
    typeof useBudgetCategoryManagementPageState
  >;

const createState = (overrides: Record<string, unknown> = {}) => ({
  categories: [
    { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
  ],
  inputRef: createRef<HTMLInputElement>(),
  nameInput: "",
  showForm: false,
  setNameInput: jest.fn(),
  openForm: jest.fn(),
  closeForm: jest.fn(),
  handleCreate: jest.fn(),
  handleDelete: jest.fn(),
  editingCategoryId: null,
  editingCategoryNameValue: "",
  setEditingCategoryNameValue: jest.fn(),
  startEditCategoryName: jest.fn(),
  commitEditCategoryName: jest.fn(),
  cancelEditCategoryName: jest.fn(),
  ...overrides,
});

describe("BudgetCategoryManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("カテゴリ一覧とヘッダーを表示する", () => {
    mockUsePageState.mockReturnValue(createState() as never);

    render(<BudgetCategoryManagementPage />);

    expect(screen.getByText("🏷️ カテゴリ管理")).toBeInTheDocument();
    expect(screen.getByText("🏷️ 食料品")).toBeInTheDocument();
  });

  it("カテゴリが空でフォーム非表示なら空状態を表示する", () => {
    mockUsePageState.mockReturnValue(createState({ categories: [] }) as never);

    render(<BudgetCategoryManagementPage />);

    expect(screen.getByText("カテゴリはまだありません")).toBeInTheDocument();
  });

  it("追加ボタンでopenFormが呼ばれる", () => {
    const state = createState();
    mockUsePageState.mockReturnValue(state as never);

    render(<BudgetCategoryManagementPage />);

    fireEvent.click(screen.getByText("＋ 新しいカテゴリを追加"));

    expect(state.openForm).toHaveBeenCalled();
  });

  it("フォーム表示時は作成フォームを表示し、作成/キャンセルを委譲する", () => {
    const state = createState({ showForm: true, nameInput: "交通費" });
    mockUsePageState.mockReturnValue(state as never);

    render(<BudgetCategoryManagementPage />);

    fireEvent.click(screen.getByText("作成"));
    expect(state.handleCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByText("キャンセル"));
    expect(state.closeForm).toHaveBeenCalled();
  });

  it("削除ボタンでhandleDeleteが呼ばれる", () => {
    const state = createState();
    mockUsePageState.mockReturnValue(state as never);

    render(<BudgetCategoryManagementPage />);

    fireEvent.click(screen.getByLabelText("食料品 を削除"));

    expect(state.handleDelete).toHaveBeenCalledWith(state.categories[0]);
  });
});
