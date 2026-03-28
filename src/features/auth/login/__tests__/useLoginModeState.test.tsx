import { act, renderHook } from "@testing-library/react";
import { createLoginModeStateResult } from "../loginModeStateResult";
import { useLoginModeState } from "../useLoginModeState";

jest.mock("../loginModeStateResult", () => ({
  createLoginModeStateResult: jest.fn(),
}));

describe("useLoginModeState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createLoginModeStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("sign up mode を切り替える", () => {
    const { result } = renderHook(() => useLoginModeState());

    expect(createLoginModeStateResult).toHaveBeenCalledWith({
      isSignUp: false,
      setIsSignUp: expect.any(Function),
    });

    expect(result.current.isSignUp).toBe(false);

    act(() => {
      result.current.setIsSignUp(true);
    });

    expect(result.current.isSignUp).toBe(true);
    expect(createLoginModeStateResult).toHaveBeenLastCalledWith({
      isSignUp: true,
      setIsSignUp: expect.any(Function),
    });
  });
});
