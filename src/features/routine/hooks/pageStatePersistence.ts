import { VALID_PAGES, type PageType } from "@/features/routine/pages/types";

const CURRENT_PAGE_STORAGE_KEY = "currentPage";
const PAGE_SESSION_KEY = "pageSessionInitialized";

const isPageType = (value: unknown): value is PageType => {
  return typeof value === "string" && VALID_PAGES.includes(value as PageType);
};

export const resolvePageOrHome = (value: unknown): PageType => {
  if (isPageType(value)) {
    return value;
  }

  return "home";
};

export const getInitialPage = (): PageType => {
  if (typeof window === "undefined") return "home";

  const isSessionInitialized = sessionStorage.getItem(PAGE_SESSION_KEY) === "1";
  sessionStorage.setItem(PAGE_SESSION_KEY, "1");

  if (!isSessionInitialized) return "home";

  const savedPage = localStorage.getItem(CURRENT_PAGE_STORAGE_KEY);
  return resolvePageOrHome(savedPage);
};

export const resolvePageFromHistoryState = (state: unknown): PageType => {
  if (state && typeof state === "object" && "page" in state)
    return resolvePageOrHome(state.page);

  return "home";
};

export const saveCurrentPage = (page: PageType): void => {
  localStorage.setItem(CURRENT_PAGE_STORAGE_KEY, page);
};

export const replaceCurrentPageHistory = (page: PageType): void => {
  window.history.replaceState({ page }, "", window.location.pathname);
};

export const pushCurrentPageHistory = (page: PageType): void => {
  if (page !== "home") {
    window.history.pushState({ page }, "", `#${page}`);
  }
};
