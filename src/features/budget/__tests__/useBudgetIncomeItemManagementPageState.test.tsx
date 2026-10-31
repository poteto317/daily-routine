import { act, renderHook } from "@testing-library/react";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetIncomeItemManagementFormState } from "../useBudgetIncomeItemManagementFormState";
import { useFormOpenAutoFocus } from "@/hooks/useFormOpenAutoFocus";
import { useBudgetIncomeItemManagementDataState } from "../useBudgetIncomeItemManagementDataState";
import { useBudgetItemEditState } from "../useBudgetItemEditState";

jest.mock("../useBudgetIncomeItemManagementFormState", () => ({
  useBudgetIncomeItemManagementFormState: jest.fn(),
}));
jest.mock("@/hooks/useFormOpenAutoFocus", () => ({
  useFormOpenAutoFocus: jest.fn(),
}));
jest.mock("../useBudgetIncomeItemManagementDataState", () => ({
  useBudgetIncomeItemManagementDataState: jest.fn(),
}));
jest.mock("../useBudgetItemEditState", () => ({
  useBudgetItemEditState: jest.fn(),
}));

const mockUseFormState =
  useBudgetIncomeItemManagementFormState as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementFormState
  >;
const mockUseFormFocus = useFormOpenAutoFocus as jest.MockedFunction<
  typeof useFormOpenAutoFocus
>;
const mockUseDataState =
  useBudgetIncomeItemManagementDataState as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementDataState
  >;
const mockUseEditState = useBudgetItemEditState as jest.MockedFunction<
  typeof useBudgetItemEditState
>;

const item = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("useBudgetIncomeItemManagementPageState composition", () => {
  const handleUpdateItem = jest.fn();
  const cancelEditItem = jest.fn();
  const closeForm = jest.fn();
  const reloadDataItems = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseFormState.mockReturnValue({
      inputRef: { current: null },
      nameInput: "副業",
      amountInput: "50000",
      showForm: true,
      setNameInput: jest.fn(),
      setAmountInput: jest.fn(),
      openForm: jest.fn(),
      closeForm,
    });
    mockUseDataState.mockReturnValue({
      items: [item],
      handleCreate: jest.fn(),
      handleUpdateItem,
      handleDelete: jest.fn(),
      reloadItems: reloadDataItems,
    });
    mockUseEditState.mockReturnValue({
      editingItemId: "income-1",
      editingItemName: "本業給与",
      editingItemAmount: "320000",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });
    mockUseFormFocus.mockReturnValue(undefined);
  });

  it("各フックを正しい引数で合成し、値をまとめて返す", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    expect(mockUseDataState).toHaveBeenCalledWith({
      nameInput: "副業",
      amountInput: "50000",
      closeForm: expect.any(Function),
    });
    expect(mockUseFormFocus).toHaveBeenCalledWith({
      inputRef: { current: null },
      showForm: true,
    });

    expect(result.current.items).toEqual([item]);
    expect(result.current.nameInput).toBe("副業");
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingItemId).toBe("income-1");
  });

  it("commitEditItemは名前と金額(有効な値)をまとめて1回のhandleUpdateItemで反映し編集を終了する", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).toHaveBeenCalledTimes(1);
    expect(handleUpdateItem).toHaveBeenCalledWith(
      "income-1",
      "本業給与",
      320000,
    );
    expect(cancelEditItem).toHaveBeenCalled();
  });

  it("commitEditItemは金額が無効な場合、名前も保存せず編集行を閉じない（新規作成フォームと同様に編集を継続する）", () => {
    mockUseEditState.mockReturnValue({
      editingItemId: "income-1",
      editingItemName: "本業給与",
      editingItemAmount: "0",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).not.toHaveBeenCalled();
    expect(cancelEditItem).not.toHaveBeenCalled();
  });

  it("commitEditItemは名前が空白のみの場合、金額が有効でも保存せず編集行を閉じない（新規作成フォームと同様に編集を継続する）", () => {
    mockUseEditState.mockReturnValue({
      editingItemId: "income-1",
      editingItemName: "   ",
      editingItemAmount: "320000",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).not.toHaveBeenCalled();
    expect(cancelEditItem).not.toHaveBeenCalled();
  });

  it("commitEditItemは名前の前後の空白を除去してhandleUpdateItemへ渡す", () => {
    mockUseEditState.mockReturnValue({
      editingItemId: "income-1",
      editingItemName: "  本業給与  ",
      editingItemAmount: "320000",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).toHaveBeenCalledWith(
      "income-1",
      "本業給与",
      320000,
    );
    expect(cancelEditItem).toHaveBeenCalled();
  });

  it("commitEditItemは編集対象が無い場合何もしない", () => {
    mockUseEditState.mockReturnValue({
      editingItemId: null,
      editingItemName: "",
      editingItemAmount: "",
      setEditingItemName: jest.fn(),
      setEditingItemAmount: jest.fn(),
      startEditItem: jest.fn(),
      cancelEditItem,
    });

    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.commitEditItem();
    });

    expect(handleUpdateItem).not.toHaveBeenCalled();
    expect(cancelEditItem).not.toHaveBeenCalled();
  });

  it("reloadItemsは一覧を読み直し、フォームと編集行を閉じる", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );

    act(() => {
      result.current.reloadItems();
    });

    expect(reloadDataItems).toHaveBeenCalledTimes(1);
    expect(closeForm).toHaveBeenCalledTimes(1);
    expect(cancelEditItem).toHaveBeenCalledTimes(1);
  });
});
