import { useEffect, useRef, useState } from "react";
import { hasApiKey } from "./apiKeyService";

type Args = {
  /** 初回の取得に失敗したときに呼ぶ。参照が変わっても再取得はしない */
  onLoadError: () => void;
};

/**
 * マウント時に 1 回だけキーの発行有無を取得する。null は確認中。
 * 失敗したときはページの再読み込みで再取得する（エラー文言で案内する）。
 */
export const useApiKeyPresence = ({ onLoadError }: Args) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const onLoadErrorRef = useRef(onLoadError);

  useEffect(() => {
    onLoadErrorRef.current = onLoadError;
  }, [onLoadError]);

  useEffect(() => {
    let cancelled = false;
    hasApiKey()
      .then((value) => {
        if (!cancelled) setHasKey(value);
      })
      .catch(() => {
        if (!cancelled) onLoadErrorRef.current();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { hasKey, setHasKey };
};
