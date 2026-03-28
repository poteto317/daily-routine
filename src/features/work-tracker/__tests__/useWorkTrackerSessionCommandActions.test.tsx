import { act, renderHook } from "@testing-library/react";

jest.mock("../page/workTrackerHookActions", () => ({
  createWorkTrackerCancelSessionHookHandler: jest.fn(),
  createWorkTrackerDeleteSessionHookHandler: jest.fn(),
  createWorkTrackerSaveSessionHookHandler: jest.fn(),
}));

jest.mock("../page/workTrackerSessionCommandActionsResult", () => ({
  createWorkTrackerSessionCommandActionsResult: jest.fn(),
}));

import {
  createWorkTrackerCancelSessionHookHandler,
  createWorkTrackerDeleteSessionHookHandler,
  createWorkTrackerSaveSessionHookHandler,
} from "../page/workTrackerHookActions";
import { createWorkTrackerSessionCommandActionsResult } from "../page/workTrackerSessionCommandActionsResult";
import { useWorkTrackerSessionCommandActions } from "../page/useWorkTrackerSessionCommandActions";

describe("useWorkTrackerSessionCommandActions", () => {
  it("save/cancel/delete handler を組み立てて委譲する", () => {
    const saveAction = jest.fn();
    const cancelAction = jest.fn();
    const deleteAction = jest.fn();
    const resultShape = {
      handleSaveSession: jest.fn(),
      handleCancelSession: jest.fn(),
      handleDeleteSession: jest.fn(),
      composed: true,
    };
    (createWorkTrackerSaveSessionHookHandler as jest.Mock).mockReturnValue(
      saveAction,
    );
    (createWorkTrackerCancelSessionHookHandler as jest.Mock).mockReturnValue(
      cancelAction,
    );
    (createWorkTrackerDeleteSessionHookHandler as jest.Mock).mockReturnValue(
      deleteAction,
    );
    (createWorkTrackerSessionCommandActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = createParams();
    const { result } = renderHook(() =>
      useWorkTrackerSessionCommandActions(params),
    );

    expect(result.current).toBe(resultShape);
    expect(createWorkTrackerSessionCommandActionsResult).toHaveBeenCalledWith({
      handleSaveSession: expect.any(Function),
      handleCancelSession: expect.any(Function),
      handleDeleteSession: expect.any(Function),
    });

    const builtHandlers = (
      createWorkTrackerSessionCommandActionsResult as jest.Mock
    ).mock.calls[0][0] as {
      handleSaveSession: () => void;
      handleCancelSession: () => void;
      handleDeleteSession: (sessionId: string) => void;
    };

    act(() => {
      builtHandlers.handleSaveSession();
      builtHandlers.handleCancelSession();
      builtHandlers.handleDeleteSession("s1");
    });

    expect(createWorkTrackerSaveSessionHookHandler).toHaveBeenCalledWith({
      workName: params.workName,
      selectedMood: params.selectedMood,
      elapsedTime: params.elapsedTime,
      notes: params.notes,
      getStartTime: params.getStartTime,
      setSessions: params.setSessions,
      setTemplates: params.setTemplates,
      resetForm: params.resetForm,
    });
    expect(createWorkTrackerCancelSessionHookHandler).toHaveBeenCalledWith(
      params.resetForm,
    );
    expect(createWorkTrackerDeleteSessionHookHandler).toHaveBeenCalledWith({
      setSessions: params.setSessions,
    });
    expect(saveAction).toHaveBeenCalled();
    expect(cancelAction).toHaveBeenCalled();
    expect(deleteAction).toHaveBeenCalledWith("s1");
  });
});

const createParams = () => ({
  workName: "設計",
  selectedMood: "good" as const,
  elapsedTime: 120,
  notes: "メモ",
  getStartTime: jest.fn(() => new Date("2026-03-07T09:00:00.000Z")),
  setSessions: jest.fn(),
  setTemplates: jest.fn(),
  resetForm: jest.fn(),
});
