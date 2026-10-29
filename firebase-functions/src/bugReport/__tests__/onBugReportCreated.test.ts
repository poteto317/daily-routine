/** @jest-environment node */
jest.mock("../handleBugReport", () => ({
  handleBugReport: jest.fn().mockResolvedValue(undefined),
}));
import { onBugReportCreated } from "../onBugReportCreated";
import { handleBugReport } from "../handleBugReport";
import { PROCESSING_LOCK_TIMEOUT_MS } from "../constants";
import { CLAUDE_TIMEOUT_MS } from "../draftIssueWithClaude";
import { GITHUB_TIMEOUT_MS } from "../createGithubIssue";

/** onDocumentCreated が返す関数に付く、デプロイ設定（エンドポイント）の一部 */
type EndpointLike = {
  __endpoint: {
    timeoutSeconds?: number;
    secretEnvironmentVariables?: { key: string }[];
  };
};

const endpointOf = () =>
  (onBugReportCreated({} as never) as unknown as EndpointLike).__endpoint;

describe("onBugReportCreated のトリガー設定", () => {
  it("Claude と GitHub の呼び出しの上限を合わせても収まるタイムアウトを指定する", () => {
    const timeoutSeconds = endpointOf().timeoutSeconds;
    expect(timeoutSeconds).toBe(120);
    expect((timeoutSeconds ?? 0) * 1000).toBeGreaterThan(
      CLAUDE_TIMEOUT_MS + GITHUB_TIMEOUT_MS,
    );
  });

  it("関数のタイムアウトは処理ロックの期限より短い（打ち切り後の再実行で二重に起票しない）", () => {
    const timeoutSeconds = endpointOf().timeoutSeconds ?? 0;
    expect(timeoutSeconds * 1000).toBeLessThan(PROCESSING_LOCK_TIMEOUT_MS);
  });

  it("GitHub と Claude の両方の Secret を宣言する", () => {
    const keys = (endpointOf().secretEnvironmentVariables ?? []).map(
      (secret) => secret.key,
    );
    expect(keys).toEqual(
      expect.arrayContaining(["GITHUB_TOKEN", "ANTHROPIC_API_KEY"]),
    );
  });

  describe("Secret とパラメータの受け渡し", () => {
    const ENV_KEYS = ["ANTHROPIC_API_KEY", "GITHUB_TOKEN", "GITHUB_REPO"];
    const originalEnv = Object.fromEntries(
      ENV_KEYS.map((key) => [key, process.env[key]]),
    );

    afterEach(() => {
      for (const key of ENV_KEYS) {
        const value = originalEnv[key];
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      jest.clearAllMocks();
    });

    it("各 Secret の値を取り違えずに handleBugReport へ渡す", async () => {
      process.env.ANTHROPIC_API_KEY = "anthropic-key";
      process.env.GITHUB_TOKEN = "github-token";
      process.env.GITHUB_REPO = "owner/repo";
      const fn = onBugReportCreated({
        collection: () => ({ doc: () => ({}) }),
      } as never) as unknown as { run(event: unknown): Promise<void> };

      await fn.run({ data: {}, params: { reportId: "r1" } });

      const [reportId, , deps] = (handleBugReport as jest.Mock).mock.calls[0];
      expect(reportId).toBe("r1");
      expect(deps.anthropicApiKey).toBe("anthropic-key");
      expect(deps.token).toBe("github-token");
      expect(deps.repo).toBe("owner/repo");
    });
  });
});
