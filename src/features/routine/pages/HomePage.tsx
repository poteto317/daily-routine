"use client";

import { FullScreenLoading } from "@/components";
import { PageLayout } from "./PageLayout";
import { HomeContent } from "./HomeContent";
import { useHomePageViewModel } from "../hooks/helpers";
import { HOME_PAGE_TEXT } from "./homePagePresentation";

/** ホームページコンポーネント */
export const HomePage = () => {
  const { isHydrated, pageLayoutProps, contentViewModel } =
    useHomePageViewModel();

  if (!isHydrated)
    return <FullScreenLoading message={HOME_PAGE_TEXT.loading} />;

  return (
    <PageLayout {...pageLayoutProps}>
      <HomeContent {...contentViewModel} />
    </PageLayout>
  );
};
