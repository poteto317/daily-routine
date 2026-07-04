import { useRef } from "react";
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

  // useEffect による同期は「コミット後」まで反映が遅れるため、その隙に
  // トグルされると古い値を基準に反転してしまう（リスト切替直後・外部同期
  // 直後など）。そこで比較・同期・反転をすべてトグル呼び出し時点
  // （＝レンダーではなくイベントハンドラ実行時）に一本化する:
  // renderedHideCompletedRef で「このレンダーの hideCompleted を
  // 反映済みか」を判定し、ズレていれば pending をその場で同期してから
  // 反転する。ref の読み書きはこの関数内でのみ行い、レンダー中には
  // 一切触れない（react-hooks/refs 対応）。
  const renderedHideCompletedRef = useRef(hideCompleted);
  const pendingHideCompletedRef = useRef(hideCompleted);

  const toggleHideCompleted = () => {
    if (renderedHideCompletedRef.current !== hideCompleted) {
      renderedHideCompletedRef.current = hideCompleted;
      pendingHideCompletedRef.current = hideCompleted;
    }

    const next = !pendingHideCompletedRef.current;
    pendingHideCompletedRef.current = next;
    onUpdateListHideCompleted(list.id, next);
  };

  // ref を閉じ込めた toggleHideCompleted を別関数呼び出しの引数に渡すと
  // react-hooks/refs に抵触するため、他の *Result.ts ビルダーとは異なり
  // ここではオブジェクトリテラルを直接返す（useTodoListHistory.ts と同じ形）。
  return {
    hideCompleted,
    toggleHideCompleted,
  };
};
