import { act, renderHook } from "@testing-library/react";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";
import { useBudgetIncomeItemManagementFormState } from "../useBudgetIncomeItemManagementFormState";
import { useBudgetIncomeItemManagementFormFocus } from "../useBudgetIncomeItemManagementFormFocus";
import { useBudgetIncomeItemManagementDataState } from "../useBudgetIncomeItemManagementDataState";
import { useBudgetIncomeItemEditState } from "../useBudgetIncomeItemEditState";

jest.mock("../useBudgetIncomeItemManagementFormState", () => ({
  useBudgetIncomeItemManagementFormState: jest.fn(),
}));
jest.mock("../useBudgetIncomeItemManagementFormFocus", () => ({
  useBudgetIncomeItemManagementFormFocus: jest.fn(),
}));
jest.mock("../useBudgetIncomeItemManagementDataState", () => ({
  useBudgetIncomeItemManagementDataState: jest.fn(),
}));
jest.mock("../useBudgetIncomeItemEditState", () => ({
  useBudgetIncomeItemEditState: jest.fn(),
}));

const mockUseFormState =
  useBudgetIncomeItemManagementFormState as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementFormState
  >;
const mockUseFormFocus =
  useBudgetIncomeItemManagementFormFocus as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementFormFocus
  >;
const mockUseDataState =
  useBudgetIncomeItemManagementDataState as jest.MockedFunction<
    typeof useBudgetIncomeItemManagementDataState
  >;
const mockUseEditState = useBudgetIncomeItemEditState as jest.MockedFunction<
  typeof useBudgetIncomeItemEditState
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
      closeForm: jest.fn(),
    });
    mockUseDataState.mockReturnValue({
      items: [item],
      handleCreate: jest.fn(),
      handleUpdateItem,
      handleDelete: jest.fn(),
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
});
