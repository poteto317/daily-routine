import { renderHook } from "@testing-library/react";
import { createLoginActionStateResult } from "../loginActionStateResult";
import { useLoginActionHandlers } from "../useLoginActionHandlers";
import { useLoginActionRuntimeState } from "../useLoginActionRuntimeState";
import { useLoginActionState } from "../useLoginActionState";

jest.mock("../loginActionStateResult", () => ({
  createLoginActionStateResult: jest.fn(),
}));

jest.mock("../useLoginActionHandlers", () => ({
  useLoginActionHandlers: jest.fn(),
}));

jest.mock("../useLoginActionRuntimeState", () => ({
  useLoginActionRuntimeState: jest.fn(),
}));

describe("useLoginActionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLoginActionRuntimeState as jest.Mock).mockReturnValue({
      error: null,
      loading: false,
      setError: jest.fn(),
      setLoading: jest.fn(),
    });
    (useLoginActionHandlers as jest.Mock).mockReturnValue({
      handleAnonymousLogin: jest.fn(),
      handleSubmit: jest.fn(),
      handleTestLogin: jest.fn(),
      toggleMode: jest.fn(),
    });
    (createLoginActionStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("runtime と handlers を compose して result helper に委譲する", () => {
    const setIsSignUp = jest.fn();
    const runtime = {
      error: "failed",
      loading: true,
      setError: jest.fn(),
      setLoading: jest.fn(),
    };
    const handlers = {
      handleAnonymousLogin: jest.fn(),
      handleSubmit: jest.fn(),
      handleTestLogin: jest.fn(),
      toggleMode: jest.fn(),
    };

    (useLoginActionRuntimeState as jest.Mock).mockReturnValue(runtime);
    (useLoginActionHandlers as jest.Mock).mockReturnValue(handlers);

    const { result } = renderHook(() =>
      useLoginActionState({
        email: "user@example.com",
        password: "secret123",
        isSignUp: true,
        setIsSignUp,
      }),
    );

    expect(useLoginActionHandlers).toHaveBeenCalledWith({
      email: "user@example.com",
      isSignUp: true,
      password: "secret123",
      setIsSignUp,
      setError: runtime.setError,
      setLoading: runtime.setLoading,
    });
    expect(createLoginActionStateResult).toHaveBeenCalledWith({
      error: "failed",
      loading: true,
      handleAnonymousLogin: handlers.handleAnonymousLogin,
      handleSubmit: handlers.handleSubmit,
      handleTestLogin: handlers.handleTestLogin,
      toggleMode: handlers.toggleMode,
    });
    expect(result.current).toEqual({
      error: "failed",
      loading: true,
      handleAnonymousLogin: handlers.handleAnonymousLogin,
      handleSubmit: handlers.handleSubmit,
      handleTestLogin: handlers.handleTestLogin,
      toggleMode: handlers.toggleMode,
    });
  });
});
