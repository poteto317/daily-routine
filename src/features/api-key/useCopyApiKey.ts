import { useCallback, useState } from "react";
import texts from "./locales/ja.json";

/**
 * 発行済みキーをクリップボードへコピーする。
 * 失敗時は onError にメッセージを渡し、成功時は onSuccess を呼ぶ
 * （呼び出し側が、前回のコピー失敗のエラーを消すために使う）。
 */
export const useCopyApiKey = (
  issuedKey: string | null,
  onError: (message: string) => void,
  onSuccess?: () => void,
) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!issuedKey) return;
    try {
      await navigator.clipboard.writeText(issuedKey);
      setCopied(true);
      onSuccess?.();
    } catch {
      // 成功表示（「コピーしました」）とエラーが同時に出ないようにする
      setCopied(false);
      onError(texts.errors.copy);
    }
  }, [issuedKey, onError, onSuccess]);

  const resetCopied = useCallback(() => setCopied(false), []);

  return { copied, handleCopy, resetCopied };
};
