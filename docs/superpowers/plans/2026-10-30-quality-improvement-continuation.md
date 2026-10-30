# 品質改善の続き 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 振る舞いを変えずに、重複の統合・長いコンポーネントの分割・テストの追加・テストの後片付け・整形・文書の更新を行う。

**Architecture:** 分割の前に現在の DOM と操作を固定するテストを書き、そのテストが通ったまま機械的に切り出す。共有するフックは `src/hooks/`、共有する UI は `src/components/`、機能の中だけで使うものは機能のディレクトリに置く。

**Tech Stack:** Next.js / React / TypeScript / Tailwind / Jest + Testing Library / dnd-kit / Storybook

**設計書:** `docs/superpowers/specs/2026-10-30-quality-improvement-continuation-design.md`

## Global Constraints

- 描画される DOM（要素・属性・クラス・文言）、イベントの結果、保存内容を変えない。
- `jest.config.ts` は変更しない。デプロイと firebase コマンドは実行しない。
- 本体のバグを見つけても直さず、報告に書く（PR の要確認事項になる）。
- **コミットしない。** `git add`・`git commit`・`git checkout`・`git restore`・`git stash` など、index や作業ツリーを変える git 操作をしない。
- フォーマッタは自分が変更・新規作成したファイルだけに実行する。
- 中間ファイル・報告はリポジトリの外（`mktemp -d`）に置く。変異の確認は対象を `mktemp -d` へ `cp` で退避して行い、同じ退避から `cp` で戻し、`diff` で戻ったことを確かめる。
- 担当のテストだけを実行する。全件は Task 13 で統括側が実行する。
- 新しい UI コンポーネントの props はすべて必須にする（L-060）。
- テストの時刻付き文字列には Z かオフセットを付け、現在時刻は `jest.useFakeTimers()` と `jest.setSystemTime()` で固定して `afterEach` で `jest.useRealTimers()` する（L-181、L-184）。
- 追加したテストは行を通すだけにせず結果の値を確かめ、対象の実装を壊す変異で落ちることを少なくとも 1 か所確かめる（L-179）。
- コメントと説明は日本語。既存のファイルの書き方に合わせる。

**テストの実行コマンド（worktree 用。作業ディレクトリは `.worktrees/api-improve`）:**

```bash
npx cross-env TZ=Asia/Tokyo jest --forceExit --testPathIgnorePatterns=/node_modules/ --runTestsByPath <ファイル...>
```

---

### Task 1: 整形

**Files:** 次の 14 ファイルを変更する。

`src/features/auth/login/__tests__/authErrorMessage.test.ts`、`src/features/budget/utils/metrics.ts`、`src/features/journal/__tests__/storageQueries.test.ts`、`src/features/meal/components/__tests__/MealTodaySection.test.tsx`、`src/features/pomodoro/__tests__/PomodoroPage.test.tsx`、`src/features/pomodoro/__tests__/PomodoroTimerPanel.test.tsx`、`src/features/preset/__tests__/PresetManager.test.tsx`、`src/features/settings/components/__tests__/CloudSyncSection.test.tsx`、`src/features/weather/page/__tests__/ErrorState.test.tsx`、`src/features/weight-tracker/__tests__/WeightTrackerPage.test.tsx`、`src/features/weight-tracker/__tests__/storageQueries.test.ts`、`src/features/weight-tracker/page/components/__tests__/WeightTrackerTodayCard.test.tsx`、`src/features/work-tracker/__tests__/storageTemplates.test.ts`、`src/layouts/header-menu/__tests__/HeaderMenuFooter.test.tsx`

- [ ] **Step 1:** 14 ファイルを指定して `npx prettier --write <ファイル...>` を実行する。
- [ ] **Step 2:** `npx prettier --check <ファイル...>` が通ることを確かめる。

### Task 2: テストの後片付け

**Files（すべて変更）:**

- `src/features/routine/__tests__/routineHelpers.sync.test.ts`
- `src/features/api-key/__tests__/useApiKeyState.flows.test.ts`、`useApiKeyState.test.ts`、`useCopyApiKey.test.ts`、`apiKeyGenerator.test.ts`、`useApiKeyCommands.test.ts`
- `src/hooks/__tests__/useThemeInitializationEffect.test.tsx`、`useThemeAutoListenerEffect.test.tsx`
- `src/features/routine/__tests__/helpers.sync-notification.test.ts`、`useRoutines.initial-and-mutations.test.ts`
- `src/features/weather/__tests__/weather-page/WeatherPage.initial-load.test.tsx`、`WeatherPage.current-location.test.tsx`
- `src/features/todo-lists/__tests__/todoListDeletePersistActions.test.ts`
- `src/features/settings/__tests__/useCloudSyncStatusState.test.tsx`
- `src/features/weight-tracker/__tests__/storage.test.ts`
- `src/features/work-tracker/__tests__/storage.templates-and-history.test.ts`

**規則:**

- `global.fetch` などの代入は、`describe` の先頭で元の値を控えて `afterEach` で戻す。`routineHelpers.sync.test.ts` の最初の `describe` は同じファイルの 2 つ目の `describe` と同じ形にする:

```ts
describe("routine helpers sync", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    setupRoutineHelpersDefaults();
    mockHasNotificationPermission.mockReturnValue(true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
```

- `Object.defineProperty(obj, key, ...)` は、差し替える前に `Object.getOwnPropertyDescriptor(obj, key)` を控え、`afterEach` で戻す。元が無ければ `delete` で消す:

```ts
const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

afterEach(() => {
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    delete (navigator as { clipboard?: unknown }).clipboard;
  }
});
```

- `document.visibilityState` のようにプロトタイプのゲッターを持つものも同じ（自身のプロパティが無ければ `delete` でプロトタイプの値へ戻る）。差し替えの `configurable: true` を保つ。
- Weather の 2 ファイルは `WeatherPage.test-setup.ts` の既存の `restoreGeolocation()` を `afterEach` で呼ぶ。
- `window.matchMedia` は元の値を控えて `afterEach` で代入して戻す。
- `jest.spyOn(window, "confirm")`・`jest.spyOn(window, "addEventListener")`・`jest.spyOn(Date.prototype, "toISOString")` は、`afterEach` で該当のスパイを `mockRestore()` する（`jest.restoreAllMocks()` は、同じファイルで別の目的のスパイがあるとその既定の戻り値まで消すので、スパイを変数に控えて戻すのを優先する。スパイが `beforeEach` で張られるファイルはそこで変数へ入れる）。
- `apiKeyGenerator.test.ts` の `crypto`・`TextEncoder` は `beforeAll` か `describe` の外で張られているなら `afterAll` で戻す。

- [ ] **Step 1:** 各ファイルを読み、差し替えの場所と戻す場所を決める。
- [ ] **Step 2:** 規則どおりに直す。テストの期待値は変えない。
- [ ] **Step 3:** 上の 16 ファイルをテストの実行コマンドで実行し、すべて通ることを確かめる。
- [ ] **Step 4:** 後続のテストが漏れに頼っていて落ちた場合は、その場で必要な前提を `beforeEach` に足す。理由を報告に書く。

### Task 3: フックの統合（A1〜A3）

**Files:**

- Create: `src/hooks/useFormOpenAutoFocus.ts`、`src/hooks/__tests__/useFormOpenAutoFocus.test.tsx`
- Create: `src/hooks/useCategoryNameEditing.ts`、`src/hooks/__tests__/useCategoryNameEditing.test.tsx`
- Create: `src/features/budget/useBudgetItemEditState.ts`、`src/features/budget/__tests__/useBudgetItemEditState.test.tsx`
- Delete（`rm`）: `src/features/todo-lists/useTodoCategoryManagementFormFocus.ts`、`src/features/budget/useBudgetCategoryManagementFormFocus.ts`、`src/features/budget/useBudgetExpenseItemManagementFormFocus.ts`、`src/features/budget/useBudgetIncomeItemManagementFormFocus.ts`、`src/features/budget/useBudgetCategoryManagementNameEditing.ts`、`src/features/todo-lists/useTodoCategoryManagementNameEditing.ts`、`src/features/budget/useBudgetExpenseItemEditState.ts`、`src/features/budget/useBudgetIncomeItemEditState.ts` と、それぞれの `__tests__` のテスト
- Modify: `src/features/budget/useBudgetCategoryManagementPageState.ts`、`useBudgetExpenseItemManagementPageState.ts`、`useBudgetIncomeItemManagementPageState.ts`、`src/features/todo-lists/useTodoCategoryManagementPageState.ts`、およびこれらのテストの `jest.mock` のパス

**Interfaces:**

- Produces: `useFormOpenAutoFocus({ inputRef, showForm }): void`
- Produces: `useCategoryNameEditing({ handleRename }): { editingCategoryId, editingCategoryNameValue, setEditingCategoryNameValue, startEditCategoryName, commitEditCategoryName, cancelEditCategoryName }`
- Produces: `useBudgetItemEditState(): { editingItemId, editingItemName, editingItemAmount, setEditingItemName, setEditingItemAmount, startEditItem, cancelEditItem }`

```ts
// src/hooks/useFormOpenAutoFocus.ts
import { useEffect } from "react";
import type { RefObject } from "react";

type UseFormOpenAutoFocusParams = {
  inputRef: RefObject<HTMLInputElement | null>;
  showForm: boolean;
};

/** 作成フォームを開いたときに入力欄へ自動フォーカスする。 */
export const useFormOpenAutoFocus = ({
  inputRef,
  showForm,
}: UseFormOpenAutoFocusParams) => {
  useEffect(() => {
    if (!showForm) return;
    const timerId = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timerId);
  }, [inputRef, showForm]);
};
```

```ts
// src/features/budget/useBudgetItemEditState.ts
import { useCallback, useState } from "react";

type EditableBudgetItem = { id: string; name: string; amount: number };

/** 収入・支出項目1件のインライン編集状態（対象IDと名前・金額の入力値）を管理する。 */
export const useBudgetItemEditState = () => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemAmount, setEditingItemAmount] = useState("");

  const startEditItem = useCallback((item: EditableBudgetItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemAmount(String(item.amount));
  }, []);

  const cancelEditItem = useCallback(() => {
    setEditingItemId(null);
  }, []);

  return {
    editingItemId,
    editingItemName,
    editingItemAmount,
    setEditingItemName,
    setEditingItemAmount,
    startEditItem,
    cancelEditItem,
  };
};
```

`useCategoryNameEditing.ts` は `src/features/budget/useBudgetCategoryManagementNameEditing.ts` の本体をそのまま移し、関数名と型名だけ `useCategoryNameEditing` / `UseCategoryNameEditingParams` に変える。

- [ ] **Step 1:** 削除するテストの観点を読み、統合先のテストへ移す。`useFormOpenAutoFocus` は 50ms 後にフォーカスすること、閉じているとフォーカスしないこと、解除で `clearTimeout` すること、開き直しで再度フォーカスすることを確かめる。`clearTimeout` のスパイは `afterEach` で `mockRestore()` し、fake timers は `useRealTimers` で戻す。
- [ ] **Step 2:** 統合先のテストを実行し、ファイルが無くて失敗することを確かめる。
- [ ] **Step 3:** 統合先を作り、呼び出し元を置き換え、旧ファイルと旧テストを `rm` で消す。
- [ ] **Step 4:** `git grep -n 'ManagementFormFocus\|ManagementNameEditing\|ItemEditState' -- src` で、残りが `useTodoListManagementFormFocus` と `useBudgetItemEditState` だけであることを確かめる。
- [ ] **Step 5:** 統合先のテストと `src/features/budget/__tests__`・`src/features/todo-lists/__tests__` の `*PageState.test.tsx` を実行する。`npx tsc --noEmit -p tsconfig.json` を実行する。

### Task 4: Todo の DnD センサーの共通化（A4）

**Files:**

- Create: `src/features/todo-lists/useTodoDndSensors.ts`
- Modify: `src/features/todo-lists/useTodoCategoryDragAndDrop.ts`、`src/features/todo-lists/useTodoListDragAndDrop.ts`

**Interfaces:** Produces: `useTodoDndSensors(): SensorDescriptor<SensorOptions>[]`

```ts
// src/features/todo-lists/useTodoDndSensors.ts
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// dnd-kitのuseSensorは渡されたoptionsオブジェクトの参照が変わるたびに
// 内部メモを再計算する。インラインリテラルのままだと毎レンダー新しい
// 参照になりメモ化が効かないため、モジュールスコープの定数として固定する。
const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } };
const TOUCH_SENSOR_OPTIONS = {
  activationConstraint: { delay: 300, tolerance: 5 },
};
const KEYBOARD_SENSOR_OPTIONS = {
  coordinateGetter: sortableKeyboardCoordinates,
};

/** Todoのアイテム・カテゴリの並び替えで共通のdnd-kitセンサーを返す。 */
export const useTodoDndSensors = () =>
  useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(TouchSensor, TOUCH_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  );
```

`useTodoListDragAndDrop` は `const registeredSensors = useTodoDndSensors();` と `sensors: disabled ? EMPTY_SENSORS : registeredSensors` を保つ。`useTodoCategoryDragAndDrop` は `const sensors = useTodoDndSensors();`。

- [ ] **Step 1:** `useTodoDndSensors.ts` を作り、2 つのフックから定数と `useSensors` の呼び出しを消す。使わなくなった import を消す。
- [ ] **Step 2:** 既存の `useTodoCategoryDragAndDrop.test.ts`、`useTodoListDragAndDrop.test.ts`、`useTodoListInteractionMode.test.tsx` を実行する。これらが `@dnd-kit/core` をモックしていて、センサーの設定（distance 8・delay 300・tolerance 5）を確かめていなければ、`src/features/todo-lists/__tests__/useTodoDndSensors.test.ts` を足して確かめる。

### Task 5: 前後ボタンの共通化（A5）

**Files:**

- Create: `src/components/PeriodNavButton.tsx`、`src/components/PeriodNavButton.stories.tsx`、`src/components/__tests__/PeriodNavButton.test.tsx`
- Modify: `src/features/calendar/components/CalendarMonthNavigation.tsx`、`src/features/statistics/page/components/StatisticsPeriodControls.tsx`、`src/components/index.ts`（既存の書き方に合わせて公開）
- Test（新規。先に足す）: `src/features/calendar/__tests__/CalendarMonthNavigation.test.tsx`、`src/features/statistics/__tests__/StatisticsPeriodControls.test.tsx`

```tsx
// src/components/PeriodNavButton.tsx
type PeriodNavButtonProps = {
  direction: "previous" | "next";
  onClick: () => void;
  ariaLabel: string | undefined;
  type: "button" | undefined;
};

const CHEVRON_PATHS = {
  previous: "M15 19l-7-7 7-7",
  next: "M9 5l7 7-7 7",
} as const;

/** 月・期間を前後に切り替える矢印ボタン。 */
export const PeriodNavButton = ({
  direction,
  onClick,
  ariaLabel,
  type,
}: PeriodNavButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    aria-label={ariaLabel}
    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
  >
    <svg
      className="w-5 h-5 text-gray-700 dark:text-gray-800"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d={CHEVRON_PATHS[direction]} />
    </svg>
  </button>
);
```

Calendar は `ariaLabel={undefined}`、`type={undefined}` を渡す。Statistics は `ariaLabel={STATISTICS_PERIOD_PREVIOUS_LABEL}` / `NEXT`、`type="button"` を渡す。

- [ ] **Step 1:** 固定テストを足す: Statistics の前後ボタンに `type="button"` と `aria-label` があること、Calendar のボタンに両方が無いこと、前後それぞれが対応するハンドラだけを呼ぶこと、前と次の path の `d` が正しいこと。変更前のコードで通ることを確かめる。
- [ ] **Step 2:** `PeriodNavButton` を作り、2 つのコンポーネントを置き換える。
- [ ] **Step 3:** Story（`title: "Components/PeriodNavButton"`、`Default`。`args` は `direction: "previous"`、`onClick: fn()`、`ariaLabel: "前へ"`、`type: "button"`）とコンポーネント自身のテストを足す。
- [ ] **Step 4:** 上の 3 件のテスト、`AchievementCalendar.navigation.test.tsx`、`StatisticsPage.test.tsx` を実行する。

### Task 6: テストマトリクスの行の分割（B1）

**Files:**

- Create: `src/features/test-matrix/MatrixItemRow.tsx`、`MatrixDeviceStatusCell.tsx` と、それぞれの `.stories.tsx`
- Modify: `src/features/test-matrix/MatrixCategoryCard.tsx`
- Test: `src/features/test-matrix/__tests__/MatrixCategoryCard.test.tsx`（新規）

**Interfaces:**

```ts
// MatrixDeviceStatusCell の props
type MatrixDeviceStatusCellProps = {
  status: CheckStatus;
  statusTitleLabel: "PC" | "SP";
  hasDetail: boolean;
  okCount: number;
  totalCount: number;
  onToggle: () => void;
};

// MatrixItemRow の props
type MatrixItemRowProps = {
  categoryId: string;
  item: TestItem; // `category.items` の要素の型。`types.ts` の実際の名前を使う
  detailData: DetailData;
  onToggleStatus: (
    categoryId: string,
    itemId: string,
    field: TestField,
  ) => void;
  onUpdateNote: (categoryId: string, itemId: string, note: string) => void;
  onOpenDetail: (itemId: string) => void;
};
```

`MatrixItemRow` は現在の `filteredItems.map` の本体（`resolveItemStatus`、`detailPcOk`・`detailSpOk` の計算を含む）を移す。`<td>` 以下の DOM・クラス・`title` をそのまま保つ。`MatrixDeviceStatusCell` は `<td className="px-2 py-2 text-center">` から始まる。`key={item.id}` は `MatrixCategoryCard` の `map` に置く。

- [ ] **Step 1:** 固定テストを書く: 絞り込みで 0 件なら何も描画しないこと、折りたたみで表が消えること、詳細なしの項目は PC/SP のボタンが `onToggleStatus(categoryId, itemId, "pc" / "sp")` を呼ぶこと（PC と SP の取り違えを検出する）、詳細ありの項目はボタンでなく `title` が `getStatusTitle(..., true)` の値で件数 `ok/total` が PC・SP それぞれ正しいこと、項目名のボタンは詳細ありだけ `onOpenDetail` を呼ぶこと、備考の入力が `onUpdateNote` を呼ぶこと。変更前のコードで通ることを確かめる。
- [ ] **Step 2:** 2 つのコンポーネントを切り出す。
- [ ] **Step 3:** Story（`Features/TestMatrix/...`、`Default`）を足す。`MatrixItemRow` は `decorators` で `<table><tbody>`、`MatrixDeviceStatusCell` は `<table><tbody><tr>` に入れる。
- [ ] **Step 4:** `src/features/test-matrix/__tests__/MatrixCategoryCard.test.tsx`、`TestMatrixPage.test.tsx` を実行する。

### Task 7: 詳細パネルの分割（B2）

**Files:**

- Create: `src/features/test-matrix/DetailCaseRow.tsx`、`DetailPanelHeader.tsx` と、それぞれの `.stories.tsx`
- Modify: `src/features/test-matrix/DetailPanel.tsx`
- Test: `src/features/test-matrix/__tests__/DetailPanel.test.tsx`（新規）

**Interfaces:**

```ts
type DetailCaseRowProps = {
  caseItem: DetailTestCase;
  index: number;
  onToggleStatus: (caseId: string, field: TestField) => void;
  onUpdateNote: (caseId: string, note: string) => void;
};

type DetailPanelHeaderProps = {
  itemId: string;
  itemLabel: string;
  titleId: string;
  cases: DetailTestCase[];
  onClose: () => void;
};
```

`DetailPanelHeader` は `<div className="sticky top-0 ...">` 全体（閉じるボタン・見出し・件数）を移し、件数の計算（`allCases`・`okCases`・`ngCases`・`uncheckedCases`）も移す。`DETAIL_PANEL_TITLE_ID` は `DetailPanel` に残して `titleId` で渡す。`<style>` と `useCloseOnEscape` は `DetailPanel` に残す。

- [ ] **Step 1:** 固定テストを書く: 件数（pc・sp が両方 ok、片方 ng、片方 unchecked、対象外の組み合わせで ok / ng / unchecked / 全件が正しいこと）、番号が `index + 1` であること、PC/SP のボタンが `onToggleStatus(caseId, "pc" / "sp")` を呼ぶこと、備考が `onUpdateNote` を呼ぶこと、0 件で空の文言が出ること、背景と閉じるボタンが `onClose` を呼ぶこと。変更前のコードで通ることを確かめる。
- [ ] **Step 2:** 切り出す。
- [ ] **Step 3:** Story を足す（`DetailCaseRow` は `<table><tbody>` の `decorators`）。
- [ ] **Step 4:** `DetailPanel.test.tsx`、`DetailPanel.a11y.test.tsx`、`TestMatrixPage.test.tsx` を実行する。

### Task 8: テストマトリクスのページの分割（B3）

**Files:**

- Create: `src/features/test-matrix/TestMatrixSummaryBar.tsx`、`TestMatrixToolbar.tsx`、`TestMatrixStatusLegend.tsx` と、それぞれの `.stories.tsx`
- Modify: `src/features/test-matrix/TestMatrixPage.tsx`
- Test: `src/features/test-matrix/__tests__/TestMatrixPage.test.tsx`（追記）

**Interfaces:**

```ts
type TestMatrixSummaryBarProps = {
  totalCount: number;
  okCount: number;
  ngCount: number;
  uncheckedCount: number;
  progressPct: number;
};

type TestMatrixToolbarProps = {
  collapseAll: boolean; // `useTestMatrixPageState` の実際の型に合わせる
  filterStatus: CheckStatus | "all";
  onCollapseAll: () => void;
  onChangeFilter: (status: CheckStatus | "all") => void;
  onReset: () => void;
};

// TestMatrixStatusLegend は props なし
```

JSX の `{/* Summary bar */}`・`{/* Toolbar */}`・`{/* Status legend */}` の各ブロックをそのまま移す。`loading`・権限なしの分岐は `TestMatrixPage` に残す。

- [ ] **Step 1:** 固定テストを追記: 進捗の %、ok / ng / 未確認 / 全件の表示、バーの `style.width`、フィルターの変更が `setFilterStatus` に届くこと（`select` の `value` が `filterStatus` であること）、凡例の 4 つの文言。変更前のコードで通ることを確かめる。
- [ ] **Step 2:** 切り出す。
- [ ] **Step 3:** Story を足す。
- [ ] **Step 4:** `TestMatrixPage.test.tsx` を実行する。

### Task 9: 家計簿の許可設定ページの分割（B4）

**Files:**

- Create: `src/features/budget/components/BudgetAllowanceSectionHeader.tsx`、`BudgetExpenseItemSection.tsx` と、それぞれの `.stories.tsx`
- Modify: `src/features/budget/components/BudgetAllowanceSettingsPage.tsx`
- Test: `src/features/budget/__tests__/BudgetAllowanceSettingsPage.test.tsx`（追記）

**Interfaces:**

```ts
type BudgetAllowanceSectionHeaderProps = {
  title: ReactNode;
  showAddButton: boolean;
  onAdd: () => void;
};

type BudgetExpenseItemSectionProps = {
  title: string;
  items: BudgetExpenseItem[];
  showForm: boolean;
  listClassName: string;
  editingItemId: string | null;
  editingItemName: string;
  editingItemAmount: string;
  onToggleKind: (itemId: string) => void;
  onChangeEditingName: (value: string) => void;
  onChangeEditingAmount: (value: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onStartEdit: (item: BudgetExpenseItem) => void;
  onDelete: (item: BudgetExpenseItem) => void;
};
```

`BudgetAllowanceItemRow` はジェネリックなので、`ComponentProps` で型を引くと `Item` に広がって型エラーになる。上のように明示する。`BudgetExpenseItemSection` は `<h3>` と、`items.length === 0 && !showForm` のときの `BudgetAllowanceSectionEmptyState`、それ以外の `<div className={listClassName}>` を描画する。固定費は `listClassName="space-y-2 mb-4"`、変動費は `listClassName="space-y-2"`。

見出しの `<div className="flex items-center justify-between gap-3 mb-3">` を `BudgetAllowanceSectionHeader` に移す。収入は `showAddButton={!income.showForm}`・`onAdd={income.openForm}`、支出は `onAdd={() => expense.openForm("fixed")}`。

- [ ] **Step 1:** 固定テストを追記: 固定費の一覧のコンテナのクラスが `space-y-2 mb-4`、変動費が `space-y-2`、空のとき `BudgetAllowanceSectionEmptyState` が出てフォームを開くと消えること、固定費と変動費の項目がそれぞれの一覧に出ること、支出の追加が `openForm("fixed")` を呼ぶこと、編集のコールバックが固定費と変動費の両方で届くこと。変更前のコードで通ることを確かめる。
- [ ] **Step 2:** 切り出す。
- [ ] **Step 3:** Story を足す。
- [ ] **Step 4:** `src/features/budget/__tests__/BudgetAllowanceSettingsPage.test.tsx` を実行する。

### Task 10: テストの追加（純粋な処理）

**Files（新規または追記）:** 既存のテストがあれば追記し、無ければ `__tests__/` に作る。

| 対象                                                        | 確かめる内容                                                                                                                                                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/sync/sync/initialSync.ts`                     | ドキュメントあり + ローカル空 → ダウンロード、あり + ローカルあり → 何もしない、なし + ローカルあり → アップロード、なし + 空 → 何もしない、取得の例外を握りつぶして resolve すること |
| `src/features/journal/utils/journalDate.ts`                 | 全エクスポートの変換、月末・年末の境界                                                                                                                                                |
| `src/features/work-tracker/storageStats.ts`                 | 集計の値、空の場合                                                                                                                                                                    |
| `src/features/settings/state/theme.ts`                      | 各テーマの判定と未定義の値の扱い                                                                                                                                                      |
| `src/features/calendar/utils/calendarDate.ts`               | 月の境界（1 月・12 月・うるう年）                                                                                                                                                     |
| `src/features/weather/page/format.ts`                       | 未テストの分岐すべて                                                                                                                                                                  |
| `src/features/routine/hooks/homeViewPersistence.ts`         | 壊れた保存値・読み書きの例外で既定値に戻ること                                                                                                                                        |
| `src/features/weather/cache/core.ts`                        | 壊れたキャッシュ・期限切れ・形の違う値                                                                                                                                                |
| `src/features/auth/login/helpers.ts`                        | 未テストの分岐すべて                                                                                                                                                                  |
| `src/features/routine/components/routineFormSubmitModel.ts` | 未テストの入力の組み合わせ                                                                                                                                                            |

- [ ] **Step 1:** カバレッジの未到達行を `npx cross-env TZ=Asia/Tokyo jest --testPathIgnorePatterns=/node_modules/ --coverage --coverageDirectory "$(mktemp -d)" --coverageReporters=text --collectCoverageFrom=<対象> --runTestsByPath <関連テスト>` で確かめる。
- [ ] **Step 2:** 対象ごとにテストを書き、実行する。
- [ ] **Step 3:** 各対象で変異を 1 つ入れて落ちることを確かめ、退避から戻す。
- [ ] **Step 4:** 本体のバグに見えるものは直さず、現状を固定してコメントし、報告に書く。

### Task 11: テストの追加（フック・UI）

**Files（新規または追記）:**

| 対象                                                      | 確かめる内容                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `src/features/work-tracker/page/useWorkTrackerTimer.ts`   | fake timers でタイマーの開始・停止・アンマウントでの解除     |
| `src/features/settings/components/MonitoredLinesList.tsx` | 一覧の表示、チェック・削除などの操作がコールバックへ届くこと |

- [ ] **Step 1:** 実装を読み、テストを書く。
- [ ] **Step 2:** 実行し、変異で落ちることを確かめ、戻す。

### Task 12: ドキュメント

**Files:**

- Modify: `docs/03-testing/README.md`（「外部から入るデータの失敗経路のテスト」の節の前に「テストの後片付け」を足す）
- Modify: `docs/02-development/architecture.md`（129 行目の Hooks に `useFormOpenAutoFocus`・`useCategoryNameEditing`、Components の行に `PeriodNavButton`）
- Modify: `docs/02-development/refactoring-guide.md`（分割しない判断の目安）
- Modify: `docs/README.md`（最終更新日を 2026年10月30日）

「テストの後片付け」に書く内容:

- `jest.config.ts` は `restoreMocks` を設定していないので、`global` / `window` / `navigator` / `document` の差し替えと、それらのスパイは各ファイルの `afterEach` で戻す。
- `Object.defineProperty` は `Object.getOwnPropertyDescriptor` で元の定義を控え、元が無ければ `delete` する。
- そのテストの中だけで使うオブジェクトのスパイは戻さなくてよい。

`refactoring-guide.md` に書く内容: 行数が長くても、処理を持たず分解代入と props の受け渡しだけのコンポーネントは行数だけを理由に分割しない。ref を共有する 1 つの状態機械も同様。繰り返しの DOM や、独立して読める処理があるものを分割する。

- [ ] **Step 1:** 各文書を更新する。
- [ ] **Step 2:** `npx prettier --check` を変更した文書に実行する。

### Task 13: 全体の検証（統括側）

- [ ] **Step 1:** `npm run tailwind:scan`、`npm run lint`、`npm run typecheck`、`npm run typecheck:functions`
- [ ] **Step 2:** `git diff --name-only --diff-filter=d` と、`git ls-files --others --exclude-standard` から `firebase-functions/node_modules` を除いた一覧に `npx prettier --check`
- [ ] **Step 3:** テストの全件（並列・バックグラウンド）

```bash
npx cross-env TZ=Asia/Tokyo jest --forceExit --testPathIgnorePatterns "/node_modules/" "/firebase-functions/lib/" "/e2e/"
```

- [ ] **Step 4:** `npm run build`
- [ ] **Step 5:** `git status --short` に `firebase-functions/node_modules` 以外の想定外のファイルが無いことを確かめる。
- [ ] **Step 6:** 各担当の報告を、ファイルの実在・テストの再実行・差分で確かめる（報告だけで完了としない）。
- [ ] **Step 7:** 要確認事項を集約する。設計書の対象外の 5 件と、各タスクで見つかった本体のバグを PR 本文に書く。
- [ ] **Step 8:** コミットは後の `/commit-ja` で、パスを指定した `git add` で行う。`git add -A` と `git add .` は使わない。
