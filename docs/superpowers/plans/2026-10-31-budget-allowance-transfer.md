# 収入・固定費・変動費のインポート／エクスポート 実装プラン

設計書: `docs/superpowers/specs/2026-10-31-budget-allowance-transfer-design.md`

**目的**: 「収入・固定費・変動費の設定」画面に、収入項目と支出項目の JSON エクスポートと、確認のうえ置き換えるインポートを追加する（Issue #196）。

**前提**:

- 作業ブランチ `feature/budget-import-export`。コミットはしない（後の `/commit-ja` で行う）。
- 各タスクは TDD（失敗するテストを先に書き、失敗を確認してから実装する）。テストは `npx jest <パス>`。
- 文言は `src/features/budget/locales/ja.json`（`texts`）に置く。
- jest の jsdom には `Blob#text` も `File#text` も無い。テストのファイルは `{ size, text: jest.fn().mockResolvedValue(...) }` のスタブにする。画面のテストは `fireEvent.change(input, { target: { files: [stub] } })` で渡す。

**気をつける知見**: L-001 / L-056（保存の失敗を成功扱いにしない）、L-002（空のファイルで全消去しない）、L-003（全件検証してから書く）、L-018（検証した値を保存する）、L-060（配線をテストする）、L-456（`id` と `createdAt` を保つ）。

---

## タスク 1: JSON ファイルのダウンロードを共通化する

**ファイル**: `src/lib/downloadJsonFile.ts`（新規）、`src/lib/__tests__/downloadJsonFile.test.ts`（新規）、`src/features/settings/state/exportFileDownload.ts`

1. テスト: `downloadJsonFile("a.json", { x: 1 })` で、`URL.createObjectURL` に JSON の Blob（2 スペースのインデント、`type: "application/json"`）が渡り、anchor の `download` が `a.json`、`click` され、anchor が取り除かれ、`revokeObjectURL` が呼ばれる。既存の `src/features/settings/__tests__/exportFileDownload.test.ts` の書き方に合わせる。Blob の中身は `FileReader` で読むか、`Blob` の spy の引数で確かめる。
2. 実装:

```ts
/**
 * データを JSON ファイルとしてブラウザに配る。
 * Blob の生成・anchor 経由のダウンロード・後始末だけを持つ。
 */
export const downloadJsonFile = (fileName: string, data: object): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
```

3. `downloadExportData` はファイル名を組み立てて `downloadJsonFile` を呼ぶだけにする。既存のテストがそのまま通ること。

## タスク 2: ファイル形式の組み立てと検証（`budgetAllowanceTransfer.ts`）

**ファイル**: `src/features/budget/budgetAllowanceTransfer.ts`（新規）、`src/features/budget/__tests__/budgetAllowanceTransfer.test.ts`（新規）

1. テスト:
   - `buildBudgetAllowanceExport(income, expense, new Date("2026-10-31T00:00:00.000Z"))` の結果を `JSON.stringify` して `parseBudgetAllowanceImport` に渡すと、同じ項目が同じ順で返る（往復）。`type`・`version`・`exportDate` が入る。
   - `getBudgetAllowanceExportFileName("2026-10-31")` が `daily-routine-budget-allowance-2026-10-31.json`。
   - `invalidFormat` になる入力を `it.each` で: JSON でない文字列、`null`、配列、`type` 違い、`type` 無し、設定画面のバックアップ形式（`budgetIncomeItems` を持つオブジェクト）、`version` が `2`・文字列、`incomeItems` が配列でない、`expenseItems` が無い、項目が文字列、`name` が数値、`name` が空白だけ、`amount` が `0`・負・文字列・`null`、`kind` が不正・無し。
   - 両方の配列が空なら `empty`。片方だけ空なら成功。
   - `name` の trim。
   - `id` が無い・空・数値なら新しい `id` が作られる。接頭辞は収入 `budget-income-item`、支出 `budget-expense-item`。同じ配列で重複すると 2 件目以降だけ新しくなる。
   - `createdAt` が無ければ現在時刻の ISO 文字列になる。
   - 未知のキー（項目にも最上位にも）が結果に残らない。支出項目の結果のキーが `id, name, amount, kind, createdAt` だけである。
2. 実装の骨子:

```ts
import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { createBudgetExpenseItem } from "./budgetExpenseItemFactory";
import { createBudgetIncomeItem } from "./budgetIncomeItemFactory";
import { normalizeCategoryName } from "./budgetCategoryNameNormalization";

const FILE_TYPE = "daily-routine-budget-allowance";
const FILE_VERSION = 1 as const;
/** インポートで受け付けるファイルの上限 */
export const BUDGET_ALLOWANCE_IMPORT_MAX_BYTES = 1024 * 1024;

export type BudgetAllowanceExportFile = {
  type: typeof FILE_TYPE;
  version: typeof FILE_VERSION;
  exportDate: string;
  incomeItems: BudgetIncomeItem[];
  expenseItems: BudgetExpenseItem[];
};

/** now を省略すると現在時刻を exportDate にする */
export const buildBudgetAllowanceExport = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
  now: Date = new Date(),
): BudgetAllowanceExportFile => ({
  type: FILE_TYPE,
  version: FILE_VERSION,
  exportDate: now.toISOString(),
  incomeItems,
  expenseItems,
});

export type BudgetAllowanceImportFailure = "invalidFormat" | "empty";

export type BudgetAllowanceImportResult =
  | {
      ok: true;
      incomeItems: BudgetIncomeItem[];
      expenseItems: BudgetExpenseItem[];
    }
  | { ok: false; reason: BudgetAllowanceImportFailure };
```

- 項目の検証は、`name`（`normalizeCategoryName` を通す）と `amount`（`typeof === "number"`、`Number.isFinite`、`> 0`）を読む共通の関数にし、不正なら `null` を返す。1 件でも `null` なら全体を `invalidFormat` にする。
- 新しい `id` と `createdAt` は `createBudgetIncomeItem(name, amount)` / `createBudgetExpenseItem(name, amount, kind)` で作った項目を土台にし、ファイルの `id`（空でない文字列で未使用のもの）と `createdAt`（空でない文字列）があれば上書きする。`...raw` のような展開はしない。
- `JSON.parse` の例外は `invalidFormat` にする。

## タスク 3: 保存（`storageAllowanceItems.ts`）

> 注: レビューで `saveBudgetAllowanceItems` の戻り値は `"saved" | "failed" | "rollbackFailed"` に変わり、書き戻すのは収入だけになった。区切りは設計書を正とする。以下は当初の計画。

**ファイル**: `src/features/budget/storageIncomeItems.ts`、`storageExpenseItems.ts`、`storageAllowanceItems.ts`（新規）、`storage.ts`、`src/features/budget/__tests__/storageAllowanceItems.test.ts`（新規）

1. テスト（`localStorage` を使う実物の `setStorageItem` を通す。失敗は `Storage.prototype.setItem` の spy を、支出のキーのときだけ `QuotaExceededError` を投げるようにして作る）:
   - 成功: 両方が保存され、`true`。更新時刻（`getLocalDataUpdatedAt` 相当）が 1 回だけ進む（`setLocalDataUpdatedAt` の spy を使う場合は、実物を呼ぶ形にする）。
   - 支出の保存が失敗: 収入が元の配列に戻り、更新時刻が変わらず、`false`。
   - 収入の保存が失敗: 支出は書かれず（または元のまま）、更新時刻が変わらず、`false`。
2. `saveBudgetIncomeItems` / `saveBudgetExpenseItems` の戻り値を `boolean` にする（`return setStorageItem(...)`）。
3. 実装:

```ts
import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";
import { setLocalDataUpdatedAt, withSyncBatch } from "@/lib/storage/core";
import {
  getBudgetExpenseItems,
  saveBudgetExpenseItems,
} from "./storageExpenseItems";
import {
  getBudgetIncomeItems,
  saveBudgetIncomeItems,
} from "./storageIncomeItems";

/**
 * 収入項目と支出項目を 1 回の操作として置き換える。
 *
 * どちらかの保存に失敗したら控えを書き戻し、収入と支出が混ざった状態を
 * 残さない。書き戻しもバッチの中で行う。外で行うと更新時刻が進み、内容が
 * 元のままなのにクラウド同期がローカルを新しいと判断してしまう。
 */
export const saveBudgetAllowanceItems = (
  incomeItems: BudgetIncomeItem[],
  expenseItems: BudgetExpenseItem[],
): boolean => {
  const previousIncomeItems = getBudgetIncomeItems();
  const previousExpenseItems = getBudgetExpenseItems();
  let saved = false;

  withSyncBatch(() => {
    saved =
      saveBudgetIncomeItems(incomeItems) &&
      saveBudgetExpenseItems(expenseItems);
    if (!saved) {
      saveBudgetIncomeItems(previousIncomeItems);
      saveBudgetExpenseItems(previousExpenseItems);
    }
  });

  if (saved) setLocalDataUpdatedAt(Date.now());
  return saved;
};
```

4. `storage.ts` から `saveBudgetAllowanceItems` を再 export する。

## タスク 4: 一覧の読み直し（`reloadItems`）

**ファイル**: `useBudgetIncomeItemManagementDataState.ts`、`useBudgetExpenseItemManagementDataState.ts`、`useBudgetIncomeItemManagementPageState.ts`、`useBudgetExpenseItemManagementPageState.ts` と各テスト

1. テスト:
   - 既存の DataState のテスト（`../storage` をモック）: `reloadItems()` で `getBudget...Items` を読み直し、`items` が更新される。
   - 既存の PageState のテスト（`useBudgetIncomeItemManagementPageState.test.tsx` / `useBudgetExpenseItemManagementPageState.test.tsx`）: `mockUseDataState.mockReturnValue` に `reloadItems: jest.fn()` を足す（足さないと typecheck が失敗する）。`reloadItems` で DataState の `reloadItems`、`closeForm`、`cancelEditItem` が呼ばれる。
   - 新規 `__tests__/useBudgetAllowanceItemsReload.integration.test.tsx`（モックなし）: 収入・支出のそれぞれで、開いたフォームが閉じること、ストレージを書き換えて `reloadItems` した後に項目を追加しても、読み直した項目が残ること（`persist` が古い `useState` を基にしない）。
2. 実装:
   - DataState: `const reloadItems = () => setItems(getBudgetIncomeItems());`（支出も同様）を返す。
   - PageState: DataState の戻り値を `reloadItems: reloadDataItems` と別名で受け、`const reloadItems = () => { reloadDataItems(); closeForm(); cancelEditItem(); };` を返す。

## タスク 5: ボタンの処理（`useBudgetAllowanceTransfer.ts`）

> 注: レビューで `rollbackFailed` と文言 `errors.partiallySaved` が加わった。設計書を正とする。以下は当初の計画。

**ファイル**: `src/features/budget/useBudgetAllowanceTransfer.ts`（新規）、`__tests__/useBudgetAllowanceTransfer.test.tsx`（新規）、`locales/ja.json`

1. 文言を `allowanceSettings.transfer` に追加する: `title`（`データの書き出し・読み込み`）、`exportButton`、`importButton`、`importingLabel`、`exportSuccess`、`importSuccessTemplate`（`{income}` `{fixed}` `{variable}`）、`confirmImportTemplate`（同じ変数。今の項目が置き換わることを書く）、`errors.invalidFormat` / `tooLarge` / `empty` / `readFailed` / `saveFailed` / `exportFailed`。
2. テスト（`renderHook`。`window.confirm` は spy。`saveBudgetAllowanceItems` と `downloadJsonFile` は `jest.mock`）:
   - `handleExport`: 保存済みの項目を読み、`downloadJsonFile(getBudgetAllowanceExportFileName(getTodayString()), buildBudgetAllowanceExport(income, expense))` の形で呼ばれ、`status` が成功。例外なら `exportFailed`。
   - `handleFileChange`: 正常なファイルで `confirm` が件数つきで呼ばれ、`true` なら `saveBudgetAllowanceItems` と `onImported` が呼ばれ、成功の文言。
   - `confirm` が `false`: 保存せず `onImported` も呼ばず、`status` は `null`。
   - 不正なファイル: `confirm` も保存も呼ばれず `invalidFormat`。空は `empty`。
   - 1 MB 超: `file.text` が呼ばれず `tooLarge`。
   - `file.text` の reject: `readFailed`。
   - 保存が `false`: `onImported` を呼ばず `saveFailed`。
   - どの場合も `event.target.value` が空に戻る。ファイル未選択なら何もしない。
   - 読み込み中は `isImporting` が `true` で、終わると `false`。
   - `file.text` の解決前にアンマウントすると、`confirm` も保存も呼ばれない。
3. 実装の骨子:

```ts
type TransferStatus = { kind: "success" | "error"; message: string } | null;

export const useBudgetAllowanceTransfer = ({
  onImported,
}: {
  onImported: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const [status, setStatus] = useState<TransferStatus>(null);
  const [isImporting, setIsImporting] = useState(false);
  // useEffect で isMountedRef を true / false にする（Strict Mode の再実行で true に戻す）
  // handleExport / handleImportClick / handleFileChange を返す
};
```

- `handleFileChange` は、最初に `const input = event.target` と `file` を控え、`input.value = ""` を `finally` で行う。`status` は処理の開始時に `null` に戻す。
- 件数は `expenseItems` を `kind` で数える。

## タスク 6: 画面（`BudgetAllowanceTransferSection` と配線）

**ファイル**: `components/BudgetAllowanceTransferSection.tsx`（新規）、`components/BudgetAllowanceSettingsPage.tsx`、`__tests__/BudgetAllowanceTransferSection.test.tsx`（新規）、`__tests__/BudgetAllowanceSettingsPage.test.tsx`

1. テスト:
   - Section: ボタンの押下でハンドラーが呼ばれる。`isImporting` でインポートのボタンが無効で、文言が変わる。成功は `role="status"`、失敗は `role="alert"`。`input[type=file]` の `accept` が `application/json,.json`。
   - Page: 既存のテストのモックに `reloadItems` を足す。`useBudgetAllowanceTransfer` は実物のまま、`downloadJsonFile` と `saveBudgetAllowanceItems` をモックして、配線を確かめる（L-060）。
     - ファイルを選ぶと（`window.confirm` は `true`）、収入と支出の `reloadItems` がそれぞれ 1 回呼ばれ、成功のメッセージが表示される。
     - 書き出しボタンで `downloadJsonFile` が呼ばれる。
     - 読み込みボタンで隠した `input` の `click` が呼ばれる（`HTMLInputElement.prototype.click` の spy）。
2. Section は props（`fileInputRef`、`status`、`isImporting`、`onExport`、`onImportClick`、`onFileChange`）を必須で受け取る。見た目は `BudgetAllowanceSectionHeader` の周辺に合わせ、`<section className="mt-8">` に見出し（`h2`。既存のテストが `h3` の一覧を固定費・変動費だけと確かめているため）と 2 つのボタンを横に並べる。隠した `input` には `aria-label` を付ける。
3. Page: `useBudgetAllowanceTransfer({ onImported: () => { income.reloadItems(); expense.reloadItems(); } })` を呼び、固定費・変動費のセクションの後に置く。

## タスク 7: ドキュメントと全体の検証

1. `docs/04-reference/features.md` の家計簿の節に、この画面のエクスポート・インポートを追記する（JSON、確認のうえ置き換え、全体のバックアップは設定画面）。
2. `npm run lint`、`npm run typecheck`、`npm run typecheck:functions`、`npm test`、変更ファイルの `npx prettier --check`。
3. ブラウザでの確認は、実装の後にメインのセッションで行う（`.claude/launch.json` を作って dev サーバーを開き、ログインの要否を確かめる。`launch.json` はコミットしない）。実装のサブエージェントは行わない。
