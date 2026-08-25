# Todoアクションメニュー関連ファイル 単一責任原則リファクタ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `main` ブランチから変更されたファイル群（`TodoItemActionMenu.tsx` / `useItemActionMenuController.ts` / `useColorPickerController.ts` / `TodoListSortableItems.tsx`）に残る単一責任原則（SRP）違反を解消し、各ユニットにテストを追加する。

**Architecture:** 3つの独立したグループに分割する。

- グループA: `useItemActionMenuController` と `useColorPickerController` に重複している「外側クリック/Escキーで閉じる」ロジックを `useCloseOnOutsideInteraction` 共通フックへ抽出する。
- グループB: `TodoListSortableItems` に埋め込まれた空状態表示ロジックを `TodoListEmptyState` コンポーネントへ抽出する。
- グループC: `TodoItemActionMenuDropdown` に同居する6つの独立アクション（編集・下に追加・インデント上げ下げ・背景色・カテゴリ・削除）を、それぞれ単一責任のサブコンポーネントへ分割する。

いずれも振る舞い変更なし（見た目・操作結果は現状維持）。既存の統合テストは残したまま、分割後の新規ユニットに独立したテストを追加する。

**Tech Stack:** React 19 / Next.js（App Router）/ TypeScript / Jest + Testing Library

## Global Constraints

- 振る舞いは一切変更しない。DOM構造・className・aria属性・イベントハンドラの呼び出し順序を現状のまま保つ。
- 新規ファイルは `src/features/todo-lists/` 直下に作成する（既存の粒度に合わせる）。
- 各コンポーネント/フックは対応する `__tests__/*.test.tsx` / `*.test.ts` を持つ（プロジェクトの1ソース:1テストファイルの慣習に従う）。
- テストは `npx jest src/features/todo-lists` で実行する。型チェックは `npx tsc --noEmit`。lintは `npm run lint`。
- 既存の統合テスト（`TodoItemActionMenu.test.tsx` / `useItemActionMenuController.test.ts` / `useColorPickerController.test.ts` / `TodoListSortableItems.test.tsx`）は削除・弱体化させない。分割後も同じ振る舞いを検証し続けることを確認する。
- コミットは各タスクの最後に用意されているが、**実行しない**（自動コミット禁止）。エンジニアが後でまとめて確認してからコミットする前提でファイル変更のみ行う。

---

## グループA: 外側クリック/Escキー検出の共通化

### Task 1: `useCloseOnOutsideInteraction` 共通フックを新規作成

**Files:**

- Create: `src/features/todo-lists/useCloseOnOutsideInteraction.ts`
- Test: `src/features/todo-lists/__tests__/useCloseOnOutsideInteraction.test.ts`

**Interfaces:**

- Produces: `useCloseOnOutsideInteraction(options: { isActive: boolean; selector: string; onClose: () => void; includeTouch?: boolean }): void`
  - `isActive`: リスナーを登録するかどうか
  - `selector`: この `closest()` セレクタの外側でのポインタ操作なら閉じる
  - `onClose`: 閉じる際に呼ぶコールバック（呼び出し側で `useCallback` により安定化されている前提）
  - `includeTouch`: `true` のとき `touchstart`（`passive: true`）も登録する。デフォルト `false`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/useCloseOnOutsideInteraction.test.ts`:

```ts
import { renderHook } from "@testing-library/react";
import { useCloseOnOutsideInteraction } from "../useCloseOnOutsideInteraction";

describe("useCloseOnOutsideInteraction", () => {
  it("isActive が false のときリスナーを登録しない", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    const onClose = jest.fn();

    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: false,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    const calls = addSpy.mock.calls.filter(([event]) =>
      ["mousedown", "touchstart", "keydown"].includes(event as string),
    );
    expect(calls.length).toBe(0);
    addSpy.mockRestore();
  });

  it("isActive が true のとき selector 外の mousedown で onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("selector 内の mousedown では onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    const menuEl = document.createElement("div");
    menuEl.setAttribute("data-test-menu", "");
    document.body.appendChild(menuEl);

    menuEl.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
    document.body.removeChild(menuEl);
  });

  it("Escape キーで onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape 以外のキーでは onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が未指定（false 相当）のとき touchstart では onClose が呼ばれない", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("includeTouch が true のとき selector 外の touchstart で onClose が呼ばれる", () => {
    const onClose = jest.fn();
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
        includeTouch: true,
      }),
    );

    document.dispatchEvent(new Event("touchstart", { bubbles: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("includeTouch が true のとき touchstart リスナーに passive:true が渡される", () => {
    const addSpy = jest.spyOn(document, "addEventListener");
    renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose: jest.fn(),
        includeTouch: true,
      }),
    );

    const touchStartCall = addSpy.mock.calls.find(
      ([event]) => event === "touchstart",
    );
    expect(touchStartCall).toBeDefined();
    expect(touchStartCall?.[2]).toEqual({ passive: true });

    addSpy.mockRestore();
  });

  it("isActive が true から false に変わるとリスナーが解除される", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const onClose = jest.fn();
    const { rerender } = renderHook(
      ({ isActive }) =>
        useCloseOnOutsideInteraction({
          isActive,
          selector: "[data-test-menu]",
          onClose,
        }),
      { initialProps: { isActive: true } },
    );

    rerender({ isActive: false });

    const removedEvents = removeSpy.mock.calls.map(([event]) => event);
    expect(removedEvents).toEqual(
      expect.arrayContaining(["mousedown", "keydown"]),
    );
    removeSpy.mockRestore();
  });

  it("アンマウント時にリスナーが解除される", () => {
    const removeSpy = jest.spyOn(document, "removeEventListener");
    const onClose = jest.fn();
    const { unmount } = renderHook(() =>
      useCloseOnOutsideInteraction({
        isActive: true,
        selector: "[data-test-menu]",
        onClose,
      }),
    );

    unmount();

    const removedEvents = removeSpy.mock.calls.map(([event]) => event);
    expect(removedEvents).toEqual(
      expect.arrayContaining(["mousedown", "keydown"]),
    );
    removeSpy.mockRestore();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/useCloseOnOutsideInteraction.test.ts`
Expected: `Cannot find module '../useCloseOnOutsideInteraction'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/useCloseOnOutsideInteraction.ts`:

```ts
import { useEffect } from "react";

type Options = {
  isActive: boolean;
  selector: string;
  onClose: () => void;
  includeTouch?: boolean;
};

/**
 * 指定した selector の外側でのポインタ操作、または Escape キーで onClose を呼ぶ。
 * useItemActionMenuController / useColorPickerController で共通利用する。
 * onClose は呼び出し側で useCallback により安定化されている前提（依存配列に含めるため）。
 */
export const useCloseOnOutsideInteraction = ({
  isActive,
  selector,
  onClose,
  includeTouch = false,
}: Options) => {
  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (e: Event) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target?.closest(selector)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    if (includeTouch) {
      document.addEventListener("touchstart", handlePointerDown, {
        passive: true,
      });
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      if (includeTouch) {
        document.removeEventListener("touchstart", handlePointerDown);
      }
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, selector, onClose, includeTouch]);
};
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/useCloseOnOutsideInteraction.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/useCloseOnOutsideInteraction.ts src/features/todo-lists/__tests__/useCloseOnOutsideInteraction.test.ts
git commit -m "feat(todo-lists): add useCloseOnOutsideInteraction shared hook"
```

---

### Task 2: `useItemActionMenuController` を共通フック利用に書き換える

**Files:**

- Modify: `src/features/todo-lists/useItemActionMenuController.ts`
- Test: `src/features/todo-lists/__tests__/useItemActionMenuController.test.ts`（既存、変更なしで通ることを確認するのみ）

**Interfaces:**

- Consumes: `useCloseOnOutsideInteraction` （Task 1で作成）
- Produces: 既存と同じ `{ itemMenuItemId, toggleItemMenu, closeItemMenu }`（シグネチャ変更なし）

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/todo-lists/__tests__/useItemActionMenuController.test.ts`
Expected: 全件 PASS（14件）

- [ ] **Step 2: 実装を共通フック呼び出しに書き換える**

`src/features/todo-lists/useItemActionMenuController.ts`:

```ts
import { useCallback, useState } from "react";
import { useCloseOnOutsideInteraction } from "./useCloseOnOutsideInteraction";

/**
 * Todoアイテムのアクションメニュー（⋮）の開閉状態を管理するフック。
 * どのアイテムのメニューが開いているかを itemMenuItemId で管理する。
 * メニュー外タップ・Escキーでの自動クローズは useCloseOnOutsideInteraction に委譲する。
 */
export const useItemActionMenuController = () => {
  const [itemMenuItemId, setItemMenuItemId] = useState<string | null>(null);

  const toggleItemMenu = useCallback((itemId: string) => {
    setItemMenuItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const closeItemMenu = useCallback(() => {
    setItemMenuItemId(null);
  }, []);

  useCloseOnOutsideInteraction({
    isActive: itemMenuItemId !== null,
    selector: "[data-item-menu]",
    onClose: closeItemMenu,
    includeTouch: true,
  });

  return {
    itemMenuItemId,
    toggleItemMenu,
    closeItemMenu,
  };
};
```

- [ ] **Step 3: 既存テストを再実行し、書き換え後も全件通ることを確認する**

Run: `npx jest src/features/todo-lists/__tests__/useItemActionMenuController.test.ts`
Expected: 全件 PASS（14件、Step 1と同じ件数）

- [ ] **Step 4: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/useItemActionMenuController.ts
git commit -m "refactor(todo-lists): useItemActionMenuController に useCloseOnOutsideInteraction を適用"
```

---

### Task 3: `useColorPickerController` を共通フック利用に書き換える

**Files:**

- Modify: `src/features/todo-lists/useColorPickerController.ts`
- Test: `src/features/todo-lists/__tests__/useColorPickerController.test.ts`（既存、変更なしで通ることを確認するのみ）

**Interfaces:**

- Consumes: `useCloseOnOutsideInteraction` （Task 1で作成）
- Produces: 既存と同じ `{ colorPickerItemId, showBulkColorPicker, toggleItemColorPicker, closeItemColorPicker, toggleBulkColorPicker, closeBulkColorPicker }`（シグネチャ変更なし）

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/todo-lists/__tests__/useColorPickerController.test.ts`
Expected: 全件 PASS

- [ ] **Step 2: 実装を共通フック呼び出しに書き換える**

アイテム個別ピッカーと一括ピッカーの2つの `close` を1つの `useCallback` にまとめてから渡す（`onClose` を安定参照にするため）。

`src/features/todo-lists/useColorPickerController.ts`:

```ts
import { useCallback, useState } from "react";
import { useCloseOnOutsideInteraction } from "./useCloseOnOutsideInteraction";

/**
 * カラーピッカーの開閉状態を管理するフック。
 * - アイテム個別のカラーピッカー（colorPickerItemId）
 * - 一括カラーピッカー（showBulkColorPicker）
 * - アイテムピッカーと一括ピッカーの排他制御
 * カラーピッカー外クリック・Escキーでの自動クローズは useCloseOnOutsideInteraction に委譲する。
 *
 * NOTE: アクションメニュー統一（TodoItemActionMenu）以降、アイテム個別の
 * 背景色スウォッチはメニュー内に常時表示となり、colorPickerItemId /
 * toggleItemColorPicker / closeItemColorPicker を呼び出す経路は無くなった。
 * showBulkColorPicker（ツールバーの一括カラーピッカー）が同じフック内で
 * 現役のため、フックごと削除せず意図的にそのまま残している。
 */
export const useColorPickerController = () => {
  const [colorPickerItemId, setColorPickerItemId] = useState<string | null>(
    null,
  );
  const [showBulkColorPicker, setShowBulkColorPicker] = useState(false);

  /**
   * アイテム個別のカラーピッカーをトグルする。
   * 一括ピッカーが開いている場合は閉じる。
   * 同じアイテムIDで呼ぶと閉じる（トグル動作）。
   */
  const toggleItemColorPicker = useCallback((itemId: string) => {
    setShowBulkColorPicker(false);
    setColorPickerItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  /** アイテム個別カラーピッカーを閉じる */
  const closeItemColorPicker = useCallback(() => {
    setColorPickerItemId(null);
  }, []);

  /**
   * 一括カラーピッカーをトグルする。
   * アイテムピッカーが開いている場合は閉じる。
   */
  const toggleBulkColorPicker = useCallback(() => {
    setColorPickerItemId(null);
    setShowBulkColorPicker((v) => !v);
  }, []);

  /** 一括カラーピッカーを閉じる */
  const closeBulkColorPicker = useCallback(() => {
    setShowBulkColorPicker(false);
  }, []);

  /** アイテム個別・一括の両方を閉じる（外側クリック/Esc用） */
  const closeAllColorPickers = useCallback(() => {
    setColorPickerItemId(null);
    setShowBulkColorPicker(false);
  }, []);

  const isAnyOpen = colorPickerItemId !== null || showBulkColorPicker;

  useCloseOnOutsideInteraction({
    isActive: isAnyOpen,
    selector: "[data-color-picker]",
    onClose: closeAllColorPickers,
  });

  return {
    colorPickerItemId,
    showBulkColorPicker,
    toggleItemColorPicker,
    closeItemColorPicker,
    toggleBulkColorPicker,
    closeBulkColorPicker,
  };
};
```

- [ ] **Step 3: 既存テストを再実行し、書き換え後も全件通ることを確認する**

Run: `npx jest src/features/todo-lists/__tests__/useColorPickerController.test.ts`
Expected: 全件 PASS（Step 1と同じ件数）

- [ ] **Step 4: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/useColorPickerController.ts
git commit -m "refactor(todo-lists): useColorPickerController に useCloseOnOutsideInteraction を適用"
```

---

## グループB: 空状態表示の分離

### Task 4: `TodoListEmptyState` コンポーネントを新規作成

**Files:**

- Create: `src/features/todo-lists/TodoListEmptyState.tsx`
- Test: `src/features/todo-lists/__tests__/TodoListEmptyState.test.tsx`

**Interfaces:**

- Produces: `TodoListEmptyState({ hasAnyItems: boolean }): JSX.Element`
  - `hasAnyItems === false`: 「まだTodoがありません」+ 説明文
  - `hasAnyItems === true`（＝全アイテムが完了済みで非表示）: 「完了済みのみです」のみ

`texts.list.emptyMessage` は `"まだTodoがありません"`、`texts.list.emptyDescription` は `"下のフォームからTodoを追加しましょう"`（`src/features/todo-lists/locales/ja.json`）。

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoListEmptyState.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { TodoListEmptyState } from "../TodoListEmptyState";

describe("TodoListEmptyState", () => {
  it("hasAnyItems が false のとき「まだTodoがありません」と説明文を表示する", () => {
    render(<TodoListEmptyState hasAnyItems={false} />);
    expect(screen.getByText("まだTodoがありません")).toBeInTheDocument();
    expect(
      screen.getByText("下のフォームからTodoを追加しましょう"),
    ).toBeInTheDocument();
  });

  it("hasAnyItems が true のとき「完了済みのみです」を表示し説明文は表示しない", () => {
    render(<TodoListEmptyState hasAnyItems={true} />);
    expect(screen.getByText("完了済みのみです")).toBeInTheDocument();
    expect(
      screen.queryByText("下のフォームからTodoを追加しましょう"),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoListEmptyState.test.tsx`
Expected: `Cannot find module '../TodoListEmptyState'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoListEmptyState.tsx`（`TodoListSortableItems.tsx` の空状態表示ブロックを移設。className・文言は完全一致させる）:

```tsx
"use client";

import texts from "./locales/ja.json";

type Props = {
  hasAnyItems: boolean;
};

/**
 * Todoリストが空（または完了済みのみで非表示）のときの表示。
 * hasAnyItems=false: そもそもアイテムが1件もない。
 * hasAnyItems=true: アイテムはあるが、全て完了済みで hideCompleted により非表示。
 */
export const TodoListEmptyState = ({ hasAnyItems }: Props) => (
  <div className="text-center py-10 text-gray-400 dark:text-gray-500">
    <p className="text-3xl mb-2">✅</p>
    <p className="text-sm font-medium">
      {hasAnyItems ? "完了済みのみです" : texts.list.emptyMessage}
    </p>
    {!hasAnyItems && (
      <p className="text-xs mt-1">{texts.list.emptyDescription}</p>
    )}
  </div>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoListEmptyState.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoListEmptyState.tsx src/features/todo-lists/__tests__/TodoListEmptyState.test.tsx
git commit -m "feat(todo-lists): add TodoListEmptyState component"
```

---

### Task 5: `TodoListSortableItems` を `TodoListEmptyState` 利用に書き換える

**Files:**

- Modify: `src/features/todo-lists/TodoListSortableItems.tsx`
- Test: `src/features/todo-lists/__tests__/TodoListSortableItems.test.tsx`（既存、変更なしで通ることを確認するのみ）

**Interfaces:**

- Consumes: `TodoListEmptyState`（Task 4で作成）

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/todo-lists/__tests__/TodoListSortableItems.test.tsx`
Expected: 全件 PASS

- [ ] **Step 2: 空状態表示ブロックを `TodoListEmptyState` に置き換える**

`src/features/todo-lists/TodoListSortableItems.tsx` の import 群に追加:

```ts
import { TodoListEmptyState } from "./TodoListEmptyState";
```

`texts` の import と空状態の JSX ブロックを以下に置き換える（`texts` は他で使わなくなるため import ごと削除）:

```tsx
if (visibleItems.length === 0) {
  return <TodoListEmptyState hasAnyItems={list.items.length > 0} />;
}
```

- [ ] **Step 3: 未使用になった `texts` import を削除する**

`TodoListSortableItems.tsx` 内で `texts.` を検索し、他に参照がなければ `import texts from "./locales/ja.json";` を削除する。

- [ ] **Step 4: 既存テストを再実行し、書き換え後も全件通ることを確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoListSortableItems.test.tsx`
Expected: 全件 PASS（Step 1と同じ件数）

- [ ] **Step 5: 型チェックとlint**

Run: `npx tsc --noEmit && npm run lint`
Expected: エラー・警告なし（未使用importがあると lint エラーになるため Step 3 の確認が重要）

- [ ] **Step 6: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoListSortableItems.tsx
git commit -m "refactor(todo-lists): TodoListSortableItems の空状態表示を TodoListEmptyState に分離"
```

---

## グループC: `TodoItemActionMenuDropdown` のアクション項目分割

現在 `TodoItemActionMenuDropdown`（`src/features/todo-lists/TodoItemActionMenu.tsx`）は編集・下に追加・インデント上げ下げ・背景色・カテゴリ・削除という6つの独立したアクションを1関数に抱えている。それぞれを単一責任のサブコンポーネントへ切り出し、`TodoItemActionMenuDropdown` はそれらを並べるだけのコンテナにする。

各サブコンポーネントは「表示し、渡された `onClick`/`onSelect` を呼ぶ」ことだけに責任を持つ。`closeItemMenuAction` の呼び出しは `TodoItemActionMenuDropdown` 側でコールバックに合成してから渡す（サブコンポーネント自身は close の存在を知らない）。

### Task 6: `TodoItemActionMenuEditButton` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuEditButton.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuEditButton.test.tsx`

**Interfaces:**

- Produces: `TodoItemActionMenuEditButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuEditButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuEditButton } from "../TodoItemActionMenuEditButton";

describe("TodoItemActionMenuEditButton", () => {
  it("編集ボタンを表示する", () => {
    render(<TodoItemActionMenuEditButton onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuEditButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuEditButton.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuEditButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuEditButton.tsx`（既存の編集ボタンJSXと同一のclassName/文言を維持）:

```tsx
"use client";

import texts from "./locales/ja.json";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の編集ボタン */
export const TodoItemActionMenuEditButton = ({ onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
  >
    ✏️ {texts.list.editItemLabel}
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuEditButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuEditButton.tsx src/features/todo-lists/__tests__/TodoItemActionMenuEditButton.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuEditButton"
```

---

### Task 7: `TodoItemActionMenuInsertButton` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuInsertButton.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuInsertButton.test.tsx`

**Interfaces:**

- Produces: `TodoItemActionMenuInsertButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuInsertButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuInsertButton } from "../TodoItemActionMenuInsertButton";

describe("TodoItemActionMenuInsertButton", () => {
  it("下に追加ボタンを表示する", () => {
    render(<TodoItemActionMenuInsertButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /下に追加/ }),
    ).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuInsertButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /下に追加/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuInsertButton.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuInsertButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuInsertButton.tsx`:

```tsx
"use client";

import texts from "./locales/ja.json";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の「下に追加」ボタン */
export const TodoItemActionMenuInsertButton = ({ onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
  >
    ＋↓ {texts.list.insertAfterLabel}
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuInsertButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuInsertButton.tsx src/features/todo-lists/__tests__/TodoItemActionMenuInsertButton.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuInsertButton"
```

---

### Task 8: `TodoItemActionMenuIndentControls` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuIndentControls.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuIndentControls.test.tsx`

**Interfaces:**

- Produces: `TodoItemActionMenuIndentControls({ currentIndent: number; maxIndent: number; sortModeActive: boolean; onOutdent: () => void; onIndent: () => void }): JSX.Element`
  - 「インデントを下げる」は `currentIndent === 0 || sortModeActive` で disabled
  - 「インデントを上げる」は `currentIndent >= maxIndent || sortModeActive` で disabled

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuIndentControls.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuIndentControls } from "../TodoItemActionMenuIndentControls";

describe("TodoItemActionMenuIndentControls", () => {
  const defaultProps = {
    currentIndent: 1,
    maxIndent: 3,
    sortModeActive: false,
    onOutdent: jest.fn(),
    onIndent: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("インデントを下げる/上げるボタンを表示する", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeInTheDocument();
  });

  it("下げるボタンクリックで onOutdent が呼ばれる", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを下げる/ }));
    expect(defaultProps.onOutdent).toHaveBeenCalledTimes(1);
  });

  it("上げるボタンクリックで onIndent が呼ばれる", () => {
    render(<TodoItemActionMenuIndentControls {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /インデントを上げる/ }));
    expect(defaultProps.onIndent).toHaveBeenCalledTimes(1);
  });

  it("currentIndent が 0 のとき下げるボタンは disabled", () => {
    render(
      <TodoItemActionMenuIndentControls {...defaultProps} currentIndent={0} />,
    );
    expect(
      screen.getByRole("button", { name: /インデントを下げる/ }),
    ).toBeDisabled();
  });

  it("currentIndent が maxIndent 以上のとき上げるボタンは disabled", () => {
    render(
      <TodoItemActionMenuIndentControls
        {...defaultProps}
        currentIndent={3}
        maxIndent={3}
      />,
    );
    expect(
      screen.getByRole("button", { name: /インデントを上げる/ }),
    ).toBeDisabled();
  });

  it("sortModeActive のとき両方 disabled になり、クリックしても呼ばれない", () => {
    render(
      <TodoItemActionMenuIndentControls
        {...defaultProps}
        sortModeActive={true}
      />,
    );
    const outdentButton = screen.getByRole("button", {
      name: /インデントを下げる/,
    });
    const indentButton = screen.getByRole("button", {
      name: /インデントを上げる/,
    });
    expect(outdentButton).toBeDisabled();
    expect(indentButton).toBeDisabled();

    fireEvent.click(outdentButton);
    fireEvent.click(indentButton);
    expect(defaultProps.onOutdent).not.toHaveBeenCalled();
    expect(defaultProps.onIndent).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuIndentControls.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuIndentControls'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuIndentControls.tsx`:

```tsx
"use client";

type Props = {
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  onOutdent: () => void;
  onIndent: () => void;
};

/**
 * アクションメニュー内のインデント上げ/下げボタン。
 * sortModeActive中は生配列の隣接関係が画面表示と乖離しうるため無効化する
 * （TodoItemIndentButtons.tsx と同じ理由）。
 */
export const TodoItemActionMenuIndentControls = ({
  currentIndent,
  maxIndent,
  sortModeActive,
  onOutdent,
  onIndent,
}: Props) => (
  <>
    <button
      type="button"
      onClick={onOutdent}
      disabled={currentIndent === 0 || sortModeActive}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      ← インデントを下げる
    </button>
    <button
      type="button"
      onClick={onIndent}
      disabled={currentIndent >= maxIndent || sortModeActive}
      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
    >
      → インデントを上げる
    </button>
  </>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuIndentControls.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuIndentControls.tsx src/features/todo-lists/__tests__/TodoItemActionMenuIndentControls.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuIndentControls"
```

---

### Task 9: `TodoItemActionMenuColorSection` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuColorSection.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuColorSection.test.tsx`

**Interfaces:**

- Consumes: `TodoItemColorSwatches`（既存、`{ selectedColor, className, onSelectAction }`）
- Produces: `TodoItemActionMenuColorSection({ selectedColor: TodoItemBgColorValue | undefined; onSelect: (color: TodoItemBgColorValue | undefined) => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuColorSection.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoItemActionMenuColorSection } from "../TodoItemActionMenuColorSection";

describe("TodoItemActionMenuColorSection", () => {
  it("背景色の radiogroup を表示する", () => {
    render(
      <TodoItemActionMenuColorSection
        selectedColor={undefined}
        onSelect={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "背景色" }),
    ).toBeInTheDocument();
  });

  it("スウォッチ選択で onSelect が選択値で呼ばれる", () => {
    const onSelect = jest.fn();
    render(
      <TodoItemActionMenuColorSection
        selectedColor={undefined}
        onSelect={onSelect}
      />,
    );
    const radiogroup = screen.getByRole("radiogroup", { name: "背景色" });
    // index=1（赤: "bg-red-50"）を選択してデフォルト undefined を避ける
    const redSwatch = within(radiogroup).getAllByRole("radio")[1];
    fireEvent.click(redSwatch);
    expect(onSelect).toHaveBeenCalledWith("bg-red-50");
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuColorSection.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuColorSection'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuColorSection.tsx`:

```tsx
"use client";

import type { TodoItemBgColorValue } from "./types";
import { TodoItemColorSwatches } from "./TodoItemColorSwatches";

type Props = {
  selectedColor: TodoItemBgColorValue | undefined;
  onSelect: (color: TodoItemBgColorValue | undefined) => void;
};

/** アクションメニュー内の背景色セクション（ラベル + スウォッチ） */
export const TodoItemActionMenuColorSection = ({
  selectedColor,
  onSelect,
}: Props) => (
  <div
    className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600"
    data-color-picker
  >
    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">背景色</p>
    <TodoItemColorSwatches
      selectedColor={selectedColor}
      className="flex flex-wrap gap-1.5"
      onSelectAction={onSelect}
    />
  </div>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuColorSection.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuColorSection.tsx src/features/todo-lists/__tests__/TodoItemActionMenuColorSection.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuColorSection"
```

---

### Task 10: `TodoItemActionMenuCategorySection` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuCategorySection.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuCategorySection.test.tsx`

**Interfaces:**

- Consumes: `TodoCategorySwatches`（既存、`{ categories, selectedCategoryId, className, onSelectAction }`）
- Produces: `TodoItemActionMenuCategorySection({ categories: TodoCategory[]; selectedCategoryId: string | undefined; onSelect: (categoryId: string | undefined) => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuCategorySection.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TodoItemActionMenuCategorySection } from "../TodoItemActionMenuCategorySection";
import type { TodoCategory } from "../types";

const categories: TodoCategory[] = [
  { id: "cat-work", name: "仕事", createdAt: "" },
];

describe("TodoItemActionMenuCategorySection", () => {
  it("カテゴリの radiogroup を表示する", () => {
    render(
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={undefined}
        onSelect={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: "カテゴリ" }),
    ).toBeInTheDocument();
  });

  it("カテゴリ選択で onSelect が選択IDで呼ばれる", () => {
    const onSelect = jest.fn();
    render(
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={undefined}
        onSelect={onSelect}
      />,
    );
    const radiogroup = screen.getByRole("radiogroup", { name: "カテゴリ" });
    fireEvent.click(within(radiogroup).getByRole("radio", { name: "仕事" }));
    expect(onSelect).toHaveBeenCalledWith("cat-work");
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuCategorySection.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuCategorySection'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuCategorySection.tsx`:

```tsx
"use client";

import type { TodoCategory } from "./types";
import { TodoCategorySwatches } from "./TodoCategorySwatches";
import texts from "./locales/ja.json";

type Props = {
  categories: TodoCategory[];
  selectedCategoryId: string | undefined;
  onSelect: (categoryId: string | undefined) => void;
};

/** アクションメニュー内のカテゴリセクション（ラベル + スウォッチ） */
export const TodoItemActionMenuCategorySection = ({
  categories,
  selectedCategoryId,
  onSelect,
}: Props) => (
  <div className="px-3 py-1.5 border-t border-gray-100 dark:border-gray-600">
    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
      {texts.list.categoryPickerLabel}
    </p>
    <TodoCategorySwatches
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      className="flex flex-wrap gap-1.5"
      onSelectAction={onSelect}
    />
  </div>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuCategorySection.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuCategorySection.tsx src/features/todo-lists/__tests__/TodoItemActionMenuCategorySection.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuCategorySection"
```

---

### Task 11: `TodoItemActionMenuDeleteButton` を新規作成

**Files:**

- Create: `src/features/todo-lists/TodoItemActionMenuDeleteButton.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenuDeleteButton.test.tsx`

**Interfaces:**

- Produces: `TodoItemActionMenuDeleteButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/TodoItemActionMenuDeleteButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { TodoItemActionMenuDeleteButton } from "../TodoItemActionMenuDeleteButton";

describe("TodoItemActionMenuDeleteButton", () => {
  it("削除ボタンを表示する", () => {
    render(<TodoItemActionMenuDeleteButton onClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<TodoItemActionMenuDeleteButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuDeleteButton.test.tsx`
Expected: `Cannot find module '../TodoItemActionMenuDeleteButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/todo-lists/TodoItemActionMenuDeleteButton.tsx`:

```tsx
"use client";

type Props = {
  onClick: () => void;
};

/** アクションメニュー内の削除ボタン */
export const TodoItemActionMenuDeleteButton = ({ onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
  >
    🗑️ 削除
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenuDeleteButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenuDeleteButton.tsx src/features/todo-lists/__tests__/TodoItemActionMenuDeleteButton.test.tsx
git commit -m "feat(todo-lists): add TodoItemActionMenuDeleteButton"
```

---

### Task 12: `TodoItemActionMenuDropdown` をサブコンポーネント合成に書き換える

**Files:**

- Modify: `src/features/todo-lists/TodoItemActionMenu.tsx`
- Test: `src/features/todo-lists/__tests__/TodoItemActionMenu.test.tsx`（既存、変更なしで通ることを確認するのみ）

**Interfaces:**

- Consumes: Task 6〜11で作成した6コンポーネント
- Produces: `TodoItemActionMenuDropdown` の公開シグネチャ（`TodoItemActionMenuProps` から `toggleItemMenuAction` を除いた型）は変更しない

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenu.test.tsx`
Expected: 全件 PASS（21件）

- [ ] **Step 2: `TodoItemActionMenuDropdown` の中身を6コンポーネントの合成に書き換える**

`src/features/todo-lists/TodoItemActionMenu.tsx` 全体:

```tsx
"use client";

import type { TodoCategory, TodoItemBgColorValue, TodoListItem } from "./types";
import { TodoItemActionMenuEditButton } from "./TodoItemActionMenuEditButton";
import { TodoItemActionMenuInsertButton } from "./TodoItemActionMenuInsertButton";
import { TodoItemActionMenuIndentControls } from "./TodoItemActionMenuIndentControls";
import { TodoItemActionMenuColorSection } from "./TodoItemActionMenuColorSection";
import { TodoItemActionMenuCategorySection } from "./TodoItemActionMenuCategorySection";
import { TodoItemActionMenuDeleteButton } from "./TodoItemActionMenuDeleteButton";

type TodoItemActionMenuProps = {
  item: Pick<TodoListItem, "id" | "title" | "bgColor" | "categoryId">;
  listId: string;
  categories: TodoCategory[];
  currentIndent: number;
  maxIndent: number;
  sortModeActive: boolean;
  itemMenuItemId: string | null;
  toggleItemMenuAction: (id: string) => void;
  closeItemMenuAction: () => void;
  startEditItemAction: (id: string, title: string) => void;
  onInsertAfterAction: () => void;
  onOutdentItemAction: (listId: string, itemId: string) => void;
  onIndentItemAction: (listId: string, itemId: string) => void;
  onUpdateItemBgColorAction: (
    listId: string,
    itemId: string,
    bgColor: TodoItemBgColorValue | undefined,
  ) => void;
  onUpdateItemCategoryAction: (
    listId: string,
    itemId: string,
    categoryId: string | undefined,
  ) => void;
  onDeleteItemAction: (listId: string, itemId: string, title: string) => void;
};

/**
 * Todoアイテムのアクションメニュー（PC/モバイル共通、常時表示）。
 * ⋮ トリガーボタンと、クリック/タップで開くドロップダウンメニューを含む。
 * SwipeableRoutineItem の overflow-hidden の外に配置するため、
 * ドロップダウンは <li> 直下（SwipeableRoutineItem の兄弟）として
 * 親コンポーネントがレンダリングする必要がある。
 */
export const TodoItemActionMenuTrigger = ({
  item,
  itemMenuItemId,
  toggleItemMenuAction,
}: Pick<
  TodoItemActionMenuProps,
  "item" | "itemMenuItemId" | "toggleItemMenuAction"
>) => (
  <div
    data-item-menu
    onTouchStartCapture={(e) => e.stopPropagation()}
    onMouseDownCapture={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      onClick={() => toggleItemMenuAction(item.id)}
      aria-label="アクションメニュー"
      aria-haspopup="true"
      aria-expanded={itemMenuItemId === item.id}
      aria-controls={`item-menu-${item.id}`}
      className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-gray-500 text-lg leading-none"
    >
      ⋮
    </button>
  </div>
);

/**
 * アクションメニューのドロップダウン本体。
 * `itemMenuItemId === item.id` の場合のみ表示する。
 * 各アクション項目（編集・下に追加・インデント・背景色・カテゴリ・削除）は
 * 単一責任のサブコンポーネントに委譲し、ここではそれらを並べて
 * 「アクション実行後にメニューを閉じる」コールバックを合成するだけ。
 */
export const TodoItemActionMenuDropdown = ({
  item,
  listId,
  categories,
  currentIndent,
  maxIndent,
  sortModeActive,
  itemMenuItemId,
  closeItemMenuAction,
  startEditItemAction,
  onInsertAfterAction,
  onOutdentItemAction,
  onIndentItemAction,
  onUpdateItemBgColorAction,
  onUpdateItemCategoryAction,
  onDeleteItemAction,
}: Omit<TodoItemActionMenuProps, "toggleItemMenuAction">) => {
  if (itemMenuItemId !== item.id) return null;

  return (
    <div
      id={`item-menu-${item.id}`}
      aria-label="アクションメニュー"
      data-item-menu
      className="absolute right-0 top-full mt-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-500 rounded-lg shadow-lg z-50 min-w-[10rem] py-1 max-h-[60vh] overflow-y-auto"
    >
      <TodoItemActionMenuEditButton
        onClick={() => {
          startEditItemAction(item.id, item.title);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuInsertButton
        onClick={() => {
          onInsertAfterAction();
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuIndentControls
        currentIndent={currentIndent}
        maxIndent={maxIndent}
        sortModeActive={sortModeActive}
        onOutdent={() => {
          onOutdentItemAction(listId, item.id);
          closeItemMenuAction();
        }}
        onIndent={() => {
          onIndentItemAction(listId, item.id);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuColorSection
        selectedColor={item.bgColor}
        onSelect={(value) => {
          onUpdateItemBgColorAction(listId, item.id, value);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuCategorySection
        categories={categories}
        selectedCategoryId={item.categoryId}
        onSelect={(categoryId) => {
          onUpdateItemCategoryAction(listId, item.id, categoryId);
          closeItemMenuAction();
        }}
      />
      <TodoItemActionMenuDeleteButton
        onClick={() => {
          onDeleteItemAction(listId, item.id, item.title);
          closeItemMenuAction();
        }}
      />
    </div>
  );
};
```

- [ ] **Step 3: 既存テストを再実行し、書き換え後も全件通ることを確認する**

Run: `npx jest src/features/todo-lists/__tests__/TodoItemActionMenu.test.tsx`
Expected: 全件 PASS（Step 1と同じ21件。DOM構造・className・aria属性は完全に同一のまま維持しているため差分は出ないはず）

- [ ] **Step 4: 型チェックとlint**

Run: `npx tsc --noEmit && npm run lint`
Expected: エラー・警告なし

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/todo-lists/TodoItemActionMenu.tsx
git commit -m "refactor(todo-lists): TodoItemActionMenuDropdown をアクション別サブコンポーネントに分割"
```

---

## 全体の最終検証（全タスク完了後）

- [ ] **Step 1: プロジェクト全体のテストを実行する**

Run: `npx jest`
Expected: 全スイート PASS（新規追加分だけテスト件数が増える。既存の統合テストは1件も失っていないこと）

- [ ] **Step 2: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: lint**

Run: `npm run lint`
Expected: 警告・エラーなし

- [ ] **Step 4: 目視確認（任意、UIの見た目が変わっていないことの最終確認）**

Storybook（`npm run storybook`）で `Features/TodoLists/TodoListsPage` の `WithSelectedList` ストーリーを開き、アクションメニュー（⋮）を開いて全項目（編集・下に追加・インデント上げ下げ・背景色・カテゴリ・削除）が従来通り表示・動作することを確認する。

- [ ] **Step 5: 変更差分のレビュー（コミットはしない）**

Run: `git status && git diff --stat`
Expected: グループA〜Cで新規作成・変更したファイルのみが差分に含まれる。`git add`/`git commit` は各タスクの手順に記載しているが、**実行せず** ユーザーの確認を待つ。
