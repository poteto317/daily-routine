import type { ChangeEvent, RefObject } from "react";
import type { TransferOptions, TransferStatus } from "../state/constants";
import {
  getExportButtonViewState,
  getImportButtonViewState,
} from "../helpers/dataManagement";
import { DataOptionList } from "./DataOptionList";
import texts from "../locales/ja.json";

type Props = {
  exportOptions: TransferOptions;
  setExportOptions: (options: TransferOptions) => void;
  importOptions: TransferOptions;
  setImportOptions: (options: TransferOptions) => void;
  exportStatus: TransferStatus;
  importStatus: TransferStatus;
  handleExport: () => void;
  handleImportClick: () => void;
  handleImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

export const DataManagementSection = ({
  exportOptions,
  setExportOptions,
  importOptions,
  setImportOptions,
  exportStatus,
  importStatus,
  handleExport,
  handleImportClick,
  handleImport,
  fileInputRef,
}: Props) => {
  const exportButton = getExportButtonViewState(
    exportStatus,
    importStatus,
    exportOptions,
  );
  const importButton = getImportButtonViewState(importStatus, importOptions);

  return (
    <div className="pt-6 border-t border-gray-200 dark:border-gray-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-black mb-4">
        {texts.dataManagement.title}
      </h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-3">
            {texts.dataManagement.exportTitle}
          </h4>
          <DataOptionList
            options={exportOptions}
            setOptions={setExportOptions}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={exportButton.disabled}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${exportButton.className}`}
          >
            {exportButton.label}
          </button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-800 mb-3">
            {texts.dataManagement.importTitle}
          </h4>
          <DataOptionList
            options={importOptions}
            setOptions={setImportOptions}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            disabled={importStatus === "success"}
          />
          <button
            type="button"
            onClick={handleImportClick}
            disabled={importButton.disabled}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${importButton.className}`}
          >
            {importButton.label}
          </button>
          <div className="text-xs text-red-600 dark:text-red-700 font-medium mt-2">
            {texts.dataManagement.importWarningMessage}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-600 space-y-1 p-3 bg-blue-50 dark:bg-blue-100 rounded-lg">
          <p className="font-medium text-gray-700 dark:text-gray-800">
            {texts.dataManagement.hintTitle}
          </p>
          {texts.dataManagement.hintItems.map((item: string) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
};
