import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getAuthInstance,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { BUG_REPORTS_COLLECTION } from "./constants";
import { collectBugReportMeta } from "./collectBugReportMeta";
import { buildBugReportPayload } from "./helpers";
import { encodeBugReportImages } from "./imageUpload";
import type { BugReportInput, BugReportMeta } from "./types";

type ImageReportRequest = BugReportInput & {
  meta: BugReportMeta;
  images: Awaited<ReturnType<typeof encodeBugReportImages>>;
};

/** 不具合報告を送信し、作成されたドキュメント ID を返す。 */
export const submitBugReport = async (
  input: BugReportInput,
  images?: readonly File[],
): Promise<string> => {
  const { uid } = await getOrCreateUser();
  const payload = buildBugReportPayload(input, uid, collectBugReportMeta());

  if (images?.length) {
    const encoded = await encodeBugReportImages(images);
    const functions = getFunctions(getAuthInstance().app, "asia-northeast1");
    const submitWithImages = httpsCallable<
      ImageReportRequest,
      { reportId: string }
    >(functions, "submitBugReportWithImages", { timeout: 180_000 });
    const { title, description, stepsToReproduce, meta } = payload;
    const { data } = await submitWithImages({
      title,
      description,
      stepsToReproduce,
      meta,
      images: encoded,
    });
    return data.reportId;
  }

  const firestore = getFirestoreInstance();
  const docRef = doc(collection(firestore, BUG_REPORTS_COLLECTION));
  await setDoc(docRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};
