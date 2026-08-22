import type { HomePageData } from "./homeTypes";
import type { PageLayoutProps } from "./PageLayout";
import { createHomePageLayoutProps } from "./pageViewModelActions";
import {
  createHomeContentViewModel,
  type HomeContentViewModel,
} from "./homeContentViewModel";

type HomePageLayoutProps = Pick<
  PageLayoutProps,
  "currentPage" | "isEditMode" | "onNavigateAction" | "onToggleEditModeAction"
>;

export type HomePageViewModel = {
  isHydrated: HomePageData["isHydrated"];
  pageLayoutProps: HomePageLayoutProps;
  contentViewModel: HomeContentViewModel;
};

export const createHomePageViewModel = (
  data: HomePageData,
): HomePageViewModel => ({
  isHydrated: data.isHydrated,
  pageLayoutProps: createHomePageLayoutProps(data),
  contentViewModel: createHomeContentViewModel(data),
});
