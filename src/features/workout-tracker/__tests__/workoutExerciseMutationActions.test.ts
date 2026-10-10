import { createWorkoutExerciseMutationActions } from "../page/workoutExerciseMutationActions";
import {
  addWorkoutExercise,
  renameWorkoutExercise,
  deleteWorkoutExercise,
} from "../storage";
import texts from "../locales/ja.json";

jest.mock("../storage", () => ({
  addWorkoutExercise: jest.fn(),
  renameWorkoutExercise: jest.fn(),
  deleteWorkoutExercise: jest.fn(),
}));
const exercise = {
  id: "s",
  name: "ベンチ",
  label: "strength" as const,
  createdAt: "",
  updatedAt: "",
};
const setup = (selectedId = "s") => {
  const context = {
    label: "strength" as const,
    selectedId,
    select: jest.fn(),
    reload: jest.fn(),
    setError: jest.fn(),
    confirm: jest.fn(() => true),
  };
  return { ...context, actions: createWorkoutExerciseMutationActions(context) };
};
beforeEach(() => jest.resetAllMocks());
it("追加成功時に保存されたIDを選択して一覧とエラーを更新する", () => {
  jest.mocked(addWorkoutExercise).mockReturnValue(exercise);
  const { actions, select, reload, setError } = setup();
  expect(actions.add("ベンチ")).toBe(true);
  expect(addWorkoutExercise).toHaveBeenCalledWith({
    name: "ベンチ",
    label: "strength",
  });
  expect(select).toHaveBeenCalledWith("s");
  expect(reload).toHaveBeenCalledTimes(1);
  expect(setError).toHaveBeenCalledWith(null);
});
it.each([new Error("保存エラー"), "failure"])(
  "追加失敗時は選択・一覧を変えずエラーを通知する: %s",
  (error) => {
    jest.mocked(addWorkoutExercise).mockImplementation(() => {
      throw error;
    });
    const { actions, select, reload, setError } = setup();
    expect(actions.add("ベンチ")).toBe(false);
    expect(select).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith(
      error instanceof Error ? error.message : texts.exercises.saveFailed,
    );
  },
);
it("改名では選択を変更しない", () => {
  const { actions, select, reload } = setup();
  expect(actions.rename("s", "プレス")).toBe(true);
  expect(renameWorkoutExercise).toHaveBeenCalledWith("s", "プレス");
  expect(select).not.toHaveBeenCalled();
  expect(reload).toHaveBeenCalledTimes(1);
});
it("削除キャンセル時は既存エラーも含め状態を維持する", () => {
  const { actions, confirm, select, reload, setError } = setup();
  confirm.mockReturnValue(false);
  expect(actions.remove(exercise)).toBe(false);
  expect(confirm).toHaveBeenCalledWith(
    texts.exercises.confirmDelete.replace("{name}", exercise.name),
  );
  expect(deleteWorkoutExercise).not.toHaveBeenCalled();
  for (const fn of [select, reload, setError])
    expect(fn).not.toHaveBeenCalled();
});
it.each(["s", "other"])(
  "選択中の種目を削除した場合だけ選択解除する: %s",
  (id) => {
    const { actions, select, reload } = setup(id);
    expect(actions.remove(exercise)).toBe(true);
    expect(deleteWorkoutExercise).toHaveBeenCalledWith("s");
    expect(select.mock.calls).toEqual(id === "s" ? [[""]] : []);
    expect(reload).toHaveBeenCalledTimes(1);
  },
);
it("削除保存失敗時は選択を解除しない", () => {
  jest.mocked(deleteWorkoutExercise).mockImplementation(() => {
    throw new Error("失敗");
  });
  const { actions, select, reload } = setup();
  expect(actions.remove(exercise)).toBe(false);
  expect(select).not.toHaveBeenCalled();
  expect(reload).not.toHaveBeenCalled();
});
