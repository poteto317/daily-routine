import { act, renderHook } from "@testing-library/react";

jest.mock("@/services/authService", () => ({
  signInAnonymousUser: jest.fn(),
  signInAsTestUser: jest.fn(),
  signInWithEmail: jest.fn(),
  signOutUser: jest.fn(),
  signUpWithEmail: jest.fn(),
}));

jest.mock("../authActionsResult", () => ({
  createAuthActionsResult: jest.fn(),
}));

import {
  signInAnonymousUser,
  signInAsTestUser,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/services/authService";
import { createAuthActionsResult } from "../authActionsResult";
import { useAuthActions } from "../useAuthActions";

describe("useAuthActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createAuthActionsResult as jest.Mock).mockImplementation((args) => args);
  });

  it("auth service 呼び出しを action result helper に委譲する", async () => {
    (signInWithEmail as jest.Mock).mockResolvedValue(undefined);
    (signUpWithEmail as jest.Mock).mockResolvedValue(undefined);
    (signOutUser as jest.Mock).mockResolvedValue(undefined);
    (signInAnonymousUser as jest.Mock).mockResolvedValue(undefined);
    (signInAsTestUser as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuthActions());

    expect(createAuthActionsResult).toHaveBeenCalledWith({
      signIn: expect.any(Function),
      signUp: expect.any(Function),
      signOut: expect.any(Function),
      signInAnonymous: expect.any(Function),
      signInAsTestUser: expect.any(Function),
    });

    await act(async () => {
      await result.current.signIn("test@example.com", "password123");
      await result.current.signUp("new@example.com", "password456");
      await result.current.signOut();
      await result.current.signInAnonymous();
      await result.current.signInAsTestUser();
    });

    expect(signInWithEmail).toHaveBeenCalledWith(
      "test@example.com",
      "password123",
    );
    expect(signUpWithEmail).toHaveBeenCalledWith(
      "new@example.com",
      "password456",
    );
    expect(signOutUser).toHaveBeenCalledTimes(1);
    expect(signInAnonymousUser).toHaveBeenCalledTimes(1);
    expect(signInAsTestUser).toHaveBeenCalledTimes(1);
  });
});
