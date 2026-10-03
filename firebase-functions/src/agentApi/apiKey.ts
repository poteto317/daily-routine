import { createHash } from "crypto";
import type * as admin from "firebase-admin";

export const API_KEY_PATTERN = /^drk_[A-Za-z0-9_-]{43}$/;

export const hashApiKey = (key: string): string =>
  createHash("sha256").update(key, "utf8").digest("hex");

export const extractBearerToken = (header: string | undefined): string | null => {
  if (!header) return null;
  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer" || parts[1].length === 0) {
    return null;
  }
  return parts[1];
};

export const resolveUidByApiKey = async (
  db: admin.firestore.Firestore,
  key: string,
): Promise<string | null> => {
  if (!API_KEY_PATTERN.test(key)) return null;
  const snapshot = await db.collection("apiKeys").doc(hashApiKey(key)).get();
  if (!snapshot.exists) return null;
  const uid = snapshot.data()?.uid;
  return typeof uid === "string" && uid.length > 0 ? uid : null;
};
