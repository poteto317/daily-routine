# 月別家計簿エクスポート Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Issue #218 の表示月の支出を JSON で書き出す。
**Architecture:** 純粋なデータ抽出と UI 操作を分離し、既存 downloadJsonFile を再利用する。
**Tech Stack:** React 19 / Next.js 16 / TypeScript / Jest。
**Spec:** docs/superpowers/specs/2026-11-10-budget-monthly-export-design.md

## Global Constraints

- ユーザー指定の JSON のみ。表示月の保存済み支出を対象とし、永続化・同期・インポートは変更しない。
- {budgetData:{expenses:{[month]:Expense[]}},budgetCategories:BudgetCategory[]}。参照される現存カテゴリのみ。ファイル名 daily-routine-budget-YYYY-MM.json。
- UI 文言は locales/ja.json。0 円とカテゴリ欠損の支出も含め、元の順序・値を保持。
- L-001 / L-048 / L-058 / L-060。feature 中にコミットせず後続 commit-ja で行う。

## Review Focus

1. 月移動直後に前月を出力しない（Task 2）。
2. 他月・未参照カテゴリを含めない（Task 1）。
3. 0 円、削除カテゴリ、任意の usedTime を失わない（Task 1）。
4. 失敗時に成功を表示せず、再試行できる（Task 2）。
5. 未保存の編集値を出力しない（Task 2）。

### Task 1: JSON の組み立て

**Files:** Create src/features/budget/budgetMonthlyExport.ts と **tests**/budgetMonthlyExport.test.ts。
**Interfaces:** buildBudgetMonthlyExport(month: string, expenses: Expense[], categories: BudgetCategory[]): {budgetData: BudgetData; budgetCategories: BudgetCategory[]}、getBudgetMonthlyExportFileName(month: string): string。

- [x] 月境界、参照カテゴリ、欠損、0 円、任意フィールド、不変性、空配列と命名のテストを書く。
- [x] npm test -- --runInBand budgetMonthlyExport で未実装による失敗を確認。
- [x] month に一致する expenses を抽出し、categoryId の Set で参照カテゴリを抽出する純粋関数を実装。
- [x] 同テストで PASS を確認。

### Task 2: 家計簿画面の操作

**Files:** Create src/features/budget/components/BudgetMonthlyExport.tsx, 同 stories.tsx と **tests**/BudgetMonthlyExport.test.tsx。Modify BudgetPage.tsx / **tests**/BudgetPage.test.tsx / locales/ja.json / docs/04-reference/features.md。
**Interfaces:** BudgetMonthlyExport({month: string, expenses: Expense[], categories: BudgetCategory[]})。結果状態とクリック処理を持つ。ページは key={month} を渡す。

- [x] ページから実部品を通して downloadJsonFile に月とデータが届くテスト、月変更、空月 disabled、失敗と再試行、未保存の編集除外を先に書く。
- [x] npm test -- --runInBand BudgetMonthlyExport BudgetPage で失敗を確認。
- [x] 月ナビの直下へ部品を追加。文言は「この月の支出を JSON でエクスポート」「この月の支出の記録がありません」「JSON のダウンロードを開始しました」「書き出しに失敗しました」。Storybook の通常/空表示と機能説明を更新。
- [x] 家計簿関連テストを通す。
- [x] npm run verify を通す。差分確認、SRP・レビューループへ進む。

## レビュー・実行記録

ユーザーが JSON を指定したため設計と計画を更新。実装は依存する小規模な2タスクを同セッションで実行し、所定の独立レビューを後続で行う。

JSON 版設計・計画レビュー: json_spec_plan_review が阻害事項なしを確認。Task 1: RED（未実装）→GREEN 5件。Task 2: RED（ボタン・部品未実装）→GREEN 関連26件。

全検証: npm run verify 成功（1358スイート、7208テスト、本番ビルド）。SRP確認3周: 対応すべき指摘なし。

独立ローカルレビュー3周: 対応すべき指摘なし（local_review_1/2/3）。
