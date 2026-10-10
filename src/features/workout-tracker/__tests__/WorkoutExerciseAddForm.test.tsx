import { fireEvent, render, screen } from "@testing-library/react";
import { WorkoutExerciseAddForm } from "../page/components/WorkoutExerciseAddForm";
import texts from "../locales/ja.json";
it("失敗時は入力を残し、成功時だけ消す", () => {
  const add = jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
  render(<WorkoutExerciseAddForm add={add} />);
  const input = screen.getByLabelText(texts.exercises.newNameLabel);
  fireEvent.change(input, { target: { value: "ベンチ" } });
  fireEvent.click(screen.getByRole("button", { name: texts.exercises.add }));
  expect(input).toHaveValue("ベンチ");
  fireEvent.click(screen.getByRole("button", { name: texts.exercises.add }));
  expect(input).toHaveValue("");
  expect(add.mock.calls).toEqual([["ベンチ"], ["ベンチ"]]);
});
