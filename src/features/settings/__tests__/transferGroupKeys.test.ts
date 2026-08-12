import {
  ALL_TRANSFER_OPTIONS,
  EMPTY_TRANSFER_OPTIONS,
} from "../state/constants";
import { TRANSFER_GROUP_KEYS } from "../state/transferGroupKeys";

describe("TRANSFER_GROUP_KEYS", () => {
  it("キーが重複していない", () => {
    expect(new Set(TRANSFER_GROUP_KEYS).size).toBe(TRANSFER_GROUP_KEYS.length);
  });

  it("既存の 4 グループを先頭の並びで保つ", () => {
    // チェックボックスの並び順が変わるとユーザーの見え方が変わる
    expect(TRANSFER_GROUP_KEYS.slice(0, 4)).toEqual([
      "routines",
      "progress",
      "history",
      "settings",
    ]);
  });
});

describe("既定値", () => {
  it("ALL は全キーが true", () => {
    TRANSFER_GROUP_KEYS.forEach((key) => {
      expect(ALL_TRANSFER_OPTIONS[key]).toBe(true);
    });
  });

  it("EMPTY は全キーが false", () => {
    TRANSFER_GROUP_KEYS.forEach((key) => {
      expect(EMPTY_TRANSFER_OPTIONS[key]).toBe(false);
    });
  });

  it("既定値はキー一覧と過不足なく一致する", () => {
    // キーを足したのに既定値へ入れ忘れると、選択状態が undefined になる
    expect(Object.keys(ALL_TRANSFER_OPTIONS).sort()).toEqual(
      [...TRANSFER_GROUP_KEYS].sort(),
    );
    expect(Object.keys(EMPTY_TRANSFER_OPTIONS).sort()).toEqual(
      [...TRANSFER_GROUP_KEYS].sort(),
    );
  });

  it("ALL と EMPTY は互いに独立したオブジェクト", () => {
    // 共有していると、片方への代入がもう片方に波及する
    expect(ALL_TRANSFER_OPTIONS).not.toBe(EMPTY_TRANSFER_OPTIONS);
  });
});
