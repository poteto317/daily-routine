import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCard } from "../components/PresetCard";
import type { RoutinePreset } from "@/types/routine";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "朝の準備",
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

const defaultProps = {
  preset,
  isSelected: false,
  isEditing: false,
  selectedDays: new Set<number>(),
  editRoutines: [],
  editPresetName: "",
  editPresetDescription: "",
  editSelectedRoutines: new Set<string>(),
  onSelect: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onToggleDay: jest.fn(),
  onApply: jest.fn(),
  onStartEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onChangeEditName: jest.fn(),
  onChangeEditDescription: jest.fn(),
  onToggleEditRoutine: jest.fn(),
};

describe("PresetCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集・コピー・削除ボタンをラベル付きで表示する", () => {
    render(<PresetCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("コピーボタンクリックで onDuplicate が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /コピー/ }));
    expect(defaultProps.onDuplicate).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("編集ボタンクリックで onStartEdit が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(defaultProps.onStartEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("削除ボタンクリックで onDelete が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("カード本体クリックで onSelect が呼ばれる", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByText("朝ルーティン"));
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });
});
