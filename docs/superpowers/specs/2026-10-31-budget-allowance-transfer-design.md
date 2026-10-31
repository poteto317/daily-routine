# 収入・固定費・変動費のインポート／エクスポート（Issue #196）

## 目的

「収入・固定費・変動費の設定」画面で、登録した収入項目と支出項目（固定費・変動費）を JSON ファイルに書き出し、読み込めるようにする。

設定画面の「データ管理」にある家計簿全体のエクスポート（支出履歴やカテゴリも含む）は変更しない。

## 決めたこと

ユーザーが決めたこと:

- **場所と形式**: 「収入・固定費・変動費の設定」画面（`BudgetAllowanceSettingsPage`）に、エクスポートとインポートのボタンを置く。形式は JSON。
- **取り込み方**: 確認のうえ、収入項目と支出項目をファイルの内容に置き換える。

### ファイルの形式

```json
{
  "type": "daily-routine-budget-allowance",
  "version": 1,
  "exportDate": "2026-10-31T00:00:00.000Z",
  "incomeItems": [
    { "id": "...", "name": "給与", "amount": 300000, "createdAt": "..." }
  ],
  "expenseItems": [
    {
      "id": "...",
      "name": "家賃",
      "amount": 80000,
      "kind": "fixed",
      "createdAt": "..."
    }
  ]
}
```

- ファイル名は `daily-routine-budget-allowance-<YYYY-MM-DD>.json`。日付は `getTodayString()`。
- 項目の並び順はファイルの配列の順をそのまま使う。
- `id` と `createdAt` も書き出す。Agent API が項目を `id` で参照するため、書き出した項目を読み戻しても `id` が変わらないようにする（L-456）。

### インポートの検証

ファイル全体を検証してから書き込む。1 件でも不正なら何も書き込まない（L-003）。

- ファイルサイズが 1 MB を超えるものは、読まずに `tooLarge` のエラーにする。
- 次の場合は `invalidFormat` のエラーにする。
  - JSON として読めない。
  - 最上位がオブジェクトでない。
  - `type` が `daily-routine-budget-allowance` でない（設定画面のバックアップなど別のファイルを含む）。
  - `version` が `1` でない。
  - `incomeItems` または `expenseItems` が配列でない。
  - 項目がオブジェクトでない。
  - `name` が文字列でない、または `normalizeCategoryName` の結果が空になる。
  - `amount` が有限の数値でない、または 0 以下。
  - 支出項目の `kind` が `fixed` / `variable` のどちらでもない。
- 両方の配列が空なら `empty` のエラーにする。読み込むと全項目が消えるため（L-002）。
- `name` は trim した値を保存する。
- `id` は、空でない文字列で、同じ配列の中で重複していなければそのまま使う。それ以外は `createBudgetIncomeItem` / `createBudgetExpenseItem` と同じ方法で新しく作る（手で項目を足した場合を許す）。重複しているときは、最初の項目の `id` を残し、2 件目以降を新しくする。
- `createdAt` は、空でない文字列ならそのまま使い、それ以外は現在時刻にする。
- 保存する項目は既知のキー（収入は `id` / `name` / `amount` / `createdAt`、支出はこれに `kind`）だけで組み立てる。それ以外のキーは保存しない。

### インポートの流れ

1. ボタンを押すとファイル選択を開く（`accept="application/json,.json"`）。
2. 選択したファイルを読み、検証する。不正ならエラーを表示して終わる。
3. `window.confirm` で確認する。メッセージには、読み込む件数（収入・固定費・変動費のそれぞれ）と、今の項目が置き換わることを書く。キャンセルなら何もしない。
4. `saveBudgetAllowanceItems` で保存する。`withSyncBatch` の中で `saveBudgetIncomeItems` と `saveBudgetExpenseItems` を呼び、`"saved"` のときだけ、抜けたあとに `setLocalDataUpdatedAt(Date.now())` を呼ぶ（設定画面の `importSelectedData` と同じ扱い）。クラウド同期の時刻が 1 回だけ進み、取り込んだ内容が同期で上書きされない。
   - `setStorageItem` は例外を投げず、失敗を `boolean` で返す。`saveBudgetIncomeItems` / `saveBudgetExpenseItems` がその結果を返すように変える。
   - 戻り値は `BudgetAllowanceSaveResult`（`"saved" | "failed" | "rollbackFailed"`）。
   - 保存の前に今の収入の配列を控える。収入の保存に失敗したら、`setItem` の失敗では値は変わらないので何も書き戻さず `"failed"` を返す。支出の保存に失敗したら、収入だけを控えに書き戻す（収入と支出が混ざった状態を残さない）。書き戻しに成功すれば `"failed"`、失敗すれば `"rollbackFailed"` を返す。支出は保存が失敗すると元のままなので控えない。
   - 両方の保存と失敗時の書き戻しは、同じ `withSyncBatch` の中で行う（バッチの外で書き戻すと更新時刻が進み、内容が元のままなのに同期がローカルを新しいと判断する）。結果はコールバックの外の変数で受け取り、バッチを抜けたあと `"saved"` のときだけ `setLocalDataUpdatedAt` を呼ぶ。`"rollbackFailed"` でも進めない（進めると、収入と支出が混ざった状態を同期が新しいと判断し、リモートの整った内容へ上書きしてしまう）。
   - `"failed"` のときは `onImported` を呼ばず、`saveFailed` のエラーを表示する。
   - `"rollbackFailed"` のときは `onImported` を呼んで画面の一覧と保存内容を合わせ、`partiallySaved` のエラー（収入だけが置き換わった可能性があるので一覧を確認してほしい旨）を表示する。
5. 画面の一覧を読み直す。追加フォームと編集中の行を閉じる（編集中の項目が無くなることがあるため）。
6. 成功のメッセージを表示する。

- どの結果でも `input` の `value` を空に戻し、同じファイルをもう一度選べるようにする。
- 読み込みの最中はインポートのボタンを無効にする。
- ページを離れた後に読み込みが終わった場合は、確認も保存もしない（アンマウント後は何もしない）。

### エクスポートの流れ

- ボタンを押すと、保存済みの項目（`getBudgetIncomeItems` / `getBudgetExpenseItems`）をファイルに書き出す。項目が 0 件でも書き出せる。
- 成功・失敗のメッセージを表示する。

### メッセージの表示

- ボタンの下に 1 行で表示する。成功は `role="status"`、失敗は `role="alert"`。次にエクスポートするか、ファイルを選ぶと消す（ファイル選択をキャンセルしたときは残す）。
- エラーの文言は種類ごとに分ける（`invalidFormat` / `tooLarge` / `empty` / `readFailed`（ファイルの読み込み失敗） / `saveFailed`（保存失敗） / `partiallySaved`（保存が途中で失敗し、書き戻しもできなかった） / `exportFailed`（書き出し失敗））。

## 構成

- `src/lib/downloadJsonFile.ts`（新規）: `downloadJsonFile(fileName, data)`。Blob の生成と anchor によるダウンロードと後始末を行う。`src/features/settings/state/exportFileDownload.ts` の該当部分を移し、settings はこの関数を呼ぶ（出力は変えない）。機能どうしの直接の依存を増やさないため `src/lib` に置く。
- `src/features/budget/budgetAllowanceTransfer.ts`（新規）: 副作用の無い処理。ファイル形式の組み立て `buildBudgetAllowanceExport(income, expense, now = new Date())`、検証 `parseBudgetAllowanceImport(text)`（`{ ok: true, incomeItems, expenseItems }` または `{ ok: false, reason }` を返す）、ファイル名 `getBudgetAllowanceExportFileName(date)`。
- `src/features/budget/storageAllowanceItems.ts`（新規）: `saveBudgetAllowanceItems(income, expense): BudgetAllowanceSaveResult`（バッチ、失敗時の書き戻し、更新時刻を含む）。`storage.ts` から再 export する。
- `storageIncomeItems.ts` / `storageExpenseItems.ts`: save 関数が `boolean` を返すように変える。
- `src/features/budget/useBudgetAllowanceTransfer.ts`（新規）: ボタンの処理と状態（`status`、`isImporting`、`fileInputRef`）。`onImported` を引数で受け取る。
- `useBudgetIncomeItemManagementDataState` / `useBudgetExpenseItemManagementDataState`: ストレージから読み直す `reloadItems` を追加する。
- `useBudgetIncomeItemManagementPageState` / `useBudgetExpenseItemManagementPageState`: `reloadItems`（一覧の読み直し、フォームと編集の終了）を返す。
- `src/features/budget/components/BudgetAllowanceTransferSection.tsx`（新規）: ボタン、隠したファイル入力、メッセージ。 Story も追加する。
- `BudgetAllowanceSettingsPage.tsx`: `useBudgetAllowanceTransfer({ onImported })` を呼ぶ。`onImported` は `income.reloadItems()` と `expense.reloadItems()` の両方を呼ぶ。片方でも忘れると、`useState` の古い一覧を基にした次の保存で取り込んだ内容が消える。画面の末尾にセクションを置き、状態とハンドラーを必須の props で渡す。
- `src/features/budget/locales/ja.json`: 文言を `allowanceSettings.transfer` に追加する。
- `docs/04-reference/features.md`: 機能の説明を追記する。

## 検証

- `budgetAllowanceTransfer` の単体テスト: 書き出した内容を読み戻すと同じ項目になること（往復）。上記の不正な入力ごとの理由。`id` の維持・重複・欠落の扱い。`name` の trim。並び順の維持。未知のキーが結果に残らないこと。
- `useBudgetAllowanceTransfer` のテスト: 検証エラーでは確認も保存もしない。キャンセルでは保存しない。成功時に保存して `onImported` を呼ぶ。`input` の値を戻す。1 MB 超を読まない。アンマウント後に保存しない。
- `saveBudgetAllowanceItems` のテスト: 両方が保存され、更新時刻が 1 回進むこと。2 件目の保存が失敗したら 1 件目が元に戻り、更新時刻が進まず、`"failed"` を返すこと。書き戻しも失敗したら更新時刻が進まず、`"rollbackFailed"` を返すこと（実物の `setStorageItem` を通して確かめる）。
- `useBudgetAllowanceTransfer` のテストに、保存失敗では `onImported` を呼ばず `saveFailed` になること、`rollbackFailed` では `onImported` を呼び `partiallySaved` になることを含める。Strict Mode でも確認と保存が呼ばれることも確かめる。
- 画面のテスト: 取り込み後に収入・支出それぞれの `reloadItems` が 1 回呼ばれること（L-060）。
- `reloadItems` のテスト: 編集中の行とフォームが閉じ、一覧が更新されること。
- `downloadJsonFile` のテストと、既存の `exportFileDownload` のテストが通ること。
- `npm run lint` / `npm run typecheck` / `npm run typecheck:functions` / `npm test`。ブラウザで書き出しと読み込みを 1 回ずつ確認する。

## 知見

- L-002: 空のファイルで全項目を消さない。
- L-003: 全件を検証してから書き込む。
- L-018: 検証した値（trim 済みの `name` など）をそのまま保存する。
- L-456: `id` と `createdAt` を読み戻しても変えない。
- L-001 / L-056: 保存の失敗を呼び出し元に返し、成功扱いにしない。
- L-060: 組み立て役の配線をテストする。
