import { useBudgetExpenseItemManagementFormState } from "./useBudgetExpenseItemManagementFormState";
import { useBudgetExpenseItemManagementFormFocus } from "./useBudgetExpenseItemManagementFormFocus";
import { useBudgetExpenseItemManagementDataState } from "./useBudgetExpenseItemManagementDataState";
import { useBudgetExpenseItemEditState } from "./useBudgetExpenseItemEditState";
import { groupBudgetExpenseItemsByKind } from "./budgetExpenseItemKindGroups";
import { parsePositiveAmount } from "./budgetPageStateHelpers";

export const useBudgetExpenseItemManagementPageState = () => {
  const {
    inputRef,
    nameInput,
    amountInput,
    kindInput,
    showForm,
    setNameInput,
    setAmountInput,
    setKindInput,
    openForm,
    closeForm,
  } = useBudgetExpenseItemManagementFormState();

  const {
    items,
    handleCreate,
    handleUpdateItem,
    toggleItemKind,
    handleDelete,
  } = useBudgetExpenseItemManagementDataState({
    nameInput,
    amountInput,
    kindInput,
    closeForm,
  });

  const {
    editingItemId,
    editingItemName,
    editingItemAmount,
    setEditingItemName,
    setEditingItemAmount,
    startEditItem,
    cancelEditItem,
  } = useBudgetExpenseItemEditState();

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

  useBudgetExpenseItemManagementFormFocus({ inputRef, showForm });

  const { fixedItems, variableItems } = groupBudgetExpenseItemsByKind(items);

  return {
    items,
    fixedItems,
    variableItems,
    inputRef,
    nameInput,
    amountInput,
    kindInput,
    showForm,
    setNameInput,
    setAmountInput,
    setKindInput,
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
    toggleItemKind,
  };
};
