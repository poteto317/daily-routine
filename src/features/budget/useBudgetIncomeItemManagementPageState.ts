import { useBudgetIncomeItemManagementFormState } from "./useBudgetIncomeItemManagementFormState";
import { useFormOpenAutoFocus } from "@/hooks/useFormOpenAutoFocus";
import { useBudgetIncomeItemManagementDataState } from "./useBudgetIncomeItemManagementDataState";
import { useBudgetItemEditState } from "./useBudgetItemEditState";
import { parsePositiveAmount } from "./budgetPageStateHelpers";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

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
    useBudgetIncomeItemManagementDataState({
      nameInput,
      amountInput,
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
  } = useBudgetItemEditState();

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

  useFormOpenAutoFocus({ inputRef, showForm });

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
