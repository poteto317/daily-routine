import { createLoginCredentialsStateResult } from "../loginCredentialsStateResult";

describe("createLoginCredentialsStateResult", () => {
  it("credentials state の公開 shape を返す", () => {
    const setEmail = jest.fn();
    const setPassword = jest.fn();

    expect(
      createLoginCredentialsStateResult({
        email: "user@example.com",
        password: "secret123",
        setEmail,
        setPassword,
      }),
    ).toEqual({
      email: "user@example.com",
      password: "secret123",
      setEmail,
      setPassword,
    });
  });
});
