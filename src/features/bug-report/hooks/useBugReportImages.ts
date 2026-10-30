"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type BugReportImageError,
  selectBugReportImages,
} from "../imageSelection";

export interface BugReportImageAttachments {
  images: File[];
  previews: string[];
  errors: BugReportImageError[];
  addImages: (files: readonly File[]) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
}

interface ImageItem {
  readonly file: File;
  readonly previewUrl: string;
}

/**
 * 不具合報告に添付する画像の選択状態・プレビュー URL・エラーを管理するフック。
 * プレビュー URL はイベントハンドラ本体で生成し、setState updater 内では副作用を実行しない（L-467）。
 * removeImage / clearImages およびアンマウント時に解放する。
 */
export const useBugReportImages = (): BugReportImageAttachments => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [errors, setErrors] = useState<BugReportImageError[]>([]);
  const itemsRef = useRef<ImageItem[]>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const addImages = useCallback((incoming: readonly File[]) => {
    const current = itemsRef.current;
    const currentFiles = current.map((item) => item.file);
    const result = selectBugReportImages(currentFiles, incoming);
    setErrors(result.errors);
    if (result.next.length === current.length) {
      return;
    }
    const addedFiles = result.next.slice(current.length);
    const addedItems = addedFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    const next = [...current, ...addedItems];
    itemsRef.current = next;
    setItems(next);
  }, []);

  const removeImage = useCallback((index: number) => {
    const current = itemsRef.current;
    if (index < 0 || index >= current.length) {
      return;
    }
    const target = current[index];
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const next = current.filter((_, i) => i !== index);
    itemsRef.current = next;
    setItems(next);
    setErrors((prev) => prev.filter((err) => err !== "tooMany"));
  }, []);

  const clearImages = useCallback(() => {
    const current = itemsRef.current;
    current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    itemsRef.current = [];
    setItems([]);
    setErrors([]);
  }, []);

  return {
    images: items.map((item) => item.file),
    previews: items.map((item) => item.previewUrl),
    errors,
    addImages,
    removeImage,
    clearImages,
  };
};
