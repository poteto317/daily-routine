import { replayLastStorageWriteFailure } from "@/lib/storage/core";
import { duplicatePresetAndReload } from "../presetDuplicateWorkflow";
import { getPresets, savePresets } from "../storage";
import { createPreset } from "./storageTestFixtures";

describe("duplicatePresetAndReload", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    replayLastStorageWriteFailure();
  });

  it("複製の永続化に失敗したら未複製として現在の保存内容を返す", () => {
    const preset = createPreset({ id: "preset-1" });
    savePresets([preset]);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });

    expect(duplicatePresetAndReload(getPresets(), preset.id)).toEqual({
      presets: [preset],
      duplicated: false,
      failureReason: "storage-failure",
    });
  });
});
