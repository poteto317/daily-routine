import { DOCUMENT_CACHE_NAME, warmDocumentCache } from "../warmDocumentCache";

describe("warmDocumentCache", () => {
  let addAll;
  let open;

  beforeEach(() => {
    addAll = jest.fn().mockResolvedValue(undefined);
    open = jest.fn().mockResolvedValue({ addAll });
    global.caches = { open };
  });

  it("トップページを document-cache に入れる", async () => {
    await warmDocumentCache();

    expect(open).toHaveBeenCalledWith(DOCUMENT_CACHE_NAME);
    expect(addAll).toHaveBeenCalledWith(["/"]);
  });

  it("取得に失敗しても例外を投げない", async () => {
    // 有効化の直後にオフラインだと取得できない。ここで投げると
    // activate の waitUntil が失敗し、Service Worker が有効にならない
    addAll.mockRejectedValue(new Error("オフライン"));

    await expect(warmDocumentCache()).resolves.toBeUndefined();
  });

  it("caches が使えない環境でも例外を投げない", async () => {
    delete global.caches;

    await expect(warmDocumentCache()).resolves.toBeUndefined();
  });
});
