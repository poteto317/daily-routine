# 週ごとの業務日誌を独立した画面にする 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 週ごとの業務日誌を、ジャーナル画面の中の節から、ハンバーガーメニューの独立した項目（ページ ID `weekly-log`）の画面に移す。

**Architecture:** 画面コンポーネント `WeeklyLogPage` を `src/features/journal/weekly/` に追加し、ページ登録（型・遅延読み込み・レジストリ）とメニュー設定（`menuConfig`・表示設定・並び替え）に `weekly-log` を足す。`JournalPage` からは業務日誌のカードと state を外す。保存・同期・書き出しは変えない。

**Tech Stack:** Next.js 16, React 19（React Compiler）, Tailwind v4, Jest + Testing Library, Storybook

設計書: `docs/superpowers/specs/2026-11-10-weekly-log-page-design.md`（以下「設計書」）。迷ったら設計書の「決めたこと」が正。

## Global Constraints

- メニューの表示名「業務日誌」、アイコン 🗒️（メニューと表示設定）、ページ ID・ルート `weekly-log`、表示設定のキー `weeklyLog`（既定オン）、バッジなし
- 画面の見出し文言は `journalTexts.weeklyLog.title`（「🗓️ 週ごとの業務日誌」）のまま。見出しのクラスは変えない
- 画面の背景クラスは `JournalPage.tsx` と同じ `min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300`、`main` は `max-w-4xl mx-auto px-4 py-8`
- 保存キー `weekly-log-history`、同期の `weeklyLogHistory`、書き出しの「記録」グループは変更しない
- ダークモード: 半透明の暗い背景（`dark:bg-<色>-<600〜950>/<数>`）を新しく書かない（`src/__tests__/darkModeContrast.contract.test.ts` が禁止）
- 日付を扱うフックの本体で `getTodayString()` を呼ばない（`useWeeklyLogState` は既に `useJstTodayKey` を使っている。触らない）
- 文言・コメントは日本語。コミットはこのプランでは行わない（後の `/commit-ja` で行う）
- 検証: `npm run verify:fast`（tailwind:scan・lint・typecheck・typecheck:functions・jest）。jest が途中で黙って落ちたときは `npx cross-env TZ=Asia/Tokyo jest -w 1 --forceExit` で再実行する
- 知見: L-015（画面から項目を外しても日次のジャーナルのデータを書き換えない）、L-060（配線をテストで固定する）、L-459（古い設定でも新しいキーが欠けて困らない）、L-466

---

## Task 1: 業務日誌の画面を作り、ページとして登録し、ジャーナルから外す

**Files:**

- Create: `src/features/journal/weekly/WeeklyLogPage.tsx`
- Create: `src/features/journal/weekly/__tests__/WeeklyLogPage.test.tsx`
- Create: `src/features/journal/weekly/WeeklyLogPage.stories.tsx`
- Modify: `src/features/journal/weekly/components/WeeklyLogCard.tsx`（h2 → h1）
- Modify: `src/features/journal/weekly/components/WeeklyLogWeekNavigator.tsx`（h3 → h2）
- Modify: `src/features/journal/weekly/components/WeeklyLogList.tsx`（h3 → h2）
- Modify: `src/features/journal/JournalPage.tsx`（業務日誌のカードと state を外す）
- Modify: `src/features/routine/pages/types.ts`、`lazyPageComponents.ts`、`pageComponentRegistry.ts`
- Modify（テスト）: `src/features/journal/__tests__/JournalPage.test.tsx`、`JournalPage.dateEdit.test.tsx`、`src/features/routine/pages/__tests__/pageComponentRegistry.test.ts`、`pageComponentResolver.test.ts`、`lazyPageComponents.test.tsx`（見つからなければ `grep -rl "lazyPageComponents" src` で探す）、`src/features/journal/weekly/__tests__/` の既存のカード・ナビゲーター・一覧のテストのうち見出しの tag を前提にしているもの

**Interfaces:**

- Consumes: `useWeeklyLogState(): WeeklyLogState`（`src/features/journal/weekly/useWeeklyLogState.ts`）、`WeeklyLogCard({ state })`
- Produces: `export const WeeklyLogPage: () => JSX.Element`（引数なし）。`PageType` に `"weekly-log"`。`PAGE_COMPONENTS["weekly-log"]`

- [ ] **Step 1: 現状のテストと見出しの扱いを確かめる**

Run: `grep -rn "weeklyLog\|WeeklyLog\|業務日誌" src/features/journal/__tests__ src/features/routine/pages/__tests__ | head -40`
Run: `grep -rn "level\|h3\|h2\|heading" src/features/journal/weekly/__tests__ | head -40`
読んで、JournalPage のテストのうち業務日誌に関するもの（`useWeeklyLogState` のモック、「業務日誌のカードを過去の記録より前に出す」テスト、`dateEdit` テストの「業務日誌を保存しても…変わらない」テスト）と、見出しの tag に依存する既存テストを洗い出す。

- [ ] **Step 2: 失敗するテストを書く（WeeklyLogPage）**

`src/features/journal/weekly/__tests__/WeeklyLogPage.test.tsx` を作る。時刻の固定とストレージの初期化は `src/features/journal/__tests__/JournalPage.dateEdit.test.tsx` の beforeEach（36〜47 行付近）、保存の操作と検証は同ファイルの「業務日誌を保存しても…変わらない」テスト（288〜311 行付近。Step 5 で削除するので、先にここから移す）と同じ書き方にする（`fireEvent` を使い、`userEvent` は使わない）。

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { WeeklyLogPage } from "../WeeklyLogPage";
import journalTexts from "../../locales/ja.json";

describe("WeeklyLogPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-15T12:00:00+09:00"));
  });
  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("画面の見出し（h1）が 1 つだけで、業務日誌の見出しになる", () => {
    render(<WeeklyLogPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(journalTexts.weeklyLog.title);
  });

  it("カード内の見出しは h2 から始まり、h3 を使わない", () => {
    render(<WeeklyLogPage />);
    expect(screen.getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
  });

  it("保存すると、一覧に出て weekly-log-history の月曜のキーに保存される（state がカードに配線されている）", () => {
    render(<WeeklyLogPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "今週の振り返り" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    const list = screen.getByRole("heading", {
      level: 2,
      name: /これまでの業務日誌/,
    }).parentElement as HTMLElement;
    expect(within(list).getByText("今週の振り返り")).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("weekly-log-history") ?? "{}")[
        "2026-03-09"
      ],
    ).toEqual(expect.objectContaining({ content: "今週の振り返り" }));
  });

  it("保存しても、日次のジャーナル（journal-history）は変わらない", () => {
    const seed = JSON.stringify({
      "2026-03-15": { date: "2026-03-15", title: "t", content: "c" },
    });
    localStorage.setItem("journal-history", seed);
    render(<WeeklyLogPage />);
    fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
    fireEvent.change(screen.getByLabelText("本文"), {
      target: { value: "今週の振り返り" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(localStorage.getItem("journal-history")).toBe(seed);
  });
});
```

ボタンやラベルの名前（「➕ 書く」「本文」「保存」）、週の月曜（`2026-03-09`）、`journal-history` の seed の形は、移植元の `JournalPage.dateEdit.test.tsx` の実際の値に合わせて直す。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/WeeklyLogPage.test.tsx`
Expected: FAIL（`../WeeklyLogPage` が無い）

- [ ] **Step 3: 画面を作り、見出しの階層を直す**

まず `WeeklyLogCard.test.tsx:54` の `expect(screen.getByText("2026年11月2日（月）開始の週").tagName).toBe("H3")` を `"H2"` に直す（h3→h2 の変更で必ず落ちる、見出しの tag に依存する唯一のテスト）。実行して、直したテストが FAIL することを確かめてから実装する。

`src/features/journal/weekly/WeeklyLogPage.tsx`:

```tsx
"use client";

import { WeeklyLogCard } from "./components/WeeklyLogCard";
import { useWeeklyLogState } from "./useWeeklyLogState";

/**
 * 週ごとの業務日誌ページ。ハンバーガーメニューの独立した項目から開く。
 */
export const WeeklyLogPage = () => {
  const state = useWeeklyLogState();
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <WeeklyLogCard state={state} />
      </main>
    </div>
  );
};
```

`WeeklyLogCard.tsx` の `<h2 ... >` と `</h2>` を `<h1 ... >` と `</h1>` にする（`id`・`className` は変えない）。`WeeklyLogWeekNavigator.tsx:45` 付近と `WeeklyLogList.tsx:25` 付近の `<h3` / `</h3>` を `<h2` / `</h2>` にする（クラスは変えない）。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly`
Expected: PASS（Step 2 のテストと、直した `WeeklyLogCard.test.tsx` を含む）

- [ ] **Step 4: ページとして登録する（テストを先に直す）**

`pageComponentRegistry.test.ts` の期待マップ、`pageComponentResolver.test.ts` のページ ID 一覧、`lazyPageComponents.test.tsx` の列挙に `weekly-log` / `WeeklyLogPage` を足し、実行して FAIL を確かめる。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/pages`
Expected: FAIL

続けて実装する。

- `src/features/routine/pages/types.ts`: `PageType` と `VALID_PAGES` の `"journal"` の直後に `"weekly-log"` を足す
- `src/features/routine/pages/lazyPageComponents.ts`: `JournalPage` の定義の直後に追加

```ts
export const WeeklyLogPage = dynamic(
  () =>
    import("@/features/journal/weekly/WeeklyLogPage").then(
      (module) => module.WeeklyLogPage,
    ),
  { loading: PageDynamicFallback },
);
```

- `src/features/routine/pages/pageComponentRegistry.ts`: import に `WeeklyLogPage` を足し、`PAGE_COMPONENTS` の `journal: JournalPage,` の直後に `"weekly-log": WeeklyLogPage,` を足す

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/pages`
Expected: PASS

- [ ] **Step 5: ジャーナル画面から外す（テストを先に直す）**

`JournalPage.test.tsx`: `useWeeklyLogState` のモックと、業務日誌のカードに関するテストを外し、代わりに次のテストを足す（モックの書き方は同ファイルの既存のテストに合わせる）。

```tsx
it("週ごとの業務日誌の見出しは出ない（独立した画面に移した）", () => {
  mockUseJournalPageState.mockReturnValue(createState() as never);
  render(<JournalPage />);
  expect(
    screen.queryByRole("region", { name: journalTexts.weeklyLog.title }),
  ).toBeNull();
  expect(
    screen.queryByRole("heading", { name: journalTexts.weeklyLog.title }),
  ).toBeNull();
});
```

`JournalPage.dateEdit.test.tsx`: 「業務日誌のカードにも h3 がある」旨のコメント（25 行付近）を、「過去の記録の見出し（h3）を取るために絞る」など現状に合う説明に直す（絞り込みの処理自体は残してよい）。「業務日誌を保存しても…変わらない」テスト（288〜311 行付近）は、`WeeklyLogPage.test.tsx` の「journal-history に触れない」テストに置き換わるので削除する。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal`
Expected: 新しいテストが FAIL（まだ JournalPage にカードがある）

`JournalPage.tsx`: `WeeklyLogCard` と `useWeeklyLogState` の import、`const weeklyLogState = useWeeklyLogState();`、`<WeeklyLogCard state={weeklyLogState} />` を削除する。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal src/features/routine/pages`
Expected: PASS

- [ ] **Step 6: Storybook**

`WeeklyLogPage.stories.tsx` を作る。`title` は `"Features/Journal/WeeklyLogPage"`（`components/WeeklyLogCard.stories.tsx` の title の付け方に合わせて接頭辞を確かめる）。`WeeklyLogPage` は実際の localStorage を読むため、`JournalPage.stories.tsx:41-52` の `beforeEach`（`saveJournalHistory` で初期化し、後始末も返す）と同じ形で `saveWeeklyLogHistory` により story の前後に初期化する。`Default` と、`WeeklyLogCard.stories.tsx` の Mobile story と同じ `globals: { viewport: { value: "mobile1" } }` の `Mobile` を作る。`JournalPage.stories.tsx` に業務日誌の story・play の確認があれば外す。

Run: `npm run typecheck`
Expected: エラーなし

---

## Task 2: メニュー項目と表示設定・並び替えに `weekly-log` を足す

**Files:**

- Modify: `src/config/locales/ja.json`（`menuConfig.menuItems`）
- Modify: `src/hooks/staticHeaderMenuItems.ts`
- Modify: `src/types/routine/settings.ts`
- Modify: `src/features/settings/storage.ts`
- Modify: `src/features/settings/state/featureVisibility.ts`
- Modify: `src/features/settings/state/constants.ts`
- Modify: `src/features/settings/components/MenuOrderSection.tsx`
- Modify（固定データ・テスト）: `src/hooks/__fixtures__/menuOrderNaturalIds.ts`、`src/hooks/__tests__/headerMenuItemHelpers.test.ts`、`headerMenuItemsBuilder.test.ts`、`headerMenuItemData.test.ts`、`src/features/settings/__tests__/` 配下の `visibleFeatures` を全項目書いているテスト（`grep -rln "weightTracker" src/features/settings/__tests__ src/lib` で洗い出す）、`src/features/settings/components/FeatureVisibilitySection.stories.tsx`、`MenuOrderSection.stories.tsx`、`src/features/settings/components/__tests__/MenuOrderSection.test.tsx`、`src/config/__tests__/index.test.ts`

**Interfaces:**

- Consumes: Task 1 の `PageType` の `"weekly-log"`（`headerMenuItemsBuilder` が `VALID_PAGES` で route を判定する）
- Produces: `menuConfig.menuItems` の `weekly-log`、`visibleFeatures.weeklyLog`（型は `boolean | undefined`、`VisibleFeaturesState` では必須の `boolean`）

- [ ] **Step 1: 失敗するテストを書く**

洗い出した固定データのテストを新しい項目に合わせて更新する前に、次の新しいテストを先に書く。

`src/hooks/__tests__/headerMenuItemsBuilder.test.ts`（または `headerMenuItemHelpers.test.ts`。`filterStaticHeaderMenuItems` のテストがあるほう）に、既存のテストの流儀で次の 3 つを足す。

```ts
it("weeklyLog が false（他はオン）のとき、weekly-log だけがメニューから消える", () => {
  // visibleFeatures は全キー true にして weeklyLog だけ false
  // 結果の id 一覧に "weekly-log" が無く、"journal" は残る
});

it("journal が false（weeklyLog はオン）のとき、weekly-log は残る（キーの取り違えの検出）", () => {
  // 結果の id 一覧に "weekly-log" がある
});

it("保存済みの visibleFeatures に weeklyLog が無いとき、weekly-log を表示する（古い設定との互換）", () => {
  // visibleFeatures から weeklyLog を除いたオブジェクトを渡す（型は as で合わせてよい）
  // 結果の id 一覧に "weekly-log" がある
});
```

メニューの並びのテスト（`orderHeaderMenuItems` / `buildMenuOrderNaturalIds` のテスト。`menuOrderNaturalIds.ts` の固定データを使っているもの）に、次を足す。

```ts
it("既定の並びでは weekly-log がジャーナルの直後に来る", () => {
  // buildMenuOrderNaturalIds([]) の結果で、indexOf("weekly-log") === indexOf("journal") + 1
});
```

`featureVisibility`（`getInitialVisibleFeatures` など、`featureVisibility.ts` の読み込み関数）のテスト（`useVisibleFeaturesState.test.tsx` か `visibleFeaturesStateResult.test.ts`）に、「保存済みの設定に `weeklyLog` が無ければ `true`」「`false` が保存されていれば `false`」を足す。`src/features/settings/__tests__/toggleAccessibility.test.tsx`（`FeatureVisibilitySection` を描画してクリックしているテスト）に、全キーを `true` にした `VisibleFeaturesState` で `FeatureVisibilitySection` を描画し、`role=switch` の「業務日誌」をクリックして、`setVisibleFeatures` が `weeklyLog: false` かつ `journal: true`（他のキーは変わらない）で呼ばれるテストを足す。`constants.ts` に別のキーを書き間違えたときに検出するため、`FeatureVisibilitySection` を描画するテストでなければならない（`settingsPageStateActions.test.ts` はトグルを扱わないので使わない）。

`MenuOrderSection.test.tsx` に「並び替えの一覧に『業務日誌』が出る」を足す。

Run: `npx cross-env TZ=Asia/Tokyo jest src/hooks src/features/settings`
Expected: 追加したテストが FAIL

- [ ] **Step 2: 実装する**

- `src/config/locales/ja.json`: `journal` の項目の直後に追加

```json
      {
        "id": "weekly-log",
        "label": "業務日誌",
        "icon": "🗒️",
        "route": "weekly-log"
      },
```

- `src/hooks/staticHeaderMenuItems.ts`: `FeatureMenuId` に `| "weekly-log"` を足し、`FEATURE_KEY_MAP` に `"weekly-log": "weeklyLog",` を足す（どちらも `journal` の直後）
- `src/types/routine/settings.ts`: `visibleFeatures` の `journal?: boolean;` の直後に `weeklyLog?: boolean;`
- `src/features/settings/storage.ts`: 既定の `visibleFeatures` の `journal: true,` の直後に `weeklyLog: true,`
- `src/features/settings/state/featureVisibility.ts`: `VisibleFeaturesState` の `journal: boolean;` の直後に `weeklyLog: boolean;`、読み込みの `journal: settings.visibleFeatures?.journal ?? true,` の直後に `weeklyLog: settings.visibleFeatures?.weeklyLog ?? true,`
- `src/features/settings/state/constants.ts`: `VISIBLE_FEATURE_ITEMS` の `journal` の直後に `{ key: "weeklyLog", label: "業務日誌", icon: "🗒️" },`
- `src/features/settings/components/MenuOrderSection.tsx`: `REORDERABLE_MENU_IDS` の `"journal",` の直後に `"weekly-log",`

Run: `npm run typecheck`
Expected: `VisibleFeaturesState` の固定データ（テスト・stories）で型エラーが出る。エラーが示す箇所すべてに `weeklyLog` を足す（テストの期待値は `weeklyLog: true`、`menuOrderNaturalIds.ts` は `"journal"` の直後に `"weekly-log"`）。

- [ ] **Step 3: 通す**

Run: `npm run typecheck && npx cross-env TZ=Asia/Tokyo jest src/hooks src/features/settings src/features/routine src/features/todo-lists src/config src/lib`
Expected: PASS

---

## Task 3: テストマトリクスとドキュメントを更新する

**Files:**

- Modify: `src/features/test-matrix/initialData.ts`（ジャーナルのカテゴリの `3-7`〜`3-9` を外し、新カテゴリ `weekly-log` を末尾に追加）
- Modify: `src/features/test-matrix/detailed-test-cases/group-01-04.ts`（`"3-7"`〜`"3-9"` のブロック、1454〜1529 行を削除。1530 行が `"4-1"`）
- Create: `src/features/test-matrix/detailed-test-cases/group-27.ts`（`export const DETAILED_TEST_CASES_GROUP_27: DetailTestCaseMap = { "27-1": [...], "27-2": [...], "27-3": [...] }`。型名と export の形は `group-01-04.ts` の先頭に合わせる）
- Modify: `src/features/test-matrix/detailed-test-cases/index.ts`（`group-27` の import と `...DETAILED_TEST_CASES_GROUP_27,` を足す。足さないと詳細が消える）
- Modify: `src/features/test-matrix/__tests__/initialData.test.ts` ほか、カテゴリ数・項目 ID を数えているテスト
- Modify: `docs/03-testing/test-matrix.md`
- Modify: `docs/04-reference/features.md`、`docs/02-development/architecture.md`、`docs/04-reference/README.md`

**Interfaces:**

- Consumes: 設計書「テスト・ドキュメント」の ID 対応（3-7→27-1、3-8→27-2、3-9→27-3。詳細ケースは `27-1-1` のように接頭辞を合わせる）
- Produces: カテゴリ ID `weekly-log`、項目 ID `27-1`〜`27-3`

- [ ] **Step 1: 失敗するテストを書く**

`initialData.test.ts` と `detailedTestCases.test.ts`（接頭辞の強制）の既存の検査が、新しい構成で通ることを前提に、次の期待を足す。「`journal` カテゴリの項目に `3-7`〜`3-9` が無い」「`weekly-log` カテゴリが存在し、項目 ID が `27-1`〜`27-3`」「詳細ケースの ID がすべて項目 ID を接頭辞に持つ」。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/test-matrix`
Expected: 追加した期待が FAIL

- [ ] **Step 2: 実装する**

- `initialData.ts`: ジャーナルの `items` から `3-7`〜`3-9` を外し、配列の末尾（`test-matrix-page` の後）に次のカテゴリを追加する。

```ts
  {
    id: "weekly-log",
    title: "27. 業務日誌（Weekly Log）",
    badge: { text: "実装済", color: "bg-green-500" },
    items: [
      { id: "27-1", label: "週ごとの業務日誌を書く・編集する（1週1件・本文のみ）", pc: "unchecked", sp: "unchecked", note: "" },
      { id: "27-2", label: "業務日誌の週の切り替え（月曜開始・未来の週へは進めない）", pc: "unchecked", sp: "unchecked", note: "" },
      { id: "27-3", label: "これまでの業務日誌の一覧・削除（確認ダイアログ）", pc: "unchecked", sp: "unchecked", note: "" },
    ],
  },
```

- 詳細ケース: `group-01-04.ts` の `"3-7"`〜`"3-9"` のブロックを `group-27.ts` に移し、`index.ts` に束ねを足し、キーを `"27-1"`〜`"27-3"`、ケース ID を `27-1-1` などに直す。手順の「ジャーナル画面を開く」は「ハンバーガーメニューの『業務日誌』を開く」に直す。
- `docs/03-testing/test-matrix.md`: 「3. ジャーナル」の表から 3-7〜3-9 の行を外し、末尾 26 の次に「## 27. 業務日誌（Weekly Log）✅」の節を同じ表の書式で追加する（備考は元の行のまま）。目次や集計の記述があれば合わせる。
- `docs/04-reference/features.md`: ジャーナル節から業務日誌の項目を外し、独立した節「業務日誌（週ごと）」にする（冒頭の目次（15 行目付近の `[📔 ジャーナル](#-ジャーナル)`）にも項目を足す）（画面: メニューの「業務日誌」から開く。保存キー・使い方は元の記述のまま）。画面一覧を「全24画面」にして表に `weekly-log` の行を足す。保存データ表の `weekly-log-history` のカテゴリを「業務日誌」にする。ディレクトリ構成の記述に `journal/weekly/WeeklyLogPage.tsx` を足す。表示設定の説明に「業務日誌」を足す。ジャーナル節の「技術仕様」のデータ保存キーとファイルの記述は実態に合わせる。
- `docs/02-development/architecture.md:154` の「全23画面」を 24 に直す。`docs/04-reference/README.md` の機能一覧の 📔 ジャーナルの隣に 🗒️ 業務日誌を足す。

- [ ] **Step 3: 全体の検証**

Run: `npm run verify:fast`
Expected: すべて成功。落ちたものは原因を直す。jest が黙って落ちたときは `npx cross-env TZ=Asia/Tokyo jest -w 1 --forceExit`。

- [ ] **Step 4: 画面の目視確認**

Storybook を起動して（起動した自分のプロセスだけを止める。Claude アプリのプロセスは kill しない）、`WeeklyLogPage` の story をライトとダークで開き、見出しが 1 つで崩れていないこと、モバイル幅（`mobile1` の 320px と 375px）で横にはみ出さないことを確かめる。確認後に Storybook を止める。
