import { createHash } from "crypto";

/** API キーの形式: drk_ + 32 バイト乱数の base64url（43 文字）。クライアントの生成側と一致させる */
export const API_KEY_PATTERN = /^drk_[A-Za-z0-9_-]{43}$/;

/** apiKeys のドキュメント ID にする、キーの SHA-256 小文字 hex（UTF-8） */
export const hashApiKey = (key: string): string =>
  createHash("sha256").update(key, "utf8").digest("hex");
