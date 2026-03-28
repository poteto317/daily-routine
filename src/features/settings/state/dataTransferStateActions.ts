import type { MutableRefObject } from "react";
import type { TransferOptions, TransferStatus } from "./constants";
import type { ImportPayload } from "./dataTransferHelpers";

type RunExportTransferArgs = {
  exportOptions: TransferOptions;
  createExportData: (options: TransferOptions) => object;
  downloadExportData: (options: TransferOptions, data: object) => void;
};

type RunImportTransferArgs = {
  file?: { text: () => Promise<string> };
  importOptions: TransferOptions;
  alertNoSelectionMessage: string;
  buildConfirmImportMessage: (types: string[]) => string;
  getSelectedTypeLabels: (options: TransferOptions) => string[];
  importSelectedData: (data: ImportPayload, options: TransferOptions) => void;
  alertFn?: (message?: string) => void;
  confirmFn?: (message?: string) => boolean;
};

type ImportTransferResult = {
  status: TransferStatus;
  shouldReload: boolean;
  shouldClearInput: boolean;
};

export const runExportTransfer = ({
  exportOptions,
  createExportData,
  downloadExportData,
}: RunExportTransferArgs): TransferStatus => {
  try {
    downloadExportData(exportOptions, createExportData(exportOptions));
    return "success";
  } catch {
    return "error";
  }
};

export const triggerTransferFileSelection = (
  fileInputRef: MutableRefObject<HTMLInputElement | null>,
) => {
  fileInputRef.current?.click();
};

export const resetTransferInputValue = (target: { value: string }) => {
  target.value = "";
};

export const runImportTransfer = async ({
  file,
  importOptions,
  alertNoSelectionMessage,
  buildConfirmImportMessage,
  getSelectedTypeLabels,
  importSelectedData,
  alertFn = window.alert,
  confirmFn = window.confirm,
}: RunImportTransferArgs): Promise<ImportTransferResult> => {
  if (!file) {
    return {
      status: "idle",
      shouldReload: false,
      shouldClearInput: false,
    };
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const selectedTypes = getSelectedTypeLabels(importOptions);

    if (selectedTypes.length === 0) {
      alertFn(alertNoSelectionMessage);
      return {
        status: "idle",
        shouldReload: false,
        shouldClearInput: true,
      };
    }

    if (!confirmFn(buildConfirmImportMessage(selectedTypes))) {
      return {
        status: "idle",
        shouldReload: false,
        shouldClearInput: true,
      };
    }

    importSelectedData(data, importOptions);
    return {
      status: "success",
      shouldReload: true,
      shouldClearInput: true,
    };
  } catch {
    return {
      status: "error",
      shouldReload: false,
      shouldClearInput: true,
    };
  }
};

export type { ImportTransferResult };
