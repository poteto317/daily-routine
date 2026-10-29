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

/** Claude が整形した Issue のタイトルと本文 */
export interface IssueDraft {
  title: string;
  body: string;
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
const TITLE_PREFIX = "[不具合報告]";
/** GitHub の Issue タイトルの上限 */
const ISSUE_TITLE_MAX_LENGTH = 256;
/** 環境情報を足しても GitHub の本文上限（65,536）に収まる長さ */
const DRAFT_BODY_MAX_LENGTH = 60_000;
const FOOTER_NOTE =
  "> この Issue はアプリの不具合報告機能から自動生成されました。";
const DRAFT_FOOTER_NOTE =
  "> この Issue はアプリの不具合報告機能から自動生成され、Claude で整形されました。";

/** サロゲートペアを途中で切らないよう、コードポイント単位で切り詰める */
const truncateCodePoints = (text: string, maxLength: number): string => {
  const codePoints = Array.from(text);
  return codePoints.length <= maxLength
    ? text
    : codePoints.slice(0, maxLength).join("");
};

/**
 * Issue タイトルを決定する。ユーザー入力タイトルがあれば優先し、
 * 無ければ説明の先頭を要約して生成する。
 */
export const buildIssueTitle = (report: BugReportContentSource): string => {
  const title = sanitizeMention((report.title ?? "").trim());
  if (title.length > 0) {
    return title;
  }
  const snippet = truncateCodePoints(
    report.description.trim().replace(/\s+/g, " "),
    TITLE_SNIPPET_LENGTH,
  );
  return snippet.length > 0
    ? `${TITLE_PREFIX} ${sanitizeMention(snippet)}`
    : TITLE_PREFIX;
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

  lines.push(...buildEnvironmentLines(report, FOOTER_NOTE));

  return lines.join("\n");
};

/**
 * 本文末尾の環境情報・報告者 uid・注記の行を組み立てる（従来・整形の両方で共通）。
 */
const buildEnvironmentLines = (
  report: BugReportContentSource,
  footerNote: string,
): string[] => {
  const lines: string[] = ["## 環境情報", ""];
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

  lines.push("", `> 報告者 uid: ${sanitizeMention(report.uid)}`, footerNote);
  return lines;
};

/** タイトル先頭の前置（と続く空白）。Claude が付けてしまった場合に二重にしないため取り除く */
// Claude が全角括弧で付けた場合も取り除く
const LEADING_TITLE_PREFIX_PATTERN = /^(?:[[［【]不具合報告[\]］】]\s*)+/;

/**
 * タイトル先頭に連続する前置（[不具合報告]・全角括弧の表記を含む）と続く空白を取り除く。途中の前置は残す。
 * 前置だけのタイトルは空文字列になる。
 */
export const stripTitlePrefix = (title: string): string =>
  title.replace(LEADING_TITLE_PREFIX_PATTERN, "");

/**
 * Claude が整形したタイトルから Issue タイトルを作る。
 * 空白を整理し、先頭に付いた前置を取り除いてから前置し、@ を無害化してから
 * GitHub の上限に切り詰める（無害化で文字数が増えるため、切り詰めは最後に行う）。
 * 前置だけのタイトルは draftIssueWithClaude が empty_output として退けるため、ここには来ない。
 */
const buildDraftIssueTitle = (draft: IssueDraft): string => {
  const title = stripTitlePrefix(draft.title.replace(/\s+/g, " ").trim());
  return truncateCodePoints(
    sanitizeMention(`${TITLE_PREFIX} ${title}`),
    ISSUE_TITLE_MAX_LENGTH,
  );
};

/**
 * Claude が整形した本文に環境情報と整形の注記を付けて Issue 本文を作る。
 * 元の説明文・再現手順は draft の本文に置き換わるため含めない。
 */
const buildDraftIssueBody = (
  report: BugReportContentSource,
  draft: IssueDraft,
): string =>
  [
    truncateCodePoints(
      sanitizeMention(draft.body.trim()),
      DRAFT_BODY_MAX_LENGTH,
    ),
    "",
    ...buildEnvironmentLines(report, DRAFT_FOOTER_NOTE),
  ].join("\n");

/**
 * 不具合報告から Issue 作成用の内容（タイトル・本文・ラベル）を組み立てる。
 * Claude の整形結果（draft）があればタイトルと本文の前半に使い、無ければ従来どおり
 * 報告内容から組み立てる。
 */
export const buildIssueContent = (
  report: BugReportContentSource,
  draft?: IssueDraft | null,
): GithubIssueContent => ({
  title: draft ? buildDraftIssueTitle(draft) : buildIssueTitle(report),
  body: draft ? buildDraftIssueBody(report, draft) : buildIssueBody(report),
  labels: [...DEFAULT_BUG_REPORT_LABELS],
});
