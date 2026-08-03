import { hasExceededMoveTolerance } from "../longPressMoveTolerance";

describe("hasExceededMoveTolerance", () => {
  it("移動していなければfalse", () => {
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 0, y: 0 }, 10)).toBe(false);
  });

  it("閾値未満の移動はfalse", () => {
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 5, y: 0 }, 10)).toBe(false);
  });

  it("閾値ちょうどはfalse（超過ではない）", () => {
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 10, y: 0 }, 10)).toBe(false);
  });

  it("閾値を超える移動はtrue", () => {
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 11, y: 0 }, 10)).toBe(true);
  });

  it("斜め方向の移動もユークリッド距離で判定される", () => {
    // 3-4-5 の直角三角形 → 距離5
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 3, y: 4 }, 4)).toBe(true);
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(false);
  });

  it("負の方向への移動も距離として扱われる", () => {
    expect(hasExceededMoveTolerance({ x: 0, y: 0 }, { x: -20, y: 0 }, 10)).toBe(true);
  });

  it("開始位置が原点でなくても相対距離で判定される", () => {
    expect(hasExceededMoveTolerance({ x: 100, y: 100 }, { x: 105, y: 100 }, 10)).toBe(false);
    expect(hasExceededMoveTolerance({ x: 100, y: 100 }, { x: 120, y: 100 }, 10)).toBe(true);
  });
});
