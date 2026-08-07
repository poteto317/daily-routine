import {
  applyCanceledPresetEdit,
  createPresetCancelEditHandler,
  createPresetSaveEditHandler,
  createPresetStartEditHandler,
} from "../presetEditActions";

jest.mock("../presetManagerStateActions", () => ({
  cancelPresetEdit: jest.fn(),
  savePresetEditAndReload: jest.fn(),
  startPresetEdit: jest.fn(),
}));

import {
  cancelPresetEdit,
  savePresetEditAndReload,
  startPresetEdit,
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
    {
      title: "朝食",
      startTime: "07:00",
      duration: 30,
      category: "life" as const,
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetEditActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      currentRoutines: [],
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
