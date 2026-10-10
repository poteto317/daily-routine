import { setCurrentUserId } from "@/lib/storage/core";
import {
  addWorkoutExercise,
  deleteWorkoutExercise,
  getWorkoutExercises,
  renameWorkoutExercise,
} from "../storageExercises";
import {
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "../storageData";

afterEach(() => {
  jest.restoreAllMocks();
  setCurrentUserId(null);
  localStorage.clear();
});

it("種目の改名と削除で過去記録の名前を変えない", () => {
  const exercise = addWorkoutExercise({
    name: " ベンチプレス ",
    label: "strength",
  });
  expect(exercise.name).toBe("ベンチプレス");
  saveWorkoutRecordHistory({
    "2026-10-08": [
      {
        id: "old",
        date: "2026-10-08",
        label: "strength",
        exerciseName: "ベンチプレス",
        weightKg: 50,
        reps: 10,
        createdAt: "2026-10-08T00:00:00Z",
        updatedAt: "2026-10-08T00:00:00Z",
      },
    ],
  });
  renameWorkoutExercise(exercise.id, "チェストプレス");
  expect(getWorkoutExercises()[0].name).toBe("チェストプレス");
  deleteWorkoutExercise(exercise.id);
  expect(getWorkoutExercises()).toEqual([]);
  expect(getWorkoutRecordHistory()["2026-10-08"][0].exerciseName).toBe(
    "ベンチプレス",
  );
});
it("同種別の重複を拒否し、別種別の同名と自分自身の改名は許可する", () => {
  const ex = addWorkoutExercise({ name: "トレーニング", label: "strength" });
  expect(() =>
    addWorkoutExercise({ name: " トレーニング ", label: "strength" }),
  ).toThrow();
  expect(() => renameWorkoutExercise(ex.id, "トレーニング")).not.toThrow();
  addWorkoutExercise({ name: "トレーニング", label: "running" });
  expect(getWorkoutExercises()).toHaveLength(2);
});
it.each([" ", "a".repeat(101)])("不正な名前を保存しない: %s", (name) => {
  expect(() => addWorkoutExercise({ name, label: "strength" })).toThrow();
  expect(getWorkoutExercises()).toEqual([]);
});
it("アカウントごとに種目を分離する", () => {
  setCurrentUserId("alice");
  addWorkoutExercise({ name: "ベンチ", label: "strength" });
  setCurrentUserId("bob");
  expect(getWorkoutExercises()).toEqual([]);
  setCurrentUserId("alice");
  expect(getWorkoutExercises()[0].name).toBe("ベンチ");
});
it("保存失敗を成功扱いせず呼び出し元へ伝える", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("full", "QuotaExceededError");
  });
  expect(() =>
    addWorkoutExercise({ name: "ベンチ", label: "strength" }),
  ).toThrow();
  expect(getWorkoutExercises()).toEqual([]);
});
it("存在しない種目の改名と削除を拒否する", () => {
  expect(() => renameWorkoutExercise("missing", "ベンチ")).toThrow();
  expect(() => deleteWorkoutExercise("missing")).toThrow();
});
