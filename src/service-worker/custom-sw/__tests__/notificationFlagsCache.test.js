import { setCacheValue, getCacheValue } from "../notificationFlagsCache";

describe("notificationFlagsCache", () => {
  let mockCache;
  const originalRequest = global.Request;
  const originalResponse = global.Response;

  beforeAll(() => {
    // Request / Response のポリフィルモック
    if (!global.Request) {
      global.Request = class Request {
        constructor(url) {
          this.url = url;
        }
      };
    }
    if (!global.Response) {
      global.Response = class Response {
        constructor(body, init) {
          this.body = body;
          this.headers = init?.headers;
        }
      };
    }
  });

  afterAll(() => {
    global.Request = originalRequest;
    global.Response = originalResponse;
  });

  beforeEach(() => {
    mockCache = {
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn().mockResolvedValue(null),
    };

    global.caches = {
      open: jest.fn().mockResolvedValue(mockCache),
    };
  });

  describe("setCacheValue", () => {
    it("キャッシュに値を保存する", async () => {
      await setCacheValue("test-key", "true");

      expect(global.caches.open).toHaveBeenCalledWith("notification-flags-v1");
      expect(mockCache.put).toHaveBeenCalledWith(
        expect.any(Request),
        expect.any(Response),
      );
    });

    it("エラーが発生しても例外を投げずに静かに終了する", async () => {
      mockCache.put.mockRejectedValueOnce(new Error("Cache put failed"));

      await expect(setCacheValue("test-key", "true")).resolves.not.toThrow();
    });
  });

  describe("getCacheValue", () => {
    it("キャッシュに値が存在する場合はそのテキストを返す", async () => {
      mockCache.match.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue("cached-result"),
      });

      const result = await getCacheValue("test-key");
      expect(result).toBe("cached-result");
    });

    it("キャッシュに値が存在しない場合は null を返す", async () => {
      mockCache.match.mockResolvedValueOnce(null);

      const result = await getCacheValue("test-key");
      expect(result).toBeNull();
    });

    it("エラーが発生した場合は null を返す", async () => {
      mockCache.match.mockRejectedValueOnce(new Error("Cache match failed"));

      const result = await getCacheValue("test-key");
      expect(result).toBeNull();
    });
  });
});
