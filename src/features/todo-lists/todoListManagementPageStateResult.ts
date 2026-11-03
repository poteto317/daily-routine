import type { RefObject } from "react";
import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { TodoList } from "./types";

type TodoListManagementDnd = {
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
};

type TodoListManagementPageStateResultArgs = {
  closeForm: () => void;
  commitEditListTitle: () => void;
  cancelEditListTitle: () => void;
  dnd: TodoListManagementDnd;
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
  dnd,
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
    dnd,
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
