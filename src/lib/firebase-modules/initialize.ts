import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { getStorage } from "firebase/storage";
import { firebaseConfig, isFirebaseConfigured } from "./config";
import { getFirebaseState, setFirebaseState } from "./state";

let messagingInitialization: Promise<void> | null = null;

export const waitForFirebaseMessaging = async (): Promise<void> => {
  await messagingInitialization;
};

export const initializeFirebaseIfConfigured = () => {
  if (!isFirebaseConfigured) return;

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  setFirebaseState({ app });

  if (typeof window === "undefined") return;

  setFirebaseState({
    firestore: getFirestore(app),
    auth: getAuth(app),
    storage: getStorage(app),
  });

  messagingInitialization = isSupported()
    .then((supported) => {
      const { app: currentApp } = getFirebaseState();
      if (supported && currentApp) {
        setFirebaseState({ messaging: getMessaging(currentApp) });
      }
    })
    .catch(() => {
      // Messaging の未対応や初期化失敗で Firebase Auth と Firestore を止めない。
    });
};
