import { createPresetDaySelectionToggleHandler } from "../presetSelectionActions";

describe("presetSelectionActions", () => {
  it("未選択の適用先曜日を追加した新しいSetをsetterへ渡す", () => {
    const setDaySelection = jest.fn();
    const selectedDays = new Set<number>();

    createPresetDaySelectionToggleHandler(selectedDays, setDaySelection)(1);

    expect(setDaySelection).toHaveBeenCalledWith(new Set([1]));
    expect(selectedDays).toEqual(new Set());
  });

  it("選択済みの適用先曜日を除外する", () => {
    const setDaySelection = jest.fn();

    createPresetDaySelectionToggleHandler(new Set([1, 2]), setDaySelection)(1);

    expect(setDaySelection).toHaveBeenCalledWith(new Set([2]));
  });
});
