import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getFirestoreInstance,
  getOrCreateUser,
  getStorageInstance,
} from "@/lib/firebase";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { collectBugReportMeta } from "./collectBugReportMeta";
import { buildBugReportPayload } from "./helpers";
import { deleteBugReportImages, uploadBugReportImages } from "./imageUpload";
import type { BugReportImage, BugReportInput } from "./types";

/**
 * 不具合報告を Firestore の bugReports コレクションへ保存する。
 * 画像がある場合は docRef を先に採番して Storage へアップロードしてから setDoc し、
 * setDoc が失敗した場合はアップロード済み画像をベストエフォートで削除する。
 * サーバ専用フィールド（issueNumber 等）は書き込まない。
 *
 * @returns 作成されたドキュメント ID
 */
export const submitBugReport = async (
  input: BugReportInput,
  images?: readonly File[],
): Promise<string> => {
  const user = await getOrCreateUser();
  const firestore = getFirestoreInstance();
  const docRef = doc(collection(firestore, BUG_REPORTS_COLLECTION));

  let uploadedImages: BugReportImage[] = [];
  if (images && images.length > 0) {
    const storage = getStorageInstance();
    uploadedImages = await uploadBugReportImages({
      storage,
      uid: user.uid,
      reportId: docRef.id,
      images,
    });
  }

  const payload = {
    ...buildBugReportPayload(
      input,
      user.uid,
      collectBugReportMeta(),
      uploadedImages,
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
  } catch (error) {
    if (uploadedImages.length > 0) {
      await deleteBugReportImages(
        getStorageInstance(),
        uploadedImages.map((img) => img.path),
      );
    }
    throw error;
  }

  return docRef.id;
};
