import {
  handleHomePopState,
  syncHomePopStateRefs,
} from "../homePopStateActions";

describe("homePopStateActions", () => {
  it("最新 callback refs を同期する", () => {
    const refs = {
      showFormRef: { current: false },
      closeFormActionRef: { current: jest.fn() },
      setCurrentPageActionRef: { current: jest.fn() },
    };
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();

    syncHomePopStateRefs({
      showForm: true,
      closeFormAction,
      setCurrentPageAction,
      refs,
    });

    expect(refs.showFormRef.current).toBe(true);
    expect(refs.closeFormActionRef.current).toBe(closeFormAction);
    expect(refs.setCurrentPageActionRef.current).toBe(setCurrentPageAction);
  });

  it("フォーム表示中は close を優先し、非表示時はページ復元する", () => {
    const closeFormAction = jest.fn();
    const setCurrentPageAction = jest.fn();
    const saveCurrentPage = jest.fn();

    const refs = {
      showFormRef: { current: true },
      closeFormActionRef: { current: closeFormAction },
      setCurrentPageActionRef: { current: setCurrentPageAction },
    };

    handleHomePopState({
      state: { page: "settings" },
      refs,
      resolvePageFromHistoryState: jest.fn(() => "settings"),
      saveCurrentPage,
    });

    expect(closeFormAction).toHaveBeenCalledTimes(1);
    expect(setCurrentPageAction).not.toHaveBeenCalled();
    expect(saveCurrentPage).not.toHaveBeenCalled();

    refs.showFormRef.current = false;

    handleHomePopState({
      state: { page: "settings" },
      refs,
      resolvePageFromHistoryState: jest.fn(() => "settings"),
      saveCurrentPage,
    });

    expect(setCurrentPageAction).toHaveBeenCalledWith("settings");
    expect(saveCurrentPage).toHaveBeenCalledWith("settings");
  });
});
