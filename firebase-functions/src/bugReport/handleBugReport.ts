import { processBugReport } from "./processBugReport";
import type { ProcessableBugReport } from "./types";
import { createGithubIssue } from "./createGithubIssue";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { createIssueDrafter } from "./createIssueDrafter";
import type { DraftRequester } from "./draftIssueWithClaude";
import {
  countReferencedImages,
  resolveReportImages,
  type ImageStore,
} from "./resolveReportImages";

/**
 * firebase-admin/firestore の型に依存しない最小限の構造型。
 * テスト時はこの構造を満たすモックを注入できる。
 */
type DbLike = {
  collection(name: string): {
    doc(id: string): {
      get(): Promise<{ exists: boolean; data(): unknown }>;
      // Promise<unknown> にして firebase-admin の Promise<WriteResult> も受け入れる
      update(fields: Record<string, unknown>): Promise<unknown>;
    };
  };
};

type HandleBugReportDeps = {
  repo: string;
  token: string;
  /** Claude の API キー。空または none なら Claude を使わない */
  anthropicApiKey: string;
  /** API キーから整形の依頼関数を作る（テスト用。既定は createClaudeDraftRequester） */
  createDraftRequester?: (apiKey: string) => DraftRequester;
  /** Storage アダプタを作る関数（任意。ロック取得後に必要になった時点で呼ぶ） */
  createImageStore?: () => ImageStore;
  logger: {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, data?: object): void;
  };
  now?: () => unknown;
  claimProcessing: () => Promise<boolean>;
};

/**
 * 不具合報告 Firestore トリガのコア処理。
 * Firebase SDK への直接依存を持たないため単体テスト可能。
 *
 * - Cloud Functions リトライ時の stale スナップショット対策として、
 *   reportId から最新ドキュメントを読み直してから processBugReport に渡す。
 * - ドキュメントが存在しない場合は早期リターン。
 * - Claude による整形は createIssueDrafter に任せ、失敗したら従来の内容で起票する。
 *   整形できたかどうかは info ログの content=claude|fallback|none に出す。
 */
export const handleBugReport = async (
  reportId: string,
  db: DbLike,
  deps: HandleBugReportDeps,
): Promise<void> => {
  const latestSnap = await db
    .collection(BUG_REPORTS_COLLECTION)
    .doc(reportId)
    .get();
  if (!latestSnap.exists) {
    return;
  }

  const report = latestSnap.data() as ProcessableBugReport;

  // 整形が呼ばれなければ（スキップ・ロック取得失敗）content=none のまま
  const drafter = createIssueDrafter({
    reportId,
    anthropicApiKey: deps.anthropicApiKey,
    createDraftRequester: deps.createDraftRequester,
    logger: deps.logger,
  });

  const resolveImages = deps.createImageStore
    ? async (targetReport: ProcessableBugReport) => {
        let store: ImageStore;
        try {
          store = deps.createImageStore!();
        } catch {
          deps.logger.warn(
            `[onBugReportCreated] Report ${reportId}: failed to initialize image store`,
          );
          return {
            images: [],
            skippedCount: countReferencedImages(targetReport.images),
          };
        }
        return resolveReportImages({
          uid: targetReport.uid,
          reportId,
          images: targetReport.images,
          store,
          logger: deps.logger,
        });
      }
    : undefined;

  try {
    const result = await processBugReport(report, {
      claimProcessing: deps.claimProcessing,
      resolveImages,
      draftIssue: drafter.draftIssue,
      createIssue: (content) =>
        createGithubIssue({ token: deps.token, repo: deps.repo, content }),
      updateReport: async (fields) => {
        await db
          .collection(BUG_REPORTS_COLLECTION)
          .doc(reportId)
          .update(fields);
      },
      now: deps.now,
    });
    deps.logger.info(
      `Bug report ${reportId} processed: ${result} (repo=${deps.repo}, content=${drafter.contentSource()})`,
    );
  } catch (error) {
    deps.logger.error(`Bug report ${reportId} processing threw an exception`, {
      error,
    });
    throw error;
  }
};
