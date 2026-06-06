import { collectBugReportMeta } from "../collectBugReportMeta";

describe("collectBugReportMeta", () => {
  const originalLanguage = navigator.language;

  afterEach(() => {
    Object.defineProperty(navigator, "language", {
      value: originalLanguage,
      configurable: true,
    });
  });

  it("ブラウザ環境からメタ情報を収集する", () => {
    Object.defineProperty(navigator, "language", {
      value: "ja-JP",
      configurable: true,
    });

    const meta = collectBugReportMeta();

    expect(meta.appVersion).toBeDefined();
    expect(typeof meta.userAgent).toBe("string");
    expect(meta.locale).toBe("ja-JP");
    expect(typeof meta.timezone).toBe("string");
    // ISO8601 形式であること
    expect(meta.createdAtClient).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    );
  });

  it("url は location.pathname を反映する", () => {
    const meta = collectBugReportMeta();
    expect(meta.url).toBe(window.location.pathname);
  });

  it("Intl.DateTimeFormat().resolvedOptions() が例外を投げる場合 timezone は空文字になる", () => {
    const originalIntl = global.Intl;
    global.Intl = {
      ...originalIntl,
      DateTimeFormat: jest.fn().mockReturnValue({
        resolvedOptions: () => { throw new Error("not supported"); },
      }) as unknown as typeof Intl.DateTimeFormat,
    };

    const meta = collectBugReportMeta();
    expect(meta.timezone).toBe("");

    global.Intl = originalIntl;
  });

  it("navigator が undefined の場合 userAgent と locale は空文字になる", () => {
    const originalNavigator = global.navigator;
    // @ts-expect-error: SSR 環境のシミュレーション
    delete global.navigator;

    const meta = collectBugReportMeta();
    expect(meta.userAgent).toBe("");
    expect(meta.locale).toBe("");

    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("url は window.location.href や origin ではなく pathname を返す", () => {
    const meta = collectBugReportMeta();
    // pathname のみ（クエリ・ハッシュ・origin は含まない）
    expect(meta.url).toBe(window.location.pathname);
    expect(meta.url).not.toContain("://");
  });
});
