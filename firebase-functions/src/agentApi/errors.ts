export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what: string): ApiError =>
  new ApiError(404, "not_found", `${what}が見つかりません`);
