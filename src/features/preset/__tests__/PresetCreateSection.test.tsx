import { fireEvent, render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { PresetCreateSection } from "../components/PresetCreateSection";

const routine: Routine = {
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
};

const defaultProps = {
  isCreating: true,
  newPresetName: "",
  newPresetDescription: "",
  sourceDay: null,
  onToggleCreating: jest.fn(),
  onChangeName: jest.fn(),
  onChangeDescription: jest.fn(),
  onSelectSourceDay: jest.fn(),
  onCreatePreset: jest.fn(),
};

describe("PresetCreateSection", () => {
  it("未選択または空曜日では作成を無効にする", () => {
    const { rerender } = render(
      <PresetCreateSection {...defaultProps} currentRoutines={[routine]} />,
    );
    expect(
      screen.getByRole("button", { name: "プリセットを作成" }),
    ).toBeDisabled();

    rerender(
      <PresetCreateSection
        {...defaultProps}
        newPresetName="朝"
        sourceDay={0}
        currentRoutines={[routine]}
      />,
    );
    expect(
      screen.getByRole("button", { name: "プリセットを作成" }),
    ).toBeDisabled();
  });

  it("曜日を単一選択し、対象があれば作成可能にする", () => {
    const onSelectSourceDay = jest.fn();
    const { rerender } = render(
      <PresetCreateSection
        {...defaultProps}
        newPresetName="朝"
        currentRoutines={[routine]}
        onSelectSourceDay={onSelectSourceDay}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "月" }));
    expect(onSelectSourceDay).toHaveBeenCalledWith(1);

    rerender(
      <PresetCreateSection
        {...defaultProps}
        newPresetName="朝"
        sourceDay={1}
        currentRoutines={[routine]}
      />,
    );
    expect(
      screen.getByRole("button", { name: "プリセットを作成" }),
    ).toBeEnabled();
  });
});
