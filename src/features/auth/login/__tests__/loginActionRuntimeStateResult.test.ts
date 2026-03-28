import { createLoginActionRuntimeStateResult } from "../loginActionRuntimeStateResult";

describe("createLoginActionRuntimeStateResult", () => {
  it("runtime state の公開 shape を返す", () => {
    const setError = jest.fn();
    const setLoading = jest.fn();

    expect(
      createLoginActionRuntimeStateResult({
        error: "failed",
        loading: true,
        setError,
        setLoading,
      }),
    ).toEqual({
      error: "failed",
      loading: true,
      setError,
      setLoading,
    });
  });
});
