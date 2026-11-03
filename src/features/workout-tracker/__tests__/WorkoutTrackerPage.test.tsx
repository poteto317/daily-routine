import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutTrackerPage } from "../WorkoutTrackerPage";
import { useWorkoutTrackerPageState } from "../page/useWorkoutTrackerPageState";
import texts from "../locales/ja.json";

jest.mock("../page/useWorkoutTrackerPageState", () => ({
  useWorkoutTrackerPageState: jest.fn(),
}));

const mockUseWorkoutTrackerPageState =
  useWorkoutTrackerPageState as jest.MockedFunction<
    typeof useWorkoutTrackerPageState
  >;

const baseFormValues = {
  label: "strength" as const,
  date: "2026-03-01",
  exerciseId: "",
  weightKg: "",
  reps: "",
  sets: "1",
  caloriesBurned: "",
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  exercises: [],
  exerciseActions: {
    add: jest.fn(),
    rename: jest.fn(),
    remove: jest.fn(),
    error: null,
  },
  formValues: baseFormValues,
  formError: null,
  groups: [],
  setLabel: jest.fn(),
  setDate: jest.fn(),
  setExerciseId: jest.fn(),
  setWeightKg: jest.fn(),
  setReps: jest.fn(),
  setSets: jest.fn(),
  setCaloriesBurned: jest.fn(),
  onSubmitAction: jest.fn(),
  onDeleteRecordAction: jest.fn(),
  ...overrides,
});

describe("WorkoutTrackerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("タイトルを表示する", () => {
    mockUseWorkoutTrackerPageState.mockReturnValue(createState());
    render(<WorkoutTrackerPage />);

    expect(screen.getByText(texts.page.title)).toBeInTheDocument();
  });

  it("記録がなければ空メッセージを表示する", () => {
    mockUseWorkoutTrackerPageState.mockReturnValue(createState());
    render(<WorkoutTrackerPage />);

    expect(screen.getByText(texts.historyList.empty)).toBeInTheDocument();
  });

  it("記録があれば履歴一覧に表示する", () => {
    mockUseWorkoutTrackerPageState.mockReturnValue(
      createState({
        groups: [
          {
            date: "2026-03-01",
            records: [
              {
                id: "1",
                date: "2026-03-01",
                label: "strength",
                exerciseName: "ベンチプレス",
                exerciseId: "ベンチプレス",
                weightKg: 60,
                reps: 10,
                createdAt: "2026-03-01T00:00:00.000Z",
                updatedAt: "2026-03-01T00:00:00.000Z",
              },
            ],
          },
        ],
      }),
    );
    render(<WorkoutTrackerPage />);

    expect(screen.getByText(/ベンチプレス/)).toBeInTheDocument();
  });

  it("追加ボタンをクリックするとonSubmitActionが呼ばれる", () => {
    const state = createState();
    mockUseWorkoutTrackerPageState.mockReturnValue(state);
    render(<WorkoutTrackerPage />);

    fireEvent.click(screen.getByRole("button", { name: texts.form.addButton }));

    expect(state.onSubmitAction).toHaveBeenCalledTimes(1);
  });
});
