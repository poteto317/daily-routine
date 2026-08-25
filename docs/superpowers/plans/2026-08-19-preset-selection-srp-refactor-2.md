# プリセット選択リスト SRPリファクタリング（第2巡）プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブランチ `feat/preset-edit-sort-by-time` の main からの差分を、単一責任の観点で再度洗い直して整理する。

**前提:** 第1巡（`2026-08-19-preset-edit-sort-srp-refactor.md`）で、並べ替えの分離（`presetRoutineSelectionOrder.ts`）と選択行の共通化（`RoutineSelectionList.tsx`）は完了済み。その結果 `presetRoutineGrouping.ts` は main と同一に戻り、差分から消えた。本プランは**その後の状態**を対象に、残っている責務の混在を扱う。

**Architecture:** 第1巡で `RoutineSelectionList` に集約した結果、そこに「カテゴリ絵文字の解決」という別の関心事が同居していることが見えた。これは既存の `getCategoryInfo`（`features/routine/helpersPresentation.ts`）と同じ処理の再実装であり、しかもフォールバックの有無で挙動が食い違っている。また、選択リストを共通化したことで、同じ2つのセクションに**名前・説明の入力欄**という別の重複が残っていることも浮き彫りになった。今回はこの2つの重複を解消し、あわせて「表示順の決定」を JSX から追い出す。

**Tech Stack:** TypeScript / React 19 / Jest + Testing Library / Storybook / Playwright（既存踏襲、追加ライブラリなし）

## 変更対象の洗い出し（第1巡後の現状）

main からの差分（docs 除く）:

| ファイル                                                            | 状態          | SRP上の問題                                                                                                                            |
| ------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/preset/components/RoutineSelectionList.tsx`           | 新規（第1巡） | **問題1**: カテゴリ絵文字の解決を内製しており、既存の `getCategoryInfo` の再実装。しかもフォールバックが無く挙動が食い違う             |
| `src/features/preset/components/PresetEditSection.tsx`              | 変更          | **問題2**: 名前・説明の入力欄が `PresetCreateSection` と重複。**問題3**: 表示順の決定（group→sort）が JSX 内にインラインで置かれている |
| `src/features/preset/components/PresetCreateSection.tsx`            | 変更          | **問題2**（同上）                                                                                                                      |
| `src/features/preset/presetRoutineSelectionOrder.ts`                | 新規（第1巡） | 問題なし                                                                                                                               |
| `src/features/preset/__tests__/RoutineSelectionList.test.tsx`       | 新規（第1巡） | **問題4**: `createRoutine` フィクスチャを新規に自前定義し、既存の重複を1件増やしている                                                 |
| `src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts` | 新規（第1巡） | **問題4**（同上）                                                                                                                      |
| `src/features/preset/__tests__/PresetEditSection.test.tsx`          | 変更          | 問題なし                                                                                                                               |
| `e2e/preset-edit-sort.spec.ts`                                      | 新規          | 後述の理由によりスコープ外                                                                                                             |

### 問題1の詳細（挙動の食い違い）

`RoutineSelectionList.tsx:32-34`:

```tsx
const categoryInfo = ROUTINE_CATEGORIES.find(
  (item) => item.value === group.routine.category,
);
// 表示側: {categoryInfo?.emoji} {group.routine.title}
```

既存 `src/features/routine/helpersPresentation.ts:14-19`:

```ts
export const getCategoryInfo = (routine: Pick<Routine, "category">) => {
  return (
    ROUTINE_CATEGORIES.find((cat) => cat.value === routine.category) ||
    ROUTINE_CATEGORIES[5]
  );
};
```

`ROUTINE_CATEGORIES[5]` は `{ value: "other", label: "その他", emoji: "📌" }`。

つまり、型から外れたカテゴリ値（旧データ、インポートしたデータなど）を持つルーティンに対し、**ホーム画面は「📌」を表示するが、プリセットの選択リストは何も表示しない**。この差は、選択リストが自前でカテゴリ解決を持っていることに由来する。解決の責務は `getCategoryInfo` にあるので、そちらへ寄せる。

なお、このインライン実装は元々 `PresetEditSection` / `PresetCreateSection` にあったものを第1巡でそのまま移しただけで、新たに持ち込んだ不具合ではない。ただし今は1箇所に集約されており、直す最良のタイミングにある。

### 対応しない問題（今回のスコープ外）

- **E2E ヘルパーの重複**（`e2e/preset-edit-sort.spec.ts` の `createRoutine` が他3つのE2Eと同じ操作）— `e2e/helpers.ts` への集約は他3ファイルの書き換えを伴い、今回と無関係なファイルに差分が波及する
- **`PresetApplySection.tsx:27` の同じインラインカテゴリ解決** — 問題1と同型だが、このファイルは main からの差分に含まれない。触ると差分が無関係に広がる。第1巡・今回で `RoutineSelectionList` 側を直した実績を踏まえ、別ブランチで対応する
- **preset 配下8ファイルの `createRoutine` フィクスチャ重複** — ブランチ以前からの既存事情。ただし**今回自分が増やした2ファイル分**だけは問題4として対応する

## Global Constraints

- 振る舞いを変えない。ただし問題1の修正に伴う「未知カテゴリで📌が出るようになる」変更は**意図した是正**として許容する（ホーム画面と揃える）
- 既存のテストは1件も削除・弱体化させない
- 各タスクの終わりに `npm test` と `npx playwright test` が green であることを確認する
- リファクタリングの正しさは mutation で確認する
- **自動コミットはしない。** 各タスクの終わりに変更内容を報告し、コミットの指示を待つ

---

### Task 1: `createRoutine` テストフィクスチャを共有化する

第1巡で追加した2つのテストファイルが、それぞれ `createRoutine` を自前定義している。これから Task 2〜4 でテストを足すため、先に土台を整える。既存の `storageTestFixtures.ts` に置き、**今回追加した2ファイルからのみ**使う（既存8ファイルには手を触れない）。

**Files:**

- Modify: `src/features/preset/__tests__/storageTestFixtures.ts`
- Modify: `src/features/preset/__tests__/RoutineSelectionList.test.tsx`
- Modify: `src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`

**Interfaces:**

- Produces: `createRoutineFixture(overrides?: Partial<Routine>): Routine`

- [ ] **Step 1: フィクスチャを追加する**

`src/features/preset/__tests__/storageTestFixtures.ts` の末尾に追加する。名前は既存の `createPreset` / `sampleRoutines` と衝突せず、役割が読み取れるものにする:

```typescript
/** 選択リスト系テスト用のルーティン。既定値は「月曜 07:00 の朝食（生活）」 */
export const createRoutineFixture = (
  overrides: Partial<Routine> = {},
): Routine => ({
  id: "routine-1",
  title: "朝食",
  startTime: "07:00",
  duration: 30,
  category: "life",
  daysOfWeek: [1],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});
```

- [ ] **Step 2: 2つのテストファイルを共有フィクスチャに切り替える**

`RoutineSelectionList.test.tsx` と `presetRoutineSelectionOrder.test.ts` から、ファイル内の `createRoutine` 定義と `import type { Routine }` を削除し、以下を import する:

```typescript
import { createRoutineFixture } from "./storageTestFixtures";
```

各テスト内の `createRoutine(` を `createRoutineFixture(` に置換する。

- [ ] **Step 3: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset`
Expected: 全件 PASS（テストの中身は変えていないので件数も変わらない）

- [ ] **Step 4: 変更内容を報告する（コミットはしない）**

---

### Task 2: カテゴリ絵文字の解決を既存の `getCategoryInfo` に寄せる

**問題:** `RoutineSelectionList` が「リストを描く」ことに加えて「カテゴリ値から表示情報を解く」ことまで持っている。後者は既に `getCategoryInfo` が持つ責務であり、二重実装かつ挙動が食い違っている。

**Files:**

- Modify: `src/features/preset/components/RoutineSelectionList.tsx`
- Modify: `src/features/preset/__tests__/RoutineSelectionList.test.tsx`

**Interfaces:**

- Consumes: `getCategoryInfo`（`@/features/routine/helpersPresentation`）

- [ ] **Step 1: 失敗するテストを書く**

`RoutineSelectionList.test.tsx` に追加する。既存の「カテゴリの絵文字とタイトルを並べて表示する」テストは残したまま、未知カテゴリの観点を足す:

```typescript
it("既知のカテゴリはその絵文字を表示する", () => {
  const groups = groupRoutinesForSelection([
    createRoutineFixture({ id: "a", title: "筋トレ", category: "health" }),
  ]);

  render(<RoutineSelectionList {...defaultProps} groups={groups} />);

  expect(screen.getByText(/筋トレ/).textContent).toBe("💪 筋トレ");
});

it("型から外れたカテゴリでも「その他」の絵文字で表示する", () => {
  // 旧データやインポートしたデータには型に無いカテゴリが入りうる。
  // ホーム画面（getCategoryInfo）と同じく📌にフォールバックさせ、
  // 絵文字だけが欠けた行にならないようにする
  const groups = groupRoutinesForSelection([
    createRoutineFixture({
      id: "a",
      title: "謎の予定",
      category: "legacy-unknown" as never,
    }),
  ]);

  render(<RoutineSelectionList {...defaultProps} groups={groups} />);

  expect(screen.getByText(/謎の予定/).textContent).toBe("📌 謎の予定");
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/RoutineSelectionList.test.tsx`
Expected: 「型から外れたカテゴリ」のテストが `" 謎の予定"`（絵文字なし）を受け取って FAIL。既知カテゴリのテストは PASS

- [ ] **Step 3: 既存ヘルパーに差し替える**

`RoutineSelectionList.tsx` の import を変更する。`getCategoryInfo` は `@/features/routine` のバレルから公開されており、他 feature からの利用実績もある（`src/features/statistics/page/useStatisticsChartData.ts:1`）ため、まずはそれに揃える:

```tsx
import { getCategoryInfo } from "@/features/routine";
import type { RoutineSelectionGroup } from "../presetRoutineGrouping";
```

（`ROUTINE_CATEGORIES` の import は不要になるので削除する）

**判断ポイント:** バレル経由だと routine feature 全体（`useRoutines` などフック類を含む）を読み込む。これにより `RoutineSelectionList.test.tsx` が新たに Firebase やストレージのモックを要求するようになった場合は、より軽い深いパス `@/features/routine/helpersPresentation` に切り替える（こちらが辿るのは `@/types/routine` / `@/lib/storage/core` / `@/features/settings/storage` のみ）。Step 4 でテストを走らせた結果で決める。

`map` 内のインライン解決を置き換える:

```tsx
{
  groups.map((group) => {
    const categoryInfo = getCategoryInfo(group.routine);

    return (
      // ...
      <span className="flex-1 text-sm text-gray-900 dark:text-white">
        {categoryInfo.emoji} {group.routine.title}
      </span>
      // ...
    );
  });
}
```

`categoryInfo?.emoji` の `?.` はフォールバックがあるため不要になる。

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset`
Expected: 全件 PASS

- [ ] **Step 5: モジュールの循環が起きていないことを確認する**

feature 単位では `preset ↔ routine` の双方向参照が**既に存在する**（`preset/PresetPage.tsx:7` → `@/features/routine`、`routine/pages/pageComponentResolver.ts:17` → `@/features/preset/PresetPage`）。今回の変更で新しい方向が増えるわけではないが、モジュール単位の循環が生まれていないことは確かめる。

Run: `npm run typecheck`
Run: `npm run build`
Expected: いずれも成功。ビルド時に循環参照の警告が出ていないこと

- [ ] **Step 6: mutation で確認する**

`getCategoryInfo` の呼び出しを `ROUTINE_CATEGORIES[0]`（🎨 趣味）固定に書き換え、テストが落ちることを確認する。確認後に必ず元へ戻す。

- [ ] **Step 7: 変更内容を報告する（コミットはしない）**

---

### Task 3: 表示順の決定を JSX から追い出す

**問題:** `PresetEditSection.tsx:67-69` で「グループ化してから時刻順に並べる」という表示ポリシーが JSX 式の中に直接書かれている。この結果、このファイルは「レイアウトが変わったとき」と「並び順のポリシーが変わったとき」の2つの理由で変更されることになる。

**Files:**

- Modify: `src/features/preset/presetRoutineSelectionOrder.ts`
- Modify: `src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`
- Modify: `src/features/preset/components/PresetEditSection.tsx`

**Interfaces:**

- Produces: `toTimeOrderedSelectionGroups(routines: Routine[]): RoutineSelectionGroup[]`

なお `PresetCreateSection` 側は `groupRoutinesForSelection(currentRoutines)` の単一呼び出しであり、合成が無い。ここに同型のラッパーを足すのは意味の無い間接化になるため**足さない**（YAGNI）。

- [ ] **Step 1: 失敗するテストを書く**

`presetRoutineSelectionOrder.test.ts` に追加する:

```typescript
describe("toTimeOrderedSelectionGroups", () => {
  it("グループ化と時刻順の並べ替えをまとめて行う", () => {
    const groups = toTimeOrderedSelectionGroups([
      createRoutineFixture({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutineFixture({ id: "early", title: "朝食", startTime: "06:00" }),
    ]);

    expect(groups.map((group) => group.routine.id)).toEqual(["early", "late"]);
  });

  it("同じ内容の曜日違いは1グループにまとめたうえで並べる", () => {
    const groups = toTimeOrderedSelectionGroups([
      createRoutineFixture({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutineFixture({ id: "r-mon", daysOfWeek: [1] }),
      createRoutineFixture({ id: "r-wed", daysOfWeek: [3] }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].routineIds).toEqual(["r-mon", "r-wed"]);
    expect(groups[0].daysOfWeek).toEqual([1, 3]);
  });

  it("ルーティンが無ければ空配列を返す", () => {
    expect(toTimeOrderedSelectionGroups([])).toEqual([]);
  });
});
```

import に `toTimeOrderedSelectionGroups` を足す。

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`
Expected: `toTimeOrderedSelectionGroups is not a function` で FAIL

- [ ] **Step 3: 合成関数を追加する**

`src/features/preset/presetRoutineSelectionOrder.ts` に追加する（既存の `sortRoutineSelectionGroupsByStartTime` はそのまま残す）:

```typescript
import type { Routine } from "@/types/routine";
import {
  groupRoutinesForSelection,
  type RoutineSelectionGroup,
} from "./presetRoutineGrouping";

// （既存の sortRoutineSelectionGroupsByStartTime はそのまま）

/**
 * 編集画面に出す選択グループを作る。
 *
 * 「曜日違いをまとめてから時刻順に並べる」という表示ポリシーをここに置く。
 * 画面側に書くと、レイアウトを直すときと並び順を変えるときの両方で
 * 同じファイルを触ることになる。
 */
export const toTimeOrderedSelectionGroups = (
  routines: Routine[],
): RoutineSelectionGroup[] =>
  sortRoutineSelectionGroupsByStartTime(groupRoutinesForSelection(routines));
```

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: `PresetEditSection.tsx` を差し替える**

import を1本にする:

```tsx
import { toTimeOrderedSelectionGroups } from "../presetRoutineSelectionOrder";
```

（`groupRoutinesForSelection` と `sortRoutineSelectionGroupsByStartTime` の import は削除する）

JSX を差し替える:

```tsx
<RoutineSelectionList
  groups={toTimeOrderedSelectionGroups(routines)}
  selectedRoutineIds={editSelectedRoutines}
  onToggleRoutine={onToggleEditRoutine}
  emptyLabel={PRESET_EDIT_EMPTY_ROUTINES_LABEL}
/>
```

- [ ] **Step 6: 既存テストが変更なしで通ることを確認する**

Run: `npm test`
Expected: 全件 PASS。特に `PresetEditSection.test.tsx` の並び順テストが変更なしで通ること

Run: `npx playwright test e2e/preset-edit-sort.spec.ts`
Expected: PASS

- [ ] **Step 7: mutation で確認する**

`toTimeOrderedSelectionGroups` から `sortRoutineSelectionGroupsByStartTime(...)` を外して `groupRoutinesForSelection(routines)` だけを返すようにし、`presetRoutineSelectionOrder.test.ts` と `PresetEditSection.test.tsx` と E2E が落ちることを確認する。確認後に必ず元へ戻す。

- [ ] **Step 8: 変更内容を報告する（コミットはしない）**

---

### Task 4: 名前・説明の入力欄を共通コンポーネントへ切り出す

**問題:** `PresetEditSection` と `PresetCreateSection` が、同一の `className` を持つ `<input type="text">` + `<textarea>` の組を各自で持っている。第1巡で選択リストを共通化した結果、この2ファイルに残る最後の重複がこれになった。片方だけスタイルを直すと両画面が食い違う。

**あわせて対応する a11y:** これらの入力欄には `<label>` も `aria-label` も無く、`placeholder` だけが手がかりになっている。プレースホルダは入力が始まると消えるため、支援技術にとって名前の無い入力欄になる。1箇所に集約するこのタイミングで `aria-label` を与え、契約をコンポーネント側で保証する（`ToggleSwitch` と同じ考え方）。これは名前が無かったものに名前を与える追加のみで、既存の見た目・入力挙動は変えない。

**Files:**

- Create: `src/features/preset/components/PresetNameDescriptionFields.tsx`
- Create: `src/features/preset/__tests__/PresetNameDescriptionFields.test.tsx`
- Modify: `src/features/preset/components/PresetEditSection.tsx`
- Modify: `src/features/preset/components/PresetCreateSection.tsx`
- Modify: `src/features/preset/locales/ja.json`（aria-label 用の文言追加）
- Modify: `src/features/preset/helpers.ts`（文言の export 追加）

- [ ] **Step 1: 文言を追加する**

`src/features/preset/locales/ja.json` に、共通で使う入力欄のアクセシブル名を足す。既存の階層に合わせ、トップレベルに `fields` を追加する:

```json
"fields": {
  "nameLabel": "プリセット名",
  "descriptionLabel": "プリセットの説明"
}
```

`src/features/preset/helpers.ts` に export を追加する（既存の定数定義の並びに合わせる）:

```typescript
export const PRESET_FIELD_NAME_LABEL = presetTexts.fields.nameLabel;
export const PRESET_FIELD_DESCRIPTION_LABEL =
  presetTexts.fields.descriptionLabel;
```

- [ ] **Step 2: 失敗するテストを書く**

`src/features/preset/__tests__/PresetNameDescriptionFields.test.tsx` を作成する:

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetNameDescriptionFields } from "../components/PresetNameDescriptionFields";

const defaultProps = {
  name: "",
  description: "",
  namePlaceholder: "プリセット名を入力",
  descriptionPlaceholder: "説明を入力",
  onChangeName: jest.fn(),
  onChangeDescription: jest.fn(),
};

describe("PresetNameDescriptionFields", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("渡された値を表示する", () => {
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        name="朝のセット"
        description="平日に使う"
      />,
    );

    expect(screen.getByDisplayValue("朝のセット")).toBeInTheDocument();
    expect(screen.getByDisplayValue("平日に使う")).toBeInTheDocument();
  });

  it("名前を編集すると onChangeName に入力値を渡す", () => {
    const onChangeName = jest.fn();
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        onChangeName={onChangeName}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "プリセット名" }), {
      target: { value: "夜のセット" },
    });

    expect(onChangeName).toHaveBeenCalledWith("夜のセット");
  });

  it("説明を編集すると onChangeDescription に入力値を渡す", () => {
    const onChangeDescription = jest.fn();
    render(
      <PresetNameDescriptionFields
        {...defaultProps}
        onChangeDescription={onChangeDescription}
      />,
    );

    fireEvent.change(
      screen.getByRole("textbox", { name: "プリセットの説明" }),
      { target: { value: "週末用" } },
    );

    expect(onChangeDescription).toHaveBeenCalledWith("週末用");
  });

  it("プレースホルダが消えても支援技術から名前で引ける", () => {
    // placeholder は入力が始まると消えるため、名前の代わりにはならない
    render(<PresetNameDescriptionFields {...defaultProps} name="入力済み" />);

    expect(
      screen.getByRole("textbox", { name: "プリセット名" }),
    ).toHaveValue("入力済み");
  });
});
```

- [ ] **Step 3: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/PresetNameDescriptionFields.test.tsx`
Expected: `Cannot find module '../components/PresetNameDescriptionFields'` で FAIL

- [ ] **Step 4: コンポーネントを作る**

`src/features/preset/components/PresetNameDescriptionFields.tsx` を作成する。ラッパーの `<div>` は入れず、呼び出し側のレイアウトに委ねる:

```tsx
import {
  PRESET_FIELD_DESCRIPTION_LABEL,
  PRESET_FIELD_NAME_LABEL,
} from "../helpers";

type PresetNameDescriptionFieldsProps = {
  name: string;
  description: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
};

const FIELD_CLASS_NAME =
  "w-full p-2 border rounded-lg dark:bg-gray-600 dark:text-white dark:border-gray-500";

/**
 * プリセットの名前と説明の入力欄。作成画面と編集画面で共有する。
 *
 * placeholder は入力が始まると消えるため、支援技術向けの名前は
 * aria-label で別に与える。文言は画面によらず同じものを使う。
 */
export const PresetNameDescriptionFields = ({
  name,
  description,
  namePlaceholder,
  descriptionPlaceholder,
  onChangeName,
  onChangeDescription,
}: PresetNameDescriptionFieldsProps) => (
  <>
    <input
      type="text"
      value={name}
      onChange={(event) => onChangeName(event.target.value)}
      className={FIELD_CLASS_NAME}
      placeholder={namePlaceholder}
      aria-label={PRESET_FIELD_NAME_LABEL}
    />
    <textarea
      value={description}
      onChange={(event) => onChangeDescription(event.target.value)}
      className={FIELD_CLASS_NAME}
      placeholder={descriptionPlaceholder}
      rows={2}
      aria-label={PRESET_FIELD_DESCRIPTION_LABEL}
    />
  </>
);
```

- [ ] **Step 5: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/PresetNameDescriptionFields.test.tsx`
Expected: 全件 PASS

- [ ] **Step 6: `PresetEditSection.tsx` を差し替える**

名前・説明のブロック（`<div className="space-y-2">` の中身）を置き換える。ラッパーの `<div className="space-y-2">` は残す:

```tsx
<div className="space-y-2">
  <PresetNameDescriptionFields
    name={editPresetName}
    description={editPresetDescription}
    namePlaceholder={PRESET_EDIT_NAME_PLACEHOLDER}
    descriptionPlaceholder={PRESET_EDIT_DESCRIPTION_PLACEHOLDER}
    onChangeName={onChangeEditName}
    onChangeDescription={onChangeEditDescription}
  />
</div>
```

- [ ] **Step 7: `PresetCreateSection.tsx` を差し替える**

こちらは入力欄が `space-y-4` の直下に並んでいるため、ラッパーを足さずそのまま置く:

```tsx
<PresetNameDescriptionFields
  name={newPresetName}
  description={newPresetDescription}
  namePlaceholder={PRESET_CREATE_NAME_PLACEHOLDER}
  descriptionPlaceholder={PRESET_CREATE_DESCRIPTION_PLACEHOLDER}
  onChangeName={onChangeName}
  onChangeDescription={onChangeDescription}
/>
```

- [ ] **Step 8: 既存テスト・E2E が通ることを確認する**

Run: `npm test`
Expected: 全件 PASS

Run: `npx playwright test`
Expected: 全件 PASS。特に `e2e/preset-edit-sort.spec.ts` が `getByPlaceholder("例: 平日モーニングルーティン")` で入力欄を引いており、placeholder を維持しているので通ること

- [ ] **Step 9: mutation で確認する**

1. `aria-label={PRESET_FIELD_NAME_LABEL}` を削除 → `PresetNameDescriptionFields.test.tsx` の名前で引くテストが落ちること
2. `onChangeName(event.target.value)` を `onChangeName("")` に変更 → 呼び出し側を含むテストが落ちること

いずれも確認後に必ず元へ戻す。

- [ ] **Step 10: 変更内容を報告する（コミットはしない）**

---

### Task 5: `RoutineSelectionList` の Storybook ストーリーを追加する

SRP そのものではなく、コードベースの規約への追従。`preset/components` 配下のセクション系コンポーネントには軒並み `*.stories.tsx` があり、第1巡で追加した `RoutineSelectionList` にだけ無い（前回のPRで追加した `ToggleSwitch` にはストーリーを付けている）。

**Files:**

- Create: `src/features/preset/components/RoutineSelectionList.stories.tsx`

- [ ] **Step 1: 既存のストーリーの書き方を確認する**

Run: `cat src/features/preset/components/PresetEditSection.stories.tsx`

meta の `title` の付け方、`args` の渡し方、`satisfies Meta<typeof ...>` の形を既存に合わせる。

- [ ] **Step 2: ストーリーを作る**

`src/features/preset/components/RoutineSelectionList.stories.tsx` を作成する。少なくとも以下の3つを用意する:

- `Default` — 複数グループ、未選択
- `WithSelection` — 一部が選択済み
- `Empty` — `groups={[]}` で空メッセージ

グループは `groupRoutinesForSelection` を通して作り、実際の使われ方と同じ形にする。

- [ ] **Step 3: Storybook のビルドが通ることを確認する**

Run: `npm run build-storybook`
Expected: 成功

- [ ] **Step 4: 変更内容を報告する（コミットはしない）**

---

## 完了条件

- `RoutineSelectionList` がカテゴリ解決を自前で持たず、既存の `getCategoryInfo` を使っている。未知カテゴリでもホーム画面と同じ「📌」が出る
- 表示順のポリシーが `presetRoutineSelectionOrder.ts` にまとまり、`PresetEditSection.tsx` の JSX からは消えている
- 名前・説明の入力欄が `PresetNameDescriptionFields.tsx` の1箇所にあり、作成画面・編集画面の両方がそれを使っている。両方の入力欄に支援技術向けの名前が付いている
- 第1巡で追加した2つのテストファイルが共有フィクスチャを使っている
- `RoutineSelectionList` に Storybook ストーリーがある
- 既存テストを1件も削らずに全件 green（`npm test`）
- E2E 全件 green（`npx playwright test`）
- `npm run lint` / `npm run typecheck` / `npm run build` / `npx prettier --check`（変更ファイル）がクリーン
- mutation で各タスクのテストが実装を掴んでいることを確認済み

## 追加対応（Task 6）

Task 2 の完了後、実ブラウザで測ったところ、同じプリセット画面の適用セクションだけが取り残されて絵文字の有無が食い違っていた（選択リストは `📌`、適用セクションは絵文字なし）。当初はスコープ外としていたが、今回の変更が原因で目立つようになった不整合のため対応した。

- `src/features/preset/components/PresetApplySection.tsx` のインラインのカテゴリ解決を `getCategoryInfo` に差し替え
- `src/features/preset/__tests__/PresetApplySection.test.tsx` に既知カテゴリ・未知カテゴリの観点を追加
- `getCategoryInfo` は `Pick<Routine, "category">` を受けるため、`RoutineTemplate` をそのまま渡せる

これで `preset` 配下からインラインのカテゴリ解決は無くなり、ホーム画面と表示が揃った。

## 別途の申し送り（今回のスコープ外）

- `src/features/statistics/page/components/StatisticsCategoryDetailList.tsx:10` に同型のインラインのカテゴリ解決が残っている。同じ statistics 内でも `page/useStatisticsChartData.ts:1` は `getCategoryInfo` を使っており、feature 内で不統一。別 feature かつ本ブランチの差分に含まれないため触らない
- `src/features/routine/components/RoutineFormTimeFields.tsx:35,62` の `<label>` が `htmlFor` / `id` で input と紐付いていない。Task 4 と同じ a11y の系統だが、別 feature のため別ブランチで対応する
- `e2e/` 配下でルーティン作成の操作が4ファイルに重複している。`e2e/helpers.ts` への集約は別途
