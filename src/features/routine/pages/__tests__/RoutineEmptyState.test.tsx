import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineEmptyState } from "../RoutineEmptyState";

describe("RoutineEmptyState", () => {
  it("全体0件時は初回追加メッセージとボタンを表示する", () => {
    const onAddRoutineAction = jest.fn();

    render(
      <RoutineEmptyState
        allRoutinesCount={0}
        displayRoutinesCount={0}
        filteredRoutinesCount={0}
        isEditMode={true}
        onAddRoutineAction={onAddRoutineAction}
        viewMode={1}
      />,
    );

    expect(
      screen.getByText("まだルーティンが登録されていません"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "最初のルーティンを追加" }),
    );
    expect(onAddRoutineAction).toHaveBeenCalled();
  });

  it("曜日/祝日空状態の文言を切り替える", () => {
    const { rerender } = render(
      <RoutineEmptyState
        allRoutinesCount={3}
        displayRoutinesCount={0}
        filteredRoutinesCount={2}
        isEditMode={false}
        onAddRoutineAction={() => undefined}
        viewMode={1}
      />,
    );

    expect(
      screen.getByText("この曜日にはルーティンがありません"),
    ).toBeInTheDocument();

    rerender(
      <RoutineEmptyState
        allRoutinesCount={3}
        displayRoutinesCount={0}
        filteredRoutinesCount={2}
        isEditMode={false}
        onAddRoutineAction={() => undefined}
        viewMode="holiday"
      />,
    );

    expect(
      screen.getByText("祝日にはルーティンがありません"),
    ).toBeInTheDocument();
  });

  it("表示はあるがカテゴリ絞り込みで0件時はカテゴリ文言を表示する", () => {
    render(
      <RoutineEmptyState
        allRoutinesCount={3}
        displayRoutinesCount={2}
        filteredRoutinesCount={0}
        isEditMode={true}
        onAddRoutineAction={() => undefined}
        viewMode={1}
      />,
    );

    expect(
      screen.getByText("このカテゴリのルーティンはありません"),
    ).toBeInTheDocument();
  });
});
