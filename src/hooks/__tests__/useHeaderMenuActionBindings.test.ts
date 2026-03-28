import { renderHook } from "@testing-library/react";
import { createHeaderMenuActionBindingsResult } from "@/hooks/headerMenuActionBindingsResult";
import { useHeaderLogout } from "@/hooks/useHeaderLogout";
import { useHeaderMenuActionBindings } from "@/hooks/useHeaderMenuActionBindings";
import { useHeaderMenuItems } from "@/hooks/useHeaderMenuItems";

jest.mock("@/hooks/headerMenuActionBindingsResult", () => ({
  createHeaderMenuActionBindingsResult: jest.fn(),
}));

jest.mock("@/hooks/useHeaderMenuItems", () => ({
  useHeaderMenuItems: jest.fn(),
}));

jest.mock("@/hooks/useHeaderLogout", () => ({
  useHeaderLogout: jest.fn(),
}));

const mockUseHeaderMenuItems = useHeaderMenuItems as jest.MockedFunction<
  typeof useHeaderMenuItems
>;
const mockUseHeaderLogout = useHeaderLogout as jest.MockedFunction<
  typeof useHeaderLogout
>;

describe("useHeaderMenuActionBindings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHeaderMenuActionBindingsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("menu items と logout handler を組み立てる", () => {
    const handleLogout = jest.fn();
    const filteredMenuItems = [{ id: "settings" }] as never;
    const signOut = jest.fn().mockResolvedValue(undefined);
    const closeMenu = jest.fn();
    const resultShape = {
      filteredMenuItems: [{ id: "settings" }] as never,
      onLogoutAction: jest.fn().mockResolvedValue(undefined),
      composed: true,
    };

    mockUseHeaderMenuItems.mockReturnValue(filteredMenuItems);
    mockUseHeaderLogout.mockReturnValue({ handleLogout });
    (createHeaderMenuActionBindingsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const { result } = renderHook(() =>
      useHeaderMenuActionBindings(true, true, signOut, closeMenu),
    );

    expect(mockUseHeaderMenuItems).toHaveBeenCalledWith(true, true);
    expect(mockUseHeaderLogout).toHaveBeenCalledWith({ signOut, closeMenu });
    expect(createHeaderMenuActionBindingsResult).toHaveBeenCalledWith({
      filteredMenuItems,
      onLogoutAction: handleLogout,
    });
    expect(result.current).toBe(resultShape);
  });
});
