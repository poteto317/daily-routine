# エクスポート・インポートの対象拡張 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** JSON エクスポート・インポートで、アプリが持つすべてのデータを扱えるようにする。

**Architecture:** 「グループの定義表」を 1 つ置き、エクスポート・インポート・ラベル表示・チェックボックス一覧のすべてをそこから導く。グループを増やすときに触る場所を 1 箇所に閉じる。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library

## 背景

`src/features/settings/state/dataTransferHelpers.ts:25`

```ts
if (options.routines) data.routines = getRoutines();
if (options.progress) data.progress = getDailyProgress();
if (options.history) data.history = getMonthlyHistory();
if (options.settings) data.settings = getSettings();
```

エクスポートが扱うのは 4 系統だけ。一方でクラウド同期（`src/features/sync/sync/localData.ts`）は 21 系統を扱っている。

漏れているのは Todo リスト / Todo カテゴリ / 家計簿（4 種）/ 作業記録・テンプレート / 体重記録 / 筋トレ記録 / ジャーナル / ポモドーロ履歴 / 食事記録 / プリセット。

Firebase 未設定やローカル利用のユーザーは、データの大半をバックアップできない。「データのバックアップ」と銘打った機能が実態と乖離している。直前にマージした保存失敗の通知では「不要な記録を削除してから」と促すが、削除前に退避する手段が無い。

## 設計判断

**グループ単位の選択を維持する**

全件一括にすると実装は小さくなるが、既存 UI が案内している「ルーティンのみ：別のデバイスにルーティンをコピー」といった使い方ができなくなる。ドメイン単位のグループへ拡張し、選択の仕組みは残す。

**`progress` と `history` は統合しない**

当初は「進捗・達成履歴」で 1 グループにする案だったが、既存の 2 項目を 1 つに畳むと「今日の進捗だけ移す」ができなくなる。既にある機能を削ることになるため分けたまま残し、新規 4 グループを足して計 8 項目とする。

**同期の内部関数には依存しない**

`collectBudgetSyncData` などは `src/features/sync/sync/` の内部にあり、settings から参照すると sync の内部構造に依存してしまう。sync の `localData.ts` と同じく、各機能の `storage` を直接使う。両者は「ドメインの保存を利用する側」として対等に並ぶ。

**グループ定義を 1 つの表に集約する**

現状は「収集の if 連鎖」「復元の if 連鎖」「ラベルの switch」「チェックボックスの項目配列」の 4 箇所に同じ知識が散っている。グループを 8 に増やすとこの重複が 4 倍になるため、`key` / `label` / `collect` / `restore` を持つ表を 1 つ置き、そこから全てを導く。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは `feature/export-import-full-coverage`。
- 既存の 4 項目（`routines` / `progress` / `history` / `settings`）のキー名と挙動を変えない。
- 旧バージョン（`version: "2.0"`）で書き出したファイルを読み込めること。存在しないグループは黙って飛ばす。
- インポートは選択したグループだけを上書きする。選択していないグループには触れない。
- ユーザー向け文言は `locales/ja.json` に置く。
- テストは RED を確認してから実装する。

## グループ定義

| key         | ラベル                                                 | 含むデータ                                                                                                                   |
| ----------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `routines`  | ルーティン登録データ                                   | `routines`                                                                                                                   |
| `progress`  | 今日の進捗データ                                       | `progress`                                                                                                                   |
| `history`   | 達成カレンダー・統計データ（全履歴）                   | `history`                                                                                                                    |
| `settings`  | アプリ設定                                             | `settings`                                                                                                                   |
| `records`   | 記録（ジャーナル・体重・運動・食事・ポモドーロ・作業） | `journalHistory` `weightHistory` `workoutRecordHistory` `mealHistory` `pomodoroHistory` `workSessionHistory` `workTemplates` |
| `todoLists` | Todoリスト                                             | `todoLists` `todoCategories`                                                                                                 |
| `budget`    | 家計簿                                                 | `budgetData` `budgetCategories` `budgetIncomeItems` `budgetExpenseItems`                                                     |
| `presets`   | プリセット                                             | `presets`                                                                                                                    |

JSON のキー名は同期のペイロードと揃える。将来どちらかを見比べるときに対応が取れる。

## ファイル構成

| ファイル                               | 責務                                                           |
| -------------------------------------- | -------------------------------------------------------------- |
| `state/dataTransferGroups.ts`（新規）  | グループの定義表。収集と復元の手続きを持つ                     |
| `state/dataTransferHelpers.ts`（変更） | 表を回してエクスポート用データを組み立て、インポートを適用する |
| `state/constants.ts`（変更）           | `TransferOptions` の 8 キー化                                  |
| `helpers/dataManagement.ts`（変更）    | チェックボックス項目を表から導く                               |
| `locales/ja.json`（変更）              | 文言                                                           |

---

## Task 1: グループ定義表を作る

**Files:**

- Create: `src/features/settings/state/dataTransferGroups.ts`
- Test: `src/features/settings/__tests__/dataTransferGroups.test.ts`
- Modify: `src/features/settings/state/constants.ts`

**Interfaces:**

- Produces:
  - `type TransferGroupKey`（`TransferOptions` のキー）
  - `TRANSFER_GROUPS: TransferGroup[]`
  - `type TransferGroup = { key; label; collect(): Record<string, unknown>; restore(payload): void }`

- [ ] **Step 1: 失敗テストを書く**

グループの網羅と、収集・復元が対応していることを確かめる。個々の保存処理は各機能の storage 側で検証済みのため、ここでは「表の形」と「収集したものが復元で戻ること」に絞る。

```ts
import { TRANSFER_GROUPS } from "../state/dataTransferGroups";
import { ALL_TRANSFER_OPTIONS } from "../state/constants";

describe("TRANSFER_GROUPS", () => {
  it("TransferOptions の全キーを過不足なく持つ", () => {
    // 表と型がずれると、選択できるのに何も出力されない項目が生まれる
    expect(TRANSFER_GROUPS.map((g) => g.key).sort()).toEqual(
      Object.keys(ALL_TRANSFER_OPTIONS).sort(),
    );
  });

  it("キーが重複していない", () => {
    const keys = TRANSFER_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("すべてのグループがラベルを持つ", () => {
    TRANSFER_GROUPS.forEach((group) => {
      expect(group.label.length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/features/settings/__tests__/dataTransferGroups.test.ts
```

期待: `Cannot find module '../state/dataTransferGroups'`。

- [ ] **Step 3: `constants.ts` を 8 キーに広げる**

`TransferOptions` / `ALL_TRANSFER_OPTIONS` / `EMPTY_TRANSFER_OPTIONS` に `records` / `todoLists` / `budget` / `presets` を足す。

- [ ] **Step 4: 定義表を実装する**

各グループの `collect` は該当する getter を呼んでオブジェクトを返し、`restore` は payload に値があるときだけ保存する。import は各機能の `storage` から直接行う。

- [ ] **Step 5: GREEN を確認**

```bash
npx jest src/features/settings/__tests__/dataTransferGroups.test.ts
npx tsc --noEmit
```

---

## Task 2: 収集と復元を表から導く

**Files:**

- Modify: `src/features/settings/state/dataTransferHelpers.ts`
- Test: `src/features/settings/__tests__/dataTransferHelpers.test.ts`（新規）

現状 `dataTransferHelpers.ts` には直接のテストが無い。エクスポート・インポートの本体であり、ここが壊れるとデータが失われるため、拡張にあわせてテストを用意する。

- [ ] **Step 1: 失敗テストを書く**

観点:

- 選択したグループだけが出力に含まれる
- 選択していないグループのデータは書き出さない
- `exportDate` と `version` が入る
- インポートは選択したグループだけを保存する
- 選択していてもファイルに該当データが無ければ何もしない（旧バージョンのファイル対応）
- 不正な形式は既存と同じくエラーにする
- ラベルは表から引く

- [ ] **Step 2: RED を確認**

- [ ] **Step 3: 実装する**

`createExportData` / `importSelectedData` / `getSelectedTypeLabels` を `TRANSFER_GROUPS` の反復に置き換える。`version` は `"3.0"` に上げる。読み込み側はバージョンを見ずにキーの有無だけで判断するため、旧ファイルもそのまま読める。

- [ ] **Step 4: GREEN を確認**

---

## Task 3: チェックボックス一覧を表から導く

**Files:**

- Modify: `src/features/settings/helpers/dataManagement.ts`
- Modify: `src/features/settings/__tests__/settingsDataManagementHelpers.test.ts`

- [ ] **Step 1: `DATA_OPTION_ITEMS` を表から導く**

`TRANSFER_GROUPS` から `{ key, label }` を写す。UI（`DataOptionList.tsx`）はこの配列を回しているだけなので変更不要。

- [ ] **Step 2: テストを足す**

- 8 項目すべてが並ぶこと
- 表とラベルが一致すること

- [ ] **Step 3: 確認**

```bash
npx jest src/features/settings
```

---

## Task 4: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

- [ ] **Step 2: 実装を壊してテストが落ちることを確認する**

| 壊し方                                            | 落ちるべきテスト                         |
| ------------------------------------------------- | ---------------------------------------- |
| 表からグループを 1 つ削る                         | 「全キーを過不足なく持つ」               |
| `createExportData` で選択を無視して全件出す       | 「選択したグループだけが出力に含まれる」 |
| `importSelectedData` で選択を無視して全件保存する | 「選択したグループだけを保存する」       |
| payload に無いキーでも復元を走らせる              | 「該当データが無ければ何もしない」       |

- [ ] **Step 3: 手動確認項目を足す**

`docs/03-testing/test-matrix.md` の `13-D` に、拡張したグループのエクスポート・インポートを追加する。

- [ ] **Step 4: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動が変わる箇所

- エクスポートの選択肢が 4 項目から 8 項目に増える
- 新しい 4 グループを選ぶと、これまで書き出せなかったデータが JSON に含まれる
- エクスポートファイルの `version` が `"2.0"` から `"3.0"` になる

### 変わらない箇所

- 既存 4 項目のキー名・出力内容・インポート時の挙動
- 旧バージョンのファイルの読み込み。存在しないキーは飛ばす
- クラウド同期の経路

### リスク

- **インポートは上書き**: 選択したグループのデータは置き換わる。既存の確認ダイアログでその旨を伝えており、今回もその扱いを踏襲する。
- **ファイルサイズの増加**: 全選択時のエクスポートは従来より大きくなる。JSON のダウンロードのため実害は小さい。
