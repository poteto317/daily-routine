import { hasValidRoutineShape } from "../routineShapeValidation";

const valid = {
  id: "r1",
  title: "朝食",
  startTime: "07:00",
  daysOfWeek: [1, 2],
};

describe("hasValidRoutineShape", () => {
  it("必要な項目がそろっていれば true", () => {
    expect(hasValidRoutineShape(valid)).toBe(true);
  });

  it("余分な項目があっても true", () => {
    expect(
      hasValidRoutineShape({ ...valid, duration: 30, category: "life" }),
    ).toBe(true);
  });

  it("曜日が空配列でも true", () => {
    // 曜日を1つも選べない画面ではないが、保存済みデータとしてはありうる
    expect(hasValidRoutineShape({ ...valid, daysOfWeek: [] })).toBe(true);
  });

  it.each([
    ["id が無い", { ...valid, id: undefined }],
    ["title が無い", { ...valid, title: undefined }],
    ["startTime が無い", { ...valid, startTime: undefined }],
    ["daysOfWeek が無い", { ...valid, daysOfWeek: undefined }],
  ])("%s と false", (_label, value) => {
    expect(hasValidRoutineShape(value)).toBe(false);
  });

  it.each([
    ["id が文字列でない", { ...valid, id: 1 }],
    ["title が文字列でない", { ...valid, title: 1 }],
    ["startTime が文字列でない", { ...valid, startTime: 700 }],
    ["daysOfWeek が配列でない", { ...valid, daysOfWeek: "月" }],
  ])("%s と false", (_label, value) => {
    expect(hasValidRoutineShape(value)).toBe(false);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["文字列", "routine"],
    ["配列", []],
  ])("%s は false", (_label, value) => {
    expect(hasValidRoutineShape(value)).toBe(false);
  });
});
