import { generateId } from "../idGenerator";
import { setOrClear } from "./setOrClear";
import type { ListFields } from "./todoListInput";
import type { TodoItem, TodoList } from "./todoTypes";

export const createTodoList = (
  input: ListFields & { title: string },
  now: Date,
): TodoList => {
  const { defaultItemBgColor, ...rest } = input;
  const timestamp = now.toISOString();
  const list: TodoList = {
    id: generateId("todo-list", now),
    ...rest,
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return setOrClear(list, "defaultItemBgColor", defaultItemBgColor);
};

export const applyListPatch = (
  list: TodoList,
  patch: ListFields,
  now: Date,
): TodoList => {
  const { defaultItemBgColor, ...rest } = patch;
  return setOrClear(
    { ...list, ...rest, updatedAt: now.toISOString() },
    "defaultItemBgColor",
    defaultItemBgColor,
  );
};

/** リスト内のアイテム群を更新し、updatedAt を現在時刻に更新する */
export const updateListItems = (
  list: TodoList,
  items: TodoItem[],
  now: Date,
): TodoList => ({
  ...list,
  items,
  updatedAt: now.toISOString(),
});
