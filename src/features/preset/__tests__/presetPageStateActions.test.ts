import {
  applyCanceledPresetEdit,
  createPresetApplyHandler,
  createPresetCancelEditHandler,
  createPresetCreateHandler,
  createPresetDaySelectionToggleHandler,
  createPresetDeleteHandler,
  createPresetFilterDayToggleHandler,
  createPresetSaveEditHandler,
  createPresetSelectionToggleHandler,
  createPresetStartEditHandler,
} from "../presetPageStateActions";

jest.mock("../presetManagerStateActions", () => ({
  applyPresetSelection: jest.fn(),
  cancelPresetEdit: jest.fn(),
  createPresetAndReload: jest.fn(),
  deletePresetAndReload: jest.fn(),
  resolveCreateFilterSelection: jest.fn(),
  savePresetEditAndReload: jest.fn(),
  startPresetEdit: jest.fn(),
  togglePresetSelection: jest.fn(),
}));

import {
  applyPresetSelection,
  cancelPresetEdit,
  createPresetAndReload,
  deletePresetAndReload,
  resolveCreateFilterSelection,
  savePresetEditAndReload,
  startPresetEdit,
  togglePresetSelection,
} from "../presetManagerStateActions";

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
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" as const },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetPageStateActions", () => {
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

  it("削除・適用 handler が成功時のみ state を更新する", () => {
    (deletePresetAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], deleted: false })
      .mockReturnValueOnce({ presets: [], deleted: true });
    (applyPresetSelection as jest.Mock)
      .mockReturnValueOnce({ applied: false })
      .mockReturnValueOnce({ applied: true });

    const setPresets = jest.fn();
    const setSelectedPresetId = jest.fn();
    const setSelectedDays = jest.fn();
    const onApplyPreset = jest.fn();

    const deleteHandler = createPresetDeleteHandler({ setPresets });
    deleteHandler("p1");
    deleteHandler("p1");
    expect(setPresets).toHaveBeenCalledTimes(1);

    const applyHandler = createPresetApplyHandler({
      presets: [preset],
      selectedPresetId: "p1",
      selectedDays: new Set([1]),
      onApplyPreset,
      setSelectedPresetId,
      setSelectedDays,
    });
    applyHandler();
    applyHandler();

    expect(setSelectedPresetId).toHaveBeenCalledWith(null);
    expect(setSelectedDays).toHaveBeenCalledWith(new Set());
  });

  it("選択 toggle handler 群が委譲結果を setter に渡す", () => {
    const setStringSelection = jest.fn();
    const setDaySelection = jest.fn();
    const setCreateFilterDays = jest.fn();
    const setSelectedRoutines = jest.fn();

    (togglePresetSelection as jest.Mock)
      .mockReturnValueOnce(new Set(["r1"]))
      .mockReturnValueOnce(new Set([1]));
    (resolveCreateFilterSelection as jest.Mock).mockReturnValue({
      nextFilterDays: new Set([1]),
      nextSelectedRoutines: new Set(["r1"]),
    });

    createPresetSelectionToggleHandler(new Set<string>(), setStringSelection)("r1");
    createPresetDaySelectionToggleHandler(new Set<number>(), setDaySelection)(1);
    createPresetFilterDayToggleHandler({
      currentRoutines,
      createFilterDays: new Set<number>(),
      selectedRoutines: new Set<string>(),
      setCreateFilterDays,
      setSelectedRoutines,
    })(1);

    expect(setStringSelection).toHaveBeenCalledWith(new Set(["r1"]));
    expect(setDaySelection).toHaveBeenCalledWith(new Set([1]));
    expect(setCreateFilterDays).toHaveBeenCalledWith(new Set([1]));
    expect(setSelectedRoutines).toHaveBeenCalledWith(new Set(["r1"]));
  });

  it("編集開始・キャンセル・保存 handler を組み立てる", () => {
    (startPresetEdit as jest.Mock)
      .mockReturnValueOnce({
        editingPresetId: null,
        editPresetName: "",
        editPresetDescription: "",
        editSelectedRoutines: new Set(),
      })
      .mockReturnValueOnce({
        editingPresetId: "p1",
        editPresetName: "朝ルーティン",
        editPresetDescription: "desc",
        editSelectedRoutines: new Set(["r1"]),
      });
    (cancelPresetEdit as jest.Mock).mockReturnValue({
      editingPresetId: null,
      editPresetName: "",
      editPresetDescription: "",
      editSelectedRoutines: new Set(),
    });
    (savePresetEditAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], saved: false })
      .mockReturnValueOnce({ presets: [preset], saved: true });

    const setters = {
      setEditingPresetId: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSelectedRoutines: jest.fn(),
    };
    const setSelectedPresetId = jest.fn();
    const setSelectedDays = jest.fn();
    const setPresets = jest.fn();

    const startEdit = createPresetStartEditHandler({
      presets: [preset],
      ...setters,
      setSelectedPresetId,
      setSelectedDays,
    });
    startEdit("missing");
    startEdit("p1");

    expect(setters.setEditingPresetId).toHaveBeenCalledWith("p1");
    expect(setSelectedPresetId).toHaveBeenCalledWith(null);
    expect(setSelectedDays).toHaveBeenCalledWith(new Set());

    applyCanceledPresetEdit(setters);
    createPresetCancelEditHandler(setters)();
    expect(cancelPresetEdit).toHaveBeenCalledTimes(2);

    const saveEdit = createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editPresetName: "更新後",
      editPresetDescription: "desc2",
      editSelectedRoutines: new Set(["r1"]),
      currentRoutines,
      setPresets,
      ...setters,
    });
    saveEdit();
    saveEdit();

    expect(setPresets).toHaveBeenCalledTimes(1);
    expect(cancelPresetEdit).toHaveBeenCalledTimes(3);
  });
});
