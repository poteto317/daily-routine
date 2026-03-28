import { createTodoListManagementFormActionsResult } from "../todoListManagementFormActionsResult";

describe("createTodoListManagementFormActionsResult", () => {
  it("form action の公開 shape を返す", () => {
    const closeForm = jest.fn();
    const openForm = jest.fn();

    expect(
      createTodoListManagementFormActionsResult({
        closeForm,
        openForm,
      }),
    ).toEqual({
      closeForm,
      openForm,
    });
  });
});
