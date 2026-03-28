import { createLoginActionHandlersResult } from "../loginActionHandlersResult";

describe("loginActionHandlersResult", () => {
  it("login handlers の公開 shape を組み立てる", () => {
    const handleSubmit = jest.fn() as unknown as (
      event: React.FormEvent,
    ) => Promise<void>;
    const handleTestLogin = jest.fn() as unknown as () => Promise<void>;
    const handleAnonymousLogin = jest.fn() as unknown as () => Promise<void>;
    const toggleMode = jest.fn();

    expect(
      createLoginActionHandlersResult({
        handleSubmit,
        handleTestLogin,
        handleAnonymousLogin,
        toggleMode,
      }),
    ).toEqual({
      handleSubmit,
      handleTestLogin,
      handleAnonymousLogin,
      toggleMode,
    });
  });
});
