/** @jest-environment node */
import { onBugReportCreated } from "../onBugReportCreated";
import { PROCESSING_LOCK_TIMEOUT_MS } from "../constants";

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
  it("Claude（最大 45 秒）と GitHub（最大 30 秒）を待てるタイムアウトを指定する", () => {
    expect(endpointOf().timeoutSeconds).toBe(120);
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
});
