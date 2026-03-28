import { useTodoListDetailTitleEditingActions } from "./useTodoListDetailTitleEditingActions";
import { useTodoListDetailTitleEditingValueState } from "./useTodoListDetailTitleEditingValueState";

type UseTodoListDetailTitleEditingStateParams = {
  listId: string;
  listTitle: string;
  onUpdateListTitle: (listId: string, title: string) => void;
};

export const useTodoListDetailTitleEditingState = ({
  listId,
  listTitle,
  onUpdateListTitle,
}: UseTodoListDetailTitleEditingStateParams) => {
  const {
    editingListTitle,
    editingListTitleValue,
    listTitleInputRef,
    setEditingListTitle,
    setEditingListTitleValue,
  } = useTodoListDetailTitleEditingValueState();
  const { cancelEditListTitle, commitEditListTitle, startEditListTitle } =
    useTodoListDetailTitleEditingActions({
      listId,
      listTitle,
      editingListTitleValue,
      onUpdateListTitle,
      setEditingListTitle,
      setEditingListTitleValue,
    });

  return {
    cancelEditListTitle,
    commitEditListTitle,
    editingListTitle,
    editingListTitleValue,
    listTitleInputRef,
    setEditingListTitleValue,
    startEditListTitle,
  };
};
