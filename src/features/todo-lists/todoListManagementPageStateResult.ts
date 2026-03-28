import type { RefObject } from "react";
import type { TodoList } from "./types";

type TodoListManagementPageStateResultArgs = {
  closeForm: () => void;
  commitEditListTitle: () => void;
  cancelEditListTitle: () => void;
  editingListId: string | null;
  editingListTitleValue: string;
  handleCreate: () => void;
  handleDelete: (list: TodoList) => void;
  handleToggleVisibility: (list: TodoList) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  lists: TodoList[];
  openForm: () => void;
  openList: (listId: string) => void;
  setEditingListTitleValue: (value: string) => void;
  setTitleInput: (value: string) => void;
  showForm: boolean;
  startEditListTitle: (listId: string, currentTitle: string) => void;
  titleInput: string;
};

export const createTodoListManagementPageStateResult = ({
  closeForm,
  commitEditListTitle,
  cancelEditListTitle,
  editingListId,
  editingListTitleValue,
  handleCreate,
  handleDelete,
  handleToggleVisibility,
  inputRef,
  lists,
  openForm,
  openList,
  setEditingListTitleValue,
  setTitleInput,
  showForm,
  startEditListTitle,
  titleInput,
}: TodoListManagementPageStateResultArgs) => {
  return {
    inputRef,
    lists,
    showForm,
    titleInput,
    closeForm,
    handleCreate,
    handleDelete,
    handleToggleVisibility,
    openForm,
    openList,
    setTitleInput,
    cancelEditListTitle,
    commitEditListTitle,
    editingListId,
    editingListTitleValue,
    setEditingListTitleValue,
    startEditListTitle,
  };
};
