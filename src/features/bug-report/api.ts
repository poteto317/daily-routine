import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestoreInstance, getOrCreateUser } from "@/lib/firebase";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { collectBugReportMeta } from "./collectBugReportMeta";
import { buildBugReportPayload } from "./helpers";
import type { BugReportInput } from "./types";

/**
 * 不具合報告を Firestore の bugReports コレクションへ保存する。
 * ペイロード構築は buildBugReportPayload に委譲し、認証・保存のみを担う。
 * サーバ専用フィールド（issueNumber 等）は書き込まない。
 *
 * @returns 作成されたドキュメント ID
 */
export const submitBugReport = async (
  input: BugReportInput,
): Promise<string> => {
  const user = await getOrCreateUser();
  const firestore = getFirestoreInstance();

  const payload = {
    ...buildBugReportPayload(input, user.uid, collectBugReportMeta()),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(
    collection(firestore, BUG_REPORTS_COLLECTION),
    payload,
  );
  return docRef.id;
};
