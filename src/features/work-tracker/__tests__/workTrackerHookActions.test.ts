import {
  createWorkTrackerCancelSessionHookHandler,
  createWorkTrackerDeleteSessionHookHandler,
  createWorkTrackerResetFormHandler,
  createWorkTrackerSaveSessionHookHandler,
  createWorkTrackerStartTimeRefActions,
  createWorkTrackerStartTimerHandler,
  createWorkTrackerStopTimerHandler,
} from "../page/workTrackerHookActions";

jest.mock("../page/workTrackerPageStateActions", () => ({
  createWorkTrackerCancelSessionHandler: jest.fn(),
  createWorkTrackerDeleteSessionHandler: jest.fn(),
  createWorkTrackerResetFormAction: jest.fn(),
  createWorkTrackerSaveSessionHandler: jest.fn(),
  createWorkTrackerStartTimerAction: jest.fn(),
  createWorkTrackerStopTimerAction: jest.fn(),
}));

import {
  createWorkTrackerCancelSessionHandler,
  createWorkTrackerDeleteSessionHandler,
  createWorkTrackerResetFormAction,
  createWorkTrackerSaveSessionHandler,
  createWorkTrackerStartTimerAction,
  createWorkTrackerStopTimerAction,
} from "../page/workTrackerPageStateActions";

describe("workTrackerHookActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("startTime ref helper を提供する", () => {
    const startTimeRef = { current: null as Date | null };
    const now = new Date("2026-03-09T10:00:00.000Z");

    const actions = createWorkTrackerStartTimeRefActions(startTimeRef);

    actions.setStartTime(now);
    expect(actions.getStartTime()).toBe(now);

    actions.clearStartTime();
    expect(actions.getStartTime()).toBeNull();
  });

  it("reset/start/stop handler が page action を委譲する", () => {
    const resetAction = jest.fn();
    const startAction = jest.fn();
    const stopAction = jest.fn();
    (createWorkTrackerResetFormAction as jest.Mock).mockReturnValue(resetAction);
    (createWorkTrackerStartTimerAction as jest.Mock).mockReturnValue(startAction);
    (createWorkTrackerStopTimerAction as jest.Mock).mockReturnValue(stopAction);

    const resetParams = {
      setWorkName: jest.fn(),
      setNotes: jest.fn(),
      setSelectedMood: jest.fn(),
      setSelectedTemplate: jest.fn(),
      setElapsedTime: jest.fn(),
      setShowInputForm: jest.fn(),
      setShowTemplateDropdown: jest.fn(),
      clearStartTime: jest.fn(),
    };
    const startParams = {
      setElapsedTime: jest.fn(),
      setIsRunning: jest.fn(),
      setStartTime: jest.fn(),
    };
    const stopParams = {
      setIsRunning: jest.fn(),
      setShowInputForm: jest.fn(),
    };

    createWorkTrackerResetFormHandler(resetParams)();
    createWorkTrackerStartTimerHandler(startParams)();
    createWorkTrackerStopTimerHandler(stopParams)();

    expect(createWorkTrackerResetFormAction).toHaveBeenCalledWith(resetParams);
    expect(createWorkTrackerStartTimerAction).toHaveBeenCalledWith(startParams);
    expect(createWorkTrackerStopTimerAction).toHaveBeenCalledWith(stopParams);
    expect(resetAction).toHaveBeenCalled();
    expect(startAction).toHaveBeenCalled();
    expect(stopAction).toHaveBeenCalled();
  });

  it("save/cancel/delete handler が page action を委譲する", () => {
    const saveAction = jest.fn();
    const cancelAction = jest.fn();
    const deleteAction = jest.fn();
    (createWorkTrackerSaveSessionHandler as jest.Mock).mockReturnValue(saveAction);
    (createWorkTrackerCancelSessionHandler as jest.Mock).mockReturnValue(cancelAction);
    (createWorkTrackerDeleteSessionHandler as jest.Mock).mockReturnValue(deleteAction);

    const saveParams = {
      workName: "設計",
      selectedMood: "good" as const,
      elapsedTime: 10,
      notes: "メモ",
      getStartTime: jest.fn(() => new Date("2026-03-09T10:00:00.000Z")),
      setSessions: jest.fn(),
      setTemplates: jest.fn(),
      resetForm: jest.fn(),
    };
    const resetForm = jest.fn();
    const deleteParams = { setSessions: jest.fn() };

    createWorkTrackerSaveSessionHookHandler(saveParams)();
    createWorkTrackerCancelSessionHookHandler(resetForm)();
    createWorkTrackerDeleteSessionHookHandler(deleteParams)("s1");

    expect(createWorkTrackerSaveSessionHandler).toHaveBeenCalledWith(saveParams);
    expect(createWorkTrackerCancelSessionHandler).toHaveBeenCalledWith(resetForm);
    expect(createWorkTrackerDeleteSessionHandler).toHaveBeenCalledWith(deleteParams);
    expect(saveAction).toHaveBeenCalled();
    expect(cancelAction).toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledWith("s1");
  });
});
