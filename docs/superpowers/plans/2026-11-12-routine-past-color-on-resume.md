# 復帰時にルーティンの超過の色が更新されない不具合の修正 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** アプリをバックグラウンドから戻したとき、開始時間を過ぎた未完了のルーティンのカードが、画面を開き直さなくても超過の色（黄）になるようにする（Issue #9）。

**Architecture:** 描画時に使う現在時刻（分単位）を `useSyncExternalStore` のストア `useCurrentMinute` で持ち、復帰時とフォールバックのタイマーの回に `notifyCurrentMinute()` で読み直させる。`isRoutinePast` は時刻を引数で受け取る純粋な関数にし、カードのコンポーネント 5 つが `useCurrentMinute()` の値を `getRoutineItemCardClassName` へ渡す。これで React Compiler のメモ化のキーに現在時刻が入り、色が最初の描画の値に固定されなくなる。

**Tech Stack:** Next.js 16, React 19（React Compiler）, TypeScript, Jest（ts-jest・jsdom）+ Testing Library, babel-plugin-react-compiler（契約テスト）

設計書: `docs/superpowers/specs/2026-11-12-routine-past-color-on-resume-design.md`（以下「設計書」）。迷ったら設計書の「決めたこと」が正。

実装後のレビューで、このプランの手順から変えた点（最終のコードが正）:

- `routineItemPastColor.wiring.test.tsx` に、通しのテスト（本物の `useRoutineForegroundSync` とカード 1 枚を同じ画面に描画し、`visibilitychange`・`pageshow`・`focus` とフォールバックタイマーの回で黄色になることを確かめる）を足した。
- 同じファイルの配線テストから、通知の前の「時計を進めただけでは黄色にならない」の検証を外した（時計を進めても再描画が起きないので、必ず通る検証だった。毎分のタイマーを持たないことは `useCurrentMinute.test.ts` で確かめる）。

## Global Constraints

- 毎分のタイマーは足さない。現在時刻を読み直すきっかけは `notifyCurrentMinute()` だけにする
- `refreshRoutineState`（`src/features/routine/hooks/routineStateSync.ts`）は変えない
- `notifyCurrentMinute()` は `runRefresh` の中で、可視チェック（`document.visibilityState !== "visible"`）の後、フォールバックのスキップ判定（`shouldSkipFallbackRefresh()`）の前に呼ぶ。通知はスキップの対象にしない
- `getRoutineItemCardClassName` の `nowMinute` は必須の引数にする（省略可能にしない。渡し忘れを型で検出するため）
- カードのコンポーネントでは、`const nowMinute = useCurrentMinute();` を本体の先頭（早期 return より前）に置く
- 変えるのはカードの色の再評価だけ。保存データ・同期・設定項目（`backgroundRefreshIntervalMinutes`）・文言・色のクラスは変えない
- テストでは時刻を固定する（`jest.useFakeTimers().setSystemTime(...)`、`afterEach` で `jest.useRealTimers()`）。実際の時計に依存するテストは書かない
- コメントは日本語で書く
- **コミットはしない**（後の `/commit-ja` で行う）。`git checkout`・`git restore`・`git stash`・`git reset` で作業ツリーを戻さない（未コミットの実装が消える）
- プロセスは、自分で起動したものだけを止める。Claude アプリのプロセス（Network Service など）は kill しない
- このプランは Next.js の API を使うコードを足さない。もし Next.js の API に触れる必要が出たら、先に `node_modules/next/dist/docs/` の該当ガイドを読む（`AGENTS.md`）
- 検証: 単体は `npx cross-env TZ=Asia/Tokyo jest <パス>`、全体は `npm run verify:fast`（tailwind:scan・lint・typecheck・typecheck:functions・jest）。jest が途中で黙って落ちたときは `npx cross-env TZ=Asia/Tokyo jest -w 1 --forceExit` で再実行する
- ts-jest は型エラーでもテストファイルを失敗させる。「失敗を確かめる」手順では、型エラー（TS2554・TS2353 など）での失敗も「赤」として扱ってよい
- 知見: L-538（描画時の現在時刻は React Compiler で固定される。値は計算の入力として実際に渡す）、L-690（コンパイラ由来の不具合は Jest で赤にならない。配線のテストと契約テストを組み合わせ、壊して検出を確かめる）、L-488（復帰イベントは 1 回にまとめ、表示中のときだけ処理する）、L-108（購読はアンマウント時に必ず解除する）

## ファイル構成

| 種類           | ファイル                                                                                                                                                                                                                                                                                                                                        | 役割                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 新規           | `src/hooks/useCurrentMinute.ts`                                                                                                                                                                                                                                                                                                                 | 現在時刻（分）のストア。`getCurrentMinute`・`notifyCurrentMinute`・`useCurrentMinute` |
| 新規           | `src/hooks/__tests__/useCurrentMinute.test.ts`                                                                                                                                                                                                                                                                                                  | ストアの単体テスト                                                                    |
| 新規           | `src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx`                                                                                                                                                                                                                                                                | カード 5 つの配線テストと、復帰の検知からカードの色の更新までの通しのテスト           |
| 変更           | `src/features/routine/helpersPresentation.ts`                                                                                                                                                                                                                                                                                                   | `isRoutinePast(routine, nowMs)` を純粋な関数にする                                    |
| 変更           | `src/features/routine/components/routineItemModel.ts`                                                                                                                                                                                                                                                                                           | `getRoutineItemCardClassName` に `nowMinute` を足す                                   |
| 変更           | `src/features/routine/components/RoutineItem.tsx`・`SortableRoutineItem.tsx`・`SortableRoutineNormalDragItem.tsx`・`SortableRoutineEditModeItem.tsx`・`RoutineDragOverlay.tsx`                                                                                                                                                                  | `useCurrentMinute()` を呼び、`nowMinute` を渡す                                       |
| 変更           | `src/features/routine/hooks/useRoutineForegroundSync.ts`                                                                                                                                                                                                                                                                                        | 復帰時・フォールバックの回に `notifyCurrentMinute()` を呼ぶ                           |
| 変更（テスト） | `src/features/routine/__tests__/helpers.test.setup.ts`・`helpers.presentation.test.ts`・`jstToday.test.ts`・`routineItemModel.test.ts`・`RoutineItem.test.setup.ts`・`useRoutines.initial-and-mutations.test.ts`、`src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`、`src/__tests__/reactCompilerToday.contract.test.ts` | 既存テストの追随と追加                                                                |
| 変更（その他） | `src/features/test-matrix/detailed-test-cases/group-01-04.ts`、`docs/02-development/coding-standards.md`、`docs/03-testing/test-matrix.md`                                                                                                                                                                                                      | テストマトリクスとドキュメント                                                        |

---

### Task 1: 現在時刻のストア `useCurrentMinute`

**Files:**

- Create: `src/hooks/useCurrentMinute.ts`
- Test: `src/hooks/__tests__/useCurrentMinute.test.ts`

**Interfaces:**

- Consumes: なし
- Produces（Task 2・3 が使う。`src/hooks/useCurrentMinute.ts` の名前付き export）:
  - `getCurrentMinute(): number` — いまの「分」の開始時刻（epoch ミリ秒）
  - `notifyCurrentMinute(): void` — 購読しているコンポーネントに、現在時刻を読み直させる
  - `useCurrentMinute(): number` — 描画時に使う現在時刻（分単位の epoch ミリ秒）

- [ ] **Step 1: 失敗するテストを書く**

`src/hooks/__tests__/useCurrentMinute.test.ts` を次の内容で作る。

```ts
import { act, renderHook } from "@testing-library/react";
import {
  getCurrentMinute,
  notifyCurrentMinute,
  useCurrentMinute,
} from "../useCurrentMinute";

describe("useCurrentMinute", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-11-12T08:59:30+09:00"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("getCurrentMinute はいまの分の開始時刻（秒とミリ秒を切り捨てた値）を返す", () => {
    expect(getCurrentMinute()).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("同じ分のあいだは、時刻が進んでも同じ値を返す", () => {
    const first = getCurrentMinute();
    jest.setSystemTime(new Date("2026-11-12T08:59:59.999+09:00"));
    expect(getCurrentMinute()).toBe(first);
  });

  it("最初の描画で、いまの分を返す", () => {
    const { result } = renderHook(() => useCurrentMinute());
    expect(result.current).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("時計が進んでも、再描画も通知も無ければ値は変わらない", () => {
    const { result } = renderHook(() => useCurrentMinute());
    jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));
    expect(result.current).toBe(Date.parse("2026-11-12T08:59:00+09:00"));
  });

  it("分が変わった後に notifyCurrentMinute を呼ぶと、新しい分に更新される", () => {
    const { result } = renderHook(() => useCurrentMinute());
    jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));
    act(() => {
      notifyCurrentMinute();
    });
    expect(result.current).toBe(Date.parse("2026-11-12T09:01:00+09:00"));
  });

  it("同じ分のうちに notifyCurrentMinute を呼んでも、再描画しない", () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount += 1;
      return useCurrentMinute();
    });
    const countAfterMount = renderCount;
    jest.setSystemTime(new Date("2026-11-12T08:59:45+09:00"));
    act(() => {
      notifyCurrentMinute();
    });
    expect(renderCount).toBe(countAfterMount);
  });

  it("アンマウント後は購読を解除し、notifyCurrentMinute を呼んでも時刻を読みに来ない", () => {
    const { unmount } = renderHook(() => useCurrentMinute());
    const dateNowSpy = jest.spyOn(Date, "now");

    // 対照: マウント中は、通知で購読者が時刻を読みに来る
    act(() => {
      notifyCurrentMinute();
    });
    expect(dateNowSpy).toHaveBeenCalled();

    unmount();
    dateNowSpy.mockClear();
    notifyCurrentMinute();
    expect(dateNowSpy).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/hooks/__tests__/useCurrentMinute.test.ts`
Expected: FAIL（`Cannot find module '../useCurrentMinute'`）

- [ ] **Step 3: 実装を書く**

`src/hooks/useCurrentMinute.ts` を次の内容で作る。

```ts
import { useSyncExternalStore } from "react";

const MINUTE_MS = 60_000;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** いまの「分」の開始時刻（epoch ミリ秒）。同じ分のあいだは同じ値を返す */
export const getCurrentMinute = (): number =>
  Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS;

/** 表示に使う現在時刻を読み直させる（アプリがバックグラウンドから戻ったときなどに呼ぶ） */
export const notifyCurrentMinute = (): void => {
  listeners.forEach((listener) => listener());
};

/**
 * 描画時に使う現在時刻（分単位）。
 * notifyCurrentMinute() が呼ばれ、分が変わっていれば、このフックを使うコンポーネントが再描画される。
 */
export const useCurrentMinute = (): number =>
  useSyncExternalStore(subscribe, getCurrentMinute, getCurrentMinute);
```

- [ ] **Step 4: テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/hooks/__tests__/useCurrentMinute.test.ts`
Expected: PASS（7 件）

- [ ] **Step 5: lint と整形を確かめる**

Run: `npx eslint --max-warnings 0 src/hooks/useCurrentMinute.ts src/hooks/__tests__/useCurrentMinute.test.ts && npx prettier --check src/hooks/useCurrentMinute.ts src/hooks/__tests__/useCurrentMinute.test.ts`
Expected: エラー・警告なし。prettier が差分を報告したら `npx prettier --write <ファイル>` で整形し、Step 4 を再実行する。

コミットはしない。

---

### Task 2: `isRoutinePast` を純粋な関数にし、カードへ現在時刻を渡す

**Files:**

- Modify: `src/features/routine/helpersPresentation.ts:2-13`
- Modify: `src/features/routine/components/routineItemModel.ts`（`RoutineItemCardClassParams` と `getRoutineItemCardClassName`）
- Modify: `src/features/routine/components/RoutineItem.tsx`、`SortableRoutineItem.tsx`、`SortableRoutineNormalDragItem.tsx`、`SortableRoutineEditModeItem.tsx`、`RoutineDragOverlay.tsx`
- Modify（テスト）: `src/features/routine/__tests__/helpers.test.setup.ts`、`helpers.presentation.test.ts`、`jstToday.test.ts`、`routineItemModel.test.ts`、`RoutineItem.test.setup.ts`、`src/__tests__/reactCompilerToday.contract.test.ts`
- Create（テスト）: `src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx`

**Interfaces:**

- Consumes（Task 1。`@/hooks/useCurrentMinute`）: `useCurrentMinute(): number`、`notifyCurrentMinute(): void`
- Consumes（既存。`@/lib/storage/core`）: `toJstDay(date: Date): number`、`toJstTime(date: Date): string`（`"HH:MM"`）、`timeToMinutes(time: string): number`
- Produces:
  - `isRoutinePast(routine: Routine, nowMs: number): boolean`（`src/features/routine/helpersPresentation.ts`。`helpers.ts`・`index.ts` の再 export はそのまま）
  - `getRoutineItemCardClassName({ routine, isEditMode, isDraggable, isDragging?, nowMinute }): string`（`nowMinute: number` は必須）

#### テストを先に書く

- [ ] **Step 1: `helpers.test.setup.ts` の `@/lib/storage/core` のモックの `getCurrentTime` を `toJstTime` に置き換える**

`src/features/routine/__tests__/helpers.test.setup.ts` のモックを次のようにする（`getCurrentTime: jest.fn(),` を `toJstTime: jest.fn(),` に置き換える）。

```ts
jest.mock("@/lib/storage/core", () => ({
  getTodayString: jest.fn(),
  toJstDay: jest.fn(),
  toJstTime: jest.fn(),
  timeToMinutes: jest.fn((time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }),
}));
```

同じファイルの `mockGetCurrentTime` の export（次の 4 行）を、

```ts
export const mockGetCurrentTime =
  coreStorage.getCurrentTime as jest.MockedFunction<
    typeof coreStorage.getCurrentTime
  >;
```

次の `mockToJstTime` に置き換える（`mockGetCurrentTime` を使うのは `helpers.presentation.test.ts` だけで、Step 2 で使わなくなる）。

```ts
export const mockToJstTime = coreStorage.toJstTime as jest.MockedFunction<
  typeof coreStorage.toJstTime
>;
```

- [ ] **Step 2: `helpers.presentation.test.ts` の `isRoutinePast` のテストを書き換える**

`src/features/routine/__tests__/helpers.presentation.test.ts` の setup からの import を次のようにする（`mockGetCurrentTime` を `mockToJstTime` に替える）。

```ts
import {
  baseRoutine,
  mockToJstDay,
  mockToJstTime,
  mockGetSettings,
  setupHelpersDefaults,
} from "./helpers.test.setup";
```

import の下（`describe` の前）に定数を足す。

```ts
/** isRoutinePast に渡す現在時刻。曜日と時刻はモックで決めるので、値そのものは判定に影響しない */
const NOW_MS = Date.parse("2026-11-12T09:00:00+09:00");
```

既存の 2 つのテスト（「isRoutinePastは当日かつ時刻超過でtrue」「開始時刻が1桁時の旧データでも時刻超過を正しく判定する」）を、次の 4 つに置き換える。

```ts
it("isRoutinePastは当日かつ時刻超過でtrue", () => {
  mockToJstDay.mockReturnValue(1);
  mockToJstTime.mockReturnValue("09:00");
  expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(true);
  // 曜日と時刻は、渡した時刻から求める（関数の中で時計を読まない）
  expect(mockToJstDay).toHaveBeenCalledWith(new Date(NOW_MS));
  expect(mockToJstTime).toHaveBeenCalledWith(new Date(NOW_MS));
});

it("開始時刻が1桁時の旧データでも時刻超過を正しく判定する", () => {
  mockToJstDay.mockReturnValue(1);
  mockToJstTime.mockReturnValue("09:00");
  expect(isRoutinePast({ ...baseRoutine, startTime: "8:30" }, NOW_MS)).toBe(
    true,
  );
});

it("開始時刻ちょうどは、まだ超過にしない", () => {
  mockToJstDay.mockReturnValue(1);
  mockToJstTime.mockReturnValue("08:00");
  expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(false);
});

it("今日の曜日でないルーティンは、時刻を過ぎていても超過にしない", () => {
  mockToJstDay.mockReturnValue(2);
  mockToJstTime.mockReturnValue("09:00");
  expect(isRoutinePast(baseRoutine, NOW_MS)).toBe(false);
});
```

（`baseRoutine` は `startTime: "08:00"`、`daysOfWeek: [1]`。）

- [ ] **Step 3: `jstToday.test.ts` の `isRoutinePast` のテストを書き換え、純粋性と 0 時またぎのテストを足す**

`src/features/routine/__tests__/jstToday.test.ts` の最後の 2 つのテスト（「経過判定も当日の曜日と JST の時刻で行う」「別の曜日のルーティンは経過扱いにしない」）を、次の 4 つに置き換える。`shouldShowRoutineToday` の 2 つのテストは変えない。

```ts
it("経過判定も当日の曜日と JST の時刻で行う", () => {
  // 木曜 07:00 JST。06:00 開始のルーティンは過ぎている
  const nowMs = Date.parse("2026-08-12T22:00:00Z");

  expect(isRoutinePast(routineOn(4, "06:00"), nowMs)).toBe(true);
  expect(isRoutinePast(routineOn(4, "08:00"), nowMs)).toBe(false);
});

it("別の曜日のルーティンは経過扱いにしない", () => {
  const nowMs = Date.parse("2026-08-12T22:00:00Z");

  expect(isRoutinePast(routineOn(3, "06:00"), nowMs)).toBe(false);
});

it("経過判定は渡した時刻だけで決まり、システムの時計を読まない", () => {
  // システムの時計は 木曜 05:00 JST。渡す時刻は 木曜 07:00 JST
  jest.useFakeTimers().setSystemTime(new Date("2026-08-12T20:00:00Z"));
  expect(
    isRoutinePast(routineOn(4, "06:00"), Date.parse("2026-08-12T22:00:00Z")),
  ).toBe(true);

  // 逆: システムの時計は 木曜 07:00 JST。渡す時刻は 木曜 05:00 JST
  jest.setSystemTime(new Date("2026-08-12T22:00:00Z"));
  expect(
    isRoutinePast(routineOn(4, "06:00"), Date.parse("2026-08-12T20:00:00Z")),
  ).toBe(false);
});

it("0 時をまたいだ後は、新しい日の曜日で経過を判定する", () => {
  // 2026-08-14(金) 00:30 JST = 2026-08-13 15:30 UTC
  const nowMs = Date.parse("2026-08-13T15:30:00Z");

  expect(isRoutinePast(routineOn(5, "00:10"), nowMs)).toBe(true);
  // 前日（木曜）のルーティンは、時刻を過ぎていても経過扱いにしない
  expect(isRoutinePast(routineOn(4, "00:10"), nowMs)).toBe(false);
});
```

- [ ] **Step 4: `routineItemModel.test.ts` に `nowMinute` を足す**

`src/features/routine/__tests__/routineItemModel.test.ts` を次のように変える。

`describe("routineItemModel", () => {` の直後、`const routine: Routine = {` の前に定数を足す。

```ts
/** カードの色の計算に渡す現在時刻（isRoutinePast はモックなので、値そのものは色に影響しない） */
const NOW_MINUTE = Date.parse("2026-11-12T09:00:00+09:00");
```

このファイルの `getRoutineItemCardClassName({ ... })` の呼び出しは 6 箇所ある（「isDraggableとisEditModeに応じたカードclassを返す」に 3 箇所、「isDragging=true の…」の 3 つのテストに 1 箇所ずつ）。6 箇所すべての引数のオブジェクトの最後に `nowMinute: NOW_MINUTE,` を足す。例:

```ts
expect(
  getRoutineItemCardClassName({
    routine,
    isEditMode: false,
    isDraggable: false,
    nowMinute: NOW_MINUTE,
  }),
).toContain("cursor-pointer");
```

```ts
const className = getRoutineItemCardClassName({
  routine,
  isEditMode: false,
  isDraggable: false,
  isDragging: true,
  nowMinute: NOW_MINUTE,
});
```

`describe` の最後（「isDragging=true かつ isPast=true のとき過去背景色（bg-yellow-50）を使う」の後）にテストを 1 つ足す。

```ts
it("渡された nowMinute を、そのまま isRoutinePast に渡す", () => {
  (isRoutinePast as jest.Mock).mockClear();
  getRoutineItemCardClassName({
    routine,
    isEditMode: false,
    isDraggable: false,
    nowMinute: NOW_MINUTE,
  });
  expect(isRoutinePast).toHaveBeenCalledTimes(1);
  expect(isRoutinePast).toHaveBeenCalledWith(routine, NOW_MINUTE);
});
```

- [ ] **Step 5: `RoutineItem.test.setup.ts` の `@/lib/storage/core` のモックの `getCurrentTime` を `toJstTime` に置き換える**

`src/features/routine/__tests__/RoutineItem.test.setup.ts` のモックの `getCurrentTime: jest.fn(() => "12:00"),` を、`toJstTime: jest.fn(() => "12:00"),` に置き換える（`RoutineItem.render.test.tsx`・`RoutineItem.actions.test.tsx` が本物の `isRoutinePast` を通り、実装後は `toJstTime` を呼ぶため）。ほかの行は変えない。

```ts
  toJstTime: jest.fn(() => "12:00"),
```

- [ ] **Step 6: 配線テストを書く**

`src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx` を次の内容で作る。

```tsx
import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { notifyCurrentMinute } from "@/hooks/useCurrentMinute";
import type { Routine } from "@/types/routine";
import { RoutineDragOverlay } from "../RoutineDragOverlay";
import { RoutineItem } from "../RoutineItem";
import { SortableRoutineEditModeItem } from "../SortableRoutineEditModeItem";
import { SortableRoutineItem } from "../SortableRoutineItem";
import { SortableRoutineNormalDragItem } from "../SortableRoutineNormalDragItem";

// このテストは「コンポーネントが useCurrentMinute を購読し、その値をカードの色の計算へ渡している」
// ことを確かめる。時刻の判定（isRoutinePast）と色の決定（getRoutineCardStyle）は本物を使う。
// @/lib/storage/core も本物を使い、jest.setSystemTime で進めた時刻がそのまま判定に届くようにする
// （RoutineItem.test.setup.ts は曜日と時刻を固定するので、ここでは使わない）。

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => undefined) } },
}));

/** 毎日 09:00 開始の未完了ルーティン（曜日に左右されないよう、全曜日を対象にする） */
const routine: Routine = {
  id: "r1",
  title: "朝のストレッチ",
  startTime: "09:00",
  duration: 30,
  category: "health",
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const CASES: Array<[string, ReactElement]> = [
  [
    "RoutineItem",
    <RoutineItem
      key="RoutineItem"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
  ],
  [
    "SortableRoutineItem（表示モード）",
    <SortableRoutineItem
      key="SortableRoutineItem"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
      isEditMode={false}
    />,
  ],
  [
    "SortableRoutineNormalDragItem",
    <SortableRoutineNormalDragItem
      key="SortableRoutineNormalDragItem"
      routine={routine}
      onToggleAction={jest.fn()}
      isDragActive={false}
    />,
  ],
  [
    "SortableRoutineEditModeItem",
    <SortableRoutineEditModeItem
      key="SortableRoutineEditModeItem"
      routine={routine}
      onEditAction={jest.fn()}
      onDeleteAction={jest.fn()}
      onSwipeAction={jest.fn()}
      swipeActionType="delete"
    />,
  ],
  [
    "RoutineDragOverlay",
    <RoutineDragOverlay key="RoutineDragOverlay" routine={routine} />,
  ],
];

describe("ルーティンのカードの色が、現在時刻の通知で更新される（配線テスト）", () => {
  beforeEach(() => {
    // 開始時刻（09:00）の 1 分前
    jest.useFakeTimers().setSystemTime(new Date("2026-11-12T08:59:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(CASES)(
    "%s: props を変えずに開始時刻を過ぎて通知すると、超過の色（黄）になる",
    (_name, element) => {
      const { container } = render(element);

      // 開始時刻の前: 超過の色ではなく、通常の色（白）
      expect(container.querySelector(".bg-yellow-50")).toBeNull();
      expect(container.querySelector(".bg-white")).not.toBeNull();

      // 開始時刻を過ぎただけでは変わらない（通知が無いと再描画されない）
      jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));
      expect(container.querySelector(".bg-yellow-50")).toBeNull();

      // 復帰時の通知で、再読み込みも props の変更も無しに色が変わる
      act(() => {
        notifyCurrentMinute();
      });
      expect(container.querySelector(".bg-yellow-50")).not.toBeNull();
      expect(container.querySelector(".bg-white")).toBeNull();
    },
  );
});
```

- [ ] **Step 7: 契約テストに 5 つのコンポーネントを足す**

`src/__tests__/reactCompilerToday.contract.test.ts` を次のように変える。

(a) 先頭のコメントの 1 行目を、

```ts
// React Compiler の契約テスト: 描画時に求めた「今日」が、最初の描画の値に固定されないこと。
```

次に置き換える。

```ts
// React Compiler の契約テスト: 描画時に求めた「今日」「現在時刻」が、最初の描画の値に固定されないこと。
```

(b) 同じコメントの、

```ts
// 新しく今日を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す。
```

を、次に置き換える。

```ts
// 新しく今日・現在時刻を使うフック・コンポーネントを直したら、下の TODAY_TARGETS に足す
// （現在時刻は src/hooks/useCurrentMinute.ts の useCurrentMinute() から取る）。
```

(c) `TodayTarget` の `hookCall` の JSDoc を、次に置き換える。

```ts
  /**
   * ソースが呼んでいるべき、今日・現在時刻を返すフック（src/hooks/useToday.ts の共通フック、
   * src/hooks/useCurrentMinute.ts の useCurrentMinute、または USE_NO_MEMO_TARGETS の機能側の関数）。
   * 今日を引数で受け取るだけのファイルは持たない
   */
  hookCall?: string;
```

(d) `dependencies` の JSDoc を、次に置き換える。

```ts
  /** 今日・現在時刻（またはそこから求めた値）を入れる変数。コンパイル結果で、メモ化の依存の比較に入っているべきもの */
  dependencies: string[];
```

(e) `TODAY_TARGETS` の最後の要素（`src/features/journal/weekly/useWeeklyLogState.ts`）の後、配列を閉じる `];` の前に、次の 5 つを足す。

```ts
  // ルーティンのカード: 現在時刻（分）が、カードのクラス（超過の色）の計算の依存に入る。
  // 依存から外れると、開始時間を過ぎても、バックグラウンドから戻っても色が変わらない（#9）
  {
    file: "src/features/routine/components/RoutineItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineNormalDragItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/SortableRoutineEditModeItem.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
  {
    file: "src/features/routine/components/RoutineDragOverlay.tsx",
    hookCall: "useCurrentMinute(",
    dependencies: ["nowMinute"],
  },
```

(f) ファイルの末尾付近の、

```ts
      it(`ソースが今日を返すフック ${hookCall} を呼んでいる`, () => {
```

を、次に置き換える。

```ts
      it(`ソースが今日・現在時刻を返すフック ${hookCall} を呼んでいる`, () => {
```

`describe` の題名（「React Compiler で「今日」が固定されない（契約テスト）」）と、検証の本体は変えない。

- [ ] **Step 8: テストが失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/__tests__/helpers.presentation.test.ts src/features/routine/__tests__/jstToday.test.ts src/features/routine/__tests__/routineItemModel.test.ts src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx src/__tests__/reactCompilerToday.contract.test.ts`

Expected: 5 ファイルとも FAIL。

- `helpers.presentation.test.ts`・`jstToday.test.ts`・`routineItemModel.test.ts`: `isRoutinePast` の第 2 引数、または `nowMinute` が型に無い（TS2554・TS2353）ことによる型エラー
- `routineItemPastColor.wiring.test.tsx`: 5 件とも、通知の後の `expect(container.querySelector(".bg-yellow-50")).not.toBeNull()` で失敗（通知の前の検証は通る）
- `reactCompilerToday.contract.test.ts`: 足した 5 ファイルの「メモ化の依存の比較に nowMinute がある」と「ソースが今日・現在時刻を返すフック useCurrentMinute( を呼んでいる」が失敗（既存の対象は通る）

#### 実装する

- [ ] **Step 9: `isRoutinePast` を純粋な関数にする**

`src/features/routine/helpersPresentation.ts` の 2 行目の import を、

```ts
import { getCurrentTime, timeToMinutes, toJstDay } from "@/lib/storage/core";
```

次に置き換える。

```ts
import { timeToMinutes, toJstDay, toJstTime } from "@/lib/storage/core";
```

`isRoutinePast`（5〜13 行目）を、次に置き換える。

```ts
/**
 * 今日（JST）の曜日のルーティンで、開始時刻を過ぎているか。
 * 現在時刻は引数で受け取る（関数の中で時計を読むと、React Compiler のもとで
 * 呼び出し側のメモ化のキーに時刻が入らず、判定が最初の描画の値に固定される）。
 *
 * @param nowMs 判定に使う現在時刻（epoch ミリ秒）。描画時は useCurrentMinute() の値を渡す
 */
export const isRoutinePast = (routine: Routine, nowMs: number): boolean => {
  const now = new Date(nowMs);
  const isTodayRoutine = routine.daysOfWeek.includes(toJstDay(now));
  return (
    isTodayRoutine &&
    timeToMinutes(toJstTime(now)) > timeToMinutes(routine.startTime)
  );
};
```

`getCurrentTime` は `@/lib/storage/core` から消さない（`src/features/meal/utils/mealFormat.ts` が使っている）。

- [ ] **Step 10: `getRoutineItemCardClassName` に `nowMinute` を足す**

`src/features/routine/components/routineItemModel.ts` の `RoutineItemCardClassParams` を、次のようにする（`nowMinute` を足す）。

```ts
type RoutineItemCardClassParams = {
  routine: Routine;
  isEditMode: boolean;
  isDraggable: boolean;
  /** ドラッグ中（このアイテム自身がドラッグされている）か否か */
  isDragging?: boolean;
  /** 表示に使う現在時刻（分単位の epoch ミリ秒）。useCurrentMinute() の値を渡す */
  nowMinute: number;
};
```

`getRoutineItemCardClassName` の引数の分割代入と、`isRoutinePast` の呼び出しを、次のようにする（関数のほかの部分は変えない）。

```ts
export const getRoutineItemCardClassName = ({
  routine,
  isEditMode,
  isDraggable,
  isDragging = false,
  nowMinute,
}: RoutineItemCardClassParams): string => {
  const isPast = isRoutinePast(routine, nowMinute);
```

- [ ] **Step 11: カードのコンポーネント 5 つで `useCurrentMinute()` を呼び、`nowMinute` を渡す**

5 つのファイルすべてに、import を 1 行足す（`@/` で始まる import の並びの中、相対パスの import より前に置く）。

```ts
import { useCurrentMinute } from "@/hooks/useCurrentMinute";
```

(a) `src/features/routine/components/RoutineItem.tsx`

本体の最初の文 `const settings = getSettings();` の前に足す。

```ts
const nowMinute = useCurrentMinute();
const settings = getSettings();
```

`getRoutineItemCardClassName` の呼び出しに `nowMinute,` を足す。

```tsx
      className={`${getRoutineItemCardClassName({
        routine,
        isEditMode,
        isDraggable: false,
        nowMinute,
      })} flex-col sm:flex-row sm:items-center`}
```

(b) `src/features/routine/components/SortableRoutineItem.tsx`

本体の最初の文 `const settings = getSettings();` の前に足す（`if (shouldUseSwipeOnlyRoutineItem(isEditMode)) {` の早期 return より前になる）。

```ts
const nowMinute = useCurrentMinute();
const settings = getSettings();
```

`getRoutineItemCardClassName` の呼び出しに `nowMinute,` を足す。

```tsx
          className={getRoutineItemCardClassName({
            routine,
            isEditMode,
            isDraggable: false,
            nowMinute,
          })}
```

(c) `src/features/routine/components/SortableRoutineNormalDragItem.tsx`

本体の最初の文（`const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: routine.id });`）の前に足す。

```ts
const nowMinute = useCurrentMinute();
```

`getRoutineItemCardClassName` の呼び出しに `nowMinute,` を足す。

```tsx
      className={getRoutineItemCardClassName({
        routine,
        isEditMode: false,
        isDraggable: false,
        isDragging,
        nowMinute,
      })}
```

(d) `src/features/routine/components/SortableRoutineEditModeItem.tsx`

本体の最初の文（`useSortable({ id: routine.id })` の分割代入）の前に足す。

```ts
const nowMinute = useCurrentMinute();
```

`getRoutineItemCardClassName` の呼び出しに `nowMinute,` を足す。

```tsx
        className={getRoutineItemCardClassName({
          routine,
          isEditMode: true,
          isDraggable: true,
          isDragging,
          nowMinute,
        })}
```

(e) `src/features/routine/components/RoutineDragOverlay.tsx`

`if (!routine) return null;` の前に足す（フックは早期 return より前で呼ぶ）。

```tsx
export const RoutineDragOverlay = ({ routine }: Props) => {
  const nowMinute = useCurrentMinute();
  if (!routine) return null;
```

`getRoutineItemCardClassName` の呼び出しに `nowMinute,` を足す。

```tsx
        getRoutineItemCardClassName({
          routine,
          isEditMode: false,
          isDraggable: false,
          nowMinute,
        }) +
```

（`+` 以降の `" shadow-xl opacity-95 ring-2 ring-blue-400 dark:ring-blue-500"` は変えない。）

- [ ] **Step 12: テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/__tests__/helpers.presentation.test.ts src/features/routine/__tests__/jstToday.test.ts src/features/routine/__tests__/routineItemModel.test.ts src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx src/__tests__/reactCompilerToday.contract.test.ts`
Expected: 5 ファイルとも PASS

- [ ] **Step 13: ルーティンと共通フックのテスト全体、型、lint、整形を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine src/hooks src/__tests__`
Expected: すべて PASS。`toJstTime is not a function` で落ちるテストがあれば、そのテストの `@/lib/storage/core` のモックに `toJstTime` を足す（Step 5 と同じ形）。

Run: `npm run typecheck`
Expected: エラーなし（`getRoutineItemCardClassName` の呼び出しで `nowMinute` を渡し忘れていれば、ここで TS2345 になる）

Run: `git status --short` で変更・追加したファイルを確かめ、そのうち `.ts`・`.tsx` を `npx eslint --max-warnings 0 <ファイル...>` と `npx prettier --check <ファイル...>` にかける。
Expected: エラー・警告なし。prettier が差分を報告したら `npx prettier --write <ファイル...>` で整形し、Step 12 を再実行する。

コミットはしない。

---

### Task 3: 復帰時とフォールバックの回に現在時刻を通知する

**Files:**

- Modify: `src/features/routine/hooks/useRoutineForegroundSync.ts`
- Test: `src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`

**Interfaces:**

- Consumes（Task 1。`@/hooks/useCurrentMinute`）: `notifyCurrentMinute(): void`
- Produces: なし（`useRoutineForegroundSync` のシグネチャは変えない）

- [ ] **Step 1: 失敗するテストを書く**

`src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx` を次のように変える。

(a) `jest.mock("../useRoutineFallbackTimer", ...)` の後、`import { refreshRoutineState } from "../routineStateSync";` の前に、モックを足す。

```ts
// 現在時刻の通知は、呼ばれた回数だけを検証する（購読しているコンポーネントはここには無い）
jest.mock("@/hooks/useCurrentMinute", () => ({
  notifyCurrentMinute: jest.fn(),
}));
```

(b) import を足す（`import { refreshRoutineState } from "../routineStateSync";` の前の行）。

```ts
import { notifyCurrentMinute } from "@/hooks/useCurrentMinute";
```

(c) `beforeEach` の `(refreshRoutineState as jest.Mock).mockClear();` の次の行に足す。

```ts
(notifyCurrentMinute as jest.Mock).mockClear();
```

(d) 「フォールバック tick: 直近でルーティン更新があればスキップする」のテストの後（`it("isLoaded=false のとき listener を登録しない", ...)` の前）に、次の 3 つを足す。

```ts
// ── 現在時刻の通知 ───────────────────────────────────────────

it("同一 tick の複数の復帰イベントをまとめた後に、現在時刻を 1 回だけ通知する", () => {
  const setRoutines = jest.fn();
  renderHook(() =>
    useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
  );

  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("pageshow"));
    window.dispatchEvent(new Event("focus"));
    // まとめる前（タイマーが発火する前）には通知しない
    expect(notifyCurrentMinute).not.toHaveBeenCalled();
    jest.advanceTimersByTime(0);
  });

  expect(notifyCurrentMinute).toHaveBeenCalledTimes(1);
});

it("スケジュール登録後に hidden になると、現在時刻を通知しない", () => {
  let visibilityState: DocumentVisibilityState = "visible";
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibilityState,
  });
  const setRoutines = jest.fn();
  renderHook(() =>
    useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
  );

  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    visibilityState = "hidden";
    jest.advanceTimersByTime(0);
  });

  expect(notifyCurrentMinute).not.toHaveBeenCalled();
});

it("フォールバック tick: スキップ条件が成り立っても現在時刻は通知し、refreshRoutineState は呼ばない", () => {
  activateRealTimer();
  const setRoutines = jest.fn();
  renderHook(() =>
    useRoutineForegroundSync(true, setRoutines, [], FALLBACK_INTERVAL_MS),
  );

  act(() => {
    jest.advanceTimersByTime(FALLBACK_INTERVAL_MS - 60_000);
  });
  // 直近でルーティンが更新された（refreshRoutineState はスキップされる条件）
  mockLastUpdateRef.current = Date.now();
  expect(notifyCurrentMinute).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(60_000);
  });

  expect(notifyCurrentMinute).toHaveBeenCalledTimes(1);
  expect(refreshRoutineState).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: テストが失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`
Expected: 足した 3 つのうち、「…現在時刻を 1 回だけ通知する」と「フォールバック tick: スキップ条件が成り立っても…」の 2 つが FAIL（`Expected number of calls: 1` / `Received number of calls: 0`）。「…hidden になると、現在時刻を通知しない」は、通知の呼び出しがまだ無いので PASS のままでよい（実装後に、非表示では通知しないことを守るテストになる）。既存のテストは PASS。

- [ ] **Step 3: 実装を書く**

`src/features/routine/hooks/useRoutineForegroundSync.ts` を次のように変える。

(a) import を足す（`import type { Routine } from "@/types/routine";` の前の行）。

```ts
import { notifyCurrentMinute } from "@/hooks/useCurrentMinute";
```

(b) フックの JSDoc を、次に置き換える。

```ts
/**
 * フォアグラウンド復帰検知フック
 *
 * visibilitychange / pageshow / focus の3イベントを購読し、
 * 同一 tick 内の複数発火を setTimeout(0) + ref によって1回の
 * refreshRoutineState 呼び出しに束ねる（coalesce）。
 * フォールバックタイマーを使ってイベント見逃しを補完する。
 *
 * 復帰時とフォールバックタイマーの回には、表示中であれば、表示に使う現在時刻も
 * 読み直させる（notifyCurrentMinute）。開始時間を過ぎたルーティンのカードの色は、
 * この通知で更新される。通知は、refreshRoutineState のスキップ条件の対象にしない
 * （同じ分のうちの通知は再描画を起こさないので、止める必要が無い）。
 *
 * @param backgroundRefreshIntervalMs フォールバックタイマーの間隔（ミリ秒）。0 の場合は無効。
 */
```

(c) `runRefresh` を、次に置き換える。

```ts
const runRefresh = (force: boolean) => {
  if (document.visibilityState !== "visible") return;
  // 表示に使う現在時刻は、スキップ条件に関係なく読み直させる
  notifyCurrentMinute();
  if (!force && shouldSkipFallbackRefresh()) return;
  refreshRoutineState(setRoutines);
  lastBackgroundRefreshAtRef.current = Date.now();
};
```

ほかの部分（`scheduleRefresh`、イベントのハンドラ、`useEffect` の依存の配列）は変えない。

- [ ] **Step 4: テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`
Expected: PASS（既存 16 件 + 追加 3 件 = 19 件）

- [ ] **Step 5: 関連テスト、型、lint、整形を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine`
Expected: すべて PASS

Run: `npm run typecheck && npx eslint --max-warnings 0 src/features/routine/hooks/useRoutineForegroundSync.ts src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx && npx prettier --check src/features/routine/hooks/useRoutineForegroundSync.ts src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`
Expected: エラー・警告なし。prettier が差分を報告したら `npx prettier --write <ファイル>` で整形し、Step 4 を再実行する。

コミットはしない。

---

### Task 4: ドキュメント・テストマトリクスの更新と、全体の検証

**Files:**

- Modify: `docs/02-development/coding-standards.md`（「React Compiler と今日・現在時刻」、レビューの確認項目、最終更新日）
- Modify: `docs/03-testing/test-matrix.md:71`
- Modify: `src/features/test-matrix/detailed-test-cases/group-01-04.ts`（`"2-24"`）
- Modify: `src/features/routine/__tests__/useRoutines.initial-and-mutations.test.ts:75-76`（コメントだけ）

**Interfaces:**

- Consumes: Task 1〜3 の実装が作業ツリーにあること（Step 6〜8 の検証で使う）
- Produces: なし

- [ ] **Step 1: `coding-standards.md` に、描画時の現在時刻の規約を足す**

`docs/02-development/coding-standards.md` の「### React Compiler と今日・現在時刻」の箇条書きで、「- **機能側の関数（祝日の判定など）を描画のたびに呼ぶ必要があるとき**は、…」の項目の前（「- **描画時に今日が必要なとき**は …」の項目の後）に、次の項目を足す。

```markdown
- **描画時に現在時刻が必要なとき**は `src/hooks/useCurrentMinute.ts` の `useCurrentMinute()` を使ってください。戻り値は、いまの「分」の開始時刻（epoch ミリ秒）です。現在時刻で判定する関数は、中で時計を読まずに、時刻を引数で受け取る純粋な関数にし、フックの戻り値を渡してください（例: `isRoutinePast(routine, nowMs)`）。関数の中で時計を読むと、コンパイラのメモ化のキーに時刻が入らず、判定が最初の描画の値に固定されます（#9）。毎分のタイマーはありません。現在時刻を読み直させたいとき（アプリがバックグラウンドから戻ったときなど）は `notifyCurrentMinute()` を呼んでください。分が変わっていれば、フックを使うコンポーネントが再描画されます（ルーティンでは `useRoutineForegroundSync` が、復帰時とフォールバックタイマーの回に呼びます）。
```

同じ箇条書きの、

```markdown
- **新しく今日を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足してください。コンパイル結果で、今日が固定されていないことを確かめます。
```

を、次に置き換える。

```markdown
- **新しく今日・現在時刻を使うフック・コンポーネントを直したら**、契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に足してください。コンパイル結果で、今日・現在時刻が固定されていないことを確かめます。
```

レビューの確認項目の、

```markdown
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか、`useState` の初期化で取った今日を画面に出す今日（日付のラベル・祝日・既定の選択）に使っていないか確認してください（前者は React Compiler で固定され、後者は日をまたいでも古いまま残る。「React Compiler と今日・現在時刻」）。
```

を、次に置き換える。

```markdown
- フック・コンポーネントの本体で「今日」「現在時刻」を求めていないか、現在時刻で判定する関数が中で時計を読んでいないか（`useCurrentMinute()` の値を引数で渡す）、`useState` の初期化で取った今日を画面に出す今日（日付のラベル・祝日・既定の選択）に使っていないか確認してください（前の 2 つは React Compiler で固定され、最後は日をまたいでも古いまま残る。「React Compiler と今日・現在時刻」）。
```

ファイルの末尾の `**最終更新日**: 2026年11月8日` を `**最終更新日**: 2026年11月12日` にする。

- [ ] **Step 2: `test-matrix.md` の 2-24 の備考を直す**

`docs/03-testing/test-matrix.md` の 71 行目（`| 2-24 | ルーティンカード色分け（完了/超過/未完了） | …`）の備考、

```
緑/黄/白（復帰イベント即時再評価 + 30分フォールバック）
```

を、次に置き換える（ほかの列は変えない）。

```
緑/黄/白（復帰時と30分フォールバックの回に現在時刻を通知して再評価）
```

Run: `npx prettier --write docs/03-testing/test-matrix.md docs/02-development/coding-standards.md && git diff --stat docs/`
Expected: `test-matrix.md` の差分は 2-24 の 1 行だけ（表の桁揃えで周りの行まで変わった場合は、その表の範囲に収まっていることを `git diff docs/03-testing/test-matrix.md` で確かめる）。

- [ ] **Step 3: テストマトリクスの詳細ケース 2-24 を直す**

`src/features/test-matrix/detailed-test-cases/group-01-04.ts` の `"2-24"` で、`2-24-2` の

```ts
      expected: "超過カラー（赤/警告系）で表示",
```

を、次に置き換える（実装の色は黄）。

```ts
      expected: "超過カラー（黄系）で表示",
```

`2-24-3` の要素の後（`"2-24"` の配列を閉じる `],` の前）に、次の要素を足す。

```ts
    {
      id: "2-24-4",
      scenario:
        "アプリを終了せずにバックグラウンドへ回し、未完了ルーティンの開始時間を過ぎてから戻す",
      expected: "再読み込みなしで超過カラー（黄系）に変わる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
```

- [ ] **Step 4: `useRoutines.initial-and-mutations.test.ts` のコメントを訂正する**

`src/features/routine/__tests__/useRoutines.initial-and-mutations.test.ts` の 75〜76 行目の、

```ts
// 日付が変わっていないため完了状態はリセットされないが、
// isRoutinePast() 再評価のために新しい配列参照が返されデータは保持される
```

を、次に置き換える（テストの本体は変えない）。

```ts
// 日付が変わっていないため完了状態はリセットされず、データは保持される
// （超過の色の再評価は、配列の参照ではなく、現在時刻の通知 notifyCurrentMinute で行う）
```

- [ ] **Step 5: 全体の検証を通す**

Run: `npm run verify:fast`
Expected: tailwind:scan・lint・typecheck・typecheck:functions・jest がすべて成功。jest が途中で黙って落ちたときは `npx cross-env TZ=Asia/Tokyo jest -w 1 --forceExit` で再実行し、結果を確かめる。

#### テストが退行を検出することを確かめる（L-690）

次の 3 つは、コードを一時的に壊して、テストが失敗することを確かめる手順である。**壊す前にファイルを退避し、確かめた後は退避したファイルで必ず元に戻す。** `git checkout`・`git restore`・`git stash` は使わない（未コミットの実装が消える）。退避先は、リポジトリの外に作る。

```bash
BACKUP_DIR="$(mktemp -d)"
```

（以降の手順で同じシェルを使えない場合は、表示されたパスを控えて、そのパスを直接書く。）

- [ ] **Step 6: 確認 1 — コンポーネントが `nowMinute` を渡さない退行**

```bash
cp src/features/routine/components/RoutineItem.tsx "$BACKUP_DIR/RoutineItem.tsx"
```

`src/features/routine/components/RoutineItem.tsx` の `getRoutineItemCardClassName` の呼び出しの `nowMinute,` を、固定の値 `nowMinute: 0,` に変える。

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerToday.contract.test.ts src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx`
Expected: FAIL。契約テストの `src/features/routine/components/RoutineItem.tsx` の「メモ化の依存の比較に nowMinute がある」と、配線テストの「RoutineItem: …」が失敗する（ほかの 4 つのコンポーネントの分は通る）。

元に戻す。

```bash
cp "$BACKUP_DIR/RoutineItem.tsx" src/features/routine/components/RoutineItem.tsx
```

- [ ] **Step 7: 確認 2 — 復帰時に通知しない退行**

```bash
cp src/features/routine/hooks/useRoutineForegroundSync.ts "$BACKUP_DIR/useRoutineForegroundSync.ts"
```

`src/features/routine/hooks/useRoutineForegroundSync.ts` の `runRefresh` の `notifyCurrentMinute();` の行を、コメントにする（`// notifyCurrentMinute();`）。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/hooks/__tests__/useRoutineForegroundSync.test.tsx`
Expected: FAIL。「…現在時刻を 1 回だけ通知する」と「フォールバック tick: スキップ条件が成り立っても現在時刻は通知し…」が失敗する（import が未使用になるので、lint はここでは走らせない）。

元に戻す。

```bash
cp "$BACKUP_DIR/useRoutineForegroundSync.ts" src/features/routine/hooks/useRoutineForegroundSync.ts
```

- [ ] **Step 8: 確認 3 — `isRoutinePast` が中で時計を読む退行**

```bash
cp src/features/routine/helpersPresentation.ts "$BACKUP_DIR/helpersPresentation.ts"
```

`src/features/routine/helpersPresentation.ts` の `isRoutinePast` の `const now = new Date(nowMs);` を、`const now = new Date(Date.now());` に変える。

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/routine/__tests__/jstToday.test.ts src/features/routine/__tests__/helpers.presentation.test.ts`
Expected: FAIL。少なくとも、`jstToday.test.ts` の「経過判定は渡した時刻だけで決まり、システムの時計を読まない」と、`helpers.presentation.test.ts` の「isRoutinePastは当日かつ時刻超過でtrue」（`toHaveBeenCalledWith(new Date(NOW_MS))`）が失敗する。実際の時計で判定されるようになるため、`jstToday.test.ts` のほかの `isRoutinePast` のテストも失敗することがあるが、想定どおりである（`nowMs` が未使用になるので、lint はここでは走らせない）。

元に戻す。

```bash
cp "$BACKUP_DIR/helpersPresentation.ts" src/features/routine/helpersPresentation.ts
```

- [ ] **Step 9: 元に戻したことを確かめ、全体の検証をもう一度通す**

Run: `grep -n "nowMinute" src/features/routine/components/RoutineItem.tsx; grep -n "notifyCurrentMinute" src/features/routine/hooks/useRoutineForegroundSync.ts; grep -n "new Date(" src/features/routine/helpersPresentation.ts`
Expected: `RoutineItem.tsx` に `nowMinute: 0` が無く `nowMinute,` がある。`useRoutineForegroundSync.ts` の `notifyCurrentMinute();` がコメントになっていない。`helpersPresentation.ts` が `new Date(nowMs)` になっている。

Run: `npm run verify:fast`
Expected: すべて成功。

```bash
rm -rf "$BACKUP_DIR"
```

コミットはしない。

---

## プランの外で行う確認（コントローラが実施）

- 開発サーバーとブラウザでの確認（受け入れ条件 5）: 1 分ほど先に開始するルーティンを用意し、開始時間を過ぎた後に `visibilitychange`・`focus`・`pageshow` を発火させ、再読み込みなしでカードが `bg-yellow-50` になることを確かめる。
- iOS・Android の実機での確認（受け入れ条件 6）は、作業者には実施できない。PR の本文に、Issue の再現手順のとおりの確認手順を書き、利用者に確認を依頼する。PR の本文には、「現在時刻の通知は、フォールバックのスキップ条件の対象にしない」という判断も書く。
