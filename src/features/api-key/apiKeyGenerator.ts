export const API_KEY_PREFIX = "drk_";
const KEY_BYTE_LENGTH = 32;

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** サーバー（firebase-functions/src/agentApi/apiKey.ts）の API_KEY_PATTERN と同じ形式 */
export const generateApiKey = (): string => {
  const bytes = new Uint8Array(KEY_BYTE_LENGTH);
  crypto.getRandomValues(bytes);
  return `${API_KEY_PREFIX}${toBase64Url(bytes)}`;
};

/** サーバーの hashApiKey と同値（UTF-8 の SHA-256 を小文字 hex にする） */
export const hashApiKey = async (key: string): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};
