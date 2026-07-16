import { useRef } from "react";
import type { TodoList } from "./types";

type UseTodoListDetailGroupByCategoryParams = {
  list: TodoList;
  onUpdateListGroupByCategory: (
    listId: string,
    groupByCategory: boolean,
  ) => void;
};

export const useTodoListDetailGroupByCategory = ({
  list,
  onUpdateListGroupByCategory,
}: UseTodoListDetailGroupByCategoryParams) => {
  const groupByCategory = list.groupByCategory ?? false;

  // useEffect による同期は「コミット後」まで反映が遅れるため、その隙に
  // トグルされると古い値を基準に反転してしまう（リスト切替直後・外部同期
  // 直後など）。そこで比較・同期・反転をすべてトグル呼び出し時点
  // （＝レンダーではなくイベントハンドラ実行時）に一本化する:
  // renderedGroupByCategoryRef で「このレンダーの groupByCategory を
  // 反映済みか」を判定し、ズレていれば pending をその場で同期してから
  // 反転する。ref の読み書きはこの関数内でのみ行い、レンダー中には
  // 一切触れない（react-hooks/refs 対応）。
  //
  // 現状 TodoListsPage.tsx は key={selectedId} でリスト切替時に
  // TodoListDetail を再マウントするため list.id が変わることはないが、
  // その前提に暗黙に依存せずフック単体で正しく動くよう、listId も
  // 比較対象に含めて防御する（別リストの pending 値を引き継がない）。
  const renderedListIdRef = useRef(list.id);
  const renderedGroupByCategoryRef = useRef(groupByCategory);
  const pendingGroupByCategoryRef = useRef(groupByCategory);

  const toggleGroupByCategory = () => {
    if (
      renderedListIdRef.current !== list.id ||
      renderedGroupByCategoryRef.current !== groupByCategory
    ) {
      renderedListIdRef.current = list.id;
      renderedGroupByCategoryRef.current = groupByCategory;
      pendingGroupByCategoryRef.current = groupByCategory;
    }

    const next = !pendingGroupByCategoryRef.current;
    pendingGroupByCategoryRef.current = next;
    onUpdateListGroupByCategory(list.id, next);
  };

  // ref を閉じ込めた toggleGroupByCategory を別関数呼び出しの引数に渡すと
  // react-hooks/refs に抵触するため、他の *Result.ts ビルダーとは異なり
  // ここではオブジェクトリテラルを直接返す（useTodoListHistory.ts と同じ形）。
  return {
    groupByCategory,
    toggleGroupByCategory,
  };
};
