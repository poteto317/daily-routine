/**
 * @jest-environment node
 */
import {
  compileWithReactCompiler,
  countDependencyComparisons,
  listSentinelBlocks,
  readSource,
} from "./reactCompilerContract.helpers";

// React Compiler の契約テスト: 描画中に読む「保存された設定」が、最初の描画の値に固定されないこと。
//
// getSettings() は props・state・フックの戻り値のどれにも依存しないので、フック・コンポーネントの
// 本体で呼んで表示に使うと、React Compiler が「最初の描画で 1 回だけ実行されるブロック」に入れる。
// その結果、設定が変わっても、再読み込みするまで古い値のまま表示される（Issue #224）。
// 書き方によっては、ほかの値（props など）に依存するメモ化のブロックの中に入り、その値が変わるまで
// 古い値のまま表示される（下の「ソースに getSettings が書かれていない」のコメント）。
// Jest（ts-jest）は React Compiler を通さないため、ふつうの単体テストでは固定を検出できない。
// ここでは対象ファイルをコンパイルし、出力の文字列を調べる（見方は reactCompilerToday.contract.test.ts と同じ）。
//
// 設定を購読するフックを使うフック・コンポーネントを足したら、下の SETTINGS_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と保存された設定の値」から参照している）。

type SettingsTarget = {
  /** 対象のファイル（リポジトリのルートからのパス） */
  file: string;
  /** ソースに書かれているはずの、設定を購読するフックの呼び出し */
  hookCall: string;
  /**
   * メモ化の依存の比較に出てくるはずの変数名（name）と、その比較の件数（comparisons）。
   * 件数は、その変数を直接の依存に持つメモ化のブロックの数（コンパイル結果の `$[n] !== 変数名` の数）。
   * 値を使う箇所の数とは限らない（同じブロックの中で何度使っても 1 件。式の形によっては、値を使っていても
   * 数に入らない。数え方と例は、道具の countDependencyComparisons の説明に書いている）。
   * name には、フックの戻り値を入れた変数の名前を書く（フックの戻り値は、名前のある変数に入れて使う）。
   * comparisons は 1 以上で書く（0 件では、下の件数の確認が何も守らないため。下の確認で確かめている）
   */
  dependencies: { name: string; comparisons: number }[];
};

const SETTINGS_TARGETS: SettingsTarget[] = [
  {
    file: "src/features/routine/components/RoutineItem.tsx",
    hookCall: "useSwipeActionSetting(",
    dependencies: [{ name: "swipeAction", comparisons: 1 }],
  },
  {
    // 表示モードと編集モードの 2 か所で使い、別々のメモ化のブロックになる
    file: "src/features/routine/components/SortableRoutineItem.tsx",
    hookCall: "useSwipeActionSetting(",
    dependencies: [{ name: "swipeAction", comparisons: 2 }],
  },
];

/** 保存された設定を、購読せずに読む式 */
const SETTINGS_EXPRESSIONS = ["getSettings("];

describe("React Compiler で保存された設定の値が固定されない（契約テスト）", () => {
  describe.each(SETTINGS_TARGETS)(
    "$file",
    ({ file, hookCall, dependencies }) => {
      const code = compileWithReactCompiler(file);

      it("React Compiler でコンパイルされている（出力に _c( がある）", () => {
        expect(code).toContain("_c(");
      });

      it("ソースに getSettings が書かれていない", () => {
        // 失敗したら: このファイルが、保存された設定を購読せずに読んでいる。表示に使う設定は、
        // useSwipeActionSetting など、設定を購読するフックで受け取る。
        //
        // コンパイル結果ではなくソースを見るのは、下の「最初の描画で 1 回だけ実行されるブロック」の確認だけでは、
        // 本体で読む形の一部を見つけられないため。getSettings() が、ほかの値（props など）に依存する
        // メモ化のブロックの中に入ると、その値が変わるまで古い設定のまま固定されるが、最初の描画で 1 回だけ
        // 実行されるブロックにはならない（reactCompilerContract.helpers.test.ts の「ほかの値に依存するブロックの中で読む例」）。
        // このファイルの中の関数に包んで読む形も、ここで見つかる。
        //
        // 文字で探すので、コメントに getSettings と書いた場合も落ちる。イベントの時点で読む設定や、
        // useState の初期値として読む設定（フォームの初期値など、その後は利用者が編集する値）が要るときは、
        // 読む処理を、コンポーネント・フック以外のファイルの関数に置く
        // （置き方は、coding-standards.md「React Compiler と保存された設定の値」の「対象外」）
        expect(readSource(file)).not.toMatch(/\bgetSettings\b/);
      });

      it("保存された設定を読む式が、最初の描画で 1 回だけ実行されるブロックに入っていない", () => {
        const frozenBlocks = listSentinelBlocks(code).filter((block) =>
          SETTINGS_EXPRESSIONS.some((expression) => block.includes(expression)),
        );
        // 上の「ソースに getSettings が書かれていない」が通れば、この確認も通る。Issue #224 で起きた形
        // （コンパイル結果で固定されている）を直接確かめる確認として残している（reactCompilerToday.contract.test.ts と同じ見方）。
        //
        // 失敗したら: 出力の `if ($[i] === Symbol.for("react.memo_cache_sentinel"))` の中に
        // getSettings() がある（最初の描画の設定に固定される）。useSwipeActionSetting など、設定を購読するフックで受け取る。
        // ハンドラの本体の中（イベントの時点）で読む getSettings() は、固定ではないが、このファイルに書くと、
        // 上の「ソースに getSettings が書かれていない」で先に落ちる。読む処理は、コンポーネント・フック以外の
        // ファイルの関数に置く（例: helpersPresentation.ts）
        expect(frozenBlocks).toEqual([]);
      });

      it.each(dependencies)(
        "$name の比較の件数（comparisons）を 1 以上で書いている",
        ({ comparisons }) => {
          // 失敗したら: SETTINGS_TARGETS の comparisons が 0 以下。0 件は、name に書いた変数を直接の依存に持つ
          // メモ化のブロックが 1 つも無いことを表し、下の件数の確認が何も守らなくなる（値を使う箇所を、関数に包んで
          // 読む形に置き換えても、0 件のままで通る）。
          //
          // 実際の件数が 0 になるのは、次のどちらか。
          // - name が、フックの戻り値を入れた変数の名前と違う。または、フックの戻り値を変数に入れずに使っている
          //   （比較は、コンパイラが付けた名前（t0 など）との比較になり、name に書ける名前が無い。
          //   reactCompilerContract.helpers.test.ts の「フックの戻り値を変数に入れずに使う例」）
          // - 値を使う箇所が、どれも件数に入らない形（例: 比較の結果で文字列を選ぶ箇所だけ）
          //
          // フックの戻り値を名前のある変数に入れ、件数に入る形（例: 値をそのまま JSX に渡す）で使う箇所を作ってから、
          // 実際の件数を書く
          expect(comparisons).toBeGreaterThanOrEqual(1);
        },
      );

      it.each(dependencies)(
        "メモ化の依存の比較に $name が $comparisons 件ある",
        ({ name, comparisons }) => {
          // 件数は、変数（フックの戻り値）を直接の依存に持つメモ化のブロックの数。
          //
          // 件数が減って失敗したら: フックの戻り値を直接の依存に持っていたブロックが、依存から外れている。
          // フックの戻り値を渡していた箇所を、ほかのファイルの関数（中で getSettings() を読む）の呼び出しに
          // 置き換えた場合が、これに当たる（このファイルに getSettings と書かないので、上の「ソースに getSettings が
          // 書かれていない」と「最初の描画で 1 回だけ実行されるブロック」の確認は通る。
          // reactCompilerContract.helpers.test.ts の「関数に包んで読む例」「別々のブロックの 2 か所のうち 1 か所だけを関数に包んだ例」）。
          // 1 件以上ではなく件数を比べるのは、別々のブロックにある箇所の一部だけを置き換えた場合を見つけるため。
          //
          // 件数が 0 になって失敗したら、先に、name が、フックの戻り値を入れた変数の名前と合っているかを確かめる。
          // 変数名を変えた場合と、フックの戻り値を変数に入れずに使った場合も、この確認だけが落ちる（固定されては
          // いない。比較に出てくる名前が変わっただけ。上の「比較の件数（comparisons）を 1 以上で書いている」のコメント）。
          // 変数名を変えただけなら、SETTINGS_TARGETS の name を直す。変数に入れずに使っているなら、名前のある変数に入れる。
          //
          // 設定と関係のある正しい変更でも、件数は変わることがある（値を使う箇所を増やした・減らした、
          // 値を使う式の形を変えた）。その場合は、どの箇所もフックの戻り値から求めていることを
          // 確かめてから、SETTINGS_TARGETS の comparisons を直す。
          //
          // この確認で見つからない形（レビューで確かめる。coding-standards.md「React Compiler と保存された設定の値」の「レビューで確かめること」）:
          // - ほかのファイルの関数の中で読む箇所を、新しく足しただけの場合（いまある比較の件数は変わらない）
          // - 同じメモ化のブロックの中にある複数の箇所の一部だけを置き換えた場合（残りの箇所の比較が 1 件残る。
          //   reactCompilerContract.helpers.test.ts の「同じ JSX 要素の 2 か所のうち 1 か所だけを関数に包んだ例」）
          // - もともと件数に入っていない箇所を置き換えた場合（式の形によっては、フックの戻り値を使っていても
          //   件数に入らない。例: 比較の結果で文字列を選ぶ箇所、String() などの変換に渡す箇所、
          //   ほかのフックの引数に渡す箇所。reactCompilerContract.helpers.test.ts の
          //   「値から求めた値を経由して使う例」「もともと件数に入っていない箇所を関数に包んだ例」。
          //   件数に入っている箇所を置き換えると、件数が減って落ちる。reactCompilerContract.helpers.test.ts の
          //   「import した関数の結果をそのまま描画に使う例」）
          expect(countDependencyComparisons(code, name)).toBe(comparisons);
        },
      );

      it(`ソースが設定を購読するフック ${hookCall} を呼んでいる`, () => {
        expect(readSource(file)).toContain(hookCall);
      });
    },
  );
});
