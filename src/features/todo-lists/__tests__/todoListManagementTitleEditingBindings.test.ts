import { createTodoListManagementTitleEditingBindings } from "../todoListManagementTitleEditingBindings";

describe("todoListManagementTitleEditingBindings", () => {
  it("title editing hook 用の依存を束ねる", () => {
    const handleRename = jest.fn();

    expect(
      createTodoListManagementTitleEditingBindings({
        handleRename,
      }),
    ).toEqual({
      handleRename,
    });
  });
});
