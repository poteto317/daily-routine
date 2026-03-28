import type { MutableRefObject } from "react";
import type { PageType } from "@/features/routine/pages/types";

type HomePopStateCallbackRefs = {
  showFormRef: MutableRefObject<boolean>;
  closeFormActionRef: MutableRefObject<() => void>;
  setCurrentPageActionRef: MutableRefObject<(page: PageType) => void>;
};

export const syncHomePopStateRefs = (params: {
  showForm: boolean;
  closeFormAction: () => void;
  setCurrentPageAction: (page: PageType) => void;
  refs: HomePopStateCallbackRefs;
}): void => {
  const { showForm, closeFormAction, setCurrentPageAction, refs } = params;

  refs.showFormRef.current = showForm;
  refs.closeFormActionRef.current = closeFormAction;
  refs.setCurrentPageActionRef.current = setCurrentPageAction;
};

export const handleHomePopState = (params: {
  state: unknown;
  refs: HomePopStateCallbackRefs;
  resolvePageFromHistoryState: (state: unknown) => PageType;
  saveCurrentPage: (page: PageType) => void;
}): void => {
  const { state, refs, resolvePageFromHistoryState, saveCurrentPage } = params;

  if (refs.showFormRef.current) {
    refs.closeFormActionRef.current();
    return;
  }

  const page = resolvePageFromHistoryState(state);
  refs.setCurrentPageActionRef.current(page);
  saveCurrentPage(page);
};
