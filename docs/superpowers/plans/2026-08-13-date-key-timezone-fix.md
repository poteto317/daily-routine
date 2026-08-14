# 日付キーのタイムゾーン不整合の修正 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 日付キーの算出を JST 基準に統一し、日本時間の 0〜9 時に記録が前日として保存される不具合を直す。既に前日キーで保存された記録も正しい日付へ移す。

**Architecture:** 「今この瞬間の日付」と「ある `Date` の日付」の 2 つを共通モジュールに置き、UTC 基準で日付を作っている全箇所をそこへ寄せる。既存データは `createdAt` から正しい日付を割り出して 1 度だけ移す。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library / Playwright

## 背景

コアの `getTodayString()` は JST(+9h) 補正しているが、多くの機能が素の `toISOString()` で日付を作っている。日本時間の 0〜9 時は UTC ではまだ前日のため、この時間帯の記録が前日として保存される。

実測（体重記録）:

```
夜 8/12 20:00 JST に記録 → キー "2026-08-12" (70.0kg)
翌朝 8/13 07:00 JST に記録 → キー "2026-08-12" (69.5kg)

結果: レコード1件 / キー 2026-08-12 / 値 69.5
```

体重履歴は日付をキーに 1 日 1 件のため、**前日の記録が消える**。毎朝記録するだけの使い方でも、記録は一貫して 1 日ずつ前へずれる。

さらに `Date` を受け取って日付文字列にする関数も UTC 基準で、時刻に関係なく常に 1 日ずれる。

```
toDateString(new Date(2026, 7, 13))  // → "2026-08-12"
formatDate(new Date(2026, 7, 13))    // → "2026-08-12"
```

ルーティン本体（進捗・履歴）は `getTodayString()` を使っており正しい。そのため、カレンダー上でルーティンの記録と体重・食事の記録が別の日に並ぶ不整合も起きる。

## 設計判断

**JST 固定に統一する**

端末のローカル時刻ではなく JST 固定にする。既存の `getTodayString()` が採っている方針であり、祝日判定・電車遅延・日本語のみの UI と、アプリ全体が日本向けに作られているため。海外から使っても「日本の日付」で記録が並ぶ。

**用途で 2 つに分ける**

- `getTodayString()` — 今この瞬間の JST 日付。既存のまま
- `toJstDateKey(date)` — 任意の `Date` の JST 日付

前者は「今日」を知りたい箇所、後者は「この `Date` の日付キー」が欲しい箇所で使う。混同すると今回のような取り違えが再発する。

**既存データは `createdAt` から割り出して移す**

体重・食事の各レコードは `createdAt`（ISO 文字列）を持つ。「`date` が `createdAt` の UTC 日付と一致し、かつ JST 日付とは異なる」レコードだけを、正しい JST 日付へ移す。夜に記録した分は UTC 日付と JST 日付が同じなので対象外になる。

移し先に既にレコードがある場合は移さない。夜に記録した正しいレコードを消さないため。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは `fix/date-key-timezone`。
- 移行は 1 度だけ実行する。既存の `migrateToUserStorage` と同じくマーカーキーで制御する。
- 移行で既存のレコードを上書きしない。
- `getTodayString()` の戻り値の仕様（JST の `YYYY-MM-DD`）を変えない。
- テストは実行環境のタイムゾーンに依存させない。`jest.setSystemTime` で UTC の瞬間を固定して検証する（`npm test` は `TZ=Asia/Tokyo` 固定だが、それに寄りかからない）。
- テストは RED を確認してから実装する。

## 修正対象の一覧

`toISOString().split("T")[0]` を使っている箇所を全件確認した。

| ファイル                                  | 現状           | 直し方                        |
| ----------------------------------------- | -------------- | ----------------------------- |
| `lib/storage/core-modules/time.ts:5`      | JST（正しい）  | `toJstDateKey` を使う形に整理 |
| `weight-tracker/page/helpers.ts:5`        | UTC            | `getTodayString()`            |
| `weight-tracker/storageRecords.ts:11`     | UTC            | `getTodayString()`            |
| `meal/utils/mealFormat.ts:4`              | UTC            | `getTodayString()`            |
| `meal/storageQueries.ts:9`                | UTC            | `getTodayString()`            |
| `calendar/utils/calendarDate.ts:2`        | UTC            | `toJstDateKey`                |
| `calendar/components/CalendarGrid.tsx:35` | 上記経由で UTC | `getTodayString()`            |
| `statistics/statistics/helpers.ts:1`      | UTC            | `toJstDateKey`                |
| `weather/page/hourlySelection.ts:22,31`   | UTC            | `getTodayString()`            |
| `weather/page/format.ts:49`               | UTC            | `getTodayString()`            |
| `weather/page/hourlySelection.ts:3`       | 端末ローカル   | `toJstDateKey` に統合して削除 |
| `settings/state/exportFileDownload.ts:16` | UTC            | `getTodayString()`            |

`statistics/statistics/period.ts` は `new Date("YYYY-MM-DD")`（UTC 深夜として解釈）を作って `formatDate` で戻すため、UTC 同士で釣り合って結果は正しい。JST 基準に変えても `2026-08-13T00:00Z` は JST の 8/13 9:00 で同じ日付になるため、結果は変わらない。

## ファイル構成

| ファイル                                                   | 責務                                 |
| ---------------------------------------------------------- | ------------------------------------ |
| `lib/storage/core-modules/time.ts`（変更）                 | `getTodayString` と `toJstDateKey`   |
| `features/weight-tracker/migrateWeightDateKeys.ts`（新規） | 体重記録の日付キーを移す             |
| `features/meal/migrateMealDateKeys.ts`（新規）             | 食事記録の日付キーを移す             |
| `lib/dateKeyMigration.ts`（新規）                          | 2 つの移行をまとめ、1 度だけ実行する |
| 上表の各ファイル（変更）                                   | 日付の作り方を差し替える             |

移行を機能ごとに分けるのは、どのレコードをどう移すかがそれぞれのデータ構造の知識だから。体重は 1 日 1 件のオブジェクト、食事は 1 日に複数件の配列で、移し方が違う。

---

## Task 1: 日付ヘルパーを整える

**Files:**

- Modify: `src/lib/storage/core-modules/time.ts`
- Test: `src/lib/__tests__/storage.time-utils.test.ts`（既存に追記）

**Interfaces:**

- Produces: `toJstDateKey(date: Date): string`
- `getTodayString()` は `toJstDateKey(new Date())` として実装し直す（戻り値は変わらない）

- [ ] **Step 1: 失敗テストを書く**

```ts
describe("toJstDateKey", () => {
  it("JST の日付を返す", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).toBe("2026-08-13");
  });

  it("UTC の日付をそのまま返さない", () => {
    // ここが UTC のままだと、日本時間の 0〜9 時が前日になる
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).not.toBe(
      "2026-08-12",
    );
  });

  it("JST の日付が変わる境目で切り替わる", () => {
    // 2026-08-12 23:59:59 JST → まだ 8/12
    expect(toJstDateKey(new Date("2026-08-12T14:59:59Z"))).toBe("2026-08-12");
    // 2026-08-13 00:00:00 JST → 8/13
    expect(toJstDateKey(new Date("2026-08-12T15:00:00Z"))).toBe("2026-08-13");
  });

  it("月をまたぐ", () => {
    // 2026-09-01 00:30 JST = 2026-08-31 15:30 UTC
    expect(toJstDateKey(new Date("2026-08-31T15:30:00Z"))).toBe("2026-09-01");
  });
});

describe("getTodayString", () => {
  afterEach(() => jest.useRealTimers());

  it("日本時間の朝でも当日を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
    expect(getTodayString()).toBe("2026-08-13");
  });
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**

```ts
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * その瞬間の JST の日付を YYYY-MM-DD で返す。
 *
 * 端末のタイムゾーンに依存させない。このアプリは祝日判定も電車遅延も
 * 日本向けで、海外から使っても「日本の日付」で記録が並ぶのが自然なため。
 */
export const toJstDateKey = (date: Date): string =>
  new Date(date.getTime() + JST_OFFSET_MS).toISOString().split("T")[0];

/** 今日の日付（JST）。「今」が欲しいときはこちらを使う */
export const getTodayString = (): string => toJstDateKey(new Date());
```

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 2: 「今日」を求めている箇所を差し替える

**Files:**

- Modify: `weight-tracker/page/helpers.ts` / `weight-tracker/storageRecords.ts`
- Modify: `meal/utils/mealFormat.ts` / `meal/storageQueries.ts`
- Modify: `weather/page/format.ts` / `weather/page/hourlySelection.ts`
- Modify: `settings/state/exportFileDownload.ts`
- Test: 各機能の既存テストに追記

- [ ] **Step 1: 失敗テストを書く**

体重・食事について、朝の時刻を固定して「当日のキーで保存・取得される」ことを確かめる。

```ts
it("日本時間の朝に記録しても当日のキーになる", () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

  expect(getTodayDateKey()).toBe("2026-08-13");
});

it("夜に記録した前日の記録を上書きしない", () => {
  // 8/12 20:00 JST
  jest.setSystemTime(new Date("2026-08-12T11:00:00Z"));
  saveWeightRecord(getTodayDateKey(), 70);
  // 8/13 07:00 JST
  jest.setSystemTime(new Date("2026-08-12T22:00:00Z"));
  saveWeightRecord(getTodayDateKey(), 69.5);

  const history = getWeightHistory();
  expect(Object.keys(history).sort()).toEqual(["2026-08-12", "2026-08-13"]);
  expect(history["2026-08-12"].weight).toBe(70);
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 各箇所を `getTodayString()` に差し替える**
- [ ] **Step 4: GREEN と全体を確認**

---

## Task 3: `Date` から日付キーを作る箇所を差し替える

**Files:**

- Modify: `calendar/utils/calendarDate.ts` / `calendar/components/CalendarGrid.tsx`
- Modify: `statistics/statistics/helpers.ts`
- Modify: `weather/page/hourlySelection.ts`（`toLocalDateKey` を削除して `toJstDateKey` へ）
- Test: 各機能の既存テストに追記

- [ ] **Step 1: 失敗テストを書く**

```ts
it("ローカルで組み立てた日付が 1 日ずれない", () => {
  // 2026-08-13 のセルを表すローカル日付
  expect(toDateString(new Date(2026, 7, 13))).toBe("2026-08-13");
});
```

`new Date(2026, 7, 13)` は端末のタイムゾーンで作られるため、`TZ` が JST 以外だと結果が変わりうる。テストは `TZ=Asia/Tokyo` 前提の記述を避け、UTC の瞬間を明示して書く。

```ts
it("カレンダーの今日判定が日本時間の朝でもずれない", () => {
  jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
  expect(getTodayString()).toBe("2026-08-13");
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 差し替える**

`toLocalDateKey` は `toJstDateKey` に置き換えて削除する。同じ用途の関数が 2 つある状態を残さない。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 4: 体重記録の日付キーを移す

**Files:**

- Create: `src/features/weight-tracker/migrateWeightDateKeys.ts`
- Test: `src/features/weight-tracker/__tests__/migrateWeightDateKeys.test.ts`

**Interfaces:**

- Produces: `migrateWeightDateKeys(): number`（移した件数）

- [ ] **Step 1: 失敗テストを書く**

観点:

- `date` が `createdAt` の UTC 日付と一致し、JST 日付と異なるレコードを JST 日付へ移す
- 夜に記録した（UTC 日付 = JST 日付）レコードは動かさない
- `date` が `createdAt` のどちらの日付とも一致しないレコードは動かさない（手で日付を変えた可能性があるため）
- 移し先に既にレコードがあれば移さない
- レコード内の `date` フィールドも新しいキーに合わせて書き換える
- `createdAt` が無い・壊れているレコードは動かさない
- 移した件数を返す

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**
- [ ] **Step 4: GREEN と全体を確認**

---

## Task 5: 食事記録の日付キーを移す

**Files:**

- Create: `src/features/meal/migrateMealDateKeys.ts`
- Test: `src/features/meal/__tests__/migrateMealDateKeys.test.ts`

**Interfaces:**

- Produces: `migrateMealDateKeys(): number`（移した件数）

食事は 1 日に複数件を配列で持つため、レコード単位で移す。移し先の配列に追加し、元の配列から取り除く。移した結果、空になった日付のキーは消す。

- [ ] **Step 1: 失敗テストを書く**

観点は Task 4 と同じ。加えて:

- 同じ日付の中に移すレコードと移さないレコードが混ざっていても、移す分だけを動かす
- 移し先に既に別のレコードがあれば、そこへ追加する（体重と違い上書きにならない）
- 移した結果、元の日付のレコードが 0 件になったらキーごと消す

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**
- [ ] **Step 4: GREEN と全体を確認**

---

## Task 6: 移行を 1 度だけ実行する

**Files:**

- Create: `src/lib/dateKeyMigration.ts`
- Test: `src/lib/__tests__/dateKeyMigration.test.ts`
- Modify: 認証後の処理チェーン（`migrateToUserStorage` を呼んでいる箇所）

**Interfaces:**

- Produces: `runDateKeyMigrationOnce(): void`

既存の `migrateToUserStorage` と同じく、マーカーキーで再実行を防ぐ。ユーザーごとのデータを扱うため、ユーザースコープが確定したあと（`migrateToUserStorage` の直後）に走らせる。

- [ ] **Step 1: 失敗テストを書く**

- 1 度目は体重・食事の移行を実行する
- 2 度目以降は何もしない
- 片方の移行が例外を投げても、もう片方は実行される（1 つの不整合で全体が止まらないようにする）
- マーカーが書けなくても移行自体は完了する

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**
- [ ] **Step 4: 認証後のチェーンへ組み込む**

`migrateToUserStorage` と同じ場所で注入する。テストで注入されていることを確かめる。

- [ ] **Step 5: GREEN と全体を確認**

---

## Task 7: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npx prettier --check <変更したファイル>
```

- [ ] **Step 2: 実行環境のタイムゾーンを変えても通ることを確認する**

```bash
TZ=UTC npx jest src/lib src/features/weight-tracker src/features/meal src/features/calendar src/features/statistics
TZ=America/New_York npx jest src/lib src/features/weight-tracker src/features/meal src/features/calendar src/features/statistics
```

期待: どちらも pass。JST 固定にした意味がここで確かめられる。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

| 壊し方                              | 落ちるべきテスト                             |
| ----------------------------------- | -------------------------------------------- |
| `toJstDateKey` の +9h を外す        | 「JST の日付を返す」                         |
| `getTodayDateKey` を UTC 方式に戻す | 「日本時間の朝に記録しても当日のキーになる」 |
| `toDateString` を UTC 方式に戻す    | 「ローカルで組み立てた日付が 1 日ずれない」  |
| 移行の「UTC 日付と一致」条件を外す  | 「動かさないレコード」の検証                 |
| 移行の衝突チェックを外す            | 「移し先に既にレコードがあれば移さない」     |
| マーカーの確認を外す                | 「2 度目以降は何もしない」                   |

- [ ] **Step 4: 手動確認項目を足す**

`docs/03-testing/test-matrix.md` に、端末の時刻を日本時間の朝に合わせて体重・食事を記録し、当日として保存されることの確認を追加する。

- [ ] **Step 5: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動が変わる箇所

- 日本時間 0〜9 時に記録した体重・食事が、当日として保存される
- カレンダーの「今日」のハイライトが、朝もずれない
- 天気の「今日」判定が、朝もずれない
- 統計・カレンダーで `Date` から作る日付キーが 1 日ずれなくなる
- エクスポートファイル名の日付が JST になる
- 既に前日キーで保存されていた体重・食事の記録が、1 度だけ正しい日付へ移る

### 変わらない箇所

- ルーティン本体（進捗・履歴）。もともと `getTodayString()` を使っており正しい
- `getTodayString()` の戻り値の仕様
- 統計の期間指定（UTC 同士で釣り合っていたため結果は同じ）
- クラウド同期・エクスポートの中身の構造

### リスク

- **移行は元に戻せない**: マーカーで 1 度だけ実行する。移し先に既にレコードがあるときは移さないため、既存のレコードを消すことはない。
- **判定を誤る余地**: 夜 20 時に記録した分は UTC 日付と JST 日付が同じなので対象外になる。ただし「朝に記録した」と「たまたま UTC 日付と一致する日付を手で入れた」は区別できない。体重・食事とも日付を選ぶ UI が無く、記録は常に「今日」に対して行われるため、実際には起きない想定。
- **既に上書きで失われた記録は戻らない**: 夜と翌朝の両方に記録していた場合、翌朝の記録が夜の記録を上書きしている。移行はキーを移すだけで、失われた値は復元できない。
