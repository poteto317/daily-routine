import type { TodoList, TodoListItem } from "./types";

/**
 * `insertAfterIndex` は「この位置の次に挿入する」対象の既存アイテム位置を表す。
 * 配列インデックスは 0 ベースのため、有効な既存インデックスは `0` 以上 `length - 1` 以下。
 * そのため、末尾の直後に追加したい場合でも指定できるのは最後の要素の index であり、
 * `length` 自体は有効な既存インデックスではないので `index <= length` ではなく `index < length` を使う。
 */
const isValidInsertIndex = (index: number, length: number): boolean =>
  index >= 0 && index < length;

/**
 * リストにアイテムを追加する。
 * `insertAfterIndex` が有効なインデックスの場合はその直後に挿入し、
 * 指定がない場合は `addItemPosition`（"first" / "last"）に従って先頭または末尾に追加する。
 */
export const addItemToList = (
  lists: TodoList[],
  listId: string,
  item: TodoListItem,
  insertAfterIndex?: number,
): TodoList[] =>
  lists.map((list) => {
    if (list.id !== listId) return list;
    const newItems =
      insertAfterIndex !== undefined &&
      isValidInsertIndex(insertAfterIndex, list.items.length)
        ? [
            ...list.items.slice(0, insertAfterIndex + 1),
            item,
            ...list.items.slice(insertAfterIndex + 1),
          ]
        : list.addItemPosition === "first"
          ? [item, ...list.items]
          : [...list.items, item];
    return {
      ...list,
      items: newItems,
      updatedAt: new Date().toISOString(),
    };
  });

/**
 * アイテムの完了状態をトグルする。
 */
export const toggleItemInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId
              ? { ...item, isCompleted: !item.isCompleted }
              : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * アイテムをリストから削除する。
 */
export const deleteItemFromList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );

/**
 * アイテムのタイトルを更新する。
 */
export const updateItemTitleInList = (
  lists: TodoList[],
  listId: string,
  itemId: string,
  title: string,
): TodoList[] =>
  lists.map((list) =>
    list.id === listId
      ? {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, title } : item,
          ),
          updatedAt: new Date().toISOString(),
        }
      : list,
  );
