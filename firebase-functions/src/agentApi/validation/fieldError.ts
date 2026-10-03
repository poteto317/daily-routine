import { ApiError } from "../errors";

/** 本文フィールドの検証エラー（400 invalid_field）を作る */
export const invalidField = (field: string, message: string): ApiError =>
  new ApiError(400, "invalid_field", `${field}: ${message}`);
