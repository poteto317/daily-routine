import type { HomePageData } from "../pages/homeTypes";
import { useHomePageDependencies } from "./useHomePageDependencies";
import { useHomePageEffects } from "./useHomePageEffects";

export const useHomePageData = (): HomePageData => {
  const { homePageData, showForm, closeFormAction, setCurrentPageAction } =
    useHomePageDependencies();

  useHomePageEffects({
    showForm,
    closeFormAction,
    setCurrentPageAction,
  });

  return homePageData;
};
