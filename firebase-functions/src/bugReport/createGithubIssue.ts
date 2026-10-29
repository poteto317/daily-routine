import type { GithubIssueContent } from "./buildIssueContent";

/** GitHub API 呼び出しの上限。fetch の signal は応答本文の読み込みも含めて打ち切る */
export const GITHUB_TIMEOUT_MS = 30_000;

/** Issue 作成結果 */
export interface GithubIssueResult {
  issueNumber: number;
  issueUrl: string;
}

interface CreateGithubIssueParams {
  token: string;
  /** "owner/repo" 形式 */
  repo: string;
  content: GithubIssueContent;
}

/**
 * GitHub REST API（fetch）で Issue を作成する。
 * 依存追加を避けるため Octokit ではなく Node のグローバル fetch を利用する。
 */
export const createGithubIssue = async ({
  token,
  repo,
  content,
}: CreateGithubIssueParams): Promise<GithubIssueResult> => {
  const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "daily-routine-bug-report",
    },
    body: JSON.stringify({
      title: content.title,
      body: content.body,
      labels: content.labels,
    }),
    signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `GitHub API への Issue 作成に失敗しました (status=${response.status}): ${errorText}`,
    );
  }

  const json = (await response.json()) as {
    number: number;
    html_url: string;
  };

  return { issueNumber: json.number, issueUrl: json.html_url };
};
