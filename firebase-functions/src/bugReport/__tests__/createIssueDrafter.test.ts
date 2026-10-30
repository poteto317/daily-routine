/** @jest-environment node */
import Anthropic from "@anthropic-ai/sdk";
import { createIssueDrafter, isClaudeDisabledKey } from "../createIssueDrafter";
import type { BugReportContentSource } from "../buildIssueContent";
import type { DraftImage, DraftRequester } from "../draftIssueWithClaude";

const API_KEY = "sk-ant-test-key";
const DESCRIPTION = "保存ボタンを押しても反応しない秘密の説明";

const report: BugReportContentSource = { uid: "u1", description: DESCRIPTION };

const sampleImage: DraftImage = {
  mediaType: "image/png",
  data: Buffer.from("secret-image-bytes"),
};

const makeDrafter = (
  overrides: { anthropicApiKey?: string; requestDraft?: jest.Mock } = {},
) => {
  const requestDraft =
    overrides.requestDraft ??
    jest.fn().mockResolvedValue({
      stop_reason: "end_turn",
      content: [
        {
          type: "text",
          text: JSON.stringify({
            title: "保存できない",
            body: "## 不具合の内容\n\n要約",
          }),
        },
      ],
    });
  const createDraftRequester = jest.fn(
    (): DraftRequester => requestDraft as unknown as DraftRequester,
  );
  const logger = { warn: jest.fn() };
  const drafter = createIssueDrafter({
    reportId: "report-1",
    anthropicApiKey: overrides.anthropicApiKey ?? API_KEY,
    createDraftRequester,
    logger,
  });
  return { drafter, requestDraft, createDraftRequester, logger };
};

/** warn に渡された全引数を 1 つの文字列にする */
const loggedText = (mock: jest.Mock): string =>
  mock.mock.calls.map((args) => JSON.stringify(args)).join("\n");

describe("createIssueDrafter", () => {
  it("依頼関数の作成で例外が出ても null を返し、warn に理由を出して fallback にする", async () => {
    const logger = { warn: jest.fn() };
    const drafter = createIssueDrafter({
      reportId: "report-1",
      anthropicApiKey: API_KEY,
      createDraftRequester: () => {
        throw new Error("invalid header value");
      },
      logger,
    });

    await expect(drafter.draftIssue(report)).resolves.toBeNull();
    expect(drafter.contentSource()).toBe("fallback");
    expect(loggedText(logger.warn)).toContain("unknown(Error)");
    expect(loggedText(logger.warn)).not.toContain("invalid header value");
  });

  it("前後に空白や改行が付いたキーは trim してから依頼関数を作る", async () => {
    const { drafter, createDraftRequester } = makeDrafter({
      anthropicApiKey: `  ${API_KEY}\n`,
    });

    await drafter.draftIssue(report);

    expect(createDraftRequester).toHaveBeenCalledWith(API_KEY);
  });

  it("draftIssue が呼ばれなければ contentSource は none", () => {
    const { drafter, createDraftRequester } = makeDrafter();

    expect(drafter.contentSource()).toBe("none");
    expect(createDraftRequester).not.toHaveBeenCalled();
  });

  it.each(["", "  ", "none", "NONE"])(
    "API キーが %p なら依頼関数を作らずに null を返し、fallback にする",
    async (anthropicApiKey) => {
      const { drafter, createDraftRequester, requestDraft, logger } =
        makeDrafter({ anthropicApiKey });

      await expect(drafter.draftIssue(report)).resolves.toBeNull();

      expect(createDraftRequester).not.toHaveBeenCalled();
      expect(requestDraft).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
      expect(drafter.contentSource()).toBe("fallback");
    },
  );

  it("説明が全角空白だけなら依頼関数を作らずに null を返し、fallback にする", async () => {
    const { drafter, createDraftRequester, requestDraft, logger } =
      makeDrafter();

    await expect(
      drafter.draftIssue({ ...report, description: "　　" }),
    ).resolves.toBeNull();

    expect(createDraftRequester).not.toHaveBeenCalled();
    expect(requestDraft).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(drafter.contentSource()).toBe("fallback");
  });

  it("整形に成功したら整形結果を返し、claude にする", async () => {
    const { drafter, createDraftRequester, logger } = makeDrafter();

    await expect(drafter.draftIssue(report)).resolves.toEqual({
      title: "保存できない",
      body: "## 不具合の内容\n\n要約",
    });

    expect(createDraftRequester).toHaveBeenCalledWith(API_KEY);
    expect(logger.warn).not.toHaveBeenCalled();
    expect(drafter.contentSource()).toBe("claude");
  });

  it("API エラーなら warn に理由を出して null を返し、fallback にする（キー・本文・メッセージはログに出さない）", async () => {
    const requestDraft = jest
      .fn()
      .mockRejectedValue(
        new Anthropic.APIError(
          400,
          { error: { message: "credit balance is too low" } },
          undefined,
          new Headers(),
        ),
      );
    const { drafter, logger } = makeDrafter({ requestDraft });

    await expect(drafter.draftIssue(report)).resolves.toBeNull();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("api_error(status=400)"),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("report-1"),
    );
    expect(drafter.contentSource()).toBe("fallback");

    const logs = loggedText(logger.warn);
    expect(logs).not.toContain(API_KEY);
    expect(logs).not.toContain(DESCRIPTION);
    expect(logs).not.toContain("credit balance is too low");
  });

  it("応答を採用できない（IssueDraftError）なら reason を warn に出して null を返す", async () => {
    const requestDraft = jest.fn().mockResolvedValue({
      stop_reason: "refusal",
      content: [{ type: "text", text: "対応できません" }],
    });
    const { drafter, logger } = makeDrafter({ requestDraft });

    await expect(drafter.draftIssue(report)).resolves.toBeNull();

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("(refusal)"),
    );
    expect(drafter.contentSource()).toBe("fallback");
  });

  describe("画像つき整形と失敗時の再整形", () => {
    it("画像あり・1 回目成功時は requestDraft を 1 回だけ画像付きで呼び、contentSource は claude になる", async () => {
      const { drafter, requestDraft, logger } = makeDrafter();

      await expect(drafter.draftIssue(report, [sampleImage])).resolves.toEqual({
        title: "保存できない",
        body: "## 不具合の内容\n\n要約",
      });

      expect(requestDraft).toHaveBeenCalledTimes(1);
      expect(
        Array.isArray(requestDraft.mock.calls[0][0].messages[0].content),
      ).toBe(true);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(drafter.contentSource()).toBe("claude");
    });

    it("画像あり・1 回目が API エラーで失敗・2 回目成功時は画像なしで再整形し、createDraftRequester は 1 回だけ呼び、claude にする", async () => {
      const requestDraft = jest
        .fn()
        .mockRejectedValueOnce(
          new Anthropic.APIError(
            400,
            { error: { message: "Could not process image" } },
            undefined,
            new Headers(),
          ),
        )
        .mockResolvedValueOnce({
          stop_reason: "end_turn",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                title: "再整形タイトル",
                body: "## 不具合の内容\n\n画像なし要約",
              }),
            },
          ],
        });
      const { drafter, createDraftRequester, logger } = makeDrafter({
        requestDraft,
      });

      await expect(drafter.draftIssue(report, [sampleImage])).resolves.toEqual({
        title: "再整形タイトル",
        body: "## 不具合の内容\n\n画像なし要約",
      });

      expect(createDraftRequester).toHaveBeenCalledTimes(1);
      expect(requestDraft).toHaveBeenCalledTimes(2);
      expect(
        Array.isArray(requestDraft.mock.calls[0][0].messages[0].content),
      ).toBe(true);
      expect(typeof requestDraft.mock.calls[1][0].messages[0].content).toBe(
        "string",
      );
      expect(drafter.contentSource()).toBe("claude");
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("api_error(status=400)"),
      );
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("画像なし"),
      );

      const logs = loggedText(logger.warn);
      expect(logs).not.toContain(API_KEY);
      expect(logs).not.toContain(DESCRIPTION);
      expect(logs).not.toContain("secret-image-bytes");
      expect(logs).not.toContain(sampleImage.data.toString("base64"));
      expect(logs).not.toContain("Could not process image");
    });

    it("画像あり・1 回目が refusal（IssueDraftError）でも画像なしで再整形する", async () => {
      const requestDraft = jest
        .fn()
        .mockResolvedValueOnce({
          stop_reason: "refusal",
          content: [{ type: "text", text: "対応できません" }],
        })
        .mockResolvedValueOnce({
          stop_reason: "end_turn",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                title: "再整形成功",
                body: "## 不具合の内容\n\n本文",
              }),
            },
          ],
        });
      const { drafter, logger } = makeDrafter({ requestDraft });

      await expect(drafter.draftIssue(report, [sampleImage])).resolves.toEqual({
        title: "再整形成功",
        body: "## 不具合の内容\n\n本文",
      });

      expect(requestDraft).toHaveBeenCalledTimes(2);
      expect(drafter.contentSource()).toBe("claude");
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("(refusal)"),
      );
    });

    it("画像あり・1 回目・2 回目とも失敗した場合は null を返し fallback にし warn を 2 回出す", async () => {
      const requestDraft = jest
        .fn()
        .mockRejectedValueOnce(new Error("first failure"))
        .mockRejectedValueOnce(new Error("second failure"));
      const { drafter, logger } = makeDrafter({ requestDraft });

      await expect(
        drafter.draftIssue(report, [sampleImage]),
      ).resolves.toBeNull();

      expect(requestDraft).toHaveBeenCalledTimes(2);
      expect(drafter.contentSource()).toBe("fallback");
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.warn.mock.calls[0][0]).toContain("画像なし");
      expect(logger.warn.mock.calls[1][0]).toContain("従来の内容で起票");
    });

    it("画像が空配列のとき失敗しても再整形せず 1 回だけ呼ぶ", async () => {
      const requestDraft = jest.fn().mockRejectedValueOnce(new Error("fail"));
      const { drafter, logger } = makeDrafter({ requestDraft });

      await expect(drafter.draftIssue(report, [])).resolves.toBeNull();

      expect(requestDraft).toHaveBeenCalledTimes(1);
      expect(drafter.contentSource()).toBe("fallback");
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("Claude 無効（none）や説明が空の場合は画像があっても requestDraft を呼ばず null を返す", async () => {
      const { drafter, requestDraft } = makeDrafter({
        anthropicApiKey: "none",
      });
      await expect(
        drafter.draftIssue(report, [sampleImage]),
      ).resolves.toBeNull();
      expect(requestDraft).not.toHaveBeenCalled();

      const { drafter: drafter2, requestDraft: requestDraft2 } = makeDrafter();
      await expect(
        drafter2.draftIssue({ ...report, description: "  " }, [sampleImage]),
      ).resolves.toBeNull();
      expect(requestDraft2).not.toHaveBeenCalled();
    });
  });
});

describe("isClaudeDisabledKey", () => {
  it.each(["", "  ", "none", "NONE", " None "])(
    "%p は Claude を使わないキーとみなす",
    (key) => {
      expect(isClaudeDisabledKey(key)).toBe(true);
    },
  );

  it("通常のキーは無効扱いしない", () => {
    expect(isClaudeDisabledKey("sk-ant-xxx")).toBe(false);
  });
});
