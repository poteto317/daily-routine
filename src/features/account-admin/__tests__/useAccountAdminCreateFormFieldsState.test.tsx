import { act, renderHook } from "@testing-library/react";
import { createAccountAdminCreateFormFieldsStateResult } from "../accountAdminCreateFormFieldsStateResult";
import { useAccountAdminCreateFormFieldsState } from "../useAccountAdminCreateFormFieldsState";

jest.mock("../accountAdminCreateFormFieldsStateResult", () => ({
  createAccountAdminCreateFormFieldsStateResult: jest.fn(),
}));

describe("useAccountAdminCreateFormFieldsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createAccountAdminCreateFormFieldsStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("作成フォーム入力欄の state を管理する", () => {
    const { result } = renderHook(() => useAccountAdminCreateFormFieldsState());

    expect(createAccountAdminCreateFormFieldsStateResult).toHaveBeenCalledWith({
      createDisplayName: "",
      createEmail: "",
      createIsAdmin: false,
      createPassword: "",
      setCreateDisplayName: expect.any(Function),
      setCreateEmail: expect.any(Function),
      setCreateIsAdmin: expect.any(Function),
      setCreatePassword: expect.any(Function),
    });

    act(() => {
      result.current.setCreateEmail("user@example.com");
      result.current.setCreatePassword("secret123");
      result.current.setCreateDisplayName("ユーザー");
      result.current.setCreateIsAdmin(true);
    });

    expect(result.current.createEmail).toBe("user@example.com");
    expect(result.current.createPassword).toBe("secret123");
    expect(result.current.createDisplayName).toBe("ユーザー");
    expect(result.current.createIsAdmin).toBe(true);
    expect(
      createAccountAdminCreateFormFieldsStateResult,
    ).toHaveBeenLastCalledWith({
      createDisplayName: "ユーザー",
      createEmail: "user@example.com",
      createIsAdmin: true,
      createPassword: "secret123",
      setCreateDisplayName: expect.any(Function),
      setCreateEmail: expect.any(Function),
      setCreateIsAdmin: expect.any(Function),
      setCreatePassword: expect.any(Function),
    });
  });
});
