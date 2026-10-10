/** @jest-environment node */
import { workoutExerciseOperations as ops } from "../operations/workout";
import { ctx, strength, running } from "./workoutFixtures";
import { expectApiError } from "./testUtils";
it("種別フィルタを適用して保存順で返す", () => {
  expect(ops.list(ctx()).body).toEqual({ exercises: [strength, running] });
  expect(ops.list(ctx({ query: { label: "running" } })).body).toEqual({
    exercises: [running],
  });
  expectApiError(
    () => ops.list(ctx({ query: { label: "bad" } })),
    400,
    "invalid_query",
  );
});
it("追加・改名・削除は記録を変更しない", () => {
  const created = ops.create(
    ctx({ body: { name: " スクワット ", label: "strength" } }),
  );
  expect(created.status).toBe(201);
  expect(created.body).toMatchObject({
    exercise: { name: "スクワット", label: "strength" },
  });
  expect(Object.keys(created.changes!)).toEqual(["workoutExercises"]);
  const updated = ops.update(ctx({ id: "s", body: { name: "プレス" } }));
  expect(updated.body).toMatchObject({
    exercise: {
      id: "s",
      name: "プレス",
      createdAt: strength.createdAt,
      updatedAt: "2026-10-08T00:00:00.000Z",
    },
  });
  expect(ops.remove(ctx({ id: "s" }))).toEqual({
    status: 200,
    body: { deleted: "s" },
    changes: { workoutExercises: [running] },
  });
});
it("同種別の重複を拒否し、同じIDの改名と異種別同名は受け付ける", () => {
  expectApiError(
    () => ops.create(ctx({ body: { name: " ベンチ ", label: "strength" } })),
    400,
    "invalid_field",
  );
  expect(() =>
    ops.update(ctx({ id: "s", body: { name: "ベンチ" } })),
  ).not.toThrow();
  expect(
    ops.create(ctx({ body: { name: "ベンチ", label: "running" } })).status,
  ).toBe(201);
});
it.each([
  {},
  { name: " ", label: "strength" },
  { name: "a".repeat(101), label: "strength" },
  { name: "x", label: "bad" },
  { name: null, label: "running" },
])("不正入力を拒否: %j", (body) => {
  expectApiError(() => ops.create(ctx({ body })), 400, "invalid_field");
});
it("空PATCH・未知フィールド・不存在を拒否する", () => {
  expectApiError(
    () => ops.update(ctx({ id: "s", body: {} })),
    400,
    "empty_patch",
  );
  expectApiError(
    () => ops.update(ctx({ id: "s", body: { label: "running" } })),
    400,
    "unknown_field",
  );
  expectApiError(
    () => ops.update(ctx({ id: "gone", body: { name: "x" } })),
    404,
    "not_found",
  );
  expectApiError(() => ops.remove(ctx({ id: "gone" })), 404, "not_found");
});
