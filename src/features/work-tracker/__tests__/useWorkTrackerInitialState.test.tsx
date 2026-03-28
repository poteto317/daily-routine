import { renderHook } from "@testing-library/react";

jest.mock("../page/viewStateActions", () => ({
  createInitialWorkTrackerPageState: jest.fn(() => ({
    sessions: [{ id: "s1" }],
    templates: [{ id: "t1" }],
    isRunning: false,
    elapsedTime: 0,
    showInputForm: false,
    showTemplateDropdown: false,
    workName: "",
    notes: "",
    selectedMood: "normal",
    selectedTemplate: null,
  })),
}));

import { createInitialWorkTrackerPageState } from "../page/viewStateActions";
import { useWorkTrackerInitialState } from "../page/useWorkTrackerInitialState";

describe("useWorkTrackerInitialState", () => {
  it("sessions/templates から initial state を一度だけ組み立てる", () => {
    const props = {
      sessions: [{ id: "s1" }] as never,
      templates: [{ id: "t1" }] as never,
    };

    const { result, rerender } = renderHook(
      ({ sessions, templates }) =>
        useWorkTrackerInitialState({ sessions, templates }),
      { initialProps: props },
    );

    expect(createInitialWorkTrackerPageState).toHaveBeenCalledTimes(1);
    expect(createInitialWorkTrackerPageState).toHaveBeenCalledWith(props);

    rerender({
      sessions: [{ id: "s2" }] as never,
      templates: [{ id: "t2" }] as never,
    });

    expect(createInitialWorkTrackerPageState).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(
      (createInitialWorkTrackerPageState as jest.Mock).mock.results[0].value,
    );
  });
});
