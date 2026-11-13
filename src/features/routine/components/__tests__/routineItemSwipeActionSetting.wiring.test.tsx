import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { getUserScopedKey } from "@/lib/storage/core";
import type { Routine } from "@/types/routine";
import { RoutineItem } from "../RoutineItem";
import { SortableRoutineItem } from "../SortableRoutineItem";

// このテストは「カードが設定（スワイプの動作）を購読し、その値をスワイプの部品へ渡している」
// ことを確かめる。設定の保存（saveSettings）・読み出し（getSettings）と localStorage は本物を使う
// （RoutineItem.test.setup.ts は getSettings を固定値に差し替えるので、ここでは使わない）。
// スワイプの背景の色は、削除が赤（bg-red-500）、編集が青（bg-blue-500）。
//
// Jest は React Compiler を通さないので、コンパイル後に値が固定されないことは、
// 契約テスト（src/__tests__/reactCompilerSettings.contract.test.ts）で確かめる。

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
      key="SortableRoutineItem-view"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
      isEditMode={false}
    />,
  ],
  [
    "SortableRoutineItem（編集モード）",
    <SortableRoutineItem
      key="SortableRoutineItem-edit"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
  ],
];

describe("ルーティンのカードのスワイプの動作が、設定の変更で更新される（配線テスト）", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it.each(CASES)(
    "%s: props を変えずに、同じタブで設定を保存すると、スワイプの背景が編集の色（青）になる",
    (_name, element) => {
      const { container } = render(element);

      // 保存された設定が無いので、既定値（削除）の色
      expect(container.querySelector(".bg-red-500")).not.toBeNull();
      expect(container.querySelector(".bg-blue-500")).toBeNull();

      // 同じタブの設定画面で保存したときと同じ経路（saveSettings が settings-updated を出す）
      act(() => {
        saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
      });

      expect(container.querySelector(".bg-blue-500")).not.toBeNull();
      expect(container.querySelector(".bg-red-500")).toBeNull();
    },
  );

  it.each(CASES)(
    "%s: props を変えずに、別のタブが設定を書くと、スワイプの背景が編集の色（青）になる",
    (_name, element) => {
      const { container } = render(element);

      expect(container.querySelector(".bg-red-500")).not.toBeNull();
      expect(container.querySelector(".bg-blue-500")).toBeNull();

      // 別のタブが書いたときと同じ形: saveSettings() を通さずに localStorage を直接書き、
      // storage イベントを出す（jsdom は同じウィンドウへ storage イベントを出さないので、手で出す）
      localStorage.setItem(
        getUserScopedKey("app-settings"),
        JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction: "edit" }),
      );
      act(() => {
        window.dispatchEvent(new StorageEvent("storage"));
      });

      expect(container.querySelector(".bg-blue-500")).not.toBeNull();
      expect(container.querySelector(".bg-red-500")).toBeNull();
    },
  );
});
