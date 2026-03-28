import { createLoginActionStateResult } from "../loginActionStateResult";

describe("createLoginActionStateResult", () => {
  it("login action state の公開 shape を返す", () => {
    const handleAnonymousLogin = jest.fn();
    const handleSubmit = jest.fn();
    const handleTestLogin = jest.fn();
    const toggleMode = jest.fn();

    expect(
      createLoginActionStateResult({
        error: "failed",
        loading: true,
        handleAnonymousLogin,
        handleSubmit,
        handleTestLogin,
        toggleMode,
      }),
    ).toEqual({
      error: "failed",
      loading: true,
      handleAnonymousLogin,
      handleSubmit,
      handleTestLogin,
      toggleMode,
    });
  });
});
