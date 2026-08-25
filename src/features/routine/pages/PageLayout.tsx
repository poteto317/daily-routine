"use client";

import { Header } from "@/layouts";
import { type PageType } from "./types";
import { resolvePageContent } from "./pageComponentResolver";
import { NavigationContextProvider } from "./NavigationContext";
import { PageLoadErrorBoundary } from "./PageLoadErrorBoundary";

export interface PageLayoutProps {
  currentPage: PageType;
  isEditMode: boolean;
  onNavigateAction: (page: PageType) => void;
  onToggleEditModeAction: () => void;
  children?: React.ReactNode;
}

/**
 * ページレイアウトコンポーネント
 * ヘッダーとページコンテンツの切り替えを管理する
 */
export const PageLayout = ({
  currentPage,
  isEditMode,
  onNavigateAction,
  onToggleEditModeAction,
  children,
}: PageLayoutProps) => {
  const pageContent = resolvePageContent(currentPage);

  return (
    <>
      <Header
        onNavigateAction={onNavigateAction}
        currentPage={currentPage}
        isEditMode={isEditMode}
        onToggleEditModeAction={onToggleEditModeAction}
      />
      {pageContent ? (
        <PageLoadErrorBoundary
          key={currentPage}
          onNavigateHomeAction={() => onNavigateAction("home")}
        >
          <NavigationContextProvider value={onNavigateAction}>
            {pageContent}
          </NavigationContextProvider>
        </PageLoadErrorBoundary>
      ) : (
        children
      )}
    </>
  );
};
