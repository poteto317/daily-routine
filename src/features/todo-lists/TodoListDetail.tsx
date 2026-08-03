"use client";

import type { TodoCategory, TodoListItem } from "./types";
import { TodoListDetailView } from "./TodoListDetailView";
import { TodoListNoSelectionView } from "./TodoListNoSelectionView";
import { TodoListUndoRedoControls } from "./TodoListUndoRedoControls";
import { useTodoListDetailState } from "./useTodoListDetailState";
import { useTodoListUndoRedoKeyboard } from "./useTodoListUndoRedoKeyboard";

export type TodoListDetailProps = {
  listId: string;
  categories: TodoCategory[];
  clipboardItems: TodoListItem[];
  onSetClipboardAction: (items: TodoListItem[]) => void;
  onClearClipboardAction: () => void;
};

export const TodoListDetail = ({
  listId,
  categories,
  clipboardItems,
  onSetClipboardAction,
  onClearClipboardAction,
}: TodoListDetailProps) => {
  const { list, detailHandlers, undo, redo, canUndo, canRedo } =
    useTodoListDetailState(listId);

  useTodoListUndoRedoKeyboard({ undo, redo });

  if (!list || !detailHandlers) {
    return <TodoListNoSelectionView />;
  }

  const {
    onAddItem: onAddItemAction,
    onToggleItem: onToggleItemAction,
    onDeleteItem: onDeleteItemAction,
    onIndentItem: onIndentItemAction,
    onOutdentItem: onOutdentItemAction,
    onReorderItems: onReorderItemsAction,
    onUpdateItemTitle: onUpdateItemTitleAction,
    onUpdateListTitle: onUpdateListTitleAction,
    onUpdateListAddItemPosition: onUpdateListAddItemPositionAction,
    onUpdateListHideCompleted: onUpdateListHideCompletedAction,
    onUpdateItemBgColor: onUpdateItemBgColorAction,
    onUpdateAllItemsBgColor: onUpdateAllItemsBgColorAction,
    onUpdateItemCategory: onUpdateItemCategoryAction,
    onCutItems: onCutItemsAction,
    onPasteItems: onPasteItemsAction,
  } = detailHandlers;

  return (
    <TodoListDetailView
      list={list}
      categories={categories}
      onAddItemAction={onAddItemAction}
      onToggleItemAction={onToggleItemAction}
      onDeleteItemAction={onDeleteItemAction}
      onIndentItemAction={onIndentItemAction}
      onOutdentItemAction={onOutdentItemAction}
      onReorderItemsAction={onReorderItemsAction}
      onUpdateItemTitleAction={onUpdateItemTitleAction}
      onUpdateListTitleAction={onUpdateListTitleAction}
      onUpdateItemBgColorAction={onUpdateItemBgColorAction}
      onUpdateAllItemsBgColorAction={onUpdateAllItemsBgColorAction}
      onCutItemsAction={onCutItemsAction}
      onPasteItemsAction={onPasteItemsAction}
      onUpdateListAddItemPositionAction={onUpdateListAddItemPositionAction}
      onUpdateListHideCompletedAction={onUpdateListHideCompletedAction}
      onUpdateItemCategoryAction={onUpdateItemCategoryAction}
      clipboardItems={clipboardItems}
      onSetClipboardAction={onSetClipboardAction}
      onClearClipboardAction={onClearClipboardAction}
      historyControls={
        <TodoListUndoRedoControls
          onUndoAction={undo}
          onRedoAction={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      }
    />
  );
};
