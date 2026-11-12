/**
 * @jest-environment node
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "@babel/core";
import * as ts from "typescript";

// React Compiler の契約テスト: 描画時に求めた「今日」「現在時刻」が、最初の描画の値に固定されないこと。
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
// 新しく今日・現在時刻を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す
// （現在時刻は src/hooks/useCurrentMinute.ts の useCurrentMinute() から取る）。
// 描画のたびに今日を求める "use no memo" の関数を足したら、USE_NO_MEMO_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と今日・現在時刻」から参照している）。

const ROOT = process.cwd();

type UseNoMemoTarget = {
  /** 関数を定義しているファイル（リポジトリのルートからのパス） */
  file: string;
  /** export const <name> = (...) => { ... } の関数名 */
  name: string;
};

/**
 * 描画のたびに今日を求める関数（本体の最初の文が "use no memo"）。
 * 共通フック（src/hooks/useToday.ts）と、機能側の関数を呼ぶため機能側に置いた関数。
 */
const USE_NO_MEMO_TARGETS: UseNoMemoTarget[] = [
  { file: "src/hooks/useToday.ts", name: "useJstTodayKey" },
  { file: "src/hooks/useToday.ts", name: "useJstDay" },
  { file: "src/hooks/useToday.ts", name: "useLocalTodayKey" },
  {
    file: "src/features/routine/hooks/useHomeViewDateState.ts",
    name: "useHomeViewDateState",
  },
];

type TodayTarget = {
  /** 直した箇所のファイル（リポジトリのルートからのパス） */
  file: string;
  /**
   * ソースが呼んでいるべき、今日・現在時刻を返すフック（src/hooks/useToday.ts の共通フック、
   * src/hooks/useCurrentMinute.ts の useCurrentMinute、または USE_NO_MEMO_TARGETS の機能側の関数）。
   * 今日を引数で受け取るだけのファイルは持たない
   */
  hookCall?: string;
  /** 今日・現在時刻（またはそこから求めた値）を入れる変数。コンパイル結果で、メモ化の依存の比較に入っているべきもの */
  dependencies: string[];
};

const TODAY_TARGETS: TodayTarget[] = [
  {
    file: "src/features/weight-tracker/page/useWeightTrackerDataState.ts",
    hookCall: "useJstTodayKey(",
    dependencies: ["today"],
  },
  {
    file: "src/features/meal/useMealPageDataState.ts",
    hookCall: "useJstTodayKey(",
    dependencies: ["today"],
  },
  {
    file: "src/features/calendar/components/CalendarGrid.tsx",
    hookCall: "useJstTodayKey(",
    dependencies: ["todayStr"],
  },
  {
    // currentDate・isTodayHoliday は useHomeViewDateState の戻り値。下流（view）へ届く配線の確認
    // （useState の初期値に戻す退行はコンパイル結果に現れないので、日またぎの単体テストが捕まえる）
    file: "src/features/routine/hooks/useHomeViewState.ts",
    hookCall: "useJstDay(",
    dependencies: ["currentDayOfWeek", "currentDate", "isTodayHoliday"],
  },
  {
    // 描画時の既定のタブ（表示するタブ）を、渡された今日の曜日と祝日フラグから求める。
    // 祝日の判定関数（getIsTodayHoliday）を描画中に呼ぶ形に戻すと、isTodayHoliday が依存から消える
    file: "src/features/routine/hooks/useHomeViewControls.ts",
    dependencies: ["isTodayHoliday", "currentDayOfWeek"],
  },
  {
    file: "src/features/budget/useBudgetPageMetricsState.ts",
    hookCall: "useLocalTodayKey(",
    dependencies: ["todayKey"],
  },
  {
    // 0 円の通知の判定（金額・日付・今日のキーが変わったときだけ計算し直す）
    file: "src/features/budget/components/BudgetExpenseForm.tsx",
    hookCall: "useLocalTodayKey(",
    dependencies: ["todayKey"],
  },
  {
    file: "src/features/budget/components/BudgetExpenseEditForm.tsx",
    hookCall: "useLocalTodayKey(",
    dependencies: ["todayKey"],
  },
  {
    // 手書きの useMemo だけのフックもコンパイルの対象になる。依存の配列から todayKey を外すと、
    // コンパイラはこのフックのコンパイルを諦めて _c( が無くなる（「コンパイルされている」の確認で落ちる）
    file: "src/features/statistics/page/useWeeklyGoalProgress.ts",
    hookCall: "useJstTodayKey(",
    dependencies: ["todayKey"],
  },
  {
    file: "src/features/journal/weekly/useWeeklyLogState.ts",
    hookCall: "useJstTodayKey(",
    // 今日から求めた今週の開始日が、戻り値のメモ化の依存に入る
    dependencies: ["currentWeekStart"],
  },
  // ルーティンのカード: 現在時刻（分）が、カードのクラス（超過の色）の計算の依存に入る。
  // 依存から外れると、開始時間を過ぎても、バックグラウンドから戻っても色が変わらない（#9）
  {
    file: "src/features/routine/components/RoutineItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineNormalDragItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineEditModeItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/RoutineDragOverlay.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
];

/**
 * 今日を求める式（最初の描画で 1 回だけ実行されるブロックに入っていたら固定される）。
 *
 * 現在時刻を読む式（`Date.now()`・`getCurrentMinute()` など）は、ここに入れない。
 * ルーティンのカードで描画中に時計を直接読むように壊して試したところ、コンパイラはその式を
 * このブロックに入れなかった（この一覧に足しても検出できない）。現在時刻の固定は、
 * TODAY_TARGETS の dependencies（メモ化の依存の比較に nowMinute があること）で検出する。
 */
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

/** file の export const <name> = (...) => { ... } の本体の最初の文が "use no memo" か（構文木で判定する） */
const startsWithUseNoMemo = ({ file, name }: UseNoMemoTarget): boolean => {
  const sourceFile = ts.createSourceFile(
    file,
    readSource(file),
    ts.ScriptTarget.ESNext,
    true,
  );
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer &&
        ts.isArrowFunction(declaration.initializer) &&
        ts.isBlock(declaration.initializer.body)
      ) {
        return isUseNoMemoDirective(declaration.initializer.body.statements[0]);
      }
    }
  }
  throw new Error(
    `${file} に export const ${name} = (...) => { ... } が見つかりません`,
  );
};

describe("React Compiler で「今日」が固定されない（契約テスト）", () => {
  // 検証 1: 描画のたびに今日を求める関数は、それぞれ本体の最初の文が "use no memo"。
  // フックを呼ばず JSX も無い関数はコンパイラの対象外なので、コンパイル結果では判定できない。
  it.each(USE_NO_MEMO_TARGETS)(
    '$file の $name は本体の最初の文が "use no memo" である',
    (target) => {
      expect(startsWithUseNoMemo(target)).toBe(true);
    },
  );

  describe.each(TODAY_TARGETS)("$file", ({ file, hookCall, dependencies }) => {
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

    it.each(dependencies)("メモ化の依存の比較に %s がある", (dependency) => {
      // 失敗したら: 今日の値が依存から外れ、日をまたいでも下流が再計算されない
      expect(code).toMatch(new RegExp(`\\$\\[\\d+\\] !== ${dependency}\\b`));
    });

    if (hookCall !== undefined) {
      it(`ソースが今日・現在時刻を返すフック ${hookCall} を呼んでいる`, () => {
        expect(readSource(file)).toContain(hookCall);
      });
    }
  });
});
