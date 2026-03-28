import { createHeaderMenuControllerResult } from "@/hooks/headerMenuControllerResult";
import type { HeaderMenuItem } from "@/hooks/useHeaderMenuItems";

describe("createHeaderMenuControllerResult", () => {
  it("controller の公開 shape を返す", async () => {
    const setIsMenuOpenAction = jest.fn();
    const onNavigateAction = jest.fn();
    const onLogoutAction = jest.fn().mockResolvedValue(undefined);
    const filteredMenuItems: HeaderMenuItem[] = [];

    const result = createHeaderMenuControllerResult({
      isMenuOpen: true,
      setIsMenuOpenAction,
      filteredMenuItems,
      onNavigateAction,
      onLogoutAction,
    });

    expect(result).toEqual({
      isMenuOpen: true,
      setIsMenuOpenAction,
      filteredMenuItems,
      onNavigateAction,
      onLogoutAction,
    });

    result.onNavigateAction("home");
    await result.onLogoutAction();

    expect(onNavigateAction).toHaveBeenCalledWith("home");
    expect(onLogoutAction).toHaveBeenCalledTimes(1);
  });
});
