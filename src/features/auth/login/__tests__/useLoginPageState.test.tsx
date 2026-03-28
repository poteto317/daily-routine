import { renderHook } from "@testing-library/react";
import { useLoginPageState } from "../useLoginPageState";

jest.mock("../loginPageActionBindings", () => ({
  createLoginPageActionBindings: jest.fn(),
}));

jest.mock("../loginPageStateResult", () => ({
  createLoginPageStateResult: jest.fn(),
}));

jest.mock("../useLoginActionState", () => ({
  useLoginActionState: jest.fn(),
}));

jest.mock("../useLoginFormState", () => ({
  useLoginFormState: jest.fn(),
}));

import { createLoginPageActionBindings } from "../loginPageActionBindings";
import { createLoginPageStateResult } from "../loginPageStateResult";
import { useLoginActionState } from "../useLoginActionState";
import { useLoginFormState } from "../useLoginFormState";

describe("useLoginPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLoginFormState as jest.Mock).mockReturnValue({
      email: "user@example.com",
      handleEmailChange: jest.fn(),
      handlePasswordChange: jest.fn(),
      isSignUp: false,
      password: "secret123",
      setIsSignUp: jest.fn(),
    });
    (createLoginPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useLoginActionState as jest.Mock).mockReturnValue({
      error: null,
      loading: false,
      handleAnonymousLogin: jest.fn(),
      handleSubmit: jest.fn(),
      handleTestLogin: jest.fn(),
      toggleMode: jest.fn(),
    });
    (createLoginPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("form/action/result を compose する", () => {
    const { result } = renderHook(() => useLoginPageState());

    expect(useLoginFormState).toHaveBeenCalledTimes(1);
    expect(createLoginPageActionBindings).toHaveBeenCalledWith({
      email: "user@example.com",
      isSignUp: false,
      password: "secret123",
      setIsSignUp: expect.any(Function),
    });
    expect(useLoginActionState).toHaveBeenCalledWith({ bound: true });
    expect(createLoginPageStateResult).toHaveBeenCalledWith({
      email: "user@example.com",
      error: null,
      isSignUp: false,
      loading: false,
      password: "secret123",
      handleAnonymousLogin: expect.any(Function),
      handleEmailChange: expect.any(Function),
      handlePasswordChange: expect.any(Function),
      handleSubmit: expect.any(Function),
      handleTestLogin: expect.any(Function),
      toggleMode: expect.any(Function),
    });
    expect(result.current).toEqual({ composed: true });
  });

  it("sign up 状態も action bindings に渡す", () => {
    (useLoginFormState as jest.Mock).mockReturnValue({
      email: "next@example.com",
      handleEmailChange: jest.fn(),
      handlePasswordChange: jest.fn(),
      isSignUp: true,
      password: "password456",
      setIsSignUp: jest.fn(),
    });

    renderHook(() => useLoginPageState());

    expect(createLoginPageActionBindings).toHaveBeenCalledWith({
      email: "next@example.com",
      isSignUp: true,
      password: "password456",
      setIsSignUp: expect.any(Function),
    });
    expect(createLoginPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "next@example.com",
        isSignUp: true,
        password: "password456",
      }),
    );
  });
});
