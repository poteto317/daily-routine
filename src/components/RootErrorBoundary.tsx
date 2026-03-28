"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import texts from "./locales/ja.json";
import { ERROR_MESSAGES } from "./constants";

type RootErrorBoundaryProps = {
  children: ReactNode;
};

type RootErrorBoundaryState = {
  hasError: boolean;
};

export class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  public state: RootErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(ERROR_MESSAGES.rootProviderError, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="p-6 text-sm text-gray-700 dark:text-gray-200"
          role="alert"
        >
          {texts.rootErrorBoundary.message}
        </div>
      );
    }

    return this.props.children;
  }
}
