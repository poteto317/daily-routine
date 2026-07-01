import { getActionBarMode } from "../todoListActionStatusBarMode";
import type { ActionBarMode } from "../todoListActionStatusBarMode";

describe("getActionBarMode", () => {
  describe("hasSelection=true のとき", () => {
    it("hasClipboard=false でも 'selection' を返す", () => {
      expect(getActionBarMode(true, false)).toBe<ActionBarMode>("selection");
    });

    it("hasClipboard=true でも 'selection' を優先して返す", () => {
      expect(getActionBarMode(true, true)).toBe<ActionBarMode>("selection");
    });
  });

  describe("hasSelection=false のとき", () => {
    it("hasClipboard=true なら 'clipboard' を返す", () => {
      expect(getActionBarMode(false, true)).toBe<ActionBarMode>("clipboard");
    });

    it("hasClipboard=false なら 'none' を返す", () => {
      expect(getActionBarMode(false, false)).toBe<ActionBarMode>("none");
    });
  });

  describe("優先順序", () => {
    it("selection > clipboard > none の優先順序を持つ", () => {
      expect(getActionBarMode(true, true)).toBe("selection");
      expect(getActionBarMode(false, true)).toBe("clipboard");
      expect(getActionBarMode(false, false)).toBe("none");
    });
  });

  describe("返り値の型", () => {
    it("常に 'selection' | 'clipboard' | 'none' のいずれかを返す", () => {
      const validModes: ActionBarMode[] = ["selection", "clipboard", "none"];
      const cases: [boolean, boolean][] = [
        [true, true],
        [true, false],
        [false, true],
        [false, false],
      ];
      for (const [hasSelection, hasClipboard] of cases) {
        expect(validModes).toContain(getActionBarMode(hasSelection, hasClipboard));
      }
    });
  });
});
