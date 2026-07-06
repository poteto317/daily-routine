import { act, renderHook } from "@testing-library/react";
import { useBudgetCategoryManagementDataState } from "../useBudgetCategoryManagementDataState";
import { getBudgetCategories, saveBudgetCategories } from "../storage";
import {
  createBudgetCategoryAndPersist,
  deleteBudgetCategoryAndPersist,
  renameBudgetCategoryAndPersist,
} from "../budgetCategoryCrudPersistActions";

jest.mock("../storage", () => ({
  getBudgetCategories: jest.fn(),
  saveBudgetCategories: jest.fn(),
}));

jest.mock("../budgetCategoryCrudPersistActions", () => ({
  createBudgetCategoryAndPersist: jest.fn(),
  renameBudgetCategoryAndPersist: jest.fn(),
  deleteBudgetCategoryAndPersist: jest.fn(),
}));

const mockGetBudgetCategories = getBudgetCategories as jest.MockedFunction<
  typeof getBudgetCategories
>;
const mockCreateBudgetCategoryAndPersist =
  createBudgetCategoryAndPersist as jest.MockedFunction<
    typeof createBudgetCategoryAndPersist
  >;
const mockRenameBudgetCategoryAndPersist =
  renameBudgetCategoryAndPersist as jest.MockedFunction<
    typeof renameBudgetCategoryAndPersist
  >;
const mockDeleteBudgetCategoryAndPersist =
  deleteBudgetCategoryAndPersist as jest.MockedFunction<
    typeof deleteBudgetCategoryAndPersist
  >;

const category = {
  id: "cat-1",
  name: "食料品",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetCategoryManagementDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBudgetCategories.mockReturnValue([category]);
  });

  it("初期表示時にgetBudgetCategoriesで一覧を読み込む", () => {
    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "交通費",
        closeForm: jest.fn(),
      }),
    );

    expect(result.current.categories).toEqual([category]);
  });

  it("handleCreateが成功したらstateを更新しcloseFormを呼ぶ", () => {
    const closeForm = jest.fn();
    const nextCategories = [category, { ...category, id: "cat-2" }];
    mockCreateBudgetCategoryAndPersist.mockImplementation(({ persist }) => {
      persist(nextCategories);
      return nextCategories;
    });

    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "交通費",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateBudgetCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      nameInput: "交通費",
      persist: expect.any(Function),
    });
    expect(closeForm).toHaveBeenCalled();
    expect(result.current.categories).toEqual(nextCategories);
  });

  it("handleCreateが失敗した場合はcloseFormを呼ばない", () => {
    const closeForm = jest.fn();
    mockCreateBudgetCategoryAndPersist.mockReturnValue(null);

    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "   ",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(closeForm).not.toHaveBeenCalled();
  });

  it("handleRenameはrenameBudgetCategoryAndPersistへ委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleRename("cat-1", "食費");
    });

    expect(mockRenameBudgetCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      categoryId: "cat-1",
      name: "食費",
      persist: expect.any(Function),
    });
  });

  it("handleDeleteはdeleteBudgetCategoryAndPersistへメッセージ付きで委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleDelete(category);
    });

    expect(mockDeleteBudgetCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      category,
      message: "「食料品」を削除しますか？この操作は元に戻せません。",
      persist: expect.any(Function),
    });
  });

  it("削除確認メッセージは$を含むカテゴリ名でも壊れずに埋め込む", () => {
    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "",
        closeForm: jest.fn(),
      }),
    );
    const dollarCategory = {
      id: "cat-2",
      name: "$&特別費",
      createdAt: "2026-05-01T00:00:00.000Z",
    };

    act(() => {
      result.current.handleDelete(dollarCategory);
    });

    expect(mockDeleteBudgetCategoryAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "「$&特別費」を削除しますか？この操作は元に戻せません。",
      }),
    );
  });

  it("persistはstateの更新とsaveBudgetCategoriesの両方を行う", () => {
    const nextCategories = [category, { ...category, id: "cat-2" }];
    mockCreateBudgetCategoryAndPersist.mockImplementation(({ persist }) => {
      persist(nextCategories);
      return nextCategories;
    });

    const { result } = renderHook(() =>
      useBudgetCategoryManagementDataState({
        nameInput: "交通費",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(saveBudgetCategories).toHaveBeenCalledWith(nextCategories);
    expect(result.current.categories).toEqual(nextCategories);
  });
});
