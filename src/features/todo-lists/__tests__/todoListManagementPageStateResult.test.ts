import { createRef } from "react";
import { createTodoListManagementPageStateResult } from "../todoListManagementPageStateResult";

describe("todoListManagementPageStateResult", () => {
  it("management page の公開 state を組み立てる", () => {
    const inputRef = createRef<HTMLInputElement>();
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const closeForm = jest.fn();
    const commitEditListTitle = jest.fn();
    const cancelEditListTitle = jest.fn();
    const handleCreate = jest.fn();
    const handleDelete = jest.fn();
    const handleToggleVisibility = jest.fn();
    const openForm = jest.fn();
    const openList = jest.fn();
    const setEditingListTitleValue = jest.fn();
    const setTitleInput = jest.fn();
    const startEditListTitle = jest.fn();

    expect(
      createTodoListManagementPageStateResult({
        closeForm,
        commitEditListTitle,
        cancelEditListTitle,
        editingListId: "list-1",
        editingListTitleValue: "Inbox",
        handleCreate,
        handleDelete,
        handleToggleVisibility,
        inputRef,
        lists: [list],
        openForm,
        openList,
        setEditingListTitleValue,
        setTitleInput,
        showForm: true,
        startEditListTitle,
        titleInput: "Inbox",
      }),
    ).toEqual({
      inputRef,
      lists: [list],
      showForm: true,
      titleInput: "Inbox",
      closeForm,
      handleCreate,
      handleDelete,
      handleToggleVisibility,
      openForm,
      openList,
      setTitleInput,
      cancelEditListTitle,
      commitEditListTitle,
      editingListId: "list-1",
      editingListTitleValue: "Inbox",
      setEditingListTitleValue,
      startEditListTitle,
    });
  });
});
