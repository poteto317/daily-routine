import { act, renderHook } from "@testing-library/react";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";
import { useBudgetExpenseItemManagementFormState } from "../useBudgetExpenseItemManagementFormState";
import { useBudgetExpenseItemManagementFormFocus } from "../useBudgetExpenseItemManagementFormFocus";
import { useBudgetExpenseItemManagementDataState } from "../useBudgetExpenseItemManagementDataState";
import { useBudgetExpenseItemEditState } from "../useBudgetExpenseItemEditState";

jest.mock("../useBudgetExpenseItemManagementFormState", () => ({
  useBudgetExpenseItemManagementFormState: jest.fn(),
}));
jest.mock("../useBudgetExpenseItemManagementFormFocus", () => ({
  useBudgetExpenseItemManagementFormFocus: jest.fn(),
}));
jest.mock("../useBudgetExpenseItemManagementDataState", () => ({
  useBudgetExpenseItemManagementDataState: jest.fn(),
}));
jest.mock("../useBudgetExpenseItemEditState", () => ({
  useBudgetExpenseItemEditState: jest.fn(),
}));

const mockUseFormState =
  useBudgetExpenseItemManagementFormState as jest.MockedFunction<
    typeof useBudgetExpenseItemManagementFormState
  >;
const mockUseFormFocus =
  useBudgetExpenseItemManagementFormFocus as jest.MockedFunction<
    typeof useBudgetExpenseItemManagementFormFocus
  >;
const mockUseDataState =
  useBudgetExpenseItemManagementDataState as jest.MockedFunction<
    typeof useBudgetExpenseItemManagementDataState
  >;
const mockUseEditState = useBudgetExpenseItemEditState as jest.MockedFunction<
  typeof useBudgetExpenseItemEditState
>;

const fixedItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const variableItem = {
  id: "expense-2",
  name: "食費",
  amount: 30000,
  kind: "variable" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetExpenseItemManagementPageState composition", () => {
  const handleUpdateItem = jest.fn();
  const toggleItemKind = jest.fn();
  const cancelEditItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormState.mockReturnValue({
      inputRef: { current: null },
      nameInput: "食費",
      amountInput: "30000",
      kindInput: "variable",
      showForm: true,
      setNameInput: jest.fn(),
      setAmountInput: jest.fn(),
      setKindInput: jest.fn(),
      openForm: jest.fn(),
      closeForm: jest.fn(),
    });
    mockUseDataState.mockReturnValue({
      items: [fixedItem, variableItem],
      handleCreate: jest.fn(),
      handleUpdateItem,
      handleUpdateKind: jest.fn(),
      toggleItemKind,
      handleDelete: jest.fn(),
    });
    mockUseEditState.mockReturnValue({
      editingItemId: "expense-1",
      editingItemName: "マンション家賃",
      editingItemAmount: "85000",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });
    mockUseFormFocus.mockReturnValue(undefined);
  });

  it("itemsをkindで固定費/変動費に分類する（groupBudgetExpenseItemsByKindへの委譲）", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );

    expect(result.current.items).toEqual([fixedItem, variableItem]);
    expect(result.current.fixedItems).toEqual([fixedItem]);
    expect(result.current.variableItems).toEqual([variableItem]);
  });

  it("commitEditItemは名前と金額をまとめて1回のhandleUpdateItemで反映し編集を終了する", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).toHaveBeenCalledTimes(1);
    expect(handleUpdateItem).toHaveBeenCalledWith(
      "expense-1",
      "マンション家賃",
      85000,
    );
    expect(cancelEditItem).toHaveBeenCalled();
  });

  it("commitEditItemは金額が無効な場合、名前も保存せず編集行を閉じない（新規作成フォームと同様に編集を継続する）", () => {
    mockUseEditState.mockReturnValue({
      editingItemId: "expense-1",
      editingItemName: "マンション家賃",
      editingItemAmount: "0",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });

    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).not.toHaveBeenCalled();
    expect(cancelEditItem).not.toHaveBeenCalled();
  });

  it("toggleItemKindはuseBudgetExpenseItemManagementDataStateのものをそのまま公開する", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );

    expect(result.current.toggleItemKind).toBe(toggleItemKind);

    act(() => {
      result.current.toggleItemKind("expense-1");
    });
    expect(toggleItemKind).toHaveBeenCalledWith("expense-1");
  });
});
