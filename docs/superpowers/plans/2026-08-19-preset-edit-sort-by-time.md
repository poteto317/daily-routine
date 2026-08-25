# プリセット編集画面のルーティンを時間順に表示 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存プリセットの編集画面を開いたとき、ルーティンの選択チェックボックス一覧を開始時刻（`startTime`）の昇順で表示する。

**Architecture:** ルーティンのグルーピング(`groupRoutinesForSelection`)は新規作成画面など他の画面でも共有されている共通関数のため、そこに直接ソートを混ぜ込むと影響範囲がプリセット全体に広がる。代わりに、グルーピング結果を時間順に並べ替える専用関数を`presetRoutineGrouping.ts`に追加し、編集画面(`PresetEditSection.tsx`)からだけ呼び出す。ソート方法は既存のホーム画面の並び順ロジック(`src/features/routine/hooks/routineDisplayActions.ts`)に倣い、`startTime`（`HH:mm`形式のゼロ埋め文字列）を`localeCompare`で比較する。

**Tech Stack:** TypeScript / React 19 / Jest + Testing Library（既存踏襲、追加ライブラリなし）

## Global Constraints

- 対象は「既存プリセットの編集画面」のみ。新規作成画面(`PresetCreateSection.tsx`)や他の`groupRoutinesForSelection`利用箇所（`presetCreateFilterSelection.ts`, `presetEditSelectionResolver.ts`）の並び順・挙動は変更しない
- 時刻の比較は既存パターンに合わせ `left.startTime.localeCompare(right.startTime)` を使う（`startTime`は常に`HH:mm`のゼロ埋め文字列という既存の前提を踏襲する。バリデーションの追加は不要）
- `groupRoutinesForSelection`自体のシグネチャ・返り値の型・既存の統合ロジック（title+startTime一致で1グループにまとめる）は変更しない
- 新規追加する関数は`groupRoutinesForSelection`の返り値（`RoutineSelectionGroup[]`）を受け取り、ソート済みの同じ型の配列を返す純粋関数にする
- TDD（RED→GREEN）で進め、各タスクの終わりに既存テストを含めて全て green であることを確認する

---

### Task 1: `RoutineSelectionGroup[]`を開始時刻順に並べ替える関数を追加する

**Files:**

- Modify: `src/features/preset/presetRoutineGrouping.ts`
- Test: `src/features/preset/__tests__/presetRoutineGrouping.test.ts`

**Interfaces:**

- Consumes: `RoutineSelectionGroup`型（`src/features/preset/presetRoutineGrouping.ts`で定義済み。`{ key: string; routine: Routine; routineIds: string[]; daysOfWeek: number[] }`）。`Routine.startTime`は`string`（`HH:mm`形式、`src/types/routine/core.ts`で定義）
- Produces: `sortRoutineSelectionGroupsByStartTime(groups: RoutineSelectionGroup[]): RoutineSelectionGroup[]` — Task 2で`PresetEditSection.tsx`から呼び出す

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetRoutineGrouping.test.ts`の末尾（最後の`});`の直前）に追記する:

```typescript
describe("sortRoutineSelectionGroupsByStartTime", () => {
  it("startTimeの昇順に並べ替える", () => {
    const late = createRoutine({
      id: "late",
      title: "夜食",
      startTime: "22:00",
    });
    const early = createRoutine({
      id: "early",
      title: "朝食",
      startTime: "06:00",
    });
    const middle = createRoutine({
      id: "middle",
      title: "昼食",
      startTime: "12:00",
    });

    const groups = groupRoutinesForSelection([late, early, middle]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((g) => g.routine.id)).toEqual([
      "early",
      "middle",
      "late",
    ]);
  });

  it("startTimeが同じ場合は元の順序を維持する（安定ソート）", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "07:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "07:00" });

    const groups = groupRoutinesForSelection([a, b]);
    const sorted = sortRoutineSelectionGroupsByStartTime(groups);

    expect(sorted.map((g) => g.routine.id)).toEqual(["a", "b"]);
  });

  it("空配列を渡すと空配列を返す", () => {
    expect(sortRoutineSelectionGroupsByStartTime([])).toEqual([]);
  });

  it("引数の配列を破壊的に変更しない", () => {
    const a = createRoutine({ id: "a", title: "A", startTime: "20:00" });
    const b = createRoutine({ id: "b", title: "B", startTime: "05:00" });
    const groups = groupRoutinesForSelection([a, b]);
    const originalOrder = groups.map((g) => g.routine.id);

    sortRoutineSelectionGroupsByStartTime(groups);

    expect(groups.map((g) => g.routine.id)).toEqual(originalOrder);
  });
});
```

ファイル冒頭のimportを以下のように変更する（`sortRoutineSelectionGroupsByStartTime`を追加）:

```typescript
import {
  groupRoutinesForSelection,
  sortRoutineSelectionGroupsByStartTime,
} from "../presetRoutineGrouping";
```

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/presetRoutineGrouping.test.ts`
Expected: `sortRoutineSelectionGroupsByStartTime is not a function` などのエラーで FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/presetRoutineGrouping.ts`の末尾に追加する:

```typescript
/**
 * ルーティン選択グループを開始時刻の昇順に並べ替える。
 *
 * startTimeは常にHH:mmのゼロ埋め文字列のため、localeCompareでの文字列比較が
 * そのまま時刻の昇順になる（ホーム画面の並び順と同じ方式）。
 */
export const sortRoutineSelectionGroupsByStartTime = (
  groups: RoutineSelectionGroup[],
): RoutineSelectionGroup[] => {
  return [...groups].sort((left, right) =>
    left.routine.startTime.localeCompare(right.routine.startTime),
  );
};
```

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/presetRoutineGrouping.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット**

```bash
git add src/features/preset/presetRoutineGrouping.ts src/features/preset/__tests__/presetRoutineGrouping.test.ts
git commit -m "feat(preset): ルーティン選択グループを開始時刻順に並べ替える関数を追加"
```

---

### Task 2: プリセット編集画面でルーティン一覧を時間順に表示する

**Files:**

- Modify: `src/features/preset/components/PresetEditSection.tsx`
- Test: `src/features/preset/__tests__/PresetEditSection.test.tsx`

**Interfaces:**

- Consumes: Task 1で追加した`sortRoutineSelectionGroupsByStartTime`（`src/features/preset/presetRoutineGrouping.ts`からimport）

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetEditSection.test.tsx`の末尾（最後の`});`の直前）に追記する:

```typescript
it("ルーティンは開始時刻の昇順で表示される（渡された配列の順序に依存しない）", () => {
  const routines = [
    createRoutine({ id: "late", title: "夜食", startTime: "22:00" }),
    createRoutine({ id: "early", title: "朝食", startTime: "06:00" }),
    createRoutine({ id: "middle", title: "昼食", startTime: "12:00" }),
  ];

  render(<PresetEditSection {...defaultProps} routines={routines} />);

  const labels = screen.getAllByText(/朝食|昼食|夜食/);
  expect(labels.map((el) => el.textContent)).toEqual([
    " 朝食",
    " 昼食",
    " 夜食",
  ]);
});
```

補足: `PresetEditSection.tsx`の表示は `{categoryInfo?.emoji} {group.routine.title}` という構造で、`createRoutine`のデフォルト`category: "life"`に対応する絵文字が`categoryInfo?.emoji`に入る。絵文字を含む完全一致だとテストが脆くなるため、実装後に実際のテキスト内容を確認し、必要なら`toEqual`の期待値やマッチャーを調整すること（例: `el.textContent?.includes("朝食")`の順序を見る形に変更するなど）。ポイントは「表示順が時刻昇順になっているか」を検証することであり、絵文字の厳密一致ではない。

- [ ] **Step 2: テストが失敗することを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/PresetEditSection.test.tsx`
Expected: 現状は`routines`配列の順序（late, early, middle）のまま表示されるため、期待した順序（early, middle, late）と一致せず FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/components/PresetEditSection.tsx`のimportを変更する:

```typescript
import {
  groupRoutinesForSelection,
  sortRoutineSelectionGroupsByStartTime,
} from "../presetRoutineGrouping";
```

`groupRoutinesForSelection(routines).map((group) => {` の行を以下に変更する:

```typescript
sortRoutineSelectionGroupsByStartTime(
  groupRoutinesForSelection(routines),
).map((group) => {
```

- [ ] **Step 4: テストが通ることを確認する**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/preset/__tests__/PresetEditSection.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: 既存の全テストへの影響がないことを確認する**

Run: `npm test`
Expected: 全スイート PASS（新規作成画面側`PresetCreateSection.test.tsx`など、`groupRoutinesForSelection`を使う他画面のテストが変わらず通ること）

- [ ] **Step 6: コミット**

```bash
git add src/features/preset/components/PresetEditSection.tsx src/features/preset/__tests__/PresetEditSection.test.tsx
git commit -m "feat(preset): プリセット編集画面のルーティン一覧を開始時刻順で表示"
```

---

### Task 3: 動作確認とテスト観点表への追記

**Files:**

- Modify: `docs/03-testing/test-matrix.md`（プリセット関連セクションに1行追加）

- [ ] **Step 1: 実機で動作確認する**

`npm run dev`で起動し、以下を確認する:

1. 開始時刻がバラバラな複数のルーティン（例: 22:00, 06:00, 12:00）を作成する
2. それらを含むプリセットを新規作成する（この時点では新規作成画面の並び順は変更していないため作成順のままで問題ない）
3. 作成したプリセットの編集を開く
4. ルーティン一覧が開始時刻の昇順（06:00 → 12:00 → 22:00）で表示されることを確認する
5. 新規作成画面（プリセット新規作成時のルーティン選択一覧）の並び順が今回の変更前後で変わっていないことを確認する

- [ ] **Step 2: `docs/03-testing/test-matrix.md`のプリセット関連セクションに確認項目を1行追加する**

`docs/03-testing/test-matrix.md`内でプリセット機能を扱っている表を探し、既存の行の書式に合わせて以下のような行を追加する（既存の番号体系・列構成に合わせること。列は「#, 機能, 状態, PC, SP, 備考」を想定）:

```
| xx-x | プリセット編集時のルーティン表示順   | 🔶   | ⬜  | ⬜  | 開始時刻がバラバラな複数ルーティンを含むプリセットの編集を開き、開始時刻の昇順で表示されることを確認 |
```

- [ ] **Step 3: コミット**

```bash
git add docs/03-testing/test-matrix.md
git commit -m "docs: テスト観点表にプリセット編集時の並び順確認項目を追加"
```

---

## 完了条件

- `sortRoutineSelectionGroupsByStartTime`がTask 1のテストで検証されている
- プリセット編集画面（`PresetEditSection.tsx`）のルーティン一覧が開始時刻昇順で表示される
- プリセット新規作成画面・`presetCreateFilterSelection.ts`・`presetEditSelectionResolver.ts`など、他の`groupRoutinesForSelection`利用箇所の並び順・挙動に変更がない
- `npm test`が全件 green
- `npm run lint` / `npm run typecheck` / `npx prettier --check`（変更ファイル）がクリーン
