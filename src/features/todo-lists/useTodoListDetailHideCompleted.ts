import { useCallback, useEffect, useRef } from "react";
import type { TodoList } from "./types";

type UseTodoListDetailHideCompletedParams = {
  list: TodoList;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailHideCompleted = ({
  list,
  onUpdateListHideCompleted,
}: UseTodoListDetailHideCompletedParams) => {
  const hideCompleted = list.hideCompleted ?? false;

  // 再レンダー前に連続でトグルされても取りこぼさないよう、
  // list の値が変わるたびに ref へ同期しつつ（レンダー中には触れない）、
  // 同一レンダー内での連続呼び出しは ref 上の直近の反転結果を基準にする。
  const pendingHideCompletedRef = useRef(hideCompleted);
  useEffect(() => {
    pendingHideCompletedRef.current = hideCompleted;
  }, [hideCompleted]);

  const { id: listId } = list;
  const toggleHideCompleted = useCallback(() => {
    const next = !pendingHideCompletedRef.current;
    pendingHideCompletedRef.current = next;
    onUpdateListHideCompleted(listId, next);
  }, [listId, onUpdateListHideCompleted]);

  // ref を閉じ込めた toggleHideCompleted を別関数呼び出しの引数に渡すと
  // react-hooks/refs に抵触するため、他の *Result.ts ビルダーとは異なり
  // ここではオブジェクトリテラルを直接返す（useTodoListHistory.ts と同じ形）。
  return {
    hideCompleted,
    toggleHideCompleted,
  };
};
