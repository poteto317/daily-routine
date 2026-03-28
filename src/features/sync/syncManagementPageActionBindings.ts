import type { SyncSnapshot } from "./sync";

type SetSnapshots = React.Dispatch<React.SetStateAction<SyncSnapshot[]>>;

type SyncManagementPageActionBindingsArgs = {
  setSnapshots: SetSnapshots;
};

export const createSyncManagementPageActionBindings = ({
  setSnapshots,
}: SyncManagementPageActionBindingsArgs) => {
  return {
    setSnapshots,
  };
};
