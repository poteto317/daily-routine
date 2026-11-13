# ルーティンのカードが読む設定（スワイプの動作）を購読する形にする Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ルーティンのカード（`RoutineItem`・`SortableRoutineItem`）が描画中に `getSettings()` を呼ぶのをやめ、設定を購読するフック `useSwipeActionSetting()` で受け取る形にして、React Compiler でスワイプの動作が最初の描画の値に固定されないようにする。

**Architecture:** `useSyncExternalStore` で `swipeAction`（文字列）だけを購読するフックを `src/features/settings/state/` に足す。フックは、同じタブでの保存（`SETTINGS_UPDATED_EVENT`）と別のタブでの保存（`storage` イベント）の両方で読み直す。カードはフックの戻り値を `swipeActionType` へ渡すので、コンパイラはその値をメモ化の依存として扱う。Jest は React Compiler を通さないため、コンパイル結果を調べる契約テストを足し、既存の契約テストの道具（コンパイルと、最初の描画で 1 回だけ実行されるブロックの取り出し）を共通のファイルへ移して両方から使う。

**Tech Stack:** Next.js 16（`reactCompiler: true`）/ React 19 / TypeScript、Jest（ts-jest、jsdom）+ Testing Library、`babel-plugin-react-compiler`、ESLint、Prettier。

設計書: `docs/superpowers/specs/2026-11-13-routine-card-settings-subscription-design.md`（Issue #224）

## Global Constraints

- フックの名前と場所（変えない）: `useSwipeActionSetting`、`src/features/settings/state/useSwipeActionSetting.ts`。戻り値の型は `AppSettings["swipeAction"]`（`"delete" | "edit"`）。
- フックは `useSyncExternalStore` を使う。`subscribe`・`getSnapshot`・`getServerSnapshot` はモジュールのトップレベルに置く。スナップショットは `swipeAction` の文字列だけにする（`getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返すので、設定の全体をスナップショットにしない）。値をキャッシュしない。`useRef` のガードを使わない（L-469）。
- フックは `window` の `SETTINGS_UPDATED_EVENT`（`"settings-updated"`）と `"storage"` の 2 つを購読し、クリーンアップで両方とも外す（L-108）。`storage` イベントはキーで絞らない。
- サーバーのスナップショットは `DEFAULT_SETTINGS.swipeAction`。
- カードへは props で渡さず、カードがフックを直接呼ぶ。
- 変更しないファイル: `src/components/SwipeableRoutineItem.tsx`、`src/features/routine/components/SortableRoutineEditModeItem.tsx`、`src/features/routine/helpersPresentation.ts`（`createSwipeHandler`）、`src/features/settings/storage.ts`。Storybook のファイルは、動作を変えない（実装の後に、コメントだけを直した。末尾の「実装の後に変わった点」）。
- 既存の契約テスト `src/__tests__/reactCompilerToday.contract.test.ts` は、import と道具の置き場所だけを変える。確認の内容・対象の一覧・テストの件数（1 スイート、66 件）は変えない。
- 範囲外（手を付けない）: カード以外の `getSettings()` の呼び出し箇所、`useRoutines.ts` の購読、設定の全体を返す汎用のフック。
- 実装の順序（TDD）: 先に、設定用の契約テストと配線テストを書き、いまのコードで失敗することを確かめてから、フックを作ってカードを直す。フックの単体テストは、フックより先に書く。
- テストでは、`@/features/settings/storage` と `@/lib/storage/core` をモックしない（本物の `getSettings`・`saveSettings` と jsdom の `localStorage` を使う。L-059）。例外は既存の `RoutineItem.test.setup.ts` だけで、そこでは本物の export を残したうえで `getSettings` だけを差し替える。
- コメントは日本語で書く（`docs/02-development/coding-standards.md`）。
- Next.js のコードを書く前に、`AGENTS.md` の指示どおり `node_modules/next/dist/docs/` の関係するガイドを確かめる（今回は React のフックとクライアントコンポーネントの変更だけで、Next.js の API は使わない）。
- **コミットしない。** `git add`・`git commit`・`git stash`・ブランチの切り替えをしない（コミットは、この後の開発フローのステップで行う）。
- 確認した知見（`<dev-flow-kit>/lessons/review-lessons.md`）: L-538・L-466（React Compiler での固定。Jest では検出できないので、コンパイル結果で確かめる）、L-469（StrictMode でも購読が続く）、L-108（リスナーをクリーンアップで外す）、L-059（モックしすぎず、本物の保存・読み出しを通す）、L-060（props を変えずに再描画されることを、配線テストで確かめる）。

---

### Task 1: 契約テストの道具を共通のファイルへ移す

振る舞いは変えない。既存の契約テストが、移す前と同じ件数で通ることを確かめる。

**Files:**

- Create: `src/__tests__/reactCompilerContract.helpers.ts`
- Modify: `src/__tests__/reactCompilerToday.contract.test.ts:4-7`（import）、`:26`（`ROOT`）、`:165-219`（移すブロック）

**Interfaces:**

- Consumes: なし
- Produces（Task 2 が使う。`src/__tests__/reactCompilerContract.helpers.ts` が export する）:
  - `readSource(file: string): string` — リポジトリのルートからのパスで、ソースの文字列を読む
  - `compileWithReactCompiler(file: string): string` — Next と同じオプションで React Compiler を通した出力の文字列を返す
  - `listSentinelBlocks(code: string): string[]` — 最初の描画で 1 回だけ実行されるブロックの中身をすべて返す

- [ ] **Step 1: 移す前の件数を確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerToday.contract.test.ts --forceExit`

Expected: `Test Suites: 1 passed, 1 total`、`Tests: 66 passed, 66 total`。

件数が 66 と違う場合は、その件数を控えて、Step 5 で同じ件数になることを確かめる。

- [ ] **Step 2: 共通のファイルを作る**

`src/__tests__/reactCompilerContract.helpers.ts` を、次の内容で作る。`const SENTINEL_CONDITION` から下は、`src/__tests__/reactCompilerToday.contract.test.ts` の 165〜219 行目をそのまま移したもので、`readSource`・`compileWithReactCompiler`・`listSentinelBlocks` の 3 つに `export` を足しただけにする（中身を書き換えない）。

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "@babel/core";
import * as ts from "typescript";

// React Compiler の契約テストで共通に使う道具。
// 対象ファイルを Next と同じオプションの babel-plugin-react-compiler でコンパイルし、
// 出力から「最初の描画で 1 回だけ実行されるブロック」を取り出す。
// 使うテスト: reactCompilerToday.contract.test.ts、reactCompilerSettings.contract.test.ts

const ROOT = process.cwd();

const SENTINEL_CONDITION = '=== Symbol.for("react.memo_cache_sentinel"))';

export const readSource = (file: string) =>
  readFileSync(join(ROOT, file), "utf-8");

/** TypeScript の型を外し（JSX は残す）、Next と同じオプションで React Compiler を通す */
export const compileWithReactCompiler = (file: string): string => {
  const { outputText } = ts.transpileModule(readSource(file), {
    fileName: file,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
    },
  });
  const result = transformSync(outputText, {
    babelrc: false,
    configFile: false,
    filename: file,
    parserOpts: { plugins: ["jsx"] },
    plugins: [
      [
        "babel-plugin-react-compiler",
        { environment: { enableNameAnonymousFunctions: false } },
      ],
    ],
  });
  if (!result?.code) {
    throw new Error(`${file} のコンパイル結果が空です`);
  }
  return result.code;
};

/** `{` の位置から、対応する `}` までの中身を返す（波かっこの数で対応を取る） */
const readBlock = (code: string, openBraceIndex: number): string => {
  let depth = 0;
  for (let index = openBraceIndex; index < code.length; index++) {
    if (code[index] === "{") depth++;
    if (code[index] === "}") depth--;
    if (depth === 0) return code.slice(openBraceIndex + 1, index);
  }
  throw new Error("メモ化のブロックの終わりが見つかりません");
};

/** 最初の描画で 1 回だけ実行されるブロック（sentinel の if の中身）をすべて返す */
export const listSentinelBlocks = (code: string): string[] => {
  const blocks: string[] = [];
  let from = 0;
  for (;;) {
    const conditionIndex = code.indexOf(SENTINEL_CONDITION, from);
    if (conditionIndex === -1) return blocks;
    const openBraceIndex = code.indexOf("{", conditionIndex);
    blocks.push(readBlock(code, openBraceIndex));
    from = openBraceIndex + 1;
  }
};
```

`readSource` の行は、`export` を足すと 80 文字を超えるので、上のとおり 2 行に折り返す（Prettier の整形）。このファイルはテストではないので、`@jest-environment` のコメントは書かない（ファイル名が `.test.` を含まないので、Jest はテストとして拾わない）。

- [ ] **Step 3: 既存の契約テストを、共通のファイルを使う形に直す**

`src/__tests__/reactCompilerToday.contract.test.ts` を、次の 3 か所だけ直す。

(1) 先頭の import（4〜7 行目）。

変更前:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { transformSync } from "@babel/core";
import * as ts from "typescript";
```

変更後:

```ts
import * as ts from "typescript";
import {
  compileWithReactCompiler,
  listSentinelBlocks,
  readSource,
} from "./reactCompilerContract.helpers";
```

`import * as ts from "typescript";` は残す（このファイルの `isUseNoMemoDirective` などが `ts.` を使っている）。

(2) 26 行目の `const ROOT = process.cwd();` と、その直後の空行 1 行を消す（`ROOT` を使うのは移したブロックだけ）。

(3) `const SENTINEL_CONDITION = ...` の行（165 行目）から、`listSentinelBlocks` の終わりの `};`（219 行目）までと、その直後の空行 1 行を消す。消した後は、`TODAY_EXPRESSIONS` の終わりの `];`、空行 1 行、`const isUseNoMemoDirective = ...` の順に並ぶ。

先頭のコメント（9〜24 行目）、`TODAY_TARGETS`・`USE_NO_MEMO_TARGETS`・`TODAY_EXPRESSIONS`、`describe` の中身は変えない。

- [ ] **Step 4: 中身を変えずに移したことを確かめる**

Run:

```bash
diff <(git show HEAD:src/__tests__/reactCompilerToday.contract.test.ts | sed -n '165,219p') <(sed -n '/^const SENTINEL_CONDITION/,$p' src/__tests__/reactCompilerContract.helpers.ts)
```

Expected: 差分は、`readSource`・`compileWithReactCompiler`・`listSentinelBlocks` の定義の行だけ（`const` が `export const` になり、`readSource` は 1 行が 2 行に折り返される）。ほかの行に差分が出た場合は、元の行と同じに戻す。

Run:

```bash
grep -n "readFileSync\|join(\|transformSync\|ROOT\|SENTINEL_CONDITION\|readBlock" src/__tests__/reactCompilerToday.contract.test.ts
```

Expected: 何も出ない（移した道具の中身が、既存のテストに残っていない）。

- [ ] **Step 5: 既存の契約テストが、移す前と同じ件数で通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerToday.contract.test.ts --forceExit`

Expected: `Test Suites: 1 passed, 1 total`、`Tests: 66 passed, 66 total`（Step 1 と同じ件数）。

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__ --forceExit`

Expected: すべて PASS。`reactCompilerContract.helpers.ts` はテストとして実行されない（スイートの一覧に出ない）。

- [ ] **Step 6: 整形と lint を確かめる**

Run: `npx prettier --check src/__tests__/reactCompilerContract.helpers.ts src/__tests__/reactCompilerToday.contract.test.ts`

Expected: `All matched files use Prettier code style!`（警告が出た場合は `npx prettier --write` を同じ 2 ファイルに実行し、Step 4 の `diff` をもう一度確かめる）。

Run: `npx eslint src/__tests__/reactCompilerContract.helpers.ts src/__tests__/reactCompilerToday.contract.test.ts`

Expected: エラー・警告 0 件。

- [ ] **Step 7: コミットしない**

変更は作業ツリーに残したままにする。`git status --short` の結果を報告する。

---

### Task 2: 設定を購読するフックを足し、カードをフックに切り替える

**Files:**

- Create: `src/__tests__/reactCompilerSettings.contract.test.ts`
- Create: `src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx`
- Create: `src/features/settings/__tests__/useSwipeActionSetting.test.tsx`
- Create: `src/features/settings/state/useSwipeActionSetting.ts`
- Modify: `src/features/routine/components/RoutineItem.tsx:4`、`:45`、`:98`
- Modify: `src/features/routine/components/SortableRoutineItem.tsx:4`、`:43`、`:64`、`:89`
- Modify: `src/features/routine/__tests__/RoutineItem.test.setup.ts:27-33`

**Interfaces:**

- Consumes（Task 1 が作った `src/__tests__/reactCompilerContract.helpers.ts`）:
  - `readSource(file: string): string`
  - `compileWithReactCompiler(file: string): string`
  - `listSentinelBlocks(code: string): string[]`
- Consumes（既存。`src/features/settings/storage.ts`）:
  - `getSettings(): AppSettings` — 保存データがあると呼ぶたびに新しいオブジェクトを返す。保存データが無いときは `DEFAULT_SETTINGS`
  - `saveSettings(settings: AppSettings): void` — 保存して、`window` に `SETTINGS_UPDATED_EVENT` を出す
  - `DEFAULT_SETTINGS: AppSettings`（`swipeAction` は `"delete"`）
  - `SETTINGS_UPDATED_EVENT`（`"settings-updated"`）
- Consumes（既存。`src/lib/storage/core`）: `getUserScopedKey(key: string): string`
- Produces: `useSwipeActionSetting(): "delete" | "edit"`（`src/features/settings/state/useSwipeActionSetting.ts`）

- [ ] **Step 1: 設定用の契約テストを書く（失敗するテスト）**

`src/__tests__/reactCompilerSettings.contract.test.ts` を、次の内容で作る。

```ts
/**
 * @jest-environment node
 */
import {
  compileWithReactCompiler,
  listSentinelBlocks,
  readSource,
} from "./reactCompilerContract.helpers";

// React Compiler の契約テスト: 描画中に読む「保存された設定」が、最初の描画の値に固定されないこと。
//
// getSettings() は props・state・フックの戻り値のどれにも依存しないので、フック・コンポーネントの
// 本体で呼んで表示に使うと、React Compiler が「最初の描画で 1 回だけ実行されるブロック」に入れる。
// その結果、設定が変わっても、再読み込みするまで古い値のまま表示される（Issue #224）。
// Jest（ts-jest）は React Compiler を通さないため、ふつうの単体テストでは固定を検出できない。
// ここでは対象ファイルをコンパイルし、出力の文字列を調べる（見方は reactCompilerToday.contract.test.ts と同じ）。
//
// 設定を購読するフックを使うフック・コンポーネントを足したら、下の SETTINGS_TARGETS に足す
// （docs/02-development/coding-standards.md「React Compiler と保存された設定の値」から参照している）。

type SettingsTarget = {
  /** 対象のファイル（リポジトリのルートからのパス） */
  file: string;
  /** ソースに書かれているはずの、設定を購読するフックの呼び出し */
  hookCall: string;
  /** メモ化の依存の比較に出てくるはずの変数名 */
  dependencies: string[];
};

const SETTINGS_TARGETS: SettingsTarget[] = [
  {
    file: "src/features/routine/components/RoutineItem.tsx",
    hookCall: "useSwipeActionSetting(",
    dependencies: ["swipeAction"],
  },
  {
    file: "src/features/routine/components/SortableRoutineItem.tsx",
    hookCall: "useSwipeActionSetting(",
    dependencies: ["swipeAction"],
  },
];

/** 保存された設定を、購読せずに読む式 */
const SETTINGS_EXPRESSIONS = ["getSettings("];

describe("React Compiler で保存された設定の値が固定されない（契約テスト）", () => {
  describe.each(SETTINGS_TARGETS)(
    "$file",
    ({ file, hookCall, dependencies }) => {
      const code = compileWithReactCompiler(file);

      it("React Compiler でコンパイルされている（出力に _c( がある）", () => {
        expect(code).toContain("_c(");
      });

      it("保存された設定を読む式が、最初の描画で 1 回だけ実行されるブロックに入っていない", () => {
        const frozenBlocks = listSentinelBlocks(code).filter((block) =>
          SETTINGS_EXPRESSIONS.some((expression) => block.includes(expression)),
        );
        expect(frozenBlocks).toEqual([]);
      });

      it.each(dependencies)("メモ化の依存の比較に %s がある", (dependency) => {
        expect(code).toMatch(new RegExp(`\\$\\[\\d+\\] !== ${dependency}\\b`));
      });

      it(`ソースが設定を購読するフック ${hookCall} を呼んでいる`, () => {
        expect(readSource(file)).toContain(hookCall);
      });
    },
  );
});
```

- [ ] **Step 2: 配線テストを書く（失敗するテスト）**

`src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx` を、次の内容で作る。

```tsx
import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { getUserScopedKey } from "@/lib/storage/core";
import type { Routine } from "@/types/routine";
import { RoutineItem } from "../RoutineItem";
import { SortableRoutineItem } from "../SortableRoutineItem";

// このテストは「カードが設定（スワイプの動作）を購読し、その値をスワイプの部品へ渡している」
// ことを確かめる。設定の保存（saveSettings）・読み出し（getSettings）と localStorage は本物を使う
// （RoutineItem.test.setup.ts は getSettings を固定値に差し替えるので、ここでは使わない）。
// スワイプの背景の色は、削除が赤（bg-red-500）、編集が青（bg-blue-500）。
//
// Jest は React Compiler を通さないので、コンパイル後に値が固定されないことは、
// 契約テスト（src/__tests__/reactCompilerSettings.contract.test.ts）で確かめる。

jest.mock("@dnd-kit/sortable", () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => undefined) } },
}));

/** 毎日 09:00 開始の未完了ルーティン（曜日に左右されないよう、全曜日を対象にする） */
const routine: Routine = {
  id: "r1",
  title: "朝のストレッチ",
  startTime: "09:00",
  duration: 30,
  category: "health",
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  isCompleted: false,
  sortOrder: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const CASES: Array<[string, ReactElement]> = [
  [
    "RoutineItem",
    <RoutineItem
      key="RoutineItem"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
  ],
  [
    "SortableRoutineItem（表示モード）",
    <SortableRoutineItem
      key="SortableRoutineItem-view"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
      isEditMode={false}
    />,
  ],
  [
    "SortableRoutineItem（編集モード）",
    <SortableRoutineItem
      key="SortableRoutineItem-edit"
      routine={routine}
      onToggle={jest.fn()}
      onEdit={jest.fn()}
      onDelete={jest.fn()}
    />,
  ],
];

describe("ルーティンのカードのスワイプの動作が、設定の変更で更新される（配線テスト）", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it.each(CASES)(
    "%s: props を変えずに、同じタブで設定を保存すると、スワイプの背景が編集の色（青）になる",
    (_name, element) => {
      const { container } = render(element);

      // 保存された設定が無いので、既定値（削除）の色
      expect(container.querySelector(".bg-red-500")).not.toBeNull();
      expect(container.querySelector(".bg-blue-500")).toBeNull();

      // 同じタブの設定画面で保存したときと同じ経路（saveSettings が settings-updated を出す）
      act(() => {
        saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
      });

      expect(container.querySelector(".bg-blue-500")).not.toBeNull();
      expect(container.querySelector(".bg-red-500")).toBeNull();
    },
  );

  it.each(CASES)(
    "%s: props を変えずに、別のタブが設定を書くと、スワイプの背景が編集の色（青）になる",
    (_name, element) => {
      const { container } = render(element);

      expect(container.querySelector(".bg-red-500")).not.toBeNull();
      expect(container.querySelector(".bg-blue-500")).toBeNull();

      // 別のタブが書いたときと同じ形: saveSettings() を通さずに localStorage を直接書き、
      // storage イベントを出す（jsdom は同じウィンドウへ storage イベントを出さないので、手で出す）
      localStorage.setItem(
        getUserScopedKey("app-settings"),
        JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction: "edit" }),
      );
      act(() => {
        window.dispatchEvent(new StorageEvent("storage"));
      });

      expect(container.querySelector(".bg-blue-500")).not.toBeNull();
      expect(container.querySelector(".bg-red-500")).toBeNull();
    },
  );
});
```

`SortableRoutineItem` の `isEditMode` の既定値は `true` なので、3 つ目のケースは `isEditMode` を渡さずに編集モードを描く。

- [ ] **Step 3: 2 つのテストが、いまのコードで失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerSettings.contract.test.ts src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx --forceExit`

Expected: 2 ファイルとも FAIL。

- `reactCompilerSettings.contract.test.ts`: 8 件のうち、「React Compiler でコンパイルされている」の 2 件は PASS。残りの 6 件（ブロックに入っていない・依存の比較に `swipeAction` がある・フックを呼んでいる、を 2 ファイル分）は FAIL。
- `routineItemSwipeActionSetting.wiring.test.tsx`: 6 件とも FAIL。設定を変えた後の `expect(container.querySelector(".bg-blue-500")).not.toBeNull()` で失敗する（変える前の確認は通る）。

それ以外の理由（import の誤り、構文エラー、変える前の確認での失敗など）で失敗した場合は、テストを直してからもう一度実行する。

- [ ] **Step 4: フックの単体テストを書く（失敗するテスト）**

`src/features/settings/__tests__/useSwipeActionSetting.test.tsx` を、次の内容で作る。

```tsx
import { act, renderHook } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import {
  DEFAULT_SETTINGS,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings/storage";
import { getUserScopedKey } from "@/lib/storage/core";
import { useSwipeActionSetting } from "../state/useSwipeActionSetting";

// 設定の保存（saveSettings）・読み出し（getSettings）と localStorage は本物を使う。
// フックが「保存された値を読む」「保存の通知で読み直す」ことを、モックを挟まずに確かめるため。

type SwipeAction = "delete" | "edit";

/** 保存された設定を、イベントを出さずに直接書く */
const writeStoredSettings = (swipeAction: SwipeAction) => {
  localStorage.setItem(
    getUserScopedKey("app-settings"),
    JSON.stringify({ ...DEFAULT_SETTINGS, swipeAction }),
  );
};

/** 別のタブが設定を書いたときと同じ形: localStorage を直接書き、storage イベントを出す */
const writeSettingsFromAnotherTab = (swipeAction: SwipeAction) => {
  writeStoredSettings(swipeAction);
  act(() => {
    // jsdom は同じウィンドウへ storage イベントを出さないので、手で出す
    window.dispatchEvent(new StorageEvent("storage"));
  });
};

describe("useSwipeActionSetting", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("保存された設定が無いときは、既定値（delete）を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());

    expect(result.current).toBe("delete");
  });

  it("保存された設定があるときは、その値を返す", () => {
    writeStoredSettings("edit");

    const { result } = renderHook(() => useSwipeActionSetting());

    expect(result.current).toBe("edit");
  });

  it("同じタブで saveSettings() が呼ばれると、新しい値を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());
    expect(result.current).toBe("delete");

    act(() => {
      saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    });

    expect(result.current).toBe("edit");
  });

  it("別のタブが設定を書いて storage イベントが来ると、新しい値を返す", () => {
    const { result } = renderHook(() => useSwipeActionSetting());
    expect(result.current).toBe("delete");

    writeSettingsFromAnotherTab("edit");

    expect(result.current).toBe("edit");
  });

  it("アンマウントで、購読した 2 つのイベントのリスナーを両方とも外す", () => {
    const addSpy = jest.spyOn(window, "addEventListener");
    const removeSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useSwipeActionSetting());

    const subscribed = addSpy.mock.calls.filter(
      ([type]) => type === SETTINGS_UPDATED_EVENT || type === "storage",
    );
    // 期待値は定数を参照せず、イベント名をそのまま書く
    expect(subscribed.map(([type]) => type).sort()).toEqual([
      "settings-updated",
      "storage",
    ]);

    unmount();

    for (const [type, listener] of subscribed) {
      expect(removeSpy).toHaveBeenCalledWith(type, listener);
    }
  });

  it("StrictMode（購読 → 解除 → 購読）でも、設定の変更に追従する", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <StrictMode>{children}</StrictMode>
    );
    const { result } = renderHook(() => useSwipeActionSetting(), { wrapper });
    expect(result.current).toBe("delete");

    act(() => {
      saveSettings({ ...DEFAULT_SETTINGS, swipeAction: "edit" });
    });
    expect(result.current).toBe("edit");

    writeSettingsFromAnotherTab("delete");
    expect(result.current).toBe("delete");
  });
});
```

- [ ] **Step 5: フックの単体テストが失敗することを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/settings/__tests__/useSwipeActionSetting.test.tsx --forceExit`

Expected: FAIL。`Cannot find module '../state/useSwipeActionSetting'`（フックがまだ無い）。

- [ ] **Step 6: フックを作る**

`src/features/settings/state/useSwipeActionSetting.ts` を、次の内容で作る（`"use client"` は書かない。`src/hooks/useCurrentMinute.ts` と同じく、フックだけのファイルにする）。

```ts
import { useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/features/settings/storage";
import type { AppSettings } from "@/types/routine";

type SwipeAction = AppSettings["swipeAction"];

/**
 * 設定が変わったかもしれないときに、読み直させる。
 * - SETTINGS_UPDATED_EVENT: 同じタブで saveSettings() が呼ばれたとき
 * - storage: 別のタブ・ウィンドウが localStorage を書いたとき
 *   （キーでは絞らない。スナップショットが文字列なので、値が同じなら再描画は起きない）
 */
const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener(SETTINGS_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SETTINGS_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const getSnapshot = (): SwipeAction => getSettings().swipeAction;

const getServerSnapshot = (): SwipeAction => DEFAULT_SETTINGS.swipeAction;

/**
 * 保存された設定のうち、スワイプの動作（swipeAction）を購読して返す。
 *
 * 描画中に `getSettings()` を直接呼ぶと React Compiler に固定されるため、このフックを使う
 * （`getSettings()` は props・state・フックの戻り値のどれにも依存しないので、最初の描画の値が
 * キャッシュされ、設定が変わっても古い値のまま表示される。Issue #224）。
 *
 * - 設定の全体ではなく、文字列の値だけをスナップショットにする
 *   （`getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返すので、全体を返すと再描画が止まらない）。
 * - サーバーでの描画とハイドレーションの最初の描画では、既定値を返す。
 */
export const useSwipeActionSetting = (): SwipeAction =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

- [ ] **Step 7: フックの単体テストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/features/settings/__tests__/useSwipeActionSetting.test.tsx --forceExit`

Expected: PASS（6 件）。

- [ ] **Step 8: `RoutineItem` をフックに切り替える**

`src/features/routine/components/RoutineItem.tsx` を、次の 3 か所だけ直す。

(1) 4 行目の import。

変更前:

```ts
import { getSettings } from "@/features/settings/storage";
```

変更後:

```ts
import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
```

(2) 45 行目（`const nowMinute = useCurrentMinute();` の次の行）。

変更前:

```ts
const settings = getSettings();
```

変更後:

```ts
const swipeAction = useSwipeActionSetting();
```

(3) 98 行目（`<SwipeableRoutineItem` の props）。

変更前:

```text
      swipeActionType={settings.swipeAction}
```

変更後（インデントは変えない。`{` `}` の内側に空白を入れない）:

```text
      swipeActionType={swipeAction}
```

- [ ] **Step 9: `SortableRoutineItem` をフックに切り替える**

`src/features/routine/components/SortableRoutineItem.tsx` を、次の 4 か所だけ直す。

(1) 4 行目の import。

変更前:

```ts
import { getSettings } from "@/features/settings/storage";
```

変更後:

```ts
import { useSwipeActionSetting } from "@/features/settings/state/useSwipeActionSetting";
```

(2) 43 行目（`const nowMinute = useCurrentMinute();` の次の行）。

変更前:

```ts
const settings = getSettings();
```

変更後:

```ts
const swipeAction = useSwipeActionSetting();
```

(3) 64 行目（表示モードの `<SwipeableRoutineItem` の props）と、(4) 89 行目（編集モードの `<SortableRoutineEditModeItem` の props）。どちらも同じ形に直す。

変更前:

```text
swipeActionType={settings.swipeAction}
```

変更後（その行のインデントは変えない。`{` `}` の内側に空白を入れない）:

```text
swipeActionType={swipeAction}
```

フックの呼び出しは、いまの `getSettings()` と同じ位置（コンポーネントの本体の先頭、条件分岐の `return` より前）に置く。

- [ ] **Step 10: 既存のテストのモックに、本物の export を残す**

`src/features/routine/__tests__/RoutineItem.test.setup.ts` の 27〜33 行目を直す。モジュールを丸ごと差し替えていると、フックが使う `SETTINGS_UPDATED_EVENT`・`DEFAULT_SETTINGS` が `undefined` になるので、本物の export を残し、`getSettings` だけを差し替える。

変更前:

```ts
jest.mock("@/features/settings/storage", () => ({
  getSettings: jest.fn(() => ({
    swipeAction: "delete" as const,
    defaultNotificationMinutes: 10,
    defaultDurationMinutes: 30,
  })),
}));
```

変更後:

```ts
jest.mock("@/features/settings/storage", () => ({
  // カードは useSwipeActionSetting（SETTINGS_UPDATED_EVENT・DEFAULT_SETTINGS を使う）で設定を
  // 読むので、本物の export を残し、getSettings だけを固定値に差し替える
  ...jest.requireActual("@/features/settings/storage"),
  getSettings: jest.fn(() => ({
    swipeAction: "delete" as const,
    defaultNotificationMinutes: 10,
    defaultDurationMinutes: 30,
  })),
}));
```

`getSettings` のモックの中身（返す値）は変えない。

- [ ] **Step 11: 新しいテストと、カードに関係する既存のテストが通ることを確かめる**

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__/reactCompilerSettings.contract.test.ts src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx src/features/settings/__tests__/useSwipeActionSetting.test.tsx --forceExit`

Expected: 3 ファイルとも PASS（契約テスト 8 件、配線テスト 6 件、フックの単体テスト 6 件）。

Run: `npx cross-env TZ=Asia/Tokyo jest src/__tests__ src/features/routine src/components --forceExit`

Expected: すべて PASS。とくに次のテストが通ること。

- `src/features/routine/__tests__/RoutineItem.render.test.tsx`・`RoutineItem.actions.test.tsx`（Step 10 のモックを使う）
- `src/features/routine/components/__tests__/routineItemPastColor.wiring.test.tsx`
- `src/__tests__/reactCompilerToday.contract.test.ts`（66 件のまま）
- `src/__tests__/untested-modules-smoke.test.tsx`

カードを描く既存のテストが、`@/features/settings/storage` を丸ごとモックしているために失敗した場合は、Step 10 と同じ形（`...jest.requireActual("@/features/settings/storage"),` を先頭に足し、差し替えている関数はそのまま残す）で直す。それ以外の失敗は、原因を調べて報告する。

- [ ] **Step 12: カードが描画中に `getSettings()` を呼んでいないことを確かめる**

Run: `grep -n "getSettings\|settings\.swipeAction" src/features/routine/components/RoutineItem.tsx src/features/routine/components/SortableRoutineItem.tsx`

Expected: 何も出ない。

Run: `grep -n "useSwipeActionSetting\|swipeActionType={swipeAction}" src/features/routine/components/RoutineItem.tsx src/features/routine/components/SortableRoutineItem.tsx`

Expected: `RoutineItem.tsx` は 3 行（import、フックの呼び出し、props 1 か所）、`SortableRoutineItem.tsx` は 4 行（import、フックの呼び出し、props 2 か所）。

- [ ] **Step 13: 整形・lint・型を確かめる**

Run:

```bash
npx prettier --check src/__tests__/reactCompilerSettings.contract.test.ts src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx src/features/settings/__tests__/useSwipeActionSetting.test.tsx src/features/settings/state/useSwipeActionSetting.ts src/features/routine/components/RoutineItem.tsx src/features/routine/components/SortableRoutineItem.tsx src/features/routine/__tests__/RoutineItem.test.setup.ts
```

Expected: `All matched files use Prettier code style!`（警告が出たファイルには `npx prettier --write <ファイル>` を実行する。整形で変わるのは折り返しだけで、文言・識別子は変えない）。

Run: `npx eslint src/__tests__ src/features/settings/state/useSwipeActionSetting.ts src/features/settings/__tests__/useSwipeActionSetting.test.tsx src/features/routine/components src/features/routine/__tests__/RoutineItem.test.setup.ts`

Expected: エラー・警告 0 件。

Run: `npm run typecheck`

Expected: エラー 0 件。

整形や lint の修正でテストのファイルを変えた場合は、Step 11 の 1 つ目のコマンドをもう一度実行して、PASS のままであることを確かめる。

- [ ] **Step 14: コミットしない**

変更は作業ツリーに残したままにする。`git status --short` の結果を報告する。

---

### Task 3: 規約に足し、全体の検証を通す

**Files:**

- Modify: `docs/02-development/coding-standards.md:71-73`（小節を足す）、`:104-105`（レビューの観点を 1 行足す）

**Interfaces:**

- Consumes（Task 2 が作ったもの。規約の文中で名前とパスを参照する）:
  - `useSwipeActionSetting()`（`src/features/settings/state/useSwipeActionSetting.ts`）
  - `SETTINGS_TARGETS`（`src/__tests__/reactCompilerSettings.contract.test.ts`）
- Produces: なし

- [ ] **Step 1: 規約に小節「React Compiler と保存された設定の値」を足す**

`docs/02-development/coding-standards.md` の、小節「React Compiler と今日・現在時刻」の最後の項目（71 行目。`- **対象外**: イベントハンドラの中、` で始まる行）と、`### ダークモードの配色`（73 行目）の間に、次の小節を足す。前後は空行 1 行ずつにする。

```markdown
### React Compiler と保存された設定の値

保存された設定（`getSettings()`）を、フック・コンポーネントの本体で読んで表示に使うと、React Compiler が最初の描画の値に固定します。次の規約に従ってください。

- **固定される理由**: `getSettings()` は props・state・フックの戻り値のどれにも依存しないので、フック・コンポーネントの本体で呼んで表示に使うと、最初の描画の値に固定されます。Jest は React Compiler を通さないので、単体テストでは検出できません（「React Compiler と今日・現在時刻」と同じ仕組みです）。
- **購読するフックで受け取る**: 表示に使う設定は、設定を購読するフックで受け取ってください。スワイプの動作は `useSwipeActionSetting()`（`src/features/settings/state/useSwipeActionSetting.ts`）を使います。
- **ほかの項目が要るとき**: 同じ形のフックを足してください。スナップショットは、文字列・数値・真偽値か、変わらない限り同じ参照の値にします（`getSettings()` は、保存データがあると呼ぶたびに新しいオブジェクトを返すので、設定の全体をスナップショットにしません）。
- **契約テストに足す**: フックを使うフック・コンポーネントは、契約テスト（`src/__tests__/reactCompilerSettings.contract.test.ts`）の `SETTINGS_TARGETS` に足してください。
- **対象外**: イベントハンドラの中で読む設定（イベントの時点で読む）と、`useState` の初期値・フォームの初期値として読む設定（最初の値でよい）は対象外です。
```

- [ ] **Step 2: 「4. コードレビューの観点」に 1 行足す**

同じファイルの「## 4. コードレビューの観点」の中で、今日・現在時刻の観点の行（「…「React Compiler と今日・現在時刻」）。」で終わる行）のすぐ後ろ、ダークモードの観点の行（「- ダークモードで、背景に合った文字色になっているか、」で始まる行）のすぐ前に、次の 1 行を足す。

```markdown
- フック・コンポーネントの本体で `getSettings()` を呼び、その値を表示に使っていないか確認してください（React Compiler で最初の描画の値に固定される。購読するフックを使う。「React Compiler と保存された設定の値」）。
```

- [ ] **Step 3: 規約に書いた名前とパスが、実物と合っていることを確かめる**

Run: `ls src/features/settings/state/useSwipeActionSetting.ts src/__tests__/reactCompilerSettings.contract.test.ts && grep -n "export const useSwipeActionSetting" src/features/settings/state/useSwipeActionSetting.ts && grep -n "const SETTINGS_TARGETS" src/__tests__/reactCompilerSettings.contract.test.ts`

Expected: 2 つのファイルがあり、`useSwipeActionSetting` の export と `SETTINGS_TARGETS` の定義が 1 行ずつ出る。

Run: `npx prettier --check docs/02-development/coding-standards.md`

Expected: `All matched files use Prettier code style!`（警告が出た場合は `npx prettier --write docs/02-development/coding-standards.md` を実行し、`git diff docs/02-development/coding-standards.md` で、差分が足した小節と 1 行だけであることを確かめる）。

- [ ] **Step 4: 全体の検証を通す**

Run: `npm test`
Expected: すべて PASS（失敗 0 件）。

Run: `npm run lint`
Expected: エラー・警告 0 件。

Run: `npm run typecheck`
Expected: エラー 0 件。

Run: `npm run format:check`
Expected: `All matched files use Prettier code style!`

Run: `npm run build`
Expected: ビルドが成功する。

失敗した場合は、原因を直してからもう一度実行する。今回の変更と関係のない失敗（変更前から起きているもの）は、`git stash` を使わずに、失敗の内容をそのまま報告する。

- [ ] **Step 5: コミットしない**

変更は作業ツリーに残したままにする。`git status --short` の結果を報告する。期待する内容は次のとおり。

- 変更: `docs/02-development/coding-standards.md`、`src/__tests__/reactCompilerToday.contract.test.ts`、`src/features/routine/__tests__/RoutineItem.test.setup.ts`、`src/features/routine/components/RoutineItem.tsx`、`src/features/routine/components/SortableRoutineItem.tsx`
- 新規: `src/__tests__/reactCompilerContract.helpers.ts`、`src/__tests__/reactCompilerSettings.contract.test.ts`、`src/features/routine/components/__tests__/routineItemSwipeActionSetting.wiring.test.tsx`、`src/features/settings/__tests__/useSwipeActionSetting.test.tsx`、`src/features/settings/state/useSwipeActionSetting.ts`、設計書（`docs/superpowers/specs/2026-11-13-routine-card-settings-subscription-design.md`）、このプラン（`docs/superpowers/plans/2026-11-13-routine-card-settings-subscription.md`）

---

## 実装の後に行う確認（タスクの外。開発フローを進めているセッションが行う）

設計書の「テスト」の「検証」にある、本番ビルドでの動作の確認は、Task 3 が終わった後に、実装者ではなく開発フローを進めているセッションが行う（サーバーの起動とブラウザの操作が要るため）。

この確認は、2026年11月13日に行った。結果は、設計書の「確かめたこと」の「直した後（本番ビルドで確かめた）」にある。

1. `npm run build` の後、本番のサーバー（`npm run start`）を起動し、ホーム画面でルーティンのカードを表示する。
2. カードを表示したまま、別のタブが保存したときと同じ形で設定を書き換える（`localStorage` の、ユーザーごとのキー（`getUserScopedKey("app-settings")`。ログイン中は `user:<uid>:app-settings`）の `swipeAction` を `"edit"` にし、`storage` イベントを発行する）。
3. 再読み込みをせずに、カードのスワイプの背景が赤（`bg-red-500`）から青（`bg-blue-500`）に変わることを確かめる。

---

## 実装の後に変わった点（2026年11月13日〜14日。ローカルのレビューでの修正）

上のタスクの本文は、実装者へ渡した時点の内容のまま残している。実装の後に、次の点が変わった。いまの内容は、設計書とコードを正とする。

1. **Storybook の 2 つのファイルのコメントを直した。** `src/features/routine/components/RoutineItem.stories.tsx` と `src/features/routine/pages/DraggableRoutineList.stories.tsx` の冒頭のコメントが、カードは「`getSettings()` を直接呼ぶ」と説明していたので、「`useSwipeActionSetting()` で設定を読む」に合わせた。ストーリーの動作は変えていない。Task 3 の最後の `git status --short` の期待する内容（変更）には、この 2 つのファイルが加わる。
2. **`getSnapshot` が、保存された値を `"delete"` か `"edit"` にして返すようにした。** Task 2 のコード（`getSettings().swipeAction` をそのまま返す）では、保存された `swipeAction` がオブジェクトや配列に壊れていると、読むたびに参照が変わり、`useSyncExternalStore` が再描画を繰り返して描画が止まる。`getSettings().swipeAction === "delete" ? "delete" : "edit"` に変えた（スワイプの実行の `createSwipeHandler` と同じ扱い）。その後のレビューで（2026年11月14日）、受け付ける値の一覧 `SWIPE_ACTIONS`（型 `AppSettings["swipeAction"]` をキーにしたオブジェクト）を足し、保存された値が一覧にあればその値を、無ければ `"edit"` を返す形に変えた。`swipeAction` に値を足したときに、一覧が型エラーになる（前の形では、足した値を、型エラーも無いまま `"edit"` に直してしまう）。
3. **フックの単体テストを足した。** 壊れた値（オブジェクト・配列・`null`・知らない文字列）で `"edit"` を返すこと、サーバーでの描画（`renderToString`）で既定値を返すこと、ハイドレーション（`hydrateRoot`）で不一致を起こさずに保存された値へ追従することを、`src/features/settings/__tests__/useSwipeActionSetting.test.tsx` に足した。あわせて、このテストの中の型の別名 `SwipeAction` を、直接書いた `"delete" | "edit"` から `AppSettings["swipeAction"]` に変えた（フックと同じ書き方。型は同じ）。その後のレビューで（2026年11月14日）、知らない文字列の例を `"archive"` から `"unknown-action"` に変え（`"archive"` は、将来の値の名前になりうるため）、プロトタイプにある名前（`"constructor"`）の例を足した。
4. **契約テストの道具のテストを足した。** `src/__tests__/reactCompilerContract.helpers.ts` に、ソースの文字列を受け取る `compileSourceWithReactCompiler(source, file)` を足し（`compileWithReactCompiler` はそれを呼ぶ）、`src/__tests__/reactCompilerContract.helpers.test.ts` で、わざと固定される短い例を道具が見つけられることを確かめるようにした。設定用の契約テストには、失敗したときの見方のコメントを足した。あわせて、Task 3 の後で規約と設計書に足した項目（下の 5 の「関数の中でも読まない」）の、契約テストが見つけられる範囲の書き方を、「関数の中で読む形は検出しない」から「`getSettings(` を探す確認は見つけないが、`SETTINGS_TARGETS` のファイルでは依存の比較の確認で落ちる」に直した（その後、下の 6 でさらに直した）。Task 3 の最後の `git status --short` の期待する内容（新規）には、`src/__tests__/reactCompilerContract.helpers.test.ts` が加わる。
5. **規約の文面を、Task 3 の Step 1・2 から変えた。** 固定される理由を冒頭の段落にし、本体から呼ぶ関数の中で読む形の項目（「関数の中でも読まない」）、サーバー側のスナップショット、壊れた値を受け付ける値に直すこと、配列・オブジェクトの項目のスナップショットは、中身が前回と同じなら前回返した値を返すこと、レビューの観点（本体から呼ぶ関数が中で `getSettings()` を読んでいないか）を足した。「対象外」は、Task 3 の文面（`useState` の初期値・フォームの初期値として読む設定は対象外）から範囲を狭め、初期値として読んだ後に利用者が編集する設定（フォームの初期値）に限った。`useState` の初期値として読んでも、利用者が編集しない表示に使う設定は、対象外ではない。あわせて、`SETTINGS_TARGETS` に載せたファイルで対象外の読み方が要るときの置き場所（コンポーネント・フック以外のファイルの関数）と、レビューの観点の `useState` の初期値の項目を足した。その後のレビューで（2026年11月14日）、「ほかの項目が要るとき」に、受け付ける値の一覧を型と結び付けて持つことを足し、「契約テストに足す」と「対象外」の項目を、入れ子の箇条書きに分けた（決まりの中身は変えていない）。いまの文面は、設計書の「規約」の節と `docs/02-development/coding-standards.md` のとおり。
6. **設定用の契約テストの「依存の比較」を、件数を比べる形に変えた。** Task 2 のコード（`dependencies: string[]` と、比較が 1 件以上あることの確認）では、`SortableRoutineItem.tsx` の 2 か所の `swipeActionType={swipeAction}` のうち 1 か所だけを、関数の中で `getSettings()` を読む形に置き換えても、比較が 1 件残るので通ってしまう。`dependencies` を `{ name, comparisons }` の配列にし（`RoutineItem.tsx` は 1 件、`SortableRoutineItem.tsx` は 2 件）、`src/__tests__/reactCompilerContract.helpers.ts` に足した `countDependencyComparisons(code, dependency)` の結果と比べる。道具のテストには、2 か所のうち 1 か所だけを包んだ例（件数が 2 から 1 に減る）を足した。規約と設計書は、見つけられる範囲（置き換えは件数が減って落ちる。関数の中で読む箇所を新しく足しただけの場合と、一覧に無いファイルは守られない）に合わせて直した。その後のレビューで、件数は「値を使う箇所の数」ではなく「値に依存するメモ化のブロックの数」だとわかった（同じ JSX 要素の 2 つの属性のように、同じブロックの中にある箇所の一部だけを置き換えても、件数は変わらない）。規約・設計書・テストのコメントをこの説明に直し、守られない場合に「同じブロックの中の一部だけの置き換え」を足し、道具のテストに、同じ JSX 要素の 2 か所の例を足した。`countDependencyComparisons` は、変数名を正規表現の文字として扱わず、名前が前方一致するだけの変数と、プロパティの比較を数えない形に直した（道具のテストに、その確認を足した）。さらに後のレビューで、次の 2 つがわかった。(a) 件数は、正確には「フックの戻り値を直接の依存に持つメモ化のブロックの数」で、戻り値から求めた値（比較や三項演算子の結果）を経由して使う箇所は、数に入らない。(b) 本体で `getSettings()` を読んでも、ほかの値（props など）に依存するメモ化のブロックの中に入ると、最初の描画で 1 回だけ実行されるブロックにはならず、`getSettings(` を探す確認では見つからない。(b) のために、契約テストに「ソースに `getSettings` が書かれていない」の確認を足した（同じファイルの中の関数に包んで読む形も、ここで見つかる。最初の描画で 1 回だけ実行されるブロックの確認は、Issue #224 の形を直接確かめる確認として残した）。道具のテストには、求めた値を経由して使う例と、ほかの値に依存するブロックの中で読む例を足した。規約は、「関数の中でも読まない」を規則と対処だけにし、件数の説明を (a) に合わせて直し、契約テストが確かめることと、レビューで確かめることを「契約テストで守られる範囲」にまとめた（設計書も同じ内容に直した）。その次のレビューで、(a) の「求めた値」は、比較や三項演算子など、コンパイラがメモ化しない式で求めた値に限られるとわかった（関数の呼び出しで求めた値を経由して使う箇所は、呼び出しのブロックが戻り値を直接の依存に持つので、数に入る）。規約・設計書・テストのコメント・道具の説明をこの境目に合わせて直し、道具のテストに、関数の呼び出しで求めた値を経由して使う例を足した。規約の「契約テストで守られる範囲」は、件数が減って落ちる条件（フックの戻り値を直接の依存に持っていたブロックが、依存から外れる）を書く形に直し、規約の冒頭と、契約テストの冒頭のコメントに、(b) の場合（ほかの値が変わるまで古い値のままになる）を足した。さらに次のレビューで、この境目（比較や三項演算子は数に入らず、関数の呼び出しは数に入る）にも当てはまらない形があるとわかった（比較の結果で JSX を選ぶ箇所は数に入り、`String()` などの変換に渡す箇所と、ほかのフックの引数に渡す箇所は数に入らない）。数に入る式の形を決まりとして書くのをやめ、例を挙げて、実際の件数で確かめる書き方に直した。レビューで確かめる形は「もともと件数に入っていない箇所を置き換えた場合」に広げ、道具のテストに、`String()` に渡す例と、ほかのフックの引数に渡す例を足した（どちらも、関数に包んで読む形に置き換えると最初の描画の値に固定されるが、件数は変わらない）。その後のレビューで、`countDependencyComparisons` を、キャッシュの変数名が `$0` になる出力（コンポーネントが `$` という名前の変数を使っている場合）でも数える形に直し、道具のテストにその例を足した。続けて、数える対象を、出力の中で `const $ = _c(n)` と宣言されたキャッシュの変数との比較だけに絞り（ソースに書いた `$1[0] !== 変数名` のような比較を数えないため）、道具のテストにその例と、キャッシュの宣言が無い出力の例を足した。次のレビューで、比較の左側の境界を、プロパティの `$`（`obj.$[0]`）も数えない形に直し、道具のテストに、名前が `$` で終わる変数（`a$[0]`）とプロパティの `$` の例を足した。その後のレビューで、契約テストに、`SETTINGS_TARGETS` の `comparisons` を 1 以上で書いていることの確認を足した（0 件の登録は、件数の確認が何も守らないまま通るため）。規約と設計書には、フックの戻り値を名前のある変数に入れて、その変数名を `name` に書くことと、`comparisons` を 1 以上にすることを足し、道具のテストに、フックの戻り値を変数に入れずに使う例（比較が、コンパイラが付けた名前 `t0` との比較になり、変数名で数える件数は 0 件になる）を足した。
