import {
  getInitialPage,
  resolvePageFromHistoryState,
  resolvePageOrHome,
} from "../pageStatePersistence";

describe("pageStatePersistence", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("有効なページ文字列はそのまま返す", () => {
    expect(resolvePageOrHome("settings")).toBe("settings");
  });

  it("不正な値はhomeを返す", () => {
    expect(resolvePageOrHome("unknown")).toBe("home");
    expect(resolvePageOrHome(null)).toBe("home");
  });

  it("履歴stateからページを解決する", () => {
    expect(resolvePageFromHistoryState({ page: "calendar" })).toBe("calendar");
    expect(resolvePageFromHistoryState({ page: "unknown" })).toBe("home");
  });

  it("セッション未初期化時はhomeを返しセッションを初期化する", () => {
    localStorage.setItem("currentPage", "journal");

    expect(getInitialPage()).toBe("home");
    expect(sessionStorage.getItem("pageSessionInitialized")).toBe("1");
  });

  it("同一セッションでは保存済みページを復元する", () => {
    localStorage.setItem("currentPage", "journal");
    sessionStorage.setItem("pageSessionInitialized", "1");

    expect(getInitialPage()).toBe("journal");
  });
});
