import {
  getWeightHistory,
  saveWeightHistory,
  getWeightRecord,
  saveWeightRecord,
  getTodayWeightRecord,
  deleteWeightRecord,
} from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("weight storage", () => {
  let toISOStringSpy: jest.SpyInstance | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
  });

  afterEach(() => {
    toISOStringSpy?.mockRestore();
    toISOStringSpy = undefined;
  });

  it("getWeightHistoryは履歴を取得する", () => {
    const history = {
      "2026-02-12": {
        id: "w1",
        date: "2026-02-12",
        weight: 65,
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getWeightHistory();

    expect(result).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("weight-history", {});
  });

  it("saveWeightHistoryは履歴を保存する", () => {
    const history = {
      "2026-02-12": {
        id: "w1",
        date: "2026-02-12",
        weight: 65,
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };

    saveWeightHistory(history);

    expect(mockSetStorageItem).toHaveBeenCalledWith("weight-history", history);
  });

  it("getWeightRecordは指定日の記録を返す", () => {
    const history = {
      "2026-02-12": {
        id: "w1",
        date: "2026-02-12",
        weight: 65,
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getWeightRecord("2026-02-12");

    expect(result).toEqual(history["2026-02-12"]);
  });

  it("saveWeightRecordは新規記録を作成して保存する", () => {
    mockGenerateId.mockReturnValue("new-weight-id");
    toISOStringSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    saveWeightRecord("2026-02-12", 64.5, "good");

    expect(mockSetStorageItem).toHaveBeenCalledWith("weight-history", {
      "2026-02-12": {
        id: "new-weight-id",
        date: "2026-02-12",
        weight: 64.5,
        notes: "good",
        createdAt: "2026-02-12T10:00:00.000Z",
        updatedAt: "2026-02-12T10:00:00.000Z",
      },
    });
  });

  it("getTodayWeightRecordは当日の記録を返す", () => {
    (coreStorage.getTodayString as jest.Mock).mockReturnValue("2026-02-12");
    const history = {
      "2026-02-12": {
        id: "w1",
        date: "2026-02-12",
        weight: 65,
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getTodayWeightRecord();
    expect(result).toEqual(history["2026-02-12"]);
  });

  it("saveWeightRecordは既存記録を更新して保存する", () => {
    const existing = {
      "2026-02-12": {
        id: "existing-id",
        date: "2026-02-12",
        weight: 65,
        notes: "initial",
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue(existing as never);
    toISOStringSpy = jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T12:00:00.000Z");

    saveWeightRecord("2026-02-12", 64.0, "updated");

    expect(mockSetStorageItem).toHaveBeenCalledWith("weight-history", {
      "2026-02-12": {
        id: "existing-id",
        date: "2026-02-12",
        weight: 64.0,
        notes: "updated",
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T12:00:00.000Z",
      },
    });
  });

  it("deleteWeightRecordは指定日の記録を削除して保存する", () => {
    const history = {
      "2026-02-12": {
        id: "w1",
        date: "2026-02-12",
        weight: 65,
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
      "2026-02-13": {
        id: "w2",
        date: "2026-02-13",
        weight: 66,
        createdAt: "2026-02-13T00:00:00.000Z",
        updatedAt: "2026-02-13T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue({ ...history } as never);

    (coreStorage.getTodayString as jest.Mock).mockReturnValue("2026-02-12");
    expect(getTodayWeightRecord()).toEqual(history["2026-02-12"]);

    deleteWeightRecord("2026-02-12");

    expect(mockSetStorageItem).toHaveBeenCalledWith("weight-history", {
      "2026-02-13": history["2026-02-13"],
    });
  });
});
