import {
  getRawUnscopedStorageItem,
  getUnscopedStorageItem,
  setUnscopedStorageItem,
} from "@/lib/storage/core";
import { DEVICE_ID_KEY } from "./constants";
import { createDeviceId } from "./localDataHelpers";

/**
 * デバイス ID を取得する。
 * 未保存の場合は新規生成して保存する。
 * 旧形式（JSON エンコードなし）で保存されている場合は JSON 形式に移行する。
 */
export const getDeviceId = (): string => {
  // JSON 形式で保存された値を試みる
  // getUnscopedStorageItem は型パラメータを検証しないため、typeof で実行時型保証する
  const stored = getUnscopedStorageItem<unknown>(DEVICE_ID_KEY, "");
  let deviceId = typeof stored === "string" ? stored : "";

  // 後方互換: 旧形式（生文字列）が残っている場合はそのまま採用して JSON 形式へ移行
  if (!deviceId) {
    const raw = getRawUnscopedStorageItem(DEVICE_ID_KEY);
    if (raw && !raw.startsWith('"')) {
      // raw が JSON プリミティブ（null/number/boolean 等）の場合は破損値とみなし再生成に委ねる。
      // JSON.parse が例外を投げる場合のみ旧形式の生文字列として扱う。
      try {
        JSON.parse(raw);
        // 成功 = JSON プリミティブ → 旧形式ではなく破損値、何もしない
      } catch {
        // 失敗 = 非 JSON な生文字列 → 旧形式デバイス ID
        deviceId = raw;
        setUnscopedStorageItem(DEVICE_ID_KEY, deviceId, {
          skipLocalDataUpdatedAt: true,
        });
      }
    }
  }

  if (!deviceId) {
    deviceId = createDeviceId();
    setUnscopedStorageItem(DEVICE_ID_KEY, deviceId, {
      skipLocalDataUpdatedAt: true,
    });
  }

  return deviceId;
};
