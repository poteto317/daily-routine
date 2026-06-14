import type { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { BugReportContentSource } from "./buildIssueContent";

/**
 * 不具合報告の処理状態。
 * - pending: クライアント作成直後（未処理）
 * - processing: Cloud Functions が処理中
 * - issued: GitHub Issue 作成済み
 * - error: Issue 化に失敗
 */
export type BugReportStatus = "pending" | "processing" | "issued" | "error";

/**
 * 報告時にクライアントが収集するメタ情報。
 */
export interface BugReportMeta {
  appVersion: string;
  userAgent: string;
  url: string;
  locale: string;
  timezone: string;
  createdAtClient: string;
}

/**
 * Firestore `bugReports/{reportId}` ドキュメントの型（サーバ側）。
 * issueNumber 以降は Cloud Functions が書き戻すフィールド。
 * createdAt / updatedAt / processingAt は読み取り時 Timestamp、書き込み時 FieldValue。
 */
export interface BugReport {
  uid: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  meta: BugReportMeta;
  status: BugReportStatus;
  issueNumber?: number;
  issueUrl?: string;
  aiLabels?: string[];
  errorMessage?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  /**
   * processing ロックを取得した時刻。期限付きロックの判定に使用する。
   * 参照する場合は呼び出し側で Timestamp → ms epoch への変換責任を持つこと。
   */
  processingAt?: Timestamp | FieldValue;
}

/**
 * processBugReport が処理対象とする不具合報告（firebase 非依存の構造型）。
 *
 * 注意: ロック判定で使う processingAt は Firestore 上 Timestamp 型のため、
 * この構造体には含めない。期限付きロックの取得可否判定は claimProcessing dep
 * （onBugReportCreated 側で Timestamp → ms 変換して canClaimProcessing に渡す）
 * に委譲する。これにより firebase 依存をコアロジックから排除している。
 */
export interface ProcessableBugReport extends BugReportContentSource {
  status: BugReportStatus;
  issueNumber?: number;
}
