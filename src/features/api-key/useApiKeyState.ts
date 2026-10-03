import { useCallback, useEffect, useState } from "react";
import { hasApiKey, issueApiKey, revokeApiKeys } from "./apiKeyService";
import texts from "./locales/ja.json";

export const useApiKeyState = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hasApiKey()
      .then((value) => {
        if (!cancelled) setHasKey(value);
      })
      .catch(() => {
        if (!cancelled) setError(texts.errors.load);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleIssue = useCallback(async () => {
    if (hasKey && !confirm(texts.confirmReissue)) return;
    setIsWorking(true);
    setError(null);
    setCopied(false);
    try {
      setIssuedKey(await issueApiKey());
      setHasKey(true);
    } catch {
      setError(texts.errors.issue);
    } finally {
      setIsWorking(false);
    }
  }, [hasKey]);

  const handleRevoke = useCallback(async () => {
    if (!confirm(texts.confirmRevoke)) return;
    setIsWorking(true);
    setError(null);
    try {
      await revokeApiKeys();
      setHasKey(false);
      setIssuedKey(null);
    } catch {
      setError(texts.errors.revoke);
    } finally {
      setIsWorking(false);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!issuedKey) return;
    try {
      await navigator.clipboard.writeText(issuedKey);
      setCopied(true);
    } catch {
      setError(texts.errors.copy);
    }
  }, [issuedKey]);

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
