import { randomUUID } from "node:crypto";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import type { Firestore } from "../../adminSdk";
import { reclaimExpiredImages, removeLateImage } from "./imageCleanup";
import {
  findDueReservations,
  reserveImages,
  submitReservedReport,
} from "./imageReservations";
import { validateImageReport } from "./validateImageReport";

const region = "asia-northeast1";

export const submitBugReportWithImages = (db: Firestore) =>
  onCall(
    { region, timeoutSeconds: 180, concurrency: 2, memory: "512MiB" },
    async ({ auth, data }) => {
      if (!auth) throw new HttpsError("unauthenticated", "Sign-in required");
      const uid = auth.uid;
      if (uid.includes("/") || uid.includes("..")) {
        throw new HttpsError(
          "failed-precondition",
          "Invalid account identifier",
        );
      }

      const { fields, images } = validateImageReport(data);
      const bucket = getStorage().bucket();
      const reportId = randomUUID();
      const refs = await reserveImages(db, uid, reportId, images, Date.now());

      for (const [index, { bytes, contentType }] of images.entries()) {
        await bucket.file(refs[index].path).save(bytes, {
          contentType,
          resumable: false,
          timeout: 30_000,
          preconditionOpts: { ifGenerationMatch: 0 },
        });
      }
      await submitReservedReport(db, reportId, fields, Date.now);
      return { reportId };
    },
  );

export const cleanupExpiredBugReportImages = (db: Firestore) =>
  onSchedule(
    {
      region,
      schedule: "every 15 minutes",
      timeoutSeconds: 420,
      maxInstances: 1,
    },
    async () => {
      const bucket = getStorage().bucket();
      const due = await findDueReservations(db, Date.now());
      for (const { id } of due.docs) {
        try {
          await reclaimExpiredImages(
            db,
            id,
            (path) => bucket.file(path).delete({ ignoreNotFound: true }),
            Date.now,
          );
        } catch (error) {
          logger.error("Failed to reclaim bug report images", {
            reportId: id,
            code: (error as { code?: unknown })?.code,
          });
        }
      }
    },
  );

export const cleanupLateBugReportImage = (db: Firestore, bucket: string) =>
  onObjectFinalized({ region, bucket, retry: true }, async ({ data }) => {
    await removeLateImage(db, data.name, data.generation, (path, generation) =>
      getStorage()
        .bucket(data.bucket)
        .file(path, { generation })
        .delete({ ignoreNotFound: true }),
    );
  });
