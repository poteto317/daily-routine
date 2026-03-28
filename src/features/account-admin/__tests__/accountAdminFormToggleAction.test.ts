import { createAccountAdminToggleCreateFormAction } from "../accountAdminFormToggleAction";

describe("accountAdminFormToggleAction", () => {
  it("create form toggle 時に edit を cancel する", () => {
    const cancelEdit = jest.fn();
    const toggleCreateFormBase = jest.fn();

    createAccountAdminToggleCreateFormAction({
      cancelEdit,
      toggleCreateFormBase,
    })();

    expect(toggleCreateFormBase).toHaveBeenCalledTimes(1);
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });
});
