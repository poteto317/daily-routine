"use client";

import { TodoListDetail } from "./TodoListDetail";
import { TodoListNoSelectionView } from "./TodoListNoSelectionView";
import { useTodoListsPageState } from "./useTodoListsPageState";
import { useTodoCategoriesState } from "./useTodoCategoriesState";

export const TodoListsPage = () => {
  const { effectiveSelectedId, clipboardItems, setClipboard, clearClipboard } =
    useTodoListsPageState();
  const { categories } = useTodoCategoriesState();

  if (!effectiveSelectedId) {
    return <TodoListNoSelectionView />;
  }

  // key={selectedId} により、リスト切替時に TodoListDetail が再マウントされ
  // useReducer の初期値として最新の localStorage データが読み込まれる
  return (
    <TodoListDetail
      key={effectiveSelectedId}
      listId={effectiveSelectedId}
      categories={categories}
      clipboardItems={clipboardItems}
      onSetClipboardAction={setClipboard}
      onClearClipboardAction={clearClipboard}
    />
  );
};
