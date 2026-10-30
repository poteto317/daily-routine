import type { FieldValue, Timestamp } from "firebase/firestore";

/**
 * 不具合報告の処理状態。
 * - pending: クライアントが作成した直後（未処理）
 * - processing: Cloud Functions が処理中
 * - issued: GitHub Issue 作成済み
 * - error: Issue 化に失敗
 */
export type BugReportStatus = "pending" | "processing" | "issued" | "error";

/**
 * 報告時に自動収集するメタ情報。個人情報は含めず最小限に留める。
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
 * ユーザーが入力する報告内容。
 */
export interface BugReportInput {
  title?: string;
  description: string;
  stepsToReproduce?: string;
}

/**
 * Storage へアップロードした添付画像の参照情報。
 */
export interface BugReportImage {
  path: string;
  contentType: string;
  size: number;
}

/**
 * クライアントが Firestore へ書き込むペイロード。
 * サーバ専用フィールド（issueNumber 等）は含めない。
 * createdAt / updatedAt は serverTimestamp() を渡すため FieldValue を許容する。
 */
export interface BugReportCreatePayload extends Required<
  Pick<BugReportInput, "description">
> {
  uid: string;
  title: string;
  stepsToReproduce: string;
  images?: BugReportImage[];
  meta: BugReportMeta;
  status: Extract<BugReportStatus, "pending">;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

/**
 * Firestore `bugReports/{reportId}` ドキュメントの完全な型。
 * issueNumber 以降は Cloud Functions が書き戻す（クライアントは書き込まない）。
 */
export interface BugReport {
  id: string;
  uid: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  images?: BugReportImage[];
  meta: BugReportMeta;
  status: BugReportStatus;
  issueNumber?: number;
  issueUrl?: string;
  aiLabels?: string[];
  errorMessage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
