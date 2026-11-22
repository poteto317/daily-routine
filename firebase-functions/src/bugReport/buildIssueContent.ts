import {
  SCRUM_BOARD_DESCRIPTION_MAX_LENGTH,
  SCRUM_BOARD_TITLE_MAX_LENGTH,
} from "./constants";
import { REPORT_IMAGE_URL_TTL_MINUTES } from "./imageFormats";

/**
 * かんばんアイテムの本文整形に必要な不具合報告データ（firebase 非依存の構造型）。
 * Firestore ドキュメントの一部フィールドを構造的に受け取る。
 */
export interface BugReportContentSource {
  uid: string;
  title?: string;
  description: string;
  stepsToReproduce?: string;
  images?: unknown;
  meta?: {
    appVersion: string;
    userAgent: string;
    url: string;
    locale: string;
    timezone: string;
    createdAtClient: string;
  };
}

/** Issue 本文に埋め込むスクリーンショット節の情報 */
export interface IssueImageSection {
  readonly images: ReadonlyArray<{ readonly url: string }>;
  readonly skippedCount: number;
}

/** かんばんアイテム作成に渡す内容 */
export interface IssueContent {
  title: string;
  body: string;
}

/** Claude が整形した Issue のタイトルと本文 */
export interface IssueDraft {
  title: string;
  body: string;
}

/**
 * ゼロ幅スペース（U+200B）。
 * 文字列リテラルに直接埋め込むと差分レビュー・検索・コピー&ペーストで破損し得るため、
 * 必ずこの定数経由で参照する。
 */
export const ZERO_WIDTH_SPACE = "\u200B";

/** かんばんアイテム本文内で @ メンションが通知スパムにならないようゼロ幅スペースを挿入する */
export const sanitizeMention = (text: string): string =>
  text.replace(/@/g, `@${ZERO_WIDTH_SPACE}`);

const TITLE_SNIPPET_LENGTH = 50;
const TITLE_PREFIX = "[アプリからの報告]";
/** 添付画像と環境情報のための余裕を残す */
const DRAFT_BODY_MAX_LENGTH = 5_000;
const FOOTER_NOTE =
  "> このアイテムはアプリの「報告・問い合わせ」から自動生成されました。";
const DRAFT_FOOTER_NOTE =
  "> このアイテムはアプリの「報告・問い合わせ」から自動生成され、Claude で整形されました。";

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
 * スクリーンショット節の行を組み立てる（末尾に空行を含む）。
 * 埋め込む画像も飛ばされた画像も無ければ空配列を返す。
 */
const buildScreenshotLines = (imageSection?: IssueImageSection): string[] => {
  if (!imageSection) {
    return [];
  }
  const { images, skippedCount } = imageSection;
  if (images.length === 0 && skippedCount <= 0) {
    return [];
  }

  const lines: string[] = ["## スクリーンショット", ""];
  if (images.length > 0) {
    lines.push(
      `添付リンクは発行から ${REPORT_IMAGE_URL_TTL_MINUTES} 分で失効します。`,
      "",
    );
  }
  images.forEach((img, index) => {
    lines.push(
      `[スクリーンショット ${index + 1}](${sanitizeMention(img.url)})`,
      "",
    );
  });
  if (skippedCount > 0) {
    lines.push(
      `（添付された画像 ${skippedCount} 枚を取得できなかったため掲載していません）`,
      "",
    );
  }
  return lines;
};

/**
 * Issue 本文を Markdown で生成する（不具合内容・再現手順・スクリーンショット・環境情報）。
 */
export const buildIssueBody = (
  report: BugReportContentSource,
  imageSection?: IssueImageSection,
): string => {
  const lines: string[] = [];

  lines.push(
    "## 報告・問い合わせの内容",
    "",
    sanitizeMention(report.description.trim()) || "(記載なし)",
    "",
  );

  const steps = sanitizeMention((report.stepsToReproduce ?? "").trim());
  if (steps.length > 0) {
    lines.push("## 再現手順", "", steps, "");
  }

  return appendIssueDetails(
    lines.join("\n"),
    report,
    FOOTER_NOTE,
    imageSection,
  );
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
const LEADING_TITLE_PREFIX_PATTERN =
  /^(?:[[［【](?:アプリからの報告|不具合報告)[\]］】]\s*)+/;

/**
 * タイトル先頭に連続する前置（[アプリからの報告]・全角括弧の表記を含む）と続く空白を取り除く。途中の前置は残す。
 * 前置だけのタイトルは空文字列になる。
 */
export const stripTitlePrefix = (title: string): string =>
  title.replace(LEADING_TITLE_PREFIX_PATTERN, "");

/**
 * Claude が整形したタイトルから Issue タイトルを作る。
 * 空白を整理し、先頭に付いた前置を取り除いてから前置し、@ を無害化してから
 * かんばんの上限に切り詰める（無害化で文字数が増えるため、切り詰めは最後に行う）。
 * 前置だけのタイトルは draftIssueWithClaude が empty_output として退けるため、ここには来ない。
 */
const buildDraftIssueTitle = (draft: IssueDraft): string => {
  const title = stripTitlePrefix(draft.title.replace(/\s+/g, " ").trim());
  return truncateCodePoints(
    sanitizeMention(`${TITLE_PREFIX} ${title}`),
    SCRUM_BOARD_TITLE_MAX_LENGTH,
  );
};

/**
 * Claude が整形した本文にスクリーンショット節・環境情報・整形の注記を付けて Issue 本文を作る。
 * 元の説明文・再現手順は draft の本文に置き換わるため含めない。
 */
const buildDraftIssueBody = (
  report: BugReportContentSource,
  draft: IssueDraft,
  imageSection?: IssueImageSection,
): string =>
  appendIssueDetails(
    truncateCodePoints(
      sanitizeMention(draft.body.trim()),
      DRAFT_BODY_MAX_LENGTH,
    ),
    report,
    DRAFT_FOOTER_NOTE,
    imageSection,
  );

/** 添付リンクや環境情報の分を確保し、報告本文を残りの文字数に収める */
const appendIssueDetails = (
  body: string,
  report: BugReportContentSource,
  footerNote: string,
  imageSection?: IssueImageSection,
): string => {
  const details = [
    "",
    "",
    ...buildScreenshotLines(imageSection),
    ...buildEnvironmentLines(report, footerNote),
  ].join("\n");
  const remaining =
    SCRUM_BOARD_DESCRIPTION_MAX_LENGTH - Array.from(details).length;
  return truncateCodePoints(body, Math.max(0, remaining)).trimEnd() + details;
};

/**
 * 不具合報告から Issue 作成用の内容（タイトル・本文）を組み立てる。
 * Claude の整形結果（draft）があればタイトルと本文の前半に使い、無ければ従来どおり
 * 報告内容から組み立てる。
 */
export const buildIssueContent = (
  report: BugReportContentSource,
  draft?: IssueDraft | null,
  imageSection?: IssueImageSection,
): IssueContent => ({
  title: draft ? buildDraftIssueTitle(draft) : buildIssueTitle(report),
  body: draft
    ? buildDraftIssueBody(report, draft, imageSection)
    : buildIssueBody(report, imageSection),
});
