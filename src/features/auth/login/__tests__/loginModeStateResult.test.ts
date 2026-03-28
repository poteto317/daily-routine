import { createLoginModeStateResult } from "../loginModeStateResult";

describe("createLoginModeStateResult", () => {
  it("mode state の公開 shape を返す", () => {
    const setIsSignUp = jest.fn();

    expect(
      createLoginModeStateResult({
        isSignUp: true,
        setIsSignUp,
      }),
    ).toEqual({
      isSignUp: true,
      setIsSignUp,
    });
  });
});
