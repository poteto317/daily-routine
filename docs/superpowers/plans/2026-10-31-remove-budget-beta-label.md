# 家計簿の Beta 表記削除 実装プラン

設計書: `docs/superpowers/specs/2026-10-31-remove-budget-beta-label-design.md`

目的: Issue #194 に対応し、正式機能となった家計簿から利用者向けの Beta 表記を削除する。

気をつける知見: L-015 / L-057 / L-060。

## タスク 1: 家計簿画面のバッジを削除する

ファイル:

- `src/features/budget/BudgetPage.tsx`
- `src/features/budget/locales/ja.json`
- `src/features/budget/__tests__/BudgetPage.test.tsx`
- `src/config/locales/ja.json`
- `src/config/__tests__/index.test.ts`

1. 見出し横の `BETA` バッジと、不要になる `page.betaLabel` を削除する。
2. ヘッダーメニューの家計簿項目から `BETA` バッジを削除する。
3. `BudgetPage` のテストに、家計簿見出しは表示される一方で `BETA` が表示されないことを追加する。
4. メニュー設定のテストに、家計簿項目のバッジがないことを追加する。
5. 家計簿の表示・操作・データ保存の既存動作は変更しない。

## タスク 2: テストマトリクス画面の家計簿バッジを正式化する

ファイル:

- `src/features/test-matrix/initialData.ts`
- `src/features/test-matrix/__tests__/initialData.test.ts`

1. `id: "budget"` のカテゴリを、既存の正式機能と同じ `badge: { text: "実装済", color: "bg-green-500" }` に置き換える。
2. 初期データのテストで、家計簿カテゴリが `実装済` バッジになることを固定する。
3. ほかのカテゴリの `BETA` バッジは変更しない。

## タスク 3: ドキュメントを同期する

ファイル: `docs/04-reference/features.md`、`docs/04-reference/README.md`、`docs/03-testing/test-matrix.md`

1. 目次の家計簿名から `(BETA)` を削除し、リンク先を更新する。
2. 家計簿の見出しを `### 💰 家計簿` に変更する。
3. 家計簿の技術仕様にある「ステータス: BETA版」を「ステータス: 正式機能」へ変更する。
4. リファレンス README の家計簿名から「（BETA）」を削除する。
5. テストマトリクスの家計簿見出しを `🔶` から `✅` へ変更する。個別項目の状態は変更しない。
6. 他機能の Beta 表記は変更しない。

## タスク 4: 検証

1. `npx jest src/features/budget/__tests__/BudgetPage.test.tsx --runInBand` を実行する。
2. `npx jest src/features/test-matrix/__tests__/initialData.test.ts --runInBand` を実行する。
3. `npm run verify` を実行する。
