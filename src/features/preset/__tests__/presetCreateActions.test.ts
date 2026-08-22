import { createPresetCreateHandler } from "../presetCreateActions";

jest.mock("../presetCrudStateActions", () => ({
  createPresetAndReload: jest.fn(),
}));

import { createPresetAndReload } from "../presetCrudStateActions";

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
  beforeEach(() => {
    jest.clearAllMocks();
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
    const setSelectedRoutines = jest.fn();
    const setCreateFilterDays = jest.fn();

    createPresetCreateHandler({
      currentRoutines,
      newPresetName: "朝",
      newPresetDescription: "",
      selectedRoutines: new Set(["r1"]),
      setPresets,
      setIsCreating,
      setNewPresetName,
      setNewPresetDescription,
      setSelectedRoutines,
      setCreateFilterDays,
    })();

    expect(setPresets).toHaveBeenCalledWith([preset]);
    expect(setIsCreating).toHaveBeenCalledWith(false);
    expect(setNewPresetName).toHaveBeenCalledWith("");
    expect(setNewPresetDescription).toHaveBeenCalledWith("");
    expect(setSelectedRoutines).toHaveBeenCalledWith(new Set());
    expect(setCreateFilterDays).toHaveBeenCalledWith(new Set());
  });
});
