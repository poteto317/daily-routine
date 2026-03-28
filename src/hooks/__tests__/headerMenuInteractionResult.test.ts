import { createHeaderMenuInteractionResult } from "@/hooks/headerMenuInteractionResult";

describe("createHeaderMenuInteractionResult", () => {
  it("interaction の公開 shape を返す", () => {
    const menuButtonRef = { current: null };
    const setMenuItemRef = jest.fn();
    const closeMenu = jest.fn();
    const handleMenuToggleClick = jest.fn();
    const handleNavigateClick = jest.fn();
    const handleLogoutClick = jest.fn();
    const handleMenuItemKeyDown = jest.fn();
    const handleMenuKeyDown = jest.fn();

    const result = createHeaderMenuInteractionResult({
      menuButtonRef,
      setMenuItemRef,
      closeMenu,
      handleMenuToggleClick,
      handleNavigateClick,
      handleLogoutClick,
      handleMenuItemKeyDown,
      handleMenuKeyDown,
    });

    expect(result).toEqual({
      menuButtonRef,
      setMenuItemRef,
      closeMenu,
      handleMenuToggleClick,
      handleNavigateClick,
      handleLogoutClick,
      handleMenuItemKeyDown,
      handleMenuKeyDown,
    });
  });
});
