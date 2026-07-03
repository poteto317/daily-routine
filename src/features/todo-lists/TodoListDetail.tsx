"use client";

import type { TodoListItem } from "./types";
import { TodoListDetailView } from "./TodoListDetailView";
import { TodoListNoSelectionView } from "./TodoListNoSelectionView";
import { TodoListUndoRedoControls } from "./TodoListUndoRedoControls";
import { useTodoListDetailState } from "./useTodoListDetailState";
import { useTodoListUndoRedoKeyboard } from "./useTodoListUndoRedoKeyboard";

export type TodoListDetailProps = {
  listId: string;
  clipboardItems: TodoListItem[];
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
};

export const TodoListDetail = ({
  listId,
  clipboardItems,
  onSetClipboard,
  onClearClipboard,
}: TodoListDetailProps) => {
  const { list, detailHandlers, undo, redo, canUndo, canRedo } =
    useTodoListDetailState(listId);

  useTodoListUndoRedoKeyboard({ undo, redo });

  if (!list || !detailHandlers) {
    return <TodoListNoSelectionView />;
  }

  return (
    <TodoListDetailView
      list={list}
      {...detailHandlers}
      clipboardItems={clipboardItems}
      onSetClipboard={onSetClipboard}
      onClearClipboard={onClearClipboard}
      historyControls={
        <TodoListUndoRedoControls
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      }
    />
  );
};
