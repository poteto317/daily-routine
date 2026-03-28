import { act, renderHook } from "@testing-library/react";
import { createLoginFieldActionsResult } from "../loginFieldActionsResult";
import { useLoginFieldActions } from "../useLoginFieldActions";

jest.mock("../loginFieldActionsResult", () => ({
  createLoginFieldActionsResult: jest.fn(),
}));

describe("useLoginFieldActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLoginFieldActionsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("email と password の変更 handler を提供する", () => {
    const setEmail = jest.fn();
    const setPassword = jest.fn();

    const { result } = renderHook(() =>
      useLoginFieldActions({
        setEmail,
        setPassword,
      }),
    );

    expect(createLoginFieldActionsResult).toHaveBeenCalledWith({
      handleEmailChange: expect.any(Function),
      handlePasswordChange: expect.any(Function),
    });

    act(() => {
      result.current.handleEmailChange("user@example.com");
      result.current.handlePasswordChange("secret123");
    });

    expect(setEmail).toHaveBeenCalledWith("user@example.com");
    expect(setPassword).toHaveBeenCalledWith("secret123");
  });
});
