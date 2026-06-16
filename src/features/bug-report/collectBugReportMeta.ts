import { APP_VERSION } from "./constants";
import type { BugReportMeta } from "./types";

/**
 * 報告時に自動収集するメタ情報をブラウザ環境から取得する。
 * SSR などブラウザ API が無い環境でも安全に動作するようガードする。
 * 個人情報は含めず最小限の情報のみを収集する。
 */
export const collectBugReportMeta = (): BugReportMeta => {
  const hasNavigator = typeof navigator !== "undefined";
  const hasWindow = typeof window !== "undefined";

  let timezone = "";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    timezone = "";
  }

  return {
    appVersion: APP_VERSION,
    userAgent: hasNavigator ? navigator.userAgent : "",
    url: hasWindow ? window.location.pathname : "",
    locale: hasNavigator ? navigator.language : "",
    timezone,
    createdAtClient: new Date().toISOString(),
  };
};
