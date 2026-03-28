import { useState } from "react";

export const useSyncSnapshotActiveState = () => {
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);

  return {
    activeSnapshotId,
    setActiveSnapshotId,
  };
};
