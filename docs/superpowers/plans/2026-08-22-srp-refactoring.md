# Single Responsibility Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use subagents unless the user explicitly requests delegation.

**Goal:** 本番コードを変更理由ごとのモジュールへ分割し、全体再監査で未対応の単一責任違反が0件になるまで、回数を記録しながらリファクタリングを繰り返す。

**Architecture:** 公開APIと振る舞いを維持したまま、日付計算・ドメイン集計・表示モデル・I/Oなどの責務クラスタを機能ディレクトリ内の小さなモジュールへ抽出する。既存の集約ファイルは必要な間だけ互換barrelとして残し、依存は純粋ロジックから組み立て層へ一方向にする。

**Tech Stack:** Next.js 16、React 19、TypeScript 5、Jest 30、React Testing Library、ESLint、Prettier

**Spec:** `docs/superpowers/specs/2026-08-22-srp-refactoring-design.md`

## Global Constraints

- 対象は `src/`、`firebase-functions/src/`、`tools/` の保守対象となる本番コード。
- テスト、Storybook、E2E、ロケール、生成物、単一目的の静的データは、変更理由の混在がない限り除外する。
- 表示、保存形式、同期payload、URL、公開import経路を変更しない。
- 新しいnpm依存関係を追加しない。
- コード変更前に対象テストを確認し、不足する契約だけを先にテストで固定する。
- 各ループで対象テスト、`npm run typecheck`、`npm run verify` を実行する。
- リポジトリ配下の `.worktrees/` がJest探索へ混入する環境では、既存worktreeを削除せず、隔離worktreeをJestの `rootDir` として検証する。隔離worktree自身の絶対パスにも `/.worktrees/` が含まれるため、`testPathIgnorePatterns` へこの文字列を追加しない。
- コミット、push、PR作成は、ユーザーから明示的に指示されるまで行わない。
- 作業開始前に `node_modules/next/dist/docs/` のテスト・設定とServer/Client Componentに関係するガイドを確認する。今回の抽出でNext.js APIを変更しない場合も、AGENTS.md遵守の確認記録を残す。

## Loop Counting Rules

- 「全体監査 → 1責務クラスタの分割 → 対象検証 → `npm run verify` → 再監査」までを1ループと数える。
- 複数候補を同時に変更しない。初期候補4件は最低4ループとする。
- 全体監査で未対応候補が0件だった確認も最終ループとして1回数える。
- 実行中に `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md` を作り、各ループについて候補、判断、変更ファイル、テスト結果、verify結果を追記する。
- 最終報告では総ループ数、分割済み責務、単一責任と判断して除外した大型ファイル、検証結果を示す。

---

### Task 0: 作業環境と監査ログを準備する

**Files:**

- Create: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`
- Inspect: `.github/copilot-instructions.md`
- Inspect: `AGENTS.md`
- Inspect: `jest.config.*`
- Inspect: `node_modules/next/dist/docs/`
- Inspect: `jest.config.ts`

- [ ] **Step 1: 作業ツリーと現在ブランチを確認する**

Run: `git status --short && git branch --show-current && git worktree list`

Expected: ユーザーの既存変更と本計画書以外の未コミット変更を特定できる。既存変更は上書きしない。

- [ ] **Step 2: リポジトリルールとNext.jsガイドを読む**

Run: `sed -n '1,260p' .github/copilot-instructions.md && sed -n '1,220p' AGENTS.md && rg -n "Jest|testing|Server Component|Client Component" node_modules/next/dist/docs -g '*.md' | head -80`

Expected: 実装・検証・コミット禁止条件と、今回触れる境界に関係するNext.js 16の注意点を確認できる。

- [ ] **Step 3: ベースラインの対象テストを実行する**

Run: `npm test -- --runInBand`

Expected: 隔離worktreeを `rootDir` として全件PASS。失敗した場合はリファクタリングを始めず、既存失敗か環境問題かを切り分ける。

- [ ] **Step 4: `npm run verify` の探索範囲を確認する**

Run: `npm run verify`

Expected: PASS。隔離worktree内には別のworktreeが存在しないため、重複探索は発生しない。

- [ ] **Step 5: Jest探索設定を変更しない根拠を記録する**

隔離worktreeで次を比較し、`/.worktrees/` を追加するとworktree自身の全テストが除外されることを確認する。

Run: `npx jest --listTests --runInBand | wc -l && npx jest --listTests --runInBand --testPathIgnorePatterns='/.worktrees/' | wc -l`

Expected: 通常設定では全テストが列挙され、追加patternでは0件になる。`jest.config.ts` は変更せず、既存worktreeも削除しない。

- [ ] **Step 6: 監査ログを作る**

次の見出しを持つログを作る。

```markdown
# SRP Refactoring Loop Log

## Baseline

- Branch:
- Starting commit:
- Baseline tests:
- Baseline verify:

## Loop 1

- Candidate:
- Responsibilities found:
- Decision:
- Files changed:
- Targeted tests:
- Typecheck:
- Verify:
- Re-audit result:
```

Expected: 以後の各ループを連番で追記できる。

---

### Task 1 / Loop 1: 週間目標集計を責務別に分割する

**責務:** 週日付キー、目標定義復元、完了日の索引、ストリーク計算、進捗の組み立てが同居している。

**Files:**

- Create: `src/features/statistics/statistics/weeklyGoalDateKeys.ts`
- Create: `src/features/statistics/statistics/weeklyGoalDefinitions.ts`
- Create: `src/features/statistics/statistics/weeklyGoalCompletions.ts`
- Create: `src/features/statistics/statistics/weeklyGoalStreaks.ts`
- Modify: `src/features/statistics/statistics/weeklyGoals.ts`
- Modify: `src/features/statistics/__tests__/statistics.weekly-goals.test.ts`
- Create or split as justified: focused tests under `src/features/statistics/__tests__/`
- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

**Interfaces:**

- `weeklyGoalDateKeys.ts`: 日付キーの加算、JST日付から月曜始まりの週キーへの変換、週キー列の生成。
- `weeklyGoalDefinitions.ts`: 現在ルーティンと履歴snapshotから、選択週に表示する目標定義を復元する。
- `weeklyGoalCompletions.ts`: 履歴を1回走査し、目標・週・完了日の索引を作る。
- `weeklyGoalStreaks.ts`: 達成週のboolean列から現在・最長ストリークを計算する。
- `weeklyGoals.ts`: 入力を準備し、上記4責務を組み合わせて `WeeklyGoalProgress[]` を返す。

- [ ] **Step 1: 既存の公開契約とカバレッジを確認する**

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts --coverage --collectCoverageFrom='src/features/statistics/statistics/weeklyGoals.ts'`

Expected: 現在週・過去週、削除済みsnapshot、JST境界、重複排除、現在/最長ストリーク、履歴1回走査がPASSする。

- [ ] **Step 2: 不足する境界だけcharacterization testで固定する**

確認対象:

- 将来週を選択した場合、ストリーク終端が今日週を超えない。
- 同名目標は `goalId` で安定順序になる。
- snapshotの同じ目標について週後半の定義が週前半を上書きする。

追加した各テストは現実の未保護契約を表し、現行実装でPASSすることを確認する。挙動変更を意図しないリファクタリングなので、存在しない不具合を作るための人工的なFAILは追加しない。

- [ ] **Step 3: 純粋な日付責務を抽出する**

`DAY_MS`、`addDaysToDateKey`、`getWeekStartKeyFromDateKey`、`getWeekStartKey`、`buildWeekStartKeys` を `weeklyGoalDateKeys.ts` へ移す。外部公開は機能内で必要な最小限にする。

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: PASS。

- [ ] **Step 4: 目標定義の復元責務を抽出する**

`GoalDefinition`、目標ID解決、snapshot/current定義収集、選択週の定義解決を `weeklyGoalDefinitions.ts` へ移す。現在週は現在存在する目標のみ、過去週はsnapshot優先という既存ルールを維持する。

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: PASS。

- [ ] **Step 5: 完了索引の責務を抽出する**

`CompletionDaysByGoal`、完了ルーティンIDから目標IDへの復元、完了日の索引作成、件数取得を `weeklyGoalCompletions.ts` へ移す。`Object.entries(history)` は組み立て層で1回だけ作る。

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: PASS。履歴走査回数テストもPASS。

- [ ] **Step 6: ストリーク責務を抽出する**

`calculateStreaks` を `weeklyGoalStreaks.ts` へ移す。進行中の現在週が未達の場合だけ末尾を現在ストリーク判定から外す。

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: PASS。

- [ ] **Step 7: 組み立てファイルを確認する**

`weeklyGoals.ts` には公開パラメータ型、入力準備、抽出モジュールの合成、出力view model生成だけを残す。元の公開export `calculateWeeklyGoalProgress` とimport経路を維持する。

Run: `npm run typecheck && npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx`

Expected: PASS。

- [ ] **Step 8: 全体検証と再監査を行いLoop 1を記録する**

Run: `npm run verify && rg -n "from .*weeklyGoal" src/features/statistics/statistics src/features/statistics/__tests__`

Expected: PASS。循環依存と新しい責務混在がない。ログのLoop 1を完成させる。

---

### Task 2 / Loop 2: ヘッダーメニューの生成・表示・順序責務を分割する

**責務:** Todo動的項目生成、静的項目の権限/feature制御、汎用的な順序決定が同居している。

**Files:**

- Create: `src/hooks/headerMenuItemTypes.ts`
- Create: `src/hooks/headerMenuOrder.ts`
- Create: `src/hooks/dynamicTodoMenuItems.ts`
- Create: `src/hooks/staticHeaderMenuItems.ts`
- Modify: `src/hooks/headerMenuItemHelpers.ts`
- Modify: `src/hooks/headerMenuItemsBuilder.ts`
- Modify: direct consumers found by `rg -n "headerMenuItemHelpers" src`
- Split or modify: `src/hooks/__tests__/headerMenuItemHelpers.test.ts`
- Create: `src/hooks/__tests__/headerMenuOrder.test.ts`
- Create: `src/hooks/__tests__/dynamicTodoMenuItems.test.ts`
- Create: `src/hooks/__tests__/staticHeaderMenuItems.test.ts`
- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

**Interfaces:**

- `headerMenuItemTypes.ts`: `HeaderMenuItem` の型だけを所有する。
- `headerMenuOrder.ts`: TodoメニューIDの識別、legacy `todo-lists` の順位互換、pin位置、安定ソートを所有する。
- `dynamicTodoMenuItems.ts`: 可視Todoリストから動的メニュー項目を構築する。
- `staticHeaderMenuItems.ts`: `visibleFeatures`、管理者権限、route妥当性による静的項目の表示判定を所有する。
- `headerMenuItemHelpers.ts`: 既存import経路を壊さない再exportのみ。内部利用側は責務別モジュールを直接importする。

- [ ] **Step 1: 利用箇所と既存契約を確認する**

Run: `rg -n "headerMenuItemHelpers|sortByMenuOrder|toTodoListMenuItemId|buildDynamicTodoMenuItems|filterStaticHeaderMenuItems|orderHeaderMenuItems" src --glob '*.{ts,tsx}' && npm test -- --runInBand src/hooks/__tests__/headerMenuItemHelpers.test.ts src/hooks/__tests__/headerMenuItemsBuilder.test.ts`

Expected: 全利用箇所を列挙でき、既存テストがPASSする。

- [ ] **Step 2: テストを責務ごとのファイルへ分ける**

- 並び順、固定位置、legacy順位、静的 `todo-list-*` ID誤認防止を `headerMenuOrder.test.ts` へ移す。
- hidden除外、active状態、遷移前callbackを `dynamicTodoMenuItems.test.ts` へ移す。
- feature visibility、管理者限定、常時表示を `staticHeaderMenuItems.test.ts` へ移す。
- `headerMenuItemHelpers.test.ts` は互換exportテストだけに縮小するか、不要なら削除する。

Run: `npm test -- --runInBand src/hooks/__tests__/headerMenuOrder.test.ts src/hooks/__tests__/dynamicTodoMenuItems.test.ts src/hooks/__tests__/staticHeaderMenuItems.test.ts`

Expected: 移動直後も現行module経由でPASSする。

- [ ] **Step 3: 型と動的Todo責務を抽出する**

`HeaderMenuItem` を型moduleへ、Todo ID生成と `buildDynamicTodoMenuItems` を動的Todo moduleへ移す。Todo IDのlegacy順序判定に必要な関数は順序moduleから参照し、双方向importを作らない。

Run: `npm test -- --runInBand src/hooks/__tests__/dynamicTodoMenuItems.test.ts src/hooks/__tests__/headerMenuOrder.test.ts`

Expected: PASS。

- [ ] **Step 4: 静的表示責務を抽出する**

`FEATURE_KEY_MAP`、管理者限定ID、常時表示ID、route/featureフィルタを `staticHeaderMenuItems.ts` へ移す。

Run: `npm test -- --runInBand src/hooks/__tests__/staticHeaderMenuItems.test.ts`

Expected: PASS。

- [ ] **Step 5: 順序責務を抽出する**

`sortByMenuOrder`、順位算出、pin集合、`orderHeaderMenuItems` を `headerMenuOrder.ts` へ移す。decorate-sort-undecorateによるランク計算回数の特性を維持する。

Run: `npm test -- --runInBand src/hooks/__tests__/headerMenuOrder.test.ts src/hooks/__tests__/headerMenuItemsBuilder.test.ts`

Expected: PASS。

- [ ] **Step 6: 互換barrelと直接importを整理する**

外部向け既存importを壊さないよう `headerMenuItemHelpers.ts` から再exportする。内部の新規・変更コードは責務別moduleを直接importし、barrel経由の循環を避ける。

Run: `npm run typecheck && npm test -- --runInBand src/hooks/__tests__/headerMenuOrder.test.ts src/hooks/__tests__/dynamicTodoMenuItems.test.ts src/hooks/__tests__/staticHeaderMenuItems.test.ts src/hooks/__tests__/headerMenuItemsBuilder.test.ts src/hooks/__tests__/useHeaderMenuItems.test.ts`

Expected: PASS。

- [ ] **Step 7: 全体検証と再監査を行いLoop 2を記録する**

Run: `npm run verify && rg -n "headerMenuItemHelpers" src --glob '*.{ts,tsx}'`

Expected: PASS。互換用途以外の責務実装がbarrelへ残っていない。ログのLoop 2を完成させる。

---

### Task 3 / Loop 3: ルーティン表示helperをコンポーネント責務別に分割する

**責務:** カード、操作ボタン、フォーム見出し、基本項目、時間競合、任意項目、footerの文言と表示modelが同居している。

**Files:**

- Create: `src/features/routine/components/routineCardPresentation.ts`
- Create: `src/features/routine/components/routineItemPresentation.ts`
- Create: `src/features/routine/components/routineFormHeaderPresentation.ts`
- Create: `src/features/routine/components/routineFormCorePresentation.ts`
- Create: `src/features/routine/components/routineFormTimePresentation.ts`
- Create: `src/features/routine/components/routineFormOptionalPresentation.ts`
- Create: `src/features/routine/components/routineFormFooterPresentation.ts`
- Modify: `src/features/routine/components/helpers.ts`
- Modify: component consumers found by `rg -n "from [\"']\\./helpers[\"']" src/features/routine/components`
- Split or modify: `src/features/routine/__tests__/helpers.presentation.test.ts`
- Create: focused presentation tests under `src/features/routine/components/__tests__/`
- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

**Interfaces:**

- 各presentation moduleは、対応するコンポーネント群の文言、class生成、表示用formatだけを所有する。
- `helpers.ts` は既存import互換用の再exportだけを残す。
- componentからは対応するpresentation moduleを直接importする。

- [ ] **Step 1: helper利用箇所と既存契約を確認する**

Run: `rg -n "from [\"']\\./helpers[\"']" src/features/routine/components --glob '*.{ts,tsx}' && npm test -- --runInBand src/features/routine/__tests__/helpers.presentation.test.ts src/features/routine/components/__tests__/RoutineFormCoreFields.test.tsx src/features/routine/components/__tests__/RoutineFormOptionalFields.test.tsx src/features/routine/components/__tests__/RoutineTimeConflictWarning.test.tsx`

Expected: PASSし、関数・定数と利用コンポーネントの対応が列挙できる。

- [ ] **Step 2: presentationテストを責務別に分ける**

既存期待値を、カード、item、header、core、time、optional、footerのテストへ移す。単なる定数値の重複テストは増やさず、分岐を持つformatter/class builderを優先する。

Run: `npm test -- --runInBand src/features/routine/components/__tests__ --testPathPatterns='Presentation|RoutineForm|RoutineTime'`

Expected: 現行module経由でPASSする。

- [ ] **Step 3: カードとitem表示責務を抽出する**

- `routineCardPresentation.ts`: `ROUTINE_CARD_CONTENT_TEXT`、duration/notification/weekly-goal label、title class。
- `routineItemPresentation.ts`: action text、edit/delete label、swipe-only判定。

対応コンポーネントのimportを直接moduleへ変更する。

Run: `npm test -- --runInBand src/features/routine/__tests__/RoutineItem.render.test.tsx src/features/routine/__tests__/RoutineItem.actions.test.tsx src/features/routine/components/__tests__/SortableRoutineNormalDragItem.test.tsx`

Expected: PASS。

- [ ] **Step 4: フォームheader/core責務を抽出する**

- `routineFormHeaderPresentation.ts`: 見出し文言、共有title ID、作成/編集title。
- `routineFormCorePresentation.ts`: title/day/category文言、曜日・category button class。

Run: `npm test -- --runInBand src/features/routine/components/__tests__/RoutineForm.a11y.test.tsx src/features/routine/components/__tests__/RoutineFormCoreFields.test.tsx`

Expected: PASS。

- [ ] **Step 5: フォームtime/optional/footer責務を抽出する**

- `routineFormTimePresentation.ts`: 時刻/所要時間文言、input class、placeholder、曜日名、競合label。
- `routineFormOptionalPresentation.ts`: 説明・通知・週間目標文言、通知placeholder。
- `routineFormFooterPresentation.ts`: footer文言、submit label、button class。

Run: `npm test -- --runInBand src/features/routine/components/__tests__/RoutineFormOptionalFields.test.tsx src/features/routine/components/__tests__/RoutineTimeConflictWarning.test.tsx src/features/routine/__tests__/RoutineForm.test.tsx`

Expected: PASS。

- [ ] **Step 6: 互換barrelと直接importを整理する**

`helpers.ts` は再exportだけにし、components内部は責務別moduleを直接参照する。機能外からの既存importがあれば互換exportを維持する。

Run: `npm run typecheck && rg -n "from [\"']\\./helpers[\"']" src/features/routine/components --glob '*.{ts,tsx}'`

Expected: typecheck PASS。実装コンポーネントから旧集約helperへのimportは0件、または互換性上必要な理由が記録される。

- [ ] **Step 7: 全体検証と再監査を行いLoop 3を記録する**

Run: `npm run verify`

Expected: PASS。ログのLoop 3を完成させる。

---

### Task 4 / Loop 4: Work Trackerのpage helperをUI領域別に分割する

**責務:** 今日合計、テンプレート検索、履歴I/Oと表示meta、入力表示、タイマー表示、サマリー、インサイトが同居している。

**Files:**

- Create: `src/features/work-tracker/page/todaySummaryPresentation.ts`
- Create: `src/features/work-tracker/page/templateSearch.ts`
- Create: `src/features/work-tracker/page/sessionHistoryPresentation.ts`
- Create: `src/features/work-tracker/page/templateInputPresentation.ts`
- Create: `src/features/work-tracker/page/timerPresentation.ts`
- Create: `src/features/work-tracker/page/templateInsightsPresentation.ts`
- Modify: `src/features/work-tracker/page/helpers.ts`
- Modify: direct consumers found by function-name search
- Split or modify: `src/features/work-tracker/__tests__/page.helpers.test.ts`
- Create: focused tests under `src/features/work-tracker/__tests__/`
- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

**Interfaces:**

- `todaySummaryPresentation.ts`: 今日の合計秒数とセッション件数label。
- `templateSearch.ts`: queryによる検索、最終利用時刻順、最大5件。
- `sessionHistoryPresentation.ts`: 履歴metaの組み立てと履歴表示文言。ストレージ依存をこの境界だけに閉じる。
- `templateInputPresentation.ts`: dropdown表示条件と入力欄label。
- `timerPresentation.ts`: 実行状態のlabelとgradient class。
- `templateInsightsPresentation.ts`: 空統計、カードview model、trend message。
- `helpers.ts`: 既存import互換用の再exportのみ。

- [ ] **Step 1: 全利用箇所と既存契約を確認する**

Run: `rg -n "getTotalTimeToday|getFilteredTemplates|getSessionHistoryMeta|formatWorkSession|getTemplateStatsSummaryLabel|getTimerStatusLabel|getSessionCountLabel|getTemplateInsightCards|getTrendMessage" src/features/work-tracker --glob '*.{ts,tsx}' && npm test -- --runInBand src/features/work-tracker/__tests__/page.helpers.test.ts src/features/work-tracker/__tests__/WorkTrackerPage.test.tsx`

Expected: PASSし、各helperの利用コンポーネントを列挙できる。

- [ ] **Step 2: テストを責務別に分ける**

`page.helpers.test.ts` のテストを、today summary、template search、session history、template input、timer、template insightsへ移す。ストレージmockはsession historyテストだけに残す。

Run: `npm test -- --runInBand src/features/work-tracker/__tests__ --testPathPatterns='todaySummary|templateSearch|sessionHistory|templateInput|timerPresentation|templateInsights'`

Expected: 現行module経由でPASSする。

- [ ] **Step 3: 純粋なsummary/search/presentation責務を抽出する**

まず `todaySummaryPresentation.ts` と `templateSearch.ts`、次に入力・timer表示moduleを抽出し、各抽出後に対応テストを実行する。

Run: `npm test -- --runInBand src/features/work-tracker/__tests__/todaySummaryPresentation.test.ts src/features/work-tracker/__tests__/templateSearch.test.ts src/features/work-tracker/__tests__/templateInputPresentation.test.ts src/features/work-tracker/__tests__/timerPresentation.test.ts`

Expected: PASS。

- [ ] **Step 4: 履歴I/O境界を抽出する**

`getSessionHistoryMeta` と履歴formatを `sessionHistoryPresentation.ts` へ移す。`getTemplateStats` と `getSessionsByTemplateId` のimportはこのmoduleだけに閉じる。既存の `sessionHistoryMeta.ts` は純粋な判定責務のまま利用する。

Run: `npm test -- --runInBand src/features/work-tracker/__tests__/sessionHistoryPresentation.test.ts`

Expected: PASS。

- [ ] **Step 5: template insight責務を抽出する**

型、`EMPTY_TEMPLATE_STATS`、カードview model、trend messageを `templateInsightsPresentation.ts` へ移す。

Run: `npm test -- --runInBand src/features/work-tracker/__tests__/templateInsightsPresentation.test.ts`

Expected: PASS。

- [ ] **Step 6: 互換barrelと直接importを整理する**

`helpers.ts` は再exportだけにする。内部コンポーネントは対応moduleから直接importし、session history以外のmoduleがストレージへ依存していないことを確認する。

Run: `npm run typecheck && rg -n "@/lib/storage" src/features/work-tracker/page --glob '*.{ts,tsx}' && rg -n "from [\"']\\./helpers[\"']" src/features/work-tracker/page --glob '*.{ts,tsx}'`

Expected: typecheck PASS。ストレージ依存は意図した境界だけ、旧helper importは互換用途だけ。

- [ ] **Step 7: 全体検証と再監査を行いLoop 4を記録する**

Run: `npm run verify`

Expected: PASS。ログのLoop 4を完成させる。

---

### Task 5 / Loop 5以降: 全体監査で追加候補を1件ずつ処理する

**Files:**

- Modify: 監査で責務混在が確認された本番コード
- Create/Modify: 対応する責務別moduleと対象テスト
- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

- [ ] **Step 1: 大型ファイル候補を再抽出する**

Run:

```bash
find src firebase-functions/src tools -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.mjs' \) \
  -not -path '*/__tests__/*' -not -name '*.test.*' -not -name '*.spec.*' \
  -not -name '*.stories.*' -not -path '*/locales/*' -print0 \
  | xargs -0 wc -l | sort -nr
```

Expected: 120行超の候補を確認できる。行数だけでは違反判定しない。

- [ ] **Step 2: export数と責務セクションを再監査する**

Run: `rg --count-matches '^export ' src firebase-functions/src tools -g '*.{ts,tsx,js,mjs}' | sort -t: -k2,2nr | head -100 && rg -n '^// (=+|-+)|^/\*\*.*(helper|state|action|presentation)' src firebase-functions/src tools -g '*.{ts,tsx,js,mjs}'`

Expected: exportが6個を超えるファイル、独立セクションが3個以上あるファイルを候補へ加える。

- [ ] **Step 3: 上位候補を利用理由まで読んで判定する**

初期優先候補:

- `src/features/routine/hooks/routineStateMutationModel.ts`
- `src/features/todo-lists/TodoListDetailView.tsx`
- `src/features/preset/presetManagerStateActions.ts`
- `src/features/sync/sync/snapshots.ts`
- `src/features/weather/page/pageStateActions.ts`
- `src/features/budget/stateActions.ts`

各候補について、import、利用箇所、テスト、変更理由を確認する。単一の状態遷移model、単一画面の表示、単一snapshot変換など一つの理由に収束する場合は、分割せず理由をログへ残す。

- [ ] **Step 4: SRP違反があれば次の1件だけを選ぶ**

ログに次を記録する。

- ファイルが持つ独立した変更理由
- 抽出する責務と残す責務
- 公開API互換方法
- 保護する既存テストと不足テスト
- 循環依存を避ける依存方向

- [ ] **Step 5: 対象テストを確認し、不足契約を先に固定する**

Run: `npm test -- --runInBand`

Expected: 既存契約がPASS。不足契約を追加した場合も、現行動作のcharacterizationとしてPASSする。バグを発見した場合はリファクタリングへ混ぜず、ログへ分離して記録する。

- [ ] **Step 6: 一つの責務クラスタだけを抽出する**

元ファイルから再exportが必要なら残し、内部利用は責務別moduleへ切り替える。抽出中に表示、仕様、データ形式を変えない。

- [ ] **Step 7: 対象検証と全体検証を実行する**

Run: `npm test -- --runInBand && npm run typecheck && npm run verify`

Expected: 全件PASS。

- [ ] **Step 8: 再監査してループ数を増やす**

分割先、依存元、同一ディレクトリの隣接moduleを読み、新しい責務混在や循環依存がないことを確認する。ログの当該Loopを完成させ、Step 1へ戻る。

---

### Task 6 / Final Loop: 未対応SRP違反0件を確認する

**Files:**

- Modify: `docs/superpowers/plans/2026-08-22-srp-refactoring-log.md`

- [ ] **Step 1: 対象範囲の全体監査をもう一度実行する**

Task 5の行数、export数、セクション監査を再実行し、候補ごとに変更理由を確認する。

Expected: 判定基準に該当する未対応SRP違反が0件。

- [ ] **Step 2: 除外した大型ファイルの理由をログへ残す**

少なくとも120行超またはexport 6個超の未分割ファイルについて、「単一の宣言的データ」「単一の状態遷移model」「単一画面表示」などの判断根拠を1行ずつ記録する。

- [ ] **Step 3: 循環と互換経路を確認する**

Run: `rg -n "from [\"'].*(helpers|index)[\"']" src firebase-functions/src tools -g '*.{ts,tsx,js,mjs}'`

Expected: barrel経由の循環がなく、残した互換barrelに実装責務が再混入していない。

- [ ] **Step 4: 最終検証を実行する**

Run: `npm run verify`

Expected: lint、型検査、全Jestテスト、Next.js production buildがすべてPASS。

- [ ] **Step 5: 最終ループを記録する**

ログへ「未対応SRP違反0件」、総ループ数、全体verify結果、未分割候補の判断を記録する。この0件確認を最後の1ループとして数える。

- [ ] **Step 6: 差分を自己レビューする**

Run: `git diff --check && git status --short && git diff --stat && git diff`

Expected: whitespace errorなし。意図したリファクタリング、テスト、設計書、計画書、監査ログ以外の変更なし。

- [ ] **Step 7: ユーザーへ報告する**

総ループ数、各ループの対象と抽出責務、0件監査の根拠、`npm run verify` の結果、未コミットであることを報告する。コミット、push、PRは行わない。
