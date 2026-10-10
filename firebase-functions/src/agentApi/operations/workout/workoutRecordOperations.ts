import { asJsonObject } from "../../validation/body";
import { parseQueryDate } from "../../validation";
import { generateId } from "../idGenerator";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { ResourceOperations } from "../types";
import {
  parseExerciseIdQuery,
  parseWorkoutLabelQuery,
} from "./workoutQueryParams";
import { resolveExercise } from "./workoutExerciseStore";
import { parseWorkoutRecordCreateInput } from "./workoutRecordCreateInput";
import { parseWorkoutRecordPatchInput } from "./workoutRecordPatchInput";
import {
  createWorkoutRecord,
  updateWorkoutRecord,
} from "./workoutRecordEntity";
import {
  readWorkoutHistory,
  findWorkoutRecord,
  removeFromHistory,
  appendWorkoutRecord,
  replaceWorkoutRecord,
  listWorkoutRecords,
} from "./workoutRecordStore";

export const workoutRecordOperations: ResourceOperations = {
  list: ({ data, query }) => {
    const filters = {
      date: parseQueryDate(query.date),
      label: parseWorkoutLabelQuery(query.label),
      exerciseId: parseExerciseIdQuery(query.exerciseId),
    };
    return okOutcome({
      records: listWorkoutRecords(readWorkoutHistory(data), filters),
    });
  },
  create: ({ data, body, now }) => {
    const input = parseWorkoutRecordCreateInput(body, (id) =>
      resolveExercise(data, id),
    );
    const record = createWorkoutRecord(input, generateId("workout", now), now);
    return createdOutcome(
      { record },
      {
        workoutRecordHistory: appendWorkoutRecord(
          readWorkoutHistory(data),
          record,
        ),
      },
    );
  },
  update: ({ data, body, now, id }) => {
    const input = asJsonObject(body);
    const history = readWorkoutHistory(data);
    const found = findWorkoutRecord(history, id);
    const patch = parseWorkoutRecordPatchInput(
      input,
      found.record.label,
      (exerciseId) => resolveExercise(data, exerciseId),
    );
    const record = updateWorkoutRecord(found.record, patch, now);
    return okOutcome(
      { record },
      {
        workoutRecordHistory: replaceWorkoutRecord(history, found.key, record),
      },
    );
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
