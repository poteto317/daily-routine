import { createLoginModeToggleHandler } from "../loginModeActions";

describe("loginModeActions", () => {
  it("mode toggle handler がモード反転と error clear を行う", () => {
    const setIsSignUp = jest.fn();
    const setError = jest.fn();

    createLoginModeToggleHandler({
      isSignUp: false,
      setIsSignUp,
      setError,
    })();

    expect(setIsSignUp).toHaveBeenCalledWith(true);
    expect(setError).toHaveBeenCalledWith(null);
  });
});
