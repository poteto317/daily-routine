# 家計簿フォームの 0 円警告と週目標の進捗の日またぎ 実装プラン（Issue #211）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-07-today-forms-weekly-goal-design.md`

**Goal:** 家計簿の支出フォーム（追加・編集）の 0 円の通知と、統計の週目標の進捗が、アプリを開いたまま 0 時（週目標は JST の月曜 0 時）をまたいだあとの次の描画で、新しい今日を基準にするようにする。退行は配線テスト・週目標の日またぎの単体テスト・React Compiler を通す契約テストで防ぐ。

**Architecture:**

- `BudgetExpenseForm.tsx`・`BudgetExpenseEditForm.tsx` は `const todayKey = useLocalTodayKey();`（`src/hooks/useToday.ts`。`"use no memo"` の共通フック）を呼び、``isZeroAmountOnUnavailableDate(金額, 日付, new Date(`${todayKey}T00:00:00`))`` で判定する。React Compiler のコンパイル結果は `if ($[0] !== 金額 || $[1] !== 日付 || $[2] !== todayKey)` の中で判定する形になる。保存の検証（`buildExpensePayload` の `now` の既定値、`isExpenseAmountAllowedOnDate`）はハンドラの本体（保存の瞬間）の今日のまま変えない。
- `useWeeklyGoalProgress` は `const todayKey = useJstTodayKey();` を呼び、`useMemo` の中で ``today: now ? now() : new Date(`${todayKey}T00:00:00+09:00`)`` を `calculateWeeklyGoalProgress` に渡し、依存を `[selectedDate, now, todayKey]` にする。`options.now`（テストが注入する時計）があるときは今まで通り `now()`。
- 契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に 3 ファイルを足す（`hookCall`・`dependencies: ["todayKey"]`）。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効。`babel-plugin-react-compiler` 1.0.0）/ TypeScript 5.9.3 / Jest 30 + ts-jest（`isolatedModules: true`。型を検査しない）+ React Testing Library（jsdom）/ `@babel/core` 7.29.7

## 設計書との差異

プランを書く前に関係ファイルを読み、scratchpad のリポジトリの複製でこのプランのコードを実際に書いて、テスト（直す前の赤・直した後の緑）・変異・型検査・lint・コンパイル結果・全体のテストの件数を確かめた。設計書の名前・行番号・コンパイル結果はコードと一致した（`BudgetExpenseForm.tsx:37-41`・`BudgetExpenseEditForm.tsx:33-37` の `isZeroAmountOnUnavailableDate(..., new Date())`、`useWeeklyGoalProgress.ts:16-25` の `useMemo` と依存 `[selectedDate, now]`、コンパイル結果の `if ($[0] !== expenseAmount || $[1] !== expenseDate || $[2] !== todayKey)`・`if ($[0] !== editingExpenseAmount || $[1] !== editingExpenseDate || $[2] !== todayKey)`・`if ($[2] !== now || $[3] !== selectedDate || $[4] !== todayKey)`）。次の点を確定・追加する。

1. **「保存の検証が保存の瞬間の今日で行われることを確かめる既存のテスト」の中身。** 「描画したあと、再描画せずに日をまたいで保存する」既存のテストは無かった。既存で保存の瞬間の今日を固定しているのは、`src/features/budget/__tests__/budgetPageStateLogic.test.ts` の「now を省略したときは、現在の日付で判定する」、`expenseAmountRule.test.ts` の「今日の判定は、深夜 0 時の境界で切り替わる」、`useBudgetPageState.test.tsx` の 0 円の 4 件（「今日より前の日付なら、0 円の支出…を追加できる」「今日の日付では、0 円の支出を追加せず…」「支出の編集で、過去の日付の金額を 0 円にして保存できる」「支出の編集で、日付を今日にして金額を 0 円にすると、保存せず…」）。これらは変えない（期待を弱めない）。そのうえで L-538 に従い、`useBudgetPageState.test.tsx` に「23:59 に入力し、再描画せずに 0:01 へ進めてから追加・編集の保存を押す」テストを 2 件足す（Task 2）。直す前でも通る（保存のハンドラは元から押した時点の今日で検証する）。ハンドラが描画時の今日を使う形に一時的に書き換えると、この 2 件だけが落ちることを試作で確かめた（Task 2 Step 6）。
2. **配線テストは別のファイルにする。** `jest.mock("@/hooks/useToday")` はファイル全体に効き、本物の時計で日をまたぐテストと同じファイルに置けないため、既存の `CalendarGrid.useToday.test.tsx` の形に合わせ、`BudgetExpenseForm.useToday.test.tsx`・`BudgetExpenseEditForm.useToday.test.tsx`・`useWeeklyGoalProgress.useToday.test.tsx` を新しく作る。
3. **週目標の単体テストを 3 件にする。** 設計書の「月曜 0 時をまたいで同じ `selectedDate` で `rerender`」に加え、「今日の JST の 0 時の Date を渡す」（直す前は `new Date()` の時刻つきの値が渡るので落ちる）と、「同じ日のうちの再描画では計算し直さない」（依存に時刻を入れるような過剰な再計算を防ぐ。直す前でも通る）を足す。既存の 1 件（`options.now` を渡す）は変えず、ファイルの先頭の `describe` に `beforeEach(() => jest.clearAllMocks())` を足す（モックの呼び出し回数を数えるテストが増えるため）。
4. **確認表の場所と状態。** md は 8 の表の `8-16` の直後に `8-17`、11 の表の `11-7` の直後に `11-8`。`initialData.ts` は `budget` の items の `8-16` の直後（このファイルの `budget` は元から `8-8`〜`8-14` を持たない。変えない）と、`statistics` の items の `11-7` の直後。状態の列は、節の見出しの状態に合わせる: `8-17` は `8-16` と同じく `✅`（8 の節は ✅）、`11-8` は 10-9（🔶 の節に足した前例）と同じく `🔶`（11 の節の見出しと `11-1`〜`11-7` が 🔶）。`initialData.ts` と詳細のケースには状態の欄が無い（`pc`・`sp` は `"unchecked"`）。`11-8-1` の例の日付は、祝日でない 2026-11-15（日）→ 11-16（月）にする（2026-11-23 は勤労感謝の日）。
5. **テストの件数（試作で確認）。** 作業前（origin/main 069132b のこのワークツリー）の全体の `npm test`（除外の上書き付き）は `Test Suites: 1341 passed`・`Tests: 7012 passed`。作業後は `Test Suites: 1344 passed`（新規 3 本）・`Tests: 7042 passed`（30 件増。統計 87 → 93、家計簿 604 → 614、契約テスト 30 → 42、確認表 314 → 316）。
6. **変異の確認は node のスクリプトのファイルで行う。** python3 の heredoc は日本語で文字コードのエラーになるため、日本語を含むスクリプトは Write ツールで UTF-8 のファイルに書いてから `node` で実行する（Task 3 Step 4）。日本語を含まない一時的な書き換えは `node -e` で行う。
7. **`11-8-1` の週間目標の設定時期を週単位で具体化する。** 設計書の「週間目標は前の週の開始日（月曜）以前に設定しておく」を、実装の判定が週単位（`weeklyGoals.ts` の `firstWeekStartKey = getWeekStartKey(startedAt)`、`weeklyGoalDefinitions.ts` の `startedWeek <= weekStartKey`）であることに合わせて「またぐ日曜を含む週の前の週のうちか、それより前に設定する」と書く（前の週のどの日に設定しても、その週の開始日（月曜）に設定したのと同じに扱われるので、設計書と矛盾しない）。あわせて、ホームで完了にできるのはその日の分だけなので、準備を前の週のうちに実際に行う（または端末の日付を前の週の日に変えて行う）手順を足す（Task 4 Step 4）。設定の時期が「前の週のうちか、それより前」と「前の週のうちに実際に行う」で食い違って読めないよう、実際に前の週のうちに行うのは (b) の完了とし、(a) の設定は「それより前でなければ同じ週に行う」と書く。

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**気をつける知見（`<dev-flow-kit>/lessons/review-lessons.md`）**

- L-538: 描画時の今日を持たない。ハンドラは押した時点で今日を取る。この 2 か所の保存のハンドラ（`createExpenseAddHandler`・`createExpenseUpdateHandler` が作る関数）は、本体の中で `buildExpensePayload` を呼び、その `now = new Date()` の既定値で保存の瞬間に今日を取る。描画時の `todayKey` をハンドラや `buildExpensePayload` に渡さない。Task 2 で「23:59 に入力し、再描画せずに 0:01 で保存」のテストを足し、ハンドラが描画時の今日を使う形に一時的に書き換えるとその 2 件だけが落ちることを確かめる（Task 2 Step 6）。依存に足した今日のキーは計算に実際に渡す（キーから作った Date を引数にする）。
- L-690: コンパイラを通さない Jest で確かめたつもりにならない。家計簿のフォームの日またぎの単体テストは直す前でも通る（テストのコメントにその旨を書く）。赤は配線テスト（共通フックのモック）と契約テストで作る。契約テストは「コンパイルされている（`_c(`）」の確認で空振りを防ぎ（Task 3 Step 3）、変異ごとに「どのテストが落ちる／落ちないのが正しいか」を分けて確かめ、結果を記録する（Task 3 Step 4）。
- L-692: このプランは番兵値の state を足さない（今日は state に入れず、描画のたびに共通フックから取る）。週目標の日またぎのテストは `rerender` の前後で `selectedDate` に**同じ Date のインスタンス**を渡す（毎回新しい Date を渡すと、依存が変わって直す前でも再計算されて通ってしまう）。
- L-368: 手動確認の手順は、確かめたい状態を実際に作れる準備と順番（端末のタイムゾーンが日本、月末・年末をまたがない日、カテゴリを 1 つ以上作る、週間目標を設定する週と完了の回数、ページを再読み込みしない、直す前でも結果が変わる操作を使わない）を具体的に書き、期待の文字は画面に出る文字と同じにする（「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」「カテゴリ（任意）」「選択しない」「📆 月次」「📅 週次」「今週」「週間目標」「現在 N週」「最長 M週」）。Task 4。
- L-060: 配線テストで、共通フックの戻り値が判定・`today` に使われることを確かめる（フックをモックして時計と違う日を返す）。Task 1・2。
- L-686: このプランで足すテストは、ハンドラを呼ぶものを `act()` で囲む（`useBudgetPageState.test.tsx` の 2 件）。`render`・`rerender`・`renderHook` の `rerender` は RTL が `act()` で包む。state を持つようになるフック・コンポーネントは無いので、既存のテストの `act()` の書き換えは無い。テストの出力に、このプランで触ったファイルからの `not wrapped in act` が出ないことを確かめる（全体の実行では、元から `StorageWriteFailureNotifier` の警告が 1 種類出る。範囲外）。
- L-311: 孤立した export を残さない。このプランは export を足さない・消さない（`BudgetExpenseForm`・`BudgetExpenseEditForm`・`useWeeklyGoalProgress`・`buildInitialData`・`DETAILED_TEST_CASES_GROUP_05_09`・`DETAILED_TEST_CASES_GROUP_10_13` は既存で、本番のコードから使われている）。Task 4 で `find-unused-exports.mjs` を実行して確かめる。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（**コミットしない。** コミットは後の `commit-ja` が行う）。
- `git add`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない（`git show`・`git diff`・`git status` は使ってよい）。
- `.claude/`・`.superpowers/` は触らない。ただし、赤の確認・変異の確認の結果は `.superpowers/sdd/2026-11-07-today-forms-weekly-goal/` の各タスクの報告（サブエージェント駆動開発の流れで書く報告）に書く。
- `docs/02-development/coding-standards.md` は変更しない（設計書「ドキュメント・確認表」。規約は変わらない）。
- 実装を一時的に壊す確認は、次の順で行う（Task 2 Step 6・Task 3 Step 3〜4 のコマンドとスクリプトはこれを内蔵している）。
  1. バックアップ: `BK=".git/worktrees/issue-211-today-forms/today-forms-backup" && mkdir -p "$BK" && cp <対象> "$BK/"`
  2. 一時的に書き換えてテストを実行し、落ちることを確かめる（スクリプトは、置換する文字列がちょうど 1 回あることを確かめ、`finally` で元に戻す）。
  3. 元に戻す: `cp "$BK/<ファイル名>" <対象>`
  4. 一致を確かめる: `cmp "$BK/<ファイル名>" <対象>`（出力なし・exit 0）
  - バックアップの置き場所はワークツリーの git の管理ディレクトリの中なので、作業ツリーにも `git status` にも出ない。Bash の呼び出しごとに変数は消えるので、毎回 `BK="…"` を付ける。
- python3 の heredoc で日本語を含むスクリプトを書かない（文字コードのエラーになる）。日本語を含むスクリプトは Write ツールで UTF-8 のファイルに書いて `node` で実行する。ファイルの書き換えは Edit ツールで行う。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。
- `node_modules`・`firebase-functions/node_modules` は主チェックアウトへのシンボリックリンク。そのまま使う（`npm install` もしない）。
- `.env.local` や秘密の値を読む・書く・作らない。`npm --prefix firebase-functions run build` を実行しない。
- Bash では毎回 `cd .worktrees/issue-211-today-forms &&` を付ける。Read・Edit・Write には絶対パスを使う。
- 既存ファイルの一部を書き換える Step のコード片（「次の部分を」「次にする」の組）は `text` のコードブロックで、字下げを含めてファイルのとおり。そのまま Edit の置換に使える。ファイル全体・新規ファイルは `ts`・`tsx` のコードブロック。
- 各タスクの最後に、そのタスクで変更したファイルだけに `npx prettier --write` をかけてから `--check` する。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外され、`npm test` が 0 件になる。Jest は必ず次の形で実行する。
  - `NODE_ENV=test TZ=Asia/Tokyo npx jest <テストのパス…> --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
  - テストのパスは除外オプションの**前**に置く（後ろに置くと、パスも除外パターンになって 0 件になる）。
  - `npm test` を使う場合は `NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'`。`npm test` は `cross-env TZ=Asia/Tokyo` 固定。`npx jest` で日付のテストを流すときは `TZ=Asia/Tokyo` も付ける（下の各 Step のコマンドは付けてある）。
  - 毎回、出力の `Tests:` の件数が 0 でないことを確かめる（`No tests found` は失敗として扱う）。
- ts-jest は型を検査しない（`tsconfig.json` の `isolatedModules: true`）。**各タスクの最後に** `npm run typecheck`・`npm run lint`・`npx prettier --check <そのタスクで変更したファイル>` を実行する。
- 日付のテストは `+09:00` 付きの固定時刻を `jest.useFakeTimers().setSystemTime(...)` で設定し、`afterEach` で `jest.useRealTimers()` に戻す。
- 全体実行で、無関係なスイートが `A jest worker process (pid=…) was terminated by another process: signal=SIGSEGV` で落ちることがある（`Tests:` に `failed` は出ず、そのスイートの件数だけ減る）。ディレクトリ単位の実行でも起こる（試作中に `src/features/budget` で 1 回起きた）。落ちたらそのファイルだけを単独で実行して通ることを確かめ、報告に書く。
- lint は `@typescript-eslint/consistent-type-imports`（型だけの import は `import type`）に従う。

**コードの規則（`docs/02-development/coding-standards.md`「React Compiler と今日・現在時刻」）**

- コメント・JSDoc・テスト名は日本語。
- 描画中に今日を求めるときは `src/hooks/useToday.ts` の共通フックを使う。家計簿は端末ローカル（`useLocalTodayKey`）、週目標は JST（`useJstTodayKey`。`getWeekStartKey` の基準と同じ）。
- 変えないもの: 保存の検証（`buildExpensePayload`・`isExpenseAmountAllowedOnDate`・`budgetMutationActions.ts`）、`getRoutines()`・`getMonthlyHistory()` を `useMemo` の中で読むこと、統計の `selectedDate` の初期値（`useStatisticsPeriodState` の `useState(new Date())`）、0 時の自動再描画（作らない）、`src/hooks/useToday.ts`、`docs/02-development/coding-standards.md`。

---

## ファイルの構成

| ファイル                                                                                                                                                     | 種類 | 責務                                                                               | タスク |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---------------------------------------------------------------------------------- | ------ |
| `src/features/statistics/page/useWeeklyGoalProgress.ts`                                                                                                      | 変更 | `options.now` が無いときの今日を `useJstTodayKey()` から作り、依存に `todayKey`    | 1      |
| `src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx`                                                                                           | 変更 | JST の 0 時の Date・月曜 0 時の日またぎ（本物の赤）・同じ日の再描画                | 1      |
| `src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx`                                                                                  | 新規 | 配線テスト（`useJstTodayKey` をモック）・`options.now` があるときは `now()`        | 1      |
| `src/features/budget/components/BudgetExpenseForm.tsx`・`BudgetExpenseEditForm.tsx`                                                                          | 変更 | 0 円の通知の判定の今日を `useLocalTodayKey()` から作る                             | 2      |
| `src/features/budget/__tests__/BudgetExpenseForm.test.tsx`・`BudgetExpenseEditForm.test.tsx`                                                                 | 変更 | 日またぎの再描画で通知が消える（直す前でも通る旨をコメントに書く）                 | 2      |
| `src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx`・`BudgetExpenseEditForm.useToday.test.tsx`                                               | 新規 | 配線テスト（`useLocalTodayKey` をモック）                                          | 2      |
| `src/features/budget/__tests__/useBudgetPageState.test.tsx`                                                                                                  | 変更 | 再描画せずに 0 時をまたいで追加・編集を保存すると、保存の瞬間の今日で判定（L-538） | 2      |
| `src/__tests__/reactCompilerToday.contract.test.ts`                                                                                                          | 変更 | `TODAY_TARGETS` に 3 ファイル                                                      | 3      |
| `docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-05-09.ts`・`group-10-13.ts` | 変更 | 確認表 `8-17`（`8-17-1`・`8-17-2`）と `11-8`（`11-8-1`）                           | 4      |

タスクの順と依存: Task 1 → Task 2 → Task 3 → Task 4（Task 1 と 2 は互いに依存しないが、Task 3 は両方の実装を前提にする）。各タスクの終わりに `npm run typecheck`・`npm run lint` とそのタスクのテストが通る。既存のテストが一時的に落ちるタスクは無い（試作で、Task 1 の後・Task 2 の後のどちらでも、既存のテストはすべて通ることを確認した。書き換えが必要な既存のテストは無い。`useStatisticsComputedStats.test.tsx` は `useWeeklyGoalProgress` をモックしていて、呼び出しの引数 `(currentDate)` は変わらない）。

---

## Task 1: 週目標の進捗の今日を共通フックから取る

**Files:**

- Modify: `src/features/statistics/page/useWeeklyGoalProgress.ts:1-26`（ファイル全体）
- Modify: `src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx`（ファイル全体）
- Create: `src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx`

**Interfaces:**

- Consumes: `useJstTodayKey(): string`（`src/hooks/useToday.ts`。JST の `YYYY-MM-DD`）、`calculateWeeklyGoalProgress({ selectedDate: Date; today: Date; routines: Routine[]; history: HistoryMap }): WeeklyGoalProgress[]`（`src/features/statistics/statistics/weeklyGoals.ts`。`today` は `getWeekStartKey`（JST・月曜始まり）にだけ使う）。
- Produces: `useWeeklyGoalProgress(selectedDate: Date, options?: { now?: () => Date }): WeeklyGoalProgress[]`（シグネチャは変えない）。本体に `const todayKey = useJstTodayKey();` があり、`useMemo` の依存の配列が `[selectedDate, now, todayKey]`（Task 3 の契約テスト `hookCall: "useJstTodayKey("`・`dependencies: ["todayKey"]` と、変異 (4) の置換文字列 `    [selectedDate, now, todayKey],\n` がこの形に依存する）。

- [ ] **Step 1: 落ちるテストを書く（週目標の日またぎ）**

`src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx` を次の内容にする（既存の 1 件「現在のルーティンと全履歴を純粋集計へ渡す」はそのまま残し、先頭の `describe` に `beforeEach` を足し、`describe("options.now が無いときの今日（JST）")` を足す）。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
  getMonthlyHistory: jest.fn(),
}));

jest.mock("../statistics", () => ({
  calculateWeeklyGoalProgress: jest.fn(),
}));

import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { calculateWeeklyGoalProgress } from "../statistics";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

describe("useWeeklyGoalProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在のルーティンと全履歴を純粋集計へ渡す", () => {
    const selectedDate = new Date("2026-08-17T12:00:00+09:00");
    const today = new Date("2026-08-19T12:00:00+09:00");
    const routines = [{ id: "exercise" }];
    const history = { "2026-08-17": { date: "2026-08-17" } };
    const calculated = [{ goalId: "exercise", completedCount: 1 }];
    (getRoutines as jest.Mock).mockReturnValue(routines);
    (getMonthlyHistory as jest.Mock).mockReturnValue(history);
    (calculateWeeklyGoalProgress as jest.Mock).mockReturnValue(calculated);

    const { result } = renderHook(() =>
      useWeeklyGoalProgress(selectedDate, { now: () => today }),
    );

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith({
      selectedDate,
      today,
      routines,
      history,
    });
    expect(result.current).toBe(calculated);
  });

  describe("options.now が無いときの今日（JST）", () => {
    beforeEach(() => {
      (getRoutines as jest.Mock).mockReturnValue([]);
      (getMonthlyHistory as jest.Mock).mockReturnValue({});
      (calculateWeeklyGoalProgress as jest.Mock).mockReturnValue([]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("今日の JST の 0 時の Date を渡す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-04T15:30:00+09:00"));
      const selectedDate = new Date("2026-11-04T12:00:00+09:00");

      renderHook(() => useWeeklyGoalProgress(selectedDate));

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);
      expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDate,
          today: new Date("2026-11-04T00:00:00+09:00"),
        }),
      );
    });

    // 手書きの useMemo は Jest でも依存を尊重するので、今日のキーが依存に無い形（直す前）では
    // このテストは落ちる（本物の赤）。rerender の前後で selectedDate に同じ Date のインスタンスを渡す
    // （毎回新しい Date を渡すと、依存が変わって直す前でも計算し直され、通ってしまう）。
    // またぐ前に渡す today の確認は「今日の JST の 0 時の Date を渡す」が担う（ここで確かめると、
    // 直す前は時刻つきの today の不一致で先に落ち、依存の不足による赤にならない）
    it("JST の月曜 0 時をまたいだ後の再描画で、同じ選択日のまま新しい週の今日で計算し直す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-08T23:59:00+09:00"));
      const selectedDate = new Date("2026-11-08T12:00:00+09:00");
      const { rerender } = renderHook(
        ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
        { initialProps: { date: selectedDate } },
      );
      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);

      jest.setSystemTime(new Date("2026-11-09T00:01:00+09:00"));
      rerender({ date: selectedDate });

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(2);
      expect(calculateWeeklyGoalProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          selectedDate,
          today: new Date("2026-11-09T00:00:00+09:00"),
        }),
      );
    });

    it("同じ日のうちの再描画（今日も選択日も同じ）では、計算し直さない", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-09T08:00:00+09:00"));
      const selectedDate = new Date("2026-11-09T12:00:00+09:00");
      const { rerender } = renderHook(
        ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
        { initialProps: { date: selectedDate } },
      );

      jest.setSystemTime(new Date("2026-11-09T21:00:00+09:00"));
      rerender({ date: selectedDate });

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);
    });
  });
});
```

（2026-11-08 は日曜、2026-11-09 は月曜。`getWeekStartKey` で前者は `2026-11-02`、後者は `2026-11-09` の週になる。）

- [ ] **Step 2: 落ちる配線テストを書く**

`src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx` を新しく作る。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  getMonthlyHistory: jest.fn(() => ({})),
}));

jest.mock("../statistics", () => ({
  calculateWeeklyGoalProgress: jest.fn(() => []),
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { calculateWeeklyGoalProgress } from "../statistics";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

// 週目標の今日（options.now が無いとき）は、共通フック useJstTodayKey の値で決める。
// 時計（2026-11-04）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）
describe("useWeeklyGoalProgress の今日は共通フック useJstTodayKey から取る", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-11-04T12:00:00+09:00"));
    (useJstTodayKey as jest.Mock).mockReturnValue("2026-11-16");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの日付の JST の 0 時を today として渡す", () => {
    const selectedDate = new Date("2026-11-04T12:00:00+09:00");

    renderHook(() => useWeeklyGoalProgress(selectedDate));

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedDate,
        today: new Date("2026-11-16T00:00:00+09:00"),
      }),
    );
  });

  it("再描画でフックの日付が変わると、同じ選択日のまま計算し直す", () => {
    const selectedDate = new Date("2026-11-04T12:00:00+09:00");
    const { rerender } = renderHook(
      ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
      { initialProps: { date: selectedDate } },
    );

    (useJstTodayKey as jest.Mock).mockReturnValue("2026-11-23");
    rerender({ date: selectedDate });

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(2);
    expect(calculateWeeklyGoalProgress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        today: new Date("2026-11-23T00:00:00+09:00"),
      }),
    );
  });

  it("options.now を渡したときは、フックの日付ではなく now() の値を使う", () => {
    const injectedToday = new Date("2026-08-19T12:00:00+09:00");

    renderHook(() =>
      useWeeklyGoalProgress(new Date("2026-08-17T12:00:00+09:00"), {
        now: () => injectedToday,
      }),
    );

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
      expect.objectContaining({ today: injectedToday }),
    );
  });
});
```

- [ ] **Step 3: 落ちることを確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✓|✕|Tests:"`

Expected（試作で確認済み）: `Tests: 4 failed, 3 passed, 7 total`。落ちるのは次の 4 件。

```text
✕ フックの日付の JST の 0 時を today として渡す
✕ 再描画でフックの日付が変わると、同じ選択日のまま計算し直す
✕ 今日の JST の 0 時の Date を渡す
✕ JST の月曜 0 時をまたいだ後の再描画で、同じ選択日のまま新しい週の今日で計算し直す
```

通るのは「現在のルーティンと全履歴を純粋集計へ渡す」「同じ日のうちの再描画（今日も選択日も同じ）では、計算し直さない」「options.now を渡したときは、フックの日付ではなく now() の値を使う」（どれも直す前の挙動と同じことを確かめるもの）。「JST の月曜 0 時をまたいだ後の…」は、またいだ後の `expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(2)` で `Expected number of calls: 2` / `Received number of calls: 1` として落ちる（`useMemo` の依存に今日が無いため、またいだ後の再描画で計算し直されない。設計書の「本物の赤」）。この理由で落ちていることを出力で確かめる（`toHaveBeenLastCalledWith` の不一致で落ちていたら、テストの形が違う）。結果を `.superpowers/sdd/2026-11-07-today-forms-weekly-goal/` の Task 1 の報告に書く。

- [ ] **Step 4: 実装する**

`src/features/statistics/page/useWeeklyGoalProgress.ts` を次の内容にする。

```ts
import { useMemo } from "react";
import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { useJstTodayKey } from "@/hooks/useToday";
import { calculateWeeklyGoalProgress } from "../statistics";
import type { WeeklyGoalProgress } from "../statistics/types";

type UseWeeklyGoalProgressOptions = {
  now?: () => Date;
};

export const useWeeklyGoalProgress = (
  selectedDate: Date,
  options: UseWeeklyGoalProgressOptions = {},
): WeeklyGoalProgress[] => {
  const now = options.now;
  // 今日は週の開始日（JST・月曜始まり）を求めるためだけに使うので、JST の今日のキーから
  // 作った 0 時の Date で足りる。キーを依存に入れ、日をまたいだ後の再描画で計算し直す
  const todayKey = useJstTodayKey();

  return useMemo(
    () =>
      calculateWeeklyGoalProgress({
        selectedDate,
        today: now ? now() : new Date(`${todayKey}T00:00:00+09:00`),
        routines: getRoutines(),
        history: getMonthlyHistory(),
      }),
    [selectedDate, now, todayKey],
  );
};
```

- [ ] **Step 5: 通ることを確かめる**

Run: `cd .worktrees/issue-211-today-forms && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/statistics --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:|Test Suites:|not wrapped in act"`

Expected: `Test Suites: 33 passed, 33 total`・`Tests: 93 passed, 93 total`（作業前は 32 本・87 件）。`✕`・`not wrapped in act` が出ない。

- [ ] **Step 6: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write src/features/statistics/page/useWeeklyGoalProgress.ts src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx && npm run typecheck && npm run lint && npx prettier --check src/features/statistics/page/useWeeklyGoalProgress.ts src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx`

Expected: すべて exit 0（`react-hooks/exhaustive-deps` の警告も出ない。`todayKey` は計算に使われている）。

（コミットしない）

---

## Task 2: 家計簿の支出フォーム（追加・編集）の 0 円の通知の今日を共通フックから取る

**Files:**

- Modify: `src/features/budget/components/BudgetExpenseForm.tsx:1-2,36-41`
- Modify: `src/features/budget/components/BudgetExpenseEditForm.tsx:1-2,32-37`
- Modify: `src/features/budget/__tests__/BudgetExpenseForm.test.tsx:220-224`（「0 円が保存できない組み合わせの通知」の `describe` の末尾に 1 件）
- Modify: `src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx:136-145`（同じく 1 件）
- Create: `src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx`
- Create: `src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx`
- Modify: `src/features/budget/__tests__/useBudgetPageState.test.tsx:383`（「支出の編集をキャンセルすると保存せず編集対象を解除する」の直前に 2 件）

**Interfaces:**

- Consumes: `useLocalTodayKey(): string`（`src/hooks/useToday.ts`。端末ローカルの `YYYY-MM-DD`。家計簿の `toDateKey(new Date())` と同じ結果）、`isZeroAmountOnUnavailableDate(amountText: string, date: string, now: Date): boolean`（`src/features/budget/utils/expenseAmountRule.ts`。`now` は `isBeforeToday` → `toDateKey(now)` の日付の部分だけを使う）。
- Produces: `BudgetExpenseForm`・`BudgetExpenseEditForm` の props は変えない。両方の本体に `const todayKey = useLocalTodayKey();` があり、判定の第 3 引数が ``new Date(`${todayKey}T00:00:00`)``（Task 3 の契約テスト `hookCall: "useLocalTodayKey("`・`dependencies: ["todayKey"]` がこの形に依存する）。保存のハンドラ（`createExpenseAddHandler`・`createExpenseUpdateHandler`、`src/features/budget/budgetMutationActions.ts`）は変えない。

- [ ] **Step 1: 落ちる配線テストを書く（追加フォーム）**

`src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx` を新しく作る。

```tsx
import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useLocalTodayKey: jest.fn(),
}));

import { useLocalTodayKey } from "@/hooks/useToday";
import { BudgetExpenseForm } from "../components/BudgetExpenseForm";

const props = {
  categories: [],
  expenseAmount: "0",
  expenseCategoryId: "",
  expenseDate: "2026-03-06",
  scrollRequestKey: 0,
  onAdd: jest.fn(),
  onAmountChange: jest.fn(),
  onCancel: jest.fn(),
  onCategoryIdChange: jest.fn(),
  onDateChange: jest.fn(),
};

// 0 円の通知の判定に使う今日は、共通フック useLocalTodayKey の値で決める。
// 時計（2026-03-07）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）。
// 直す前（描画のたびに new Date()）では時計の日で判定されるので、このテストは落ちる
describe("BudgetExpenseForm の 0 円の通知の今日は共通フック useLocalTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの今日（2026-03-05）では 03-06 は今日より前ではないので、0 円を通知する", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-05");

    render(<BudgetExpenseForm {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "0 円は、今日より前の日付だけ記録できます",
    );
  });

  it("フックの今日（2026-03-09）では 03-08 は今日より前なので、0 円を通知しない", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-09");

    render(<BudgetExpenseForm {...props} expenseDate="2026-03-08" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-06");
    const { rerender } = render(<BudgetExpenseForm {...props} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-03-07");
    rerender(<BudgetExpenseForm {...props} expenseCategoryId="c1" />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 落ちる配線テストを書く（編集フォーム）**

`src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx` を新しく作る。

```tsx
import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useLocalTodayKey: jest.fn(),
}));

import { useLocalTodayKey } from "@/hooks/useToday";
import { BudgetExpenseEditForm } from "../components/BudgetExpenseEditForm";

const categories = [
  { id: "cat-lunch", name: "ランチ", createdAt: "2026-05-01T00:00:00.000Z" },
  { id: "cat-book", name: "書籍", createdAt: "2026-05-01T00:00:00.000Z" },
];

const props = {
  categories,
  editingExpenseDate: "2026-05-21",
  editingExpenseAmount: "0",
  editingExpenseCategoryId: "cat-lunch",
  onCancelEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onEditDateChange: jest.fn(),
  onEditAmountChange: jest.fn(),
  onEditCategoryIdChange: jest.fn(),
};

// 0 円の通知の判定に使う今日は、共通フック useLocalTodayKey の値で決める。
// 時計（2026-05-22）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）。
// 直す前（描画のたびに new Date()）では時計の日で判定されるので、このテストは落ちる
describe("BudgetExpenseEditForm の 0 円の通知の今日は共通フック useLocalTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-05-22T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの今日（2026-05-20）では 05-21 は今日より前ではないので、0 円を通知する", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-20");

    render(<BudgetExpenseEditForm {...props} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "0 円は、今日より前の日付だけ記録できます",
    );
  });

  it("フックの今日（2026-05-24）では 05-23 は今日より前なので、0 円を通知しない", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-24");

    render(
      <BudgetExpenseEditForm {...props} editingExpenseDate="2026-05-23" />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく", () => {
    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-21");
    const { rerender } = render(<BudgetExpenseEditForm {...props} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    (useLocalTodayKey as jest.Mock).mockReturnValue("2026-05-22");
    rerender(
      <BudgetExpenseEditForm {...props} editingExpenseCategoryId="cat-book" />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: 日またぎのテストと、保存の瞬間の今日のテストを書く（どちらも直す前でも通る）**

(a) `src/features/budget/__tests__/BudgetExpenseForm.test.tsx`

次の部分を

```text
      renderForm({ expenseAmount: "", expenseDate: "2026-03-07" });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
```

次にする

```text
      renderForm({ expenseAmount: "", expenseDate: "2026-03-07" });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    // Jest（ts-jest）は React Compiler を通さないので、このテストは直す前（描画のたびに new Date()）でも通る
    // （コンパイラによる固定は検出しない。L-690）。直した後も判定が描画時の新しい今日になる経路の固定として置く。
    // 赤は BudgetExpenseForm.useToday.test.tsx（共通フックのモック）と契約テストで作る
    it("今日の日付で 0 円の通知が出たまま 0 時をまたぐと、再描画で通知が消える（またいだ後は「昨日」の 0 円は記録できる）", () => {
      jest.setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
      const { rerender, props } = renderFormWithRerender();
      rerender(<BudgetExpenseForm {...props} expenseAmount="0" />);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
      rerender(
        <BudgetExpenseForm
          {...props}
          expenseAmount="0"
          expenseCategoryId="c1"
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("例: 1500")).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });
  });
});
```

（この `describe` の `beforeEach` がフェイクタイマーを有効にしているので、`jest.setSystemTime` だけで時刻を進められる。`renderFormWithRerender` の `expenseDate` は `2026-03-07`。）

(b) `src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx`

次の部分を

```text
    it("0 円以外の金額は、今日の日付でも通知しない", () => {
      renderForm({
        editingExpenseDate: "2026-05-22",
        editingExpenseAmount: "850",
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
```

次にする

```text
    it("0 円以外の金額は、今日の日付でも通知しない", () => {
      renderForm({
        editingExpenseDate: "2026-05-22",
        editingExpenseAmount: "850",
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    // Jest（ts-jest）は React Compiler を通さないので、このテストは直す前（描画のたびに new Date()）でも通る
    // （コンパイラによる固定は検出しない。L-690）。直した後も判定が描画時の新しい今日になる経路の固定として置く。
    // 赤は BudgetExpenseEditForm.useToday.test.tsx（共通フックのモック）と契約テストで作る
    it("今日の日付の支出を 0 円にして通知が出たまま 0 時をまたぐと、再描画で通知が消える", () => {
      jest.setSystemTime(new Date("2026-05-22T23:59:00+09:00"));
      const props = {
        categories,
        editingExpenseDate: "2026-05-22",
        editingExpenseAmount: "0",
        editingExpenseCategoryId: "cat-lunch",
        onCancelEdit: jest.fn(),
        onSaveEdit: jest.fn(),
        onEditDateChange: jest.fn(),
        onEditAmountChange: jest.fn(),
        onEditCategoryIdChange: jest.fn(),
      };
      const { rerender } = render(<BudgetExpenseEditForm {...props} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();

      jest.setSystemTime(new Date("2026-05-23T00:01:00+09:00"));
      rerender(
        <BudgetExpenseEditForm
          {...props}
          editingExpenseCategoryId="cat-book"
        />,
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText(/金額/)).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });
  });
});
```

(c) `src/features/budget/__tests__/useBudgetPageState.test.tsx`（L-538。「設計書との差異」1。ファイルの先頭の `beforeEach` がフェイクタイマーを有効にし、`afterEach` で戻している。`mockAddExpense`・`mockUpdateExpense`・`mockNavigate` は既存の変数）

次の部分を

```text
  it("支出の編集をキャンセルすると保存せず編集対象を解除する", () => {
```

次にする

```text
  // 保存の検証は、押した時点（ハンドラの本体）の今日で行う（L-538）。前日の 23:59 に入力し、
  // 再描画せずに 0:01 へ進めてから保存する。描画時の今日をハンドラに持たせる形にすると落ちる
  it("今日の日付で 0 円を入れたまま、再描画せずに 0 時をまたいで追加すると、またいだ後の今日で判定して追加する", () => {
    jest.setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );
    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("0");
      result.current.handleExpenseDateChange("2026-03-07");
    });

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).toHaveBeenCalledWith("2026-03-07", 0, undefined);
  });

  it("編集で今日の日付の支出を 0 円にしたまま、再描画せずに 0 時をまたいで保存すると、またいだ後の今日で判定して保存する", () => {
    jest.setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
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
      result.current.handleEditExpenseDateChange("2026-03-07");
      result.current.handleEditExpenseAmountChange("0");
    });

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      "2026-03",
      "e-mar",
      expect.objectContaining({ amount: 0, date: "2026-03-07" }),
    );
  });

  it("支出の編集をキャンセルすると保存せず編集対象を解除する", () => {
```

- [ ] **Step 4: 配線テストが落ち、ほかは通ることを確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|0 時をまた|Tests:"`

Expected（試作で確認済み）: `Tests: 6 failed, 54 passed, 60 total`。落ちるのは 2 つの `*.useToday.test.tsx` の 3 件ずつ（計 6 件の `✕` の行）。`0 時をまた` に当たる行は Step 3 の 4 件（「今日の日付で 0 円の通知が出たまま 0 時をまたぐと…」「今日の日付の支出を 0 円にして通知が出たまま 0 時をまたぐと…」「…再描画せずに 0 時をまたいで追加すると…」「…再描画せずに 0 時をまたいで保存すると…」。既存のテスト名には当たらない）で、どれも `✓` で通る（出力は `✕` 6 行・`✓` 4 行・`Tests:` 1 行）（直す前でも通るテスト。日またぎの 2 件はコンパイラの固定を検出しないため（L-690）、保存の 2 件は保存のハンドラが元から押した時点の今日で検証するため）。結果を Task 2 の報告に書く。

- [ ] **Step 5: 実装する**

(a) `src/features/budget/components/BudgetExpenseForm.tsx`

次の部分を

```text
import { useEffect, useId, useRef } from "react";
import type { BudgetCategory } from "@/types/routine";
```

次にする

```text
import { useEffect, useId, useRef } from "react";
import { useLocalTodayKey } from "@/hooks/useToday";
import type { BudgetCategory } from "@/types/routine";
```

次の部分を

```text
  const zeroNoticeId = useId();
  const isZeroRejected = isZeroAmountOnUnavailableDate(
    expenseAmount,
    expenseDate,
    new Date(),
  );
```

次にする

```text
  const zeroNoticeId = useId();
  // 判定は日付の部分しか使わないので、今日（端末ローカル）の 0 時の Date で足りる。
  // 共通フックから取り、日をまたいだ後の再描画で新しい今日で判定する（React Compiler の固定を避ける）
  const todayKey = useLocalTodayKey();
  const isZeroRejected = isZeroAmountOnUnavailableDate(
    expenseAmount,
    expenseDate,
    new Date(`${todayKey}T00:00:00`),
  );
```

(b) `src/features/budget/components/BudgetExpenseEditForm.tsx`

次の部分を

```text
import { useId } from "react";
import type { BudgetCategory } from "@/types/routine";
```

次にする

```text
import { useId } from "react";
import { useLocalTodayKey } from "@/hooks/useToday";
import type { BudgetCategory } from "@/types/routine";
```

次の部分を

```text
  const zeroNoticeId = useId();
  const isZeroRejected = isZeroAmountOnUnavailableDate(
    editingExpenseAmount,
    editingExpenseDate,
    new Date(),
  );
```

次にする

```text
  const zeroNoticeId = useId();
  // 判定は日付の部分しか使わないので、今日（端末ローカル）の 0 時の Date で足りる。
  // 共通フックから取り、日をまたいだ後の再描画で新しい今日で判定する（React Compiler の固定を避ける）
  const todayKey = useLocalTodayKey();
  const isZeroRejected = isZeroAmountOnUnavailableDate(
    editingExpenseAmount,
    editingExpenseDate,
    new Date(`${todayKey}T00:00:00`),
  );
```

（保存のボタンの `onAdd`・`onSaveEdit` は props のまま。`todayKey` をハンドラへ渡さない。L-538。）

- [ ] **Step 6: 通ることと、保存のハンドラが描画時の今日を使っていないことを確かめる（L-538。変異はテストに含めない）**

(a) Run: `cd .worktrees/issue-211-today-forms && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/budget --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:|Test Suites:|not wrapped in act|SIGSEGV"`

Expected: `Test Suites: 97 passed, 97 total`・`Tests: 614 passed, 614 total`（作業前は 95 本・604 件。新規 2 本・10 件）。SIGSEGV で 1 本欠けたら、そのファイルを単独で実行して通ることを確かめる。

(b) 保存のハンドラが描画時の今日を使わないことを grep で確かめる。

Run: `cd .worktrees/issue-211-today-forms && grep -n "todayKey\|new Date" src/features/budget/budgetMutationActions.ts src/features/budget/useBudgetExpenseActions.ts; grep -n "now = new Date()" src/features/budget/budgetPageStateLogic.ts`

Expected: 最初の `grep` は何も出さない（ハンドラの生成に今日を渡していない）。2 つ目は `buildExpensePayload` の引数の既定値 `now = new Date(),` の 1 行（ハンドラの本体の中で `buildExpensePayload` が呼ばれた時点で今日を取る）。

(c) ハンドラが描画時（ハンドラを作った時点）の今日を使う形に一時的に書き換え、Step 3 (c) の 2 件だけが落ちることを確かめる（日本語を含まないので `node -e` で書き換える）。

```bash
cd .worktrees/issue-211-today-forms && BK=".git/worktrees/issue-211-today-forms/today-forms-backup" && mkdir -p "$BK" && cp src/features/budget/budgetMutationActions.ts "$BK/" && node -e '
const fs = require("fs");
const p = "src/features/budget/budgetMutationActions.ts";
let s = fs.readFileSync(p, "utf8");
const add = "  return () => {\n    addExpenseFromInput({";
const update = "  return () => {\n    if (!editingExpenseId) {";
for (const x of [add, update]) if (s.split(x).length !== 2) throw new Error("not exactly once: " + x);
s = s.replace(add, "  const renderTimeNow = new Date();\n" + add).replace(update, "  const renderTimeNow = new Date();\n" + update);
const bp = "      buildPayload: buildExpensePayload,\n";
if (s.split(bp).length !== 3) throw new Error("buildPayload not exactly twice");
s = s.split(bp).join("      buildPayload: (input) => buildExpensePayload({ ...input, now: renderTimeNow }),\n");
fs.writeFileSync(p, s);
' && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/budget/__tests__/useBudgetPageState.test.tsx --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:" | sed -E 's/ \([0-9]+ ms\)//'; cp "$BK/budgetMutationActions.ts" src/features/budget/budgetMutationActions.ts && cmp "$BK/budgetMutationActions.ts" src/features/budget/budgetMutationActions.ts && echo RESTORED
```

Expected（試作で確認済み）:

```text
    ✕ 今日の日付で 0 円を入れたまま、再描画せずに 0 時をまたいで追加すると、またいだ後の今日で判定して追加する
    ✕ 編集で今日の日付の支出を 0 円にしたまま、再描画せずに 0 時をまたいで保存すると、またいだ後の今日で判定して保存する
Tests:       2 failed, 29 passed, 31 total
RESTORED
```

結果を Task 2 の報告に書く。`RESTORED` が出ない場合は `cp "$BK/budgetMutationActions.ts" src/features/budget/budgetMutationActions.ts` で戻し、`git diff --stat src/features/budget/budgetMutationActions.ts` が空であることを確かめる。

- [ ] **Step 7: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/components/BudgetExpenseEditForm.tsx src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx && npm run typecheck && npm run lint && npx prettier --check src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/components/BudgetExpenseEditForm.tsx src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx src/features/budget/__tests__/BudgetExpenseForm.test.tsx src/features/budget/__tests__/BudgetExpenseEditForm.test.tsx src/features/budget/__tests__/useBudgetPageState.test.tsx`

Expected: すべて exit 0。

（コミットしない）

---

## Task 3: 契約テストに 3 ファイルを足し、変異で落ちることを確かめる

**Files:**

- Modify: `src/__tests__/reactCompilerToday.contract.test.ts:89-94`（`TODAY_TARGETS` の末尾）

**Interfaces:**

- Consumes: Task 1 の `useWeeklyGoalProgress.ts`（`const todayKey = useJstTodayKey();`、依存 `[selectedDate, now, todayKey]`）、Task 2 の `BudgetExpenseForm.tsx`・`BudgetExpenseEditForm.tsx`（`const todayKey = useLocalTodayKey();`）。契約テストの型 `TodayTarget = { file: string; hookCall?: string; dependencies: string[] }`（既存。変えない）。
- Produces: `TODAY_TARGETS` の 7 件目〜 9 件目（既存は 6 対象。足した後は 9 対象。`USE_NO_MEMO_TARGETS` の 4 件は別の配列で変えない。テストの件数 30 → 42）。

- [ ] **Step 1: 対象を足す**

`src/__tests__/reactCompilerToday.contract.test.ts`

次の部分を

```text
  {
    file: "src/features/budget/useBudgetPageMetricsState.ts",
    hookCall: "useLocalTodayKey(",
    dependencies: ["todayKey"],
  },
];
```

次にする

```text
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
];
```

- [ ] **Step 2: 通ることを確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write src/__tests__/reactCompilerToday.contract.test.ts && NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:|budget/components|statistics/page"`

Expected: `Tests: 42 passed, 42 total`（作業前は 30 件）。3 つの対象の見出し（`src/features/budget/components/BudgetExpenseForm.tsx`・`src/features/budget/components/BudgetExpenseEditForm.tsx`・`src/features/statistics/page/useWeeklyGoalProgress.ts`）がそれぞれ 4 件（`_c(`・sentinel・`todayKey` の依存・`hookCall`）を持つ。

（このテストは Task 1・2 の実装の後に足すため、「先に落ちる」確認は Step 3〜4 の空振り防止と変異で行う。）

- [ ] **Step 3: 空振り防止を確かめる（L-690。テストには含めない）**

`transpileModule` の `target`・`module` を一時的に外すと、コンパイラがフックを認識せず `_c(` が出なくなる。前提の確認（`_c(` がある）が、足した 3 つの対象でも捕まえることを確かめる。

```bash
cd .worktrees/issue-211-today-forms && BK=".git/worktrees/issue-211-today-forms/today-forms-backup" && mkdir -p "$BK" && cp src/__tests__/reactCompilerToday.contract.test.ts "$BK/" && node -e '
const fs = require("fs");
const p = "src/__tests__/reactCompilerToday.contract.test.ts";
const s = fs.readFileSync(p, "utf8");
const old = "      target: ts.ScriptTarget.ESNext,\n      module: ts.ModuleKind.ESNext,\n";
if (s.split(old).length !== 2) throw new Error("not exactly once");
fs.writeFileSync(p, s.replace(old, ""));
' && NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ --verbose 2>&1 | grep -E "✕|Tests:" | sed -E 's/ \([0-9]+ ms\)//' | sort | uniq -c; cp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && cmp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && echo RESTORED
```

Expected（試作で確認済み）:

```text
   9       ✕ React Compiler でコンパイルされている（出力に _c( がある）
   1       ✕ メモ化の依存の比較に currentDate がある
   2       ✕ メモ化の依存の比較に currentDayOfWeek がある
   2       ✕ メモ化の依存の比較に isTodayHoliday がある
   2       ✕ メモ化の依存の比較に today がある
   4       ✕ メモ化の依存の比較に todayKey がある
   1       ✕ メモ化の依存の比較に todayStr がある
   1 Tests:       21 failed, 21 passed, 42 total
RESTORED
```

（`_c(` の確認が 9 対象すべてで落ち、`todayKey` の依存の確認が家計簿の 3 つと週目標の 1 つの計 4 件落ちる。）結果を Task 3 の報告に書く。

- [ ] **Step 4: 変異の確認（設計書「変異の確認」。テストには含めない）**

変異ごとの期待（L-690。変異ごとに分けて書く）:

- (1)(2) 家計簿のフォームを共通フックの前（描画のたびに `new Date()`。origin/main の形）に戻す → 契約テストの「メモ化の依存の比較に todayKey がある」と「ソースが今日を返すフック useLocalTodayKey( を呼んでいる」の 2 件と、そのフォームの配線テスト 3 件が落ちる。`_c(`・sentinel の確認と、日またぎの単体テスト（直す前でも通る）は通る。
- (3) `useWeeklyGoalProgress` を共通フックの前（origin/main の形）に戻す → 契約テストの `todayKey` の依存と `hookCall` の 2 件、週目標の単体テストの 2 件（「今日の JST の 0 時の Date を渡す」「JST の月曜 0 時をまたいだ後の…」）、配線テストの 2 件が落ちる。
- (4) `useWeeklyGoalProgress` の依存の配列から `todayKey` だけを外す → 契約テストの「コンパイルされている（`_c(`）」と「メモ化の依存の比較に todayKey がある」の 2 件が落ち、sentinel の確認（対象が無い）と `hookCall` の確認は通る。単体テストでは、日またぎの 2 件（「JST の月曜 0 時をまたいだ後の…」「再描画でフックの日付が変わると…」）が、どちらも `toHaveBeenCalledTimes(2)` の `Expected number of calls: 2` / `Received number of calls: 1` で落ちる（Task 1 Step 3 の直す前の赤と同じ理由）。

(a) origin/main の 3 ファイルをバックアップの置き場所に書き出し、今のファイルも控える。

Run: `cd .worktrees/issue-211-today-forms && BK=".git/worktrees/issue-211-today-forms/today-forms-backup" && mkdir -p "$BK/orig" && git show origin/main:src/features/budget/components/BudgetExpenseForm.tsx > "$BK/orig/BudgetExpenseForm.tsx" && git show origin/main:src/features/budget/components/BudgetExpenseEditForm.tsx > "$BK/orig/BudgetExpenseEditForm.tsx" && git show origin/main:src/features/statistics/page/useWeeklyGoalProgress.ts > "$BK/orig/useWeeklyGoalProgress.ts" && cp src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/components/BudgetExpenseEditForm.tsx src/features/statistics/page/useWeeklyGoalProgress.ts "$BK/" && ls "$BK" "$BK/orig"`

Expected: `$BK` に 3 ファイル（と Step 3 の契約テストの控え）、`$BK/orig` に 3 ファイル。

(b) 次のスクリプトを **Write ツールで** `.git/worktrees/issue-211-today-forms/today-forms-backup/mutate-today-forms.mjs` に保存する（日本語を含むので heredoc は使わない）。

```js
// 変異の確認（設計書「契約テストの対象に加える › 変異の確認」）。テストには含めない。
// 使い方: node <このファイル> <origin/main の 3 ファイルを置いたディレクトリ>
// 各変異で対象を書き換え、契約テストと関係する単体テストを流し、finally で必ず元に戻す。
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const [origDir] = process.argv.slice(2);
if (!origDir)
  throw new Error("origin/main のファイルを置いたディレクトリを渡す");

const CONTRACT = "src/__tests__/reactCompilerToday.contract.test.ts";
const FORM = "src/features/budget/components/BudgetExpenseForm.tsx";
const EDIT_FORM = "src/features/budget/components/BudgetExpenseEditForm.tsx";
const WEEKLY = "src/features/statistics/page/useWeeklyGoalProgress.ts";

const MUTATIONS = [
  {
    label:
      "(1) BudgetExpenseForm を共通フックの前（描画のたびに new Date()）に戻す",
    path: FORM,
    fromOrigin: "BudgetExpenseForm.tsx",
    tests: [CONTRACT, "src/features/budget/__tests__/BudgetExpenseForm"],
  },
  {
    label:
      "(2) BudgetExpenseEditForm を共通フックの前（描画のたびに new Date()）に戻す",
    path: EDIT_FORM,
    fromOrigin: "BudgetExpenseEditForm.tsx",
    tests: [CONTRACT, "src/features/budget/__tests__/BudgetExpenseEditForm"],
  },
  {
    label:
      "(3) useWeeklyGoalProgress を共通フックの前（new Date()・依存は [selectedDate, now]）に戻す",
    path: WEEKLY,
    fromOrigin: "useWeeklyGoalProgress.ts",
    tests: [
      CONTRACT,
      "src/features/statistics/__tests__/useWeeklyGoalProgress",
    ],
  },
  {
    label: "(4) useWeeklyGoalProgress の依存の配列から todayKey だけを外す",
    path: WEEKLY,
    old: "    [selectedDate, now, todayKey],\n",
    new: "    [selectedDate, now],\n",
    tests: [
      CONTRACT,
      "src/features/statistics/__tests__/useWeeklyGoalProgress",
    ],
  },
];

for (const mutation of MUTATIONS) {
  const original = readFileSync(mutation.path, "utf8");
  let mutated;
  if (mutation.fromOrigin) {
    mutated = readFileSync(`${origDir}/${mutation.fromOrigin}`, "utf8");
  } else {
    if (original.split(mutation.old).length !== 2) {
      throw new Error(
        `${mutation.label}: 置換する文字列がちょうど 1 回ではない`,
      );
    }
    mutated = original.replace(mutation.old, mutation.new);
  }
  let output = "";
  try {
    writeFileSync(mutation.path, mutated);
    const result = spawnSync(
      "npx",
      [
        "jest",
        ...mutation.tests,
        "--verbose",
        "--testPathIgnorePatterns=/node_modules/",
        "/firebase-functions/lib/",
        "/e2e/",
      ],
      {
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "test", TZ: "Asia/Tokyo" },
      },
    );
    output = `${result.stdout}${result.stderr}`;
  } finally {
    writeFileSync(mutation.path, original);
  }
  if (readFileSync(mutation.path, "utf8") !== original) {
    throw new Error(`${mutation.path} を元に戻せていない`);
  }
  const lines = output.split("\n");
  console.log(`## ${mutation.label}: ${mutation.path}`);
  console.log(
    lines.find((line) => line.startsWith("Tests:")) ?? "Tests: (なし)",
  );
  let section = "";
  for (const line of lines) {
    if (/^(PASS|FAIL) /.test(line))
      section = line.replace(/^(PASS|FAIL) /, "").replace(/ \(.*\)$/, "");
    if (/^ {4}src\//.test(line)) section = line.trim();
    if (line.includes("✕")) {
      console.log(`  [${section}] ${line.trim().replace(/ \(\d+ ms\)$/, "")}`);
    }
  }
}
```

（テストのパスの `src/features/budget/__tests__/BudgetExpenseForm` は、`BudgetExpenseForm.test.tsx` と `BudgetExpenseForm.useToday.test.tsx` の両方に当たる。編集フォーム・週目標も同じ。）

(c) 実行し、元に戻っていることを確かめる。

Run: `cd .worktrees/issue-211-today-forms && BK=".git/worktrees/issue-211-today-forms/today-forms-backup" && node "$BK/mutate-today-forms.mjs" "$BK/orig"; for f in src/features/budget/components/BudgetExpenseForm.tsx src/features/budget/components/BudgetExpenseEditForm.tsx src/features/statistics/page/useWeeklyGoalProgress.ts; do cmp "$BK/$(basename $f)" "$f" || echo "DIFF: $f"; done; echo CHECKED`

Expected（試作で確認済み）:

```text
## (1) BudgetExpenseForm を共通フックの前（描画のたびに new Date()）に戻す: src/features/budget/components/BudgetExpenseForm.tsx
Tests:       5 failed, 53 passed, 58 total
  [src/features/budget/components/BudgetExpenseForm.tsx] ✕ メモ化の依存の比較に todayKey がある
  [src/features/budget/components/BudgetExpenseForm.tsx] ✕ ソースが今日を返すフック useLocalTodayKey( を呼んでいる
  [src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx] ✕ フックの今日（2026-03-05）では 03-06 は今日より前ではないので、0 円を通知する
  [src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx] ✕ フックの今日（2026-03-09）では 03-08 は今日より前なので、0 円を通知しない
  [src/features/budget/__tests__/BudgetExpenseForm.useToday.test.tsx] ✕ 再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく
## (2) BudgetExpenseEditForm を共通フックの前（描画のたびに new Date()）に戻す: src/features/budget/components/BudgetExpenseEditForm.tsx
Tests:       5 failed, 50 passed, 55 total
  [src/features/budget/components/BudgetExpenseEditForm.tsx] ✕ メモ化の依存の比較に todayKey がある
  [src/features/budget/components/BudgetExpenseEditForm.tsx] ✕ ソースが今日を返すフック useLocalTodayKey( を呼んでいる
  [src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx] ✕ フックの今日（2026-05-20）では 05-21 は今日より前ではないので、0 円を通知する
  [src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx] ✕ フックの今日（2026-05-24）では 05-23 は今日より前なので、0 円を通知しない
  [src/features/budget/__tests__/BudgetExpenseEditForm.useToday.test.tsx] ✕ 再描画でフックの今日が変わると、金額・日付が同じままでも判定が追いつく
## (3) useWeeklyGoalProgress を共通フックの前（new Date()・依存は [selectedDate, now]）に戻す: src/features/statistics/page/useWeeklyGoalProgress.ts
Tests:       6 failed, 43 passed, 49 total
  [src/features/statistics/page/useWeeklyGoalProgress.ts] ✕ メモ化の依存の比較に todayKey がある
  [src/features/statistics/page/useWeeklyGoalProgress.ts] ✕ ソースが今日を返すフック useJstTodayKey( を呼んでいる
  [src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx] ✕ 今日の JST の 0 時の Date を渡す
  [src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx] ✕ JST の月曜 0 時をまたいだ後の再描画で、同じ選択日のまま新しい週の今日で計算し直す
  [src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx] ✕ フックの日付の JST の 0 時を today として渡す
  [src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx] ✕ 再描画でフックの日付が変わると、同じ選択日のまま計算し直す
## (4) useWeeklyGoalProgress の依存の配列から todayKey だけを外す: src/features/statistics/page/useWeeklyGoalProgress.ts
Tests:       4 failed, 45 passed, 49 total
  [src/features/statistics/page/useWeeklyGoalProgress.ts] ✕ React Compiler でコンパイルされている（出力に _c( がある）
  [src/features/statistics/page/useWeeklyGoalProgress.ts] ✕ メモ化の依存の比較に todayKey がある
  [src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx] ✕ JST の月曜 0 時をまたいだ後の再描画で、同じ選択日のまま新しい週の今日で計算し直す
  [src/features/statistics/__tests__/useWeeklyGoalProgress.useToday.test.tsx] ✕ 再描画でフックの日付が変わると、同じ選択日のまま計算し直す
CHECKED
```

`DIFF:` が出ないこと。(1)(2) で家計簿の日またぎの単体テスト（`BudgetExpenseForm.test.tsx`・`BudgetExpenseEditForm.test.tsx` の「…0 時をまたぐと、再描画で通知が消える」）が落ちないのが正しい（L-690: コンパイラを通さない Jest では直す前でも通る）。(4) で sentinel の確認と `ソースが今日を返すフック useJstTodayKey( を呼んでいる` が落ちないのが正しい（設計書）。参考: (4) は lint でも `react-hooks/preserve-manual-memoization`・`react-hooks/exhaustive-deps` で落ちる（このスクリプトは lint を流さない）。結果（変異ごとの件数と落ちたテスト名。Step 3 の結果も）を `.superpowers/sdd/2026-11-07-today-forms-weekly-goal/` の Task 3 の報告に書く。

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-211-today-forms && git status --short && npm run typecheck && npm run lint && npx prettier --check src/__tests__/reactCompilerToday.contract.test.ts`

Expected: `git status --short` にバックアップ・スクリプトが出ない（`.git` の中にあるため）。残りはすべて exit 0。

（コミットしない）

---

## Task 4: 確認表（8-17・11-8）と全体の検証

**Files:**

- Modify: `docs/03-testing/test-matrix.md:179`（8-16 の直後に 8-17）、`:223`（11-7 の直後に 11-8）
- Modify: `src/features/test-matrix/initialData.ts:660-666`（`8-16` の直後に `8-17`）、`:842-848`（`11-7` の直後に `11-8`）
- Modify: `src/features/test-matrix/detailed-test-cases/group-05-09.ts:727-728`（`"8-16"` の配列の後、`"9-1"` の前に `"8-17"`）
- Modify: `src/features/test-matrix/detailed-test-cases/group-10-13.ts:301-302`（`"11-7"` の配列の後、`"12-1"` の前に `"11-8"`）

**Interfaces:**

- Consumes: Task 1・2 の挙動。確認表の型 `TestItem`（`{ id; label; pc; sp; note }`）・`DetailTestCase`（`{ id; scenario; expected; pc; sp; note }`、`src/features/test-matrix/detailed-test-cases/types.ts`）。画面の文字: 家計簿（`src/features/budget/locales/ja.json`）の「➕」「支出を記録」「日付（月）」「日付（日）」「カテゴリ（任意）」「選択しない」「追加」「保存」「📋 支出一覧」「✏️」「🏷️ カテゴリ管理」「← 前月」「今月に戻る」、通知「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」。統計（`src/features/statistics/locales/ja.json`）の「📅 週次」「📆 月次」「今週」「前の期間へ」「次の期間へ」「週間目標」「現在 {count}週」「最長 {count}週」。ルーティン（`src/features/routine/locales/ja.json`）の「週間目標」。
- Produces: 新しい確認の ID **8-17**（ケース `8-17-1` 追加フォーム・`8-17-2` 編集フォーム）と **11-8**（ケース `11-8-1`）。既存の ID は変えない・振り直さない。

- [ ] **Step 1: `docs/03-testing/test-matrix.md` に 2 行を足す**

次の部分を

```text
| 8-16 | 0 時をまたいだ後の「今日の支出」「1日あたり使える金額」 | ✅   | ⬜  | ⬜  | 開いたまま日をまたいで操作すると、新しい今日で計算し直す                                              |
```

次にする

```text
| 8-16 | 0 時をまたいだ後の「今日の支出」「1日あたり使える金額」 | ✅   | ⬜  | ⬜  | 開いたまま日をまたいで操作すると、新しい今日で計算し直す                                              |
| 8-17 | 0 時をまたいだ後の支出フォームの 0 円の通知 | ✅ | ⬜ | ⬜ | 追加・編集のフォームを開いたまま日をまたいでカテゴリを選び直すと、新しい今日で判定し直す |
```

次の部分を

```text
| 11-7 | 最高/最低達成日の表示                | 🔶   | ⬜  | ⬜  |          |
```

次にする

```text
| 11-7 | 最高/最低達成日の表示                | 🔶   | ⬜  | ⬜  |          |
| 11-8 | 0 時（月曜）をまたいだ後の週間目標の連続週 | 🔶 | ⬜ | ⬜ | 開いたまま月曜 0 時をまたいで表示モードを切り替えると、新しい週を基準に「現在 N週」を計算し直す |
```

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write docs/03-testing/test-matrix.md && grep -nE '^\| (8-1[67]|11-[78]) ' docs/03-testing/test-matrix.md`

Expected: 4 行（`8-16`・`8-17`・`11-7`・`11-8`）。`git diff docs/03-testing/test-matrix.md` で、変わったのが 8 と 11 の表の中だけであることを確かめる（11 の表は備考の列が広がり、prettier の桁揃えでその表の他の行の空白が変わるのはよい）。

- [ ] **Step 2: `initialData.ts` に 2 項目を足す**

`src/features/test-matrix/initialData.ts`

次の部分を

```text
        id: "8-16",
        label: "0 時をまたいだ後の「今日の支出」「1日あたり使える金額」",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "8-16",
        label: "0 時をまたいだ後の「今日の支出」「1日あたり使える金額」",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "8-17",
        label: "0 時をまたいだ後の支出フォームの 0 円の通知",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次の部分を

```text
        id: "11-7",
        label: "最高/最低達成日の表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "11-7",
        label: "最高/最低達成日の表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "11-8",
        label: "0 時（月曜）をまたいだ後の週間目標の連続週",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

- [ ] **Step 3: 家計簿の詳細の確認手順 8-17 を足す（L-368）**

追加フォームと編集フォームを別のケースにし、両方に同じ準備（カテゴリを 1 つ以上作る）を書く。またいだ後の操作は「カテゴリを選び直す」（フォーム自身の props が変わる操作）にし、直す前でも判定し直される操作（金額・日付の変更）と、直した後でもフォームが描き直されない操作（フォームの外の操作）を使わない理由を書く（設計書「ドキュメント・確認表」・「既知の制約と懸念」3）。

`src/features/test-matrix/detailed-test-cases/group-05-09.ts`

次の部分を

```text
  ],
  "9-1": [
```

次にする

```text
  ],
  "8-17": [
    {
      id: "8-17-1",
      scenario:
        "支出の追加フォーム。端末のタイムゾーンが日本（JST）であることを確かめ、月末・年末をまたがない日（今月の1日〜末日の前日）に行う。準備として、家計簿のトップの「🏷️ カテゴリ管理」で、カテゴリを1つ以上作っておく（カテゴリが無いと「カテゴリ（任意）」の選択欄が「選択しない」だけになり、下の操作ができない）。端末の日時を23:55頃にして（通知が出ていることを確かめるまでに0時を過ぎないよう、余裕を持って始める）家計簿のトップを開き（今月を表示）、「➕」を押して「支出を記録」のフォームを開く。「日付」の下に並ぶ 2 つの選択欄のうち、右側の「N日」の選択欄が今日の日になっていることを確かめ、金額に 0 を入れる。金額欄の下に「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」が出ていることを確かめる。フォームを開いたまま0時をまたぐ（ページの再読み込みはしない。端末の日時設定で翌日の0:00過ぎに進めてもよい）。またいだ後に、金額と日付は変えずに、「カテゴリ（任意）」の選択欄で今と違う項目を選ぶ（「選択しない」ならカテゴリを、カテゴリなら「選択しない」を選ぶ）。金額・日付を変えると直す前でも判定し直されるので変えない。フォームの外の操作（「← 前月」「今月に戻る」など）は、フォームが描き直されず、直した後でも通知が残ることがあるので使わない",
      expected:
        "カテゴリを選び直したあと、「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」が消える（日付欄の表示は変わらないが、またいだ後はその日付が昨日にあたり、0 円を記録できるため）。続けて「追加」を押すと、フォームが閉じ、またぐ前の日付の 0 円の支出が「📋 支出一覧」に出る。またいだ直後で何も操作していないうちは、通知が出たままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "8-17-2",
      scenario:
        "支出の編集フォーム。端末のタイムゾーンが日本（JST）であることを確かめ、月末・年末をまたがない日（今月の1日〜末日の前日）に行う。準備として、家計簿のトップの「🏷️ カテゴリ管理」で、カテゴリを1つ以上作っておく（カテゴリが無いと「カテゴリ（任意）」の選択欄が「選択しない」だけになり、下の操作ができない）。端末の日時を23:55頃にして（通知が出ていることを確かめるまでに0時を過ぎないよう、余裕を持って始める）家計簿のトップを開き（今月を表示）、「➕」から今日の日付で金額 100 の支出を追加する。「📋 支出一覧」のその支出の行の「✏️」を押して編集フォームを開き、金額を 0 にする。金額欄の下に「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」が出ていることを確かめる。編集フォームを開いたまま0時をまたぐ（ページの再読み込みはしない。端末の日時設定で翌日の0:00過ぎに進めてもよい）。またいだ後に、金額と日付は変えずに、金額欄の下にある選択欄（「選択しない」を含むもの。月・日の選択欄ではない）で今と違う項目を選ぶ（「選択しない」ならカテゴリを、カテゴリなら「選択しない」を選ぶ）。金額・日付を変えると直す前でも判定し直されるので変えない。フォームの外の操作は、フォームが描き直されず、直した後でも通知が残ることがあるので使わない",
      expected:
        "カテゴリを選び直したあと、「0 円は、今日より前の日付だけ記録できます。日付を変えるか、金額を入力してください。」が消える（支出の日付の表示は変わらないが、またいだ後はその日付が昨日にあたり、0 円を記録できるため）。続けて「保存」を押すと、編集フォームが閉じ、その支出の金額が 0 円になる。またいだ直後で何も操作していないうちは、通知が出たままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "9-1": [
```

- [ ] **Step 4: 統計の詳細の確認手順 11-8 を足す（L-368）**

準備は設計書のとおり（週間目標は、またぐ日曜を含む週の前の週のうちか、それより前に設定し、回数は変えない。日曜を含む週の未達は完了の回数で作る。設定の時期は「設計書との差異」7 のとおり週単位で書く）。ホームで完了にできるのはその日の分だけ（`saveDailyProgress` は当日の履歴にだけ書く: `src/features/routine/storage.ts:66-69`）なので、準備はまたぐ日の前の週のうちに実際に行うか、端末の日付を前の週の日に変えて行う手順にする。またいだ後は選択日を変えない操作（「📆 月次」→「📅 週次」）にし、選択日を変える「今週」などを使わない理由を書く。例の日付は祝日でない 2026-11-15（日）→ 16（月）（「設計書との差異」4）。

`src/features/test-matrix/detailed-test-cases/group-10-13.ts`

次の部分を

```text
  ],
  "12-1": [
```

次にする

```text
  ],
  "11-8": [
    {
      id: "11-8-1",
      scenario:
        "端末のタイムゾーンが日本（JST）であることを確かめる。日曜の夜から月曜（0時）へまたぐ。準備: (a) ホームでルーティンの編集フォーム（新規なら追加フォーム）を開き、「週間目標」欄に回数（例: 1）を入れて、「更新」（新規なら「追加」）を押す。週間目標は、またぐ日曜を含む週の前の週（例: 2026年11月15日（日）→16日（月）でまたぐなら、11月2日〜8日の週）のうちか、それより前に設定しておく（設定した週より前の週は連続の数に入らない）。(b) の前の週の完了は、またぐ日曜を含む週の前の週のうちに実際に行う（(a) の設定も、それより前でなければ同じ週に行う。ホームで完了にできるのはその日の分だけ）。急ぐ場合は、端末の日付を前の週の日に変えて週間目標の設定と完了を行い、日付を戻す（完了に使うルーティンは、変えた日にホームへ出るものにする。全曜日を選んだものが確実。祝日に当たる日は避ける）。設定した後は「週間目標」の回数を変えない（回数を変えると、連続の数え始めが変えた時点からやり直しになる）。(b) またぐ日曜を含む週の前の週は、そのルーティンを目標回数以上完了しておき（例: 11月2日〜8日の週に1回）、日曜を含む週（例: 11月9日〜15日）は目標回数未満にしておく（完了の回数で作る。目標回数は変えない）。日曜の23:55頃に統計画面を開き（「現在 N週」と「最長 M週」を確かめるまでに0時を過ぎないよう、余裕を持って始める）、「📅 週次」で、「週間目標」のそのルーティンが「現在 N週」（N は1以上）になっていることを確かめる（0 なら準備をやり直す）。日曜に開くと、期間の表示（ラベル・グラフ）が翌週の月曜〜日曜になるのは現状の挙動で、この確認の対象外（「週間目標」は日曜を含む週を基準にする）。「最長 M週」の値も控える。統計画面を開いたまま月曜の0時をまたぐ（ページの再読み込みはしない。端末の日時設定で月曜の0:00過ぎに進めてもよい）。またいだ後に、「📆 月次」を押し、続けて「📅 週次」を押す。「今週」・「前の期間へ」・「次の期間へ」は押さない（選ぶ日が変わり、直す前でも計算し直されるため、確かめにならない）",
      expected:
        "「📅 週次」に戻したあと、「週間目標」のそのルーティンが「現在 0週」になる（またいだ後は、日曜を含む週が終わった週として扱われ、目標に届かなかったため）。「最長 M週」は控えた値のまま変わらない。またいだ直後で何も操作していないうちは、「現在 N週」のままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "12-1": [
```

（この期待は `calculateWeeklyGoalProgress` の実装で確かめた: またぐ前は表示する週＝今週なので `calculateStreaks` が今週の未達を除いて数え（前の週の達成で N ≥ 1）、またいだ後は表示する週が過去の週になり、最後の週の未達で連続が 0 になる。過去の週の目標の一覧は、今のルーティンと履歴のスナップショットを合わせたものなので、そのルーティンは一覧に残る。）

- [ ] **Step 5: 確認表のテストと整形を確かめる**

Run: `cd .worktrees/issue-211-today-forms && npx prettier --write docs/03-testing/test-matrix.md src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-05-09.ts src/features/test-matrix/detailed-test-cases/group-10-13.ts && NODE_ENV=test npx jest src/features/test-matrix --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:|Test Suites:"`

Expected: `Test Suites: 33 passed, 33 total`・`Tests: 316 passed, 316 total`（作業前は 314 件。`detailedTestCases.test.ts` の「ID は項目 ID を接頭辞に持ち、項目の中で重複しない」が `8-17`・`11-8` でも通る）。

- [ ] **Step 6: 使われていない export が残っていないことを確かめる（L-311）**

Run: `cd .worktrees/issue-211-today-forms && node <dev-flow-kit>/scripts/node/find-unused-exports.mjs --base origin/main`

Expected: 何も出ない（変更した本番のファイルの export `BudgetExpenseForm`・`BudgetExpenseEditForm`・`useWeeklyGoalProgress`・`buildInitialData`・`DETAILED_TEST_CASES_GROUP_05_09`・`DETAILED_TEST_CASES_GROUP_10_13` は、どれも本番のコードから使われている）。出た場合は報告に書く。

- [ ] **Step 7: 全体の検証**

Run（1 つずつ。各コマンドの結果を報告に書く）:

```bash
cd .worktrees/issue-211-today-forms && NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/' 2>&1 | grep -E "^FAIL|Tests:|Test Suites:|SIGSEGV|not wrapped in act" | sort -u
```

Expected: `FAIL` が無い、`Test Suites: 1344 passed, 1344 total`・`Tests: 7042 passed, 7042 total`（作業前 1341 本・7012 件。新規 3 本・30 件増）。`not wrapped in act` は作業前から出ている `An update to StorageWriteFailureNotifier inside a test was not wrapped in act(...)` の 1 種類だけ（範囲外）。SIGSEGV のスイートがあれば単独で実行して通ることを確かめる（件数はその分減る）。

```bash
cd .worktrees/issue-211-today-forms && npm run typecheck && npm run typecheck:functions && npm run lint && npm run tailwind:scan
```

Expected: すべて exit 0。`tailwind:scan` は `No Tailwind shorthand issues found.`

```bash
cd .worktrees/issue-211-today-forms && npm run build
```

Expected: exit 0（`next build --webpack`。React Compiler を通した本番のビルド）。

```bash
cd .worktrees/issue-211-today-forms && git status --short && npx prettier --check $(git diff --name-only) $(git ls-files --others --exclude-standard)
```

Expected: `git status --short` に出るのは、このプランの「ファイルの構成」の表のファイル（新規の `*.useToday.test.tsx` 3 本は `??`）と、元から未追跡の `docs/superpowers/specs/2026-11-07-today-forms-weekly-goal-design.md`・このプラン `docs/superpowers/plans/2026-11-07-today-forms-weekly-goal.md` だけ。`docs/02-development/coding-standards.md`・`src/hooks/useToday.ts`・`src/features/budget/budgetMutationActions.ts` が出ないこと。prettier は `All matched files use Prettier code style!`

（コミットしない）

---

## セルフレビュー

### 設計書の要件 → タスク

| 設計書の要件                                                                                                                                                                     | タスク                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 決めたこと 1: 2 か所とも共通フックから今日を取り、描画のたびに新しい今日で判定する（0 時の自動再描画は作らない）                                                                 | Task 1 Step 4、Task 2 Step 5、Global Constraints「変えないもの」                                                                                                |
| 家計簿のフォーム: `const todayKey = useLocalTodayKey();`、第 3 引数に ``new Date(`${todayKey}T00:00:00`)``（`todayKey` を計算の中で実際に使う）                                  | Task 2 Step 5(a)(b)                                                                                                                                             |
| 家計簿のフォーム: 保存の検証（`buildExpensePayload` の `now`、`isExpenseAmountAllowedOnDate`）は保存の瞬間の今日のまま                                                           | Task 2 Step 3(c)・Step 6(b)(c)、「設計書との差異」1                                                                                                             |
| 週目標: `const todayKey = useJstTodayKey();`、`options.now` が無いときの `today` を ``new Date(`${todayKey}T00:00:00+09:00`)``、依存 `[selectedDate, now, todayKey]`             | Task 1 Step 4                                                                                                                                                   |
| 週目標: `options.now` があるときは今まで通り `now()`                                                                                                                             | Task 1 Step 1（既存の 1 件）・Step 2（配線テストの 3 件目）                                                                                                     |
| 週目標: `getRoutines()`・`getMonthlyHistory()` は `useMemo` の中のまま                                                                                                           | Task 1 Step 4                                                                                                                                                   |
| 契約テスト: `TODAY_TARGETS` に 3 ファイル（`hookCall`・`dependencies: ["todayKey"]`）                                                                                            | Task 3 Step 1〜2                                                                                                                                                |
| 契約テスト: 空振り防止（`_c(` がある）                                                                                                                                           | Task 3 Step 3                                                                                                                                                   |
| 変異: 共通フックを `new Date()` に戻す → `todayKey` の依存と `hookCall` が落ちる                                                                                                 | Task 3 Step 4 (1)(2)(3)                                                                                                                                         |
| 変異: `useWeeklyGoalProgress` の依存から `todayKey` を外す → `_c(` と `todayKey` の依存の 2 つが落ち、sentinel と `hookCall` は通る                                              | Task 3 Step 4 (4)                                                                                                                                               |
| 変異の結果を記録する                                                                                                                                                             | Task 1 Step 3・Task 2 Step 4・6・Task 3 Step 3・4（`.superpowers/sdd/2026-11-07-today-forms-weekly-goal/`）                                                     |
| `docs/02-development/coding-standards.md` は変更しない                                                                                                                           | Global Constraints「運用」、Task 4 Step 7 の `git status`                                                                                                       |
| 確認表 `8-17`（`8-17-1` 追加・`8-17-2` 編集。カテゴリを 1 つ以上作る準備・カテゴリを選び直す操作・親だけの再描画を使わない・月末・年末をまたがない）                             | Task 4 Step 1〜3                                                                                                                                                |
| 確認表 `11-8`（週間目標の設定時期・回数を変えない・完了の回数で未達・「現在 N週」N ≥ 1 の確認・「📆 月次」→「📅 週次」・「今週」を使わない・「現在 0週」・「最長」は変わらない） | Task 4 Step 1・2・4                                                                                                                                             |
| 確認表の 3 か所（md・`initialData.ts`・詳細）、既存の ID を変えない                                                                                                              | Task 4 Step 1〜5                                                                                                                                                |
| テスト: 家計簿のフォームの日またぎの再描画（追加・編集。直す前でも通る旨をコメントに）                                                                                           | Task 2 Step 3(a)(b)                                                                                                                                             |
| テスト: 家計簿の配線テスト（`useLocalTodayKey` をモック）                                                                                                                        | Task 2 Step 1・2                                                                                                                                                |
| テスト: 再描画のないまま日をまたいだ場合の保存の検証（既存のテストを保つ）                                                                                                       | 既存のテストは変えない（「設計書との差異」1）、Task 2 Step 3(c) で追加                                                                                          |
| テスト: 週目標のフェイクタイマーで JST の月曜 0 時をまたぎ、同じ `selectedDate` のインスタンスで `rerender`（本物の赤）                                                          | Task 1 Step 1・3                                                                                                                                                |
| テスト: 週目標の配線テスト（`useJstTodayKey` をモック）                                                                                                                          | Task 1 Step 2                                                                                                                                                   |
| 既存テストの書き換えの全列挙と `act()` の洗い出し                                                                                                                                | 書き換えは `useWeeklyGoalProgress.test.tsx` の `beforeEach` の追加だけ（ファイルの構成の下の段落、「設計書との差異」3）。`act()` は Global Constraints の L-686 |
| 全体: `npm test`（除外の上書き）・`typecheck`・`typecheck:functions`・`lint`・`tailwind:scan`・`build`                                                                           | Task 4 Step 7                                                                                                                                                   |
| 範囲外（0 時の自動再描画・`getRoutines()` 等の読み直し・保存時の検証・`selectedDate` の初期値）                                                                                  | どのタスクでも触らない（Global Constraints「変えないもの」）                                                                                                    |

### 型・関数名の整合

- `useLocalTodayKey(): string`・`useJstTodayKey(): string` — `src/hooks/useToday.ts` の既存の名前。Task 1・2 の実装、配線テストの `jest.mock("@/hooks/useToday", () => ({ useLocalTodayKey: jest.fn() }))`／`({ useJstTodayKey: jest.fn() })`、Task 3 の `hookCall: "useLocalTodayKey("`・`"useJstTodayKey("` が一致する。
- 変数名 `todayKey` — Task 1・2 の実装、Task 3 の `dependencies: ["todayKey"]`、Task 3 Step 4 の変異 (4) の置換文字列 `    [selectedDate, now, todayKey],\n`（Task 1 Step 4 のコードと一字一句同じ。試作で置換が 1 回だけ当たることを確認済み）が一致する。
- `isZeroAmountOnUnavailableDate(amountText, date, now)` の引数の順と、フォームの props 名 `expenseAmount`・`expenseDate`・`editingExpenseAmount`・`editingExpenseDate` は既存のまま。テストの `renderFormWithRerender`・`renderForm`・`categories`（`BudgetExpenseEditForm.test.tsx`）・`mockAddExpense`・`mockUpdateExpense`・`mockNavigate`（`useBudgetPageState.test.tsx`）は既存の名前。
- `calculateWeeklyGoalProgress` の引数のキー `selectedDate`・`today`・`routines`・`history` — Task 1 の実装とテストの `expect.objectContaining` で一致する。
- 変異 (L-538) の置換文字列 `  return () => {\n    addExpenseFromInput({`・`  return () => {\n    if (!editingExpenseId) {`・`      buildPayload: buildExpensePayload,\n`（2 回）は `src/features/budget/budgetMutationActions.ts` の今の形と一致する（試作で確認済み）。
- 確認表の ID `8-17`・`11-8` は md・`initialData.ts`・詳細のキー `"8-17"`・`"11-8"` とケース ID `8-17-1`・`8-17-2`・`11-8-1` で一致する。
- プレースホルダーの確認: 「未定」「後で」「適切に」の類は無い。すべてのコードの Step に実際のコードがある。
