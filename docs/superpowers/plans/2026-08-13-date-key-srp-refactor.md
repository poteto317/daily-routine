# 日付キー修正の単一責任リファクタリング 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `fix/date-key-timezone` で追加・変更したコードを、1 ファイル 1 責務に整理する。

**Architecture:** 「日付キーの作り方」「時刻の扱い」「1 度だけ実行する仕組み」「何を移行するか」を、それぞれ独立した単位に切り出す。外から見た挙動は一切変えない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library

## 洗い出し

`main` からの変更ファイルを全件確認し、複数の責務を抱えている箇所を 4 件特定した。

| #   | 対象                                   | 抱えている責務                                                               | 対応                   |
| --- | -------------------------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| 1   | `storage/core-modules/time.ts`         | ①日付キーの作り方（JST の知識） ②時刻の変換・比較                            | 2 ファイルに分割       |
| 2   | `lib/dateKeyMigration.ts`              | ①1 度だけ実行する仕組み（マーカー） ②どの移行を走らせるか ③失敗をどう扱うか  | 仕組みを切り出す       |
| 3   | `lib/dateKeyMigration.ts` の置き場所   | `src/lib/` 直下の他モジュールは機能に依存していないが、これだけ 2 機能に依存 | 機能を並べる場所へ移す |
| 4   | `hooks/authSyncStateActions.ts` の型名 | `AuthStateStorageActions` という名前だが、移行の実行も含むようになった       | 実態に合う名前へ       |

### 対象外（分割しない・変更しない）

- **移行 2 つの骨格の重複**。`migrateWeightDateKeys` と `migrateMealDateKeys` は「読む → 移す → 移したものがあれば保存 → 件数を返す」という流れが似ているが、体重は 1 日 1 件のオブジェクト、食事は 1 日複数件の配列で、移し方の中身がまるごと違う。共通化すると引数で分岐する関数になり、それぞれを読んだときに何が起きるか分からなくなる。重複しているのは「移したものがあれば保存する」の 4 行程度で、抽象化の costs が上回る。
- `applyAuthenticatedUserState` が「状態の反映」と「ストレージの準備」を併せ持つ点。`main` 時点から同じ形で、今回の変更で責務が増えたわけではない。

### 置き場所についての補足

`src/lib/storage/exports/` 配下の 8 ファイルは既に `@/features` を import している。つまり「`lib` が機能を参照してはいけない」という規則があるわけではない。ただし `src/lib/` 直下（`firebase.ts` / `helpers.ts` / `holidays.ts` / `isImeComposingKeyDown.ts`）はどれも機能に依存しておらず、`dateKeyMigration.ts` だけが例外になっている。

一方 `src/hooks/` には `authSyncStateActions.ts` や `headerMenuItemsBuilder.ts` のようにフックでないモジュールが多数あり、機能を参照するものも複数ある。移行の一覧は認証チェーンからしか呼ばれないため、そちらへ移すほうが周囲と揃う。

この項目は 4 件のなかで最も弱い根拠であり、規則違反の是正ではなく置き場所の統一である。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは現在の `fix/date-key-timezone` のまま。
- 外から見た挙動を変えない。既存テストは import 元の差し替え以外で書き換えない。
- 各タスクの終わりに `npx jest` 全件を通し、既存 4121 件が緑のままであることを確認する。
- `getTodayString()` / `toJstDateKey()` の呼び出し側の import 元（`@/lib/storage/core`）を変えない。
- テストを追加する場合は RED を確認してから実装する。

## ファイル構成（変更後）

| ファイル                                         | 責務                                   |
| ------------------------------------------------ | -------------------------------------- |
| `storage/core-modules/dateKey.ts`（新規）        | 日付キーの作り方。JST の知識はここだけ |
| `storage/core-modules/time.ts`（変更）           | 時刻の変換・比較                       |
| `storage/core-modules/runOncePerUser.ts`（新規） | ユーザーごとに 1 度だけ実行する        |
| `hooks/dateKeyMigration.ts`（移設）              | どの移行を走らせるか・失敗をどう扱うか |
| `lib/dateKeyShift.ts`（変更なし）                | ずれた日付を見つける                   |
| `features/*/migrate*DateKeys.ts`（変更なし）     | 各機能のデータをどう移すか             |

---

## Task 1: 日付キーを時刻ユーティリティから分ける

**Files:**

- Create: `src/lib/storage/core-modules/dateKey.ts`
- Modify: `src/lib/storage/core-modules/time.ts`
- Modify: `src/lib/storage/core.ts` / `src/lib/storage/exports/common.ts`
- Modify: `src/lib/__tests__/storage.date-key.test.ts`（import 元のみ）

**Interfaces:**

- `dateKey.ts` が produces: `toJstDateKey(date: Date): string` / `getTodayString(): string`
- `time.ts` は `getCurrentTime` / `timeToMinutes` / `minutesToTime` / `isTimePassed` を持つ

「その日がいつか」と「何時何分か」は変わる理由が別。日付キーは JST 固定という方針を持つが、時刻の変換にはその知識が要らない。`getTodayString` はもともと `time.ts` にあったが、今回 `toJstDateKey` と JST のオフセット定数が加わって日付側の比重が増えた。

- [ ] **Step 1: 移設する**

`toJstDateKey` / `getTodayString` / `JST_OFFSET_MS` を `dateKey.ts` へ移す。中身は変えない。

- [ ] **Step 2: re-export を差し替える**

`core.ts` と `exports/common.ts` の import 元を `./core-modules/dateKey` に変える。**公開されている名前と場所（`@/lib/storage/core`）は変えない**ため、呼び出し側は無変更。

- [ ] **Step 3: 確認**

```bash
npx tsc --noEmit
npx jest
```

期待: 既存テストが 1 件も落ちない。落ちたら公開 API を壊している。

---

## Task 2: 「1 度だけ実行する」仕組みを切り出す

**Files:**

- Create: `src/lib/storage/core-modules/runOncePerUser.ts`
- Create: `src/lib/storage/__tests__/runOncePerUser.test.ts`
- Modify: `src/lib/dateKeyMigration.ts`

**Interfaces:**

- Produces: `runOncePerUser(uid: string, markerSuffix: string, task: () => boolean): void`
  - `task` の戻り値は「完了として記録してよいか」。`false` ならマーカーを書かず、次回もう一度走る

マーカーで再実行を防ぐ仕組みは、どの移行にも共通する。`migrateToUserStorage` も同じことを自前で書いており、今後移行が増えるたびに 3 つ目・4 つ目が生まれる。仕組みを 1 箇所に置き、移行の一覧は「何を走らせるか」だけを持つようにする。

- [ ] **Step 1: 失敗テストを書く**

```ts
describe("runOncePerUser", () => {
  afterEach(() => localStorage.clear());

  it("1 度目は実行する", () => {
    const task = jest.fn(() => true);
    runOncePerUser("uid-1", "_probe", task);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("2 度目以降は実行しない", () => {
    runOncePerUser("uid-1", "_probe", () => true);
    const task = jest.fn(() => true);
    runOncePerUser("uid-1", "_probe", task);
    expect(task).not.toHaveBeenCalled();
  });

  it("ユーザーごとに 1 度ずつ実行する", () => {
    runOncePerUser("uid-1", "_probe", () => true);
    const task = jest.fn(() => true);
    runOncePerUser("uid-2", "_probe", task);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("用途ごとに 1 度ずつ実行する", () => {
    // マーカーが混ざると、片方を走らせただけでもう片方が飛ばされる
    runOncePerUser("uid-1", "_probe-a", () => true);
    const task = jest.fn(() => true);
    runOncePerUser("uid-1", "_probe-b", task);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("完了として記録してよくない場合は次回もう一度実行する", () => {
    runOncePerUser("uid-1", "_probe", () => false);
    const task = jest.fn(() => true);
    runOncePerUser("uid-1", "_probe", task);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("マーカーを書けなくても実行自体は済ませる", () => {
    // 保存領域が一杯でも移行は進める。次回もう一度走るが、
    // 移し終えたものは条件に合わなくなるため二重には動かない
    const setItem = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    const task = jest.fn(() => true);

    expect(() => runOncePerUser("uid-1", "_probe", task)).not.toThrow();
    expect(task).toHaveBeenCalledTimes(1);
    setItem.mockRestore();
  });
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**
- [ ] **Step 4: `dateKeyMigration.ts` から仕組みを取り除く**

移行の一覧側に残すのは「体重と食事を走らせる」「片方が落ちてももう片方は走らせる」「どちらかが落ちたら完了として記録しない」の 3 つ。

- [ ] **Step 5: GREEN と全体を確認**

期待: `dateKeyMigration.test.ts` の 5 件が書き換えなしで通ること。

---

## Task 3: 移行の一覧を機能を並べる場所へ移す

**Files:**

- Move: `src/lib/dateKeyMigration.ts` → `src/hooks/dateKeyMigration.ts`
- Move: `src/lib/__tests__/dateKeyMigration.test.ts` → `src/hooks/__tests__/dateKeyMigration.test.ts`
- Modify: `src/hooks/useAuthStateChangedHandler.ts`（import 元）

`src/lib/` 直下の他モジュールは機能に依存していない。移行の一覧は 2 つの機能を並べるものであり、認証チェーンからしか呼ばれない。`src/hooks/` には既にフックでないモジュールが複数あり、機能を参照するものもある。

- [ ] **Step 1: 移設する**

中身は変えない。テストのモックパスも合わせて直す。

- [ ] **Step 2: 確認**

```bash
npx tsc --noEmit
npx jest
```

---

## Task 4: 型名を実態に合わせる

**Files:**

- Modify: `src/hooks/authSyncStateActions.ts`

`AuthStateStorageActions` は「ストレージ操作」を意味する名前だが、`runDateKeyMigrationOnce` が加わり、ログイン直後に走らせる準備処理の集まりになった。名前と中身がずれている。

- [ ] **Step 1: 名前を変える**

`AuthenticatedUserSetupActions` にする。ログイン直後に一度だけ行う準備、という実態を表す。

- [ ] **Step 2: 確認**

型名だけの変更のため、テストの書き換えは不要。

---

## Task 5: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

- [ ] **Step 2: タイムゾーンを変えても変わらないことを確認する**

```bash
TZ=UTC npx jest src/lib src/features/weight-tracker src/features/meal src/features/calendar
TZ=America/New_York npx jest src/lib src/features/weight-tracker src/features/meal src/features/calendar
```

期待: リファクタリング前と失敗件数が同じ（既存の TZ 依存だけが残る）。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

| 壊し方                                      | 落ちるべきテスト                                     |
| ------------------------------------------- | ---------------------------------------------------- |
| `runOncePerUser` のマーカー確認を外す       | 「2 度目以降は実行しない」                           |
| マーカーに `markerSuffix` を含めない        | 「用途ごとに 1 度ずつ実行する」                      |
| `task` の戻り値を無視して常にマーカーを書く | 「完了として記録してよくない場合は次回もう一度実行」 |
| `toJstDateKey` の +9h を外す                | 日付キーのテスト                                     |

- [ ] **Step 4: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動

変わらない。すべて内部構造の整理であり、外から見た振る舞いは同一。公開されている関数名と import 元（`@/lib/storage/core`）も変えない。

### ファイル

- 新規 2 ファイル（実装 2）＋ テスト 1 ファイル
- 移設 2 ファイル（実装 1・テスト 1）
- 変更 5 ファイル

### リスク

- **`core.ts` / `exports/common.ts` の re-export を壊すと広範囲に影響する**: 日付キーは 19 箇所から参照されている。公開名と場所を変えないことで守り、既存テストが 1 件も落ちないことで確認する。
- **`runOncePerUser` のマーカー名の互換性**: 既に配布済みのマーカー（`user:<uid>:_date-key-migrated`）と同じ文字列を作ること。変わると、移行済みのユーザーでもう一度走る。移行は二重に動かない作りだが、無駄な書き込みが発生する。
