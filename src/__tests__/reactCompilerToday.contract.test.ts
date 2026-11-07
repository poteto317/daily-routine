/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "@babel/core";
import * as ts from "typescript";

// React Compiler の契約テスト: 描画時に求めた「今日」が、最初の描画の値に固定されないこと。
//
// Jest（ts-jest）は React Compiler を通さないため、ふつうの単体テストでは固定を検出できない。
// ここでは対象ファイルを Next と同じオプションの babel-plugin-react-compiler でコンパイルし、
// 出力の文字列を調べる。コンパイル結果の見方:
// - `const $ = _c(n)` があれば、そのフック・コンポーネントはコンパイルされている
// - `if ($[i] === Symbol.for("react.memo_cache_sentinel")) { ... }` の中身は最初の描画で 1 回だけ
//   実行され、以降はキャッシュの値が使われる（今日を求める式がここにあれば固定される）
// - `if ($[i] !== x || ...) { ... }` は x が変わったときだけ再計算される（x が依存）。
//   今日を素の関数で取ると、コンパイラはその値を変わらないものとみなして依存に入れないため、
//   下流が古い今日のまま残る
//
// 新しく今日を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と今日・現在時刻」から参照している）。

const ROOT = process.cwd();

const TODAY_HOOK_FILE = "src/hooks/useToday.ts";
const TODAY_HOOK_NAMES = ["useJstTodayKey", "useJstDay", "useLocalTodayKey"];

type TodayTarget = {
  /** 直した箇所のファイル（リポジトリのルートからのパス） */
  file: string;
  /** ソースが呼んでいるべき共通フック（src/hooks/useToday.ts） */
  hookCall: string;
  /** 共通フックの戻り値を入れる変数。コンパイル結果で、メモ化の依存の比較に入っているべきもの */
  dependency: string;
};

const TODAY_TARGETS: TodayTarget[] = [
  {
    file: "src/features/weight-tracker/page/useWeightTrackerDataState.ts",
    hookCall: "useJstTodayKey(",
    dependency: "today",
  },
  {
    file: "src/features/meal/useMealPageDataState.ts",
    hookCall: "useJstTodayKey(",
    dependency: "today",
  },
  {
    file: "src/features/calendar/components/CalendarGrid.tsx",
    hookCall: "useJstTodayKey(",
    dependency: "todayStr",
  },
  {
    file: "src/features/routine/hooks/useHomeViewState.ts",
    hookCall: "useJstDay(",
    dependency: "currentDayOfWeek",
  },
  {
    file: "src/features/budget/useBudgetPageMetricsState.ts",
    hookCall: "useLocalTodayKey(",
    dependency: "todayKey",
  },
];

/** 今日を求める式（最初の描画で 1 回だけ実行されるブロックに入っていたら固定される） */
const TODAY_EXPRESSIONS = [
  "new Date()",
  "getTodayString(",
  "getTodayDateString(",
  "getTodayDateKey(",
  "toJstDay(new Date",
];

const SENTINEL_CONDITION = '=== Symbol.for("react.memo_cache_sentinel"))';

const readSource = (file: string) => readFileSync(join(ROOT, file), "utf-8");

/** TypeScript の型を外し（JSX は残す）、Next と同じオプションで React Compiler を通す */
const compileWithReactCompiler = (file: string): string => {
  const { outputText } = ts.transpileModule(readSource(file), {
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
const listSentinelBlocks = (code: string): string[] => {
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

const isUseNoMemoDirective = (statement: ts.Statement | undefined) =>
  statement !== undefined &&
  ts.isExpressionStatement(statement) &&
  ts.isStringLiteral(statement.expression) &&
  statement.expression.text === "use no memo";

/** export const <hookName> = () => { ... } の本体の最初の文が "use no memo" か（構文木で判定する） */
const startsWithUseNoMemo = (source: string, hookName: string): boolean => {
  const sourceFile = ts.createSourceFile(
    TODAY_HOOK_FILE,
    source,
    ts.ScriptTarget.ESNext,
    true,
  );
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === hookName &&
        declaration.initializer &&
        ts.isArrowFunction(declaration.initializer) &&
        ts.isBlock(declaration.initializer.body)
      ) {
        return isUseNoMemoDirective(declaration.initializer.body.statements[0]);
      }
    }
  }
  throw new Error(
    `${TODAY_HOOK_FILE} に export const ${hookName} = () => { ... } が見つかりません`,
  );
};

describe("React Compiler で「今日」が固定されない（契約テスト）", () => {
  // 検証 1: 共通フックはそれぞれ本体の最初の文が "use no memo"。
  // フックを呼ばず JSX も無い関数はコンパイラの対象外なので、コンパイル結果では判定できない。
  it.each(TODAY_HOOK_NAMES)(
    '%s は本体の最初の文が "use no memo" である',
    (hookName) => {
      expect(startsWithUseNoMemo(readSource(TODAY_HOOK_FILE), hookName)).toBe(
        true,
      );
    },
  );

  describe.each(TODAY_TARGETS)("$file", ({ file, hookCall, dependency }) => {
    const code = compileWithReactCompiler(file);

    // 検証 2: 実際にコンパイルされている（`_c(` が無いと、検証 3 が空振りで通る）
    it("React Compiler でコンパイルされている（出力に _c( がある）", () => {
      expect(code).toContain("_c(");
    });

    // 検証 3: 今日が固定されていない
    it("今日を求める式が、最初の描画で 1 回だけ実行されるブロックに入っていない", () => {
      const frozenBlocks = listSentinelBlocks(code).filter((block) =>
        TODAY_EXPRESSIONS.some((expression) => block.includes(expression)),
      );
      // 失敗したら: 出力の `if ($[i] === Symbol.for("react.memo_cache_sentinel"))` の中に
      // 今日を求める式がある（最初の描画の今日に固定される）。src/hooks/useToday.ts のフックを使う。
      // 保存の日付などをハンドラの本体の中（イベントの時点）で取る今日は、固定ではない。ハンドラの本体の
      // `new Date()`・`getToday*()` がメモ化のブロックの中に入って誤って落ちる場合は、その呼び出しがハンドラの本体の中にあるかを確認する（L-538）
      expect(frozenBlocks).toEqual([]);
    });

    it(`メモ化の依存の比較に ${dependency} がある`, () => {
      // 失敗したら: 今日の値が依存から外れ、日をまたいでも下流が再計算されない
      expect(code).toMatch(new RegExp(`\\$\\[\\d+\\] !== ${dependency}\\b`));
    });

    it(`ソースが共通フック ${hookCall} を呼んでいる`, () => {
      expect(readSource(file)).toContain(hookCall);
    });
  });
});
