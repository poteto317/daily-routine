import { downloadFromFirestore, uploadToFirestore } from "@/features/sync";

export type HeaderSyncResult = "uploaded" | "downloaded" | "failed" | "skipped";

type RunSyncActionArgs = {
  isSyncing: boolean;
  run: () => Promise<void>;
  successResult: Exclude<HeaderSyncResult, "failed" | "skipped">;
};

export const runHeaderSyncAction = async ({
  isSyncing,
  run,
  successResult,
}: RunSyncActionArgs): Promise<HeaderSyncResult> => {
  if (isSyncing) {
    return "skipped";
  }

  try {
    await run();
    return successResult;
  } catch {
    return "failed";
  }
};

export const runHeaderUpload = async (
  isSyncing: boolean,
): Promise<HeaderSyncResult> => {
  return runHeaderSyncAction({
    isSyncing,
    run: () => uploadToFirestore(),
    successResult: "uploaded",
  });
};

export const runHeaderDownload = async (
  isSyncing: boolean,
): Promise<HeaderSyncResult> => {
  return runHeaderSyncAction({
    isSyncing,
    run: () => downloadFromFirestore({ reload: false }),
    successResult: "downloaded",
  });
};
