import type { TodoCategory, TodoItemBgColorValue, TodoList, TodoListItem } from "./types";
import { createToolbarState } from "./todoListDetailToolbarState";
import { useTodoListDetailSelection } from "./useTodoListDetailSelection";
import { useTodoListDetailViewState } from "./useTodoListDetailViewState";
import { useTodoListDetailUIControllers } from "./useTodoListDetailUIControllers";
import { useTodoListInteractionMode } from "./useTodoListInteractionMode";

export type UseTodoListDetailViewCompositionParams = {
  list: TodoList;
  categories: TodoCategory[];
  clipboardItems: TodoListItem[];
  onAddItem: (listId: string, title: string, insertAfterIndex?: number) => void;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
  onCutItems: (listId: string, itemIds: ReadonlySet<string>) => TodoListItem[];
  onPasteItems: (listId: string, items: TodoListItem[]) => void;
  onSetClipboard: (items: TodoListItem[]) => void;
  onClearClipboard: () => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  onUpdateAllItemsBgColor: (
    listId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateListAddItemPosition: (listId: string, position: "last" | "first") => void;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailViewComposition = ({
  list,
  categories,
  clipboardItems,
  onAddItem,
  onUpdateItemTitle,
  onUpdateListTitle,
  onCutItems,
  onPasteItems,
  onSetClipboard,
  onClearClipboard,
  onReorderItems,
  onUpdateAllItemsBgColor,
  onUpdateListAddItemPosition,
  onUpdateListHideCompleted,
}: UseTodoListDetailViewCompositionParams) => {
  const selection = useTodoListDetailSelection({
    listId: list.id,
    clipboardItems,
    onCutItems,
    onPasteItems,
    onSetClipboard,
    onClearClipboard,
  });

  const viewState = useTodoListDetailViewState({
    list,
    categories,
    onAddItem,
    onUpdateItemTitle,
    onUpdateListTitle,
    onUpdateListHideCompleted,
  });

  const uiControllers = useTodoListDetailUIControllers();

  const interactionMode = useTodoListInteractionMode({
    listId: list.id,
    items: list.items,
    onAddItem,
    onReorderItems,
  });

  const toolbar = createToolbarState({ list, onUpdateAllItemsBgColor, onUpdateListAddItemPosition });

  return {
    selection,
    hasClipboard: clipboardItems.length > 0,
    viewState,
    uiControllers,
    interactionMode,
    toolbar,
  };
};
