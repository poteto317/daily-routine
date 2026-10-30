/** @jest-environment node */
import {
  buildIssueBody,
  buildIssueContent,
  buildIssueTitle,
  sanitizeMention,
  stripTitlePrefix,
  ZERO_WIDTH_SPACE,
  DEFAULT_BUG_REPORT_LABELS,
  type BugReportContentSource,
  type IssueDraft,
} from "../buildIssueContent";

const baseReport: BugReportContentSource = {
  uid: "user-1",
  description: "通知が表示されない",
  meta: {
    appVersion: "0.1.0",
    userAgent: "Mozilla/5.0",
    url: "/settings",
    locale: "ja-JP",
    timezone: "Asia/Tokyo",
    createdAtClient: "2026-06-01T00:00:00.000Z",
  },
};

/** 対になっていない（孤立した）サロゲート */
const LONE_SURROGATE_PATTERN =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

describe("buildIssueTitle", () => {
  it("ユーザー入力タイトルがあればそれを使う", () => {
    expect(buildIssueTitle({ ...baseReport, title: "通知バグ" })).toBe(
      "通知バグ",
    );
  });

  it("タイトル未入力なら説明から要約タイトルを生成する", () => {
    expect(buildIssueTitle(baseReport)).toBe("[不具合報告] 通知が表示されない");
  });

  it("説明も空ならプレースホルダのみのタイトルにする", () => {
    expect(buildIssueTitle({ uid: "u", description: "" })).toBe("[不具合報告]");
  });
});

describe("buildIssueBody", () => {
  it("不具合内容・環境情報を含む", () => {
    const body = buildIssueBody(baseReport);
    expect(body).toContain("## 不具合の内容");
    expect(body).toContain("通知が表示されない");
    expect(body).toContain("## 環境情報");
    expect(body).toContain("アプリバージョン: 0.1.0");
    expect(body).toContain("user-1");
  });

  it("再現手順がある場合のみ再現手順セクションを含む", () => {
    expect(buildIssueBody(baseReport)).not.toContain("## 再現手順");
    const withSteps = buildIssueBody({
      ...baseReport,
      stepsToReproduce: "1. 開く\n2. 押す",
    });
    expect(withSteps).toContain("## 再現手順");
    expect(withSteps).toContain("1. 開く");
  });

  it("メタ情報が無い場合も本文を生成できる", () => {
    const body = buildIssueBody({ uid: "u", description: "x" });
    expect(body).toContain("(メタ情報なし)");
  });
});

describe("buildIssueContent", () => {
  it("タイトル・本文・既定ラベルを返す", () => {
    const content = buildIssueContent({ ...baseReport, title: "件名" });
    expect(content.title).toBe("件名");
    expect(content.body).toContain("通知が表示されない");
    expect(content.labels).toEqual(DEFAULT_BUG_REPORT_LABELS);
  });
});

describe("buildIssueTitle — スニペット長", () => {
  it("説明が50文字を超える場合はちょうど50文字でトリミングする", () => {
    const longDescription = "あ".repeat(60);
    const title = buildIssueTitle({ uid: "u", description: longDescription });
    expect(title).toBe(`[不具合報告] ${"あ".repeat(50)}`);
  });

  it("50 文字目がサロゲートペアの途中でも孤立サロゲートを残さない", () => {
    const title = buildIssueTitle({
      uid: "u",
      description: "a".repeat(49) + "😀後",
    });
    expect(title).not.toMatch(LONE_SURROGATE_PATTERN);
    expect(title).toBe(`[不具合報告] ${"a".repeat(49)}😀`);
  });
});

describe("buildIssueTitle — 空白のみのタイトル", () => {
  it("タイトルが空白のみの場合、説明から要約タイトルを生成する", () => {
    expect(
      buildIssueTitle({ uid: "u", description: "通知バグ", title: "   " }),
    ).toBe("[不具合報告] 通知バグ");
  });

  it("タイトル未入力かつ説明が空白のみの場合はプレースホルダのみを返す", () => {
    expect(buildIssueTitle({ uid: "u", description: "   " })).toBe(
      "[不具合報告]",
    );
  });
});

describe("buildIssueBody — 説明が空の場合", () => {
  it("説明が空のとき (記載なし) を表示する", () => {
    const body = buildIssueBody({ uid: "u", description: "" });
    expect(body).toContain("(記載なし)");
  });

  it("説明が空白のみのとき (記載なし) を表示する", () => {
    const body = buildIssueBody({ uid: "u", description: "   " });
    expect(body).toContain("(記載なし)");
  });
});

describe("buildIssueBody — stepsToReproduce の空文字・空白", () => {
  it("stepsToReproduce が空文字の場合は再現手順セクションを含まない", () => {
    const body = buildIssueBody({ ...baseReport, stepsToReproduce: "" });
    expect(body).not.toContain("## 再現手順");
  });

  it("stepsToReproduce が空白のみの場合は再現手順セクションを含まない", () => {
    const body = buildIssueBody({ ...baseReport, stepsToReproduce: "   " });
    expect(body).not.toContain("## 再現手順");
  });
});

describe("buildIssueTitle — 空白正規化", () => {
  it("description にタブ文字が含まれる場合、半角スペースに正規化される", () => {
    const title = buildIssueTitle({
      uid: "u",
      description: "通知が\t表示されない",
    });
    expect(title).toBe("[不具合報告] 通知が 表示されない");
    expect(title).not.toContain("\t");
  });
});

describe("ZERO_WIDTH_SPACE", () => {
  it("U+200B（1文字のゼロ幅スペース）である", () => {
    expect(ZERO_WIDTH_SPACE).toHaveLength(1);
    expect(ZERO_WIDTH_SPACE.charCodeAt(0)).toBe(0x200b);
  });
});

describe("sanitizeMention", () => {
  it("@ をゼロ幅スペース付きに置換する", () => {
    expect(sanitizeMention("@admin")).toBe(`@${ZERO_WIDTH_SPACE}admin`);
  });

  it("複数の @ を全て置換する", () => {
    expect(sanitizeMention("@foo と @bar")).toBe(
      `@${ZERO_WIDTH_SPACE}foo と @${ZERO_WIDTH_SPACE}bar`,
    );
  });

  it("@ が存在しない場合はそのまま返す", () => {
    expect(sanitizeMention("通知が表示されない")).toBe("通知が表示されない");
  });

  it("空文字はそのまま返す", () => {
    expect(sanitizeMention("")).toBe("");
  });
});

describe("buildIssueBody — @ メンション無害化", () => {
  it("description の @ をゼロ幅スペース付きに置換する", () => {
    const body = buildIssueBody({
      ...baseReport,
      description: "@admin に報告",
    });
    expect(body).toContain(`@${ZERO_WIDTH_SPACE}admin に報告`);
    expect(body).not.toMatch(/@admin/);
  });

  it("stepsToReproduce の @ をゼロ幅スペース付きに置換する", () => {
    const body = buildIssueBody({
      ...baseReport,
      stepsToReproduce: "1. @user を開く",
    });
    expect(body).toContain(`@${ZERO_WIDTH_SPACE}user を開く`);
    expect(body).not.toMatch(/@user/);
  });

  it("@ が存在しない場合は本文がそのまま出力される", () => {
    const body = buildIssueBody(baseReport);
    expect(body).toContain("通知が表示されない");
  });

  it("meta.userAgent の @ をゼロ幅スペース付きに置換する", () => {
    const body = buildIssueBody({
      ...baseReport,
      meta: { ...baseReport.meta!, userAgent: "Mozilla/5.0 @evil" },
    });
    expect(body).toContain(`Mozilla/5.0 @${ZERO_WIDTH_SPACE}evil`);
    expect(body).not.toMatch(/@evil/);
  });

  it("meta.url の @ をゼロ幅スペース付きに置換する", () => {
    const body = buildIssueBody({
      ...baseReport,
      meta: { ...baseReport.meta!, url: "/settings?ref=@org" },
    });
    expect(body).toContain(`/settings?ref=@${ZERO_WIDTH_SPACE}org`);
    expect(body).not.toMatch(/@org/);
  });

  it("meta の全フィールド（appVersion / locale / timezone / createdAtClient）で @ を置換する", () => {
    const body = buildIssueBody({
      ...baseReport,
      meta: {
        appVersion: "0.1.0-@beta",
        userAgent: "ua",
        url: "/",
        locale: "ja-JP@x",
        timezone: "Asia/Tokyo@x",
        createdAtClient: "2026-06-01@x",
      },
    });
    expect(body).toContain(`0.1.0-@${ZERO_WIDTH_SPACE}beta`);
    expect(body).toContain(`ja-JP@${ZERO_WIDTH_SPACE}x`);
    expect(body).toContain(`Asia/Tokyo@${ZERO_WIDTH_SPACE}x`);
    expect(body).toContain(`2026-06-01@${ZERO_WIDTH_SPACE}x`);
    expect(body).not.toMatch(/@beta|@x/);
  });

  it("uid の @ をゼロ幅スペース付きに置換する", () => {
    const body = buildIssueBody({ ...baseReport, uid: "user-@admin" });
    expect(body).toContain(`user-@${ZERO_WIDTH_SPACE}admin`);
    expect(body).not.toMatch(/user-@admin/);
  });
});

describe("buildIssueTitle — @ メンション無害化", () => {
  it("ユーザー入力タイトル内の @ をゼロ幅スペース付きに置換する", () => {
    expect(
      buildIssueTitle({ uid: "u", description: "d", title: "@admin 通知バグ" }),
    ).toBe(`@${ZERO_WIDTH_SPACE}admin 通知バグ`);
  });

  it("説明から生成される要約タイトル内の @ もゼロ幅スペース付きに置換する", () => {
    expect(
      buildIssueTitle({ uid: "u", description: "@admin 通知が表示されない" }),
    ).toBe(`[不具合報告] @${ZERO_WIDTH_SPACE}admin 通知が表示されない`);
  });

  it("タイトルが空白のみ＋説明に @ が含まれる場合は要約タイトル側で置換される", () => {
    expect(
      buildIssueTitle({ uid: "u", description: "@user バグ", title: "   " }),
    ).toBe(`[不具合報告] @${ZERO_WIDTH_SPACE}user バグ`);
  });
});

describe("stripTitlePrefix", () => {
  it.each([
    ["[不具合報告] 保存できない", "保存できない"],
    ["[不具合報告]保存できない", "保存できない"],
    ["[不具合報告]  保存できない", "保存できない"],
    ["[不具合報告]", ""],
    ["[不具合報告]  ", ""],
    ["保存 [不具合報告] 再発", "保存 [不具合報告] 再発"],
    ["保存できない", "保存できない"],
  ])("先頭の [不具合報告] と続く空白だけを取り除く (%s)", (title, expected) => {
    expect(stripTitlePrefix(title)).toBe(expected);
  });
  it.each([
    ["［不具合報告］ 保存できない", "保存できない"],
    ["【不具合報告】保存できない", "保存できない"],
    ["[不具合報告] [不具合報告] 保存できない", "保存できない"],
    ["[不具合報告]【不具合報告】", ""],
  ])("全角括弧の接頭辞も取り除く (%s)", (title, expected) => {
    expect(stripTitlePrefix(title)).toBe(expected);
  });
});

describe("buildIssueContent — Claude の整形結果（draft）あり", () => {
  const draft: IssueDraft = {
    title: "保存ボタンが反応しない",
    body: "## 不具合の内容\n\n押しても保存されない",
  };

  it("タイトルは draft のタイトルに [不具合報告] を前置する", () => {
    expect(buildIssueContent(baseReport, draft).title).toBe(
      "[不具合報告] 保存ボタンが反応しない",
    );
  });

  it("本文は draft の本文で始まり、元の説明を含まず、環境情報と整形の注記を付ける", () => {
    const body = buildIssueContent(baseReport, draft).body;
    expect(body.startsWith(draft.body)).toBe(true);
    expect(body).not.toContain(baseReport.description);
    expect(body).toContain("## 環境情報");
    expect(body).toContain("> 報告者 uid: user-1");
    expect(body).toContain(
      "> この Issue はアプリの不具合報告機能から自動生成され、Claude で整形されました。",
    );
    expect(body).not.toContain(
      "> この Issue はアプリの不具合報告機能から自動生成されました。",
    );
  });

  it("ラベルは既定ラベルを使う", () => {
    expect(buildIssueContent(baseReport, draft).labels).toEqual(
      DEFAULT_BUG_REPORT_LABELS,
    );
  });

  it("draft のタイトル中の改行・連続空白を 1 つの空白にまとめる", () => {
    const content = buildIssueContent(baseReport, {
      ...draft,
      title: "保存\nボタンが   反応しない",
    });
    expect(content.title).toBe("[不具合報告] 保存 ボタンが 反応しない");
  });

  it.each([
    "[不具合報告] 保存ボタンが反応しない",
    "[不具合報告]保存ボタンが反応しない",
    "  [不具合報告]  保存ボタンが反応しない",
  ])("draft のタイトル先頭の [不具合報告] は二重に付けない (%s)", (title) => {
    expect(buildIssueContent(baseReport, { ...draft, title }).title).toBe(
      "[不具合報告] 保存ボタンが反応しない",
    );
  });

  it("draft のタイトル途中の [不具合報告] は残す", () => {
    expect(
      buildIssueContent(baseReport, {
        ...draft,
        title: "保存 [不具合報告] 再発",
      }).title,
    ).toBe("[不具合報告] 保存 [不具合報告] 再発");
  });

  it("draft のタイトル・本文の @ をゼロ幅スペース付きに置換する", () => {
    const content = buildIssueContent(baseReport, {
      title: "@admin 宛て",
      body: "@user が押すと失敗する",
    });
    expect(content.title).toBe(`[不具合報告] @${ZERO_WIDTH_SPACE}admin 宛て`);
    expect(content.body).toContain(`@${ZERO_WIDTH_SPACE}user が押すと失敗する`);
    expect(content.body).not.toMatch(/@admin|@user/);
  });

  it("@ を多く含むタイトルでもサニタイズ後に 256 文字以内に切り詰める", () => {
    const content = buildIssueContent(baseReport, {
      ...draft,
      title: "@".repeat(200),
    });
    expect(Array.from(content.title).length).toBeLessThanOrEqual(256);
    expect(content.title.startsWith("[不具合報告] ")).toBe(true);
  });

  it("長い本文は 60,000 コードポイントに切り詰め、環境情報は残す", () => {
    const content = buildIssueContent(baseReport, {
      ...draft,
      body: "あ".repeat(70_000),
    });
    const [draftPart] = content.body.split("\n\n## 環境情報");
    expect(Array.from(draftPart).length).toBe(60_000);
    expect(content.body).toContain("## 環境情報");
  });

  it("サロゲートペアの多いタイトル・本文も途中で切らずに上限へ切り詰める", () => {
    const content = buildIssueContent(baseReport, {
      title: "😀".repeat(300),
      body: "😀".repeat(70_000),
    });
    const [draftPart] = content.body.split("\n\n## 環境情報");
    expect(Array.from(content.title).length).toBeLessThanOrEqual(256);
    expect(Array.from(draftPart).length).toBe(60_000);
    expect(content.title).not.toMatch(LONE_SURROGATE_PATTERN);
    expect(content.body).not.toMatch(LONE_SURROGATE_PATTERN);
  });

  it("draft が null なら従来の内容を返す", () => {
    const content = buildIssueContent(baseReport, null);
    expect(content.title).toBe("[不具合報告] 通知が表示されない");
    expect(content.body).toContain(
      "> この Issue はアプリの不具合報告機能から自動生成されました。",
    );
  });
});

describe("buildIssueContent — スクリーンショットセクション (IssueImageSection)", () => {
  const draft: IssueDraft = {
    title: "保存ボタンが反応しない",
    body: "## 不具合の内容\n\n押しても保存されない",
  };

  it("画像セクション未指定または { images: [], skippedCount: 0 } の場合は従来と完全に同じ本文になる", () => {
    const baseline = buildIssueContent(baseReport);
    const withEmptySection = buildIssueContent(baseReport, null, {
      images: [],
      skippedCount: 0,
    });
    expect(withEmptySection.body).toBe(baseline.body);
    expect(withEmptySection.body).not.toContain("## スクリーンショット");
  });

  it("従来の本文（draft なし）で画像 2 件がある場合、再現手順の後・環境情報の前に順番通り含まれる", () => {
    const reportWithSteps: BugReportContentSource = {
      ...baseReport,
      stepsToReproduce: "1. 設定を開く\n2. 保存を押す",
    };
    const content = buildIssueContent(reportWithSteps, null, {
      images: [
        { url: "https://example.test/img1.png" },
        { url: "https://example.test/img2.jpg" },
      ],
      skippedCount: 0,
    });

    const stepsIdx = content.body.indexOf("## 再現手順");
    const shotsIdx = content.body.indexOf("## スクリーンショット");
    const img1Idx = content.body.indexOf(
      "![スクリーンショット 1](https://example.test/img1.png)",
    );
    const img2Idx = content.body.indexOf(
      "![スクリーンショット 2](https://example.test/img2.jpg)",
    );
    const envIdx = content.body.indexOf("## 環境情報");

    expect(stepsIdx).toBeGreaterThanOrEqual(0);
    expect(shotsIdx).toBeGreaterThan(stepsIdx);
    expect(img1Idx).toBeGreaterThan(shotsIdx);
    expect(img2Idx).toBeGreaterThan(img1Idx);
    expect(envIdx).toBeGreaterThan(img2Idx);
    expect(content.body).not.toContain("取得できなかったため");
  });

  it("整形後の本文（draft あり）で画像 1 件がある場合、整形本文の後・環境情報の前にスクリーンショット節が入る", () => {
    const content = buildIssueContent(baseReport, draft, {
      images: [{ url: "https://example.test/shot.png" }],
      skippedCount: 0,
    });

    expect(content.body.startsWith(draft.body)).toBe(true);
    expect(content.body).not.toContain(baseReport.description);
    const shotsIdx = content.body.indexOf("## スクリーンショット");
    const envIdx = content.body.indexOf("## 環境情報");
    expect(shotsIdx).toBeGreaterThan(0);
    expect(envIdx).toBeGreaterThan(shotsIdx);
    expect(content.body).toContain(
      "![スクリーンショット 1](https://example.test/shot.png)",
    );
  });

  it("skippedCount が 1 以上で画像 0 件の場合は取得失敗の注記のみを含める", () => {
    const content = buildIssueContent(baseReport, null, {
      images: [],
      skippedCount: 2,
    });

    expect(content.body).toContain("## スクリーンショット");
    expect(content.body).toContain(
      "（添付された画像 2 枚を取得できなかったため掲載していません）",
    );
    expect(content.body).not.toContain("![スクリーンショット");
  });

  it("画像 1 件 + skippedCount 2 の場合は画像と注記の両方を含める", () => {
    const content = buildIssueContent(baseReport, draft, {
      images: [{ url: "https://example.test/ok.png" }],
      skippedCount: 2,
    });

    expect(content.body).toContain("## スクリーンショット");
    expect(content.body).toContain(
      "![スクリーンショット 1](https://example.test/ok.png)",
    );
    expect(content.body).toContain(
      "（添付された画像 2 枚を取得できなかったため掲載していません）",
    );
  });

  it("画像 URL に @ が含まれる場合は sanitizeMention でゼロ幅スペースが挿入される", () => {
    const content = buildIssueContent(baseReport, null, {
      images: [{ url: "https://example.test/@evil/shot.png" }],
      skippedCount: 0,
    });

    expect(content.body).toContain(
      `![スクリーンショット 1](https://example.test/@${ZERO_WIDTH_SPACE}evil/shot.png)`,
    );
    expect(content.body).not.toMatch(/@evil/);
  });
});
