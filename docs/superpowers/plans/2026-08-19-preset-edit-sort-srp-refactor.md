# プリセット編集の並び順変更 SRPリファクタリング プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブランチ `feat/preset-edit-sort-by-time` で main から変更された箇所を、単一責任の観点で整理する。

**Architecture:** 今回の差分は小さいが、追加したコードが既存の責務の曖昧さの上に乗っている。特に `PresetEditSection.tsx` が「フォーム全体のレイアウト」と「ルーティン選択行の描画」と「表示順の決定」の3つを1コンポーネントで抱えており、同じ選択行の描画が `PresetCreateSection.tsx` にもほぼ丸ごと重複している。選択行の描画を専用コンポーネントへ切り出し、両画面が共有する形にする。並び順の違い（編集画面は時刻順、新規作成画面は現状維持）は、渡すデータ側で決めて描画側は受け取った順に描くだけにする。

**Tech Stack:** TypeScript / React 19 / Jest + Testing Library / Playwright（既存踏襲、追加ライブラリなし）

## 変更対象の洗い出し

main からの差分は以下（docs 除く）:

| ファイル                                                      | 変更内容                                       | SRP上の問題                                                                                                                |
| ------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/features/preset/presetRoutineGrouping.ts`                | `sortRoutineSelectionGroupsByStartTime` を追加 | **問題1**: ファイル名は「グルーピング」だが、並べ替えも持つようになった                                                    |
| `src/features/preset/components/PresetEditSection.tsx`        | ソート呼び出しを追加                           | **問題2**: レイアウト・選択行の描画・表示順の決定を1つで抱える。**問題3**: 選択行の描画が `PresetCreateSection.tsx` と重複 |
| `e2e/preset-edit-sort.spec.ts`                                | 新規                                           | **問題4**: ルーティン作成のE2Eヘルパーがこのファイル内に閉じており、他3つのE2Eと同じ操作が重複                             |
| `src/features/preset/__tests__/presetRoutineGrouping.test.ts` | テスト追加                                     | 問題なし                                                                                                                   |
| `src/features/preset/__tests__/PresetEditSection.test.tsx`    | テスト追加                                     | 問題なし（`createRoutine`フィクスチャの重複はブランチ以前からの既存事情のため対象外）                                      |

### 対応する問題と、しない問題

**対応する:**

- **問題1** — `presetRoutineGrouping.ts` の責務分割（Task 1）
- **問題2 / 問題3** — 選択行の描画コンポーネント切り出しと両画面での共有（Task 2）

**対応しない（今回のスコープ外）:**

- `createRoutine` テストフィクスチャが preset 配下の8ファイルに重複している件 — ブランチ以前から存在する既存事情であり、今回の差分が原因ではない。触ると差分が無関係に膨らむ
- **問題4**（E2Eヘルパーの重複）— `e2e/helpers.ts` への集約は他3つのE2Eファイルの書き換えを伴い、今回の変更と無関係なファイルに差分が波及する。ただし今回追加した `createRoutine` が「開始時間の input が label と紐付いていないため type で特定する」という回避を含んでいる点は、別途 a11y の課題として残す（後述）

## Global Constraints

- 振る舞いを変えない。編集画面は時刻昇順、新規作成画面は現状の並び（`groupRoutinesForSelection` が返す順）のまま
- 既存のテストは1件も削除・弱体化させない。リファクタリング後も同じ観点が検証され続けること
- 各タスクの終わりに `npm test` と `npx playwright test e2e/preset-edit-sort.spec.ts` が green であることを確認する
- リファクタリングの正しさは mutation で確認する。切り出した後のコンポーネントを壊したとき、既存テストが落ちること
- **自動コミットはしない。** 各タスクの終わりに変更内容を報告し、コミットの指示を待つ

---

### Task 1: `presetRoutineGrouping.ts` から並べ替えの責務を分離する

**問題:** ファイル名と JSDoc は「選択リスト用にルーティンをグループへ統合する」ことを述べているが、`sortRoutineSelectionGroupsByStartTime` を足したことで「並べ替え」という別の関心事が同居した。グルーピングは全画面共通の前処理、並べ替えは画面ごとの表示都合であり、変更理由が異なる。

**Files:**

- Create: `src/features/preset/presetRoutineSelectionOrder.ts`
- Create: `src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`
- Modify: `src/features/preset/presetRoutineGrouping.ts`（`sortRoutineSelectionGroupsByStartTime` を削除）
- Modify: `src/features/preset/__tests__/presetRoutineGrouping.test.ts`（並べ替えの describe を新ファイルへ移す）
- Modify: `src/features/preset/components/PresetEditSection.tsx`（import 元の変更）

**Interfaces:**

- Consumes: `RoutineSelectionGroup` 型（`presetRoutineGrouping.ts` が引き続き export する）
- Produces: `sortRoutineSelectionGroupsByStartTime(groups: RoutineSelectionGroup[]): RoutineSelectionGroup[]` — Task 2 で使う

- [ ] **Step 1: 新しいテストファイルを作る**

`src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts` を作成し、現在 `presetRoutineGrouping.test.ts` の末尾にある `describe("sortRoutineSelectionGroupsByStartTime", ...)` ブロックを**そのまま**移す。`createRoutine` ヘルパーと必要な import も合わせて移す:

```typescript
import type { Routine } from "@/types/routine";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import { sortRoutineSelectionGroupsByStartTime } from "../presetRoutineSelectionOrder";

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
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

// ここに presetRoutineGrouping.test.ts の
// describe("sortRoutineSelectionGroupsByStartTime", ...) を丸ごと移す
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/presetRoutineSelectionOrder.test.ts`
Expected: `Cannot find module '../presetRoutineSelectionOrder'` で FAIL

- [ ] **Step 3: 新ファイルへ実装を移す**

`src/features/preset/presetRoutineSelectionOrder.ts` を作成する:

```typescript
import type { RoutineSelectionGroup } from "./presetRoutineGrouping";

/**
 * ルーティン選択グループを開始時刻の昇順に並べ替える。
 *
 * startTime は常に HH:mm のゼロ埋め文字列のため、文字列比較がそのまま
 * 時刻の昇順になる。ホーム画面の並び順（routineDisplayActions）と同じ方式。
 *
 * グルーピングは選択リスト全体の前処理、並べ替えは画面ごとの表示都合という
 * 別の関心事のため、ファイルを分けている。
 */
export const sortRoutineSelectionGroupsByStartTime = (
  groups: RoutineSelectionGroup[],
): RoutineSelectionGroup[] => {
  return [...groups].sort((left, right) =>
    left.routine.startTime.localeCompare(right.routine.startTime),
  );
};
```

`src/features/preset/presetRoutineGrouping.ts` から `sortRoutineSelectionGroupsByStartTime` の定義と JSDoc を削除する（`groupRoutinesForSelection` と `RoutineSelectionGroup` 型はそのまま残す）。

`src/features/preset/__tests__/presetRoutineGrouping.test.ts` から `describe("sortRoutineSelectionGroupsByStartTime", ...)` ブロックを削除し、import を元の形（`groupRoutinesForSelection` のみ）に戻す。

`src/features/preset/components/PresetEditSection.tsx` の import を分ける:

```typescript
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import { sortRoutineSelectionGroupsByStartTime } from "../presetRoutineSelectionOrder";
```

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset`
Expected: 全件 PASS。両方のテストファイルがそれぞれの対象だけを検証している状態になる

- [ ] **Step 5: 分離が実効的であることを mutation で確認する**

`presetRoutineSelectionOrder.ts` の比較を降順（`right...localeCompare(left...)`）に書き換え、`presetRoutineSelectionOrder.test.ts` が落ちることを確認する。確認後に必ず元へ戻す。

Expected: 新テストファイルが落ちる（＝移設後もテストが実装を掴んでいる）

- [ ] **Step 6: 変更内容を報告し、コミットの指示を待つ**

自動コミットはしない。

---

### Task 2: ルーティン選択行の描画を専用コンポーネントへ切り出す

**問題:** `PresetEditSection.tsx` が「編集フォーム全体のレイアウト」「ルーティン選択行1件の見た目（絵文字・タイトル・時刻・チェックボックス）」「表示順の決定」の3つを抱えている。さらに選択行の描画は `PresetCreateSection.tsx` にもほぼ同一のコードが存在し、片方だけ直すと両画面の見た目が食い違う。

**方針:** 選択行のリストを描く `RoutineSelectionList` を切り出す。このコンポーネントは「渡された `RoutineSelectionGroup[]` を、渡された順に描く」だけを責務とし、並び順は呼び出し側が決める。これにより編集画面は時刻順、新規作成画面は現状維持という違いを、描画側を分岐させずに表現できる。

**Files:**

- Create: `src/features/preset/components/RoutineSelectionList.tsx`
- Create: `src/features/preset/__tests__/RoutineSelectionList.test.tsx`
- Modify: `src/features/preset/components/PresetEditSection.tsx`
- Modify: `src/features/preset/components/PresetCreateSection.tsx`

**Interfaces:**

- Consumes: `RoutineSelectionGroup`（`presetRoutineGrouping.ts`）、`sortRoutineSelectionGroupsByStartTime`（Task 1 で作った `presetRoutineSelectionOrder.ts`）
- Produces: `RoutineSelectionList` コンポーネント

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/RoutineSelectionList.test.tsx` を作成する:

```typescript
import { fireEvent, render, screen } from "@testing-library/react";
import type { Routine } from "@/types/routine";
import { groupRoutinesForSelection } from "../presetRoutineGrouping";
import { RoutineSelectionList } from "../components/RoutineSelectionList";

const createRoutine = (overrides: Partial<Routine> = {}): Routine => ({
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

const defaultProps = {
  selectedRoutineIds: new Set<string>(),
  onToggleRoutine: jest.fn(),
  emptyLabel: "ルーティンがありません",
};

describe("RoutineSelectionList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("グループが空なら空メッセージを表示する", () => {
    render(<RoutineSelectionList {...defaultProps} groups={[]} />);

    expect(screen.getByText("ルーティンがありません")).toBeInTheDocument();
  });

  it("渡された順序をそのまま保って描画する", () => {
    // 並べ替えは呼び出し側の責務。ここでは受け取った順に描くことを固定する
    const groups = groupRoutinesForSelection([
      createRoutine({ id: "late", title: "夜食", startTime: "22:00" }),
      createRoutine({ id: "early", title: "朝食", startTime: "06:00" }),
    ]);

    render(<RoutineSelectionList {...defaultProps} groups={groups} />);

    expect(
      screen.getAllByText(/^\d{2}:\d{2}$/).map((el) => el.textContent),
    ).toEqual(["22:00", "06:00"]);
  });

  it("チェックすると代表ルーティンのidで通知する", () => {
    const onToggleRoutine = jest.fn();
    const groups = groupRoutinesForSelection([
      createRoutine({ id: "r-mon", daysOfWeek: [1] }),
      createRoutine({ id: "r-wed", daysOfWeek: [3] }),
    ]);

    render(
      <RoutineSelectionList
        {...defaultProps}
        groups={groups}
        onToggleRoutine={onToggleRoutine}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox"));

    expect(onToggleRoutine).toHaveBeenCalledWith("r-mon");
  });

  it("選択済みのidに対応するチェックボックスがチェック状態になる", () => {
    const groups = groupRoutinesForSelection([
      createRoutine({ id: "a", title: "朝食", startTime: "06:00" }),
      createRoutine({ id: "b", title: "夜食", startTime: "22:00" }),
    ]);

    render(
      <RoutineSelectionList
        {...defaultProps}
        groups={groups}
        selectedRoutineIds={new Set(["b"])}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/RoutineSelectionList.test.tsx`
Expected: `Cannot find module '../components/RoutineSelectionList'` で FAIL

- [ ] **Step 3: コンポーネントを作る**

`src/features/preset/components/RoutineSelectionList.tsx` を作成する:

```tsx
import { ROUTINE_CATEGORIES } from "@/types/routine";
import type { RoutineSelectionGroup } from "../presetRoutineGrouping";

type RoutineSelectionListProps = {
  groups: RoutineSelectionGroup[];
  selectedRoutineIds: Set<string>;
  onToggleRoutine: (routineId: string) => void;
  emptyLabel: string;
};

/**
 * プリセットに含めるルーティンを選ぶチェックボックスの一覧。
 *
 * 並び順は決めず、渡された groups の順にそのまま描く。編集画面は時刻順、
 * 新規作成画面は保存順というように、順序の都合は画面ごとに違うため。
 */
export const RoutineSelectionList = ({
  groups,
  selectedRoutineIds,
  onToggleRoutine,
  emptyLabel,
}: RoutineSelectionListProps) => {
  if (groups.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">{emptyLabel}</p>
    );
  }

  return (
    <>
      {groups.map((group) => {
        const categoryInfo = ROUTINE_CATEGORIES.find(
          (item) => item.value === group.routine.category,
        );

        return (
          <label
            key={group.key}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedRoutineIds.has(group.routine.id)}
              onChange={() => onToggleRoutine(group.routine.id)}
              className="w-4 h-4"
            />
            <span className="flex-1 text-sm text-gray-900 dark:text-white">
              {categoryInfo?.emoji} {group.routine.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.routine.startTime}
            </span>
          </label>
        );
      })}
    </>
  );
};
```

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/RoutineSelectionList.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: `PresetEditSection.tsx` を新コンポーネントに置き換える**

ルーティン選択部分（現在の `{routines.length === 0 ? ... : sortRoutine...map(...)}` のブロック全体）を以下に置き換える:

```tsx
<div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2 dark:border-gray-600">
  <RoutineSelectionList
    groups={sortRoutineSelectionGroupsByStartTime(
      groupRoutinesForSelection(routines),
    )}
    selectedRoutineIds={editSelectedRoutines}
    onToggleRoutine={onToggleEditRoutine}
    emptyLabel={PRESET_EDIT_EMPTY_ROUTINES_LABEL}
  />
</div>
```

不要になった import（`ROUTINE_CATEGORIES`）を削除する。`Routine` 型は props で使い続けるため残す。

- [ ] **Step 6: `PresetCreateSection.tsx` を新コンポーネントに置き換える**

同様にルーティン選択部分を置き換える。**並べ替えは呼ばない**（現状の並び順を維持する）:

```tsx
<div className="space-y-2 max-h-60 overflow-y-auto">
  <RoutineSelectionList
    groups={groupRoutinesForSelection(currentRoutines)}
    selectedRoutineIds={selectedRoutines}
    onToggleRoutine={onToggleRoutine}
    emptyLabel={PRESET_CREATE_EMPTY_ROUTINES_LABEL}
  />
</div>
```

不要になった import（`ROUTINE_CATEGORIES`）を削除する。

補足: 新規作成画面の選択行は元々わずかに異なるクラス（`p-2` / `text-gray-900`（`text-sm`なし）/ `text-sm text-gray-500`）を使っていた。共通化により編集画面側のクラス（`p-1.5` / `text-sm`）に揃う。見た目の差は文字サイズと余白の微差のみで、Step 8 の実機確認で許容範囲か確認する。もし新規作成画面の見た目を維持すべきと判断した場合は、クラスを props で受け取る形にはせず（`ToggleSwitch` と違いここは意味的に同じリストのため）、揃った見た目を正とする。

- [ ] **Step 7: 既存テストが全て通ることを確認する**

Run: `npm test`
Expected: 全スイート PASS。特に `PresetEditSection.test.tsx` と `PresetCreateSection.test.tsx` が変更なしで通ること（＝外から見た振る舞いが変わっていない証拠）

Run: `npx playwright test e2e/preset-edit-sort.spec.ts`
Expected: PASS

- [ ] **Step 8: 切り出しが実効的であることを mutation で確認する**

以下をそれぞれ試し、確認後に必ず元へ戻す:

1. `RoutineSelectionList.tsx` の `checked` を常に `false` にする → `RoutineSelectionList.test.tsx` の選択状態テストが落ちること
2. `RoutineSelectionList.tsx` の `onToggleRoutine(group.routine.id)` を `onToggleRoutine("")` にする → 既存の `PresetEditSection.test.tsx` / `PresetCreateSection.test.tsx` が落ちること（＝呼び出し側のテストが切り出し後のコンポーネントを貫通して検証できている）
3. `PresetEditSection.tsx` の `sortRoutineSelectionGroupsByStartTime(...)` を外す → `PresetEditSection.test.tsx` の並び順テストと E2E が落ちること

- [ ] **Step 9: 実機で見た目を確認する**

`npm run dev` で起動し、プリセット管理画面で以下を確認する:

1. 新規作成のルーティン選択リストが、切り出し前と同じ内容・同じ並び順で表示される
2. 既存プリセットの編集を開くと、時刻の昇順で並ぶ
3. 両画面でチェックの ON/OFF が正しく反映される

- [ ] **Step 10: 変更内容を報告し、コミットの指示を待つ**

自動コミットはしない。

---

## 完了条件

- `presetRoutineGrouping.ts` が「グルーピング」だけを持ち、並べ替えは `presetRoutineSelectionOrder.ts` に分かれている
- ルーティン選択行の描画が `RoutineSelectionList.tsx` の1箇所にあり、編集画面・新規作成画面の両方がそれを使っている
- 並び順の決定は呼び出し側にあり、`RoutineSelectionList` は順序を持たない
- 既存テストを1件も削らずに全件 green（`npm test`）
- E2E 全件 green（`npx playwright test`）
- `npm run lint` / `npm run typecheck` / `npx prettier --check`（変更ファイル）がクリーン
- mutation でリファクタリング後もテストが実装を掴んでいることを確認済み

## 別途の申し送り（今回のスコープ外）

`src/features/routine/components/RoutineFormTimeFields.tsx:35,62` の `<label>` が `htmlFor` / `id` で input と紐付いていない。今回 E2E を書く際に `getByLabel("開始時間")` が引けず判明した。スクリーンリーダーで「開始時間」「所要時間」が読み上げられず、ラベルをタップしても入力欄にフォーカスしない。Storybook のテストは Testing Library が親子関係も見るため通ってしまっており、実ブラウザの挙動と乖離している。今回の差分とは別の箇所のため、別ブランチで対応する。
