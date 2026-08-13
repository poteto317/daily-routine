import {
  anyField,
  arrayField,
  objectField,
} from "../state/transferPayloadRestore";

describe("anyField", () => {
  it("値があれば保存する", () => {
    const save = jest.fn();
    anyField("a", save).restore({ a: 1 });
    expect(save).toHaveBeenCalledWith(1);
  });

  it("キーが無ければ保存しない", () => {
    // 旧バージョンのファイルには存在しないキーがある。
    // 既定値で上書きすると手元のデータを消してしまう。
    const save = jest.fn();
    anyField("a", save).restore({});
    expect(save).not.toHaveBeenCalled();
  });

  it("null は保存しない", () => {
    const save = jest.fn();
    anyField("a", save).restore({ a: null });
    expect(save).not.toHaveBeenCalled();
  });

  it("空配列は保存する", () => {
    // 明示的な空はユーザーが全削除した結果として尊重する
    const save = jest.fn();
    anyField("a", save).restore({ a: [] });
    expect(save).toHaveBeenCalledWith([]);
  });

  it("false や 0 も保存する", () => {
    // 値の有無を truthy 判定にすると、正当な値を取りこぼす
    const saveFalse = jest.fn();
    anyField("a", saveFalse).restore({ a: false });
    expect(saveFalse).toHaveBeenCalledWith(false);

    const saveZero = jest.fn();
    anyField("a", saveZero).restore({ a: 0 });
    expect(saveZero).toHaveBeenCalledWith(0);
  });

  it("形を問わないので検証では何も起きない", () => {
    expect(() => anyField("a", jest.fn()).validate({ a: "x" })).not.toThrow();
  });
});

describe("arrayField", () => {
  it("配列なら保存する", () => {
    const save = jest.fn();
    const field = arrayField("a", save, "boom");
    field.validate({ a: [1] });
    field.restore({ a: [1] });
    expect(save).toHaveBeenCalledWith([1]);
  });

  it("配列でなければ検証でエラーにする", () => {
    expect(() =>
      arrayField("a", jest.fn(), "boom").validate({ a: "x" }),
    ).toThrow("boom");
  });

  it("キーが無ければ検証も保存も何もしない", () => {
    const save = jest.fn();
    const field = arrayField("a", save, "boom");
    expect(() => field.validate({})).not.toThrow();
    field.restore({});
    expect(save).not.toHaveBeenCalled();
  });

  it("検証と保存が分かれている（保存単体では投げない）", () => {
    // 分かれていないと、書き込む前に全項目を検証しきれない
    expect(() =>
      arrayField("a", jest.fn(), "boom").restore({ a: "x" }),
    ).not.toThrow();
  });
});

describe("objectField", () => {
  it("オブジェクトなら保存する", () => {
    const save = jest.fn();
    const field = objectField("a", save, "boom");
    field.validate({ a: { x: 1 } });
    field.restore({ a: { x: 1 } });
    expect(save).toHaveBeenCalledWith({ x: 1 });
  });

  it("配列はオブジェクトとして扱わない", () => {
    // 履歴は月をキーにしたオブジェクト。配列を受け入れると壊れた形で保存される
    expect(() =>
      objectField("a", jest.fn(), "boom").validate({ a: [] }),
    ).toThrow("boom");
  });

  it("文字列はエラーにする", () => {
    expect(() =>
      objectField("a", jest.fn(), "boom").validate({ a: "x" }),
    ).toThrow("boom");
  });

  it("キーが無ければ検証も保存も何もしない", () => {
    const save = jest.fn();
    const field = objectField("a", save, "boom");
    expect(() => field.validate({})).not.toThrow();
    field.restore({});
    expect(save).not.toHaveBeenCalled();
  });
});
