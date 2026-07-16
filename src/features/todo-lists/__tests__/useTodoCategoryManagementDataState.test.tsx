import { act, renderHook } from "@testing-library/react";
import { useTodoCategoryManagementDataState } from "../useTodoCategoryManagementDataState";
import { getTodoCategories, saveTodoCategories } from "../storage";
import {
  createTodoCategoryAndPersist,
  deleteTodoCategoryAndPersist,
  renameTodoCategoryAndPersist,
  updateTodoCategoryColorAndPersist,
} from "../todoCategoryCrudPersistActions";

jest.mock("../storage", () => ({
  getTodoCategories: jest.fn(),
  saveTodoCategories: jest.fn(),
}));

jest.mock("../todoCategoryCrudPersistActions", () => ({
  createTodoCategoryAndPersist: jest.fn(),
  renameTodoCategoryAndPersist: jest.fn(),
  updateTodoCategoryColorAndPersist: jest.fn(),
  deleteTodoCategoryAndPersist: jest.fn(),
}));

const mockGetTodoCategories = getTodoCategories as jest.MockedFunction<
  typeof getTodoCategories
>;
const mockCreateTodoCategoryAndPersist =
  createTodoCategoryAndPersist as jest.MockedFunction<
    typeof createTodoCategoryAndPersist
  >;
const mockRenameTodoCategoryAndPersist =
  renameTodoCategoryAndPersist as jest.MockedFunction<
    typeof renameTodoCategoryAndPersist
  >;
const mockUpdateTodoCategoryColorAndPersist =
  updateTodoCategoryColorAndPersist as jest.MockedFunction<
    typeof updateTodoCategoryColorAndPersist
  >;
const mockDeleteTodoCategoryAndPersist =
  deleteTodoCategoryAndPersist as jest.MockedFunction<
    typeof deleteTodoCategoryAndPersist
  >;

const category = {
  id: "cat-1",
  name: "仕事",
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useTodoCategoryManagementDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodoCategories.mockReturnValue([category]);
  });

  it("初期表示時にgetTodoCategoriesで一覧を読み込む", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "プライベート",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );

    expect(result.current.categories).toEqual([category]);
  });

  it("handleCreateが成功したらstateを更新しcloseFormを呼ぶ", () => {
    const closeForm = jest.fn();
    const nextCategories = [category, { ...category, id: "cat-2" }];
    mockCreateTodoCategoryAndPersist.mockImplementation(({ persist }) => {
      persist(nextCategories);
      return nextCategories;
    });

    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "プライベート",
        colorInput: "bg-blue-50",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateTodoCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      nameInput: "プライベート",
      color: "bg-blue-50",
      persist: expect.any(Function),
    });
    expect(closeForm).toHaveBeenCalled();
    expect(result.current.categories).toEqual(nextCategories);
  });

  it("handleCreateが失敗した場合はcloseFormを呼ばない", () => {
    const closeForm = jest.fn();
    mockCreateTodoCategoryAndPersist.mockReturnValue(null);

    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "   ",
        colorInput: undefined,
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(closeForm).not.toHaveBeenCalled();
  });

  it("handleRenameはrenameTodoCategoryAndPersistへ委譲する", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleRename("cat-1", "業務");
    });

    expect(mockRenameTodoCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      categoryId: "cat-1",
      name: "業務",
      persist: expect.any(Function),
    });
  });

  it("handleUpdateColorはupdateTodoCategoryColorAndPersistへ委譲する", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleUpdateColor("cat-1", "bg-red-50");
    });

    expect(mockUpdateTodoCategoryColorAndPersist).toHaveBeenCalledWith({
      categories: [category],
      categoryId: "cat-1",
      color: "bg-red-50",
      persist: expect.any(Function),
    });
  });

  it("handleDeleteはdeleteTodoCategoryAndPersistへメッセージ付きで委譲する", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleDelete(category);
    });

    expect(mockDeleteTodoCategoryAndPersist).toHaveBeenCalledWith({
      categories: [category],
      category,
      message: "「仕事」を削除しますか？この操作は元に戻せません。",
      persist: expect.any(Function),
    });
  });

  it("削除確認メッセージは$を含むカテゴリ名でも壊れずに埋め込む", () => {
    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );
    const dollarCategory = {
      id: "cat-2",
      name: "$&特別枠",
      createdAt: "2026-05-01T00:00:00.000Z",
    };

    act(() => {
      result.current.handleDelete(dollarCategory);
    });

    expect(mockDeleteTodoCategoryAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "「$&特別枠」を削除しますか？この操作は元に戻せません。",
      }),
    );
  });

  it("persistはstateの更新とsaveTodoCategoriesの両方を行う", () => {
    const nextCategories = [category, { ...category, id: "cat-2" }];
    mockCreateTodoCategoryAndPersist.mockImplementation(({ persist }) => {
      persist(nextCategories);
      return nextCategories;
    });

    const { result } = renderHook(() =>
      useTodoCategoryManagementDataState({
        nameInput: "プライベート",
        colorInput: undefined,
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(saveTodoCategories).toHaveBeenCalledWith(nextCategories);
    expect(result.current.categories).toEqual(nextCategories);
  });
});
