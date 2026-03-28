import {
  createWorkTrackerCancelSessionHandler,
  createWorkTrackerDeleteSessionHandler,
  createWorkTrackerSaveSessionHandler,
} from "../page/workTrackerSessionMutationActions";

jest.mock("@/lib/storage", () => ({
  deleteWorkSession: jest.fn(),
  getTodayWorkSessions: jest.fn(),
  getWorkTemplates: jest.fn(),
}));

jest.mock("../page/sessionPersistence", () => ({
  persistWorkSession: jest.fn(),
}));

jest.mock("../page/stateActions", () => ({
  deleteTrackedSession: jest.fn(),
  saveWorkTrackerSession: jest.fn(),
}));

jest.mock("../page/viewStateActions", () => ({
  createDeleteSessionConfirmation: jest.fn(),
  createInvalidWorkNameHandler: jest.fn(),
}));

import {
  deleteWorkSession,
  getTodayWorkSessions,
  getWorkTemplates,
} from "@/lib/storage";
import { persistWorkSession } from "../page/sessionPersistence";
import {
  deleteTrackedSession,
  saveWorkTrackerSession,
} from "../page/stateActions";
import {
  createDeleteSessionConfirmation,
  createInvalidWorkNameHandler,
} from "../page/viewStateActions";

describe("workTrackerSessionMutationActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("save handler が保存依存を束ねる", () => {
    const invalidHandler = jest.fn();
    (createInvalidWorkNameHandler as jest.Mock).mockReturnValue(invalidHandler);

    const startTime = new Date("2026-03-07T09:00:00.000Z");
    const setSessions = jest.fn();
    const setTemplates = jest.fn();
    const resetForm = jest.fn();

    createWorkTrackerSaveSessionHandler({
      workName: "設計",
      selectedMood: "good",
      elapsedTime: 3600,
      notes: "集中",
      getStartTime: () => startTime,
      setSessions,
      setTemplates,
      resetForm,
    })();

    expect(createInvalidWorkNameHandler).toHaveBeenCalledWith(
      "作業名を入力してください",
    );
    expect(saveWorkTrackerSession).toHaveBeenCalledWith({
      workName: "設計",
      selectedMood: "good",
      elapsedTime: 3600,
      notes: "集中",
      startTime,
      onInvalidWorkName: invalidHandler,
      persistSession: persistWorkSession,
      refreshSessions: getTodayWorkSessions,
      refreshTemplates: getWorkTemplates,
      setSessions,
      setTemplates,
      resetForm,
    });
  });

  it("cancel handler が reset を呼ぶ", () => {
    const resetForm = jest.fn();

    createWorkTrackerCancelSessionHandler(resetForm)();

    expect(resetForm).toHaveBeenCalled();
  });

  it("delete handler が確認と削除を束ねる", () => {
    const confirmDelete = jest.fn();
    (createDeleteSessionConfirmation as jest.Mock).mockReturnValue(confirmDelete);
    const setSessions = jest.fn();

    createWorkTrackerDeleteSessionHandler({ setSessions })("s1");

    expect(createDeleteSessionConfirmation).toHaveBeenCalledWith(
      "このセッションを削除しますか？",
    );
    expect(deleteTrackedSession).toHaveBeenCalledWith({
      sessionId: "s1",
      confirmDelete,
      removeSession: deleteWorkSession,
      refreshSessions: getTodayWorkSessions,
      setSessions,
    });
  });
});