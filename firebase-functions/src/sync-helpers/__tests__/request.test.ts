/** @jest-environment node */
import type { Request } from "firebase-functions/https";
import { isPostMethod, parseSyncRequestBody } from "../request";

const parse = (body: unknown) => parseSyncRequestBody({ body } as Request);
const token = "notification-token";
const routine = {
  id: "r1",
  title: "Title",
  startTime: "08:30",
  daysOfWeek: [0, 7],
};

it("通知に必要な項目だけを残す", () => {
  expect(
    parse({
      token,
      routines: [{ ...routine, weeklyGoal: { targetPerWeek: 3 } }],
    }),
  ).toMatchObject({ success: true, data: { token, routines: [routine] } });
  const parsed = parse({
    token,
    routines: [{ ...routine, isCompleted: false }],
  });
  expect(parsed.success && parsed.data.routines[0]).toEqual(routine);
});

it("空の通知設定を許可する", () => {
  expect(parse({ token, routines: [] }).success).toBe(true);
});

it.each([
  undefined,
  { token: "", routines: [] },
  { token, routines: [null] },
  { token, routines: [{ ...routine, id: "" }] },
  { token, routines: [{ ...routine, startTime: "25:01" }] },
  { token, routines: [{ ...routine, daysOfWeek: [9] }] },
  { token, routines: [{ ...routine, notificationMinutes: "10" }] },
])("不正な設定を拒否する", (body) => {
  expect(parse(body).success).toBe(false);
});

it.each(["POST", "GET", "OPTIONS", "post"])(
  "POST だけを受付対象にする",
  (method) => {
    expect(isPostMethod(method)).toBe(method === "POST");
  },
);
