import { renderHook } from "@testing-library/react";
import { createHeaderMenuControllerActionsResult } from "@/hooks/headerMenuControllerActionsResult";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useHeaderMenuActionBindings } from "@/hooks/useHeaderMenuActionBindings";
import { useHeaderMenuControllerActions } from "@/hooks/useHeaderMenuControllerActions";

jest.mock("@/hooks/headerMenuControllerActionsResult", () => ({
  createHeaderMenuControllerActionsResult: jest.fn(),
}));

jest.mock("@/hooks/useBodyScrollLock", () => ({
  useBodyScrollLock: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuActionBindings", () => ({
  useHeaderMenuActionBindings: jest.fn(),
}));

const mockUseBodyScrollLock = useBodyScrollLock as jest.MockedFunction<
  typeof useBodyScrollLock
>;
const mockUseHeaderMenuActionBindings =
  useHeaderMenuActionBindings as jest.MockedFunction<
    typeof useHeaderMenuActionBindings
  >;

describe("useHeaderMenuControllerActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHeaderMenuControllerActionsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("menu action hook を compose して body scroll lock を適用する", () => {
    const handleLogout = jest.fn();
    const filteredMenuItems = [{ id: "settings" }] as never;
    const signOut = jest.fn().mockResolvedValue(undefined);
    const closeMenu = jest.fn();
    const resultShape = {
      filteredMenuItems: [{ id: "settings" }] as never,
      onLogoutAction: jest.fn().mockResolvedValue(undefined),
      composed: true,
    };

    mockUseHeaderMenuActionBindings.mockReturnValue({
      filteredMenuItems,
      onLogoutAction: handleLogout,
    });
    (createHeaderMenuControllerActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useHeaderMenuControllerActions(true, true, signOut, closeMenu),
    );

    expect(mockUseHeaderMenuActionBindings).toHaveBeenCalledWith(
      true,
      true,
      signOut,
      closeMenu,
    );
    expect(mockUseBodyScrollLock).toHaveBeenCalledWith(true);
    expect(createHeaderMenuControllerActionsResult).toHaveBeenCalledWith({
      filteredMenuItems,
      onLogoutAction: handleLogout,
    });
    expect(result.current).toBe(resultShape);
  });
});
