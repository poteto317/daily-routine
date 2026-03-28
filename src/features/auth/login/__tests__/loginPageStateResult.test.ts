import { createLoginPageStateResult } from "../loginPageStateResult";

describe("loginPageStateResult", () => {
  it("login page の公開 state を組み立てる", () => {
    const handleAnonymousLogin = jest.fn();
    const handleEmailChange = jest.fn();
    const handlePasswordChange = jest.fn();
    const handleSubmit = jest.fn();
    const handleTestLogin = jest.fn();
    const toggleMode = jest.fn();

    expect(
      createLoginPageStateResult({
        email: "user@example.com",
        error: null,
        isSignUp: false,
        loading: true,
        password: "secret123",
        handleAnonymousLogin,
        handleEmailChange,
        handlePasswordChange,
        handleSubmit,
        handleTestLogin,
        toggleMode,
      }),
    ).toEqual({
      email: "user@example.com",
      error: null,
      isSignUp: false,
      loading: true,
      password: "secret123",
      handleAnonymousLogin,
      handleEmailChange,
      handlePasswordChange,
      handleSubmit,
      handleTestLogin,
      toggleMode,
    });
  });
});
