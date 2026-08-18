import { buildFirebaseMessagingSw } from "../buildFirebaseMessagingSw";

const template = `const config = { apiKey: __NEXT_PUBLIC_FIREBASE_API_KEY__ };
__JST_DATE_HELPERS__
const today = toJstDateKey(new Date());`;

const jstHelpers = `const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
export const toJstDateKey = (date) => date;
export const toJstDay = (date) => date;`;

const replacements = { __NEXT_PUBLIC_FIREBASE_API_KEY__: '"key"' };

describe("buildFirebaseMessagingSw", () => {
  it("JST の実装をテンプレートへ差し込む", () => {
    const output = buildFirebaseMessagingSw({
      template,
      jstHelpers,
      replacements,
    });

    expect(output).not.toContain("__JST_DATE_HELPERS__");
    expect(output).toContain("const toJstDateKey =");
  });

  it("差し込む実装から export を落とす", () => {
    // FCM SW はモジュールではないため、export が残るとスクリプト全体が壊れる
    const output = buildFirebaseMessagingSw({
      template,
      jstHelpers,
      replacements,
    });

    expect(output).not.toContain("export const");
  });

  it("差し込む位置は使う場所より前になる", () => {
    // 後ろに入れると、定義前に呼ばれて実行時に落ちる
    const output = buildFirebaseMessagingSw({
      template,
      jstHelpers,
      replacements,
    });

    expect(output.indexOf("const toJstDateKey =")).toBeLessThan(
      output.indexOf("const today = toJstDateKey"),
    );
  });

  it("環境変数の置換も従来どおり行う", () => {
    const output = buildFirebaseMessagingSw({
      template,
      jstHelpers,
      replacements,
    });

    expect(output).not.toContain("__NEXT_PUBLIC_FIREBASE_API_KEY__");
    expect(output).toContain('apiKey: "key"');
  });

  it("トークンが無いテンプレートでも壊さない", () => {
    const output = buildFirebaseMessagingSw({
      template: "const a = 1;",
      jstHelpers,
      replacements,
    });

    expect(output).toBe("const a = 1;");
  });

  it("トークンの後ろにセミコロンが付いていても二重にしない", () => {
    // prettier はトークンを式とみなしてセミコロンを付ける。
    // そのまま差し込むと `};;` のような形が生成物に残る。
    const output = buildFirebaseMessagingSw({
      template: "__JST_DATE_HELPERS__;",
      jstHelpers: "export const toJstDay = (date) => date;",
      replacements: {},
    });

    expect(output).not.toContain(";;");
    expect(output).toContain("const toJstDay = (date) => date;");
  });
});
