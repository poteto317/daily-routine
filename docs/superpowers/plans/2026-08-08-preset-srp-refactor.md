# プリセット機能 単一責任原則リファクタ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `main` ブランチから変更されたファイル群のうち、単一責任原則（SRP）違反が明確な2箇所を解消し、各新規ユニットにテストを追加する。

**Architecture:**
- グループA〜C: `PresetCard.tsx` が抱える「カードヘッダー表示・編集/コピー/削除の3アクションボタン・編集モード委譲・適用モードUI（ルーティン概要+曜日選択+適用ボタン）」という複数の関心事を、単一責任のサブコンポーネントへ分割する
- グループD: `usePresetApplyDeleteActions.ts` / `presetApplyDeleteActionsResult.ts` の名前を実態（適用・削除・複製の3ハンドラーを合成する層）に合わせてリネームする

いずれも振る舞い変更なし（見た目・操作結果は現状維持）。既存の統合テストは残したまま、分割後の新規ユニットに独立したテストを追加する。

**Tech Stack:** React 19 / Next.js（App Router）/ TypeScript / Jest + Testing Library / Storybook

## Global Constraints

- 振る舞いは一切変更しない。DOM構造・className・aria属性・イベントハンドラの呼び出し順序（`event.stopPropagation()`含む）を現状のまま保つ。
- 新規ファイルは `src/features/preset/components/` 直下に作成する（`PresetCard.tsx`・`PresetEditSection.tsx`と同じ粒度）。
- 各コンポーネントは対応する `__tests__/*.test.tsx` を持つ（プロジェクトの1ソース:1テストファイルの慣習に従う）。
- テストは `npx jest src/features/preset` で実行する。型チェックは `npx tsc --noEmit`。lintは `npm run lint`。
- 既存の統合テスト（`PresetCard.test.tsx` / `PresetCard.stories.tsx` / `usePresetApplyDeleteActions.test.tsx` / `usePresetManagerActionHandlers.test.tsx` / `usePresetManagerState.test.tsx`）は削除・弱体化させない。分割・リネーム後も同じ振る舞いを検証し続けることを確認する。
- コミットは各タスクの最後に用意されているが、**実行しない**（自動コミット禁止）。ファイル変更のみ行う。

---

## グループA〜C: `PresetCard.tsx` のサブコンポーネント分割

現在 `PresetCard.tsx`（`src/features/preset/components/PresetCard.tsx`）は以下を1コンポーネントに抱えている。

- カードヘッダー（名前・説明・ルーティン件数）
- 編集ボタン（✏️ 編集）
- コピーボタン（📄 コピー）
- 削除ボタン（🗑️ 削除）
- 編集モードのUI委譲（`PresetEditSection`）
- 適用モードのUI（ルーティン概要一覧 + 曜日選択ボタン群 + 適用ボタン）— 現状 `PresetCard.test.tsx` にこの領域を検証するテストが1件も存在しない

3つのボタンをそれぞれ独立コンポーネントへ、適用モードのUIを `PresetEditSection` と対になる `PresetApplySection` へ切り出す。各ボタンコンポーネントは「表示し、渡された `onClick` を呼ぶ（`event.stopPropagation()`込み）」ことだけに責任を持つ。

### Task 1: `PresetCardEditButton` を新規作成

**Files:**
- Create: `src/features/preset/components/PresetCardEditButton.tsx`
- Test: `src/features/preset/__tests__/PresetCardEditButton.test.tsx`

**Interfaces:**
- Produces: `PresetCardEditButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetCardEditButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardEditButton } from "../components/PresetCardEditButton";

describe("PresetCardEditButton", () => {
  it("編集ボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardEditButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットを編集" }),
    ).toHaveTextContent("✏️ 編集");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardEditButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "プリセットを編集" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardEditButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "プリセットを編集" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardEditButton.test.tsx`
Expected: `Cannot find module '../components/PresetCardEditButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/components/PresetCardEditButton.tsx`（既存の編集ボタンJSXと同一のclassName/aria-label/文言を維持）:

```tsx
"use client";

import { PRESET_EDIT_LABEL } from "../helpers";

type Props = {
  onClick: () => void;
};

/** プリセットカードの編集ボタン */
export const PresetCardEditButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-blue-400 hover:text-blue-600 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットを編集"
  >
    {PRESET_EDIT_LABEL}
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardEditButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetCardEditButton.tsx src/features/preset/__tests__/PresetCardEditButton.test.tsx
git commit -m "feat(preset): add PresetCardEditButton"
```

---

### Task 2: `PresetCardDuplicateButton` を新規作成

**Files:**
- Create: `src/features/preset/components/PresetCardDuplicateButton.tsx`
- Test: `src/features/preset/__tests__/PresetCardDuplicateButton.test.tsx`

**Interfaces:**
- Produces: `PresetCardDuplicateButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetCardDuplicateButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardDuplicateButton } from "../components/PresetCardDuplicateButton";

describe("PresetCardDuplicateButton", () => {
  it("コピーボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardDuplicateButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットをコピー" }),
    ).toHaveTextContent("📄 コピー");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardDuplicateButton onClick={onClick} />);
    fireEvent.click(
      screen.getByRole("button", { name: "プリセットをコピー" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardDuplicateButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "プリセットをコピー" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardDuplicateButton.test.tsx`
Expected: `Cannot find module '../components/PresetCardDuplicateButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/components/PresetCardDuplicateButton.tsx`:

```tsx
"use client";

import { PRESET_DUPLICATE_LABEL } from "../helpers";

type Props = {
  onClick: () => void;
};

/** プリセットカードのコピーボタン */
export const PresetCardDuplicateButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-gray-400 hover:text-gray-600 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットをコピー"
  >
    {PRESET_DUPLICATE_LABEL}
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardDuplicateButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetCardDuplicateButton.tsx src/features/preset/__tests__/PresetCardDuplicateButton.test.tsx
git commit -m "feat(preset): add PresetCardDuplicateButton"
```

---

### Task 3: `PresetCardDeleteButton` を新規作成

**Files:**
- Create: `src/features/preset/components/PresetCardDeleteButton.tsx`
- Test: `src/features/preset/__tests__/PresetCardDeleteButton.test.tsx`

**Interfaces:**
- Produces: `PresetCardDeleteButton({ onClick: () => void }): JSX.Element`

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetCardDeleteButton.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetCardDeleteButton } from "../components/PresetCardDeleteButton";

describe("PresetCardDeleteButton", () => {
  it("削除ボタンを絵文字+テキストの可視ラベルで表示する", () => {
    render(<PresetCardDeleteButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: "プリセットを削除" }),
    ).toHaveTextContent("🗑️ 削除");
  });

  it("クリックで onClick が呼ばれる", () => {
    const onClick = jest.fn();
    render(<PresetCardDeleteButton onClick={onClick} />);
    fireEvent.click(screen.getByRole("button", { name: "プリセットを削除" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("クリックイベントの伝播を止める（カード選択の誤発火防止）", () => {
    const onClick = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetCardDeleteButton onClick={onClick} />
      </div>,
    );
    fireEvent.click(screen.getByRole("button", { name: "プリセットを削除" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardDeleteButton.test.tsx`
Expected: `Cannot find module '../components/PresetCardDeleteButton'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/components/PresetCardDeleteButton.tsx`:

```tsx
"use client";

import { PRESET_DELETE_LABEL } from "../helpers";

type Props = {
  onClick: () => void;
};

/** プリセットカードの削除ボタン */
export const PresetCardDeleteButton = ({ onClick }: Props) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className="text-red-500 hover:text-red-700 p-2 text-sm whitespace-nowrap"
    aria-label="プリセットを削除"
  >
    {PRESET_DELETE_LABEL}
  </button>
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/PresetCardDeleteButton.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetCardDeleteButton.tsx src/features/preset/__tests__/PresetCardDeleteButton.test.tsx
git commit -m "feat(preset): add PresetCardDeleteButton"
```

---

### Task 4: `PresetApplySection` を新規作成

**Files:**
- Create: `src/features/preset/components/PresetApplySection.tsx`
- Test: `src/features/preset/__tests__/PresetApplySection.test.tsx`

**Interfaces:**
- Consumes: `formatRoutineTemplateSummary` / `getDayButtonClassName` / `isApplyButtonDisabled` / `PRESET_APPLY_LABEL`（既存、`helpers.ts`）、`DAY_LABELS`（既存、`presetConstants.ts`）、`ROUTINE_CATEGORIES`（既存、`@/types/routine`）
- Produces: `PresetApplySection({ preset: RoutinePreset; selectedDays: Set<number>; onToggleDay: (day: number) => void; onApply: () => void }): JSX.Element`

このセクションは現状 `PresetCard.test.tsx` に検証テストが1件も無い（`PresetEditSection.test.tsx` は既存だが対の `PresetApplySection` 用テストは無かった）。今回新規作成するテストで初めてカバーする。

- [ ] **Step 1: 失敗するテストを書く**

`src/features/preset/__tests__/PresetApplySection.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { PresetApplySection } from "../components/PresetApplySection";
import type { RoutinePreset } from "@/types/routine";

const preset: RoutinePreset = {
  id: "p1",
  name: "朝ルーティン",
  routineTemplates: [
    { title: "朝食", startTime: "07:00", duration: 30, category: "life" },
    { title: "運動", startTime: "07:30", duration: 20, category: "health" },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("PresetApplySection", () => {
  it("ルーティンテンプレートの概要を一覧表示する", () => {
    render(
      <PresetApplySection
        preset={preset}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );
    expect(screen.getByText(/朝食 \(07:00, 30分\)/)).toBeInTheDocument();
    expect(screen.getByText(/運動 \(07:30, 20分\)/)).toBeInTheDocument();
  });

  it("曜日ボタンクリックで onToggleDay が該当曜日で呼ばれ、伝播が止まる", () => {
    const onToggleDay = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetApplySection
          preset={preset}
          selectedDays={new Set()}
          onToggleDay={onToggleDay}
          onApply={jest.fn()}
        />
      </div>,
    );
    fireEvent.click(screen.getByText("月"));
    expect(onToggleDay).toHaveBeenCalledWith(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("曜日が選択されていないとき適用ボタンは disabled", () => {
    render(
      <PresetApplySection
        preset={preset}
        selectedDays={new Set()}
        onToggleDay={jest.fn()}
        onApply={jest.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /選択した曜日に適用/ }),
    ).toBeDisabled();
  });

  it("曜日が選択されているとき適用ボタンクリックで onApply が呼ばれ、伝播が止まる", () => {
    const onApply = jest.fn();
    const onParentClick = jest.fn();
    render(
      <div onClick={onParentClick}>
        <PresetApplySection
          preset={preset}
          selectedDays={new Set([1])}
          onToggleDay={jest.fn()}
          onApply={onApply}
        />
      </div>,
    );
    const applyButton = screen.getByRole("button", {
      name: /選択した曜日に適用/,
    });
    expect(applyButton).not.toBeDisabled();
    fireEvent.click(applyButton);
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
```

`DAY_LABELS`（`src/features/preset/presetConstants.ts`）は `["日", "月", "火", "水", "木", "金", "土", "祝"]` で、index 1 が「月」（確認済み）。上記テストの `toHaveBeenCalledWith(1)` / `new Set([1])` はこの並びに基づく。

- [ ] **Step 2: テストを実行し失敗を確認する**

Run: `npx jest src/features/preset/__tests__/PresetApplySection.test.tsx`
Expected: `Cannot find module '../components/PresetApplySection'` で全件 FAIL

- [ ] **Step 3: 最小実装を書く**

`src/features/preset/components/PresetApplySection.tsx`（既存の `PresetCard.tsx` 131-183行の適用モードJSXと完全一致するclassName/構造で移設）:

```tsx
"use client";

import { type RoutinePreset, ROUTINE_CATEGORIES } from "@/types/routine";
import { DAY_LABELS } from "@/features/preset/presetConstants";
import {
  formatRoutineTemplateSummary,
  getDayButtonClassName,
  isApplyButtonDisabled,
  PRESET_APPLY_LABEL,
} from "../helpers";

type Props = {
  preset: RoutinePreset;
  selectedDays: Set<number>;
  onToggleDay: (day: number) => void;
  onApply: () => void;
};

/** プリセットカードの適用モードUI（ルーティン概要 + 曜日選択 + 適用ボタン） */
export const PresetApplySection = ({
  preset,
  selectedDays,
  onToggleDay,
  onApply,
}: Props) => (
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
          className={getDayButtonClassName(selectedDays.has(day), day === 7)}
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
);
```

- [ ] **Step 4: テストを実行し成功を確認する**

Run: `npx jest src/features/preset/__tests__/PresetApplySection.test.tsx`
Expected: 全件 PASS

- [ ] **Step 5: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetApplySection.tsx src/features/preset/__tests__/PresetApplySection.test.tsx
git commit -m "feat(preset): add PresetApplySection"
```

---

### Task 5: `PresetCard.tsx` をサブコンポーネント合成に書き換える

**Files:**
- Modify: `src/features/preset/components/PresetCard.tsx`
- Test: `src/features/preset/__tests__/PresetCard.test.tsx`（既存、変更なしで通ることを確認するのみ）
- Test: `src/features/preset/components/PresetCard.stories.tsx`（既存、変更なしで通ることを確認するのみ）

**Interfaces:**
- Consumes: Task 1〜4で作成した4コンポーネント
- Produces: `PresetCardProps` は変更しない（既存の呼び出し元 `PresetListSection.tsx` への影響なし）

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/preset/__tests__/PresetCard.test.tsx`
Expected: 全件 PASS（8件）

- [ ] **Step 2: `PresetCard.tsx` を4コンポーネントの合成に書き換える**

`src/features/preset/components/PresetCard.tsx` 全体:

```tsx
import {
  type Routine,
  type RoutinePreset,
} from "@/types/routine";
import {
  getPresetCardClassName,
  PRESET_ROUTINE_COUNT_SUFFIX,
} from "../helpers";
import { PresetEditSection } from "./PresetEditSection";
import { PresetApplySection } from "./PresetApplySection";
import { PresetCardEditButton } from "./PresetCardEditButton";
import { PresetCardDuplicateButton } from "./PresetCardDuplicateButton";
import { PresetCardDeleteButton } from "./PresetCardDeleteButton";

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
        <PresetCardEditButton onClick={onStartEdit} />
        <PresetCardDuplicateButton onClick={onDuplicate} />
        <PresetCardDeleteButton onClick={onDelete} />
      </div>
    </div>

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

    {isSelected && !isEditing && (
      <PresetApplySection
        preset={preset}
        selectedDays={selectedDays}
        onToggleDay={onToggleDay}
        onApply={onApply}
      />
    )}
  </div>
);
```

- [ ] **Step 3: 既存テストを再実行し、書き換え後も全件通ることを確認する**

Run: `npx jest src/features/preset/__tests__/PresetCard.test.tsx`
Expected: 全件 PASS（Step 1と同じ8件。DOM構造・className・aria属性は完全に同一のまま維持しているため差分は出ないはず）

- [ ] **Step 4: Storybookのplay関数テストも実行する**

Run: `npx jest --testPathPattern="storybook" 2>/dev/null || true`（プロジェクトにStorybook testrunner向けのjest設定がなければこのステップは型チェックのみで代替する）

型チェックで `PresetCard.stories.tsx` がそのまま通ることを確認：

Run: `npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 5: lint**

Run: `npm run lint`
Expected: 警告・エラーなし

- [ ] **Step 6: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/components/PresetCard.tsx
git commit -m "refactor(preset): PresetCard をサブコンポーネント合成に分割"
```

---

## グループD: `usePresetApplyDeleteActions` の命名整理

`usePresetApplyDeleteActions.ts` というファイル名は「適用（Apply）・削除（Delete）」の2アクションを示唆するが、今回のコピー機能追加で複製（Duplicate）ハンドラーも同居するようになり、名前と実態が乖離している。実態（プリセット1件に対する適用・削除・複製の3ハンドラーを合成する層）に合わせてリネームする。

### Task 6: `usePresetApplyDeleteActions` / `presetApplyDeleteActionsResult` を `usePresetItemActions` / `presetItemActionsResult` にリネーム

**Files:**
- Rename+Modify: `src/features/preset/usePresetApplyDeleteActions.ts` → `src/features/preset/usePresetItemActions.ts`
- Rename+Modify: `src/features/preset/presetApplyDeleteActionsResult.ts` → `src/features/preset/presetItemActionsResult.ts`
- Rename+Modify: `src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx` → `src/features/preset/__tests__/usePresetItemActions.test.tsx`
- Rename+Modify: `src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts` → `src/features/preset/__tests__/presetItemActionsResult.test.ts`
- Modify: `src/features/preset/usePresetManagerActionHandlers.ts`（importパス変更のみ）
- Modify: `src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx`（importパス変更のみ）

**Interfaces:**
- Produces: `usePresetItemActions(...)` — シグネチャ・戻り値の形は変更しない（`handleApplyPreset` / `handleDeletePreset` / `handleDuplicatePreset`）
- Produces: `createPresetItemActionsResult(...)` — シグネチャ・戻り値の形は変更しない

これは名前のみの変更で、`presetApplyDeleteActions.ts`（実際の適用/削除ハンドラー本体、`createPresetApplyHandler`/`createPresetDeleteHandler`）と `presetDuplicateActions.ts`（複製ハンドラー本体）はリネーム対象外（これらのファイル名は個別のアクション実装であり、実態と乖離していない）。

- [ ] **Step 1: 既存テストが現状のまま通ることを確認する（リファクタ前の基準線）**

Run: `npx jest src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx`
Expected: 全件 PASS

- [ ] **Step 2: ファイルをリネームし、中身の識別子も更新する**

```bash
git mv src/features/preset/usePresetApplyDeleteActions.ts src/features/preset/usePresetItemActions.ts
git mv src/features/preset/presetApplyDeleteActionsResult.ts src/features/preset/presetItemActionsResult.ts
git mv src/features/preset/__tests__/usePresetApplyDeleteActions.test.tsx src/features/preset/__tests__/usePresetItemActions.test.tsx
git mv src/features/preset/__tests__/presetApplyDeleteActionsResult.test.ts src/features/preset/__tests__/presetItemActionsResult.test.ts
```

`src/features/preset/presetItemActionsResult.ts` の中身（型名・関数名のみ変更、ロジックは無変更）:

```ts
type PresetItemActionsResultArgs = {
  handleApplyPreset: () => void;
  handleDeletePreset: (presetId: string) => void;
  handleDuplicatePreset: (presetId: string) => void;
};

export const createPresetItemActionsResult = ({
  handleApplyPreset,
  handleDeletePreset,
  handleDuplicatePreset,
}: PresetItemActionsResultArgs) => {
  return {
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  };
};
```

`src/features/preset/usePresetItemActions.ts` の中身（関数名・import元パスのみ変更、ロジックは無変更）:

```ts
import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetItemActionsResult } from "./presetItemActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "./presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "./presetDuplicateActions";

type UsePresetItemActionsParams = {
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

export const usePresetItemActions = ({
  presets,
  selectedPresetId,
  selectedDays,
  onApplyPreset,
  setPresets,
  setSelectedPresetId,
  setSelectedDays,
}: UsePresetItemActionsParams) => {
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

  return createPresetItemActionsResult({
    handleApplyPreset,
    handleDeletePreset,
    handleDuplicatePreset,
  });
};
```

`src/features/preset/__tests__/presetItemActionsResult.test.ts` の中身（識別子のみ変更）:

```ts
import { createPresetItemActionsResult } from "../presetItemActionsResult";

describe("createPresetItemActionsResult", () => {
  it("apply/delete/duplicate action を公開 shape に載せる", () => {
    const handleApplyPreset = jest.fn();
    const handleDeletePreset = jest.fn();
    const handleDuplicatePreset = jest.fn();

    expect(
      createPresetItemActionsResult({
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

`src/features/preset/__tests__/usePresetItemActions.test.tsx` の中身（識別子のみ変更、テストロジックは無変更）:

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../presetItemActionsResult", () => ({
  createPresetItemActionsResult: jest.fn(),
}));

jest.mock("../presetApplyDeleteActions", () => ({
  createPresetApplyHandler: jest.fn(),
  createPresetDeleteHandler: jest.fn(),
}));

jest.mock("../presetDuplicateActions", () => ({
  createPresetDuplicateHandler: jest.fn(),
}));

import { createPresetItemActionsResult } from "../presetItemActionsResult";
import {
  createPresetApplyHandler,
  createPresetDeleteHandler,
} from "../presetApplyDeleteActions";
import { createPresetDuplicateHandler } from "../presetDuplicateActions";
import { usePresetItemActions } from "../usePresetItemActions";

describe("usePresetItemActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createPresetItemActionsResult as jest.Mock).mockImplementation(
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
    (createPresetItemActionsResult as jest.Mock).mockReturnValue(
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

    const { result } = renderHook(() => usePresetItemActions(params));

    expect(result.current).toBe(resultShape);
    expect(createPresetItemActionsResult).toHaveBeenCalledWith({
      handleDeletePreset: expect.any(Function),
      handleApplyPreset: expect.any(Function),
      handleDuplicatePreset: expect.any(Function),
    });

    const builtHandlers = (createPresetItemActionsResult as jest.Mock)
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

- [ ] **Step 3: `usePresetManagerActionHandlers.ts` のimportパスを更新する**

`src/features/preset/usePresetManagerActionHandlers.ts`:

```ts
import type { Dispatch, SetStateAction } from "react";
import type { Routine, RoutinePreset } from "@/types/routine";
import { createPresetManagerActionHandlersResult } from "./presetManagerActionHandlersResult";
import { usePresetItemActions } from "./usePresetItemActions";
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
    usePresetItemActions({
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

- [ ] **Step 4: `usePresetManagerActionHandlers.test.tsx` のモックパスを更新する**

`src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx` の `jest.mock` 対象パスを変更する:

```tsx
jest.mock("../usePresetItemActions", () => ({
  usePresetItemActions: jest.fn(),
}));
```

（変更箇所はこの1つの `jest.mock` パスと、対応する `import { usePresetItemActions } from "../usePresetItemActions";` の1行のみ。テスト本文中の `usePresetApplyDeleteActions` という識別子参照はすべて `usePresetItemActions` に置き換える。それ以外のテストロジック・モック値・アサーションは無変更。）

- [ ] **Step 5: テストを実行し全件成功を確認する**

Run: `npx jest src/features/preset/__tests__/usePresetItemActions.test.tsx src/features/preset/__tests__/presetItemActionsResult.test.ts src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx`
Expected: 全件 PASS

- [ ] **Step 6: プロジェクト全体で古い名前の参照が残っていないか確認する**

Run: `grep -rn "usePresetApplyDeleteActions\|presetApplyDeleteActionsResult\|createPresetApplyDeleteActionsResult" src/features/preset/`
Expected: 一致なし（`presetApplyDeleteActions.ts` 自体・`createPresetApplyHandler`・`createPresetDeleteHandler` は別ファイルであり対象外なので、これらの文字列がヒットするのは問題ない。`usePresetApplyDeleteActions`・`presetApplyDeleteActionsResult`・`createPresetApplyDeleteActionsResult` という文字列のみ検索すること）

- [ ] **Step 7: 型チェックとlint**

Run: `npx tsc --noEmit && npm run lint`
Expected: エラー・警告なし

- [ ] **Step 8: コミット（実行しない。差分のみ残す）**

```bash
git add src/features/preset/usePresetItemActions.ts src/features/preset/presetItemActionsResult.ts src/features/preset/__tests__/usePresetItemActions.test.tsx src/features/preset/__tests__/presetItemActionsResult.test.ts src/features/preset/usePresetManagerActionHandlers.ts src/features/preset/__tests__/usePresetManagerActionHandlers.test.tsx
git commit -m "refactor(preset): usePresetApplyDeleteActions/presetApplyDeleteActionsResult を usePresetItemActions/presetItemActionsResult にリネーム"
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

- [ ] **Step 5: 目視確認（任意、UIの見た目が変わっていないことの最終確認）**

Storybook（`npm run storybook`）で `Features/Preset/PresetCard` の各ストーリーを開き、編集・コピー・削除ボタンの見た目とクリック動作、および `Selected` / `SelectedWithDaysChosen` ストーリーで適用モードのUI（ルーティン概要・曜日選択・適用ボタン）が従来通り表示・動作することを確認する。

- [ ] **Step 6: 変更差分のレビュー（コミットはしない）**

Run: `git status && git diff --stat`
Expected: グループA〜Dで新規作成・変更したファイルのみが差分に含まれる。`git add`/`git commit` は各タスクの手順に記載しているが、**実行せず** ユーザーの確認を待つ。
