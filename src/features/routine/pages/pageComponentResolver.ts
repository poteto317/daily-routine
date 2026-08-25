import { createElement, type ReactElement } from "react";
import { PAGE_COMPONENTS } from "./pageComponentRegistry";
import type { PageType } from "./types";

export const resolvePageContent = (
  page: PageType,
): ReactElement | undefined => {
  if (page === "home") return undefined;

  return createElement(PAGE_COMPONENTS[page]);
};
