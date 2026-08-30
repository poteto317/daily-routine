import { createPresetDeleteHandler } from "../presetDeleteActions";

jest.mock("../presetDeleteWorkflow", () => ({
  deletePresetAndReload: jest.fn(),
}));

import { deletePresetAndReload } from "../presetDeleteWorkflow";

describe("createPresetDeleteHandler", () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it("削除確認後にworkflowの保存結果でstateを更新する", () => {
    (deletePresetAndReload as jest.Mock).mockReturnValue([]);
    const setPresets = jest.fn();

    createPresetDeleteHandler({ setPresets })("p1");

    expect(deletePresetAndReload).toHaveBeenCalledWith("p1");
    expect(setPresets).toHaveBeenCalledWith([]);
  });

  it("削除確認を拒否した場合はworkflowを呼ばない", () => {
    confirmSpy.mockReturnValue(false);

    createPresetDeleteHandler({ setPresets: jest.fn() })("p1");

    expect(deletePresetAndReload).not.toHaveBeenCalled();
  });
});
