import { useMemo } from "react";
import { sortTodoListsByMenuOrder } from "./todoListManagementOrder";
import type { TodoList } from "./types";

type UseTodoListManagementOrderParams = {
  lists: TodoList[];
  /** 表示順の基準（設定の menuOrder と同じ形） */
  menuOrder: string[];
};

/**
 * Todoリスト管理ページの表示順（ハンバーガーメニューと同じ並び順）を導出する。
 * CRUD状態管理（useTodoListManagementDataState.ts）とは責務を分離し、
 * 「menuOrder で並び替える」という関心事のみを持つ。
 * ストレージの生の並び順（作成順）自体は変更しない、表示専用の並び替え。
 *
 * lists と menuOrder の参照が変わったときだけ並べ直す。
 * 描画のたびに新しい配列を渡すとメモ化が効かないので、中身が変わったときだけ
 * 参照が変わる配列（state など）を渡す。
 */
export const useTodoListManagementOrder = ({
  lists,
  menuOrder,
}: UseTodoListManagementOrderParams): TodoList[] => {
  return useMemo(
    () => sortTodoListsByMenuOrder(lists, menuOrder),
    [lists, menuOrder],
  );
};
