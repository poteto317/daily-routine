import { act, renderHook } from "@testing-library/react";
import { useBudgetExpenseItemManagementDataState } from "../useBudgetExpenseItemManagementDataState";
import { getBudgetExpenseItems, saveBudgetExpenseItems } from "../storage";
import {
  createBudgetExpenseItemAndPersist,
  deleteBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemKindAndPersist,
} from "../budgetExpenseItemCrudPersistActions";

jest.mock("../storage", () => ({
  getBudgetExpenseItems: jest.fn(),
  saveBudgetExpenseItems: jest.fn(),
}));

jest.mock("../budgetExpenseItemCrudPersistActions", () => ({
  createBudgetExpenseItemAndPersist: jest.fn(),
  updateBudgetExpenseItemAndPersist: jest.fn(),
  updateBudgetExpenseItemKindAndPersist: jest.fn(),
  deleteBudgetExpenseItemAndPersist: jest.fn(),
}));

const mockGetBudgetExpenseItems = getBudgetExpenseItems as jest.MockedFunction<
  typeof getBudgetExpenseItems
>;
const mockCreateBudgetExpenseItemAndPersist =
  createBudgetExpenseItemAndPersist as jest.MockedFunction<
    typeof createBudgetExpenseItemAndPersist
  >;
const mockUpdateBudgetExpenseItemAndPersist =
  updateBudgetExpenseItemAndPersist as jest.MockedFunction<
    typeof updateBudgetExpenseItemAndPersist
  >;
const mockUpdateBudgetExpenseItemKindAndPersist =
  updateBudgetExpenseItemKindAndPersist as jest.MockedFunction<
    typeof updateBudgetExpenseItemKindAndPersist
  >;
const mockDeleteBudgetExpenseItemAndPersist =
  deleteBudgetExpenseItemAndPersist as jest.MockedFunction<
    typeof deleteBudgetExpenseItemAndPersist
  >;

const item = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetExpenseItemManagementDataState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBudgetExpenseItems.mockReturnValue([item]);
  });

  it("初期表示時にgetBudgetExpenseItemsで一覧を読み込む", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "食費",
        amountInput: "30000",
        kindInput: "variable",
        closeForm: jest.fn(),
      }),
    );

    expect(result.current.items).toEqual([item]);
  });

  it("有効な金額の場合はhandleCreateが成功しstateを更新しcloseFormを呼ぶ", () => {
    const closeForm = jest.fn();
    const nextItems = [
      item,
      { ...item, id: "expense-2", kind: "variable" as const },
    ];
    mockCreateBudgetExpenseItemAndPersist.mockImplementation(({ persist }) => {
      persist(nextItems);
      return nextItems;
    });

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "食費",
        amountInput: "30000",
        kindInput: "variable",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateBudgetExpenseItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      nameInput: "食費",
      amount: 30000,
      kind: "variable",
      persist: expect.any(Function),
    });
    expect(closeForm).toHaveBeenCalled();
    expect(result.current.items).toEqual(nextItems);
  });

  it("金額が0以下の場合はhandleCreateがcreateBudgetExpenseItemAndPersistを呼ばない", () => {
    const closeForm = jest.fn();

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "食費",
        amountInput: "0",
        kindInput: "variable",
        closeForm,
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(mockCreateBudgetExpenseItemAndPersist).not.toHaveBeenCalled();
    expect(closeForm).not.toHaveBeenCalled();
  });

  it("handleUpdateItemはupdateBudgetExpenseItemAndPersistへ名前と金額をまとめて委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleUpdateItem("expense-1", "マンション家賃", 85000);
    });

    expect(mockUpdateBudgetExpenseItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      itemId: "expense-1",
      name: "マンション家賃",
      amount: 85000,
      persist: expect.any(Function),
    });
  });

  it("handleUpdateKindはupdateBudgetExpenseItemKindAndPersistへ委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleUpdateKind("expense-1", "variable");
    });

    expect(mockUpdateBudgetExpenseItemKindAndPersist).toHaveBeenCalledWith({
      items: [item],
      itemId: "expense-1",
      kind: "variable",
      persist: expect.any(Function),
    });
  });

  it("toggleItemKindはfixedの項目をvariableへ切り替える", () => {
    mockGetBudgetExpenseItems.mockReturnValue([item]);

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.toggleItemKind("expense-1");
    });

    expect(mockUpdateBudgetExpenseItemKindAndPersist).toHaveBeenCalledWith({
      items: [item],
      itemId: "expense-1",
      kind: "variable",
      persist: expect.any(Function),
    });
  });

  it("toggleItemKindはvariableの項目をfixedへ切り替える", () => {
    const variableItem = {
      ...item,
      id: "expense-2",
      kind: "variable" as const,
    };
    mockGetBudgetExpenseItems.mockReturnValue([variableItem]);

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.toggleItemKind("expense-2");
    });

    expect(mockUpdateBudgetExpenseItemKindAndPersist).toHaveBeenCalledWith({
      items: [variableItem],
      itemId: "expense-2",
      kind: "fixed",
      persist: expect.any(Function),
    });
  });

  it("toggleItemKindは存在しないitemIdの場合は何もしない", () => {
    mockGetBudgetExpenseItems.mockReturnValue([item]);

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.toggleItemKind("expense-404");
    });

    expect(mockUpdateBudgetExpenseItemKindAndPersist).not.toHaveBeenCalled();
  });

  it("handleDeleteはdeleteBudgetExpenseItemAndPersistへメッセージ付きで委譲する", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "",
        amountInput: "",
        kindInput: "fixed",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleDelete(item);
    });

    expect(mockDeleteBudgetExpenseItemAndPersist).toHaveBeenCalledWith({
      items: [item],
      item,
      message: "「家賃」を削除しますか？この操作は元に戻せません。",
      persist: expect.any(Function),
    });
  });

  it("persistはstateの更新とsaveBudgetExpenseItemsの両方を行う", () => {
    const nextItems = [
      item,
      { ...item, id: "expense-2", kind: "variable" as const },
    ];
    mockCreateBudgetExpenseItemAndPersist.mockImplementation(({ persist }) => {
      persist(nextItems);
      return nextItems;
    });

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementDataState({
        nameInput: "食費",
        amountInput: "30000",
        kindInput: "variable",
        closeForm: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleCreate();
    });

    expect(saveBudgetExpenseItems).toHaveBeenCalledWith(nextItems);
    expect(result.current.items).toEqual(nextItems);
  });
});
