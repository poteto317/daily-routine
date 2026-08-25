"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { PageLoadErrorFallback } from "./PageLoadErrorFallback";

type PageLoadErrorBoundaryProps = {
  children: ReactNode;
  onNavigateHomeAction: () => void;
};

type PageLoadErrorBoundaryState = {
  hasError: boolean;
};

export class PageLoadErrorBoundary extends Component<
  PageLoadErrorBoundaryProps,
  PageLoadErrorBoundaryState
> {
  public state: PageLoadErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): PageLoadErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Feature page rendering failed", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <PageLoadErrorFallback
          onNavigateHomeAction={this.props.onNavigateHomeAction}
        />
      );
    }

    return this.props.children;
  }
}
