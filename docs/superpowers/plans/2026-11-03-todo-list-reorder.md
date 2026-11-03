# Todoリスト管理画面でリストを並び替えられるようにする 実装プラン（Issue #193）

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development でタスクごとに新しいサブエージェントで実装し、タスクごとにレビューを挟む（実行方式はサブエージェント駆動開発に決まっている。インライン実行かどうかを聞かない）。Step はチェックボックス（`- [ ]`）で進捗を管理する。

**設計書:** `docs/superpowers/specs/2026-11-03-todo-list-reorder-design.md`

**Goal:** Todoリスト管理画面の各行にドラッグハンドルを付け、マウス・タッチ・キーボードでリストを並び替えられるようにする。順序は設定の `menuOrder` に保存し、ハンバーガーメニューと設定の「メニュー並び替え」にも同じ順で反映する。あわせて、並び替えの後に作ったリストがメニューで他のリストのすぐ後ろに出るよう、メニューの順位の扱いを広げる。

**Architecture:**

- `src/hooks/headerMenuOrder.ts` の `getMenuOrderRank` に「最後に載っているリストの直後」の判定を足す。あわせて、全メニュー項目の自然順を返す `buildMenuOrderNaturalIds` を足す。
- 純粋な関数 `reorderTodoListsInMenuOrder` は、全項目を今の順に並べた配列を作り、リストの枠だけを入れ替えた新しい `menuOrder` を返す。
- 管理画面は `menuOrder` を state に持ち（`useTodoListManagementMenuOrder`）、表示順をそこから導く（`useTodoListManagementOrder`）。
- dnd-kit の `onDragEnd` からリストの ID を受け取り、`saveMenuOrder`（`@/features/settings`）で保存する。
- 行の部品はカテゴリ管理と同じ `TodoItemDragHandle` と `useTodoDndSensors` を使う。

**Tech Stack:** Next.js 16 / React 19（React Compiler 有効）/ TypeScript / dnd-kit（`@dnd-kit/core` 6・`@dnd-kit/sortable` 10・`@dnd-kit/utilities` 3）/ Jest 30 + ts-jest + React Testing Library（jsdom）/ Storybook 10（`@storybook/nextjs-vite`）

## Global Constraints

各タスクの要件には、この節が暗黙に含まれる。

**運用（必ず守る）**

- `git commit`・`git push` をどの Step でも実行しない（コミットは後の工程で行う）。
- `git add -A`・`git add .`・`git stash`（共有の stash がある）・`git checkout`・`git restore`・`git reset` を使わない。
- 実装を一時的に壊す確認は、次の順で行う。確認のたびに `cmp` で元と一致することを確かめる。
  1. バックアップを取る: `BK="$(git rev-parse --git-dir)/reorder-backup" && mkdir -p "$BK" && cp <対象> "$BK/"`
  2. ファイルを一時的に書き換えてテストを実行し、落ちることを確かめる。
  3. 元に戻す: `cp "$BK/<ファイル名>" <対象>`
  4. 一致を確かめる: `cmp "$BK/<ファイル名>" <対象>`（出力なし・終了コード 0）
  - バックアップの置き場所はワークツリーの git の管理ディレクトリの中なので、作業ツリーにも `git status` にも出ない。
  - Bash の呼び出しごとにシェルの変数は消える。手順 3・4 の別の呼び出しでは `BK` が未定義になるので、毎回 `BK=".git/worktrees/issue-193-todo-reorder/reorder-backup"` を先頭に付ける（または絶対パスで書く）。付け忘れると `cp "/<名前>" …` になって戻せず、`cmp` が `No such file` で exit 2 になる。
- `npx prettier --write` は、その Step で明示したファイルだけに使う（`npm run format` は使わない）。複数のファイルは zsh の配列で渡す（例: `files=(a.ts b.ts) && npx prettier --write "${files[@]}"`）。
- `.env.local` や秘密の値を読む・書く・コピーしない。このワークツリーには `.env.local` が無いが、作らない（`npm run build` は無くても通る）。
- `npm --prefix firebase-functions run build` を実行しない（`lib/` を消して書き換えるため）。このプランは firebase-functions を触らない。
- `node_modules` と `firebase-functions/node_modules` は、主チェックアウト（`.`）の同名のディレクトリへのシンボリックリンクである。そのまま使う（`npm install` もしない）。
- Bash の作業ディレクトリは呼び出しごとに別のワークツリーに戻ることがある。毎回 `cd .worktrees/issue-193-todo-reorder &&` を付ける。Read・Edit・Write には絶対パスを使う。
- 既存のファイルの一部を書き換える Step のコード片（「次の行を」「次にする」の組）は、プラン自体の整形で字下げが崩れないよう `text` のコードブロックで載せている。字下げを含めてファイルのとおりなので、そのまま Edit の置換に使える。ファイルの全体を置き換えるコード片と新規のファイルは `ts`・`tsx` のコードブロックで、そのまま貼れば整形済みになる。

**検証コマンド（このワークツリー固有の事情）**

- このワークツリーは `.worktrees/` の下にあり、`jest.config.ts` の `testPathIgnorePatterns` の `"/\\.worktrees/"` で全テストが除外される。Jest は必ず `--testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` を付けて実行する。
  - テストのパスの指定は、このオプションより**前**に置く。後ろに置くと、そのパスも除外パターンとして扱われて 0 件になる。
  - `NODE_ENV=test` を付ける（シェルの `NODE_ENV=production` のままだと大量に落ちる）。
  - 書き方: `NODE_ENV=test npm test -- <テストのパス…> --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
  - 毎回、出力の `Tests:` の件数が 0 でないことを確かめる（`No tests found` は失敗として扱う）。
  - `npm test` は `cross-env TZ=Asia/Tokyo jest --forceExit` である。
- ts-jest は `isolatedModules: true` によって型を検査しない。各タスクの最後に `npm run typecheck`（`tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.test.json`。`*.stories.tsx` も対象）を必ず実行する。
  - `npm run typecheck:functions` は、firebase-functions を触らないので exit 0 であることの確認だけでよい。
- 作業前の基準（2026-11-03、origin/main a57202f のこのワークツリーで実行した結果。失敗は 0）:
  - `NODE_ENV=test npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`: `Test Suites: 1324 passed, 1324 total` / `Tests: 6815 passed, 6815 total`。
  - 作業後の判定: `FAIL` が 1 件も無い、`Tests:` に `failed` が無い、passed の件数が 6815 より増えている。
  - `npm run typecheck`: エラー 0 件（exit 0）。
  - `npm run typecheck:functions`: エラー 0 件（exit 0）。
  - `npm run lint`（`eslint --max-warnings 0`）: 出力なし（exit 0）。
  - `npm run tailwind:scan`: `No Tailwind shorthand issues found.`
- 全体のテストでは、routine の `usePageNavigationComposition.test.tsx` が並列実行で不安定に落ちることがある（単独では通る）。落ちたら、そのファイルだけを単独で実行して通ることを確かめ、記録する。
- lint は `@typescript-eslint/consistent-type-imports`（`fixStyle: "inline-type-imports"`）に従う。型だけの import は `import type { X }` か `import { type X }` にする。

**コードの規則（`docs/02-development/coding-standards.md`・`.github/copilot-instructions.md`）**

- コメント・JSDoc・テスト名は日本語。画面の文言は `src/features/todo-lists/locales/ja.json` に置く。
- クライアントコンポーネントには `"use client";` を書く。
- 機能の外への公開は、その機能の `index.ts` を通す（`saveMenuOrder` は `@/features/settings` から import する）。
- ドラッグハンドルは `TodoItemDragHandle`（`onTouchStartCapture`・`onMouseDownCapture` で伝播を止める既存の部品）をそのまま使う。`onPointerDownCapture` を足さない（PointerSensor が止まる）。
- 変えないもの:
  - リストの配列（`todo-lists`）の保存と順序。
  - `MenuOrderSection.tsx`。
  - `orderHeaderMenuItems` の中身。
  - タイトル編集の入力欄の処理（Enter・Escape・onBlur・IME）。
  - `useTodoDndSensors.ts`・`TodoItemDragHandle.tsx`。
  - firebase-functions。

---

## ファイルの構成

| ファイル                                                                                                                                                                       | 責務・変更                                                                                     | タスク |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------ |
| `src/hooks/headerMenuOrder.ts`                                                                                                                                                 | `getMenuOrderRank` に「最後に載っているリストの直後」を追加。`buildMenuOrderNaturalIds` を追加 | 1      |
| `src/features/todo-lists/todoListManagementReorder.ts`（新規）                                                                                                                 | `reorderTodoListsInMenuOrder`（並び替えた `menuOrder` を返す純粋な関数）                       | 1      |
| `src/features/settings/storage.ts`・`src/features/settings/index.ts`                                                                                                           | `saveMenuOrder` の追加と公開                                                                   | 1      |
| `src/features/todo-lists/useTodoListManagementMenuOrder.ts`（新規）                                                                                                            | `menuOrder` の state と `handleReorderLists`                                                   | 2      |
| `src/features/todo-lists/useTodoListManagementOrder.ts`                                                                                                                        | 引数に `menuOrder` を取る（`getSettings` を読まない）                                          | 2      |
| `src/features/todo-lists/useTodoListManagementDataState.ts`・`todoListManagementDataStateResult.ts`                                                                            | `menuOrder` の配線と `handleReorderLists` の公開                                               | 2      |
| `src/features/todo-lists/useTodoListManagementDragAndDrop.ts`（新規）                                                                                                          | `sensors`・`handleDragEnd`                                                                     | 2      |
| `src/features/todo-lists/TodoListManagementItem.tsx`                                                                                                                           | `useSortable` とドラッグハンドル                                                               | 2      |
| `src/features/todo-lists/TodoListManagementSortableList.tsx`（新規）                                                                                                           | `DndContext`・`SortableContext` と行の描画                                                     | 2      |
| `src/features/todo-lists/useTodoListManagementPageState.ts`・`todoListManagementPageStateResult.ts`                                                                            | `dnd` の配線と公開                                                                             | 3      |
| `src/features/todo-lists/TodoListManagementPage.tsx`                                                                                                                           | 一覧を `TodoListManagementSortableList` に置き換え                                             | 3      |
| `src/features/todo-lists/locales/ja.json`                                                                                                                                      | `management.description`                                                                       | 3      |
| `src/features/todo-lists/TodoListManagementPage.stories.tsx`                                                                                                                   | `WithHiddenList` と設定の後始末                                                                | 3      |
| `docs/04-reference/features.md`・`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-16-20-21.ts` | 説明・手動確認表（todo-lists-22）                                                              | 4      |

設計書の「タスクの分け方」との違い: 設計書は `useTodoListManagementDataState` をタスク 3 に置いている。このプランではタスク 2 に移す。`useTodoListManagementOrder` の引数を変えると、呼び出し元の `useTodoListManagementDataState` も同時に直さないと型検査が通らないため。各タスクの終わりに `npm run typecheck` と全テストが通る状態を保つ。

もう 2 点、設計書と違う。(1) 設計書は画面のテストを既存の `TodoListManagementPage.test.tsx` に足すと書いているが、プランは新しいファイル `TodoListManagementPage.reorder.test.tsx` に分ける。既存の画面のテストを本物の dnd-kit のまま残すため。(2) 設計書は配線のテストの対象に `useTodoListManagementPageState.test.tsx` を挙げているが、プランはこのファイルを変えない。PageState の配線は Composition の `toBe` と、Result・画面のテストで満たす。

---

## Task 1: ロジック（メニューの順位の扱いの拡張・自然順・並び替えの関数・`saveMenuOrder`）

**満たす設計書の節:** 「設計 › メニューの順位の扱いの拡張」「設計 › ロジック（純粋な関数）の置き場所とシグネチャ」の 1〜3、「テスト」の `headerMenuItemHelpers.test.ts`・`todoListManagementOrder.test.ts`・`headerMenuOrder.test.ts`・`todoListManagementReorder.test.ts`・`storage.test.ts`。

**Files:**

- Modify: `src/hooks/headerMenuOrder.ts`（全体を置き換え）
- Create: `src/features/todo-lists/todoListManagementReorder.ts`
- Modify: `src/features/settings/storage.ts`（`saveMenuOrder` を追加）・`src/features/settings/index.ts`（公開）
- Test（Modify）: `src/hooks/__tests__/headerMenuItemHelpers.test.ts`（末尾に `describe` を追加）・`src/features/todo-lists/__tests__/todoListManagementOrder.test.ts`（コメント 1 行）・`src/features/settings/__tests__/storage.test.ts`（import と末尾の `describe`）
- Test（Create）: `src/hooks/__tests__/headerMenuOrder.test.ts`・`src/features/todo-lists/__tests__/todoListManagementReorder.test.ts`

**Interfaces:**

- Consumes: なし（既存の `sortByMenuOrder`・`orderHeaderMenuItems`・`toTodoListMenuItemId`・`sortTodoListsByMenuOrder`・`arrayMove`・`saveSettings`・`getSettings`）
- Produces（後のタスクが使う）:
  - `buildMenuOrderNaturalIds(todoListMenuIds: string[]): string[]`（`@/hooks/headerMenuOrder`）
  - `reorderTodoListsInMenuOrder(params: { lists: TodoList[]; menuOrder: string[]; activeListId: string; overListId: string }): string[] | null`（`src/features/todo-lists/todoListManagementReorder.ts`）
  - `saveMenuOrder(menuOrder: string[]): void`（`@/features/settings`）
  - `sortByMenuOrder` のシグネチャは変えない（順位の扱いだけを広げる）

**気をつける知見:**

- 設計書「メニューの順位の扱いの拡張」: 判定は 4 段で、2（旧来の `todo-lists`）を 3（最後に載っているリスト）より先に見る。
  - `lastTodoListIndex` は `menuOrder` だけから求め、`sortByMenuOrder` の中で 1 回だけ計算する。「順位の計算は項目の数だけ」という既存のテスト（`getId` の呼び出し回数）を壊さないため。
  - 実行環境の互換のため、`Array.prototype.findLastIndex` は使わず、後ろからの `for` で探す。
- L-460: 並び替えは非表示を含む全件の `lists` で計算する。
- L-472・L-035: 添字ではなくリストの ID を受け取り、表示順は関数の中で同じ式から求め直す。
- L-541: 見つからない ID と同じ位置は `null`。移動は `arrayMove` に任せる。
- 旧来の `todo-lists` は並び替えの結果から外す（設計書の手順 2）。外し忘れると、後で作ったリストが他のリストの前に出る。
- L-453・L-669・L-476: `saveMenuOrder` は保存の直前に `getSettings()` で最新の設定を読み、`menuOrder` だけを差し替えて `saveSettings` を通す。

### 1-1: メニューの順位の扱いの拡張

- [ ] **Step 1: 失敗するテストを書く**

`src/hooks/__tests__/headerMenuItemHelpers.test.ts` のファイルの末尾（最後の `});` の後）に、次を追加する。既存の import（`orderHeaderMenuItems`・`sortByMenuOrder`・`HeaderMenuItem`）をそのまま使う。

```ts
describe("sortByMenuOrder（menuOrder に載っていない Todoリストの位置）", () => {
  const sortIds = (naturalOrderIds: string[], menuOrder: string[]) =>
    sortByMenuOrder(naturalOrderIds, (id) => id, naturalOrderIds, menuOrder);

  it("リストの ID が載っていれば、載っていないリストは最後に載っているリストの直後に出る", () => {
    expect(
      sortIds(
        ["journal", "todo-list-a", "todo-list-b", "todo-list-c", "bug-report"],
        ["todo-list-a", "todo-list-b", "journal", "bug-report"],
      ),
    ).toEqual([
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "journal",
      "bug-report",
    ]);
  });

  it("載っていないリストが複数あれば、最後に載っているリストの直後に自然順で並ぶ", () => {
    expect(
      sortIds(
        ["todo-list-a", "todo-list-b", "todo-list-c", "todo-list-d", "journal"],
        ["todo-list-a", "todo-list-b", "journal"],
      ),
    ).toEqual([
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "todo-list-d",
      "journal",
    ]);
  });

  it("基準は最初ではなく最後に載っているリストである", () => {
    expect(
      sortIds(
        ["journal", "budget", "todo-list-a", "todo-list-b", "todo-list-c"],
        ["todo-list-a", "journal", "todo-list-b", "budget"],
      ),
    ).toEqual([
      "todo-list-a",
      "journal",
      "todo-list-b",
      "todo-list-c",
      "budget",
    ]);
  });

  it("旧来の todo-lists があれば、リストの ID が載っていても今までどおり todo-lists の直後に出る", () => {
    expect(
      sortIds(
        ["journal", "todo-list-a", "todo-list-b", "todo-list-c"],
        ["todo-list-a", "todo-lists", "journal", "todo-list-b"],
      ),
    ).toEqual(["todo-list-a", "todo-list-c", "journal", "todo-list-b"]);
  });

  it("menuOrder が空なら今までどおり自然順", () => {
    expect(
      sortIds(["journal", "todo-list-a", "todo-list-b", "bug-report"], []),
    ).toEqual(["journal", "todo-list-a", "todo-list-b", "bug-report"]);
  });

  it("リストの ID が 1 つも載っていなければ、載っていないリストは今までどおり末尾に出る", () => {
    expect(
      sortIds(
        ["todo-list-a", "journal", "bug-report"],
        ["bug-report", "journal"],
      ),
    ).toEqual(["bug-report", "journal", "todo-list-a"]);
  });

  it("リスト以外の載っていない項目は今までどおり末尾に自然順で出る", () => {
    expect(
      sortIds(
        ["todo-list-a", "future-feature", "journal", "todo-list-b"],
        ["todo-list-a", "journal"],
      ),
    ).toEqual(["todo-list-a", "todo-list-b", "journal", "future-feature"]);
  });

  it("ハンバーガーメニューでも、載っていないリストは他のリストの直後で、設定より前に出る", () => {
    const staticItems: HeaderMenuItem[] = [
      { id: "home", label: "ホーム", icon: "🏠", route: "home" },
      { id: "journal", label: "ジャーナル", icon: "📔", route: "journal" },
      {
        id: "bug-report",
        label: "不具合を報告",
        icon: "📣",
        route: "bug-report",
      },
      { id: "settings", label: "設定", icon: "⚙️", route: "settings" },
    ];
    const dynamicItems: HeaderMenuItem[] = ["a", "b", "c"].map((id) => ({
      id: `todo-list-${id}`,
      label: id,
      icon: "✅",
      route: "todo-lists" as const,
    }));

    const ordered = orderHeaderMenuItems({
      staticItems,
      dynamicItems,
      menuOrder: ["todo-list-a", "todo-list-b", "journal", "bug-report"],
    }).map((item) => item.id);

    expect(ordered).toEqual([
      "home",
      "todo-list-a",
      "todo-list-b",
      "todo-list-c",
      "journal",
      "bug-report",
      "settings",
    ]);
  });
});
```

`src/features/todo-lists/__tests__/todoListManagementOrder.test.ts` の次のコメント 1 行を書き換える（期待値は変えない）。

```text
    // menuOrderに載っているb, aが先、menuOrderに無いnewは末尾（menuOrder.length + fallbackIndex）
```

を

```text
    // menuOrderに載っているb, aが先、menuOrderに無いnewは最後に載っているリスト（a）の直後
```

にする。

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/hooks/__tests__/headerMenuItemHelpers.test.ts src/features/todo-lists/__tests__/todoListManagementOrder.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。

- 落ちるテスト（5 件）: 「最後に載っているリストの直後に出る」「複数あれば…自然順で並ぶ」「基準は最初ではなく最後」「リスト以外の…」「ハンバーガーメニューでも…」。今の式では、載っていないリストが `menuOrder.length + 自然順` で末尾に回るため。「リスト以外の…」は、入力に載っていないリスト（`todo-list-b`）も含むので落ちる。
- 通るテスト（今の動作の固定）: 「旧来の todo-lists があれば…」「menuOrder が空なら…」「1 つも載っていなければ…」と、既存の 17 件・`todoListManagementOrder.test.ts` の 8 件。

- [ ] **Step 3: `headerMenuOrder.ts` を置き換える**

`src/hooks/headerMenuOrder.ts` の全体を次にする（`buildMenuOrderNaturalIds` は 1-2 で足す）。

```ts
import { menuConfig } from "@/config";
import { TODO_LIST_MENU_ID_PREFIX } from "@/hooks/dynamicTodoMenuItems";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";

const STATIC_MENU_ITEM_IDS = new Set(
  menuConfig.menuItems.map((item) => item.id),
);
const PINNED_FIRST = new Set(["home"]);
const PINNED_LAST = new Set(["settings", "account-admin"]);

const isTodoListMenuItemId = (id: string): boolean =>
  id.startsWith(TODO_LIST_MENU_ID_PREFIX) && !STATIC_MENU_ITEM_IDS.has(id);

/**
 * menuOrder の中で最後に載っている Todoリストのメニュー ID の添字（無ければ -1）。
 * 呼び出し元ごとに異なる naturalOrderIds（メニューは表示中のリストだけ、
 * 管理画面と設定画面は全リスト）ではなく menuOrder だけで決めるので、
 * どの画面でも基準の位置が同じになる。
 */
const findLastTodoListMenuItemIndex = (menuOrder: string[]): number => {
  for (let index = menuOrder.length - 1; index >= 0; index -= 1) {
    if (isTodoListMenuItemId(menuOrder[index])) return index;
  }
  return -1;
};

/**
 * 並び順の順位（小さいほど前）。
 * 1. menuOrder に載っている項目はその添字。
 * 2. 載っていない Todoリストは、旧来の "todo-lists" があればその直後。
 * 3. 旧来の "todo-lists" が無く、Todoリストの ID が載っていれば、
 *    最後に載っているリストの直後。
 * 4. それ以外は menuOrder.length + fallbackIndex（末尾に自然順）。
 *
 * 2 と 3 で足す (fallbackIndex + 1) / (totalItems + 1) は 0 より大きく 1 より
 * 小さいので、整数の添字と等しくならず、載っていない複数のリストは
 * 自然順を保つ。4 の順位は menuOrder.length 以上なので、2・3 より必ず後ろになる。
 */
const getMenuOrderRank = (
  itemId: string,
  fallbackIndex: number,
  menuOrder: string[],
  totalItems: number,
  lastTodoListIndex: number,
): number => {
  const configuredIndex = menuOrder.indexOf(itemId);
  if (configuredIndex !== -1) return configuredIndex;

  if (isTodoListMenuItemId(itemId)) {
    const offset = (fallbackIndex + 1) / (totalItems + 1);
    const legacyTodoIndex = menuOrder.indexOf("todo-lists");
    if (legacyTodoIndex !== -1) return legacyTodoIndex + offset;
    if (lastTodoListIndex !== -1) return lastTodoListIndex + offset;
  }

  return menuOrder.length + fallbackIndex;
};

export const sortByMenuOrder = <T>(
  items: T[],
  getId: (item: T) => string,
  naturalOrderIds: string[],
  menuOrder: string[],
): T[] => {
  const naturalIndexById = new Map(
    naturalOrderIds.map((id, index) => [id, index]),
  );
  const lastTodoListIndex = findLastTodoListMenuItemIndex(menuOrder);
  const decorated = items.map((item) => {
    const id = getId(item);
    return {
      item,
      rank: getMenuOrderRank(
        id,
        naturalIndexById.get(id) ?? 0,
        menuOrder,
        naturalOrderIds.length,
        lastTodoListIndex,
      ),
    };
  });

  decorated.sort((left, right) => left.rank - right.rank);
  return decorated.map(({ item }) => item);
};

type OrderHeaderMenuItemsParams = {
  staticItems: HeaderMenuItem[];
  dynamicItems: HeaderMenuItem[];
  menuOrder: string[];
};

export const orderHeaderMenuItems = ({
  staticItems,
  dynamicItems,
  menuOrder,
}: OrderHeaderMenuItemsParams): HeaderMenuItem[] => {
  const pinnedFirst = staticItems.filter((item) => PINNED_FIRST.has(item.id));
  const staticReorderable = staticItems.filter(
    (item) => !PINNED_FIRST.has(item.id) && !PINNED_LAST.has(item.id),
  );
  const pinnedLast = staticItems.filter((item) => PINNED_LAST.has(item.id));
  const reorderable = [...staticReorderable, ...dynamicItems];
  const defaultOrderIds = menuConfig.menuItems.flatMap((item) => {
    if (item.id === "todo-lists") {
      return dynamicItems.map((dynamicItem) => dynamicItem.id);
    }

    return reorderable.some((reorderableItem) => reorderableItem.id === item.id)
      ? [item.id]
      : [];
  });
  const sortedReorderable = sortByMenuOrder(
    reorderable,
    (item) => item.id,
    defaultOrderIds,
    menuOrder,
  );

  return [...pinnedFirst, ...sortedReorderable, ...pinnedLast];
};
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド。
Expected: PASS（`headerMenuItemHelpers.test.ts` の 25 件、`todoListManagementOrder.test.ts` の 8 件）。

### 1-2: 自然順と並び替えの関数

- [ ] **Step 5: 失敗するテストを書く**

新しいファイル `src/hooks/__tests__/headerMenuOrder.test.ts` を作る。

```ts
import { buildMenuOrderNaturalIds } from "@/hooks/headerMenuOrder";

const STATICS_BEFORE_LISTS = [
  "journal",
  "weight-tracker",
  "workout-tracker",
  "pomodoro",
  "worktracker",
  "meal",
  "budget",
  "weather",
  "calendar",
  "statistics",
  "preset",
];
const STATICS_AFTER_LISTS = [
  "todo-list-management",
  "sync-management",
  "bug-report",
  "test-matrix",
];

describe("buildMenuOrderNaturalIds", () => {
  it("固定の項目を除いた menuConfig の順に並べ、todo-lists の位置に渡したリストの ID をその順で入れる", () => {
    expect(buildMenuOrderNaturalIds(["todo-list-b", "todo-list-a"])).toEqual([
      ...STATICS_BEFORE_LISTS,
      "todo-list-b",
      "todo-list-a",
      ...STATICS_AFTER_LISTS,
    ]);
  });

  it("リストが 0 件ならリストの ID を含まない", () => {
    expect(buildMenuOrderNaturalIds([])).toEqual([
      ...STATICS_BEFORE_LISTS,
      ...STATICS_AFTER_LISTS,
    ]);
  });

  it("home・settings・account-admin と旧来の todo-lists を含まない", () => {
    const ids = buildMenuOrderNaturalIds(["todo-list-a"]);

    expect(ids).not.toContain("home");
    expect(ids).not.toContain("settings");
    expect(ids).not.toContain("account-admin");
    expect(ids).not.toContain("todo-lists");
  });
});
```

新しいファイル `src/features/todo-lists/__tests__/todoListManagementReorder.test.ts` を作る。

```ts
import { orderHeaderMenuItems } from "@/hooks/headerMenuOrder";
import type { HeaderMenuItem } from "@/hooks/headerMenuItemTypes";
import { sortTodoListsByMenuOrder } from "../todoListManagementOrder";
import { reorderTodoListsInMenuOrder } from "../todoListManagementReorder";
import type { TodoList } from "../types";

const list = (id: string, overrides: Partial<TodoList> = {}): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const menuId = (listId: string) => `todo-list-${listId}`;

const STATICS_BEFORE_LISTS = [
  "journal",
  "weight-tracker",
  "workout-tracker",
  "pomodoro",
  "worktracker",
  "meal",
  "budget",
  "weather",
  "calendar",
  "statistics",
  "preset",
];
const STATICS_AFTER_LISTS = [
  "todo-list-management",
  "sync-management",
  "bug-report",
  "test-matrix",
];

const STATIC_HEADER_ITEMS: HeaderMenuItem[] = [
  { id: "home", label: "ホーム", icon: "🏠", route: "home" },
  { id: "journal", label: "ジャーナル", icon: "📔", route: "journal" },
  { id: "budget", label: "家計簿", icon: "💰", route: "budget" },
  {
    id: "todo-list-management",
    label: "Todoリスト管理",
    icon: "📝",
    route: "todo-list-management",
  },
  { id: "bug-report", label: "不具合を報告", icon: "📣", route: "bug-report" },
  { id: "settings", label: "設定", icon: "⚙️", route: "settings" },
];

/** 管理画面の表示順（リストの ID）。 */
const displayedIds = (lists: TodoList[], menuOrder: string[]) =>
  sortTodoListsByMenuOrder(lists, menuOrder).map((item) => item.id);

/** ハンバーガーメニューの並び（表示中のリストだけを動的な項目として渡す）。 */
const headerIds = (lists: TodoList[], menuOrder: string[]) =>
  orderHeaderMenuItems({
    staticItems: STATIC_HEADER_ITEMS,
    dynamicItems: lists
      .filter((item) => !item.isHidden)
      .map((item) => ({
        id: menuId(item.id),
        label: item.title,
        icon: "✅",
        route: "todo-lists" as const,
      })),
    menuOrder,
  }).map((item) => item.id);

const withoutLists = (ids: string[]) =>
  ids.filter(
    (id) => !id.startsWith("todo-list-") || id === "todo-list-management",
  );

describe("reorderTodoListsInMenuOrder", () => {
  it("menuOrder が空: 末尾のリストを先頭へ移すと、リストの枠だけが入れ替わり他のメニュー項目の順は変わらない", () => {
    const lists = [list("a"), list("b"), list("c")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "c",
      overListId: "a",
    });

    expect(result).toEqual([
      ...STATICS_BEFORE_LISTS,
      menuId("c"),
      menuId("a"),
      menuId("b"),
      ...STATICS_AFTER_LISTS,
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["c", "a", "b"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, [])),
    );
    expect(headerIds(lists, result ?? [])).toEqual([
      "home",
      "journal",
      "budget",
      menuId("c"),
      menuId("a"),
      menuId("b"),
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("menuOrder が空: 先頭のリストを末尾へ移せる", () => {
    const lists = [list("a"), list("b"), list("c")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "a",
      overListId: "c",
    });

    expect(displayedIds(lists, result ?? [])).toEqual(["b", "c", "a"]);
  });

  it("設定画面で保存済み（全リストが載っている）: リストの枠だけが入れ替わり、他の要素は同じ位置に残る", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = [
      "budget",
      menuId("b"),
      "journal",
      menuId("a"),
      menuId("c"),
      "bug-report",
    ];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "b",
    });

    expect(result).toEqual([
      "budget",
      menuId("a"),
      "journal",
      menuId("b"),
      menuId("c"),
      "bug-report",
      "weight-tracker",
      "workout-tracker",
      "pomodoro",
      "worktracker",
      "meal",
      "weather",
      "calendar",
      "statistics",
      "preset",
      "todo-list-management",
      "sync-management",
      "test-matrix",
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["a", "b", "c"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("一部のリストだけが載っている: 載っていない新しいリストも並べ替えられる", () => {
    const lists = [list("a"), list("b"), list("new")];
    const menuOrder = [menuId("b"), menuId("a")];

    expect(displayedIds(lists, menuOrder)).toEqual(["b", "a", "new"]);

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "new",
      overListId: "b",
    });

    expect(result).toEqual([
      menuId("new"),
      menuId("b"),
      menuId("a"),
      ...STATICS_BEFORE_LISTS,
      ...STATICS_AFTER_LISTS,
    ]);
    expect(displayedIds(lists, result ?? [])).toEqual(["new", "b", "a"]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("旧来の todo-lists だけが載っている: 未知の ID は同じ相対位置に残り、todo-lists は結果から外れる", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = ["journal", "todo-lists", "budget", "future-feature"];

    expect(displayedIds(lists, menuOrder)).toEqual(["a", "b", "c"]);

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "c",
    });

    expect(result).toEqual([
      "journal",
      menuId("b"),
      menuId("c"),
      menuId("a"),
      "budget",
      "future-feature",
      "weight-tracker",
      "workout-tracker",
      "pomodoro",
      "worktracker",
      "meal",
      "weather",
      "calendar",
      "statistics",
      "preset",
      "todo-list-management",
      "sync-management",
      "bug-report",
      "test-matrix",
    ]);
    expect(withoutLists(headerIds(lists, result ?? []))).toEqual(
      withoutLists(headerIds(lists, menuOrder)),
    );
  });

  it("旧来の todo-lists がある menuOrder を並べ替えた後に作ったリストは、並べたリストの最後の直後に出る", () => {
    const lists = [list("a"), list("b"), list("c")];
    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: ["journal", "todo-lists", "budget", "future-feature"],
      activeListId: "a",
      overListId: "c",
    });
    const listsWithNew = [...lists, list("x")];

    expect(displayedIds(listsWithNew, result ?? [])).toEqual([
      "b",
      "c",
      "a",
      "x",
    ]);
    expect(headerIds(listsWithNew, result ?? [])).toEqual([
      "home",
      "journal",
      menuId("b"),
      menuId("c"),
      menuId("a"),
      menuId("x"),
      "budget",
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("非表示のリストが途中にあっても、結果から消えずに計算される（L-460）", () => {
    const lists = [list("a"), list("h", { isHidden: true }), list("b")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "b",
      overListId: "a",
    });

    expect(result).toEqual([
      ...STATICS_BEFORE_LISTS,
      menuId("b"),
      menuId("a"),
      menuId("h"),
      ...STATICS_AFTER_LISTS,
    ]);
    expect(headerIds(lists, result ?? [])).toEqual([
      "home",
      "journal",
      "budget",
      menuId("b"),
      menuId("a"),
      "todo-list-management",
      "bug-report",
      "settings",
    ]);
  });

  it("非表示のリスト自体も移動できる", () => {
    const lists = [list("a"), list("h", { isHidden: true }), list("b")];

    const result = reorderTodoListsInMenuOrder({
      lists,
      menuOrder: [],
      activeListId: "h",
      overListId: "a",
    });

    expect(displayedIds(lists, result ?? [])).toEqual(["h", "a", "b"]);
  });

  it.each([
    ["移動元が lists に無い", "zzz", "a"],
    ["移動先が lists に無い", "a", "zzz"],
    ["移動元と移動先が同じ", "b", "b"],
  ])("%s ときは null を返す", (_label, activeListId, overListId) => {
    expect(
      reorderTodoListsInMenuOrder({
        lists: [list("a"), list("b")],
        menuOrder: [],
        activeListId,
        overListId,
      }),
    ).toBeNull();
  });

  it("入力の lists と menuOrder を変更しない", () => {
    const lists = [list("a"), list("b"), list("c")];
    const menuOrder = [menuId("c"), "journal", menuId("a")];
    const listsCopy = [...lists];
    const menuOrderCopy = [...menuOrder];

    reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId: "a",
      overListId: "c",
    });

    expect(lists).toEqual(listsCopy);
    expect(menuOrder).toEqual(menuOrderCopy);
  });
});
```

- [ ] **Step 6: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/hooks/__tests__/headerMenuOrder.test.ts src/features/todo-lists/__tests__/todoListManagementReorder.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。`headerMenuOrder.test.ts` の 3 件が `buildMenuOrderNaturalIds is not a function` で落ちる。`todoListManagementReorder.test.ts` は `Cannot find module '../todoListManagementReorder'` でスイートごと落ちる。

- [ ] **Step 7: `buildMenuOrderNaturalIds` を足し、`todoListManagementReorder.ts` を作る**

`src/hooks/headerMenuOrder.ts` の `type OrderHeaderMenuItemsParams = {` の行の直前に、次を挿入する。

```ts
/**
 * menuOrder を全項目の配列として書き直すときの自然順。
 * menuConfig の順に、固定の項目（先頭の home・末尾の settings / account-admin）を除いて並べ、
 * "todo-lists" の位置に渡した Todoリストのメニュー ID を順に入れる。
 * 表示設定や管理者かどうかでは絞らない（絞ってもメニューに出る項目同士の相対順は変わらない）。
 */
export const buildMenuOrderNaturalIds = (todoListMenuIds: string[]): string[] =>
  menuConfig.menuItems.flatMap((item) => {
    if (item.id === "todo-lists") return todoListMenuIds;
    if (PINNED_FIRST.has(item.id) || PINNED_LAST.has(item.id)) return [];
    return [item.id];
  });
```

新しいファイル `src/features/todo-lists/todoListManagementReorder.ts`:

```ts
import { arrayMove } from "@dnd-kit/sortable";
import { toTodoListMenuItemId } from "@/hooks/dynamicTodoMenuItems";
import {
  buildMenuOrderNaturalIds,
  sortByMenuOrder,
} from "@/hooks/headerMenuOrder";
import type { TodoList } from "./types";

/** 旧来の「Todoリスト」全体の並び位置を表すメニュー ID。並び替えの結果には残さない。 */
const LEGACY_TODO_LISTS_MENU_ID = "todo-lists";

type ReorderTodoListsInMenuOrderParams = {
  /** 並べ替える前の生の配列（非表示を含む全件） */
  lists: TodoList[];
  menuOrder: string[];
  activeListId: string;
  overListId: string;
};

/**
 * Todoリスト管理画面での並び替えの結果を、新しい menuOrder として返す。
 * 移動が成り立たない（見つからない ID・同じ位置）ときは null を返す。
 *
 * 全メニュー項目を今の順に並べた配列を作り、Todoリストの枠だけを入れ替える。
 * menuOrder に載っていない項目は「menuOrder.length + 自然順」で末尾に回るので、
 * リストの ID だけを足すと他の項目の位置がずれる。全項目を書けば、
 * 他のメニュー項目の相対順と未知の ID（新しい版の端末が書いた ID・削除済みリストの ID）は変わらない。
 * 旧来の "todo-lists" は外す。残すと、後で作ったリストが他のリストの前に出るため。
 * 表示順は、管理画面・メニューと同じ sortByMenuOrder で求め直す（ID で照合する）。
 */
export const reorderTodoListsInMenuOrder = ({
  lists,
  menuOrder,
  activeListId,
  overListId,
}: ReorderTodoListsInMenuOrderParams): string[] | null => {
  const listMenuIds = lists.map((list) => toTodoListMenuItemId(list.id));
  const listMenuIdSet = new Set(listMenuIds);
  const naturalIds = buildMenuOrderNaturalIds(listMenuIds);
  const naturalIdSet = new Set(naturalIds);
  const extraIds = Array.from(new Set(menuOrder)).filter(
    (id) => !naturalIdSet.has(id) && id !== LEGACY_TODO_LISTS_MENU_ID,
  );
  const candidates = [...naturalIds, ...extraIds];
  const ordered = sortByMenuOrder(
    candidates,
    (id) => id,
    candidates,
    menuOrder,
  );
  const displayed = ordered.filter((id) => listMenuIdSet.has(id));
  const fromIndex = displayed.indexOf(toTodoListMenuItemId(activeListId));
  const toIndex = displayed.indexOf(toTodoListMenuItemId(overListId));

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return null;
  }

  const moved = arrayMove(displayed, fromIndex, toIndex);
  let movedCursor = 0;
  return ordered.map((id) => {
    if (!listMenuIdSet.has(id)) return id;
    const nextId = moved[movedCursor];
    movedCursor += 1;
    return nextId;
  });
};
```

- [ ] **Step 8: 通ることを確かめる**

Run: Step 6 と同じコマンド。
Expected: PASS（`headerMenuOrder.test.ts` の 3 件、`todoListManagementReorder.test.ts` の 12 件）。

### 1-3: `saveMenuOrder`

- [ ] **Step 9: 失敗するテストを書く**

`src/features/settings/__tests__/storage.test.ts` の 1 行目の import を次に置き換える。

```ts
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveMenuOrder,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "../storage";
```

ファイルの末尾（最後の `});` の後）に次を追加する。

```ts
describe("saveMenuOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("保存済みの他の設定を保ったまま menuOrder だけを置き換える", () => {
    localStorage.setItem(
      "app-settings",
      JSON.stringify({ theme: "dark", menuOrder: ["journal", "budget"] }),
    );

    saveMenuOrder(["budget", "journal"]);

    expect(mockSetStorageItem).toHaveBeenCalledTimes(1);
    expect(mockSetStorageItem).toHaveBeenCalledWith("app-settings", {
      ...DEFAULT_SETTINGS,
      theme: "dark",
      menuOrder: ["budget", "journal"],
    });
  });

  it("保存すると SETTINGS_UPDATED_EVENT を発火する", () => {
    const listener = jest.fn();
    window.addEventListener(SETTINGS_UPDATED_EVENT, listener);

    saveMenuOrder(["journal"]);

    window.removeEventListener(SETTINGS_UPDATED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 10: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/settings/__tests__/storage.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
Expected: FAIL。追加の 2 件が `saveMenuOrder is not a function` で落ちる。既存の 3 件は通る。

- [ ] **Step 11: `saveMenuOrder` を足して公開する**

`src/features/settings/storage.ts` の末尾（`saveSettings` の定義の後）に追加する。

```ts
/**
 * メニューの並び順（menuOrder）だけを保存する。
 * 保存の直前に最新の設定を読み、menuOrder 以外は変えない
 * （画面が持つ古い設定で他の項目を上書きしないため）。
 * saveSettings を通すので、ユーザーごとのキーと SETTINGS_UPDATED_EVENT の発火も同じになる。
 */
export const saveMenuOrder = (menuOrder: string[]): void => {
  saveSettings({ ...getSettings(), menuOrder });
};
```

`src/features/settings/index.ts` の全体を次にする。

```ts
export { SettingsPage } from "./SettingsPage";
export {
  DEFAULT_SETTINGS,
  getSettings,
  saveMenuOrder,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "./storage";
```

- [ ] **Step 12: 通ることを確かめる**

Run: Step 10 と同じコマンド。
Expected: PASS（5 件）。

### 1-4: 壊すと落ちることの確認と検証

- [ ] **Step 13: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

最初にバックアップを取る:
`cd .worktrees/issue-193-todo-reorder && BK="$(git rev-parse --git-dir)/reorder-backup" && mkdir -p "$BK" && cp src/hooks/headerMenuOrder.ts src/features/todo-lists/todoListManagementReorder.ts src/features/settings/storage.ts "$BK/"`

テストのコマンド（以下「T1」）:
`cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/hooks/__tests__/headerMenuItemHelpers.test.ts src/hooks/__tests__/headerMenuOrder.test.ts src/features/todo-lists/__tests__/todoListManagementReorder.test.ts src/features/settings/__tests__/storage.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

各項目で「書き換え → T1 → 落ちることを確認 → `cp "$BK/<ファイル名>" <対象>` で戻す → `cmp "$BK/<ファイル名>" <対象>`」を順に行う。

1. `src/hooks/headerMenuOrder.ts` の `    if (lastTodoListIndex !== -1) return lastTodoListIndex + offset;` の行を消す。
   Expected: 1-1 で落ちていた 5 件と、`todoListManagementReorder.test.ts` の「一部のリストだけが載っている…」「並べ替えた後に作ったリストは…」が落ちる。
2. `src/hooks/headerMenuOrder.ts` の `if (legacyTodoIndex !== -1) return legacyTodoIndex + offset;` と `if (lastTodoListIndex !== -1) return lastTodoListIndex + offset;` の 2 行の順を入れ替える。
   Expected: 「旧来の todo-lists があれば…」が `["todo-list-a", "journal", "todo-list-b", "todo-list-c"]` との差分で落ちる。
3. `src/features/todo-lists/todoListManagementReorder.ts` の `    (id) => !naturalIdSet.has(id) && id !== LEGACY_TODO_LISTS_MENU_ID,` を `    (id) => !naturalIdSet.has(id),` にする。
   Expected: 「旧来の todo-lists だけが載っている…」と「並べ替えた後に作ったリストは…」が落ちる。
4. `src/features/todo-lists/todoListManagementReorder.ts` の `  const listMenuIds = lists.map((list) => toTodoListMenuItemId(list.id));` を `  const listMenuIds = lists.filter((list) => !list.isHidden).map((list) => toTodoListMenuItemId(list.id));` にする。
   Expected: 「非表示のリストが途中にあっても…」と「非表示のリスト自体も移動できる」が落ちる（L-460）。
5. `src/features/todo-lists/todoListManagementReorder.ts` の `  const moved = arrayMove(displayed, fromIndex, toIndex);` を `  const moved = arrayMove(displayed, toIndex, fromIndex);` にする。
   Expected: 移動の結果を確かめるテスト（「末尾のリストを先頭へ…」「先頭のリストを末尾へ…」など）が落ちる。
6. `src/features/settings/storage.ts` の `  saveSettings({ ...getSettings(), menuOrder });` を `  saveSettings({ ...DEFAULT_SETTINGS, menuOrder });` にする。
   Expected: 「保存済みの他の設定を保ったまま…」が `theme` の差分で落ちる。

最後に戻し忘れを確かめる。次の 3 つがどれも出力なし・終了コード 0 になること。T1 を再実行して PASS になること。

- `cmp "$BK/headerMenuOrder.ts" src/hooks/headerMenuOrder.ts`
- `cmp "$BK/todoListManagementReorder.ts" src/features/todo-lists/todoListManagementReorder.ts`
- `cmp "$BK/storage.ts" src/features/settings/storage.ts`

- [ ] **Step 14: Task 1 全体を検証する**

1. 整形:
   `cd .worktrees/issue-193-todo-reorder && files=(src/hooks/headerMenuOrder.ts src/features/todo-lists/todoListManagementReorder.ts src/features/settings/storage.ts src/features/settings/index.ts src/hooks/__tests__/headerMenuItemHelpers.test.ts src/hooks/__tests__/headerMenuOrder.test.ts src/features/todo-lists/__tests__/todoListManagementReorder.test.ts src/features/todo-lists/__tests__/todoListManagementOrder.test.ts src/features/settings/__tests__/storage.test.ts) && npx prettier --write "${files[@]}"`
2. 関連のテスト:
   `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/hooks src/features/todo-lists src/features/settings --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
   Expected: 全スイート PASS（`MenuOrderSection.test.tsx`・`headerMenuItemsBuilder.test.ts` などのメニューの既存テストも通る）。
3. `npm run typecheck` → Expected: exit 0。
4. `npx eslint --max-warnings 0 src/hooks src/features/todo-lists src/features/settings` → Expected: 出力なし・exit 0。
5. `git status --short` → Expected: 変更は上の 9 ファイルだけ（新規 3 つは `??`）。ほかに、未追跡の設計書とこのプランがあってよい。

---

## Task 2: フックと部品（`menuOrder` の state・表示順・データ state・DnD のフック・行のハンドル・一覧）

**満たす設計書の節:** 「設計 › フックの構成」（`useTodoListManagementMenuOrder`・`useTodoListManagementOrder`・`useTodoListManagementDataState`・`useTodoListManagementDragAndDrop`）、「設計 › コンポーネントの構成」（`TodoListManagementSortableList`・`TodoListManagementItem`）、「設計 › ドラッグハンドルの UI と a11y」「行の中の操作との共存」「非表示のリストの扱い」、「テスト」の該当ファイル。`useTodoListManagementDataState` をこのタスクに含める理由は「ファイルの構成」の末尾を参照。

**Files:**

- Create: `src/features/todo-lists/useTodoListManagementMenuOrder.ts`・`src/features/todo-lists/useTodoListManagementDragAndDrop.ts`・`src/features/todo-lists/TodoListManagementSortableList.tsx`
- Modify: `src/features/todo-lists/useTodoListManagementOrder.ts`（全体を置き換え）・`src/features/todo-lists/useTodoListManagementDataState.ts`（全体を置き換え）・`src/features/todo-lists/todoListManagementDataStateResult.ts`（全体を置き換え）・`src/features/todo-lists/TodoListManagementItem.tsx`（全体を置き換え）
- Test（Create）: `src/features/todo-lists/__tests__/useTodoListManagementMenuOrder.test.ts`・`src/features/todo-lists/__tests__/useTodoListManagementDragAndDrop.test.ts`・`src/features/todo-lists/__tests__/TodoListManagementSortableList.test.tsx`
- Test（Modify）: `src/features/todo-lists/__tests__/useTodoListManagementOrder.test.ts`（全体を置き換え）・`src/features/todo-lists/__tests__/useTodoListManagementDataState.test.tsx`（全体を置き換え）・`src/features/todo-lists/__tests__/useTodoListManagementDataStateComposition.test.tsx`（全体を置き換え）・`src/features/todo-lists/__tests__/todoListManagementDataStateResult.test.ts`（全体を置き換え）・`src/features/todo-lists/__tests__/TodoListManagementItem.test.tsx`（末尾に 2 件）

**Interfaces:**

- Consumes（Task 1）: `reorderTodoListsInMenuOrder`・`saveMenuOrder`（`@/features/settings`）。既存の `getSettings`（`@/features/settings`）・`sortTodoListsByMenuOrder`・`useTodoDndSensors`・`TodoItemDragHandle`（props: `attributes: HTMLAttributes<HTMLButtonElement>`・`listeners: DraggableSyntheticListeners`）
- Produces（Task 3 が使う）:
  - `useTodoListManagementMenuOrder({ lists }: { lists: TodoList[] }): { menuOrder: string[]; handleReorderLists: (activeListId: string, overListId: string) => void }`
  - `useTodoListManagementOrder({ lists, menuOrder }: { lists: TodoList[]; menuOrder: string[] }): TodoList[]`
  - `useTodoListManagementDataState(...)` の返り値に `handleReorderLists: (activeListId: string, overListId: string) => void` が加わる（他は今のまま: `lists`・`handleCreate`・`handleDelete`・`handleRename`・`handleToggleVisibility`・`openList`）
  - `useTodoListManagementDragAndDrop({ onReorderLists }: { onReorderLists: (activeListId: string, overListId: string) => void }): { sensors: SensorDescriptor<SensorOptions>[]; handleDragEnd: (event: DragEndEvent) => void }`
  - `TodoListManagementSortableList`（props の型 `TodoListManagementSortableListProps` も export）。props は `lists`・`sensors`・`onDragEndAction` と、行へ渡す 9 つ（`editingListId`・`editingListTitleValue`・`onChangeTitleValueAction`・`onCommitEditAction`・`onCancelEditAction`・`onOpenListAction`・`onToggleVisibilityAction`・`onStartEditAction`・`onDeleteAction`）。すべて必須。

**気をつける知見:**

- L-060: 新しい props・引数はすべて必須にする。配線のテストは渡した値の同一性（`toBe`、関数は `toHaveBeenCalledWith` の参照の一致）で確かめる。
- L-453: 1 回の並び替えで呼ぶ更新は `setMenuOrder` と `saveMenuOrder` の 1 組だけ（state を先に変え、それから保存する。管理画面の既存の保存と同じ順）。
- 5-1 節（`docs/02-development/review-lessons.md`）: 順序の state は `menuOrder` 1 つだけ。並べ替えた後のリストの配列を別の state にしない（表示用は `useMemo` で導く）。
- L-466: `menuOrder` は画面を開いたときに `getSettings()` で 1 回読む（管理画面は開くたびに作り直される）。
- L-494: ハンドルは独立した `<button>`（`TodoItemDragHandle`）で、行全体はボタンではない（タイトルのボタンとは兄弟）。センサーは KeyboardSensor を含む `useTodoDndSensors`。
- L-473・L-474: タイトル編集の入力欄の処理（`onBlur`・Enter・Escape・`isImeComposingKeyDown`）は 1 文字も変えない。行の左側の `div` に包むだけにする。
- dnd-kit の `attributes` は `{...attributes}` でハンドルに展開され、`aria-label="並び替え"` は部品の側で後に書かれているので残る。

### 2-1: `menuOrder` の state と表示順

- [ ] **Step 1: 失敗するテストを書く**

新しいファイル `src/features/todo-lists/__tests__/useTodoListManagementMenuOrder.test.ts` を作る。

```ts
import { act, renderHook } from "@testing-library/react";

jest.mock("@/features/settings", () => ({
  getSettings: jest.fn(),
  saveMenuOrder: jest.fn(),
}));

import { getSettings, saveMenuOrder } from "@/features/settings";
import type { TodoList } from "../types";
import { useTodoListManagementMenuOrder } from "../useTodoListManagementMenuOrder";

const mockGetSettings = getSettings as jest.Mock;
const mockSaveMenuOrder = saveMenuOrder as jest.Mock;

const list = (id: string): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const STATICS_BEFORE_LISTS = [
  "journal",
  "weight-tracker",
  "workout-tracker",
  "pomodoro",
  "worktracker",
  "meal",
  "budget",
  "weather",
  "calendar",
  "statistics",
  "preset",
];
const STATICS_AFTER_LISTS = [
  "todo-list-management",
  "sync-management",
  "bug-report",
  "test-matrix",
];

const lists = [list("a"), list("b"), list("c")];

describe("useTodoListManagementMenuOrder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSettings.mockReturnValue({});
  });

  it("初期の menuOrder を getSettings から読む", () => {
    mockGetSettings.mockReturnValue({ menuOrder: ["journal", "budget"] });

    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    expect(result.current.menuOrder).toEqual(["journal", "budget"]);
  });

  it("menuOrder が未設定なら空の配列にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    expect(result.current.menuOrder).toEqual([]);
  });

  it("成り立つ移動では、新しい menuOrder を 1 回保存し、state も同じ配列にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    act(() => {
      result.current.handleReorderLists("c", "a");
    });

    const expected = [
      ...STATICS_BEFORE_LISTS,
      "todo-list-c",
      "todo-list-a",
      "todo-list-b",
      ...STATICS_AFTER_LISTS,
    ];
    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveMenuOrder).toHaveBeenCalledWith(expected);
    expect(result.current.menuOrder).toEqual(expected);
    expect(result.current.menuOrder).toBe(mockSaveMenuOrder.mock.calls[0][0]);
  });

  it.each([
    ["同じ ID", "a", "a"],
    ["lists に無い ID", "zzz", "a"],
  ])(
    "成り立たない移動（%s）では保存せず、menuOrder も変えない",
    (_label, activeListId, overListId) => {
      const { result } = renderHook(() =>
        useTodoListManagementMenuOrder({ lists }),
      );
      const before = result.current.menuOrder;

      act(() => {
        result.current.handleReorderLists(activeListId, overListId);
      });

      expect(mockSaveMenuOrder).not.toHaveBeenCalled();
      expect(result.current.menuOrder).toBe(before);
    },
  );

  it("続けて並べ替えると、2 回目は 1 回目の結果を基準にする", () => {
    const { result } = renderHook(() =>
      useTodoListManagementMenuOrder({ lists }),
    );

    act(() => {
      result.current.handleReorderLists("c", "a");
    });
    act(() => {
      result.current.handleReorderLists("b", "c");
    });

    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(2);
    expect(mockSaveMenuOrder).toHaveBeenLastCalledWith([
      ...STATICS_BEFORE_LISTS,
      "todo-list-b",
      "todo-list-c",
      "todo-list-a",
      ...STATICS_AFTER_LISTS,
    ]);
  });
});
```

`src/features/todo-lists/__tests__/useTodoListManagementOrder.test.ts` の全体を次に置き換える。

```ts
import { renderHook } from "@testing-library/react";
import type { TodoList } from "../types";
import { useTodoListManagementOrder } from "../useTodoListManagementOrder";

const list = (id: string, overrides: Partial<TodoList> = {}): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("useTodoListManagementOrder", () => {
  it("menuOrder が空のとき、元の配列順を保つ", () => {
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() =>
      useTodoListManagementOrder({ lists, menuOrder: [] }),
    );

    expect(result.current.map((l) => l.id)).toEqual(["a", "b", "c"]);
  });

  it("引数の menuOrder の順序で並び替える", () => {
    const lists = [list("a"), list("b"), list("c")];

    const { result } = renderHook(() =>
      useTodoListManagementOrder({
        lists,
        menuOrder: ["todo-list-c", "todo-list-a", "todo-list-b"],
      }),
    );

    expect(result.current.map((l) => l.id)).toEqual(["c", "a", "b"]);
  });

  it("lists が変わると並び替え結果も再計算される", () => {
    const menuOrder = ["todo-list-b", "todo-list-a"];
    const { result, rerender } = renderHook(
      ({ lists }) => useTodoListManagementOrder({ lists, menuOrder }),
      { initialProps: { lists: [list("a"), list("b")] } },
    );

    expect(result.current.map((l) => l.id)).toEqual(["b", "a"]);

    rerender({ lists: [list("a"), list("b"), list("c")] });

    expect(result.current.map((l) => l.id)).toEqual(["b", "a", "c"]);
  });

  it("menuOrder だけが変わっても並び替え結果が再計算される", () => {
    const lists = [list("a"), list("b")];
    const { result, rerender } = renderHook(
      ({ menuOrder }) => useTodoListManagementOrder({ lists, menuOrder }),
      { initialProps: { menuOrder: [] as string[] } },
    );

    expect(result.current.map((l) => l.id)).toEqual(["a", "b"]);

    rerender({ menuOrder: ["todo-list-b", "todo-list-a"] });

    expect(result.current.map((l) => l.id)).toEqual(["b", "a"]);
  });

  it("同じ lists と menuOrder の参照で再レンダーしても結果の参照が安定している（useMemo）", () => {
    const lists = [list("a"), list("b")];
    const menuOrder = ["todo-list-b"];

    const { result, rerender } = renderHook(() =>
      useTodoListManagementOrder({ lists, menuOrder }),
    );
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists/__tests__/useTodoListManagementMenuOrder.test.ts src/features/todo-lists/__tests__/useTodoListManagementOrder.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。

- `useTodoListManagementMenuOrder.test.ts` は `Cannot find module` でスイートごと落ちる。
- `useTodoListManagementOrder.test.ts` は「引数の menuOrder の順序で並び替える」「lists が変わると…」「menuOrder だけが変わっても…」が落ちる。今の実装は引数の `menuOrder` を読まず `getSettings()`（jsdom の空の LocalStorage）を読むため。「menuOrder が空のとき…」と「参照が安定」は通る。

- [ ] **Step 3: 実装する**

新しいファイル `src/features/todo-lists/useTodoListManagementMenuOrder.ts`:

```ts
import { useState } from "react";
import { getSettings, saveMenuOrder } from "@/features/settings";
import { reorderTodoListsInMenuOrder } from "./todoListManagementReorder";
import type { TodoList } from "./types";

type UseTodoListManagementMenuOrderParams = {
  /** 並べ替える前の生の配列（非表示を含む全件） */
  lists: TodoList[];
};

/**
 * Todoリスト管理画面の並び順（設定の menuOrder）を state に持ち、
 * ドラッグでの並び替えを menuOrder に保存する。
 * 表示順を決める useTodoListManagementOrder はこの menuOrder を受け取るので、
 * 並び替えの直後に表示が追いつく。
 * menuOrder は画面を開いたときに 1 回だけ読む（管理画面は開くたびに作り直される）。
 */
export const useTodoListManagementMenuOrder = ({
  lists,
}: UseTodoListManagementMenuOrderParams) => {
  const [menuOrder, setMenuOrder] = useState<string[]>(
    () => getSettings().menuOrder ?? [],
  );

  const handleReorderLists = (activeListId: string, overListId: string) => {
    const nextMenuOrder = reorderTodoListsInMenuOrder({
      lists,
      menuOrder,
      activeListId,
      overListId,
    });
    if (!nextMenuOrder) return;

    setMenuOrder(nextMenuOrder);
    saveMenuOrder(nextMenuOrder);
  };

  return { menuOrder, handleReorderLists };
};
```

`src/features/todo-lists/useTodoListManagementOrder.ts` の全体を次にする。

```ts
import { useMemo } from "react";
import { sortTodoListsByMenuOrder } from "./todoListManagementOrder";
import type { TodoList } from "./types";

type UseTodoListManagementOrderParams = {
  lists: TodoList[];
  /** useTodoListManagementMenuOrder が state に持つ menuOrder */
  menuOrder: string[];
};

/**
 * Todoリスト管理ページの表示順（ハンバーガーメニューと同じ並び順）を導出する。
 * CRUD状態管理（useTodoListManagementDataState.ts）とは責務を分離し、
 * 「menuOrder で並び替える」という関心事のみを持つ。
 * ストレージの生の並び順（作成順）自体は変更しない、表示専用の並び替え。
 *
 * menuOrder は画面の state（useTodoListManagementMenuOrder）から受け取る。
 * state の配列は更新するまで参照が変わらないので、依存配列に含めてもメモ化が効き、
 * 管理画面で並べ替えた直後にも表示が追いつく。
 */
export const useTodoListManagementOrder = ({
  lists,
  menuOrder,
}: UseTodoListManagementOrderParams): TodoList[] => {
  return useMemo(
    () => sortTodoListsByMenuOrder(lists, menuOrder),
    [lists, menuOrder],
  );
};
```

この時点で `useTodoListManagementDataState.ts` は `useTodoListManagementOrder({ lists })` のままで型検査に通らない。2-2 で直す（`npm run typecheck` は Task 2 の最後に実行する）。

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド。
Expected: PASS（`useTodoListManagementMenuOrder.test.ts` の 6 件、`useTodoListManagementOrder.test.ts` の 5 件）。

### 2-2: データ state の配線

- [ ] **Step 5: 失敗するテストを書く**

`src/features/todo-lists/__tests__/useTodoListManagementDataState.test.tsx` の全体を次に置き換える。

```tsx
import { act, renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../useTodoListManagementActionHandlers", () => ({
  useTodoListManagementActionHandlers: jest.fn(),
}));

jest.mock("../useTodoListManagementOrder", () => ({
  useTodoListManagementOrder: jest.fn(),
}));

jest.mock("../useTodoListManagementMenuOrder", () => ({
  useTodoListManagementMenuOrder: jest.fn(),
}));

import { getTodoLists } from "../storage";
import type { TodoList } from "../types";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";
import { useTodoListManagementMenuOrder } from "../useTodoListManagementMenuOrder";
import { useTodoListManagementOrder } from "../useTodoListManagementOrder";

describe("useTodoListManagementDataState", () => {
  const baseList: TodoList = {
    id: "list-1",
    title: "Inbox",
    items: [],
    createdAt: "2026-03-07T00:00:00.000Z",
    updatedAt: "2026-03-07T00:00:00.000Z",
  };
  const menuOrder = ["todo-list-list-1", "journal"];
  const handleReorderLists = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (getTodoLists as jest.Mock).mockReturnValue([baseList]);
    (useTodoListManagementOrder as jest.Mock).mockImplementation(
      ({ lists }) => lists,
    );
    (useTodoListManagementMenuOrder as jest.Mock).mockReturnValue({
      menuOrder,
      handleReorderLists,
    });
    (useTodoListManagementActionHandlers as jest.Mock).mockReturnValue({
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      openList: jest.fn(),
    });
  });

  it("初期リストを保持し action handler hook に委譲する", () => {
    const closeForm = jest.fn();
    const navigate = jest.fn();

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "買い物",
        closeForm,
        navigate,
      }),
    );

    expect(result.current.lists).toEqual([baseList]);
    expect(useTodoListManagementActionHandlers).toHaveBeenCalledWith({
      lists: [baseList],
      titleInput: "買い物",
      setLists: expect.any(Function),
      closeForm,
      navigate,
    });
    expect(result.current.handleCreate).toEqual(expect.any(Function));
    expect(result.current.openList).toEqual(expect.any(Function));
  });

  it("action handler から受け取った setter 経由で lists を更新できる", () => {
    let capturedSetLists: ((value: (typeof baseList)[]) => void) | undefined;
    (useTodoListManagementActionHandlers as jest.Mock).mockImplementation(
      ({ setLists }) => {
        capturedSetLists = setLists;
        return {
          handleCreate: jest.fn(),
          handleDelete: jest.fn(),
          handleRename: jest.fn(),
          handleToggleVisibility: jest.fn(),
          openList: jest.fn(),
        };
      },
    );

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "",
        closeForm: jest.fn(),
        navigate: jest.fn(),
      }),
    );

    act(() => {
      capturedSetLists?.([
        ...result.current.lists,
        {
          id: "list-2",
          title: "Work",
          items: [],
          createdAt: "2026-03-08T00:00:00.000Z",
          updatedAt: "2026-03-08T00:00:00.000Z",
        },
      ]);
    });

    expect(result.current.lists).toEqual([
      baseList,
      expect.objectContaining({ id: "list-2", title: "Work" }),
    ]);
  });

  it("useTodoListManagementOrderにlistsとmenuOrderを渡し、その戻り値を公開するlistsとして使う", () => {
    const listA: TodoList = { ...baseList, id: "list-a", title: "A" };
    const listB: TodoList = { ...baseList, id: "list-b", title: "B" };
    (getTodoLists as jest.Mock).mockReturnValue([listA, listB]);
    const sortedByMenuOrder = [listB, listA];
    (useTodoListManagementOrder as jest.Mock).mockReturnValue(
      sortedByMenuOrder,
    );

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "",
        closeForm: jest.fn(),
        navigate: jest.fn(),
      }),
    );

    expect(useTodoListManagementOrder).toHaveBeenCalledWith({
      lists: [listA, listB],
      menuOrder,
    });
    expect(
      (useTodoListManagementOrder as jest.Mock).mock.calls[0][0].menuOrder,
    ).toBe(menuOrder);
    expect(result.current.lists).toBe(sortedByMenuOrder);
  });

  it("並び替えは表示専用であり、action handlerとmenuOrderのフックには並び替え前の生のlistsが渡される", () => {
    const listA: TodoList = { ...baseList, id: "list-a", title: "A" };
    const listB: TodoList = { ...baseList, id: "list-b", title: "B" };
    (getTodoLists as jest.Mock).mockReturnValue([listA, listB]);
    (useTodoListManagementOrder as jest.Mock).mockReturnValue([listB, listA]);

    renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "",
        closeForm: jest.fn(),
        navigate: jest.fn(),
      }),
    );

    expect(useTodoListManagementActionHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        lists: [listA, listB],
      }),
    );
    expect(useTodoListManagementMenuOrder).toHaveBeenCalledWith({
      lists: [listA, listB],
    });
  });

  it("useTodoListManagementMenuOrderのhandleReorderListsをそのまま公開する", () => {
    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "",
        closeForm: jest.fn(),
        navigate: jest.fn(),
      }),
    );

    expect(result.current.handleReorderLists).toBe(handleReorderLists);
  });
});
```

`src/features/todo-lists/__tests__/useTodoListManagementDataStateComposition.test.tsx` の全体を次に置き換える。

```tsx
import { renderHook } from "@testing-library/react";

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../useTodoListManagementActionHandlers", () => ({
  useTodoListManagementActionHandlers: jest.fn(),
}));

jest.mock("../todoListManagementDataStateResult", () => ({
  createTodoListManagementDataStateResult: jest.fn(),
}));

jest.mock("../useTodoListManagementMenuOrder", () => ({
  useTodoListManagementMenuOrder: jest.fn(),
}));

import { getTodoLists } from "../storage";
import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";
import { useTodoListManagementActionHandlers } from "../useTodoListManagementActionHandlers";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";
import { useTodoListManagementMenuOrder } from "../useTodoListManagementMenuOrder";

describe("useTodoListManagementDataState composition", () => {
  it("lists state・action handlers・handleReorderLists を compose する", () => {
    const lists: TodoList[] = [
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    const actionHandlers = {
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      openList: jest.fn(),
    };
    const handleReorderLists = jest.fn();
    const builtResult = {
      lists,
      ...actionHandlers,
      handleReorderLists,
    };
    const closeForm = jest.fn();
    const navigate = jest.fn();

    (getTodoLists as jest.Mock).mockReturnValue(lists);
    (useTodoListManagementActionHandlers as jest.Mock).mockReturnValue(
      actionHandlers,
    );
    (useTodoListManagementMenuOrder as jest.Mock).mockReturnValue({
      menuOrder: [],
      handleReorderLists,
    });
    (createTodoListManagementDataStateResult as jest.Mock).mockReturnValue(
      builtResult,
    );

    const { result } = renderHook(() =>
      useTodoListManagementDataState({
        titleInput: "買い物",
        closeForm,
        navigate,
      }),
    );

    expect(useTodoListManagementActionHandlers).toHaveBeenCalledWith({
      lists,
      titleInput: "買い物",
      setLists: expect.any(Function),
      closeForm,
      navigate,
    });
    expect(createTodoListManagementDataStateResult).toHaveBeenCalledWith({
      actionHandlers,
      handleReorderLists,
      lists,
    });
    expect(
      (createTodoListManagementDataStateResult as jest.Mock).mock.calls[0][0]
        .handleReorderLists,
    ).toBe(handleReorderLists);
    expect(result.current).toBe(builtResult);
  });
});
```

`src/features/todo-lists/__tests__/todoListManagementDataStateResult.test.ts` の全体を次に置き換える。

```ts
import type { TodoList } from "../types";
import { createTodoListManagementDataStateResult } from "../todoListManagementDataStateResult";

describe("createTodoListManagementDataStateResult", () => {
  it("lists・action handlers・handleReorderLists の公開 shape を返す", () => {
    const lists: TodoList[] = [
      {
        id: "list-1",
        title: "Inbox",
        items: [],
        createdAt: "2026-03-07T00:00:00.000Z",
        updatedAt: "2026-03-07T00:00:00.000Z",
      },
    ];
    const actionHandlers = {
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleToggleVisibility: jest.fn(),
      openList: jest.fn(),
    };
    const handleReorderLists = jest.fn();

    const result = createTodoListManagementDataStateResult({
      lists,
      actionHandlers,
      handleReorderLists,
    });

    expect(result).toEqual({
      lists,
      ...actionHandlers,
      handleReorderLists,
    });
    expect(result.handleReorderLists).toBe(handleReorderLists);
  });
});
```

- [ ] **Step 6: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists/__tests__/useTodoListManagementDataState.test.tsx src/features/todo-lists/__tests__/useTodoListManagementDataStateComposition.test.tsx src/features/todo-lists/__tests__/todoListManagementDataStateResult.test.ts --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。

- `useTodoListManagementDataState.test.tsx`: 「…lists と menuOrder を渡し…」「…menuOrder のフックには…」「handleReorderLists をそのまま公開する」が落ちる。
- `useTodoListManagementDataStateComposition.test.tsx`: `handleReorderLists` の差分で落ちる。
- `todoListManagementDataStateResult.test.ts`: `handleReorderLists` の差分で落ちる。

- [ ] **Step 7: 実装する**

`src/features/todo-lists/todoListManagementDataStateResult.ts` の全体を次にする。

```ts
import type { TodoList } from "./types";

type ActionHandlers = ReturnType<
  typeof import("./useTodoListManagementActionHandlers").useTodoListManagementActionHandlers
>;

type CreateTodoListManagementDataStateResultArgs = {
  lists: TodoList[];
  actionHandlers: ActionHandlers;
  handleReorderLists: (activeListId: string, overListId: string) => void;
};

export const createTodoListManagementDataStateResult = ({
  lists,
  actionHandlers,
  handleReorderLists,
}: CreateTodoListManagementDataStateResultArgs) => ({
  lists,
  ...actionHandlers,
  handleReorderLists,
});
```

`src/features/todo-lists/useTodoListManagementDataState.ts` の全体を次にする。

```ts
import { useState } from "react";
import { getTodoLists } from "./storage";
import { createTodoListManagementDataStateResult } from "./todoListManagementDataStateResult";
import type { TodoList } from "./types";
import { useTodoListManagementActionHandlers } from "./useTodoListManagementActionHandlers";
import { useTodoListManagementMenuOrder } from "./useTodoListManagementMenuOrder";
import { useTodoListManagementOrder } from "./useTodoListManagementOrder";

type UseTodoListManagementDataStateParams = {
  titleInput: string;
  closeForm: () => void;
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementDataState = ({
  titleInput,
  closeForm,
  navigate,
}: UseTodoListManagementDataStateParams) => {
  const [lists, setLists] = useState<TodoList[]>(() => getTodoLists());
  // 作成・削除等の操作と並び替えの計算は、ストレージの生の並び順（lists）を基準に行う。
  // 表示だけをハンバーガーメニューと同じ並び順（menuOrder）に揃えるため、
  // action handlerには渡さず、結果として公開するlistsのみ並び替える
  // （menuOrderの保持と保存はuseTodoListManagementMenuOrder、
  // 並び替え自体はuseTodoListManagementOrderに委譲）。
  const { menuOrder, handleReorderLists } = useTodoListManagementMenuOrder({
    lists,
  });
  const sortedLists = useTodoListManagementOrder({ lists, menuOrder });
  const actionHandlers = useTodoListManagementActionHandlers({
    lists,
    titleInput,
    setLists,
    closeForm,
    navigate,
  });

  return createTodoListManagementDataStateResult({
    actionHandlers,
    handleReorderLists,
    lists: sortedLists,
  });
};
```

- [ ] **Step 8: 通ることを確かめる**

Run: Step 6 と同じコマンド。
Expected: PASS（5 件・1 件・1 件）。

### 2-3: DnD のフック・行のハンドル・一覧

- [ ] **Step 9: 失敗するテストを書く**

新しいファイル `src/features/todo-lists/__tests__/useTodoListManagementDragAndDrop.test.ts` を作る。

```ts
import type { DragEndEvent } from "@dnd-kit/core";
import { renderHook } from "@testing-library/react";
import { useTodoListManagementDragAndDrop } from "../useTodoListManagementDragAndDrop";

const dragEnd = (activeId: string, overId: string | null) =>
  ({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  }) as unknown as DragEndEvent;

describe("useTodoListManagementDragAndDrop", () => {
  it("over が null なら onReorderLists を呼ばない", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-a", null));

    expect(onReorderLists).not.toHaveBeenCalled();
  });

  it("active と over が同じなら onReorderLists を呼ばない", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-a", "list-a"));

    expect(onReorderLists).not.toHaveBeenCalled();
  });

  it("active と over が違えば (active の ID, over の ID) の順で呼ぶ", () => {
    const onReorderLists = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists }),
    );

    result.current.handleDragEnd(dragEnd("list-c", "list-a"));

    expect(onReorderLists).toHaveBeenCalledTimes(1);
    expect(onReorderLists).toHaveBeenCalledWith("list-c", "list-a");
  });

  it("sensors は Pointer・Touch・Keyboard の 3 つ", () => {
    const { result } = renderHook(() =>
      useTodoListManagementDragAndDrop({ onReorderLists: jest.fn() }),
    );

    expect(result.current.sensors).toHaveLength(3);
  });
});
```

新しいファイル `src/features/todo-lists/__tests__/TodoListManagementSortableList.test.tsx` を作る。

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import {
  TodoListManagementSortableList,
  type TodoListManagementSortableListProps,
} from "../TodoListManagementSortableList";
import type { TodoList } from "../types";

// ---------- dnd-kit モック（TodoCategorySortableList.test.tsx と同じ方針。渡した props を控える） ----------
let mockDndContextProps: { sensors?: unknown; onDragEnd?: unknown } = {};
let mockSortableItems: unknown;

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    sensors,
    onDragEnd,
  }: React.PropsWithChildren<{ sensors?: unknown; onDragEnd?: unknown }>) => {
    mockDndContextProps = { sensors, onDragEnd };
    return <>{children}</>;
  },
  closestCenter: jest.fn(),
}));
jest.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({
    children,
    items,
  }: React.PropsWithChildren<{ items: unknown }>) => {
    mockSortableItems = items;
    return <>{children}</>;
  },
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: jest.fn(),
}));
jest.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: jest.fn(() => "") } },
}));

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-a",
  title: "買い物",
  items: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const lists: TodoList[] = [
  createList({ id: "list-a", title: "買い物" }),
  createList({ id: "list-b", title: "仕事", isHidden: true }),
];
const sensors = [] as TodoListManagementSortableListProps["sensors"];

const createProps = (
  overrides: Partial<TodoListManagementSortableListProps> = {},
): TodoListManagementSortableListProps => ({
  lists,
  sensors,
  onDragEndAction: jest.fn(),
  editingListId: null,
  editingListTitleValue: "",
  onChangeTitleValueAction: jest.fn(),
  onCommitEditAction: jest.fn(),
  onCancelEditAction: jest.fn(),
  onOpenListAction: jest.fn(),
  onToggleVisibilityAction: jest.fn(),
  onStartEditAction: jest.fn(),
  onDeleteAction: jest.fn(),
  ...overrides,
});

describe("TodoListManagementSortableList", () => {
  beforeEach(() => {
    mockDndContextProps = {};
    mockSortableItems = undefined;
  });

  it("lists の順に行を表示し、各行に並び替えのボタンがある（非表示のリストも含む）", () => {
    render(<TodoListManagementSortableList {...createProps()} />);

    expect(
      screen
        .getAllByRole("button", { name: /を開く$/ })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["買い物 を開く", "仕事 を開く"]);
    expect(screen.getAllByRole("button", { name: "並び替え" })).toHaveLength(2);
  });

  it("DndContext に sensors と onDragEndAction を同じ参照のまま渡す", () => {
    const onDragEndAction = jest.fn();
    render(
      <TodoListManagementSortableList {...createProps({ onDragEndAction })} />,
    );

    expect(mockDndContextProps.sensors).toBe(sensors);
    expect(mockDndContextProps.onDragEnd).toBe(onDragEndAction);
  });

  it("SortableContext の items は lists の順の ID", () => {
    render(<TodoListManagementSortableList {...createProps()} />);

    expect(mockSortableItems).toEqual(["list-a", "list-b"]);
  });

  it("各行の開く・表示切替・編集・削除が、その行のリストを引数にして呼ばれる", () => {
    const onOpenListAction = jest.fn();
    const onToggleVisibilityAction = jest.fn();
    const onStartEditAction = jest.fn();
    const onDeleteAction = jest.fn();
    render(
      <TodoListManagementSortableList
        {...createProps({
          onOpenListAction,
          onToggleVisibilityAction,
          onStartEditAction,
          onDeleteAction,
        })}
      />,
    );

    fireEvent.click(screen.getByLabelText("仕事 を開く"));
    fireEvent.click(screen.getByLabelText("仕事 の表示切替"));
    fireEvent.click(screen.getByLabelText("仕事 を編集"));
    fireEvent.click(screen.getByLabelText("仕事 を削除"));

    expect(onOpenListAction).toHaveBeenCalledWith("list-b");
    expect(onToggleVisibilityAction).toHaveBeenCalledWith(lists[1]);
    expect(onStartEditAction).toHaveBeenCalledWith("list-b", "仕事");
    expect(onDeleteAction).toHaveBeenCalledWith(lists[1]);
  });

  it("editingListId が一致する行だけが入力欄になり、入力・確定・取り消しが props に届く", () => {
    const onChangeTitleValueAction = jest.fn();
    const onCommitEditAction = jest.fn();
    const onCancelEditAction = jest.fn();
    render(
      <TodoListManagementSortableList
        {...createProps({
          editingListId: "list-a",
          editingListTitleValue: "食料品",
          onChangeTitleValueAction,
          onCommitEditAction,
          onCancelEditAction,
        })}
      />,
    );

    const input = screen.getByDisplayValue("食料品");
    expect(screen.queryByLabelText("買い物 を開く")).not.toBeInTheDocument();
    expect(screen.getByLabelText("仕事 を開く")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "日用品" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onChangeTitleValueAction).toHaveBeenCalledWith("日用品");
    expect(onCommitEditAction).toHaveBeenCalled();
    expect(onCancelEditAction).toHaveBeenCalled();
  });
});
```

`src/features/todo-lists/__tests__/TodoListManagementItem.test.tsx` の末尾の

```text
    expect(screen.queryByLabelText("Inbox を編集")).not.toBeInTheDocument();
  });
});
```

を、次に置き換える（最後のテストの後ろに 2 件を足す）。

```text
    expect(screen.queryByLabelText("Inbox を編集")).not.toBeInTheDocument();
  });

  it("並び替え用のドラッグハンドルを表示する", () => {
    render(<TodoListManagementItem {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: "並び替え" }),
    ).toBeInTheDocument();
  });

  it("タイトルの編集中もドラッグハンドルを表示する", () => {
    render(
      <TodoListManagementItem
        {...defaultProps}
        editingListId="list-1"
        editingListTitleValue="テスト"
      />,
    );
    expect(
      screen.getByRole("button", { name: "並び替え" }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists/__tests__/useTodoListManagementDragAndDrop.test.ts src/features/todo-lists/__tests__/TodoListManagementSortableList.test.tsx src/features/todo-lists/__tests__/TodoListManagementItem.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。

- 新しい 2 ファイルは `Cannot find module` でスイートごと落ちる。
- `TodoListManagementItem.test.tsx` は追加の 2 件が `Unable to find an accessible element with the role "button" and name "並び替え"` で落ちる。既存の 12 件は通る。

- [ ] **Step 11: 実装する**

新しいファイル `src/features/todo-lists/useTodoListManagementDragAndDrop.ts`:

```ts
import { useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { useTodoDndSensors } from "./useTodoDndSensors";

type UseTodoListManagementDragAndDropParams = {
  onReorderLists: (activeListId: string, overListId: string) => void;
};

/**
 * Todoリスト管理画面の DnD のセンサーと onDragEnd を返す。
 * 表示順（menuOrder で並べた順）と配列の順が違うため、添字ではなく
 * リストの ID をそのまま渡し、位置は並び替えの関数の中で求め直す。
 * ドラッグ中の見た目は行の useSortable の isDragging で足りるので、
 * activeId は持たない。
 */
export const useTodoListManagementDragAndDrop = ({
  onReorderLists,
}: UseTodoListManagementDragAndDropParams) => {
  const sensors = useTodoDndSensors();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const activeListId = String(active.id);
      const overListId = String(over.id);
      if (activeListId === overListId) return;

      onReorderLists(activeListId, overListId);
    },
    [onReorderLists],
  );

  return { sensors, handleDragEnd };
};
```

`src/features/todo-lists/TodoListManagementItem.tsx` の全体を次にする（入力欄・タイトルのボタン・右側の操作は今のまま。外枠に `useSortable` を付け、左側を `div` で包んでハンドルを先頭に置く）。

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TodoList } from "./types";
import { isTodoListVisible } from "./todoListVisibilityPredicate";
import { ToggleSwitch } from "@/components";
import { TodoItemDragHandle } from "./TodoItemDragHandle";
import texts from "./locales/ja.json";
import { isImeComposingKeyDown } from "@/lib/isImeComposingKeyDown";

type Props = {
  list: TodoList;
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
 * 管理画面の個別リスト行（並び替えのハンドル・タイトル表示/編集・表示切替トグル・編集/削除ボタン）。
 * ドラッグはハンドル（TodoItemDragHandle）からだけ始まる。行の他の操作とは競合しない。
 */
export const TodoListManagementItem = ({
  list,
  editingListId,
  editingListTitleValue,
  onChangeTitleValueAction,
  onCommitEditAction,
  onCancelEditAction,
  onOpenListAction,
  onToggleVisibilityAction,
  onStartEditAction,
  onDeleteAction,
}: Props) => {
  const isEditing = editingListId === list.id;
  const isVisible = isTodoListVisible(list);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: list.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <TodoItemDragHandle attributes={attributes} listeners={listeners} />
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={editingListTitleValue}
            onChange={(e) => onChangeTitleValueAction(e.target.value)}
            onBlur={onCommitEditAction}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isImeComposingKeyDown(e))
                onCommitEditAction();
              if (e.key === "Escape") onCancelEditAction();
            }}
            className="flex-1 min-w-0 text-sm px-2 py-0.5 border-b-2 border-teal-400 bg-transparent text-gray-800 dark:text-gray-100 focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => onOpenListAction(list.id)}
            className={`text-sm font-medium min-w-0 break-words text-left ${
              isVisible
                ? "text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400"
                : "text-gray-400 dark:text-gray-500 line-through"
            }`}
            aria-label={`${list.title} を開く`}
          >
            ✅ {list.title}
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {isVisible
            ? texts.management.visibleLabel
            : texts.management.hiddenLabel}
        </span>
        <ToggleSwitch
          checked={isVisible}
          label={`${list.title} の表示切替`}
          onToggle={() => onToggleVisibilityAction(list)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isVisible ? "bg-teal-500" : "bg-gray-300 dark:bg-gray-500"
          }`}
          thumbClassName={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isVisible ? "translate-x-6" : "translate-x-1"
          }`}
        />
        {!isEditing && (
          <button
            type="button"
            onClick={() => onStartEditAction(list.id, list.title)}
            className="text-gray-300 hover:text-teal-500 dark:text-gray-500 dark:hover:text-teal-400 transition-colors text-base leading-none"
            aria-label={`${list.title} を編集`}
          >
            ✏️
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteAction(list)}
          className="text-gray-300 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-base leading-none ml-1"
          aria-label={`${list.title} を削除`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
```

新しいファイル `src/features/todo-lists/TodoListManagementSortableList.tsx`:

```tsx
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
```

- [ ] **Step 12: 通ることを確かめる**

Run: Step 10 と同じコマンド。
Expected: PASS（4 件・5 件・14 件）。

### 2-4: 壊すと落ちることの確認と検証

- [ ] **Step 13: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

最初にバックアップを取る:
`cd .worktrees/issue-193-todo-reorder && BK="$(git rev-parse --git-dir)/reorder-backup" && mkdir -p "$BK" && cp src/features/todo-lists/useTodoListManagementOrder.ts src/features/todo-lists/useTodoListManagementMenuOrder.ts src/features/todo-lists/useTodoListManagementDataState.ts src/features/todo-lists/useTodoListManagementDragAndDrop.ts src/features/todo-lists/TodoListManagementItem.tsx src/features/todo-lists/TodoListManagementSortableList.tsx "$BK/"`

テストのコマンド（以下「T2」）:
`cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

各項目で「書き換え → T2 → 落ちることを確認 → `cp "$BK/<ファイル名>" src/features/todo-lists/<ファイル名>` で戻す → `cmp`」を順に行う。

1. `useTodoListManagementOrder.ts` の `    [lists, menuOrder],` を `    [lists],` にする。Expected: 「menuOrder だけが変わっても…」が落ちる。
2. `useTodoListManagementMenuOrder.ts` の `    setMenuOrder(nextMenuOrder);` の行を消す。Expected: 「成り立つ移動では…state も同じ配列にする」と「続けて並べ替えると…」が落ちる。
3. `useTodoListManagementDragAndDrop.ts` の `      onReorderLists(activeListId, overListId);` を `      onReorderLists(overListId, activeListId);` にする。Expected: 「(active の ID, over の ID) の順で呼ぶ」が落ちる。
4. `useTodoListManagementDataState.ts` の `  const sortedLists = useTodoListManagementOrder({ lists, menuOrder });` を `  const sortedLists = useTodoListManagementOrder({ lists, menuOrder: [] });` にする。Expected: 「useTodoListManagementOrderにlistsとmenuOrderを渡し…」が落ちる（L-060）。
5. `TodoListManagementItem.tsx` の `        <TodoItemDragHandle attributes={attributes} listeners={listeners} />` の行を消す。Expected: `TodoListManagementItem.test.tsx` の追加の 2 件と、`TodoListManagementSortableList.test.tsx` の「各行に並び替えのボタンがある」が落ちる。
6. `TodoListManagementSortableList.tsx` の `      onDragEnd={onDragEndAction}` の行を消す。Expected: 「DndContext に sensors と onDragEndAction を同じ参照のまま渡す」が落ちる（L-060）。

最後に、6 つのファイルについて `cmp "$BK/<ファイル名>" src/features/todo-lists/<ファイル名>` がすべて出力なし・終了コード 0 になることを確かめる。T2 を再実行して PASS になること。

- [ ] **Step 14: Task 2 全体を検証する**

1. 整形:
   `cd .worktrees/issue-193-todo-reorder && files=(src/features/todo-lists/useTodoListManagementMenuOrder.ts src/features/todo-lists/useTodoListManagementOrder.ts src/features/todo-lists/useTodoListManagementDataState.ts src/features/todo-lists/todoListManagementDataStateResult.ts src/features/todo-lists/useTodoListManagementDragAndDrop.ts src/features/todo-lists/TodoListManagementItem.tsx src/features/todo-lists/TodoListManagementSortableList.tsx src/features/todo-lists/__tests__/useTodoListManagementMenuOrder.test.ts src/features/todo-lists/__tests__/useTodoListManagementOrder.test.ts src/features/todo-lists/__tests__/useTodoListManagementDataState.test.tsx src/features/todo-lists/__tests__/useTodoListManagementDataStateComposition.test.tsx src/features/todo-lists/__tests__/todoListManagementDataStateResult.test.ts src/features/todo-lists/__tests__/useTodoListManagementDragAndDrop.test.ts src/features/todo-lists/__tests__/TodoListManagementSortableList.test.tsx src/features/todo-lists/__tests__/TodoListManagementItem.test.tsx) && npx prettier --write "${files[@]}"`
2. T2 → Expected: 全スイート PASS。今の `TodoListManagementPage.test.tsx`（この時点の画面は `DndContext` の外で行を描くが、`useSortable` は既定のコンテキストで動く）と `useTodoListManagementPageState.test.tsx`（本物の `useTodoListManagementMenuOrder` が jsdom の LocalStorage を読む）も、変更なしで通る。
3. `npm run typecheck` → Expected: exit 0。
4. `npx eslint --max-warnings 0 src/features/todo-lists` → Expected: 出力なし・exit 0。
5. `git status --short` → Expected: Task 1 の 9 ファイルに加えて、この Task の 15 ファイル（新規 6 つは `??`）。`TodoListManagementPage.tsx` はまだ変えていない（一覧はまだ `lists.map` のままで、ハンドルは出るがドラッグは無効。Task 3 で配線する）。

---

## Task 3: 画面の配線と Storybook（ページの state・画面・説明文・画面のテスト・ストーリー）

**満たす設計書の節:**

- 「設計 › フックの構成」の `useTodoListManagementPageState`
- 「設計 › コンポーネントの構成」の `TodoListManagementPage.tsx`
- 「決めたこと」の説明文
- 「テスト」の配線のテスト（ページの state）・画面のテスト・説明文・Storybook

**Files:**

- Modify: `src/features/todo-lists/useTodoListManagementPageState.ts`（全体を置き換え）・`src/features/todo-lists/todoListManagementPageStateResult.ts`（全体を置き換え）・`src/features/todo-lists/TodoListManagementPage.tsx`（全体を置き換え）・`src/features/todo-lists/locales/ja.json`（`management.description` の 1 行）・`src/features/todo-lists/TodoListManagementPage.stories.tsx`（全体を置き換え）
- Test（Modify）: `src/features/todo-lists/__tests__/useTodoListManagementPageStateComposition.test.tsx`（全体を置き換え）・`src/features/todo-lists/__tests__/todoListManagementPageStateResult.test.ts`（全体を置き換え）・`src/features/todo-lists/__tests__/TodoListManagementHeader.test.tsx`（説明文の 1 か所）
- Test（Create）: `src/features/todo-lists/__tests__/TodoListManagementPage.reorder.test.tsx`

**Interfaces:**

- Consumes（Task 2）:
  - `useTodoListManagementDataState(...).handleReorderLists`
  - `useTodoListManagementDragAndDrop({ onReorderLists })` → `{ sensors, handleDragEnd }`
  - `TodoListManagementSortableList`（props はすべて必須）
- Consumes（Task 1）: `saveMenuOrder`・`DEFAULT_SETTINGS`・`getSettings`（`@/features/settings`）
- Produces:
  - `useTodoListManagementPageState(...)` の返り値に `dnd: { sensors: SensorDescriptor<SensorOptions>[]; handleDragEnd: (event: DragEndEvent) => void }` が加わる（他は今のまま）
  - 画面は `TodoListManagementSortableList` で行を描く

**気をつける知見:**

- L-060: `dnd` は必須の引数にする。配線のテストで次の 2 つを `toBe` で確かめる。
  - `onReorderLists` が `dataState.handleReorderLists` と同一であること。
  - 結果の `dnd` がフックの戻り値と同一であること。
  - あわせて、画面のテスト（本物のフックをすべて通す）で、`onDragEnd` から保存までを確かめる。
- 画面のテストで `@dnd-kit/sortable` を差し替えるときは、`...jest.requireActual("@dnd-kit/sortable")` で `arrayMove` を本物のまま残す。`todoListManagementReorder.ts` が使うので、無いと行の順のテストが TypeError で落ちる。
- L-460: 画面のテストに非表示のリストを含め、並び替えの後も行が残ることを確かめる。
- Storybook の play は CI で実行されない。DnD の操作そのものは画面のテストと手動確認（todo-lists-22）で確かめる。
- 並べ替えると Storybook の LocalStorage の `app-settings` が変わる。そのため、リストが表示されて手で並べ替えられるストーリーすべて（`WithLists`・`WithHiddenList`）で、`beforeEach` の前後に `saveSettings(DEFAULT_SETTINGS)` を呼ぶ。

### 3-1: ページの state と画面

- [ ] **Step 1: 失敗するテストを書く**

`src/features/todo-lists/__tests__/useTodoListManagementPageStateComposition.test.tsx` の全体を次に置き換える。

```tsx
import { createRef } from "react";
import { renderHook } from "@testing-library/react";

jest.mock("../todoListManagementPageStateResult", () => ({
  createTodoListManagementPageStateResult: jest.fn(),
}));

jest.mock("../todoListManagementTitleEditingBindings", () => ({
  createTodoListManagementTitleEditingBindings: jest.fn(),
}));

jest.mock("../useTodoListManagementDataState", () => ({
  useTodoListManagementDataState: jest.fn(),
}));

jest.mock("../useTodoListManagementDragAndDrop", () => ({
  useTodoListManagementDragAndDrop: jest.fn(),
}));

jest.mock("../useTodoListManagementFormFocus", () => ({
  useTodoListManagementFormFocus: jest.fn(),
}));

jest.mock("../useTodoListManagementFormState", () => ({
  useTodoListManagementFormState: jest.fn(),
}));

jest.mock("../useTodoListManagementTitleEditing", () => ({
  useTodoListManagementTitleEditing: jest.fn(),
}));

import { createTodoListManagementPageStateResult } from "../todoListManagementPageStateResult";
import { createTodoListManagementTitleEditingBindings } from "../todoListManagementTitleEditingBindings";
import { useTodoListManagementDataState } from "../useTodoListManagementDataState";
import { useTodoListManagementDragAndDrop } from "../useTodoListManagementDragAndDrop";
import { useTodoListManagementFormFocus } from "../useTodoListManagementFormFocus";
import { useTodoListManagementFormState } from "../useTodoListManagementFormState";
import { useTodoListManagementPageState } from "../useTodoListManagementPageState";
import { useTodoListManagementTitleEditing } from "../useTodoListManagementTitleEditing";

describe("useTodoListManagementPageState composition", () => {
  const handleReorderLists = jest.fn();
  const dnd = { sensors: [], handleDragEnd: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();

    (useTodoListManagementFormState as jest.Mock).mockReturnValue({
      closeForm: jest.fn(),
      inputRef: createRef<HTMLInputElement>(),
      openForm: jest.fn(),
      setTitleInput: jest.fn(),
      showForm: false,
      titleInput: "Inbox",
    });
    (useTodoListManagementDataState as jest.Mock).mockReturnValue({
      handleCreate: jest.fn(),
      handleDelete: jest.fn(),
      handleRename: jest.fn(),
      handleReorderLists,
      handleToggleVisibility: jest.fn(),
      lists: [],
      openList: jest.fn(),
    });
    (useTodoListManagementDragAndDrop as jest.Mock).mockReturnValue(dnd);
    (createTodoListManagementTitleEditingBindings as jest.Mock).mockReturnValue(
      {
        bound: true,
      },
    );
    (useTodoListManagementTitleEditing as jest.Mock).mockReturnValue({
      cancelEditListTitle: jest.fn(),
      commitEditListTitle: jest.fn(),
      editingListId: null,
      editingListTitleValue: "",
      setEditingListTitleValue: jest.fn(),
      startEditListTitle: jest.fn(),
    });
    (createTodoListManagementPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("form/data/titleEditing/result を compose する", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() =>
      useTodoListManagementPageState({ navigate }),
    );

    expect(useTodoListManagementDataState).toHaveBeenCalledWith({
      closeForm: expect.any(Function),
      navigate,
      titleInput: "Inbox",
    });
    expect(createTodoListManagementTitleEditingBindings).toHaveBeenCalledWith({
      handleRename: expect.any(Function),
    });
    expect(useTodoListManagementTitleEditing).toHaveBeenCalledWith({
      bound: true,
    });
    expect(useTodoListManagementFormFocus).toHaveBeenCalledWith({
      inputRef: expect.any(Object),
      showForm: false,
    });
    expect(createTodoListManagementPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        titleInput: "Inbox",
        showForm: false,
        lists: [],
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });

  it("DnD のフックに handleReorderLists を渡し、その戻り値を dnd として結果に渡す", () => {
    renderHook(() => useTodoListManagementPageState({ navigate: jest.fn() }));

    expect(
      (useTodoListManagementDragAndDrop as jest.Mock).mock.calls[0][0]
        .onReorderLists,
    ).toBe(handleReorderLists);
    expect(
      (createTodoListManagementPageStateResult as jest.Mock).mock.calls[0][0]
        .dnd,
    ).toBe(dnd);
  });
});
```

`src/features/todo-lists/__tests__/todoListManagementPageStateResult.test.ts` の全体を次に置き換える。

```ts
import { createRef } from "react";
import { createTodoListManagementPageStateResult } from "../todoListManagementPageStateResult";

describe("todoListManagementPageStateResult", () => {
  it("management page の公開 state を組み立てる", () => {
    const inputRef = createRef<HTMLInputElement>();
    const list = {
      id: "list-1",
      title: "Inbox",
      items: [],
      createdAt: "2026-03-07T00:00:00.000Z",
      updatedAt: "2026-03-07T00:00:00.000Z",
    };
    const closeForm = jest.fn();
    const commitEditListTitle = jest.fn();
    const cancelEditListTitle = jest.fn();
    const dnd = { sensors: [], handleDragEnd: jest.fn() };
    const handleCreate = jest.fn();
    const handleDelete = jest.fn();
    const handleToggleVisibility = jest.fn();
    const openForm = jest.fn();
    const openList = jest.fn();
    const setEditingListTitleValue = jest.fn();
    const setTitleInput = jest.fn();
    const startEditListTitle = jest.fn();

    const result = createTodoListManagementPageStateResult({
      closeForm,
      commitEditListTitle,
      cancelEditListTitle,
      dnd,
      editingListId: "list-1",
      editingListTitleValue: "Inbox",
      handleCreate,
      handleDelete,
      handleToggleVisibility,
      inputRef,
      lists: [list],
      openForm,
      openList,
      setEditingListTitleValue,
      setTitleInput,
      showForm: true,
      startEditListTitle,
      titleInput: "Inbox",
    });

    expect(result).toEqual({
      inputRef,
      lists: [list],
      showForm: true,
      titleInput: "Inbox",
      closeForm,
      dnd,
      handleCreate,
      handleDelete,
      handleToggleVisibility,
      openForm,
      openList,
      setTitleInput,
      cancelEditListTitle,
      commitEditListTitle,
      editingListId: "list-1",
      editingListTitleValue: "Inbox",
      setEditingListTitleValue,
      startEditListTitle,
    });
    expect(result.dnd).toBe(dnd);
  });
});
```

新しいファイル `src/features/todo-lists/__tests__/TodoListManagementPage.reorder.test.tsx` を作る（既存の `TodoListManagementPage.test.tsx` は本物の dnd-kit のまま残し、DnD のモックが要るテストをこのファイルに分ける）。

```tsx
import type { DragEndEvent } from "@dnd-kit/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { TodoList } from "../types";
import { TodoListManagementPage } from "../TodoListManagementPage";

// DndContext を差し替えて onDragEnd を受け取る（TodoListsPage.test.tsx と同じ方針）。
let mockOnDragEnd: ((event: DragEndEvent) => void) | undefined;

jest.mock("@dnd-kit/core", () => ({
  ...jest.requireActual("@dnd-kit/core"),
  DndContext: ({
    children,
    onDragEnd,
  }: React.PropsWithChildren<{
    onDragEnd?: (event: DragEndEvent) => void;
  }>) => {
    mockOnDragEnd = onDragEnd;
    return <>{children}</>;
  },
}));

// SortableContext だけを差し替える。arrayMove は todoListManagementReorder.ts が
// 使うので、requireActual で本物のまま残す（無いと行の順のテストが TypeError で落ちる）。
jest.mock("@dnd-kit/sortable", () => ({
  ...jest.requireActual("@dnd-kit/sortable"),
  SortableContext: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

jest.mock("@/features/routine/pages/NavigationContext", () => ({
  useNavigationContext: jest.fn(() => jest.fn()),
}));

jest.mock("../selectedTodoList", () => ({
  setSelectedTodoListId: jest.fn(),
}));

jest.mock("@/components", () => ({
  ...jest.requireActual("@/components"),
  CardPanel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("../storage", () => ({
  getTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveTodoListsToLocal: jest.fn(),
}));

jest.mock("@/features/settings", () => ({
  ...jest.requireActual("@/features/settings"),
  getSettings: jest.fn(),
  saveMenuOrder: jest.fn(),
}));

import {
  DEFAULT_SETTINGS,
  getSettings,
  saveMenuOrder,
} from "@/features/settings";
import { getTodoLists } from "../storage";
import { saveTodoListsToLocal } from "../sync";

const mockGetTodoLists = getTodoLists as jest.MockedFunction<
  typeof getTodoLists
>;
const mockSaveTodoListsToLocal = saveTodoListsToLocal as jest.MockedFunction<
  typeof saveTodoListsToLocal
>;
const mockGetSettings = getSettings as jest.MockedFunction<typeof getSettings>;
const mockSaveMenuOrder = saveMenuOrder as jest.MockedFunction<
  typeof saveMenuOrder
>;

const STATICS_BEFORE_LISTS = [
  "journal",
  "weight-tracker",
  "workout-tracker",
  "pomodoro",
  "worktracker",
  "meal",
  "budget",
  "weather",
  "calendar",
  "statistics",
  "preset",
];
const STATICS_AFTER_LISTS = [
  "todo-list-management",
  "sync-management",
  "bug-report",
  "test-matrix",
];

const createList = (
  id: string,
  title: string,
  overrides: Partial<TodoList> = {},
): TodoList => ({
  id,
  title,
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const dragEnd = (activeId: string, overId: string | null) =>
  ({
    active: { id: activeId },
    over: overId === null ? null : { id: overId },
  }) as unknown as DragEndEvent;

const rowLabels = () =>
  screen
    .getAllByRole("button", { name: /を開く$/ })
    .map((button) => button.getAttribute("aria-label"));

describe("TodoListManagementPage の並び替え", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnDragEnd = undefined;
    mockGetTodoLists.mockReturnValue([
      createList("list-a", "買い物"),
      createList("list-h", "旅行", { isHidden: true }),
      createList("list-c", "仕事"),
    ]);
    mockGetSettings.mockReturnValue({ ...DEFAULT_SETTINGS, menuOrder: [] });
  });

  it("末尾のリストを先頭のリストへドラッグすると、行の順が変わり、menuOrder だけを保存する（非表示のリストも残る）", () => {
    render(<TodoListManagementPage />);
    expect(rowLabels()).toEqual([
      "買い物 を開く",
      "旅行 を開く",
      "仕事 を開く",
    ]);
    expect(screen.getAllByRole("button", { name: "並び替え" })).toHaveLength(3);
    expect(mockOnDragEnd).toBeDefined();

    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", "list-a"));
    });

    expect(rowLabels()).toEqual([
      "仕事 を開く",
      "買い物 を開く",
      "旅行 を開く",
    ]);
    expect(mockSaveMenuOrder).toHaveBeenCalledTimes(1);
    expect(mockSaveMenuOrder).toHaveBeenCalledWith([
      ...STATICS_BEFORE_LISTS,
      "todo-list-list-c",
      "todo-list-list-a",
      "todo-list-list-h",
      ...STATICS_AFTER_LISTS,
    ]);
    expect(mockSaveTodoListsToLocal).not.toHaveBeenCalled();
  });

  it("並べ替えた後にリストを作ると、新しいリストは末尾に出て、保存する配列は作成順のまま", () => {
    render(<TodoListManagementPage />);
    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", "list-a"));
    });

    fireEvent.click(screen.getByText("＋ 新しいリストを追加"));
    fireEvent.change(screen.getByPlaceholderText("リストのタイトル"), {
      target: { value: "新規" },
    });
    fireEvent.click(screen.getByText("作成"));

    expect(rowLabels()).toEqual([
      "仕事 を開く",
      "買い物 を開く",
      "旅行 を開く",
      "新規 を開く",
    ]);
    expect(
      mockSaveTodoListsToLocal.mock.calls[0][0].map((list) => list.title),
    ).toEqual(["買い物", "旅行", "仕事", "新規"]);
  });

  it("over が無いドラッグ（一覧の外で離した）では何も保存しない", () => {
    render(<TodoListManagementPage />);
    expect(mockOnDragEnd).toBeDefined();

    act(() => {
      mockOnDragEnd?.(dragEnd("list-c", null));
    });

    expect(rowLabels()).toEqual([
      "買い物 を開く",
      "旅行 を開く",
      "仕事 を開く",
    ]);
    expect(mockSaveMenuOrder).not.toHaveBeenCalled();
  });
});
```

`src/features/todo-lists/__tests__/TodoListManagementHeader.test.tsx` の

```text
        "ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示を切り替えられます。",
```

を次にする。

```text
        "ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示の切り替えと、⠿ をドラッグしての並び替えができます。並び順はハンバーガーメニューにも反映されます。",
```

- [ ] **Step 2: 落ちることを確かめる**

Run: `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists/__tests__/useTodoListManagementPageStateComposition.test.tsx src/features/todo-lists/__tests__/todoListManagementPageStateResult.test.ts src/features/todo-lists/__tests__/TodoListManagementPage.reorder.test.tsx src/features/todo-lists/__tests__/TodoListManagementHeader.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

Expected: FAIL。

- `useTodoListManagementPageStateComposition.test.tsx`: 「DnD のフックに handleReorderLists を渡し…」が落ちる（`mock.calls[0]` が `undefined`）。
- `todoListManagementPageStateResult.test.ts`: `dnd` の差分で落ちる。
- `TodoListManagementPage.reorder.test.tsx`: 3 件とも落ちる。今の画面は `DndContext` を使わないので `mockOnDragEnd` が `undefined` のまま、行の順も変わらない。
- `TodoListManagementHeader.test.tsx`: 説明文のテストが落ちる。

- [ ] **Step 3: 実装する**

`src/features/todo-lists/todoListManagementPageStateResult.ts` の全体を次にする。

```ts
import type { RefObject } from "react";
import type {
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import type { TodoList } from "./types";

type TodoListManagementDnd = {
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
};

type TodoListManagementPageStateResultArgs = {
  closeForm: () => void;
  commitEditListTitle: () => void;
  cancelEditListTitle: () => void;
  dnd: TodoListManagementDnd;
  editingListId: string | null;
  editingListTitleValue: string;
  handleCreate: () => void;
  handleDelete: (list: TodoList) => void;
  handleToggleVisibility: (list: TodoList) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  lists: TodoList[];
  openForm: () => void;
  openList: (listId: string) => void;
  setEditingListTitleValue: (value: string) => void;
  setTitleInput: (value: string) => void;
  showForm: boolean;
  startEditListTitle: (listId: string, currentTitle: string) => void;
  titleInput: string;
};

export const createTodoListManagementPageStateResult = ({
  closeForm,
  commitEditListTitle,
  cancelEditListTitle,
  dnd,
  editingListId,
  editingListTitleValue,
  handleCreate,
  handleDelete,
  handleToggleVisibility,
  inputRef,
  lists,
  openForm,
  openList,
  setEditingListTitleValue,
  setTitleInput,
  showForm,
  startEditListTitle,
  titleInput,
}: TodoListManagementPageStateResultArgs) => {
  return {
    inputRef,
    lists,
    showForm,
    titleInput,
    closeForm,
    dnd,
    handleCreate,
    handleDelete,
    handleToggleVisibility,
    openForm,
    openList,
    setTitleInput,
    cancelEditListTitle,
    commitEditListTitle,
    editingListId,
    editingListTitleValue,
    setEditingListTitleValue,
    startEditListTitle,
  };
};
```

`src/features/todo-lists/useTodoListManagementPageState.ts` の全体を次にする。

```ts
import { useTodoListManagementFormFocus } from "./useTodoListManagementFormFocus";
import { useTodoListManagementFormState } from "./useTodoListManagementFormState";
import { useTodoListManagementDataState } from "./useTodoListManagementDataState";
import { useTodoListManagementDragAndDrop } from "./useTodoListManagementDragAndDrop";
import { createTodoListManagementPageStateResult } from "./todoListManagementPageStateResult";
import { createTodoListManagementTitleEditingBindings } from "./todoListManagementTitleEditingBindings";
import { useTodoListManagementTitleEditing } from "./useTodoListManagementTitleEditing";

type UseTodoListManagementPageStateParams = {
  navigate: (page: "todo-lists") => void;
};

export const useTodoListManagementPageState = ({
  navigate,
}: UseTodoListManagementPageStateParams) => {
  const { closeForm, inputRef, openForm, setTitleInput, showForm, titleInput } =
    useTodoListManagementFormState();
  const dataState = useTodoListManagementDataState({
    titleInput,
    closeForm,
    navigate,
  });
  const dnd = useTodoListManagementDragAndDrop({
    onReorderLists: dataState.handleReorderLists,
  });
  const titleEditing = useTodoListManagementTitleEditing(
    createTodoListManagementTitleEditingBindings({
      handleRename: dataState.handleRename,
    }),
  );

  useTodoListManagementFormFocus({ inputRef, showForm });

  return createTodoListManagementPageStateResult({
    inputRef,
    lists: dataState.lists,
    showForm,
    titleInput,
    closeForm,
    dnd,
    handleCreate: dataState.handleCreate,
    handleDelete: dataState.handleDelete,
    handleToggleVisibility: dataState.handleToggleVisibility,
    openForm,
    openList: dataState.openList,
    setTitleInput,
    cancelEditListTitle: titleEditing.cancelEditListTitle,
    commitEditListTitle: titleEditing.commitEditListTitle,
    editingListId: titleEditing.editingListId,
    editingListTitleValue: titleEditing.editingListTitleValue,
    setEditingListTitleValue: titleEditing.setEditingListTitleValue,
    startEditListTitle: titleEditing.startEditListTitle,
  });
};
```

`src/features/todo-lists/TodoListManagementPage.tsx` の全体を次にする。

```tsx
"use client";

import { CardPanel } from "@/components";
import { useNavigationContext } from "@/features/routine/pages/NavigationContext";
import { useTodoListManagementPageState } from "./useTodoListManagementPageState";
import { TodoListCreateForm } from "./TodoListCreateForm";
import { TodoListManagementSortableList } from "./TodoListManagementSortableList";
import { TodoListManagementHeader } from "./TodoListManagementHeader";
import { TodoListManagementEmptyState } from "./TodoListManagementEmptyState";
import texts from "./locales/ja.json";

export const TodoListManagementPage = () => {
  const navigate = useNavigationContext();
  const {
    editingListId,
    editingListTitleValue,
    inputRef,
    lists,
    showForm,
    titleInput,
    cancelEditListTitle,
    closeForm,
    commitEditListTitle,
    dnd: { sensors, handleDragEnd },
    handleCreate,
    handleDelete,
    handleToggleVisibility,
    openForm,
    openList,
    setEditingListTitleValue,
    setTitleInput,
    startEditListTitle,
  } = useTodoListManagementPageState({ navigate });

  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-100 dark:from-slate-400 dark:to-slate-300">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <CardPanel>
          <TodoListManagementHeader
            showForm={showForm}
            onOpenFormAction={openForm}
          />

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => navigate("todo-category-management")}
              className="text-sm text-teal-600 dark:text-teal-800 hover:underline"
            >
              {texts.list.manageCategoriesLabel}
            </button>
          </div>

          {showForm && (
            <TodoListCreateForm
              inputRef={inputRef}
              titleInput={titleInput}
              onChangeTitleAction={setTitleInput}
              onCreateAction={handleCreate}
              onCancelAction={closeForm}
            />
          )}

          {lists.length === 0 && !showForm ? (
            <TodoListManagementEmptyState />
          ) : (
            <TodoListManagementSortableList
              lists={lists}
              sensors={sensors}
              onDragEndAction={handleDragEnd}
              editingListId={editingListId}
              editingListTitleValue={editingListTitleValue}
              onChangeTitleValueAction={setEditingListTitleValue}
              onCommitEditAction={commitEditListTitle}
              onCancelEditAction={cancelEditListTitle}
              onOpenListAction={openList}
              onToggleVisibilityAction={handleToggleVisibility}
              onStartEditAction={startEditListTitle}
              onDeleteAction={handleDelete}
            />
          )}
        </CardPanel>
      </main>
    </div>
  );
};
```

`src/features/todo-lists/locales/ja.json` の `management` の次の 1 行を

```text
    "description": "ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示を切り替えられます。",
```

次にする。

```text
    "description": "ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示の切り替えと、⠿ をドラッグしての並び替えができます。並び順はハンバーガーメニューにも反映されます。",
```

- [ ] **Step 4: 通ることを確かめる**

Run: Step 2 と同じコマンド。
Expected: PASS（2 件・1 件・3 件・5 件）。

### 3-2: Storybook

- [ ] **Step 5: ストーリーを足す**

`src/features/todo-lists/TodoListManagementPage.stories.tsx` の全体を次にする。

```tsx
import type { Decorator, Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { NavigationContextProvider } from "@/features/routine/pages/NavigationContext";
import { DEFAULT_SETTINGS, saveSettings } from "@/features/settings/storage";
import { saveTodoLists } from "./storage";
import { sampleTodoLists } from "./__fixtures__/todoListFixtures";
import { TodoListManagementPage } from "./TodoListManagementPage";
import type { TodoList } from "./types";

// TodoListManagementPage は useNavigationContext() を内部で呼び出すため
// NavigationContextProvider デコレーターで navigate 関数を注入する。
// localStorage が空のとき空一覧（emptyMessage）が表示される。
// WithLists ではサンプルリストを beforeEach で設定してリスト一覧が表示された状態を確認できる。
// リストが表示されるストーリーでは、⠿ のハンドルで手で並べ替えると app-settings の
// menuOrder が変わる。他のストーリー（設定画面のメニュー並び替えなど）に残さないよう、
// 前後で saveSettings(DEFAULT_SETTINGS) を呼んで戻す。

const withNavigationContext: Decorator = (Story) => (
  <NavigationContextProvider value={fn()}>
    <Story />
  </NavigationContextProvider>
);

const hiddenTodoList: TodoList = {
  id: "list-hidden",
  title: "旅行の準備",
  items: [],
  createdAt: "2026-01-03T00:00:00+09:00",
  updatedAt: "2026-01-03T00:00:00+09:00",
  isHidden: true,
};

const meta = {
  title: "Features/TodoLists/TodoListManagementPage",
  component: TodoListManagementPage,
  parameters: { layout: "fullscreen" },
  decorators: [withNavigationContext],
} satisfies Meta<typeof TodoListManagementPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach() {
    saveTodoLists([]);
    return () => saveTodoLists([]);
  },
};

export const WithLists: Story = {
  beforeEach() {
    saveTodoLists(sampleTodoLists);
    saveSettings(DEFAULT_SETTINGS);
    return () => {
      saveTodoLists([]);
      saveSettings(DEFAULT_SETTINGS);
    };
  },
};

/** 非表示のリストを含む一覧。各行の ⠿ で並べ替えられる（非表示のリストも並べられる） */
export const WithHiddenList: Story = {
  beforeEach() {
    saveTodoLists([...sampleTodoLists, hiddenTodoList]);
    saveSettings(DEFAULT_SETTINGS);
    return () => {
      saveTodoLists([]);
      saveSettings(DEFAULT_SETTINGS);
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 非表示のリストを含むすべての行に並び替えのハンドルがある
    expect(canvas.getAllByRole("button", { name: "並び替え" })).toHaveLength(
      sampleTodoLists.length + 1,
    );
    expect(
      canvas.getByRole("button", { name: "旅行の準備 を開く" }),
    ).toBeTruthy();
  },
};

/** 「＋ 新しいリストを追加」ボタンをクリック → フォームが開く */
export const ClickAddList: Story = {
  beforeEach() {
    saveTodoLists([]);
    return () => saveTodoLists([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByRole("button", {
      name: /新しいリストを追加/,
    });
    await userEvent.click(addButton);
    // フォームが開き、タイトル入力欄が表示される
    expect(canvas.getByPlaceholderText("リストのタイトル")).toBeTruthy();
  },
};
```

### 3-3: 壊すと落ちることの確認と検証

- [ ] **Step 6: 実装を一時的に書き換えるとテストが落ちることを確かめ、元に戻す**

最初にバックアップを取る:
`cd .worktrees/issue-193-todo-reorder && BK="$(git rev-parse --git-dir)/reorder-backup" && mkdir -p "$BK" && cp src/features/todo-lists/useTodoListManagementPageState.ts src/features/todo-lists/TodoListManagementPage.tsx "$BK/"`

テストのコマンド（以下「T3」）:
`cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/todo-lists --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`

1. `useTodoListManagementPageState.ts` の `    onReorderLists: dataState.handleReorderLists,` を `    onReorderLists: () => {},` にする。Expected: 「DnD のフックに handleReorderLists を渡し…」と、`TodoListManagementPage.reorder.test.tsx` の 1・2 件目が落ちる（L-060）。`cp "$BK/useTodoListManagementPageState.ts" src/features/todo-lists/useTodoListManagementPageState.ts` で戻し、`cmp` で一致を確かめる。
2. `TodoListManagementPage.tsx` の `              onDragEndAction={handleDragEnd}` を `              onDragEndAction={() => {}}` にする。Expected: `TodoListManagementPage.reorder.test.tsx` の 1・2 件目が落ちる（行の順が変わらない）。`cp "$BK/TodoListManagementPage.tsx" src/features/todo-lists/TodoListManagementPage.tsx` で戻し、`cmp` で一致を確かめる。

最後に `cmp "$BK/useTodoListManagementPageState.ts" src/features/todo-lists/useTodoListManagementPageState.ts` と `cmp "$BK/TodoListManagementPage.tsx" src/features/todo-lists/TodoListManagementPage.tsx` が出力なし・終了コード 0 になること。T3 を再実行して PASS になること。

- [ ] **Step 7: Task 3 全体を検証する**

1. 整形:
   `cd .worktrees/issue-193-todo-reorder && files=(src/features/todo-lists/useTodoListManagementPageState.ts src/features/todo-lists/todoListManagementPageStateResult.ts src/features/todo-lists/TodoListManagementPage.tsx src/features/todo-lists/locales/ja.json src/features/todo-lists/TodoListManagementPage.stories.tsx src/features/todo-lists/__tests__/useTodoListManagementPageStateComposition.test.tsx src/features/todo-lists/__tests__/todoListManagementPageStateResult.test.ts src/features/todo-lists/__tests__/TodoListManagementPage.reorder.test.tsx src/features/todo-lists/__tests__/TodoListManagementHeader.test.tsx) && npx prettier --write "${files[@]}"`
2. T3 → Expected: 全スイート PASS（既存の `TodoListManagementPage.test.tsx`・`useTodoListManagementPageState.test.tsx` も通る）。
3. `npm run typecheck` → Expected: exit 0（ストーリーも対象）。
4. `npx eslint --max-warnings 0 src/features/todo-lists` → Expected: 出力なし・exit 0。
5. `git status --short` → Expected: Task 1・2 のファイルに加えて、この Task の 9 ファイル（新規 1 つは `??`）。

---

## Task 4: ドキュメント・手動確認表・最終検証

**満たす設計書の節:** 「ドキュメントと確認表の更新」（`features.md`・手動確認表の 3 か所）、「テスト」の全体の検証。

**Files:**

- Modify: `docs/04-reference/features.md`（3 か所）
- Modify: `docs/03-testing/test-matrix.md`（1 行を追加）
- Modify: `src/features/test-matrix/initialData.ts`（項目を 1 つ追加）
- Modify: `src/features/test-matrix/detailed-test-cases/group-16-20-21.ts`（詳細ケースを追加）

**Interfaces:**

- Consumes: Task 1〜3 の実装（説明の内容がそれに合っていること）
- Produces: 手動確認表の新しい項目 `todo-lists-22`。詳細ケースは `todo-lists-22-1`〜`todo-lists-22-7`。

**気をつける知見:**

- 既存の ID を変えない・振り直さない。`todo-lists-21` は `test-matrix.md` にだけあり、`initialData.ts` には無い。これは既知の不整合で、今回は足さない。
- `initialData.ts` の項目は `pc`・`sp` が `"unchecked"`、`note` が `""` でなければならない（`initialData.test.ts` が固定している）。
- 詳細ケースの `pc`・`sp` はすべて `"unchecked"` にする。PC だけで確かめるケースもシナリオの文に（PC）と書くだけにし、`sp` は `"unchecked"` のままにする。`note` は 22-2 だけ文を入れ、他は `""`。
- 詳細ケースの ID は「項目 ID-連番」（`detailedTestCases.test.ts` が接頭辞と重複を確かめる）。
- L-203（型・説明・確認表を実装に合わせる）: `features.md` の「ドラッグ＆ドロップによるリスト自体の並び替え」は、これまで実装の無い説明だった。実装に合わせて書き直す。

- [ ] **Step 1: `features.md` を直す**

`docs/04-reference/features.md` の 3 か所を書き換える。

1. 「📝 Todoリスト管理」の次の行を

```text
  - ドラッグ＆ドロップによるリスト自体の並び替え
```

次にする。

```text
  - リスト自体の並び替え（各行の ⠿ ハンドルをマウス・タッチでドラッグ、またはキーボードで Tab でハンドルへ移り Space → ↑↓ → Space、Escape で取り消し）。非表示のリストも並べられ、並び順はハンバーガーメニューと設定の「メニュー並び替え」にも反映される
```

2. 同じ節の「技術仕様」の

```text
- ファイル: `src/features/todo-lists/`（`useTodoListManagementPageState.ts` 等）
- データ保存: LocalStorage（キー: `todo-lists`, `todo-categories`）
- Firestore同期対応
```

を次にする。

```text
- ファイル: `src/features/todo-lists/`（`useTodoListManagementPageState.ts` 等）
- データ保存: LocalStorage（キー: `todo-lists`, `todo-categories`）
- リストの並び順: 設定（`app-settings`）の `menuOrder` に保存する（ハンバーガーメニューと共有）。`todo-lists` の配列の順（作成順）は変えない
- Firestore同期対応
```

3. 設定画面の「🔀 メニュー並び替え」の

```text
- **🔀 メニュー並び替え** (`MenuOrderSection`)
  - ドラッグ＆ドロップでメニュー項目の並び順を自由にカスタマイズ
```

を次にする。

```text
- **🔀 メニュー並び替え** (`MenuOrderSection`)
  - ドラッグ＆ドロップでメニュー項目の並び順を自由にカスタマイズ
  - Todoリストの順はTodoリスト管理画面でも並べ替えられる（同じ `menuOrder` を共有）。並び替えの後に作ったTodoリストは、他のTodoリストのすぐ後ろに出る
```

- [ ] **Step 2: `test-matrix.md` に項目を足す**

`docs/03-testing/test-matrix.md` の「16. Todoリスト」の表で、`| todo-lists-21 |` で始まる行のすぐ下に、次の 1 行を足す（列の幅は Step 5 の prettier で揃える）。

```text
| todo-lists-22 | Todoリストの並び替え（Todoリスト管理） | 🔶 | ⬜ | ⬜ | ドラッグハンドル（マウス・タッチ・キーボード）。順はハンバーガーメニューと連動 |
```

- [ ] **Step 3: `initialData.ts` に項目を足す**

`src/features/test-matrix/initialData.ts` の次の部分（`todo-lists` カテゴリの最後の項目）を

```text
      {
        id: "todo-lists-20",
        label: "スワイプ操作によるインデント（SP）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

次にする。

```text
      {
        id: "todo-lists-20",
        label: "スワイプ操作によるインデント（SP）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
      {
        id: "todo-lists-22",
        label: "Todoリストの並び替え（Todoリスト管理）",
        pc: "unchecked",
        sp: "unchecked",
        note: "",
      },
```

- [ ] **Step 4: 詳細ケースを足す**

`src/features/test-matrix/detailed-test-cases/group-16-20-21.ts` の `"todo-lists-20": [` の配列の閉じ（`"20-1": [` の直前）に、次の `"todo-lists-22"` を挿入する。挿入する位置は、次の部分の `  ],` と `  "20-1": [` の間である。

```text
    {
      id: "todo-lists-20-2",
      scenario: "SP: 最大インデント（3）のアイテムを右スワイプ",
      expected: "スワイプが無効のためインデントは変化しない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
  "20-1": [
```

挿入するもの:

```text
  "todo-lists-22": [
    {
      id: "todo-lists-22-1",
      scenario:
        "リストを3件以上作り、Todoリスト管理画面で末尾のリストのハンドル（⠿）をマウスでドラッグして先頭へ置く",
      expected:
        "画面の順が変わる。ハンバーガーメニューのTodoリストも同じ順になり、再読み込みしても順が保たれる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "todo-lists-22-2",
      scenario:
        "スマホ（Android の Chrome・iPhone の Safari）で、ハンドルを指で押したまま上下に動かして置く。ハンドル以外の部分を上下になぞる",
      expected:
        "ハンドルからは並び替わる。ハンドル以外をなぞると画面がスクロールし、ドラッグは始まらない",
      pc: "unchecked",
      sp: "unchecked",
      note: "同じ Android の端末で todo-lists-12-1（リストの中のアイテムの並び替え）も確かめる。リストの中のアイテムがタッチで並び替えられないという別の解釈を、実機の結果で退けるため",
    },
    {
      id: "todo-lists-22-3",
      scenario:
        "Tab でハンドルにフォーカスし、Space → ↓ → Space で1つ下へ移す。続けて Space → ↓ → Escape を押す",
      expected:
        "最初の操作で1つ下へ移る。Escape で終えた操作では元の位置に戻る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "todo-lists-22-4",
      scenario:
        "非表示のリストを含めて並び替え、その後そのリストを表示に切り替える",
      expected:
        "非表示のリストは消えずに並べた位置に残る。表示に戻すと、並べた位置でハンバーガーメニューに出る",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "todo-lists-22-5",
      scenario: "並び替えの後に設定画面の「メニュー並び替え」を開く",
      expected:
        "Todoリストが同じ順で並ぶ。ジャーナル・家計簿など他の項目の並びは、並び替えの前と変わらない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "todo-lists-22-6",
      scenario:
        "（PC）タイトルを編集している途中で、別のリストのハンドルをマウスで掴んで並び替える",
      expected: "編集中のタイトルが確定・保存され、その後に並び替わる",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
    {
      id: "todo-lists-22-7",
      scenario: "並び替えの後に、新しいリストを作る",
      expected:
        "管理画面では末尾に出る。ハンバーガーメニューと設定画面の「メニュー並び替え」でも他のTodoリストのすぐ後ろに出て、「不具合を報告」など他のメニュー項目の後ろ（最下部）には出ない",
      pc: "unchecked",
      sp: "unchecked",
      note: "",
    },
  ],
```

- [ ] **Step 5: 整形とこの Task のテスト**

1. 整形:
   `cd .worktrees/issue-193-todo-reorder && files=(docs/04-reference/features.md docs/03-testing/test-matrix.md src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-16-20-21.ts) && npx prettier --write "${files[@]}"`
2. `git diff --stat -- docs/03-testing/test-matrix.md` → Expected: `1 insertion(+)` だけ（prettier が既存の行を書き換えていない）。書き換えていたら、表の列の幅が変わっていないか差分を確かめる。
3. `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- src/features/test-matrix --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` → Expected: 全スイート PASS（`initialData.test.ts`・`detailedTestCases.test.ts`・`storage.test.ts`〔旧 ID の救済は `16-1`〜`16-20` だけで、`todo-lists-22` に影響しない〕）。
4. 網羅の確認:
   - `grep -c "todo-lists-22" docs/03-testing/test-matrix.md src/features/test-matrix/initialData.ts src/features/test-matrix/detailed-test-cases/group-16-20-21.ts` → Expected: それぞれ `1`・`1`・`8`（詳細ケースは項目のキー 1 つとケース 7 つ）。
   - `grep -c '"todo-lists-21"' src/features/test-matrix/initialData.ts` → Expected: `0`（既存の不整合のまま）。

- [ ] **Step 6: 全体の検証**

1. 全体のテスト:
   `cd .worktrees/issue-193-todo-reorder && NODE_ENV=test npm test -- --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/`
   - Expected: `FAIL` が 1 件も無い。`Tests:` に `failed` が無い。passed が基準の 6815 より増えている。
   - スイートは、新規の 6 つ（`headerMenuOrder.test.ts`・`todoListManagementReorder.test.ts`・`useTodoListManagementMenuOrder.test.ts`・`useTodoListManagementDragAndDrop.test.ts`・`TodoListManagementSortableList.test.tsx`・`TodoListManagementPage.reorder.test.tsx`）を足して 1330 になる。
   - routine の `usePageNavigationComposition.test.tsx` だけが落ちたときは、`NODE_ENV=test npm test -- src/features/routine/hooks/__tests__/usePageNavigationComposition.test.tsx --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` で単独で実行し、通ることを確かめて記録する（並列実行での既知の不安定）。
2. `npm run typecheck` → Expected: exit 0。
3. `npm run typecheck:functions` → Expected: exit 0（firebase-functions は触っていない）。
4. `npm run lint` → Expected: 出力なし・exit 0。
5. `npm run tailwind:scan` → Expected: `No Tailwind shorthand issues found.`
6. 変更したファイルへの prettier の検査:
   `cd .worktrees/issue-193-todo-reorder && npx prettier --check $(git diff --name-only) $(git ls-files --others --exclude-standard)` → Expected: `All matched files use Prettier code style!`
7. `npm run build` → Expected: 成功（exit 0）。
   - `.env.local` が無くても通る。作らない。
   - 生成される `public/firebase-messaging-sw.js` と `.next/` は git 管理外。
8. `git status --short` → Expected: 変更は Task 1〜4 で挙げたファイルと、未追跡の設計書・このプランだけ。
   - `public/firebase-messaging-sw.js` が出ないこと（git 管理外）。
   - バックアップ（`.git` の中）も出ない。

**手動確認:** 実機（PC のブラウザ・Android の Chrome・iPhone の Safari）での確認は、手動確認表の `todo-lists-22`（22-1〜22-7）と、22-2 の備考にある `todo-lists-12-1` で行う。このプランでは手順を個別に書かない。
