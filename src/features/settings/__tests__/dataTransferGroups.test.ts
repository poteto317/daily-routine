import { ALL_TRANSFER_OPTIONS } from "../state/constants";
import { TRANSFER_GROUPS } from "../state/dataTransferGroups";

describe("TRANSFER_GROUPS", () => {
  it("TransferOptions の全キーを過不足なく持つ", () => {
    // 表と型がずれると、選択できるのに何も出力されない項目が生まれる
    expect(TRANSFER_GROUPS.map((group) => group.key).sort()).toEqual(
      Object.keys(ALL_TRANSFER_OPTIONS).sort(),
    );
  });

  it("キーが重複していない", () => {
    const keys = TRANSFER_GROUPS.map((group) => group.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("すべてのグループがラベルを持つ", () => {
    TRANSFER_GROUPS.forEach((group) => {
      expect(group.label.length).toBeGreaterThan(0);
    });
  });

  it("グループ間で JSON のキーが衝突しない", () => {
    // 書き出しは各グループの結果を 1 つのオブジェクトに畳み込む。
    // キーが重なると、後のグループが前のグループのデータを黙って上書きする。
    const keys = TRANSFER_GROUPS.flatMap((group) =>
      Object.keys(group.collect()),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("書き出したキーはすべて取り込みの対象になっている", () => {
    // 書き出しているのに復元されないキーがあると、往復しても戻らない
    TRANSFER_GROUPS.forEach((group) => {
      const exported = group.collect();
      const filled = Object.fromEntries(
        Object.keys(exported).map((key) => [key, []]),
      );
      expect(group.hasData(filled)).toBe(true);
    });
  });

  it("ラベルが重複していない", () => {
    // 確認ダイアログでどのデータを入れ替えるのか判別できなくなる
    const labels = TRANSFER_GROUPS.map((group) => group.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
