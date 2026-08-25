import type { TodoItemBgColorValue, TodoList } from "./types";

export type ToolbarState = {
  hasCompletedItems: boolean;
  handleUpdateAllItemsBgColor: (
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  handleToggleAddItemPosition: (nextPosition: "first" | "last") => void;
};

type CreateToolbarStateParams = {
  list: TodoList;
  onUpdateAllItemsBgColor: (
    listId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateListAddItemPosition: (
    listId: string,
    position: "first" | "last",
  ) => void;
};

export const createToolbarState = ({
  list,
  onUpdateAllItemsBgColor,
  onUpdateListAddItemPosition,
}: CreateToolbarStateParams): ToolbarState => ({
  hasCompletedItems: list.items.some((item) => item.isCompleted),
  handleUpdateAllItemsBgColor: (bgColor) =>
    onUpdateAllItemsBgColor(list.id, bgColor),
  handleToggleAddItemPosition: (nextPosition) =>
    onUpdateListAddItemPosition(list.id, nextPosition),
});
