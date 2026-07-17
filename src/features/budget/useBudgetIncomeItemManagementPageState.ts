import { useBudgetIncomeItemManagementFormState } from "./useBudgetIncomeItemManagementFormState";
import { useBudgetIncomeItemManagementFormFocus } from "./useBudgetIncomeItemManagementFormFocus";
import { useBudgetIncomeItemManagementDataState } from "./useBudgetIncomeItemManagementDataState";
import { useBudgetIncomeItemEditState } from "./useBudgetIncomeItemEditState";
import { parsePositiveAmount } from "./budgetPageStateHelpers";

export const useBudgetIncomeItemManagementPageState = () => {
  const {
    inputRef,
    nameInput,
    amountInput,
    showForm,
    setNameInput,
    setAmountInput,
    openForm,
    closeForm,
  } = useBudgetIncomeItemManagementFormState();

  const { items, handleCreate, handleUpdateItem, handleDelete } =
    useBudgetIncomeItemManagementDataState({ nameInput, amountInput, closeForm });

  const {
    editingItemId,
    editingItemName,
    editingItemAmount,
    setEditingItemName,
    setEditingItemAmount,
    startEditItem,
    cancelEditItem,
  } = useBudgetIncomeItemEditState();

  const commitEditItem = () => {
    if (!editingItemId) return;

    // 金額が無効な場合は名前だけ保存して編集行を閉じることはせず、
    // 新規作成フォーム（handleCreate）と同様に編集を継続させ、
    // ユーザーが金額を修正できるようにする。
    const amount = parsePositiveAmount(editingItemAmount);
    if (amount === null) return;

    handleUpdateItem(editingItemId, editingItemName, amount);
    cancelEditItem();
  };

  useBudgetIncomeItemManagementFormFocus({ inputRef, showForm });

  return {
    items,
    inputRef,
    nameInput,
    amountInput,
    showForm,
    setNameInput,
    setAmountInput,
    openForm,
    closeForm,
    handleCreate,
    handleDelete,
    editingItemId,
    editingItemName,
    editingItemAmount,
    setEditingItemName,
    setEditingItemAmount,
    startEditItem,
    commitEditItem,
    cancelEditItem,
  };
};
