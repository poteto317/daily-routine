import {
  createPresetDaySelectionToggleHandler,
  createPresetFilterDayToggleHandler,
  createPresetSelectionToggleHandler,
} from "../presetSelectionActions";

jest.mock("../presetManagerStateActions", () => ({
  resolveCreateFilterSelection: jest.fn(),
  togglePresetSelection: jest.fn(),
}));

import {
  resolveCreateFilterSelection,
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

describe("presetSelectionActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    createPresetSelectionToggleHandler(
      new Set<string>(),
      setStringSelection,
    )("r1");
    createPresetDaySelectionToggleHandler(
      new Set<number>(),
      setDaySelection,
    )(1);
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
});
