import type { Firestore } from "../../adminSdk";
import {
  IMAGE_FILE_NAME_PATTERN,
  MANAGED_REPORT_IMAGES_PREFIX,
} from "../imageFormats";
import {
  claimExpiredReservation,
  isReservedImage,
  releaseReservation,
} from "./imageReservations";

export async function reclaimExpiredImages(
  db: Firestore,
  reportId: string,
  remove: (path: string) => Promise<unknown>,
  now: () => number,
): Promise<void> {
  const lease = await claimExpiredReservation(db, reportId, now);
  if (!lease) return;

  const prefix = `${MANAGED_REPORT_IMAGES_PREFIX}/${lease.uid}/${reportId}/`;
  const paths = lease.images.map(({ path }) => path);
  if (
    paths.some(
      (path) =>
        !path.startsWith(prefix) ||
        !IMAGE_FILE_NAME_PATTERN.test(path.slice(prefix.length)),
    )
  ) {
    throw new Error("Invalid reserved image path");
  }
  for (const path of paths) await remove(path);
  await releaseReservation(db, reportId);
}

export async function removeLateImage(
  db: Firestore,
  path: string,
  generation: string | number,
  remove: (path: string, generation: string | number) => Promise<unknown>,
): Promise<void> {
  const [prefix, uid, reportId, fileName, extra] = path.split("/");
  if (
    prefix !== MANAGED_REPORT_IMAGES_PREFIX ||
    !uid ||
    !reportId ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(reportId) ||
    !fileName ||
    !IMAGE_FILE_NAME_PATTERN.test(fileName) ||
    extra !== undefined ||
    !/^[1-9][0-9]*$/.test(String(generation))
  ) {
    return;
  }
  if (!(await isReservedImage(db, reportId, path))) {
    await remove(path, generation);
  }
}
