import { useCallback, useState } from "react";
import texts from "./locales/ja.json";

/** 発行済みキーをクリップボードへコピーする。失敗時は onError にメッセージを渡す */
export const useCopyApiKey = (
  issuedKey: string | null,
  onError: (message: string) => void,
) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!issuedKey) return;
    try {
      await navigator.clipboard.writeText(issuedKey);
      setCopied(true);
    } catch {
      onError(texts.errors.copy);
    }
  }, [issuedKey, onError]);

  const resetCopied = useCallback(() => setCopied(false), []);

  return { copied, handleCopy, resetCopied };
};
