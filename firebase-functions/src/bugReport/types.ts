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
 * createdAt / updatedAt は読み取り時 Timestamp、書き込み時 FieldValue。
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
}

/**
 * processBugReport が処理対象とする不具合報告（firebase 非依存の構造型）。
 */
export interface ProcessableBugReport extends BugReportContentSource {
  status: BugReportStatus;
  issueNumber?: number;
}
