"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TodoList } from "./types";
import { TodoListManagementItem } from "./TodoListManagementItem";
import { restrictToSortableListBounds } from "./restrictToSortableListBounds";

/** 行の移動を一覧の枠の中に制限する（参照を安定させるためモジュールの外に置く） */
const MODIFIERS = [restrictToSortableListBounds];

export type TodoListManagementSortableListProps = {
  /** 表示順（menuOrder で並べた順）のリスト。非表示のリストも含む */
  lists: TodoList[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEndAction: (event: DragEndEvent) => void;
  editingListId: string | null;
  editingListTitleValue: string;
  onChangeTitleValueAction: (value: string) => void;
  onCommitEditAction: () => void;
  onCancelEditAction: () => void;
  onOpenListAction: (listId: string) => void;
  onToggleVisibilityAction: (list: TodoList) => void;
  onStartEditAction: (listId: string, title: string) => void;
  onDeleteAction: (list: TodoList) => void;
};

/**
 * Todoリスト管理画面のDnDコンテキストとソート可能なリスト一覧の描画。
 * カテゴリ管理画面の TodoCategorySortableList.tsx と同じ役割分担
 * （ページ側はレイアウト構成のみ、DndContext/SortableContextの配線と
 * 一覧描画はこのコンポーネントに閉じる）。空状態の判定（リスト0件かつ
 * フォーム非表示）は画面固有の状態（showForm）に依存するため、呼び出し元
 * （TodoListManagementPage.tsx）の責務として残す。
 */
export const TodoListManagementSortableList = ({
  lists,
  sensors,
  onDragEndAction,
  editingListId,
  editingListTitleValue,
  onChangeTitleValueAction,
  onCommitEditAction,
  onCancelEditAction,
  onOpenListAction,
  onToggleVisibilityAction,
  onStartEditAction,
  onDeleteAction,
}: TodoListManagementSortableListProps) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={MODIFIERS}
      onDragEnd={onDragEndAction}
    >
      <SortableContext
        items={lists.map((list) => list.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {lists.map((list) => (
            <TodoListManagementItem
              key={list.id}
              list={list}
              editingListId={editingListId}
              editingListTitleValue={editingListTitleValue}
              onChangeTitleValueAction={onChangeTitleValueAction}
              onCommitEditAction={onCommitEditAction}
              onCancelEditAction={onCancelEditAction}
              onOpenListAction={onOpenListAction}
              onToggleVisibilityAction={onToggleVisibilityAction}
              onStartEditAction={onStartEditAction}
              onDeleteAction={onDeleteAction}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
