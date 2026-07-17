import { useBudgetExpenseItemManagementFormState } from "./useBudgetExpenseItemManagementFormState";
import { useBudgetExpenseItemManagementFormFocus } from "./useBudgetExpenseItemManagementFormFocus";
import { useBudgetExpenseItemManagementDataState } from "./useBudgetExpenseItemManagementDataState";
import { useBudgetExpenseItemEditState } from "./useBudgetExpenseItemEditState";
import { groupBudgetExpenseItemsByKind } from "./budgetExpenseItemKindGroups";
import { parsePositiveAmount } from "./budgetPageStateHelpers";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

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

    // 名前・金額のいずれかが無効な場合は保存せず編集行を閉じることはせず、
    // 新規作成フォーム（handleCreate）と同様に編集を継続させ、
    // ユーザーが入力を修正できるようにする。
    const normalizedName = normalizeCategoryName(editingItemName);
    const amount = parsePositiveAmount(editingItemAmount);
    if (normalizedName === null || amount === null) return;

    handleUpdateItem(editingItemId, normalizedName, amount);
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
