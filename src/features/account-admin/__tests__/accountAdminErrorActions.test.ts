import { createAccountAdminErrorActions } from "../accountAdminErrorActions";

describe("accountAdminErrorActions", () => {
  it("error action が clear/report を返す", () => {
    const setError = jest.fn();
    const { clearError, reportError } =
      createAccountAdminErrorActions(setError);

    reportError("err");
    clearError();

    expect(setError).toHaveBeenNthCalledWith(1, "err");
    expect(setError).toHaveBeenNthCalledWith(2, null);
  });
});
