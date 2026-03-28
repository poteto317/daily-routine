import { renderHook } from "@testing-library/react";

jest.mock("../useThemeInitializationEffect", () => ({
  useThemeInitializationEffect: jest.fn(),
}));

jest.mock("../useThemeAutoListenerEffect", () => ({
  useThemeAutoListenerEffect: jest.fn(),
}));

import { useThemeAutoListenerEffect } from "../useThemeAutoListenerEffect";
import { useThemeEffect } from "../useThemeEffect";
import { useThemeInitializationEffect } from "../useThemeInitializationEffect";

describe("useThemeEffect", () => {
  it("初期化 hook と auto listener hook を compose する", () => {
    renderHook(() => useThemeEffect());

    expect(useThemeInitializationEffect).toHaveBeenCalled();
    expect(useThemeAutoListenerEffect).toHaveBeenCalled();
  });
});
