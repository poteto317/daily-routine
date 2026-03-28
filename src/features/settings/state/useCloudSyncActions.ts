import { downloadFromFirestore, uploadToFirestore } from "@/features/sync";
import { CLOUD_SYNC_MESSAGES } from "../helpers/cloudSync";
import { createCloudSyncActionsResult } from "./cloudSyncActionsResult";

export const useCloudSyncActions = () => {
  const handleUploadToCloud = async () => {
    if (!confirm(CLOUD_SYNC_MESSAGES.confirmUpload)) {
      return;
    }

    try {
      await uploadToFirestore();
      alert(CLOUD_SYNC_MESSAGES.uploadSuccess);
    } catch (error) {
      console.error(error);
      alert(CLOUD_SYNC_MESSAGES.uploadError);
    }
  };

  const handleDownloadFromCloud = async () => {
    if (!confirm(CLOUD_SYNC_MESSAGES.confirmDownload)) {
      return;
    }

    try {
      await downloadFromFirestore();
    } catch (error) {
      console.error(error);
      alert(CLOUD_SYNC_MESSAGES.downloadError);
    }
  };

  return createCloudSyncActionsResult({
    handleUploadToCloud,
    handleDownloadFromCloud,
  });
};
