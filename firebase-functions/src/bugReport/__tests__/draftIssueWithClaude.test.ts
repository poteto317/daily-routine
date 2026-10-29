/** @jest-environment node */
import Anthropic from "@anthropic-ai/sdk";
import {
  CLAUDE_MAX_TOKENS,
  CLAUDE_MODEL,
  IssueDraftError,
  draftIssueWithClaude,
  type DraftRequest,
  type DraftResponse,
} from "../draftIssueWithClaude";
import { DRAFT_SYSTEM_PROMPT, buildDraftPrompt } from "../buildDraftPrompt";
import type { BugReportContentSource } from "../buildIssueContent";

const report: BugReportContentSource = {
  uid: "user-secret-uid",
  title: "保存できない",
  description: "保存ボタンを押しても反応しない",
  stepsToReproduce: "1. 設定を開く\n2. 保存を押す",
  meta: {
    appVersion: "0.1.0",
    userAgent: "Mozilla/5.0 SecretAgent",
    url: "/settings",
    locale: "ja-JP",
    timezone: "Asia/Tokyo",
    createdAtClient: "2026-06-01T00:00:00.000Z",
  },
};

/** text ブロック 1 件の応答を作る */
const textResponse = (
  text: string,
  stopReason: string | null = "end_turn",
): DraftResponse => ({
  stop_reason: stopReason,
  content: [{ type: "text", text }],
});

/** 構造化出力（JSON）を text ブロックに入れた応答を作る */
const okResponse = (
  parsed: { title: string; body: string },
  stopReason: string | null = "end_turn",
): DraftResponse => textResponse(JSON.stringify(parsed), stopReason);

/** requestDraft に渡されたリクエストを取り出す */
const capturedRequest = (requestDraft: jest.Mock): DraftRequest =>
  requestDraft.mock.calls[0][0] as DraftRequest;

/** user メッセージの本文を取り出す */
const userContent = (request: DraftRequest): string =>
  request.messages[0].content;

/** 指定の reason の IssueDraftError で reject されることを確かめる */
const expectDraftError = async (
  promise: Promise<unknown>,
  reason: string,
): Promise<void> => {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(IssueDraftError);
  expect((error as IssueDraftError).reason).toBe(reason);
};

describe("draftIssueWithClaude", () => {
  it("整形に成功したら trim したタイトルと本文を返す", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(okResponse({ title: " 要約 ", body: " 本文 " }));

    await expect(draftIssueWithClaude(report, requestDraft)).resolves.toEqual({
      title: "要約",
      body: "本文",
    });
  });

  it("モデル・max_tokens・effort・format・user メッセージ 1 件でリクエストする", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(okResponse({ title: "t", body: "b" }));

    await draftIssueWithClaude(report, requestDraft);

    const request = capturedRequest(requestDraft);
    expect(request.model).toBe("claude-opus-5-5");
    expect(CLAUDE_MODEL).toBe("claude-opus-5-5");
    expect(request.max_tokens).toBe(8000);
    expect(CLAUDE_MAX_TOKENS).toBe(8000);
    expect(request.output_config.effort).toBe("low");
    // 送信される JSON に変換した形で、構造化出力の指定とスキーマを確かめる
    const format = JSON.parse(JSON.stringify(request.output_config.format)) as {
      type: string;
      schema: {
        properties: { title: { type: string }; body: { type: string } };
        required: string[];
        additionalProperties: boolean;
      };
    };
    expect(format.type).toBe("json_schema");
    expect(format.schema.properties.title.type).toBe("string");
    expect(format.schema.properties.body.type).toBe("string");
    expect([...format.schema.required].sort()).toEqual(["body", "title"]);
    expect(format.schema.additionalProperties).toBe(false);
    expect(request.messages).toHaveLength(1);
    expect(request.messages[0].role).toBe("user");
  });

  it("system に DRAFT_SYSTEM_PROMPT、user メッセージに buildDraftPrompt の結果を渡す", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(okResponse({ title: "t", body: "b" }));

    await draftIssueWithClaude(report, requestDraft);

    const request = capturedRequest(requestDraft);
    expect(request.system).toBe(DRAFT_SYSTEM_PROMPT);
    expect(userContent(request)).toBe(buildDraftPrompt(report));
  });

  it("stop_reason が refusal なら、JSON でない拒否の文面でも IssueDraftError(refusal) を投げる", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(
        textResponse(
          "申し訳ありませんが、この依頼には対応できません。",
          "refusal",
        ),
      );
    await expectDraftError(
      draftIssueWithClaude(report, requestDraft),
      "refusal",
    );
  });

  it("stop_reason が max_tokens なら、途中で切れた JSON でも IssueDraftError(max_tokens) を投げる", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(
        textResponse('{"title":"保存できない","body":"## 不具合', "max_tokens"),
      );
    await expectDraftError(
      draftIssueWithClaude(report, requestDraft),
      "max_tokens",
    );
  });

  it("text ブロックが無ければ IssueDraftError(no_text_output) を投げる", async () => {
    const requestDraft = jest.fn().mockResolvedValue({
      stop_reason: "end_turn",
      content: [{ type: "thinking" }],
    } satisfies DraftResponse);
    await expectDraftError(
      draftIssueWithClaude(report, requestDraft),
      "no_text_output",
    );
  });

  it("最初の text ブロックを解析する", async () => {
    const requestDraft = jest.fn().mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        { type: "thinking" },
        { type: "text", text: JSON.stringify({ title: "要約", body: "本文" }) },
        { type: "text", text: "余分" },
      ],
    } satisfies DraftResponse);
    await expect(draftIssueWithClaude(report, requestDraft)).resolves.toEqual({
      title: "要約",
      body: "本文",
    });
  });

  it("text が JSON でなければ IssueDraftError(invalid_output) を投げる", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(textResponse("JSON ではない文章"));
    await expectDraftError(
      draftIssueWithClaude(report, requestDraft),
      "invalid_output",
    );
  });

  it("JSON がスキーマに合わなければ IssueDraftError(invalid_output) を投げる", async () => {
    const requestDraft = jest
      .fn()
      .mockResolvedValue(textResponse(JSON.stringify({ title: "要約" })));
    await expectDraftError(
      draftIssueWithClaude(report, requestDraft),
      "invalid_output",
    );
  });

  it.each([
    { title: "  ", body: "本文" },
    { title: "要約", body: " \n " },
    { title: "[不具合報告]", body: "本文" },
    { title: " [不具合報告]  ", body: "本文" },
  ])(
    "タイトル（先頭の [不具合報告] を除く）か本文が空白だけなら IssueDraftError(empty_output) を投げる (%o)",
    async (parsed) => {
      const requestDraft = jest.fn().mockResolvedValue(okResponse(parsed));
      await expectDraftError(
        draftIssueWithClaude(report, requestDraft),
        "empty_output",
      );
    },
  );

  it("requestDraft が投げた例外はそのまま伝わる", async () => {
    const error = new Anthropic.APIConnectionError({ message: "x" });
    const requestDraft = jest.fn().mockRejectedValue(error);
    await expect(draftIssueWithClaude(report, requestDraft)).rejects.toBe(
      error,
    );
  });
});
