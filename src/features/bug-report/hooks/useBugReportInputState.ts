"use client";

import { useState, useCallback } from "react";

/** 不具合報告フォームの入力フィールド状態 */
export interface BugReportInputState {
  description: string;
  setDescription: (value: string) => void;
  stepsToReproduce: string;
  setStepsToReproduce: (value: string) => void;
  /** フィールドをすべて空文字にリセットする */
  resetInput: () => void;
}

/**
 * 不具合報告フォームの入力フィールド状態を管理するフック。
 * 送信ロジック・バリデーションは含まない（単一責任）。
 */
export const useBugReportInputState = (): BugReportInputState => {
  const [description, setDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");

  const resetInput = useCallback(() => {
    setDescription("");
    setStepsToReproduce("");
  }, []);

  return {
    description,
    setDescription,
    stepsToReproduce,
    setStepsToReproduce,
    resetInput,
  };
};
