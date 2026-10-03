import { ApiError } from "../errors";

/** fn が指定の status / code の ApiError を投げることを検証する */
export const expectApiError = (
  fn: () => unknown,
  status: number,
  code: string,
): void => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(status);
    expect((error as ApiError).code).toBe(code);
    return;
  }
  throw new Error("ApiError が投げられなかった");
};
