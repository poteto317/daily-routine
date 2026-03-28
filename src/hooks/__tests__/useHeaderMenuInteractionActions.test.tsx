import { act, renderHook } from "@testing-library/react";
import { handleMenuItemNavigationKey } from "@/hooks/header-menu-interaction/handleMenuItemNavigationKey";
import { createHeaderMenuInteractionActionsResult } from "@/hooks/headerMenuInteractionActionsResult";
import { useHeaderMenuInteractionActions } from "@/hooks/useHeaderMenuInteractionActions";

jest.mock(
  "@/hooks/header-menu-interaction/handleMenuItemNavigationKey",
  () => ({
    handleMenuItemNavigationKey: jest.fn(),
  }),
);

jest.mock("@/hooks/headerMenuInteractionActionsResult", () => ({
  createHeaderMenuInteractionActionsResult: jest.fn(),
}));

const mockHandleMenuItemNavigationKey =
  handleMenuItemNavigationKey as jest.MockedFunction<
    typeof handleMenuItemNavigationKey
  >;
const mockCreateHeaderMenuInteractionActionsResult =
  createHeaderMenuInteractionActionsResult as jest.MockedFunction<
    typeof createHeaderMenuInteractionActionsResult
  >;

describe("useHeaderMenuInteractionActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateHeaderMenuInteractionActionsResult.mockImplementation(
      (args) => args,
    );
  });

  it("メニュー操作と遷移・ログアウトを委譲する", () => {
    const setIsMenuOpenAction = jest.fn();
    const onNavigateAction = jest.fn();
    const onLogoutAction = jest.fn().mockResolvedValue(undefined);
    const markShouldRestoreFocus = jest.fn();
    const menuItemRefs = {
      current: [],
    } as React.MutableRefObject<Array<HTMLButtonElement | null>>;

    const { result } = renderHook(() =>
      useHeaderMenuInteractionActions({
        isMenuOpen: false,
        menuItemRefs,
        markShouldRestoreFocus,
        setIsMenuOpenAction,
        onNavigateAction,
        onLogoutAction,
      }),
    );

    expect(mockCreateHeaderMenuInteractionActionsResult).toHaveBeenCalledWith({
      closeMenu: expect.any(Function),
      handleMenuToggleClick: expect.any(Function),
      handleNavigateClick: expect.any(Function),
      handleLogoutClick: expect.any(Function),
      handleMenuItemKeyDown: expect.any(Function),
      handleMenuKeyDown: expect.any(Function),
    });

    act(() => {
      result.current.handleMenuToggleClick();
      result.current.handleNavigateClick("settings");
      result.current.handleLogoutClick();
      result.current.closeMenu();
    });

    expect(setIsMenuOpenAction).toHaveBeenCalledWith(true);
    expect(setIsMenuOpenAction).toHaveBeenLastCalledWith(false);
    expect(onNavigateAction).toHaveBeenCalledWith("settings");
    expect(onLogoutAction).toHaveBeenCalledTimes(1);
    expect(markShouldRestoreFocus).toHaveBeenCalled();
  });

  it("Escape キーとメニュー項目キー処理を委譲する", () => {
    const setIsMenuOpenAction = jest.fn();
    const markShouldRestoreFocus = jest.fn();
    const firstItem = { focus: jest.fn() } as unknown as HTMLButtonElement;
    const secondItem = { focus: jest.fn() } as unknown as HTMLButtonElement;
    const menuItemRefs = {
      current: [firstItem, secondItem],
    } as React.MutableRefObject<Array<HTMLButtonElement | null>>;

    const { result } = renderHook(() =>
      useHeaderMenuInteractionActions({
        isMenuOpen: true,
        menuItemRefs,
        markShouldRestoreFocus,
        setIsMenuOpenAction,
        onNavigateAction: jest.fn(),
        onLogoutAction: jest.fn().mockResolvedValue(undefined),
      }),
    );

    act(() => {
      result.current.handleMenuKeyDown({
        key: "Escape",
      } as React.KeyboardEvent<HTMLElement>);
      result.current.handleMenuItemKeyDown(
        { key: "ArrowDown" } as React.KeyboardEvent<HTMLButtonElement>,
        1,
      );
    });

    expect(setIsMenuOpenAction).toHaveBeenCalledWith(false);
    expect(mockHandleMenuItemNavigationKey).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({ key: "ArrowDown" }),
        currentIndex: 1,
        focusAtIndex: expect.any(Function),
      }),
    );
  });
});
