import type { TodoCategory, TodoList } from "./types";
import { createTodoListDetailViewStateResult } from "./todoListDetailViewStateResult";
import { useTodoListDetailComputedState } from "./useTodoListDetailComputedState";
import { useTodoListDetailEditingState } from "./useTodoListDetailEditingState";
import { useTodoListDetailFormState } from "./useTodoListDetailFormState";

type UseTodoListDetailViewStateParams = {
  list: TodoList;
  categories: TodoCategory[];
  onAddItem: (listId: string, title: string) => void;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
  onUpdateListHideCompleted: (listId: string, hideCompleted: boolean) => void;
};

export const useTodoListDetailViewState = ({
  list,
  categories,
  onAddItem,
  onUpdateItemTitle,
  onUpdateListTitle,
  onUpdateListHideCompleted,
}: UseTodoListDetailViewStateParams) => {
  const detailForm = useTodoListDetailFormState({
    listId: list.id,
    onAddItem,
  });
  const detailComputed = useTodoListDetailComputedState({
    list,
    categories,
    onUpdateListHideCompleted,
  });
  const detailEditing = useTodoListDetailEditingState({
    listId: list.id,
    listTitle: list.title,
    onUpdateItemTitle,
    onUpdateListTitle,
  });

  return createTodoListDetailViewStateResult({
    detailForm,
    detailComputed,
    detailEditing,
  });
};
