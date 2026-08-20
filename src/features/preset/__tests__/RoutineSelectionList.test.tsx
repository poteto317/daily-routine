import { fireEvent, render, screen } from "@testing-library/react";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import { RoutineSelectionList } from "../components/RoutineSelectionList";
import { createRoutineFixture } from "./storageTestFixtures";

const defaultProps = {
  selectedRoutineIds: new Set<string>(),
  onToggleRoutine: jest.fn(),
  emptyLabel: "ルーティンがありません",
};

describe("RoutineSelectionList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("グループが空なら空メッセージを表示する", () => {
    render(<RoutineSelectionList {...defaultProps} groups={[]} />);

    expect(screen.getByText("ルーティンがありません")).toBeInTheDocument();
  });

  it("渡された順序をそのまま保って描画する", () => {
    // 並べ替えは呼び出し側の責務。ここでは受け取った順に描くことを固定する
    const groups = groupRoutinesForSelection([
      createRoutineFixture({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutineFixture({ id: "early", title: "朝食", startTime: "06:00" }),
    ]);

    render(<RoutineSelectionList {...defaultProps} groups={groups} />);

    expect(
      screen.getAllByText(/^\d{2}:\d{2}$/).map((el) => el.textContent),
    ).toEqual(["22:00", "06:00"]);
  });

  it("チェックすると代表ルーティンのidで通知する", () => {
    const onToggleRoutine = jest.fn();
    const groups = groupRoutinesForSelection([
      createRoutineFixture({ id: "r-mon", daysOfWeek: [1] }),
      createRoutineFixture({ id: "r-wed", daysOfWeek: [3] }),
    ]);

    render(
      <RoutineSelectionList
        {...defaultProps}
        groups={groups}
        onToggleRoutine={onToggleRoutine}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggleRoutine).toHaveBeenCalledWith("r-mon");
  });

  it("選択済みのidに対応するチェックボックスがチェック状態になる", () => {
    const groups = groupRoutinesForSelection([
      createRoutineFixture({ id: "a", title: "朝食", startTime: "06:00" }),
      createRoutineFixture({ id: "b", title: "夜食", startTime: "22:00" }),
    ]);

    render(
      <RoutineSelectionList
        {...defaultProps}
        groups={groups}
        selectedRoutineIds={new Set(["b"])}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it("カテゴリの絵文字とタイトルを並べて表示する", () => {
    const groups = groupRoutinesForSelection([
      createRoutineFixture({ id: "a", title: "朝食", category: "life" }),
    ]);

    render(<RoutineSelectionList {...defaultProps} groups={groups} />);

    // 絵文字が引けないとタイトルだけの表示になり、種類が見分けられなくなる
    expect(screen.getByText(/朝食/).textContent).toMatch(/\S+\s朝食/);
  });

  it("既知のカテゴリはその絵文字を表示する", () => {
    const groups = groupRoutinesForSelection([
      createRoutineFixture({ id: "a", title: "筋トレ", category: "health" }),
    ]);

    render(<RoutineSelectionList {...defaultProps} groups={groups} />);

    expect(screen.getByText(/筋トレ/).textContent).toBe("💪 筋トレ");
  });

  it("型から外れたカテゴリでも「その他」の絵文字で表示する", () => {
    // 旧データやインポートしたデータには型に無いカテゴリが入りうる。
    // ホーム画面（getCategoryInfo）と同じく📌にフォールバックさせ、
    // 絵文字だけが欠けた行にならないようにする
    const groups = groupRoutinesForSelection([
      createRoutineFixture({
        id: "a",
        title: "謎の予定",
        category: "legacy-unknown" as never,
      }),
    ]);

    render(<RoutineSelectionList {...defaultProps} groups={groups} />);

    expect(screen.getByText(/謎の予定/).textContent).toBe("📌 謎の予定");
  });
});
