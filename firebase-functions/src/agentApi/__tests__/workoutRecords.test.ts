/** @jest-environment node */
import { workoutRecordOperations as ops } from "../operations/workout";
import { ctx, oldRecord, strength, running } from "./workoutFixtures";
import { expectApiError } from "./testUtils";
const create = { date: "2026-10-08", exerciseId: "s", weightKg: 60, reps: 10 };
it("種目から種別と名前を確定しID・時刻を付けて日別に保存する", () => {
  const result = ops.create(ctx({ body: create }));
  expect(result.status).toBe(201);
  expect(result.body).toMatchObject({
    record: {
      ...create,
      label: "strength",
      exerciseName: "ベンチ",
      createdAt: "2026-10-08T00:00:00.000Z",
      updatedAt: "2026-10-08T00:00:00.000Z",
    },
  });
  expect(result.changes).toMatchObject({
    workoutRecordHistory: {
      "2026-10-01": [oldRecord],
      "2026-10-08": [expect.objectContaining({ exerciseId: "s" })],
    },
  });
  expect(
    ops.create(
      ctx({
        body: { date: "2026-10-08", exerciseId: "r", caloriesBurned: 0.5 },
      }),
    ).body,
  ).toMatchObject({
    record: { label: "running", exerciseName: "ジョグ", caloriesBurned: 0.5 },
  });
});
it.each([
  {},
  { ...create, exerciseId: "missing" },
  { ...create, date: "2026-02-30" },
  { ...create, weightKg: 0 },
  { ...create, reps: "10" },
  { ...create, sets: -1 },
  { ...create, sets: null },
  { ...create, weightKg: Infinity },
])("不正な作成を拒否: %j", (body) => {
  expectApiError(() => ops.create(ctx({ body })), 400, "invalid_field");
});
it.each([
  { ...create, caloriesBurned: 30 },
  { ...create, exerciseName: "勝手な名前" },
  { ...create, label: "running" },
])("種別の混在・サーバー管理フィールドを拒否", (body) => {
  expectApiError(() => ops.create(ctx({ body })), 400, "unknown_field");
});
it("ID省略・同じIDを明示した数値更新で名前を変更しない", () => {
  for (const body of [{ reps: 12 }, { exerciseId: "s", reps: 12 }])
    expect(ops.update(ctx({ id: "old", body })).body).toMatchObject({
      record: {
        exerciseName: "昔のベンチ",
        reps: 12,
        createdAt: oldRecord.createdAt,
      },
    });
});
it("削除済み種目とIDのない旧記録も数値更新できる", () => {
  expect(
    ops.update(
      ctx({
        id: "old",
        body: { reps: 12 },
        data: {
          workoutExercises: [],
          workoutRecordHistory: { "2026-10-01": [oldRecord] },
        },
      }),
    ).body,
  ).toMatchObject({ record: { exerciseId: "s", exerciseName: "昔のベンチ" } });
  const legacy = Object.fromEntries(
    Object.entries(oldRecord).filter(([key]) => key !== "exerciseId"),
  );
  expect(
    ops.update(
      ctx({
        id: "old",
        body: { exerciseId: "s" },
        data: {
          workoutExercises: [strength],
          workoutRecordHistory: { "2026-10-01": [legacy] },
        },
      }),
    ).body,
  ).toMatchObject({ record: { exerciseId: "s", exerciseName: "ベンチ" } });
});
it("別の同種別へ付替えでき、別種別や存在しない種目は拒否する", () => {
  const data = {
    ...ctx().data,
    workoutExercises: [
      strength,
      running,
      { ...strength, id: "s2", name: "プレス" },
    ],
  };
  expect(
    ops.update(ctx({ data, id: "old", body: { exerciseId: "s2" } })).body,
  ).toMatchObject({ record: { exerciseId: "s2", exerciseName: "プレス" } });
  for (const exerciseId of ["r", "gone"])
    expectApiError(
      () => ops.update(ctx({ data, id: "old", body: { exerciseId } })),
      400,
      "invalid_field",
    );
});
it("日付の変更はバケット移動し、sets:nullで解除する", () => {
  const result = ops.update(
    ctx({ id: "old", body: { date: "2026-10-08", sets: null } }),
  );
  expect(result.changes!.workoutRecordHistory).not.toHaveProperty("2026-10-01");
  expect(result.body).toMatchObject({ record: { date: "2026-10-08" } });
  expect((result.body as { record: object }).record).not.toHaveProperty("sets");
});
it("削除すると最後のバケットも消す", () => {
  expect(ops.remove(ctx({ id: "old" }))).toEqual({
    status: 200,
    body: { deleted: "old" },
    changes: { workoutRecordHistory: {} },
  });
});
it("フィルタはAND、日付未指定はcreatedAt降順・ID昇順", () => {
  const newer = {
    ...oldRecord,
    id: "a",
    date: "2026-10-02",
    createdAt: "2026-10-02T00:00:00.000Z",
  };
  const other = { ...newer, id: "b", exerciseId: "gone" };
  const data = {
    workoutRecordHistory: {
      "2026-10-01": [oldRecord],
      "2026-10-02": [other, newer],
    },
  };
  expect(ops.list(ctx({ data })).body).toEqual({
    records: [newer, other, oldRecord],
  });
  expect(
    ops.list(
      ctx({
        data,
        query: { date: "2026-10-02", label: "strength", exerciseId: "gone" },
      }),
    ).body,
  ).toEqual({ records: [other] });
  expect(ops.list(ctx({ data, query: { label: "running" } })).body).toEqual({
    records: [],
  });
});
it("空PATCH、不存在、無効な絞り込みを拒否する", () => {
  expectApiError(
    () => ops.update(ctx({ id: "old", body: {} })),
    400,
    "empty_patch",
  );
  expectApiError(
    () => ops.update(ctx({ id: "none", body: { reps: 2 } })),
    404,
    "not_found",
  );
  expectApiError(() => ops.remove(ctx({ id: "none" })), 404, "not_found");
  for (const query of [{ date: "bad" }, { label: "bad" }, { exerciseId: " " }])
    expectApiError(() => ops.list(ctx({ query })), 400, "invalid_query");
});
