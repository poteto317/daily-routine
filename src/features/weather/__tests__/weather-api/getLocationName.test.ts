import { getLocationName } from "../../api";
import { mockFetch } from "./testUtils";

const LAT = 35.6762;
const LON = 139.6503;
const FALLBACK = "35.68, 139.65";

/** 地名 API の応答本文を返す fetch の結果を作る */
const respondWith = (body: unknown) =>
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  } as Response);

describe("getLocationName", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("座標と日本語指定を含む URL を User-Agent 付きで呼び出す", async () => {
    respondWith({ address: { city: "千代田区" } });

    await getLocationName(LAT, LON);

    expect(mockFetch).toHaveBeenCalledWith(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${LAT}&lon=${LON}&accept-language=ja`,
      { headers: { "User-Agent": "DailyRoutineApp/1.0" } },
    );
  });

  it.each([
    ["city", { city: "千代田区", town: "町", state: "東京都" }, "千代田区"],
    ["town", { town: "町", village: "村", state: "県" }, "町"],
    ["village", { village: "村", county: "郡" }, "村"],
    ["county", { county: "郡", state: "県" }, "郡"],
    ["state", { state: "県" }, "県"],
  ])("address の %s を優先順位に従って返す", async (_field, address, name) => {
    respondWith({ address });

    await expect(getLocationName(LAT, LON)).resolves.toBe(name);
  });

  it("address に地名の項目が 1 つも無ければ座標を返す", async () => {
    respondWith({ address: { country: "日本", postcode: "100-0001" } });

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
  });

  it("地名の項目が空文字なら次の項目へ進み、すべて空なら座標を返す", async () => {
    respondWith({ address: { city: "", town: "", state: "東京都" } });
    await expect(getLocationName(LAT, LON)).resolves.toBe("東京都");

    respondWith({ address: { city: "", town: "" } });
    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
  });

  it("address が無い応答なら座標を返す", async () => {
    respondWith({ error: "Unable to geocode" });

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("応答が ok でなければ本文を読まずに座標を返す", async () => {
    const json = jest.fn();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429, json } as never);

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
    expect(json).not.toHaveBeenCalled();
  });

  it("通信に失敗したら座標を返し、エラーをログに残す", async () => {
    const error = new TypeError("Failed to fetch");
    mockFetch.mockRejectedValueOnce(error);

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
    expect(consoleErrorSpy).toHaveBeenCalledWith("地名の取得に失敗:", error);
  });

  it("本文が JSON として読めなければ座標を返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    } as unknown as Response);

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("本文が null なら座標を返す（例外は握りつぶしてログに残す）", async () => {
    respondWith(null);

    await expect(getLocationName(LAT, LON)).resolves.toBe(FALLBACK);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("座標は小数第 2 位に丸めて表示する", async () => {
    mockFetch.mockRejectedValueOnce(new Error("offline"));

    await expect(getLocationName(-33.8688, 151.2093)).resolves.toBe(
      "-33.87, 151.21",
    );
  });
});
