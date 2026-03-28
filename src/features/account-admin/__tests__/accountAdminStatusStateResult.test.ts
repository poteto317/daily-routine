import { createAccountAdminStatusStateResult } from "../accountAdminStatusStateResult";

describe("createAccountAdminStatusStateResult", () => {
  it("status state の公開 shape を返す", () => {
    const setError = jest.fn();
    const setIsAdmin = jest.fn();
    const setLoading = jest.fn();

    expect(
      createAccountAdminStatusStateResult({
        error: "err",
        isAdmin: true,
        loading: false,
        setError,
        setIsAdmin,
        setLoading,
      }),
    ).toEqual({
      error: "err",
      isAdmin: true,
      loading: false,
      setError,
      setIsAdmin,
      setLoading,
    });
  });
});
