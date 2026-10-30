import { renderHook } from "@testing-library/react";

jest.mock("@/lib/storage", () => ({
  getSettings: jest.fn(),
}));

import { getSettings } from "@/lib/storage";
import { useThemeInitializationEffect } from "../useThemeInitializationEffect";

const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;

describe("useThemeInitializationEffect", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    document.documentElement.className = "";
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("dark theme を適用する", () => {
    mockGetSettings.mockReturnValue({ theme: "dark" } as never);
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    renderHook(() => useThemeInitializationEffect());

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("auto theme で dark preference を反映する", () => {
    mockGetSettings.mockReturnValue({ theme: "auto" } as never);
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    renderHook(() => useThemeInitializationEffect());

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
