"use client";

import { TodoListDetail } from "./TodoListDetail";
import { TodoListNoSelectionView } from "./TodoListNoSelectionView";
import { useTodoListsPageState } from "./useTodoListsPageState";

export const TodoListsPage = () => {
  const { effectiveSelectedId, clipboardItems, setClipboard, clearClipboard } =
    useTodoListsPageState();

  if (!effectiveSelectedId) {
    return <TodoListNoSelectionView />;
  }

  // key={selectedId} により、リスト切替時に TodoListDetail が再マウントされ
  // useReducer の初期値として最新の localStorage データが読み込まれる
  return (
    <TodoListDetail
      key={effectiveSelectedId}
      listId={effectiveSelectedId}
      clipboardItems={clipboardItems}
      onSetClipboard={setClipboard}
      onClearClipboard={clearClipboard}
    />
  );
};
