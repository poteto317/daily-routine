/** ログに残すトークンの先頭文字数 */
const TOKEN_LOG_PREFIX_LENGTH = 20;

/**
 * FCM トークンをログ用に短縮する（先頭 20 文字 + "..."）。
 * トークン全体をログに残さないために使う。
 */
export const abbreviateTokenForLog = (token: string): string =>
  `${token.substring(0, TOKEN_LOG_PREFIX_LENGTH)}...`;
