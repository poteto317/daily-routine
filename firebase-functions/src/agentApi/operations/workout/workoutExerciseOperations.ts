import { emptyPatch, notFound } from "../../errors";
import { parseBody, readEnum, readString, required } from "../../validation";
import { invalidField } from "../../validation/fieldError";
import { generateId } from "../idGenerator";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { ResourceOperations } from "../types";
import { parseWorkoutLabelQuery } from "./workoutInput";
import { readExercises } from "./workoutStore";
import {
  WORKOUT_LABELS,
  type WorkoutExercise,
  type WorkoutLabel,
} from "./workoutTypes";

const assertUnique = (
  exercises: WorkoutExercise[],
  name: string,
  label: WorkoutLabel,
  id?: string,
): void => {
  if (
    exercises.some(
      (ex) => ex.id !== id && ex.label === label && ex.name === name,
    )
  )
    throw invalidField("name", "同じ種類に同名の種目があります");
};
const nameOptions = { maxLength: 100, trim: true } as const;
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
    const input = parseBody(body, ["name", "label"]);
    const name = required("name", readString(input, "name", nameOptions));
    const label = required("label", readEnum(input, "label", WORKOUT_LABELS));
    const exercises = readExercises(data);
    assertUnique(exercises, name, label);
    const exercise: WorkoutExercise = {
      id: generateId("workout-exercise", now),
      name,
      label,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    return createdOutcome(
      { exercise },
      { workoutExercises: [...exercises, exercise] },
    );
  },
  update: ({ data, body, now, id }) => {
    const input = parseBody(body, ["name"]);
    const exercises = readExercises(data);
    const existing = exercises.find((ex) => ex.id === id);
    if (!existing) throw notFound("種目");
    if (!Object.keys(input).length) throw emptyPatch();
    const name = required("name", readString(input, "name", nameOptions));
    assertUnique(exercises, name, existing.label, id);
    const exercise = { ...existing, name, updatedAt: now.toISOString() };
    return okOutcome(
      { exercise },
      {
        workoutExercises: exercises.map((ex) => (ex.id === id ? exercise : ex)),
      },
    );
  },
  remove: ({ data, id }) => {
    const exercises = readExercises(data);
    if (!exercises.some((ex) => ex.id === id)) throw notFound("種目");
    return deletedOutcome(id, {
      workoutExercises: exercises.filter((ex) => ex.id !== id),
    });
  },
};
