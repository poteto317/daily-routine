import { act, renderHook } from "@testing-library/react";
import { createHeaderMenuStateResult } from "@/hooks/headerMenuStateResult";
import { useHeaderMenuState } from "@/hooks/useHeaderMenuState";

jest.mock("@/hooks/headerMenuStateResult", () => ({
  createHeaderMenuStateResult: jest.fn(),
}));

describe("useHeaderMenuState", () => {
  beforeEach(() => {
    (createHeaderMenuStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("open state と closeMenu を管理する", () => {
    const { result } = renderHook(() => useHeaderMenuState());

    expect(createHeaderMenuStateResult).toHaveBeenCalledWith({
      isMenuOpen: false,
      setIsMenuOpenAction: expect.any(Function),
      closeMenu: expect.any(Function),
    });

    expect(result.current.isMenuOpen).toBe(false);

    act(() => {
      result.current.setIsMenuOpenAction(true);
    });

    expect(result.current.isMenuOpen).toBe(true);
    expect(createHeaderMenuStateResult).toHaveBeenLastCalledWith({
      isMenuOpen: true,
      setIsMenuOpenAction: expect.any(Function),
      closeMenu: expect.any(Function),
    });

    act(() => {
      result.current.closeMenu();
    });

    expect(result.current.isMenuOpen).toBe(false);
    expect(createHeaderMenuStateResult).toHaveBeenLastCalledWith({
      isMenuOpen: false,
      setIsMenuOpenAction: expect.any(Function),
      closeMenu: expect.any(Function),
    });
  });
});
