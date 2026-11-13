/**
 * @jest-environment node
 */
import {
  compileSourceWithReactCompiler,
  countDependencyComparisons,
  listSentinelBlocks,
} from "./reactCompilerContract.helpers";

// 契約テストの道具そのものの確認。
//
// 契約テスト（reactCompilerToday・reactCompilerSettings）は「固定されたブロックが 0 件」を期待するので、
// コンパイラの出力の形が変わって listSentinelBlocks がブロックを見つけられなくなると、黙って通るようになる。
// ここでは、わざと固定される短い例をコンパイルし、道具が固定を見つけられることを確かめる。

const compileExample = (source: string) =>
  compileSourceWithReactCompiler(source, "Example.tsx");

/** 保存された設定を読む式（getSettings(）を含む、最初の描画で 1 回だけ実行されるブロック */
const listBlocksReadingSettings = (code: string) =>
  listSentinelBlocks(code).filter((block) => block.includes("getSettings("));

/** メモ化の依存の比較に swipeAction が出てくる件数 */
const countSwipeActionComparisons = (code: string) =>
  countDependencyComparisons(code, "swipeAction");

describe("React Compiler の契約テストの道具", () => {
  it("本体で getSettings() を読む例は、最初の描画で 1 回だけ実行されるブロックとして見つかる", () => {
    const code = compileExample(`
      import { getSettings } from "@/features/settings/storage";
      export const Example = () => {
        const swipeAction = getSettings().swipeAction;
        return <div>{swipeAction}</div>;
      };
    `);

    expect(listBlocksReadingSettings(code)).toHaveLength(1);
    expect(countSwipeActionComparisons(code)).toBe(0);
  });

  it("フックの戻り値で受け取る例は、固定されるブロックが無く、依存の比較に値が入る", () => {
    const code = compileExample(`
      import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
      export const Example = () => {
        const swipeAction = useSwipeActionSetting();
        return <div>{swipeAction}</div>;
      };
    `);

    expect(listSentinelBlocks(code)).toEqual([]);
    expect(countSwipeActionComparisons(code)).toBe(1);
  });

  it("関数に包んで読む例は、getSettings( を探す確認では見つからないが、依存の比較から値が消える", () => {
    // 規約（coding-standards.md「契約テストで守られる範囲」）に書いた、検出できる範囲の根拠。
    // 固定されるブロックには関数の呼び出し（readSwipeAction()）だけが入り、getSettings( の文字は入らない
    const code = compileExample(`
      import { getSettings } from "@/features/settings/storage";
      const readSwipeAction = () => getSettings().swipeAction;
      export const Example = () => {
        const swipeAction = readSwipeAction();
        return <div>{swipeAction}</div>;
      };
    `);

    expect(listSentinelBlocks(code)).toHaveLength(1);
    expect(listBlocksReadingSettings(code)).toEqual([]);
    expect(countSwipeActionComparisons(code)).toBe(0);
  });

  it("別々のブロックの 2 か所のうち 1 か所だけを関数に包んだ例は、依存の比較が残るが、件数が 2 から 1 に減る", () => {
    // 契約テストが「1 件以上ある」ではなく件数を比べる理由。包んだ 1 か所は固定されるが、
    // 残りの 1 か所の比較が残るので、「比較がある」だけを確かめる形では見つからない。
    // 2 か所は、表示の切り替え（if (isEditMode)）の 2 つの分岐にあり、別々のメモ化のブロックになる（比較は 2 件）
    const compileTwoUsages = (editModeValue: string) =>
      compileExample(`
        import { getSettings } from "@/features/settings/storage";
        import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
        const readSwipeAction = () => getSettings().swipeAction;
        export const Example = ({ isEditMode }: { isEditMode: boolean }) => {
          const swipeAction = useSwipeActionSetting();
          if (isEditMode) {
            return <div>{${editModeValue}}</div>;
          }
          return <span>{swipeAction}</span>;
        };
      `);

    const subscribed = compileTwoUsages("swipeAction");
    expect(listSentinelBlocks(subscribed)).toEqual([]);
    expect(countSwipeActionComparisons(subscribed)).toBe(2);

    const partlyWrapped = compileTwoUsages("readSwipeAction()");
    expect(listSentinelBlocks(partlyWrapped)).toHaveLength(1);
    expect(listBlocksReadingSettings(partlyWrapped)).toEqual([]);
    expect(countSwipeActionComparisons(partlyWrapped)).toBe(1);
  });

  it("同じ JSX 要素の 2 か所のうち 1 か所だけを関数に包んだ例は、依存の比較が 1 件のまま変わらない", () => {
    // 規約（coding-standards.md「契約テストで守られる範囲」）に書いた、件数の確認では見つからない形の根拠。
    // 比較の件数は、変数を直接の依存に持つメモ化のブロックの数で、使う箇所の数ではない。
    // 同じ要素の 2 か所は 1 つのブロックに入るので、片方を包んでも、残りの箇所の比較が 1 件残る
    const compileSameElement = (secondValue: string) =>
      compileExample(`
        import { getSettings } from "@/features/settings/storage";
        import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
        const readSwipeAction = () => getSettings().swipeAction;
        export const Example = () => {
          const swipeAction = useSwipeActionSetting();
          return <div title={swipeAction} data-action={${secondValue}} />;
        };
      `);

    const subscribed = compileSameElement("swipeAction");
    expect(listSentinelBlocks(subscribed)).toEqual([]);
    expect(countSwipeActionComparisons(subscribed)).toBe(1);

    const partlyWrapped = compileSameElement("readSwipeAction()");
    expect(listSentinelBlocks(partlyWrapped)).toHaveLength(1);
    expect(listBlocksReadingSettings(partlyWrapped)).toEqual([]);
    expect(countSwipeActionComparisons(partlyWrapped)).toBe(1);
  });

  it("値から求めた値を経由して使う例は、依存の比較に変数が出ず、関数に包んで読む形に置き換えても何も変わらない", () => {
    // 規約（coding-standards.md「契約テストで守られる範囲」）に書いた、件数の確認では見つからない形の根拠。
    // 比較の件数は、変数を「直接の」依存に持つメモ化のブロックの数。この例の式（比較の結果で文字列を選ぶ）は
    // ブロックの外で計算され、求めた値のほうが依存になるので、変数の比較は 0 件になる。
    // この使い方を関数に包んで読む形に置き換えると、ほかの値（label）に依存するブロックの中に関数の呼び出しが入る
    // （label が変わるまで古い設定のまま固定されるが、最初の描画で 1 回だけ実行されるブロックにはならない）
    const compileDerivedValue = (valueExpression: string) =>
      compileExample(`
        import { getSettings } from "@/features/settings/storage";
        import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
        const readSwipeAction = () => getSettings().swipeAction;
        export const Example = ({ label }: { label: string }) => {
          const swipeAction = useSwipeActionSetting();
          return <div title={label}>{${valueExpression} === "delete" ? "d" : "e"}</div>;
        };
      `);

    const subscribed = compileDerivedValue("swipeAction");
    expect(listSentinelBlocks(subscribed)).toEqual([]);
    expect(countSwipeActionComparisons(subscribed)).toBe(0);

    const wrapped = compileDerivedValue("readSwipeAction()");
    expect(listSentinelBlocks(wrapped)).toEqual([]);
    expect(countSwipeActionComparisons(wrapped)).toBe(0);
  });

  it("import した関数の結果をそのまま描画に使う例は、依存の比較に変数が入り、関数に包んで読む形に置き換えると件数が減る", () => {
    // 上の「値から求めた値を経由して使う例」と違い、件数に入る例。この例では、呼び出しがメモ化のブロックになり、
    // 変数を直接の依存に持つ（比較は 1 件）。引数を関数に包んで読む形に置き換えると、
    // 呼び出しが最初の描画で 1 回だけ実行されるブロックに入り、比較が 0 件に減る（契約テストの件数の確認で見つかる）。
    // 関数の呼び出しなら必ず件数に入るわけではない（下の「もともと件数に入っていない箇所を関数に包んだ例」）
    const compileCallDerivedValue = (argument: string) =>
      compileExample(`
        import { getSettings } from "@/features/settings/storage";
        import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
        import { getSwipeActionLabel } from "./labels";
        const readSwipeAction = () => getSettings().swipeAction;
        export const Example = ({ label }: { label: string }) => {
          const swipeAction = useSwipeActionSetting();
          return <div title={label}>{getSwipeActionLabel(${argument})}</div>;
        };
      `);

    const subscribed = compileCallDerivedValue("swipeAction");
    expect(listSentinelBlocks(subscribed)).toEqual([]);
    expect(countSwipeActionComparisons(subscribed)).toBe(1);

    const wrapped = compileCallDerivedValue("readSwipeAction()");
    expect(listSentinelBlocks(wrapped)).toHaveLength(1);
    expect(listBlocksReadingSettings(wrapped)).toEqual([]);
    expect(countSwipeActionComparisons(wrapped)).toBe(0);
  });

  describe("もともと件数に入っていない箇所を関数に包んだ例", () => {
    // 規約（coding-standards.md「レビューで確かめること」）に書いた、最初の描画の値に固定されるのに、
    // 契約テストでは見つからない形の根拠。フックの戻り値を使っていても、式の形によっては依存の比較に変数が出ない
    // （0 件）。その箇所を関数に包んで読む形に置き換えると、関数の呼び出しが最初の描画で 1 回だけ実行される
    // ブロックに入るが、ブロックに getSettings( は無く、件数も 0 件のまま変わらない
    it.each([
      {
        name: "String() に渡して描画に使う",
        body: (value: string) =>
          `return <div title={label}>{String(${value})}</div>;`,
      },
      {
        name: "ほかのフックの引数に渡す",
        body: (value: string) =>
          `const text = useSwipeActionText(${value}); return <div title={label}>{text}</div>;`,
      },
    ])(
      "$name: 最初の描画の値に固定されるが、件数は 0 件のまま変わらない",
      ({ body }) => {
        const compileUncounted = (value: string) =>
          compileExample(`
            import { getSettings } from "@/features/settings/storage";
            import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
            import { useSwipeActionText } from "./useSwipeActionText";
            const readSwipeAction = () => getSettings().swipeAction;
            export const Example = ({ label }: { label: string }) => {
              const swipeAction = useSwipeActionSetting();
              ${body(value)}
            };
          `);

        const subscribed = compileUncounted("swipeAction");
        expect(listSentinelBlocks(subscribed)).toEqual([]);
        expect(countSwipeActionComparisons(subscribed)).toBe(0);

        const wrapped = compileUncounted("readSwipeAction()");
        const frozenBlocks = listSentinelBlocks(wrapped);
        expect(frozenBlocks).toHaveLength(1);
        expect(frozenBlocks[0]).toContain("readSwipeAction()");
        expect(listBlocksReadingSettings(wrapped)).toEqual([]);
        expect(countSwipeActionComparisons(wrapped)).toBe(0);
      },
    );
  });

  it("本体で getSettings() を読んでも、ほかの値に依存するブロックの中で読む例は、最初の描画で 1 回だけ実行されるブロックとしては見つからない", () => {
    // 設定用の契約テストが、コンパイル結果だけでなく、ソースに getSettings が書かれていないことも確かめる理由。
    // getSettings() が、ほかの値（label）に依存するメモ化のブロックの中に残ると、label が変わるまで
    // 古い設定のまま固定されるが、そのブロックの条件は sentinel ではないので、listSentinelBlocks では見つからない
    const code = compileExample(`
      import { getSettings } from "@/features/settings/storage";
      export const Example = ({ label }: { label: string }) => {
        return <div title={label}>{getSettings().swipeAction === "delete" ? "d" : "e"}</div>;
      };
    `);

    expect(code).toContain("_c(");
    // label に依存するブロック（if の条件から、キャッシュへの書き込みまで）の中に getSettings() がある
    expect(code).toMatch(
      /if \(\$\[0\] !== label\) \{[\s\S]*?getSettings\(\)\.swipeAction[\s\S]*?\$\[0\] = label;/,
    );
    expect(listSentinelBlocks(code)).toEqual([]);
  });

  it("依存の比較は、名前が前方一致するだけの変数と、プロパティの比較を数えない", () => {
    const code =
      "const $ = _c(4); if ($[0] !== settings.swipeAction || $[1] !== settingsList || $[2] !== settings?.theme || $[3] !== settings) {}";

    expect(countDependencyComparisons(code, "settings")).toBe(1);
  });

  it("依存の比較は、名前に $ を含む変数も数える", () => {
    const code = "const $ = _c(2); if ($[0] !== $value || $[1] !== $value2) {}";

    expect(countDependencyComparisons(code, "$value")).toBe(1);
  });

  it("依存の比較は、キャッシュの宣言（const $ = _c(n)）が無い出力では数えない", () => {
    const code = "if ($[0] !== settings) {}";

    expect(countDependencyComparisons(code, "settings")).toBe(0);
  });

  it("依存の比較は、名前が $ で終わる変数（a$[0]）と、プロパティの $（obj.$[0]）との比較を数えない", () => {
    // どちらも、ソースに書いた比較が出力に残った形で、キャッシュの変数（$）との比較ではない
    const code =
      "const $ = _c(1); if (a$[0] !== settings || obj.$[0] !== settings) {}";

    expect(countDependencyComparisons(code, "settings")).toBe(0);
  });

  it("依存の比較は、キャッシュの変数名が $ 以外（$0）になる例でも数える", () => {
    // コンポーネントが $ という名前の変数を使っていると、コンパイラはキャッシュの変数を $0 にする
    const code = compileExample(`
      import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
      export const Example = ({ $ }: { $: string }) => {
        const swipeAction = useSwipeActionSetting();
        return <div title={$}>{swipeAction}</div>;
      };
    `);

    expect(code).toMatch(/\$0\[\d+\] !== swipeAction/);
    expect(countSwipeActionComparisons(code)).toBe(1);
  });

  it("依存の比較は、ソースに書いた、キャッシュ以外の変数の比較（$1[0] !== 変数名）を数えない", () => {
    // キャッシュの変数名は $ のまま。$1 は props で、$1[0] !== swipeAction は、
    // ソースに書いた比較が、そのまま出力に残ったもの（メモ化の依存の比較ではない）
    const code = compileExample(`
      import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
      export const Example = ({ $1 }: { $1: string[] }) => {
        const swipeAction = useSwipeActionSetting();
        const same = $1[0] !== swipeAction;
        return <div>{same ? "a" : "b"}</div>;
      };
    `);

    expect(code).toMatch(/const \$ = _c\(/);
    expect(code).toMatch(/\$1\[0\] !== swipeAction/);
    expect(countSwipeActionComparisons(code)).toBe(0);
  });

  it("フックの戻り値を変数に入れずに使う例は、依存の比較が、コンパイラが付けた名前との比較になる", () => {
    // 比較は残る（固定されない）が、ソースに書いた名前が無いので、変数名で数える件数は 0 件になる。
    // 契約テストの一覧（SETTINGS_TARGETS）に載せるファイルでは、フックの戻り値を、名前のある変数に入れて使う
    const code = compileExample(`
      import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
      export const Example = () => {
        return <div title={useSwipeActionSetting()} />;
      };
    `);

    // フックの戻り値を受けた名前（コンパイラが付ける。名前の形は問わない）が、その後の依存の比較に出ている
    expect(code).toMatch(
      /const (\w+) = useSwipeActionSetting\(\);[\s\S]*\$\[\d+\] !== \1\b/,
    );
    expect(listSentinelBlocks(code)).toEqual([]);
    expect(countSwipeActionComparisons(code)).toBe(0);
  });

  it("コンパイルされない（フックも JSX も無い）関数からは、ブロックが 1 つも見つからない", () => {
    const code = compileExample(`
      export const add = (a: number, b: number) => a + b;
    `);

    expect(code).not.toContain("_c(");
    expect(listSentinelBlocks(code)).toEqual([]);
  });
});
