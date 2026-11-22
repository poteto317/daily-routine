import { createHash } from "node:crypto";
import type { DocumentSnapshot } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "../../adminSdk";
import { BUG_REPORTS_COLLECTION } from "../constants";
import { MANAGED_REPORT_IMAGES_PREFIX } from "../imageFormats";
import type { BugReportImageRef } from "../types";
import type {
  DecodedReportImage,
  ImageReportFields,
} from "./validateImageReport";

const RESERVATIONS = "bugReportImageReservations";
const USAGE = "bugReportImageUsage";
const PENDING_MS = 60 * 60 * 1000;
const RETAINED_MS = 30 * 24 * 60 * 60 * 1000;
const RETRY_MS = 15 * 60 * 1000;
const USER_LIMIT = { count: 20, bytes: 50 * 1024 * 1024 };
const GLOBAL_LIMIT = { count: 1000, bytes: 2 * 1024 * 1024 * 1024 };
const EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

type Usage = { count: number; bytes: number };
type Reservation = {
  uid: string;
  images: BugReportImageRef[];
  status: "pending" | "submitted" | "deleting";
  expiresAt: number;
  cleanupAt: number;
};

export const imageReservationRef = (db: Firestore, reportId: string) =>
  db.collection(RESERVATIONS).doc(reportId);

export const imageUsageRefs = (db: Firestore, uid: string) => {
  const usage = db.collection(USAGE);
  const key = createHash("sha256").update(uid).digest("hex");
  return { user: usage.doc(`user-${key}`), global: usage.doc("global") };
};

const isUsageValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

function readUsage(snapshot: DocumentSnapshot): Usage {
  if (!snapshot.exists) return { count: 0, bytes: 0 };
  const data = snapshot.data();
  if (!isUsageValue(data?.count) || !isUsageValue(data?.bytes)) {
    throw new Error("Invalid image usage record");
  }
  return { count: data.count, bytes: data.bytes };
}

const imageUsage = (images: readonly BugReportImageRef[]): Usage => ({
  count: images.length,
  bytes: images.reduce((total, image) => total + image.size, 0),
});
const add = (a: Usage, b: Usage): Usage => ({
  count: a.count + b.count,
  bytes: a.bytes + b.bytes,
});
const subtract = (a: Usage, b: Usage): Usage => {
  if (a.count < b.count || a.bytes < b.bytes) {
    throw new Error("Image quota counters are below the reserved usage");
  }
  return { count: a.count - b.count, bytes: a.bytes - b.bytes };
};
const exceeds = (usage: Usage, limit: Usage) =>
  usage.count > limit.count || usage.bytes > limit.bytes;

export async function reserveImages(
  db: Firestore,
  uid: string,
  reportId: string,
  images: readonly DecodedReportImage[],
  now: number,
): Promise<BugReportImageRef[]> {
  const reservation = imageReservationRef(db, reportId);
  const usageRefs = imageUsageRefs(db, uid);
  const refs = images.map(({ bytes, contentType }, index) => ({
    path: `${MANAGED_REPORT_IMAGES_PREFIX}/${uid}/${reportId}/${index}.${EXTENSIONS[contentType]}`,
    contentType,
    size: bytes.length,
  }));
  const added = imageUsage(refs);
  const expiresAt = now + PENDING_MS;

  await db.runTransaction(async (tx) => {
    const existing = await tx.get(reservation);
    const user = add(readUsage(await tx.get(usageRefs.user)), added);
    const global = add(readUsage(await tx.get(usageRefs.global)), added);
    if (existing.exists) throw new Error("Image reservation already exists");
    if (exceeds(user, USER_LIMIT) || exceeds(global, GLOBAL_LIMIT)) {
      throw new HttpsError("resource-exhausted", "Report image quota reached");
    }

    tx.set(usageRefs.user, user);
    tx.set(usageRefs.global, global);
    tx.set(reservation, {
      uid,
      images: refs,
      status: "pending",
      expiresAt,
      cleanupAt: expiresAt,
    } satisfies Reservation);
  });
  return refs;
}

export async function submitReservedReport(
  db: Firestore,
  reportId: string,
  fields: ImageReportFields,
  now: () => number,
): Promise<void> {
  const reservation = imageReservationRef(db, reportId);
  const report = db.collection(BUG_REPORTS_COLLECTION).doc(reportId);
  await db.runTransaction(async (tx) => {
    const value = (await tx.get(reservation)).data() as Reservation | undefined;
    const existingReport = await tx.get(report);
    const time = now();
    if (
      value?.status !== "pending" ||
      !isUsageValue(value.expiresAt) ||
      value.expiresAt <= time ||
      existingReport.exists
    ) {
      throw new HttpsError(
        "failed-precondition",
        "Image reservation is no longer available",
      );
    }

    const timestamp = FieldValue.serverTimestamp();
    tx.set(report, {
      ...fields,
      uid: value.uid,
      images: value.images,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    const expiresAt = time + RETAINED_MS;
    tx.update(reservation, {
      status: "submitted",
      expiresAt,
      cleanupAt: expiresAt,
    });
  });
}

export const findDueReservations = (db: Firestore, now: number) =>
  db
    .collection(RESERVATIONS)
    .where("cleanupAt", "<=", now)
    .orderBy("cleanupAt")
    .limit(100)
    .get();

export function claimExpiredReservation(
  db: Firestore,
  reportId: string,
  now: () => number,
): Promise<Reservation | null> {
  const ref = imageReservationRef(db, reportId);
  return db.runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() as Reservation | undefined;
    const time = now();
    if (!current) return null;
    if (!isUsageValue(current.expiresAt) || !isUsageValue(current.cleanupAt)) {
      throw new Error("Invalid image reservation expiration");
    }
    if (current.expiresAt > time || current.cleanupAt > time) return null;

    tx.update(ref, { status: "deleting", cleanupAt: time + RETRY_MS });
    return current;
  });
}

export async function releaseReservation(
  db: Firestore,
  reportId: string,
): Promise<void> {
  const ref = imageReservationRef(db, reportId);
  await db.runTransaction(async (tx) => {
    const current = (await tx.get(ref)).data() as Reservation | undefined;
    if (current?.status !== "deleting") return;

    const usageRefs = imageUsageRefs(db, current.uid);
    const reserved = imageUsage(current.images);
    const user = subtract(readUsage(await tx.get(usageRefs.user)), reserved);
    const global = subtract(
      readUsage(await tx.get(usageRefs.global)),
      reserved,
    );
    if (user.count === 0 && user.bytes === 0) {
      tx.delete(usageRefs.user);
    } else {
      tx.set(usageRefs.user, user);
    }
    tx.set(usageRefs.global, global);
    tx.delete(ref);
  });
}

export async function isReservedImage(
  db: Firestore,
  reportId: string,
  path: string,
): Promise<boolean> {
  const reservation = (await imageReservationRef(db, reportId).get()).data() as
    Reservation | undefined;
  return (
    reservation !== undefined &&
    reservation.status !== "deleting" &&
    reservation.images.some((image) => image.path === path)
  );
}
