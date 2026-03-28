import { render, screen, fireEvent } from "@testing-library/react";
import { RoutineForm } from "../components/RoutineForm";

// storage をモック
jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(() => ({
    defaultNotificationMinutes: 15,
    defaultDurationMinutes: 30,
    theme: "auto",
  })),
}));

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  hasTimeConflict: jest.fn(() => ({
    hasConflict: false,
    conflictingRoutines: [],
  })),
  findNextAvailableTime: jest.fn(() => "09:00"),
}));

describe("RoutineForm", () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("新規作成フォームが正しく表示される", () => {
    render(<RoutineForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByText("新しいルーティン")).toBeInTheDocument();
    expect(screen.getByText("タイトル *")).toBeInTheDocument();
    expect(screen.getByText("カテゴリ *")).toBeInTheDocument();
  });

  it("タイトルを入力できる", () => {
    render(<RoutineForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const titleInput = screen.getByPlaceholderText(
      "例: 朝のストレッチ",
    ) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "朝の運動" } });

    expect(titleInput.value).toBe("朝の運動");
  });

  it("キャンセルボタンでonCancelが呼ばれる", () => {
    render(<RoutineForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("編集モードでは既存データが表示される", () => {
    const existingRoutine = {
      id: "1",
      title: "既存ルーティン",
      startTime: "10:00",
      duration: 45,
      category: "health" as const,
      daysOfWeek: [1, 2, 3],
      isCompleted: false,
      description: "テスト説明",
      notificationMinutes: 10,
      sortOrder: 0,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };

    render(
      <RoutineForm
        routine={existingRoutine}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    expect(screen.getByText("ルーティンを編集")).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText(
      "例: 朝のストレッチ",
    ) as HTMLInputElement;
    expect(titleInput.value).toBe("既存ルーティン");
  });
});
