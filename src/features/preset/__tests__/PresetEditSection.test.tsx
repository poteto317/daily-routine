import { fireEvent, render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { PresetEditSection } from "../components/PresetEditSection";

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
  editPresetName: "プリセット",
  editPresetDescription: "",
  editSourceDay: null,
  onChangeEditName: jest.fn(),
  onChangeEditDescription: jest.fn(),
  onSelectEditSourceDay: jest.fn(),
  onSaveEdit: jest.fn(),
  onCancelEdit: jest.fn(),
};

describe("PresetEditSection", () => {
  it("編集開始時は元曜日未選択のため保存できない", () => {
    render(<PresetEditSection {...defaultProps} routines={[routine]} />);
    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
  });

  it("曜日選択はcheckboxではなくradioで、選択後に保存できる", () => {
    const onSelectEditSourceDay = jest.fn();
    const { rerender } = render(
      <PresetEditSection
        {...defaultProps}
        routines={[routine]}
        onSelectEditSourceDay={onSelectEditSourceDay}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "月" }));
    expect(onSelectEditSourceDay).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    rerender(
      <PresetEditSection
        {...defaultProps}
        editSourceDay={1}
        routines={[routine]}
      />,
    );
    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
  });
});
