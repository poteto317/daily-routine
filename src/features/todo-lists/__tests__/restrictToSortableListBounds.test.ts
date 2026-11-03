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
// 掴んだ行: top 200 / bottom 248 / left 20 / right 320（枠の幅いっぱい、高さ 48、中心 224）
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

  it("下へはみ出す移動量は、一覧の下端に行の中心が届く値に丸める", () => {
    // 枠の下端 500 - 行の中心 224 = 276（行の下端は 248 + 276 = 524 で、枠の下端から高さの半分 24 だけはみ出す）
    expect(run({ x: 0, y: 900, scaleX: 1, scaleY: 1 }).y).toBe(276);
  });

  it("上へはみ出す移動量は、一覧の上端に行の中心が届く値に丸める", () => {
    // 枠の上端 100 - 行の中心 224 = -124（行の上端は 200 - 124 = 76 で、枠の上端から高さの半分 24 だけはみ出す）
    expect(run({ x: 0, y: -900, scaleX: 1, scaleY: 1 }).y).toBe(-124);
  });

  describe("背の高い行（高さ 124、他の 4 行は 48、枠の高さは 5 行分の 316）", () => {
    const tallContainer = createRect(100, 20, 300, 124 + 48 * 4); // top 100 / bottom 416

    it("先頭の背の高い行を下へ動かすと、中心が枠の下端に届くまで動ける（行の下端は枠から H/2 = 62 はみ出す）", () => {
      const tallFirst = createRect(100, 20, 300, 124); // 中心 162
      const result = run(
        { x: 0, y: 900, scaleX: 1, scaleY: 1 },
        { draggingNodeRect: tallFirst, containerNodeRect: tallContainer },
      );
      // 枠の下端 416 - 行の中心 162 = 254（行の下端で止めると 416 - 224 = 192 にしかならない）
      expect(result.y).toBe(254);
      expect(tallFirst.top + tallFirst.height / 2 + result.y).toBe(
        tallContainer.bottom,
      );
      expect(tallFirst.bottom + result.y - tallContainer.bottom).toBe(62);
    });

    it("末尾の背の高い行を上へ動かすと、中心が枠の上端に届くまで動ける（行の上端は枠から H/2 = 62 はみ出す）", () => {
      const tallLast = createRect(292, 20, 300, 124); // bottom 416 / 中心 354
      const result = run(
        { x: 0, y: -900, scaleX: 1, scaleY: 1 },
        { draggingNodeRect: tallLast, containerNodeRect: tallContainer },
      );
      // 枠の上端 100 - 行の中心 354 = -254（行の上端で止めると 100 - 292 = -192 にしかならない）
      expect(result.y).toBe(-254);
      expect(tallLast.top + tallLast.height / 2 + result.y).toBe(
        tallContainer.top,
      );
      expect(tallContainer.top - (tallLast.top + result.y)).toBe(62);
    });
  });

  it("行が 1 つだけで枠と同じ大きさのときも、上下とも高さの半分まで動け、動かさなければそのまま", () => {
    const only = createRect(100, 20, 300, 124);
    const overrides = { draggingNodeRect: only, containerNodeRect: only };
    expect(run({ x: 0, y: 0, scaleX: 1, scaleY: 1 }, overrides).y).toBe(0);
    expect(run({ x: 0, y: 900, scaleX: 1, scaleY: 1 }, overrides).y).toBe(62);
    expect(run({ x: 0, y: -900, scaleX: 1, scaleY: 1 }, overrides).y).toBe(-62);
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
      y: 276,
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
