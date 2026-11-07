# React Compiler の「今日固定」の修正 実装プラン（Issue #208）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-07-today-freeze-design.md`

**Goal:** React Compiler の自動メモ化で「今日」が最初の描画の値に固定される 5 か所（体重・食事・家計簿の指標・カレンダー・ホームの曜日）を、日をまたいだ後の次の描画で新しい今日になるように直し、体重・食事は保存を押した時点の今日で保存する。退行は React Compiler を通す契約テストで防ぐ。

**Architecture:**

- 新しい共通フック `src/hooks/useToday.ts`（`useJstTodayKey(): string`・`useJstDay(): number`・`useLocalTodayKey(): string`）が、本体の最初の文の `"use no memo"` で自動メモ化から外れ、描画のたびに今日を返す。各箇所はこのフックの戻り値を使い、呼ぶ側はコンパイルされたまま、戻り値が変わったときだけ下流を更新する。
- 体重・食事の保存は、`useCallback` の本体（保存を押した時点）で `getTodayDateKey()`・`getTodayDateString()` を呼んで日付を決める。描画時の `today` は表示にだけ使い、保存の経路（action の引数の束）からは外す。handler を作る関数（`createSaveWeightHandler`・`createMealAddHandler`）と純粋関数（`saveWeightAndReload`・`addMealAndReload`）は日付を引数で受けたまま変えない。
- 契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` が、対象ファイルを Next と同じオプションの `babel-plugin-react-compiler` でコンパイルし、(1) 共通フックの `"use no memo"`、(2) `_c(` があること、(3) 今日を求める式がメモ化のブロック（sentinel）に無いこと・今日の値がメモ化の依存の比較に入っていること・共通フックを呼んでいること、を文字列で確かめる。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効。`babel-plugin-react-compiler` 1.0.0）/ TypeScript 5.9.3 / Jest 30 + ts-jest + React Testing Library（jsdom）/ `@babel/core` 7.29.7（devDependencies に宣言を足す）

## 設計書との差異

コードを読んで確かめた結果、設計書と次の点を変える・確定する。

1. **契約テストの検証 3 を 5 か所で同じ判定にする（強める）。** 設計書は「体重・食事・カレンダー・ホーム: 今日を求める式がメモ化のブロックに無い＋共通フックを呼ぶ」「家計簿: 依存の比較に `todayKey` がある」と分けていた。試作で、カレンダーの共通フックの呼び出しを `getTodayString()` に戻した変異をコンパイルすると、`getTodayString()` は sentinel のブロックに入らず、代わりに `todayStr` がセルを組み立てるブロックの依存（`$[n] !== …`）から外れ、props が変わるまで古い今日のまま残ることが分かった（設計書の判定では見逃す）。そこで 5 か所すべてで「sentinel のブロックに今日を求める式が無い」「共通フックの戻り値の変数が依存の比較 `$[n] !== <変数>` にある」「ソースが共通フックを呼ぶ」の 3 つを確かめる（変数は体重・食事 `today`、カレンダー `todayStr`、ホーム `currentDayOfWeek`、家計簿 `todayKey`）。
2. **体重・食事の保存の日付の変更は最小にする。** 設計書の候補ファイルのうち、`weightMutationActions.ts`・`mealMutationActions.ts`・`pageStateActions.ts`（両方）・`weightPageStateActions.ts`・`mealPageStateActions.ts` は変えない。`useWeightTrackerMutationActions.ts`・`useMealAddAction.ts` の `useCallback` の本体で、`createSaveWeightHandler({ today: getTodayDateKey(), … })`・`createMealAddHandler({ today: getTodayDateString(), … })` とする。`today` の引数を、体重は `useWeightTrackerMutationActions`・`useWeightTrackerActions`・`createWeightPageActionBindings`（と `useWeightTrackerState` からの受け渡し）から、食事は `useMealAddAction`・`useMealPageMutationActions`・`useMealPageActions`・`createMealPageActionBindings`（と `useMealPageState` からの受け渡し）から外す。
3. **`today` の他の使い道の洗い出しの結果:** 体重は `WeightTrackerTodayCard` の見出しの日付（`formatWeightDate(today)`）と `WeightTrackerHistoryItem` の「今日」バッジ（`record.date === today`）、食事は `MealTodaySection` の見出しの日付（`formatMealDate(today)`）と `MealRecentSection` の「今日」バッジ（`meal.date === today`）だけで、すべて表示。描画時の値（共通フックの戻り値）のままにする。「今日の記録を編集中か」のような判定は無い。
4. **`@babel/core`・`@types/babel__core` の宣言は `npm install` を使わず、node の 1 行で `package.json` と `package-lock.json` の `packages[""].devDependencies` に足す。** 試作（npm 11.12.1）で `npm install --save-dev --package-lock-only --ignore-scripts @babel/core@7.29.7 @types/babel__core@7.20.5` を実行すると、2 つの宣言のほかに `node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/*`（`inBundle` の 7 項目）が `package-lock.json` に増えた（npm の版の違いによる無関係な差分）。範囲指定（`@babel/core@^7.29.7`）では 7.29.13 に上がり、`@babel/*` の 10 項目の版が変わった。宣言は `"@babel/core": "^7.29.7"`・`"@types/babel__core": "^7.20.5"`（インストール済みの版。`npm ls` で `@babel/core@7.29.7 extraneous`・`@types/babel__core@7.20.5 extraneous` を確認）。
5. **場所の確定:** 契約テストは `src/__tests__/reactCompilerToday.contract.test.ts`（`src/__tests__/` は既存）。共通フックのテストは `src/hooks/__tests__/useToday.test.ts`（JSX を使わない hooks のテストは `.test.ts`。例 `useBodyScrollLock.test.ts`）。体重・食事のテストは `src/features/weight-tracker/__tests__/`・`src/features/meal/__tests__/`（`page/__tests__/` ではない）。
6. **単体テストの赤の確かめ方（カレンダー・ホーム・体重・食事の表示用の今日）:** Jest は React Compiler を通さないので、時計を進めて再描画するテストは、修正前のコードでも通る（家計簿の指標だけは、修正前の `useMemo` の依存に今日が無いので、同じ props で再描画すると修正前に落ちる）。そこで、共通フックを `jest.mock` で時計と違う値にし、その値が使われることを確かめる配線のテスト（L-060）を先に書いて落とす。時計で日をまたぐテストは、本物のフックを通す経路の固定として足す（修正前でも通る。その旨をテストの説明に書く必要は無いが、報告に書く）。
7. 設計書の行番号・関数名は、いずれもコードと一致した（`useWeightTrackerDataState.ts:8`、`useMealPageDataState.ts:8`、`useBudgetPageMetricsState.ts:16-19`、`metrics.ts:28`、`CalendarGrid.tsx:34-35,55`、`useHomeViewState.ts:10`）。

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**気をつける知見（`<dev-flow-kit>/lessons/review-lessons.md`）**

- L-538: 描画時に今日を求めない。ハンドラは描画時の今日を持たない（保存の日付はハンドラの本体で取る）。テストは「23:59 に描画し、再描画せずに時計を 0:01 へ進めて操作」し、描画時の値を使う形に一時的に戻すと、そのテストだけが落ちることを確かめる。React Compiler の固定は単体テストで検出できないので、コンパイル結果で確かめる（契約テスト）。
- L-368: 手動確認の手順は、確かめたい状態を実際に作れる順番・前提・押すものを具体的に書く（体重・食事は「23:59 にフォームを開いて入力を終え、何も触らずに 0 時を過ぎてから保存だけを押す」。家計簿は月を移動する操作を使わない）。期待結果の文字は画面に出る文字と同じにする。
- L-060: 配線を確かめる。共通フックの戻り値が実際に使われることを、フックをモックした配線のテストで確かめる。`today` を保存の経路から外したことを `not.toHaveProperty("today")` で固定する。
- L-686: 合成テストでハンドラを呼ぶときは `act()` で囲む（新しいテストは state の setter をモックしていても `act()` で囲む）。
- L-685: このプランはフォームの共有の state に書く入口を足さない（保存の日付はハンドラの中で求め、フォームの state は変えない）。
- L-309: 見た目の重複・大きさだけで分割・共通化しない。`useBudgetMissingExpenseDates`（#191）は共通フックへ置き換えない（設計書「範囲外」）。handler を作る関数・純粋関数は日付を引数で受けたまま変えない（変更理由が無い）。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（**コミットしない。** コミットは後の `commit-ja` が行う）。
- `git add`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない。
- `.claude/`・`.superpowers/` は触らない。ただし、変異の確認の結果は `.superpowers/sdd/2026-11-07-today-freeze/` の各タスクの報告（サブエージェント駆動開発の流れで書く報告）に書く（設計書「契約テスト › 変異の確認」）。
- 実装を一時的に壊す確認は、次の順で行う。
  1. バックアップ: `BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && mkdir -p "$BK" && cp <対象> "$BK/"`
  2. 一時的に書き換えてテストを実行し、落ちることを確かめる（各 Step の `python3` は、置換する文字列がちょうど 1 回あることを `assert` で確かめる）。
  3. 元に戻す: `BK="…（同じ）" && cp "$BK/<ファイル名>" <対象>`
  4. 一致を確かめる: `BK="…（同じ）" && cmp "$BK/<ファイル名>" <対象>`（出力なし・exit 0）
  - バックアップの置き場所はワークツリーの git の管理ディレクトリの中なので、作業ツリーにも `git status` にも出ない。Bash の呼び出しごとに変数は消えるので、毎回 `BK="…"` を付ける。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。
- `node_modules` は主チェックアウト（`node_modules`）へのシンボリックリンク。そのまま使う（`npm install` もしない）。
- `.env.local` や秘密の値を読む・書く・作らない。`npm --prefix firebase-functions run build` を実行しない。
- Bash では毎回 `cd .worktrees/issue-208-today-freeze &&` を付ける。Read・Edit・Write には絶対パスを使う。
- 既存ファイルの一部を書き換える Step のコード片（「次の部分を」「次にする」の組）は `text` のコードブロックで、字下げを含めてファイルのとおり。そのまま Edit の置換に使える。ファイル全体・新規ファイルは `ts`・`tsx` のコードブロック。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外され、`npm test` が 0 件になる。Jest は必ず次の形で実行する。
  - `NODE_ENV=test npx jest <テストのパス…> --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
  - テストのパスは除外オプションの**前**に置く（後ろに置くと、パスも除外パターンになって 0 件になる）。
  - `npm test` を使う場合は `NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'`。`npm test` は `cross-env TZ=Asia/Tokyo` 固定。`npx jest` で日付のテストを流すときは `TZ=Asia/Tokyo` も付ける（下の各 Step のコマンドは付けてある）。
  - 毎回、出力の `Tests:` の件数が 0 でないことを確かめる（`No tests found` は失敗として扱う）。
- ts-jest は型を検査しない。**各タスクの最後に** `npm run typecheck`・`npm run lint`・`npx prettier --check <そのタスクで変更したファイル>` を実行する。
- 日付のテストは `+09:00` 付きの固定時刻を `jest.useFakeTimers().setSystemTime(...)` で設定し、`afterEach` で `jest.useRealTimers()` に戻す。
- 作業前の基準（2026-11-07、origin/main 3a6281d のこのワークツリー）: 全体の `npm test`（上の除外の上書き付き）で `Test Suites: 1335` / `Tests: 6936`（1 回目は `BudgetPage.test.tsx` がワーカーの SIGSEGV で `Test suite failed to run` になり 6920 件。単独では 16 件通る）。
  - 作業後の判定: `FAIL` が無い・`failed` が無い、`Test Suites: 1341 passed`（新規 6 本）・`Tests: 6973 passed`（37 件増。このプランのとおりに作った複製で、`src/`・`tools/` の範囲が 1238→1244 本・5884→5921 件になることを確認済み）。
  - 全体実行で、無関係なスイートが `A jest worker process (pid=…) was terminated by another process: signal=SIGSEGV` で落ちることがある（`Tests:` に `failed` は出ず、そのスイートの件数だけ減る）。落ちたらそのファイルだけを単独で実行して通ることを確かめ、報告に書く。
- lint は `@typescript-eslint/consistent-type-imports`（型だけの import は `import type`）に従う。

**コードの規則（`docs/02-development/coding-standards.md`・`.github/copilot-instructions.md`）**

- コメント・JSDoc・テスト名は日本語。
- `src/hooks/` は `src/features/` を import しない（テストからは import してよい）。`@/lib/storage/core` は import してよい（既存の hooks も使っている）。
- タイムゾーンの基準は各箇所が今使っているものを保つ（体重・食事・カレンダー・ホームは JST、家計簿は端末ローカル）。
- 変えないもの: 保存の形式・同期・`useBudgetMissingExpenseDates`・家計簿のフォーム 2 つの 0 円警告・週目標の進捗・ホームの日付ラベルと祝日フラグ・0 時の自動再描画（作らない）。

---

## ファイルの構成

| ファイル                                                                                                                                                                                              | 種類 | 責務                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------- |
| `src/hooks/useToday.ts`                                                                                                                                                                               | 新規 | 描画のたびに今日を返す 3 つのフック（`"use no memo"`）                          |
| `src/hooks/__tests__/useToday.test.ts`                                                                                                                                                                | 新規 | 3 つのフックが既存の関数と同じ値を返し、日をまたいだ再描画で新しい値になる      |
| `src/features/weight-tracker/page/useWeightTrackerDataState.ts`                                                                                                                                       | 変更 | 表示用の `today` を `useJstTodayKey()` から取る                                 |
| `src/features/weight-tracker/page/useWeightTrackerMutationActions.ts`                                                                                                                                 | 変更 | 保存の日付を保存の時点で `getTodayDateKey()` から取る。`today` の引数を外す     |
| `src/features/weight-tracker/page/useWeightTrackerActions.ts`・`weightPageActionBindings.ts`・`useWeightTrackerState.ts`                                                                              | 変更 | `today` を保存の経路から外す                                                    |
| `src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx`                                                                                                             | 新規 | 23:59 に描画→再描画せず 0:01 で保存→新しい日付で保存                            |
| `src/features/weight-tracker/__tests__/`（`useWeightTrackerDataState`・`useWeightTrackerMutationActions`・`useWeightTrackerActions`・`useWeightTrackerState`・`weightPageActionBindings` の各テスト） | 変更 | 新しい契約に合わせる                                                            |
| `src/features/meal/useMealPageDataState.ts`                                                                                                                                                           | 変更 | 表示用の `today` を `useJstTodayKey()` から取る                                 |
| `src/features/meal/useMealAddAction.ts`                                                                                                                                                               | 変更 | 保存の日付を保存の時点で `getTodayDateString()` から取る。`today` の引数を外す  |
| `src/features/meal/useMealPageMutationActions.ts`・`useMealPageActions.ts`・`mealPageActionBindings.ts`・`useMealPageState.ts`                                                                        | 変更 | `today` を保存の経路から外す                                                    |
| `src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx`                                                                                                                                      | 新規 | 23:59 に描画→再描画せず 0:01 で保存→新しい日付で保存                            |
| `src/features/meal/__tests__/`（`useMealPageDataState`・`useMealAddAction`・`useMealPageMutationActions`・`useMealPageActions`・`useMealPageState`・`mealPageActionBindings` の各テスト）             | 変更 | 新しい契約に合わせる                                                            |
| `src/features/budget/useBudgetPageMetricsState.ts`                                                                                                                                                    | 変更 | `useLocalTodayKey()` の 0 時の Date を `calculateBudgetMetrics` の `now` に渡す |
| `src/features/calendar/components/CalendarGrid.tsx`                                                                                                                                                   | 変更 | `useJstTodayKey()` と文字列比較で今日・未来を判定する                           |
| `src/features/routine/hooks/useHomeViewState.ts`                                                                                                                                                      | 変更 | 曜日を `useJstDay()` から取る                                                   |
| `src/features/budget/__tests__/useBudgetPageMetricsState.test.tsx`・`src/features/calendar/__tests__/CalendarGrid.today.test.tsx`・`src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`   | 変更 | 日をまたいだ再描画のテストを足す                                                |
| `src/features/calendar/__tests__/CalendarGrid.useToday.test.tsx`・`src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx`                                                              | 新規 | 共通フックの値が使われる配線のテスト                                            |
| `src/__tests__/reactCompilerToday.contract.test.ts`                                                                                                                                                   | 新規 | React Compiler を通す契約テスト（対象の一覧 `TODAY_TARGETS` を置く）            |
| `package.json`・`package-lock.json`                                                                                                                                                                   | 変更 | `@babel/core`・`@types/babel__core` を devDependencies に宣言                   |
| `docs/02-development/coding-standards.md`                                                                                                                                                             | 変更 | 「React Compiler と今日・現在時刻」の節                                         |
| `docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts`・`group-05-09.ts`・`group-10-13.ts`                        | 変更 | 0 時をまたいだ後の手動確認（2-29・4-7・7-9・8-16・10-9）                        |

---

## Task 1: 共通フック `useToday`

**Files:**

- Create: `src/hooks/useToday.ts`
- Test: `src/hooks/__tests__/useToday.test.ts`（新規）

**Interfaces:**

- Consumes: `getTodayString(): string`・`toJstDay(date: Date): number`（`@/lib/storage/core`。中身は `src/lib/storage/core-modules/jstDateTime.ts`）。テストだけが `toDateKey(date: Date): string`（`@/features/budget/utils/date`）を使う。
- Produces（Task 2〜5 が使う）:
  - `useJstTodayKey(): string` — JST の今日 `YYYY-MM-DD`（`getTodayString()` と同じ値）
  - `useJstDay(): number` — JST の今日の曜日 0〜6（`toJstDay(new Date())` と同じ値）
  - `useLocalTodayKey(): string` — 端末ローカルの今日 `YYYY-MM-DD`（`toDateKey(new Date())` と同じ値）
  - いずれも `export const <名前> = (): <型> => { "use no memo"; … };` の形（契約テストがこの形を構文木で読む）

- [ ] **Step 1: 落ちるテストを書く**

`src/hooks/__tests__/useToday.test.ts` を新規作成する。

```ts
import { renderHook } from "@testing-library/react";
import { toDateKey } from "@/features/budget/utils/date";
import { getTodayString, toJstDay } from "@/lib/storage/core";
import { useJstDay, useJstTodayKey, useLocalTodayKey } from "../useToday";

describe("useToday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("useJstTodayKey は getTodayString() と同じ値を返し、日をまたいだ後の再描画で新しい日付になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useJstTodayKey());

    expect(result.current).toBe("2026-03-07");
    expect(result.current).toBe(getTodayString());

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe("2026-03-08");
    expect(result.current).toBe(getTodayString());
  });

  it("useJstDay は toJstDay(new Date()) と同じ値を返し、日をまたいだ後の再描画で新しい曜日になる", () => {
    // 2026-03-07 は土曜（6）、2026-03-08 は日曜（0）
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useJstDay());

    expect(result.current).toBe(6);
    expect(result.current).toBe(toJstDay(new Date()));

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe(0);
    expect(result.current).toBe(toJstDay(new Date()));
  });

  it("useLocalTodayKey は家計簿の toDateKey(new Date()) と同じ値を返し、日をまたいだ後の再描画で新しい日付になる", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result, rerender } = renderHook(() => useLocalTodayKey());

    expect(result.current).toBe("2026-03-07");
    expect(result.current).toBe(toDateKey(new Date()));

    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender();

    expect(result.current).toBe("2026-03-08");
    expect(result.current).toBe(toDateKey(new Date()));
  });

  it("useLocalTodayKey は 1 桁の月・日をゼロ埋めする", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-01-05T09:00:00+09:00"));
    const { result } = renderHook(() => useLocalTodayKey());

    expect(result.current).toBe("2026-01-05");
    expect(result.current).toBe(toDateKey(new Date()));
  });
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/hooks/__tests__/useToday.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL（`Cannot find module '../useToday'`。`Test suite failed to run`）

- [ ] **Step 3: 実装する**

`src/hooks/useToday.ts` を新規作成する。

```ts
import { getTodayString, toJstDay } from "@/lib/storage/core";

// React Compiler と「今日」:
// フックやコンポーネントの本体で今日を直接求めると、React Compiler の自動メモ化で
// 最初の描画の値に固定される（入力を持たない式とみなされる）。ここに集めたフックは
// 自動メモ化から外し（"use no memo"）、描画のたびに今日を取り直す。呼ぶ側は
// 戻り値（文字列・数値）を依存として扱うので、日をまたいだ後の再描画で新しい今日が届く。
// 対象の一覧と確認方法は src/__tests__/reactCompilerToday.contract.test.ts を参照。

/** JST の今日（YYYY-MM-DD）。体重・食事・カレンダーの基準 */
export const useJstTodayKey = (): string => {
  "use no memo";
  return getTodayString();
};

/** JST の今日の曜日（0 = 日曜）。ホームの曜日の並び順の基準 */
export const useJstDay = (): number => {
  "use no memo";
  return toJstDay(new Date());
};

/**
 * 端末ローカルの今日（YYYY-MM-DD）。家計簿の基準。
 * hooks は features を参照できないため、家計簿の toDateKey と同じ組み立てをここで行う。
 */
export const useLocalTodayKey = (): string => {
  "use no memo";
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド
Expected: PASS（`Tests: 4 passed, 4 total`）

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run lint && npx prettier --check src/hooks/useToday.ts src/hooks/__tests__/useToday.test.ts`
Expected: すべて exit 0（`All matched files use Prettier code style!`）。整形の差があれば、この 2 ファイルだけに `npx prettier --write` をかけて再確認する。

（コミットしない）

---

## Task 2: 体重（表示用の今日の取り直し＋保存日付をイベントの時点で決める）

**Files:**

- Modify: `src/features/weight-tracker/page/useWeightTrackerDataState.ts`（全体）
- Modify: `src/features/weight-tracker/page/useWeightTrackerMutationActions.ts`（全体）
- Modify: `src/features/weight-tracker/page/useWeightTrackerActions.ts:10,21,38`
- Modify: `src/features/weight-tracker/page/weightPageActionBindings.ts:7,18,28`
- Modify: `src/features/weight-tracker/page/useWeightTrackerState.ts:31`
- Create: `src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx`
- Modify（テスト）: `src/features/weight-tracker/__tests__/useWeightTrackerDataState.test.tsx`・`useWeightTrackerMutationActions.test.tsx`・`useWeightTrackerActions.test.tsx`・`useWeightTrackerState.test.tsx`・`weightPageActionBindings.test.ts`

**Interfaces:**

- Consumes: Task 1 の `useJstTodayKey(): string`（`@/hooks/useToday`）。既存の `getTodayDateKey(): string`（`./weightRecordQueries`）、`createSaveWeightHandler(args: { today: string; weightInput: string; notesInput: string; saveWeight: (date: string, weight: number, notes?: string) => void; … })`（`./weightPageStateActions`。変えない）。
- Produces:
  - `useWeightTrackerDataState()` の戻り値は従来どおり `{ initialTodayRecord, recentRecords, setRecentRecords, setTodayRecord, today, todayRecord }`（`today` は表示用）。
  - `useWeightTrackerMutationActions(params)`・`useWeightTrackerActions(params)`・`createWeightPageActionBindings(args)` の引数から `today: string` を外す（残りは `weightInput`・`notesInput`・`setTodayRecord`・`setWeightInput`・`setNotesInput`・`setShowForm`・`setRecentRecords`）。戻り値は変えない。
  - `useWeightTrackerState()` の戻り値は変えない（`today` を含む）。

- [ ] **Step 1: 保存の日付の落ちるテストを書く**

`src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx` を新規作成する。

```tsx
import { act, renderHook } from "@testing-library/react";

// 保存の handler まで本物を通し、保存の関数（storage）だけをモックする。
// useWeightTrackerMutationActions.test.tsx は handler を作る関数をモックしているため、
// 保存の関数に渡る日付まで届かない
jest.mock("../storage", () => ({
  deleteWeightRecord: jest.fn(),
  getTodayWeightRecord: jest.fn(() => null),
  getWeightHistory: jest.fn(() => ({})),
  saveWeightRecord: jest.fn(),
}));

import { saveWeightRecord } from "../storage";
import { useWeightTrackerMutationActions } from "../page/useWeightTrackerMutationActions";

const params = {
  weightInput: "65.5",
  notesInput: "",
  setTodayRecord: jest.fn(),
  setWeightInput: jest.fn(),
  setNotesInput: jest.fn(),
  setShowForm: jest.fn(),
  setRecentRecords: jest.fn(),
};

describe("useWeightTrackerMutationActions の保存する日付", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("23:59 に描画し、再描画せずに 0:01 で保存すると、保存を押した時点の新しい日付で保存する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result } = renderHook(() =>
      useWeightTrackerMutationActions(params),
    );

    // 再描画せずに時計だけを進める（フォームを開いたまま 0 時をまたいだ状態）
    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current.handleSaveWeight();
    });

    expect(saveWeightRecord).toHaveBeenCalledTimes(1);
    expect(saveWeightRecord).toHaveBeenCalledWith(
      "2026-03-08",
      65.5,
      undefined,
    );
  });
});
```

- [ ] **Step 2: 既存のテストを新しい契約に書き換える**

(a) `src/features/weight-tracker/__tests__/useWeightTrackerDataState.test.tsx`

次の部分を

```text
import { renderHook } from "@testing-library/react";
import type { WeightRecord } from "@/types/routine";

jest.mock("../storage", () => ({
```

次にする

```text
import { renderHook } from "@testing-library/react";
import type { WeightRecord } from "@/types/routine";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("../storage", () => ({
```

次の行を削除する（`weightRecordQueries` のモックの中）

```text
  getTodayDateKey: jest.fn(() => "2024-01-12"),
```

次の部分を

```text
import { getTodayWeightRecord, getWeightHistory } from "../storage";
```

次にする

```text
import { useJstTodayKey } from "@/hooks/useToday";
import { getTodayWeightRecord, getWeightHistory } from "../storage";
```

次の部分を

```text
  beforeEach(() => {
    jest.clearAllMocks();
    (getTodayWeightRecord as jest.Mock).mockReturnValue(todayRecord);
```

次にする

```text
  beforeEach(() => {
    jest.clearAllMocks();
    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-12");
    (getTodayWeightRecord as jest.Mock).mockReturnValue(todayRecord);
```

次の部分を（ファイルの末尾）

```text
    expect(result.current.recentRecords).toEqual([todayRecord, previousRecord]);
  });
});
```

次にする

```text
    expect(result.current.recentRecords).toEqual([todayRecord, previousRecord]);
  });

  it("日をまたいだ後の再描画で、表示用の today が共通フックの新しい日付になる", () => {
    const { result, rerender } = renderHook(() => useWeightTrackerDataState());
    expect(result.current.today).toBe("2024-01-12");

    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-13");
    rerender();

    expect(result.current.today).toBe("2024-01-13");
    // 今日の記録は、保存か再読み込みまで前日のまま（設計書「既知の制約と懸念」2）
    expect(result.current.todayRecord).toEqual(todayRecord);
  });
});
```

(b) `src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.test.tsx`（保存を押した時点の時計で `today` が決まる。時計は描画と同じ時刻なので、期待の `today: "2024-01-12"` はそのまま残る）

次の部分を

```text
    (createWeightTrackerMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });
```

次にする

```text
    (createWeightTrackerMutationActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
    jest.useFakeTimers().setSystemTime(new Date("2024-01-12T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
```

次の部分を

```text
    const params = {
      today: "2024-01-12",
      weightInput: "69.5",
```

次にする

```text
    const params = {
      weightInput: "69.5",
```

次の部分を

```text
    expect(createSaveWeightHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
```

次にする

```text
    // 保存する日付は、保存を押した時点の今日（2024-01-12 12:00 JST）
    expect(createSaveWeightHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
```

(c) `src/features/weight-tracker/__tests__/useWeightTrackerActions.test.tsx`

次の部分を

```text
    const params = {
      today: "2024-01-12",
      weightInput: "69.5",
```

次にする

```text
    const params = {
      weightInput: "69.5",
```

次の部分を

```text
    expect(useWeightTrackerMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        weightInput: "69.5",
        notesInput: "memo",
        setShowForm: params.setShowForm,
      }),
    );
```

次にする

```text
    expect(useWeightTrackerMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        weightInput: "69.5",
        notesInput: "memo",
        setShowForm: params.setShowForm,
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect(
      (useWeightTrackerMutationActions as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
```

(d) `src/features/weight-tracker/__tests__/weightPageActionBindings.test.ts`

次の部分を

```text
    const bindings = createWeightPageActionBindings({
      today: "2024-01-12",
      weightInput: "69.5",
```

次にする

```text
    const bindings = createWeightPageActionBindings({
      weightInput: "69.5",
```

次の部分を

```text
      expect.objectContaining({
        today: "2024-01-12",
        weightInput: "69.5",
        notesInput: "updated",
      }),
    );
```

次にする

```text
      expect.objectContaining({
        weightInput: "69.5",
        notesInput: "updated",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は束ねない
    expect(bindings).not.toHaveProperty("today");
```

(e) `src/features/weight-tracker/__tests__/useWeightTrackerState.test.tsx`（`createWeightTrackerStateResult` の期待の `today: "2024-01-12"` は表示用なので残す）

次の部分を

```text
    expect(createWeightPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        weightInput: "",
        notesInput: "",
      }),
    );
```

次にする

```text
    expect(createWeightPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        weightInput: "",
        notesInput: "",
      }),
    );
    // 描画時の today は表示（結果）にだけ渡し、保存の経路（action の束）には渡さない
    expect(
      (createWeightPageActionBindings as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
```

- [ ] **Step 3: 落ちることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerDataState.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerActions.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerState.test.tsx src/features/weight-tracker/__tests__/weightPageActionBindings.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。少なくとも次が落ちる:

- `useWeightTrackerSaveDate`: `saveWeightRecord` の第 1 引数が `"2026-03-08"` でない（`today` を渡していないので `undefined`）
- `useWeightTrackerDataState` の 2 件: `TypeError: (0 , weightRecordQueries_1.getTodayDateKey) is not a function`（まだ `getTodayDateKey` を呼んでいる）
- `useWeightTrackerActions`・`useWeightTrackerState`・`weightPageActionBindings`: `not.toHaveProperty("today")`（まだ `today` を渡している）

- [ ] **Step 4: 実装する**

(a) `src/features/weight-tracker/page/useWeightTrackerDataState.ts` を次の内容に置き換える。

```ts
import { useState } from "react";
import type { WeightRecord } from "@/types/routine";
import { useJstTodayKey } from "@/hooks/useToday";
import { getTodayWeightRecord, getWeightHistory } from "../storage";
import { createWeightPageData } from "./pageStateActions";

export const useWeightTrackerDataState = () => {
  const today = useJstTodayKey();
  const initialTodayRecord = getTodayWeightRecord();
  const initialPageData = createWeightPageData(
    initialTodayRecord,
    getWeightHistory(),
  );

  const [todayRecord, setTodayRecord] = useState<WeightRecord | null>(
    initialPageData.todayRecord,
  );
  const [recentRecords, setRecentRecords] = useState<WeightRecord[]>(
    initialPageData.recentRecords,
  );

  return {
    initialTodayRecord,
    recentRecords,
    setRecentRecords,
    setTodayRecord,
    today,
    todayRecord,
  };
};
```

(b) `src/features/weight-tracker/page/useWeightTrackerMutationActions.ts` を次の内容に置き換える。

```ts
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { WeightRecord } from "@/types/routine";
import { createWeightTrackerMutationActionsResult } from "./weightTrackerMutationActionsResult";
import {
  deleteWeightRecord,
  getTodayWeightRecord,
  getWeightHistory,
  saveWeightRecord,
} from "../storage";
import {
  createDeleteWeightHandler,
  createSaveWeightHandler,
} from "./weightPageStateActions";
import { getTodayDateKey } from "./weightRecordQueries";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type UseWeightTrackerMutationActionsParams = {
  weightInput: string;
  notesInput: string;
  setTodayRecord: SetValue<WeightRecord | null>;
  setWeightInput: SetValue<string>;
  setNotesInput: SetValue<string>;
  setShowForm: SetValue<boolean>;
  setRecentRecords: SetValue<WeightRecord[]>;
};

export const useWeightTrackerMutationActions = ({
  weightInput,
  notesInput,
  setTodayRecord,
  setWeightInput,
  setNotesInput,
  setShowForm,
  setRecentRecords,
}: UseWeightTrackerMutationActionsParams) => {
  const handleSaveWeight = useCallback(() => {
    createSaveWeightHandler({
      // 保存する日付は、保存を押した時点の今日で決める。描画時の今日をハンドラに持たせると、
      // フォームを開いたまま 0 時をまたいで再描画が無いまま保存したとき、前日で保存される
      today: getTodayDateKey(),
      weightInput,
      notesInput,
      saveWeight: saveWeightRecord,
      getTodayWeightRecord,
      getWeightHistory,
      setTodayRecord,
      setWeightInput,
      setNotesInput,
      setShowForm,
      setRecentRecords,
    })();
  }, [
    notesInput,
    setNotesInput,
    setRecentRecords,
    setShowForm,
    setTodayRecord,
    setWeightInput,
    weightInput,
  ]);

  const handleDeleteRecord = useCallback(
    (date: string) => {
      createDeleteWeightHandler({
        deleteWeight: deleteWeightRecord,
        getTodayWeightRecord,
        getWeightHistory,
        setTodayRecord,
        setWeightInput,
        setNotesInput,
        setRecentRecords,
      })(date);
    },
    [setNotesInput, setRecentRecords, setTodayRecord, setWeightInput],
  );

  return createWeightTrackerMutationActionsResult({
    handleDeleteRecord,
    handleSaveWeight,
  });
};
```

(c) `src/features/weight-tracker/page/useWeightTrackerActions.ts`

次の部分を

```text
type UseWeightTrackerActionsParams = {
  today: string;
  weightInput: string;
```

次にする

```text
type UseWeightTrackerActionsParams = {
  weightInput: string;
```

次の部分を

```text
export const useWeightTrackerActions = ({
  today,
  weightInput,
```

次にする

```text
export const useWeightTrackerActions = ({
  weightInput,
```

次の部分を

```text
    useWeightTrackerMutationActions({
      today,
      weightInput,
```

次にする

```text
    useWeightTrackerMutationActions({
      weightInput,
```

(d) `src/features/weight-tracker/page/weightPageActionBindings.ts`

次の部分を

```text
type WeightPageActionBindingsArgs = {
  today: string;
  weightInput: string;
```

次にする

```text
type WeightPageActionBindingsArgs = {
  weightInput: string;
```

次の部分を

```text
export const createWeightPageActionBindings = ({
  today,
  weightInput,
```

次にする

```text
export const createWeightPageActionBindings = ({
  weightInput,
```

次の部分を

```text
  return {
    today,
    weightInput,
```

次にする

```text
  return {
    weightInput,
```

(e) `src/features/weight-tracker/page/useWeightTrackerState.ts`（`createWeightTrackerStateResult` に渡す `today` は表示用なので残す）

次の部分を

```text
    createWeightPageActionBindings({
      today,
      weightInput,
```

次にする

```text
    createWeightPageActionBindings({
      weightInput,
```

- [ ] **Step 5: 通ることを確かめる**

Run: Step 3 と同じコマンド
Expected: PASS（`Test Suites: 6 passed, 6 total` / `Tests: 7 passed, 7 total`）

続けて体重の全テスト:
Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/weight-tracker --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`Test Suites: 35 passed, 35 total` / `Tests: 80 passed, 80 total`）。出力に `not wrapped in act(...)` の警告が無いこと（L-686）。

- [ ] **Step 6: 変異の確認（ハンドラが描画時の今日を持つ形に一時的に戻す）**

バックアップを取り、`useWeightTrackerMutationActions.ts` を「描画時に `getTodayDateKey()` を取り、ハンドラがその値を持つ」形に一時的に書き換える。

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && mkdir -p "$BK" && cp src/features/weight-tracker/page/useWeightTrackerMutationActions.ts "$BK/" && python3 - <<'EOF'
p = "src/features/weight-tracker/page/useWeightTrackerMutationActions.ts"
s = open(p).read()
pairs = [
    ("}: UseWeightTrackerMutationActionsParams) => {\n  const handleSaveWeight = useCallback(() => {\n",
     "}: UseWeightTrackerMutationActionsParams) => {\n  const renderToday = getTodayDateKey();\n  const handleSaveWeight = useCallback(() => {\n"),
    ("      today: getTodayDateKey(),\n", "      today: renderToday,\n"),
    ("    setWeightInput,\n    weightInput,\n  ]);", "    setWeightInput,\n    renderToday,\n    weightInput,\n  ]);"),
]
for old, new in pairs:
    assert s.count(old) == 1, old
    s = s.replace(old, new)
open(p, "w").write(s)
EOF
NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/weight-tracker --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "^FAIL|Tests:" | sort -u
```

Expected: `FAIL src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx` だけ、`Tests: 1 failed, 79 passed, 80 total`（試作で確認済み。既存の `useWeightTrackerMutationActions.test.tsx` は描画と保存が同じ時刻なので通る）。

元に戻して一致を確かめる:

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && cp "$BK/useWeightTrackerMutationActions.ts" src/features/weight-tracker/page/useWeightTrackerMutationActions.ts && cmp "$BK/useWeightTrackerMutationActions.ts" src/features/weight-tracker/page/useWeightTrackerMutationActions.ts && echo RESTORED
```

Expected: `RESTORED`。結果（落ちたテスト名と件数）を `.superpowers/sdd/2026-11-07-today-freeze/` の Task 2 の報告に書く。

- [ ] **Step 7: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run lint && npx prettier --check src/features/weight-tracker/page/useWeightTrackerDataState.ts src/features/weight-tracker/page/useWeightTrackerMutationActions.ts src/features/weight-tracker/page/useWeightTrackerActions.ts src/features/weight-tracker/page/weightPageActionBindings.ts src/features/weight-tracker/page/useWeightTrackerState.ts src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.saveDate.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerDataState.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerActions.test.tsx src/features/weight-tracker/__tests__/useWeightTrackerState.test.tsx src/features/weight-tracker/__tests__/weightPageActionBindings.test.ts`
Expected: すべて exit 0。整形の差があれば、そのファイルだけに `npx prettier --write` をかけて再確認する。

（コミットしない）

---

## Task 3: 食事（表示用の今日の取り直し＋保存日付をイベントの時点で決める）

**Files:**

- Modify: `src/features/meal/useMealPageDataState.ts:1-8`
- Modify: `src/features/meal/useMealAddAction.ts`（import・型・引数・`useCallback`）
- Modify: `src/features/meal/useMealPageMutationActions.ts:10,23,35`
- Modify: `src/features/meal/useMealPageActions.ts:10,23,39`
- Modify: `src/features/meal/mealPageActionBindings.ts:7,20,32`
- Modify: `src/features/meal/useMealPageState.ts:25`
- Create: `src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx`
- Modify（テスト）: `src/features/meal/__tests__/useMealPageDataState.test.tsx`・`useMealAddAction.test.tsx`・`useMealPageMutationActions.test.tsx`・`useMealPageActions.test.tsx`・`useMealPageState.test.tsx`・`mealPageActionBindings.test.ts`

**Interfaces:**

- Consumes: Task 1 の `useJstTodayKey(): string`。既存の `getTodayDateString(): string`（`./utils/mealFormat`）、`createMealAddHandler(args: { today: string; mealTypeInput: MealType; timeInput: string; descriptionInput: string; notesInput: string; addMeal: (date, mealType, time, description, options?) => void; … })`（`./mealPageStateActions`。変えない）。
- Produces:
  - `useMealPageDataState()` の戻り値は従来どおり `{ initialState, recentMeals, setRecentMeals, setTodayMeals, today, todayMeals }`（`today` は表示用）。
  - `useMealAddAction(params)`・`useMealPageMutationActions(params)`・`useMealPageActions(params)`・`createMealPageActionBindings(args)` の引数から `today: string` を外す（残りは `mealTypeInput`・`timeInput`・`descriptionInput`・`notesInput`・`setTodayMeals`・`setRecentMeals`・`setShowForm`・`setDescriptionInput`・`setNotesInput`）。戻り値は変えない。
  - `useMealPageState()` の戻り値は変えない（`today` を含む）。

- [ ] **Step 1: 保存の日付の落ちるテストを書く**

`src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx` を新規作成する。

```tsx
import { act, renderHook } from "@testing-library/react";

// 追加の handler まで本物を通し、保存の関数（storage）だけをモックする。
// useMealAddAction.test.tsx は handler を作る関数をモックしているため、
// 保存の関数に渡る日付まで届かない
jest.mock("../storage", () => ({
  addMealRecord: jest.fn(),
  getMealHistory: jest.fn(() => ({})),
  getTodayMealRecords: jest.fn(() => []),
}));

import { addMealRecord } from "../storage";
import { useMealAddAction } from "../useMealAddAction";

const params = {
  mealTypeInput: "dinner" as const,
  timeInput: "23:58",
  descriptionInput: "soba",
  notesInput: "",
  setTodayMeals: jest.fn(),
  setRecentMeals: jest.fn(),
  setShowForm: jest.fn(),
  setDescriptionInput: jest.fn(),
  setNotesInput: jest.fn(),
};

describe("useMealAddAction の保存する日付", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("23:59 に描画し、再描画せずに 0:01 で保存すると、保存を押した時点の新しい日付で保存する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const { result } = renderHook(() => useMealAddAction(params));

    // 再描画せずに時計だけを進める（フォームを開いたまま 0 時をまたいだ状態）
    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    act(() => {
      result.current();
    });

    expect(addMealRecord).toHaveBeenCalledTimes(1);
    expect(addMealRecord).toHaveBeenCalledWith(
      "2026-03-08",
      "dinner",
      "23:58",
      "soba",
      { notes: undefined },
    );
  });
});
```

- [ ] **Step 2: 既存のテストを新しい契約に書き換える**

(a) `src/features/meal/__tests__/useMealPageDataState.test.tsx`

次の部分を

```text
import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
```

次にする

```text
import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("../storage", () => ({
```

次の行を削除する（`../utils/mealFormat` のモックの中）

```text
  getTodayDateString: jest.fn(() => "2024-01-12"),
```

次の部分を

```text
import { getMealHistory, getTodayMealRecords } from "../storage";
```

次にする

```text
import { useJstTodayKey } from "@/hooks/useToday";
import { getMealHistory, getTodayMealRecords } from "../storage";
```

次の部分を

```text
  beforeEach(() => {
    jest.clearAllMocks();
    (getMealHistory as jest.Mock).mockReturnValue({});
```

次にする

```text
  beforeEach(() => {
    jest.clearAllMocks();
    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-12");
    (getMealHistory as jest.Mock).mockReturnValue({});
```

次の部分を（ファイルの末尾）

```text
    expect(result.current.initialState.timeInput).toBe("08:30");
  });
});
```

次にする

```text
    expect(result.current.initialState.timeInput).toBe("08:30");
  });

  it("日をまたいだ後の再描画で、表示用の today が共通フックの新しい日付になる", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-12",
      mealType: "dinner" as const,
      time: "23:30",
      description: "soba",
      createdAt: "2024-01-12T14:30:00.000Z",
      updatedAt: "2024-01-12T14:30:00.000Z",
    };
    (getTodayMealRecords as jest.Mock).mockReturnValue([meal]);

    const { result, rerender } = renderHook(() => useMealPageDataState());
    expect(result.current.today).toBe("2024-01-12");

    (useJstTodayKey as jest.Mock).mockReturnValue("2024-01-13");
    rerender();

    expect(result.current.today).toBe("2024-01-13");
    // 今日の食事は、保存か再読み込みまで前日のまま（設計書「既知の制約と懸念」2）
    expect(result.current.todayMeals).toEqual([meal]);
  });
});
```

(b) `src/features/meal/__tests__/useMealAddAction.test.tsx`（保存を押した時点の時計で `today` が決まる。期待の `today: "2024-01-12"` は残す）

次の部分を

```text
  beforeEach(() => {
    jest.clearAllMocks();
  });
```

次にする

```text
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2024-01-12T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });
```

次の部分を

```text
    expect(createMealAddHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
```

次にする

```text
    // 保存する日付は、保存を押した時点の今日（2024-01-12 12:00 JST）
    expect(createMealAddHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
```

次の部分を

```text
const createParams = () => ({
  today: "2024-01-12",
  mealTypeInput: "lunch" as const,
```

次にする

```text
const createParams = () => ({
  mealTypeInput: "lunch" as const,
```

(c) `src/features/meal/__tests__/useMealPageMutationActions.test.tsx`

次の部分を

```text
    const params = {
      today: "2024-01-12",
      mealTypeInput: "lunch" as const,
```

次にする

```text
    const params = {
      mealTypeInput: "lunch" as const,
```

次の部分を

```text
    expect(useMealAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
```

次にする

```text
    expect(useMealAddAction).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect((useMealAddAction as jest.Mock).mock.calls[0][0]).not.toHaveProperty(
      "today",
    );
```

(d) `src/features/meal/__tests__/useMealPageActions.test.tsx`

次の部分を

```text
    const params = {
      today: "2024-01-12",
      mealTypeInput: "lunch" as const,
```

次にする

```text
    const params = {
      mealTypeInput: "lunch" as const,
```

次の部分を

```text
    expect(useMealPageMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
```

次にする

```text
    expect(useMealPageMutationActions).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は渡さない
    expect(
      (useMealPageMutationActions as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
```

(e) `src/features/meal/__tests__/mealPageActionBindings.test.ts`

次の部分を

```text
    const bindings = createMealPageActionBindings({
      today: "2024-01-12",
      mealTypeInput: "lunch",
```

次にする

```text
    const bindings = createMealPageActionBindings({
      mealTypeInput: "lunch",
```

次の部分を

```text
      expect.objectContaining({
        today: "2024-01-12",
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
```

次にする

```text
      expect.objectContaining({
        mealTypeInput: "lunch",
        timeInput: "12:00",
        descriptionInput: "ramen",
        notesInput: "spicy",
      }),
    );
    // 保存する日付は保存の時点で決めるので、描画時の today は束ねない
    expect(bindings).not.toHaveProperty("today");
```

(f) `src/features/meal/__tests__/useMealPageState.test.tsx`（`createMealPageStateResult` の期待の `today: "2024-01-12"` は表示用なので残す）

次の部分を

```text
    expect(createMealPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        today: "2024-01-12",
        mealTypeInput: "breakfast",
        timeInput: "08:30",
      }),
    );
```

次にする

```text
    expect(createMealPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        mealTypeInput: "breakfast",
        timeInput: "08:30",
      }),
    );
    // 描画時の today は表示（結果）にだけ渡し、保存の経路（action の束）には渡さない
    expect(
      (createMealPageActionBindings as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty("today");
```

- [ ] **Step 3: 落ちることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx src/features/meal/__tests__/useMealPageDataState.test.tsx src/features/meal/__tests__/useMealAddAction.test.tsx src/features/meal/__tests__/useMealPageMutationActions.test.tsx src/features/meal/__tests__/useMealPageActions.test.tsx src/features/meal/__tests__/useMealPageState.test.tsx src/features/meal/__tests__/mealPageActionBindings.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。少なくとも次が落ちる:

- `useMealAddActionSaveDate`: `addMealRecord` の第 1 引数が `"2026-03-08"` でない（`undefined`）
- `useMealPageDataState` の 2 件: `TypeError: (0 , mealFormat_1.getTodayDateString) is not a function`
- `useMealAddAction`: `today: "2024-01-12"` が無い（`today` を渡していない）
- `useMealPageMutationActions`・`useMealPageActions`・`useMealPageState`・`mealPageActionBindings`: `not.toHaveProperty("today")`

- [ ] **Step 4: 実装する**

(a) `src/features/meal/useMealPageDataState.ts`

次の部分を

```text
import { useState } from "react";
import type { MealRecord } from "@/types/routine";
import { getMealHistory, getTodayMealRecords } from "./storage";
import { getCurrentTimeString, getTodayDateString } from "./utils/mealFormat";
import { createInitialMealViewState } from "./mealViewStateActions";

export const useMealPageDataState = () => {
  const today = getTodayDateString();
```

次にする

```text
import { useState } from "react";
import { useJstTodayKey } from "@/hooks/useToday";
import type { MealRecord } from "@/types/routine";
import { getMealHistory, getTodayMealRecords } from "./storage";
import { getCurrentTimeString } from "./utils/mealFormat";
import { createInitialMealViewState } from "./mealViewStateActions";

export const useMealPageDataState = () => {
  const today = useJstTodayKey();
```

(b) `src/features/meal/useMealAddAction.ts`

次の部分を

```text
import { createMealAddHandler } from "./mealPageStateActions";
```

次にする

```text
import { createMealAddHandler } from "./mealPageStateActions";
import { getTodayDateString } from "./utils/mealFormat";
```

次の部分を

```text
type UseMealAddActionParams = {
  today: string;
  mealTypeInput: MealType;
```

次にする

```text
type UseMealAddActionParams = {
  mealTypeInput: MealType;
```

次の部分を

```text
export const useMealAddAction = ({
  today,
  mealTypeInput,
```

次にする

```text
export const useMealAddAction = ({
  mealTypeInput,
```

次の部分を

```text
    createMealAddHandler({
      today,
      mealTypeInput,
```

次にする

```text
    createMealAddHandler({
      // 保存する日付は、保存を押した時点の今日で決める。描画時の今日をハンドラに持たせると、
      // フォームを開いたまま 0 時をまたいで再描画が無いまま保存したとき、前日で保存される
      today: getTodayDateString(),
      mealTypeInput,
```

次の部分を

```text
    timeInput,
    today,
  ]);
```

次にする

```text
    timeInput,
  ]);
```

(c) `src/features/meal/useMealPageMutationActions.ts`

次の部分を

```text
type UseMealPageMutationActionsParams = {
  today: string;
  mealTypeInput: MealType;
```

次にする

```text
type UseMealPageMutationActionsParams = {
  mealTypeInput: MealType;
```

次の部分を

```text
export const useMealPageMutationActions = ({
  today,
  mealTypeInput,
```

次にする

```text
export const useMealPageMutationActions = ({
  mealTypeInput,
```

次の部分を

```text
  const handleAddMeal = useMealAddAction({
    today,
    mealTypeInput,
```

次にする

```text
  const handleAddMeal = useMealAddAction({
    mealTypeInput,
```

(d) `src/features/meal/useMealPageActions.ts`

次の部分を

```text
type UseMealPageActionsParams = {
  today: string;
  mealTypeInput: MealType;
```

次にする

```text
type UseMealPageActionsParams = {
  mealTypeInput: MealType;
```

次の部分を

```text
export const useMealPageActions = ({
  today,
  mealTypeInput,
```

次にする

```text
export const useMealPageActions = ({
  mealTypeInput,
```

次の部分を

```text
  const { handleAddMeal, handleDeleteMeal } = useMealPageMutationActions({
    today,
    mealTypeInput,
```

次にする

```text
  const { handleAddMeal, handleDeleteMeal } = useMealPageMutationActions({
    mealTypeInput,
```

(e) `src/features/meal/mealPageActionBindings.ts`

次の部分を

```text
type MealPageActionBindingsArgs = {
  today: string;
  mealTypeInput: MealType;
```

次にする

```text
type MealPageActionBindingsArgs = {
  mealTypeInput: MealType;
```

次の部分を

```text
export const createMealPageActionBindings = ({
  today,
  mealTypeInput,
```

次にする

```text
export const createMealPageActionBindings = ({
  mealTypeInput,
```

次の部分を

```text
  return {
    today,
    mealTypeInput,
```

次にする

```text
  return {
    mealTypeInput,
```

(f) `src/features/meal/useMealPageState.ts`（`createMealPageStateResult` に渡す `today: mealData.today` は表示用なので残す）

次の部分を

```text
    createMealPageActionBindings({
      today: mealData.today,
      mealTypeInput,
```

次にする

```text
    createMealPageActionBindings({
      mealTypeInput,
```

- [ ] **Step 5: 通ることを確かめる**

Run: Step 3 と同じコマンド
Expected: PASS（`Test Suites: 7 passed, 7 total` / `Tests: 8 passed, 8 total`）

続けて食事の全テスト:
Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/meal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`Test Suites: 38 passed, 38 total` / `Tests: 80 passed, 80 total`）。`not wrapped in act(...)` の警告が無いこと。

- [ ] **Step 6: 変異の確認（ハンドラが描画時の今日を持つ形に一時的に戻す）**

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && mkdir -p "$BK" && cp src/features/meal/useMealAddAction.ts "$BK/" && python3 - <<'EOF'
p = "src/features/meal/useMealAddAction.ts"
s = open(p).read()
pairs = [
    ("}: UseMealAddActionParams) => {\n  return useCallback(() => {\n",
     "}: UseMealAddActionParams) => {\n  const renderToday = getTodayDateString();\n  return useCallback(() => {\n"),
    ("      today: getTodayDateString(),\n", "      today: renderToday,\n"),
    ("    timeInput,\n  ]);", "    timeInput,\n    renderToday,\n  ]);"),
]
for old, new in pairs:
    assert s.count(old) == 1, old
    s = s.replace(old, new)
open(p, "w").write(s)
EOF
NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/meal --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "^FAIL|Tests:" | sort -u
```

Expected: `FAIL src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx` だけ、`Tests: 1 failed, 79 passed, 80 total`（試作で確認済み）。

元に戻して一致を確かめる:

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && cp "$BK/useMealAddAction.ts" src/features/meal/useMealAddAction.ts && cmp "$BK/useMealAddAction.ts" src/features/meal/useMealAddAction.ts && echo RESTORED
```

Expected: `RESTORED`。結果を `.superpowers/sdd/2026-11-07-today-freeze/` の Task 3 の報告に書く。

- [ ] **Step 7: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run lint && npx prettier --check src/features/meal/useMealPageDataState.ts src/features/meal/useMealAddAction.ts src/features/meal/useMealPageMutationActions.ts src/features/meal/useMealPageActions.ts src/features/meal/mealPageActionBindings.ts src/features/meal/useMealPageState.ts src/features/meal/__tests__/useMealAddAction.saveDate.test.tsx src/features/meal/__tests__/useMealPageDataState.test.tsx src/features/meal/__tests__/useMealAddAction.test.tsx src/features/meal/__tests__/useMealPageMutationActions.test.tsx src/features/meal/__tests__/useMealPageActions.test.tsx src/features/meal/__tests__/useMealPageState.test.tsx src/features/meal/__tests__/mealPageActionBindings.test.ts`
Expected: すべて exit 0。

（コミットしない）

---

## Task 4: 家計簿の指標・カレンダー・ホームの曜日

**Files:**

- Modify: `src/features/budget/useBudgetPageMetricsState.ts`（全体）
- Modify: `src/features/calendar/components/CalendarGrid.tsx:1-8,34-35,55`
- Modify: `src/features/routine/hooks/useHomeViewState.ts:1,10`
- Modify（テスト）: `src/features/budget/__tests__/useBudgetPageMetricsState.test.tsx`・`src/features/calendar/__tests__/CalendarGrid.today.test.tsx`・`src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`
- Create（テスト）: `src/features/calendar/__tests__/CalendarGrid.useToday.test.tsx`・`src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx`

**Interfaces:**

- Consumes: Task 1 の `useLocalTodayKey(): string`・`useJstTodayKey(): string`・`useJstDay(): number`。既存の `calculateBudgetMetrics(currentDate: Date, monthBudget: number, expenses: readonly Expense[], now: Date = new Date()): BudgetMetrics`（`src/features/budget/utils/metrics.ts:24-28`。シグネチャは変えない）。
- Produces: 3 つのフック・コンポーネントの引数と戻り値は変えない（`useBudgetPageMetricsState({ currentDate, monthBudget, expenses }): BudgetMetrics`、`CalendarGrid(props: CalendarGridProps)`、`useHomeViewState(getIsTodayHoliday: () => boolean)`）。Task 5 の契約テストが、変数名 `todayKey`（家計簿）・`todayStr`（カレンダー）・`currentDayOfWeek`（ホーム）を依存の比較で探すので、この名前を変えない。

- [ ] **Step 1: 落ちるテスト・固定のテストを書く**

(a) `src/features/budget/__tests__/useBudgetPageMetricsState.test.tsx`（修正前は `useMemo` の依存に今日が無いので、同じ props で再描画すると古いままで落ちる）

次の部分を（ファイルの末尾）

```text
    expect(result.current.dailyRemainingBudget).toBe((31000 - 1800) / 30);
  });
});
```

次にする

```text
    expect(result.current.dailyRemainingBudget).toBe((31000 - 1800) / 30);
  });

  it("同じ入力のまま日をまたいだ後の再描画で、今日の支出と未入力の日数を新しい今日で計算し直す", () => {
    jest.setSystemTime(new Date("2026-03-07T23:59:00+09:00"));
    const props = {
      currentDate: new Date("2026-03-07T00:00:00+09:00"),
      monthBudget: 31000,
      expenses: [
        {
          id: "expense-1",
          date: "2026-03-01",
          amount: 1000,
          createdAt: "2026-03-01T00:00:00.000Z",
        },
        {
          id: "expense-2",
          date: "2026-03-07",
          amount: 800,
          createdAt: "2026-03-07T00:00:00.000Z",
        },
      ],
    };
    const { result, rerender } = renderHook(
      (hookProps: typeof props) => useBudgetPageMetricsState(hookProps),
      { initialProps: props },
    );
    // 03-07 の時点: 今日の支出は 800、今日以外の入力日は 03-01 だけ（31 - 1 = 30）
    expect(result.current.todayExpense).toBe(800);
    expect(result.current.unenteredDays).toBe(30);

    // 同じ props（参照も同じ）のまま、時計だけ 0 時をまたいでから再描画する
    jest.setSystemTime(new Date("2026-03-08T00:01:00+09:00"));
    rerender(props);

    // 03-08 の時点: 今日の支出は 0、今日以外の入力日は 03-01・03-07（31 - 2 = 29）
    expect(result.current.todayExpense).toBe(0);
    expect(result.current.unenteredDays).toBe(29);
    expect(result.current.dailyRemainingBudget).toBe((31000 - 1800) / 29);
  });
});
```

(b) `src/features/calendar/__tests__/CalendarGrid.today.test.tsx`（本物のフックを通す経路の固定。Jest はコンパイラを通さないので修正前でも通る）

次の部分を（ファイルの末尾）

```text
    expect(getHighlightedDay()).toBe("13");
  });
});
```

次にする

```text
    expect(getHighlightedDay()).toBe("13");
  });

  it("日をまたいだ後の再描画で、強調と押せる日が新しい今日に移る", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T23:59:00+09:00"));
    const props = {
      year: 2026,
      month: 8,
      monthHistory: {},
      pomodoroHistory: {},
      selectedDate: null,
      onDateClick: jest.fn(),
    };
    const { rerender } = render(<CalendarGrid {...props} />);
    expect(getHighlightedDay()).toBe("13");
    expect(screen.getByRole("button", { name: "14" })).toBeDisabled();

    jest.setSystemTime(new Date("2026-08-14T00:01:00+09:00"));
    rerender(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("14");
    expect(screen.getByRole("button", { name: "14" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "15" })).toBeDisabled();
  });
});
```

注: `rerender` には毎回新しい JSX（`<CalendarGrid {...props} />`）を渡す。同じ要素の参照を渡すと React が描画を省くため、再描画にならない。

(c) `src/features/calendar/__tests__/CalendarGrid.useToday.test.tsx` を新規作成する（配線のテスト。修正前に落ちる）。

```tsx
import { render, screen } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { CalendarGrid } from "../components/CalendarGrid";

const props = {
  year: 2026,
  month: 8,
  monthHistory: {},
  pomodoroHistory: {},
  selectedDate: null,
  onDateClick: jest.fn(),
};

/** 「今日」として強調されている日を返す */
const getHighlightedDay = () =>
  screen
    .getAllByRole("button")
    .find((button) => button.className.includes("ring"))
    ?.textContent?.trim();

// 今日の判定（強調と押せるかどうか）は、共通フック useJstTodayKey の値で決める。
// 時計（2026-08-13）と違う日をフックから返し、フックの値が使われることを確かめる
describe("CalendarGrid の今日は共通フック useJstTodayKey から取る", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-13T12:00:00+09:00"));
    (useJstTodayKey as jest.Mock).mockReturnValue("2026-08-20");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの日付を強調し、その日まで押せて翌日から押せない", () => {
    render(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("20");
    expect(screen.getByRole("button", { name: "20" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "21" })).toBeDisabled();
  });

  it("再描画でフックの日付が変わると、強調と押せる日が追いつく", () => {
    const { rerender } = render(<CalendarGrid {...props} />);

    (useJstTodayKey as jest.Mock).mockReturnValue("2026-08-21");
    rerender(<CalendarGrid {...props} />);

    expect(getHighlightedDay()).toBe("21");
    expect(screen.getByRole("button", { name: "21" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "22" })).toBeDisabled();
  });
});
```

(d) `src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`（本物のフックを通す経路の固定。修正前でも通る）

次の部分を

```text
    expect(result.current.isEditMode).toBe(false);
  });

  it("setFilterCategoryAction/setViewModeAction/toggleEditModeActionでlocalStorageを更新する", () => {
```

次にする

```text
    expect(result.current.isEditMode).toBe(false);
  });

  it("日をまたいだ後の再描画で、曜日の並び順の先頭が新しい今日の曜日になる", () => {
    // 2026-08-14 23:59 JST は金曜（5）、2026-08-15 00:01 JST は土曜（6）
    jest.useFakeTimers().setSystemTime(new Date("2026-08-14T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewState(() => false),
    );
    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 5 }),
    );

    jest.setSystemTime(new Date("2026-08-15T00:01:00+09:00"));
    rerender();

    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 6 }),
    );
    // 選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）
    expect(result.current.viewMode).toBe(5);
  });

  it("setFilterCategoryAction/setViewModeAction/toggleEditModeActionでlocalStorageを更新する", () => {
```

(e) `src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx` を新規作成する（配線のテスト。修正前に落ちる）。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstDay: jest.fn(),
}));

import { useJstDay } from "@/hooks/useToday";
import { useHomeViewState } from "../useHomeViewState";

// 曜日の並び順は、共通フック useJstDay の曜日で決める。
// 時計（2026-08-14 金曜 = 5）と違う曜日をフックから返し、フックの値が使われることを確かめる
describe("useHomeViewState の今日の曜日は共通フック useJstDay から取る", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-08-14T12:00:00+09:00"));
    (useJstDay as jest.Mock).mockReturnValue(3);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの曜日を並び順の先頭にし、再描画でフックの曜日が変わると先頭が追いつく", () => {
    const { result, rerender } = renderHook(() =>
      useHomeViewState(() => false),
    );
    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 3 }),
    );

    (useJstDay as jest.Mock).mockReturnValue(4);
    rerender();

    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 4 }),
    );
    // 選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）
    expect(result.current.viewMode).toBe(3);
  });
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/budget/__tests__/useBudgetPageMetricsState.test.tsx src/features/calendar/__tests__/CalendarGrid.today.test.tsx src/features/calendar/__tests__/CalendarGrid.useToday.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ --verbose`
Expected: `Tests: 4 failed, 10 passed, 14 total`（試作で確認済み）。落ちるのは次の 4 件:

- 家計簿「同じ入力のまま日をまたいだ後の再描画で、…計算し直す」（`todayExpense` が 800 のまま）
- カレンダー配線の 2 件（強調が時計の 13 日）
- ホーム配線の 1 件（先頭が時計の金曜 5）

時計で日をまたぐカレンダー・ホームの 2 件は、修正前でも通る（Jest は React Compiler を通さない。固定の検出は Task 5）。この事実を Task 4 の報告に書く。

- [ ] **Step 3: 実装する**

(a) `src/features/budget/useBudgetPageMetricsState.ts` を次の内容に置き換える。

```ts
import { useMemo } from "react";
import type { Expense } from "@/types/routine";
import { useLocalTodayKey } from "@/hooks/useToday";
import { calculateBudgetMetrics } from "./utils/metrics";

type UseBudgetPageMetricsStateParams = {
  currentDate: Date;
  monthBudget: number;
  expenses: Expense[];
};

export const useBudgetPageMetricsState = ({
  currentDate,
  monthBudget,
  expenses,
}: UseBudgetPageMetricsStateParams) => {
  const todayKey = useLocalTodayKey();

  return useMemo(
    () =>
      calculateBudgetMetrics(
        currentDate,
        monthBudget,
        expenses,
        new Date(`${todayKey}T00:00:00`),
      ),
    [currentDate, expenses, monthBudget, todayKey],
  );
};
```

補足（コメントには書かない）: 計算は `now` の日付の部分だけを使う（`toDateKey`・`isCurrentMonthDate`・`calculateUnenteredMonthDays`）ので、ローカル 0 時の Date でも結果は同じ。`todayKey` を `useMemo` の中で実際に使うので、コンパイラが依存から外さず、`react-hooks/exhaustive-deps` の「不要な依存」にもならない（設計書）。

(b) `src/features/calendar/components/CalendarGrid.tsx`

次の部分を

```text
import { isHoliday } from "@/lib/holidays";
import { type DailyHistory, type PomodoroHistory } from "@/types/routine";
import {
  buildDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
  toDateString,
} from "../utils/calendarDate";
```

次にする

```text
import { useJstTodayKey } from "@/hooks/useToday";
import { isHoliday } from "@/lib/holidays";
import { type DailyHistory, type PomodoroHistory } from "@/types/routine";
import {
  buildDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
} from "../utils/calendarDate";
```

次の部分を

```text
  const today = new Date();
  const todayStr = toDateString(today);
```

次にする

```text
  const todayStr = useJstTodayKey();
```

次の部分を

```text
    const isFuture = date > today;
```

次にする

```text
    // YYYY-MM-DD は固定長なので、文字列の大小で日付の前後を比べられる
    const isFuture = dateStr > todayStr;
```

（`const date = new Date(year, month - 1, day);` は祝日・土日の判定に使うので残す。`toDateString` は、この変更で本番コードから参照されなくなるため、`calendarDate.ts` から消し、同じ内容を `toJstDateKey` で確かめている `calendarDateKey.test.ts` も消した（SRP リファクタリングの第 1・2 周の指摘）。）

(c) `src/features/routine/hooks/useHomeViewState.ts`

次の部分を

```text
import { toJstDay } from "@/lib/storage/core";
```

次にする

```text
import { useJstDay } from "@/hooks/useToday";
```

次の部分を

```text
  const currentDayOfWeek = toJstDay(new Date());
```

次にする

```text
  const currentDayOfWeek = useJstDay();
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド
Expected: PASS（`Tests: 14 passed, 14 total`）

続けて関係する機能の全テスト:
Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/budget src/features/calendar src/features/routine --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: `FAIL` が無い。SIGSEGV で `Test suite failed to run` になったスイートがあれば、単独で実行して通ることを確かめ、報告に書く。

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run lint && npx prettier --check src/features/budget/useBudgetPageMetricsState.ts src/features/calendar/components/CalendarGrid.tsx src/features/routine/hooks/useHomeViewState.ts src/features/budget/__tests__/useBudgetPageMetricsState.test.tsx src/features/calendar/__tests__/CalendarGrid.today.test.tsx src/features/calendar/__tests__/CalendarGrid.useToday.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx`
Expected: すべて exit 0。

（コミットしない）

---

## Task 5: React Compiler を通す契約テスト＋devDependencies

Task 1〜4 の後に行う（対象のファイルが共通フックを使っている前提）。

**Files:**

- Modify: `package.json`・`package-lock.json`（devDependencies の宣言 2 つだけ）
- Create: `src/__tests__/reactCompilerToday.contract.test.ts`

**Interfaces:**

- Consumes: Task 1 の `src/hooks/useToday.ts`（`export const useJstTodayKey = (): string => { "use no memo"; … }` の形 ×3）。Task 2〜4 の 5 ファイルの変数名 `today`（体重・食事）・`todayStr`（カレンダー）・`currentDayOfWeek`（ホーム）・`todayKey`（家計簿）と、共通フックの呼び出し。`typescript`（`transpileModule`・`createSourceFile`）、`@babel/core`（`transformSync`）、`babel-plugin-react-compiler`（1.0.0。プラグイン名の文字列で渡す）。
- Produces: 対象の一覧 `TODAY_TARGETS: { file: string; hookCall: string; dependency: string }[]`（このファイルの中。Task 6 の `coding-standards.md` がここを参照する）。

- [ ] **Step 1: インストール済みの版を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm ls @babel/core @types/babel__core babel-plugin-react-compiler --depth=0`
Expected: `@babel/core@7.29.7 extraneous`・`@types/babel__core@7.20.5 extraneous`・`babel-plugin-react-compiler@1.0.0`。版が違えば、Step 2 の版をその版に読み替え、報告に書く。

- [ ] **Step 2: devDependencies に宣言を足す**

`npm install` は使わない（「設計書との差異」4: 無関係な項目が `package-lock.json` に増える）。`package.json` と `package-lock.json` の `packages[""].devDependencies` に 2 つを足し、キーを並べ直す（既存の並びは `localeCompare` の順と一致する）。

```bash
cd .worktrees/issue-208-today-freeze && node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const additions = { "@babel/core": "^7.29.7", "@types/babel__core": "^7.20.5" };
const sortKeys = (obj) =>
  Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
for (const [path, pick] of [
  ["package.json", (json) => json],
  ["package-lock.json", (json) => json.packages[""]],
]) {
  const json = JSON.parse(readFileSync(path, "utf8"));
  const target = pick(json);
  target.devDependencies = sortKeys({ ...target.devDependencies, ...additions });
  writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
}
'
```

- [ ] **Step 3: 差分がこの 2 つの宣言だけであることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && git diff --stat package.json package-lock.json && git diff -U0 package.json package-lock.json | grep -E '^[+-] '`
Expected:

- `2 files changed, 4 insertions(+)`
- 次の 4 行だけ（削除の行 `-` は無い。`git diff` はパスの順に出すので、`package-lock.json`（字下げ 8）が `package.json`（字下げ 4）より先に出る）:

```text
+        "@babel/core": "^7.29.7",
+        "@types/babel__core": "^7.20.5",
+    "@babel/core": "^7.29.7",
+    "@types/babel__core": "^7.20.5",
```

続けて: `cd .worktrees/issue-208-today-freeze && npm ls @babel/core @types/babel__core --depth=0 && npx prettier --check package.json`
Expected: 2 つとも `extraneous` が付かない。`All matched files use Prettier code style!`（`package-lock.json` は `.prettierignore` で除外されているので、prettier の対象に含めない）

最後に、npm から見て `package.json` と `package-lock.json` が整合していることを、別のディレクトリで確かめる（作業ツリーの `node_modules` は主チェックアウトへのシンボリックリンクなので、ここでは実行しない）:

Run: `cd .worktrees/issue-208-today-freeze && T=$(mktemp -d) && cp package.json package-lock.json "$T/" && (cd "$T" && npm ci --dry-run --ignore-scripts --no-audit --no-fund; echo "exit=$?"); rm -rf "$T"`
Expected: `exit=0`

- [ ] **Step 4: 契約テストを書く**

`src/__tests__/reactCompilerToday.contract.test.ts` を新規作成する。

```ts
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
      // 今日を求める式がある（最初の描画の今日に固定される）。src/hooks/useToday.ts のフックを使う
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
```

注:

- `transpileModule` の `target`・`module` を省くと、既定の ES5・CommonJS に変換されてコンパイラがフック・コンポーネントを認識せず、`_c(` が出ない（検証 2 がそれを捕まえる。Step 6 で確かめる）。`fileName` を渡さないと、`.ts` も TSX として解析される。
- `transformSync` に `parserOpts: { plugins: ["jsx"] }` が無いと、`.tsx` が「Support for the experimental syntax 'jsx' isn't currently enabled」で失敗する。
- 依存の比較の正規表現の `\b` は、`today` が `todayRecord`・`todayMeals` に一致しないためのもの。

- [ ] **Step 5: 通ることを確かめる**

Run: `cd .worktrees/issue-208-today-freeze && NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ --verbose`
Expected: PASS（`Tests: 23 passed, 23 total`。共通フック 3 件＋5 ファイル×4 件）

（このテストは Task 1〜4 の実装の後に書くため、「先に落ちる」確認は Step 6 の変異で行う。）

- [ ] **Step 6: 変異の確認（設計書「契約テスト › 検証 4」。テストには含めない）**

各対象ファイルの共通フックの呼び出しを、元の直接の呼び出しに 1 つずつ戻したコピーで契約テストを実行し、落ちることを確かめる。スクリプトは変異ごとに必ず元に戻し（`finally`）、元と一致することを `assert` で確かめる。家計簿は (a) `useLocalTodayKey()` を `toDateKey(new Date())` に替えた形、(b) 元のコード（`now` を渡さず `todayKey` も使わない形。`git show HEAD:` から取る）の 2 つ。共通フックは各フックの `"use no memo"` を 1 つずつ外す。

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && mkdir -p "$BK" && git show HEAD:src/features/budget/useBudgetPageMetricsState.ts > "$BK/useBudgetPageMetricsState.orig.ts" && for f in src/features/weight-tracker/page/useWeightTrackerDataState.ts src/features/meal/useMealPageDataState.ts src/features/calendar/components/CalendarGrid.tsx src/features/routine/hooks/useHomeViewState.ts src/features/budget/useBudgetPageMetricsState.ts src/hooks/useToday.ts; do cp "$f" "$BK/"; done && python3 - "$BK/useBudgetPageMetricsState.orig.ts" <<'EOF'
import os, subprocess, sys
from pathlib import Path

ORIGINAL_BUDGET = sys.argv[1]
TEST = "src/__tests__/reactCompilerToday.contract.test.ts"
MUTATIONS = [
    ("体重", "src/features/weight-tracker/page/useWeightTrackerDataState.ts",
     "const today = useJstTodayKey();", "const today = getTodayDateKey();"),
    ("食事", "src/features/meal/useMealPageDataState.ts",
     "const today = useJstTodayKey();", "const today = getTodayDateString();"),
    ("カレンダー", "src/features/calendar/components/CalendarGrid.tsx",
     "const todayStr = useJstTodayKey();", "const todayStr = getTodayString();"),
    ("ホーム", "src/features/routine/hooks/useHomeViewState.ts",
     "const currentDayOfWeek = useJstDay();", "const currentDayOfWeek = toJstDay(new Date());"),
    ("家計簿(a)", "src/features/budget/useBudgetPageMetricsState.ts",
     "const todayKey = useLocalTodayKey();", "const todayKey = toDateKey(new Date());"),
    ("家計簿(b)", "src/features/budget/useBudgetPageMetricsState.ts", None, None),
    ("共通フック useJstTodayKey", "src/hooks/useToday.ts",
     'export const useJstTodayKey = (): string => {\n  "use no memo";\n',
     "export const useJstTodayKey = (): string => {\n"),
    ("共通フック useJstDay", "src/hooks/useToday.ts",
     'export const useJstDay = (): number => {\n  "use no memo";\n',
     "export const useJstDay = (): number => {\n"),
    ("共通フック useLocalTodayKey", "src/hooks/useToday.ts",
     'export const useLocalTodayKey = (): string => {\n  "use no memo";\n',
     "export const useLocalTodayKey = (): string => {\n"),
]

for label, path, old, new in MUTATIONS:
    file = Path(path)
    original = file.read_text()
    if old is None:
        mutated = Path(ORIGINAL_BUDGET).read_text()
    else:
        assert original.count(old) == 1, (label, old)
        mutated = original.replace(old, new)
    try:
        file.write_text(mutated)
        result = subprocess.run(
            ["npx", "jest", TEST, "--verbose",
             "--testPathIgnorePatterns=/node_modules/", "/firebase-functions/lib/", "/e2e/"],
            capture_output=True, text=True,
            env={**os.environ, "NODE_ENV": "test", "TZ": "Asia/Tokyo"},
        )
        output = result.stdout + result.stderr
    finally:
        file.write_text(original)
    assert file.read_text() == original, f"{path} を元に戻せていない"
    summary = next((l for l in output.splitlines() if l.startswith("Tests:")), "Tests: (なし)")
    print(f"## {label}: {path}\n{summary}")
    for line in output.splitlines():
        if "✕" in line:
            print(f"  {line.strip()}")
EOF
```

Expected（試作で確認済み。`(n ms)` の表示は除く）:

```text
## 体重: …useWeightTrackerDataState.ts
Tests:       3 failed, 20 passed, 23 total
  ✕ 今日を求める式が、最初の描画で 1 回だけ実行されるブロックに入っていない
  ✕ メモ化の依存の比較に today がある
  ✕ ソースが共通フック useJstTodayKey( を呼んでいる
## 食事: …useMealPageDataState.ts
Tests:       3 failed, 20 passed, 23 total
  （体重と同じ 3 件）
## カレンダー: …CalendarGrid.tsx
Tests:       2 failed, 21 passed, 23 total
  ✕ メモ化の依存の比較に todayStr がある
  ✕ ソースが共通フック useJstTodayKey( を呼んでいる
## ホーム: …useHomeViewState.ts
Tests:       3 failed, 20 passed, 23 total
  ✕ 今日を求める式が、最初の描画で 1 回だけ実行されるブロックに入っていない
  ✕ メモ化の依存の比較に currentDayOfWeek がある
  ✕ ソースが共通フック useJstDay( を呼んでいる
## 家計簿(a): …useBudgetPageMetricsState.ts
Tests:       3 failed, 20 passed, 23 total
  ✕ 今日を求める式が、最初の描画で 1 回だけ実行されるブロックに入っていない
  ✕ メモ化の依存の比較に todayKey がある
  ✕ ソースが共通フック useLocalTodayKey( を呼んでいる
## 家計簿(b): …useBudgetPageMetricsState.ts
Tests:       2 failed, 21 passed, 23 total
  ✕ メモ化の依存の比較に todayKey がある
  ✕ ソースが共通フック useLocalTodayKey( を呼んでいる
## 共通フック useJstTodayKey / useJstDay / useLocalTodayKey: src/hooks/useToday.ts
Tests:       1 failed, 22 passed, 23 total（それぞれ）
  ✕ <そのフック名> は本体の最初の文が "use no memo" である
```

カレンダーは、`getTodayString()` が sentinel のブロックに入らず、`todayStr` が依存から外れる形で固定される（「設計書との差異」1）。「依存の比較」の検証が落ちることが、固定の検出になっている。

検証 2 の空振り防止も確かめる（`transpileModule` の `target`・`module` を一時的に外す）:

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && cp src/__tests__/reactCompilerToday.contract.test.ts "$BK/" && python3 - <<'EOF'
p = "src/__tests__/reactCompilerToday.contract.test.ts"
s = open(p).read()
old = "      target: ts.ScriptTarget.ESNext,\n      module: ts.ModuleKind.ESNext,\n"
assert s.count(old) == 1
open(p, "w").write(s.replace(old, ""))
EOF
NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ --verbose 2>&1 | grep -E "✕|Tests:"; cp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && cmp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && echo RESTORED
```

Expected: `Tests: 10 failed, 13 passed, 23 total`（5 ファイルそれぞれで「React Compiler でコンパイルされている（出力に \_c( がある）」と「メモ化の依存の比較に … がある」が落ちる）、最後に `RESTORED`。

最後に、対象のファイルがすべて元どおりであることを確かめる:

```bash
cd .worktrees/issue-208-today-freeze && BK=".git/worktrees/issue-208-today-freeze/today-freeze-backup" && for f in src/features/weight-tracker/page/useWeightTrackerDataState.ts src/features/meal/useMealPageDataState.ts src/features/calendar/components/CalendarGrid.tsx src/features/routine/hooks/useHomeViewState.ts src/features/budget/useBudgetPageMetricsState.ts src/hooks/useToday.ts; do cmp "$BK/$(basename "$f")" "$f" || echo "DIFF: $f"; done; echo CHECKED
```

Expected: `CHECKED` だけ（`DIFF:` が出ない）。結果（変異ごとの落ちたテスト名と件数）を `.superpowers/sdd/2026-11-07-today-freeze/` の Task 5 の報告に書く。

- [ ] **Step 7: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run lint && npx prettier --check src/__tests__/reactCompilerToday.contract.test.ts package.json package-lock.json`
Expected: すべて exit 0（`tsconfig.test.json` の型検査が `@types/babel__core` の型で通る）。

（コミットしない）

---

## Task 6: ドキュメント・確認表・全体の検証

**Files:**

- Modify: `docs/02-development/coding-standards.md`（節の追加・レビューの観点・最終更新日）
- Modify: `docs/03-testing/test-matrix.md`（2-C・4・7・8・10 の表に 1 行ずつ）
- Modify: `src/features/test-matrix/initialData.ts`（2-29・4-7・7-9・8-16・10-9）
- Modify: `src/features/test-matrix/detailed-test-cases/group-01-04.ts`（`"2-29"`・`"4-7"`）・`group-05-09.ts`（`"7-9"`・`"8-16"`）・`group-10-13.ts`（`"10-9"`）

**Interfaces:**

- Consumes: Task 1 の 3 つのフック名、Task 5 の `src/__tests__/reactCompilerToday.contract.test.ts` と `TODAY_TARGETS`。確認表の型 `TestItem`（`{ id; label; pc; sp; note }`）・`DetailTestCase`（`{ id; scenario; expected; pc; sp; note }`）。
- Produces: 新しい確認の ID（既存の ID は変えない・振り直さない）。ID の決め方: 各節の既存の最後の ID の次。
  - ホーム（2. ルーティン管理の最後は 2-D の 2-28）→ **2-29**（表示の項目なので 2-C の表・`routine-display` の末尾に置く。2-C の最後は 2-25）
  - 体重（最後 4-6）→ **4-7**
  - 食事（`test-matrix.md` の最後は 7-8。`initialData.ts` には 7-8 が無く 7-7 が最後だが、ID は md に合わせる）→ **7-9**（7-8 を `initialData.ts` に足すことはこのプランの範囲外）
  - 家計簿（最後 8-15）→ **8-16**
  - カレンダー（最後 10-8）→ **10-9**

- [ ] **Step 1: コーディング規約に節を足す**

`docs/02-development/coding-standards.md`

次の部分を

```text
### ViewModelパターンの適用
```

次にする

```text
### React Compiler と今日・現在時刻

このプロジェクトは React Compiler（`next.config.ts` の `reactCompiler: true`）で、フック・コンポーネントを自動でメモ化する。props・state・フックの戻り値に依存しない式は最初の描画の値が使い回されるため、本体で求めた「今日」「現在時刻」は、画面を開き直すまで最初の描画の値に固定される。Jest（ts-jest）はコンパイラを通さないので、単体テストでは検出できない。

- **描画時に「今日」「現在時刻」を求めない**: フック・コンポーネントの本体で `new Date()`・`getTodayString()` などを呼ばない。保存する日付に使う値は特に、イベントハンドラの中（呼ばれた時点）で取る。描画時に取った値をハンドラに持たせると、再描画の無いまま 0 時をまたいだ操作が前日で処理される。
- **描画時に今日が必要なとき**は `src/hooks/useToday.ts` のフック（`useJstTodayKey`・`useJstDay`・`useLocalTodayKey`）を使う。各フックは `"use no memo"` で自動メモ化から外してあり、呼ぶ側は戻り値を依存として扱うので、日をまたいだ後の次の描画で新しい今日になる（0 時に自動で再描画はしない）。`useMemo` で使うときは、戻り値を計算の中で実際に使う（依存の配列に足すだけでは、コンパイラが依存から外す）。
- **新しく今日を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足す。コンパイル結果で、今日が固定されていないことを確かめる。
- **対象外**: イベントハンドラの中、`useState` の初期化関数の中で取る今日（描画のたびに求める値ではない）。

### ViewModelパターンの適用
```

次の部分を

```text
- フォーム入力やキーボード操作で IME 確定が考慮されているか確認してください。
```

次にする

```text
- フォーム入力やキーボード操作で IME 確定が考慮されているか確認してください。
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか確認してください（React Compiler で固定される。「React Compiler と今日・現在時刻」）。
```

次の部分を

```text
**最終更新日**: 2026年10月10日
```

次にする

```text
**最終更新日**: 2026年11月7日
```

- [ ] **Step 2: `docs/03-testing/test-matrix.md` に行を足す**

各表の、指定した ID の行の直後に 1 行を挿入する（表の桁揃えは後で prettier に任せる）。

```bash
cd .worktrees/issue-208-today-freeze && python3 - <<'EOF'
p = "docs/03-testing/test-matrix.md"
lines = open(p).read().split("\n")
rows = {
    "2-25": "| 2-29 | 0 時をまたいだ後の曜日の並び順 | ✅ | ⬜ | ⬜ | 開いたまま日をまたいで操作すると、新しい今日の曜日が先頭になる（選択中の曜日・日付の表示は前日のまま） |",
    "4-6": "| 4-7 | 0 時をまたいだ後の保存の日付 | 🔶 | ⬜ | ⬜ | フォームを開いたまま日をまたいで保存すると、保存した時点の日付で記録される |",
    "7-8": "| 7-9 | 0 時をまたいだ後の保存の日付 | 🔶 | ⬜ | ⬜ | フォームを開いたまま日をまたいで保存すると、保存した時点の日付で記録される |",
    "8-15": "| 8-16 | 0 時をまたいだ後の「今日の支出」「1日あたり使える金額」 | ✅ | ⬜ | ⬜ | 開いたまま日をまたいで操作すると、新しい今日で計算し直す |",
    "10-8": "| 10-9 | 0 時をまたいだ後の今日の強調・未来日 | 🔶 | ⬜ | ⬜ | 開いたまま日をまたいで操作すると、強調と押せる日が新しい今日に移る |",
}
out = []
for line in lines:
    out.append(line)
    for after_id, row in rows.items():
        if line.startswith(f"| {after_id} "):
            out.append(row)
for after_id in rows:
    assert sum(1 for l in lines if l.startswith(f"| {after_id} ")) == 1, after_id
open(p, "w").write("\n".join(out))
EOF
npx prettier --write docs/03-testing/test-matrix.md && grep -nE '^\| (2-29|4-7|7-9|8-16|10-9) ' docs/03-testing/test-matrix.md
```

Expected: 5 行が出る（2-29 は 2-25 の直後、4-7 は 4-6 の直後、7-9 は 7-8 の直後、8-16 は 8-15 の直後、10-9 は 10-8 の直後）。`git diff docs/03-testing/test-matrix.md` で、変わったのが 5 つの表（2-C・4・7・8・10）の中だけであることを確かめる（prettier の桁揃えで、その表の他の行の空白が変わるのはよい）。

- [ ] **Step 3: `initialData.ts` に項目を足す**

`src/features/test-matrix/initialData.ts`

次の部分を

```text
        id: "2-25",
        label: "空状態表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "2-25",
        label: "空状態表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "2-29",
        label: "0 時をまたいだ後の曜日の並び順",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次の部分を

```text
        id: "4-6",
        label: "記録の削除（確認ダイアログ）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "4-6",
        label: "記録の削除（確認ダイアログ）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "4-7",
        label: "0 時をまたいだ後の保存の日付",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次の部分を

```text
        id: "7-7",
        label: "食事記録の削除",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "7-7",
        label: "食事記録の削除",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "7-9",
        label: "0 時をまたいだ後の保存の日付",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次の部分を

```text
        id: "8-15",
        label: "未入力の日の表示（今月の過ぎた日）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "8-15",
        label: "未入力の日の表示（今月の過ぎた日）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "8-16",
        label: "0 時をまたいだ後の「今日の支出」「1日あたり使える金額」",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次の部分を

```text
        id: "10-8",
        label: "未来日付の非表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "10-8",
        label: "未来日付の非表示",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "10-9",
        label: "0 時をまたいだ後の今日の強調・未来日",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

- [ ] **Step 4: 詳細の確認手順を足す（L-368）**

共通の前提（各手順に書いてある）: 端末の日時を手動で 23:58〜23:59 に設定し、アプリを開いたまま 0 時をまたぐ（実機で待たず、端末の日時設定で翌日の 0:00 過ぎへ進めてもよい）。月末・年末・祝日をまたがない日で行う。日をまたぐ前後で、ページの再読み込み・画面の開き直しはしない。

(a) `src/features/test-matrix/detailed-test-cases/group-01-04.ts`

次の部分を

```text
  "3-1": [
```

次にする

```text
  "2-29": [
    {
      id: "2-29-1",
      scenario:
        "今日も明日も祝日でない日に行う。ホームを開き、曜日のタブの左端が今日の曜日であることを確かめる。端末の日時を23:59付近にし、ホームを開いたまま0時をまたぐ（端末の日時設定で翌日の0:00過ぎに進めてもよい。ページの再読み込みはしない）。またいだ後に、カテゴリの絞り込みで別のカテゴリを押し、続けて「すべて」を押す（画面を再描画させる操作）",
      expected:
        "「すべて」を押したあと、曜日のタブの左端が新しい今日の曜日になり、またぐ前の今日の曜日は右端（「🎌 祝日」のタブの左隣）へ回る。選択中のタブと、画面上部の日付の表示は、またぐ前の日のまま（再読み込みで新しい日に揃う。既知の制約）。またいだ直後で何も操作していないうちは、並びが変わっていなくてよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "3-1": [
```

次の部分を（ファイルの末尾。`"4-6"` の 2 件目のケースの後）

```text
      scenario: "削除確認ダイアログで拒否",
      expected: "体重記録が削除されない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
};
```

次にする

```text
      scenario: "削除確認ダイアログで拒否",
      expected: "体重記録が削除されない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "4-7": [
    {
      id: "4-7-1",
      scenario:
        "またぐ前の日（今日）の体重の記録が無い状態で行う（ある場合は「📊 記録履歴」の「削除」で消す）。端末の日時を23:58頃にして体重記録を開き、「今日の記録」の「➕」を押す。「体重 (kg) *」に 65.5 を入れ、0時になる前に入力を終える。その後は画面に触れずに0時を過ぎるのを待ち（端末の日時設定で翌日の0:00過ぎに進めてもよい。アプリに戻っても入力欄やボタンには触れない）、0時を過ぎてから「保存」だけを押す",
      expected:
        "新しい日付（またいだ後の今日）で保存される。「今日の記録」の見出しの日付が新しい日付になり、65.5 kg が表示される。「📊 記録履歴」の先頭に新しい日付の 65.5 kg の行が出て「今日」のバッジが付く。またぐ前の日の行は増えていない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "4-7-2",
      scenario:
        "またぐ前の日（今日）に体重 60.0 を記録してある状態で、端末の日時を23:59付近にして体重記録を開いたまま0時をまたぐ。0時を過ぎてから「今日の記録」の「✏️ 編集」を押し（画面を再描画させる操作）、体重を 61.0 に変えて「保存」を押す",
      expected:
        "「✏️ 編集」を押した時点で、「今日の記録」の見出しの日付は新しい日付になるが、カードの体重とフォームの体重はまたぐ前の日の 60.0 のまま（既知の制約: 今日の記録の中身は保存か再読み込みまで前日のまま）。「📊 記録履歴」のまたぐ前の日の 60.0 の行から「今日」のバッジが消える。「保存」の後、カードは 61.0 kg になり、記録履歴に新しい日付の 61.0（「今日」のバッジ付き）とまたぐ前の日の 60.0 の2行が並ぶ",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
};
```

(b) `src/features/test-matrix/detailed-test-cases/group-05-09.ts`

次の部分を

```text
  "8-1": [
```

次にする

```text
  "7-9": [
    {
      id: "7-9-1",
      scenario:
        "またぐ前の日（今日）に食事の記録が1件以上ある状態で行う（無ければ「今日の食事」の「➕」から1件保存しておく）。端末の日時を23:58頃にして食事記録を開き、「今日の食事」の「➕」を押す。「食事の種類 *」で「🍪 間食」を選び、「食事内容 *」に「日またぎテスト」を入れ、0時になる前に入力を終える。その後は画面に触れずに0時を過ぎるのを待ち（端末の日時設定で翌日の0:00過ぎに進めてもよい。アプリに戻っても入力欄やボタンには触れない）、0時を過ぎてから「保存」だけを押す",
      expected:
        "「日またぎテスト」が新しい日付（またいだ後の今日）で保存される。「今日の食事」の見出しの日付が新しい日付になり、一覧は「日またぎテスト」の1件だけになる（またぐ前の日の食事は出ない）。「📖 最近の記録」で「日またぎテスト」に「今日」のバッジが付き、またぐ前の日の食事には付かない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "7-9-2",
      scenario:
        "またぐ前の日（今日）に食事の記録が1件以上ある状態で、端末の日時を23:59付近にして食事記録を開いたまま0時をまたぐ。0時を過ぎてから「今日の食事」の「➕」を押してフォームを開き（画面を再描画させる操作）、「食事内容 *」に「またいだ後」を入れて「保存」を押す",
      expected:
        "「➕」を押した時点で、「今日の食事」の見出しの日付は新しい日付になるが、一覧はまたぐ前の日の食事のまま（既知の制約: 今日の食事は保存か再読み込みまで前日のまま）。「📖 最近の記録」のまたぐ前の日の食事から「今日」のバッジが消える。「保存」の後、「今日の食事」の一覧は「またいだ後」の1件だけになり、「📖 最近の記録」で「またいだ後」に「今日」のバッジが付く",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "8-1": [
```

次の部分を

```text
  "9-1": [
```

次にする

```text
  "8-16": [
    {
      id: "8-16-1",
      scenario:
        "月間予算を設定済みで、「📊 月次サマリー」の「残り」が 1,000 円より多い状態（1000 円の支出を足した後もプラス。「1日あたり使える金額」は 0 円未満にならないよう 0 で止まるので、残りが 0 以下だとまたぐ前後でどちらも ￥0 になり、大きくなることを確かめられない）、月末をまたがない日（今月の1日〜末日の前日）で行う。端末の日時を23:58頃にして家計簿を開き（今月を表示）、「➕」から今日の日付で金額 1000 の支出を追加する。「今日の支出」が ￥1,000 になったことを確かめ、「1日あたり使える金額」の値を控える。そのまま0時をまたぐ（端末の日時設定で翌日の0:00過ぎに進めてもよい）。またいだ後に「➕」を押してフォームを開き、何も入れずに「キャンセル」を押す（「← 前月」「今月に戻る」などの月を移動する操作は使わない。表示中の月が変わると修正前でも計算し直されるため、確かめにならない）",
      expected:
        "「➕」を押したあと、「今日の支出」が ￥0 になる。「1日あたり使える金額」は控えた値より大きくなる（またぐ前の日の 1000 円の記録が「今日以外で入力がある日」になり、割る日数が1日減るため）。またいだ直後で何も操作していないうちは、前の値のままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "9-1": [
```

(c) `src/features/test-matrix/detailed-test-cases/group-10-13.ts`

次の部分を

```text
  "11-1": [
```

次にする

```text
  "10-9": [
    {
      id: "10-9-1",
      scenario:
        "月末をまたがない日（今月の1日〜末日の前日）で行う。端末の日時を23:59付近にして達成カレンダーを開き（今月を表示）、今日の日付が太字と薄い青の輪で強調され、明日の日付が薄く表示されて押せない（押しても選択されない）ことを確かめる。そのまま0時をまたぐ（端末の日時設定で翌日の0:00過ぎに進めてもよい）。またいだ後に、またぐ前の今日の日付（またいだ後の昨日）を押す",
      expected:
        "押したあと、今日の強調（太字と薄い青の輪）が新しい今日の日付に移り、新しい今日の日付が薄い表示でなくなって押せるようになる（押すと選択され、その日の詳細が出る）。押した日付（またいだ後の昨日）には、選択の濃い青の輪と薄い青の背景が付く（今日の強調とは別。2 か所に輪が見えても、片方は選択、片方は今日の強調）。新しい明日の日付は薄く表示され押せない。またいだ直後で何も操作していないうちは、強調が前の日のままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "11-1": [
```

- [ ] **Step 5: 確認表のテストと整形を確かめる**

Run: `cd .worktrees/issue-208-today-freeze && npx prettier --write src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-01-04.ts src/features/test-matrix/detailed-test-cases/group-05-09.ts src/features/test-matrix/detailed-test-cases/group-10-13.ts docs/02-development/coding-standards.md && NODE_ENV=test npx jest src/features/test-matrix --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`detailedTestCases.test.ts` の「ID は項目 ID を接頭辞に持ち、項目の中で重複しない」が新しい 5 項目でも通る。`initialData.test.ts` も通る）

- [ ] **Step 6: 全体の検証**

Run（1 つずつ。各コマンドの結果を報告に書く）:

```bash
cd .worktrees/issue-208-today-freeze && NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/' 2>&1 | grep -E "^FAIL|Tests:|Test Suites:|SIGSEGV" | sort -u
```

Expected: `FAIL` が無い、`Test Suites: 1341 passed, 1341 total`・`Tests: 6973 passed, 6973 total`。SIGSEGV のスイートがあれば単独で実行して通ることを確かめる（件数はその分減る）。

```bash
cd .worktrees/issue-208-today-freeze && npm run typecheck && npm run typecheck:functions && npm run lint && npm run tailwind:scan
```

Expected: すべて exit 0。`tailwind:scan` は `No Tailwind shorthand issues found.`

```bash
cd .worktrees/issue-208-today-freeze && npm run build
```

Expected: exit 0（`next build --webpack`。React Compiler を通した本番のビルド）。

```bash
cd .worktrees/issue-208-today-freeze && git status --short && npx prettier --check $(git diff --name-only) $(git ls-files --others --exclude-standard)
```

Expected: `git status --short` に出るのは、このプランの「ファイルの構成」の表のファイルと、元から未追跡の `docs/superpowers/specs/2026-11-07-today-freeze-design.md`・このプラン `docs/superpowers/plans/2026-11-07-today-freeze.md` だけ。prettier は `All matched files use Prettier code style!`

（コミットしない）

---

## セルフレビュー

### 設計書の要件 → タスク

| 設計書の要件                                                                                                                                                                         | タスク                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 共通フック `src/hooks/useToday.ts`（`useJstTodayKey`・`useJstDay`・`useLocalTodayKey`、最初の文が `"use no memo"`、features を import しない、ローカルの年月日をその場で組み立てる） | Task 1 Step 3                                                |
| 共通フックのテスト（再描画で新しい値、既存の関数と同じ値。JST とローカルの差は検証しない）                                                                                           | Task 1 Step 1                                                |
| 体重 `useWeightTrackerDataState.ts:8` を `useJstTodayKey()` に。保存の読み出しはコンパイラの扱いのまま                                                                               | Task 2 Step 4(a)                                             |
| 食事 `useMealPageDataState.ts:8` を `useJstTodayKey()` に                                                                                                                            | Task 3 Step 4(a)                                             |
| 家計簿の指標: `useLocalTodayKey()` を呼び、`useMemo` の中で 0 時の Date を `now` に渡す（シグネチャは変えない）                                                                      | Task 4 Step 3(a)                                             |
| カレンダー: `useJstTodayKey()`、`isToday`・`isFuture` を文字列比較、`today` の Date は使わない                                                                                       | Task 4 Step 3(b)                                             |
| ホーム: `useJstDay()`                                                                                                                                                                | Task 4 Step 3(c)                                             |
| 体重・食事の保存の日付をハンドラの本体で決める。描画時の `today` を保存の経路・`useCallback` の依存から外す                                                                          | Task 2 Step 4(b)〜(e)、Task 3 Step 4(b)〜(f)                 |
| 保存の日付の新しいテストファイル（`../storage` だけをモックして本物の handler を通す。23:59 描画→再描画せず 0:01→保存の関数の第 1 引数が新しい日付）                                 | Task 2 Step 1、Task 3 Step 1                                 |
| 既存テストの `today: "2024-01-12"` の書き換え（弱めず、新しい契約に）                                                                                                                | Task 2 Step 2、Task 3 Step 2                                 |
| 保存の日付の変異の確認（描画時の `today` に戻すとそのテストだけが落ちる）                                                                                                            | Task 2 Step 6、Task 3 Step 6                                 |
| `today` の保存以外の使い道の洗い出し                                                                                                                                                 | 「設計書との差異」3                                          |
| 5 か所の日をまたいだ再描画の単体テスト（L-060 の流儀、合成テストの `act()`）                                                                                                         | Task 2 Step 2(a)、Task 3 Step 2(a)、Task 4 Step 1            |
| 契約テスト（`transpileModule` のオプションと `fileName`、`transformSync` のオプション、`@jest-environment node`、検証 1〜3、`_c(` の前提確認）                                       | Task 5 Step 4                                                |
| 変異の確認（検証 4。家計簿は (a)(b) の 2 つ）                                                                                                                                        | Task 5 Step 6                                                |
| `@babel/core`・`@types/babel__core` を devDependencies に宣言（インストール済みの版、`package-lock.json` の差分は宣言だけ）                                                          | Task 5 Step 1〜3                                             |
| 対象の一覧を 1 か所に置き、`coding-standards.md` から参照                                                                                                                            | Task 5 Step 4（`TODAY_TARGETS`）、Task 6 Step 1              |
| `coding-standards.md` の節（4 項目）                                                                                                                                                 | Task 6 Step 1                                                |
| 確認表（md・`initialData.ts`・詳細）に 5 か所の手動確認。体重・食事は「入力を 0 時前に終え、0 時後に保存だけを押す」と、既知の制約 2 の手順                                          | Task 6 Step 2〜4                                             |
| 全体の検証（`npm test`・`typecheck`・`typecheck:functions`・`lint`・`tailwind:scan`・`build`）                                                                                       | Task 6 Step 6                                                |
| 直さないもの・範囲外（フォーム 2 つの 0 円警告、週目標、ホームの日付ラベル・祝日、0 時の自動再描画、`useBudgetMissingExpenseDates`、全体の自動検出）                                 | どのタスクでも触らない（Global Constraints「変えないもの」） |

### 型・関数名の整合

- `useJstTodayKey(): string`・`useJstDay(): number`・`useLocalTodayKey(): string` — Task 1 で定義、Task 2（体重）・Task 3（食事）・Task 4（カレンダー・ホーム・家計簿）・Task 5（`TODAY_HOOK_NAMES`・`hookCall`）で同じ名前を使う。テストのモックは `jest.mock("@/hooks/useToday", …)` で統一。
- 契約テストの `dependency` の変数名 `today`・`todayStr`・`currentDayOfWeek`・`todayKey` は、Task 2〜4 の実装の変数名と一致する（Task 4 の Interfaces に「名前を変えない」と書いた）。
- `useWeightTrackerMutationActions`・`useWeightTrackerActions`・`createWeightPageActionBindings`、`useMealAddAction`・`useMealPageMutationActions`・`useMealPageActions`・`createMealPageActionBindings` の引数から `today` を外し、呼び出し元（`useWeightTrackerState`・`useMealPageState` と中間のフック）も同じタスクで外す。`createSaveWeightHandler`・`createMealAddHandler` の `today: string` は残る（ハンドラの本体で `getTodayDateKey()`・`getTodayDateString()` の値を渡す）。
- 確認表の ID（2-29・4-7・7-9・8-16・10-9）は md・`initialData.ts`・詳細のキーとケース ID（`<項目 ID>-1` など）で一致する。
