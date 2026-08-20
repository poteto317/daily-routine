import { fireEvent, render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { PresetEditSection } from "../components/PresetEditSection";
import { PRESET_EDIT_EMPTY_ROUTINES_LABEL } from "../helpers";

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
  editPresetName: "プリセット",
  editPresetDescription: "",
  editSelectedRoutines: new Set<string>(),
  onChangeEditName: jest.fn(),
  onChangeEditDescription: jest.fn(),
  onToggleEditRoutine: jest.fn(),
  onSaveEdit: jest.fn(),
  onCancelEdit: jest.fn(),
};

describe("PresetEditSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ルーティンが無ければ空メッセージを表示する", () => {
    render(<PresetEditSection {...defaultProps} routines={[]} />);

    expect(
      screen.getByText(PRESET_EDIT_EMPTY_ROUTINES_LABEL),
    ).toBeInTheDocument();
  });

  it("title・startTimeが一致する複数曜日分のルーティンは1行だけ表示する", () => {
    const routines = [
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
      createRoutine({ id: "r-fri", daysOfWeek: [5] }),
    ];

    render(<PresetEditSection {...defaultProps} routines={routines} />);

    expect(screen.getAllByText(/朝食/)).toHaveLength(1);
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("統合された行をチェックすると代表ルーティン（最初に出現したもの）のidでonToggleEditRoutineが呼ばれる", () => {
    const onToggleEditRoutine = jest.fn();
    const routines = [
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
    ];

    render(
      <PresetEditSection
        {...defaultProps}
        routines={routines}
        onToggleEditRoutine={onToggleEditRoutine}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggleEditRoutine).toHaveBeenCalledWith("r-mon");
  });

  it("titleが異なるルーティンはそれぞれ別行で表示される", () => {
    const routines = [
      createRoutine({ id: "a", title: "朝食" }),
      createRoutine({ id: "b", title: "ストレッチ" }),
    ];

    render(<PresetEditSection {...defaultProps} routines={routines} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("ルーティンは開始時刻の昇順で表示される", () => {
    const routines = [
      createRoutine({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutine({ id: "early", title: "朝食", startTime: "06:00" }),
      createRoutine({ id: "middle", title: "昼食", startTime: "12:00" }),
    ];

    render(<PresetEditSection {...defaultProps} routines={routines} />);

    // 各行に表示される時刻を上から順に読む
    expect(
      screen.getAllByText(/^\d{2}:\d{2}$/).map((el) => el.textContent),
    ).toEqual(["06:00", "12:00", "22:00"]);
  });

  it("時刻順に並べても、チェック時は代表ルーティンのidで通知される", () => {
    const onToggleEditRoutine = jest.fn();
    const routines = [
      createRoutine({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutine({ id: "early-mon", title: "朝食", startTime: "06:00" }),
      createRoutine({
        id: "early-wed",
        title: "朝食",
        startTime: "06:00",
        daysOfWeek: [3],
      }),
    ];

    render(
      <PresetEditSection
        {...defaultProps}
        routines={routines}
        onToggleEditRoutine={onToggleEditRoutine}
      />,
    );

    fireEvent.click(screen.getAllByRole("checkbox")[0]);

    expect(onToggleEditRoutine).toHaveBeenCalledWith("early-mon");
  });

  it("名前を編集すると onChangeEditName に入力値を渡す", () => {
    const onChangeEditName = jest.fn();
    render(
      <PresetEditSection
        {...defaultProps}
        routines={[]}
        onChangeEditName={onChangeEditName}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "プリセット名" }), {
      target: { value: "更新後の名前" },
    });

    expect(onChangeEditName).toHaveBeenCalledWith("更新後の名前");
  });

  it("説明を編集すると onChangeEditDescription に入力値を渡す", () => {
    const onChangeEditDescription = jest.fn();
    render(
      <PresetEditSection
        {...defaultProps}
        routines={[]}
        onChangeEditDescription={onChangeEditDescription}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "プリセットの説明" }),
      {
        target: { value: "更新後の説明" },
      },
    );

    expect(onChangeEditDescription).toHaveBeenCalledWith("更新後の説明");
  });
});
