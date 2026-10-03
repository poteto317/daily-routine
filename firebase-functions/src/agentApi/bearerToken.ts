/**
 * Authorization ヘッダ "Bearer <token>" からトークンを取り出す。形式が違えば null。
 * スキーム名は大文字小文字を区別しない（RFC 7235）。余分な空白は受け付けない。
 */
export const extractBearerToken = (
  header: string | undefined,
): string | null => {
  if (!header) return null;
  const parts = header.split(" ");
  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== "bearer" ||
    parts[1].length === 0
  ) {
    return null;
  }
  return parts[1];
};
