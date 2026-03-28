import { createHeaderMenuStateResult } from "@/hooks/headerMenuStateResult";

describe("createHeaderMenuStateResult", () => {
  it("menu state の公開 shape を返す", () => {
    const setIsMenuOpenAction = jest.fn();
    const closeMenu = jest.fn();

    expect(
      createHeaderMenuStateResult({
        isMenuOpen: true,
        setIsMenuOpenAction,
        closeMenu,
      }),
    ).toEqual({
      isMenuOpen: true,
      setIsMenuOpenAction,
      closeMenu,
    });
  });
});
