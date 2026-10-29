"use client";

import { submitBugReport } from "../api";
import { validateBugReportInput } from "../helpers";
import { useBugReportInputState } from "./useBugReportInputState";
import { useBugReportSubmitStatus } from "./useBugReportSubmitStatus";
import texts from "../locales/ja.json";

type UseBugReportFormOptions = {
  /** 送信処理（テスト差し替え用）。 */
  submit?: (input: {
    description: string;
    stepsToReproduce: string;
  }) => Promise<string>;
};

/**
 * 不具合報告フォームのコーディネータフック。
 * 入力状態は useBugReportInputState に、送信ステータスは useBugReportSubmitStatus に委譲する。
 */
export const useBugReportForm = ({
  submit = submitBugReport,
}: UseBugReportFormOptions = {}) => {
  const input = useBugReportInputState();
  const submitStatus = useBugReportSubmitStatus();

  const handleSubmit = async () => {
    const validationError = validateBugReportInput({
      description: input.description,
      stepsToReproduce: input.stepsToReproduce,
    });
    if (validationError) {
      submitStatus.setStatus("error");
      submitStatus.setErrorMessage(texts.validation[validationError]);
      return;
    }

    submitStatus.setStatus("submitting");
    submitStatus.setErrorMessage("");
    try {
      await submit({
        description: input.description,
        stepsToReproduce: input.stepsToReproduce,
      });
      submitStatus.setStatus("success");
      input.resetInput();
    } catch {
      submitStatus.setStatus("error");
      submitStatus.setErrorMessage(texts.status.submitError);
    }
  };

  return {
    description: input.description,
    setDescription: input.setDescription,
    stepsToReproduce: input.stepsToReproduce,
    setStepsToReproduce: input.setStepsToReproduce,
    status: submitStatus.status,
    errorMessage: submitStatus.errorMessage,
    handleSubmit,
  };
};
