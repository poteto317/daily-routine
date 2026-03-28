import { createTodoListManagementTitleEditingResult } from "../todoListManagementTitleEditingResult";

describe("createTodoListManagementTitleEditingResult", () => {
  it("title editing の公開 shape を返す", () => {
    const cancelEditListTitle = jest.fn();
    const commitEditListTitle = jest.fn();
    const setEditingListTitleValue = jest.fn();
    const startEditListTitle = jest.fn();

    expect(
      createTodoListManagementTitleEditingResult({
        cancelEditListTitle,
        commitEditListTitle,
        editingListId: "list-1",
        editingListTitleValue: "Inbox",
        setEditingListTitleValue,
        startEditListTitle,
      }),
    ).toEqual({
      cancelEditListTitle,
      commitEditListTitle,
      editingListId: "list-1",
      editingListTitleValue: "Inbox",
      setEditingListTitleValue,
      startEditListTitle,
    });
  });
});
