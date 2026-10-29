/** @jest-environment node */
import Anthropic from "@anthropic-ai/sdk";
import { describeDraftFailure } from "../describeDraftFailure";
import { IssueDraftError } from "../draftIssueWithClaude";

describe("describeDraftFailure", () => {
  it.each<[string, unknown, string]>([
    ["IssueDraftError", new IssueDraftError("refusal"), "refusal"],
    [
      "APIConnectionTimeoutError",
      new Anthropic.APIConnectionTimeoutError(),
      "timeout",
    ],
    ["APIUserAbortError", new Anthropic.APIUserAbortError(), "timeout"],
    [
      "DOMException(TimeoutError)",
      new DOMException("x", "TimeoutError"),
      "timeout",
    ],
    [
      "DOMException(AbortError)",
      new DOMException("x", "AbortError"),
      "timeout",
    ],
    [
      "APIConnectionError",
      new Anthropic.APIConnectionError({ message: "x" }),
      "connection_error",
    ],
    [
      "APIError(429)",
      new Anthropic.APIError(
        429,
        undefined,
        "rate limited secret-text",
        new Headers(),
      ),
      "api_error(status=429)",
    ],
    [
      "APIError(status なし)",
      new Anthropic.APIError(undefined, undefined, "x", undefined),
      "api_error(status=unknown)",
    ],
    [
      "AnthropicError",
      new Anthropic.AnthropicError("Failed to parse structured output"),
      "parse_failed",
    ],
    ["TypeError", new TypeError("x"), "unknown(TypeError)"],
    ["文字列", "secret-text", "unknown(string)"],
  ])("%s → %s", (_label, error, expected) => {
    expect(describeDraftFailure(error)).toBe(expected);
  });

  it("エラーメッセージの本文を含めない", () => {
    const error = new Anthropic.APIError(
      429,
      undefined,
      "rate limited secret-text",
      new Headers(),
    );
    expect(error.message).toBe("429 rate limited secret-text");
    expect(describeDraftFailure(error)).not.toContain("secret-text");
  });
});
