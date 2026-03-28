import { usePreloadWeather } from "@/features/weather/usePreloadWeather";
import { useFirebaseSync } from "./useFirebaseSync";
import { useHomePopState } from "./useHomePopState";
import type { PageType } from "../pages/types";

export type HomePageEffectsInput = {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
};

export const useHomePageEffects = ({
  showForm,
  closeFormAction,
  setCurrentPageAction,
}: HomePageEffectsInput) => {
  useFirebaseSync();
  usePreloadWeather();
  useHomePopState({
    showForm,
    closeFormAction,
    setCurrentPageAction,
  });
};
