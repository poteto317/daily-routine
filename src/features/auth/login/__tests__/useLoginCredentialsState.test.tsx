import { act, renderHook } from "@testing-library/react";
import { createLoginCredentialsStateResult } from "../loginCredentialsStateResult";
import { useLoginCredentialsState } from "../useLoginCredentialsState";

jest.mock("../loginCredentialsStateResult", () => ({
  createLoginCredentialsStateResult: jest.fn(),
}));

describe("useLoginCredentialsState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLoginCredentialsStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("メールアドレスとパスワードを保持する", () => {
    const { result } = renderHook(() => useLoginCredentialsState());

    expect(createLoginCredentialsStateResult).toHaveBeenCalledWith({
      email: "",
      password: "",
      setEmail: expect.any(Function),
      setPassword: expect.any(Function),
    });

    act(() => {
      result.current.setEmail("user@example.com");
      result.current.setPassword("secret123");
    });

    expect(result.current.email).toBe("user@example.com");
    expect(result.current.password).toBe("secret123");
    expect(createLoginCredentialsStateResult).toHaveBeenLastCalledWith({
      email: "user@example.com",
      password: "secret123",
      setEmail: expect.any(Function),
      setPassword: expect.any(Function),
    });
  });
});
