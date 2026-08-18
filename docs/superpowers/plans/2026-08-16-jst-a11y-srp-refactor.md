# JST統一とトグル対応の単一責任リファクタリング 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `fix/jst-weekday-and-a11y` で追加・変更したコードを、1 ファイル 1 責務に整理する。

**Architecture:** JST の知識を 1 箇所に閉じ、service worker への複製は生成時に取り込む。トグルスイッチは見た目と振る舞いを分け、アクセシビリティの約束を 1 つのコンポーネントが担う。外から見た挙動は一切変えない。

**Tech Stack:** TypeScript / React 19 / Next.js 16 (App Router) / Jest + Testing Library

## 洗い出し

`main` からの変更ファイルを全件確認し、複数の責務を抱えている箇所を 4 件特定した。

| #   | 対象                                       | 抱えている責務                                                         | 対応                   |
| --- | ------------------------------------------ | ---------------------------------------------------------------------- | ---------------------- |
| 1   | `storage/core-modules/dateKey.ts`          | 名前は「日付キー」だが、曜日・時刻・今日も持つ                         | 実態に合う名前へ       |
| 2   | `features/routine/jstToday.ts`             | JST の知識がライブラリ層の外に出ている                                 | JST のモジュールへ移す |
| 3   | `public/firebase-messaging-sw.template.js` | JST の規則が 3 つ目の複製。手で同期する前提になっている                | 生成時に取り込む       |
| 4   | トグル 3 箇所                              | 見た目・振る舞い・アクセシビリティの約束を各コンポーネントが個別に持つ | 共通コンポーネントへ   |

### 対象外（分割しない・変更しない）

- `checkAndSendNotifications.js` が「日付の算出」「対象の絞り込み」「重複判定」「送信」を併せ持つ点。`main` 時点から同じ形で、今回触ったのは日付の求め方の 2 行だけ。
- `helpersPresentation.ts` の `isRoutinePast`。曜日と時刻の両方を見るが、「今日のルーティンで時刻を過ぎたか」という 1 つの問いに答えている。

## 詳細

### 1. `dateKey.ts` の名前と中身が合っていない

`toJstDay`（曜日を表す数値）と `toJstTime`（`HH:mm` の文字列）はどちらも日付キーではない。ファイルを開くまで何が入っているか分からない状態になっている。

このモジュールが実際に担っているのは「JST 基準で日時を読む」こと。JST のオフセットを知っているのはここだけ、という位置づけも変えない。名前だけを実態に寄せる。

### 2. JST の知識が機能側に漏れている

`getJstToday()` は `getTodayString()` の結果を分解して `Date` を組み立て直す。やっていることは純粋に JST の扱いであり、ルーティン機能固有の知識は無い。

ライブラリ層に置けば「JST を知っているのはこのモジュールだけ」が保てる。祝日判定など `Date` を受け取る関数へ渡す用途は今後も出るため、共有できる場所が適切。

### 3. service worker の複製が 2 つある

JST の規則が 3 箇所にある。

| 場所                                       | 立場                                     |
| ------------------------------------------ | ---------------------------------------- |
| `storage/core-modules/dateKey.ts`          | 本体。別バンドルなので複製は避けられない |
| `service-worker/custom-sw/jstDate.js`      | service worker 用の複製                  |
| `public/firebase-messaging-sw.template.js` | さらにその複製                           |

本体と service worker の複製は、バンドルが分かれているため避けられない。しかし 2 つ目と 3 つ目は同じ JavaScript であり、**手で同期する前提になっている**（コメントにも「片方だけ変えないこと」と書いてある）。片方だけ直すと、通知の重複防止キーが custom SW と FCM SW で食い違う。

テンプレートは `tools/generate-firebase-messaging-sw.mjs` がトークン置換で組み立てている。JST の実装を差し込むトークンを足せば、複製は 1 つ減って生成物になる。

### 4. トグルが同じ約束を 3 回書いている

3 箇所とも構造が完全に一致している。

```
<button type="button" role="switch" aria-checked={checked} aria-label={...}
        onClick={...} className={トグルのクラス}>
  <span className={つまみのクラス} />
</button>
```

違うのは色とクラス名の作り方だけ。`role="switch"` と `aria-checked` と `aria-label` の 3 点セットは、どのトグルにも必要な約束であり、書き忘れると読み上げが壊れる。**実際に今回まで 3 箇所とも書き忘れていた。**

見た目は各機能が決め、アクセシビリティの約束は共通コンポーネントが担う形にする。4 つ目のトグルを足す人が同じ書き忘れをしない。

## Global Constraints

- 自動コミットはしない。コミットはユーザーの明示的な指示があったときだけ行う。
- ブランチは現在の `fix/jst-weekday-and-a11y` のまま。
- 外から見た挙動を変えない。既存テストは import 元の差し替え以外で書き換えない。
- 各タスクの終わりに `npx jest` 全件を通し、既存 4169 件が緑のままであることを確認する。
- 公開されている関数名と import 元（`@/lib/storage/core`）を変えない。
- 生成物は手で編集せず、生成コマンドで作り直す。
- タイムゾーンを変えても新規テストが通ることを確認する。
- テストを追加する場合は RED を確認してから実装する。

## ファイル構成（変更後）

| ファイル                                           | 責務                                       |
| -------------------------------------------------- | ------------------------------------------ |
| `storage/core-modules/jstDateTime.ts`（改名）      | JST 基準で日時を読む。オフセットはここだけ |
| `features/routine/jstToday.ts`（削除）             | 上へ統合                                   |
| `service-worker/custom-sw/jstDate.js`（変更なし）  | service worker 側の唯一の実装              |
| `public/firebase-messaging-sw.template.js`（変更） | JST の実装をトークンで差し込む             |
| `tools/generate-firebase-messaging-sw.mjs`（変更） | トークンに実装を流し込む                   |
| `components/ToggleSwitch.tsx`（新規）              | トグルの構造とアクセシビリティの約束       |
| トグル 3 箇所（変更）                              | 見た目と振る舞いだけを渡す                 |

---

## Task 1: JST のモジュール名を実態に合わせ、`getJstToday` を統合する

**Files:**

- Rename: `src/lib/storage/core-modules/dateKey.ts` → `src/lib/storage/core-modules/jstDateTime.ts`
- Delete: `src/features/routine/jstToday.ts`
- Modify: `src/lib/storage/core.ts` / `src/lib/storage/exports/common.ts`
- Modify: `src/lib/storage/core-modules/time.ts`（import 元）
- Modify: `src/features/routine/storageVisibility.ts` / `hooks/useRoutineQueries.ts`（import 元）
- Rename test: `src/lib/__tests__/storage.date-key.test.ts` → `storage.jst-date-time.test.ts`
- Modify: `src/features/routine/__tests__/jstToday.test.ts`（`getJstToday` の検証を移す）

**Interfaces:**

- `jstDateTime.ts` が produces: `toJstDateKey` / `toJstDay` / `toJstTime` / `getTodayString` / `getJstToday`
- 公開名と `@/lib/storage/core` からの import 元は**変えない**

- [ ] **Step 1: `getJstToday` の失敗テストを移す**

`src/lib/__tests__/storage.jst-date-time.test.ts` に移し、`@/lib/storage/core` から import する形にする。

```ts
describe("getJstToday", () => {
  afterEach(() => jest.useRealTimers());

  it("JST の今日と同じ日付を指す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    const today = getJstToday();
    expect(today.getFullYear()).toBe(2026);
    expect(today.getMonth()).toBe(7);
    expect(today.getDate()).toBe(13);
  });

  it("組み立てた日付の曜日が JST の曜日と一致する", () => {
    // 素の getDay() を使う関数へ渡すため、ここが一致していないと意味がない
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(getJstToday().getDay()).toBe(4);
  });
});
```

- [ ] **Step 2: RED を確認**

```bash
npx jest src/lib/__tests__/storage.jst-date-time.test.ts
```

- [ ] **Step 3: 移設する**

ファイル名を変え、`getJstToday` を移し、re-export を差し替える。中身は変えない。

- [ ] **Step 4: GREEN と全体を確認**

```bash
npx tsc --noEmit
npx jest
```

期待: 既存テストが 1 件も落ちない。落ちたら公開 API を壊している。

---

## Task 2: service worker の複製を 1 つにする

**Files:**

- Modify: `public/firebase-messaging-sw.template.js`
- Modify: `tools/generate-firebase-messaging-sw.mjs`
- Regenerate: `public/firebase-messaging-sw.js`
- Test: `tools/__tests__/generateFirebaseMessagingSw.test.js`（新規）

**Interfaces:**

- テンプレートに `__JST_DATE_HELPERS__` トークンを置き、生成時に `src/service-worker/custom-sw/jstDate.js` の内容を差し込む
- 差し込む際は `export ` を落とす。FCM SW はモジュールではなく素のスクリプトのため

- [ ] **Step 1: 失敗テストを書く**

生成の中身を検証する。トークンが残っていないこと、JST の実装が入っていること、`export` が残っていないことを見る。

```ts
it("JST の実装をテンプレートへ差し込む", () => {
  const output = buildFirebaseMessagingSw({ template, jstHelpers, env });

  expect(output).not.toContain("__JST_DATE_HELPERS__");
  expect(output).toContain("const toJstDateKey =");
});

it("差し込む実装から export を落とす", () => {
  // FCM SW はモジュールではないため、export が残るとスクリプト全体が壊れる
  const output = buildFirebaseMessagingSw({ template, jstHelpers, env });

  expect(output).not.toContain("export const");
});

it("環境変数の置換も従来どおり行う", () => {
  const output = buildFirebaseMessagingSw({ template, jstHelpers, env });

  expect(output).not.toContain("__NEXT_PUBLIC_FIREBASE_API_KEY__");
});
```

生成器から組み立て処理を切り出し、テストできる形にする。ファイルの読み書きは呼び出し側に残す。

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装する**

テンプレートから JST の実装を消し、トークンへ置き換える。生成器はトークンの位置へ `jstDate.js` の内容を流し込む。

- [ ] **Step 4: 生成物を作り直して差分を確認する**

```bash
npm run generate:fcm-sw
```

生成前後で `public/firebase-messaging-sw.js` の JST 部分が同じ内容になることを確かめる。

- [ ] **Step 5: GREEN と全体を確認**

---

## Task 3: トグルを共通コンポーネントにする

**Files:**

- Create: `src/components/ToggleSwitch.tsx`
- Create: `src/components/ToggleSwitch.stories.tsx`
- Create: `src/components/__tests__/ToggleSwitch.test.tsx`
- Modify: `src/features/settings/components/FeatureVisibilitySection.tsx`
- Modify: `src/features/settings/components/TrainDelaySection.tsx`
- Modify: `src/features/todo-lists/TodoListManagementItem.tsx`
- Modify: `src/components/index.ts`

**Interfaces:**

- Produces: `ToggleSwitch({ checked, label, onToggle, className, thumbClassName })`

見た目のクラスは各機能が渡す。3 箇所で色も作り方も違い、そこまで共通化すると引数で分岐する部品になる。共通にするのは構造とアクセシビリティの約束だけ。

- [ ] **Step 1: 失敗テストを書く**

```tsx
describe("ToggleSwitch", () => {
  it("スイッチとして読み上げられる", () => {
    render(<ToggleSwitch checked label="ジャーナル" onToggle={jest.fn()} />);

    expect(screen.getByRole("switch", { name: "ジャーナル" })).toBeChecked();
  });

  it("オフの状態を伝える", () => {
    // 名前だけあってもオンオフが読めないと操作できない
    render(
      <ToggleSwitch checked={false} label="ジャーナル" onToggle={jest.fn()} />,
    );

    expect(
      screen.getByRole("switch", { name: "ジャーナル" }),
    ).not.toBeChecked();
  });

  it("押すと切り替えを通知する", () => {
    const onToggle = jest.fn();
    render(<ToggleSwitch checked label="ジャーナル" onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("switch"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("フォームの送信ボタンとして扱われない", () => {
    // type を省くと form 内で submit として働き、意図しない送信が起きる
    render(<ToggleSwitch checked label="ジャーナル" onToggle={jest.fn()} />);

    expect(screen.getByRole("switch")).toHaveAttribute("type", "button");
  });

  it("見た目のクラスは呼び出し側が決める", () => {
    render(
      <ToggleSwitch
        checked
        label="ジャーナル"
        onToggle={jest.fn()}
        className="bg-teal-500"
        thumbClassName="translate-x-6"
      />,
    );

    expect(screen.getByRole("switch")).toHaveClass("bg-teal-500");
  });
});
```

- [ ] **Step 2: RED を確認**
- [ ] **Step 3: 実装し、3 箇所を置き換える**

- [ ] **Step 4: Storybook を追加する**

オン・オフの 2 ストーリーと、押したときに呼ばれることを確かめる `play` を置く。`ErrorAlert.stories.tsx` の書き方に合わせる。

- [ ] **Step 5: GREEN と全体を確認**

期待: `toggleAccessibility.test.tsx` の 3 件が書き換えなしで通ること。

---

## Task 4: 全体検証

- [ ] **Step 1: 一括で確認する**

```bash
npm run lint
npx tsc --noEmit
npx jest
npx playwright test
npm run build
npx prettier --check <変更したファイル>
```

`npm run build` を入れるのは、service worker の生成物に JST の実装が入ることを確かめるため。

- [ ] **Step 2: タイムゾーンを変えても通ることを確認する**

```bash
TZ=UTC npx jest <対象>
TZ=America/New_York npx jest <対象>
TZ=Australia/Sydney npx jest <対象>
```

- [ ] **Step 3: 実装を壊してテストが落ちることを確認する**

| 壊し方                                     | 落ちるべきテスト                   |
| ------------------------------------------ | ---------------------------------- |
| `getJstToday` を `new Date()` に戻す       | 「組み立てた日付の曜日が一致する」 |
| 生成器のトークン差し込みを外す             | 「JST の実装を差し込む」           |
| 差し込み時に `export` を落とさない         | 「export を落とす」                |
| `ToggleSwitch` から `aria-checked` を外す  | 「オフの状態を伝える」             |
| `ToggleSwitch` から `role="switch"` を外す | スイッチの取得自体が失敗           |
| `ToggleSwitch` から `type="button"` を外す | 「送信ボタンとして扱われない」     |

- [ ] **Step 4: 実ブラウザで名前の無い操作要素が 0 件のままか確認する**

- [ ] **Step 5: ユーザーの指示を待つ**

自動コミットはしない。

---

## 影響範囲

### 挙動

変わらない。すべて内部構造の整理であり、外から見た振る舞いは同一。公開されている関数名と import 元、生成物の中身も変えない。

### ファイル

- 新規 2 ファイル（`ToggleSwitch.tsx` / Storybook）＋ テスト 2 ファイル
- 改名 1 ファイル（`dateKey.ts` → `jstDateTime.ts`）
- 削除 1 ファイル（`features/routine/jstToday.ts`）
- 変更 7 ファイル

### リスク

- **re-export を壊すと広範囲に影響する**: JST の関数は 20 箇所以上から参照されている。公開名と場所を変えないことで守り、既存テストが 1 件も落ちないことで確認する。
- **生成物の差し込み位置**: トークンを置く場所を誤ると、`toJstDateKey` が定義前に使われる。生成後の中身をテストで確かめる。
- **トグルの見た目**: クラスは呼び出し側から渡すため、渡し忘れると見た目が崩れる。既存の 3 箇所は Storybook と実ブラウザで確認する。
