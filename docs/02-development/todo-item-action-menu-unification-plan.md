# Todoアイテム アクションメニュー統一 計画

対象ブランチ: `refactor/todo-item-action-menu-unification`

## 背景・現状分析

- **デスクトップ**: `TodoItemDesktopActions.tsx` — ホバー時に浮かぶアイコン群（🎨色 / 🏷️カテゴリ / ✏️編集 / 🗑️削除 / ＋↓挿入）。各アイコンが個別ポップオーバーを持つツールバー方式。
- **モバイル**: `TodoItemMobileMenu.tsx`（`TodoItemMobileTrigger` + `TodoItemMobileDropdown`） — ⋮トリガー+単一ドロップダウン。編集・挿入・インデント上げ下げ・色スウォッチ・カテゴリスウォッチ・削除を全部1つのメニュー内に格納。
- インデント上げ下げ（← →）は `TodoItemIndentButtons.tsx` が別途担当（デスクトップのみ、ホバー表示）。
- 開閉状態は `useTodoListDetailUIControllers.ts` が `colorPicker` / `categoryPicker` / `mobileMenu` の3コントローラーを相互排他で手動調停。

## 決定事項（Deep Dig 結果）

| #    | 論点                                                                                                         | 決定                                                                                                                                                                            | 理由・備考                                                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1   | 統一の対象範囲                                                                                               | **見た目まで統一**。デスクトップのホバーツールバーを廃止し、⋮ドロップダウン方式に一本化（PC/モバイル問わず同じ操作体系）                                                        | UX変更を伴う。単なるコード共通化ではない                                                                                                           |
| Q2   | インデントボタンの扱い                                                                                       | **スコープ外**。`TodoItemIndentButtons` は無改修                                                                                                                                | 統一対象は色/カテゴリ/編集/削除/挿入の5アクションのみ                                                                                              |
| Q3   | 3コントローラーの統合要否                                                                                    | **状態統合はスコープ外**。`useTodoListDetailUIControllers` の3コントローラー構成は維持、コンポーネント側のみ統一                                                                | 状態アーキテクチャの整理は今回やらない                                                                                                             |
| Q4   | Q1×Q3の矛盾（`colorPickerItemId`/`categoryPickerItemId` が `TodoItemDesktopActions` 削除後にデッド化する件） | **完全デッド化する `useCategoryPickerController` のみ削除。`useColorPickerController` は `colorPickerItemId` 分岐も含め丸ごと残す**（`showBulkColorPicker` と同居しているため） | Q3の「状態には触らない」を極力守りつつ、完全に読まれなくなるものだけ掃除。`colorPickerItemId` 自体は統一後に事実上未使用になるが、意図的に残す判断 |
| Q5   | 移行・ロールバック                                                                                           | **フラグなし、通常の直接マージ**                                                                                                                                                | このリポジトリに feature-flag 基盤なし。個人開発、単一PRでmergeする通常運用に合わせる                                                              |
| Q6   | テスト戦略                                                                                                   | **TDD厳守**。新しい統一ドロップダウンのテストを先に書いてから実装。既存 `TodoItemDesktopActions.test.tsx` は実装削除と同時に削除                                                | プロジェクトのテスト密度（1ソース:1テストファイル）と `test-driven-development` skill に合致                                                       |
| Q7   | デスクトップの⋮トリガー表示挙動                                                                              | **常時表示**。hover概念なし、`sm:`系ブレークポイント分岐をCSSから完全排除                                                                                                       | PC/モバイル問わず分岐ゼロの単一実装。視覚密度が多少上がることは許容                                                                                |
| Q8   | 実装のカットオーバー方法                                                                                     | **単一の置き換えコミット**。新統一コンポーネントをTDDで完成させてから、参照差し替え+旧3ファイル削除を1コミットで行う                                                            | bisect時に統一前/後が1コミットで完結、レビューも1差分で追える                                                                                      |
| 命名 | `useMobileActionMenuController` / `data-mobile-menu` の扱い                                                  | **リネーム**: `useItemActionMenuController` / `data-item-menu`                                                                                                                  | 統一後は全ブレークポイント共通の仕組みになるため「mobile」という名前が実態とズレる。異論なし、機械的リネームとして実施                             |

## 影響範囲（確定）

- **削除**: `TodoItemDesktopActions.tsx` + `TodoItemDesktopActions.test.tsx`、`useCategoryPickerController.ts` + テスト
- **リネーム+改修**:
  - `TodoItemMobileMenu.tsx` → 統一アクションメニューコンポーネントへ（ファイル名・コンポーネント名見直し、`sm:hidden`等のブレークポイント分岐を除去）
  - `useMobileActionMenuController.ts` → `useItemActionMenuController.ts`
  - `data-mobile-menu` 属性 → `data-item-menu`
- **改修**: `SortableTodoListItem.tsx`（`TodoItemDesktopActions`呼び出し除去、統一コンポーネント1本に差し替え）、`useTodoListDetailUIControllers.ts`（`categoryPicker`関連の受け渡し除去）、`TodoListDetailView.tsx`（`categoryPickerItemId`/`toggleItemCategoryPickerAction`等propsの受け渡し除去）
- **現状維持**: `TodoItemIndentButtons.tsx`（スコープ外）、`useColorPickerController.ts`（`colorPickerItemId`分岐含め丸ごと維持、`showBulkColorPicker`と同居のため）

## 実装手順（TDD + 単一コミット方針）

1. 新統一コンポーネント（`TodoItemActionMenu`相当）+ `useItemActionMenuController` のテストを先に書く（Q6）
2. テストに合わせて実装（常時表示の⋮トリガー、ブレークポイント分岐なし。Q7）
3. `SortableTodoListItem` の参照差し替え + 旧3ファイル（`TodoItemDesktopActions.tsx`本体・テスト、他）削除 + `useCategoryPickerController`削除を1コミットにまとめる（Q8）
4. `useTodoListDetailUIControllers.ts` / `TodoListDetailView.tsx` から不要になった `categoryPicker` 関連の配線を除去
