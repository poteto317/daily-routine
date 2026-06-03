"use client";

import type { TodoListItem } from "./types";
import { TodoListDetailView } from "./TodoListDetailView";
import { TodoListNoSelectionView } from "./TodoListNoSelectionView";
import {
  useTodoListDetailState,
  useTodoListSelectionState,
} from "./useTodoListsPageState";
import { useTodoListDetailClipboard } from "./useTodoListDetailClipboard";

// ============================================================
// リスト詳細の状態管理コンテナ（key={listId} でリスト切替時に再マウント）
// ============================================================
type TodoListDetailProps = {
  listId: string;
  clipboardItems: TodoListItem[];
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
};

const TodoListDetail = ({
  listId,
  clipboardItems,
  onSetClipboard,
  onClearClipboard,
}: TodoListDetailProps) => {
  const { list, detailHandlers } = useTodoListDetailState(listId);

  if (!list || !detailHandlers) {
    // リストが削除された場合などのフォールバック
    return <TodoListNoSelectionView />;
  }

  return (
    <TodoListDetailView
      list={list}
      {...detailHandlers}
      clipboardItems={clipboardItems}
      onSetClipboard={onSetClipboard}
      onClearClipboard={onClearClipboard}
    />
  );
};

// ============================================================
// メインページコンポーネント
// ============================================================
export const TodoListsPage = () => {
  const { effectiveSelectedId } = useTodoListSelectionState();
  const { clipboardItems, setClipboard, clearClipboard } =
    useTodoListDetailClipboard();

  if (!effectiveSelectedId) {
    return <TodoListNoSelectionView />;
  }

  // key={selectedId} により、リスト切替時に TodoListDetail が再マウントされ
  // useState の初期値として最新の localStorage データが読み込まれる
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

