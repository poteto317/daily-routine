import * as journalStorage from "@/features/journal/storage";
import {
  collectRecordTransferData,
  RECORD_TRANSFER_FIELDS,
} from "../state/transferGroups/recordGroup";

jest.mock("@/features/journal/storage");
jest.mock("@/features/meal/storage");
jest.mock("@/features/pomodoro/storage");
jest.mock("@/features/weight-tracker/storage");
jest.mock("@/features/work-tracker/storage");
jest.mock("@/features/workout-tracker/storage");

const weeklyLogHistory = {
  "2026-11-02": {
    id: "w-1",
    weekStart: "2026-11-02",
    content: "内容",
    createdAt: "2026-11-06T12:00:00.000Z",
    updatedAt: "2026-11-06T12:00:00.000Z",
  },
};

const weeklyField = () => {
  const field = RECORD_TRANSFER_FIELDS.find(
    (item) => item.key === "weeklyLogHistory",
  );
  if (!field) throw new Error("weeklyLogHistory のフィールドが無い");
  return field;
};

describe("記録グループの業務日誌", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (journalStorage.getWeeklyLogHistory as jest.Mock).mockReturnValue(
      weeklyLogHistory,
    );
  });

  it("書き出しに weeklyLogHistory を含む", () => {
    expect(collectRecordTransferData().weeklyLogHistory).toEqual(
      weeklyLogHistory,
    );
  });

  it("取り込みで weeklyLogHistory を保存する", () => {
    weeklyField().restore({ weeklyLogHistory });
    expect(journalStorage.saveWeeklyLogHistory).toHaveBeenCalledWith(
      weeklyLogHistory,
    );
  });

  it("オブジェクトでない weeklyLogHistory はエラーにする", () => {
    expect(() => weeklyField().validate({ weeklyLogHistory: [] })).toThrow();
  });
});
