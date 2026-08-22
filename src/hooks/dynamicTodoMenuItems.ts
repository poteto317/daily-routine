import type { TodoList } from "@/features/todo-lists/types";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";

export const TODO_LIST_MENU_ID_PREFIX = "todo-list-";

/** TodoリストのIDをヘッダーメニュー用IDへ変換する。 */
export const toTodoListMenuItemId = (listId: string): string =>
  `${TODO_LIST_MENU_ID_PREFIX}${listId}`;

type BuildDynamicTodoMenuItemsParams = {
  isMenuOpen: boolean;
  todoListsVisible: boolean;
  todoLists: TodoList[];
  currentSelectedId: string | null;
  setSelectedTodoListId: (id: string) => void;
};

export const buildDynamicTodoMenuItems = ({
  isMenuOpen,
  todoListsVisible,
  todoLists,
  currentSelectedId,
  setSelectedTodoListId,
}: BuildDynamicTodoMenuItemsParams): HeaderMenuItem[] => {
  if (!isMenuOpen || !todoListsVisible) return [];

  return todoLists
    .filter((list) => !list.isHidden)
    .map((list) => ({
      id: toTodoListMenuItemId(list.id),
      label: list.title,
      icon: "✅",
      route: "todo-lists" as const,
      isActive: list.id === currentSelectedId,
      onBeforeNavigate: () => setSelectedTodoListId(list.id),
    }));
};
