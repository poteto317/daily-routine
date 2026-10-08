import { emptyPatch } from "../../errors";
import { asJsonObject } from "../../validation/body";
import { readDate, required, parseQueryDate } from "../../validation";
import { invalidField } from "../../validation/fieldError";
import { generateId } from "../idGenerator";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { ResourceOperations } from "../types";
import {
  assertRecordKeys,
  readExerciseId,
  readPositiveNumber,
  parseExerciseIdQuery,
  parseWorkoutLabelQuery,
} from "./workoutInput";
import {
  readWorkoutHistory,
  resolveExercise,
  findWorkoutRecord,
  removeFromHistory,
} from "./workoutStore";
import type { WorkoutRecord } from "./workoutTypes";

export const workoutRecordOperations: ResourceOperations = {
  list: ({ data, query }) => {
    const date = parseQueryDate(query.date);
    const label = parseWorkoutLabelQuery(query.label);
    const exerciseId = parseExerciseIdQuery(query.exerciseId);
    const records = Object.values(readWorkoutHistory(data))
      .flat()
      .filter(
        (record) =>
          (date === undefined || record.date === date) &&
          (label === undefined || record.label === label) &&
          (exerciseId === undefined || record.exerciseId === exerciseId),
      )
      .sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
      );
    return okOutcome({ records });
  },
  create: ({ data, body, now }) => {
    const input = asJsonObject(body);
    const date = required("date", readDate(input, "date"));
    const exerciseId = required("exerciseId", readExerciseId(input));
    const exercise = resolveExercise(data, exerciseId);
    assertRecordKeys(input, exercise.label);
    const base = {
      id: generateId("workout", now),
      date,
      exerciseId,
      exerciseName: exercise.name,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    const sets =
      exercise.label === "strength"
        ? readPositiveNumber(input, "sets")
        : undefined;
    const record: WorkoutRecord =
      exercise.label === "strength"
        ? {
            ...base,
            label: "strength",
            weightKg: required(
              "weightKg",
              readPositiveNumber(input, "weightKg"),
            ),
            reps: required("reps", readPositiveNumber(input, "reps")),
            ...(sets !== undefined ? { sets } : {}),
          }
        : {
            ...base,
            label: "running",
            caloriesBurned: required(
              "caloriesBurned",
              readPositiveNumber(input, "caloriesBurned"),
            ),
          };
    const history = readWorkoutHistory(data);
    return createdOutcome(
      { record },
      {
        workoutRecordHistory: {
          ...history,
          [date]: [...(history[date] ?? []), record],
        },
      },
    );
  },
  update: ({ data, body, now, id }) => {
    const input = asJsonObject(body);
    const history = readWorkoutHistory(data);
    const found = findWorkoutRecord(history, id);
    assertRecordKeys(input, found.record.label);
    if (!Object.keys(input).length) throw emptyPatch();
    const record = { ...found.record, updatedAt: now.toISOString() };
    const date = readDate(input, "date");
    if (date !== undefined) record.date = date;
    const exerciseId = readExerciseId(input);
    if (exerciseId !== undefined) {
      const exercise = resolveExercise(data, exerciseId);
      if (exercise.label !== record.label)
        throw invalidField("exerciseId", "異なる種類の種目には変更できません");
      // 同じ ID の再指定では記録時の名前を保つ。
      if (exerciseId !== record.exerciseId) {
        record.exerciseId = exerciseId;
        record.exerciseName = exercise.name;
      }
    }
    if (record.label === "strength") {
      const weightKg = readPositiveNumber(input, "weightKg");
      const reps = readPositiveNumber(input, "reps");
      if (weightKg !== undefined) record.weightKg = weightKg;
      if (reps !== undefined) record.reps = reps;
      if (input.sets === null) delete record.sets;
      else {
        const sets = readPositiveNumber(input, "sets");
        if (sets !== undefined) record.sets = sets;
      }
    } else {
      const calories = readPositiveNumber(input, "caloriesBurned");
      if (calories !== undefined) record.caloriesBurned = calories;
    }
    const next =
      record.date === found.key
        ? {
            ...history,
            [found.key]: history[found.key].map((item) =>
              item.id === id ? record : item,
            ),
          }
        : removeFromHistory(history, found.key, record.id);
    if (record.date !== found.key)
      next[record.date] = [...(next[record.date] ?? []), record];
    return okOutcome({ record }, { workoutRecordHistory: next });
  },
  remove: ({ data, id }) => {
    const history = readWorkoutHistory(data);
    const found = findWorkoutRecord(history, id);
    return deletedOutcome(id, {
      workoutRecordHistory: removeFromHistory(
        history,
        found.key,
        found.record.id,
      ),
    });
  },
};
