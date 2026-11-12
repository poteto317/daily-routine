import { act, render } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { notifyCurrentMinute } from "@/hooks/useCurrentMinute";
import type { Routine } from "@/types/routine";
import { useRoutineForegroundSync } from "../../hooks/useRoutineForegroundSync";
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
// 通しのテストで確かめるのは「復帰の検知 → 現在時刻の通知 → カードの再描画」のつながり。
// ルーティンの状態の読み直し（保存データを読む）は、ここでは動かさない
jest.mock("../../hooks/routineStateSync", () => ({
  refreshRoutineState: jest.fn(),
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

      // 時計を開始時刻の後へ進める
      jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));

      // 復帰時の通知で、再読み込みも props の変更も無しに色が変わる
      act(() => {
        notifyCurrentMinute();
      });
      expect(container.querySelector(".bg-yellow-50")).not.toBeNull();
      expect(container.querySelector(".bg-white")).toBeNull();
    },
  );
});

const FALLBACK_INTERVAL_MS = 30 * 60 * 1000;
const noop = () => {};

/** ホーム画面と同じ組み合わせ: 復帰を検知するフックと、カード 1 枚。現在時刻の通知は本物を通る */
const ForegroundSyncWithCard = () => {
  const [routines, setRoutines] = useState<Routine[]>([routine]);
  useRoutineForegroundSync(true, setRoutines, routines, FALLBACK_INTERVAL_MS);
  return (
    <RoutineItem
      routine={routines[0]}
      onToggle={noop}
      onEdit={noop}
      onDelete={noop}
    />
  );
};

describe("復帰の検知からカードの色の更新までがつながっている（通しのテスト）", () => {
  beforeEach(() => {
    // 開始時刻（09:00）の 1 分前
    jest.useFakeTimers().setSystemTime(new Date("2026-11-12T08:59:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const RESUME_EVENTS: Array<[string, () => void]> = [
    [
      "visibilitychange",
      () => document.dispatchEvent(new Event("visibilitychange")),
    ],
    ["pageshow", () => window.dispatchEvent(new Event("pageshow"))],
    ["focus", () => window.dispatchEvent(new Event("focus"))],
  ];

  it.each(RESUME_EVENTS)(
    "%s: 開始時刻を過ぎてから復帰のイベントが来ると、超過の色（黄）になる",
    (_name, fireResumeEvent) => {
      const { container, unmount } = render(<ForegroundSyncWithCard />);
      expect(container.querySelector(".bg-yellow-50")).toBeNull();
      expect(container.querySelector(".bg-white")).not.toBeNull();

      jest.setSystemTime(new Date("2026-11-12T09:01:00+09:00"));
      act(() => {
        fireResumeEvent();
        // 復帰のイベントは setTimeout(0) で 1 回に束ねられる
        jest.advanceTimersByTime(0);
      });

      expect(container.querySelector(".bg-yellow-50")).not.toBeNull();
      expect(container.querySelector(".bg-white")).toBeNull();
      unmount();
    },
  );

  it("復帰のイベントが無くても、フォールバックのタイマーの回で超過の色（黄）になる", () => {
    const { container, unmount } = render(<ForegroundSyncWithCard />);
    expect(container.querySelector(".bg-yellow-50")).toBeNull();

    // 08:59 から 30 分後（09:29）に、フォールバックのタイマーが 1 回動く
    act(() => {
      jest.advanceTimersByTime(FALLBACK_INTERVAL_MS);
    });

    expect(container.querySelector(".bg-yellow-50")).not.toBeNull();
    expect(container.querySelector(".bg-white")).toBeNull();
    unmount();
  });
});
