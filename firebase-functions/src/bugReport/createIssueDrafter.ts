import type { BugReportContentSource, IssueDraft } from "./buildIssueContent";
import { describeDraftFailure } from "./describeDraftFailure";
import {
  createClaudeDraftRequester,
  draftIssueWithClaude,
  type DraftRequester,
} from "./draftIssueWithClaude";

/** API キーが Claude を使わない設定（trim して空、または none）かを判定する */
export const isClaudeDisabledKey = (apiKey: string): boolean => {
  const trimmed = apiKey.trim();
  return trimmed.length === 0 || trimmed.toLowerCase() === "none";
};

/** 起票内容の出どころ。整形が呼ばれなければ none、呼ばれて採用できなければ fallback */
export type IssueContentSource = "claude" | "fallback" | "none";

type CreateIssueDrafterDeps = {
  reportId: string;
  /** Claude の API キー。空または none なら Claude を使わない */
  anthropicApiKey: string;
  /** API キーから整形の依頼関数を作る（テスト用。既定は createClaudeDraftRequester） */
  createDraftRequester?: (apiKey: string) => DraftRequester;
  logger: {
    warn(message: string): void;
  };
};

export type IssueDrafter = {
  /** 報告を整形する。整形しない・できない場合は null（従来の内容で起票する） */
  draftIssue: (report: BugReportContentSource) => Promise<IssueDraft | null>;
  /** これまでの draftIssue の結果から、起票内容の出どころを返す */
  contentSource: () => IssueContentSource;
};

/**
 * Claude による整形を、失敗しても例外を投げない draftIssue にまとめる。
 * 失敗の理由は warn に出す。API キー・報告本文・エラーメッセージ本文はログに出さない。
 */
export const createIssueDrafter = (
  deps: CreateIssueDrafterDeps,
): IssueDrafter => {
  let source: IssueContentSource = "none";

  const draftIssue = async (
    report: BugReportContentSource,
  ): Promise<IssueDraft | null> => {
    source = "fallback";
    // Secret の末尾の改行などでヘッダーの組み立てが失敗しないよう、trim した値を使う
    const apiKey = deps.anthropicApiKey.trim();
    if (isClaudeDisabledKey(apiKey)) return null;
    // 中身の無い報告から文章を作らせない。Firestore ルールの \s は ASCII の空白だけに
    // 一致するため、全角空白だけの説明が通りうる
    if (report.description.trim().length === 0) return null;
    try {
      const requestDraft = (
        deps.createDraftRequester ?? createClaudeDraftRequester
      )(apiKey);
      const draft = await draftIssueWithClaude(report, requestDraft);
      source = "claude";
      return draft;
    } catch (error) {
      deps.logger.warn(
        `Bug report ${deps.reportId}: Claude による整形に失敗したため従来の内容で起票します (${describeDraftFailure(error)})`,
      );
      return null;
    }
  };

  return { draftIssue, contentSource: () => source };
};
