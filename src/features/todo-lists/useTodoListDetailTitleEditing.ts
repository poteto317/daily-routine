import { useTodoListDetailTitleEditingFocus } from "./useTodoListDetailTitleEditingFocus";
import { useTodoListDetailTitleEditingState } from "./useTodoListDetailTitleEditingState";

type UseTodoListDetailTitleEditingParams = {
  listId: string;
  listTitle: string;
  onUpdateListTitle: (listId: string, title: string) => void;
};

export const useTodoListDetailTitleEditing = ({
  listId,
  listTitle,
  onUpdateListTitle,
}: UseTodoListDetailTitleEditingParams) => {
  const titleEditingState = useTodoListDetailTitleEditingState({
    listId,
    listTitle,
    onUpdateListTitle,
  });

  useTodoListDetailTitleEditingFocus({
    editingListTitle: titleEditingState.editingListTitle,
    listTitleInputRef: titleEditingState.listTitleInputRef,
  });

  return titleEditingState;
};
