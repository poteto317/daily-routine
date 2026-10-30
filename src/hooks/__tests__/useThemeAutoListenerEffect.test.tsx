import { act, renderHook } from "@testing-library/react";

jest.mock("@/lib/storage", () => ({
  getSettings: jest.fn(),
}));

import { getSettings } from "@/lib/storage";
import { useThemeAutoListenerEffect } from "../useThemeAutoListenerEffect";

const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;

describe("useThemeAutoListenerEffect", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.className = "";
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("auto theme のときだけ media query change を反映する", () => {
    let changeHandler: (() => void) | null = null;
    const addEventListener = jest.fn((_: string, handler: () => void) => {
      changeHandler = handler;
    });
    const removeEventListener = jest.fn();
    const mediaQuery = {
      matches: true,
      addEventListener,
      removeEventListener,
    };
    window.matchMedia = jest.fn().mockReturnValue(mediaQuery);
    mockGetSettings.mockReturnValue({ theme: "auto" } as never);

    const { unmount } = renderHook(() => useThemeAutoListenerEffect());

    act(() => {
      changeHandler?.();
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    document.documentElement.className = "";
    mockGetSettings.mockReturnValue({ theme: "light" } as never);

    act(() => {
      changeHandler?.();
    });

    expect(document.documentElement.className).toBe("");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("change", changeHandler);
  });
});
