import { isFirebaseConfigured } from "@/lib/firebase";
import { ApiKeyPanel } from "./ApiKeyPanel";

/**
 * 設定画面の API キー欄。
 * キーの保存先が Firestore のため、Firebase 未設定（ローカルモード）では表示しない。
 */
export const ApiKeySection = () =>
  isFirebaseConfigured ? <ApiKeyPanel /> : null;
