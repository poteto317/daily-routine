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

    try {
      const meta = collectBugReportMeta();
      expect(meta.timezone).toBe("");
    } finally {
      global.Intl = originalIntl;
    }
  });

  it("navigator が undefined の場合 userAgent と locale は空文字になる", () => {
    const originalNavigator = global.navigator;
    // @ts-expect-error: SSR 環境のシミュレーション
    delete global.navigator;

    try {
      const meta = collectBugReportMeta();
      expect(meta.userAgent).toBe("");
      expect(meta.locale).toBe("");
    } finally {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
    }
  });

  it("url は window.location.href や origin ではなく pathname を返す", () => {
    const meta = collectBugReportMeta();
    // pathname のみ（クエリ・ハッシュ・origin は含まない）
    expect(meta.url).toBe(window.location.pathname);
    expect(meta.url).not.toContain("://");
  });

  it("Intl 例外のテストで Intl が復元されているため後続テストに副作用が残らない", () => {
    // 前のテストで global.Intl をモックしたが、try/finally で復元されているため
    // 通常の Intl.DateTimeFormat が機能することを確認する。
    const meta = collectBugReportMeta();
    // jsdom 環境ではタイムゾーンは "UTC" または環境依存の文字列が返る
    expect(typeof meta.timezone).toBe("string");
    // Intl.DateTimeFormat が再びネイティブ実装で動くことを直接確認
    expect(() => Intl.DateTimeFormat().resolvedOptions().timeZone).not.toThrow();
  });

  it("navigator 削除テストの後 navigator が復元されているため後続テストに副作用が残らない", () => {
    // 前のテストで global.navigator を delete したが、try/finally で復元されているため
    // navigator 経由のメタ収集が再び機能することを確認する。
    const meta = collectBugReportMeta();
    expect(typeof meta.userAgent).toBe("string");
    expect(typeof meta.locale).toBe("string");
    expect(typeof navigator).toBe("object");
  });
});
