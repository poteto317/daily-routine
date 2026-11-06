# 家計簿で当月の過ぎた日のうち未入力の日を分かるようにする 実装プラン（Issue #191）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-04-budget-missing-days-design.md`

**Goal:** 家計簿のトップで今月を表示しているとき、今月の 1 日〜昨日のうち支出の記録（0 円を含む）が 1 件も無い日を、「1日あたり使える金額」のカードの下に日付のボタンで並べる。日付を押すと、その日付を入れた支出の入力フォームが開き、フォームが画面の外に開くときは見える位置へスクロールする。

**Architecture:**

- 純粋な関数 `listMissingExpenseDates(monthKey, expenses, todayKey)`（`src/features/budget/utils/missingExpenseDates.ts`）が、表示中の月の未入力の日を昇順の `"YYYY-MM-DD"` で返す。時計は読まない。表記の整形関数 2 つも同じファイルに置く。
- フック `useBudgetMissingExpenseDates({ currentDate, expenses })` が、描画のたびに今日を取り直し、今月のときだけ上の関数を呼ぶ（`useMemo` の依存に今日を入れる）。React Compiler の自動メモ化からは `"use no memo"` で外す（外すと今日が初回の値で固定される。設計書「設計 › フック」）。
- `useBudgetPageState` が、その結果 `missingExpenseDates` と、日付を入れて追加フォームを開く `startAddExpenseOnDate(date)` を公開する（`budgetPageStateResult` を通す）。
- 部品 `BudgetMissingExpenseDays`（`dates`・`onSelectDate`）を `BudgetPage.tsx` の `BudgetDailySummaryCards` の直後に置く。
- `BudgetExpenseForm` がマウント時に外枠を `scrollIntoView?.({ block: "nearest" })` で見える位置へスクロールする。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効）/ TypeScript / Tailwind CSS v4 / Jest 30 + ts-jest + React Testing Library（jsdom）/ Storybook 10（`@storybook/nextjs-vite`）

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（コミットは後の工程で行う）。
- `git add -A`・`git add .`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない。
- 実装を一時的に壊す確認は、次の順で行う。確認のたびに `cmp` で元と一致することを確かめる。
  1. バックアップを取る: `BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cp <対象> "$BK/"`
  2. ファイルを一時的に書き換えてテストを実行し、落ちることを確かめる。
  3. 元に戻す: `BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/<ファイル名>" <対象>`
  4. 一致を確かめる: `BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cmp "$BK/<ファイル名>" <対象>`（出力なし・終了コード 0）
  - バックアップの置き場所はワークツリーの git の管理ディレクトリの中なので、作業ツリーにも `git status` にも出ない。
  - **Bash の呼び出しごとにシェルの変数は消える。** 手順 2〜4 を別の呼び出しで行うときは、毎回 `BK="…"` を先頭に付け直す（上の各手順に書いたとおり。または絶対パスで書く）。付け忘れると `cp "/<名前>" …` になって戻せず、`cmp` が `No such file` で exit 2 になる。
  - 一時的な書き換えは、Edit で行うか、下の各 Step に書いた `python3` の 1 行（置換する文字列がファイルにちょうど 1 回あることを `assert` で確かめる）で行う。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。複数のファイルは zsh の配列で渡す（例: `files=(a.ts b.ts) && npx prettier --write "${files[@]}"`）。
- `.env.local` や秘密の値を読む・書く・コピーしない。このワークツリーには `.env.local` が無いが、作らない（`npm run build` は無くても通る）。
- `npm --prefix firebase-functions run build` を実行しない（`lib/` を消して書き換えるため）。このプランは firebase-functions を触らない。
- `node_modules` と `firebase-functions/node_modules` は、主チェックアウト（`.`）の同名のディレクトリへのシンボリックリンクである。そのまま使う（`npm install` もしない）。
- Bash の作業ディレクトリは呼び出しごとに別のワークツリーに戻ることがある。毎回 `cd .worktrees/issue-191-missing-days &&` を付ける。Read・Edit・Write には絶対パス（`.worktrees/issue-191-missing-days/…`）を使う。
- 既存のファイルの一部を書き換える Step のコード片（「次の行を」「次にする」の組）は、プラン自体の整形で字下げが崩れないよう `text` のコードブロックで載せている。字下げを含めてファイルのとおりなので、そのまま Edit の置換に使える。ファイルの全体を置き換えるコード片と新規のファイルは `ts`・`tsx` のコードブロックで、そのまま貼れば整形済みになる。各 Step の最後に、その Step で触ったファイルへ `prettier --write` をかける。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外される。Jest は必ず `--testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` を付けて実行する。
  - テストのパスの指定は、このオプションより**前**に置く。後ろに置くと、そのパスも除外パターンとして扱われて 0 件になる。
  - `NODE_ENV=test` を付ける（シェルの `NODE_ENV=production` のままだと大量に落ちる）。
  - 書き方: `NODE_ENV=test npm test -- <テストのパス…> --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
  - 毎回、出力の `Tests:` の件数が 0 でないことを確かめる（`No tests found` は失敗として扱う）。
  - `npm test` は `cross-env TZ=Asia/Tokyo jest --forceExit` である。日付のテストは `+09:00` 付きの固定時刻を `jest.useFakeTimers().setSystemTime(...)` で設定し、`afterEach` で `jest.useRealTimers()` に戻す（L-181）。
- ts-jest は `isolatedModules: true` によって型を検査しない。各タスクの最後に `npm run typecheck`（`tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json`。`*.stories.tsx` も対象）を必ず実行する。
  - `npm run typecheck:functions` は、firebase-functions を触らないので exit 0 であることの確認だけでよい。
- Jest（ts-jest）は React Compiler を通さない。React Compiler の自動メモ化による「今日」の固定は、Task 3 の「コンパイル結果の確認」で別に確かめる。
- 作業前の基準（2026-11-06、origin/main b3bf41b のこのワークツリーで実行した結果。失敗は 0）:
  - `NODE_ENV=test npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`: `Test Suites: 1332 passed, 1332 total` / `Tests: 6879 passed, 6879 total`。
  - 作業後の判定: `FAIL` が 1 件も無い、`Tests:` に `failed` が無い、スイートが 1335（新規 3 本）・件数が 6879 より 39 件増えている（プランのとおりに実装した複製で `Test Suites: 1335 passed` / `Tests: 6918 passed` を確認済み）。
  - `npm run typecheck`: エラー 0 件（exit 0）。
  - `npm run typecheck:functions`: エラー 0 件（exit 0）。
  - `npm run lint`（`eslint --max-warnings 0`）: 出力なし（exit 0）。
  - `npm run tailwind:scan`: `No Tailwind shorthand issues found.`
- 全体のテストや、`src/features/budget` をまとめて実行したときに、次の不安定な落ち方をすることがある（単独では通る）。落ちたら、そのファイルだけを単独で実行して通ることを確かめ、記録する。
  - routine の `usePageNavigationComposition.test.tsx`・settings の `SettingsPage.features.test.tsx` が並列実行で落ちることがある。
  - `A jest worker process (pid=…) was terminated by another process: signal=SIGSEGV` で任意のスイート（これまでに `src/features/budget/__tests__/index.test.ts`・`src/features/settings/__tests__/dataTransferHelpers.test.ts` で起きた）が `Test suite failed to run` になることがある（`Tests:` に `failed` は出ず、件数がそのスイートの分だけ減る）（テストの中身と無関係のワーカーの異常終了）。もう一度実行すると通る。
- lint は `@typescript-eslint/consistent-type-imports`（`fixStyle: "inline-type-imports"`）に従う。型だけの import は `import type { X }` か `import { type X }` にする。

**コードの規則（`docs/02-development/coding-standards.md`・`.github/copilot-instructions.md`）**

- コメント・JSDoc・テスト名は日本語。画面の文言は `src/features/budget/locales/ja.json` に置き、差し込みは `{count}`・`{date}` を `.replace` で埋める（既存の `categoryManagement.deleteConfirm` と同じ流儀）。
- ダークモードの色は各色に `dark:` を付ける（既存のカード `bg-purple-50 dark:bg-purple-100` の流儀）。
- 変えないもの:
  - 保存（`storageExpenses.ts`・`budget-data`）・同期・AI エージェント API。
  - 既存の `calculateUnenteredMonthDays`・`calculateBudgetMetrics`・`useBudgetPageMetricsState`（今日の取り方の既存の問題は別の課題。設計書「懸念」の 2）。
  - `BudgetPage.stories.tsx`（実行日に依存するデータなので、欄の内容の assertion を足さない）。
  - `jest.setup.ts`（`scrollIntoView` の全体の差し替えは足さない。設計書「設計 › フォームを見える位置へスクロールする」）。
  - `src/features/test-matrix/initialData.ts` に文書の 8-8〜8-14 を足すこと（設計書「懸念」の 4）。

---

## ファイルの構成

| ファイル                                                                                                                                                                                    | 責務・変更                                                                      | タスク |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------ |
| `src/features/budget/utils/missingExpenseDates.ts`（新規）                                                                                                                                  | `listMissingExpenseDates`・`formatMissingDayLabel`・`formatMissingDayFullLabel` | 1      |
| `src/features/budget/__tests__/missingExpenseDates.test.ts`（新規）                                                                                                                         | 上の単体テスト                                                                  | 1      |
| `src/features/budget/locales/ja.json`                                                                                                                                                       | `missingDays` の文言を追加                                                      | 2      |
| `src/features/budget/components/BudgetMissingExpenseDays.tsx`（新規）                                                                                                                       | 未入力の日の欄                                                                  | 2      |
| `src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx`（新規）                                                                                                                   | 部品のテスト                                                                    | 2      |
| `src/features/budget/components/BudgetMissingExpenseDays.stories.tsx`（新規）                                                                                                               | Storybook                                                                       | 2      |
| `src/features/budget/useBudgetMissingExpenseDates.ts`（新規）                                                                                                                               | 今日を取り直して未入力の日を返すフック                                          | 3      |
| `src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx`（新規）                                                                                                               | フックのテスト（日またぎ・月またぎ）                                            | 3      |
| `src/features/budget/budgetPageStateResult.ts`                                                                                                                                              | `missingExpenseDates`・`startAddExpenseOnDate` を追加                           | 3      |
| `src/features/budget/useBudgetPageState.ts`                                                                                                                                                 | フックの呼び出しと `startAddExpenseOnDate`                                      | 3      |
| `src/features/budget/components/BudgetExpenseForm.tsx`                                                                                                                                      | マウント時のスクロール                                                          | 3      |
| `src/features/budget/BudgetPage.tsx`                                                                                                                                                        | 欄の配置                                                                        | 3      |
| `src/features/budget/__tests__/budgetPageStateResult.test.ts`・`useBudgetPageStateComposition.test.tsx`・`useBudgetPageState.test.tsx`・`BudgetExpenseForm.test.tsx`・`BudgetPage.test.tsx` | 既存のテストの更新と追加                                                        | 3      |
| `docs/04-reference/features.md`                                                                                                                                                             | 家計簿の節に「未入力の日の表示」                                                | 4      |
| `docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-05-09.ts`                                                  | 確認表 8-15 の新設                                                              | 4      |

---

## Task 1: ロジック（未入力の日を求める純粋な関数と表記の整形）

**満たす設計書の節:** 「設計 › 純粋な関数」、「テスト › 単体」。

**Files:**

- Create: `src/features/budget/utils/missingExpenseDates.ts`
- Test（Create）: `src/features/budget/__tests__/missingExpenseDates.test.ts`

**Interfaces:**

- Consumes: `buildDateValue`・`daysInMonthByKey`・`getDayFromDateValue`・`getMonthKeyFromDateValue`（`src/features/budget/utils/date.ts`）、`Expense`（`@/types/routine`）
- Produces（後のタスクが使う）:
  - `listMissingExpenseDates(monthKey: string, expenses: readonly Expense[], todayKey: string): string[]`
  - `formatMissingDayLabel(dateKey: string): string`（`"2026-11-03"` → `"3日(火)"`）
  - `formatMissingDayFullLabel(dateKey: string): string`（`"2026-11-03"` → `"11月3日(火)"`）

**気をつける知見:**

- L-471: `Date` の加減算をせず、日を 1..最終日の整数で回す。月の日数は既存の `daysInMonthByKey`（うるう年を扱う）を使う。
- L-508: 関数は時計を読まず、今日を引数で受ける（今日の取得はフックの責務）。
- L-472: 結果の並びは日付から作る昇順で、支出の配列の順に依存しない。
- 別の月の日付を持つ記録は、表示中の月の日付だけを照合することで自然に無視する（月での絞り込みを別に書かない。書くと、その条件を壊してもテストで落とせない冗長なコードになる。設計書「設計 › 純粋な関数」）。
- L-181: テストの日付は固定の文字列で渡す（関数は時計を読まないので、フェイクタイマーは要らない）。

### 1-1: 失敗するテスト → 実装

- [ ] **Step 1: 失敗するテストを書く**

`src/features/budget/__tests__/missingExpenseDates.test.ts` を次の内容で作る。

```ts
import type { Expense } from "@/types/routine";
import {
  formatMissingDayFullLabel,
  formatMissingDayLabel,
  listMissingExpenseDates,
} from "../utils/missingExpenseDates";

const expense = (id: string, date: string, amount = 1000): Expense => ({
  id,
  date,
  amount,
  createdAt: "2026-01-01T00:00:00.000Z",
});

/** "YYYY-MM" の from 日〜to 日の "YYYY-MM-DD" を昇順で返す（期待値の組み立て用） */
const dateRange = (monthKey: string, from: number, to: number): string[] =>
  Array.from(
    { length: to - from + 1 },
    (_, index) => `${monthKey}-${String(from + index).padStart(2, "0")}`,
  );

describe("listMissingExpenseDates", () => {
  describe("表示中の月が今日の月", () => {
    it("記録が 0 件なら、1 日〜昨日を返す（今日は含めない）", () => {
      expect(listMissingExpenseDates("2026-03", [], "2026-03-07")).toEqual(
        dateRange("2026-03", 1, 6),
      );
    });

    it("今日が 1 日なら、過ぎた日が無いので [] を返す", () => {
      expect(listMissingExpenseDates("2026-03", [], "2026-03-01")).toEqual([]);
    });

    it("今日の記録の有無で結果が変わらない（今日は常に対象外）", () => {
      const withToday = [expense("e1", "2026-03-07")];

      expect(
        listMissingExpenseDates("2026-03", withToday, "2026-03-07"),
      ).toEqual(dateRange("2026-03", 1, 6));
    });

    it("記録のある日を除く。同じ日に複数の記録があっても 1 日分として扱う", () => {
      const expenses = [
        expense("e1", "2026-03-01"),
        expense("e2", "2026-03-03"),
        expense("e3", "2026-03-03", 500),
        expense("e4", "2026-03-03", 200),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-02", "2026-03-04", "2026-03-05", "2026-03-06"]);
    });

    it("0 円の記録の日は入力済みとして除く。0 円と金額ありが同じ日でも 1 日分", () => {
      const expenses = [
        expense("e1", "2026-03-02", 0),
        expense("e2", "2026-03-04", 0),
        expense("e3", "2026-03-04", 300),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-01", "2026-03-03", "2026-03-05", "2026-03-06"]);
    });

    it("過ぎた日すべてに記録があれば [] を返す", () => {
      const expenses = dateRange("2026-03", 1, 6).map((date, index) =>
        expense(`e${index}`, date),
      );

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual([]);
    });

    it("今日が月末（31 日）で記録が 0 件なら、1〜30 日の 30 件を返す", () => {
      const result = listMissingExpenseDates("2026-03", [], "2026-03-31");

      expect(result).toHaveLength(30);
      expect(result).toEqual(dateRange("2026-03", 1, 30));
    });

    it("結果は日付の昇順（記録の並び順に依存しない）", () => {
      const expenses = [
        expense("e1", "2026-03-05"),
        expense("e2", "2026-03-01"),
      ];

      expect(
        listMissingExpenseDates("2026-03", expenses, "2026-03-07"),
      ).toEqual(["2026-03-02", "2026-03-03", "2026-03-04", "2026-03-06"]);
    });
  });

  describe("月の日数（うるう年・平年）", () => {
    it("うるう年の 2 月は 29 日まで対象にする", () => {
      const result = listMissingExpenseDates("2028-02", [], "2028-03-01");

      expect(result).toHaveLength(29);
      expect(result[result.length - 1]).toBe("2028-02-29");
    });

    it("平年の 2 月は 28 日まで対象にする", () => {
      const result = listMissingExpenseDates("2026-02", [], "2026-03-07");

      expect(result).toHaveLength(28);
      expect(result[result.length - 1]).toBe("2026-02-28");
    });
  });

  describe("表示中の月が今日の月と違う", () => {
    it("過去の月は、その月の全日のうち記録の無い日を返す", () => {
      const expenses = [expense("e1", "2026-02-10")];
      const result = listMissingExpenseDates("2026-02", expenses, "2026-03-07");

      expect(result).toHaveLength(27);
      expect(result).not.toContain("2026-02-10");
    });

    it("年をまたぐ過去の月（前年 12 月）は、12 月の全日を返す", () => {
      expect(listMissingExpenseDates("2025-12", [], "2026-01-05")).toEqual(
        dateRange("2025-12", 1, 31),
      );
    });

    it("未来の月は [] を返す", () => {
      expect(listMissingExpenseDates("2026-04", [], "2026-03-07")).toEqual([]);
    });

    it("年をまたぐ未来の月（翌年 1 月）は [] を返す", () => {
      expect(listMissingExpenseDates("2027-01", [], "2026-12-15")).toEqual([]);
    });
  });

  it("表示中の月以外の日付を持つ記録は無視する（別の月の同じ日を入力済みにしない）", () => {
    const expenses = [
      expense("e1", "2026-02-03"),
      expense("e2", "2026-04-03"),
      expense("e3", "2025-03-03"),
    ];

    expect(listMissingExpenseDates("2026-03", expenses, "2026-03-07")).toEqual(
      dateRange("2026-03", 1, 6),
    );
  });
});

describe("formatMissingDayLabel", () => {
  it("日と曜日の短い表記にする", () => {
    expect(formatMissingDayLabel("2026-11-03")).toBe("3日(火)");
    expect(formatMissingDayLabel("2026-11-30")).toBe("30日(月)");
  });
});

describe("formatMissingDayFullLabel", () => {
  it("月・日・曜日の表記にする", () => {
    expect(formatMissingDayFullLabel("2026-11-03")).toBe("11月3日(火)");
    expect(formatMissingDayFullLabel("2028-02-29")).toBe("2月29日(火)");
  });
});
```

- [ ] **Step 2: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Cannot find module '../utils/missingExpenseDates'` でスイートが失敗する（`Test Suites: 1 failed`）。

- [ ] **Step 3: 実装する**

`src/features/budget/utils/missingExpenseDates.ts` を次の内容で作る。

```ts
import type { Expense } from "@/types/routine";
import {
  buildDateValue,
  daysInMonthByKey,
  getDayFromDateValue,
  getMonthKeyFromDateValue,
} from "./date";

/**
 * 表示中の月のうち、今日より前の日で、支出の記録（金額 0 円を含む）が 1 件も無い日を、
 * 日付の昇順の "YYYY-MM-DD" の配列で返す（家計簿の「未入力の日」）。
 * - 表示中の月が今日の月より後: []
 * - 表示中の月が今日の月: 1 日〜昨日のうち記録の無い日（今日は含めない。今日が 1 日なら []）
 * - 表示中の月が今日の月より前: その月の全日のうち記録の無い日
 * 支出は date が表示中の月の日付と一致する記録だけを入力済みに数える（別の月の日付を持つ記録は無視する）。
 *
 * 「1日あたり使える金額」の分母の未入力日数（calculateUnenteredMonthDays。今日・未来の日を
 * 含む日数）とは別の概念。時計は読まず、今日は引数で受ける。
 *
 * @param monthKey 表示中の月（"YYYY-MM"）
 * @param expenses 支出の記録
 * @param todayKey 端末のローカルの今日（"YYYY-MM-DD"）
 */
export const listMissingExpenseDates = (
  monthKey: string,
  expenses: readonly Expense[],
  todayKey: string,
): string[] => {
  const todayMonthKey = getMonthKeyFromDateValue(todayKey);
  // "YYYY-MM" は固定長なので、文字列の大小がそのまま月の前後になる
  if (monthKey > todayMonthKey) {
    return [];
  }

  const lastDay =
    monthKey === todayMonthKey
      ? getDayFromDateValue(todayKey) - 1
      : daysInMonthByKey(monthKey);

  // 表示中の月の日付だけを下で照合するので、別の月の日付を持つ記録が入っていても
  // 表示中の月の日を「入力済み」にしない
  const recordedDates = new Set(expenses.map((expense) => expense.date));

  const missingDates: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const dateKey = buildDateValue(monthKey, day);
    if (!recordedDates.has(dateKey)) {
      missingDates.push(dateKey);
    }
  }
  return missingDates;
};

/** "YYYY-MM-DD" をローカル時刻の 0 時の Date にする（既存の formatExpenseDate と同じ解釈）。 */
const toLocalDate = (dateKey: string): Date => new Date(`${dateKey}T00:00:00`);

/** "YYYY-MM-DD" → "3日(火)"（未入力の日のボタンの表記） */
export const formatMissingDayLabel = (dateKey: string): string =>
  toLocalDate(dateKey).toLocaleDateString("ja-JP", {
    day: "numeric",
    weekday: "short",
  });

/** "YYYY-MM-DD" → "11月3日(火)"（未入力の日のボタンの読み上げ名の日付の部分） */
export const formatMissingDayFullLabel = (dateKey: string): string =>
  toLocalDate(dateKey).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
```

- [ ] **Step 4: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 17 passed, 17 total`。

### 1-2: 壊すと落ちることの確認と検証

- [ ] **Step 5: 実装を一時的に壊し、テストが落ちることを確かめる**

バックアップ:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cp src/features/budget/utils/missingExpenseDates.ts "$BK/"`

(a) 今日を対象に含めてしまう退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/utils/missingExpenseDates.ts';s=open(p).read();o='getDayFromDateValue(todayKey) - 1';assert s.count(o)==1;open(p,'w').write(s.replace(o,'getDayFromDateValue(todayKey)'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 8 failed, 9 passed, 17 total`（「今日は含めない」「今日が 1 日」「月末」などが落ちる）。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/missingExpenseDates.ts" src/features/budget/utils/missingExpenseDates.ts && cmp "$BK/missingExpenseDates.ts" src/features/budget/utils/missingExpenseDates.ts && echo restored`

Expected: `restored`（`cmp` の出力なし）。

(b) 未来の月を空にしない退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/utils/missingExpenseDates.ts';s=open(p).read();o='if (monthKey > todayMonthKey) {';assert s.count(o)==1;open(p,'w').write(s.replace(o,'if (false) {'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 2 failed, 15 passed, 17 total`（「未来の月」「年をまたぐ未来の月」が落ちる）。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/missingExpenseDates.ts" src/features/budget/utils/missingExpenseDates.ts && cmp "$BK/missingExpenseDates.ts" src/features/budget/utils/missingExpenseDates.ts && echo restored`

Expected: `restored`。

- [ ] **Step 6: 整形・型・lint**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/utils/missingExpenseDates.ts src/features/budget/__tests__/missingExpenseDates.test.ts) && npx prettier --write "${files[@]}" && npx prettier --check "${files[@]}" && npm run typecheck && npx eslint --max-warnings 0 "${files[@]}" && NODE_ENV=test npm test -- src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: prettier は `All matched files use Prettier code style!`、typecheck と eslint はエラー無し、`Tests: 17 passed, 17 total`。

---

## Task 2: コンポーネント（未入力の日の欄・文言・Storybook）

**満たす設計書の節:** 「設計 › コンポーネント」「設計 › 文言」「設計 › アクセシビリティ」「設計 › ダークモード」、「テスト › コンポーネント」「テスト › Storybook」。

**Files:**

- Modify: `src/features/budget/locales/ja.json`（`missingDays` を追加）
- Create: `src/features/budget/components/BudgetMissingExpenseDays.tsx`・`src/features/budget/components/BudgetMissingExpenseDays.stories.tsx`
- Test（Create）: `src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx`

**Interfaces:**

- Consumes: Task 1 の `formatMissingDayLabel`・`formatMissingDayFullLabel`
- Produces（Task 3 が使う）: `BudgetMissingExpenseDays`（props: `dates: string[]`・`onSelectDate: (date: string) => void`。どちらも省略不可）

**気をつける知見:**

- L-060: props はどちらも省略不可にする（既定値を付けない）。
- L-502: ストーリーの日付は固定の値。`onSelectDate` の `fn()` は `meta.args` に置き、ストーリーごとに新しく束ねられるようにする。
- 未入力の日が 0 件なら欄ごと出さない（`null`）。`useId` は早期 return より前に呼ぶ（rules-of-hooks）。
- タッチの的は高さ 44px 以上（`min-h-11`）。並びは `flex-wrap` で折り返し、横スクロールを出さない。

### 2-1: 失敗するテスト → 文言と部品

- [ ] **Step 1: 失敗するテストを書く**

`src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx` を次の内容で作る。

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { BudgetMissingExpenseDays } from "../components/BudgetMissingExpenseDays";

describe("BudgetMissingExpenseDays", () => {
  it("未入力の日が無ければ、何も描画しない", () => {
    const { container } = render(
      <BudgetMissingExpenseDays dates={[]} onSelectDate={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("見出しに日数を出し、説明を出す。欄は見出しの名前の region として取れる", () => {
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04", "2026-11-05"]}
        onSelectDate={jest.fn()}
      />,
    );

    const region = screen.getByRole("region", {
      name: "📝 未入力の日（3日）",
    });
    expect(
      within(region).getByText(/支出の記録が無い日です/),
    ).toBeInTheDocument();
    expect(within(region).getByText(/0 円で記録すると/)).toBeInTheDocument();
  });

  it("日付のボタンを dates の順に、短い表記と読み上げ名で並べる", () => {
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04", "2026-11-05"]}
        onSelectDate={jest.fn()}
      />,
    );

    const buttons = within(screen.getByRole("list")).getAllByRole("button");
    expect(buttons.map((button) => button.textContent)).toEqual([
      "2日(月)",
      "4日(水)",
      "5日(木)",
    ]);
    expect(
      screen.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    ).toHaveTextContent("4日(水)");
    expect(
      within(screen.getByRole("list")).getAllByRole("listitem"),
    ).toHaveLength(3);
  });

  it("日付のボタンを押すと、その日付で onSelectDate を 1 回呼ぶ", () => {
    const onSelectDate = jest.fn();
    render(
      <BudgetMissingExpenseDays
        dates={["2026-11-02", "2026-11-04"]}
        onSelectDate={onSelectDate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    );

    expect(onSelectDate).toHaveBeenCalledTimes(1);
    expect(onSelectDate).toHaveBeenCalledWith("2026-11-04");
  });
});
```

- [ ] **Step 2: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Cannot find module '../components/BudgetMissingExpenseDays'` でスイートが失敗する。

- [ ] **Step 3: 文言を足す**

`src/features/budget/locales/ja.json` の次の行を:

```text
  "expenseList": {
```

次にする（`expenseForm` の閉じ括弧 `},` の直後、`expenseList` の前に `missingDays` を入れる）:

```text
  "missingDays": {
    "titleTemplate": "📝 未入力の日（{count}日）",
    "description": "今月の今日より前の日で、支出の記録が無い日です。日付を押すと、その日の支出を記録できます。お金を使わなかった日は 0 円で記録すると、ここに出なくなります。",
    "selectDateLabel": "{date}の支出を記録"
  },
  "expenseList": {
```

- [ ] **Step 4: 部品を作る**

`src/features/budget/components/BudgetMissingExpenseDays.tsx` を次の内容で作る。

```tsx
import { useId } from "react";
import {
  formatMissingDayFullLabel,
  formatMissingDayLabel,
} from "../utils/missingExpenseDates";
import budgetTexts from "../locales/ja.json";

type BudgetMissingExpenseDaysProps = {
  /** 未入力の日（昇順の "YYYY-MM-DD"） */
  dates: string[];
  /** 日付のボタンを押したとき、その日付で呼ぶ */
  onSelectDate: (date: string) => void;
};

/**
 * 家計簿トップに出す「未入力の日」の欄。今月の今日より前で支出の記録（0 円を含む）が
 * 無い日を日付のボタンで並べ、押すとその日付で支出の入力フォームを開く。
 * 未入力の日が無いときは欄ごと出さない。
 */
export const BudgetMissingExpenseDays = ({
  dates,
  onSelectDate,
}: BudgetMissingExpenseDaysProps) => {
  const headingId = useId();

  if (dates.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="bg-amber-50 dark:bg-amber-100 rounded-xl p-4 mb-6"
    >
      <h3
        id={headingId}
        className="font-bold text-amber-800 dark:text-amber-900 mb-1"
      >
        {budgetTexts.missingDays.titleTemplate.replace(
          "{count}",
          String(dates.length),
        )}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-700 mb-3">
        {budgetTexts.missingDays.description}
      </p>
      <ul className="flex flex-wrap gap-2">
        {dates.map((date) => (
          <li key={date}>
            <button
              type="button"
              onClick={() => onSelectDate(date)}
              aria-label={budgetTexts.missingDays.selectDateLabel.replace(
                "{date}",
                formatMissingDayFullLabel(date),
              )}
              className="min-h-11 px-3 py-2 rounded-full border border-amber-300 dark:border-amber-500 bg-white dark:bg-white text-sm text-amber-800 dark:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {formatMissingDayLabel(date)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
```

- [ ] **Step 5: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 4 passed, 4 total`。

### 2-2: Storybook

- [ ] **Step 6: ストーリーを作る**

`src/features/budget/components/BudgetMissingExpenseDays.stories.tsx` を次の内容で作る。

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BudgetMissingExpenseDays } from "./BudgetMissingExpenseDays";

// 日付は固定の値を使う（実行日から求める相対日付を使わない）
const octoberFirstThirtyDays = Array.from(
  { length: 30 },
  (_, index) => `2026-10-${String(index + 1).padStart(2, "0")}`,
);

const meta = {
  title: "Features/Budget/BudgetMissingExpenseDays",
  component: BudgetMissingExpenseDays,
  parameters: {
    layout: "padded",
  },
  args: {
    onSelectDate: fn(),
  },
} satisfies Meta<typeof BudgetMissingExpenseDays>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 未入力の日が数日。日付のボタンを押すと onSelectDate が呼ばれる */
export const FewDays: Story = {
  args: {
    dates: ["2026-11-02", "2026-11-04", "2026-11-05"],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "11月4日(水)の支出を記録" }),
    );
    await expect(args.onSelectDate).toHaveBeenCalledWith("2026-11-04");
  },
};

/** 月末に今月の記録が 1 件も無い（30 件。折り返しの確認） */
export const ManyDaysAtMonthEnd: Story = {
  args: {
    dates: octoberFirstThirtyDays,
  },
};

/** 未入力の日が無い（何も表示しない） */
export const NoDays: Story = {
  args: {
    dates: [],
  },
};
```

### 2-3: 壊すと落ちることの確認と検証

- [ ] **Step 7: 実装を一時的に壊し、テストが落ちることを確かめる**

バックアップ:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cp src/features/budget/components/BudgetMissingExpenseDays.tsx "$BK/"`

(a) 押した日付と違う日付を渡す退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/components/BudgetMissingExpenseDays.tsx';s=open(p).read();o='onClick={() => onSelectDate(date)}';assert s.count(o)==1;open(p,'w').write(s.replace(o,'onClick={() => onSelectDate(dates[0])}'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 1 failed, 3 passed, 4 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/BudgetMissingExpenseDays.tsx" src/features/budget/components/BudgetMissingExpenseDays.tsx && cmp "$BK/BudgetMissingExpenseDays.tsx" src/features/budget/components/BudgetMissingExpenseDays.tsx && echo restored`

Expected: `restored`。

(b) 0 件でも欄を出す退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/components/BudgetMissingExpenseDays.tsx';s=open(p).read();o='  if (dates.length === 0) {\n    return null;\n  }\n';assert s.count(o)==1;open(p,'w').write(s.replace(o,''))" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 1 failed, 3 passed, 4 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/BudgetMissingExpenseDays.tsx" src/features/budget/components/BudgetMissingExpenseDays.tsx && cmp "$BK/BudgetMissingExpenseDays.tsx" src/features/budget/components/BudgetMissingExpenseDays.tsx && echo restored`

Expected: `restored`。

- [ ] **Step 8: 整形・型・lint・Tailwind**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/locales/ja.json src/features/budget/components/BudgetMissingExpenseDays.tsx src/features/budget/components/BudgetMissingExpenseDays.stories.tsx src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx) && npx prettier --write "${files[@]}" && npx prettier --check "${files[@]}" && npm run typecheck && npx eslint --max-warnings 0 src/features/budget/components/BudgetMissingExpenseDays.tsx src/features/budget/components/BudgetMissingExpenseDays.stories.tsx src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx && npm run tailwind:scan && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx src/features/budget/__tests__/missingExpenseDates.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: prettier・typecheck・eslint はエラー無し、`No Tailwind shorthand issues found.`、`Tests: 21 passed, 21 total`。

---

## Task 3: 画面の配線（フック・ページの state・フォームのスクロール・画面）

**満たす設計書の節:** 「設計 › フック」「設計 › 日付を入れてフォームを開く操作」「設計 › フォームを見える位置へスクロールする」「設計 › コンポーネント」の配置、「テスト › フック」「テスト › 状態の組み立て」「テスト › フォームのスクロール」「テスト › 画面」。

**Files:**

- Create: `src/features/budget/useBudgetMissingExpenseDates.ts`
- Modify: `src/features/budget/budgetPageStateResult.ts`・`src/features/budget/useBudgetPageState.ts`・`src/features/budget/components/BudgetExpenseForm.tsx`・`src/features/budget/BudgetPage.tsx`
- Test（Create）: `src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx`
- Test（Modify）: `src/features/budget/__tests__/budgetPageStateResult.test.ts`・`src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx`・`src/features/budget/__tests__/useBudgetPageState.test.tsx`・`src/features/budget/__tests__/BudgetExpenseForm.test.tsx`・`src/features/budget/__tests__/BudgetPage.test.tsx`

**Interfaces:**

- Consumes: Task 1 の `listMissingExpenseDates`、Task 2 の `BudgetMissingExpenseDays`、既存の `toDateKey`・`toMonthKey`・`getMonthKeyFromDateValue`（`utils/date.ts`）、`useBudgetMonthState` の `setExpenseDate`（`monthState.setExpenseDate`）
- Produces:
  - `useBudgetMissingExpenseDates(params: { currentDate: Date; expenses: Expense[] }): string[]`
  - `createBudgetPageStateResult` の引数と返り値に `missingExpenseDates: string[]`・`startAddExpenseOnDate: (date: string) => void`（省略不可）

**気をつける知見:**

- L-538: フックは描画のたびに今日を取り直し、`useMemo` の依存に入れる。今月かどうかもその今日から判定する（メモ化された `metrics.isCurrentMonth` を使わない）。テストは描画と確認の時刻をずらす（23:59 → 0:01）。
- **React Compiler**: このリポジトリは `reactCompiler: true`。フックに `"use no memo"` を付けないと、引数の無い `toDateKey(new Date())` が初回の値で固定される（`babel-plugin-react-compiler` のコンパイル結果で確認済み）。Jest では検出できないので、Step 6 でコンパイル結果を確かめる。
- rules-of-hooks: 「今月でなければ `[]`」は `useMemo` の中で判定する（早期 return でフックの呼び出しを条件付きにしない）。
- L-508: フックの中で今日を 1 回だけ取り、今月の判定と計算の両方に使う。
- L-060: 新しい state は省略不可。組み立て役のテスト（`useBudgetPageStateComposition.test.tsx`）で、フックへ渡す値と結果を `toBe` で確かめる。画面のテストで、ボタンを押すと state のハンドラがその日付で呼ばれることを確かめる。
- L-453: `startAddExpenseOnDate` は別々の state の setter を呼ぶだけ（同じデータを 2 回計算・保存しない）。
- スクロール: `BudgetExpenseForm` のマウント時に 1 回だけ。`scrollIntoView?.(…)` で jsdom（未実装）でも例外にしない。テストでは `Element.prototype.scrollIntoView` をブロックの中だけ差し替える。

### 3-1: フック

- [ ] **Step 1: 失敗するテストを書く**

`src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx` を次の内容で作る。

```tsx
import { renderHook } from "@testing-library/react";
import type { Expense } from "@/types/routine";
import { useBudgetMissingExpenseDates } from "../useBudgetMissingExpenseDates";

const marchExpenses: Expense[] = [
  {
    id: "e1",
    date: "2026-03-03",
    amount: 1000,
    createdAt: "2026-03-03T00:00:00.000Z",
  },
];

describe("useBudgetMissingExpenseDates", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("今月を表示しているとき、1 日〜昨日のうち記録の無い日を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    const { result } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-03-01T00:00:00+09:00"),
        expenses: marchExpenses,
      }),
    );

    expect(result.current).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
    ]);
  });

  it("前月・次月を表示しているときは [] を返す（前月に記録の無い日があっても）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    const { result: previous } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-02-01T00:00:00+09:00"),
        expenses: [],
      }),
    );
    const { result: next } = renderHook(() =>
      useBudgetMissingExpenseDates({
        currentDate: new Date("2026-04-01T00:00:00+09:00"),
        expenses: [],
      }),
    );

    expect(previous.current).toEqual([]);
    expect(next.current).toEqual([]);
  });

  it("同じ入力で再描画しても、同じ配列（参照）を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    const first = result.current;
    rerender(props);

    expect(result.current).toBe(first);
  });

  it("日付をまたいだ後の再描画で、前日が加わる（描画時の今日を持ち続けない）", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    expect(result.current).not.toContain("2026-03-07");

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender(props);

    expect(result.current).toEqual([
      "2026-03-01",
      "2026-03-02",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
    ]);
  });

  it("月をまたいだ後の再描画で、表示中の月がもう今月でなければ [] になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-31T23:59:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-01T00:00:00+09:00"),
      expenses: marchExpenses,
    };

    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetMissingExpenseDates(hookProps),
      { initialProps: props },
    );
    expect(result.current).toHaveLength(29);

    jest.setSystemTime(new Date("2026-04-01T00:01:00+09:00"));
    rerender(props);

    expect(result.current).toEqual([]);
  });
});
```

- [ ] **Step 2: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Cannot find module '../useBudgetMissingExpenseDates'` でスイートが失敗する。

- [ ] **Step 3: フックを作る**

`src/features/budget/useBudgetMissingExpenseDates.ts` を次の内容で作る。`"use no memo";` は関数の本体の先頭（コメントの直後、最初の文より前）に置く（ディレクティブは本体の最初の文でないと効かない）。

```ts
import { useMemo } from "react";
import type { Expense } from "@/types/routine";
import { getMonthKeyFromDateValue, toDateKey, toMonthKey } from "./utils/date";
import { listMissingExpenseDates } from "./utils/missingExpenseDates";

type UseBudgetMissingExpenseDatesParams = {
  /** 表示中の月（useBudgetMonthState の currentDate） */
  currentDate: Date;
  /** 表示中の月の支出（useBudgetMonthState の expenses） */
  expenses: Expense[];
};

/**
 * 表示中の月が今月のときだけ、未入力の日（今月の 1 日〜昨日で支出の記録が無い日）を
 * 昇順の "YYYY-MM-DD" で返す。今月でなければ []。
 *
 * 今日は描画のたびに 1 回だけ取り直し、useMemo の依存に入れる。ページを開いたまま
 * 日付をまたいでも、次の再描画で結果が追いつく（今日を取り込んだ値を持ち続けない）。
 * 今月かどうかも同じ今日から判定する（メモ化された metrics.isCurrentMonth は使わない）。
 */
export const useBudgetMissingExpenseDates = ({
  currentDate,
  expenses,
}: UseBudgetMissingExpenseDatesParams): string[] => {
  // React Compiler の自動メモ化から外す。外さないと、引数の無い new Date() が初回の値で
  // 固定され（コンパイル後のコードで確認した）、日付をまたいでも古い今日のままになる。
  // メモ化は下の useMemo で、今日を依存に入れて明示する。
  "use no memo";
  const todayKey = toDateKey(new Date());
  const monthKey = toMonthKey(currentDate);

  // 今月でないときの [] も useMemo の中で返す（フックの呼び出しを条件付きにせず、
  // 再描画のたびに新しい配列を作らない）
  return useMemo(
    () =>
      monthKey === getMonthKeyFromDateValue(todayKey)
        ? listMissingExpenseDates(monthKey, expenses, todayKey)
        : [],
    [monthKey, expenses, todayKey],
  );
};
```

- [ ] **Step 4: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 5 passed, 5 total`。

- [ ] **Step 5: 今日を依存から外す退行で落ちることを確かめる**

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cp src/features/budget/useBudgetMissingExpenseDates.ts "$BK/" && python3 -c "p='src/features/budget/useBudgetMissingExpenseDates.ts';s=open(p).read();o='[monthKey, expenses, todayKey],';assert s.count(o)==1;open(p,'w').write(s.replace(o,'[monthKey, expenses],'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 2 failed, 3 passed, 5 total`（日またぎ・月またぎが落ちる）。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && cmp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && echo restored`

Expected: `restored`。

続けて、今月の判定を外す退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/useBudgetMissingExpenseDates.ts';s=open(p).read();o='monthKey === getMonthKeyFromDateValue(todayKey)';assert s.count(o)==1;open(p,'w').write(s.replace(o,'true'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 2 failed, 3 passed, 5 total`（前月・次月、月またぎが落ちる）。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && cmp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && echo restored`

Expected: `restored`。

- [ ] **Step 6: React Compiler のコンパイル結果を確かめる（Jest では検出できない固定）**

確認用のスクリプトを git の管理ディレクトリの中（作業ツリーの外）に作る。

Run:

```bash
cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cat > "$BK/compile-check.cjs" <<'EOF'
// React Compiler でファイルをコンパイルし、メモ化のキャッシュ（_c(）の有無を出力する
const babel = require("node_modules/@babel/core");
const fs = require("fs");
const file = process.argv[2];
const out = babel.transformSync(fs.readFileSync(file, "utf8"), {
  filename: file,
  babelrc: false,
  configFile: false,
  plugins: [
    ["node_modules/@babel/plugin-syntax-typescript", { isTSX: file.endsWith("x") }],
    "node_modules/babel-plugin-react-compiler",
  ],
});
console.log(out.code.includes("_c(") ? "MEMOIZED" : "NOT_MEMOIZED");
EOF
node "$BK/compile-check.cjs" src/features/budget/useBudgetMissingExpenseDates.ts
```

Expected: `NOT_MEMOIZED`。

`"use no memo"` を外すと固定されることも確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && python3 -c "p='src/features/budget/useBudgetMissingExpenseDates.ts';s=open(p).read();o='  \"use no memo\";\n';assert s.count(o)==1;open(p,'w').write(s.replace(o,''))" && node "$BK/compile-check.cjs" src/features/budget/useBudgetMissingExpenseDates.ts`

Expected: `MEMOIZED`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && cmp "$BK/useBudgetMissingExpenseDates.ts" src/features/budget/useBudgetMissingExpenseDates.ts && node "$BK/compile-check.cjs" src/features/budget/useBudgetMissingExpenseDates.ts`

Expected: `cmp` の出力なし、`NOT_MEMOIZED`。

### 3-2: ページの state の配線

- [ ] **Step 7: 失敗するテストを書く（3 ファイル）**

(a) `src/features/budget/__tests__/budgetPageStateResult.test.ts` の次の行を:

```text
    const openExpenseForm = jest.fn();
    const startEditExpense = jest.fn();
```

次にする:

```text
    const openExpenseForm = jest.fn();
    const startAddExpenseOnDate = jest.fn();
    const startEditExpense = jest.fn();
    const missingExpenseDates = ["2026-03-01", "2026-03-02"];
```

同じファイルの、`createBudgetPageStateResult({` の引数の中の次の行を:

```text
        isCurrentMonth: true,
        navigateToCategoryManagement,
        navigateToSummary,
        openExpenseForm,
        startEditExpense,
```

次にする:

```text
        isCurrentMonth: true,
        missingExpenseDates,
        navigateToCategoryManagement,
        navigateToSummary,
        openExpenseForm,
        startAddExpenseOnDate,
        startEditExpense,
```

同じファイルの、`.toEqual({` の中の（字下げが 6 桁の）次の行を:

```text
      isCurrentMonth: true,
      navigateToCategoryManagement,
      navigateToSummary,
      openExpenseForm,
      startEditExpense,
```

次にする:

```text
      isCurrentMonth: true,
      missingExpenseDates,
      navigateToCategoryManagement,
      navigateToSummary,
      openExpenseForm,
      startAddExpenseOnDate,
      startEditExpense,
```

(b) `src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx` の次の行を:

```text
jest.mock("../useBudgetCategoriesState", () => ({
  useBudgetCategoriesState: jest.fn(),
}));
```

次にする:

```text
jest.mock("../useBudgetCategoriesState", () => ({
  useBudgetCategoriesState: jest.fn(),
}));

jest.mock("../useBudgetMissingExpenseDates", () => ({
  useBudgetMissingExpenseDates: jest.fn(),
}));
```

同じファイルの次の行を:

```text
import { useBudgetCategoriesState } from "../useBudgetCategoriesState";
import { useBudgetPageState } from "../useBudgetPageState";
```

次にする:

```text
import { useBudgetCategoriesState } from "../useBudgetCategoriesState";
import { useBudgetMissingExpenseDates } from "../useBudgetMissingExpenseDates";
import { useBudgetPageState } from "../useBudgetPageState";
```

同じファイルの `beforeEach` の末尾の次の行を:

```text
    (useBudgetCategoriesState as jest.Mock).mockReturnValue({
      categories: [
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
    });
  });
```

次にする:

```text
    (useBudgetCategoriesState as jest.Mock).mockReturnValue({
      categories: [
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
    });
    (useBudgetMissingExpenseDates as jest.Mock).mockReturnValue([
      "2026-03-01",
      "2026-03-02",
    ]);
  });
```

同じファイルの末尾の次の行を:

```text
    navigateToSummary();
    expect(navigate).toHaveBeenCalledWith("budget-summary");
  });
});
```

次にする:

```text
    navigateToSummary();
    expect(navigate).toHaveBeenCalledWith("budget-summary");
  });

  it("表示中の月と支出を未入力の日のフックへ渡し、結果と日付つきで開く操作を公開する", () => {
    renderHook(() => useBudgetPageState({ navigate: jest.fn() }));

    const { monthState } = (useBudgetMonthAndMetricsState as jest.Mock).mock
      .results[0].value;
    const hookArgs = (useBudgetMissingExpenseDates as jest.Mock).mock
      .calls[0][0];
    expect(hookArgs.currentDate).toBe(monthState.currentDate);
    expect(hookArgs.expenses).toBe(monthState.expenses);

    const resultArgs = (createBudgetPageStateResult as jest.Mock).mock
      .calls[0][0];
    expect(resultArgs.missingExpenseDates).toBe(
      (useBudgetMissingExpenseDates as jest.Mock).mock.results[0].value,
    );
    expect(resultArgs.startAddExpenseOnDate).toEqual(expect.any(Function));
  });

  it("startAddExpenseOnDate は日付を入れてから追加フォームを開く", () => {
    renderHook(() => useBudgetPageState({ navigate: jest.fn() }));

    const { monthState } = (useBudgetMonthAndMetricsState as jest.Mock).mock
      .results[0].value;
    const { openExpenseForm } = (useBudgetPageFormState as jest.Mock).mock
      .results[0].value;
    const { startAddExpenseOnDate } = (createBudgetPageStateResult as jest.Mock)
      .mock.calls[0][0];

    startAddExpenseOnDate("2026-03-02");

    expect(monthState.setExpenseDate).toHaveBeenCalledWith("2026-03-02");
    expect(openExpenseForm).toHaveBeenCalledTimes(1);
  });
});
```

(c) `src/features/budget/__tests__/useBudgetPageState.test.tsx` の末尾の次の行を:

```text
    expect(mockNavigate).toHaveBeenCalledWith("budget-summary");
  });
});
```

次にする（このファイルの `beforeEach` は時刻を `2026-03-07T12:00:00+09:00` に固定し、3 月の支出は 3 日の 1 件だけを返す）:

```text
    expect(mockNavigate).toHaveBeenCalledWith("budget-summary");
  });

  describe("未入力の日", () => {
    it("今月の 1 日〜昨日のうち、支出の記録が無い日を返す。次月へ移動すると [] になる", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      // 今日は 2026-03-07。3 日だけ記録がある
      expect(result.current.missingExpenseDates).toEqual([
        "2026-03-01",
        "2026-03-02",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
      ]);

      act(() => {
        result.current.goToNextMonth();
      });

      expect(result.current.missingExpenseDates).toEqual([]);
    });

    it("startAddExpenseOnDate で、その日付を入れて追加フォームを開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });

      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-02");
    });

    it("編集中に startAddExpenseOnDate を呼ぶと、編集を閉じて追加フォームを開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startEditExpense({
          id: "e-mar",
          date: "2026-03-03",
          amount: 1000,
          createdAt: "2026-03-03T00:00:00.000Z",
        });
      });
      act(() => {
        result.current.startAddExpenseOnDate("2026-03-04");
      });

      expect(result.current.editingExpenseId).toBeNull();
      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-04");
    });

    it("追加フォームに金額を入れたまま別の日付で開き直すと、日付だけが変わり金額とカテゴリは残る", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-01");
        result.current.handleExpenseAmountChange("800");
        result.current.handleExpenseCategoryIdChange("category-lunch");
      });
      act(() => {
        result.current.startAddExpenseOnDate("2026-03-05");
      });

      expect(result.current.expenseDate).toBe("2026-03-05");
      expect(result.current.expenseAmount).toBe("800");
      expect(result.current.expenseCategoryId).toBe("category-lunch");
      expect(result.current.showExpenseForm).toBe(true);
    });
  });
});
```

- [ ] **Step 8: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/budgetPageStateResult.test.ts src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: 失敗がある（`budgetPageStateResult` の `toEqual` が `missingExpenseDates`・`startAddExpenseOnDate` の欠落で落ちる。組み立てのテストはフックが呼ばれず落ちる。`useBudgetPageState` の「未入力の日」の 4 件が `undefined` や `startAddExpenseOnDate is not a function` で落ちる）。

- [ ] **Step 9: 実装する**

(a) `src/features/budget/budgetPageStateResult.ts` の型の次の行を:

```text
  isCurrentMonth: boolean;
  navigateToCategoryManagement: () => void;
  navigateToSummary: () => void;
  openExpenseForm: () => void;
  startEditExpense: (expense: Expense) => void;
```

次にする:

```text
  isCurrentMonth: boolean;
  /** 未入力の日（今月の 1 日〜昨日で支出の記録が無い日。昇順の "YYYY-MM-DD"） */
  missingExpenseDates: string[];
  navigateToCategoryManagement: () => void;
  navigateToSummary: () => void;
  openExpenseForm: () => void;
  /** 日付を入れて支出の追加フォームを開く（未入力の日のボタン） */
  startAddExpenseOnDate: (date: string) => void;
  startEditExpense: (expense: Expense) => void;
```

同じファイルの引数の分割代入の次の行を:

```text
  isCurrentMonth,
  navigateToCategoryManagement,
  navigateToSummary,
  openExpenseForm,
  startEditExpense,
  cancelEditExpense,
  showExpenseForm,
  todayExpense,
}: BudgetPageStateResultArgs) => {
```

次にする:

```text
  isCurrentMonth,
  missingExpenseDates,
  navigateToCategoryManagement,
  navigateToSummary,
  openExpenseForm,
  startAddExpenseOnDate,
  startEditExpense,
  cancelEditExpense,
  showExpenseForm,
  todayExpense,
}: BudgetPageStateResultArgs) => {
```

同じファイルの返り値の次の行を:

```text
    isCurrentMonth,
    navigateToCategoryManagement,
    navigateToSummary,
    openExpenseForm,
    startEditExpense,
    cancelEditExpense,
    showExpenseForm,
    todayExpense,
  };
```

次にする:

```text
    isCurrentMonth,
    missingExpenseDates,
    navigateToCategoryManagement,
    navigateToSummary,
    openExpenseForm,
    startAddExpenseOnDate,
    startEditExpense,
    cancelEditExpense,
    showExpenseForm,
    todayExpense,
  };
```

(b) `src/features/budget/useBudgetPageState.ts` の次の行を:

```text
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
```

次にする:

```text
import { useBudgetExpenseEditState } from "./useBudgetExpenseEditState";
import { useBudgetMissingExpenseDates } from "./useBudgetMissingExpenseDates";
```

同じファイルの次の行を:

```text
  const expenseEdit = useBudgetExpenseEditState();
```

次にする:

```text
  const expenseEdit = useBudgetExpenseEditState();
  const missingExpenseDates = useBudgetMissingExpenseDates({
    currentDate: monthState.currentDate,
    expenses: monthState.expenses,
  });
```

同じファイルの `startAddExpense` の定義の終わりの次の行を:

```text
    openExpenseForm();
  };
```

次にする:

```text
    openExpenseForm();
  };
  // 未入力の日のボタンから、その日付を入れて追加フォームを開く。
  // 入力中の金額・カテゴリは残す（startAddExpense はフォームの表示だけを切り替える）
  const startAddExpenseOnDate = (date: string) => {
    monthState.setExpenseDate(date);
    startAddExpense();
  };
```

同じファイルの `createBudgetPageStateResult({` の引数の次の行を:

```text
    isCurrentMonth: metrics.isCurrentMonth,
```

次にする:

```text
    isCurrentMonth: metrics.isCurrentMonth,
    missingExpenseDates,
```

同じファイルの次の行を:

```text
    startEditExpense,
    cancelEditExpense: expenseEdit.cancelEditExpense,
```

次にする:

```text
    startAddExpenseOnDate,
    startEditExpense,
    cancelEditExpense: expenseEdit.cancelEditExpense,
```

- [ ] **Step 10: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/budgetPageStateResult.ts src/features/budget/useBudgetPageState.ts src/features/budget/__tests__/budgetPageStateResult.test.ts src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx) && npx prettier --write "${files[@]}" && NODE_ENV=test npm test -- src/features/budget/__tests__/budgetPageStateResult.test.ts src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Test Suites: 3 passed, 3 total`、`failed` 無し（`Tests: 25 passed, 25 total`）。

### 3-3: フォームのスクロール

- [ ] **Step 11: 失敗するテストを書く**

`src/features/budget/__tests__/BudgetExpenseForm.test.tsx` の次の行を:

```text
describe("BudgetExpenseForm", () => {
  it("0 円の入力の案内（今日より前の日付のみ、残り日数に含めない）を表示する", () => {
```

次にする（再描画用の描画関数と、スクロールの `describe` を足す）:

```text
const renderFormWithRerender = () => {
  const props = {
    categories: [],
    expenseAmount: "",
    expenseCategoryId: "",
    expenseDate: "2026-03-07",
    onAdd: jest.fn(),
    onAmountChange: jest.fn(),
    onCancel: jest.fn(),
    onCategoryIdChange: jest.fn(),
    onDateChange: jest.fn(),
  };
  const { rerender } = render(<BudgetExpenseForm {...props} />);
  return { rerender, props };
};

describe("BudgetExpenseForm", () => {
  describe("開いたときのスクロール", () => {
    // jsdom は scrollIntoView を実装していないため、このブロックの中だけ差し替える
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    let scrollIntoView: jest.Mock;

    beforeEach(() => {
      scrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    });

    it("マウント時に 1 回、フォームの外枠を block: nearest で見える位置へスクロールする", () => {
      renderForm();

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
      const scrolledElement = scrollIntoView.mock.contexts[0] as HTMLElement;
      expect(scrolledElement).toContainElement(
        screen.getByRole("heading", { name: "支出を記録" }),
      );
      expect(scrolledElement).toContainElement(
        screen.getByRole("button", { name: "追加" }),
      );
    });

    it("入力で再描画しても、スクロールは増えない", () => {
      const { rerender, props } = renderFormWithRerender();

      rerender(<BudgetExpenseForm {...props} expenseAmount="1200" />);
      rerender(<BudgetExpenseForm {...props} expenseDate="2026-03-05" />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });
  });

  it("0 円の入力の案内（今日より前の日付のみ、残り日数に含めない）を表示する", () => {
```

- [ ] **Step 12: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetExpenseForm.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: 「マウント時に 1 回、…」と「入力で再描画しても、…」の 2 件が `Expected number of calls: 1 / Received number of calls: 0` で落ちる（`Tests: 2 failed`）。

- [ ] **Step 13: 実装する**

`src/features/budget/components/BudgetExpenseForm.tsx` の次の行を:

```text
import { useId } from "react";
```

次にする:

```text
import { useEffect, useId, useRef } from "react";
```

同じファイルの次の行を:

```text
  const amountHintId = useId();
```

次にする:

```text
  const formRef = useRef<HTMLDivElement>(null);
  const amountHintId = useId();
```

同じファイルの次の行を:

```text
    new Date(),
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4 mb-6">
```

次にする:

```text
    new Date(),
  );

  // フォームを開いた（マウントした）ときに、画面の外に開いていれば見える位置へスクロールする。
  // 未入力の日の欄が長いと、上の段の日付を押したときにフォームが画面の下に隠れるため。
  // すでに見えていれば動かない（block: "nearest"）。入力のたびの再描画では呼ばない。
  // scrollIntoView を実装していない環境（jsdom など）では何もしない。
  useEffect(() => {
    formRef.current?.scrollIntoView?.({ block: "nearest" });
  }, []);

  return (
    <div
      ref={formRef}
      className="bg-gray-50 dark:bg-gray-200 rounded-xl p-4 mb-6"
    >
```

- [ ] **Step 14: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx) && npx prettier --write "${files[@]}" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetExpenseForm.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `failed` 無し（スクロールの 2 件と既存のテストがすべて通る。既存のテストは `scrollIntoView` を差し替えないが、`?.` によって例外にならない）。

### 3-4: 画面

- [ ] **Step 15: 失敗するテストを書く**

`src/features/budget/__tests__/BudgetPage.test.tsx` の `createState` の次の行を:

```text
  isCurrentMonth: true,
  navigateToCategoryManagement: jest.fn(),
  navigateToSummary: jest.fn(),
  openExpenseForm: jest.fn(),
  showExpenseForm: false,
```

次にする:

```text
  isCurrentMonth: true,
  missingExpenseDates: [],
  navigateToCategoryManagement: jest.fn(),
  navigateToSummary: jest.fn(),
  openExpenseForm: jest.fn(),
  startAddExpenseOnDate: jest.fn(),
  showExpenseForm: false,
```

同じファイルの末尾の次の行を:

```text
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(state.cancelEditExpense).toHaveBeenCalledTimes(1);
  });
});
```

次にする:

```text
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(state.cancelEditExpense).toHaveBeenCalledTimes(1);
  });

  describe("未入力の日", () => {
    it("state の未入力の日を「➕」より前の欄に出し、日付を押すと startAddExpenseOnDate をその日付で呼ぶ", () => {
      const state = createState({
        missingExpenseDates: ["2026-03-02", "2026-03-04"],
      });
      mockUseBudgetPageState.mockReturnValue(state as never);

      render(<BudgetPage />);

      const region = screen.getByRole("region", {
        name: "📝 未入力の日（2日）",
      });
      expect(
        region.compareDocumentPosition(screen.getByText("➕")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      fireEvent.click(
        screen.getByRole("button", { name: "3月4日(水)の支出を記録" }),
      );

      expect(state.startAddExpenseOnDate).toHaveBeenCalledTimes(1);
      expect(state.startAddExpenseOnDate).toHaveBeenCalledWith("2026-03-04");
    });

    it("未入力の日が無ければ欄を出さない", () => {
      mockUseBudgetPageState.mockReturnValue(
        createState({ missingExpenseDates: [] }) as never,
      );

      render(<BudgetPage />);

      expect(
        screen.queryByRole("region", { name: /未入力の日/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe("支出フォームを開いたときのスクロール", () => {
    // jsdom は scrollIntoView を実装していないため、このブロックの中だけ差し替える
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    let scrollIntoView: jest.Mock;

    beforeEach(() => {
      scrollIntoView = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
      Element.prototype.scrollIntoView = originalScrollIntoView;
    });

    it("フォームを表示すると 1 回 block: nearest でスクロールし、再描画では増えない", () => {
      const state = createState({ showExpenseForm: true });
      mockUseBudgetPageState.mockReturnValue(state as never);

      const { rerender } = render(<BudgetPage />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });

      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: true, expenseAmount: "2000" }) as never,
      );
      rerender(<BudgetPage />);

      expect(scrollIntoView).toHaveBeenCalledTimes(1);
    });

    it("フォームを閉じているときはスクロールしない", () => {
      mockUseBudgetPageState.mockReturnValue(
        createState({ showExpenseForm: false }) as never,
      );

      render(<BudgetPage />);

      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 16: 失敗を確かめる（RED）**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: 「state の未入力の日を…」が `Unable to find role="region"` で落ちる（`Tests: 1 failed`。スクロールの 2 件は Step 13 の実装で通る）。

- [ ] **Step 17: 実装する**

`src/features/budget/BudgetPage.tsx` の次の行を:

```text
import { BudgetDailySummaryCards } from "@/features/budget/components/BudgetDailySummaryCards";
```

次にする:

```text
import { BudgetDailySummaryCards } from "@/features/budget/components/BudgetDailySummaryCards";
import { BudgetMissingExpenseDays } from "@/features/budget/components/BudgetMissingExpenseDays";
```

同じファイルの次の行を:

```text
            todayExpense={state.todayExpense}
          />
```

次にする:

```text
            todayExpense={state.todayExpense}
          />
          <BudgetMissingExpenseDays
            dates={state.missingExpenseDates}
            onSelectDate={state.startAddExpenseOnDate}
          />
```

- [ ] **Step 18: 通ることを確かめる（GREEN）**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/BudgetPage.tsx src/features/budget/__tests__/BudgetPage.test.tsx) && npx prettier --write "${files[@]}" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `failed` 無し（`Tests: 15 passed, 15 total`）。

### 3-5: 壊すと落ちることの確認と検証

- [ ] **Step 19: 配線を一時的に壊し、テストが落ちることを確かめる**

バックアップ:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && mkdir -p "$BK" && cp src/features/budget/useBudgetPageState.ts src/features/budget/BudgetPage.tsx src/features/budget/components/BudgetExpenseForm.tsx "$BK/"`

(a) 日付を入れずにフォームを開く退行:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/useBudgetPageState.ts';s=open(p).read();o='    monthState.setExpenseDate(date);\n';assert s.count(o)==1;open(p,'w').write(s.replace(o,''))" && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetPageState.test.tsx src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 4 failed, 20 passed, 24 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/useBudgetPageState.ts" src/features/budget/useBudgetPageState.ts && cmp "$BK/useBudgetPageState.ts" src/features/budget/useBudgetPageState.ts && echo restored`

Expected: `restored`。

(b) フックの結果を返り値へ渡さない退行（L-060）:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/useBudgetPageState.ts';s=open(p).read();o='    missingExpenseDates,\n';assert s.count(o)==1;open(p,'w').write(s.replace(o,'    missingExpenseDates: [],\n'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/useBudgetPageState.test.tsx src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 2 failed, 22 passed, 24 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/useBudgetPageState.ts" src/features/budget/useBudgetPageState.ts && cmp "$BK/useBudgetPageState.ts" src/features/budget/useBudgetPageState.ts && echo restored`

Expected: `restored`。

(c) 画面でハンドラを渡さない退行（L-060）:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/BudgetPage.tsx';s=open(p).read();o='onSelectDate={state.startAddExpenseOnDate}';assert s.count(o)==1;open(p,'w').write(s.replace(o,'onSelectDate={() => {}}'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 1 failed, 14 passed, 15 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/BudgetPage.tsx" src/features/budget/BudgetPage.tsx && cmp "$BK/BudgetPage.tsx" src/features/budget/BudgetPage.tsx && echo restored`

Expected: `restored`。

(d) 再描画のたびにスクロールする退行（依存配列を外す）:

Run: `cd .worktrees/issue-191-missing-days && python3 -c "p='src/features/budget/components/BudgetExpenseForm.tsx';s=open(p).read();o='  }, []);';assert s.count(o)==1;open(p,'w').write(s.replace(o,'  });'))" && NODE_ENV=test npm test -- src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetPage.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: `Tests: 2 failed, 22 passed, 24 total`。

戻す・一致を確かめる:

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && cp "$BK/BudgetExpenseForm.tsx" src/features/budget/components/BudgetExpenseForm.tsx && cmp "$BK/BudgetExpenseForm.tsx" src/features/budget/components/BudgetExpenseForm.tsx && echo restored`

Expected: `restored`。

- [ ] **Step 20: 整形・型・lint・家計簿のテスト全体**

Run: `cd .worktrees/issue-191-missing-days && files=(src/features/budget/useBudgetMissingExpenseDates.ts src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx src/features/budget/budgetPageStateResult.ts src/features/budget/useBudgetPageState.ts src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/BudgetPage.tsx src/features/budget/__tests__/budgetPageStateResult.test.ts src/features/budget/__tests__/useBudgetPageStateComposition.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetPage.test.tsx) && npx prettier --write "${files[@]}" && npx prettier --check "${files[@]}" && npm run typecheck && npx eslint --max-warnings 0 src/features/budget && npm run tailwind:scan && NODE_ENV=test npm test -- src/features/budget --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: prettier・typecheck・eslint はエラー無し、`No Tailwind shorthand issues found.`、`Test Suites: 95 passed, 95 total`・`failed` 無し（SIGSEGV でスイートが落ちたら、もう一度実行する。Global Constraints）。

---

## Task 4: ドキュメント・手動確認表・最終検証

**満たす設計書の節:** 「ドキュメントと確認表の更新」。

**Files:**

- Modify: `docs/04-reference/features.md`・`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-05-09.ts`

**Interfaces:** なし。

**気をつける知見:**

- 既存の ID は変えない・振り直さない。新しい項目は文書の最大値 8-14 の次の **8-15**。アプリ内の `initialData.ts` は 8-7 の次に 8-15 を置く（8-8〜8-14 はアプリ内に無いが、今回は足さない。設計書「懸念」の 4）。
- 詳細ケースの型は `scenario`（手順）と `expected`（期待結果）の 2 つの欄。設計書の手順の「→」の前を `scenario`、後を `expected` に分けて書く。ID は「項目 ID-連番」（`8-15-1` …）。
- L-368: 手順は、記録する日・今日の位置（4 日以降・20 日以降）・押すボタン・入れる金額・画面幅・未入力の日の数を具体的に書き、期待結果は画面に出る文言（`📝 未入力の日（N日）`）で書く。
- L-203: `features.md` と確認表の説明を、実装の動き（今日を含めない・0 円の日は出ない・今月だけ・スクロール）と同じ言葉で書く。

### 4-1: 説明と確認表

- [ ] **Step 1: `features.md` を更新する**

`docs/04-reference/features.md` の次の行を:

```text
  - 月の切り替え（前月・次月・今月ジャンプ）
- **カテゴリ管理（「カテゴリを管理」画面）**
```

次にする:

```text
  - 月の切り替え（前月・次月・今月ジャンプ）
- **未入力の日の表示**
  - 今月を表示しているとき、今月の今日より前の日で支出の記録（0 円を含む）が 1 件も無い日を、「1日あたり使える金額」のカードの下に日付のボタン（例: `3日(火)`）で古い日から並べる。見出しに日数を出す（例: `📝 未入力の日（5日）`）
  - 今日は含めない。「今日」は端末のローカル日付で判定し、画面を開いたまま日付が変わったときは、次の操作（入力・フォームの開閉など）で追いつく
  - 日付を押すと、その日付を入れた支出の入力フォームが開く（入力中の金額・カテゴリは残る。編集中の支出は閉じる）。フォームが画面の外に開くときは、見える位置までスクロールする
  - 0 円で記録した日（お金を使わなかった日）は出ない。前月・次月の表示中と、該当する日が無いときは欄ごと出さない
- **カテゴリ管理（「カテゴリを管理」画面）**
```

- [ ] **Step 2: 確認表の文書（`test-matrix.md`）に 8-15 を足す**

`docs/03-testing/test-matrix.md` の 8 節の表の次の行を:

```text
| 8-14 | 収入・固定費・変動費のエクスポート／インポート | ✅   | ⬜  | ⬜  | 「収入・固定費・変動費の設定」画面。JSON。確認のうえ置き換え                                   |
```

次にする（列の幅は Step 5 の prettier が表全体でそろえ直す）:

```text
| 8-14 | 収入・固定費・変動費のエクスポート／インポート | ✅   | ⬜  | ⬜  | 「収入・固定費・変動費の設定」画面。JSON。確認のうえ置き換え                                   |
| 8-15 | 未入力の日の表示（今月の過ぎた日） | ✅ | ⬜ | ⬜ | 今月の今日より前で支出の記録（0円含む）が無い日を日付ボタンで表示。押すとその日付で支出フォームが開く |
```

- [ ] **Step 3: アプリ内の確認表の項目（`initialData.ts`）に 8-15 を足す**

`src/features/test-matrix/initialData.ts` の `id: "budget"` の `items` の次の行を:

```text
      {
        id: "8-7",
        label: "月間支出一覧表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする:

```text
      {
        id: "8-7",
        label: "月間支出一覧表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "8-15",
        label: "未入力の日の表示（今月の過ぎた日）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

- [ ] **Step 4: アプリ内の詳細ケース（`group-05-09.ts`）に 8-15 を足す**

`src/features/test-matrix/detailed-test-cases/group-05-09.ts` の次の行を:

```text
    {
      id: "8-7-2",
      scenario: "当月の支出が0件の場合",
      expected: "空状態メッセージが表示される",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
```

次にする:

```text
    {
      id: "8-7-2",
      scenario: "当月の支出が0件の場合",
      expected: "空状態メッセージが表示される",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "8-15": [
    {
      id: "8-15-1",
      scenario:
        "今日が今月の4日以降の日に、今月の1日と「今日の2日前の日」にだけ支出を記録し、ほかの今月の日は記録しない状態で家計簿を開く",
      expected:
        "「1日あたり使える金額」のカードの下に「📝 未入力の日（N日）」が出る。記録した2日・今日・明日以降の日のボタンは無く、それ以外の今月の1日〜昨日のボタンが古い日から並ぶ（Nはボタンの数と一致）",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-2",
      scenario:
        "8-15-1 の状態で、一番左の日付のボタンを押し、金額 500 を入れて「追加」を押す",
      expected:
        "押した直後に「➕」の位置に支出の入力フォームが開き、「日付（月）」が今月・「日付（日）」が押した日になっている。追加の後、その日のボタンが消えて見出しの日数が1減り、支出一覧にその日の500円が出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-3",
      scenario:
        "未入力の日のボタンを押してフォームを開き、金額 0 を入れて「追加」を押す",
      expected:
        "0円で保存でき（「0 円は、今日より前の日付だけ記録できます。」のエラー文は出ない）、その日のボタンが消える",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-4",
      scenario:
        "未入力の日が出ている状態で「← 前月」を押し、次に「今月に戻る」を押し、続けて「次月 →」を押す",
      expected:
        "前月では欄が出ない（前月に記録の無い日があっても）。「今月に戻る」で欄が再び出る。次月でも欄が出ない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-5",
      scenario:
        "今月の1日〜昨日のすべての日に支出（0円を含む）を記録した状態で家計簿を開く",
      expected: "「📝 未入力の日」の欄が出ない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-6",
      scenario:
        "支出一覧の ✏️ で編集を開いた状態で未入力の日のボタンを押す。続けて、開いた追加のフォームに金額 300 を入れたまま、別の日付のボタンを押す",
      expected:
        "編集が閉じ、追加のフォームが押した日付で開く。別の日付のボタンを押すと、「日付（日）」だけが変わり、金額 300 は残る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-7",
      scenario:
        "前日に支出の記録が無い状態で、家計簿を開いたまま日付が変わる（0時をまたぐ）まで待ち、またいだ後に「➕」を押す（または金額欄に1文字入力する）",
      expected:
        "欄に前日の日付が加わる（またいだ直後で何も操作していないうちは加わっていなくてよい）",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-8",
      scenario:
        "SP（幅375px前後。Android の Chrome）で、今月の20日以降に、未入力の日が15日以上ある状態で開く。続けてページの一番上までスクロールしてから、欄の一番上の段の左端の日付を押す",
      expected:
        "ボタンが複数行に折り返し、ページに横スクロールが出ない。隣のボタンを誤って押さずに押せる。押すと支出の入力フォームが画面の中（下端まで見える位置）に来る（画面の外に開いて何も起きないように見えることがない）",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-15-9",
      scenario: "ダークモードで 8-15-1 の状態を開く",
      expected: "欄の背景・見出し・説明・日付のボタンの文字が読める",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
```

- [ ] **Step 5: 整形と確認表のテスト**

Run: `cd .worktrees/issue-191-missing-days && files=(docs/04-reference/features.md docs/03-testing/test-matrix.md src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-05-09.ts) && npx prettier --write "${files[@]}" && npx prettier --check "${files[@]}" && NODE_ENV=test npm test -- src/features/test-matrix --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: prettier は `All matched files use Prettier code style!`、確認表のテスト（`initialData.test.ts`・`detailedTestCases.test.ts` を含む）は `failed` 無し。`git diff docs/03-testing/test-matrix.md` で、8 節の表の行の幅だけがそろえ直され、内容の変更は 8-15 の行の追加だけであることを目で確かめる。

### 4-2: 最終検証

- [ ] **Step 6: 全体の検証**

Run: `cd .worktrees/issue-191-missing-days && NODE_ENV=test npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "^Test Suites:|^Tests:|^FAIL"`

Expected: `Test Suites: 1335 passed, 1335 total` / `Tests: 6918 passed, 6918 total`、`FAIL` 無し（Global Constraints の不安定なスイートが落ちたら、単独で通ることを確かめて記録する）。

Run: `cd .worktrees/issue-191-missing-days && npm run typecheck && npm run typecheck:functions && npm run lint && npm run tailwind:scan`

Expected: すべて exit 0、`No Tailwind shorthand issues found.`。

Run: `cd .worktrees/issue-191-missing-days && git status --short && git status --short | awk '{print $2}' | grep -E '\.(ts|tsx|json|md)$' | xargs npx prettier --check`

Expected: 変更・新規のファイルは「ファイルの構成」の表のとおり（このプランと設計書を含む）で、すべて `All matched files use Prettier code style!`。

Run: `cd .worktrees/issue-191-missing-days && BK=".git/worktrees/issue-191-missing-days/missing-days-backup" && node "$BK/compile-check.cjs" src/features/budget/useBudgetMissingExpenseDates.ts`

Expected: `NOT_MEMOIZED`（React Compiler で今日が固定されない）。

Run: `cd .worktrees/issue-191-missing-days && npm run build 2>&1 | tail -20`

Expected: ビルドが成功する（`.env.local` が無くても通る。作らない）。`git status --short` に `public/sw.js` などビルドの生成物の変更が出たら、ビルド前と同じく追跡対象外（`.gitignore`）であることを確かめる。

- [ ] **Step 7: 実機確認**

実機（PC のブラウザ・Android の Chrome）での確認は、手動確認表の **8-15**（詳細ケース 8-15-1〜8-15-9）で行う。このプランでは手順を重ねて書かない。
