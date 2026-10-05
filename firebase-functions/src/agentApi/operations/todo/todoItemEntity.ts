import { generateId } from "../idGenerator";
import { setOrClear } from "./setOrClear";
import type { ItemFields } from "./todoItemInput";
import type { TodoItem, TodoList } from "./todoTypes";

/** 背景色の指定が無ければリストの defaultItemBgColor を引き継ぐ（アプリと同じ） */
export const createTodoItem = (
  fields: ItemFields & { title: string },
  list: TodoList,
  now: Date,
): TodoItem => {
  const { bgColor, categoryId, ...rest } = fields;
  const item: TodoItem = {
    id: generateId("todo-item", now),
    isCompleted: false,
    ...rest,
    createdAt: now.toISOString(),
  };
  const color = bgColor === undefined ? list.defaultItemBgColor : bgColor;
  return setOrClear(
    setOrClear(item, "bgColor", color),
    "categoryId",
    categoryId,
  );
};

export const applyItemPatch = (
  item: TodoItem,
  fields: ItemFields,
): TodoItem => {
  const { bgColor, categoryId, ...rest } = fields;
  return setOrClear(
    setOrClear({ ...item, ...rest }, "bgColor", bgColor),
    "categoryId",
    categoryId,
  );
};
