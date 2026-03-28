import { createAuthActionsResult } from "../authActionsResult";

describe("createAuthActionsResult", () => {
  it("auth actions の公開 shape を返す", () => {
    const signIn = jest.fn();
    const signUp = jest.fn();
    const signOut = jest.fn();
    const signInAnonymous = jest.fn();
    const signInAsTestUser = jest.fn();

    expect(
      createAuthActionsResult({
        signIn,
        signUp,
        signOut,
        signInAnonymous,
        signInAsTestUser,
      }),
    ).toEqual({
      signIn,
      signUp,
      signOut,
      signInAnonymous,
      signInAsTestUser,
    });
  });
});
