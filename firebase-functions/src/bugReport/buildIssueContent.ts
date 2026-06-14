/**
 * GitHub Issue の本文整形に必要な不具合報告データ（firebase 非依存の構造型）。
 * Firestore ドキュメントの一部フィールドを構造的に受け取る。
 */
export interface BugReportContentSource {
  uid: string;
  title?: string;
  description: string;
  stepsToReproduce?: string;
  meta?: {
    appVersion: string;
    userAgent: string;
    url: string;
    locale: string;
    timezone: string;
    createdAtClient: string;
  };
}

/** GitHub Issue 作成に渡す内容 */
export interface GithubIssueContent {
  title: string;
  body: string;
  labels: string[];
}

/** ユーザー報告に付与する既定ラベル */
export const DEFAULT_BUG_REPORT_LABELS = ["bug", "user-report"];

/**
 * ゼロ幅スペース（U+200B）。
 * 文字列リテラルに直接埋め込むと差分レビュー・検索・コピー&ペーストで破損し得るため、
 * 必ずこの定数経由で参照する。
 */
export const ZERO_WIDTH_SPACE = "\u200B";

/** GitHub Issue 本文内で @ メンションが通知スパムにならないようゼロ幅スペースを挿入する */
export const sanitizeMention = (text: string): string =>
  text.replace(/@/g, `@${ZERO_WIDTH_SPACE}`);

const TITLE_SNIPPET_LENGTH = 50;

/**
 * Issue タイトルを決定する。ユーザー入力タイトルがあれば優先し、
 * 無ければ説明の先頭を要約して生成する。
 */
export const buildIssueTitle = (report: BugReportContentSource): string => {
  const title = sanitizeMention((report.title ?? "").trim());
  if (title.length > 0) {
    return title;
  }
  const snippet = report.description
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, TITLE_SNIPPET_LENGTH);
  return snippet.length > 0
    ? `[不具合報告] ${sanitizeMention(snippet)}`
    : "[不具合報告]";
};

/**
 * Issue 本文を Markdown で生成する（不具合内容・再現手順・環境情報）。
 */
export const buildIssueBody = (report: BugReportContentSource): string => {
  const lines: string[] = [];

  lines.push(
    "## 不具合の内容",
    "",
    sanitizeMention(report.description.trim()) || "(記載なし)",
    "",
  );

  const steps = sanitizeMention((report.stepsToReproduce ?? "").trim());
  if (steps.length > 0) {
    lines.push("## 再現手順", "", steps, "");
  }

  lines.push("## 環境情報", "");
  const meta = report.meta;
  if (meta) {
    lines.push(
      `- アプリバージョン: ${sanitizeMention(meta.appVersion)}`,
      `- URL: ${sanitizeMention(meta.url)}`,
      `- ロケール: ${sanitizeMention(meta.locale)}`,
      `- タイムゾーン: ${sanitizeMention(meta.timezone)}`,
      `- User-Agent: ${sanitizeMention(meta.userAgent)}`,
      `- 報告日時(クライアント): ${sanitizeMention(meta.createdAtClient)}`,
    );
  } else {
    lines.push("(メタ情報なし)");
  }

  lines.push(
    "",
    `> 報告者 uid: ${sanitizeMention(report.uid)}`,
    "> この Issue はアプリの不具合報告機能から自動生成されました。",
  );

  return lines.join("\n");
};

/**
 * 不具合報告から Issue 作成用の内容（タイトル・本文・ラベル）を組み立てる。
 */
export const buildIssueContent = (
  report: BugReportContentSource,
): GithubIssueContent => ({
  title: buildIssueTitle(report),
  body: buildIssueBody(report),
  labels: [...DEFAULT_BUG_REPORT_LABELS],
});
