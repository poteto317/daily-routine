import { extractBearerToken } from "./bearerToken";
import { ApiError } from "./errors";
import type { HandlerDeps } from "./handlerDeps";

const unauthorized = (): ApiError =>
  new ApiError(401, "unauthorized", "API キーが無効です");

/** Authorization ヘッダの Bearer キーから uid を解決する。解決できなければ 401 */
export const authenticate = async (
  authorization: string | undefined,
  resolveUid: HandlerDeps["resolveUid"],
): Promise<string> => {
  const key = extractBearerToken(authorization);
  if (!key) throw unauthorized();
  const uid = await resolveUid(key);
  if (!uid) throw unauthorized();
  return uid;
};
