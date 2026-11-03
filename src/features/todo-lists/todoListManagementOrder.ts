import { toTodoListMenuItemId } from "@/hooks/dynamicTodoMenuItems";
import { sortByMenuOrder } from "@/hooks/headerMenuOrder";
import type { TodoList } from "./types";

/**
 * Todoリスト管理ページでの表示順を、ハンバーガーメニューと同じ基準で揃える。
 * 基準は、管理画面の並び替えと設定画面のMenuOrderSectionの両方が書く`menuOrder`。
 * ハンバーガーメニューの並び順を決めるsortByMenuOrder/getMenuOrderRankを
 * そのまま再利用することで、画面どうしのロジックが乖離しないようにしている。
 *
 * 非表示（isHidden）のリストも除外せず、`menuOrder`に載っていればその位置に置く。
 * 載っていないリストの位置は、getMenuOrderRankの規則（他のリストの直後など）に従う。
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
