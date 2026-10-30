import { initializeFirebaseIfConfigured } from "./firebase-modules/initialize";
import { isFirebaseConfigured } from "./firebase-modules/config";
import { FirebaseError } from "./firebase-modules/error";
import { getFirebaseState } from "./firebase-modules/state";
import { getFCMToken, onForegroundMessage } from "./firebase-modules/messaging";
import { getOrCreateUser, getAuthInstance } from "./firebase-modules/auth";
import { getFirestoreInstance } from "./firebase-modules/firestore";
import { getStorageInstance } from "./firebase-modules/storage";

initializeFirebaseIfConfigured();

export {
  FirebaseError,
  isFirebaseConfigured,
  getFCMToken,
  onForegroundMessage,
  getOrCreateUser,
  getFirestoreInstance,
  getStorageInstance,
  getAuthInstance,
};

export const app = getFirebaseState().app;
