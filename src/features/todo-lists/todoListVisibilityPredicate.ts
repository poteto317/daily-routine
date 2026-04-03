import type { TodoList } from "./types";

export const isTodoListVisible = (list: TodoList): boolean => !list.isHidden;
