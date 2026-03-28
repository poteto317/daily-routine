import { useRef } from "react";
import { triggerTransferFileSelection } from "./dataTransferStateActions";

export const useImportTransferFileInput = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    triggerTransferFileSelection(fileInputRef);
  };

  return {
    fileInputRef,
    handleImportClick,
  };
};
