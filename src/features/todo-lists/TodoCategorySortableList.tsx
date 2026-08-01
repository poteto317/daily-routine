"use client";

import {
  DndContext,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import { TodoCategoryManagementItem } from "./TodoCategoryManagementItem";

export type TodoCategorySortableListProps = {
  categories: TodoCategory[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStartAction: (event: DragStartEvent) => void;
  onDragEndAction: (event: DragEndEvent) => void;
  onDragCancelAction: () => void;
  editingCategoryId: string | null;
  editingCategoryNameValue: string;
  onChangeNameValueAction: (value: string) => void;
  onCommitEditAction: () => void;
  onCancelEditAction: () => void;
  onStartEditAction: (categoryId: string, name: string) => void;
  colorEditingCategoryId: string | null;
  onToggleColorPickerAction: (categoryId: string) => void;
  onCloseColorPickerAction: () => void;
  onUpdateColorAction: (
    categoryId: string,
    color: TodoItemBgColorValue | undefined,
  ) => void;
  onDeleteAction: (category: TodoCategory) => void;
};

/**
 * カテゴリ管理画面のDnDコンテキストとソート可能なカテゴリ一覧の描画。
 * Todoアイテムの並び替えにおける TodoListSortableItems.tsx と同じ役割分担
 * （ページ側はレイアウト構成のみ、DndContext/SortableContextの配線と
 * 一覧描画はこのコンポーネントに閉じる）。空状態の判定（カテゴリ0件かつ
 * フォーム非表示）は画面固有の状態（showForm）に依存するため、呼び出し元
 * （TodoCategoryManagementPage.tsx）の責務として残す。
 */
export const TodoCategorySortableList = ({
  categories,
  sensors,
  onDragStartAction,
  onDragEndAction,
  onDragCancelAction,
  editingCategoryId,
  editingCategoryNameValue,
  onChangeNameValueAction,
  onCommitEditAction,
  onCancelEditAction,
  onStartEditAction,
  colorEditingCategoryId,
  onToggleColorPickerAction,
  onCloseColorPickerAction,
  onUpdateColorAction,
  onDeleteAction,
}: TodoCategorySortableListProps) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStartAction}
      onDragEnd={onDragEndAction}
      onDragCancel={onDragCancelAction}
    >
      <SortableContext
        items={categories.map((category) => category.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {categories.map((category) => (
            <TodoCategoryManagementItem
              key={category.id}
              category={category}
              editingCategoryId={editingCategoryId}
              editingCategoryNameValue={editingCategoryNameValue}
              onChangeNameValueAction={onChangeNameValueAction}
              onCommitEditAction={onCommitEditAction}
              onCancelEditAction={onCancelEditAction}
              onStartEditAction={onStartEditAction}
              colorEditingCategoryId={colorEditingCategoryId}
              onToggleColorPickerAction={onToggleColorPickerAction}
              onCloseColorPickerAction={onCloseColorPickerAction}
              onUpdateColorAction={onUpdateColorAction}
              onDeleteAction={onDeleteAction}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
