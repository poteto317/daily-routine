import { useTodoListDetailItemEditingActions } from "./useTodoListDetailItemEditingActions";
import { useTodoListDetailItemEditingState } from "./useTodoListDetailItemEditingState";
import { createTodoListDetailItemEditingResult } from "./todoListDetailItemEditingResult";

type UseTodoListDetailItemEditingParams = {
  listId: string;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
};

export const useTodoListDetailItemEditing = ({
  listId,
  onUpdateItemTitle,
}: UseTodoListDetailItemEditingParams) => {
  const itemEditingState = useTodoListDetailItemEditingState();
  const itemEditingActions = useTodoListDetailItemEditingActions({
    editingItemTitle: itemEditingState.editingItemTitle,
    listId,
    onUpdateItemTitle,
    setEditingItemId: itemEditingState.setEditingItemId,
  });

  return createTodoListDetailItemEditingResult({
    itemEditingState,
    itemEditingActions,
  });
};
