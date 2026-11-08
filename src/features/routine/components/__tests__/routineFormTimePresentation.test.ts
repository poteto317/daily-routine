import {
  getRoutineDurationInputClassName,
  getRoutineTimeInputClassName,
} from "../routineFormTimePresentation";

// 同じ詳細度の dark: 背景は Tailwind の出力順で決まるため、
// 背景のクラスは分岐ごとに 1 種類だけ付ける。
describe.each([
  ["getRoutineTimeInputClassName", getRoutineTimeInputClassName],
  ["getRoutineDurationInputClassName", getRoutineDurationInputClassName],
])("%s", (_name, getClassName) => {
  it("重なりがあるとき、赤い背景だけが付く（白い背景は付かない）", () => {
    const tokens = getClassName(true).split(/\s+/);
    expect(tokens).toContain("dark:bg-red-100");
    expect(tokens).toContain("bg-red-50");
    expect(tokens).not.toContain("dark:bg-white");
    expect(tokens).not.toContain("bg-white");
  });

  it("重なりが無いとき、白い背景だけが付く（赤い背景は付かない）", () => {
    const tokens = getClassName(false).split(/\s+/);
    expect(tokens).toContain("dark:bg-white");
    expect(tokens).not.toContain("dark:bg-red-100");
    expect(tokens).not.toContain("bg-red-50");
  });
});
