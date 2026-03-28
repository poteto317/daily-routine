import {
  closeHeaderMenu,
  handleHeaderMenuEscapeKey,
  logoutFromHeaderMenu,
  navigateFromHeaderMenu,
  syncHeaderMenuFocus,
  toggleHeaderMenu,
} from "@/hooks/headerMenuInteractionActions";

describe("headerMenuInteractionActions", () => {
  it("メニュー展開時は先頭メニュー項目へ focus する", () => {
    const firstItem = { focus: jest.fn() };
    const menuButton = { focus: jest.fn() };
    const clearRestoreFocus = jest.fn();

    syncHeaderMenuFocus({
      isMenuOpen: true,
      menuItemElements: [firstItem],
      menuButtonElement: menuButton,
      shouldRestoreFocus: true,
      clearRestoreFocus,
    });

    expect(firstItem.focus).toHaveBeenCalledTimes(1);
    expect(menuButton.focus).not.toHaveBeenCalled();
    expect(clearRestoreFocus).not.toHaveBeenCalled();
  });

  it("メニュークローズ時に focus 復帰が必要ならトグルへ戻す", () => {
    const menuButton = { focus: jest.fn() };
    const clearRestoreFocus = jest.fn();

    syncHeaderMenuFocus({
      isMenuOpen: false,
      menuItemElements: [],
      menuButtonElement: menuButton,
      shouldRestoreFocus: true,
      clearRestoreFocus,
    });

    expect(menuButton.focus).toHaveBeenCalledTimes(1);
    expect(clearRestoreFocus).toHaveBeenCalledTimes(1);
  });

  it("close は focus 復帰フラグを立ててメニューを閉じる", () => {
    const markShouldRestoreFocus = jest.fn();
    const setIsMenuOpenAction = jest.fn();

    closeHeaderMenu({ markShouldRestoreFocus, setIsMenuOpenAction });

    expect(markShouldRestoreFocus).toHaveBeenCalledTimes(1);
    expect(setIsMenuOpenAction).toHaveBeenCalledWith(false);
  });

  it("toggle は開いていれば閉じ、閉じていれば開く", () => {
    const markShouldRestoreFocus = jest.fn();
    const setIsMenuOpenAction = jest.fn();

    toggleHeaderMenu({
      isMenuOpen: false,
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });
    expect(setIsMenuOpenAction).toHaveBeenCalledWith(true);

    toggleHeaderMenu({
      isMenuOpen: true,
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });
    expect(markShouldRestoreFocus).toHaveBeenCalledTimes(1);
    expect(setIsMenuOpenAction).toHaveBeenLastCalledWith(false);
  });

  it("navigate と logout は focus 復帰フラグを立てて委譲する", async () => {
    const markShouldRestoreFocus = jest.fn();
    const onNavigateAction = jest.fn();
    const onLogoutAction = jest.fn().mockResolvedValue(undefined);

    navigateFromHeaderMenu({
      page: "settings",
      markShouldRestoreFocus,
      onNavigateAction,
    });
    logoutFromHeaderMenu({
      markShouldRestoreFocus,
      onLogoutAction,
    });

    expect(markShouldRestoreFocus).toHaveBeenCalledTimes(2);
    expect(onNavigateAction).toHaveBeenCalledWith("settings");
    expect(onLogoutAction).toHaveBeenCalledTimes(1);
  });

  it("Escape キーだけが close を発火する", () => {
    const markShouldRestoreFocus = jest.fn();
    const setIsMenuOpenAction = jest.fn();

    handleHeaderMenuEscapeKey({
      event: { key: "Enter" },
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });

    expect(setIsMenuOpenAction).not.toHaveBeenCalled();

    handleHeaderMenuEscapeKey({
      event: { key: "Escape" },
      markShouldRestoreFocus,
      setIsMenuOpenAction,
    });

    expect(markShouldRestoreFocus).toHaveBeenCalledTimes(1);
    expect(setIsMenuOpenAction).toHaveBeenCalledWith(false);
  });
});
