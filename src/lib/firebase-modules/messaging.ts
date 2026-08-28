import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getFcmServiceWorkerRegistration } from "@/hooks/serviceWorkerRegistration";
import { getFirebaseState } from "./state";
import { FirebaseError } from "./error";
import texts from "../locales/ja.json";
import {
  getPermissionDeniedMessage,
  getTokenRetrievalFailedMessage,
} from "../helpers";

export const getFCMToken = async (): Promise<string> => {
  const { messaging } = getFirebaseState();

  if (!messaging) {
    throw new FirebaseError(
      texts.firebaseMessaging.notInitialized,
      "messaging-not-available",
    );
  }

  // Firebase MessagingのgetTokenは未選択時に権限要求するため、
  // 呼び出し元に関係なくSDKへ到達する前に非要求型の前提条件を検証する。
  const permission =
    typeof Notification === "undefined" ? "denied" : Notification.permission;
  if (permission !== "granted") {
    throw new FirebaseError(
      getPermissionDeniedMessage(permission),
      "permission-denied",
    );
  }

  try {
    // 画面を制御しているのはアプリ本体の SW のため、ready では FCM の登録を
    // 取れない。FCM 用スコープの登録を明示的に引く
    const registration = await getFcmServiceWorkerRegistration();

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new FirebaseError(
        texts.firebaseMessaging.tokenFailed,
        "token-not-generated",
      );
    }

    return token;
  } catch (error) {
    if (error instanceof FirebaseError) throw error;

    throw new FirebaseError(
      getTokenRetrievalFailedMessage(
        error instanceof Error
          ? error.message
          : texts.firebaseMessaging.unknownError,
      )
        .replace(/firebase/gi, "")
        .replace(/FCM/g, "")
        .trim(),
      "token-retrieval-failed",
    );
  }
};

export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void,
): (() => void) | null => {
  const { messaging } = getFirebaseState();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
