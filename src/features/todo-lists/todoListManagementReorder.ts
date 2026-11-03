import { arrayMove } from "@dnd-kit/sortable";
import { toTodoListMenuItemId } from "@/hooks/dynamicTodoMenuItems";
import {
  buildMenuOrderNaturalIds,
  sortByMenuOrder,
} from "@/hooks/headerMenuOrder";
import type { TodoList } from "./types";

/** 旧来の「Todoリスト」全体の並び位置を表すメニュー ID。並び替えの結果には残さない。 */
const LEGACY_TODO_LISTS_MENU_ID = "todo-lists";

type ReorderTodoListsInMenuOrderParams = {
  /** 並べ替える前の生の配列（非表示を含む全件） */
  lists: TodoList[];
  menuOrder: string[];
  activeListId: string;
  overListId: string;
};

/**
 * Todoリスト管理画面での並び替えの結果を、新しい menuOrder として返す。
 * 移動が成り立たない（見つからない ID・同じ位置）ときは null を返す。
 *
 * 全メニュー項目を今の順に並べた配列を作り、Todoリストの枠だけを入れ替える。
 * menuOrder に載っていない項目は「menuOrder.length + 自然順」で末尾に回るので、
 * リストの ID だけを足すと他の項目の位置がずれる。全項目を書けば、
 * 他のメニュー項目の相対順と未知の ID（新しい版の端末が書いた ID・削除済みリストの ID）は変わらない。
 * 旧来の "todo-lists" は外す。残すと、後で作ったリストが他のリストの前に出るため。
 * 表示順は、管理画面・メニューと同じ sortByMenuOrder で求め直す（ID で照合する）。
 */
export const reorderTodoListsInMenuOrder = ({
  lists,
  menuOrder,
  activeListId,
  overListId,
}: ReorderTodoListsInMenuOrderParams): string[] | null => {
  const listMenuIds = lists.map((list) => toTodoListMenuItemId(list.id));
  const listMenuIdSet = new Set(listMenuIds);
  const naturalIds = buildMenuOrderNaturalIds(listMenuIds);
  const naturalIdSet = new Set(naturalIds);
  const extraIds = Array.from(new Set(menuOrder)).filter(
    (id) => !naturalIdSet.has(id) && id !== LEGACY_TODO_LISTS_MENU_ID,
  );
  const candidates = [...naturalIds, ...extraIds];
  const ordered = sortByMenuOrder(
    candidates,
    (id) => id,
    candidates,
    menuOrder,
  );
  const displayed = ordered.filter((id) => listMenuIdSet.has(id));
  const fromIndex = displayed.indexOf(toTodoListMenuItemId(activeListId));
  const toIndex = displayed.indexOf(toTodoListMenuItemId(overListId));

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return null;
  }

  const moved = arrayMove(displayed, fromIndex, toIndex);
  let movedCursor = 0;
  return ordered.map((id) => {
    if (!listMenuIdSet.has(id)) return id;
    const nextId = moved[movedCursor];
    movedCursor += 1;
    return nextId;
  });
};
