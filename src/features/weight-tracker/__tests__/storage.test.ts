import {
  getWeightHistory,
  saveWeightHistory,
  getWeightRecord,
  saveWeightRecord,
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
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
    jest
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
});
