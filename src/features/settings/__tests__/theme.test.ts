import { applyTheme } from "../state/theme";

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = (matches: boolean) => {
  const matchMedia = jest.fn().mockReturnValue({ matches });
  window.matchMedia = matchMedia;
  return matchMedia;
};

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("dark なら dark クラスを付ける（OS 設定は見ない）", () => {
    const matchMedia = mockMatchMedia(false);

    applyTheme("dark");

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it("light なら dark クラスを外す（OS 設定は見ない）", () => {
    const matchMedia = mockMatchMedia(true);
    document.documentElement.classList.add("dark");

    applyTheme("light");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(matchMedia).not.toHaveBeenCalled();
  });

  it("auto で OS がダークなら dark クラスを付ける", () => {
    const matchMedia = mockMatchMedia(true);

    applyTheme("auto");

    expect(matchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("auto で OS がライトなら dark クラスを外す", () => {
    mockMatchMedia(false);
    document.documentElement.classList.add("dark");

    applyTheme("auto");

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("未定義の値は auto と同じく OS 設定に従う", () => {
    // 型では起きないが、保存値が壊れていた場合の現状の振る舞いを固定する
    mockMatchMedia(true);
    applyTheme("unknown" as never);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    mockMatchMedia(false);
    applyTheme(undefined as never);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
