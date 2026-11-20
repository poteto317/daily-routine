/** @jest-environment node */
jest.mock("../handleBugReport", () => ({
  handleBugReport: jest.fn().mockResolvedValue(undefined),
}));

const mockBucket = { name: "default-bucket", file: jest.fn() };
const mockBucketFn = jest.fn().mockReturnValue(mockBucket);
jest.mock("firebase-admin/storage", () => ({
  getStorage: jest.fn(() => ({
    bucket: mockBucketFn,
  })),
}));

const mockCreatedStore = {
  getSize: jest.fn(),
  download: jest.fn(),
  getDownloadUrl: jest.fn(),
};
jest.mock("../storageImageStore", () => ({
  createStorageImageStore: jest.fn(() => mockCreatedStore),
}));

import { onBugReportCreated } from "../onBugReportCreated";
import { handleBugReport } from "../handleBugReport";
import { PROCESSING_LOCK_TIMEOUT_MS } from "../constants";
import { CLAUDE_TIMEOUT_MS } from "../draftIssueWithClaude";
import { SCRUM_BOARD_TIMEOUT_MS } from "../createScrumBoardItem";
import { createStorageImageStore } from "../storageImageStore";

/** onDocumentCreated が返す関数に付く、デプロイ設定（エンドポイント）の一部 */
type EndpointLike = {
  __endpoint: {
    timeoutSeconds?: number;
    availableMemoryMb?: number;
    secretEnvironmentVariables?: { key: string }[];
  };
};

const endpointOf = () =>
  (onBugReportCreated({} as never) as unknown as EndpointLike).__endpoint;

describe("onBugReportCreated のトリガー設定", () => {
  it("Claude（再整形を含む最大 2 回）と かんばん API の呼び出しの上限を合わせても収まるタイムアウト（180秒）を指定する", () => {
    const timeoutSeconds = endpointOf().timeoutSeconds;
    expect(timeoutSeconds).toBe(180);
    expect((timeoutSeconds ?? 0) * 1000).toBeGreaterThan(
      CLAUDE_TIMEOUT_MS * 2 + SCRUM_BOARD_TIMEOUT_MS,
    );
  });

  it("画像を扱うためメモリ上限を 512MiB（availableMemoryMb: 512）に設定する", () => {
    expect(endpointOf().availableMemoryMb).toBe(512);
  });

  it("関数のタイムアウトは処理ロックの期限より短い（打ち切り後の再実行で二重に起票しない）", () => {
    const timeoutSeconds = endpointOf().timeoutSeconds ?? 0;
    expect(timeoutSeconds * 1000).toBeLessThan(PROCESSING_LOCK_TIMEOUT_MS);
  });

  it("スクラムかんばんと Claude の両方の Secret を宣言する", () => {
    const keys = (endpointOf().secretEnvironmentVariables ?? []).map(
      (secret) => secret.key,
    );
    expect(keys).toEqual(
      expect.arrayContaining(["SCRUM_BOARD_CREDENTIALS", "ANTHROPIC_API_KEY"]),
    );
  });

  describe("Secret とパラメータの受け渡し", () => {
    const ENV_KEYS = [
      "ANTHROPIC_API_KEY",
      "SCRUM_BOARD_CREDENTIALS",
      "SCRUM_BOARD_ORIGIN",
      "SCRUM_BOARD_PROJECT_ID",
    ];
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

    it("各 Secret の値と createImageStore を handleBugReport へ渡す", async () => {
      process.env.ANTHROPIC_API_KEY = "anthropic-key";
      process.env.SCRUM_BOARD_CREDENTIALS = "board-user:password";
      process.env.SCRUM_BOARD_PROJECT_ID = "27";
      process.env.SCRUM_BOARD_ORIGIN = "https://board.example.test";
      const fn = onBugReportCreated({
        collection: () => ({ doc: () => ({}) }),
      } as never) as unknown as { run(event: unknown): Promise<void> };

      await fn.run({ data: {}, params: { reportId: "r1" } });

      const [reportId, , deps] = (handleBugReport as jest.Mock).mock.calls[0];
      expect(reportId).toBe("r1");
      expect(deps.anthropicApiKey).toBe("anthropic-key");
      expect(deps.credentials).toBe("board-user:password");
      expect(deps.projectId).toBe(27);
      expect(deps.origin).toBe("https://board.example.test");
      expect(typeof deps.createImageStore).toBe("function");

      const store = deps.createImageStore();
      expect(mockBucketFn).toHaveBeenCalledTimes(1);
      expect(createStorageImageStore).toHaveBeenCalledWith(mockBucket);
      expect(store).toBe(mockCreatedStore);
    });
  });
});
