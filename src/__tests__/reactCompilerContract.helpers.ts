import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "@babel/core";
import * as ts from "typescript";

// React Compiler の契約テストで共通に使う道具。
// 対象ファイルを Next と同じオプションの babel-plugin-react-compiler でコンパイルし、
// 出力から「最初の描画で 1 回だけ実行されるブロック」を取り出し、メモ化の依存の比較を数える。
// 使うテスト: reactCompilerToday.contract.test.ts、reactCompilerSettings.contract.test.ts
// （依存の比較の件数を使うのは、reactCompilerSettings.contract.test.ts だけ）
// 道具そのものの確認（固定される例を見つけられること）: reactCompilerContract.helpers.test.ts

const ROOT = process.cwd();

const SENTINEL_CONDITION = '=== Symbol.for("react.memo_cache_sentinel"))';

export const readSource = (file: string) =>
  readFileSync(join(ROOT, file), "utf-8");

/**
 * ソースの文字列から TypeScript の型を外し（JSX は残す）、Next と同じオプションで React Compiler を通す。
 * file は、コンパイラへ渡すファイル名（拡張子で JSX の扱いが決まる。実在しなくてよい）
 */
export const compileSourceWithReactCompiler = (
  source: string,
  file: string,
): string => {
  const { outputText } = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  const result = transformSync(outputText, {
    babelrc: false,
    configFile: false,
    filename: file,
    parserOpts: { plugins: ["jsx"] },
    plugins: [
      [
        "babel-plugin-react-compiler",
        { environment: { enableNameAnonymousFunctions: false } },
      ],
    ],
  });
  if (!result?.code) {
    throw new Error(`${file} のコンパイル結果が空です`);
  }
  return result.code;
};

/** リポジトリのファイルを、Next と同じオプションで React Compiler に通す */
export const compileWithReactCompiler = (file: string): string =>
  compileSourceWithReactCompiler(readSource(file), file);

/** `{` の位置から、対応する `}` までの中身を返す（波かっこの数で対応を取る） */
const readBlock = (code: string, openBraceIndex: number): string => {
  let depth = 0;
  for (let index = openBraceIndex; index < code.length; index++) {
    if (code[index] === "{") depth++;
    if (code[index] === "}") depth--;
    if (depth === 0) return code.slice(openBraceIndex + 1, index);
  }
  throw new Error("メモ化のブロックの終わりが見つかりません");
};

/** 最初の描画で 1 回だけ実行されるブロック（sentinel の if の中身）をすべて返す */
export const listSentinelBlocks = (code: string): string[] => {
  const blocks: string[] = [];
  let from = 0;
  for (;;) {
    const conditionIndex = code.indexOf(SENTINEL_CONDITION, from);
    if (conditionIndex === -1) return blocks;
    const openBraceIndex = code.indexOf("{", conditionIndex);
    blocks.push(readBlock(code, openBraceIndex));
    from = openBraceIndex + 1;
  }
};

/** 正規表現で特別な意味を持つ文字を、文字そのものとして扱えるようにする */
const escapeForRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** コンパイル結果から、メモ化のキャッシュの変数名（`const $ = _c(n)` の `$`。`$0` などのこともある）を集める */
const listCacheNames = (code: string): string[] =>
  Array.from(
    new Set(
      Array.from(code.matchAll(/\bconst (\$\d*) = _c\(/g), (match) => match[1]),
    ),
  );

/**
 * メモ化の依存の比較（`$[n] !== 変数名`）が、出力に何件あるかを返す。
 *
 * 件数は、その変数を直接の依存に持つメモ化のブロックの数で、値を使う箇所の数ではない
 * （同じブロックの中で何度使っても 1 件）。変数を直接の依存に持つブロックが 1 つ減ると、件数も 1 減る。
 * 値を使う箇所が数に入るかは、式の形で決まる（コンパイラが、変数を直接の依存に持つブロックを作るかどうか）。
 * 数に入る例: 値をそのまま JSX に渡す箇所、import した関数の結果をそのまま描画に使う箇所。
 * 数に入らない例: 比較の結果で文字列を選ぶ箇所、`String()` などの変換に渡す箇所、ほかのフックの引数に渡す箇所。
 * 似た形でも結果が変わることがあるので、形から推測せず、コンパイルして件数を確かめる
 * （上の例は、reactCompilerContract.helpers.test.ts で確かめている）。
 *
 * dependency には、変数名だけを渡す（`settings.swipeAction` のようなプロパティは渡さない）。
 * 名前が前方一致するだけの変数（`settings` に対する `settingsList`）と、
 * プロパティの比較（`settings.swipeAction`、`settings?.theme`）は数えない。
 *
 * 数えるのは、出力の中で `const $ = _c(n)` と宣言された、キャッシュの変数との比較だけ。
 * キャッシュの変数名は、ふつう `$` だが、コンポーネントが `$` という名前の変数を使っていると
 * （props や、import した `$`）、コンパイラは `$0` のように数字を付けた名前にする（`$0[n] !== 変数名`）。
 * ソースに書いた、ほかの変数の比較（`$1[0] !== 変数名` など）は数えない。
 * 名前が `$` で終わる変数（`a$[0] !== 変数名`）と、プロパティの `$`（`obj.$[0] !== 変数名`）との比較も数えない。
 * キャッシュの宣言が無い出力（コンパイルされていない）では、0 を返す
 */
export const countDependencyComparisons = (
  code: string,
  dependency: string,
): number => {
  const cacheNames = listCacheNames(code);
  if (cacheNames.length === 0) return 0;

  const cache = cacheNames.map(escapeForRegExp).join("|");
  return (
    code.match(
      new RegExp(
        `(?<![\\w$.])(?:${cache})\\[\\d+\\] !== ${escapeForRegExp(dependency)}(?![\\w$.]|\\?\\.)`,
        "g",
      ),
    ) ?? []
  ).length;
};
