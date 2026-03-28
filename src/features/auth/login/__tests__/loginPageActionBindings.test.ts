import { createLoginPageActionBindings } from "../loginPageActionBindings";

describe("loginPageActionBindings", () => {
  it("login action 用の依存を束ねる", () => {
    const setIsSignUp = jest.fn();

    expect(
      createLoginPageActionBindings({
        email: "user@example.com",
        isSignUp: true,
        password: "secret123",
        setIsSignUp,
      }),
    ).toEqual({
      email: "user@example.com",
      isSignUp: true,
      password: "secret123",
      setIsSignUp,
    });
  });
});
