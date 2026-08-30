import {
  applyCanceledPresetEdit,
  createPresetCancelEditHandler,
  createPresetSaveEditHandler,
  createPresetStartEditHandler,
} from "../presetEditActions";

jest.mock("../presetEditStateActions", () => ({
  cancelPresetEdit: jest.fn(),
  startPresetEdit: jest.fn(),
}));
jest.mock("../presetEditSaveWorkflow", () => ({
  savePresetEditAndReload: jest.fn(),
}));

import { cancelPresetEdit, startPresetEdit } from "../presetEditStateActions";
import { savePresetEditAndReload } from "../presetEditSaveWorkflow";

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
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("編集開始・キャンセル・保存 handler を組み立てる", () => {
    (startPresetEdit as jest.Mock)
      .mockReturnValueOnce({
        editingPresetId: null,
        editingPresetUpdatedAt: null,
        editPresetName: "",
        editPresetDescription: "",
        editSourceDay: null,
      })
      .mockReturnValueOnce({
        editingPresetId: "p1",
        editingPresetUpdatedAt: preset.updatedAt,
        editPresetName: "朝ルーティン",
        editPresetDescription: "desc",
        editSourceDay: 1,
      });
    (cancelPresetEdit as jest.Mock).mockReturnValue({
      editingPresetId: null,
      editingPresetUpdatedAt: null,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: null,
    });
    (savePresetEditAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], saved: false })
      .mockReturnValueOnce({ presets: [preset], saved: true });

    const setters = {
      setEditingPresetId: jest.fn(),
      setEditingPresetUpdatedAt: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
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
    expect(setters.setEditingPresetUpdatedAt).toHaveBeenCalledWith(
      preset.updatedAt,
    );
    expect(setSelectedPresetId).toHaveBeenCalledWith(null);
    expect(setSelectedDays).toHaveBeenCalledWith(new Set());

    applyCanceledPresetEdit(setters);
    createPresetCancelEditHandler(setters)();
    expect(cancelPresetEdit).toHaveBeenCalledTimes(2);

    const saveEdit = createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "desc2",
      editSourceDay: 1,
      currentRoutines,
      setPresets,
      ...setters,
    });
    saveEdit();
    saveEdit();

    expect(setPresets).toHaveBeenCalledTimes(1);
    expect(cancelPresetEdit).toHaveBeenCalledTimes(3);
  });

  it("編集 workflow が入力不正を返すと通知し、編集 state を維持する", () => {
    (savePresetEditAndReload as jest.Mock).mockReturnValue({
      presets: [preset],
      saved: false,
      failureReason: "invalid-input",
    });
    const setters = {
      setEditingPresetId: jest.fn(),
      setEditingPresetUpdatedAt: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
    };
    const setPresets = jest.fn();

    createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: 1,
      currentRoutines,
      setPresets,
      ...setters,
    })();

    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(setPresets).not.toHaveBeenCalled();
    expect(cancelPresetEdit).not.toHaveBeenCalled();
  });

  it("編集 workflow が storage-failure を返すと成功通知せず編集 state を維持する", () => {
    (savePresetEditAndReload as jest.Mock).mockReturnValue({
      presets: [preset],
      saved: false,
      failureReason: "storage-failure",
    });
    const setters = {
      setEditingPresetId: jest.fn(),
      setEditingPresetUpdatedAt: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
    };
    const setPresets = jest.fn();

    createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "desc2",
      editSourceDay: 1,
      currentRoutines,
      setPresets,
      ...setters,
    })();

    expect(window.alert).not.toHaveBeenCalled();
    expect(setPresets).not.toHaveBeenCalled();
    expect(cancelPresetEdit).not.toHaveBeenCalled();
  });

  it("編集対象が保存先から消えていたら通知し、最新一覧を反映して編集を終了する", () => {
    (savePresetEditAndReload as jest.Mock).mockReturnValue({
      presets: [],
      saved: false,
      failureReason: "preset-not-found",
    });
    (cancelPresetEdit as jest.Mock).mockReturnValue({
      editingPresetId: null,
      editingPresetUpdatedAt: null,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: null,
    });
    const setters = {
      setEditingPresetId: jest.fn(),
      setEditingPresetUpdatedAt: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
    };
    const setPresets = jest.fn();

    createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "更新後",
      editPresetDescription: "desc2",
      editSourceDay: 1,
      currentRoutines,
      setPresets,
      ...setters,
    })();

    expect(window.alert).toHaveBeenCalledWith(
      "編集対象のプリセットが削除または更新されたため、編集を終了しました",
    );
    expect(setPresets).toHaveBeenCalledWith([]);
    expect(setters.setEditingPresetId).toHaveBeenCalledWith(null);
    expect(setters.setEditPresetName).toHaveBeenCalledWith("");
    expect(setters.setEditPresetDescription).toHaveBeenCalledWith("");
    expect(setters.setEditSourceDay).toHaveBeenCalledWith(null);
  });

  it("編集対象が外部更新されていたら通知し、最新一覧を反映して編集を終了する", () => {
    const externallyUpdatedPreset = {
      ...preset,
      name: "同期後",
      updatedAt: "2026-03-08T00:00:00.000Z",
    };
    (savePresetEditAndReload as jest.Mock).mockReturnValue({
      presets: [externallyUpdatedPreset],
      saved: false,
      failureReason: "preset-conflict",
    });
    (cancelPresetEdit as jest.Mock).mockReturnValue({
      editingPresetId: null,
      editingPresetUpdatedAt: null,
      editPresetName: "",
      editPresetDescription: "",
      editSourceDay: null,
    });
    const setters = {
      setEditingPresetId: jest.fn(),
      setEditingPresetUpdatedAt: jest.fn(),
      setEditPresetName: jest.fn(),
      setEditPresetDescription: jest.fn(),
      setEditSourceDay: jest.fn(),
    };
    const setPresets = jest.fn();

    createPresetSaveEditHandler({
      presets: [preset],
      editingPresetId: "p1",
      editingPresetUpdatedAt: preset.updatedAt,
      editPresetName: "古い編集内容",
      editPresetDescription: "desc2",
      editSourceDay: 1,
      currentRoutines,
      setPresets,
      ...setters,
    })();

    expect(window.alert).toHaveBeenCalledWith(
      "編集対象のプリセットが削除または更新されたため、編集を終了しました",
    );
    expect(setPresets).toHaveBeenCalledWith([externallyUpdatedPreset]);
    expect(setters.setEditingPresetId).toHaveBeenCalledWith(null);
  });
});
