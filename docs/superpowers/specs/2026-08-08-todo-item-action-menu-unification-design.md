# TODOリスト アイテムアクションメニュー統一 設計書

- 日付: 2026-08-08
- 対象領域: `src/features/todo-lists/`

## 背景・問題

TODOリストのアイテム編集UIは、画面幅で挙動が分かれている。

- **狭い画面**（`sm`未満、640px未満）: ⋮トリガー（`TodoItemMobileTrigger`）→ ドロップダウンメニュー（`TodoItemMobileDropdown`）で編集操作を行う。正常に動作する。
- **広い画面**（`sm`以上）: インラインのアイコン列（`TodoItemDesktopActions.tsx`、🎨背景色/🏷️カテゴリ/✏️編集/🗑️削除/➕挿入）が表示される。

広い画面側に2つの問題がある。

1. **バグ**: 🎨背景色・🏷️カテゴリのポップオーバーが見切れて選択できない。原因は、これらのポップオーバーが親コンポーネント`SwipeableRoutineItem`の`overflow-hidden`（`src/components/SwipeableRoutineItem.tsx`）にクリップされるため。同じ問題は以前モバイル側にもあったが、`TodoItemMobileDropdown`を`overflow-hidden`の外（`<li>`直下、`SwipeableRoutineItem`の兄弟）に配置することで解決済み。デスクトップのアイコン列だけ対応が漏れている。
2. **UX**: アイコンが絵文字のみでテキストラベルがなく、何を表すか分かりにくい（`aria-label`はあるが視覚的には非表示）。

## 調査で判明した事実

- ⋮メニュー（`TodoItemMobileDropdown`）は既に以下をすべて持っている: 編集・挿入・インデント上げ下げ・背景色変更（`TodoItemColorSwatches`）・カテゴリ変更（`TodoCategorySwatches`）・削除。
- 広い画面用アイコン列（`TodoItemDesktopActions.tsx`）が提供する機能は、上記の**部分集合**であり、⋮メニュー側に機能欠落は無い。
- インデント上げ/下げは別途`TodoItemIndentButtons.tsx`が画面幅を問わず常時表示しており、今回の変更と無関係（無変更）。
- タイトル編集自体はモーダルではなく`TodoItemTitleArea.tsx`によるインライン置換であり、見切れる余地はない。

## 採用方針

⋮メニューに完全統一する。画面幅を問わず単一のUIとし、広い画面用のインラインアイコン列は撤去する。

### 検討した代替案

| 案                      | 内容                                                                                      | 不採用理由                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| B: 配置修正のみ         | デスクトップアイコン列は残し、ポップオーバーを`overflow-hidden`の外へ移設して見切れを解消 | アイコンの意味が分かりにくいというUX課題が未解決のまま残る |
| C: 部分統一             | ✏️編集のみ残し、🎨🏷️のみ⋮へ寄せる                                                         | UIが2系統混在し、実装・利用者双方にとって複雑              |
| **A: 完全統一（採用）** | ⋮メニューに一本化                                                                         | バグとUX課題を同時に解消。実装もシンプルになる             |

## 変更内容

### 削除

- `src/features/todo-lists/TodoItemDesktopActions.tsx`（本体）
- `src/features/todo-lists/__tests__/TodoItemDesktopActions.test.tsx`
- `useCategoryPickerController`（本体・テスト）— `TodoItemDesktopActions`専用と確認済み、他の消費者なし
- `isInlineInsertOpen`の配線一式 — `SortableTodoListItem.tsx` / `TodoListSortableItems.tsx` / `TodoListDetailView.tsx`。発生源の`insertAfterId`（`useTodoListInlineInsert.ts`）自体はインライン挿入フォーム表示条件として引き続き使うため残す
- `useColorPickerController`のうち、アイテム個別用の返り値・引数（`colorPickerItemId` / `toggleItemColorPickerAction` / `closeItemColorPickerAction`）の配線。**フック自体・一括カラーピッカー用（`showBulkColorPicker`系）は残す**（`TodoListToolbar.tsx`経由の一括カラーピッカー、`useTodoCategoryManagementPageState.ts`のカテゴリ管理ページで再利用されているため）

### リネーム

「Mobile」を冠する名前は、常時使用の唯一のUIになることで実態と乖離するため、中立的な名前へ変更する。

| 変更前                        | 変更後                        |
| ----------------------------- | ----------------------------- |
| `TodoItemMobileMenu.tsx`      | `TodoItemActionMenu.tsx`      |
| `TodoItemMobileTrigger`       | `TodoItemActionMenuTrigger`   |
| `TodoItemMobileDropdown`      | `TodoItemActionMenuDropdown`  |
| `TodoItemMobileMenu.test.tsx` | `TodoItemActionMenu.test.tsx` |

`aria-label="アクションメニュー"`は既に中立的な文言のため変更不要。

### 表示条件変更

- `TodoItemActionMenuTrigger`（旧`TodoItemMobileTrigger`）から`sm:hidden`を除去し、画面幅を問わず常時表示にする
- `SortableTodoListItem.tsx`内の`TodoItemDesktopActions`描画を削除

### 無変更（今回のスコープ外）

- タイトル編集のインライン置換ロジック（`TodoItemTitleArea.tsx`）
- インデント上げ/下げの専用ボタン（`TodoItemIndentButtons.tsx`）
- `TodoItemColorSwatches` / `TodoCategorySwatches`（⋮メニューが直接使用する共通コンポーネント）
- `SwipeableRoutineItem`の`overflow-hidden`自体（デスクトップアイコン列を撤去するため、修正不要になる）

## テスト方針

- 削除: `TodoItemDesktopActions.test.tsx`、`useCategoryPickerController.test.ts`
- リネーム＋更新: `TodoItemMobileMenu.test.tsx` → `TodoItemActionMenu.test.tsx`
  - `sm:hidden`が外れ常時表示になったことを踏まえ、表示条件に関する既存テストがあれば更新
  - 広い画面幅を想定したビューポートでも⋮メニューが表示・操作可能であることを確認するテストを追加
- `SortableTodoListItem.tsx`関連（上位テストがあれば）: `TodoItemDesktopActions`を参照している箇所の更新・削除

## 影響範囲

- 対象は`src/features/todo-lists/`配下のみ
- 公開されるユーザー操作（編集・削除・色/カテゴリ変更・挿入・インデント）に機能欠落はない。UIの入口が1つに統一されるのみ
- ストレージ・同期機能・他フィーチャーへの影響なし
