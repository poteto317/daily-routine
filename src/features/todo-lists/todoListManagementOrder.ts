import { toTodoListMenuItemId } from "@/hooks/dynamicTodoMenuItems";
import { sortByMenuOrder } from "@/hooks/headerMenuOrder";
import type { TodoList } from "./types";

/**
 * Todoリスト管理ページでの表示順を、ハンバーガーメニュー
 * （設定画面のMenuOrderSectionで並び替えた`menuOrder`）と同じ基準で揃える。
 * ハンバーガーメニューの並び順を決めるsortByMenuOrder/getMenuOrderRankを
 * そのまま再利用することで、両画面のロジックが乖離しないようにしている。
 *
 * 非表示（isHidden）のリストはハンバーガーメニューには一切表示されないため
 * 「正解の順序」が存在しないが、除外はせず全リスト配列の中での自然順
 * （fallbackIndex）に基づいて他のリストと自然に混在させる。
 *
 * 表示専用の並び替えであり、渡された`lists`自体やストレージの並び順は
 * 変更しない（新しい配列を返す）。
 */
export const sortTodoListsByMenuOrder = (
  lists: TodoList[],
  menuOrder: string[],
): TodoList[] => {
  return sortByMenuOrder(
    lists,
    (list) => toTodoListMenuItemId(list.id),
    lists.map((list) => toTodoListMenuItemId(list.id)),
    menuOrder,
  );
};
