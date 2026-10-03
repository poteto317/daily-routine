/** @jest-environment node */
import { ApiError, emptyPatch, noSyncData, notFound } from "../errors";

describe("ApiError", () => {
  it("status / code / message を保持し、Error として扱える", () => {
    const error = new ApiError(418, "teapot", "お茶");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(418);
    expect(error.code).toBe("teapot");
    expect(error.message).toBe("お茶");
    expect(error.name).toBe("ApiError");
  });
});

describe("notFound", () => {
  it("404 not_found で対象名をメッセージに含める", () => {
    const error = notFound("支出");
    expect(error.status).toBe(404);
    expect(error.code).toBe("not_found");
    expect(error.message).toContain("支出");
  });
});

describe("noSyncData", () => {
  it("404 no_sync_data で、先にアプリからアップロードするよう案内する", () => {
    const error = noSyncData();
    expect(error.status).toBe(404);
    expect(error.code).toBe("no_sync_data");
    expect(error.message).toContain("アップロード");
  });
});

describe("emptyPatch", () => {
  it("400 empty_patch で更新するフィールドの指定を促す", () => {
    const error = emptyPatch();
    expect(error.status).toBe(400);
    expect(error.code).toBe("empty_patch");
    expect(error.message).toContain("更新");
  });
});
