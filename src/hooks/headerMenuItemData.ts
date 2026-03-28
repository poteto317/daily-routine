import { getSettings } from "@/features/settings/storage";
import { getTodoLists } from "@/features/todo-lists/storage";
import {
  getSelectedTodoListId,
  setSelectedTodoListId,
} from "@/features/todo-lists/selectedTodoList";

type HeaderMenuItemData = {
  visibleFeatures:
    | ReturnType<typeof getSettings>["visibleFeatures"]
    | undefined;
  menuOrder: string[];
  todoListsVisible: boolean;
  todoLists: ReturnType<typeof getTodoLists>;
  currentSelectedId: ReturnType<typeof getSelectedTodoListId>;
  setSelectedTodoListId: typeof setSelectedTodoListId;
};

export const getHeaderMenuItemData = (
  isMenuOpen: boolean,
): HeaderMenuItemData => {
  if (!isMenuOpen) {
    return {
      visibleFeatures: undefined,
      menuOrder: [],
      todoListsVisible: true,
      todoLists: [],
      currentSelectedId: null,
      setSelectedTodoListId,
    };
  }

  const settings = getSettings();
  const visibleFeatures = settings.visibleFeatures;
  const todoListsVisible = visibleFeatures?.todoLists !== false;

  return {
    visibleFeatures,
    menuOrder: settings.menuOrder ?? [],
    todoListsVisible,
    todoLists: todoListsVisible ? getTodoLists() : [],
    currentSelectedId: todoListsVisible ? getSelectedTodoListId() : null,
    setSelectedTodoListId,
  };
};

export type { HeaderMenuItemData };
