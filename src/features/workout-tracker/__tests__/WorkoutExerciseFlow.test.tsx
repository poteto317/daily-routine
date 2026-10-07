import { fireEvent, render, screen, within } from "@testing-library/react";
import { WorkoutTrackerPage } from "../WorkoutTrackerPage";
import {
  addWorkoutExercise,
  getWorkoutExercises,
  getAllWorkoutRecords,
  saveWorkoutRecordHistory,
} from "../storage";
import texts from "../locales/ja.json";

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});
const selectExercise = () => screen.getByRole("combobox", { name: "種目名" });
const openManager = () => fireEvent.click(screen.getByText("種目を管理"));
it("種目を追加すると選択され、改名・削除しても記録時の名前が残る", () => {
  render(<WorkoutTrackerPage />);
  expect(selectExercise()).toHaveValue("");
  openManager();
  fireEvent.change(screen.getByLabelText("新しい種目名"), {
    target: { value: "ベンチ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "種目を追加" }));
  const id = getWorkoutExercises()[0].id;
  expect(selectExercise()).toHaveValue(id);
  fireEvent.change(screen.getByPlaceholderText(texts.form.weightPlaceholder), {
    target: { value: "60" },
  });
  fireEvent.change(screen.getByPlaceholderText(texts.form.repsPlaceholder), {
    target: { value: "10" },
  });
  fireEvent.click(screen.getByRole("button", { name: "追加" }));
  expect(getAllWorkoutRecords()[0]).toMatchObject({
    exerciseId: id,
    exerciseName: "ベンチ",
    weightKg: 60,
  });
  fireEvent.change(screen.getByLabelText("種目名を変更：ベンチ"), {
    target: { value: "プレス" },
  });
  fireEvent.click(screen.getByRole("button", { name: "名前を保存" }));
  expect(
    within(selectExercise()).getByRole("option", { name: "プレス" }),
  ).toBeInTheDocument();
  fireEvent.change(selectExercise(), { target: { value: id } });
  jest
    .spyOn(window, "confirm")
    .mockReturnValueOnce(false)
    .mockReturnValue(true);
  fireEvent.click(screen.getByRole("button", { name: "種目を削除" }));
  expect(getWorkoutExercises()).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "種目を削除" }));
  expect(selectExercise()).toHaveValue("");
  expect(getAllWorkoutRecords()[0].exerciseName).toBe("ベンチ");
  expect(screen.getByText(/ベンチ/)).toBeInTheDocument();
});
it("種別の切替で選択を解除し候補を絞る", () => {
  const strength = addWorkoutExercise({ name: "ベンチ", label: "strength" });
  addWorkoutExercise({ name: "ジョグ", label: "running" });
  render(<WorkoutTrackerPage />);
  fireEvent.change(selectExercise(), { target: { value: strength.id } });
  fireEvent.click(screen.getByRole("radio", { name: texts.form.labelRunning }));
  expect(selectExercise()).toHaveValue("");
  expect(
    within(selectExercise()).queryByRole("option", { name: "ベンチ" }),
  ).not.toBeInTheDocument();
  expect(
    within(selectExercise()).getByRole("option", { name: "ジョグ" }),
  ).toBeInTheDocument();
});
it("保存に失敗した記録の入力を残す", () => {
  const ex = addWorkoutExercise({ name: "ジョグ", label: "running" });
  render(<WorkoutTrackerPage />);
  fireEvent.click(screen.getByRole("radio", { name: texts.form.labelRunning }));
  fireEvent.change(selectExercise(), { target: { value: ex.id } });
  const calories = screen.getByPlaceholderText(texts.form.caloriesPlaceholder);
  fireEvent.change(calories, { target: { value: "300" } });
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("full");
  });
  fireEvent.click(screen.getByRole("button", { name: "追加" }));
  expect(calories).toHaveValue(300);
  expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(getAllWorkoutRecords()).toEqual([]);
});
it("種目IDのない旧記録も表示する", () => {
  saveWorkoutRecordHistory({
    "2026-10-07": [
      {
        id: "legacy",
        label: "running",
        date: "2026-10-07",
        exerciseName: "昔のラン",
        caloriesBurned: 200,
        createdAt: "2026-10-07T00:00:00Z",
        updatedAt: "2026-10-07T00:00:00Z",
      },
    ],
  });
  render(<WorkoutTrackerPage />);
  expect(screen.getByText(/昔のラン/)).toBeInTheDocument();
});
