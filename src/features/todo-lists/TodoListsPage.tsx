"use client";

import { CardPanel } from "@/components";
import { SwipeableRoutineItem } from "@/components/SwipeableRoutineItem";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";
import type { TodoList } from "./types";
import { filterIncompleteItems } from "./todoListIncompleteItemsFilter";
import { hasChildren } from "./todoListItemHasChildren";
import { getItemIndentLevel } from "./todoListItemIndentLevel";
import { getMaxAllowedIndent } from "./todoListItemMaxIndent";
import {
  useTodoListDetailState,
  useTodoListSelectionState,
} from "./useTodoListsPageState";
import { useTodoListDetailViewState } from "./useTodoListDetailViewState";
import texts from "./locales/ja.json";

// ドラッグ中のリストアイテムインデックスを管理するシングルトン（ref代替）
let _dragFromIndex: number | null = null;

// ============================================================
// Todo 詳細ビュー
// ============================================================
const DetailView = ({
  list,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onDeleteList,
  onIndentItem,
  onOutdentItem,
  onReorderItems,
  onUpdateItemTitle,
  onUpdateListTitle,
}: {
  list: TodoList;
  onAddItem: (listId: string, title: string) => void;
  onToggleItem: (listId: string, itemId: string) => void;
  onDeleteItem: (listId: string, itemId: string, title: string) => void;
  onDeleteList: (list: TodoList) => void;
  onIndentItem: (listId: string, itemId: string) => void;
  onOutdentItem: (listId: string, itemId: string) => void;
  onReorderItems: (listId: string, fromIndex: number, toIndex: number) => void;
  onUpdateItemTitle: (listId: string, itemId: string, title: string) => void;
  onUpdateListTitle: (listId: string, title: string) => void;
}) => {
  const {
    collapsedItemIds,
    dragOverIndex,
    editingItemId,
    editingItemTitle,
    editingListTitle,
    editingListTitleValue,
    hideCompleted,
    inputRef,
    inputText,
    listTitleInputRef,
    progress: { completed, total, percentage },
    visibleItems,
    setDragOverIndex,
    setEditingItemTitle,
    setEditingListTitleValue,
    setInputText,
    cancelEditItem,
    cancelEditListTitle,
    commitEditItem,
    commitEditListTitle,
    handleAdd,
    startEditItem,
    startEditListTitle,
    toggleCollapseItem,
    toggleHideCompleted,
  } = useTodoListDetailViewState({
    list,
    onAddItem,
    onUpdateItemTitle,
    onUpdateListTitle,
  });
  const itemsForParentDetection = hideCompleted
    ? filterIncompleteItems(list.items)
    : list.items;
  const itemIndexById = new Map(
    list.items.map((item, index) => [item.id, index]),
  );
  const parentDetectionIndexById = new Map(
    itemsForParentDetection.map((item, index) => [item.id, index]),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          {/* ヘッダー */}
          <div className="flex items-start justify-between gap-2 mb-6">
            {editingListTitle ? (
              <input
                ref={listTitleInputRef}
                type="text"
                value={editingListTitleValue}
                onChange={(e) => setEditingListTitleValue(e.target.value)}
                onBlur={commitEditListTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isImeComposingKeyDown(e))
                    commitEditListTitle();
                  if (e.key === "Escape") cancelEditListTitle();
                }}
                className="flex-1 text-xl font-bold px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-900 dark:text-black focus:outline-none"
              />
            ) : (
              <div className="flex items-center gap-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-black truncate">
                  {list.title}
                </h1>
                <button
                  type="button"
                  onClick={startEditListTitle}
                  className="shrink-0 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-sm"
                  aria-label={texts.list.editListTitleLabel}
                >
                  ✏️
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => onDeleteList(list)}
              className="shrink-0 text-xs text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors whitespace-nowrap"
            >
              {texts.list.deleteListButton}
            </button>
          </div>

          {/* 進捗バー */}
          {total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600 dark:text-gray-700">
                  {texts.list.completedCount
                    .replace("{completed}", String(completed))
                    .replace("{total}", String(total))}
                </span>
                <span className="font-semibold text-teal-600 dark:text-teal-700">
                  {percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* 完了済みトグル */}
          {list.items.some((item) => item.isCompleted) && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={toggleHideCompleted}
                className="text-xs text-gray-500 dark:text-gray-600 hover:text-teal-600 dark:hover:text-teal-700 transition-colors"
              >
                {hideCompleted
                  ? texts.list.showCompleted
                  : texts.list.hideCompleted}
              </button>
            </div>
          )}

          {/* Todoアイテム一覧 */}
          {visibleItems.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm font-medium">
                {list.items.length === 0
                  ? texts.list.emptyMessage
                  : "完了済みのみです"}
              </p>
              {list.items.length === 0 && (
                <p className="text-xs mt-1">{texts.list.emptyDescription}</p>
              )}
            </div>
          ) : (
            <ul className="space-y-2 mb-6">
              {visibleItems.map((item) => {
                const origIndex = itemIndexById.get(item.id);
                if (origIndex === undefined) return null;

                const parentDetectionIndex = parentDetectionIndexById.get(
                  item.id,
                );
                const currentIndent = getItemIndentLevel(item);
                const maxIndent = getMaxAllowedIndent(list.items, origIndex);
                const isDragOver =
                  !hideCompleted && dragOverIndex === origIndex;
                const canSwipeIndent =
                  editingItemId !== item.id && currentIndent < maxIndent;
                const isParent =
                  parentDetectionIndex !== undefined &&
                  hasChildren(itemsForParentDetection, parentDetectionIndex);
                const isCollapsed = collapsedItemIds.has(item.id);
                return (
                  <li
                    key={item.id}
                    draggable={!hideCompleted}
                    onDragStart={() => {
                      _dragFromIndex = origIndex;
                    }}
                    onDragOver={(e) => {
                      if (hideCompleted) return;
                      e.preventDefault();
                      setDragOverIndex(origIndex);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (
                        _dragFromIndex !== null &&
                        _dragFromIndex !== origIndex
                      ) {
                        onReorderItems(list.id, _dragFromIndex, origIndex);
                      }
                      _dragFromIndex = null;
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      _dragFromIndex = null;
                      setDragOverIndex(null);
                    }}
                    style={{ marginLeft: `${currentIndent * 20}px` }}
                    className="group"
                  >
                    <SwipeableRoutineItem
                      onSwipeAction={() => onIndentItem(list.id, item.id)}
                      swipeActionType="indent"
                      isEditMode={canSwipeIndent}
                    >
                      <div
                        className={`flex items-center gap-2 p-3 bg-white dark:bg-gray-700 border rounded-xl hover:shadow-sm transition-shadow ${
                          isDragOver
                            ? "border-teal-400 dark:border-teal-500 shadow-md"
                            : "border-gray-100 dark:border-gray-500"
                        }`}
                      >
                        {!hideCompleted && (
                          <span
                            className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400 select-none"
                            aria-label="並び替え"
                          >
                            ⠿
                          </span>
                        )}
                        <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onOutdentItem(list.id, item.id)}
                            disabled={currentIndent === 0}
                            className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
                            aria-label="インデントを下げる"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => onIndentItem(list.id, item.id)}
                            disabled={currentIndent >= maxIndent}
                            className="w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center text-xs rounded transition-colors"
                            aria-label="インデントを上げる"
                          >
                            →
                          </button>
                        </div>
                        {isParent ? (
                          <button
                            type="button"
                            onClick={() => toggleCollapseItem(item.id)}
                            className="shrink-0 w-5 h-5 text-gray-400 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 flex items-center justify-center text-xs transition-colors"
                            aria-expanded={!isCollapsed}
                            aria-label={
                              isCollapsed
                                ? "子Todoを展開"
                                : "子Todoを折りたたむ"
                            }
                          >
                            {isCollapsed ? "▶" : "▼"}
                          </button>
                        ) : (
                          <span className="shrink-0 w-5" />
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleItem(list.id, item.id)}
                          className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            item.isCompleted
                              ? "bg-teal-500 border-teal-500"
                              : "border-gray-300 dark:border-gray-400 hover:border-teal-400"
                          }`}
                          aria-label={
                            item.isCompleted ? "未完了に戻す" : "完了にする"
                          }
                        >
                          {item.isCompleted && (
                            <span className="text-white text-xs leading-none">
                              ✓
                            </span>
                          )}
                        </button>
                        {editingItemId === item.id ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingItemTitle}
                            onChange={(e) =>
                              setEditingItemTitle(e.target.value)
                            }
                            onBlur={() => commitEditItem(item.id)}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Enter" &&
                                !isImeComposingKeyDown(e)
                              )
                                commitEditItem(item.id);
                              if (e.key === "Escape") cancelEditItem();
                            }}
                            className="flex-1 min-w-0 text-sm px-1 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`flex-1 min-w-0 text-sm break-words ${
                              item.isCompleted
                                ? "line-through text-gray-400 dark:text-gray-500"
                                : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
                        {editingItemId !== item.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => startEditItem(item.id, item.title)}
                              className="shrink-0 text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={texts.list.editItemLabel}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteItem(list.id, item.id, item.title)
                              }
                              className="shrink-0 text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="削除"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </SwipeableRoutineItem>
                  </li>
                );
              })}
            </ul>
          )}

          {/* 追加フォーム */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-600">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isImeComposingKeyDown(e)) {
                  handleAdd();
                }
              }}
              placeholder={texts.list.itemPlaceholder}
              className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="text-sm bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
            >
              {texts.list.addButton}
            </button>
          </div>
        </CardPanel>
      </main>
    </div>
  );
};

// ============================================================
// リスト詳細の状態管理コンテナ（key={listId} でリスト切替時に再マウント）
// ============================================================
const TodoListDetail = ({ listId }: { listId: string }) => {
  const { list, detailHandlers } = useTodoListDetailState(listId);

  if (!list || !detailHandlers) {
    // リストが削除された場合などのフォールバック
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <CardPanel>
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">{texts.page.emptyMessage}</p>
              <p className="text-sm mt-1">{texts.page.emptyHint}</p>
            </div>
          </CardPanel>
        </main>
      </div>
    );
  }

  return <DetailView list={list} {...detailHandlers} />;
};

// ============================================================
// メインページコンポーネント
// ============================================================
export const TodoListsPage = () => {
  const { effectiveSelectedId } = useTodoListSelectionState();

  if (!effectiveSelectedId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <CardPanel>
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">{texts.page.emptyMessage}</p>
              <p className="text-sm mt-1">{texts.page.emptyHint}</p>
            </div>
          </CardPanel>
        </main>
      </div>
    );
  }

  // key={selectedId} により、リスト切替時に TodoListDetail が再マウントされ
  // useState の初期値として最新の localStorage データが読み込まれる
  return (
    <TodoListDetail key={effectiveSelectedId} listId={effectiveSelectedId} />
  );
};
