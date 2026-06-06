"use client";

import { useState } from "react";

export type BugReportSubmitStatus = "idle" | "submitting" | "success" | "error";

export interface BugReportSubmitStatusState {
  status: BugReportSubmitStatus;
  errorMessage: string;
  setStatus: (status: BugReportSubmitStatus) => void;
  setErrorMessage: (message: string) => void;
}

export const useBugReportSubmitStatus = (): BugReportSubmitStatusState => {
  const [status, setStatus] = useState<BugReportSubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  return { status, errorMessage, setStatus, setErrorMessage };
};
