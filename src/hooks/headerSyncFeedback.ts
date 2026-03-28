import { getHeaderSyncFeedbackMessage } from "./headerSyncMessages";
import { reloadAfterDownload } from "./headerSyncReload";
import type { HeaderSyncResult } from "./useHeaderSync";

type ApplyHeaderSyncFeedbackParams = {
  result: HeaderSyncResult;
  showAlert?: (message: string) => void;
  reload?: () => void;
};

export const applyHeaderSyncFeedback = ({
  result,
  showAlert = (message) => alert(message),
  reload = reloadAfterDownload,
}: ApplyHeaderSyncFeedbackParams): void => {
  const message = getHeaderSyncFeedbackMessage(result);

  if (message === null) {
    return;
  }

  showAlert(message);

  if (result === "downloaded") {
    reload();
  }
};
