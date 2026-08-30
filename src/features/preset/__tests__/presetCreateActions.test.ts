import { createPresetCreateHandler } from "../presetCreateActions";

jest.mock("../presetCreateWorkflow", () => ({
  createPresetAndReload: jest.fn(),
}));

import { createPresetAndReload } from "../presetCreateWorkflow";

const currentRoutines = [
  {
    id: "r1",
    title: "朝食",
    startTime: "07:00",
    duration: 30,
    category: "life" as const,
    daysOfWeek: [1, 2],
    isCompleted: false,
    sortOrder: 0,
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  },
];

const preset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetCreateActions", () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("作成 handler が成功時に作成 state をリセットする", () => {
    (createPresetAndReload as jest.Mock).mockReturnValue({
      presets: [preset],
      created: true,
    });
    const setPresets = jest.fn();
    const setIsCreating = jest.fn();
    const setNewPresetName = jest.fn();
    const setNewPresetDescription = jest.fn();
    const setSourceDay = jest.fn();

    createPresetCreateHandler({
      currentRoutines,
      newPresetName: "朝",
      newPresetDescription: "",
      sourceDay: 1,
      setPresets,
      setIsCreating,
      setNewPresetName,
      setNewPresetDescription,
      setSourceDay,
    })();

    expect(setPresets).toHaveBeenCalledWith([preset]);
    expect(setIsCreating).toHaveBeenCalledWith(false);
    expect(setNewPresetName).toHaveBeenCalledWith("");
    expect(setNewPresetDescription).toHaveBeenCalledWith("");
    expect(setSourceDay).toHaveBeenCalledWith(null);
  });

  it("作成 workflow が入力不正を返すと通知し、作成 state を維持する", () => {
    (createPresetAndReload as jest.Mock).mockReturnValue({
      presets: [],
      created: false,
      failureReason: "invalid-input",
    });
    const setPresets = jest.fn();
    const setIsCreating = jest.fn();
    const setNewPresetName = jest.fn();
    const setNewPresetDescription = jest.fn();
    const setSourceDay = jest.fn();

    createPresetCreateHandler({
      currentRoutines,
      newPresetName: "",
      newPresetDescription: "",
      sourceDay: null,
      setPresets,
      setIsCreating,
      setNewPresetName,
      setNewPresetDescription,
      setSourceDay,
    })();

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(setPresets).not.toHaveBeenCalled();
    expect(setIsCreating).not.toHaveBeenCalled();
    expect(setNewPresetName).not.toHaveBeenCalled();
    expect(setNewPresetDescription).not.toHaveBeenCalled();
    expect(setSourceDay).not.toHaveBeenCalled();
  });

  it("作成 workflow が保存失敗を返すと誤った入力エラーを出さず作成 state を維持する", () => {
    (createPresetAndReload as jest.Mock).mockReturnValue({
      presets: [],
      created: false,
      failureReason: "storage-failure",
    });
    const setters = {
      setPresets: jest.fn(),
      setIsCreating: jest.fn(),
      setNewPresetName: jest.fn(),
      setNewPresetDescription: jest.fn(),
      setSourceDay: jest.fn(),
    };

    createPresetCreateHandler({
      currentRoutines,
      newPresetName: "朝",
      newPresetDescription: "朝用",
      sourceDay: 1,
      ...setters,
    })();

    expect(window.alert).not.toHaveBeenCalled();
    Object.values(setters).forEach((setter) => {
      expect(setter).not.toHaveBeenCalled();
    });
  });
});
