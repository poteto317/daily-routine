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
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragCancel: () => void;
  editingCategoryId: string | null;
  editingCategoryNameValue: string;
  onChangeNameValue: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (categoryId: string, name: string) => void;
  colorEditingCategoryId: string | null;
  onToggleColorPicker: (categoryId: string) => void;
  onCloseColorPicker: () => void;
  onUpdateColor: (
    categoryId: string,
    color: TodoItemBgColorValue | undefined,
  ) => void;
  onDelete: (category: TodoCategory) => void;
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
  onDragStart,
  onDragEnd,
  onDragCancel,
  editingCategoryId,
  editingCategoryNameValue,
  onChangeNameValue,
  onCommitEdit,
  onCancelEdit,
  onStartEdit,
  colorEditingCategoryId,
  onToggleColorPicker,
  onCloseColorPicker,
  onUpdateColor,
  onDelete,
}: TodoCategorySortableListProps) => {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
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
              onChangeNameValue={onChangeNameValue}
              onCommitEdit={onCommitEdit}
              onCancelEdit={onCancelEdit}
              onStartEdit={onStartEdit}
              colorEditingCategoryId={colorEditingCategoryId}
              onToggleColorPicker={onToggleColorPicker}
              onCloseColorPicker={onCloseColorPicker}
              onUpdateColor={onUpdateColor}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
