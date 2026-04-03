import { useTodoListDetailSelectedItemsState } from "./useTodoListDetailSelectedItemsState";
import { useTodoListDetailSelectionActions } from "./useTodoListDetailSelectionActions";

/**
 * 選択状態とアクションを集約するhook（useTodoListDetailItemEditing の選択版相当）
 * 責務: selectionState と selectionActions を組み合わせた選択操作 API の提供
 */
export const useTodoListDetailSelectedItems = () => {
  const { selectedItemIds, setSelectedItemIds } =
    useTodoListDetailSelectedItemsState();

  const { toggleSelectItem, clearSelection } =
    useTodoListDetailSelectionActions({ setSelectedItemIds });

  return {
    selectedItemIds,
    toggleSelectItem,
    clearSelection,
    hasSelection: selectedItemIds.size > 0,
  };
};
