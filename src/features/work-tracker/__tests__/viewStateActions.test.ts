import {
  createDeleteSessionConfirmation,
  createInitialWorkTrackerPageState,
  createInvalidWorkNameHandler,
} from "../page/viewStateActions";

describe("work-tracker viewStateActions", () => {
  const session = {
    id: "s1",
    workTemplateId: "t1",
    workName: "設計",
    mood: "good" as const,
    startTime: "2026-03-07T09:00:00.000Z",
    endTime: "2026-03-07T10:00:00.000Z",
    duration: 3600,
    createdAt: "2026-03-07T10:00:00.000Z",
  };

  const template = {
    id: "t1",
    name: "設計",
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
    lastUsedAt: "2026-03-07T00:00:00.000Z",
  };

  it("初期 page state を作る", () => {
    expect(
      createInitialWorkTrackerPageState({
        sessions: [session],
        templates: [template],
      }),
    ).toEqual({
      sessions: [session],
      templates: [template],
      isRunning: false,
      elapsedTime: 0,
      showInputForm: false,
      showTemplateDropdown: false,
      workName: "",
      notes: "",
      selectedMood: "normal",
      selectedTemplate: null,
    });
  });

  it("invalid work name handler を作る", () => {
    const alertFn = jest.fn();
    createInvalidWorkNameHandler("作業名を入力してください", alertFn)();
    expect(alertFn).toHaveBeenCalledWith("作業名を入力してください");
  });

  it("delete confirmation handler を作る", () => {
    const confirmFn = jest.fn(() => true);
    const result = createDeleteSessionConfirmation(
      "このセッションを削除しますか？",
      confirmFn,
    )();

    expect(result).toBe(true);
    expect(confirmFn).toHaveBeenCalledWith("このセッションを削除しますか？");
  });
});
