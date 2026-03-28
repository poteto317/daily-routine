import type { Dispatch, SetStateAction } from "react";
import type { PageType } from "../pages/types";

type SetPage = Dispatch<SetStateAction<PageType>>;

export const syncCurrentPageState = (params: {
  currentPage: PageType;
  saveCurrentPage: (page: PageType) => void;
  replaceCurrentPageHistory: (page: PageType) => void;
}): void => {
  const { currentPage, saveCurrentPage, replaceCurrentPageHistory } = params;

  saveCurrentPage(currentPage);
  replaceCurrentPageHistory(currentPage);
};

export const applyPageChangeAction = (params: {
  page: PageType;
  pushCurrentPageHistory: (page: PageType) => void;
  setCurrentPage: SetPage;
}): void => {
  const { page, pushCurrentPageHistory, setCurrentPage } = params;

  pushCurrentPageHistory(page);
  setCurrentPage(page);
};
