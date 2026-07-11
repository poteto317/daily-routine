import { calculateMaskableSafeZonePadding } from "../iconMaskablePadding.js";

describe("calculateMaskableSafeZonePadding", () => {
  it("192pxターゲットの現行値を返す", () => {
    expect(calculateMaskableSafeZonePadding(192, 0.8)).toEqual({
      innerSize: 154,
      padStart: 19,
      padEnd: 19,
    });
  });

  it("512pxターゲットの現行値を返す", () => {
    expect(calculateMaskableSafeZonePadding(512, 0.8)).toEqual({
      innerSize: 410,
      padStart: 51,
      padEnd: 51,
    });
  });

  it("総余白が奇数になる場合はpadEndに1px多く割り当てる", () => {
    // 183 * 0.8 = 146.4 -> round -> 146, padTotal = 37（奇数）
    expect(calculateMaskableSafeZonePadding(183, 0.8)).toEqual({
      innerSize: 146,
      padStart: 18,
      padEnd: 19,
    });
  });

  it.each([
    [64, 0.8],
    [183, 0.8],
    [192, 0.8],
    [512, 0.8],
    [1024, 0.6],
  ])(
    "innerSize + padStart + padEnd は常にsizeと一致する（size=%i, ratio=%f）",
    (size, ratio) => {
      const { innerSize, padStart, padEnd } = calculateMaskableSafeZonePadding(
        size,
        ratio,
      );

      expect(innerSize + padStart + padEnd).toBe(size);
      expect(padEnd - padStart).toBeGreaterThanOrEqual(0);
      expect(padEnd - padStart).toBeLessThanOrEqual(1);
    },
  );
});
