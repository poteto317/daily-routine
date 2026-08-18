# 曜日・時刻のJST統一とトグルのアクセシビリティ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「今」の曜日・時刻を JST 基準に揃えて日付キーとの食い違いを無くし、service worker に残る UTC 方式も直す。あわせてトグルスイッチに名前と状態を持たせる。

**Architecture:** JST の曜日・時刻を求める関数を日付キーと同じモジュールに置き、「今」を求めている箇所だけを差し替える。渡された `Date` の曜日を求めている箇所には触らない。service worker は別バンドルのため同じ規則を複製する。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library / Playwright

## 背景

### 1. 曜日・時刻が日付キーとずれる

直前の PR で日付キーを JST 固定にしたが、曜日と時刻は端末ローカルのまま残った。同じ瞬間で判断が食い違う。

```
2026-08-13(木) 07:00 JST を各タイムゾーンで観測

TZ=Asia/Tokyo       → 日付キー 2026-08-13 / 曜日 木 / 時刻 7 時    一致
TZ=America/New_York → 日付キー 2026-08-13 / 曜日 水 / 時刻 18 時   ずれる
```

海外から使うと、**水曜のルーティンが表示されるのに進捗は木曜のキーに記録される**。祝日判定も同じ `Date` を使うためずれる。

### 2. service worker に UTC 方式が残る

`checkAndSendNotifications.js` の `today` は UTC 基準で、通知の重複防止キー `notified_<routineId>_<date>` に使われる。ルーティンごと・日ごとに一意になるため重複通知や欠落は起きないが、日付のラベルが 1 日ずれる。曜日判定 `now.getDay()` も端末ローカルで、本体と同じ食い違いを抱える。

### 3. トグルスイッチに名前が無い

実ブラウザで走査したところ、設定画面のトグル 16 個がテキストも `aria-label` も持たない。`role="switch"` も `aria-checked` も無い。スクリーンリーダーには「ボタン」としか読まれず、**何のトグルか・オンかオフかが分からない**。

## 設計判断

### JST 固定に統一する

日付キーが既に JST 固定で、保存済みのデータもその前提で並んでいる。端末ローカルへ戻すと既存データと食い違うため、曜日・時刻も JST に寄せる。祝日判定・電車遅延・日本語のみの UI と、アプリ全体が日本向けである点も同じ。

海外にいるとき「現地の朝」ではなく「日本の朝」でルーティンが並ぶことになるが、日付・曜日・時刻・記録がすべて同じ日を指すほうが破綻しない。

### 触ってよい `getDay()` と触ってはいけない `getDay()` を区別する

`getDay()` は 14 箇所にあるが、用途が 2 種類ある。**取り違えると逆に壊れる。**

「今」を求めている箇所（差し替える）と、渡された `Date` の曜日を求めている箇所（触らない）。後者は `new Date(year, month - 1, day)` のようにローカルで組み立てた日付が渡ってくる。これを JST に変換すると日付がずれる。

```
new Date(2026, 7, 13) をローカルで組み立てて観測

TZ=Asia/Tokyo       → localDay 木 / jstKey 2026-08-13
TZ=Australia/Sydney → localDay 木 / jstKey 2026-08-12  ← 変換するとずれる
TZ=America/New_York → localDay 木 / jstKey 2026-08-13
```

カレンダーのセル・祝日計算・統計の週初め・天気の曜日名は、いずれも組み立てた日付の曜日を求めており、ローカルのままが正しい。

### service worker は規則を複製する

別バンドルのため `@/lib` を import できない。JST の日付・曜日を求める処理を service worker 側に持たせる。生成物（`public/firebase-messaging-sw.js`）は `npm run generate:fcm-sw` で作り直す。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは `fix/jst-weekday-and-a11y`。
- 渡された `Date` の曜日を求めている箇所（カレンダー・祝日・統計・天気）には触らない。
- `getTodayString()` / `toJstDateKey()` の仕様と import 元を変えない。
- テストは実行環境のタイムゾーンに依存させない。`jest.setSystemTime` で UTC の瞬間を固定して検証する。
- タイムゾーンを変えても新規テストが通ることを確認する（`TZ=UTC` / `TZ=America/New_York` / `TZ=Australia/Sydney`）。
- 生成物は手で編集せず、生成コマンドで作り直す。
- テストは RED を確認してから実装する。

## 差し替える箇所の一覧

| ファイル                                                | 現状                       | 直し方                           |
| ------------------------------------------------------- | -------------------------- | -------------------------------- |
| `lib/storage/core-modules/time.ts` `getCurrentTime`     | ローカルの時刻             | JST の時刻                       |
| `lib/storage/core-modules/time.ts` `isTimePassed`       | ローカルで比較             | JST で比較                       |
| `routine/hooks/useHomeViewState.ts:9`                   | `new Date().getDay()`      | JST の曜日                       |
| `routine/helpersPresentation.ts:7`                      | `new Date().getDay()`      | 同上                             |
| `routine/storageVisibility.ts` `shouldShowRoutineToday` | `new Date()` を渡す        | JST の曜日で判定                 |
| `routine/hooks/useRoutineQueries.ts:30`                 | `isHoliday(new Date())`    | JST の日付で判定                 |
| `meal/utils/mealFormat.ts` `getCurrentTimeString`       | ローカルの時刻             | 共通の `getCurrentTime` へ寄せる |
| `service-worker/custom-sw/checkAndSendNotifications.js` | UTC の日付・ローカルの曜日 | JST                              |
| `public/firebase-messaging-sw.template.js`              | 同上                       | 同上                             |

## 触らない箇所

| ファイル                                                    | 理由                                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| `calendar/utils/calendarDate.ts:15` / `CalendarGrid.tsx:56` | 組み立てたセルの日付の曜日。変換するとずれる |
| `lib/holidays-modules/predicates.ts` / `calculators.ts`     | 渡された日付に対する祝日計算                 |
| `statistics/statistics/helpers.ts:13`                       | 週初めの算出。渡された日付基準               |
| `weather/api/mapForecasts.ts:21`                            | 予報日の曜日名                               |
| `lib/dateKeyShift.ts`                                       | 旧動作を見分けるため意図的に UTC のまま      |

---

## Task 1: JST の曜日・時刻を求める関数を足す

**Files:**

- Modify: `src/lib/storage/core-modules/dateKey.ts`
- Modify: `src/lib/storage/core.ts` / `src/lib/storage/exports/common.ts`
- Test: `src/lib/__tests__/storage.date-key.test.ts`（追記）

**Interfaces:**

- Produces:
  - `toJstDay(date: Date): number`（0=日曜）
  - `toJstTime(date: Date): string`（`HH:mm`）

日付キーと同じモジュールに置く。JST のオフセットを知っているのはこのファイルだけ、という状態を保つ。

- [ ] **Step 1: 失敗テストを書く**

```ts
describe("toJstDay", () => {
  it("JST の曜日を返す", () => {
    // 2026-08-13(木) 07:00 JST = 2026-08-12(水) 22:00 UTC
    expect(toJstDay(new Date("2026-08-12T22:00:00Z"))).toBe(4);
  });

  it("UTC の曜日をそのまま返さない", () => {
    // ここが UTC のままだと、日本時間の 0〜9 時が前日の曜日になる
    expect(toJstDay(new Date("2026-08-12T22:00:00Z"))).not.toBe(3);
  });

  it("日付が変わる境目で切り替わる", () => {
    expect(toJstDay(new Date("2026-08-12T14:59:59Z"))).toBe(3);
    expect(toJstDay(new Date("2026-08-12T15:00:00Z"))).toBe(4);
  });

  it("日付キーと同じ日を指す", () => {
    // 曜日だけ別基準だと、表示する曜日と記録する日付が食い違う
    const instant = new Date("2026-08-12T22:00:00Z");
    expect(toJstDateKey(instant)).toBe("2026-08-13");
    expect(toJstDay(instant)).toBe(4); // 2026-08-13 は木曜
  });
});

describe("toJstTime", () => {
  it("JST の時刻を返す", () => {
    expect(toJstTime(new Date("2026-08-12T22:00:00Z"))).toBe("07:00");
  });

  it("0 埋めする", () => {
    expect(toJstTime(new Date("2026-08-12T15:05:00Z"))).toBe("00:05");
  });

  it("日付をまたいでも時刻だけを返す", () => {
    expect(toJstTime(new Date("2026-08-12T14:59:00Z"))).toBe("23:59");
  });
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**

`getTime() + JST_OFFSET_MS` した `Date` の UTC 系ゲッター（`getUTCDay` / `getUTCHours` / `getUTCMinutes`）を使う。ローカル系ゲッターを使うと端末のタイムゾーンが混ざる。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 2: 「今」の時刻を JST にする

**Files:**

- Modify: `src/lib/storage/core-modules/time.ts`
- Modify: `src/features/meal/utils/mealFormat.ts`
- Test: `src/lib/__tests__/storage.time-utils.test.ts`（追記）

**Interfaces:**

- Consumes: Task 1 の `toJstTime`
- `getCurrentTime()` / `isTimePassed()` の**シグネチャは変えない**

- [ ] **Step 1: 失敗テストを書く**

```ts
describe("getCurrentTime", () => {
  afterEach(() => jest.useRealTimers());

  it("JST の時刻を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
    expect(getCurrentTime()).toBe("07:00");
  });
});

describe("isTimePassed", () => {
  afterEach(() => jest.useRealTimers());

  it("JST の時刻で判定する", () => {
    // JST 07:00。06:00 は過ぎていて 08:00 はまだ
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
    expect(isTimePassed("06:00")).toBe(true);
    expect(isTimePassed("08:00")).toBe(false);
  });

  it("minutesAfter を足して判定する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
    expect(isTimePassed("06:30", 30)).toBe(true);
    expect(isTimePassed("06:30", 40)).toBe(false);
  });
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**

`isTimePassed` は `setHours` によるローカル基準の比較をやめ、JST の時刻を分に直して比べる。日付をまたぐ計算が絡まなくなり、タイムゾーンにも左右されない。

`getCurrentTimeString`（食事）は同じ処理を持っているため、共通の `getCurrentTime` へ寄せる。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 3: 「今」の曜日と祝日を JST にする

**Files:**

- Modify: `src/features/routine/hooks/useHomeViewState.ts`
- Modify: `src/features/routine/helpersPresentation.ts`
- Modify: `src/features/routine/storageVisibility.ts`
- Modify: `src/features/routine/hooks/useRoutineQueries.ts`
- Test: 各機能のテストに追記

- [ ] **Step 1: 失敗テストを書く**

観点:

- 日本時間の朝に、その日の曜日のルーティンが表示対象になる
- 表示する曜日と、進捗を記録する日付キーが同じ日を指す
- 「今日は祝日か」の判定が日本時間の朝でもずれない

```ts
it("日本時間の朝でも当日の曜日で表示を判定する", () => {
  // 2026-08-13(木) 07:00 JST。木曜のルーティンが出る
  jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

  expect(shouldShowRoutineToday(routineOn(4))).toBe(true);
  expect(shouldShowRoutineToday(routineOn(3))).toBe(false);
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 差し替える**

`shouldShowRoutineForDate(routine, date)` は渡された日付に対する判定なのでそのまま残す。`shouldShowRoutineToday` だけが「今」を扱うため、JST の曜日で判定する形にする。

祝日は `isHoliday(date)` が渡された日付を見るため、「今日」を JST の日付から組み立てて渡す。

- [ ] **Step 4: GREEN と全体を確認**

---

## Task 4: service worker の日付・曜日を JST にする

**Files:**

- Create: `src/service-worker/custom-sw/jstDate.js`
- Modify: `src/service-worker/custom-sw/checkAndSendNotifications.js`
- Modify: `public/firebase-messaging-sw.template.js`
- Regenerate: `public/firebase-messaging-sw.js`
- Test: `src/service-worker/custom-sw/__tests__/jstDate.test.js`

別バンドルのため `@/lib` を import できない。規則を複製するが、複製は 1 ファイルに閉じ込める。

- [ ] **Step 1: 失敗テストを書く**

本体側と同じ観点（JST の日付・曜日を返す／境目で切り替わる／タイムゾーンに依存しない）。

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装し、`checkAndSendNotifications.js` を差し替える**

`today` と `currentDayOfWeek` の両方を JST 基準にする。

- [ ] **Step 4: テンプレートを直して生成物を作り直す**

```bash
npm run generate:fcm-sw
```

`public/firebase-messaging-sw.js` は手で編集しない。生成後に差分を確認する。

- [ ] **Step 5: GREEN と全体を確認**

---

## Task 5: トグルスイッチに名前と状態を持たせる

**Files:**

- Modify: `src/features/settings/components/FeatureVisibilitySection.tsx`
- Modify: 電車遅延のトグルを持つコンポーネント
- Modify: `src/features/todo-lists/TodoListManagementItem.tsx`
- Test: 各コンポーネントのテストに追記

**Interfaces:**

- 各トグルに `role="switch"` / `aria-checked` / `aria-label` を持たせる

- [ ] **Step 1: 失敗テストを書く**

```ts
it("トグルが名前と状態を持つ", () => {
  render(<FeatureVisibilitySection {...props} />);

  const toggle = screen.getByRole("switch", { name: /ジャーナル/ });
  expect(toggle).toBeChecked();
});

it("オフのトグルは状態が false になる", () => {
  // 名前だけあっても、オンオフが読めないと操作できない
  render(<FeatureVisibilitySection {...propsWithJournalHidden} />);

  expect(screen.getByRole("switch", { name: /ジャーナル/ })).not.toBeChecked();
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**

ラベルは既存の項目名（`FEATURE_VISIBILITY_ITEMS` の `label` など）から組み立て、`locales/ja.json` に文言のひな形を置く。

- [ ] **Step 4: 実ブラウザで残りが無いことを確認する**

名前を持たない操作要素を走査し、0 件になることを確かめる。

- [ ] **Step 5: GREEN と全体を確認**

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

- [ ] **Step 2: タイムゾーンを変えても新規テストが通ることを確認する**

```bash
TZ=UTC npx jest <対象>
TZ=America/New_York npx jest <対象>
TZ=Australia/Sydney npx jest <対象>
```

Sydney を入れるのは、`toJstDateKey` がローカル組み立ての日付でずれる唯一の例だったため。触らないと決めた箇所が実際に影響を受けていないかを確かめる。

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

| 壊し方                                          | 落ちるべきテスト                      |
| ----------------------------------------------- | ------------------------------------- |
| `toJstDay` の +9h を外す                        | 「JST の曜日を返す」                  |
| `toJstTime` の +9h を外す                       | 「JST の時刻を返す」                  |
| `toJstDay` でローカル系ゲッターを使う           | タイムゾーンを変えたときの検証        |
| `shouldShowRoutineToday` をローカルの曜日に戻す | 「朝でも当日の曜日で判定する」        |
| `isTimePassed` をローカル比較に戻す             | 「JST の時刻で判定する」              |
| service worker の JST 変換を外す                | service worker のテスト               |
| `aria-checked` を外す                           | 「オフのトグルは状態が false になる」 |
| `role="switch"` を外す                          | トグルの取得自体が失敗                |

- [ ] **Step 4: 手動確認項目を足す**

`docs/03-testing/test-matrix.md` に、端末のタイムゾーンを日本以外にしたときの表示確認と、スクリーンリーダーでのトグル読み上げを追加する。

- [ ] **Step 5: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動が変わる箇所

- 端末のタイムゾーンが日本以外のとき、表示されるルーティンの曜日・時刻・祝日判定が日本時間基準になる（日付キーと一致する）
- 食事記録の時刻の初期値が JST になる
- 通知の重複防止キーの日付と曜日判定が JST になる
- 設定画面と Todo リスト管理のトグルが、スクリーンリーダーで名前と状態を読み上げられる

### 変わらない箇所

- 端末が日本時間の場合の挙動。すべて同じ結果になる
- カレンダー・祝日計算・統計・天気の曜日。渡された日付に対する計算であり、ローカルのままが正しい
- `getTodayString()` / `toJstDateKey()` の仕様と import 元
- 保存済みデータの構造

### リスク

- **海外利用時に「現地の朝」でルーティンが出なくなる**: 日付・曜日・時刻・記録がすべて同じ日を指すことを優先した。現地時間で動かしたい場合は、日付キーも含めた全体の方針転換になるため別途の判断が要る。
- **触ってはいけない `getDay()` を巻き込むと逆に壊れる**: Sydney で検証済みのとおり、ローカル組み立ての日付を JST 変換すると 1 日ずれる。対象外の一覧を守る。
- **生成物の作り直し漏れ**: `public/firebase-messaging-sw.js` はテンプレートから生成する。手で編集すると次の生成で失われる。
