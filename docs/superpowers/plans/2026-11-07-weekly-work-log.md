# 週ごとの業務日誌 実装プラン（Issue #205）

> 注: このプランは実装開始時の記録。リファクタリングとレビューで構成と挙動が変わったため、最終形は設計書と実装を正とする。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ジャーナル画面に、月曜開始の週ごとに 1 件の業務日誌（本文のみ）を書き・編集・削除・一覧できる節を足し、同期と JSON のエクスポート・インポートに含める。

**Architecture:** `src/features/journal/weekly/` に、週の計算（純粋な関数）・保存層・状態フック・表示部品を置く。保存層の関数は既存の `src/features/journal/storage.ts` から re-export し、同期と記録グループはそこから読む（同期のテストの `jest.mock("@/features/journal/storage")` の自動モックがそのまま新しい関数も覆う）。

**Tech Stack:** Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 / Jest + React Testing Library / Storybook

**設計書:** `docs/superpowers/specs/2026-11-07-weekly-work-log-design.md`

**気をつける知見:** L-001（保存の成否を返して呼び出し元で分岐）、L-002 / L-459（同期で欠損はローカルを保つ）、L-012（入力中に週を切り替えない）、L-039（書き換えの後に読み直す）、L-060（props を必須にする）、L-456（更新で id・createdAt を据え置く）、L-461（既定値を共有しない）、L-470（壊れたストレージの値を検査する）、L-474（Enter で送信しない）、L-538（今日を描画のたびに取り直す）。

## Global Constraints

- コミットはしない（`/feature` の段階。各タスクの最後の「Commit」の手順は無い）。
- 週の始まりは月曜。今日と今週は JST。フックの本体では `getTodayString()` を直接呼ばず、`useJstTodayKey()`（`@/hooks/useToday`）で取る（`next.config.ts` の `reactCompiler: true` で最初の描画の値に固定されるのを防ぐ。`docs/02-development/coding-standards.md`「React Compiler と今日・現在時刻」）。
- 1 週 1 件。入力は本文のみ。
- LocalStorage のキーは `weekly-log-history`。同期・エクスポートのフィールド名は `weeklyLogHistory`。
- 文言は `src/features/journal/locales/ja.json` の `weeklyLog` 節に置き、コードに日本語の文言を直書きしない（週の見出しの「年・月・日」と曜日の整形は除く）。
- AI エージェント API（`firebase-functions`）・`firestore.rules`・`userScope.ts` は変えない。
- 検証コマンド: `npm run verify:fast`（tailwind:scan・lint・typecheck・typecheck:functions・jest）。単体のテストは `npx cross-env TZ=Asia/Tokyo jest <path>`。

## ファイル構成

- Create `src/types/routine/weeklyLog.ts` — 型。
- Modify `src/types/routine/index.ts` — 型の export。
- Create `src/features/journal/weekly/weeklyLogWeek.ts` — 週の計算と整形（純粋）。
- Create `src/features/journal/weekly/weeklyLogStorage.ts` — 保存層。
- Modify `src/features/journal/storage.ts` — 保存層の re-export。
- Modify `src/features/sync/sync/types.ts`・`syncDataNormalizer.ts`・`localData.ts`・`localDataHelpers.ts` — 同期。
- Modify `src/features/settings/state/transferGroups/recordGroup.ts`・`src/features/settings/state/dataTransferGroups.ts` — エクスポート・インポート。
- Create `src/features/journal/weekly/useWeeklyLogState.ts` — 状態フック。
- Create `src/features/journal/weekly/components/WeeklyLogWeekNavigator.tsx`・`WeeklyLogEditor.tsx`・`WeeklyLogList.tsx`・`WeeklyLogCard.tsx` と `WeeklyLogCard.stories.tsx` — 表示。
- Modify `src/features/journal/locales/ja.json` — 文言。
- Modify `src/features/journal/JournalPage.tsx` — 組み込み。
- Modify `docs/04-reference/features.md`・`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts` — 説明と確認項目。

---

### Task 1: 型と週の計算

**Files:**

- Create: `src/types/routine/weeklyLog.ts`
- Modify: `src/types/routine/index.ts`（`export type { JournalEntry, JournalHistory } from "./journal";` の次の行）
- Create: `src/features/journal/weekly/weeklyLogWeek.ts`
- Test: `src/features/journal/weekly/__tests__/weeklyLogWeek.test.ts`

**Interfaces:**

- Produces:
  - `type WeeklyLogEntry = { id: string; weekStart: string; content: string; createdAt: string; updatedAt: string }`
  - `type WeeklyLogHistory = { [weekStart: string]: WeeklyLogEntry }`
  - `getWeeklyLogWeekStart(dateKey: string): string`
  - `shiftWeeklyLogWeek(weekStart: string, weeks: number): string`
  - `formatWeeklyLogWeekDate(weekStart: string): string`（`2026年11月2日（月）`）
  - `formatWeeklyLogWeekRange(weekStart: string): string`（`11月2日〜11月8日`）

- [ ] **Step 1: 型を書く**

```ts
// src/types/routine/weeklyLog.ts
/** 週ごとの業務日誌（1 週 1 件） */
export interface WeeklyLogEntry {
  id: string;
  /** 週の開始日（月曜。JST の YYYY-MM-DD） */
  weekStart: string;
  content: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** 週の開始日（月曜。YYYY-MM-DD）をキーにした、1 週 1 件の業務日誌 */
export interface WeeklyLogHistory {
  [weekStart: string]: WeeklyLogEntry;
}
```

`src/types/routine/index.ts` に追加:

```ts
export type { WeeklyLogEntry, WeeklyLogHistory } from "./weeklyLog";
```

- [ ] **Step 2: 失敗するテストを書く**

```ts
// src/features/journal/weekly/__tests__/weeklyLogWeek.test.ts
import {
  formatWeeklyLogWeekDate,
  formatWeeklyLogWeekRange,
  getWeeklyLogWeekStart,
  shiftWeeklyLogWeek,
} from "../weeklyLogWeek";

describe("getWeeklyLogWeekStart", () => {
  it.each([
    ["2026-11-02", "2026-11-02"], // 月
    ["2026-11-03", "2026-11-02"], // 火
    ["2026-11-06", "2026-11-02"], // 金
    ["2026-11-07", "2026-11-02"], // 土
    ["2026-11-08", "2026-11-02"], // 日は前の月曜
  ])("%s を含む週の月曜は %s", (dateKey, expected) => {
    expect(getWeeklyLogWeekStart(dateKey)).toBe(expected);
  });

  it("月をまたぐ週", () => {
    expect(getWeeklyLogWeekStart("2026-12-03")).toBe("2026-11-30");
  });

  it("年をまたぐ週", () => {
    expect(getWeeklyLogWeekStart("2027-01-03")).toBe("2026-12-28");
  });
});

describe("shiftWeeklyLogWeek", () => {
  it("1 週前・1 週後へずらす", () => {
    expect(shiftWeeklyLogWeek("2026-11-02", -1)).toBe("2026-10-26");
    expect(shiftWeeklyLogWeek("2026-11-02", 1)).toBe("2026-11-09");
  });

  it("年をまたいでずらす", () => {
    expect(shiftWeeklyLogWeek("2026-12-28", 1)).toBe("2027-01-04");
  });
});

describe("formatWeeklyLogWeekDate", () => {
  it("年月日と曜日を出す", () => {
    expect(formatWeeklyLogWeekDate("2026-11-02")).toBe("2026年11月2日（月）");
  });
});

describe("formatWeeklyLogWeekRange", () => {
  it("月曜から日曜までの期間を出す", () => {
    expect(formatWeeklyLogWeekRange("2026-11-02")).toBe("11月2日〜11月8日");
  });

  it("年をまたぐ週も月日だけで出す", () => {
    expect(formatWeeklyLogWeekRange("2026-12-28")).toBe("12月28日〜1月3日");
  });
});
```

- [ ] **Step 3: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/weeklyLogWeek.test.ts`
Expected: FAIL（`Cannot find module '../weeklyLogWeek'`）

- [ ] **Step 4: 実装する**

```ts
// src/features/journal/weekly/weeklyLogWeek.ts
/**
 * 週ごとの業務日誌の週（月曜〜日曜）の計算と整形。
 * 日付の文字列（YYYY-MM-DD）を UTC の 0 時として扱い、端末のタイムゾーンに左右されない。
 * 計算は統計の weeklyGoalDateKeys.ts と同じ（機能をまたいだ依存を作らないため journal 側に置く）。
 */
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const toUtcDate = (dateKey: string): Date =>
  new Date(`${dateKey}T00:00:00.000Z`);

const addDays = (dateKey: string, days: number): string =>
  new Date(toUtcDate(dateKey).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);

const formatMonthDay = (date: Date): string =>
  `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;

/** dateKey（YYYY-MM-DD）を含む週の月曜 */
export const getWeeklyLogWeekStart = (dateKey: string): string => {
  const day = toUtcDate(dateKey).getUTCDay();
  return addDays(dateKey, -((day + 6) % 7));
};

/** 週の開始日を weeks 週ずらす（負なら前の週） */
export const shiftWeeklyLogWeek = (weekStart: string, weeks: number): string =>
  addDays(weekStart, weeks * 7);

/** 例: 2026年11月2日（月） */
export const formatWeeklyLogWeekDate = (weekStart: string): string => {
  const date = toUtcDate(weekStart);
  return `${date.getUTCFullYear()}年${formatMonthDay(date)}（${WEEKDAY_LABELS[date.getUTCDay()]}）`;
};

/** 例: 11月2日〜11月8日（年は見出しにあるので出さない） */
export const formatWeeklyLogWeekRange = (weekStart: string): string =>
  `${formatMonthDay(toUtcDate(weekStart))}〜${formatMonthDay(toUtcDate(addDays(weekStart, 6)))}`;
```

- [ ] **Step 5: テストが通るのを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/weeklyLogWeek.test.ts`、続けて `npx cross-env TZ=America/Los_Angeles jest src/features/journal/weekly/__tests__/weeklyLogWeek.test.ts`
Expected: どちらも PASS（タイムゾーンに左右されない）

---

### Task 2: 保存層

**Files:**

- Create: `src/features/journal/weekly/weeklyLogStorage.ts`
- Modify: `src/features/journal/storage.ts`（末尾に re-export）
- Test: `src/features/journal/weekly/__tests__/weeklyLogStorage.test.ts`

**Interfaces:**

- Consumes: Task 1 の型。`getStorageItem<T>(key, defaultValue): T`・`setStorageItem(key, value): boolean`・`generateId(prefix): string`（`@/lib/storage/core`）
- Produces（`@/features/journal/storage` からも import できる）:
  - `getWeeklyLogHistory(): WeeklyLogHistory`
  - `saveWeeklyLogHistory(history: WeeklyLogHistory): boolean`
  - `saveWeeklyLog(weekStart: string, content: string, now?: Date): boolean`
  - `deleteWeeklyLog(weekStart: string): boolean`
  - `listWeeklyLogsByLatest(history: WeeklyLogHistory): WeeklyLogEntry[]`

- [ ] **Step 1: 失敗するテストを書く**

```ts
// src/features/journal/weekly/__tests__/weeklyLogStorage.test.ts
import * as coreStorage from "@/lib/storage/core";
import {
  deleteWeeklyLog,
  getWeeklyLogHistory,
  listWeeklyLogsByLatest,
  saveWeeklyLog,
  saveWeeklyLogHistory,
} from "../weeklyLogStorage";
import type { WeeklyLogEntry } from "@/types/routine";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

const entry = (
  weekStart: string,
  overrides: Partial<WeeklyLogEntry> = {},
): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content: `${weekStart} の内容`,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
  ...overrides,
});

describe("weeklyLogStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
    mockSetStorageItem.mockReturnValue(true);
    mockGenerateId.mockReturnValue("weekly-log-new");
  });

  describe("getWeeklyLogHistory", () => {
    it("weekly-log-history を読む", () => {
      const history = { "2026-11-02": entry("2026-11-02") };
      mockGetStorageItem.mockReturnValue(history as never);

      expect(getWeeklyLogHistory()).toEqual(history);
      expect(mockGetStorageItem).toHaveBeenCalledWith("weekly-log-history", {});
    });

    it.each([null, [], "text", 1])(
      "オブジェクトでない値 %p は空にする",
      (value) => {
        mockGetStorageItem.mockReturnValue(value as never);
        expect(getWeeklyLogHistory()).toEqual({});
      },
    );

    it("フィールドが欠けた値と形の違うキーを捨てる", () => {
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": { id: "x", content: 1 },
        "2026-10-19": null,
        "not-a-date": entry("not-a-date"),
      } as never);

      expect(getWeeklyLogHistory()).toEqual({
        "2026-11-02": entry("2026-11-02"),
      });
    });

    it("weekStart はキーで上書きする（置き場所を正とする）", () => {
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-10-26"),
      } as never);

      expect(getWeeklyLogHistory()["2026-11-02"].weekStart).toBe("2026-11-02");
    });

    it("毎回新しいオブジェクトを返す", () => {
      expect(getWeeklyLogHistory()).not.toBe(getWeeklyLogHistory());
    });
  });

  describe("saveWeeklyLogHistory", () => {
    it("書き込みの成否を返す", () => {
      mockSetStorageItem.mockReturnValue(false);
      expect(saveWeeklyLogHistory({})).toBe(false);
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {});
    });
  });

  describe("saveWeeklyLog", () => {
    const now = new Date("2026-11-07T03:00:00.000Z");

    it("その週の日誌が無ければ新しく作る", () => {
      expect(saveWeeklyLog("2026-11-02", "本文", now)).toBe(true);

      expect(mockGenerateId).toHaveBeenCalledWith("weekly-log");
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-11-02": {
          id: "weekly-log-new",
          weekStart: "2026-11-02",
          content: "本文",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      });
    });

    it("有れば本文と updatedAt だけを変え、id と createdAt は据え置く", () => {
      const other = entry("2026-10-26");
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": other,
      } as never);

      saveWeeklyLog("2026-11-02", "新しい本文", now);

      expect(mockGenerateId).not.toHaveBeenCalled();
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-11-02": {
          ...entry("2026-11-02"),
          content: "新しい本文",
          updatedAt: now.toISOString(),
        },
        "2026-10-26": other,
      });
    });

    it("書き込みに失敗したら false を返す", () => {
      mockSetStorageItem.mockReturnValue(false);
      expect(saveWeeklyLog("2026-11-02", "本文", now)).toBe(false);
    });
  });

  describe("deleteWeeklyLog", () => {
    it("その週を除いて保存する", () => {
      const other = entry("2026-10-26");
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": other,
      } as never);

      expect(deleteWeeklyLog("2026-11-02")).toBe(true);
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-10-26": other,
      });
    });

    it("その週が無ければ書き込まずに true を返す", () => {
      expect(deleteWeeklyLog("2026-11-02")).toBe(true);
      expect(mockSetStorageItem).not.toHaveBeenCalled();
    });

    it("書き込みに失敗したら false を返す", () => {
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
      } as never);
      mockSetStorageItem.mockReturnValue(false);
      expect(deleteWeeklyLog("2026-11-02")).toBe(false);
    });
  });

  describe("listWeeklyLogsByLatest", () => {
    it("週の開始日の降順に並べる", () => {
      const history = {
        "2026-10-19": entry("2026-10-19"),
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": entry("2026-10-26"),
      };

      expect(
        listWeeklyLogsByLatest(history).map((item) => item.weekStart),
      ).toEqual(["2026-11-02", "2026-10-26", "2026-10-19"]);
    });
  });
});
```

- [ ] **Step 2: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/weeklyLogStorage.test.ts`
Expected: FAIL（モジュールが無い）

- [ ] **Step 3: 実装する**

```ts
// src/features/journal/weekly/weeklyLogStorage.ts
import { type WeeklyLogEntry, type WeeklyLogHistory } from "@/types/routine";
import { generateId, getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_WEEKLY_LOG = "weekly-log-history";
const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 壊れた値は null。weekStart は置き場所（キー）を正とする */
const toWeeklyLogEntry = (
  weekStart: string,
  value: unknown,
): WeeklyLogEntry | null => {
  if (!isRecord(value)) return null;
  const { id, content, createdAt, updatedAt } = value;
  if (
    typeof id !== "string" ||
    typeof content !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }
  return { id, weekStart, content, createdAt, updatedAt };
};

/**
 * 業務日誌の履歴を読む。オブジェクトでない値・形の違うキー・フィールドが欠けた値は捨てる。
 * 毎回新しいオブジェクトを返す
 */
export const getWeeklyLogHistory = (): WeeklyLogHistory => {
  const raw = getStorageItem<unknown>(STORAGE_KEY_WEEKLY_LOG, {});
  if (!isRecord(raw)) return {};

  const history: WeeklyLogHistory = {};
  for (const [weekStart, value] of Object.entries(raw)) {
    if (!WEEK_KEY_PATTERN.test(weekStart)) continue;
    const entry = toWeeklyLogEntry(weekStart, value);
    if (entry) history[weekStart] = entry;
  }
  return history;
};

/** 書き込みの成否を返す */
export const saveWeeklyLogHistory = (history: WeeklyLogHistory): boolean =>
  setStorageItem(STORAGE_KEY_WEEKLY_LOG, history);

/**
 * その週の日誌を保存する（1 週 1 件）。既にあれば本文と updatedAt だけを変え、
 * id と createdAt は据え置く。書き込みの成否を返す
 */
export const saveWeeklyLog = (
  weekStart: string,
  content: string,
  now: Date = new Date(),
): boolean => {
  const history = getWeeklyLogHistory();
  const timestamp = now.toISOString();
  const existing = history[weekStart];

  history[weekStart] = existing
    ? { ...existing, content, updatedAt: timestamp }
    : {
        id: generateId("weekly-log"),
        weekStart,
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

  return saveWeeklyLogHistory(history);
};

/** その週の日誌を消す。無ければ書き込まずに true。書き込みの成否を返す */
export const deleteWeeklyLog = (weekStart: string): boolean => {
  const history = getWeeklyLogHistory();
  if (!(weekStart in history)) return true;

  delete history[weekStart];
  return saveWeeklyLogHistory(history);
};

/** 週の開始日の降順の一覧（ストレージは読まない） */
export const listWeeklyLogsByLatest = (
  history: WeeklyLogHistory,
): WeeklyLogEntry[] =>
  Object.values(history).sort((left, right) =>
    right.weekStart.localeCompare(left.weekStart),
  );
```

`src/features/journal/storage.ts` の末尾に追加:

```ts
export {
  getWeeklyLogHistory,
  saveWeeklyLogHistory,
  saveWeeklyLog,
  deleteWeeklyLog,
  listWeeklyLogsByLatest,
} from "./weekly/weeklyLogStorage";
```

- [ ] **Step 4: テストが通るのを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly src/features/journal/__tests__/storage.test.ts`
Expected: PASS

---

### Task 3: 同期とエクスポート・インポート

**Files:**

- Modify: `src/features/sync/sync/types.ts`・`src/features/sync/sync/syncDataNormalizer.ts`・`src/features/sync/sync/localData.ts`・`src/features/sync/sync/localDataHelpers.ts`
- Modify: `src/features/settings/state/transferGroups/recordGroup.ts`・`src/features/settings/state/dataTransferGroups.ts`
- Modify（型エラーに従う）: `src/features/sync/__tests__/syncStorage.test.utils.ts`・`src/features/sync/__tests__/sync.test.fixtures.ts`・`src/features/sync/__tests__/syncDataNormalizer.test.ts`・`src/features/sync/__tests__/localData.test.ts`・`src/features/sync/__tests__/localDataHelpers.test.ts`、ほか `npm run typecheck` が指す `SyncPayload` の固定データ
- Test: 上の同期のテスト、新しい `src/features/settings/__tests__/recordGroup.test.ts`

**Interfaces:**

- Consumes: Task 2 の `getWeeklyLogHistory` / `saveWeeklyLogHistory`（`@/features/journal/storage` から import）
- Produces: `SyncPayload.weeklyLogHistory: WeeklyLogHistory`、`CoreSyncData` に `"weeklyLogHistory"`

- [ ] **Step 1: 失敗するテストを足す**

`src/features/sync/__tests__/syncDataNormalizer.test.ts`:

- `LOCAL` に `weeklyLogHistory: { "2026-02-09": { id: "local-wl1" } }` を足し、`mockLocalStorageValues` に `(journalStorage.getWeeklyLogHistory as jest.Mock).mockReturnValue(LOCAL.weeklyLogHistory);` を足す。
- 「リモートに無いフィールドはローカルを保つ」テスト（`normalizeCoreSyncData({ routines: remoteRoutines })` のもの）に `expect(result.weeklyLogHistory).toEqual(LOCAL.weeklyLogHistory);` を足す。
- 「明示的な空配列/空オブジェクトはそのまま採用する」テストの入力に `weeklyLogHistory: {}` を、期待に `expect(result.weeklyLogHistory).toEqual({});` を足す。

`src/features/sync/__tests__/syncStorage.test.utils.ts` の 3 つの表に足す（`journalHistory` の行の次）:

```ts
  // storageReadMocks
  weeklyLogHistory: (value) =>
    (journalStorage.getWeeklyLogHistory as jest.Mock).mockReturnValue(value),
  // storageSaveAssertions
  weeklyLogHistory: (value) =>
    expect(journalStorage.saveWeeklyLogHistory).toHaveBeenCalledWith(value),
  // storageReadAssertions
  weeklyLogHistory: () =>
    expect(journalStorage.getWeeklyLogHistory).toHaveBeenCalled(),
```

`src/features/sync/__tests__/sync.test.fixtures.ts` の `journalHistory: {},` の次に `weeklyLogHistory: {},` を足す。

`src/features/sync/__tests__/localData.test.ts` の `jest.mock("@/features/journal/storage", () => ({ ... }))` の工場関数に `getWeeklyLogHistory: jest.fn(() => ({})), saveWeeklyLogHistory: jest.fn(),` を足す（工場関数の形に合わせる）。

`src/features/sync/__tests__/localDataHelpers.test.ts` に、ほかが空で `weeklyLogHistory` だけがあるデータを「ローカルにデータがある」と判定するテストを足す（既存の `{ ...emptyData, routines: [routineFixture] }` のテストと同じ形で `{ ...emptyData, weeklyLogHistory: { "2026-11-02": { id: "w", weekStart: "2026-11-02", content: "c", createdAt: "x", updatedAt: "x" } } }`）。

`src/features/sync/__tests__/localData.malformed-data.test.ts` の `STORAGE_KEYS` に `"weekly-log-history"` を足す（壊れた値でも収集が止まらないことを確かめる。L-470）。

記録グループ専用のテストは今は無いので、新しく `src/features/settings/__tests__/recordGroup.test.ts` を作る:

```ts
import * as journalStorage from "@/features/journal/storage";
import {
  collectRecordTransferData,
  RECORD_TRANSFER_FIELDS,
} from "../state/transferGroups/recordGroup";

jest.mock("@/features/journal/storage");
jest.mock("@/features/meal/storage");
jest.mock("@/features/pomodoro/storage");
jest.mock("@/features/weight-tracker/storage");
jest.mock("@/features/work-tracker/storage");
jest.mock("@/features/workout-tracker/storage");

const weeklyLogHistory = {
  "2026-11-02": {
    id: "w-1",
    weekStart: "2026-11-02",
    content: "内容",
    createdAt: "2026-11-06T12:00:00.000Z",
    updatedAt: "2026-11-06T12:00:00.000Z",
  },
};

const weeklyField = () => {
  const field = RECORD_TRANSFER_FIELDS.find(
    (item) => item.key === "weeklyLogHistory",
  );
  if (!field) throw new Error("weeklyLogHistory のフィールドが無い");
  return field;
};

describe("記録グループの業務日誌", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (journalStorage.getWeeklyLogHistory as jest.Mock).mockReturnValue(
      weeklyLogHistory,
    );
  });

  it("書き出しに weeklyLogHistory を含む", () => {
    expect(collectRecordTransferData().weeklyLogHistory).toEqual(
      weeklyLogHistory,
    );
  });

  it("取り込みで weeklyLogHistory を保存する", () => {
    weeklyField().restore({ weeklyLogHistory });
    expect(journalStorage.saveWeeklyLogHistory).toHaveBeenCalledWith(
      weeklyLogHistory,
    );
  });

  it("オブジェクトでない weeklyLogHistory はエラーにする", () => {
    expect(() => weeklyField().validate({ weeklyLogHistory: [] })).toThrow();
  });
});
```

（`TransferPayload` の型が `Record<string, unknown>` でなければ、引数に `as never` を付ける）

- [ ] **Step 2: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/sync src/features/settings`
Expected: 足したテストが FAIL

- [ ] **Step 3: 実装する**

`src/features/sync/sync/types.ts`: import に `WeeklyLogHistory` を足し、`SyncPayload` の `journalHistory: JournalHistory;` の次に `weeklyLogHistory: WeeklyLogHistory;`。

`src/features/sync/sync/syncDataNormalizer.ts`:

```ts
import {
  getJournalHistory,
  getWeeklyLogHistory,
} from "@/features/journal/storage";
// CoreSyncData の Pick に | "weeklyLogHistory" を "journalHistory" の次に足す
// normalizeCoreSyncData の journalHistory の次に:
  weeklyLogHistory: data.weeklyLogHistory ?? getWeeklyLogHistory(),
```

`src/features/sync/sync/localData.ts`: journal の import に `getWeeklyLogHistory`・`saveWeeklyLogHistory` を足し、収集の `journalHistory: getJournalHistory(),` の次に `weeklyLogHistory: getWeeklyLogHistory(),`、保存の `saveJournalHistory(normalized.journalHistory);` の次に `saveWeeklyLogHistory(normalized.weeklyLogHistory);`。

`src/features/sync/sync/localDataHelpers.ts`: `Object.keys(data.journalHistory).length > 0 ||` の次に `Object.keys(data.weeklyLogHistory).length > 0 ||`。

`src/features/settings/state/transferGroups/recordGroup.ts`:

```ts
import {
  getJournalHistory,
  getWeeklyLogHistory,
  saveJournalHistory,
  saveWeeklyLogHistory,
} from "@/features/journal/storage";
// JSDoc の列挙: 「ジャーナル・業務日誌・体重・運動・食事・ポモドーロ・作業記録は、どれも」
// collectRecordTransferData の journalHistory の次に:
  weeklyLogHistory: getWeeklyLogHistory(),
// RECORD_TRANSFER_FIELDS の journalHistory の次に:
  objectField(
    "weeklyLogHistory",
    saveWeeklyLogHistory,
    invalid("weeklyLogHistory"),
  ),
```

`src/features/settings/state/dataTransferGroups.ts` の `label: "記録（ジャーナル・体重・運動・食事・ポモドーロ・作業）"` を `label: "記録（ジャーナル・業務日誌・体重・運動・食事・ポモドーロ・作業）"` にする（このラベルを照合しているテストや Storybook があれば `grep -rn "記録（ジャーナル" src` で探して直す）。

- [ ] **Step 4: 型と同期・設定のテストを通す**

Run: `npm run typecheck`（`SyncPayload` の固定データの欠けを指されたら `weeklyLogHistory: {}` を足す）、続けて `npx cross-env TZ=Asia/Tokyo jest src/features/sync src/features/settings`
Expected: PASS

---

### Task 4: 状態フック

**Files:**

- Create: `src/features/journal/weekly/useWeeklyLogState.ts`
- Modify: `src/features/journal/locales/ja.json`（`weeklyLog` 節を足す。Task 5 の文言もここで全部足す）
- Test: `src/features/journal/weekly/__tests__/useWeeklyLogState.test.tsx`
- Modify: `src/__tests__/reactCompilerToday.contract.test.ts`（`TODAY_TARGETS` に追加）

**Interfaces:**

- Consumes: Task 1 の `getWeeklyLogWeekStart`・`shiftWeeklyLogWeek`・`formatWeeklyLogWeekDate`、Task 2 の `getWeeklyLogHistory`・`saveWeeklyLog`・`deleteWeeklyLog`・`listWeeklyLogsByLatest`、`useJstTodayKey`（`@/hooks/useToday`。中で `@/lib/storage/core` の `getTodayString` を呼ぶので、テストは `getTodayString` のモックで今日を決められる）
- Produces:

```ts
export type WeeklyLogState = {
  currentWeekStart: string;
  selectedWeekStart: string;
  selectedEntry: WeeklyLogEntry | null;
  entries: WeeklyLogEntry[];
  isEditing: boolean;
  contentInput: string;
  canNavigate: boolean;
  canGoNext: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  openWeek: (weekStart: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  changeContent: (value: string) => void;
  save: () => void;
  remove: () => void;
};
export const useWeeklyLogState: () => WeeklyLogState;
```

- [ ] **Step 1: 文言を足す**

`src/features/journal/locales/ja.json` の末尾の `"editCard": { ... }` の後に（カンマに注意）:

```json
  "weeklyLog": {
    "title": "🗓️ 週ごとの業務日誌",
    "weekTitleTemplate": "{date}開始の週",
    "currentWeekBadge": "今週",
    "previousWeekLabel": "◀ 前の週",
    "nextWeekLabel": "次の週 ▶",
    "emptyLabel": "この週の業務日誌はまだありません",
    "addButtonLabel": "➕ 書く",
    "editButtonLabel": "✏️ 編集",
    "deleteButtonLabel": "🗑️ 削除",
    "contentInputLabel": "本文",
    "contentPlaceholder": "今週の業務内容・成果・課題・来週の予定などを書いてください...",
    "saveLabel": "保存",
    "cancelLabel": "キャンセル",
    "updatedPrefix": "最終更新:",
    "alertMissingContent": "本文を入力してください",
    "confirmDeleteTemplate": "{week}の業務日誌を削除しますか？",
    "listTitle": "📚 これまでの業務日誌",
    "listEmpty": "記録がありません",
    "openButtonLabel": "開く",
    "viewingLabel": "表示中"
  }
```

- [ ] **Step 2: 失敗するテストを書く**

```tsx
// src/features/journal/weekly/__tests__/useWeeklyLogState.test.tsx
import { act, renderHook } from "@testing-library/react";
import { useWeeklyLogState } from "../useWeeklyLogState";
import * as weeklyLogStorage from "../weeklyLogStorage";
import * as coreStorage from "@/lib/storage/core";
import journalTexts from "../../locales/ja.json";
import type { WeeklyLogEntry, WeeklyLogHistory } from "@/types/routine";

jest.mock("../weeklyLogStorage", () => ({
  ...jest.requireActual("../weeklyLogStorage"),
  getWeeklyLogHistory: jest.fn(),
  saveWeeklyLog: jest.fn(),
  deleteWeeklyLog: jest.fn(),
}));
jest.mock("@/lib/storage/core", () => ({
  ...jest.requireActual("@/lib/storage/core"),
  getTodayString: jest.fn(),
}));

const mockGetHistory = weeklyLogStorage.getWeeklyLogHistory as jest.Mock;
const mockSave = weeklyLogStorage.saveWeeklyLog as jest.Mock;
const mockDelete = weeklyLogStorage.deleteWeeklyLog as jest.Mock;
const mockToday = coreStorage.getTodayString as jest.Mock;

const entry = (weekStart: string, content = "内容"): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
});

describe("useWeeklyLogState", () => {
  let history: WeeklyLogHistory;

  beforeEach(() => {
    jest.clearAllMocks();
    history = { "2026-10-26": entry("2026-10-26", "先週の内容") };
    mockGetHistory.mockImplementation(() => ({ ...history }));
    mockSave.mockReturnValue(true);
    mockDelete.mockReturnValue(true);
    mockToday.mockReturnValue("2026-11-07"); // 土曜
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("最初は今週（月曜開始）を表示する", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    expect(result.current.currentWeekStart).toBe("2026-11-02");
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
    expect(result.current.selectedEntry).toBeNull();
    expect(result.current.canGoNext).toBe(false);
  });

  it("前の週へ移り、今週までは次の週へ戻れるが未来へは進めない", () => {
    const { result } = renderHook(() => useWeeklyLogState());

    act(() => result.current.goToPreviousWeek());
    expect(result.current.selectedWeekStart).toBe("2026-10-26");
    expect(result.current.selectedEntry?.content).toBe("先週の内容");
    expect(result.current.canGoNext).toBe(true);

    act(() => result.current.goToNextWeek());
    act(() => result.current.goToNextWeek());
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("フォームを開いている間は週を切り替えない", () => {
    const { result } = renderHook(() => useWeeklyLogState());

    act(() => result.current.startEditing());
    expect(result.current.canNavigate).toBe(false);
    act(() => result.current.goToPreviousWeek());
    act(() => result.current.openWeek("2026-10-26"));
    expect(result.current.selectedWeekStart).toBe("2026-11-02");
  });

  it("編集を始めると既存の本文が入る", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    act(() => result.current.startEditing());
    expect(result.current.contentInput).toBe("先週の内容");
  });

  it("空白だけの本文では保存しない", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("  \n "));
    act(() => result.current.save());

    expect(window.alert).toHaveBeenCalledWith(
      journalTexts.weeklyLog.alertMissingContent,
    );
    expect(mockSave).not.toHaveBeenCalled();
    expect(result.current.isEditing).toBe(true);
  });

  it("保存に成功したら読み直してフォームを閉じる", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("今週の内容"));
    history = { ...history, "2026-11-02": entry("2026-11-02", "今週の内容") };
    act(() => result.current.save());

    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "今週の内容");
    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedEntry?.content).toBe("今週の内容");
    expect(result.current.entries.map((item) => item.weekStart)).toEqual([
      "2026-11-02",
      "2026-10-26",
    ]);
  });

  it("保存に失敗したらフォームを開いたまま入力を残し、読み直す", () => {
    mockSave.mockReturnValue(false);
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("今週の内容"));
    const callsBefore = mockGetHistory.mock.calls.length;
    act(() => result.current.save());

    expect(result.current.isEditing).toBe(true);
    expect(result.current.contentInput).toBe("今週の内容");
    expect(mockGetHistory.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it("日をまたいで翌週になっても、選んでいた週へ保存する", () => {
    const { result, rerender } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    mockToday.mockReturnValue("2026-11-09"); // 翌週の月曜
    rerender();
    act(() => result.current.changeContent("金曜に書き始めた内容"));
    act(() => result.current.save());

    expect(result.current.currentWeekStart).toBe("2026-11-09");
    expect(mockSave).toHaveBeenCalledWith("2026-11-02", "金曜に書き始めた内容");
  });

  it("削除の確認でキャンセルすると消さない", () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    act(() => result.current.remove());
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("削除の確認で OK なら消して読み直す", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.openWeek("2026-10-26"));
    history = {};
    act(() => result.current.remove());

    expect(window.confirm).toHaveBeenCalledWith(
      "2026年10月26日（月）開始の週の業務日誌を削除しますか？",
    );
    expect(mockDelete).toHaveBeenCalledWith("2026-10-26");
    expect(result.current.selectedEntry).toBeNull();
    expect(result.current.entries).toEqual([]);
  });

  it("キャンセルでフォームを閉じ、入力を捨てる", () => {
    const { result } = renderHook(() => useWeeklyLogState());
    act(() => result.current.startEditing());
    act(() => result.current.changeContent("書きかけ"));
    act(() => result.current.cancelEditing());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.contentInput).toBe("");
  });
});
```

- [ ] **Step 3: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/useWeeklyLogState.test.tsx`
Expected: FAIL（モジュールが無い）

- [ ] **Step 4: 実装する**

```ts
// src/features/journal/weekly/useWeeklyLogState.ts
import { useState } from "react";
import type { WeeklyLogEntry, WeeklyLogHistory } from "@/types/routine";
import { useJstTodayKey } from "@/hooks/useToday";
import journalTexts from "../locales/ja.json";
import {
  deleteWeeklyLog,
  getWeeklyLogHistory,
  listWeeklyLogsByLatest,
  saveWeeklyLog,
} from "./weeklyLogStorage";
import {
  formatWeeklyLogWeekDate,
  getWeeklyLogWeekStart,
  shiftWeeklyLogWeek,
} from "./weeklyLogWeek";

export type WeeklyLogState = {
  currentWeekStart: string;
  selectedWeekStart: string;
  selectedEntry: WeeklyLogEntry | null;
  entries: WeeklyLogEntry[];
  isEditing: boolean;
  contentInput: string;
  canNavigate: boolean;
  canGoNext: boolean;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  openWeek: (weekStart: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  changeContent: (value: string) => void;
  save: () => void;
  remove: () => void;
};

const texts = journalTexts.weeklyLog;

export const useWeeklyLogState = (): WeeklyLogState => {
  // useJstTodayKey は描画のたびに今日を取り直す（React Compiler で固定されない）。
  // 開いたまま日をまたいでも、次の再描画で今週が追いつく
  const today = useJstTodayKey();
  const currentWeekStart = getWeeklyLogWeekStart(today);
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
  const [history, setHistory] = useState<WeeklyLogHistory>(() =>
    getWeeklyLogHistory(),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [contentInput, setContentInput] = useState("");

  const selectedEntry = history[selectedWeekStart] ?? null;
  const canNavigate = !isEditing;
  const canGoNext = canNavigate && selectedWeekStart < currentWeekStart;

  const reload = () => setHistory(getWeeklyLogHistory());

  const goToPreviousWeek = () => {
    if (!canNavigate) return;
    setSelectedWeekStart(shiftWeeklyLogWeek(selectedWeekStart, -1));
  };

  const goToNextWeek = () => {
    if (!canGoNext) return;
    setSelectedWeekStart(shiftWeeklyLogWeek(selectedWeekStart, 1));
  };

  const openWeek = (weekStart: string) => {
    if (!canNavigate) return;
    setSelectedWeekStart(weekStart);
  };

  const startEditing = () => {
    setContentInput(selectedEntry?.content ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setContentInput("");
  };

  const save = () => {
    if (contentInput.trim() === "") {
      window.alert(texts.alertMissingContent);
      return;
    }
    const saved = saveWeeklyLog(selectedWeekStart, contentInput);
    // 成否にかかわらず読み直し、画面とストレージを食い違わせない
    reload();
    if (!saved) return;
    setIsEditing(false);
    setContentInput("");
  };

  const remove = () => {
    const week = texts.weekTitleTemplate.replace(
      "{date}",
      formatWeeklyLogWeekDate(selectedWeekStart),
    );
    if (!window.confirm(texts.confirmDeleteTemplate.replace("{week}", week))) {
      return;
    }
    deleteWeeklyLog(selectedWeekStart);
    reload();
  };

  return {
    currentWeekStart,
    selectedWeekStart,
    selectedEntry,
    entries: listWeeklyLogsByLatest(history),
    isEditing,
    contentInput,
    canNavigate,
    canGoNext,
    goToPreviousWeek,
    goToNextWeek,
    openWeek,
    startEditing,
    cancelEditing,
    changeContent: setContentInput,
    save,
    remove,
  };
};
```

- [ ] **Step 5: React Compiler の契約テストに足す**

`src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` の末尾に:

```ts
  {
    file: "src/features/journal/weekly/useWeeklyLogState.ts",
    hookCall: "useJstTodayKey(",
    // 今日から求めた今週の開始日が、戻り値のメモ化の依存に入る
    dependencies: ["currentWeekStart"],
  },
```

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerToday.contract.test.ts`
Expected: PASS

- [ ] **Step 6: テストが通るのを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly`
Expected: PASS

---

### Task 5: 表示部品と Storybook

**Files:**

- Create: `src/features/journal/weekly/components/WeeklyLogWeekNavigator.tsx`
- Create: `src/features/journal/weekly/components/WeeklyLogEditor.tsx`
- Create: `src/features/journal/weekly/components/WeeklyLogList.tsx`
- Create: `src/features/journal/weekly/components/WeeklyLogCard.tsx`
- Create: `src/features/journal/weekly/components/WeeklyLogCard.stories.tsx`
- Test: `src/features/journal/weekly/__tests__/WeeklyLogCard.test.tsx`

**Interfaces:**

- Consumes: Task 4 の `WeeklyLogState`、Task 1 の整形関数、`formatUpdatedAt`（`../../utils/journalDate`）、`CardPanel`（`@/components`）、`journalTexts.weeklyLog`
- Produces: `WeeklyLogCard({ state }: { state: WeeklyLogState })`

- [ ] **Step 1: 失敗するテストを書く**

```tsx
// src/features/journal/weekly/__tests__/WeeklyLogCard.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { WeeklyLogCard } from "../components/WeeklyLogCard";
import type { WeeklyLogState } from "../useWeeklyLogState";
import type { WeeklyLogEntry } from "@/types/routine";

const entry = (weekStart: string, content: string): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
});

const createState = (
  overrides: Partial<WeeklyLogState> = {},
): WeeklyLogState => ({
  currentWeekStart: "2026-11-02",
  selectedWeekStart: "2026-11-02",
  selectedEntry: null,
  entries: [],
  isEditing: false,
  contentInput: "",
  canNavigate: true,
  canGoNext: false,
  goToPreviousWeek: jest.fn(),
  goToNextWeek: jest.fn(),
  openWeek: jest.fn(),
  startEditing: jest.fn(),
  cancelEditing: jest.fn(),
  changeContent: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  ...overrides,
});

describe("WeeklyLogCard", () => {
  it("週の見出し・期間・今週の印を出し、今週では次の週を押せない", () => {
    render(<WeeklyLogCard state={createState()} />);

    expect(screen.getByText("2026年11月2日（月）開始の週")).toBeInTheDocument();
    expect(screen.getByText("11月2日〜11月8日")).toBeInTheDocument();
    expect(screen.getByText("今週")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "次の週 ▶" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "◀ 前の週" })).not.toBeDisabled();
  });

  it("前の週を表示中は今週の印を出さず、次の週を押せる", () => {
    const state = createState({
      selectedWeekStart: "2026-10-26",
      canGoNext: true,
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.queryByText("今週")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "次の週 ▶" }));
    expect(state.goToNextWeek).toHaveBeenCalled();
  });

  it("日誌が無ければ空の表示と書くボタン", () => {
    const state = createState();
    render(<WeeklyLogCard state={state} />);

    expect(
      screen.getByText("この週の業務日誌はまだありません"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
    expect(state.startEditing).toHaveBeenCalled();
  });

  it("日誌があれば本文と編集・削除ボタン", () => {
    const state = createState({
      selectedEntry: entry("2026-11-02", "今週の成果"),
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.getAllByText("今週の成果").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "✏️ 編集" }));
    fireEvent.click(screen.getByRole("button", { name: "🗑️ 削除" }));
    expect(state.startEditing).toHaveBeenCalled();
    expect(state.remove).toHaveBeenCalled();
  });

  it("フォームでは本文を入力して保存・キャンセルでき、週の切り替えは押せない", () => {
    const state = createState({
      isEditing: true,
      contentInput: "書きかけ",
      canNavigate: false,
    });
    render(<WeeklyLogCard state={state} />);

    const textarea = screen.getByLabelText("本文");
    expect(textarea).toHaveValue("書きかけ");
    fireEvent.change(textarea, { target: { value: "書いた" } });
    expect(state.changeContent).toHaveBeenCalledWith("書いた");
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(state.save).toHaveBeenCalled();
    expect(state.cancelEditing).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "◀ 前の週" })).toBeDisabled();
  });

  it("一覧は表示中の週に「表示中」、ほかに「開く」を出す", () => {
    const state = createState({
      entries: [
        entry("2026-11-02", "今週の成果"),
        entry("2026-10-26", "先週の成果"),
      ],
      selectedEntry: entry("2026-11-02", "今週の成果"),
    });
    render(<WeeklyLogCard state={state} />);

    expect(screen.getByText("表示中")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "開く" }));
    expect(state.openWeek).toHaveBeenCalledWith("2026-10-26");
  });

  it("入力中は一覧の「開く」を押せない", () => {
    const state = createState({
      entries: [entry("2026-10-26", "先週の成果")],
      isEditing: true,
      canNavigate: false,
    });
    render(<WeeklyLogCard state={state} />);
    expect(screen.getByRole("button", { name: "開く" })).toBeDisabled();
  });

  it("一覧が空なら記録がありません", () => {
    render(<WeeklyLogCard state={createState()} />);
    expect(screen.getByText("記録がありません")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly/__tests__/WeeklyLogCard.test.tsx`
Expected: FAIL

- [ ] **Step 3: 実装する**

```tsx
// src/features/journal/weekly/components/WeeklyLogWeekNavigator.tsx
import journalTexts from "../../locales/ja.json";
import {
  formatWeeklyLogWeekDate,
  formatWeeklyLogWeekRange,
} from "../weeklyLogWeek";

const texts = journalTexts.weeklyLog;

type WeeklyLogWeekNavigatorProps = {
  weekStart: string;
  isCurrentWeek: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const navButtonClass =
  "px-3 py-1 text-sm font-medium rounded-lg text-purple-600 hover:bg-purple-50 dark:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed";

export const WeeklyLogWeekNavigator = ({
  weekStart,
  isCurrentWeek,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: WeeklyLogWeekNavigatorProps) => (
  <div className="flex items-center justify-between gap-2 mb-4">
    <button
      type="button"
      onClick={onPrevious}
      disabled={!canGoPrevious}
      className={navButtonClass}
    >
      {texts.previousWeekLabel}
    </button>
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-900">
          {texts.weekTitleTemplate.replace(
            "{date}",
            formatWeeklyLogWeekDate(weekStart),
          )}
        </h3>
        {isCurrentWeek && (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
            {texts.currentWeekBadge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-600">
        {formatWeeklyLogWeekRange(weekStart)}
      </p>
    </div>
    <button
      type="button"
      onClick={onNext}
      disabled={!canGoNext}
      className={navButtonClass}
    >
      {texts.nextWeekLabel}
    </button>
  </div>
);
```

```tsx
// src/features/journal/weekly/components/WeeklyLogEditor.tsx
import { useId } from "react";
import type { WeeklyLogEntry } from "@/types/routine";
import journalTexts from "../../locales/ja.json";
import { formatUpdatedAt } from "../../utils/journalDate";

const texts = journalTexts.weeklyLog;

type WeeklyLogEditorProps = {
  entry: WeeklyLogEntry | null;
  isEditing: boolean;
  contentInput: string;
  onStartEditing: () => void;
  onCancel: () => void;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
};

export const WeeklyLogEditor = ({
  entry,
  isEditing,
  contentInput,
  onStartEditing,
  onCancel,
  onContentChange,
  onSave,
  onRemove,
}: WeeklyLogEditorProps) => {
  const textareaId = useId();

  if (isEditing) {
    // form の submit を使わない（IME 確定の Enter で送信しない）
    return (
      <div className="space-y-3">
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-800"
        >
          {texts.contentInputLabel}
        </label>
        <textarea
          id={textareaId}
          value={contentInput}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={texts.contentPlaceholder}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {texts.cancelLabel}
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            {texts.saveLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-600 mb-3">
          {texts.emptyLabel}
        </p>
        <button
          type="button"
          onClick={onStartEditing}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          {texts.addButtonLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-300 rounded-lg">
      <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap">
        {entry.content}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-600">
          {texts.updatedPrefix} {formatUpdatedAt(entry.updatedAt)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartEditing}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-700 text-sm font-medium"
          >
            {texts.editButtonLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 dark:text-red-700 text-sm font-medium"
          >
            {texts.deleteButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

```tsx
// src/features/journal/weekly/components/WeeklyLogList.tsx
import type { WeeklyLogEntry } from "@/types/routine";
import journalTexts from "../../locales/ja.json";
import { formatUpdatedAt } from "../../utils/journalDate";
import { formatWeeklyLogWeekDate } from "../weeklyLogWeek";

const texts = journalTexts.weeklyLog;

type WeeklyLogListProps = {
  entries: WeeklyLogEntry[];
  selectedWeekStart: string;
  canOpen: boolean;
  onOpenWeek: (weekStart: string) => void;
};

export const WeeklyLogList = ({
  entries,
  selectedWeekStart,
  canOpen,
  onOpenWeek,
}: WeeklyLogListProps) => (
  <div className="mt-6">
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
      {texts.listTitle}
    </h3>
    {entries.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-600 text-center py-4">
        {texts.listEmpty}
      </p>
    ) : (
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.weekStart}
            className="p-3 border border-gray-200 dark:border-gray-300 rounded-lg"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-700">
                {texts.weekTitleTemplate.replace(
                  "{date}",
                  formatWeeklyLogWeekDate(entry.weekStart),
                )}
              </span>
              {entry.weekStart === selectedWeekStart ? (
                <span className="text-xs text-purple-700">
                  {texts.viewingLabel}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenWeek(entry.weekStart)}
                  disabled={!canOpen}
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {texts.openButtonLabel}
                </button>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-800 whitespace-pre-wrap line-clamp-3">
              {entry.content}
            </p>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-600">
              {texts.updatedPrefix} {formatUpdatedAt(entry.updatedAt)}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
```

```tsx
// src/features/journal/weekly/components/WeeklyLogCard.tsx
import { CardPanel } from "@/components";
import journalTexts from "../../locales/ja.json";
import type { WeeklyLogState } from "../useWeeklyLogState";
import { WeeklyLogEditor } from "./WeeklyLogEditor";
import { WeeklyLogList } from "./WeeklyLogList";
import { WeeklyLogWeekNavigator } from "./WeeklyLogWeekNavigator";

type WeeklyLogCardProps = {
  state: WeeklyLogState;
};

export const WeeklyLogCard = ({ state }: WeeklyLogCardProps) => (
  <CardPanel>
    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
      {journalTexts.weeklyLog.title}
    </h2>
    <WeeklyLogWeekNavigator
      weekStart={state.selectedWeekStart}
      isCurrentWeek={state.selectedWeekStart === state.currentWeekStart}
      canGoPrevious={state.canNavigate}
      canGoNext={state.canGoNext}
      onPrevious={state.goToPreviousWeek}
      onNext={state.goToNextWeek}
    />
    <WeeklyLogEditor
      entry={state.selectedEntry}
      isEditing={state.isEditing}
      contentInput={state.contentInput}
      onStartEditing={state.startEditing}
      onCancel={state.cancelEditing}
      onContentChange={state.changeContent}
      onSave={state.save}
      onRemove={state.remove}
    />
    <WeeklyLogList
      entries={state.entries}
      selectedWeekStart={state.selectedWeekStart}
      canOpen={state.canNavigate}
      onOpenWeek={state.openWeek}
    />
  </CardPanel>
);
```

```tsx
// src/features/journal/weekly/components/WeeklyLogCard.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { WeeklyLogCard } from "./WeeklyLogCard";
import type { WeeklyLogEntry } from "@/types/routine";

const entries: WeeklyLogEntry[] = [
  {
    id: "w-1",
    weekStart: "2026-11-02",
    content: "・A 案件の設計レビューを完了\n・来週は実装に着手",
    createdAt: "2026-11-06T09:00:00.000Z",
    updatedAt: "2026-11-06T09:30:00.000Z",
  },
  {
    id: "w-2",
    weekStart: "2026-10-26",
    content: "・B 案件のリリース対応\n・障害の振り返り会を実施",
    createdAt: "2026-10-31T09:00:00.000Z",
    updatedAt: "2026-10-31T09:00:00.000Z",
  },
];

const baseState = {
  currentWeekStart: "2026-11-02",
  selectedWeekStart: "2026-11-02",
  selectedEntry: null,
  entries: [],
  isEditing: false,
  contentInput: "",
  canNavigate: true,
  canGoNext: false,
  goToPreviousWeek: fn(),
  goToNextWeek: fn(),
  openWeek: fn(),
  startEditing: fn(),
  cancelEditing: fn(),
  changeContent: fn(),
  save: fn(),
  remove: fn(),
};

const meta = {
  title: "Features/Journal/WeeklyLogCard",
  component: WeeklyLogCard,
  parameters: { layout: "padded" },
  args: { state: baseState },
} satisfies Meta<typeof WeeklyLogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithEntry: Story = {
  args: {
    state: { ...baseState, selectedEntry: entries[0], entries },
  },
};

export const Editing: Story = {
  args: {
    state: {
      ...baseState,
      isEditing: true,
      canNavigate: false,
      contentInput: "・今週やったこと",
      entries,
    },
  },
};

export const PastWeek: Story = {
  args: {
    state: {
      ...baseState,
      selectedWeekStart: "2026-10-26",
      selectedEntry: entries[1],
      canGoNext: true,
      entries,
    },
  },
};
```

- [ ] **Step 4: テストが通るのを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/weekly`、`npm run tailwind:scan`
Expected: PASS（tailwind:scan が短縮形の指摘をしたら `npm run tailwind:fix` で直す）

---

### Task 6: ジャーナル画面への組み込みと説明・確認項目

**Files:**

- Modify: `src/features/journal/JournalPage.tsx`
- Modify: `src/features/journal/__tests__/JournalPage.test.tsx`
- Modify: `src/features/journal/__tests__/JournalPage.dateEdit.test.tsx`（業務日誌のカードの h3 が `recentTitles()` に混ざるため、過去の記録のカードの中に絞る）
- Modify: `src/features/journal/JournalPage.stories.tsx`（`JournalPage` を描くストーリーが `useWeeklyLogState` の実物を使っても壊れないか確かめる。LocalStorage が空なら空の表示になるだけなので、変更が要らなければ触らない）
- Modify: `docs/04-reference/features.md`・`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts`

**Interfaces:**

- Consumes: Task 4 の `useWeeklyLogState`、Task 5 の `WeeklyLogCard`

- [ ] **Step 1: 失敗するテストを足す**

`src/features/journal/__tests__/JournalPage.test.tsx` の先頭の mock の並びに:

```tsx
import { useWeeklyLogState } from "../weekly/useWeeklyLogState";

jest.mock("../weekly/useWeeklyLogState");

const mockUseWeeklyLogState = useWeeklyLogState as jest.MockedFunction<
  typeof useWeeklyLogState
>;
```

`beforeEach`（無ければ `describe` の先頭に作る）で:

```tsx
mockUseWeeklyLogState.mockReturnValue({
  currentWeekStart: "2026-03-09",
  selectedWeekStart: "2026-03-09",
  selectedEntry: null,
  entries: [],
  isEditing: false,
  contentInput: "",
  canNavigate: true,
  canGoNext: false,
  goToPreviousWeek: jest.fn(),
  goToNextWeek: jest.fn(),
  openWeek: jest.fn(),
  startEditing: jest.fn(),
  cancelEditing: jest.fn(),
  changeContent: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});
```

テストを足す:

```tsx
it("週ごとの業務日誌のカードを、日次の過去の記録より前に出す", () => {
  mockUseJournalPageState.mockReturnValue(createState() as never);
  render(<JournalPage />);

  const weekly = screen.getByText(journalTexts.weeklyLog.title);
  const recent = screen.getByText(journalTexts.recentEntries.title);
  expect(
    weekly.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(screen.getByText("2026年3月9日（月）開始の週")).toBeInTheDocument();
});
```

（`mockUseJournalPageState.mockReturnValue(createState() as never)` は既存テストの書き方に合わせる）

`src/features/journal/__tests__/JournalPage.dateEdit.test.tsx`（モックを使わず実物の state と localStorage で描く）の `recentTitles` を、過去の記録のカードの中に絞る（`within` を `@testing-library/react` の import に足す）:

```tsx
// 過去の記録（日次）のカードの見出し（h3）を上から順に返す。
// 業務日誌のカードにも h3 があるため、「📖 過去の記録」の h2 を持つカードの中に絞る
const recentTitles = () =>
  within(
    screen.getByRole("heading", { level: 2, name: "📖 過去の記録" })
      .parentElement as HTMLElement,
  )
    .getAllByRole("heading", { level: 3 })
    .map((heading) => heading.textContent);
```

同じファイルに、業務日誌のカードを使っても日次の記録が変わらないことのテストを足す:

```tsx
it("業務日誌を保存しても、日次の記録と過去の記録の一覧は変わらない", () => {
  seedHistory({
    "2026-03-12": [makeEntry("a", "2026-03-12", "十二日の記録")],
  });
  render(<JournalPage />);

  fireEvent.click(screen.getByRole("button", { name: "➕ 書く" }));
  fireEvent.change(screen.getByLabelText("本文"), {
    target: { value: "今週の業務" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  expect(window.alert).not.toHaveBeenCalled();
  expect(recentTitles()).toEqual(["十二日の記録"]);
  expect(readHistory()).toEqual({
    "2026-03-12": [makeEntry("a", "2026-03-12", "十二日の記録")],
  });
  // 2026-03-15（日）を含む週は 2026-03-09（月）開始
  const weekly = JSON.parse(localStorage.getItem("weekly-log-history") ?? "{}");
  expect(weekly["2026-03-09"]).toEqual(
    expect.objectContaining({ content: "今週の業務" }),
  );
});
```

（日次の今日のカードにも「本文」のラベルが出る場合は、`getByLabelText("本文")` が複数に当たる。そのときは `screen.getByPlaceholderText(journalTexts.weeklyLog.contentPlaceholder)` で業務日誌の入力欄を取る。`seedHistory`・`makeEntry`・`readHistory` の引数はファイルの既存の定義に合わせる）

- [ ] **Step 2: 失敗を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/journal/__tests__/JournalPage.test.tsx src/features/journal/__tests__/JournalPage.dateEdit.test.tsx`
Expected: 足したテストが FAIL

- [ ] **Step 3: 組み込む**

`src/features/journal/JournalPage.tsx`:

```tsx
import { WeeklyLogCard } from "./weekly/components/WeeklyLogCard";
import { useWeeklyLogState } from "./weekly/useWeeklyLogState";
// JournalPage の中:
const weeklyLogState = useWeeklyLogState();
// JournalEditCard の条件付き描画の後、<JournalRecentEntries ... /> の前に:
<WeeklyLogCard state={weeklyLogState} />;
```

- [ ] **Step 4: 説明と確認項目を更新する**

`docs/04-reference/features.md` の「📔 ジャーナル」節の中（236 行付近。ファイルには「最終更新時刻の表示」が 2 か所あるので、ジャーナル節のほう）の「最終更新時刻の表示」の次に:

```markdown
- 週ごとの業務日誌（ジャーナル画面の「🗓️ 週ごとの業務日誌」）
  - 月曜〜日曜を 1 週とし、週ごとに 1 件、本文だけを書ける（その週の日誌があれば編集になる）
  - 「2026年11月2日（月）開始の週」のように、何月何日開始の週かと期間（11月2日〜11月8日）を表示する。今週の判定は日本時間
  - 最初は今週を表示する。「◀ 前の週」「次の週 ▶」で週を切り替えられる（今週より先には進めない。入力中は切り替えられない）
  - 本文が空（空白だけを含む）では保存できない。削除は確認ダイアログで確かめる
  - 「📚 これまでの業務日誌」に、記録のある週を新しい週から順に表示し、「開く」でその週を表示する
```

同じファイルの同期対象の列挙（「同期対象: ルーティン、…、ジャーナル、体重記録、…」）の「ジャーナル、」を「ジャーナル、週ごとの業務日誌、」にする。エクスポートのグループの説明（`5. \`records\`: 記録（ジャーナル・体重・運動記録・食事・ポモドーロ・作業）`）も「記録（ジャーナル・業務日誌・体重・運動記録・食事・ポモドーロ・作業）」にする。

`docs/03-testing/test-matrix.md` の 3-6 の行の次に（表の列幅は prettier に任せる。`npx prettier --write docs/03-testing/test-matrix.md`）:

```markdown
| 3-7 | 週ごとの業務日誌を書く・編集する | 🔶 | ⬜ | ⬜ | 1 週 1 件・本文のみ。空の本文は保存不可 |
| 3-8 | 業務日誌の週の切り替え | 🔶 | ⬜ | ⬜ | 月曜開始の週の表示。未来の週へは進めない。入力中は不可 |
| 3-9 | これまでの業務日誌の一覧・削除 | 🔶 | ⬜ | ⬜ | 新しい週から順。「開く」。削除は確認ダイアログ |
```

`src/features/test-matrix/initialData.ts` の `id: "3-6"` の項目の次に:

```ts
      {
        id: "3-7",
        label: "週ごとの業務日誌を書く・編集する（1週1件・本文のみ）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "3-8",
        label: "業務日誌の週の切り替え（月曜開始・未来の週へは進めない）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "3-9",
        label: "これまでの業務日誌の一覧・削除（確認ダイアログ）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

`src/features/test-matrix/detailed-test-cases/group-01-04.ts` の `"3-6": [ ... ],` の次に:

```ts
  "3-7": [
    {
      id: "3-7-1",
      scenario: "今週の業務日誌が無い状態で「➕ 書く」を押し、本文を入力して保存",
      expected:
        "今週の表示に本文と最終更新が出る。「これまでの業務日誌」の先頭に今週の行が出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-7-2",
      scenario: "今週の業務日誌の「✏️ 編集」を押し、本文を変えて保存",
      expected: "同じ週の日誌が上書きされ、件数は増えない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-7-3",
      scenario: "本文を空（空白だけ）にして保存",
      expected: "「本文を入力してください」と表示され、保存されない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "3-8": [
    {
      id: "3-8-1",
      scenario: "金曜・土曜・日曜のいずれかにジャーナル画面を開く",
      expected:
        "その週の月曜を開始日として「◯年◯月◯日（月）開始の週」と期間が表示され、「今週」の印が出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-8-2",
      scenario: "「◀ 前の週」を押してから「次の週 ▶」を押す",
      expected:
        "1 週前の表示に変わり、戻ると今週になる。今週を表示中は「次の週 ▶」を押せない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-8-3",
      scenario: "本文の入力中に週の切り替えボタンと一覧の「開く」を見る",
      expected: "どれも押せない。保存かキャンセルの後に押せるようになる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "3-9": [
    {
      id: "3-9-1",
      scenario: "複数の週に業務日誌がある状態で「これまでの業務日誌」を見る",
      expected:
        "新しい週から順に並び、表示中の週は「表示中」、ほかは「開く」が出る。「開く」でその週の表示に変わる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "3-9-2",
      scenario: "業務日誌の「🗑️ 削除」を押し、確認でキャンセル、もう一度押して OK",
      expected: "キャンセルでは消えない。OK で消え、一覧からも消える",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
```

（test-matrix のテストが項目数や ID の一致を検査していれば、`grep -rln "3-6" src/features/test-matrix` で探し、失敗に従って直す）

- [ ] **Step 5: 全体の検証**

Run: `npx prettier --write` を変更したファイルに、続けて `npm run verify:fast`
Expected: すべて PASS。失敗があれば直してから先へ進む。
