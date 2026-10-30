"use client";

import { useRef } from "react";
import { submitBugReport } from "../api";
import { validateBugReportInput } from "../helpers";
import { useBugReportImages } from "./useBugReportImages";
import { useBugReportInputState } from "./useBugReportInputState";
import { useBugReportSubmitStatus } from "./useBugReportSubmitStatus";
import texts from "../locales/ja.json";

type UseBugReportFormOptions = {
  /** 送信処理（テスト差し替え用）。 */
  submit?: (
    input: {
      description: string;
      stepsToReproduce: string;
    },
    images: readonly File[],
  ) => Promise<string>;
};

/**
 * 不具合報告フォームのコーディネータフック。
 * 入力状態は useBugReportInputState に、画像添付は useBugReportImages に、
 * 送信ステータスは useBugReportSubmitStatus に委譲する。
 */
export const useBugReportForm = ({
  submit = submitBugReport,
}: UseBugReportFormOptions = {}) => {
  const input = useBugReportInputState();
  const imageAttachments = useBugReportImages();
  const submitStatus = useBugReportSubmitStatus();
  const isSubmittingRef = useRef(false);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    const validationError = validateBugReportInput({
      description: input.description,
      stepsToReproduce: input.stepsToReproduce,
    });
    if (validationError) {
      submitStatus.setStatus("error");
      submitStatus.setErrorMessage(texts.validation[validationError]);
      return;
    }

    isSubmittingRef.current = true;
    submitStatus.setStatus("submitting");
    submitStatus.setErrorMessage("");
    try {
      await submit(
        {
          description: input.description,
          stepsToReproduce: input.stepsToReproduce,
        },
        imageAttachments.images,
      );
      submitStatus.setStatus("success");
      input.resetInput();
      imageAttachments.clearImages();
    } catch {
      submitStatus.setStatus("error");
      submitStatus.setErrorMessage(texts.status.submitError);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return {
    description: input.description,
    setDescription: input.setDescription,
    stepsToReproduce: input.stepsToReproduce,
    setStepsToReproduce: input.setStepsToReproduce,
    imageAttachments,
    status: submitStatus.status,
    errorMessage: submitStatus.errorMessage,
    handleSubmit,
  };
};
