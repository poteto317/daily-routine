import {
  applyPageChangeAction,
  syncCurrentPageState,
} from "../pageNavigationStateActions";

describe("pageNavigationStateActions", () => {
  it("現在ページの保存と履歴置換を同期する", () => {
    const saveCurrentPage = jest.fn();
    const replaceCurrentPageHistory = jest.fn();

    syncCurrentPageState({
      currentPage: "calendar",
      saveCurrentPage,
      replaceCurrentPageHistory,
    });

    expect(saveCurrentPage).toHaveBeenCalledWith("calendar");
    expect(replaceCurrentPageHistory).toHaveBeenCalledWith("calendar");
  });

  it("ページ変更時に履歴 push と state 更新を行う", () => {
    const pushCurrentPageHistory = jest.fn();
    const setCurrentPage = jest.fn();

    applyPageChangeAction({
      page: "settings",
      pushCurrentPageHistory,
      setCurrentPage,
    });

    expect(pushCurrentPageHistory).toHaveBeenCalledWith("settings");
    expect(setCurrentPage).toHaveBeenCalledWith("settings");
  });
});
