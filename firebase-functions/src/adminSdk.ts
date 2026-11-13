/**
 * firebase-admin v14 向けの薄い互換層。
 * 呼び出し側はここから型と FieldValue / getFirestore / getMessaging を使う。
 */
import { initializeApp, getApps } from "firebase-admin/app";
import {
  FieldValue,
  getFirestore,
  type CollectionReference,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
  type Transaction,
} from "firebase-admin/firestore";
import { getMessaging, type Message } from "firebase-admin/messaging";

export type {
  CollectionReference,
  DocumentData,
  Firestore,
  Message,
  QueryDocumentSnapshot,
  Transaction,
};
export { FieldValue, getFirestore, getMessaging };

export const ensureAdminApp = (): void => {
  if (getApps().length === 0) {
    initializeApp();
  }
};
