import { renderHook } from "@testing-library/react";
import { createHeaderMenuControllerResult } from "@/hooks/headerMenuControllerResult";
import { useHeaderMenuController } from "@/hooks/useHeaderMenuController";
import { useHeaderMenuControllerActions } from "@/hooks/useHeaderMenuControllerActions";
import { useHeaderMenuNavigationAction } from "@/hooks/useHeaderMenuNavigationAction";
import { useHeaderMenuState } from "@/hooks/useHeaderMenuState";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

jest.mock("@/hooks/headerMenuControllerResult", () => ({
  createHeaderMenuControllerResult: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuState", () => ({
  useHeaderMenuState: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuNavigationAction", () => ({
  useHeaderMenuNavigationAction: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuControllerActions", () => ({
  useHeaderMenuControllerActions: jest.fn(),
}));

const mockUseHeaderMenuState = useHeaderMenuState as jest.MockedFunction<
  typeof useHeaderMenuState
>;
const mockUseHeaderMenuNavigationAction =
  useHeaderMenuNavigationAction as jest.MockedFunction<
    typeof useHeaderMenuNavigationAction
  >;
const mockUseHeaderMenuControllerActions =
  useHeaderMenuControllerActions as jest.MockedFunction<
    typeof useHeaderMenuControllerActions
  >;

describe("useHeaderMenuController", () => {
  const mockOnNavigateAction = jest.fn();
  const mockSignOut = jest.fn().mockResolvedValue(undefined);
  const mockSetIsMenuOpenAction = jest.fn();
  const mockCloseMenu = jest.fn();
  const mockNavigateAction = jest.fn();
  const mockLogoutAction = jest.fn().mockResolvedValue(undefined);
  const filteredMenuItems: HeaderMenuItem[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseHeaderMenuState.mockReturnValue({
      closeMenu: mockCloseMenu,
      isMenuOpen: false,
      setIsMenuOpenAction: mockSetIsMenuOpenAction,
    });
    mockUseHeaderMenuNavigationAction.mockReturnValue(mockNavigateAction);
    mockUseHeaderMenuControllerActions.mockReturnValue({
      filteredMenuItems,
      onLogoutAction: mockLogoutAction,
    });
  });

  it("state/navigation/actions hook を compose する", () => {
    const controllerResult = {
      isMenuOpen: false,
      setIsMenuOpenAction: mockSetIsMenuOpenAction,
      filteredMenuItems,
      onNavigateAction: mockNavigateAction,
      onLogoutAction: mockLogoutAction,
    };

    (createHeaderMenuControllerResult as jest.Mock).mockReturnValue(
      controllerResult,
    );

    const { result } = renderHook(() =>
      useHeaderMenuController({
        onNavigateAction: mockOnNavigateAction,
        isAdmin: true,
        signOut: mockSignOut,
      }),
    );

    expect(mockUseHeaderMenuNavigationAction).toHaveBeenCalledWith(
      mockOnNavigateAction,
      mockCloseMenu,
    );
    expect(mockUseHeaderMenuControllerActions).toHaveBeenCalledWith(
      false,
      true,
      mockSignOut,
      mockCloseMenu,
    );
    expect(createHeaderMenuControllerResult).toHaveBeenCalledWith({
      isMenuOpen: false,
      setIsMenuOpenAction: mockSetIsMenuOpenAction,
      filteredMenuItems,
      onNavigateAction: mockNavigateAction,
      onLogoutAction: mockLogoutAction,
    });
    expect(result.current).toBe(controllerResult);
  });
});
