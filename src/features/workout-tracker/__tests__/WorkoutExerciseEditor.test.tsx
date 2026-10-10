import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutExerciseEditor } from "../page/components/WorkoutExerciseEditor";
import texts from "../locales/ja.json";

it("編集中の名前を改名操作へ渡し、削除には元の種目を渡す", () => {
  const exercise = {
    id: "s",
    name: "ベンチ",
    label: "strength" as const,
    createdAt: "",
    updatedAt: "",
  };
  const actions = {
    rename: jest.fn(() => false),
    remove: jest.fn(() => false),
  };
  render(
    <ul>
      <WorkoutExerciseEditor exercise={exercise} actions={actions} />
    </ul>,
  );
  const input = screen.getByLabelText(
    texts.exercises.renameLabel.replace("{name}", exercise.name),
  );
  fireEvent.change(input, { target: { value: "プレス" } });
  fireEvent.click(screen.getByRole("button", { name: texts.exercises.save }));
  expect(actions.rename).toHaveBeenCalledWith("s", "プレス");
  expect(input).toHaveValue("プレス");
  fireEvent.click(screen.getByRole("button", { name: texts.exercises.delete }));
  expect(actions.remove).toHaveBeenCalledWith(exercise);
});
