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

import { addMealRecord, deleteMealRecord, updateMealRecord } from "../storage";

describe("meal storage mutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({});
  });

  it("addMealRecordは新規追加できる", () => {
    mockGenerateId.mockReturnValue("meal-1");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-09T12:00:00Z");

    addMealRecord("2026-02-09", "lunch", "12:00", "カレー", { notes: "外食" });

    const savedHistory = (mockSetStorageItem as jest.Mock).mock.calls[0][1];
    expect(savedHistory["2026-02-09"][0].id).toBe("meal-1");
    expect(savedHistory["2026-02-09"][0].notes).toBe("外食");
    (Date.prototype.toISOString as jest.Mock).mockRestore();
  });

  it("updateMealRecordは既存記録を更新する", () => {
    mockGetStorageItem.mockReturnValue({
      "2026-02-09": [
        {
          id: "1",
          date: "2026-02-09",
          mealType: "breakfast",
          time: "08:00",
          description: "朝",
          createdAt: "2026-02-09T08:00:00Z",
          updatedAt: "2026-02-09T08:00:00Z",
        },
      ],
    });
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-09T09:00:00Z");

    updateMealRecord("2026-02-09", "1", { description: "朝（更新）" });

    const savedHistory = (mockSetStorageItem as jest.Mock).mock.calls[0][1];
    expect(savedHistory["2026-02-09"][0].description).toBe("朝（更新）");
    expect(savedHistory["2026-02-09"][0].updatedAt).toBe(
      "2026-02-09T09:00:00Z",
    );
    (Date.prototype.toISOString as jest.Mock).mockRestore();
  });

  it("deleteMealRecordは削除し、空日はキー削除する", () => {
    mockGetStorageItem.mockReturnValue({
      "2026-02-09": [
        {
          id: "1",
          date: "2026-02-09",
          mealType: "breakfast",
          time: "08:00",
          description: "朝",
          createdAt: "2026-02-09T08:00:00Z",
          updatedAt: "2026-02-09T08:00:00Z",
        },
      ],
    });

    deleteMealRecord("2026-02-09", "1");

    const savedHistory = (mockSetStorageItem as jest.Mock).mock.calls[0][1];
    expect(savedHistory["2026-02-09"]).toBeUndefined();
  });
});
