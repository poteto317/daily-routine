import { isWorkoutDate, toPositiveNumber } from "../workoutFormValueParsers";
it.each(["", " ", "0", "-1", "NaN", "Infinity"])(
  "正の有限数以外を拒否する: %s",
  (value) => {
    expect(toPositiveNumber(value)).toBeNull();
  },
);
it.each([
  [" 1.5 ", 1.5],
  ["1e2", 100],
])("数値表記の受け入れを維持する: %s", (value, expected) => {
  expect(toPositiveNumber(String(value))).toBe(expected);
});
it.each(["2024-02-29", "0099-01-01", "0000-02-29"])(
  "実在する日付を受け入れる: %s",
  (date) => {
    expect(isWorkoutDate(date)).toBe(true);
  },
);
it.each(["2023-02-29", "2024-04-31", "2024-13-01", "2024-1-01", ""])(
  "不正な日付を拒否する: %s",
  (date) => {
    expect(isWorkoutDate(date)).toBe(false);
  },
);
