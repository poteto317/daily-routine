import { createAccountAdminActionHandlersResult } from "../accountAdminActionHandlersResult";

describe("createAccountAdminActionHandlersResult", () => {
  it("create/update/delete handler の公開 shape を返す", () => {
    const handleCreate = jest.fn();
    const handleUpdate = jest.fn();
    const handleDelete = jest.fn();

    expect(
      createAccountAdminActionHandlersResult({
        handleCreate,
        handleUpdate,
        handleDelete,
      }),
    ).toEqual({
      handleCreate,
      handleUpdate,
      handleDelete,
    });
  });
});
