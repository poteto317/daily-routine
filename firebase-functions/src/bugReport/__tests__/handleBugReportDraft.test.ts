/** @jest-environment node */
import Anthropic from "@anthropic-ai/sdk";
import { handleBugReport } from "../handleBugReport";
import { createGithubIssue } from "../createGithubIssue";
import type { DraftRequester } from "../draftIssueWithClaude";

jest.mock("../createGithubIssue", () => ({
  createGithubIssue: jest.fn(),
}));

const API_KEY = "sk-ant-test-key";
const DESCRIPTION = "保存ボタンを押しても反応しない秘密の説明";

const makeDb = (docData: Record<string, unknown>) => {
  const mockDocRef = {
    get: jest.fn().mockResolvedValue({ exists: true, data: () => docData }),
    update: jest.fn().mockResolvedValue(undefined),
  };
  return {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef),
    }),
  };
};

const makeDeps = (
  overrides: {
    anthropicApiKey?: string;
    requestDraft?: jest.Mock;
    claimed?: boolean;
  } = {},
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
  return {
    requestDraft,
    deps: {
      repo: "owner/repo",
      token: "fake-token",
      anthropicApiKey: overrides.anthropicApiKey ?? API_KEY,
      createDraftRequester,
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      claimProcessing: jest.fn().mockResolvedValue(overrides.claimed ?? true),
    },
  };
};

const report = { uid: "u1", description: DESCRIPTION, status: "pending" };

/** createGithubIssue に渡された Issue のタイトル */
const issuedTitle = (): string =>
  (createGithubIssue as jest.Mock).mock.calls[0][0].content.title;

/** logger のあるメソッドに渡された全引数を 1 つの文字列にする */
const loggedText = (mock: jest.Mock): string =>
  mock.mock.calls.map((args) => JSON.stringify(args)).join("\n");

beforeEach(() => {
  jest.clearAllMocks();
  (createGithubIssue as jest.Mock).mockResolvedValue({
    issueNumber: 1,
    issueUrl: "https://example.com/1",
  });
});

describe("handleBugReport — Claude による整形", () => {
  it("整形に成功したら要約タイトルで起票し、info ログに content=claude を出す", async () => {
    const { deps } = makeDeps();

    await handleBugReport("report-1", makeDb(report), deps);

    expect(deps.createDraftRequester).toHaveBeenCalledWith(API_KEY);
    expect(issuedTitle()).toBe("[不具合報告] 保存できない");
    expect(deps.logger.warn).not.toHaveBeenCalled();
    expect(deps.logger.info).toHaveBeenCalledWith(
      expect.stringContaining("content=claude"),
    );
  });

  it("API エラーなら従来のタイトルで起票し、warn に理由、info に content=fallback を出す", async () => {
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
    const { deps } = makeDeps({ requestDraft });

    await handleBugReport("report-1", makeDb(report), deps);

    expect(issuedTitle()).toBe(`[不具合報告] ${DESCRIPTION}`);
    expect(deps.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("api_error(status=400)"),
    );
    expect(deps.logger.info).toHaveBeenCalledWith(
      expect.stringContaining("content=fallback"),
    );

    const logs = [deps.logger.warn, deps.logger.info]
      .map(loggedText)
      .join("\n");
    expect(logs).not.toContain(API_KEY);
    expect(logs).not.toContain(DESCRIPTION);
    expect(logs).not.toContain("credit balance is too low");
  });

  it.each(["none", ""])(
    "API キーが %p なら Claude を呼ばず、warn も出さずに content=fallback にする",
    async (anthropicApiKey) => {
      const { deps, requestDraft } = makeDeps({ anthropicApiKey });

      await handleBugReport("report-1", makeDb(report), deps);

      expect(deps.createDraftRequester).not.toHaveBeenCalled();
      expect(requestDraft).not.toHaveBeenCalled();
      expect(deps.logger.warn).not.toHaveBeenCalled();
      expect(issuedTitle()).toBe(`[不具合報告] ${DESCRIPTION}`);
      expect(deps.logger.info).toHaveBeenCalledWith(
        expect.stringContaining("content=fallback"),
      );
    },
  );

  it("ロックを取得できなければ Claude を呼ばず、info に content=none を出す", async () => {
    const { deps, requestDraft } = makeDeps({ claimed: false });

    await handleBugReport("report-1", makeDb(report), deps);

    expect(deps.createDraftRequester).not.toHaveBeenCalled();
    expect(requestDraft).not.toHaveBeenCalled();
    expect(createGithubIssue).not.toHaveBeenCalled();
    expect(deps.logger.info).toHaveBeenCalledWith(
      expect.stringContaining("content=none"),
    );
  });
});
