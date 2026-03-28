import { useTodoListDetailItemEditing } from "./useTodoListDetailItemEditing";
import { useTodoListDetailTitleEditing } from "./useTodoListDetailTitleEditing";
import { createTodoListDetailEditingStateResult } from "./todoListDetailEditingStateResult";

type UseTodoListDetailEditingStateParams = {
  listId: string;
  listTitle: string;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
};

export const useTodoListDetailEditingState = ({
  listId,
  listTitle,
  onUpdateItemTitle,
  onUpdateListTitle,
}: UseTodoListDetailEditingStateParams) => {
  const itemEditing = useTodoListDetailItemEditing({
    listId,
    onUpdateItemTitle,
  });
  const titleEditing = useTodoListDetailTitleEditing({
    listId,
    listTitle,
    onUpdateListTitle,
  });

  return createTodoListDetailEditingStateResult({
    itemEditing,
    titleEditing,
  });
};
