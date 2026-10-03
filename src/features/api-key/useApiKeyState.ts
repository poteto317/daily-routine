import { useCallback, useState } from "react";
import texts from "./locales/ja.json";
import { useApiKeyCommands } from "./useApiKeyCommands";
import { useApiKeyPresence } from "./useApiKeyPresence";
import { useCopyApiKey } from "./useCopyApiKey";

/** 設定画面の API キー欄の状態。取得・発行/失効・コピーの各フックをつなぐ */
export const useApiKeyState = () => {
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLoadError = useCallback(() => setError(texts.errors.load), []);
  const { hasKey, setHasKey } = useApiKeyPresence({
    onLoadError: handleLoadError,
  });
  const { copied, handleCopy, resetCopied } = useCopyApiKey(
    issuedKey,
    setError,
  );
  const { isWorking, handleIssue, handleRevoke } = useApiKeyCommands({
    hasKey,
    setHasKey,
    setIssuedKey,
    setError,
    onIssueStart: resetCopied,
  });

  return {
    hasKey,
    issuedKey,
    isWorking,
    error,
    copied,
    handleIssue,
    handleRevoke,
    handleCopy,
  };
};
