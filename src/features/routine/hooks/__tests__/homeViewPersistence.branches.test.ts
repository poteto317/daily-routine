import {
  getStoredFilterCategory,
  getStoredIsEditMode,
  getStoredViewMode,
  saveFilterCategory,
  saveIsEditMode,
  saveViewMode,
} from "../homeViewPersistence";

describe("homeViewPersistence の分岐", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getStoredFilterCategory", () => {
    // 未保存・不正値も all になるため、保存値 all の読み取りは結果だけでは区別できない。
    // 保存された "all" を読んでも all のままであることだけを確かめる
    it("保存値 all は all のまま", () => {
      localStorage.setItem("filterCategory", "all");

      expect(getStoredFilterCategory()).toBe("all");
    });

    it("有効なカテゴリが保存されていればそれを返す", () => {
      localStorage.setItem("filterCategory", "health");

      expect(getStoredFilterCategory()).toBe("health");
    });

    it("未保存・空文字は all", () => {
      expect(getStoredFilterCategory()).toBe("all");

      localStorage.setItem("filterCategory", "");
      expect(getStoredFilterCategory()).toBe("all");
    });
  });

  describe("getStoredViewMode", () => {
    it("未保存なら当日曜日", () => {
      expect(getStoredViewMode(false, 4)).toBe(4);
    });

    it("0〜6 の保存値はその曜日", () => {
      localStorage.setItem("viewMode", "0");
      expect(getStoredViewMode(false, 4)).toBe(0);

      localStorage.setItem("viewMode", "6");
      expect(getStoredViewMode(false, 4)).toBe(6);
    });

    it("範囲外（-1・7）は当日曜日", () => {
      localStorage.setItem("viewMode", "-1");
      expect(getStoredViewMode(false, 4)).toBe(4);

      localStorage.setItem("viewMode", "7");
      expect(getStoredViewMode(false, 4)).toBe(4);
    });

    it("数値でない壊れた値は当日曜日", () => {
      localStorage.setItem("viewMode", "abc");
      expect(getStoredViewMode(false, 4)).toBe(4);

      localStorage.setItem("viewMode", "");
      expect(getStoredViewMode(false, 4)).toBe(4);
    });

    it("holiday が保存されていて祝日でない日は当日曜日", () => {
      localStorage.setItem("viewMode", "holiday");

      expect(getStoredViewMode(false, 2)).toBe(2);
    });

    it("祝日の日は未保存でも holiday", () => {
      expect(getStoredViewMode(true, 2)).toBe("holiday");
    });

    it("数字で始まる壊れた値は先頭の数字として読む", () => {
      // 現状: parseInt の仕様で "3abc" → 3, "1.5" → 1 になる（厳密な検証はしていない）
      localStorage.setItem("viewMode", "3abc");
      expect(getStoredViewMode(false, 4)).toBe(3);

      localStorage.setItem("viewMode", "1.5");
      expect(getStoredViewMode(false, 4)).toBe(1);
    });
  });

  describe("getStoredIsEditMode", () => {
    it("true・壊れた値は編集モード（false だけが非編集）", () => {
      localStorage.setItem("isEditMode", "true");
      expect(getStoredIsEditMode()).toBe(true);

      localStorage.setItem("isEditMode", "garbage");
      expect(getStoredIsEditMode()).toBe(true);
    });
  });

  describe("保存", () => {
    it("viewMode は数値を文字列で保存する", () => {
      saveViewMode(3);

      expect(localStorage.getItem("viewMode")).toBe("3");
    });

    it("isEditMode は true を文字列で保存する", () => {
      saveIsEditMode(true);

      expect(localStorage.getItem("isEditMode")).toBe("true");
    });

    it("保存した値を読み戻せる", () => {
      saveFilterCategory("health");
      saveViewMode(5);

      expect(getStoredFilterCategory()).toBe("health");
      expect(getStoredViewMode(false, 0)).toBe(5);
    });
  });

  describe("localStorage の例外", () => {
    // 現状: 読み書きとも try/catch が無く、localStorage が例外を投げると呼び出し元へ伝わる
    // （既定値には戻らない）。既定値へ戻す意図なら本体の修正が必要（報告の要確認）
    it("読み取りの例外はそのまま投げる", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(() => getStoredFilterCategory()).toThrow("denied");
      expect(() => getStoredViewMode(false, 1)).toThrow("denied");
      expect(() => getStoredIsEditMode()).toThrow("denied");
    });

    it("祝日の日は読み取りに触れないので例外でも holiday", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("denied");
      });

      expect(getStoredViewMode(true, 1)).toBe("holiday");
    });

    it("書き込みの例外はそのまま投げる", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("quota");
      });

      expect(() => saveFilterCategory("all")).toThrow("quota");
      expect(() => saveViewMode(1)).toThrow("quota");
      expect(() => saveIsEditMode(false)).toThrow("quota");
    });
  });
});
