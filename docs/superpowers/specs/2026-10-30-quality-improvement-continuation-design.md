# 品質改善の続き（ブランチ `claude/api-improve-2026-10-30`）設計書

## 目的

既存の 6 コミット（refactor / test / docs）に続けて、**振る舞いを変えずに**、残っている重複と長いコンポーネントを整理し、テストの薄い箇所と後片付けの不備を直し、ドキュメントを実装に合わせる。

「振る舞いを変えない」は次の意味とする。

- 描画される DOM（要素・属性・クラス・文言）、イベントの結果、保存内容、公開 API の入出力を変えない。
- 公開している `export` の名前を消すのは、呼び出し元も同時に置き換える内部フックに限る（`src/lib/storage/exports` や各機能の `index.ts` から公開しているものは変えない）。

## 対象外（PR 本文の「要確認事項」に書く）

振る舞いが変わるため、このブランチでは直さない。

- 通知の 9 時間ずれ
- Firestore バッチの 500 件上限
- ヘッダーメニューの End キー
- ログイン前データの移行が 12 キーに限られる件
- ローカル認証の `::1`

あわせて、デプロイや firebase コマンドは実行しない。`jest.config.ts` は変更しない。クラウド同期のマージ方針（配列の丸ごと置換）には手を加えない。

## 調査の根拠

- テスト全件: 1287 スイート・6127 件が通過。カバレッジは行 97.68%・分岐 95.44%（`coverage/cov.txt` は古いので使わない。計測し直した値）。
- 重複: 8 行の窓の一致を機械的に検出し、実際に差分を読んで判断した。
- 長い関数: TypeScript の AST で 55 行以上の関数を列挙した。

## 要件

### A. 重複の整理

| ID  | 対象                                                                                                                                                              | 変更                                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `useTodoCategoryManagementFormFocus`、`useBudgetCategoryManagementFormFocus`、`useBudgetExpenseItemManagementFormFocus`、`useBudgetIncomeItemManagementFormFocus` | 名前以外が同一。`src/hooks/useFormOpenAutoFocus.ts` に統合し、4 ファイルとそれぞれのテストを削除して、呼び出し元を置き換える                                                              |
| A2  | `useBudgetExpenseItemEditState`、`useBudgetIncomeItemEditState`                                                                                                   | 型以外が同一。`src/features/budget/useBudgetItemEditState.ts`（`{ id; name; amount }` を受ける）に統合する                                                                                |
| A3  | `useBudgetCategoryManagementNameEditing`、`useTodoCategoryManagementNameEditing`                                                                                  | 名前以外が同一。`src/hooks/useCategoryNameEditing.ts` に統合する                                                                                                                          |
| A4  | `useTodoCategoryDragAndDrop`、`useTodoListDragAndDrop` のセンサー定義                                                                                             | 定数と `useSensors` の呼び出しを `src/features/todo-lists/useTodoDndSensors.ts` に切り出す。`disabled` の分岐は `useTodoListDragAndDrop` に残す                                           |
| A5  | `CalendarMonthNavigation`、`StatisticsPeriodControls` の前後ボタン                                                                                                | `src/components/PeriodNavButton.tsx`（`direction`・`onClick`・`ariaLabel: string \| undefined`・`type: "button" \| undefined`。すべて必須）に切り出す。`undefined` のときは属性を出さない |

A1 の `useTodoListManagementFormFocus` は `clearTimeout` を持たないので統合しない（統合すると振る舞いが変わる）。

A4 は呼び出し元が 2 つとも `todo-lists` にあるので、機能の中に置く。

### B. 長いコンポーネントの分割

| ID  | 対象                                                             | 分割先                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B1  | `src/features/test-matrix/MatrixCategoryCard.tsx`                | `MatrixItemRow.tsx`（1 行）と `MatrixDeviceStatusCell.tsx`（PC/SP のセル）                                                                                                                 |
| B2  | `src/features/test-matrix/DetailPanel.tsx`                       | `DetailCaseRow.tsx`（1 行）と `DetailPanelHeader.tsx`（見出しと件数）                                                                                                                      |
| B3  | `src/features/test-matrix/TestMatrixPage.tsx`                    | `TestMatrixSummaryBar.tsx`、`TestMatrixToolbar.tsx`、`TestMatrixStatusLegend.tsx`                                                                                                          |
| B4  | `src/features/budget/components/BudgetAllowanceSettingsPage.tsx` | `BudgetAllowanceSectionHeader.tsx`（見出しと追加ボタン）、`BudgetExpenseItemSection.tsx`（固定費・変動費の `h3`・空の判定・一覧。必須の `listClassName` で一覧のコンテナのクラスを受ける） |

分割後の各コンポーネントは、必須の props だけを受け取る。省略可能な props で配線漏れが隠れないようにする（L-060）。

B4 の一覧のコンテナは、固定費が `space-y-2 mb-4`、変動費が `space-y-2` で異なる。`BudgetExpenseItemSection` の呼び出し元からそれぞれ `listClassName` で渡す。`mb-4` は一覧のコンテナだけに付き、空の表示（`BudgetAllowanceSectionEmptyState`）には付かない現状を保つ。空の判定は `items.length === 0 && !showForm`（`showForm` は必須の props）。

**分割しないもの**

- `TodoListDetailView`（219 行）: 大半が分解代入と props の受け渡しで、処理を持たない。分割しても props の中継が増えるだけ。
- `useLongPress`（110 行）: 複数の ref を共有する 1 つの状態機械で、分割すると読みにくくなる。
- `budgetCategoryCrudPersistActions` と `todoCategoryCrudPersistActions`: 色・並び替えの有無で操作が異なり、共通化するには抽象が必要になる。
- `firebase-functions` と `src` で重複する型: パッケージが別で、共有の仕組みが無い。
- `*StateResult.ts` などの結果オブジェクトの組み立て: フィールドの列挙であり、処理の重複ではない。

### C. テストの追加

分割の前に、現在の振る舞いを固定するテストを書く。

- B1・B2: `MatrixCategoryCard`・`DetailPanel` の直接のテスト（詳細ありと無しの分岐、`onToggleStatus`・`onUpdateNote`・`onOpenDetail` の引数、PC と SP を取り違えないこと）
- B3: `TestMatrixPage` の進捗の %、件数、バーの幅、フィルターの操作、凡例の表示
- B4: `BudgetAllowanceSettingsPage` の固定費・変動費の一覧のコンテナのクラス（`space-y-2 mb-4` と `space-y-2`）、空の表示
- A5: `StatisticsPeriodControls` のボタンに `type="button"` と `aria-label` があること、`CalendarMonthNavigation` のボタンに無いこと、前後のボタンがそれぞれのハンドラを呼ぶこと

カバレッジが低く、処理を持つ次のファイルにテストを足す。型だけのファイル・Storybook・画面の組み立てだけのファイルは対象にしない。

| ファイル                                                    | 行 / 分岐 % | 確かめる内容                         |
| ----------------------------------------------------------- | ----------- | ------------------------------------ |
| `src/features/sync/sync/initialSync.ts`                     | 25.9 / 100  | 4 通りの分岐と、例外を握りつぶすこと |
| `src/features/work-tracker/page/useWorkTrackerTimer.ts`     | 40 / 100    | タイマーの開始・停止・解除           |
| `src/features/settings/components/MonitoredLinesList.tsx`   | 37.7 / 50   | 一覧の表示と操作                     |
| `src/features/journal/utils/journalDate.ts`                 | 68.2 / 100  | 日付の変換と境界                     |
| `src/features/work-tracker/storageStats.ts`                 | 73.7 / 66.7 | 集計と空の場合                       |
| `src/features/settings/state/theme.ts`                      | 73.3 / 71.4 | テーマの判定                         |
| `src/features/calendar/utils/calendarDate.ts`               | 81.3 / 100  | 月の境界                             |
| `src/features/weather/page/format.ts`                       | 84.6 / 52.9 | 表示形式の分岐                       |
| `src/features/routine/hooks/homeViewPersistence.ts`         | 85.9 / 60.9 | 壊れた保存値・例外のときの既定値     |
| `src/features/weather/cache/core.ts`                        | 88.8 / 63.6 | 壊れたキャッシュ・期限切れ           |
| `src/features/auth/login/helpers.ts`                        | 100 / 42.9  | エラーの分岐                         |
| `src/features/routine/components/routineFormSubmitModel.ts` | 100 / 56.3  | 入力の組み合わせの分岐               |

テストは行を通すだけにせず、結果の値を確かめる。追加したテストは、対象の実装を壊す変異で落ちることを確かめる（L-179）。時刻付きの文字列には Z かオフセットを付け、現在時刻に依存する処理は `useFakeTimers` と `setSystemTime` で固定して `afterEach` で戻す（L-181、L-184）。検証が無く例外になる箇所は、現状を固定してコメントを残す（`docs/03-testing/README.md` の方針）。**バグを見つけても、本体は直さず、PR の要確認事項に書く。**

### D. テストの後片付け

jest は `restoreMocks` を設定していないので、各テストファイルで戻す。ファイルごとの jsdom の中で漏れるため、同じファイルの後続のテストに影響する。

- `src/features/routine/__tests__/routineHelpers.sync.test.ts`: 最初の `describe` が `global.fetch` を戻していない。
- `global` / `window` / `navigator` / `document` の値を差し替えて戻していない 10 ファイル:
  `useApiKeyState.flows.test.ts`、`useApiKeyState.test.ts`、`useCopyApiKey.test.ts`、`apiKeyGenerator.test.ts`、`useThemeInitializationEffect.test.tsx`、`useThemeAutoListenerEffect.test.tsx`、`helpers.sync-notification.test.ts`、`useRoutines.initial-and-mutations.test.ts`、`WeatherPage.initial-load.test.tsx`、`WeatherPage.current-location.test.tsx`
- `window` / `Date.prototype` / `global` のスパイを戻していないファイル:
  `useApiKeyCommands.test.ts`、`useApiKeyState.test.ts`、`useApiKeyState.flows.test.ts`、`todoListDeletePersistActions.test.ts`、`useCloudSyncStatusState.test.tsx`、`weight-tracker/__tests__/storage.test.ts`、`work-tracker/__tests__/storage.templates-and-history.test.ts`、`useTodoCategoryManagementFormFocus.test.tsx` 系（A1 で新しいテストに統合するとき `clearTimeout` のスパイを戻す）

各テストの `element.focus` や `event.stopPropagation` のように、そのテストの中だけで使うオブジェクトのスパイは対象にしない。

戻すときは、差し替える前の値（プロパティが無かった場合は「無い」こと）を控えて `afterEach` で戻す。`Object.defineProperty` で戻す値は `configurable: true` を保つ。Weather の 2 ファイルは既存の `restoreGeolocation()`（`WeatherPage.test-setup.ts`）を使う。

### E. 整形

`prettier --check` で引っかかる 14 ファイルを、そのファイルだけ `prettier --write` する（テスト 13 件と `src/features/budget/utils/metrics.ts`）。整形以外の変更は混ぜない。

### F. ドキュメント

- `docs/03-testing/README.md`: 「テストの後片付け」の節を足す（D の規則）。
- `docs/02-development/architecture.md`: Hooks の行に `useFormOpenAutoFocus`・`useCategoryNameEditing` を足す。Components の行に `PeriodNavButton` を足す。
- `docs/02-development/refactoring-guide.md`: 分割しない判断の目安（処理を持たない受け渡しだけのコンポーネントは行数だけで分割しない）を足す。
- `docs/README.md`: 最終更新日を 2026年10月30日 にする。
- 古いパスの記述は確認した結果、`bug-report-feature-plan.md` は旧案と明記済み、`2026-10-09-workout-srp-review.md` は当時の記録のため変更しない。
- `bug-report-secrets-config.md` の `firebase-functions/.secret.local` と `.env.local` は git 管理外の作成手順なので変更しない。

## 決めたこと

- A1 の統合先の名前は `useFormOpenAutoFocus`、引数は従来と同じ `{ inputRef, showForm }`。
- A1〜A3 はラッパーを残さない（呼び出し元が少なく、いずれも `index.ts` から公開していないため）。旧ファイルとテストを削除し、呼び出し元と `jest.mock` のパスを置き換える。
- A2 の型は `{ id: string; name: string; amount: number }` を満たす値を受ける。
- A5 はボタンごと切り出す。`CalendarMonthNavigation` は `type` と `aria-label` に `undefined` を明示して渡し、現在の DOM を保つ（アクセシビリティの改善は振る舞いの変更なので今回はしない）。渡し忘れは型エラーになる（L-060）。
- B3 の読み込み中・権限なしの表示は `TestMatrixPage` に残す。
- `storybook-guide.md` の 4 節に従い、新しい UI コンポーネント（A5・B1〜B4 の 10 個）に `Default` の Story を 1 つずつ足す。操作の確認は親の既存の Story とテストに任せる。
- worktree のテストは `docs/03-testing/README.md` の方法で実行する。全件は `--runInBand` を付けない並列で実行してよい。

## 作業の進め方（L-065、L-200）

- `git add` はパスを指定する（`firebase-functions/node_modules` は未追跡のシンボリックリンクなので、`git add -A` / `git add .` を使わない）。
- `git checkout`・`git restore`・`git stash` など作業ツリーを変える git 操作をしない。実装の担当はコミットしない。
- 変異の確認は `mktemp -d` に元のファイルを `cp` で退避して行い、終わったら同じ退避から戻す。
- フォーマッタは変更・新規のファイルだけに実行する。報告や中間ファイルはリポジトリの外に置く。
- 実装の担当は担当分のテストだけを実行し、全件の検証は統括側が最後に行う。
- 担当の報告はそのまま信じず、統括側がコマンドの出力と差分で確かめる。

## 確認方法

- 型: `npm run typecheck`、`npm run typecheck:functions`
- lint: `npm run lint`
- tailwind: `npm run tailwind:scan`
- 整形: 変更ファイルに `prettier --check`
- ビルド: `npm run build`
- テスト: worktree 向けのコマンドで全件。件数が A1〜A3 の統合で減る分は、統合先のテストで同じ観点を確かめる。

## 完了の条件

A〜F がすべて反映され、上の確認がすべて通ること。要確認事項が PR 本文にあること。
