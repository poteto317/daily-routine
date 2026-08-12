# エクスポート・インポート拡張の単一責任リファクタリング 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `feature/export-import-full-coverage` で追加・変更したコードを、1 ファイル 1 責務に整理する。

**Architecture:** 「どのグループがあるか」「payload をどう安全に読むか」「各ドメインが何を持つか」「ファイルをどう配るか」を、それぞれ独立した単位に切り出す。外から見た挙動は一切変えない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library

## 洗い出し

`main` からの変更ファイルを全件確認し、複数の責務を抱えている箇所を 4 件特定した。

| #   | 対象                                    | 抱えている責務                                                                                                | 対応                 |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | `state/dataTransferGroups.ts`（201 行） | ①payload を安全に読む手続き ②各ドメインが持つデータの定義（11 ドメインに依存）                                | 3 段階に分割         |
| 2   | `state/constants.ts`                    | `TransferOptions` のキーが型・`ALL`・`EMPTY` の 3 箇所に重複。4→8 キー化で重複が倍増した                      | キー一覧から導出する |
| 3   | `state/dataTransferHelpers.ts`          | ①エクスポート用データの組み立て ②ブラウザのダウンロード操作（Blob・anchor・DOM）③ラベル抽出 ④インポートの適用 | ダウンロードを分離   |
| 4   | `__tests__/dataTransferHelpers.test.ts` | 「全グループを選んだ状態」の組み立てが 3 箇所に重複                                                           | ヘルパーにまとめる   |

### 対象外（変更していない既存の問題）

- `state/constants.ts` が通知・電車路線・機能表示など無関係な定数の寄せ集めになっている点。`main` 時点から存在し、今回の変更とは無関係。
- `helpers/dataManagement.ts` がボタンの表示状態・メッセージ・項目一覧を併せ持っている点。同上。今回触ったのは `DATA_OPTION_ITEMS` の導出だけ。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは現在の `feature/export-import-full-coverage` のまま。
- 外から見た挙動を変えない。既存テストは 1 件も書き換えずに通ること（型の導出方法が変わる箇所を除く）。
- 各タスクの終わりに `npx jest` 全件を通し、既存 4042 件が緑のままであることを確認する。
- エクスポートファイルの JSON のキー名・`version` を変えない。
- テストを追加する場合は RED を確認してから実装する。

## ファイル構成（変更後）

| ファイル                                        | 責務                                          |
| ----------------------------------------------- | --------------------------------------------- |
| `state/transferGroupKeys.ts`（新規）            | グループのキー一覧と順序。他に何も依存しない  |
| `state/constants.ts`（変更）                    | キー一覧から `TransferOptions` と既定値を導く |
| `state/transferPayloadRestore.ts`（新規）       | payload から値を安全に取り出して保存する      |
| `state/transferGroups/recordGroup.ts`（新規）   | 記録グループが持つデータ                      |
| `state/transferGroups/budgetGroup.ts`（新規）   | 家計簿グループが持つデータ                    |
| `state/transferGroups/todoListGroup.ts`（新規） | Todoリストグループが持つデータ                |
| `state/dataTransferGroups.ts`（変更）           | グループ定義表の組み立て                      |
| `state/exportFileDownload.ts`（新規）           | 組み立てたデータをファイルとして配る          |
| `state/dataTransferHelpers.ts`（変更）          | 表を回して収集・復元・ラベル抽出を行う        |

複数キーを持つグループだけを別ファイルにするのは、クラウド同期の作りに合わせるため。`src/features/sync/sync/` でも `budgetSyncData.ts` と `todoListSyncData.ts` だけが独立し、単一キーのものは `localData.ts` に並べてある。

---

## Task 1: キー一覧を切り出し、型と既定値を導出する

**Files:**

- Create: `src/features/settings/state/transferGroupKeys.ts`
- Modify: `src/features/settings/state/constants.ts`
- Test: `src/features/settings/__tests__/transferGroupKeys.test.ts`

**Interfaces:**

- Produces:
  - `TRANSFER_GROUP_KEYS: readonly TransferGroupKey[]`
  - `type TransferGroupKey`
- `constants.ts` は `TransferOptions = Record<TransferGroupKey, boolean>` を導き、`ALL_TRANSFER_OPTIONS` / `EMPTY_TRANSFER_OPTIONS` をキー一覧から組み立てる

現状はキーが 3 箇所（型・`ALL`・`EMPTY`）に並んでおり、グループを足すたびに 3 箇所へ同じ変更を書く。1 箇所でも漏れると型エラーで気づけるが、そもそも書く場所が 1 つで済む形にする。

他に何も import しないファイルに置くのは、`dataTransferGroups.ts` が `constants.ts` を参照している現状で循環参照を避けるため。

- [ ] **Step 1: 失敗テストを書く**

```ts
import {
  ALL_TRANSFER_OPTIONS,
  EMPTY_TRANSFER_OPTIONS,
} from "../state/constants";
import { TRANSFER_GROUP_KEYS } from "../state/transferGroupKeys";

describe("TRANSFER_GROUP_KEYS", () => {
  it("キーが重複していない", () => {
    expect(new Set(TRANSFER_GROUP_KEYS).size).toBe(TRANSFER_GROUP_KEYS.length);
  });

  it("既存の 4 グループを先頭の並びで保つ", () => {
    // チェックボックスの並び順が変わるとユーザーの見え方が変わる
    expect(TRANSFER_GROUP_KEYS.slice(0, 4)).toEqual([
      "routines",
      "progress",
      "history",
      "settings",
    ]);
  });
});

describe("既定値", () => {
  it("ALL は全キーが true", () => {
    TRANSFER_GROUP_KEYS.forEach((key) => {
      expect(ALL_TRANSFER_OPTIONS[key]).toBe(true);
    });
  });

  it("EMPTY は全キーが false", () => {
    TRANSFER_GROUP_KEYS.forEach((key) => {
      expect(EMPTY_TRANSFER_OPTIONS[key]).toBe(false);
    });
  });

  it("既定値はキー一覧と過不足なく一致する", () => {
    // キーを足したのに既定値へ入れ忘れると、選択状態が undefined になる
    expect(Object.keys(ALL_TRANSFER_OPTIONS).sort()).toEqual(
      [...TRANSFER_GROUP_KEYS].sort(),
    );
    expect(Object.keys(EMPTY_TRANSFER_OPTIONS).sort()).toEqual(
      [...TRANSFER_GROUP_KEYS].sort(),
    );
  });

  it("ALL と EMPTY は互いに独立したオブジェクト", () => {
    // 共有していると、片方への代入がもう片方に波及する
    expect(ALL_TRANSFER_OPTIONS).not.toBe(EMPTY_TRANSFER_OPTIONS);
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/features/settings/__tests__/transferGroupKeys.test.ts
```

期待: `Cannot find module '../state/transferGroupKeys'`。

- [ ] **Step 3: キー一覧を実装する**

`src/features/settings/state/transferGroupKeys.ts`

```ts
/**
 * エクスポート・インポートのグループ。並び順はチェックボックスの表示順になる。
 *
 * 他に何も依存しないファイルに置く。型と既定値、グループ定義表の三者が
 * ここを参照するため、どこか 1 つに同居させると循環参照になる。
 */
export const TRANSFER_GROUP_KEYS = [
  "routines",
  "progress",
  "history",
  "settings",
  "records",
  "todoLists",
  "budget",
  "presets",
] as const;

export type TransferGroupKey = (typeof TRANSFER_GROUP_KEYS)[number];
```

- [ ] **Step 4: `constants.ts` を導出に切り替える**

```ts
import {
  TRANSFER_GROUP_KEYS,
  type TransferGroupKey,
} from "./transferGroupKeys";

export type TransferOptions = Record<TransferGroupKey, boolean>;

/** 全キーを同じ値で埋めた選択状態を作る */
const createTransferOptions = (value: boolean): TransferOptions =>
  TRANSFER_GROUP_KEYS.reduce(
    (options, key) => ({ ...options, [key]: value }),
    {} as TransferOptions,
  );

export const ALL_TRANSFER_OPTIONS: TransferOptions =
  createTransferOptions(true);
export const EMPTY_TRANSFER_OPTIONS: TransferOptions =
  createTransferOptions(false);
```

- [ ] **Step 5: GREEN と全体を確認**

```bash
npx jest src/features/settings/__tests__/transferGroupKeys.test.ts
npx tsc --noEmit
npx jest
```

---

## Task 2: payload の読み取りを切り出す

**Files:**

- Create: `src/features/settings/state/transferPayloadRestore.ts`
- Modify: `src/features/settings/state/dataTransferGroups.ts`
- Test: `src/features/settings/__tests__/transferPayloadRestore.test.ts`

**Interfaces:**

- Produces:
  - `type TransferPayload = Record<string, unknown>`
  - `restoreField<T>(payload, key, save): void`
  - `restoreArrayField<T>(payload, key, save, errorMessage): void`
  - `restoreObjectField<T>(payload, key, save, errorMessage): void`

「payload に値があるときだけ保存する」「型を検証してから保存する」は、どのグループにも共通する手続きであってドメインの知識ではない。現状は `history` だけがインラインで検証を書いており、他 2 種と形が揃っていない。3 つ目として `restoreObjectField` を用意して揃える。

- [ ] **Step 1: 失敗テストを書く**

```ts
import {
  restoreArrayField,
  restoreField,
  restoreObjectField,
} from "../state/transferPayloadRestore";

describe("restoreField", () => {
  it("値があれば保存する", () => {
    const save = jest.fn();
    restoreField({ a: 1 }, "a", save);
    expect(save).toHaveBeenCalledWith(1);
  });

  it("キーが無ければ保存しない", () => {
    // 旧バージョンのファイルには存在しないキーがある。
    // 既定値で上書きすると手元のデータを消してしまう。
    const save = jest.fn();
    restoreField({}, "a", save);
    expect(save).not.toHaveBeenCalled();
  });

  it("null は保存しない", () => {
    const save = jest.fn();
    restoreField({ a: null }, "a", save);
    expect(save).not.toHaveBeenCalled();
  });

  it("空配列や空オブジェクトは保存する", () => {
    // 明示的な空はユーザーが全削除した結果として尊重する
    const save = jest.fn();
    restoreField({ a: [] }, "a", save);
    expect(save).toHaveBeenCalledWith([]);
  });

  it("false や 0 も保存する", () => {
    // 値の有無を truthy 判定にすると、正当な値を取りこぼす
    const save = jest.fn();
    restoreField({ a: false }, "a", save);
    expect(save).toHaveBeenCalledWith(false);
  });
});

describe("restoreArrayField", () => {
  it("配列なら保存する", () => {
    const save = jest.fn();
    restoreArrayField({ a: [1] }, "a", save, "boom");
    expect(save).toHaveBeenCalledWith([1]);
  });

  it("配列でなければエラーにする", () => {
    expect(() => restoreArrayField({ a: "x" }, "a", jest.fn(), "boom")).toThrow(
      "boom",
    );
  });

  it("キーが無ければ検証もせず何もしない", () => {
    expect(() => restoreArrayField({}, "a", jest.fn(), "boom")).not.toThrow();
  });
});

describe("restoreObjectField", () => {
  it("オブジェクトなら保存する", () => {
    const save = jest.fn();
    restoreObjectField({ a: { x: 1 } }, "a", save, "boom");
    expect(save).toHaveBeenCalledWith({ x: 1 });
  });

  it("配列はオブジェクトとして扱わない", () => {
    // 履歴は月をキーにしたオブジェクト。配列を受け入れると壊れた形で保存される
    expect(() => restoreObjectField({ a: [] }, "a", jest.fn(), "boom")).toThrow(
      "boom",
    );
  });

  it("文字列はエラーにする", () => {
    expect(() =>
      restoreObjectField({ a: "x" }, "a", jest.fn(), "boom"),
    ).toThrow("boom");
  });
});
```

`false` と `0` の扱いは現状の実装でも正しいが、テストが無く、`if (!value) return` へ書き換えても気づけない。ここで固定する。

- [ ] **Step 2: RED を確認**

- [ ] **Step 3: 実装し、`dataTransferGroups.ts` から読み取りヘルパーを取り除く**

`history` のインライン検証も `restoreObjectField` に置き換える。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 3: 複数キーを持つグループを分割する

**Files:**

- Create: `src/features/settings/state/transferGroups/recordGroup.ts`
- Create: `src/features/settings/state/transferGroups/budgetGroup.ts`
- Create: `src/features/settings/state/transferGroups/todoListGroup.ts`
- Modify: `src/features/settings/state/dataTransferGroups.ts`

**Interfaces:**

- 各ファイルが `collect` と `restore` の組を produces する（`key` と `label` は定義表側が持つ）

`dataTransferGroups.ts` は 11 のドメインに依存している。複数キーを持つ 3 グループ（記録 7 キー・家計簿 4 キー・Todoリスト 2 キー）を切り出すと、残るのは単一キーの 5 グループだけになり、依存は 4 ドメインへ減る。

単一キーのものを残すのは同期の作りに合わせるため。`src/features/sync/sync/` でも複数キーの 2 つだけが独立している。

- [ ] **Step 1: 定義表の網羅を型で保証する**

現状は「表が全キーを持つ」ことを実行時テストだけで見ている。定義を `Record<TransferGroupKey, ...>` で受けると、キーの取りこぼしがコンパイルエラーになる。

```ts
const GROUP_DEFINITIONS: Record<
  TransferGroupKey,
  Omit<TransferGroup, "key">
> = { ... };

export const TRANSFER_GROUPS: TransferGroup[] = TRANSFER_GROUP_KEYS.map(
  (key) => ({ key, ...GROUP_DEFINITIONS[key] }),
);
```

並び順はキー一覧が決める。既存の実行時テストはそのまま残す（型と実行時の両方で守る）。

- [ ] **Step 2: 3 グループを切り出す**

例（`budgetGroup.ts`）:

```ts
export const collectBudgetTransferData = (): TransferPayload => ({ ... });
export const restoreBudgetTransferData = (payload: TransferPayload): void => { ... };
```

- [ ] **Step 3: 定義表を組み立て直す**

- [ ] **Step 4: 確認**

```bash
npx tsc --noEmit
npx jest src/features/settings
```

期待: 既存テストを書き換えずに通ること。

---

## Task 4: ダウンロード処理を切り出す

**Files:**

- Create: `src/features/settings/state/exportFileDownload.ts`
- Modify: `src/features/settings/state/dataTransferHelpers.ts`
- Test: `src/features/settings/__tests__/exportFileDownload.test.ts`

`downloadExportData` は Blob を作り、anchor を DOM に挿して click し、後始末をする。「どのデータを書き出すか」とは変わる理由が別で、テストの書き方も異なる（DOM 操作の検証になる）。

- [ ] **Step 1: 失敗テストを書く**

観点:

- ファイル名に選択したグループ名と日付が入る
- 生成した object URL を解放する
- anchor を DOM から取り除く

現状この関数にはテストが無い。切り出しに合わせて用意する。

- [ ] **Step 2: RED を確認**

- [ ] **Step 3: 移設する**

中身は変えない。`dataTransferHelpers.ts` からは re-export せず、呼び出し側（`dataTransferStateActions` 経由で注入している箇所）の import 元を差し替える。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 5: テストの重複をまとめる

**Files:**

- Modify: `src/features/settings/__tests__/dataTransferHelpers.test.ts`

「全グループを選んだ状態」を `TRANSFER_GROUPS.reduce(...)` で組み立てる記述が 3 箇所にある。`ALL_TRANSFER_OPTIONS` があるので、そちらを使えば済む。

- [ ] **Step 1: `ALL_TRANSFER_OPTIONS` に置き換える**
- [ ] **Step 2: 確認**

---

## Task 6: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

- [ ] **Step 2: 挙動が変わっていないことを確認する**

既存テストを書き換えずに通ったかを確認する。書き換えが必要だった箇所があれば、それは挙動が変わっている可能性が高いので内容を精査する。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

| 壊し方                                        | 落ちるべきテスト                           |
| --------------------------------------------- | ------------------------------------------ |
| `createTransferOptions` を常に `true` にする  | 「EMPTY は全キーが false」                 |
| `restoreField` の値の有無を truthy 判定にする | 「false や 0 も保存する」                  |
| `restoreObjectField` の配列チェックを外す     | 「配列はオブジェクトとして扱わない」       |
| `restoreArrayField` の検証を外す              | 「配列でなければエラーにする」             |
| ダウンロードで `revokeObjectURL` を呼ばない   | 「生成した object URL を解放する」         |
| 定義表からグループを 1 つ削る                 | コンパイルエラー（型で網羅を保証するため） |

- [ ] **Step 4: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動

変わらない。すべて内部構造の整理であり、外から見た振る舞いは同一。エクスポートファイルの中身・キー名・`version`・チェックボックスの並び順も変えない。

### ファイル

- 新規 6 ファイル（実装 6）＋ テスト 3 ファイル
- 変更 3 ファイル（`constants.ts` / `dataTransferGroups.ts` / `dataTransferHelpers.ts`）

### リスク

- **`constants.ts` の型が導出になる**: `TransferOptions` が `Record<TransferGroupKey, boolean>` になる。構造は同じだが、エディタ上の表示が変わる。参照側の型注釈は変えなくてよい。
- **`downloadExportData` の import 元が変わる**: 注入している箇所を追随させる必要がある。型で検出できる。
