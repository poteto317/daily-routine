# ルーティンプリセット コピー機能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** プリセット管理画面（`PresetManager`）の各プリセットカードに「コピー」操作を追加し、既存プリセットを複製できるようにする。複製されたプリセットは元のプリセットと完全に独立している（`id`・`createdAt`・`updatedAt`を新規発行し、`routineTemplates`も新しい配列・要素として複製する）。

**Architecture:** 既存の作成（`createPresetFromRoutines`）・削除（`deletePreset`）と同じ層構造をそのまま踏襲する。データ層 → ロジック層 → ハンドラー層 → hooks層 → UI層の順に配線を積み上げる。合わせて、既存の編集・削除ボタンを「絵文字のみ」から「絵文字+テキスト」表示に統一する（設計の Deep Dig で決定）。

**Tech Stack:** React 19 / Next.js（App Router）/ TypeScript / Jest + Testing Library

設計書: `docs/superpowers/specs/2026-08-08-preset-duplicate-design.md`

## Global Constraints

- 複製されたプリセットは元プリセットと一切参照を共有しない。`id`は新規発行、`routineTemplates`は配列・各要素とも新しいオブジェクトとしてコピーする
- 複製は確認ダイアログなしで即実行、トースト通知・自動スクロールも行わない（完全にサイレント）
- 連鎖コピー時の命名は単純に末尾へ「のコピー」を追記する方式（連番なし）
- プリセット数の上限チェックは実装しない（スコープ外）
- 同期（`normalizeCoreSyncData`の配列まるごと置換方式）への追加対応はしない（既存踏襲）
- 複製ボタンのイベント処理は既存の編集・削除ボタンと同じ「plain onClick + `event.stopPropagation()`」方式を踏襲する（touchstart/mousedown capture方式は導入しない）
- 既存の作成・削除・編集・適用フローの挙動は一切変更しない（編集・削除ボタンは表示ラベルのみ変更、ハンドラー・挙動は不変）
- テストは `npx jest src/features/preset` で実行する。型チェックは `npx tsc --noEmit`。lintは `npm run lint`
- コミットは各タスクの最後に用意されているが、**実行しない**（自動コミット禁止、ユーザー指示）。ファイル変更のみ行う

---

### Task 1: データ層 — `storageFactory.ts` に `duplicatePreset` を追加

**Files:**
- Modify: `src/features/preset/storageFactory.ts`
- Test: `src/features/preset/__tests__/storage.data-and-factory.test.ts`

**Interfaces:**
- Produces: `duplicatePreset(preset: RoutinePreset): RoutinePreset`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/storage.data-and-factory.test.ts` の末尾（`describe`ブロック内、最後の`it`の後）に追加:

```ts
  it("プリセットを複製し、新しいidと「のコピー」を付けた名前を発行する", () => {
    const preset = createPreset({
      id: "preset1",
      name: "朝ルーティン",
      description: "朝の準備",
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
      ],
    });

    const duplicated = duplicatePreset(preset);

    expect(duplicated.id).not.toBe(preset.id);
    expect(duplicated.name).toBe("朝ルーティンのコピー");
    expect(duplicated.description).toBe("朝の準備");
    expect(duplicated.routineTemplates).toEqual(preset.routineTemplates);
  });

  it("複製後にroutineTemplates配列を書き換えても元プリセットに影響しない", () => {
    const preset = createPreset({
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
      ],
    });

    const duplicated = duplicatePreset(preset);
    duplicated.routineTemplates.push({
      title: "追加された項目",
      startTime: "12:00",
      duration: 10,
      category: "life",
    });
    duplicated.routineTemplates[0].title = "書き換えられたタイトル";

    expect(preset.routineTemplates).toHaveLength(1);
    expect(preset.routineTemplates[0].title).toBe("朝食");
  });

  it("複製のcreatedAt/updatedAtは元プリセットの値を引き継がない", () => {
    const preset = createPreset({
      createdAt: "2020-01-01T00:00:00.000Z",
      updatedAt: "2020-01-01T00:00:00.000Z",
    });

    const duplicated = duplicatePreset(preset);

    expect(duplicated.createdAt).not.toBe(preset.createdAt);
    expect(duplicated.updatedAt).not.toBe(preset.updatedAt);
  });
```

このファイル冒頭のimportに `duplicatePreset` を追加:

```ts
import {
  createPresetFromRoutines,
  createRoutinesFromPreset,
  duplicatePreset,
  getPresets,
  savePresets,
} from "../storage";
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/storage.data-and-factory.test.ts`
Expected: `duplicatePreset is not a function` 等で新規追加した3件が FAIL

- [ ] **Step 3: 実装を書く**

`src/features/preset/storageFactory.ts` に追加（ファイル末尾）:

```ts
export const duplicatePreset = (preset: RoutinePreset): RoutinePreset => {
  const now = new Date().toISOString();
  return {
    id: createPresetId(),
    name: `${preset.name}のコピー`,
    description: preset.description,
    routineTemplates: preset.routineTemplates.map((template) => ({
      ...template,
    })),
    createdAt: now,
    updatedAt: now,
  };
};
```

`src/features/preset/storage.ts` の re-export に `duplicatePreset` を追加:

```ts
export { getPresets, savePresets } from "./storageData";
export {
  createPresetFromRoutines,
  createRoutinesFromPreset,
  duplicatePreset,
} from "./storageFactory";
export { addPreset, updatePreset, deletePreset } from "./storageMutations";
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/storage.data-and-factory.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/storageFactory.ts src/features/preset/storage.ts src/features/preset/__tests__/storage.data-and-factory.test.ts
git commit -m "feat(preset): storageFactoryにduplicatePresetを追加"
```

---

### Task 2: ロジック層 — `presetManagerStateActions.ts` に `duplicatePresetAndReload` を追加

**Files:**
- Modify: `src/features/preset/presetManagerStateActions.ts`
- Test: `src/features/preset/__tests__/presetManagerStateActions.test.ts`

**Interfaces:**
- Consumes: `duplicatePreset`（Task 1）, `addPreset` / `getPresets`（既存 `storage.ts`）, `findPresetById`（既存 `presetStateHelpers.ts`）
- Produces: `duplicatePresetAndReload(presets: RoutinePreset[], presetId: string): { presets: RoutinePreset[]; duplicated: boolean }`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetManagerStateActions.test.ts` の冒頭のimportを変更:

```ts
jest.mock("@/features/preset/storage", () => ({
  addPreset: jest.fn(),
  createPresetFromRoutines: jest.fn(),
  createRoutinesFromPreset: jest.fn(),
  deletePreset: jest.fn(),
  duplicatePreset: jest.fn(),
  getPresets: jest.fn(),
  updatePreset: jest.fn(),
}));

import {
  addPreset,
  createPresetFromRoutines,
  createRoutinesFromPreset,
  deletePreset,
  duplicatePreset,
  getPresets,
  updatePreset,
} from "@/features/preset/storage";
import {
  applyPresetSelection,
  cancelPresetEdit,
  createPresetAndReload,
  deletePresetAndReload,
  duplicatePresetAndReload,
  loadPresetList,
  resolveCreateFilterSelection,
  savePresetEditAndReload,
  startPresetEdit,
  togglePresetSelection,
} from "../presetManagerStateActions";
```

`describe("presetManagerStateActions", ...)` 内、`"作成/削除を処理する"` の `it` ブロックの直後に追加:

```ts
  it("複製を処理する", () => {
    const duplicated: RoutinePreset = {
      id: "p1-copy",
      name: "朝ルーティンのコピー",
      description: "desc",
      routineTemplates: [
        { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
      ],
      createdAt: "2026-03-08T00:00:00.000Z",
      updatedAt: "2026-03-08T00:00:00.000Z",
    };
    (duplicatePreset as jest.Mock).mockReturnValue(duplicated);

    expect(duplicatePresetAndReload([preset], "missing")).toEqual({
      presets: [preset],
      duplicated: false,
    });
    expect(addPreset).not.toHaveBeenCalled();

    expect(duplicatePresetAndReload([preset], "p1")).toEqual({
      presets: [preset],
      duplicated: true,
    });
    expect(duplicatePreset).toHaveBeenCalledWith(preset);
    expect(addPreset).toHaveBeenCalledWith(duplicated);
  });
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/presetManagerStateActions.test.ts`
Expected: `duplicatePresetAndReload is not a function` で新規追加分が FAIL

- [ ] **Step 3: 実装を書く**

`src/features/preset/presetManagerStateActions.ts` のimportを変更:

```ts
import {
  addPreset,
  createPresetFromRoutines,
  createRoutinesFromPreset,
  deletePreset,
  duplicatePreset,
  getPresets,
  updatePreset,
} from "@/features/preset/storage";
```

`deletePresetAndReload` の定義の直後に追加:

```ts
export const duplicatePresetAndReload = (
  presets: RoutinePreset[],
  presetId: string,
): { presets: RoutinePreset[]; duplicated: boolean } => {
  const preset = findPresetById(presets, presetId);
  if (!preset) {
    return { presets: loadPresetList(), duplicated: false };
  }

  addPreset(duplicatePreset(preset));
  return { presets: loadPresetList(), duplicated: true };
};
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/presetManagerStateActions.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/presetManagerStateActions.ts src/features/preset/__tests__/presetManagerStateActions.test.ts
git commit -m "feat(preset): duplicatePresetAndReloadを追加"
```

---

### Task 3: ハンドラー層 — 新規 `presetDuplicateActions.ts`

**Files:**
- Create: `src/features/preset/presetDuplicateActions.ts`
- Test: `src/features/preset/__tests__/presetDuplicateActions.test.ts`

**Interfaces:**
- Consumes: `duplicatePresetAndReload`（Task 2）
- Produces: `createPresetDuplicateHandler(args: { presets: RoutinePreset[]; setPresets: Dispatch<SetStateAction<RoutinePreset[]>> }): (presetId: string) => void`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetDuplicateActions.test.ts`:

```ts
import type { RoutinePreset } from "@/types/routine";
import { createPresetDuplicateHandler } from "../presetDuplicateActions";

jest.mock("../presetManagerStateActions", () => ({
  duplicatePresetAndReload: jest.fn(),
}));

import { duplicatePresetAndReload } from "../presetManagerStateActions";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "desc",
  routineTemplates: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("presetDuplicateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("複製 handler が成功時のみ state を更新する", () => {
    (duplicatePresetAndReload as jest.Mock)
      .mockReturnValueOnce({ presets: [preset], duplicated: false })
      .mockReturnValueOnce({ presets: [preset, preset], duplicated: true });

    const setPresets = jest.fn();
    const duplicateHandler = createPresetDuplicateHandler({
      presets: [preset],
      setPresets,
    });

    duplicateHandler("missing");
    expect(setPresets).not.toHaveBeenCalled();

    duplicateHandler("p1");
    expect(duplicatePresetAndReload).toHaveBeenCalledWith([preset], "p1");
    expect(setPresets).toHaveBeenCalledTimes(1);
    expect(setPresets).toHaveBeenCalledWith([preset, preset]);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/presetDuplicateActions.test.ts`
Expected: `Cannot find module '../presetDuplicateActions'` で FAIL

- [ ] **Step 3: 実装を書く**

`src/features/preset/presetDuplicateActions.ts`:

```ts
import type { Dispatch, SetStateAction } from "react";
import type { RoutinePreset } from "@/types/routine";
import { duplicatePresetAndReload } from "./presetManagerStateActions";

type DuplicatePresetHandlerArgs = {
  presets: RoutinePreset[];
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
};

export const createPresetDuplicateHandler = ({
  presets,
  setPresets,
}: DuplicatePresetHandlerArgs) => {
  return (presetId: string) => {
    const { presets: nextPresets, duplicated } = duplicatePresetAndReload(
      presets,
      presetId,
    );
    if (!duplicated) return;
    setPresets(nextPresets);
  };
};
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/presetDuplicateActions.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/presetDuplicateActions.ts src/features/preset/__tests__/presetDuplicateActions.test.ts
git commit -m "feat(preset): createPresetDuplicateHandlerを追加"
```

---

### Task 4: hooks層 — `usePresetApplyDeleteActions` / `presetApplyDeleteActionsResult` に配線

**Files:**
- Modify: `src/features/preset/usePresetApplyDeleteActions.ts`
- Modify: `src/features/preset/presetApplyDeleteActionsResult.ts`
- Test: `src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx`
- Test: `src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts`

**Interfaces:**
- Consumes: `createPresetDuplicateHandler`（Task 3）
- Produces: `usePresetApplyDeleteActions(...)` の戻り値に `handleDuplicatePreset: (presetId: string) => void` を追加

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts` を全体書き換え:

```ts
import { createPresetApplyDeleteActionsResult } from "../presetApplyDeleteActionsResult";

describe("createPresetApplyDeleteActionsResult", () => {
  it("apply/delete/duplicate action を公開 shape に載せる", () => {
    const handleApplyPreset = jest.fn();
    const handleDeletePreset = jest.fn();
    const handleDuplicatePreset = jest.fn();

    expect(
      createPresetApplyDeleteActionsResult({
        handleApplyPreset,
        handleDeletePreset,
        handleDuplicatePreset,
      }),
    ).toEqual({
      handleApplyPreset,
      handleDeletePreset,
      handleDuplicatePreset,
    });
  });
});
```

`src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx` を全体書き換え:

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../presetApplyDeleteActionsResult", () => ({
  createPresetApplyDeleteActionsResult: jest.fn(),
}));

jest.mock("../presetApplyDeleteActions", () => ({
  createPresetApplyHandler: jest.fn(),
  createPresetDeleteHandler: jest.fn(),
}));

jest.mock("../presetDuplicateActions", () => ({
  createPresetDuplicateHandler: jest.fn(),
}));

import { createPresetApplyDeleteActionsResult } from "../presetApplyDeleteActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "../presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "../presetDuplicateActions";
import { usePresetApplyDeleteActions } from "../usePresetApplyDeleteActions";

describe("usePresetApplyDeleteActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPresetApplyDeleteActionsResult as jest.Mock).mockImplementation(
      (value) => value,
    );
  });

  it("delete/apply/duplicate handler を組み立てて委譲する", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const handleDuplicatePreset = jest.fn();
    const resultShape = {
      handleDeletePreset: jest.fn(),
      handleApplyPreset: jest.fn(),
      handleDuplicatePreset: jest.fn(),
      composed: true,
    };

    (createPresetDeleteHandler as jest.Mock).mockReturnValue(
      handleDeletePreset,
    );
    (createPresetApplyHandler as jest.Mock).mockReturnValue(handleApplyPreset);
    (createPresetDuplicateHandler as jest.Mock).mockReturnValue(
      handleDuplicatePreset,
    );
    (createPresetApplyDeleteActionsResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      presets: [
        {
          id: "p1",
          name: "朝ルーティン",
          description: "desc",
          routineTemplates: [],
          createdAt: "2026-03-07T00:00:00.000Z",
          updatedAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      selectedPresetId: "p1" as string | null,
      selectedDays: new Set([1]),
      onApplyPreset: jest.fn(),
      setPresets: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };

    const { result } = renderHook(() => usePresetApplyDeleteActions(params));

    expect(result.current).toBe(resultShape);
    expect(createPresetApplyDeleteActionsResult).toHaveBeenCalledWith({
      handleDeletePreset: expect.any(Function),
      handleApplyPreset: expect.any(Function),
      handleDuplicatePreset: expect.any(Function),
    });

    const builtHandlers = (createPresetApplyDeleteActionsResult as jest.Mock)
      .mock.calls[0][0] as {
      handleDeletePreset: (presetId: string) => void;
      handleApplyPreset: () => void;
      handleDuplicatePreset: (presetId: string) => void;
    };

    act(() => {
      builtHandlers.handleDeletePreset("p1");
      builtHandlers.handleApplyPreset();
      builtHandlers.handleDuplicatePreset("p1");
    });

    expect(createPresetDeleteHandler).toHaveBeenCalledWith({
      setPresets: params.setPresets,
    });
    expect(createPresetApplyHandler).toHaveBeenCalledWith({
      presets: params.presets,
      selectedPresetId: "p1",
      selectedDays: params.selectedDays,
      onApplyPreset: params.onApplyPreset,
      setSelectedPresetId: params.setSelectedPresetId,
      setSelectedDays: params.setSelectedDays,
    });
    expect(createPresetDuplicateHandler).toHaveBeenCalledWith({
      presets: params.presets,
      setPresets: params.setPresets,
    });
    expect(handleDeletePreset).toHaveBeenCalledWith("p1");
    expect(handleApplyPreset).toHaveBeenCalled();
    expect(handleDuplicatePreset).toHaveBeenCalledWith("p1");
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts`
Expected: `handleDuplicatePreset` を含まない/呼ばれないことによる assertion 失敗、または `Cannot find module '../presetDuplicateActions'`（mock対象が実体を要求するため）

- [ ] **Step 3: 実装を書く**

`src/features/preset/presetApplyDeleteActionsResult.ts` 全体を書き換え:

```ts
type PresetApplyDeleteActionsResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
};

export const createPresetApplyDeleteActionsResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
}: PresetApplyDeleteActionsResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  };
};
```

`src/features/preset/usePresetApplyDeleteActions.ts` 全体を書き換え:

```ts
import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetApplyDeleteActionsResult } from "./presetApplyDeleteActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "./presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "./presetDuplicateActions";

type UsePresetApplyDeleteActionsParams = {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const usePresetApplyDeleteActions = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetApplyDeleteActionsParams) => {
  const handleDeletePreset = createPresetDeleteHandler({ setPresets });
  const handleApplyPreset = createPresetApplyHandler({
    presets,
    selectedPresetId,
    selectedDays,
    onApplyPreset,
    setSelectedPresetId,
    setSelectedDays,
  });
  const handleDuplicatePreset = createPresetDuplicateHandler({
    presets,
    setPresets,
  });

  return createPresetApplyDeleteActionsResult({
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  });
};
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/usePresetApplyDeleteActions.ts src/features/preset/presetApplyDeleteActionsResult.ts src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts
git commit -m "feat(preset): usePresetApplyDeleteActionsにhandleDuplicatePresetを配線"
```

---

### Task 5: hooks層 — `usePresetManagerActionHandlers` / `presetManagerActionHandlersResult` に配線

**Files:**
- Modify: `src/features/preset/usePresetManagerActionHandlers.ts`
- Modify: `src/features/preset/presetManagerActionHandlersResult.ts`
- Test: `src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx`
- Test: `src/features/preset/__tests__/presetManagerActionHandlersResult.test.ts`

**Interfaces:**
- Consumes: `usePresetApplyDeleteActions(...).handleDuplicatePreset`（Task 4）
- Produces: `usePresetManagerActionHandlers(...)` の戻り値に `handleDuplicatePreset: (presetId: string) => void` を追加

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetManagerActionHandlersResult.test.ts` を全体書き換え:

```ts
import { createPresetManagerActionHandlersResult } from "../presetManagerActionHandlersResult";

describe("presetManagerActionHandlersResult", () => {
  it("preset manager handlers の公開 shape を組み立てる", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const handleDuplicatePreset = jest.fn();
    const toggleDaySelection = jest.fn();

    expect(
      createPresetManagerActionHandlersResult({
        handleDeletePreset,
        handleApplyPreset,
        handleDuplicatePreset,
        toggleDaySelection,
      }),
    ).toEqual({
      handleDeletePreset,
      handleApplyPreset,
      handleDuplicatePreset,
      toggleDaySelection,
    });
  });
});
```

`src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx` を全体書き換え:

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../usePresetApplyDeleteActions", () => ({
  usePresetApplyDeleteActions: jest.fn(),
}));

jest.mock("../usePresetDaySelectionAction", () => ({
  usePresetDaySelectionAction: jest.fn(),
}));

jest.mock("../presetManagerActionHandlersResult", () => ({
  createPresetManagerActionHandlersResult: jest.fn(),
}));

import { createPresetManagerActionHandlersResult } from "../presetManagerActionHandlersResult";
import { usePresetApplyDeleteActions } from "../usePresetApplyDeleteActions";
import { usePresetDaySelectionAction } from "../usePresetDaySelectionAction";
import { usePresetManagerActionHandlers } from "../usePresetManagerActionHandlers";

describe("usePresetManagerActionHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delete/apply/duplicate/day toggle handler を組み立てて委譲する", () => {
    const handleDeletePreset = jest.fn();
    const handleApplyPreset = jest.fn();
    const handleDuplicatePreset = jest.fn();
    const toggleDaySelection = jest.fn();
    const resultShape = {
      handleDeletePreset: jest.fn(),
      handleApplyPreset: jest.fn(),
      handleDuplicatePreset: jest.fn(),
      toggleDaySelection: jest.fn(),
      composed: true,
    };

    (usePresetApplyDeleteActions as jest.Mock).mockReturnValue({
      handleDeletePreset,
      handleApplyPreset,
      handleDuplicatePreset,
    });
    (usePresetDaySelectionAction as jest.Mock).mockReturnValue({
      toggleDaySelection,
    });
    (createPresetManagerActionHandlersResult as jest.Mock).mockReturnValue(
      resultShape,
    );

    const params = {
      presets: [
        {
          id: "p1",
          name: "朝ルーティン",
          description: "desc",
          routineTemplates: [],
          createdAt: "2026-03-07T00:00:00.000Z",
          updatedAt: "2026-03-07T00:00:00.000Z",
        },
      ],
      selectedPresetId: "p1" as string | null,
      selectedDays: new Set([1]),
      onApplyPreset: jest.fn(),
      setPresets: jest.fn(),
      setSelectedPresetId: jest.fn(),
      setSelectedDays: jest.fn(),
    };

    const { result } = renderHook(() => usePresetManagerActionHandlers(params));

    expect(result.current).toBe(resultShape);
    expect(createPresetManagerActionHandlersResult).toHaveBeenCalledWith({
      handleDeletePreset,
      handleApplyPreset,
      handleDuplicatePreset,
      toggleDaySelection,
    });

    const builtHandlers = (createPresetManagerActionHandlersResult as jest.Mock)
      .mock.calls[0][0] as {
      handleDeletePreset: (presetId: string) => void;
      handleApplyPreset: () => void;
      handleDuplicatePreset: (presetId: string) => void;
      toggleDaySelection: (day: number) => void;
    };

    act(() => {
      builtHandlers.handleDeletePreset("p1");
      builtHandlers.handleApplyPreset();
      builtHandlers.handleDuplicatePreset("p1");
      builtHandlers.toggleDaySelection(2);
    });

    expect(usePresetApplyDeleteActions).toHaveBeenCalledWith({
      presets: params.presets,
      selectedPresetId: "p1",
      selectedDays: params.selectedDays,
      onApplyPreset: params.onApplyPreset,
      setPresets: params.setPresets,
      setSelectedPresetId: params.setSelectedPresetId,
      setSelectedDays: params.setSelectedDays,
    });
    expect(usePresetDaySelectionAction).toHaveBeenCalledWith({
      selectedDays: params.selectedDays,
      setSelectedDays: params.setSelectedDays,
    });

    expect(handleDeletePreset).toHaveBeenCalledWith("p1");
    expect(handleApplyPreset).toHaveBeenCalled();
    expect(handleDuplicatePreset).toHaveBeenCalledWith("p1");
    expect(toggleDaySelection).toHaveBeenCalledWith(2);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx src/features/preset/__tests__/presetManagerActionHandlersResult.test.ts`
Expected: `handleDuplicatePreset` が欠けていることによる assertion 失敗

- [ ] **Step 3: 実装を書く**

`src/features/preset/presetManagerActionHandlersResult.ts` 全体を書き換え:

```ts
type PresetManagerActionHandlersResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
  toggleDaySelection: (day: number) => void;
};

export const createPresetManagerActionHandlersResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
  toggleDaySelection,
}: PresetManagerActionHandlersResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
    toggleDaySelection,
  };
};
```

`src/features/preset/usePresetManagerActionHandlers.ts` 全体を書き換え:

```ts
import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetManagerActionHandlersResult } from "./presetManagerActionHandlersResult";
import { usePresetApplyDeleteActions } from "./usePresetApplyDeleteActions";
import { usePresetDaySelectionAction } from "./usePresetDaySelectionAction";

type UsePresetManagerActionHandlersParams = {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  onApplyPreset: (
    routines: Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[],
    targetDays: number[],
  ) => void;
  setPresets: Dispatch<SetStateAction<RoutinePreset[]>>;
  setSelectedPresetId: Dispatch<SetStateAction<string | null>>;
  setSelectedDays: Dispatch<SetStateAction<Set<number>>>;
};

export const usePresetManagerActionHandlers = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetManagerActionHandlersParams) => {
  const { handleApplyPreset, handleDeletePreset, handleDuplicatePreset } =
    usePresetApplyDeleteActions({
      presets,
      selectedPresetId,
      selectedDays,
      onApplyPreset,
      setPresets,
      setSelectedPresetId,
      setSelectedDays,
    });
  const { toggleDaySelection } = usePresetDaySelectionAction({
    selectedDays,
    setSelectedDays,
  });

  return createPresetManagerActionHandlersResult({
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
    toggleDaySelection,
  });
};
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx src/features/preset/__tests__/presetManagerActionHandlersResult.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/usePresetManagerActionHandlers.ts src/features/preset/presetManagerActionHandlersResult.ts src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx src/features/preset/__tests__/presetManagerActionHandlersResult.test.ts
git commit -m "feat(preset): usePresetManagerActionHandlersにhandleDuplicatePresetを配線"
```

---

### Task 6: `presetManagerStateResult.ts` に `handleDuplicatePreset` を追加

**Files:**
- Modify: `src/features/preset/presetManagerStateResult.ts`
- Test: `src/features/preset/__tests__/presetManagerStateResult.test.ts`

**Interfaces:**
- Consumes: `actionHandlers.handleDuplicatePreset`（Task 5）
- Produces: `createPresetManagerStateResult(...)` の戻り値に `handleDuplicatePreset: (presetId: string) => void` を追加

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetManagerStateResult.test.ts` の `actionHandlers` オブジェクトと期待値 `result` オブジェクトの両方に `handleDuplicatePreset` を追加する。ファイル全体を以下に書き換え:

```ts
import { createPresetManagerStateResult } from "../presetManagerStateResult";

describe("createPresetManagerStateResult", () => {
  it("base state と action/create/edit state を flat な公開 shape に組み立てる", () => {
    const setSelectedPresetId = jest.fn();
    const result = createPresetManagerStateResult({
      baseState: {
        presets: [{ id: "p1" } as never],
        selectedPresetId: "p1",
        selectedDays: new Set([1, 2]),
        setPresets: jest.fn(),
        setSelectedPresetId,
        setSelectedDays: jest.fn(),
      },
      actionHandlers: {
        handleApplyPreset: jest.fn(),
        handleDeletePreset: jest.fn(),
        handleDuplicatePreset: jest.fn(),
        toggleDaySelection: jest.fn(),
      },
      creationState: {
        isCreating: true,
        newPresetName: "朝",
        newPresetDescription: "desc",
        selectedRoutines: new Set(["r1"]),
        createFilterDays: new Set([1]),
        setIsCreating: jest.fn(),
        setNewPresetName: jest.fn(),
        setNewPresetDescription: jest.fn(),
        handleCreatePreset: jest.fn(),
        toggleRoutineSelection: jest.fn(),
        toggleCreateFilterDay: jest.fn(),
      },
      editState: {
        editingPresetId: "p1",
        editPresetName: "更新後",
        editPresetDescription: "new",
        editSelectedRoutines: new Set(["r2"]),
        setEditPresetName: jest.fn(),
        setEditPresetDescription: jest.fn(),
        handleStartEdit: jest.fn(),
        handleCancelEdit: jest.fn(),
        handleSaveEdit: jest.fn(),
        toggleEditRoutineSelection: jest.fn(),
      },
    });

    expect(result).toEqual({
      presets: [{ id: "p1" }],
      selectedPresetId: "p1",
      selectedDays: new Set([1, 2]),
      setSelectedPresetId,
      handleDeletePreset: expect.any(Function),
      handleApplyPreset: expect.any(Function),
      handleDuplicatePreset: expect.any(Function),
      toggleDaySelection: expect.any(Function),
      isCreating: true,
      newPresetName: "朝",
      newPresetDescription: "desc",
      selectedRoutines: new Set(["r1"]),
      createFilterDays: new Set([1]),
      setIsCreating: expect.any(Function),
      setNewPresetName: expect.any(Function),
      setNewPresetDescription: expect.any(Function),
      handleCreatePreset: expect.any(Function),
      toggleRoutineSelection: expect.any(Function),
      toggleCreateFilterDay: expect.any(Function),
      editingPresetId: "p1",
      editPresetName: "更新後",
      editPresetDescription: "new",
      editSelectedRoutines: new Set(["r2"]),
      setEditPresetName: expect.any(Function),
      setEditPresetDescription: expect.any(Function),
      handleStartEdit: expect.any(Function),
      handleCancelEdit: expect.any(Function),
      handleSaveEdit: expect.any(Function),
      toggleEditRoutineSelection: expect.any(Function),
    });
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/presetManagerStateResult.test.ts`
Expected: `handleDuplicatePreset` が結果に含まれないことによる assertion 失敗

- [ ] **Step 3: 実装を書く**

`src/features/preset/presetManagerStateResult.ts` の `return` 文に1行追加:

```ts
  return {
    presets: baseState.presets,
    selectedPresetId: baseState.selectedPresetId,
    selectedDays: baseState.selectedDays,
    setSelectedPresetId: baseState.setSelectedPresetId,
    handleDeletePreset: actionHandlers.handleDeletePreset,
    handleApplyPreset: actionHandlers.handleApplyPreset,
    handleDuplicatePreset: actionHandlers.handleDuplicatePreset,
    toggleDaySelection: actionHandlers.toggleDaySelection,
    ...creationState,
    ...editState,
  };
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/presetManagerStateResult.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし（このタスクまででhooks層の配線が完結する）

- [ ] **Step 6: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/presetManagerStateResult.ts src/features/preset/__tests__/presetManagerStateResult.test.ts
git commit -m "feat(preset): presetManagerStateResultにhandleDuplicatePresetを追加"
```

---

### Task 7: i18n — `locales/ja.json` + `helpers.ts`

**Files:**
- Modify: `src/features/preset/locales/ja.json`
- Modify: `src/features/preset/helpers.ts`
- Test: `src/features/preset/__tests__/presetHelpers.test.ts`

**Interfaces:**
- Produces: `PRESET_DUPLICATE_LABEL: string`, `PRESET_DELETE_LABEL: string`（`helpers.ts`）。既存 `PRESET_EDIT_LABEL` の値が `"✏️"` → `"✏️ 編集"` に変わる

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/presetHelpers.test.ts` のimportに `PRESET_DELETE_LABEL` / `PRESET_DUPLICATE_LABEL` を追加し、`"preset 表示用 helper と文言定数を返す"` の `it` ブロック内、`expect(PRESET_EDIT_LABEL).toBeTruthy();` の直後に追加:

```ts
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  getPresetCardClassName,
  getPresetCreateToggleLabel,
  isApplyButtonDisabled,
  isPresetCreateDisabled,
  isPresetEditSaveDisabled,
  PRESET_APPLY_LABEL,
  PRESET_CREATE_CANCEL_LABEL,
  PRESET_CREATE_OPEN_LABEL,
  PRESET_DELETE_LABEL,
  PRESET_DUPLICATE_LABEL,
  PRESET_EDIT_LABEL,
  PRESET_LIST_SECTION_TEXT,
  PRESET_MANAGER_MESSAGES,
  PRESET_MANAGER_TEXT,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";
```

```ts
    expect(PRESET_EDIT_LABEL).toBe("✏️ 編集");
    expect(PRESET_DELETE_LABEL).toBe("🗑️ 削除");
    expect(PRESET_DUPLICATE_LABEL).toBe("📄 コピー");
```

（既存の `expect(PRESET_EDIT_LABEL).toBeTruthy();` はこの3行に置き換える）

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/presetHelpers.test.ts`
Expected: `PRESET_DELETE_LABEL` / `PRESET_DUPLICATE_LABEL` が `undefined`、`PRESET_EDIT_LABEL` が `"✏️"` のままで FAIL

- [ ] **Step 3: 実装を書く**

`src/features/preset/locales/ja.json` の `card` セクションを変更:

```json
  "card": {
    "routineCountSuffix": "件のルーティン",
    "applyLabel": "選択した曜日に適用",
    "editLabel": "✏️ 編集",
    "deleteLabel": "🗑️ 削除",
    "duplicateLabel": "📄 コピー"
  },
```

`editSection.editLabel` は `PresetEditSection.tsx` 内の保存フォームでは使われておらず、`PresetCard.tsx` の編集ボタンのみが参照していた（`helpers.ts` の `PRESET_EDIT_LABEL` 経由）。この参照先を `card.editLabel` に切り替えるため、`editSection.editLabel` は孤立キーになる。`ja.json` の `editSection` セクションから `editLabel` の行を削除する（`cancelLabel` 以降のキーはそのまま残す）:

```json
  "editSection": {
    "cancelLabel": "キャンセル",
    "saveLabel": "保存",
    "namePlaceholder": "プリセット名",
    "descriptionPlaceholder": "説明（任意）",
    "routineListLabel": "テンプレートに含めるルーティン",
    "emptyRoutinesLabel": "ルーティンがありません",
    "savedMessage": "プリセットを更新しました",
    "alertMissingName": "プリセット名を入力してください"
  }
```

`src/features/preset/helpers.ts` の `PRESET_EDIT_LABEL` の定義を変更し、`PRESET_DELETE_LABEL` / `PRESET_DUPLICATE_LABEL` を追加:

```ts
// Card constants
export const PRESET_ROUTINE_COUNT_SUFFIX = presetTexts.card.routineCountSuffix;
export const PRESET_APPLY_LABEL = presetTexts.card.applyLabel;
export const PRESET_EDIT_LABEL = presetTexts.card.editLabel;
export const PRESET_DELETE_LABEL = presetTexts.card.deleteLabel;
export const PRESET_DUPLICATE_LABEL = presetTexts.card.duplicateLabel;
```

`helpers.ts` の `// Edit section constants` ブロックにあった以下の行を削除する（`PRESET_EDIT_LABEL` の重複定義を防ぐため）:

```ts
export const PRESET_EDIT_LABEL = presetTexts.editSection.editLabel;
```

（`PRESET_EDIT_CANCEL_LABEL` 以降の行はそのまま残す）

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/presetHelpers.test.ts`
Expected: 全件 PASS

- [ ] **Step 5: 影響確認**

`PRESET_EDIT_LABEL` の参照元が `editSection.editLabel` から `card.editLabel` に変わったことで、`PresetEditSection.tsx` に影響がないことを確認する（このコンポーネントは元々 `PRESET_EDIT_LABEL` を import していない）。

Run: `grep -rn "PRESET_EDIT_LABEL" src/features/preset/`
Expected: `helpers.ts`（定義）と `components/PresetCard.tsx`（使用、Task 8で変更）の2箇所のみ

- [ ] **Step 6: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/locales/ja.json src/features/preset/helpers.ts src/features/preset/__tests__/presetHelpers.test.ts
git commit -m "feat(preset): 編集/削除/コピーボタンのラベルをi18n経由に統一"
```

---

### Task 8: UI層 — `PresetCard.tsx` にコピーボタンを追加、編集・削除ボタンをラベル表示に統一

**Files:**
- Modify: `src/features/preset/components/PresetCard.tsx`
- Test: Create `src/features/preset/__tests__/PresetCard.test.tsx`

**Interfaces:**
- Consumes: `PRESET_EDIT_LABEL` / `PRESET_DELETE_LABEL` / `PRESET_DUPLICATE_LABEL`（Task 7）
- Produces: `PresetCardProps` に `onDuplicate: () => void` を追加

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetCard.test.tsx`（新規、`PresetCard.tsx` に専用テストが存在しないため今回新規作成）:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCard } from "../components/PresetCard";
import type { RoutinePreset } from "@/types/routine";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  description: "朝の準備",
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

const defaultProps = {
  preset,
  isSelected: false,
  isEditing: false,
  selectedDays: new Set<number>(),
  editRoutines: [],
  editPresetName: "",
  editPresetDescription: "",
  editSelectedRoutines: new Set<string>(),
  onSelect: jest.fn(),
  onDelete: jest.fn(),
  onDuplicate: jest.fn(),
  onToggleDay: jest.fn(),
  onApply: jest.fn(),
  onStartEdit: jest.fn(),
  onCancelEdit: jest.fn(),
  onSaveEdit: jest.fn(),
  onChangeEditName: jest.fn(),
  onChangeEditDescription: jest.fn(),
  onToggleEditRoutine: jest.fn(),
};

describe("PresetCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("編集・コピー・削除ボタンをラベル付きで表示する", () => {
    render(<PresetCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("コピーボタンクリックで onDuplicate が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /コピー/ }));
    expect(defaultProps.onDuplicate).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("編集ボタンクリックで onStartEdit が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /編集/ }));
    expect(defaultProps.onStartEdit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("削除ボタンクリックで onDelete が呼ばれ、カード選択は発火しない", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /削除/ }));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it("カード本体クリックで onSelect が呼ばれる", () => {
    render(<PresetCard {...defaultProps} />);
    fireEvent.click(screen.getByText("朝ルーティン"));
    expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCard.test.tsx`
Expected: `onDuplicate` propが型エラー、かつ「コピー」ボタンが見つからず FAIL

- [ ] **Step 3: 実装を書く**

`src/features/preset/components/PresetCard.tsx` 全体を書き換え:

```tsx
import {
  type Routine,
  type RoutinePreset,
  ROUTINE_CATEGORIES,
} from "@/types/routine";
import { DAY_LABELS } from "@/features/preset/presetConstants";
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  getPresetCardClassName,
  isApplyButtonDisabled,
  PRESET_APPLY_LABEL,
  PRESET_DELETE_LABEL,
  PRESET_DUPLICATE_LABEL,
  PRESET_EDIT_LABEL,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";
import { PresetEditSection } from "./PresetEditSection";

interface PresetCardProps {
  preset: RoutinePreset;
  isSelected: boolean;
  isEditing: boolean;
  selectedDays: Set<number>;
  editRoutines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleDay: (day: number) => void;
  onApply: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onToggleEditRoutine: (routineId: string) => void;
}

export const PresetCard = ({
  preset,
  isSelected,
  isEditing,
  selectedDays,
  editRoutines,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleDay,
  onApply,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
}: PresetCardProps) => (
  <div
    className={getPresetCardClassName(isSelected || isEditing)}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {preset.name}
        </h4>
        {preset.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {preset.description}
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {preset.routineTemplates.length} {PRESET_ROUTINE_COUNT_SUFFIX}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(event) => {
            event.stopPropagation();
            onStartEdit();
          }}
          className="text-blue-400 hover:text-blue-600 p-2 text-sm whitespace-nowrap"
          aria-label="プリセットを編集"
        >
          {PRESET_EDIT_LABEL}
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDuplicate();
          }}
          className="text-gray-400 hover:text-gray-600 p-2 text-sm whitespace-nowrap"
          aria-label="プリセットをコピー"
        >
          {PRESET_DUPLICATE_LABEL}
        </button>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 p-2 text-sm whitespace-nowrap"
          aria-label="プリセットを削除"
        >
          {PRESET_DELETE_LABEL}
        </button>
      </div>
    </div>

    {/* 編集モード */}
    {isEditing && (
      <PresetEditSection
        routines={editRoutines}
        editPresetName={editPresetName}
        editPresetDescription={editPresetDescription}
        editSelectedRoutines={editSelectedRoutines}
        onChangeEditName={onChangeEditName}
        onChangeEditDescription={onChangeEditDescription}
        onToggleEditRoutine={onToggleEditRoutine}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
      />
    )}

    {/* 適用モード（選択中かつ編集中でない場合） */}
    {isSelected && !isEditing && (
      <div className="mt-4 pt-4 border-t dark:border-gray-600">
        <div className="space-y-1 mb-4">
          {preset.routineTemplates.map((template, index) => {
            const categoryInfo = ROUTINE_CATEGORIES.find(
              (item) => item.value === template.category,
            );
            return (
              <div
                key={index}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                {formatRoutineTemplateSummary({
                  categoryEmoji: categoryInfo?.emoji ?? "",
                  title: template.title,
                  startTime: template.startTime,
                  duration: template.duration,
                })}
              </div>
            );
          })}
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          {DAY_LABELS.map((label, day) => (
            <button
              key={day}
              onClick={(event) => {
                event.stopPropagation();
                onToggleDay(day);
              }}
              className={getDayButtonClassName(
                selectedDays.has(day),
                day === 7,
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={(event) => {
            event.stopPropagation();
            onApply();
          }}
          disabled={isApplyButtonDisabled(selectedDays.size)}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
        >
          {PRESET_APPLY_LABEL}
        </button>
      </div>
    )}
  </div>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCard.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetCard.tsx src/features/preset/__tests__/PresetCard.test.tsx
git commit -m "feat(preset): PresetCardにコピーボタンを追加し編集/削除ボタンをラベル表示に統一"
```

---

### Task 9: UI層配線 — `PresetListSection.tsx` / `PresetManager.tsx`

**Files:**
- Modify: `src/features/preset/components/PresetListSection.tsx`
- Modify: `src/features/preset/PresetManager.tsx`

**Interfaces:**
- Consumes: `PresetCard`（`onDuplicate` prop、Task 8）、`state.handleDuplicatePreset`（Task 6）

- [ ] **Step 1: 実装を書く**（配線のみのため、テストは既存の型チェックとPresetCardのテストで担保する。`PresetListSection` / `PresetManager` に専用テストが存在しない既存の慣習に合わせる）

`src/features/preset/components/PresetListSection.tsx` 全体を書き換え:

```tsx
import { type Routine, type RoutinePreset } from "@/types/routine";
import { PresetCard } from "./PresetCard";
import { PRESET_LIST_SECTION_TEXT } from "../helpers";

interface PresetListSectionProps {
  presets: RoutinePreset[];
  selectedPresetId: string | null;
  selectedDays: Set<number>;
  editingPresetId: string | null;
  editRoutines: Routine[];
  editPresetName: string;
  editPresetDescription: string;
  editSelectedRoutines: Set<string>;
  onSelectPreset: (presetId: string | null) => void;
  onDeletePreset: (presetId: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onToggleDay: (day: number) => void;
  onApplyPreset: () => void;
  onStartEdit: (presetId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onChangeEditName: (name: string) => void;
  onChangeEditDescription: (desc: string) => void;
  onToggleEditRoutine: (routineId: string) => void;
}

export const PresetListSection = ({
  presets,
  selectedPresetId,
  selectedDays,
  editingPresetId,
  editRoutines,
  editPresetName,
  editPresetDescription,
  editSelectedRoutines,
  onSelectPreset,
  onDeletePreset,
  onDuplicatePreset,
  onToggleDay,
  onApplyPreset,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onChangeEditName,
  onChangeEditDescription,
  onToggleEditRoutine,
}: PresetListSectionProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {PRESET_LIST_SECTION_TEXT.title}
    </h3>

    {presets.length === 0 ? (
      <p className="text-gray-500 dark:text-gray-400">
        {PRESET_LIST_SECTION_TEXT.empty}
      </p>
    ) : (
      <div className="space-y-3">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const isEditing = editingPresetId === preset.id;
          return (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={isSelected}
              isEditing={isEditing}
              selectedDays={selectedDays}
              editRoutines={editRoutines}
              editPresetName={editPresetName}
              editPresetDescription={editPresetDescription}
              editSelectedRoutines={editSelectedRoutines}
              onSelect={() => onSelectPreset(isSelected ? null : preset.id)}
              onDelete={() => onDeletePreset(preset.id)}
              onDuplicate={() => onDuplicatePreset(preset.id)}
              onToggleDay={onToggleDay}
              onApply={onApplyPreset}
              onStartEdit={() => onStartEdit(preset.id)}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
              onChangeEditName={onChangeEditName}
              onChangeEditDescription={onChangeEditDescription}
              onToggleEditRoutine={onToggleEditRoutine}
            />
          );
        })}
      </div>
    )}
  </div>
);
```

`src/features/preset/PresetManager.tsx` の `<PresetListSection>` 呼び出しに1行追加（`onDeletePreset` の直後）:

```tsx
        <PresetListSection
          presets={state.presets}
          selectedPresetId={state.selectedPresetId}
          selectedDays={state.selectedDays}
          editingPresetId={state.editingPresetId}
          editRoutines={currentRoutines}
          editPresetName={state.editPresetName}
          editPresetDescription={state.editPresetDescription}
          editSelectedRoutines={state.editSelectedRoutines}
          onSelectPreset={state.setSelectedPresetId}
          onDeletePreset={state.handleDeletePreset}
          onDuplicatePreset={state.handleDuplicatePreset}
          onToggleDay={state.toggleDaySelection}
          onApplyPreset={state.handleApplyPreset}
          onStartEdit={state.handleStartEdit}
          onCancelEdit={state.handleCancelEdit}
          onSaveEdit={state.handleSaveEdit}
          onChangeEditName={state.setEditPresetName}
          onChangeEditDescription={state.setEditPresetDescription}
          onToggleEditRoutine={state.toggleEditRoutineSelection}
        />
```

- [ ] **Step 2: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetListSection.tsx src/features/preset/PresetManager.tsx
git commit -m "feat(preset): PresetListSection/PresetManagerにコピー操作を配線"
```

---

## 全体の最終検証（全タスク完了後）

- [ ] **Step 1: プリセット機能全体のテストを実行する**

Run: `npx jest src/features/preset`
Expected: 全スイート PASS（新規追加分だけテスト件数が増える。既存の統合テストは1件も失っていないこと）

- [ ] **Step 2: プロジェクト全体のテストを実行する**

Run: `npx jest`
Expected: 全スイート PASS

- [ ] **Step 3: 型チェック**

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: lint**

Run: `npm run lint`
Expected: 警告・エラーなし

- [ ] **Step 5: 目視確認（任意、UIの見た目・独立性の最終確認）**

Storybook（`npm run storybook`）で `PresetManager` のストーリーを開き、以下を確認する:
- 各プリセットカードに「✏️ 編集」「📄 コピー」「🗑️ 削除」の3ボタンが表示されること
- 「📄 コピー」クリックで一覧末尾に「（元の名前）のコピー」という名前のプリセットが追加されること
- コピー後、複製元プリセットを編集・削除しても複製されたプリセットに影響しないこと（逆方向も確認）

- [ ] **Step 6: 変更差分のレビュー（コミットはしない）**

Run: `git status && git diff --stat`
Expected: 対象は `src/features/preset/` 配下の新規・変更ファイルのみ。`git add`/`git commit` は各タスクの手順に記載しているが、**実行せず** ユーザーの確認を待つ。
