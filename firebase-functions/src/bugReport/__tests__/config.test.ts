/** @jest-environment node */
import { githubRepo } from "../config";
import { createGithubIssue } from "../createGithubIssue";

describe("不具合報告の起票先パラメータ", () => {
  const originalRepo = process.env.GITHUB_REPO;
  const originalFetch = global.fetch;
  afterEach(() => {
    if (originalRepo === undefined) delete process.env.GITHUB_REPO;
    else process.env.GITHUB_REPO = originalRepo;
    global.fetch = originalFetch;
  });

  it("通常の環境変数から指定した起票先をGitHub呼び出しに使用する", async () => {
    process.env.GITHUB_REPO = "test-owner/custom-repository";
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        number: 1,
        html_url: "https://example.test/issues/1",
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    await createGithubIssue({
      token: "test-token",
      repo: githubRepo.value(),
      content: { title: "テスト", body: "本文", labels: [] },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/test-owner/custom-repository/issues",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
