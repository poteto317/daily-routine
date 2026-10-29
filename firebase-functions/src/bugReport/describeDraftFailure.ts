import Anthropic from "@anthropic-ai/sdk";
import { IssueDraftError } from "./draftIssueWithClaude";

/**
 * signal による打ち切り（本文の読み込み中に投げられる AbortError / TimeoutError）かを判定する。
 * DOMException は実行環境によって Error の instanceof にならないため、name で判定する。
 */
const isAbortLikeError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null || !("name" in error)) {
    return false;
  }
  return error.name === "AbortError" || error.name === "TimeoutError";
};

/**
 * 整形の失敗理由をログ用の短い文字列にする。エラーメッセージ本文は含めない。
 * SDK のエラーは APIConnectionTimeoutError ⊂ APIConnectionError ⊂ APIError ⊂
 * AnthropicError の継承関係のため、子クラスから先に判定する。
 */
export const describeDraftFailure = (error: unknown): string => {
  if (error instanceof IssueDraftError) {
    return error.reason;
  }
  if (
    error instanceof Anthropic.APIConnectionTimeoutError ||
    error instanceof Anthropic.APIUserAbortError ||
    isAbortLikeError(error)
  ) {
    return "timeout";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "connection_error";
  }
  if (error instanceof Anthropic.APIError) {
    return `api_error(status=${error.status ?? "unknown"})`;
  }
  // 応答の解析は draftIssueWithClaude が IssueDraftError(invalid_output) にするため通常は来ない。
  // SDK がほかの理由で AnthropicError を投げた場合の保険として残す
  if (error instanceof Anthropic.AnthropicError) {
    return "parse_failed";
  }
  if (error instanceof Error) {
    return `unknown(${error.constructor.name})`;
  }
  return `unknown(${typeof error})`;
};
