import type { Modifier } from "@dnd-kit/core";
import { restrictToSortableListBounds } from "../restrictToSortableListBounds";

type Args = Parameters<Modifier>[0];
type Rect = NonNullable<Args["draggingNodeRect"]>;

const createRect = (
  top: number,
  left: number,
  width: number,
  height: number,
): Rect => ({
  top,
  left,
  width,
  height,
  right: left + width,
  bottom: top + height,
});

// 一覧の枠: top 100 / bottom 500 / left 20 / right 320
const container = createRect(100, 20, 300, 400);
// 掴んだ行: top 200 / bottom 248 / left 20 / right 320（枠の幅いっぱい、高さ 48）
const dragging = createRect(200, 20, 300, 48);

const run = (
  transform: Args["transform"],
  overrides: Partial<Args> = {},
): Args["transform"] =>
  restrictToSortableListBounds({
    transform,
    draggingNodeRect: dragging,
    containerNodeRect: container,
    ...overrides,
  } as Args);

describe("restrictToSortableListBounds", () => {
  it("枠の中に収まる移動量はそのまま返す", () => {
    expect(run({ x: 0, y: 120, scaleX: 1, scaleY: 1 })).toEqual({
      x: 0,
      y: 120,
      scaleX: 1,
      scaleY: 1,
    });
  });

  it("下へはみ出す移動量は、一覧の下端に行の下端が揃う値に丸める", () => {
    // 枠の下端 500 - 行の下端 248 = 252
    expect(run({ x: 0, y: 900, scaleX: 1, scaleY: 1 }).y).toBe(252);
  });

  it("上へはみ出す移動量は、一覧の上端に行の上端が揃う値に丸める", () => {
    // 枠の上端 100 - 行の上端 200 = -100
    expect(run({ x: 0, y: -900, scaleX: 1, scaleY: 1 }).y).toBe(-100);
  });

  it("横へはみ出す移動量は、左右とも枠の端に丸める", () => {
    const narrow = createRect(200, 100, 100, 48); // left 100 / right 200
    // 右: 枠の右端 320 - 行の右端 200 = 120、左: 枠の左端 20 - 行の左端 100 = -80
    expect(
      run({ x: 500, y: 0, scaleX: 1, scaleY: 1 }, { draggingNodeRect: narrow })
        .x,
    ).toBe(120);
    expect(
      run({ x: -500, y: 0, scaleX: 1, scaleY: 1 }, { draggingNodeRect: narrow })
        .x,
    ).toBe(-80);
  });

  it("scaleX と scaleY を保つ", () => {
    expect(run({ x: 0, y: 900, scaleX: 0.8, scaleY: 1.2 })).toEqual({
      x: 0,
      y: 252,
      scaleX: 0.8,
      scaleY: 1.2,
    });
  });

  it("draggingNodeRect が null なら、受け取った transform をそのまま（同じ参照で）返す", () => {
    const transform = { x: 0, y: 900, scaleX: 1, scaleY: 1 };
    expect(run(transform, { draggingNodeRect: null })).toBe(transform);
  });

  it("containerNodeRect が null なら、受け取った transform をそのまま（同じ参照で）返す", () => {
    const transform = { x: 0, y: 900, scaleX: 1, scaleY: 1 };
    expect(run(transform, { containerNodeRect: null })).toBe(transform);
  });
});
