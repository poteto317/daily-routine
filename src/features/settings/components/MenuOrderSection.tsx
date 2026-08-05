"use client";

import { useState } from "react";
import { menuConfig } from "@/config";
import { getTodoLists } from "@/features/todo-lists/storage";
import {
  sortByMenuOrder,
  toTodoListMenuItemId,
} from "@/hooks/headerMenuItemHelpers";
import texts from "../locales/ja.json";

/** ハンバーガーメニューで並び替え可能な機能項目の ID セット */
const REORDERABLE_MENU_IDS = new Set([
  "journal",
  "calendar",
  "statistics",
  "pomodoro",
  "worktracker",
  "weight-tracker",
  "workout-tracker",
  "meal",
  "budget",
  "weather",
  "preset",
  "todo-lists",
  "todo-list-management",
]);

let _dragFromIndex: number | null = null;

type Props = {
  menuOrder: string[];
  setMenuOrderAction: (
    order: string[] | ((prev: string[]) => string[]),
  ) => void;
};

export const MenuOrderSection = ({ menuOrder, setMenuOrderAction }: Props) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const todoListMenuItems = getTodoLists().map((list) => ({
    id: toTodoListMenuItemId(list.id),
    label: list.title,
    icon: "✅",
  }));

  const defaultMenuItems = menuConfig.menuItems.flatMap((item) => {
    if (item.id === "todo-lists") {
      return todoListMenuItems;
    }

    return REORDERABLE_MENU_IDS.has(item.id) ? [item] : [];
  });

  // config のデフォルト順を基準に menuOrder で並び替え
  const orderedItems = sortByMenuOrder(
    defaultMenuItems,
    (item) => item.id,
    defaultMenuItems.map((item) => item.id),
    menuOrder,
  );

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const ids = orderedItems.map((i) => i.id);
    const [moved] = ids.splice(fromIndex, 1);
    ids.splice(toIndex, 0, moved);
    setMenuOrderAction(ids);
  };

  const handleReset = () => {
    setMenuOrderAction(defaultMenuItems.map((item) => item.id));
  };

  return (
    <div className="border-t dark:border-gray-600 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
          {texts.menuOrder.title}
        </h3>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {texts.menuOrder.resetButton}
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {texts.menuOrder.description}
      </p>
      <ul className="space-y-2">
        {orderedItems.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => {
              _dragFromIndex = index;
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(index);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (_dragFromIndex !== null && _dragFromIndex !== index) {
                handleReorder(_dragFromIndex, index);
              }
              _dragFromIndex = null;
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              _dragFromIndex = null;
              setDragOverIndex(null);
            }}
            className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border transition-shadow cursor-default ${
              dragOverIndex === index
                ? "border-blue-400 dark:border-blue-500 shadow-md"
                : "border-transparent"
            }`}
          >
            <span
              className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 select-none text-lg leading-none"
              aria-label="ドラッグして並び替え"
            >
              ⠿
            </span>
            <span className="text-base select-none">{item.icon}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {index + 1}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
