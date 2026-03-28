import { createHeaderMenuInteractionActionsResult } from "@/hooks/headerMenuInteractionActionsResult";

describe("createHeaderMenuInteractionActionsResult", () => {
  it("interaction actions の公開 shape を返す", () => {
    const closeMenu = jest.fn();
    const handleMenuToggleClick = jest.fn();
    const handleNavigateClick = jest.fn();
    const handleLogoutClick = jest.fn();
    const handleMenuItemKeyDown = jest.fn();
    const handleMenuKeyDown = jest.fn();

    expect(
      createHeaderMenuInteractionActionsResult({
        closeMenu,
        handleMenuToggleClick,
        handleNavigateClick,
        handleLogoutClick,
        handleMenuItemKeyDown,
        handleMenuKeyDown,
      }),
    ).toEqual({
      closeMenu,
      handleMenuToggleClick,
      handleNavigateClick,
      handleLogoutClick,
      handleMenuItemKeyDown,
      handleMenuKeyDown,
    });
  });
});
