import "./HomeToolbar.test.setup";
import { fireEvent, render, screen } from "@testing-library/react";
import { HomeToolbar } from "../HomeToolbar";
import { baseView } from "./HomeToolbar.test.setup";

describe("HomeToolbar render", () => {
  it("日付・追加ボタン・子コンポーネントを表示", () => {
    const onAddRoutineAction = jest.fn();
    render(
      <HomeToolbar
        view={baseView}
        display={{
          completedMinutes: 30,
          totalMinutes: 60,
          progressPercentage: 50,
        }}
        trainDelays={[]}
        onAddRoutineAction={onAddRoutineAction}
        showAddButton={true}
      />,
    );
    expect(screen.getByText("2026年2月12日(木)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ルーティンを追加" }));
    expect(onAddRoutineAction).toHaveBeenCalled();
    expect(screen.getByTestId("day-selector")).toBeInTheDocument();
    expect(screen.getByTestId("category-filter")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  it("非編集モードでは追加ボタンを表示しない", () => {
    render(
      <HomeToolbar
        view={{ ...baseView, isEditMode: false }}
        display={{
          completedMinutes: 0,
          totalMinutes: 0,
          progressPercentage: 0,
        }}
        trainDelays={[]}
        onAddRoutineAction={() => undefined}
        showAddButton={false}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "ルーティンを追加" }),
    ).toBeNull();
  });
});
