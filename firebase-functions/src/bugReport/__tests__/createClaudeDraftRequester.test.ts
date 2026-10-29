/** @jest-environment node */
import Anthropic from "@anthropic-ai/sdk";
import {
  buildDraftRequest,
  createClaudeDraftRequester,
} from "../draftIssueWithClaude";

const mockCreate = jest.fn();

// SDK のコンストラクタと messages.create だけを差し替える（ほかのテストに影響しないよう別ファイルにする）
jest.mock("@anthropic-ai/sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

const MockedAnthropic = Anthropic as unknown as jest.Mock;

describe("createClaudeDraftRequester", () => {
  beforeEach(() => {
    MockedAnthropic.mockClear();
    mockCreate.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("API キー・45 秒のタイムアウト・再試行なしでクライアントを作る", () => {
    createClaudeDraftRequester("sk-ant-test-key");

    expect(MockedAnthropic).toHaveBeenCalledTimes(1);
    expect(MockedAnthropic).toHaveBeenCalledWith({
      apiKey: "sk-ant-test-key",
      timeout: 45_000,
      maxRetries: 0,
    });
  });

  it("messages.create にリクエストと打ち切り用の signal を渡し、応答をそのまま返す", async () => {
    const response = {
      stop_reason: "end_turn",
      content: [{ type: "text", text: "{}" }],
    };
    mockCreate.mockResolvedValue(response);
    const request = buildDraftRequest({ uid: "u1", description: "説明" });

    const requestDraft = createClaudeDraftRequester("sk-ant-test-key");
    await expect(requestDraft(request)).resolves.toBe(response);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const [sentRequest, options] = mockCreate.mock.calls[0];
    expect(sentRequest).toBe(request);
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("呼ぶたびに 45 秒の AbortSignal.timeout を作り、その signal を渡す", async () => {
    const timeoutSpy = jest.spyOn(AbortSignal, "timeout");
    mockCreate.mockResolvedValue({ stop_reason: "end_turn", content: [] });
    const request = buildDraftRequest({ uid: "u1", description: "説明" });

    const requestDraft = createClaudeDraftRequester("sk-ant-test-key");
    await requestDraft(request);
    await requestDraft(request);

    expect(timeoutSpy).toHaveBeenCalledTimes(2);
    expect(timeoutSpy).toHaveBeenNthCalledWith(1, 45_000);
    expect(timeoutSpy).toHaveBeenNthCalledWith(2, 45_000);
    const [, firstOptions] = mockCreate.mock.calls[0];
    const [, secondOptions] = mockCreate.mock.calls[1];
    expect(firstOptions.signal).toBe(timeoutSpy.mock.results[0].value);
    expect(secondOptions.signal).toBe(timeoutSpy.mock.results[1].value);
  });
});
