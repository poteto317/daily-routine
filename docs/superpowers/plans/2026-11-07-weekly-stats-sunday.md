# 統計の週次表示が日曜日に翌週を表示する不具合の修正 実装プラン

- **対象 Issue**: [#214 統計画面の週次表示が、日曜日に開くと翌週（月曜〜日曜）を表示し、週間目標の週とずれる](https://github.com/poteto317/daily-routine/issues/214)
- **設計書**: `docs/superpowers/specs/2026-11-07-weekly-stats-sunday-design.md`
- **気をつける知見**: L-181（テストの日時にオフセットを付ける）、L-182（境界・全曜日のテスト）、L-695（`+09:00` の理由）、L-129（JST に揃える）、L-675（Jest の可変長オプションの後ろにテストのパスを書かない）

## ワークツリーでの実行の注意

- `jest.config.ts` が `/\.worktrees/` を除外しているので、ワークツリー内の Jest には `--testPathIgnorePatterns "/node_modules/"` を付ける。**テストのパスは必ずオプションより前に書く**（L-675。後ろに書くとパスが除外パターンとして取り込まれ、テストが走らない）。
- 全体の実行: `npx jest --testPathIgnorePatterns "/node_modules/" --testPathIgnorePatterns "/e2e/" --testPathIgnorePatterns "/firebase-functions/lib/" --maxWorkers=4`
- 型チェックで `tsconfig.tsbuildinfo` の EPERM が出る場合は `npx tsc --noEmit --incremental false -p tsconfig.json`（と `-p tsconfig.test.json`）にする。
- `npm run build` は Google Fonts を取得するため、サンドボックスの外（BypassSandbox）で実行する。

---

## Task 1: テストを先に書く（Red）

**Files:**

- Modify: `src/features/statistics/__tests__/statistics.weekly.test.ts`
- Modify: `src/features/statistics/__tests__/dailyAggregation.test.ts`

- [ ] **Step 1: `statistics.weekly.test.ts` に、日曜日・境界・連続・週間目標との一致のテストを足す**

import を次にする（既存の 2 行の import を置き換える）。

```ts
import { createHistory, mockGetMonthlyHistory } from "./statisticsTestUtils";
import { calculateWeeklyStats } from "../statistics";
import {
  addDaysToDateKey,
  getWeekStartKey,
} from "../statistics/weeklyGoalDateKeys";

// 端末のタイムゾーンに依らず、JST のその時刻を指す（`+09:00` を付ける。L-181、L-695）
const jst = (dateTime: string) => new Date(`${dateTime}+09:00`);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
```

`describe` の末尾（最後の `it` の後）に次を足す。

```ts
describe("週は JST の月曜〜日曜（日曜日はその日を含む週）", () => {
  const WEEK_DATES = [
    "2026-11-09",
    "2026-11-10",
    "2026-11-11",
    "2026-11-12",
    "2026-11-13",
    "2026-11-14",
    "2026-11-15",
  ];

  it.each([
    ["月", "2026-11-09T12:00:00"],
    ["火", "2026-11-10T12:00:00"],
    ["水", "2026-11-11T12:00:00"],
    ["木", "2026-11-12T12:00:00"],
    ["金", "2026-11-13T12:00:00"],
    ["土", "2026-11-14T12:00:00"],
    ["日", "2026-11-15T12:00:00"],
  ])("%s曜日を開くと、その日を含む月曜〜日曜の週になる", (_label, at) => {
    const result = calculateWeeklyStats(jst(at));

    expect(result.weekStart).toBe("2026-11-09");
    expect(result.weekEnd).toBe("2026-11-15");
    expect(result.days.map((day) => day.date)).toEqual(WEEK_DATES);
  });

  it("日曜日に開いても、翌週（11/16〜11/22）にならない", () => {
    const result = calculateWeeklyStats(jst("2026-11-15T12:00:00"));

    expect(result.weekStart).not.toBe("2026-11-16");
    expect(result.weekEnd).not.toBe("2026-11-22");
  });

  it("JST の日付が変わる前後で、日曜は前の週・月曜は次の週になる", () => {
    expect(calculateWeeklyStats(jst("2026-11-15T23:30:00")).weekStart).toBe(
      "2026-11-09",
    );
    expect(calculateWeeklyStats(jst("2026-11-16T00:30:00")).weekStart).toBe(
      "2026-11-16",
    );
    expect(calculateWeeklyStats(jst("2026-11-08T23:59:59")).weekStart).toBe(
      "2026-11-02",
    );
  });

  it("日曜日から7日ずつ前後へ動いても、週は重ならず飛ばずに並ぶ", () => {
    const sunday = jst("2026-11-15T12:00:00").getTime();
    const weeks = [-3, -2, -1, 0, 1, 2, 3].map((step) =>
      calculateWeeklyStats(new Date(sunday + step * WEEK_MS)),
    );

    expect(weeks[3]?.weekStart).toBe("2026-11-09");
    weeks.slice(1).forEach((week, index) => {
      const previous = weeks[index]!;
      expect(addDaysToDateKey(previous.weekEnd, 1)).toBe(week.weekStart);
    });
  });

  it("週の開始日は、週間目標の週（getWeekStartKey）と一致する", () => {
    const keys = Array.from({ length: 14 }, (_, offset) =>
      addDaysToDateKey("2026-11-09", offset),
    );
    const times = ["T00:30:00", "T12:00:00", "T23:30:00"];

    keys.forEach((key) => {
      times.forEach((time) => {
        const date = jst(`${key}${time}`);
        expect(calculateWeeklyStats(date).weekStart).toBe(
          getWeekStartKey(date),
        );
      });
    });
  });

  it("日曜日の履歴は、その週の最後の日に集計され、翌週には集計されない", () => {
    mockGetMonthlyHistory.mockReturnValue({
      "2026-11-15": createHistory({
        date: "2026-11-15",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
        ],
      }),
    });

    const sundayWeek = calculateWeeklyStats(jst("2026-11-15T12:00:00"));
    const nextWeek = calculateWeeklyStats(jst("2026-11-16T12:00:00"));

    expect(sundayWeek.days[6]?.date).toBe("2026-11-15");
    expect(sundayWeek.days[6]?.completedCount).toBe(1);
    expect(sundayWeek.totalCompleted).toBe(1);
    expect(nextWeek.totalCompleted).toBe(0);
  });
});
```

- [ ] **Step 2: `dailyAggregation.test.ts` に `buildDailyStatsForDateKeys` のテストを足す**

import に `buildDailyStatsForDateKeys` を足す（`buildDailyStatsForDates` の前、アルファベット順）。

```ts
import {
  buildDailyStatsForDateKeys,
  buildDailyStatsForDates,
  buildDateRange,
  summarizeDailyStats,
} from "../statistics/dailyAggregation";
```

「日付配列を日別統計に変換する」の `it` の直後に次を足す。

```ts
it("日付キーの配列を、キーの順のまま日別統計に変換する", () => {
  const historyMap = {
    "2024-01-10": createHistory({ date: "2024-01-10" }),
  };

  const result = buildDailyStatsForDateKeys(
    ["2024-01-11", "2024-01-10"],
    historyMap,
  );

  expect(result.map((day) => day.date)).toEqual(["2024-01-11", "2024-01-10"]);
  expect(mockCalculateDailyStats).toHaveBeenNthCalledWith(
    1,
    "2024-01-11",
    null,
  );
  expect(mockCalculateDailyStats).toHaveBeenNthCalledWith(
    2,
    "2024-01-10",
    historyMap["2024-01-10"],
  );
});
```

- [ ] **Step 3: Red を確かめる**

Run:

```
npx jest src/features/statistics/__tests__/statistics.weekly.test.ts src/features/statistics/__tests__/dailyAggregation.test.ts --testPathIgnorePatterns "/node_modules/"
```

Expected: `dailyAggregation` は `buildDailyStatsForDateKeys` が未定義で落ちる（TypeScript のエラー）。`statistics.weekly` は日曜日のケース（`日曜日を開くと…`・`日曜日に開いても…`・`日曜日の履歴…`・`週は重ならず…`・`JST の日付が変わる前後…`）が落ちる。月〜土のケースは通る。

---

## Task 2: 実装（Green）

**Files:**

- Modify: `src/features/statistics/statistics/dailyAggregation.ts`
- Modify: `src/features/statistics/statistics/weekly.ts`
- Modify: `src/features/statistics/statistics/helpers.ts`

- [ ] **Step 1: `dailyAggregation.ts` に `buildDailyStatsForDateKeys` を足す**

`buildDailyStatsForDates`（25〜33 行）を次に置き換える。

```ts
export const buildDailyStatsForDateKeys = (
  dateKeys: string[],
  historyMap: HistoryMap,
): DailyStats[] => {
  return dateKeys.map((dateKey) =>
    calculateDailyStats(dateKey, historyMap[dateKey] ?? null),
  );
};

export const buildDailyStatsForDates = (
  dates: Date[],
  historyMap: HistoryMap,
): DailyStats[] =>
  buildDailyStatsForDateKeys(dates.map(formatDate), historyMap);
```

（`dates.map(formatDate)` は `formatDate(date, index, array)` で呼ばれるが、`formatDate` は第 1 引数だけを使う `(date: Date) => string` なので問題ない。型検査が通ることを Step 4 で確かめる。）

- [ ] **Step 2: `weekly.ts` を、JST の日付キーの上で週を求める形にする**

ファイル全体を次にする。

```ts
import { getMonthlyHistory } from "@/features/routine/storage";
import {
  buildDailyStatsForDateKeys,
  summarizeDailyStats,
} from "./dailyAggregation";
import { calculateRate } from "./helpers";
import { type DailyStats, type WeeklyStats } from "./types";
import { addDaysToDateKey, getWeekStartKey } from "./weeklyGoalDateKeys";

const DAYS_IN_WEEK = 7;

export const calculateWeeklyStats = (startDate: Date): WeeklyStats => {
  // 週間目標と同じ JST の日付キー（月曜始まり）の上で週を求める。端末のタイムゾーンや
  // 日曜日の getDay() の違い（日曜日が 0）で、週がずれたり翌週になったりしないようにする
  const weekStartKey = getWeekStartKey(startDate);
  const weekDateKeys = Array.from({ length: DAYS_IN_WEEK }, (_, offset) =>
    addDaysToDateKey(weekStartKey, offset),
  );
  const allHistory = getMonthlyHistory();
  const days: DailyStats[] = buildDailyStatsForDateKeys(
    weekDateKeys,
    allHistory,
  );
  const totals = summarizeDailyStats(days);

  return {
    weekStart: weekStartKey,
    weekEnd: weekDateKeys[DAYS_IN_WEEK - 1]!,
    days,
    averageAchievementRate: calculateRate(
      totals.totalCompleted,
      totals.totalRoutines,
    ),
    totalCompleted: totals.totalCompleted,
    totalRoutines: totals.totalRoutines,
  };
};
```

- [ ] **Step 3: `helpers.ts` から使われなくなった `getWeekStart` と `getWeekEnd` を削除する**

11〜21 行の 2 つの関数を削除し、`calculateRate` の後の空行を 1 行にする（`formatDate`・`buildDateString`・`calculateRate` は残す）。`git grep -n -w -E "getWeekStart|getWeekEnd" -- src` で、`src` に参照が 0 件であることを確かめる。

- [ ] **Step 4: Green と型・lint を確かめる**

Run:

```
npx jest src/features/statistics --testPathIgnorePatterns "/node_modules/"
npx tsc --noEmit -p tsconfig.json
npx tsc --noEmit -p tsconfig.test.json
npm run lint
```

Expected: statistics の全テスト通過、型エラーなし、lint 警告 0。

- [ ] **Step 5: 変異を当てて、テストが落ちることを確かめる（L-182）**

次の変異を 1 つずつ `weekly.ts` / `weeklyGoalDateKeys.ts` に当て、`statistics.weekly.test.ts` が落ちることを確かめ、必ず元に戻す。

1. `weeklyGoalDateKeys.ts` の `(day + 6) % 7` を `(day + 1) % 7`（日曜日が翌週）→ 日曜日・連続・一致のテストが落ちる。
2. `weekly.ts` の `DAYS_IN_WEEK` を `6` にする → `days` の件数・日付と `weekEnd` のテストが落ちる。
3. `weekly.ts` の `weekEnd` を `weekDateKeys[DAYS_IN_WEEK - 2]!` にする → `weekEnd` のテストが落ちる。

結果（どの変異で何件落ちたか）は、コミットの説明の材料としてメモに残す。

- [ ] **Step 6: タイムゾーンを変えて通ることを確かめる（L-695）**

Run:

```
TZ=UTC npx jest src/features/statistics/__tests__/statistics.weekly.test.ts src/features/statistics/__tests__/dailyAggregation.test.ts src/features/statistics/__tests__/weeklyGoalDateKeys.test.ts --testPathIgnorePatterns "/node_modules/"
TZ=America/Los_Angeles npx jest src/features/statistics/__tests__/statistics.weekly.test.ts src/features/statistics/__tests__/dailyAggregation.test.ts src/features/statistics/__tests__/weeklyGoalDateKeys.test.ts --testPathIgnorePatterns "/node_modules/"
```

Expected: 両方とも、対象の全テストが通る（週の求め方が端末のタイムゾーンに依らないことの確認）。

---

## Task 3: 文書と確認表を合わせる

**Files:**

- Modify: `docs/04-reference/features.md`
- Modify: `docs/03-testing/test-matrix.md`
- Modify: `src/features/test-matrix/initialData.ts`
- Modify: `src/features/test-matrix/detailed-test-cases/group-10-13.ts`

- [ ] **Step 1: `docs/04-reference/features.md` の週次レポートに、表示期間の説明を足す**

「週間目標は月曜日から日曜日までを1週間として集計し…」の段落（156 行付近）の直前に、次の段落を足す。

```markdown
週次の表示期間（ラベル・サマリー・グラフ・日別の一覧）も、週間目標と同じく月曜日から日曜日（日本時間）までを1週間とします。日曜日に開いた場合や、選択日が日曜日の場合は、その日を含む週（その日の6日前の月曜日から、その日まで）を表示します。
```

- [ ] **Step 2: 確認表に `11-9` を足す（md・`initialData.ts`・詳細の 3 か所。ID は既存を変えない）**

`docs/03-testing/test-matrix.md` の 11 の表の最後（`11-8` の行の直後）に足す。

```markdown
| 11-9 | 日曜日に開いた週次表示の期間 | 🔶 | ⬜ | ⬜ | 日曜日に「📅 週次」を開くと、その日を含む週（月曜〜日曜）を表示し、「週間目標」の週と同じになる |
```

`src/features/test-matrix/initialData.ts` の `11-8`（857〜862 行）の直後に足す。

```ts
      {
        id: "11-9",
        label: "日曜日に開いた週次表示の期間",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

`src/features/test-matrix/detailed-test-cases/group-10-13.ts` の `"11-8"` の配列の後（313 行の `],` の直後、`"12-1"` の前）に足す。

```ts
  "11-9": [
    {
      id: "11-9-1",
      scenario:
        "端末のタイムゾーンが日本（JST）であることを確かめる。端末の日付を日曜日にする（例: 2026年11月15日（日））。統計画面を開き、「📅 週次」にする。期間のラベル、サマリー、グラフの日付と、「週間目標」のパネルの「現在 N週」の数え方（週間目標を設定してあるルーティンがある場合）を見る。続けて「前の期間へ」を押し、さらに「次の期間へ」を2回押す",
      expected:
        "期間のラベルが「2026-11-09 〜 2026-11-15」（日曜日を含む月曜〜日曜の週。翌週の11月16日〜22日にならない）になり、グラフの日付も11月9日〜15日になる。「週間目標」は同じ週（11月9日〜15日）を基準にする。「前の期間へ」で11月2日〜8日、「次の期間へ」を2回押すと、11月9日〜15日、11月16日〜22日と、1週間ずつ重ならず飛ばずに移る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
```

- [ ] **Step 3: 確認 `11-8-1` の「現状の挙動」の記述を、直した後の挙動に書き換える**

`group-10-13.ts` の `11-8-1` の `scenario` の中の次の 1 文を置き換える。

置き換え前:

```
日曜に開くと、期間の表示（ラベル・グラフ）が翌週の月曜〜日曜になるのは現状の挙動で、この確認の対象外（「週間目標」は日曜を含む週を基準にする）。
```

置き換え後:

```
日曜に開くと、期間の表示（ラベル・グラフ）も、「週間目標」と同じく日曜を含む週（例: 11月9日〜15日）になる（この確認の対象は「現在 N週」と「最長 M週」。期間の表示そのものは 11-9 で確かめる）。
```

- [ ] **Step 4: 整形し、確認表の検査を通す**

Run:

```
npm run format
npx jest src/features/test-matrix --testPathIgnorePatterns "/node_modules/"
git diff --stat
```

Expected: test-matrix の全テストが通る（ID の重複・接頭辞の検査を含む）。`git diff --stat` で、変更が今回の対象ファイル（`docs/03-testing/test-matrix.md` は 11 の表の桁揃えで他の行の空白が変わるのは可）だけであることを確かめる。

---

## Task 4: 全体の検証

- [ ] **Step 1: 次を順に実行し、すべて通すこと**

```
npm run format:check
npm run lint
npm run typecheck
npm run typecheck:functions
npx jest --testPathIgnorePatterns "/node_modules/" --testPathIgnorePatterns "/e2e/" --testPathIgnorePatterns "/firebase-functions/lib/" --maxWorkers=4
npm run build
```

`npm run typecheck` が EPERM で失敗する場合は、上の「ワークツリーでの実行の注意」の代替を使う。`npm run build` は BypassSandbox で実行する。

- [ ] **Step 2: 要件の取りこぼしを、設計書の要件 1〜6 と見比べて確かめる**（要件 1・2・3・4: Task 1・2、要件 5: Task 2 Step 3、要件 6: Task 3）

**コミットはしない。**
