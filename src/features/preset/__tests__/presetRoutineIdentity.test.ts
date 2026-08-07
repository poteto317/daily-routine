import { buildRoutineIdentityKey } from "../presetRoutineIdentity";

describe("buildRoutineIdentityKey", () => {
  it("同一のtitle・startTimeなら同じキーを返す", () => {
    expect(buildRoutineIdentityKey("朝食", "07:00")).toBe(
      buildRoutineIdentityKey("朝食", "07:00"),
    );
  });

  it("titleが異なれば異なるキーを返す", () => {
    expect(buildRoutineIdentityKey("朝食", "07:00")).not.toBe(
      buildRoutineIdentityKey("運動", "07:00"),
    );
  });

  it("startTimeが異なれば異なるキーを返す", () => {
    expect(buildRoutineIdentityKey("朝食", "07:00")).not.toBe(
      buildRoutineIdentityKey("朝食", "08:00"),
    );
  });
});
