import { useEffect } from "react";

type UseSyncSnapshotInitialLoadEffectArgs = {
  loadSnapshots: () => Promise<void>;
};

export const useSyncSnapshotInitialLoadEffect = ({
  loadSnapshots,
}: UseSyncSnapshotInitialLoadEffectArgs) => {
  useEffect(() => {
    void loadSnapshots();
  }, [loadSnapshots]);
};
