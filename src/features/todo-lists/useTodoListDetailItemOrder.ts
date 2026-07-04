import { useCallback, useEffect, useRef } from "react";
import type { TodoList } from "./types";

type UseTodoListDetailItemOrderParams = {
  list: TodoList;
  onUpdateListMoveCompletedToBottom: (
    listId: string,
    moveCompletedToBottom: boolean,
  ) => void;
};

export const useTodoListDetailItemOrder = ({
  list,
  onUpdateListMoveCompletedToBottom,
}: UseTodoListDetailItemOrderParams) => {
  const moveCompletedToBottom = list.moveCompletedToBottom ?? false;

  // 再レンダー前に連続でトグルされても取りこぼさないよう、
  // list の値が変わるたびに ref へ同期しつつ（レンダー中には触れない）、
  // 同一レンダー内での連続呼び出しは ref 上の直近の反転結果を基準にする。
  const pendingMoveCompletedToBottomRef = useRef(moveCompletedToBottom);
  useEffect(() => {
    pendingMoveCompletedToBottomRef.current = moveCompletedToBottom;
  }, [moveCompletedToBottom]);

  const { id: listId } = list;
  const toggleMoveCompletedToBottom = useCallback(() => {
    const next = !pendingMoveCompletedToBottomRef.current;
    pendingMoveCompletedToBottomRef.current = next;
    onUpdateListMoveCompletedToBottom(listId, next);
  }, [listId, onUpdateListMoveCompletedToBottom]);

  // ref を閉じ込めた toggleMoveCompletedToBottom を別関数呼び出しの引数に渡すと
  // react-hooks/refs に抵触するため、他の *Result.ts ビルダーとは異なり
  // ここではオブジェクトリテラルを直接返す（useTodoListHistory.ts と同じ形）。
  return {
    moveCompletedToBottom,
    toggleMoveCompletedToBottom,
  };
};
