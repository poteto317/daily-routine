import {
  buildWeeklyLogDeleteConfirmMessage,
  formatWeeklyLogWeekDate,
  formatWeeklyLogWeekRange,
  formatWeeklyLogWeekTitle,
} from "../weeklyLogTexts";

describe("formatWeeklyLogWeekDate", () => {
  it("年月日と曜日を出す", () => {
    expect(formatWeeklyLogWeekDate("2026-11-02")).toBe("2026年11月2日（月）");
  });
});

describe("formatWeeklyLogWeekRange", () => {
  it("月曜から日曜までの期間を出す", () => {
    expect(formatWeeklyLogWeekRange("2026-11-02")).toBe("11月2日〜11月8日");
  });

  it("年をまたぐ週も月日だけで出す", () => {
    expect(formatWeeklyLogWeekRange("2026-12-28")).toBe("12月28日〜1月3日");
  });
});

describe("weeklyLogTexts", () => {
  it("週の見出しを作る", () => {
    expect(formatWeeklyLogWeekTitle("2026-11-02")).toBe(
      "2026年11月2日（月）開始の週",
    );
  });

  it("削除確認の文言を作る", () => {
    expect(buildWeeklyLogDeleteConfirmMessage("2026-11-02")).toBe(
      "2026年11月2日（月）開始の週の業務日誌を削除しますか？",
    );
  });
});

describe("端末のローカル時刻に依存しない", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ローカル時刻の取得を使わずに整形する", () => {
    const fail = () => {
      throw new Error("ローカル時刻を使ってはいけない");
    };
    jest.spyOn(Date.prototype, "getDay").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getDate").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getMonth").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getFullYear").mockImplementation(fail);

    expect(formatWeeklyLogWeekDate("2026-11-02")).toBe("2026年11月2日（月）");
    expect(formatWeeklyLogWeekRange("2026-11-02")).toBe("11月2日〜11月8日");
  });
});
