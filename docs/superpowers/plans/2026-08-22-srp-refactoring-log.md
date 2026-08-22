# SRP Refactoring Loop Log

## Baseline

- Branch: `codex/srp-refactoring`
- Worktree: `.worktrees/srp-refactoring`
- Starting commit: `461ba53e46e86f92cb28b3c4eb8a7466bb2d5a0d`
- Rules: `.github/copilot-instructions.md` と注入済み `AGENTS.md` のNext.js 16ルールを確認
- Next.js references:
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/02-guides/testing/jest.md`
- Jest discovery: 隔離worktreeを `rootDir` とする通常設定で1,058 suitesを検出。`/.worktrees/` をignoreへ追加すると隔離worktree自身が除外されるため、Jest設定は変更しない
- Baseline tests: 1,058 suites / 4,339 tests PASS (`npm test -- --runInBand`)
- Baseline verify:
  - Tailwind scan: PASS
  - ESLint: PASS
  - TypeScript: PASS
  - Jest: 1,058 suites / 4,339 tests PASS
  - Next.js build: PASS
  - Note: sandbox内の初回buildは `fonts.googleapis.com` のDNS制限で失敗。ネットワーク許可後の同一buildは成功したため、コード由来の失敗ではない

## Loop 1

- Candidate: `src/features/statistics/statistics/weeklyGoals.ts`
- Responsibilities found: JST週日付キー、目標定義復元、完了日の索引、ストリーク計算、進捗view modelの組み立て
- Decision: 4つの下位責務を個別moduleへ抽出し、公開 `weeklyGoals.ts` は組み立てだけにする
- Files changed:
  - `src/features/statistics/statistics/weeklyGoalDateKeys.ts` (33 lines)
  - `src/features/statistics/statistics/weeklyGoalDefinitions.ts` (95 lines)
  - `src/features/statistics/statistics/weeklyGoalCompletions.ts` (56 lines)
  - `src/features/statistics/statistics/weeklyGoalStreaks.ts` (25 lines)
  - `src/features/statistics/statistics/weeklyGoals.ts` (285 → 75 lines)
  - `src/features/statistics/__tests__/statistics.weekly-goals.test.ts`
- Added characterization: 将来週のストリーク上限、同名目標の `goalId` 安定順序、週内最後のsnapshot定義優先
- Targeted tests: 2 suites / 16 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,058 suites / 4,342 tests、Next.js buildすべてPASS
- Re-audit result: 日付 → 定義/完了索引 → 組み立ての一方向依存。循環なし。各moduleは一つの変更理由だけを持つ

## Loop 2

- Candidate: `src/hooks/headerMenuItemHelpers.ts`
- Responsibilities found: メニュー項目型、動的Todo項目生成、静的feature/権限表示判定、並び順とlegacy互換
- Decision: 4責務を個別moduleへ抽出し、旧helperを互換barrelへ縮小する
- Files changed:
  - `src/hooks/headerMenuItemTypes.ts` (8 lines)
  - `src/hooks/dynamicTodoMenuItems.ts` (37 lines)
  - `src/hooks/staticHeaderMenuItems.ts` (73 lines)
  - `src/hooks/headerMenuOrder.ts` (93 lines)
  - `src/hooks/headerMenuItemHelpers.ts` (261 → 7 lines)
  - `src/hooks/headerMenuItemsBuilder.ts`
  - `src/hooks/useHeaderMenuItems.ts`
  - `src/features/settings/components/MenuOrderSection.tsx`
  - `src/features/todo-lists/todoListManagementOrder.ts`
  - `src/hooks/__tests__/headerMenuItemHelpers.test.ts`
  - `src/hooks/__tests__/headerMenuItemHelpers.compatibility.test.ts`
- Targeted tests: 4 suites / 23 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,059 suites / 4,343 tests、Next.js buildすべてPASS
- Re-audit result: 型moduleを底辺に、動的生成/静的判定/順序moduleからbuilderへ一方向依存。旧helperは再exportのみ。循環なし

## Loop 3

- Candidate: `src/features/routine/components/helpers.ts`
- Responsibilities found: カード表示、item操作表示、フォームheader/core/time/optional/footerの文言・class・format
- Decision: 7つの表示領域ごとにpresentation moduleへ抽出し、旧helperを互換barrelへ縮小する
- Files changed:
  - `routineCardPresentation.ts` (28 lines)
  - `routineItemPresentation.ts` (8 lines)
  - `routineFormHeaderPresentation.ts` (9 lines)
  - `routineFormCorePresentation.ts` (35 lines)
  - `routineFormTimePresentation.ts` (48 lines)
  - `routineFormOptionalPresentation.ts` (31 lines)
  - `routineFormFooterPresentation.ts` (13 lines)
  - `components/helpers.ts` (210 → 7 lines)
  - 対応するRoutineコンポーネント11ファイルのimport
  - `components/__tests__/routineComponentHelpers.compatibility.test.ts`
- Targeted tests: 8 suites / 33 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,060 suites / 4,344 tests、Next.js buildすべてPASS
- Re-audit result: 各コンポーネントは対応presentationを直接参照。旧helperへの実装側importは0件で、barrelは再exportのみ

## Loop 4

- Candidate: `src/features/work-tracker/page/helpers.ts`
- Responsibilities found: 今日集計、テンプレート検索、履歴I/Oと表示、入力表示、タイマー表示、インサイトview model
- Decision: 6責務へ抽出し、旧helperを互換barrelへ縮小する
- Files changed:
  - `todaySummaryPresentation.ts` (8 lines)
  - `templateSearch.ts` (20 lines)
  - `sessionHistoryPresentation.ts` (46 lines)
  - `templateInputPresentation.ts` (17 lines)
  - `timerPresentation.ts` (9 lines)
  - `templateInsightsPresentation.ts` (86 lines)
  - `page/helpers.ts` (214 → 6 lines)
  - 対応するWork Trackerコンポーネント6ファイルのimport
  - `page.helpers.test.ts`
  - `page.helpers.compatibility.test.ts`
- Targeted tests: 3 suites / 14 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,061 suites / 4,345 tests、Next.js buildすべてPASS
- Re-audit result: ストレージ依存はsession history境界だけ。検索・集計・表示moduleは純粋。旧helperへの実装側importは0件

## Loop 5

- Candidate: `src/features/routine/hooks/routineStateMutationModel.ts`
- Responsibilities found: ルーティン生成、更新、表示順、複数曜日データの移行、破損グループ修復
- Decision: 通常の生成・更新・順序操作と、legacyデータの移行・修復を個別moduleへ分離し、旧moduleを互換barrelへ縮小する
- Files changed:
  - `routineCreationModel.ts` (生成入力型と単一/一括生成)
  - `routineUpdateModel.ts` (更新モデル構築)
  - `routineOrderModel.ts` (最大順序、ソート、再採番)
  - `routineGroupRepairModel.ts` (複数曜日移行と破損グループ修復)
  - `routineStateMutationModel.ts` (254 → 15 lines)
- Targeted tests: 5 suites / 44 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,061 suites / 4,345 tests、Next.js buildすべてPASS
- Re-audit result: 通常mutationとlegacy repairの依存を分離。公開APIは互換barrelで維持し、既存利用側の変更は不要

## Loop 6

- Candidate: `src/features/statistics/helpers.ts`
- Responsibilities found: ページ見出し/モード、期間操作、サマリーカード、チャート文言、週間目標文言
- Decision: Statistics Page内の5表示領域ごとにpresentation moduleへ分離し、各componentから直接参照する
- Files changed:
  - `statisticsPagePresentation.ts`
  - `statisticsPeriodPresentation.ts`
  - `statisticsSummaryPresentation.ts`
  - `statisticsChartPresentation.ts`
  - `weeklyGoalsPresentation.ts`
  - `helpers.ts` (183 → 22 lines)
  - 対応するStatistics component 7ファイル
  - `statisticsPresentationModules.test.ts`
- Targeted tests: 7 suites / 16 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,062 suites / 4,349 tests、Next.js buildすべてPASS
- Re-audit result: 各componentは担当presentationだけを参照。旧helperは互換再exportのみ

## Loop 7

- Candidate: `src/features/test-matrix/storage.ts`
- Responsibilities found: broken version ID移行、保存データと現行定義のマージ、`localStorage` I/O
- Decision: migration / merge / I/Oの3層へ分離し、旧storageを互換barrelへ縮小する
- Files changed:
  - `testMatrixIdMigration.ts`
  - `testMatrixStoredDataMerge.ts`
  - `testMatrixLocalStorage.ts`
  - `storage.ts` (282 → 14 lines)
  - `useTestMatrixDataState.ts`
  - `useTestMatrixPersistence.ts`
  - 関連テスト4ファイルのmock/import境界
- Targeted tests: 5 suites / 40 tests PASS
- Typecheck: PASS
- Verify: 初回は旧barrelをmockする合成テスト1件を検出して修正。再実行でTailwind scan、ESLint、TypeScript、1,062 suites / 4,350 tests、Next.js buildすべてPASS
- Re-audit result: migration（純粋変換）→ merge（定義復元）→ I/Oの一方向依存。実装側はI/O境界を直接参照

## Loop 8

- Candidate: `src/lib/storage/core-modules/storageIO.ts`
- Responsibilities found: 汎用scoped/unscoped I/O、同期バッチ深度、ローカル更新時刻とイベント
- Decision: batch / update metadata / item I/Oへ分離し、旧storageIOを互換barrelへ縮小する
- Files changed: `storageBatch.ts`、`localDataUpdatedAt.ts`、`storageItems.ts`、`storageIO.ts` (187 → 16 lines)、関連テスト
- Targeted tests: 4 suites / 41 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,062 suites / 4,351 tests、Next.js buildすべてPASS
- Re-audit result: batchとmetadataが独立し、item I/Oから必要な状態だけを参照。循環なし

## Loop 9

- Candidate: `src/features/preset/helpers.ts`
- Responsibilities found: manager、list、card/apply、create、edit、共通fieldの表示責務
- Decision: 6表示領域のpresentation moduleへ分離し、各componentから直接参照する
- Files changed: `presetManagerPresentation.ts`、`presetListPresentation.ts`、`presetCardPresentation.ts`、`presetCreatePresentation.ts`、`presetEditPresentation.ts`、`presetFieldPresentation.ts`、`helpers.ts` (124 → 42 lines)、対応component
- Targeted tests: 7 suites / 52 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,062 suites / 4,351 tests、Next.js buildすべてPASS
- Re-audit result: component別presentationへ分離。旧helperへの実装側importは0件

## Loop 10

- Candidate: `src/features/preset/presetManagerStateActions.ts`
- Responsibilities found: CRUD、適用、編集、選択
- Decision: 4ユースケース群へ分離し、旧action moduleを互換barrelへ縮小する
- Files changed: `presetCrudStateActions.ts`、`presetApplyStateActions.ts`、`presetEditStateActions.ts`、`presetSelectionStateActions.ts`、`presetManagerStateActions.ts` (220 → 16 lines)、中間action/testのimport境界
- Targeted tests: 8 suites / 30 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,062 suites / 4,352 tests、Next.js buildすべてPASS
- Re-audit result: CRUD / apply / edit / selectionが独立し、中間actionは担当moduleへ直接依存

## Loop 11

- Candidate: `src/features/weight-tracker/page/helpers.ts`
- Responsibilities found: 日付/履歴query、page/form/today/history表示
- Decision: 純粋queryと4表示領域へ分離し、旧helperを互換barrelへ縮小する
- Files changed: `weightRecordQueries.ts`、`weightPagePresentation.ts`、`weightFormPresentation.ts`、`weightTodayPresentation.ts`、`weightHistoryPresentation.ts`、`helpers.ts` (92 → 37 lines)、対応component/state
- Targeted tests: 4 suites / 17 tests PASS
- Typecheck: PASS
- Verify: Loop 12完了後の最終verifyで一括確認
- Re-audit result: queryはUI文言に依存せず、各componentは担当presentationを直接参照

## Loop 12

- Candidate: `src/features/routine/pages/helpers.ts`
- Responsibilities found: Home/toolbar/empty/category/day表示と、Home content/page view model組み立て
- Decision: 5表示領域と2 view modelへ分離し、旧helperを互換barrelへ縮小する
- Files changed: `homePagePresentation.ts`、`homeToolbarPresentation.ts`、`routineEmptyStatePresentation.ts`、`categoryFilterPresentation.ts`、`daySelectorPresentation.ts`、`homeContentViewModel.ts`、`homePageViewModel.ts`、`helpers.ts` (127 → 24 lines)、対応component/test
- Targeted tests: 7 suites / 16 tests PASS
- Typecheck: PASS
- Verify: Tailwind scan、ESLint、TypeScript、1,062 suites / 4,352 tests、Next.js buildすべてPASS（Loop 11を含む最終tree）
- Re-audit result: presentationとview model組み立てを分離。旧helperへの実装側importは0件

## Final Audit

- Loops completed: 12
- Heuristics: production fileの行数、export数、依存種類、変更理由を再走査
- Reviewed exclusions:
  - Test Matrixの巨大ファイル: テストケース/初期値の宣言データ
  - Todo/Test Matrix/Budgetの大型TSX: それぞれ単一UI構成責務
  - `sync/snapshots.ts`: snapshot repository/serviceの単一責務
  - weather/notification/budgetのstate actions: 各featureの単一ユースケース層
  - account-admin/meal/weatherの多数export helper/text: ロケール文言・presentation定数の提供に限定
- Result: 現在の監査基準で追加の明確なSRP違反は見つからず
- Final verification: `npm run verify` PASS、`git diff --check` PASS
