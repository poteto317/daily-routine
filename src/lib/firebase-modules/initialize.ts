import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseConfig, isFirebaseConfigured } from "./config";
import { getFirebaseState, setFirebaseState } from "./state";

export const initializeFirebaseIfConfigured = () => {
  if (!isFirebaseConfigured) return;

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  setFirebaseState({ app });

  if (typeof window === "undefined") return;

  setFirebaseState({
    firestore: getFirestore(app),
    auth: getAuth(app),
  });

  void isSupported().then((supported) => {
    const { app: currentApp } = getFirebaseState();
    if (supported && currentApp) {
      setFirebaseState({ messaging: getMessaging(currentApp) });
    }
  });
};
