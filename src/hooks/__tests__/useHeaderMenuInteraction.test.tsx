import { renderHook } from "@testing-library/react";
import { createHeaderMenuInteractionResult } from "@/hooks/headerMenuInteractionResult";
import { useHeaderMenuFocusState } from "@/hooks/useHeaderMenuFocusState";
import { useHeaderMenuInteraction } from "@/hooks/useHeaderMenuInteraction";
import { useHeaderMenuInteractionActions } from "@/hooks/useHeaderMenuInteractionActions";

jest.mock("@/hooks/headerMenuInteractionResult", () => ({
  createHeaderMenuInteractionResult: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuFocusState", () => ({
  useHeaderMenuFocusState: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuInteractionActions", () => ({
  useHeaderMenuInteractionActions: jest.fn(),
}));

const mockUseHeaderMenuFocusState =
  useHeaderMenuFocusState as jest.MockedFunction<
    typeof useHeaderMenuFocusState
  >;
const mockUseHeaderMenuInteractionActions =
  useHeaderMenuInteractionActions as jest.MockedFunction<
    typeof useHeaderMenuInteractionActions
  >;

describe("useHeaderMenuInteraction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHeaderMenuFocusState.mockReturnValue({
      clearRestoreFocus: jest.fn(),
      markShouldRestoreFocus: jest.fn(),
      menuButtonRef: { current: null },
      menuItemRefs: { current: [] },
      setMenuItemRef: jest.fn(),
      shouldRestoreFocusRef: { current: false },
    });
    mockUseHeaderMenuInteractionActions.mockReturnValue({
      closeMenu: jest.fn(),
      handleMenuToggleClick: jest.fn(),
      handleNavigateClick: jest.fn(),
      handleLogoutClick: jest.fn(),
      handleMenuItemKeyDown: jest.fn(),
      handleMenuKeyDown: jest.fn(),
    });
  });

  it("focus state hook と interaction actions hook を compose する", () => {
    const setIsMenuOpenAction = jest.fn();
    const onNavigateAction = jest.fn();
    const onLogoutAction = jest.fn().mockResolvedValue(undefined);
    const focusState = {
      clearRestoreFocus: jest.fn(),
      markShouldRestoreFocus: jest.fn(),
      menuButtonRef: { current: null },
      menuItemRefs: { current: [] },
      setMenuItemRef: jest.fn(),
      shouldRestoreFocusRef: { current: false },
    };
    const actions = {
      closeMenu: jest.fn(),
      handleMenuToggleClick: jest.fn(),
      handleNavigateClick: jest.fn(),
      handleLogoutClick: jest.fn(),
      handleMenuItemKeyDown: jest.fn(),
      handleMenuKeyDown: jest.fn(),
    };
    const interactionResult = {
      menuButtonRef: focusState.menuButtonRef,
      setMenuItemRef: focusState.setMenuItemRef,
      ...actions,
    };

    mockUseHeaderMenuFocusState.mockReturnValue(focusState);
    mockUseHeaderMenuInteractionActions.mockReturnValue(actions);
    (createHeaderMenuInteractionResult as jest.Mock).mockReturnValue(
      interactionResult,
    );

    const { result } = renderHook(() =>
      useHeaderMenuInteraction({
        isMenuOpen: false,
        setIsMenuOpenAction,
        onNavigateAction,
        onLogoutAction,
      }),
    );

    expect(mockUseHeaderMenuFocusState).toHaveBeenCalledWith(false);
    expect(mockUseHeaderMenuInteractionActions).toHaveBeenCalledWith({
      isMenuOpen: false,
      menuItemRefs: focusState.menuItemRefs,
      markShouldRestoreFocus: focusState.markShouldRestoreFocus,
      setIsMenuOpenAction,
      onNavigateAction,
      onLogoutAction,
    });
    expect(createHeaderMenuInteractionResult).toHaveBeenCalledWith({
      menuButtonRef: focusState.menuButtonRef,
      setMenuItemRef: focusState.setMenuItemRef,
      ...actions,
    });
    expect(result.current).toBe(interactionResult);
  });
});
