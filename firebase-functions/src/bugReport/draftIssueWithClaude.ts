import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import {
  stripTitlePrefix,
  type BugReportContentSource,
  type IssueDraft,
} from "./buildIssueContent";
import { DRAFT_SYSTEM_PROMPT, buildDraftPrompt } from "./buildDraftPrompt";

export const CLAUDE_MODEL = "claude-opus-5-5";
/** 思考のトークンも含む上限。長めの報告でも日本語の本文が打ち切られない余裕を持たせる */
export const CLAUDE_MAX_TOKENS = 8000;
/** 1 回の Claude 呼び出しの上限。再試行はしない（関数のタイムアウト 120 秒に収める） */
const CLAUDE_TIMEOUT_MS = 45_000;

/** Claude に返させる構造化出力の形 */
export const IssueDraftSchema = z.object({
  title: z.string(),
  body: z.string(),
});

/** 構造化出力の形式。リクエストに渡し、応答の text の解析・検証にも使う */
const DRAFT_OUTPUT_FORMAT = zodOutputFormat(IssueDraftSchema);

/** 整形結果を採用しなかった理由（API 呼び出し自体の失敗は含まない） */
export type IssueDraftFailureReason =
  | "refusal"
  | "max_tokens"
  | "no_text_output"
  | "invalid_output"
  | "empty_output";

/** Claude の応答を整形結果として採用できなかったことを表すエラー */
export class IssueDraftError extends Error {
  constructor(readonly reason: IssueDraftFailureReason) {
    super(`Claude による Issue の整形に失敗しました (${reason})`);
    this.name = "IssueDraftError";
  }
}

/** Claude への整形依頼（messages.create に渡すリクエスト）を組み立てる */
export const buildDraftRequest = (report: BugReportContentSource) => ({
  model: CLAUDE_MODEL,
  max_tokens: CLAUDE_MAX_TOKENS,
  system: DRAFT_SYSTEM_PROMPT,
  messages: [{ role: "user" as const, content: buildDraftPrompt(report) }],
  output_config: {
    effort: "low" as const,
    format: DRAFT_OUTPUT_FORMAT,
  },
});

export type DraftRequest = ReturnType<typeof buildDraftRequest>;

/** 整形依頼の応答のうち、判定に使う部分（SDK の Message が代入できる形） */
export interface DraftResponse {
  stop_reason: string | null;
  content: Array<{ type: string; text?: string }>;
}

/** 整形依頼を送り応答を返す関数。テストではモックを注入する */
export type DraftRequester = (request: DraftRequest) => Promise<DraftResponse>;

/** API キーから、Anthropic SDK で整形依頼を送る関数を作る */
export const createClaudeDraftRequester = (apiKey: string): DraftRequester => {
  const client = new Anthropic({
    apiKey,
    timeout: CLAUDE_TIMEOUT_MS,
    maxRetries: 0,
  });
  // messages.create は自動で解析しないため、拒否・打ち切りを stop_reason で判定できる。
  // SDK の timeout は応答ヘッダーまでしか効かないため、signal で本文の読み込みも打ち切る
  return (request) =>
    client.messages.create(request, {
      signal: AbortSignal.timeout(CLAUDE_TIMEOUT_MS),
    });
};

/** 応答の最初の text ブロックの文字列を返す。無ければ undefined */
const firstText = (response: DraftResponse): string | undefined =>
  response.content.find(
    (block) => block.type === "text" && typeof block.text === "string",
  )?.text;

/** 構造化出力の text を解析・検証する。JSON でない・スキーマに合わない場合は invalid_output */
const parseDraftOutput = (text: string): z.infer<typeof IssueDraftSchema> => {
  try {
    return DRAFT_OUTPUT_FORMAT.parse(text);
  } catch {
    throw new IssueDraftError("invalid_output");
  }
};

/**
 * Claude に不具合報告の整形を依頼し、trim 済みのタイトルと本文を返す。
 * 空白の整理・前置・@ の無害化・切り詰めは buildIssueContent が行う。
 *
 * 応答を採用できない場合は IssueDraftError を投げる。本文を解析する前に stop_reason を見るため、
 * 拒否の文面（refusal）や途中で打ち切られた JSON（max_tokens）も理由どおりに分類される。
 * その後、最初の text ブロックが無ければ no_text_output、JSON でない・スキーマに合わなければ
 * invalid_output、タイトル（先頭の [不具合報告] を除く）か本文が trim 後に空なら empty_output。
 * requestDraft が投げた例外（API エラー・タイムアウト）はそのまま伝える。
 */
export const draftIssueWithClaude = async (
  report: BugReportContentSource,
  requestDraft: DraftRequester,
): Promise<IssueDraft> => {
  const response = await requestDraft(buildDraftRequest(report));
  if (response.stop_reason === "refusal") {
    throw new IssueDraftError("refusal");
  }
  if (response.stop_reason === "max_tokens") {
    throw new IssueDraftError("max_tokens");
  }
  const text = firstText(response);
  if (text === undefined) {
    throw new IssueDraftError("no_text_output");
  }

  const output = parseDraftOutput(text);
  const title = output.title.trim();
  const body = output.body.trim();
  if (stripTitlePrefix(title).length === 0 || body.length === 0) {
    throw new IssueDraftError("empty_output");
  }
  return { title, body };
};
