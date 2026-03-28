import { useHomePageData } from "./useHomePageData";
import {
  createHomePageViewModel,
  type HomePageViewModel,
} from "../pages/helpers";

export const useHomePageViewModel = (): HomePageViewModel => {
  return createHomePageViewModel(useHomePageData());
};
