import { useCallback, useState } from "react";
import { issueApiKey, revokeApiKeys } from "./apiKeyService";
import texts from "./locales/ja.json";

type Args = {
  hasKey: boolean | null;
  setHasKey: (value: boolean) => void;
  setIssuedKey: (key: string | null) => void;
  setError: (message: string | null) => void;
  /** 発行を開始する直前（確認ダイアログの承諾後）に呼ぶ */
  onIssueStart: () => void;
};

/** キーの発行（再発行を含む）と失効。実行中かどうかも管理する */
export const useApiKeyCommands = ({
  hasKey,
  setHasKey,
  setIssuedKey,
  setError,
  onIssueStart,
}: Args) => {
  const [isWorking, setIsWorking] = useState(false);

  /** 実行中フラグとエラー表示を管理しながら task を実行する。失敗時は errorMessage を出す */
  const run = useCallback(
    async (task: () => Promise<void>, errorMessage: string) => {
      setIsWorking(true);
      setError(null);
      try {
        await task();
      } catch {
        setError(errorMessage);
      } finally {
        setIsWorking(false);
      }
    },
    [setError],
  );

  const handleIssue = useCallback(async () => {
    if (hasKey && !confirm(texts.confirmReissue)) return;
    await run(async () => {
      onIssueStart();
      setIssuedKey(await issueApiKey());
      setHasKey(true);
    }, texts.errors.issue);
  }, [hasKey, run, onIssueStart, setIssuedKey, setHasKey]);

  const handleRevoke = useCallback(async () => {
    if (!confirm(texts.confirmRevoke)) return;
    await run(async () => {
      await revokeApiKeys();
      setHasKey(false);
      setIssuedKey(null);
    }, texts.errors.revoke);
  }, [run, setHasKey, setIssuedKey]);

  return { isWorking, handleIssue, handleRevoke };
};
