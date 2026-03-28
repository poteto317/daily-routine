import { useCallback } from "react";
import { getSyncSnapshots, type SyncSnapshot } from "./sync";
import texts from "./locales/ja.json";

type SetSnapshots = React.Dispatch<React.SetStateAction<SyncSnapshot[]>>;
type SetLoading = React.Dispatch<React.SetStateAction<boolean>>;
type SetError = React.Dispatch<React.SetStateAction<string | null>>;

type UseSyncSnapshotLoadActionArgs = {
  setError: SetError;
  setIsLoading: SetLoading;
  setSnapshots: SetSnapshots;
};

export const useSyncSnapshotLoadAction = ({
  setError,
  setIsLoading,
  setSnapshots,
}: UseSyncSnapshotLoadActionArgs) => {
  return useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setSnapshots(await getSyncSnapshots());
    } catch {
      setError(texts.snapshotManager.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [setError, setIsLoading, setSnapshots]);
};
