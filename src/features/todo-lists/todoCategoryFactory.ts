import { generateId } from "@/lib/storage/core";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";

export const createTodoCategory = (
  name: string,
  color?: TodoItemBgColorValue,
): TodoCategory => ({
  id: generateId("todo-category"),
  name,
  color,
  createdAt: new Date().toISOString(),
});
