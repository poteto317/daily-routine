import { fireEvent, render, screen } from "@testing-library/react";
import type { PresetSourceDayOption } from "../presetSourceDayModel";
import { PresetSourceDayPicker } from "../components/PresetSourceDayPicker";

const options: PresetSourceDayOption[] = [
  {
    day: 0,
    label: "日",
    hasRoutines: false,
    isSelected: false,
    isHoliday: false,
  },
  {
    day: 1,
    label: "月",
    hasRoutines: true,
    isSelected: true,
    isHoliday: false,
  },
  {
    day: 2,
    label: "火",
    hasRoutines: true,
    isSelected: false,
    isHoliday: false,
  },
];

describe("PresetSourceDayPicker", () => {
  it("候補モデルに従って選択状態と無効状態を表示し、有効な曜日を通知する", () => {
    const onSelect = jest.fn();

    render(
      <PresetSourceDayPicker
        groupName="source-day"
        label="元曜日"
        options={options}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("group", { name: "元曜日" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "日" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "月" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "火" }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});
