import { act, renderHook } from "@testing-library/react";

jest.mock("../routineCrudViewStateActions", () => ({
  closeRoutineCrudFormState: jest.fn(),
  openRoutineCrudFormState: jest.fn(),
}));

import {
  closeRoutineCrudFormState,
  openRoutineCrudFormState,
} from "../routineCrudViewStateActions";
import { useRoutineCrudFormActions } from "../useRoutineCrudFormActions";
import {
  restoreHistoryMocks,
  routine,
  setupHistoryMocks,
} from "./useRoutineCrud.test.setup";

describe("useRoutineCrudFormActions", () => {
  beforeEach(setupHistoryMocks);
  afterEach(restoreHistoryMocks);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("open/close form action を組み立てる", () => {
    const params = {
      isEditMode: true,
      scrollRef: { current: 0 },
      setEditingRoutine: jest.fn(),
      setShowForm: jest.fn(),
    };

    const { result } = renderHook(() => useRoutineCrudFormActions(params));

    act(() => {
      result.current.openForm(routine);
      result.current.closeForm();
    });

    expect(openRoutineCrudFormState).toHaveBeenCalledWith({
      isEditMode: true,
      routine,
      scrollTop: 200,
      scrollRef: params.scrollRef,
      setEditingRoutine: params.setEditingRoutine,
      setShowForm: params.setShowForm,
    });
    expect(closeRoutineCrudFormState).toHaveBeenCalledWith({
      setShowForm: params.setShowForm,
      setEditingRoutine: params.setEditingRoutine,
    });
  });
});
