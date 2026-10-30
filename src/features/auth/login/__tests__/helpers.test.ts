import {
  getLoginAlternativeToggleLabel,
  getLoginPageModeLabel,
  getLoginSubmitLabel,
} from "../helpers";

describe("login helpers", () => {
  it("getLoginPageModeLabel はモードに応じたラベルを返す", () => {
    expect(getLoginPageModeLabel(true)).toBe("新規アカウント作成");
    expect(getLoginPageModeLabel(false)).toBe("ログイン");
  });

  it("getLoginAlternativeToggleLabel は切り替え先のラベルを返す", () => {
    expect(getLoginAlternativeToggleLabel(true)).toBe(
      "既にアカウントをお持ちの方はこちら",
    );
    expect(getLoginAlternativeToggleLabel(false)).toBe("新規アカウントを作成");
  });

  describe("getLoginSubmitLabel", () => {
    it("読み込み中はモードに関わらず処理中", () => {
      expect(getLoginSubmitLabel(true, true)).toBe("処理中...");
      expect(getLoginSubmitLabel(true, false)).toBe("処理中...");
    });

    it("読み込み中でなければモードに応じたラベル", () => {
      expect(getLoginSubmitLabel(false, true)).toBe("アカウント作成");
      expect(getLoginSubmitLabel(false, false)).toBe("ログイン");
    });
  });
});
