import { parseBody } from "../../validation";
import { generateId } from "../idGenerator";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { ResourceOperations } from "../types";
import { parseWorkoutLabelQuery } from "./workoutQueryParams";
import { readExercises, findExercise } from "./workoutExerciseStore";
import {
  parseWorkoutExerciseCreateInput,
  parseWorkoutExerciseNamePatch,
} from "./workoutExerciseInput";
import { assertUniqueExerciseName } from "./workoutExerciseRules";
import {
  createWorkoutExercise,
  renameWorkoutExercise,
} from "./workoutExerciseEntity";

export const workoutExerciseOperations: ResourceOperations = {
  list: ({ data, query }) => {
    const label = parseWorkoutLabelQuery(query.label);
    return okOutcome({
      exercises: readExercises(data).filter(
        (ex) => label === undefined || ex.label === label,
      ),
    });
  },
  create: ({ data, body, now }) => {
    const input = parseWorkoutExerciseCreateInput(body);
    const exercises = readExercises(data);
    assertUniqueExerciseName(exercises, input.name, input.label);
    const exercise = createWorkoutExercise(
      input,
      generateId("workout-exercise", now),
      now,
    );
    return createdOutcome(
      { exercise },
      { workoutExercises: [...exercises, exercise] },
    );
  },
  update: ({ data, body, now, id }) => {
    const input = parseBody(body, ["name"]);
    const exercises = readExercises(data);
    const existing = findExercise(exercises, id);
    const name = parseWorkoutExerciseNamePatch(input);
    assertUniqueExerciseName(exercises, name, existing.label, id);
    const exercise = renameWorkoutExercise(existing, name, now);
    return okOutcome(
      { exercise },
      {
        workoutExercises: exercises.map((ex) => (ex.id === id ? exercise : ex)),
      },
    );
  },
  remove: ({ data, id }) => {
    const exercises = readExercises(data);
    findExercise(exercises, id);
    return deletedOutcome(id, {
      workoutExercises: exercises.filter((ex) => ex.id !== id),
    });
  },
};
