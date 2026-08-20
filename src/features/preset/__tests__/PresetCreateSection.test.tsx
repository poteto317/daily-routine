import { fireEvent, render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { PresetCreateSection } from "../components/PresetCreateSection";
import { PRESET_CREATE_EMPTY_ROUTINES_LABEL } from "../helpers";

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "routine-1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const defaultProps = {
  isCreating: true,
  newPresetName: "",
  newPresetDescription: "",
  selectedRoutines: new Set<string>(),
  createFilterDays: new Set<number>(),
  onToggleCreating: jest.fn(),
  onChangeName: jest.fn(),
  onChangeDescription: jest.fn(),
  onToggleRoutine: jest.fn(),
  onToggleCreateFilterDay: jest.fn(),
  onCreatePreset: jest.fn(),
};

describe("PresetCreateSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ルーティンが無ければ空メッセージを表示する", () => {
    render(<PresetCreateSection {...defaultProps} currentRoutines={[]} />);

    expect(
      screen.getByText(PRESET_CREATE_EMPTY_ROUTINES_LABEL),
    ).toBeInTheDocument();
  });

  it("title・startTimeが一致する複数曜日分のルーティンは1行だけ表示する", () => {
    const currentRoutines = [
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
      createRoutine({ id: "r-fri", daysOfWeek: [5] }),
    ];

    render(
      <PresetCreateSection
        {...defaultProps}
        currentRoutines={currentRoutines}
      />,
    );

    expect(screen.getAllByText(/朝食/)).toHaveLength(1);
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("統合された行をチェックすると代表ルーティン（最初に出現したもの）のidでonToggleRoutineが呼ばれる", () => {
    const onToggleRoutine = jest.fn();
    const currentRoutines = [
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
    ];

    render(
      <PresetCreateSection
        {...defaultProps}
        currentRoutines={currentRoutines}
        onToggleRoutine={onToggleRoutine}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggleRoutine).toHaveBeenCalledWith("r-mon");
  });

  it("titleが異なるルーティンはそれぞれ別行で表示される", () => {
    const currentRoutines = [
      createRoutine({ id: "a", title: "朝食" }),
      createRoutine({ id: "b", title: "ストレッチ" }),
    ];

    render(
      <PresetCreateSection
        {...defaultProps}
        currentRoutines={currentRoutines}
      />,
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("名前を入力すると onChangeName に入力値を渡す", () => {
    const onChangeName = jest.fn();
    render(
      <PresetCreateSection
        {...defaultProps}
        currentRoutines={[]}
        onChangeName={onChangeName}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "プリセット名" }), {
      target: { value: "平日セット" },
    });

    expect(onChangeName).toHaveBeenCalledWith("平日セット");
  });

  it("説明を入力すると onChangeDescription に入力値を渡す", () => {
    const onChangeDescription = jest.fn();
    render(
      <PresetCreateSection
        {...defaultProps}
        currentRoutines={[]}
        onChangeDescription={onChangeDescription}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "プリセットの説明" }),
      {
        target: { value: "朝だけ" },
      },
    );

    expect(onChangeDescription).toHaveBeenCalledWith("朝だけ");
  });
});
