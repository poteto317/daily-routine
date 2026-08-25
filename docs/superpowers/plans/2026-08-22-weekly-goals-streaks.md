# Weekly Goals and Streaks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 各ルーティングループへ週1〜7回の目標を設定し、ホーム画面の目標バッジと統計ページの週次進捗・現在ストリーク・最長ストリークを提供する。

**Architecture:** `Routine` と日次履歴スナップショットにオプショナルな `WeeklyGoal` を含め、既存の保存・同期・JSON転送経路を再利用する。集計はReactとストレージアクセスから分離した純粋関数で行い、同一 `groupId` の完了を日単位で重複排除する。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript 5、Tailwind CSS v4、Jest + React Testing Library、Playwright、LocalStorage、Firebase Firestore

**Spec:** `docs/superpowers/specs/2026-08-21-weekly-goals-streaks-design.md`

## Global Constraints

- 週間目標値は1〜7の整数、空欄は目標なしとする。
- 週は月曜日開始・日曜日終了、日付キーはAsia/Tokyo基準とする。
- 同一 `groupId` の完了は同じ日に最大1回だけ数える。
- 目標値変更時は `startedAt` を更新し、新しいストリークとして開始する。
- 目標値以外の編集では `startedAt` を保持する。
- 進行中の現在週が未達でも、直前までのストリークを切断しない。
- 既存データの `weeklyGoal`、`groupId` 欠落を正常系として扱う。
- 新しいnpm依存関係は追加しない。
- 実装前に `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` と `node_modules/next/dist/docs/01-app/02-guides/single-page-applications.md` を読む。

---

### Task 1: 週間目標データモデルと履歴スナップショット

**Files:**

- Modify: `src/types/routine/core.ts`
- Modify: `src/types/routine/history.ts`
- Modify: `src/types/routine/index.ts`
- Modify: `src/features/routine/storageDailyHistory.ts`
- Modify: `src/features/routine/__tests__/storageDailyHistory.test.ts`

**Interfaces:**

- Produces: `WeeklyGoal { targetPerWeek: number; startedAt: string }`
- Produces: `Routine.weeklyGoal?: WeeklyGoal`
- Produces: `DailyHistory.routineSnapshots[].groupId?: string`
- Produces: `DailyHistory.routineSnapshots[].weeklyGoal?: WeeklyGoal`

- [ ] **Step 1: 履歴スナップショットの失敗テストを書く**

`storageDailyHistory.test.ts` に、グループIDと週間目標がコピーされるテスト、および週間目標なしの既存ルーティンが従来形のまま保存されるテストを追加する。

```ts
it("週間目標とgroupIdを履歴スナップショットへ保存する", () => {
  const routine = makeRoutine({
    id: "monday",
    groupId: "exercise",
    weeklyGoal: { targetPerWeek: 3, startedAt: "2026-08-17T00:00:00.000Z" },
  });

  expect(createRoutineSnapshots([routine])).toEqual([
    expect.objectContaining({
      id: "monday",
      groupId: "exercise",
      weeklyGoal: { targetPerWeek: 3, startedAt: "2026-08-17T00:00:00.000Z" },
    }),
  ]);
});
```

- [ ] **Step 2: テストが型エラーまたは期待値不一致で失敗することを確認する**

Run: `npm test -- --runInBand src/features/routine/__tests__/storageDailyHistory.test.ts`

Expected: `weeklyGoal` が `Routine` に存在しない型エラー、またはsnapshotにフィールドがないためFAIL。

- [ ] **Step 3: 型とsnapshotコピーを実装する**

`src/types/routine/core.ts` に次を追加し、`Routine` から参照する。

```ts
export interface WeeklyGoal {
  targetPerWeek: number;
  startedAt: string;
}

export interface Routine {
  id: string;
  groupId?: string;
  weeklyGoal?: WeeklyGoal;
  title: string;
  startTime: string;
  duration: number;
  category: RoutineCategory;
  daysOfWeek: number[];
  description?: string;
  isCompleted: boolean;
  notificationMinutes?: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

`DailyHistory` のsnapshotにも同じオプショナルフィールドを加え、`createRoutineSnapshots` で値がある場合だけコピーする。

```ts
export const createRoutineSnapshots = (
  routines: Routine[],
): RoutineSnapshot[] =>
  routines.map((routine) => ({
    id: routine.id,
    title: routine.title,
    category: routine.category,
    startTime: routine.startTime,
    ...(routine.groupId ? { groupId: routine.groupId } : {}),
    ...(routine.weeklyGoal ? { weeklyGoal: { ...routine.weeklyGoal } } : {}),
  }));
```

- [ ] **Step 4: 履歴テストと型検査を通す**

Run: `npm test -- --runInBand src/features/routine/__tests__/storageDailyHistory.test.ts && npm run typecheck`

Expected: PASS。

- [ ] **Step 5: コミットする**

```bash
git add src/types/routine/core.ts src/types/routine/history.ts src/types/routine/index.ts src/features/routine/storageDailyHistory.ts src/features/routine/__tests__/storageDailyHistory.test.ts
git commit -m "feat(routine): 週間目標を履歴へ保存する"
```

---

### Task 2: フォーム入力、検証、目標開始時刻

**Files:**

- Create: `src/features/routine/components/weeklyGoalFormModel.ts`
- Create: `src/features/routine/components/__tests__/weeklyGoalFormModel.test.ts`
- Modify: `src/features/routine/components/routineFormInitialModel.ts`
- Modify: `src/features/routine/components/routineFormSubmitModel.ts`
- Modify: `src/features/routine/components/useRoutineMetaFieldsState.ts`
- Modify: `src/features/routine/components/useRoutineFormFieldsState.ts`
- Modify: `src/features/routine/components/useRoutineFormSubmitHandler.ts`
- Modify: `src/features/routine/components/useRoutineFormState.ts`
- Modify: `src/features/routine/components/routineFormStateResult.ts`
- Modify: `src/features/routine/components/RoutineFormOptionalFields.tsx`
- Modify: `src/features/routine/components/RoutineForm.tsx`
- Modify: `src/features/routine/components/helpers.ts`
- Modify: `src/features/routine/locales/ja.json`
- Modify: `src/features/routine/__tests__/routineFormModel.test.ts`
- Modify: `src/features/routine/components/__tests__/RoutineForm.a11y.test.tsx`
- Create: `src/features/routine/components/__tests__/RoutineFormOptionalFields.test.tsx`

**Interfaces:**

- Consumes: `WeeklyGoal`
- Produces: `isWeeklyGoalTargetInputValid(input: string): boolean`
- Produces: `buildWeeklyGoal(input: string, current: WeeklyGoal | undefined, now: string): WeeklyGoal | undefined`
- Produces: `RoutineFormState.weeklyGoalTarget: string`

- [ ] **Step 1: 週間目標フォームモデルの失敗テストを書く**

```ts
describe("isWeeklyGoalTargetInputValid", () => {
  it.each(["", "1", "7"])("%sを有効とする", (value) => {
    expect(isWeeklyGoalTargetInputValid(value)).toBe(true);
  });

  it.each(["0", "8", "1.5", "abc", " 3 "])("%sを無効とする", (value) => {
    expect(isWeeklyGoalTargetInputValid(value)).toBe(false);
  });
});

it("同じ目標値ならstartedAtを保持する", () => {
  const current = { targetPerWeek: 3, startedAt: "2026-08-01T00:00:00.000Z" };
  expect(buildWeeklyGoal("3", current, "2026-08-22T00:00:00.000Z")).toEqual(
    current,
  );
});

it("目標値を変えるとstartedAtを更新する", () => {
  expect(
    buildWeeklyGoal(
      "4",
      { targetPerWeek: 3, startedAt: "2026-08-01T00:00:00.000Z" },
      "2026-08-22T00:00:00.000Z",
    ),
  ).toEqual({ targetPerWeek: 4, startedAt: "2026-08-22T00:00:00.000Z" });
});
```

- [ ] **Step 2: 新規テストが未実装で失敗することを確認する**

Run: `npm test -- --runInBand src/features/routine/components/__tests__/weeklyGoalFormModel.test.ts`

Expected: moduleまたはexportが存在せずFAIL。

- [ ] **Step 3: 純粋な入力検証と目標生成を実装する**

```ts
import type { WeeklyGoal } from "@/types/routine";

const VALID_WEEKLY_GOAL = /^[1-7]$/;

export const isWeeklyGoalTargetInputValid = (input: string): boolean =>
  input === "" || VALID_WEEKLY_GOAL.test(input);

export const buildWeeklyGoal = (
  input: string,
  current: WeeklyGoal | undefined,
  now: string,
): WeeklyGoal | undefined => {
  if (input === "") return undefined;
  if (!isWeeklyGoalTargetInputValid(input)) return current;

  const targetPerWeek = Number(input);
  if (current?.targetPerWeek === targetPerWeek) return current;
  return { targetPerWeek, startedAt: now };
};
```

- [ ] **Step 4: フォームstateとsubmit payloadの失敗テストを追加する**

`resolveRoutineFormInitialState` が既存値を文字列へ変換し、`buildRoutineSubmitPayload` が空欄、維持、変更を正しく処理する期待値を追加する。`buildRoutineSubmitPayload` にはテスト注入用の `now` を渡す。

```ts
const { routineData } = buildRoutineSubmitPayload({
  routine,
  state: { ...state, weeklyGoalTarget: "4" },
  defaultDurationMinutes: 30,
  now: "2026-08-22T00:00:00.000Z",
});

expect(routineData.weeklyGoal).toEqual({
  targetPerWeek: 4,
  startedAt: "2026-08-22T00:00:00.000Z",
});
```

- [ ] **Step 5: state、submit、UIを接続する**

`RoutineFormState` に `weeklyGoalTarget` を追加し、meta field stateで管理する。submit無効条件へ `!isWeeklyGoalTargetInputValid(weeklyGoalTarget)` を加える。

`RoutineFormOptionalFields` に次の数値入力を追加する。

```tsx
<LabeledField label={ROUTINE_FORM_WEEKLY_GOAL_LABEL}>
  {(inputId) => (
    <>
      <input
        id={inputId}
        type="number"
        min="1"
        max="7"
        step="1"
        value={weeklyGoalTarget}
        onChange={(event) => setWeeklyGoalTarget(event.target.value)}
        aria-invalid={!isWeeklyGoalTargetValid}
        aria-describedby={`${inputId}-hint`}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-white dark:text-gray-900"
        placeholder="例: 3"
      />
      <p
        id={`${inputId}-hint`}
        className="text-xs text-gray-500 dark:text-gray-400 mt-1"
      >
        1週間に達成したい回数（1〜7回、空欄なら設定なし）
      </p>
    </>
  )}
</LabeledField>
```

- [ ] **Step 6: フォームの単体・アクセシビリティテストを通す**

Run: `npm test -- --runInBand src/features/routine/components/__tests__/weeklyGoalFormModel.test.ts src/features/routine/__tests__/routineFormModel.test.ts src/features/routine/components/__tests__/RoutineFormOptionalFields.test.tsx src/features/routine/components/__tests__/RoutineForm.a11y.test.tsx`

Expected: PASS。

- [ ] **Step 7: コミットする**

```bash
git add src/features/routine/components src/features/routine/locales/ja.json src/features/routine/__tests__/routineFormModel.test.ts
git commit -m "feat(routine): 週間目標を設定できるようにする"
```

---

### Task 3: 同一グループへの目標伝播とホーム画面バッジ

**Files:**

- Modify: `src/features/routine/hooks/routineCrudActions.ts`
- Modify: `src/features/routine/hooks/__tests__/routineCrudActions.test.ts`
- Modify: `src/features/routine/components/helpers.ts`
- Modify: `src/features/routine/components/RoutineCardContent.tsx`
- Modify: `src/features/routine/components/RoutineCardContent.stories.tsx`
- Modify: `src/features/routine/__tests__/helpers.presentation.test.ts`
- Modify: `src/features/routine/__tests__/RoutineItem.render.test.tsx`
- Modify: `src/features/routine/locales/ja.json`

**Interfaces:**

- Consumes: `Routine.weeklyGoal`
- Produces: `getWeeklyGoalLabel(targetPerWeek: number): string`
- Preserves: `updateRoutineInState(routines, id, updates, now): Routine[]`

- [ ] **Step 1: グループ伝播の失敗テストを書く**

```ts
it("週間目標だけを同一groupIdの全メンバーへ伝播する", () => {
  const routines = [
    makeRoutine({ id: "mon", groupId: "exercise", title: "月曜" }),
    makeRoutine({ id: "wed", groupId: "exercise", title: "水曜" }),
    makeRoutine({ id: "other", groupId: "reading", title: "読書" }),
  ];
  const weeklyGoal = {
    targetPerWeek: 2,
    startedAt: "2026-08-22T00:00:00.000Z",
  };

  const result = updateRoutineInState(
    routines,
    "mon",
    { title: "運動", weeklyGoal },
    "2026-08-22T00:00:00.000Z",
  );

  expect(result.find(({ id }) => id === "mon")).toMatchObject({
    title: "運動",
    weeklyGoal,
  });
  expect(result.find(({ id }) => id === "wed")).toMatchObject({
    title: "水曜",
    weeklyGoal,
  });
  expect(result.find(({ id }) => id === "other")?.weeklyGoal).toBeUndefined();
});
```

週間目標解除時に同一グループ全体から消えるテストも追加する。

- [ ] **Step 2: 既存実装が編集対象1件しか更新せずFAILすることを確認する**

Run: `npm test -- --runInBand src/features/routine/hooks/__tests__/routineCrudActions.test.ts`

Expected: siblingの `weeklyGoal` が未更新でFAIL。

- [ ] **Step 3: 週間目標だけをグループへ伝播する**

`updates` が `weeklyGoal` を自身のpropertyとして持つ場合だけ伝播する。対象メンバーには全更新を、兄弟には `weeklyGoal` と `updatedAt` だけを適用する。

```ts
const hasWeeklyGoalUpdate = Object.prototype.hasOwnProperty.call(
  updates,
  "weeklyGoal",
);
const target = routines.find((routine) => routine.id === id);

return routines.map((routine) => {
  if (routine.id === id) return buildUpdatedRoutine(routine, updates, now);
  if (
    hasWeeklyGoalUpdate &&
    target?.groupId &&
    routine.groupId === target.groupId
  ) {
    return buildUpdatedRoutine(
      routine,
      { weeklyGoal: updates.weeklyGoal },
      now,
    );
  }
  return routine;
});
```

- [ ] **Step 4: バッジ表示の失敗テストを書く**

週間目標ありの `RoutineCardContent` が `週3回` を表示し、目標なしでは表示しないテストを追加する。

- [ ] **Step 5: ラベルhelperとバッジを実装する**

```ts
export const getWeeklyGoalLabel = (targetPerWeek: number): string =>
  `週${targetPerWeek}回`;
```

カテゴリバッジと同じ行に、青系の小さなバッジを追加する。

```tsx
{
  routine.weeklyGoal && (
    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-800">
      {getWeeklyGoalLabel(routine.weeklyGoal.targetPerWeek)}
    </span>
  );
}
```

- [ ] **Step 6: mutationと表示テストを通す**

Run: `npm test -- --runInBand src/features/routine/hooks/__tests__/routineCrudActions.test.ts src/features/routine/__tests__/helpers.presentation.test.ts src/features/routine/__tests__/RoutineItem.render.test.tsx`

Expected: PASS。

- [ ] **Step 7: コミットする**

```bash
git add src/features/routine/hooks/routineCrudActions.ts src/features/routine/hooks/__tests__/routineCrudActions.test.ts src/features/routine/components/RoutineCardContent.tsx src/features/routine/components/RoutineCardContent.stories.tsx src/features/routine/components/helpers.ts src/features/routine/__tests__/helpers.presentation.test.ts src/features/routine/__tests__/RoutineItem.render.test.tsx src/features/routine/locales/ja.json
git commit -m "feat(routine): 週間目標をグループとカードへ反映する"
```

---

### Task 4: 週次進捗とストリークの純粋集計

**Files:**

- Create: `src/features/statistics/statistics/weeklyGoals.ts`
- Create: `src/features/statistics/__tests__/statistics.weekly-goals.test.ts`
- Modify: `src/features/statistics/statistics/types.ts`
- Modify: `src/features/statistics/statistics.ts`

**Interfaces:**

- Produces: `WeeklyGoalProgress`
- Produces: `calculateWeeklyGoalProgress(params): WeeklyGoalProgress[]`

```ts
export interface WeeklyGoalProgress {
  goalId: string;
  title: string;
  targetPerWeek: number;
  completedCount: number;
  remainingCount: number;
  isAchieved: boolean;
  currentStreak: number;
  longestStreak: number;
}

export type CalculateWeeklyGoalProgressParams = {
  selectedDate: Date;
  today: Date;
  routines: Routine[];
  history: HistoryMap;
};
```

- [ ] **Step 1: 週次進捗の失敗テストを書く**

fixturesは `groupId` が同じ月・水・金ルーティン、週3回目標、日次履歴を明示して作る。以下を個別テストにする。

```ts
it("同一グループを異なる3日で完了すると週3回達成になる", () => {
  const result = calculateWeeklyGoalProgress({
    selectedDate: new Date("2026-08-19T03:00:00+09:00"),
    today: new Date("2026-08-19T03:00:00+09:00"),
    routines: exerciseRoutines,
    history: historyFor(["2026-08-17", "2026-08-18", "2026-08-19"]),
  });

  expect(result[0]).toMatchObject({
    goalId: "exercise",
    completedCount: 3,
    remainingCount: 0,
    isAchieved: true,
  });
});

it("同じ日の同一グループ完了は1回だけ数える", () => {
  const result = calculateWeeklyGoalProgress(duplicateSameDayFixture);
  expect(result[0]?.completedCount).toBe(1);
});
```

- [ ] **Step 2: ストリークの失敗テストを書く**

次のケースを固定日付で追加する。

- 終了済み2週を連続達成し、現在進行中週が未達なら `currentStreak: 2`
- 終了済み未達週の後に達成していなければ `currentStreak: 0`
- 達成・達成・未達・達成の並びなら `longestStreak: 2`
- `startedAt` より前の達成週を数えない
- 目標変更後の `startedAt` 以降だけを数える
- 日曜日と月曜日を別週として扱う
- JST 0時台の履歴を日付キーどおり扱う
- snapshotだけが残る削除済みルーティンを過去週に表示する
- 壊れた `targetPerWeek` または `startedAt` を無視する

- [ ] **Step 3: 未実装テストがFAILすることを確認する**

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: moduleまたは関数が存在せずFAIL。

- [ ] **Step 4: 目標定義解決と完了日の重複排除を実装する**

`weeklyGoals.ts` に責務を分けた非公開helperを置く。

```ts
const getGoalId = (routine: Pick<Routine, "id" | "groupId">): string =>
  routine.groupId ?? routine.id;

const isValidWeeklyGoal = (value: unknown): value is WeeklyGoal => {
  if (!value || typeof value !== "object") return false;
  const goal = value as Partial<WeeklyGoal>;
  return (
    Number.isInteger(goal.targetPerWeek) &&
    Number(goal.targetPerWeek) >= 1 &&
    Number(goal.targetPerWeek) <= 7 &&
    typeof goal.startedAt === "string" &&
    Number.isFinite(Date.parse(goal.startedAt))
  );
};
```

選択週の目標候補は、現在週なら現在の `routines` を優先し、過去週ならその週で日付が最も新しいsnapshotを優先する。snapshotにない未削除目標は、同じ `startedAt` の現在ルーティンから補完する。

完了日は `DailyHistory.completedRoutineIds` と同日のsnapshotを結び、`Set<dateKey>` で重複排除する。目標設定前と同じ開始週内の完了も数えるため、比較単位は日時ではなく `startedAt` の週開始日とする。

- [ ] **Step 5: 週系列とストリーク計算を実装する**

```ts
const calculateStreaks = (
  achievedByWeek: boolean[],
  selectedWeekIsCurrent: boolean,
): { currentStreak: number; longestStreak: number } => {
  let longestStreak = 0;
  let running = 0;

  for (const achieved of achievedByWeek) {
    running = achieved ? running + 1 : 0;
    longestStreak = Math.max(longestStreak, running);
  }

  const currentSlice =
    selectedWeekIsCurrent && achievedByWeek.at(-1) === false
      ? achievedByWeek.slice(0, -1)
      : achievedByWeek;
  let currentStreak = 0;
  for (let index = currentSlice.length - 1; index >= 0; index -= 1) {
    if (!currentSlice[index]) break;
    currentStreak += 1;
  }

  return { currentStreak, longestStreak };
};
```

各目標について `startedAt` の週から選択週まで週配列を作り、週ごとのユニーク完了日数を目標値と比較する。現在進行中週が未達の場合は上記のとおり現在ストリークの末尾判定から除くが、最長ストリークには未達として影響させない。

- [ ] **Step 6: 集計テストを通す**

Run: `npm test -- --runInBand src/features/statistics/__tests__/statistics.weekly-goals.test.ts`

Expected: PASS。

- [ ] **Step 7: コミットする**

```bash
git add src/features/statistics/statistics/weeklyGoals.ts src/features/statistics/statistics/types.ts src/features/statistics/statistics.ts src/features/statistics/__tests__/statistics.weekly-goals.test.ts
git commit -m "feat(statistics): 週間目標とストリークを集計する"
```

---

### Task 5: 統計ページの週間目標パネル

**Files:**

- Create: `src/features/statistics/page/useWeeklyGoalProgress.ts`
- Create: `src/features/statistics/page/components/WeeklyGoalsPanel.tsx`
- Create: `src/features/statistics/page/components/WeeklyGoalsPanel.stories.tsx`
- Create: `src/features/statistics/__tests__/WeeklyGoalsPanel.test.tsx`
- Create: `src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx`
- Modify: `src/features/statistics/page/useStatisticsComputedStats.ts`
- Modify: `src/features/statistics/page/statisticsPageResult.ts`
- Modify: `src/features/statistics/page/useStatisticsPageState.ts`
- Modify: `src/features/statistics/StatisticsPage.tsx`
- Modify: `src/features/statistics/locales/ja.json`
- Modify: `src/features/statistics/__tests__/StatisticsPage.initial-weekly.test.tsx`
- Modify: `src/features/statistics/__tests__/StatisticsPage.testUtils.tsx`

**Interfaces:**

- Consumes: `calculateWeeklyGoalProgress`
- Produces: `useWeeklyGoalProgress(selectedDate: Date): WeeklyGoalProgress[]`
- Produces: `WeeklyGoalsPanel({ goals }: { goals: WeeklyGoalProgress[] })`

- [ ] **Step 1: hookの失敗テストを書く**

`getRoutines` と `getMonthlyHistory` をmockし、選択日と現在時刻を集計関数へ渡して結果を返すことを確認する。hookは現在時刻をテスト注入できる形にする。

```ts
const { result } = renderHook(() =>
  useWeeklyGoalProgress(new Date("2026-08-17T12:00:00+09:00"), {
    now: () => new Date("2026-08-19T12:00:00+09:00"),
  }),
);

expect(result.current[0]).toMatchObject({
  goalId: "exercise",
  completedCount: 2,
});
```

- [ ] **Step 2: パネルの失敗テストを書く**

```tsx
it("進捗、残り回数、現在と最長ストリークを表示する", () => {
  render(
    <WeeklyGoalsPanel
      goals={[
        {
          goalId: "exercise",
          title: "運動",
          targetPerWeek: 3,
          completedCount: 2,
          remainingCount: 1,
          isAchieved: false,
          currentStreak: 4,
          longestStreak: 7,
        },
      ]}
    />,
  );

  expect(screen.getByText("2 / 3回")).toBeInTheDocument();
  expect(screen.getByText("あと1回")).toBeInTheDocument();
  expect(screen.getByText("現在 4週")).toBeInTheDocument();
  expect(screen.getByText("最長 7週")).toBeInTheDocument();
});
```

空配列の空状態、達成済みのチェック表示、`aria-valuenow/min/max` を持つprogressbarもテストする。

- [ ] **Step 3: hookと表示専用パネルを実装する**

hookはストレージ読み取りと純粋関数呼び出しだけを担当する。

```ts
export const useWeeklyGoalProgress = (
  selectedDate: Date,
  options: { now?: () => Date } = {},
): WeeklyGoalProgress[] => {
  const now = options.now ?? (() => new Date());
  return calculateWeeklyGoalProgress({
    selectedDate,
    today: now(),
    routines: getRoutines(),
    history: getMonthlyHistory(),
  });
};
```

パネルの進捗率は `Math.min(100, completedCount / targetPerWeek * 100)` とし、達成済みは緑、進行中は青で表示する。

- [ ] **Step 4: StatisticsPage stateへ目標進捗を接続する**

`useStatisticsComputedStats` で `currentDate` を `useWeeklyGoalProgress` へ渡し、`weeklyGoalProgress` をresultへ追加する。`StatisticsPage` は `viewMode === "week"` のときだけsummary cardsの後にパネルを描画する。

```tsx
{
  viewMode === "week" && <WeeklyGoalsPanel goals={weeklyGoalProgress} />;
}
```

- [ ] **Step 5: 日本語テキストをlocaleへ追加する**

```json
"weeklyGoals": {
  "title": "週間目標",
  "empty": "この週に設定された週間目標はありません",
  "completed": "達成",
  "remainingTemplate": "あと{count}回",
  "progressTemplate": "{completed} / {target}回",
  "currentStreakTemplate": "現在 {count}週",
  "longestStreakTemplate": "最長 {count}週"
}
```

- [ ] **Step 6: hook、パネル、ページ統合テストを通す**

Run: `npm test -- --runInBand src/features/statistics/__tests__/useWeeklyGoalProgress.test.tsx src/features/statistics/__tests__/WeeklyGoalsPanel.test.tsx src/features/statistics/__tests__/StatisticsPage.initial-weekly.test.tsx`

Expected: PASS。

- [ ] **Step 7: Storybookを静的ビルドして表示コードを検査する**

Run: `npm run build-storybook`

Expected: build完了。Storyは空状態、進行中、達成済みの3種類をexportする。

- [ ] **Step 8: コミットする**

```bash
git add src/features/statistics
git commit -m "feat(statistics): 週間目標の進捗を表示する"
```

---

### Task 6: 同期・JSON転送・壊れたデータの互換性

**Files:**

- Modify: `src/features/sync/__tests__/localData.test.ts`
- Modify: `src/features/sync/__tests__/sync.upload.test.ts`
- Modify: `src/features/sync/__tests__/sync.download.test.ts`
- Modify: `src/features/settings/__tests__/dataTransferGroups.test.ts`
- Modify: `src/features/settings/__tests__/transferPayloadRestore.test.ts`
- Modify: `src/features/settings/state/routineShapeValidation.ts`
- Create: `src/features/settings/__tests__/routineShapeValidation.test.ts`

**Interfaces:**

- Preserves: `SyncPayload.routines` と `SyncPayload.dailyHistory` の入れ子フィールド
- Preserves: JSON transferの `routines` と `history` グループ

- [ ] **Step 1: 同期往復の失敗防止テストを書く**

fixtureのルーティンと履歴へ週間目標を加え、collect、upload payload、download restoreが完全一致することを確認する。

```ts
const weeklyGoal = { targetPerWeek: 3, startedAt: "2026-08-17T00:00:00.000Z" };
const routine = { ...routineFixture, groupId: "exercise", weeklyGoal };
const history = {
  "2026-08-18": {
    date: "2026-08-18",
    completedRoutineIds: [routine.id],
    routineSnapshots: [
      {
        id: routine.id,
        title: routine.title,
        category: routine.category,
        startTime: routine.startTime,
        groupId: "exercise",
        weeklyGoal,
      },
    ],
  },
};
```

- [ ] **Step 2: JSON転送の往復テストを書く**

`createExportData` が週間目標付き `routines` と目標付きsnapshotの `history` を保持し、`importSelectedData` が各save関数へ同じ値を渡すことを確認する。

- [ ] **Step 3: 壊れた週間目標の扱いを検証する**

ルーティンの必須既存フィールドが正しければ、未知または壊れた `weeklyGoal` があってもインポート自体は拒否しない。集計側の `isValidWeeklyGoal` が目標だけを無視する契約にする。`routineShapeValidation` が追加フィールドを禁止する実装なら、オプショナルフィールドを許容するように変更する。

- [ ] **Step 4: 同期・転送テストを実行する**

Run: `npm test -- --runInBand src/features/sync/__tests__/localData.test.ts src/features/sync/__tests__/sync.upload.test.ts src/features/sync/__tests__/sync.download.test.ts src/features/settings/__tests__/dataTransferGroups.test.ts src/features/settings/__tests__/transferPayloadRestore.test.ts src/features/settings/__tests__/routineShapeValidation.test.ts`

Expected: PASS。production変更が不要な同期経路はテスト追加だけで完了させる。

- [ ] **Step 5: コミットする**

```bash
git add src/features/sync/__tests__ src/features/settings/__tests__ src/features/settings/state/routineShapeValidation.ts
git commit -m "test(sync): 週間目標の同期と転送を保証する"
```

---

### Task 7: E2E、機能文書、全体検証

**Files:**

- Modify: `e2e/routine-creation.spec.ts`
- Modify: `docs/04-reference/features.md`
- Modify: `README.md`

**Interfaces:**

- Verifies: 作成フォーム → ホームバッジ → 統計ページ進捗のユーザーフロー

- [ ] **Step 1: E2Eシナリオを追加する**

既存の匿名ログインと全曜日選択を使い、週間目標3回でルーティンを作成する。ホームで `週3回` を確認し、その日分を完了後、メニューから統計へ移動して `1 / 3回` と `あと2回` を確認する。

```ts
await page.getByLabel("週間目標").fill("3");
await page.getByRole("button", { name: "追加", exact: true }).click();
await expect(page.getByText("週3回")).toBeVisible();
await page.getByText(routineTitle, { exact: true }).click();
await navigateViaMenu(page, "統計");
await expect(page.getByRole("heading", { name: "週間目標" })).toBeVisible();
await expect(page.getByText("1 / 3回")).toBeVisible();
await expect(page.getByText("あと2回")).toBeVisible();
```

- [ ] **Step 2: 開発サーバーを使って対象E2Eを実行する**

Run: `npm run test:e2e -- e2e/routine-creation.spec.ts`

Expected: PASS。

- [ ] **Step 3: READMEと機能一覧を更新する**

READMEのルーティン機能へ「週1〜7回の週間目標、週次進捗、現在・最長ストリーク」を追記する。`docs/04-reference/features.md` へ設定項目、統計表示、目標変更時にストリークが再開始されるルールを追記する。

- [ ] **Step 4: 変更全体の対象テストを実行する**

Run: `npm test -- --runInBand src/features/routine src/features/statistics src/features/sync src/features/settings`

Expected: PASS。

- [ ] **Step 5: 完全検証を実行する**

Run: `npm run verify`

Expected: Tailwind shorthand scan、ESLint、TypeScript、Jest、Next.js production buildがすべて成功する。

- [ ] **Step 6: 差分と完了条件を監査する**

Run: `git diff --check && git status --short && git diff --stat HEAD~6`

以下を実ファイルとテスト結果から1件ずつ確認する。

- 週1〜7回の設定・変更・解除
- グループ伝播
- ホームバッジ
- 週次進捗・残り回数
- 現在・最長ストリーク
- 現在週未達の猶予
- 目標変更時の再開始
- 削除済み・旧・壊れたデータ
- 同期・snapshot・JSON転送
- E2Eと `npm run verify`

- [ ] **Step 7: 最終コミットを作成する**

```bash
git add e2e/routine-creation.spec.ts docs/04-reference/features.md README.md
git commit -m "docs: 週間目標とストリークを案内する"
```
