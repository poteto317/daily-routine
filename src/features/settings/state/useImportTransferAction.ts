import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { TransferOptions, TransferStatus } from "./constants";
import {
  getSelectedTypeLabels,
  importSelectedData,
} from "./dataTransferHelpers";
import { DATA_MANAGEMENT_MESSAGES } from "../helpers/dataManagement";
import {
  resetTransferInputValue,
  runImportTransfer,
} from "./dataTransferStateActions";

type UseImportTransferActionArgs = {
  importOptions: TransferOptions;
  setImportStatus: Dispatch<SetStateAction<TransferStatus>>;
};

export const useImportTransferAction = ({
  importOptions,
  setImportStatus,
}: UseImportTransferActionArgs) => {
  return async (event: ChangeEvent<HTMLInputElement>) => {
    const result = await runImportTransfer({
      file: event.target.files?.[0],
      importOptions,
      alertNoSelectionMessage: DATA_MANAGEMENT_MESSAGES.alertNoSelection,
      buildConfirmImportMessage: DATA_MANAGEMENT_MESSAGES.confirmImport,
      getSelectedTypeLabels,
      importSelectedData,
    });

    if (result.status !== "idle") {
      setImportStatus(result.status);
    }

    if (result.shouldReload) {
      setTimeout(() => window.location.reload(), 1000);
    }

    if (result.status === "error") {
      setTimeout(() => setImportStatus("idle"), 3000);
    }

    if (result.shouldClearInput) {
      resetTransferInputValue(event.target);
    }
  };
};
