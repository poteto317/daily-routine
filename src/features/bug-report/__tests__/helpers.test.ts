import { validateBugReportInput, buildBugReportPayload } from "../helpers";
import type { BugReportMeta } from "../types";

describe("validateBugReportInput", () => {
  it("説明が入力されていれば null を返す", () => {
    expect(
      validateBugReportInput({ description: "通知が出ない" }),
    ).toBeNull();
  });

  it("説明が空なら descriptionRequired を返す", () => {
    expect(validateBugReportInput({ description: "" })).toBe(
      "descriptionRequired",
    );
  });

  it("説明が空白のみなら descriptionRequired を返す", () => {
    expect(validateBugReportInput({ description: "   \n  " })).toBe(
      "descriptionRequired",
    );
  });

  it("説明が2000文字を超えると descriptionTooLong を返す", () => {
    expect(
      validateBugReportInput({ description: "あ".repeat(2001) }),
    ).toBe("descriptionTooLong");
  });

  it("タイトルが100文字を超えると titleTooLong を返す", () => {
    expect(
      validateBugReportInput({
        title: "あ".repeat(101),
        description: "本文",
      }),
    ).toBe("titleTooLong");
  });

  it("再現手順が2000文字を超えると stepsTooLong を返す", () => {
    expect(
      validateBugReportInput({
        description: "本文",
        stepsToReproduce: "あ".repeat(2001),
      }),
    ).toBe("stepsTooLong");
  });

  it("再現手順がちょうど2000文字なら null を返す（境界値）", () => {
    expect(
      validateBugReportInput({
        description: "本文",
        stepsToReproduce: "あ".repeat(2000),
      }),
    ).toBeNull();
  });

  it("説明の前後の空白はトリムして判定する", () => {
    expect(
      validateBugReportInput({ description: "  問題あり  " }),
    ).toBeNull();
  });

  it("タイトルがちょうど100文字なら null を返す（境界値）", () => {
    expect(
      validateBugReportInput({
        title: "あ".repeat(100),
        description: "本文",
      }),
    ).toBeNull();
  });

  it("説明がちょうど2000文字なら null を返す（境界値）", () => {
    expect(
      validateBugReportInput({ description: "あ".repeat(2000) }),
    ).toBeNull();
  });
});

describe("buildBugReportPayload", () => {
  const meta: BugReportMeta = {
    appVersion: "1.0.0",
    userAgent: "test-agent",
    url: "/test",
    locale: "ja",
    timezone: "Asia/Tokyo",
    createdAtClient: "2024-01-01T00:00:00.000Z",
  };

  it("uid / status / meta を正しく設定する", () => {
    const payload = buildBugReportPayload(
      { description: "問題が発生" },
      "user-123",
      meta,
    );
    expect(payload.uid).toBe("user-123");
    expect(payload.status).toBe("pending");
    expect(payload.meta).toEqual(meta);
  });

  it("description をトリムして設定する", () => {
    const payload = buildBugReportPayload(
      { description: "  前後スペース  " },
      "uid",
      meta,
    );
    expect(payload.description).toBe("前後スペース");
  });

  it("title が undefined の場合は空文字を設定する", () => {
    const payload = buildBugReportPayload({ description: "説明" }, "uid", meta);
    expect(payload.title).toBe("");
  });

  it("title が指定された場合はトリムして設定する", () => {
    const payload = buildBugReportPayload(
      { title: "  タイトル  ", description: "説明" },
      "uid",
      meta,
    );
    expect(payload.title).toBe("タイトル");
  });

  it("stepsToReproduce が undefined の場合は空文字を設定する", () => {
    const payload = buildBugReportPayload({ description: "説明" }, "uid", meta);
    expect(payload.stepsToReproduce).toBe("");
  });

  it("stepsToReproduce が指定された場合はトリムして設定する", () => {
    const payload = buildBugReportPayload(
      { description: "説明", stepsToReproduce: "  手順  " },
      "uid",
      meta,
    );
    expect(payload.stepsToReproduce).toBe("手順");
  });

  it("stepsToReproduce が空白のみの場合は空文字を設定する", () => {
    const payload = buildBugReportPayload(
      { description: "説明", stepsToReproduce: "   " },
      "uid",
      meta,
    );
    expect(payload.stepsToReproduce).toBe("");
  });

  it("返り値に createdAt / updatedAt が含まれない（純粋関数）", () => {
    const payload = buildBugReportPayload({ description: "説明" }, "uid", meta);
    expect(payload).not.toHaveProperty("createdAt");
    expect(payload).not.toHaveProperty("updatedAt");
  });
});
