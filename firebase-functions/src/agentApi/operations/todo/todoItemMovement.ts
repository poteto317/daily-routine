import { invalidField } from "../../validation/fieldError";
import type { AddItemPosition, TodoItem } from "./todoTypes";

const indentOf = (item: TodoItem): number => item.indent ?? 0;

/**
 * アイテムを追加する。insertAfterIndex があればその直後、無ければ addItemPosition に従う。
 * アプリは範囲外の insertAfterIndex を黙って無視するが、API は意図しない位置への追加を防ぐため 400 にする。
 */
export const insertItem = (
  items: TodoItem[],
  item: TodoItem,
  position: AddItemPosition | undefined,
  insertAfterIndex: number | undefined,
): TodoItem[] => {
  if (insertAfterIndex !== undefined) {
    if (insertAfterIndex >= items.length) {
      throw invalidField(
        "insertAfterIndex",
        "既存アイテムの位置を指定してください",
      );
    }
    return [
      ...items.slice(0, insertAfterIndex + 1),
      item,
      ...items.slice(insertAfterIndex + 1),
    ];
  }
  return position === "first" ? [item, ...items] : [...items, item];
};

/** startIndex を親とみなし、それより深いインデントが続く範囲の終端（exclusive） */
export const blockEndIndex = (
  items: TodoItem[],
  startIndex: number,
): number => {
  const parentIndent = indentOf(items[startIndex]);
  let end = startIndex + 1;
  while (end < items.length && indentOf(items[end]) > parentIndent) end += 1;
  return end;
};

/**
 * アイテムを親子ブロックごと toIndex へ移動する（アプリの reorderItemsInList と同じ仕様）。
 * 範囲外は 400、同じ位置や自分のブロック内への移動は何もしない。
 */
export const moveItem = (
  items: TodoItem[],
  fromIndex: number,
  toIndex: number,
): TodoItem[] => {
  if (toIndex >= items.length) {
    throw invalidField("moveToIndex", "既存アイテムの位置を指定してください");
  }
  if (fromIndex === toIndex) return items;

  const end = blockEndIndex(items, fromIndex);
  if (toIndex >= fromIndex && toIndex < end) return items;

  const moved = items.slice(fromIndex, end);
  const remaining = [...items.slice(0, fromIndex), ...items.slice(end)];
  const insertAt =
    toIndex > fromIndex
      ? blockEndIndex(items, toIndex) - moved.length
      : toIndex;
  remaining.splice(insertAt, 0, ...moved);
  return remaining;
};
