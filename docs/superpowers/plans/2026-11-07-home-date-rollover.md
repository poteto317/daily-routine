# ホーム画面の日付ラベル・祝日フラグ・選択中の曜日の日またぎ 実装プラン（Issue #210）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-07-home-date-rollover-design.md`

**Goal:** ホーム画面を開いたまま 0 時をまたいだとき、日付ラベル・祝日フラグ・（利用者が自分で選んでいなければ）選択中の曜日のタブが、次の描画で新しい今日になるようにする。退行は Jest の日またぎの単体テストと、React Compiler を通す契約テストで防ぐ。

**Architecture:**

- 日付ラベルと祝日フラグは、`useHomeViewDateState`（`src/features/routine/hooks/`。本体の最初の文が `"use no memo"`）が `useState` を使わずに描画のたびに求める。呼ぶ側（コンパイルされる `useHomeViewState`）は戻り値の文字列・真偽値を依存として扱う。
- 選択中のタブは state `selectedViewMode: { mode: HomeViewMode | null }`（初期値 `{ mode: null }` =「今日に追従」）に持ち、表示するタブ `view.viewMode` は `useHomeViewControls` が描画のたびに `mode ?? 既定のタブ（描画時の isTodayHoliday・currentDayOfWeek から求める）` で求める。タブを押すと、`useHomeViewControlActions` の `useCallback` の本体（押した時点）で `getIsTodayHoliday()`・`toJstDay(new Date())` から既定のタブを求めて比べ、同じなら `{ mode: null }`、違えば `{ mode }` を**毎回新しいオブジェクトで**入れる（`null` のままでも再描画させる）。
- 契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` は、`"use no memo"` の確認を `{ file, name }` の組（`USE_NO_MEMO_TARGETS`）に一般化し、`TodayTarget` を `dependencies: string[]`・`hookCall?: string` にして、`useHomeViewState.ts`（`currentDate`・`isTodayHoliday` を追加）と `useHomeViewControls.ts`（`isTodayHoliday`・`currentDayOfWeek`）を確かめる。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効。`babel-plugin-react-compiler` 1.0.0）/ TypeScript 5.9.3 / Jest 30 + ts-jest（`isolatedModules: true`。型を検査しない）+ React Testing Library（jsdom）/ `@babel/core` 7.29.7

## 設計書との差異

プランを書く前に、関係ファイルを読み、scratchpad のリポジトリの複製でこのプランのコードを実際に書いて、テスト・変異・型検査・lint・コンパイル結果を確かめた。その結果、設計書と次の点を変える・確定する。

1. **`homeViewControlsResult.ts` とそのテストは変えない。** 設計書は変更の候補に挙げていたが、このファイルの `viewMode: HomeViewMode`・`setViewModeAction: (mode: HomeViewMode) => void` は新しい契約でもそのまま（表示するタブは `useHomeViewControls` で求めてから渡す）。setter の型（`Dispatch<SetStateAction<…>>`）を持つのは `homeViewControlRuntimeStateResult.ts` と `useHomeViewControlActions.ts`（と `homeViewStateActions.ts`・`homeViewStateHookActions.ts` の内部の型）だけ。
2. **選択中のタブの初期値を求める経路をなくす。** `createInitialHomeViewControlState`・`useHomeViewControlInitialState`・`useHomeViewControlState` の引数（`canUseWindow`・`currentDayOfWeek`・`getIsTodayHoliday`）は `viewMode` の初期値のためだけに使われていたので、すべて外す（引数なし）。初期 state は `{ filterCategory, isEditMode }` だけになり、`selectedViewMode` の初期値 `{ mode: null }` は `useHomeViewControlRuntimeState` の `useState` に直接書く。
3. **押した時点の既定のタブの渡し方（最小の形）。** `createSetHomeViewModeAction({ getDefaultViewMode: () => HomeViewMode, setSelectedViewMode })` とし、返す関数の本体で `getDefaultViewMode()` を呼ぶ。`getDefaultViewMode` は `useHomeViewControlActions` の `useCallback` の本体の中で `() => createDefaultHomeViewMode(canUseWindow, getIsTodayHoliday(), toJstDay(new Date()))` として作る（押した時点で求める。L-538）。そのため `useHomeViewControlActions` に `canUseWindow`・`getIsTodayHoliday` を渡す（`useHomeViewControls` から）。`useHomeViewControls` には `isTodayHoliday`（真偽値）を足す（`useHomeViewState` から）。`setViewModeAction` の依存は `[canUseWindow, getIsTodayHoliday, setSelectedViewMode]`（すべて安定した値なので、関数の同一性は今と同じく描画をまたいで保たれる）。
4. **関数名の確定:** `createInitialIsTodayHoliday` → `createIsTodayHoliday`（改名）。`createInitialHomeViewMode(canUseWindow, getIsTodayHoliday, currentDayOfWeek)` は削除し、`createDefaultHomeViewMode(canUseWindow: boolean, isTodayHoliday: boolean, currentDayOfWeek: number): HomeViewMode` と `resolveHomeViewMode(selectedViewMode: HomeSelectedViewMode, defaultViewMode: HomeViewMode): HomeViewMode` を足す。型 `HomeSelectedViewMode = { mode: HomeViewMode | null }` は `src/features/routine/pages/homeTypes.ts`（`HomeViewMode` の隣）に置く。`{ mode: null }` への切り替えは `setHomeViewModeState` の中に直接書く（切り替えだけの関数を export すると、テストからしか使われない export になる。L-311。試作の `find-unused-exports` 相当の確認で `TESTONLY` になった）。
5. **契約テストの形の確定:** `"use no memo"` の対象は `USE_NO_MEMO_TARGETS: { file: string; name: string }[]` として `TODAY_TARGETS` とは別の配列にし、`startsWithUseNoMemo(target: UseNoMemoTarget)` が組を受ける（`TODAY_HOOK_FILE`・`TODAY_HOOK_NAMES` はなくす）。検証 2(b) の対象は `src/features/routine/hooks/useHomeViewControls.ts`、変数は `isTodayHoliday`・`currentDayOfWeek`（試作のコンパイル結果で `$[11] !== isTodayHoliday`・`$[8] !== currentDayOfWeek` を確認。`getIsTodayHoliday()` に替えた変異では `!== isTodayHoliday` が消える）。`useHomeViewControlActions.ts` は対象にしない（`toJstDay(new Date())` はハンドラの本体の中で、そのブロックの依存は `canUseWindow`・`getIsTodayHoliday`・`setSelectedViewMode`。sentinel のブロックには入らない）。テストの件数は 23 → 30。
6. **変異 (b) は `"use no memo"` を残した形にする。** origin/main の `useHomeViewDateState.ts` には `"use no memo"` が無いので、そのまま戻すと検証 1 も落ちる。設計書の「契約テストは落ちない」を確かめるため、`useState` の形に戻したうえで本体の最初の文に `"use no memo"` を足した形で試す（試作で、契約テスト 30 件はすべて通り、日またぎの単体テスト 3 件だけが落ちた）。
7. **「`null` を素の `null` にする」変異の形。** 型を何か所も変えずに同じ挙動にするため、`useHomeViewControlRuntimeState.ts` の setter を「前が `mode: null` で次も `mode: null` なら前の値（同じオブジェクト）を入れる」包みに替える（React は同じ値として描画を捨てる。素の `null` から `null` への更新と同じ）。試作で (e) の 4 件だけが落ちた（「`{ mode: null }` のまま押す」2 件と、押した直後の値を見る 2 件）。
8. **(d)（`canUseWindow` が false）は単体のテストで確かめる。** jsdom では `window` があるので `useHomeViewState` を通して `canUseWindow` を false にできない。`createDefaultHomeViewMode`（Task 1）、`useHomeViewControls`（Task 3。描画時の既定）、`useHomeViewControlActions`（Task 3。押した時点の既定）のテストで確かめる。
9. **ルーティン追加フォームの既定の曜日の配線:** `createHomeRoutineFormProps` が `resolveHomeRoutineFormDay(data.view.viewMode)` を渡すことは既存の `src/features/routine/pages/__tests__/pageViewModelActions.test.ts` が確かめている。新しいテストでは、本物の `useHomeViewState` の戻り値 `result.current.viewMode` を `resolveHomeRoutineFormDay` に通し、日をまたいだあとに新しい今日（祝日なら `HOLIDAY_DAY_VALUE` = 7）になることを確かめる。
10. **テストに使う祝日:** 2026-11-03（火）文化の日（`FIXED_HOLIDAYS["11-03"]`）。前後の 11-02（月）・11-04（水）・11-05（木）・11-06（金）は祝日でない。日付ラベルは `TZ=Asia/Tokyo` で `2026年11月2日月曜日`・`2026年11月3日火曜日`・`2026年11月4日水曜日`（node で確認）。手動確認には、これから行える日として 2026-11-22（日）→ 11-23（月・勤労感謝の日）→ 11-24（火）と、2027-01-10（日）→ 01-11（月・成人の日。1 月の第 2 月曜）→ 01-12（火）を使う。
11. 設計書の行番号・関数名はコードと一致した（`useHomeViewDateState.ts` の `useState` 2 つ、`useHomeViewControlInitialState.ts`・`homeViewControlStateActions.ts` の `createInitialHomeViewMode`、`pageViewModelActions.ts:67` の `resolveHomeRoutineFormDay(data.view.viewMode)`、`useHomeViewState.test.tsx:59-60`・`useHomeViewState.today.test.tsx:37-38` のコメントと期待、`test-matrix.md` の 2-29 の備考、`group-01-04.ts` の `2-29-1` の `expected`）。`coding-standards.md` の「最終更新日」は既に `2026年11月7日` なので変えない。

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**気をつける知見（`<dev-flow-kit>/lessons/review-lessons.md`）**

- L-538: 描画時の今日をハンドラに持たせない。`setViewModeAction` は押した時点（`useCallback` の本体の中）で `getIsTodayHoliday()`・`toJstDay(new Date())` を呼んで既定のタブを求める。テストは「前日に描画し、再描画せずに時計を進めてから押す」（Task 3 の (e)）。ハンドラが描画時の既定のタブを使う形に一時的に戻すと (e) だけが落ちることを確かめる（Task 3 Step 6）。
- L-690: React Compiler の挙動は、コンパイラを通さない Jest で確かめたつもりにならない。契約テストは「コンパイルされている（`_c(`）」の前提確認で空振りを防ぎ、変異（ディレクティブを外す・描画時の呼び出しに戻す）で実際に落ちることを確かめる（Task 4 Step 4〜5）。逆に `useState` の初期値に戻す退行はコンパイラと関係なく起こるので、日またぎの単体テストが捕まえる（契約テストは落ちない）ことも確かめる。
- L-368: 手動確認の手順は、確かめたい状態を実際に作れる順番・前提（端末のタイムゾーンが日本、月末・年末をまたがない日、始める前にページを再読み込みしてタブを押していない状態にする）・押すものを具体的に書き、期待結果の文字は画面に出る文字（「2026年11月23日月曜日」「🎌 祝日」「新しいルーティン」「曜日・祝日 \*」「祝」）と同じにする（Task 5）。
- L-060: 配線を確かめる。`useHomeViewState` が日付ラベル・祝日フラグ・表示するタブを `view` に渡すこと、`useHomeViewControls` が `isTodayHoliday`・`currentDayOfWeek` を表示するタブに、`canUseWindow`・`getIsTodayHoliday` を `useHomeViewControlActions` に渡すことを、本物のフックのテストとモックの合成テストの両方で確かめる。
- L-686: ハンドラ（`setViewModeAction` など）を呼ぶテストは、子フックをモックしていても `act()` で囲む。既存のテストで `setViewModeAction` を呼ぶもの（`useHomeViewState.test.tsx` の localStorage のテスト、`useHomeViewControlActions.test.tsx`）は既に `act()` の中。新しいテストもすべて `act()` で囲む。テストの出力に `not wrapped in act` が出ないことを確かめる。
- L-685: このプランは共有の入力状態に書く入口を足さない（ルーティン追加フォームの既定の曜日は、今までどおり `view.viewMode` から下流で求める）。
- L-309: 見た目の重複だけで分割・共通化しない。`createDefaultHomeViewMode` は描画時（`useHomeViewControls`）と押した時点（`useHomeViewControlActions`）の両方で使うので 1 つの関数にする。`{ mode: null }` への切り替えは 1 か所でしか使わないので関数に分けない。
- L-311: 変更で使われなくなった export・引数を残さない（`createInitialHomeViewMode`・`createInitialIsTodayHoliday` の名前、`useHomeViewControlInitialState` などの引数）。最終タスクで `node <dev-flow-kit>/scripts/node/find-unused-exports.mjs --base origin/main` を実行し、このプランで足した・変えた export が `UNUSED`・`TESTONLY` に出ないことを確かめる（`homeTypes.ts` の `HomeDisplayState`・`HomeCrudState`・`HomeRoutineOps`・`HomePageNavigationState` は元から `UNUSED` で、範囲外）。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（**コミットしない。** コミットは後の `commit-ja` が行う）。
- `git add`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない。
- `.claude/`・`.superpowers/` は触らない。ただし、変異の確認の結果は `.superpowers/sdd/2026-11-07-home-date-rollover/` の各タスクの報告（サブエージェント駆動開発の流れで書く報告）に書く（設計書「契約テスト › 変異の確認」）。
- 実装を一時的に壊す確認は、次の順で行う（Task 3 Step 6・Task 4 Step 4〜5 のスクリプトはこれを内蔵している）。
  1. バックアップ: `BK=".git/worktrees/issue-210-home-date/home-date-backup" && mkdir -p "$BK" && cp <対象> "$BK/"`
  2. 一時的に書き換えてテストを実行し、落ちることを確かめる（各 Step の `python3` は、置換する文字列がちょうど 1 回あることを `assert` で確かめ、`finally` で元に戻す）。
  3. 元に戻す: `BK="…（同じ）" && cp "$BK/<ファイル名>" <対象>`
  4. 一致を確かめる: `BK="…（同じ）" && cmp "$BK/<ファイル名>" <対象>`（出力なし・exit 0）
  - バックアップの置き場所はワークツリーの git の管理ディレクトリの中なので、作業ツリーにも `git status` にも出ない。Bash の呼び出しごとに変数は消えるので、毎回 `BK="…"` を付ける。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。
- `node_modules` は主チェックアウト（`node_modules`）へのシンボリックリンク。そのまま使う（`npm install` もしない）。
- `.env.local` や秘密の値を読む・書く・作らない。`npm --prefix firebase-functions run build` を実行しない。
- Bash では毎回 `cd .worktrees/issue-210-home-date &&` を付ける。Read・Edit・Write には絶対パスを使う。
- 既存ファイルの一部を書き換える Step のコード片（「次の部分を」「次にする」の組）は `text` のコードブロックで、字下げを含めてファイルのとおり。そのまま Edit の置換に使える。ファイル全体・新規ファイルは `ts`・`tsx` のコードブロック。
- 各タスクの Step の最後に、そのタスクで変更したファイルだけに `npx prettier --write` をかけてから `--check` する（コード片の折り返しが prettier と 1 文字違っても、ここで揃う）。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外され、`npm test` が 0 件になる。Jest は必ず次の形で実行する。
  - `NODE_ENV=test TZ=Asia/Tokyo npx jest <テストのパス…> --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
  - テストのパスは除外オプションの**前**に置く（後ろに置くと、パスも除外パターンになって 0 件になる）。
  - `npm test` を使う場合は `NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'`。`npm test` は `cross-env TZ=Asia/Tokyo` 固定。`npx jest` で日付のテストを流すときは `TZ=Asia/Tokyo` も付ける（下の各 Step のコマンドは付けてある）。
  - 毎回、出力の `Tests:` の件数が 0 でないことを確かめる（`No tests found` は失敗として扱う）。
- ts-jest は型を検査しない（`tsconfig.json` の `isolatedModules: true`）。**各タスクの最後に** `npm run typecheck`・`npm run lint`・`npx prettier --check <そのタスクで変更したファイル>` を実行する。
- 日付のテストは `+09:00` 付きの固定時刻を `jest.useFakeTimers().setSystemTime(...)` で設定し、`afterEach` で `jest.useRealTimers()` に戻す。
- 作業前の基準（2026-11-07、origin/main d1a04df のこのワークツリー）: 全体の `npm test`（上の除外の上書き付き）で `Test Suites: 1340 passed, 1340 total`・`Tests: 6977 passed, 6977 total`。
  - 作業後の判定: `FAIL` が無い・`failed` が無い、`Test Suites: 1341 passed`（新規 1 本 `useHomeViewState.viewMode.test.tsx`）・`Tests: 7012 passed`（35 件増。試作の複製で、`src/features/routine` と契約テストの範囲が 159 本・597 件 → 160 本・631 件、`src/features/test-matrix` が 313 件 → 314 件になることを確認済み）。
  - 全体実行で、無関係なスイートが `A jest worker process (pid=…) was terminated by another process: signal=SIGSEGV` で落ちることがある（`Tests:` に `failed` は出ず、そのスイートの件数だけ減る）。落ちたらそのファイルだけを単独で実行して通ることを確かめ、報告に書く。
- lint は `@typescript-eslint/consistent-type-imports`（型だけの import は `import type`）に従う。

**コードの規則（`docs/02-development/coding-standards.md`・`.github/copilot-instructions.md`）**

- コメント・JSDoc・テスト名は日本語。
- `src/hooks/` は `src/features/` を import しない。`useHomeViewDateState` は祝日の判定（機能側の `getIsTodayHoliday`）を呼ぶので、`src/features/routine/hooks/` に置いたまま `"use no memo"` を足す。
- タイムゾーンの基準は今のまま（日付ラベルは端末ローカルの `toLocaleDateString`、祝日と曜日は JST。設計書「既知の制約と懸念」4）。
- 変えないもの: 保存の書き込み（`saveViewMode(mode)` は押したタブの値をそのまま保存する）、保存した `viewMode` の読み出し（`getStoredViewMode` は使わないまま。範囲外）、0 時の自動再描画（作らない）、`useHomeViewSortedDays`・`createSortedDaysAndHoliday`、`homeViewControlsResult.ts`。

---

## ファイルの構成

| ファイル                                                                                                                                                                                                                                                                                                                                                                                             | 種類 | 責務                                                                                                                                                                              | タスク  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `src/features/routine/pages/homeTypes.ts`                                                                                                                                                                                                                                                                                                                                                            | 変更 | 型 `HomeSelectedViewMode` を足す                                                                                                                                                  | 1       |
| `src/features/routine/hooks/homeViewStateActions.ts`                                                                                                                                                                                                                                                                                                                                                 | 変更 | `createDefaultHomeViewMode`・`resolveHomeViewMode` を足す（1）、`createIsTodayHoliday` に改名（2）、`createInitialHomeViewMode` を消し `setHomeViewModeState` を新しい契約に（3） | 1・2・3 |
| `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`                                                                                                                                                                                                                                                                                                                                  | 変更 | 上の純粋関数のテスト                                                                                                                                                              | 1・2・3 |
| `src/features/routine/hooks/useHomeViewDateState.ts`                                                                                                                                                                                                                                                                                                                                                 | 変更 | 日付ラベル・祝日フラグを描画のたびに求める（`"use no memo"`）                                                                                                                     | 2       |
| `src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx`                                                                                                                                                                                                                                                                                                                                 | 変更 | 時計に連動する祝日の判定で、平日→祝日・祝日→平日の日またぎ                                                                                                                        | 2       |
| `src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`                                                                                                                                                                                                                                                                                                                                     | 変更 | 日付ラベル・祝日フラグの配線（2）、59 行付近の期待を新しい契約に（3）                                                                                                             | 2・3    |
| `src/features/routine/hooks/homeViewStateHookActions.ts`                                                                                                                                                                                                                                                                                                                                             | 変更 | `createSetHomeViewModeAction` が押すたびに `getDefaultViewMode()` を呼ぶ                                                                                                          | 3       |
| `src/features/routine/hooks/homeViewControlStateActions.ts`・`useHomeViewControlInitialState.ts`・`useHomeViewControlState.ts`                                                                                                                                                                                                                                                                       | 変更 | 選択中のタブの初期値をなくし、引数を外す                                                                                                                                          | 3       |
| `src/features/routine/hooks/useHomeViewControlRuntimeState.ts`・`homeViewControlRuntimeStateResult.ts`                                                                                                                                                                                                                                                                                               | 変更 | state `selectedViewMode`（初期値 `{ mode: null }`）と `setSelectedViewMode`                                                                                                       | 3       |
| `src/features/routine/hooks/useHomeViewControlActions.ts`                                                                                                                                                                                                                                                                                                                                            | 変更 | 押した時点の既定のタブを返す関数をハンドラの本体で作って渡す                                                                                                                      | 3       |
| `src/features/routine/hooks/useHomeViewControls.ts`                                                                                                                                                                                                                                                                                                                                                  | 変更 | 表示するタブ = `mode ?? 描画時の既定のタブ`                                                                                                                                       | 3       |
| `src/features/routine/hooks/useHomeViewState.ts`                                                                                                                                                                                                                                                                                                                                                     | 変更 | `useHomeViewControls` に `isTodayHoliday` を渡す                                                                                                                                  | 3       |
| `src/features/routine/hooks/__tests__/`（`homeViewStateHookActions.test.ts`・`homeViewControlStateActions.test.ts`・`useHomeViewControlInitialState.test.tsx`・`useHomeViewControlRuntimeState.test.tsx`・`homeViewControlRuntimeStateResult.test.ts`・`useHomeViewControlState.test.tsx`・`useHomeViewControlActions.test.tsx`・`useHomeViewControls.test.tsx`・`useHomeViewState.today.test.tsx`） | 変更 | 新しい契約に合わせる                                                                                                                                                              | 3       |
| `src/features/routine/hooks/__tests__/useHomeViewState.viewMode.test.tsx`                                                                                                                                                                                                                                                                                                                            | 新規 | 選択中のタブの日またぎ (a)(b)(c)(e)(f)・ルーティン追加フォームの既定の曜日                                                                                                        | 3       |
| `src/__tests__/reactCompilerToday.contract.test.ts`                                                                                                                                                                                                                                                                                                                                                  | 変更 | `USE_NO_MEMO_TARGETS`・`dependencies`・`hookCall?`、対象の追加                                                                                                                    | 4       |
| `docs/02-development/coding-standards.md`                                                                                                                                                                                                                                                                                                                                                            | 変更 | 「React Compiler と今日・現在時刻」の追記・レビューの観点                                                                                                                         | 5       |
| `docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts`                                                                                                                                                                                                                                                           | 変更 | 2-29 の制約の記述を消す・2-30 を足す                                                                                                                                              | 5       |

タスクの順と依存: Task 1 → Task 2 → Task 3 → Task 4 → Task 5。各タスクの終わりに `npm run typecheck`・`npm run lint` とそのタスクのテストが通る（試作で、Task 2 の終わりの時点でも既存のテストはすべて通ることを確認した。Task 2 と 3 の間で一時的に落ちるテストは無い）。

---

## Task 1: 既定のタブ・表示するタブを求める純粋関数

**Files:**

- Modify: `src/features/routine/pages/homeTypes.ts:5`（`HomeViewMode` の直後に型を足す）
- Modify: `src/features/routine/hooks/homeViewStateActions.ts:3,48`（import と、`createSortedDaysAndHoliday` の前に 2 関数）
- Test: `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`

**Interfaces:**

- Consumes: `HomeViewMode = "holiday" | number`（`homeTypes.ts`）
- Produces（Task 3 が使う）:
  - `export type HomeSelectedViewMode = { mode: HomeViewMode | null }`（`src/features/routine/pages/homeTypes.ts`）
  - `createDefaultHomeViewMode(canUseWindow: boolean, isTodayHoliday: boolean, currentDayOfWeek: number): HomeViewMode` — `canUseWindow` が false なら `currentDayOfWeek`、そうでなければ `isTodayHoliday ? "holiday" : currentDayOfWeek`
  - `resolveHomeViewMode(selectedViewMode: HomeSelectedViewMode, defaultViewMode: HomeViewMode): HomeViewMode` — `selectedViewMode.mode ?? defaultViewMode`（`mode: 0`（日曜）は選んだタブとして扱う）
  - （このタスクの時点では、どちらも本体のコードからはまだ使われない。Task 3 で使う）

- [ ] **Step 1: 落ちるテストを書く**

`src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`

次の部分を

```text
import {
  createHomeCurrentDateLabel,
  createInitialHomeViewMode,
  createInitialIsTodayHoliday,
  createSortedDaysAndHoliday,
  setHomeFilterCategoryState,
  setHomeViewModeState,
  toggleHomeEditModeState,
} from "../homeViewStateActions";
```

次にする

```text
import {
  createDefaultHomeViewMode,
  createHomeCurrentDateLabel,
  createInitialHomeViewMode,
  createInitialIsTodayHoliday,
  createSortedDaysAndHoliday,
  resolveHomeViewMode,
  setHomeFilterCategoryState,
  setHomeViewModeState,
  toggleHomeEditModeState,
} from "../homeViewStateActions";
```

次の部分を

```text
  it("曜日並びを作る", () => {
```

次にする

```text
  it("既定のタブは、祝日なら holiday、そうでなければ今日の曜日（window が無いときは今日の曜日）", () => {
    expect(createDefaultHomeViewMode(true, false, 6)).toBe(6);
    expect(createDefaultHomeViewMode(true, true, 6)).toBe("holiday");
    expect(createDefaultHomeViewMode(false, true, 6)).toBe(6);
    expect(createDefaultHomeViewMode(false, false, 0)).toBe(0);
  });

  it("表示するタブは、選んだタブがあればそれ、無ければ（mode が null）既定のタブ", () => {
    expect(resolveHomeViewMode({ mode: null }, 3)).toBe(3);
    expect(resolveHomeViewMode({ mode: null }, "holiday")).toBe("holiday");
    expect(resolveHomeViewMode({ mode: 5 }, 3)).toBe(5);
    expect(resolveHomeViewMode({ mode: "holiday" }, 3)).toBe("holiday");
    // 日曜（0）は falsy だが、選んだタブとして扱う
    expect(resolveHomeViewMode({ mode: 0 }, 3)).toBe(0);
  });

  it("曜日並びを作る", () => {
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-210-home-date && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/routine/hooks/__tests__/homeViewStateActions.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL（`Tests: 2 failed, 4 passed, 6 total`。`TypeError: (0 , _homeViewStateActions.createDefaultHomeViewMode) is not a function` と `… resolveHomeViewMode) is not a function`）

- [ ] **Step 3: 実装する**

(a) `src/features/routine/pages/homeTypes.ts`

次の部分を

```text
export type HomeViewMode = "holiday" | number;
```

次にする

```text
export type HomeViewMode = "holiday" | number;

/**
 * 利用者が自分で選んだ曜日のタブ。`mode` が `null` なら「今日に追従」（既定のタブを表示する）。
 * タブを押すたびに新しいオブジェクトを入れ、`null` のままでも必ず再描画させる。
 */
export type HomeSelectedViewMode = { mode: HomeViewMode | null };
```

(b) `src/features/routine/hooks/homeViewStateActions.ts`

次の部分を

```text
import type { HomeDayOption, HomeViewMode } from "../pages/homeTypes";
```

次にする

```text
import type {
  HomeDayOption,
  HomeSelectedViewMode,
  HomeViewMode,
} from "../pages/homeTypes";
```

次の部分を

```text
export const createSortedDaysAndHoliday = (params: {
```

次にする

```text
/** 既定のタブ: 今日が祝日なら「祝日」、そうでなければ今日の曜日（window が無いときは今日の曜日） */
export const createDefaultHomeViewMode = (
  canUseWindow: boolean,
  isTodayHoliday: boolean,
  currentDayOfWeek: number,
): HomeViewMode => {
  if (!canUseWindow) {
    return currentDayOfWeek;
  }

  return isTodayHoliday ? "holiday" : currentDayOfWeek;
};

/** 表示するタブ: 利用者が選んだタブ。選んでいなければ（`mode` が `null`）既定のタブ */
export const resolveHomeViewMode = (
  selectedViewMode: HomeSelectedViewMode,
  defaultViewMode: HomeViewMode,
): HomeViewMode => {
  return selectedViewMode.mode ?? defaultViewMode;
};

export const createSortedDaysAndHoliday = (params: {
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド
Expected: PASS（`Tests: 6 passed, 6 total`）

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-210-home-date && npx prettier --write src/features/routine/pages/homeTypes.ts src/features/routine/hooks/homeViewStateActions.ts src/features/routine/hooks/__tests__/homeViewStateActions.test.ts && npm run typecheck && npm run lint && npx prettier --check src/features/routine/pages/homeTypes.ts src/features/routine/hooks/homeViewStateActions.ts src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`
Expected: すべて exit 0（`All matched files use Prettier code style!`）

（コミットしない）

---

## Task 2: 日付ラベル・祝日フラグを描画のたびに求める

**Files:**

- Modify: `src/features/routine/hooks/useHomeViewDateState.ts`（全体）
- Modify: `src/features/routine/hooks/homeViewStateActions.ts:25`（`createInitialIsTodayHoliday` → `createIsTodayHoliday`）
- Test: `src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx`（全体を書き換え）
- Test: `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`（改名に合わせる）
- Test: `src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`（配線のテストを足す）

**Interfaces:**

- Consumes: `createHomeCurrentDateLabel(canUseWindow: boolean, now?: Date): string`（変えない）。テストだけが `isHoliday(date: Date): boolean`（`@/lib/holidays`）・`getJstToday(): Date`（`@/lib/storage/core`）を使う（`useRoutineQueries` の `getIsTodayHoliday` と同じ式 `() => isHoliday(getJstToday())`）。
- Produces（Task 3・4 が使う）:
  - `createIsTodayHoliday(canUseWindow: boolean, getIsTodayHoliday: () => boolean): boolean`（中身は今の `createInitialIsTodayHoliday` と同じ。`canUseWindow` が false なら判定関数を呼ばずに false）
  - `useHomeViewDateState({ canUseWindow, getIsTodayHoliday }): { currentDate: string; isTodayHoliday: boolean }` — 形は `export const useHomeViewDateState = ({ … }: UseHomeViewDateStateParams) => { "use no memo"; … }`（Task 4 の契約テストが、この関数の本体の最初の文を構文木で読む。ディレクティブより前に文を置かない。JSDoc は前に置いてよい）
  - 戻り値の変数名 `currentDate`・`isTodayHoliday` は `useHomeViewState.ts` で変えない（Task 4 の契約テストが `$[n] !== currentDate`・`$[n] !== isTodayHoliday` を探す）

- [ ] **Step 1: 落ちるテストを書く**

(a) `src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx` を全体で次にする。

```tsx
import { renderHook } from "@testing-library/react";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { useHomeViewDateState } from "../useHomeViewDateState";

// 祝日の判定は本物と同じく時計に連動させる（useRoutineQueries の getIsTodayHoliday と同じ式）。
// 固定の値を返すスタブでは、日をまたいだ後に新しい今日で判定し直していることを確かめられない
const getIsTodayHoliday = () => isHoliday(getJstToday());

describe("useHomeViewDateState", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("window 利用可なら今日の日付ラベルと祝日フラグを返す", () => {
    // 2026-11-03 は文化の日（火曜）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );

    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);
  });

  it("window 利用不可なら空の日付ラベルと false を返し、祝日の判定関数を呼ばない", () => {
    const getIsTodayHolidayMock = jest.fn(() => true);

    const { result } = renderHook(() =>
      useHomeViewDateState({
        canUseWindow: false,
        getIsTodayHoliday: getIsTodayHolidayMock,
      }),
    );

    expect(result.current.currentDate).toBe("");
    expect(result.current.isTodayHoliday).toBe(false);
    expect(getIsTodayHolidayMock).not.toHaveBeenCalled();
  });

  it("平日から祝日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが true になる", () => {
    // 2026-11-02（月）は平日、2026-11-03（火）は文化の日
    jest.useFakeTimers().setSystemTime(new Date("2026-11-02T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );
    expect(result.current.currentDate).toBe("2026年11月2日月曜日");
    expect(result.current.isTodayHoliday).toBe(false);

    jest.setSystemTime(new Date("2026-11-03T00:01:00+09:00"));
    rerender();

    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);
  });

  it("祝日から平日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが false になる", () => {
    // 2026-11-03（火）は文化の日、2026-11-04（水）は平日
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewDateState({ canUseWindow: true, getIsTodayHoliday }),
    );
    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);

    jest.setSystemTime(new Date("2026-11-04T00:01:00+09:00"));
    rerender();

    expect(result.current.currentDate).toBe("2026年11月4日水曜日");
    expect(result.current.isTodayHoliday).toBe(false);
  });
});
```

(b) `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`

次の部分を

```text
  createInitialHomeViewMode,
  createInitialIsTodayHoliday,
  createSortedDaysAndHoliday,
```

次にする

```text
  createInitialHomeViewMode,
  createIsTodayHoliday,
  createSortedDaysAndHoliday,
```

次の部分を

```text
  it("初期ラベルと祝日 state を作る", () => {
    expect(createHomeCurrentDateLabel(false)).toBe("");
    expect(
      createHomeCurrentDateLabel(true, new Date("2026-03-07T12:00:00+09:00")),
    ).toContain("2026");

    expect(createInitialIsTodayHoliday(false, () => true)).toBe(false);
    expect(createInitialIsTodayHoliday(true, () => true)).toBe(true);
  });
```

次にする

```text
  it("日付ラベルと祝日フラグを作る", () => {
    expect(createHomeCurrentDateLabel(false)).toBe("");
    expect(
      createHomeCurrentDateLabel(true, new Date("2026-03-07T12:00:00+09:00")),
    ).toContain("2026");

    expect(createIsTodayHoliday(false, () => true)).toBe(false);
    expect(createIsTodayHoliday(true, () => true)).toBe(true);
  });
```

(c) `src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`（配線: 日付ラベル・祝日フラグが `view` まで届く。L-060）

次の部分を

```text
import { act, renderHook } from "@testing-library/react";
import { useHomeViewState } from "../useHomeViewState";
```

次にする

```text
import { act, renderHook } from "@testing-library/react";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { useHomeViewState } from "../useHomeViewState";

// 本物（useRoutineQueries）と同じく時計に連動する祝日の判定
const getIsTodayHoliday = () => isHoliday(getJstToday());
```

次の部分を

```text
  it("setFilterCategoryAction/setViewModeAction/toggleEditModeActionでlocalStorageを更新する", () => {
```

次にする

```text
  it("平日から祝日へ日をまたいだ後の再描画で、日付ラベル・祝日フラグ・「祝日」タブの位置が新しい今日になる", () => {
    // 2026-11-02（月）は平日、2026-11-03（火）は文化の日
    jest.useFakeTimers().setSystemTime(new Date("2026-11-02T23:59:00+09:00"));
    const { result, rerender } = renderHook(() =>
      useHomeViewState(getIsTodayHoliday),
    );
    expect(result.current.currentDate).toBe("2026年11月2日月曜日");
    expect(result.current.isTodayHoliday).toBe(false);
    expect(result.current.sortedDaysAndHoliday[0]).toEqual(
      expect.objectContaining({ value: 1 }),
    );
    expect(result.current.sortedDaysAndHoliday.at(-1)).toBe("holiday");

    jest.setSystemTime(new Date("2026-11-03T00:01:00+09:00"));
    rerender();

    expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    expect(result.current.isTodayHoliday).toBe(true);
    expect(result.current.sortedDaysAndHoliday[0]).toBe("holiday");
    expect(result.current.sortedDaysAndHoliday[1]).toEqual(
      expect.objectContaining({ value: 2 }),
    );
  });

  it("setFilterCategoryAction/setViewModeAction/toggleEditModeActionでlocalStorageを更新する", () => {
```

（このタスクでは、`useHomeViewState.test.tsx` の「日をまたいだ後の再描画で、曜日の並び順の先頭…」の `expect(result.current.viewMode).toBe(5)` はまだ変えない。選択中のタブは Task 3 で直す。）

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-210-home-date && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx src/features/routine/hooks/__tests__/homeViewStateActions.test.ts src/features/routine/hooks/__tests__/useHomeViewState.test.tsx --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。次が落ちる（他は通る）:

- `useHomeViewDateState.test.tsx`: 「平日から祝日へ…」「祝日から平日へ…」の 2 件（`Expected: "2026年11月3日火曜日"` / `Received: "2026年11月2日月曜日"` など。`useState` の初期値のまま）
- `homeViewStateActions.test.ts`: 「日付ラベルと祝日フラグを作る」（`createIsTodayHoliday is not a function`）
- `useHomeViewState.test.tsx`: 「平日から祝日へ日をまたいだ後の再描画で、日付ラベル・祝日フラグ・「祝日」タブの位置が新しい今日になる」

これが `useState` の初期値に戻す退行を捕まえるテスト（コンパイラを通さなくても、修正前の形で落ちる）。

- [ ] **Step 3: 実装する**

(a) `src/features/routine/hooks/homeViewStateActions.ts`

次の部分を

```text
export const createInitialIsTodayHoliday = (
```

次にする

```text
/** 今日が祝日か（window が無いときは false。祝日の判定関数を呼ばない） */
export const createIsTodayHoliday = (
```

(b) `src/features/routine/hooks/useHomeViewDateState.ts` を全体で次にする。

```ts
import {
  createHomeCurrentDateLabel,
  createIsTodayHoliday,
} from "./homeViewStateActions";

type UseHomeViewDateStateParams = {
  canUseWindow: boolean;
  getIsTodayHoliday: () => boolean;
};

/**
 * 今日の日付ラベルと、今日が祝日かどうか。描画のたびに求める（useState の初期値にすると、
 * 日をまたいでも最初の描画の日のまま残る。#210）。
 * 祝日の判定（機能側の関数）を呼ぶため、共通フック（src/hooks/useToday.ts）ではなくここに置き、
 * React Compiler の自動メモ化から外す（"use no memo"。本体の最初の文に置く。
 * src/__tests__/reactCompilerToday.contract.test.ts の USE_NO_MEMO_TARGETS が確かめる）。
 */
export const useHomeViewDateState = ({
  canUseWindow,
  getIsTodayHoliday,
}: UseHomeViewDateStateParams) => {
  "use no memo";
  return {
    currentDate: createHomeCurrentDateLabel(canUseWindow),
    isTodayHoliday: createIsTodayHoliday(canUseWindow, getIsTodayHoliday),
  };
};
```

（この関数はフックを呼ばないので `"use no memo"` が無くてもコンパイラの対象にならないが、将来フックを呼ぶ形に変わったときの保険として置く。設計書「日付ラベルと祝日フラグ」。）

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド
Expected: PASS（`Tests: 15 passed, 15 total`。`useHomeViewDateState` 4 件・`homeViewStateActions` 6 件・`useHomeViewState` 5 件）

続けて、ホームの既存のテスト全体が通ることを確かめる（Task 2 と 3 の間で落ちるテストが無いこと）:

Run: `cd .worktrees/issue-210-home-date && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/routine src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`FAIL` が無い）

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-210-home-date && grep -rn "createInitialIsTodayHoliday" src; npx prettier --write src/features/routine/hooks/useHomeViewDateState.ts src/features/routine/hooks/homeViewStateActions.ts src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx src/features/routine/hooks/__tests__/homeViewStateActions.test.ts src/features/routine/hooks/__tests__/useHomeViewState.test.tsx && npm run typecheck && npm run lint && npx prettier --check src/features/routine/hooks/useHomeViewDateState.ts src/features/routine/hooks/homeViewStateActions.ts src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx src/features/routine/hooks/__tests__/homeViewStateActions.test.ts src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`
Expected: `grep` は何も出さない（旧名が残っていない）。残りはすべて exit 0。

（コミットしない）

---

## Task 3: 選択中のタブ（「今日に追従」と、押した時点の既定のタブとの比較）

**Files:**

- Modify: `src/features/routine/hooks/homeViewStateActions.ts`（`SetViewMode` の型・`createInitialHomeViewMode` の削除・`setHomeViewModeState`）
- Modify: `src/features/routine/hooks/homeViewStateHookActions.ts`（import・型・`createSetHomeViewModeAction`）
- Modify（全体）: `src/features/routine/hooks/homeViewControlStateActions.ts`・`useHomeViewControlInitialState.ts`・`useHomeViewControlRuntimeState.ts`・`homeViewControlRuntimeStateResult.ts`・`useHomeViewControlState.ts`・`useHomeViewControlActions.ts`・`useHomeViewControls.ts`
- Modify: `src/features/routine/hooks/useHomeViewState.ts:15-19`（`isTodayHoliday` を渡す）
- Test（全体を書き換え）: `src/features/routine/hooks/__tests__/homeViewControlStateActions.test.ts`・`useHomeViewControlInitialState.test.tsx`・`useHomeViewControlRuntimeState.test.tsx`・`homeViewControlRuntimeStateResult.test.ts`・`useHomeViewControlState.test.tsx`・`useHomeViewControlActions.test.tsx`・`useHomeViewControls.test.tsx`
- Test（一部）: `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`・`homeViewStateHookActions.test.ts`・`useHomeViewState.test.tsx:59-60`・`useHomeViewState.today.test.tsx:37-38`
- Create: `src/features/routine/hooks/__tests__/useHomeViewState.viewMode.test.tsx`

**Interfaces:**

- Consumes: Task 1 の `HomeSelectedViewMode`・`createDefaultHomeViewMode`・`resolveHomeViewMode`。Task 2 の `useHomeViewDateState` の戻り値 `isTodayHoliday`。`toJstDay(date: Date): number`（`@/lib/storage/core`）。`resolveHomeRoutineFormDay(viewMode): number`（`src/features/routine/pages/pageViewModelActions.ts`。テストだけ）・`HOLIDAY_DAY_VALUE`（`@/types/routine`。値 7。テストだけ）。
- Produces（Task 4 が使う。名前を変えない）:
  - `setHomeViewModeState(params: { mode: HomeViewMode; defaultViewMode: HomeViewMode; setSelectedViewMode: Dispatch<SetStateAction<HomeSelectedViewMode>>; saveViewMode: (mode: HomeViewMode) => void }): void` — `setSelectedViewMode({ mode: mode === defaultViewMode ? null : mode })`（毎回新しいオブジェクト）と `saveViewMode(mode)`
  - `createSetHomeViewModeAction(params: { getDefaultViewMode: () => HomeViewMode; setSelectedViewMode }): (mode: HomeViewMode) => void` — 返す関数の本体で `getDefaultViewMode()` を呼ぶ（作った時点では呼ばない）
  - `createInitialHomeViewControlState(): { filterCategory: RoutineCategory | "all"; isEditMode: boolean }`（引数なし）
  - `useHomeViewControlInitialState(): { filterCategory; isEditMode }`（引数なし）
  - `useHomeViewControlRuntimeState(initialState): { filterCategory; isEditMode; selectedViewMode: HomeSelectedViewMode; setFilterCategory; setIsEditMode; setSelectedViewMode: Dispatch<SetStateAction<HomeSelectedViewMode>> }`
  - `createHomeViewControlRuntimeStateResult({ filterCategory, isEditMode, selectedViewMode, setFilterCategory, setIsEditMode, setSelectedViewMode })`（同じ 6 つを返す）
  - `useHomeViewControlState()`（引数なし。`useHomeViewControlRuntimeState` の戻り値をそのまま返す）
  - `useHomeViewControlActions({ canUseWindow: boolean; getIsTodayHoliday: () => boolean; isEditMode; setFilterCategory; setIsEditMode; setSelectedViewMode })` — `setViewModeAction` は `useCallback` の本体で `createSetHomeViewModeAction({ getDefaultViewMode: () => createDefaultHomeViewMode(canUseWindow, getIsTodayHoliday(), toJstDay(new Date())), setSelectedViewMode })(mode)`、依存 `[canUseWindow, getIsTodayHoliday, setSelectedViewMode]`
  - `useHomeViewControls({ canUseWindow: boolean; currentDayOfWeek: number; getIsTodayHoliday: () => boolean; isTodayHoliday: boolean })` — 戻り値の形は今と同じ（`createHomeViewControlsResult` に `viewMode = resolveHomeViewMode(selectedViewMode, createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek))` を渡す）。ソースの式 `createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek),` は 1 行のまま（Task 4 の変異のスクリプトがこの文字列を置換する）
  - 削除: `createInitialHomeViewMode`（`homeViewStateActions.ts`）
  - 変えない: `homeViewControlsResult.ts`・`HomeViewState`（`viewMode: HomeViewMode`・`setViewModeAction: (mode: HomeViewMode) => void`）

- [ ] **Step 1: 落ちるテストを書く（既存のテストの書き換え）**

(a) `src/features/routine/hooks/__tests__/homeViewStateActions.test.ts`

次の部分を

```text
  createInitialHomeViewMode,
  createIsTodayHoliday,
```

次にする

```text
  createIsTodayHoliday,
```

次の部分を

```text
  it("初期 view mode を作る", () => {
    expect(createInitialHomeViewMode(false, () => true, 6)).toBe(6);
    expect(createInitialHomeViewMode(true, () => true, 6)).toBe("holiday");
    expect(createInitialHomeViewMode(true, () => false, 6)).toBe(6);
  });

```

次にする（削除。既定のタブの規則は Task 1 の `createDefaultHomeViewMode` のテストが同じ 3 通りを持つ）

```text

```

次の部分を

```text
  it("編集/フィルタ/表示モード state を更新して保存する", () => {
```

次にする

```text
  it("編集/フィルタ state を更新して保存する", () => {
```

次の部分を

```text
    expect(setFilterCategory).toHaveBeenCalledWith("work");
    expect(saveFilterCategory).toHaveBeenCalledWith("work");

    const setViewMode = jest.fn();
    const saveViewMode = jest.fn();
    setHomeViewModeState({
      mode: "holiday",
      setViewMode,
      saveViewMode,
    });
    expect(setViewMode).toHaveBeenCalledWith("holiday");
    expect(saveViewMode).toHaveBeenCalledWith("holiday");
  });
```

次にする

```text
    expect(setFilterCategory).toHaveBeenCalledWith("work");
    expect(saveFilterCategory).toHaveBeenCalledWith("work");
  });

  it("表示モードは、押したタブが既定のタブと違えば選んだタブに、同じなら mode: null にし、押したタブを保存する", () => {
    const setSelectedViewMode = jest.fn();
    const saveViewMode = jest.fn();

    setHomeViewModeState({
      mode: "holiday",
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: "holiday" });
    expect(saveViewMode).toHaveBeenLastCalledWith("holiday");

    setHomeViewModeState({
      mode: 3,
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: null });
    expect(saveViewMode).toHaveBeenLastCalledWith(3);

    // 祝日の日に今日の曜日のタブを押すと、既定（holiday）と違うので選んだタブになる
    setHomeViewModeState({
      mode: 2,
      defaultViewMode: "holiday",
      setSelectedViewMode,
      saveViewMode,
    });
    expect(setSelectedViewMode).toHaveBeenLastCalledWith({ mode: 2 });
  });

  it("既定のタブを続けて押しても、毎回新しいオブジェクトを入れる（mode が null のままでも再描画させる）", () => {
    const setSelectedViewMode = jest.fn();
    const params = {
      mode: 3,
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode: jest.fn(),
    };

    setHomeViewModeState(params);
    setHomeViewModeState(params);

    const [[first], [second]] = setSelectedViewMode.mock.calls;
    expect(first).toEqual({ mode: null });
    expect(second).toEqual({ mode: null });
    expect(second).not.toBe(first);
  });
```

(b) `src/features/routine/hooks/__tests__/homeViewStateHookActions.test.ts`

次の部分を

```text
  it("filter と view mode action を構築する", () => {
    const setFilterCategory = jest.fn();
    const setViewMode = jest.fn();

    createSetHomeFilterCategoryAction({ setFilterCategory })("work");
    expect(setHomeFilterCategoryState).toHaveBeenCalledWith({
      category: "work",
      setFilterCategory,
      saveFilterCategory,
    });

    createSetHomeViewModeAction({ setViewMode })(5);
    expect(setHomeViewModeState).toHaveBeenCalledWith({
      mode: 5,
      setViewMode,
      saveViewMode,
    });
  });
```

次にする

```text
  it("filter action を構築する", () => {
    const setFilterCategory = jest.fn();

    createSetHomeFilterCategoryAction({ setFilterCategory })("work");
    expect(setHomeFilterCategoryState).toHaveBeenCalledWith({
      category: "work",
      setFilterCategory,
      saveFilterCategory,
    });
  });

  it("view mode action は、押すたびに既定のタブを求めて委譲する（作った時点では求めない）", () => {
    const setSelectedViewMode = jest.fn();
    const getDefaultViewMode = jest
      .fn<"holiday" | number, []>()
      .mockReturnValueOnce("holiday")
      .mockReturnValueOnce(3);

    const action = createSetHomeViewModeAction({
      getDefaultViewMode,
      setSelectedViewMode,
    });
    expect(getDefaultViewMode).not.toHaveBeenCalled();

    action(5);
    expect(getDefaultViewMode).toHaveBeenCalledTimes(1);
    expect(setHomeViewModeState).toHaveBeenLastCalledWith({
      mode: 5,
      defaultViewMode: "holiday",
      setSelectedViewMode,
      saveViewMode,
    });

    action(3);
    expect(getDefaultViewMode).toHaveBeenCalledTimes(2);
    expect(setHomeViewModeState).toHaveBeenLastCalledWith({
      mode: 3,
      defaultViewMode: 3,
      setSelectedViewMode,
      saveViewMode,
    });
  });
```

(c) `src/features/routine/hooks/__tests__/homeViewControlStateActions.test.ts` を全体で次にする。

```ts
import { createInitialHomeViewControlState } from "../homeViewControlStateActions";

describe("homeViewControlStateActions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("保存済みの filter/edit 状態から初期 state を構築する（選択中のタブは含めない）", () => {
    localStorage.setItem("filterCategory", "health");
    localStorage.setItem("isEditMode", "false");
    localStorage.setItem("viewMode", "3");

    expect(createInitialHomeViewControlState()).toEqual({
      filterCategory: "health",
      isEditMode: false,
    });
  });

  it("保存が無ければ filter は all、編集モードは true", () => {
    expect(createInitialHomeViewControlState()).toEqual({
      filterCategory: "all",
      isEditMode: true,
    });
  });
});
```

(d) `src/features/routine/hooks/__tests__/useHomeViewControlInitialState.test.tsx` を全体で次にする。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../homeViewControlStateActions", () => ({
  createInitialHomeViewControlState: jest.fn(),
}));

import { createInitialHomeViewControlState } from "../homeViewControlStateActions";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";

describe("useHomeViewControlInitialState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createInitialHomeViewControlState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
    });
  });

  it("初期 control state を一度だけ構築して保持する", () => {
    const { result, rerender } = renderHook(() =>
      useHomeViewControlInitialState(),
    );

    expect(createInitialHomeViewControlState).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
    });

    rerender();

    expect(createInitialHomeViewControlState).toHaveBeenCalledTimes(1);
  });
});
```

(e) `src/features/routine/hooks/__tests__/useHomeViewControlRuntimeState.test.tsx` を全体で次にする。

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../homeViewControlRuntimeStateResult", () => ({
  createHomeViewControlRuntimeStateResult: jest.fn(),
}));

import { createHomeViewControlRuntimeStateResult } from "../homeViewControlRuntimeStateResult";
import { useHomeViewControlRuntimeState } from "../useHomeViewControlRuntimeState";

describe("useHomeViewControlRuntimeState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createHomeViewControlRuntimeStateResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("filter/選択中のタブ/edit の state を保持して更新できる（選択中のタブの初期値は mode: null）", () => {
    const { result } = renderHook(() =>
      useHomeViewControlRuntimeState({
        filterCategory: "health",
        isEditMode: true,
      }),
    );

    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(true);
    expect(result.current.selectedViewMode).toEqual({ mode: null });
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: true,
      selectedViewMode: { mode: null },
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setSelectedViewMode: expect.any(Function),
    });

    act(() => {
      result.current.setFilterCategory("work");
      result.current.setIsEditMode(false);
      result.current.setSelectedViewMode({ mode: 5 });
    });

    expect(result.current.filterCategory).toBe("work");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedViewMode).toEqual({ mode: 5 });
    expect(createHomeViewControlRuntimeStateResult).toHaveBeenLastCalledWith({
      filterCategory: "work",
      isEditMode: false,
      selectedViewMode: { mode: 5 },
      setFilterCategory: expect.any(Function),
      setIsEditMode: expect.any(Function),
      setSelectedViewMode: expect.any(Function),
    });
  });
});
```

(f) `src/features/routine/hooks/__tests__/homeViewControlRuntimeStateResult.test.ts` を全体で次にする。

```ts
import { createHomeViewControlRuntimeStateResult } from "../homeViewControlRuntimeStateResult";

describe("homeViewControlRuntimeStateResult", () => {
  it("runtime state hook の公開 shape を組み立てる", () => {
    const setFilterCategory = jest.fn();
    const setIsEditMode = jest.fn();
    const setSelectedViewMode = jest.fn();
    const selectedViewMode = { mode: 3 };

    expect(
      createHomeViewControlRuntimeStateResult({
        filterCategory: "health",
        isEditMode: true,
        selectedViewMode,
        setFilterCategory,
        setIsEditMode,
        setSelectedViewMode,
      }),
    ).toEqual({
      filterCategory: "health",
      isEditMode: true,
      selectedViewMode,
      setFilterCategory,
      setIsEditMode,
      setSelectedViewMode,
    });
  });
});
```

(g) `src/features/routine/hooks/__tests__/useHomeViewControlState.test.tsx` を全体で次にする。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlInitialState", () => ({
  useHomeViewControlInitialState: jest.fn(),
}));

jest.mock("../useHomeViewControlRuntimeState", () => ({
  useHomeViewControlRuntimeState: jest.fn(),
}));

import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControlInitialState } from "../useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "../useHomeViewControlRuntimeState";

describe("useHomeViewControlState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (useHomeViewControlInitialState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
    });
    (useHomeViewControlRuntimeState as jest.Mock).mockReturnValue({
      filterCategory: "health",
      isEditMode: false,
      selectedViewMode: { mode: 3 },
      setFilterCategory: jest.fn(),
      setIsEditMode: jest.fn(),
      setSelectedViewMode: jest.fn(),
    });
  });

  it("initial state hook と runtime state hook を compose する", () => {
    const { result } = renderHook(() => useHomeViewControlState());

    expect(useHomeViewControlInitialState).toHaveBeenCalledWith();
    expect(useHomeViewControlRuntimeState).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
    });
    expect(result.current.filterCategory).toBe("health");
    expect(result.current.isEditMode).toBe(false);
    expect(result.current.selectedViewMode).toEqual({ mode: 3 });
  });
});
```

(h) `src/features/routine/hooks/__tests__/useHomeViewControlActions.test.tsx` を全体で次にする。押した時点の既定のタブを返す関数の中身（今日の JST の曜日・祝日・`canUseWindow`）を、描画と同じ時刻で確かめる。日をまたぐ確かめは Step 2 の (e) が担う（ここで描画後に条件を変えて確かめると、Step 6 の変異で (e) 以外も落ちて「(e) だけが捕まえる」の確認にならないため、条件は描画の前に決める）。

```tsx
import { act, renderHook } from "@testing-library/react";
import { useHomeViewControlActions } from "../useHomeViewControlActions";

jest.mock("../homeViewStateHookActions", () => ({
  createSetHomeFilterCategoryAction: jest.fn(),
  createSetHomeViewModeAction: jest.fn(),
  createToggleHomeEditModeAction: jest.fn(),
}));

import {
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "../homeViewStateHookActions";

const createParams = (
  overrides: Partial<Parameters<typeof useHomeViewControlActions>[0]> = {},
) => ({
  canUseWindow: true,
  getIsTodayHoliday: jest.fn(() => false),
  isEditMode: false,
  setFilterCategory: jest.fn(),
  setIsEditMode: jest.fn(),
  setSelectedViewMode: jest.fn(),
  ...overrides,
});

/** createSetHomeViewModeAction に渡された「押した時点の既定のタブ」を返す関数 */
const getPassedDefaultViewModeGetter = (): (() => unknown) => {
  return (createSetHomeViewModeAction as jest.Mock).mock.calls[0][0]
    .getDefaultViewMode;
};

describe("useHomeViewControlActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createToggleHomeEditModeAction as jest.Mock).mockReturnValue(jest.fn());
    (createSetHomeFilterCategoryAction as jest.Mock).mockReturnValue(jest.fn());
    (createSetHomeViewModeAction as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("filter/view/edit action を組み立てて委譲する", () => {
    const toggleAction = jest.fn();
    const filterAction = jest.fn();
    const viewModeAction = jest.fn();
    (createToggleHomeEditModeAction as jest.Mock).mockReturnValue(toggleAction);
    (createSetHomeFilterCategoryAction as jest.Mock).mockReturnValue(
      filterAction,
    );
    (createSetHomeViewModeAction as jest.Mock).mockReturnValue(viewModeAction);
    const params = createParams();

    const { result } = renderHook(() => useHomeViewControlActions(params));

    act(() => {
      result.current.toggleEditModeAction();
      result.current.setFilterCategoryAction("work");
      result.current.setViewModeAction(5);
    });

    expect(createToggleHomeEditModeAction).toHaveBeenCalledWith({
      isEditMode: false,
      setIsEditMode: params.setIsEditMode,
    });
    expect(createSetHomeFilterCategoryAction).toHaveBeenCalledWith({
      setFilterCategory: params.setFilterCategory,
    });
    expect(createSetHomeViewModeAction).toHaveBeenCalledWith({
      getDefaultViewMode: expect.any(Function),
      setSelectedViewMode: params.setSelectedViewMode,
    });
    expect(toggleAction).toHaveBeenCalled();
    expect(filterAction).toHaveBeenCalledWith("work");
    expect(viewModeAction).toHaveBeenCalledWith(5);
  });

  it("既定のタブを返す関数は、今日が祝日でなければ今日の JST の曜日を返す", () => {
    // 2026-11-04 は水曜（3）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-04T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(createParams()),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe(3);
  });

  it("既定のタブを返す関数は、今日が祝日なら holiday を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(
        createParams({ getIsTodayHoliday: jest.fn(() => true) }),
      ),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe("holiday");
  });

  it("既定のタブを返す関数は、window が無いときは祝日でも今日の JST の曜日を返す", () => {
    // 2026-11-03 は火曜（2）
    jest.useFakeTimers().setSystemTime(new Date("2026-11-03T12:00:00+09:00"));
    const { result } = renderHook(() =>
      useHomeViewControlActions(
        createParams({
          canUseWindow: false,
          getIsTodayHoliday: jest.fn(() => true),
        }),
      ),
    );

    act(() => {
      result.current.setViewModeAction(5);
    });

    expect(getPassedDefaultViewModeGetter()()).toBe(2);
  });
});
```

(i) `src/features/routine/hooks/__tests__/useHomeViewControls.test.tsx` を全体で次にする（(d) の描画時の既定と、`isTodayHoliday`・`currentDayOfWeek` の配線。L-060）。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../useHomeViewControlState", () => ({
  useHomeViewControlState: jest.fn(),
}));

jest.mock("../useHomeViewControlActions", () => ({
  useHomeViewControlActions: jest.fn(),
}));

jest.mock("../homeViewControlsResult", () => ({
  createHomeViewControlsResult: jest.fn(),
}));

import type { HomeSelectedViewMode } from "../../pages/homeTypes";
import { createHomeViewControlsResult } from "../homeViewControlsResult";
import { useHomeViewControlActions } from "../useHomeViewControlActions";
import { useHomeViewControlState } from "../useHomeViewControlState";
import { useHomeViewControls } from "../useHomeViewControls";

const mockControlState = (selectedViewMode: HomeSelectedViewMode) => {
  (useHomeViewControlState as jest.Mock).mockReturnValue({
    filterCategory: "health",
    isEditMode: false,
    selectedViewMode,
    setFilterCategory: jest.fn(),
    setIsEditMode: jest.fn(),
    setSelectedViewMode: jest.fn(),
  });
};

describe("useHomeViewControls", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockControlState({ mode: null });
    (useHomeViewControlActions as jest.Mock).mockReturnValue({
      setFilterCategoryAction: jest.fn(),
      setViewModeAction: jest.fn(),
      toggleEditModeAction: jest.fn(),
    });
    (createHomeViewControlsResult as jest.Mock).mockImplementation(
      (args) => args,
    );
  });

  it("state hook と actions hook を compose し result builder へ委譲する", () => {
    const getIsTodayHoliday = jest.fn(() => false);
    const { result } = renderHook(() =>
      useHomeViewControls({
        canUseWindow: true,
        currentDayOfWeek: 3,
        getIsTodayHoliday,
        isTodayHoliday: false,
      }),
    );

    const state = (useHomeViewControlState as jest.Mock).mock.results[0].value;
    const actions = (useHomeViewControlActions as jest.Mock).mock.results[0]
      .value;
    expect(useHomeViewControlState).toHaveBeenCalledWith();
    expect(useHomeViewControlActions).toHaveBeenCalledWith({
      canUseWindow: true,
      getIsTodayHoliday,
      isEditMode: false,
      setFilterCategory: state.setFilterCategory,
      setIsEditMode: state.setIsEditMode,
      setSelectedViewMode: state.setSelectedViewMode,
    });
    expect(createHomeViewControlsResult).toHaveBeenCalledWith({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: actions.setFilterCategoryAction,
      setViewModeAction: actions.setViewModeAction,
      toggleEditModeAction: actions.toggleEditModeAction,
      viewMode: 3,
    });
    expect(result.current).toEqual({
      filterCategory: "health",
      isEditMode: false,
      setFilterCategoryAction: actions.setFilterCategoryAction,
      setViewModeAction: actions.setViewModeAction,
      toggleEditModeAction: actions.toggleEditModeAction,
      viewMode: 3,
    });
    // 描画時の既定のタブは、渡された真偽値（isTodayHoliday）から求める。祝日の判定関数は描画中に呼ばない
    expect(getIsTodayHoliday).not.toHaveBeenCalled();
  });

  it.each([
    {
      title: "選んでいなければ、今日の曜日",
      selectedViewMode: { mode: null },
      canUseWindow: true,
      isTodayHoliday: false,
      expected: 3,
    },
    {
      title: "選んでいなければ、今日が祝日なら holiday",
      selectedViewMode: { mode: null },
      canUseWindow: true,
      isTodayHoliday: true,
      expected: "holiday",
    },
    {
      title: "window が無ければ、祝日でも今日の曜日",
      selectedViewMode: { mode: null },
      canUseWindow: false,
      isTodayHoliday: true,
      expected: 3,
    },
    {
      title: "曜日を選んでいれば、祝日でもその曜日",
      selectedViewMode: { mode: 5 },
      canUseWindow: true,
      isTodayHoliday: true,
      expected: 5,
    },
    {
      title: "holiday を選んでいれば、祝日でなくても holiday",
      selectedViewMode: { mode: "holiday" },
      canUseWindow: true,
      isTodayHoliday: false,
      expected: "holiday",
    },
  ] satisfies {
    title: string;
    selectedViewMode: HomeSelectedViewMode;
    canUseWindow: boolean;
    isTodayHoliday: boolean;
    expected: HomeSelectedViewMode["mode"];
  }[])(
    "表示するタブ: $title",
    ({ selectedViewMode, canUseWindow, isTodayHoliday, expected }) => {
      mockControlState(selectedViewMode);

      const { result } = renderHook(() =>
        useHomeViewControls({
          canUseWindow,
          currentDayOfWeek: 3,
          getIsTodayHoliday: jest.fn(() => false),
          isTodayHoliday,
        }),
      );

      expect(result.current.viewMode).toBe(expected);
    },
  );

  it("選んでいなければ、再描画で渡された今日の曜日・祝日フラグが変わると表示するタブも変わる", () => {
    const { result, rerender } = renderHook(
      ({ currentDayOfWeek, isTodayHoliday }) =>
        useHomeViewControls({
          canUseWindow: true,
          currentDayOfWeek,
          getIsTodayHoliday: jest.fn(() => false),
          isTodayHoliday,
        }),
      { initialProps: { currentDayOfWeek: 1, isTodayHoliday: false } },
    );
    expect(result.current.viewMode).toBe(1);

    rerender({ currentDayOfWeek: 2, isTodayHoliday: true });
    expect(result.current.viewMode).toBe("holiday");

    rerender({ currentDayOfWeek: 3, isTodayHoliday: false });
    expect(result.current.viewMode).toBe(3);
  });
});
```

(j) `src/features/routine/hooks/__tests__/useHomeViewState.test.tsx`

次の部分を

```text
    // 選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）
    expect(result.current.viewMode).toBe(5);
```

次にする

```text
    // タブを選んでいなければ、選択中のタブも新しい今日の曜日になる（#210）
    expect(result.current.viewMode).toBe(6);
```

（同じファイルの「祝日ならviewMode初期値をholidayにする」「祝日でない場合は保存済みviewMode/filterCategoryを復元する」は変えない。保存した `viewMode` は読み出さないので、既定のタブ（`"holiday"`・今日の曜日 5）が期待のまま正しい。localStorage のテストの `setViewModeAction(5)` は既に `act()` の中。）

(k) `src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx`

次の部分を

```text
    // 選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）
    expect(result.current.viewMode).toBe(3);
```

次にする

```text
    // タブを選んでいなければ、表示するタブもフックの曜日に追いつく（#210）。
    // setViewModeAction の既定のタブとの比較は、ここでは確かめない（押した時点の曜日は
    // toJstDay(new Date()) から取るので、モックの曜日と食い違う。useHomeViewState.viewMode.test.tsx で確かめる）
    expect(result.current.viewMode).toBe(4);
```

- [ ] **Step 2: 落ちるテストを書く（選択中のタブの日またぎ。新規）**

`src/features/routine/hooks/__tests__/useHomeViewState.viewMode.test.tsx` を新規作成する。(a)(b)(c)(e)(f) とルーティン追加フォームの既定の曜日。(d) は (i)・(h)・Task 1 が担う（「設計書との差異」8）。

```tsx
import { act, renderHook } from "@testing-library/react";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";
import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import { resolveHomeRoutineFormDay } from "../../pages/pageViewModelActions";
import { useHomeViewState } from "../useHomeViewState";

// 選択中の曜日のタブ（view.viewMode）の日またぎ（#210）。
// 本物の useJstDay と、本物（useRoutineQueries）と同じく時計に連動する祝日の判定を通す。
// 観測は renderHook の result.current（コミット後の値）で行う。描画中の値を写し取ると、
// React が描画を捨てたとき（同じ state を入れたとき）にも新しい値が見えてしまい、退行を見逃す。
//
// 使う日付（2026 年 11 月。JST）:
//   11/2 月（1）平日 / 11/3 火（2）文化の日 / 11/4 水（3）平日 / 11/5 木（4）平日 / 11/6 金（5）平日
const getIsTodayHoliday = () => isHoliday(getJstToday());

const at = (isoWithOffset: string) => {
  jest.setSystemTime(new Date(isoWithOffset));
};

const renderHomeViewState = (isoWithOffset: string) => {
  jest.useFakeTimers().setSystemTime(new Date(isoWithOffset));
  return renderHook(() => useHomeViewState(getIsTodayHoliday));
};

describe("useHomeViewState の選択中のタブは、選んでいなければ今日に追従する", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("(a) タブを選んでいないとき", () => {
    it("平日→祝日→平日と日をまたいだ後の再描画で、新しい今日のタブになり、ルーティン追加フォームの既定の曜日も変わる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(1);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(
        HOLIDAY_DAY_VALUE,
      );

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(3);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(3);
    });
  });

  describe("(b) 今日以外のタブを選んでいるとき", () => {
    it("日をまたいでも、選んだタブが保たれる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(5);
      });
      expect(result.current.viewMode).toBe(5);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(5);
      expect(resolveHomeRoutineFormDay(result.current.viewMode)).toBe(5);
    });
  });

  describe("(c) 今日のタブを押したとき", () => {
    it("選択が「今日に追従」に戻り、日をまたぐと新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(5);
      });
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
    });
  });

  // L-538: 前日に描画し、再描画せずに時計を進めてから押す（描画と最初の操作を同じ時刻にすると、
  // 押した時点の既定のタブと描画時の既定のタブが一致し、どちらで比べる実装でも通ってしまう）
  describe("(e) 前日に描画したまま、再描画せずに日をまたいでから押したとき", () => {
    it("選んでいない（mode: null）まま新しい今日のタブを押すと、再描画されて日付ラベルも新しい日になる", () => {
      const { result } = renderHomeViewState("2026-11-02T23:59:00+09:00");
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });

      expect(result.current.viewMode).toBe("holiday");
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");
      expect(result.current.isTodayHoliday).toBe(true);
    });

    it("別のタブを押して今日のタブに戻した（mode: null）あとでも、新しい今日のタブを押すと再描画される", () => {
      const { result } = renderHomeViewState("2026-11-02T23:59:00+09:00");
      act(() => {
        result.current.setViewModeAction(3);
      });
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });

      expect(result.current.viewMode).toBe("holiday");
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");
    });

    it("新しい今日のタブ（祝日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction("holiday");
      });
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(3);
    });

    it("新しい今日のタブ（曜日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-04T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(3);

      at("2026-11-05T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction(4);
      });
      expect(result.current.viewMode).toBe(4);

      at("2026-11-06T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(5);
    });

    it("表示中の古い今日のタブを押すと、選んだタブとして保たれる（押した時点の既定のタブと比べる）", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T23:59:00+09:00",
      );
      expect(result.current.viewMode).toBe(1);

      at("2026-11-03T00:01:00+09:00");
      act(() => {
        result.current.setViewModeAction(1);
      });
      expect(result.current.viewMode).toBe(1);
      expect(result.current.currentDate).toBe("2026年11月3日火曜日");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(1);
    });
  });

  describe("(f) 境界のケースは、選んだタブとして保たれる", () => {
    it("祝日の日に今日の曜日のタブを押すと、次の日もその曜日のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-03T12:00:00+09:00",
      );
      expect(result.current.viewMode).toBe("holiday");
      act(() => {
        result.current.setViewModeAction(2);
      });
      expect(result.current.viewMode).toBe(2);

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(2);
    });

    it("平日に「祝日」タブを押すと、次の日が祝日でもその次の平日でも holiday のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-02T12:00:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction("holiday");
      });
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-03T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");

      at("2026-11-04T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe("holiday");
    });

    it("前日に翌日の曜日のタブを押すと、翌日に既定のタブと同じになっても選んだまま残り、翌々日もその曜日のまま", () => {
      const { result, rerender } = renderHomeViewState(
        "2026-11-04T23:00:00+09:00",
      );
      act(() => {
        result.current.setViewModeAction(4);
      });
      expect(result.current.viewMode).toBe(4);

      at("2026-11-05T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(4);

      at("2026-11-06T00:01:00+09:00");
      rerender();
      expect(result.current.viewMode).toBe(4);
    });
  });
});
```

- [ ] **Step 3: 落ちることを確かめる**

Run: `cd .worktrees/issue-210-home-date && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/routine/hooks --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "✕|Tests:|not wrapped in act"`
Expected（試作で確認済み）: `Tests: 27 failed, 264 passed, 291 total`。書き換えた・足したテストファイル 12 本のすべてに `✕` がある:

- `useHomeViewState.viewMode.test.tsx`: 5 件（(a)、(c)、(e) の「新しい今日のタブ（祝日）を押すと…」「新しい今日のタブ（曜日）を押すと…」「表示中の古い今日のタブを押すと…」）。(b)・(e) の「`mode: null` のまま押す」2 件・(f) の 3 件は修正前でも通る（修正前は押すたびに数値を入れて必ず再描画し、押したタブをそのまま保つため）
- `useHomeViewState.test.tsx`: 「日をまたいだ後の再描画で、曜日の並び順の先頭が新しい今日の曜日になる」（`viewMode` が 5 のまま）
- `useHomeViewState.today.test.tsx`: 1 件（`viewMode` が 3 のまま）
- `useHomeViewControls.test.tsx` 7 件、`useHomeViewControlActions.test.tsx` 4 件、`homeViewStateActions.test.ts` 2 件、`homeViewControlStateActions.test.ts` 2 件、`useHomeViewControlRuntimeState.test.tsx`・`homeViewControlRuntimeStateResult.test.ts`・`useHomeViewControlState.test.tsx`・`useHomeViewControlInitialState.test.tsx`・`homeViewStateHookActions.test.ts` 各 1 件

- [ ] **Step 4: 実装する**

(a) `src/features/routine/hooks/homeViewStateActions.ts`

次の部分を

```text
type SetViewMode = Dispatch<SetStateAction<HomeViewMode>>;
```

次にする

```text
type SetSelectedViewMode = Dispatch<SetStateAction<HomeSelectedViewMode>>;
```

次の部分を（削除）

```text
export const createInitialHomeViewMode = (
  canUseWindow: boolean,
  getIsTodayHoliday: () => boolean,
  currentDayOfWeek: number,
): HomeViewMode => {
  if (!canUseWindow) {
    return currentDayOfWeek;
  }

  return getIsTodayHoliday() ? "holiday" : currentDayOfWeek;
};

```

次にする

```text

```

次の部分を

```text
export const setHomeViewModeState = (params: {
  mode: HomeViewMode;
  setViewMode: SetViewMode;
  saveViewMode: (mode: HomeViewMode) => void;
}): void => {
  const { mode, setViewMode, saveViewMode } = params;

  setViewMode(mode);
  saveViewMode(mode);
};
```

次にする

```text
export const setHomeViewModeState = (params: {
  mode: HomeViewMode;
  /** 押した時点の既定のタブ（描画時の値を渡さない。L-538） */
  defaultViewMode: HomeViewMode;
  setSelectedViewMode: SetSelectedViewMode;
  saveViewMode: (mode: HomeViewMode) => void;
}): void => {
  const { mode, defaultViewMode, setSelectedViewMode, saveViewMode } = params;

  // 押した時点の既定のタブと同じなら「今日に追従」（mode: null）に戻す。
  // 押すたびに新しいオブジェクトを入れる（mode が null のままでも再描画させるため）
  setSelectedViewMode({ mode: mode === defaultViewMode ? null : mode });
  saveViewMode(mode);
};
```

(b) `src/features/routine/hooks/homeViewStateHookActions.ts`

次の部分を

```text
import type { HomeDayOption, HomeViewMode } from "../pages/homeTypes";
```

次にする

```text
import type {
  HomeDayOption,
  HomeSelectedViewMode,
  HomeViewMode,
} from "../pages/homeTypes";
```

次の部分を

```text
type SetViewMode = Dispatch<SetStateAction<HomeViewMode>>;
```

次にする

```text
type SetSelectedViewMode = Dispatch<SetStateAction<HomeSelectedViewMode>>;
```

次の部分を

```text
export const createSetHomeViewModeAction = (params: {
  setViewMode: SetViewMode;
}) => {
  const { setViewMode } = params;

  return (mode: HomeViewMode) => {
    setHomeViewModeState({
      mode,
      setViewMode,
      saveViewMode,
    });
  };
};
```

次にする

```text
export const createSetHomeViewModeAction = (params: {
  /** 押した時点の既定のタブを返す。押すたびに呼ぶ（描画時の値を持たない。L-538） */
  getDefaultViewMode: () => HomeViewMode;
  setSelectedViewMode: SetSelectedViewMode;
}) => {
  const { getDefaultViewMode, setSelectedViewMode } = params;

  return (mode: HomeViewMode) => {
    setHomeViewModeState({
      mode,
      defaultViewMode: getDefaultViewMode(),
      setSelectedViewMode,
      saveViewMode,
    });
  };
};
```

(c) `src/features/routine/hooks/homeViewControlStateActions.ts` を全体で次にする。

```ts
import type { RoutineCategory } from "@/types/routine";
import {
  getStoredFilterCategory,
  getStoredIsEditMode,
} from "./homeViewPersistence";

type HomeViewControlInitialState = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
};

export const createInitialHomeViewControlState =
  (): HomeViewControlInitialState => {
    return {
      filterCategory: getStoredFilterCategory(),
      isEditMode: getStoredIsEditMode(),
    };
  };
```

(d) `src/features/routine/hooks/useHomeViewControlInitialState.ts` を全体で次にする。

```ts
import { useState } from "react";
import { createInitialHomeViewControlState } from "./homeViewControlStateActions";

export const useHomeViewControlInitialState = () => {
  const [initialState] = useState(createInitialHomeViewControlState);

  return initialState;
};
```

(e) `src/features/routine/hooks/useHomeViewControlRuntimeState.ts` を全体で次にする。

```ts
import { useState } from "react";
import type { RoutineCategory } from "@/types/routine";
import type { HomeSelectedViewMode } from "../pages/homeTypes";
import type { createInitialHomeViewControlState } from "./homeViewControlStateActions";
import { createHomeViewControlRuntimeStateResult } from "./homeViewControlRuntimeStateResult";

type HomeViewControlInitialState = ReturnType<
  typeof createInitialHomeViewControlState
>;

export const useHomeViewControlRuntimeState = (
  initialState: HomeViewControlInitialState,
) => {
  const [filterCategory, setFilterCategory] = useState<RoutineCategory | "all">(
    initialState.filterCategory,
  );
  // 初期値は「今日に追従」。表示するタブは描画のたびに既定のタブから求める（useHomeViewControls）
  const [selectedViewMode, setSelectedViewMode] =
    useState<HomeSelectedViewMode>({ mode: null });
  const [isEditMode, setIsEditMode] = useState(initialState.isEditMode);

  return createHomeViewControlRuntimeStateResult({
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  });
};
```

(f) `src/features/routine/hooks/homeViewControlRuntimeStateResult.ts` を全体で次にする。

```ts
import type { RoutineCategory } from "@/types/routine";
import type { Dispatch, SetStateAction } from "react";
import type { HomeSelectedViewMode } from "../pages/homeTypes";

type HomeViewControlRuntimeStateResultArgs = {
  filterCategory: RoutineCategory | "all";
  isEditMode: boolean;
  selectedViewMode: HomeSelectedViewMode;
  setFilterCategory: Dispatch<SetStateAction<RoutineCategory | "all">>;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  setSelectedViewMode: Dispatch<SetStateAction<HomeSelectedViewMode>>;
};

export const createHomeViewControlRuntimeStateResult = ({
  filterCategory,
  isEditMode,
  selectedViewMode,
  setFilterCategory,
  setIsEditMode,
  setSelectedViewMode,
}: HomeViewControlRuntimeStateResultArgs) => {
  return {
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  };
};
```

(g) `src/features/routine/hooks/useHomeViewControlState.ts` を全体で次にする。

```ts
import { useHomeViewControlInitialState } from "./useHomeViewControlInitialState";
import { useHomeViewControlRuntimeState } from "./useHomeViewControlRuntimeState";

export const useHomeViewControlState = () => {
  const initialState = useHomeViewControlInitialState();

  return useHomeViewControlRuntimeState(initialState);
};
```

(h) `src/features/routine/hooks/useHomeViewControlActions.ts` を全体で次にする。

```ts
import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { toJstDay } from "@/lib/storage/core";
import type { RoutineCategory } from "@/types/routine";
import type { HomeSelectedViewMode, HomeViewMode } from "../pages/homeTypes";
import { createDefaultHomeViewMode } from "./homeViewStateActions";
import {
  createSetHomeFilterCategoryAction,
  createSetHomeViewModeAction,
  createToggleHomeEditModeAction,
} from "./homeViewStateHookActions";

type SetFilterCategory = Dispatch<SetStateAction<RoutineCategory | "all">>;
type SetSelectedViewMode = Dispatch<SetStateAction<HomeSelectedViewMode>>;
type SetIsEditMode = Dispatch<SetStateAction<boolean>>;

type UseHomeViewControlActionsParams = {
  canUseWindow: boolean;
  getIsTodayHoliday: () => boolean;
  isEditMode: boolean;
  setFilterCategory: SetFilterCategory;
  setIsEditMode: SetIsEditMode;
  setSelectedViewMode: SetSelectedViewMode;
};

export const useHomeViewControlActions = ({
  canUseWindow,
  getIsTodayHoliday,
  isEditMode,
  setFilterCategory,
  setIsEditMode,
  setSelectedViewMode,
}: UseHomeViewControlActionsParams) => {
  const toggleEditModeAction = useCallback(() => {
    return createToggleHomeEditModeAction({
      isEditMode,
      setIsEditMode,
    })();
  }, [isEditMode, setIsEditMode]);

  const setFilterCategoryAction = useCallback(
    (category: RoutineCategory | "all") => {
      createSetHomeFilterCategoryAction({
        setFilterCategory,
      })(category);
    },
    [setFilterCategory],
  );

  const setViewModeAction = useCallback(
    (mode: HomeViewMode) => {
      createSetHomeViewModeAction({
        // 押した時点の既定のタブと比べる（描画時の今日を持たない。L-538）
        getDefaultViewMode: () =>
          createDefaultHomeViewMode(
            canUseWindow,
            getIsTodayHoliday(),
            toJstDay(new Date()),
          ),
        setSelectedViewMode,
      })(mode);
    },
    [canUseWindow, getIsTodayHoliday, setSelectedViewMode],
  );

  return {
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
  };
};
```

(i) `src/features/routine/hooks/useHomeViewControls.ts` を全体で次にする。

```ts
import { createHomeViewControlsResult } from "./homeViewControlsResult";
import {
  createDefaultHomeViewMode,
  resolveHomeViewMode,
} from "./homeViewStateActions";
import { useHomeViewControlActions } from "./useHomeViewControlActions";
import { useHomeViewControlState } from "./useHomeViewControlState";

type UseHomeViewControlsParams = {
  canUseWindow: boolean;
  currentDayOfWeek: number;
  getIsTodayHoliday: () => boolean;
  isTodayHoliday: boolean;
};

export const useHomeViewControls = ({
  canUseWindow,
  currentDayOfWeek,
  getIsTodayHoliday,
  isTodayHoliday,
}: UseHomeViewControlsParams) => {
  const {
    filterCategory,
    isEditMode,
    selectedViewMode,
    setFilterCategory,
    setIsEditMode,
    setSelectedViewMode,
  } = useHomeViewControlState();
  const { setFilterCategoryAction, setViewModeAction, toggleEditModeAction } =
    useHomeViewControlActions({
      canUseWindow,
      getIsTodayHoliday,
      isEditMode,
      setFilterCategory,
      setIsEditMode,
      setSelectedViewMode,
    });
  // 表示するタブ: 選んでいなければ（mode が null）、描画時の今日の既定のタブ。
  // 祝日は渡された真偽値で決める（getIsTodayHoliday は描画中に呼ばない。押した時点の比較にだけ使う）
  const viewMode = resolveHomeViewMode(
    selectedViewMode,
    createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek),
  );

  return createHomeViewControlsResult({
    filterCategory,
    isEditMode,
    setFilterCategoryAction,
    setViewModeAction,
    toggleEditModeAction,
    viewMode,
  });
};
```

(j) `src/features/routine/hooks/useHomeViewState.ts`

次の部分を

```text
  const controls = useHomeViewControls({
    canUseWindow,
    currentDayOfWeek,
    getIsTodayHoliday,
  });
```

次にする

```text
  const controls = useHomeViewControls({
    canUseWindow,
    currentDayOfWeek,
    getIsTodayHoliday,
    isTodayHoliday,
  });
```

- [ ] **Step 5: 通ることを確かめる**

Run: `cd .worktrees/issue-210-home-date && NODE_ENV=test TZ=Asia/Tokyo npx jest src/features/routine src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ 2>&1 | grep -E "^FAIL|^Tests:|^Test Suites:|not wrapped in act"`
Expected: `FAIL` と `not wrapped in act` が出ない。`Test Suites: 160 passed, 160 total`・`Tests: 624 passed, 624 total`（契約テストはこの時点ではまだ #208 の形で 23 件。Task 4 で 30 件になり、合計 631 件）

- [ ] **Step 6: 変異の確認（L-538・設計書「テストの方針」。テストには含めない）**

2 つの変異を 1 つずつ入れてホームのテストを実行し、(e) のテストだけが落ちることを確かめる。スクリプトは変異ごとに必ず元に戻し（`finally`）、元と一致することを `assert` で確かめる。

- (e) ハンドラが**描画時**の既定のタブで比べる形（`useHomeViewControlActions` の本体で既定のタブを求め、`useCallback` の依存に持たせる）
- (null) 「今日に追従」を素の `null` にした形と同じ挙動（`mode: null` から `mode: null` への更新で、前と同じオブジェクトを入れる。React は同じ値として描画を捨てる。「設計書との差異」7）

```bash
cd .worktrees/issue-210-home-date && BK=".git/worktrees/issue-210-home-date/home-date-backup" && mkdir -p "$BK" && cp src/features/routine/hooks/useHomeViewControlActions.ts src/features/routine/hooks/useHomeViewControlRuntimeState.ts "$BK/" && python3 - <<'EOF'
import os, subprocess
from pathlib import Path

TESTS = ["src/features/routine/hooks", "src/features/routine/pages"]
MUTATIONS = [
    ("(e) ハンドラが描画時の既定のタブで比べる", "src/features/routine/hooks/useHomeViewControlActions.ts",
     """  const setViewModeAction = useCallback(
    (mode: HomeViewMode) => {
      createSetHomeViewModeAction({
        // 押した時点の既定のタブと比べる（描画時の今日を持たない。L-538）
        getDefaultViewMode: () =>
          createDefaultHomeViewMode(
            canUseWindow,
            getIsTodayHoliday(),
            toJstDay(new Date()),
          ),
        setSelectedViewMode,
      })(mode);
    },
    [canUseWindow, getIsTodayHoliday, setSelectedViewMode],
  );""",
     """  const defaultViewModeAtRender = createDefaultHomeViewMode(
    canUseWindow,
    getIsTodayHoliday(),
    toJstDay(new Date()),
  );
  const setViewModeAction = useCallback(
    (mode: HomeViewMode) => {
      createSetHomeViewModeAction({
        getDefaultViewMode: () => defaultViewModeAtRender,
        setSelectedViewMode,
      })(mode);
    },
    [defaultViewModeAtRender, setSelectedViewMode],
  );"""),
    ("(null) null から null への更新で同じ値を入れる（素の null と同じく描画が捨てられる）",
     "src/features/routine/hooks/useHomeViewControlRuntimeState.ts",
     """  const [selectedViewMode, setSelectedViewMode] =
    useState<HomeSelectedViewMode>({ mode: null });""",
     """  const [selectedViewMode, setRawSelectedViewMode] =
    useState<HomeSelectedViewMode>({ mode: null });
  const setSelectedViewMode = (next: HomeSelectedViewMode) =>
    setRawSelectedViewMode((prev) =>
      prev.mode === null && next.mode === null ? prev : next,
    );"""),
]

for label, path, old, new in MUTATIONS:
    file = Path(path)
    original = file.read_text()
    assert original.count(old) == 1, (label, old)
    try:
        file.write_text(original.replace(old, new))
        result = subprocess.run(
            ["npx", "jest", *TESTS, "--verbose",
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
for f in useHomeViewControlActions.ts useHomeViewControlRuntimeState.ts; do cmp "$BK/$f" "src/features/routine/hooks/$f" || echo "DIFF: $f"; done; echo CHECKED
```

Expected（試作で確認済み。`(n ms)` の表示は除く。件数はこの 2 つのディレクトリの合計）:

```text
## (e) ハンドラが描画時の既定のタブで比べる: src/features/routine/hooks/useHomeViewControlActions.ts
Tests:       3 failed, 395 passed, 398 total
  ✕ 新しい今日のタブ（祝日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる
  ✕ 新しい今日のタブ（曜日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる
  ✕ 表示中の古い今日のタブを押すと、選んだタブとして保たれる（押した時点の既定のタブと比べる）
## (null) null から null への更新で同じ値を入れる（素の null と同じく描画が捨てられる）: src/features/routine/hooks/useHomeViewControlRuntimeState.ts
Tests:       4 failed, 394 passed, 398 total
  ✕ 選んでいない（mode: null）まま新しい今日のタブを押すと、再描画されて日付ラベルも新しい日になる
  ✕ 別のタブを押して今日のタブに戻した（mode: null）あとでも、新しい今日のタブを押すと再描画される
  ✕ 新しい今日のタブ（祝日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる
  ✕ 新しい今日のタブ（曜日）を押すと「今日に追従」になり、次の日には新しい今日のタブになる
CHECKED
```

落ちるのは、どちらも (e) の `describe` のテストだけ（(a)(b)(c)(f) と、モックの合成テストは落ちない）。`DIFF:` が出ないこと。結果（変異ごとの件数と落ちたテスト名）を `.superpowers/sdd/2026-11-07-home-date-rollover/` の Task 3 の報告に書く。

- [ ] **Step 7: 型・lint・整形・旧名の残りを確かめる**

Run: `cd .worktrees/issue-210-home-date && grep -rnE "createInitialHomeViewMode|setViewMode\b|SetViewMode\b" src/features/routine; npx prettier --write src/features/routine/hooks/homeViewStateActions.ts src/features/routine/hooks/homeViewStateHookActions.ts src/features/routine/hooks/homeViewControlStateActions.ts src/features/routine/hooks/useHomeViewControlInitialState.ts src/features/routine/hooks/useHomeViewControlRuntimeState.ts src/features/routine/hooks/homeViewControlRuntimeStateResult.ts src/features/routine/hooks/useHomeViewControlState.ts src/features/routine/hooks/useHomeViewControlActions.ts src/features/routine/hooks/useHomeViewControls.ts src/features/routine/hooks/useHomeViewState.ts src/features/routine/hooks/__tests__/homeViewStateActions.test.ts src/features/routine/hooks/__tests__/homeViewStateHookActions.test.ts src/features/routine/hooks/__tests__/homeViewControlStateActions.test.ts src/features/routine/hooks/__tests__/useHomeViewControlInitialState.test.tsx src/features/routine/hooks/__tests__/useHomeViewControlRuntimeState.test.tsx src/features/routine/hooks/__tests__/homeViewControlRuntimeStateResult.test.ts src/features/routine/hooks/__tests__/useHomeViewControlState.test.tsx src/features/routine/hooks/__tests__/useHomeViewControlActions.test.tsx src/features/routine/hooks/__tests__/useHomeViewControls.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.today.test.tsx src/features/routine/hooks/__tests__/useHomeViewState.viewMode.test.tsx && npm run typecheck && npm run lint && npx prettier --check src/features/routine/hooks`
Expected: `grep` は何も出さない（`setViewModeAction` は `\b` の前に `Action` が続くので一致しない）。残りはすべて exit 0（`All matched files use Prettier code style!`）。

（コミットしない）

---

## Task 4: 契約テストの一般化と対象の追加

Task 2・3 の後に行う（`useHomeViewDateState` に `"use no memo"` があり、`useHomeViewControls` が `isTodayHoliday` を受け取る前提）。

**Files:**

- Modify: `src/__tests__/reactCompilerToday.contract.test.ts`（冒頭のコメント・対象の型と配列・`startsWithUseNoMemo`・`describe` の中）

**Interfaces:**

- Consumes: Task 2 の `export const useHomeViewDateState = ({ … }: UseHomeViewDateStateParams) => { "use no memo"; … }`、`useHomeViewState.ts` の変数 `currentDayOfWeek`・`currentDate`・`isTodayHoliday`。Task 3 の `useHomeViewControls.ts` の引数 `isTodayHoliday`・`currentDayOfWeek`（`createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek),` の 1 行）。
- Produces（Task 5 の `coding-standards.md` が名前を参照する）:
  - `type UseNoMemoTarget = { file: string; name: string }`・`USE_NO_MEMO_TARGETS: UseNoMemoTarget[]`（`useToday.ts` の 3 つ＋`useHomeViewDateState`）
  - `type TodayTarget = { file: string; hookCall?: string; dependencies: string[] }`・`TODAY_TARGETS`（#208 の 5 つ＋`useHomeViewControls.ts`。`useHomeViewState.ts` は `dependencies` が 3 つ）
  - `startsWithUseNoMemo(target: UseNoMemoTarget): boolean`
  - 削除: `TODAY_HOOK_FILE`・`TODAY_HOOK_NAMES`

- [ ] **Step 1: 契約テストを直す**

`src/__tests__/reactCompilerToday.contract.test.ts`

次の部分を

```text
// 新しく今日を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と今日・現在時刻」から参照している）。
```

次にする

```text
// 新しく今日を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す。
// 描画のたびに今日を求める "use no memo" の関数を足したら、USE_NO_MEMO_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と今日・現在時刻」から参照している）。
```

次の部分を

```text
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
```

次にする

```text
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
   * ソースが呼んでいるべき、今日を返すフック（src/hooks/useToday.ts の共通フック、または
   * USE_NO_MEMO_TARGETS の機能側の関数）。今日を引数で受け取るだけのファイルは持たない
   */
  hookCall?: string;
  /** 今日（または今日から求めた値）を入れる変数。コンパイル結果で、メモ化の依存の比較に入っているべきもの */
  dependencies: string[];
};
```

次の部分を

```text
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
```

次にする

```text
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
];
```

次の部分を

```text
/** export const <hookName> = () => { ... } の本体の最初の文が "use no memo" か（構文木で判定する） */
const startsWithUseNoMemo = (source: string, hookName: string): boolean => {
  const sourceFile = ts.createSourceFile(
    TODAY_HOOK_FILE,
    source,
    ts.ScriptTarget.ESNext,
    true,
  );
```

次にする

```text
/** file の export const <name> = (...) => { ... } の本体の最初の文が "use no memo" か（構文木で判定する） */
const startsWithUseNoMemo = ({ file, name }: UseNoMemoTarget): boolean => {
  const sourceFile = ts.createSourceFile(
    file,
    readSource(file),
    ts.ScriptTarget.ESNext,
    true,
  );
```

次の部分を

```text
        declaration.name.text === hookName &&
```

次にする

```text
        declaration.name.text === name &&
```

次の部分を

```text
    `${TODAY_HOOK_FILE} に export const ${hookName} = () => { ... } が見つかりません`,
```

次にする

```text
    `${file} に export const ${name} = (...) => { ... } が見つかりません`,
```

次の部分を

```text
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
```

次にする

```text
  // 検証 1: 描画のたびに今日を求める関数は、それぞれ本体の最初の文が "use no memo"。
  // フックを呼ばず JSX も無い関数はコンパイラの対象外なので、コンパイル結果では判定できない。
  it.each(USE_NO_MEMO_TARGETS)(
    '$file の $name は本体の最初の文が "use no memo" である',
    (target) => {
      expect(startsWithUseNoMemo(target)).toBe(true);
    },
  );

  describe.each(TODAY_TARGETS)("$file", ({ file, hookCall, dependencies }) => {
```

次の部分を

```text
    it(`メモ化の依存の比較に ${dependency} がある`, () => {
      // 失敗したら: 今日の値が依存から外れ、日をまたいでも下流が再計算されない
      expect(code).toMatch(new RegExp(`\\$\\[\\d+\\] !== ${dependency}\\b`));
    });

    it(`ソースが共通フック ${hookCall} を呼んでいる`, () => {
      expect(readSource(file)).toContain(hookCall);
    });
  });
```

次にする

```text
    it.each(dependencies)("メモ化の依存の比較に %s がある", (dependency) => {
      // 失敗したら: 今日の値が依存から外れ、日をまたいでも下流が再計算されない
      expect(code).toMatch(new RegExp(`\\$\\[\\d+\\] !== ${dependency}\\b`));
    });

    if (hookCall !== undefined) {
      it(`ソースが今日を返すフック ${hookCall} を呼んでいる`, () => {
        expect(readSource(file)).toContain(hookCall);
      });
    }
  });
```

- [ ] **Step 2: 通ることを確かめる**

Run: `cd .worktrees/issue-210-home-date && npx prettier --write src/__tests__/reactCompilerToday.contract.test.ts && NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --verbose --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`Tests: 30 passed, 30 total`。検証 1 が 4 件（`src/features/routine/hooks/useHomeViewDateState.ts の useHomeViewDateState は本体の最初の文が "use no memo" である` を含む）、体重・食事・カレンダー・家計簿が各 4 件、`useHomeViewState.ts` が 6 件（依存 3 件）、`useHomeViewControls.ts` が 4 件（`_c(`・sentinel・依存 2 件。`hookCall` の確認は無い））

（このテストは Task 2・3 の実装の後に直すため、「先に落ちる」確認は Step 3〜5 の変異で行う。）

- [ ] **Step 3: 空振り防止を確かめる（L-690。テストには含めない）**

`transpileModule` の `target`・`module` を一時的に外すと、コンパイラがフックを認識せず `_c(` が出なくなる。前提確認（検証 2）がそれを捕まえることを確かめる。

```bash
cd .worktrees/issue-210-home-date && BK=".git/worktrees/issue-210-home-date/home-date-backup" && mkdir -p "$BK" && cp src/__tests__/reactCompilerToday.contract.test.ts "$BK/" && python3 - <<'EOF'
p = "src/__tests__/reactCompilerToday.contract.test.ts"
s = open(p).read()
old = "      target: ts.ScriptTarget.ESNext,\n      module: ts.ModuleKind.ESNext,\n"
assert s.count(old) == 1
open(p, "w").write(s.replace(old, ""))
EOF
NODE_ENV=test TZ=Asia/Tokyo npx jest src/__tests__/reactCompilerToday.contract.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ --verbose 2>&1 | grep -E "✕|Tests:" | sed -E 's/ \([0-9]+ ms\)//' | sort | uniq -c; cp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && cmp "$BK/reactCompilerToday.contract.test.ts" src/__tests__/reactCompilerToday.contract.test.ts && echo RESTORED
```

Expected（試作で確認済み）: `Tests: 15 failed, 15 passed, 30 total`。`React Compiler でコンパイルされている（出力に _c( がある）` が 6 件、依存の比較が 9 件（`currentDayOfWeek`・`isTodayHoliday`・`today` が各 2 件、`currentDate`・`todayKey`・`todayStr` が各 1 件）落ちる。最後に `RESTORED`。

- [ ] **Step 4: 変異の確認（設計書「契約テスト › 変異の確認」の 3 通り。テストには含めない）**

- (a) `useHomeViewDateState` の `"use no memo"` を外す → 検証 1 が落ちる
- (b) 日付ラベル・祝日フラグを `useState` の初期値に戻す（origin/main の形に、Task 2 の改名と `"use no memo"` を足したもの。「設計書との差異」6）→ **Jest の日またぎの単体テストだけ**が落ち、契約テストは落ちない
- (c) `useHomeViewControls` の描画時の既定のタブを、`isTodayHoliday` ではなく `getIsTodayHoliday()` の描画時の呼び出しで求める → 検証 2(b)（`メモ化の依存の比較に isTodayHoliday がある`）が落ちる

```bash
cd .worktrees/issue-210-home-date && BK=".git/worktrees/issue-210-home-date/home-date-backup" && mkdir -p "$BK" && git show origin/main:src/features/routine/hooks/useHomeViewDateState.ts > "$BK/useHomeViewDateState.orig.ts" && cp src/features/routine/hooks/useHomeViewDateState.ts src/features/routine/hooks/useHomeViewControls.ts "$BK/" && python3 - "$BK/useHomeViewDateState.orig.ts" <<'EOF'
import os, subprocess, sys
from pathlib import Path

ORIGINAL_DATE_STATE = sys.argv[1]
CONTRACT = "src/__tests__/reactCompilerToday.contract.test.ts"
DATE_TESTS = [
    "src/features/routine/hooks/__tests__/useHomeViewDateState.test.tsx",
    "src/features/routine/hooks/__tests__/useHomeViewState.test.tsx",
]
MUTATIONS = [
    ('(a) useHomeViewDateState の "use no memo" を外す',
     "src/features/routine/hooks/useHomeViewDateState.ts",
     '}: UseHomeViewDateStateParams) => {\n  "use no memo";\n',
     "}: UseHomeViewDateStateParams) => {\n",
     [CONTRACT]),
    ('(b) 日付ラベル・祝日フラグを useState の初期値に戻す（origin/main の形＋"use no memo"）',
     "src/features/routine/hooks/useHomeViewDateState.ts", None, None,
     [CONTRACT, *DATE_TESTS]),
    ("(c) 描画時の既定のタブを getIsTodayHoliday() の描画時の呼び出しで求める",
     "src/features/routine/hooks/useHomeViewControls.ts",
     "createDefaultHomeViewMode(canUseWindow, isTodayHoliday, currentDayOfWeek),",
     "createDefaultHomeViewMode(canUseWindow, getIsTodayHoliday(), currentDayOfWeek),",
     [CONTRACT]),
]

for label, path, old, new, tests in MUTATIONS:
    file = Path(path)
    original = file.read_text()
    if old is None:
        # 関数名は Task 2 の改名に合わせ、"use no memo" は残す（ディレクティブの確認は通る形にする）
        mutated = Path(ORIGINAL_DATE_STATE).read_text().replace(
            "createInitialIsTodayHoliday", "createIsTodayHoliday")
        head = "}: UseHomeViewDateStateParams) => {\n"
        assert mutated.count(head) == 1
        mutated = mutated.replace(head, head + '  "use no memo";\n')
    else:
        assert original.count(old) == 1, (label, old)
        mutated = original.replace(old, new)
    try:
        file.write_text(mutated)
        result = subprocess.run(
            ["npx", "jest", *tests, "--verbose",
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
for f in useHomeViewDateState.ts useHomeViewControls.ts; do cmp "$BK/$f" "src/features/routine/hooks/$f" || echo "DIFF: $f"; done; echo CHECKED
```

Expected（試作で確認済み。`(n ms)` の表示は除く）:

```text
## (a) useHomeViewDateState の "use no memo" を外す: src/features/routine/hooks/useHomeViewDateState.ts
Tests:       1 failed, 29 passed, 30 total
  ✕ src/features/routine/hooks/useHomeViewDateState.ts の useHomeViewDateState は本体の最初の文が "use no memo" である
## (b) 日付ラベル・祝日フラグを useState の初期値に戻す（origin/main の形＋"use no memo"）: src/features/routine/hooks/useHomeViewDateState.ts
Tests:       3 failed, 36 passed, 39 total
  ✕ 平日から祝日へ日をまたいだ後の再描画で、日付ラベル・祝日フラグ・「祝日」タブの位置が新しい今日になる
  ✕ 平日から祝日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが true になる
  ✕ 祝日から平日へ日をまたいだ後の再描画で、日付ラベルが新しい日になり祝日フラグが false になる
## (c) 描画時の既定のタブを getIsTodayHoliday() の描画時の呼び出しで求める: src/features/routine/hooks/useHomeViewControls.ts
Tests:       1 failed, 29 passed, 30 total
  ✕ メモ化の依存の比較に isTodayHoliday がある
CHECKED
```

(b) で契約テストの 30 件がすべて通ること（落ちる 3 件は日またぎの単体テスト）が、設計書の「`useState` の初期値に戻す退行は契約テストでは捕まえず、単体テストで捕まえる」の確認になる。(c) は不具合（固定）を起こさない（同じメモ化のブロックに `currentDayOfWeek` が入り、日をまたぐと計算し直される。設計書）が、規約（描画時に今日に依存する関数を呼ばない）違反として落ちる。参考: (c) では `useHomeViewControls.test.tsx` の「…`getIsTodayHoliday` は描画中に呼ばない」も落ちる（このスクリプトは契約テストだけを流すので出ない）。`DIFF:` が出ないこと。結果（変異ごとの件数と落ちたテスト名）を `.superpowers/sdd/2026-11-07-home-date-rollover/` の Task 4 の報告に書く（Step 3 の結果も）。

- [ ] **Step 5: 型・lint・整形を確かめる**

Run: `cd .worktrees/issue-210-home-date && grep -nE "TODAY_HOOK_FILE|TODAY_HOOK_NAMES|dependency:" src/__tests__/reactCompilerToday.contract.test.ts; npm run typecheck && npm run lint && npx prettier --check src/__tests__/reactCompilerToday.contract.test.ts`
Expected: `grep` は何も出さない。残りはすべて exit 0。

（コミットしない）

---

## Task 5: 規約・確認表・全体の検証

**Files:**

- Modify: `docs/02-development/coding-standards.md:67-69,90`
- Modify: `docs/03-testing/test-matrix.md:73`（2-29 の備考）と、その直後に 2-30 の行
- Modify: `src/features/test-matrix/initialData.ts:254-260`（2-29 の直後に 2-30）
- Modify: `src/features/test-matrix/detailed-test-cases/group-01-04.ts:1155-1166`（`2-29-1` の `expected` と、`"2-30"` の追加）

**Interfaces:**

- Consumes: Task 2 の `src/features/routine/hooks/useHomeViewDateState.ts`、Task 4 の `USE_NO_MEMO_TARGETS`・`TODAY_TARGETS`。確認表の型 `TestItem`（`{ id; label; pc; sp; note }`）・`DetailTestCase`（`{ id; scenario; expected; pc; sp; note }`）。画面の文字（`src/features/routine/locales/ja.json`・`src/config/locales/ja.json`）: 祝日のバッジとタブ「🎌 祝日」、曜日のタブ「日曜日」〜「土曜日」、カテゴリの「すべて」、「+」の aria-label「ルーティンを追加」、ヘッダーの「編集モードに切り替え」、フォームの見出し「新しいルーティン」、曜日の欄「曜日・祝日 \*」とボタン「日」〜「土」「祝」。
- Produces: 新しい確認の ID **2-30**（2-C の表・`routine-display` の 2-29 の直後。既存の ID は変えない・振り直さない）。

- [ ] **Step 1: コーディング規約を直す**

`docs/02-development/coding-standards.md`

次の部分を

```text
- **新しく今日を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足してください。コンパイル結果で、今日が固定されていないことを確かめます。
- **対象外**: イベントハンドラの中、`useState` の初期化関数の中で取る今日は対象外です（描画のたびに求める値ではありません）。
```

次にする

```text
- **機能側の関数（祝日の判定など）を描画のたびに呼ぶ必要があるとき**は、共通フックでは書けない（`src/hooks/` は `src/features/` を参照しない）ので、機能側に本体の最初の文が `"use no memo"` の関数を置いてかまいません（例: `src/features/routine/hooks/useHomeViewDateState.ts`）。その関数は、契約テストの `USE_NO_MEMO_TARGETS` に足してください。
- **新しく今日を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足してください。コンパイル結果で、今日が固定されていないことを確かめます。
- **対象外**: イベントハンドラの中、`useState` の初期化関数の中で取る今日は対象外です（描画のたびに求める値ではありません）。ただし、`useState` の初期化で取る今日を画面に出す今日（日付のラベル・祝日・既定の選択）に使うと、日をまたいでも古いまま残ります（#210）。表示に使う今日は描画のたびに求めてください。
```

次の部分を

```text
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか確認してください（React Compiler で固定される。「React Compiler と今日・現在時刻」）。
```

次にする

```text
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか、`useState` の初期化で取った今日を画面に出す今日（日付のラベル・祝日・既定の選択）に使っていないか確認してください（前者は React Compiler で固定され、後者は日をまたいでも古いまま残る。「React Compiler と今日・現在時刻」）。
```

（「最終更新日」は既に `2026年11月7日` なので変えない。）

- [ ] **Step 2: `docs/03-testing/test-matrix.md` の 2-29 を直し、2-30 を足す**

2-29 の備考から括弧書き（この修正で正しくなくなる制約）を**消すだけ**にし、その直後に 2-30 の行を挿入する（表の桁揃えは後で prettier に任せる）。

```bash
cd .worktrees/issue-210-home-date && python3 - <<'EOF'
p = "docs/03-testing/test-matrix.md"
lines = open(p).read().split("\n")
idx = [i for i, l in enumerate(lines) if l.startswith("| 2-29 ")]
assert len(idx) == 1
assert not any(l.startswith("| 2-30 ") for l in lines)
i = idx[0]
old = "開いたまま日をまたいで操作すると、新しい今日の曜日が先頭になる（選択中の曜日・日付の表示は前日のまま）"
assert lines[i].count(old) == 1
lines[i] = lines[i].replace(old, "開いたまま日をまたいで操作すると、新しい今日の曜日が先頭になる")
lines.insert(i + 1, "| 2-30 | 0 時をまたいだ後の日付・祝日・選択中の曜日 | ✅ | ⬜ | ⬜ | 開いたまま日をまたいで操作すると、日付の表示・祝日のバッジ・選択中の曜日（自分でタブを選んでいなければ）が新しい今日になる |")
open(p, "w").write("\n".join(lines))
EOF
npx prettier --write docs/03-testing/test-matrix.md && grep -nE '^\| 2-(29|30) ' docs/03-testing/test-matrix.md
```

Expected: 2 行が出る（73 行目が 2-29 で備考の末尾に括弧書きが無い、74 行目が 2-30）。`git diff docs/03-testing/test-matrix.md` で、変わったのが 2-C の表の中だけであることを確かめる（備考の列が広がり、prettier の桁揃えでその表の他の行の空白が変わるのはよい）。

- [ ] **Step 3: `initialData.ts` に 2-30 を足す**

`src/features/test-matrix/initialData.ts`

次の部分を

```text
        id: "2-29",
        label: "0 時をまたいだ後の曜日の並び順",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする

```text
        id: "2-29",
        label: "0 時をまたいだ後の曜日の並び順",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "2-30",
        label: "0 時をまたいだ後の日付・祝日・選択中の曜日",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

- [ ] **Step 4: 詳細の確認手順を直す・足す（L-368）**

`src/features/test-matrix/detailed-test-cases/group-01-04.ts`

(a) `2-29-1` の `expected` から、この修正で正しくなくなる一文を**消すだけ**にする（置き換えの文は足さない。日付・選択中のタブの期待は 2-30 に任せる）。

次の部分を

```text
        "「すべて」を押したあと、曜日のタブの左端が新しい今日の曜日になり、またぐ前の今日の曜日は右端（「🎌 祝日」のタブの左隣）へ回る。選択中のタブと、画面上部の日付の表示は、またぐ前の日のまま（再読み込みで新しい日に揃う。既知の制約）。またいだ直後で何も操作していないうちは、並びが変わっていなくてよい",
```

次にする

```text
        "「すべて」を押したあと、曜日のタブの左端が新しい今日の曜日になり、またぐ前の今日の曜日は右端（「🎌 祝日」のタブの左隣）へ回る。またいだ直後で何も操作していないうちは、並びが変わっていなくてよい",
```

(b) 2-30 を足す。祝日をまたぐケース（前日→祝日、祝日→翌日）と、利用者がタブを自分で選んでいるケースを別にし、ルーティン追加フォームの既定の曜日も確かめる。祝日は `src/lib/holidays-modules/constants.ts` の実在の祝日（11-23 勤労感謝の日、1 月の第 2 月曜 成人の日）から決めた。

次の部分を

```text
  ],
  "3-1": [
```

次にする

```text
  ],
  "2-30": [
    {
      id: "2-30-1",
      scenario:
        "端末のタイムゾーンが日本（JST）であることを確かめ、今日も明日も祝日でなく、月末・年末をまたがない日に行う。ホームを開いてページを再読み込みし（曜日のタブを押していない状態にする）、画面上部の日付の表示が今日（例:「2026年11月4日水曜日」）で、今日の曜日のタブ（左端）が選ばれていることを確かめる。端末の日時を23:59付近にし、ホームを開いたまま0時をまたぐ（端末の日時設定で翌日の0:00過ぎに進めてもよい。ページの再読み込みはしない）。またいだ後に、カテゴリの絞り込みで別のカテゴリを押し、続けて「すべて」を押す（画面を再描画させる操作）。続けて、編集モードでなければヘッダーの「編集モードに切り替え」を押し、日付の表示の右の「+」（ルーティンを追加）を押す",
      expected:
        "「すべて」を押したあと、画面上部の日付の表示が新しい日（例:「2026年11月5日木曜日」）になり、選ばれているタブが新しい今日の曜日のタブ（左端）に移り、一覧にその曜日のルーティンが出る。「+」で開いた「新しいルーティン」の「曜日・祝日 *」では、新しい今日の曜日（例:「木」）だけが選ばれている。またいだ直後で何も操作していないうちは、表示が前の日のままでよい",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "2-30-2",
      scenario:
        "祝日の前日から祝日へまたぐ。端末のタイムゾーンが日本（JST）であることを確かめ、端末の日時を手動で2026年11月22日（日）23:58に設定する（翌日の11月23日（月）は勤労感謝の日。この日付を過ぎていれば、2027年1月10日（日）23:58〜1月11日（月・成人の日）でもよい）。ホームを開いてページを再読み込みし（曜日のタブを押していない状態にする）、日付の表示の横に「🎌 祝日」のバッジが無く、「🎌 祝日」のタブが右端にあり、「日曜日」のタブ（左端）が選ばれていることを確かめる。ホームを開いたまま0時をまたぐ（ページの再読み込みはしない）。またいだ後に、カテゴリの絞り込みで別のカテゴリを押し、続けて「すべて」を押す。続けて、編集モードでなければヘッダーの「編集モードに切り替え」を押し、日付の表示の右の「+」（ルーティンを追加）を押す",
      expected:
        "「すべて」を押したあと、日付の表示が「2026年11月23日月曜日」（2027年で行った場合は「2027年1月11日月曜日」）になり、その横に「🎌 祝日」のバッジが出る。「🎌 祝日」のタブが左端に移って選ばれ、一覧に祝日のルーティンが出る。「+」で開いた「新しいルーティン」の「曜日・祝日 *」では「祝」だけが選ばれている",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "2-30-3",
      scenario:
        "祝日から翌日へまたぐ。端末のタイムゾーンが日本（JST）であることを確かめ、端末の日時を手動で2026年11月23日（月・勤労感謝の日）23:58に設定する（2027年1月11日（月・成人の日）23:58でもよい）。ホームを開いてページを再読み込みし（曜日のタブを押していない状態にする）、日付の表示の横に「🎌 祝日」のバッジがあり、「🎌 祝日」のタブ（左端）が選ばれていることを確かめる。ホームを開いたまま0時をまたぐ（ページの再読み込みはしない）。またいだ後に、カテゴリの絞り込みで別のカテゴリを押し、続けて「すべて」を押す",
      expected:
        "「すべて」を押したあと、日付の表示が「2026年11月24日火曜日」（2027年で行った場合は「2027年1月12日火曜日」）になり、「🎌 祝日」のバッジが消える。「🎌 祝日」のタブは右端に移り、「火曜日」のタブ（左端）が選ばれ、一覧に火曜日のルーティンが出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "2-30-4",
      scenario:
        "利用者がタブを自分で選んでいる場合。今日も明日も祝日でなく、月末・年末をまたがない日に行う。ホームを開いてページを再読み込みし、今日でも明日でもない曜日のタブ（例: 今日が水曜日なら「金曜日」）を押す。端末の日時を23:59付近にし、ホームを開いたまま0時をまたぐ（ページの再読み込みはしない）。またいだ後に、カテゴリの絞り込みで別のカテゴリを押し、続けて「すべて」を押す。最後に、新しい今日の曜日のタブ（左端）を押す",
      expected:
        "「すべて」を押したあと、日付の表示は新しい日になるが、選ばれているタブは押しておいた曜日（例:「金曜日」）のまま変わらない（自分で選んだタブは、日をまたいでも保たれる）。新しい今日の曜日のタブを押すと、そのタブが選ばれ、一覧がその曜日のルーティンになる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "2-30-5",
      scenario:
        "またいだ後の最初の操作がタブを押すことの場合。今日も明日も祝日でなく、月末・年末をまたがない日に行う。ホームを開いてページを再読み込みし（曜日のタブを押していない状態にする）、端末の日時を23:59付近にして、何も触らずに0時をまたぐ（ページの再読み込みはしない）。またいだ後の最初の操作として、新しい今日の曜日のタブ（左から2番目。まだ並びは前の日のまま）を押す",
      expected:
        "押したあと、日付の表示が新しい日になり、押したタブ（新しい今日の曜日）が選ばれて左端に移り、一覧がその曜日のルーティンになる。またぐ前の日の曜日のタブは右端（「🎌 祝日」のタブの左隣）へ回る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "3-1": [
```

（2-29-1 の期待結果（並び順）と 2-30 は矛盾しない: 2-30-1 も 2-29-1 と同じ操作で、並び順に加えて日付と選ばれているタブが新しい今日になることを見る。2-30-5 の「左から2番目」は、またぐ前の並び（左端が前の日の曜日）で新しい今日の曜日が 2 番目にあるため。）

- [ ] **Step 5: 確認表のテストと整形を確かめる**

Run: `cd .worktrees/issue-210-home-date && npx prettier --write src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-01-04.ts docs/02-development/coding-standards.md && NODE_ENV=test npx jest src/features/test-matrix --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: PASS（`Tests: 314 passed, 314 total`。作業前は 313 件。`detailedTestCases.test.ts` の「ID は項目 ID を接頭辞に持ち、項目の中で重複しない」が 2-30 でも通る）

- [ ] **Step 6: 使われていない export が残っていないことを確かめる（L-311）**

Run: `cd .worktrees/issue-210-home-date && node <dev-flow-kit>/scripts/node/find-unused-exports.mjs --base origin/main`
Expected: このプランで足した・変えた export（`HomeSelectedViewMode`・`createDefaultHomeViewMode`・`resolveHomeViewMode`・`createIsTodayHoliday`・`setHomeViewModeState`・`createSetHomeViewModeAction`・`createInitialHomeViewControlState`・`createHomeViewControlRuntimeStateResult`・`useHomeViewControl*`・`useHomeViewControls`・`useHomeViewDateState`）が `UNUSED`・`TESTONLY` に出ない。`src/features/routine/pages/homeTypes.ts` の `HomeDisplayState`・`HomeCrudState`・`HomeRoutineOps`・`HomePageNavigationState` は元から `UNUSED`（このプランの範囲外。報告に書くだけ）。

- [ ] **Step 7: 全体の検証**

Run（1 つずつ。各コマンドの結果を報告に書く）:

```bash
cd .worktrees/issue-210-home-date && NODE_ENV=test npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/' 2>&1 | grep -E "^FAIL|Tests:|Test Suites:|SIGSEGV" | sort -u
```

Expected: `FAIL` が無い、`Test Suites: 1341 passed, 1341 total`・`Tests: 7012 passed, 7012 total`。SIGSEGV のスイートがあれば単独で実行して通ることを確かめる（件数はその分減る）。

```bash
cd .worktrees/issue-210-home-date && npm run typecheck && npm run typecheck:functions && npm run lint && npm run tailwind:scan
```

Expected: すべて exit 0。`tailwind:scan` は `No Tailwind shorthand issues found.`

```bash
cd .worktrees/issue-210-home-date && npm run build
```

Expected: exit 0（`next build --webpack`。React Compiler を通した本番のビルド）。

```bash
cd .worktrees/issue-210-home-date && git status --short && npx prettier --check $(git diff --name-only) $(git ls-files --others --exclude-standard)
```

Expected: `git status --short` に出るのは、このプランの「ファイルの構成」の表のファイルと、元から未追跡の `docs/superpowers/specs/2026-11-07-home-date-rollover-design.md`・このプラン `docs/superpowers/plans/2026-11-07-home-date-rollover.md` だけ（`useHomeViewState.viewMode.test.tsx` は `??`）。prettier は `All matched files use Prettier code style!`

（コミットしない）

---

## セルフレビュー

### 設計書の要件 → タスク

| 設計書の要件                                                                                                                                                                                                                      | タスク                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 決めたこと 1: 日付ラベル・祝日フラグは日をまたいだ後の再描画で新しい今日になる                                                                                                                                                    | Task 2 Step 3                                                                            |
| 日付ラベル・祝日フラグを `"use no memo"` の関数（`useHomeViewDateState`。機能側 `src/features/routine/hooks/`）で描画のたびに求める。ディレクティブは本体の最初の文。`canUseWindow` が false なら空文字・false。「Initial」の改名 | Task 2 Step 3（`createIsTodayHoliday` に改名）                                           |
| 決めたこと 2・4: 選んでいなければ今日に追従。押した時点の既定のタブと違うときだけ「選んでいる」、既定のタブを押すと追従に戻す                                                                                                     | Task 3 Step 4(a)(b)(h)(i)                                                                |
| state `{ mode: HomeViewMode \| null }`（初期値 `{ mode: null }`）、押すたびに新しいオブジェクト                                                                                                                                   | Task 1 Step 3（型）、Task 3 Step 4(a)(e)                                                 |
| 既定のタブ（祝日なら holiday、そうでなければ今日の曜日、`canUseWindow` が false なら今日の曜日）を描画のたびに `isTodayHoliday`・`currentDayOfWeek` から求める。表示するタブ = `mode ?? 既定`                                     | Task 1 Step 3（`createDefaultHomeViewMode`・`resolveHomeViewMode`）、Task 3 Step 4(i)(j) |
| `setViewModeAction` はハンドラの本体で `getIsTodayHoliday()`・`toJstDay(new Date())` から既定を求めて比べる。`getIsTodayHoliday` を作る側まで渡す経路を残す。保存は押したタブのまま                                               | Task 3 Step 4(a)(b)(h)、「設計書との差異」3                                              |
| 選択中のタブの初期値を 1 回だけ求める作りをやめる（`useHomeViewControlInitialState`・`homeViewControlStateActions` ほか）                                                                                                         | Task 3 Step 4(c)(d)(g)、「設計書との差異」1・2                                           |
| 決めたこと 3・範囲外: 0 時の自動再描画、保存した `viewMode` の読み出し、タイムゾーンの統一、ホーム以外                                                                                                                            | どのタスクでも触らない（Global Constraints「変えないもの」）                             |
| ルーティン追加フォームの既定の曜日が表示するタブに連動する                                                                                                                                                                        | Task 3 Step 2（(a)(b) で `resolveHomeRoutineFormDay`）、Task 5 Step 4（2-30-1・2-30-2）  |
| 契約テスト 1: `startsWithUseNoMemo` を `(file, 関数名)` の組に、対象を `{ file, name }` の配列に（`useToday.ts` の 3 つ＋`useHomeViewDateState`）                                                                                 | Task 4 Step 1（`USE_NO_MEMO_TARGETS`）                                                   |
| 契約テスト 1: `TodayTarget` を `dependencies: string[]`・`hookCall?: string` に、`hookCall` の説明を機能側の関数を含む形に                                                                                                        | Task 4 Step 1                                                                            |
| 契約テスト 2(a): `useHomeViewState.ts` に `currentDate`・`isTodayHoliday`                                                                                                                                                         | Task 4 Step 1                                                                            |
| 契約テスト 2(b): 既定のタブを求める側（`useHomeViewControls.ts`）の `isTodayHoliday`・`currentDayOfWeek`                                                                                                                          | Task 4 Step 1、「設計書との差異」5                                                       |
| 変異の確認 3 通り（(a) ディレクティブを外す → 検証 1、(b) `useState` に戻す → 単体テストだけ、(c) `getIsTodayHoliday()` に替える → 検証 2(b)）と報告への記録                                                                      | Task 4 Step 4（空振り防止は Step 3）                                                     |
| 規約: 機能側の `"use no memo"` の関数も可・`USE_NO_MEMO_TARGETS` に足す／`useState` の初期化で取る今日の注意／レビューの観点                                                                                                      | Task 5 Step 1                                                                            |
| 確認表 2-29: 制約の記述を消すだけ（md の括弧書き、`2-29-1` の一文）。ID は変えない                                                                                                                                                | Task 5 Step 2・4(a)                                                                      |
| 確認表 2-30（md・`initialData.ts`・詳細の 3 か所）。実在の祝日、祝日をまたぐケース（前日→祝日・祝日→翌日）と自分で選んでいるケースを別に、フォームの既定の曜日、L-368 の前提・手順、2-29 と矛盾しない                             | Task 5 Step 2〜4                                                                         |
| テスト: 純粋関数（既定のタブ・表示するタブ・`setHomeViewModeState` の `{ mode: null }` への切り替え）。既存のテストを弱めずに書き換え                                                                                             | Task 1 Step 1、Task 3 Step 1(a)(b)                                                       |
| テスト: 日付ラベル・祝日フラグの日またぎ（時計に連動する祝日関数、実在の祝日の前日 23:59 → 当日 0:01、その逆も）                                                                                                                  | Task 2 Step 1(a)(c)                                                                      |
| テスト: 選択中のタブ (a)〜(f)。(e) は前日に描画→再描画なしで時計を進めて押す、`result.current` で観測、`{ mode: null }` のまま押すケースと、先に別のタブを押して戻した状態からのケース                                            | Task 3 Step 2（(d) は Step 1(h)(i) と Task 1）                                           |
| ハンドラを描画時の既定に戻すと (e) だけが落ちる／`null` を素の `null` にすると (e) の「`{ mode: null }` のまま押す」が落ちる                                                                                                      | Task 3 Step 6                                                                            |
| `useJstDay` をモックする配線テストでは `setViewModeAction` の既定との比較を確かめない                                                                                                                                             | Task 3 Step 1(k)                                                                         |
| 書き換える既存テストの全列挙（設計書の 11 本＋`homeViewControlRuntimeStateResult.test.ts`。`homeViewControlsResult.test.ts` は変えない）と `act()` の洗い出し                                                                     | Task 3 Step 1、Global Constraints（L-686）、「設計書との差異」1                          |
| 全体: `npm test`（除外の上書き）・`typecheck`・`typecheck:functions`・`lint`・`tailwind:scan`・`build`                                                                                                                            | Task 5 Step 7                                                                            |

### 型・関数名の整合

- `HomeSelectedViewMode = { mode: HomeViewMode | null }` — Task 1 で `homeTypes.ts` に定義し、Task 3 の `homeViewStateActions.ts`・`homeViewStateHookActions.ts`・`useHomeViewControlRuntimeState.ts`・`homeViewControlRuntimeStateResult.ts`・`useHomeViewControlActions.ts` と `useHomeViewControls.test.tsx` が同じ名前で import する。
- `createDefaultHomeViewMode(canUseWindow, isTodayHoliday: boolean, currentDayOfWeek)` — Task 1 で定義、Task 3 の `useHomeViewControls.ts`（描画時。`isTodayHoliday` の値）と `useHomeViewControlActions.ts`（押した時点。`getIsTodayHoliday()`・`toJstDay(new Date())`）で使う。Task 3 Step 6・Task 4 Step 4 の変異のスクリプトの置換文字列は、Task 3 Step 4(h)(i) のコードと一字一句同じ（試作で `assert` が通ることを確認済み）。
- `resolveHomeViewMode(selectedViewMode, defaultViewMode)` — Task 1 で定義、Task 3 の `useHomeViewControls.ts` で使う。
- `createIsTodayHoliday` — Task 2 で `createInitialIsTodayHoliday` から改名し、`useHomeViewDateState.ts`・`homeViewStateActions.test.ts`・Task 4 Step 4 の変異 (b)（`replace("createInitialIsTodayHoliday", "createIsTodayHoliday")`）で同じ名前。
- `setSelectedViewMode`・`selectedViewMode` — Task 3 の state・結果・アクション・テストで統一（旧名 `setViewMode`・`viewMode` の state は残さない。`view.viewMode`・`setViewModeAction` は公開の名前として変えない）。
- `createSetHomeViewModeAction({ getDefaultViewMode, setSelectedViewMode })`・`setHomeViewModeState({ mode, defaultViewMode, setSelectedViewMode, saveViewMode })` — Task 3 の実装とテスト（`homeViewStateHookActions.test.ts`・`useHomeViewControlActions.test.tsx`・`homeViewStateActions.test.ts`）で同じキー。
- `useHomeViewControls({ canUseWindow, currentDayOfWeek, getIsTodayHoliday, isTodayHoliday })`・`useHomeViewControlActions({ canUseWindow, getIsTodayHoliday, isEditMode, setFilterCategory, setIsEditMode, setSelectedViewMode })`・`useHomeViewControlState()`・`useHomeViewControlInitialState()`・`createInitialHomeViewControlState()` — Task 3 の実装と、モックの合成テストの `toHaveBeenCalledWith` が一致する。
- 契約テストの `USE_NO_MEMO_TARGETS` の `name: "useHomeViewDateState"` と `file` は Task 2 の関数の形（`export const useHomeViewDateState = (… ) => { "use no memo"; …`）と一致し、`TODAY_TARGETS` の `dependencies` の変数名 `currentDayOfWeek`・`currentDate`・`isTodayHoliday`（`useHomeViewState.ts`）・`isTodayHoliday`・`currentDayOfWeek`（`useHomeViewControls.ts`）は Task 2・3 の変数名と一致する。Task 5 の `coding-standards.md` は `USE_NO_MEMO_TARGETS`・`TODAY_TARGETS` の名前で参照する。
- 確認表の ID 2-30 は md・`initialData.ts`・詳細のキー `"2-30"` とケース ID `2-30-1`〜`2-30-5` で一致する。
- プレースホルダーの確認: 「TBD」「後で」「適切に」の類は無い。すべてのコードの Step に実際のコードがある。
