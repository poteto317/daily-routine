import { act, renderHook } from "@testing-library/react";

jest.mock("../../context/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../loginAuthHandlers", () => ({
  createAnonymousLoginHandler: jest.fn(),
  createLoginSubmitHandler: jest.fn(),
  createTestLoginHandler: jest.fn(),
}));

jest.mock("../loginModeActions", () => ({
  createLoginModeToggleHandler: jest.fn(),
}));

jest.mock("../loginActionHandlersResult", () => ({
  createLoginActionHandlersResult: jest.fn(),
}));

import { useAuth } from "../../context/useAuth";
import { createLoginActionHandlersResult } from "../loginActionHandlersResult";
import {
  createAnonymousLoginHandler,
  createLoginSubmitHandler,
  createTestLoginHandler,
} from "../loginAuthHandlers";
import { createLoginModeToggleHandler } from "../loginModeActions";
import { useLoginActionHandlers } from "../useLoginActionHandlers";

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("useLoginActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      signIn: jest.fn().mockResolvedValue(undefined),
      signUp: jest.fn().mockResolvedValue(undefined),
      signInAnonymous: jest.fn().mockResolvedValue(undefined),
      signInAsTestUser: jest.fn().mockResolvedValue(undefined),
      signOut: jest.fn().mockResolvedValue(undefined),
      user: null,
      loading: false,
      isAdmin: false,
      isAdminLoading: false,
    });
  });

  it("submit/test/anonymous/toggle handler を組み立てて委譲する", async () => {
    const submitHandler = jest.fn().mockResolvedValue(undefined);
    const testHandler = jest.fn().mockResolvedValue(undefined);
    const anonymousHandler = jest.fn().mockResolvedValue(undefined);
    const toggleHandler = jest.fn();
    const resultShape = {
      handleSubmit: jest.fn(),
      handleTestLogin: jest.fn(),
      handleAnonymousLogin: jest.fn(),
      toggleMode: jest.fn(),
      composed: true,
    };
    (createLoginSubmitHandler as jest.Mock).mockReturnValue(submitHandler);
    (createTestLoginHandler as jest.Mock).mockReturnValue(testHandler);
    (createAnonymousLoginHandler as jest.Mock).mockReturnValue(
      anonymousHandler,
    );
    (createLoginModeToggleHandler as jest.Mock).mockReturnValue(toggleHandler);
    (createLoginActionHandlersResult as jest.Mock).mockReturnValue(resultShape);

    const params = createParams();
    const { result } = renderHook(() => useLoginActionHandlers(params));

    expect(result.current).toBe(resultShape);
    expect(createLoginActionHandlersResult).toHaveBeenCalledWith({
      handleSubmit: submitHandler,
      handleTestLogin: testHandler,
      handleAnonymousLogin: anonymousHandler,
      toggleMode: toggleHandler,
    });

    const builtHandlers = (createLoginActionHandlersResult as jest.Mock).mock
      .calls[0][0] as {
      handleSubmit: (event: unknown) => Promise<void>;
      handleTestLogin: () => Promise<void>;
      handleAnonymousLogin: () => Promise<void>;
      toggleMode: () => void;
    };

    await act(async () => {
      await builtHandlers.handleSubmit({ preventDefault: jest.fn() });
      await builtHandlers.handleTestLogin();
      await builtHandlers.handleAnonymousLogin();
    });
    act(() => {
      builtHandlers.toggleMode();
    });

    expect(createLoginSubmitHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        email: params.email,
        password: params.password,
        isSignUp: params.isSignUp,
        setError: params.setError,
        setLoading: params.setLoading,
      }),
    );
    expect(createTestLoginHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setError: params.setError,
        setLoading: params.setLoading,
      }),
    );
    expect(createAnonymousLoginHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        setError: params.setError,
        setLoading: params.setLoading,
      }),
    );
    expect(createLoginModeToggleHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        isSignUp: params.isSignUp,
        setIsSignUp: params.setIsSignUp,
        setError: params.setError,
      }),
    );
    expect(submitHandler).toHaveBeenCalled();
    expect(testHandler).toHaveBeenCalled();
    expect(anonymousHandler).toHaveBeenCalled();
    expect(toggleHandler).toHaveBeenCalled();
  });
});

const createParams = () => ({
  email: "user@example.com",
  password: "secret123",
  isSignUp: false,
  setIsSignUp: jest.fn(),
  setError: jest.fn(),
  setLoading: jest.fn(),
});
