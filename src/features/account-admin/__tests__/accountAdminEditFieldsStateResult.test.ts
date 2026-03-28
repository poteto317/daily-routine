import { createAccountAdminEditFieldsStateResult } from "../accountAdminEditFieldsStateResult";

describe("createAccountAdminEditFieldsStateResult", () => {
  it("edit field state の公開 shape を返す", () => {
    const setEditDisplayName = jest.fn();
    const setEditIsAdmin = jest.fn();

    expect(
      createAccountAdminEditFieldsStateResult({
        editDisplayName: "更新後",
        editIsAdmin: true,
        setEditDisplayName,
        setEditIsAdmin,
      }),
    ).toEqual({
      editDisplayName: "更新後",
      editIsAdmin: true,
      setEditDisplayName,
      setEditIsAdmin,
    });
  });
});
