import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Routine } from "@/types/routine";
import { PresetSourceDaySelection } from "../components/PresetSourceDaySelection";
import { createPresetSourceDayModel } from "../presetSourceDayModel";

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

describe("PresetSourceDaySelection", () => {
  it("日曜から祝日まで全8候補をradioとして表示し、空曜日を選択不可にする", () => {
    render(
      <PresetSourceDaySelection
        model={createPresetSourceDayModel([createRoutine()], null)}
        onSelectSourceDay={jest.fn()}
        label="元曜日"
        emptyLabel="ルーティンがありません"
      />,
    );

    expect(screen.getByRole("group", { name: "元曜日" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(8);
    expect(screen.getByRole("radio", { name: "月" })).toHaveAttribute(
      "type",
      "radio",
    );
    expect(screen.getByRole("radio", { name: "月" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "日" })).toBeDisabled();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("矢印キーで有効な曜日間を移動し、focusと選択を同時に更新する", async () => {
    const user = userEvent.setup();
    const SelectionHarness = () => {
      const [sourceDay, setSourceDay] = useState<number | null>(null);
      return (
        <PresetSourceDaySelection
          model={createPresetSourceDayModel(
            [
              createRoutine({ id: "monday", daysOfWeek: [1] }),
              createRoutine({ id: "tuesday", daysOfWeek: [2] }),
            ],
            sourceDay,
          )}
          onSelectSourceDay={setSourceDay}
          label="元曜日"
          emptyLabel="ルーティンがありません"
        />
      );
    };
    render(<SelectionHarness />);

    const monday = screen.getByRole("radio", { name: "月" });
    const tuesday = screen.getByRole("radio", { name: "火" });
    await user.click(monday);
    await user.keyboard("{ArrowRight}");

    expect(tuesday).toHaveFocus();
    expect(tuesday).toBeChecked();
    expect(monday).not.toBeChecked();
  });

  it("保存できないルーティンのみの曜日を無効化する", () => {
    const invalidRoutine = createRoutine({ daysOfWeek: [1] });
    (invalidRoutine as unknown as { startTime: unknown }).startTime = null;

    render(
      <PresetSourceDaySelection
        model={createPresetSourceDayModel([invalidRoutine], null)}
        onSelectSourceDay={jest.fn()}
        label="元曜日"
        emptyLabel="ルーティンがありません"
      />,
    );

    expect(screen.getByRole("radio", { name: "月" })).toBeDisabled();
  });

  it("選んだ曜日のルーティンを時刻順の読み取り専用プレビューで表示する", () => {
    const onSelectSourceDay = jest.fn();
    const SelectionHarness = () => {
      const [sourceDay, setSourceDay] = useState<number | null>(null);
      return (
        <PresetSourceDaySelection
          model={createPresetSourceDayModel(
            [
              createRoutine({
                id: "late",
                title: "夜食",
                startTime: "22:00",
              }),
              createRoutine({
                id: "early",
                title: "朝食",
                startTime: "06:00",
              }),
            ],
            sourceDay,
          )}
          onSelectSourceDay={(day) => {
            onSelectSourceDay(day);
            setSourceDay(day);
          }}
          label="元曜日"
          emptyLabel="ルーティンがありません"
        />
      );
    };
    render(<SelectionHarness />);

    fireEvent.click(screen.getByRole("radio", { name: "月" }));

    expect(onSelectSourceDay).toHaveBeenCalledWith(1);
    expect(
      screen
        .getAllByText(/^\d{2}:\d{2}$/)
        .map((element) => element.textContent),
    ).toEqual(["06:00", "22:00"]);
  });

  it("祝日を選ぶと祝日のルーティンだけを読み取り専用プレビューに表示する", () => {
    const onSelectSourceDay = jest.fn();
    const SelectionHarness = () => {
      const [sourceDay, setSourceDay] = useState<number | null>(null);
      return (
        <PresetSourceDaySelection
          model={createPresetSourceDayModel(
            [
              createRoutine({
                id: "holiday",
                title: "祝日散歩",
                daysOfWeek: [7],
              }),
              createRoutine({
                id: "monday",
                title: "月曜朝食",
                daysOfWeek: [1],
              }),
            ],
            sourceDay,
          )}
          onSelectSourceDay={(day) => {
            onSelectSourceDay(day);
            setSourceDay(day);
          }}
          label="元曜日"
          emptyLabel="ルーティンがありません"
        />
      );
    };
    render(<SelectionHarness />);

    fireEvent.click(screen.getByRole("radio", { name: "祝" }));

    expect(onSelectSourceDay).toHaveBeenCalledWith(7);
    expect(screen.getByText(/祝日散歩/)).toBeInTheDocument();
    expect(screen.queryByText("月曜朝食")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
