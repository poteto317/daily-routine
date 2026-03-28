import "./RoutineItem.test.setup";
import { fireEvent, render, screen } from "@testing-library/react";
import { RoutineItem } from "../components/RoutineItem";
import {
  mockOnDelete,
  mockOnEdit,
  mockOnToggle,
  mockRoutine,
  resetRoutineItemMocks,
} from "./RoutineItem.test.setup";

describe("RoutineItem actions", () => {
  beforeEach(resetRoutineItemMocks);

  it("表示モードのカードクリックでonToggle", () => {
    render(
      <RoutineItem
        routine={mockRoutine}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isEditMode={false}
      />,
    );
    const card = screen.getByText("テストルーティン").closest("div");
    if (card) fireEvent.click(card);
    expect(mockOnToggle).toHaveBeenCalledWith("1");
  });

  it("編集/削除ボタンでそれぞれコールバック", () => {
    render(
      <RoutineItem
        routine={mockRoutine}
        onToggle={mockOnToggle}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );
    fireEvent.click(screen.getByText("編集"));
    fireEvent.click(screen.getByText("削除"));
    expect(mockOnEdit).toHaveBeenCalledWith(mockRoutine);
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });
});
