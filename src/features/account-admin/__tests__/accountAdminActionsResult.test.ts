import { createAccountAdminActionsResult } from "../accountAdminActionsResult";

describe("accountAdminActionsResult", () => {
  it("actions hook の公開 shape を組み立てる", () => {
    const handleCreate = jest.fn();
    const handleUpdate = jest.fn();
    const handleDelete = jest.fn();

    expect(
      createAccountAdminActionsResult({
        actionLoading: true,
        handleCreate,
        handleUpdate,
        handleDelete,
      }),
    ).toEqual({
      actionLoading: true,
      handleCreate,
      handleUpdate,
      handleDelete,
    });
  });
});
