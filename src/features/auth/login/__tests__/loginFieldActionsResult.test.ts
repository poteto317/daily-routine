import { createLoginFieldActionsResult } from "../loginFieldActionsResult";

describe("createLoginFieldActionsResult", () => {
  it("field action の公開 shape を返す", () => {
    const handleEmailChange = jest.fn();
    const handlePasswordChange = jest.fn();

    expect(
      createLoginFieldActionsResult({
        handleEmailChange,
        handlePasswordChange,
      }),
    ).toEqual({
      handleEmailChange,
      handlePasswordChange,
    });
  });
});
