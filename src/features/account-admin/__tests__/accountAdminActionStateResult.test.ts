import { createAccountAdminActionStateResult } from "../accountAdminActionStateResult";

describe("createAccountAdminActionStateResult", () => {
  it("action loading state の公開 shape を返す", () => {
    const setActionLoading = jest.fn();

    expect(
      createAccountAdminActionStateResult({
        actionLoading: true,
        setActionLoading,
      }),
    ).toEqual({
      actionLoading: true,
      setActionLoading,
    });
  });
});
