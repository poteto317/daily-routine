import {
  buildIssueBody,
  buildIssueContent,
  buildIssueTitle,
  sanitizeMention,
  ZERO_WIDTH_SPACE,
  DEFAULT_BUG_REPORT_LABELS,
  type BugReportContentSource,
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
    const title = buildIssueTitle({ uid: "u", description: "通知が\t表示されない" });
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
    expect(sanitizeMention("@foo と @bar")).toBe(`@${ZERO_WIDTH_SPACE}foo と @${ZERO_WIDTH_SPACE}bar`);
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
    const body = buildIssueBody({ ...baseReport, description: "@admin に報告" });
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
