/**
 * ハンバーガーメニューからナビゲートする際に
 * どの Todo リストを表示するかを管理するモジュールレベルの状態
 */

import { getStoredSelectedTodoListId, saveSelectedTodoListId } from "./storage";

let _selectedTodoListId: string | null | undefined;
const _listeners = new Set<() => void>();

const ensureSelectedTodoListId = (): string | null => {
  if (_selectedTodoListId !== undefined) {
    return _selectedTodoListId;
  }

  _selectedTodoListId = getStoredSelectedTodoListId();
  return _selectedTodoListId;
};

export const setSelectedTodoListId = (id: string | null): void => {
  _selectedTodoListId = id;
  saveSelectedTodoListId(id);
  _listeners.forEach((listener) => listener());
};

export const getSelectedTodoListId = (): string | null =>
  ensureSelectedTodoListId();

export const subscribeSelectedTodoListId = (
  listener: () => void,
): (() => void) => {
  _listeners.add(listener);
  return () => {
    _listeners.delete(listener);
  };
};
