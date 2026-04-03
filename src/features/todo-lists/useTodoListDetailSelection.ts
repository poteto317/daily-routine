import type { TodoListItem } from "./types";
import { useTodoListDetailSelectedItems } from "./useTodoListDetailSelectedItems";
import { useTodoListDetailCutAction } from "./useTodoListDetailCutAction";
import { useTodoListDetailPasteAction } from "./useTodoListDetailPasteAction";

type UseTodoListDetailSelectionParams = {
  listId: string;
  clipboardItems: TodoListItem[];
  onCutItems: (listId: string, itemIds: ReadonlySet<string>) => TodoListItem[];
  onPasteItems: (listId: string, items: TodoListItem[]) => void;
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
};

/**
 * 選択・カット・ペーストをまとめる統合hook
 * 責務: DetailView での選択/カット/ペースト操作の状態とアクションを集約して提供
 */
export const useTodoListDetailSelection = ({
  listId,
  clipboardItems,
  onCutItems,
  onPasteItems,
  onSetClipboard,
  onClearClipboard,
}: UseTodoListDetailSelectionParams) => {
  const selectedItems = useTodoListDetailSelectedItems();

  const { handleCut } = useTodoListDetailCutAction({
    listId,
    selectedItemIds: selectedItems.selectedItemIds,
    clearSelection: selectedItems.clearSelection,
    onCutItems,
    onSetClipboard,
  });

  const { handlePaste } = useTodoListDetailPasteAction({
    listId,
    clipboardItems,
    onPasteItems,
    onClearClipboard,
  });

  return {
    ...selectedItems,
    handleCut,
    handlePaste,
  };
};
