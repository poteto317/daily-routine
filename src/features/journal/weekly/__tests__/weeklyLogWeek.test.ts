import { getWeeklyLogWeekStart, shiftWeeklyLogWeek } from "../weeklyLogWeek";

describe("getWeeklyLogWeekStart", () => {
  it.each([
    ["2026-11-02", "2026-11-02"], // 月
    ["2026-11-03", "2026-11-02"], // 火
    ["2026-11-04", "2026-11-02"], // 水
    ["2026-11-05", "2026-11-02"], // 木
    ["2026-11-06", "2026-11-02"], // 金
    ["2026-11-07", "2026-11-02"], // 土
    ["2026-11-08", "2026-11-02"], // 日は前の月曜
  ])("%s を含む週の月曜は %s", (dateKey, expected) => {
    expect(getWeeklyLogWeekStart(dateKey)).toBe(expected);
  });

  it("月をまたぐ週", () => {
    expect(getWeeklyLogWeekStart("2026-12-03")).toBe("2026-11-30");
  });

  it("年をまたぐ週", () => {
    expect(getWeeklyLogWeekStart("2027-01-03")).toBe("2026-12-28");
  });
});

describe("shiftWeeklyLogWeek", () => {
  it("1 週前・1 週後へずらす", () => {
    expect(shiftWeeklyLogWeek("2026-11-02", -1)).toBe("2026-10-26");
    expect(shiftWeeklyLogWeek("2026-11-02", 1)).toBe("2026-11-09");
  });

  it("年をまたいでずらす", () => {
    expect(shiftWeeklyLogWeek("2026-12-28", 1)).toBe("2027-01-04");
  });
});

describe("端末のローカル時刻に依存しない", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("ローカル時刻の取得を使わずに計算する", () => {
    const fail = () => {
      throw new Error("ローカル時刻を使ってはいけない");
    };
    jest.spyOn(Date.prototype, "getDay").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getDate").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getMonth").mockImplementation(fail);
    jest.spyOn(Date.prototype, "getFullYear").mockImplementation(fail);

    expect(getWeeklyLogWeekStart("2026-11-08")).toBe("2026-11-02");
    expect(shiftWeeklyLogWeek("2026-11-02", -1)).toBe("2026-10-26");
  });
});
