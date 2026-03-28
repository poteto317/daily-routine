import { createAccountAdminCreateFormFieldsStateResult } from "../accountAdminCreateFormFieldsStateResult";

describe("createAccountAdminCreateFormFieldsStateResult", () => {
  it("create field state の公開 shape を返す", () => {
    const setCreateDisplayName = jest.fn();
    const setCreateEmail = jest.fn();
    const setCreateIsAdmin = jest.fn();
    const setCreatePassword = jest.fn();

    expect(
      createAccountAdminCreateFormFieldsStateResult({
        createDisplayName: "ユーザー",
        createEmail: "user@example.com",
        createIsAdmin: true,
        createPassword: "secret123",
        setCreateDisplayName,
        setCreateEmail,
        setCreateIsAdmin,
        setCreatePassword,
      }),
    ).toEqual({
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      setCreateDisplayName,
      setCreateEmail,
      setCreateIsAdmin,
      setCreatePassword,
    });
  });
});
