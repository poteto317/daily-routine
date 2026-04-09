"use client";

import { Header } from "@/layouts";
import { type PageType } from "./types";
import { PAGE_COMPONENTS } from "./pageComponentResolver";
import { NavigationContextProvider } from "./NavigationContext";

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
  const PageComponent = PAGE_COMPONENTS[currentPage];

  return (
    <>
      <Header
        onNavigateAction={onNavigateAction}
        currentPage={currentPage}
        isEditMode={isEditMode}
        onToggleEditModeAction={onToggleEditModeAction}
      />
      {PageComponent ? (
        <NavigationContextProvider value={onNavigateAction}>
          <PageComponent />
        </NavigationContextProvider>
      ) : children}
    </>
  );
};
