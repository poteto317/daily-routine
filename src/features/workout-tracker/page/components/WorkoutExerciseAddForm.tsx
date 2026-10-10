import { useId, useState } from "react";
import texts from "../../locales/ja.json";
import { inputClassName } from "./workoutFormFieldStyles";

export const WorkoutExerciseAddForm = ({
  add,
}: {
  add: (name: string) => boolean;
}) => {
  const [name, setName] = useState("");
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="block text-sm">
        {texts.exercises.newNameLabel}
      </label>
      <input
        id={id}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClassName}
      />
      <button
        type="button"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          if (add(name)) setName("");
        }}
      >
        {texts.exercises.add}
      </button>
    </>
  );
};
