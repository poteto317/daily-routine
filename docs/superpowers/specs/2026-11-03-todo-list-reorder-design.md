# Todoリスト管理画面でリストを並び替えられるようにする（Issue #193）

## 目的

Issue #193（報告者の環境: Android 10 の Chrome）の本文は「TODOリスト管理で項目の並び替えができません。並び替えができるようにしてほしい」。

「Todoリスト管理」画面（`TodoListManagementPage`）にはリストの並び替えの操作が無い。今のところリストの順序を変える方法は、設定画面の「メニュー並び替え」（`MenuOrderSection`）だけである。そこで、Todoリスト管理画面でリストをドラッグハンドルから並び替えられるようにする。作り方はカテゴリ管理画面の並び替え（dnd-kit・`TodoItemDragHandle`・共通センサー）に揃える。

## 解釈と根拠

- 「TODOリスト管理」は画面名そのものである。画面の見出しは `locales/ja.json` の `management.title`（「📝 Todoリスト管理」）で、メニュー名は `src/config/locales/ja.json` の `todo-list-management`（「Todoリスト管理」）。この画面の「項目」は各リストの行（`TodoListManagementItem.tsx`）にあたる。
- この画面の行には、開く・タイトル編集・表示切替・編集・削除の操作しか無く、並び替えの操作が無い（`TodoListManagementPage.tsx` は `lists.map` で行を並べるだけで、dnd-kit を使っていない）。
- 同じ機能のカテゴリ管理画面（`TodoCategoryManagementPage.tsx`）と、リストの中の Todo（`SortableTodoListItem.tsx`）は、すでにドラッグハンドルで並び替えられる。
- `docs/04-reference/features.md` の「📝 Todoリスト管理」には、すでに「ドラッグ＆ドロップによるリスト自体の並び替え」と書かれている。しかし実装されたことは無い（説明だけが先に書かれていた）。
- 結論として、想定どおり「Todoリスト管理画面で、リスト（行）を並び替えられるようにする」と解釈する。ただし、保存先は想定（リストの配列の順）と違う。今の管理画面の表示順は配列の順ではなく、設定の `menuOrder` で決まっている（下の「調査で分かった現状」）。

## 決めたこと

利用者の確認が必要な事項は無い（下の「ユーザー確認が必要な事項」）。推奨案を採用した事項は次のとおり。

| 項目                             | 決定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 並び替えの対象                   | Todoリスト管理画面に並ぶすべてのリスト。非表示（`isHidden`）のリストも含む。管理画面は非表示のリストも打ち消し線つきで表示しているため                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 順序の保存先                     | 設定の `menuOrder`（`app-settings` の中）。リストの配列（`todo-lists`）の順は変えない。理由: 管理画面の表示順は `sortTodoListsByMenuOrder` が `menuOrder` で決めている（e1cd99c「Todoリスト管理ページの並び順をハンバーガーメニューと一致させる」）。配列だけを並べ替えても、`menuOrder` に載っているリストは画面上で動かない（L-472）                                                                                                                                                                                                                                                                                                                |
| ハンバーガーメニューとの連動     | 管理画面で並べ替えると、ハンバーガーメニューに出るTodoリストの順と、設定画面の「メニュー並び替え」の順も同じに変わる。e1cd99c で決めた「管理画面の順＝メニューの順」を保つ                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 他のメニュー項目                 | 並び替えで変わるのは Todoリスト同士の相対順だけ。ジャーナル・家計簿など他のメニュー項目の並びは変えない。また、`menuOrder` にある未知の ID（新しい版の端末が同期で書いた ID・削除済みリストの ID）も、位置を保ったまま残す。旧来の `todo-lists` だけは、並び替えの結果から外す（下の「ロジック」の手順 2。残すと、後で作ったリストが他のリストの前に出るため）                                                                                                                                                                                                                                                                                        |
| 並び替えの後に作ったリストの位置 | メニューの順位の扱いを広げる。`menuOrder` に載っていないリストは、旧来の `todo-lists` が無く、リストのメニュー ID が 1 つでも載っていれば、最後に載っているリストのすぐ後ろに出す（下の「メニューの順位の扱いの拡張」）。理由: 管理画面で並べ替えると全項目を並べた配列が `menuOrder` に保存されるので、今の式のままでは、後で作ったリストが `menuOrder.length + 自然順` の順位になってメニューの最下部（「不具合を報告」「機能テストマトリクス」の後ろ）に出る。設定画面の「メニュー並び替え」で保存したときにも、後で作ったリストが他のリストから離れて「不具合を報告」の後ろに出る現象が今起きていて（下の「調査で分かった現状」）、同じ変更で直る |
| 操作の開始                       | 各行の左端のドラッグハンドル（`TodoItemDragHandle`。⠿、`aria-label="並び替え"`）からだけ始める。行の他の部分（タイトルのボタン・入力欄・トグル・編集・削除）からは始まらない                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 入力の方式                       | マウス・タッチ・キーボードの 3 つ。センサーはカテゴリ管理画面と同じ `useTodoDndSensors` を使う                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 移動の指定                       | dnd-kit の `active.id`・`over.id`（リストの ID）で受け渡し、表示上の位置（添字）は並び替えの関数の中で、その時点の `lists` と `menuOrder` から求め直す（L-035・L-472）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 取り消し（undo）                 | 作らない。管理画面には今も undo が無い。`TodoListUndoRedoControls` はリストの中の Todo 用である                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 説明文                           | 管理画面の説明（`management.description`）に、並び替えができることと、順がハンバーガーメニューに反映されることを書き足す                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

## ユーザー確認が必要な事項

無い。

いちばん目に見える決定は「管理画面での並び替えがハンバーガーメニューの順にも反映される」ことである。これは e1cd99c で意図して作った「管理画面の順＝メニューの順」をそのまま保つ結果であり、別の扱いを選ぶ余地は小さい。管理画面だけの独立した順序にすると、保存の仕組みを新しく足すうえに、e1cd99c で直した「管理画面とメニューの順が食い違う」状態に戻る。

次に目に見える変化は、並び替えの後に作ったリストの位置である。メニューと設定画面で、他のリストから離れた下のほうではなく、他のリストのすぐ後ろに出るようになる。設定画面で並べ替えた利用者にとっては、今の挙動の改善になる。

## 範囲

やること:

- 管理画面の行にドラッグハンドルを付け、dnd-kit で並び替えられるようにする（マウス・タッチ・キーボード）。
- 並び替えの結果を設定の `menuOrder` に保存する純粋な関数と、`menuOrder` だけを保存する関数を足す。
- メニューの順位の扱いを拡張する（`src/hooks/headerMenuOrder.ts` の `getMenuOrderRank`）。`menuOrder` に載っていないリストを、最後に載っているリストのすぐ後ろに出す。この関数は管理画面・ハンバーガーメニュー・設定画面の「メニュー並び替え」が共通で使うので、設定画面の既存の動作も変わる。設定画面で並べ替えて保存した後に作ったリストは、今はメニューと設定画面で「不具合を報告」の後ろに出るが、変更後は他のリストのすぐ後ろに出る（同じ問題が直る）。
- 管理画面の並び順を、読み込み時の `getSettings()` ではなく画面の state の `menuOrder` から決めるようにする（並び替えの直後に表示が追いつくようにするため）。
- 説明文・`features.md`・手動確認表（3 か所）を更新する。

やらないこと（YAGNI・範囲外）:

- 管理画面以外での並び替えは変えない。ハンバーガーメニュー、設定画面の「メニュー並び替え」、リストの中の Todo の並び替えがこれにあたる。
- リストの配列（`todo-lists`）の順は変えない。このため次の 2 つは今のまま配列の順に従う。リストが選ばれていないときの既定のリスト（`resolveSelectedTodoListId` が配列の中で最初の表示中のリストを選ぶ）と、AI エージェント API のリスト一覧（`readLists` の配列の順）。
- 設定画面の「メニュー並び替え」（`MenuOrderSection`）の HTML5 ドラッグ（`draggable`）は変えない（下の「懸念」）。
- ドラッグハンドルの読み上げ名を行ごとに変えることと、dnd-kit の読み上げ文の日本語化はしない。カテゴリ管理・リストの中の Todo と同じ「並び替え」のままにする（下の「懸念」）。
- 管理画面の既存の不整合は直さない。タイトル編集の onBlur 確定に二重確定を防ぐガードが無い点（下の「懸念」）がこれにあたる。

## 調査で分かった現状

### リストの型と保存

- `TodoList`（`src/features/todo-lists/types.ts`）に順序のフィールド（`order`）は無い。保存する配列の順が作成順で、並び替えの機能はこれまで無かった。
- LocalStorage のキーは `todo-lists`（`storage.ts` の `getTodoLists`・`saveTodoLists`。`setStorageItem` によってユーザーごとのキーになる）。管理画面の保存は `saveTodoListsToLocal`（`sync.ts`）で、クラウドへの送信はしない（同期の操作でまとめて送る）。
- 同期（`src/features/sync/sync/todoListSyncData.ts`）は `todoLists` を配列ごと置き換える。リモートに `todoLists` が無ければローカルを保つ。
- 管理画面のデータの流れは次のとおり。
  1. `useTodoListManagementDataState` が `useState(() => getTodoLists())` でリストを持つ。
  2. 作成・削除・名前変更・表示切替（`useTodoListManagementActionHandlers` → `todoListManagementMutationHandlers.ts` → `todoListCrudPersistActions.ts` → `management.ts`）は、並び替える前の生の `lists` を基準に計算する。
  3. `createManagedTodoListsPersistAction` が `setLists` と `saveTodoListsToLocal` を順に呼ぶ（state を先に変え、それから保存する）。
  4. 画面に渡す `lists` だけを `useTodoListManagementOrder` で並べ替える。

### 管理画面の表示順は `menuOrder` で決まる

- `useTodoListManagementOrder`（`useTodoListManagementOrder.ts`）は `sortTodoListsByMenuOrder(lists, getSettings().menuOrder ?? [])` を `useMemo` で計算する。依存は `[lists]` だけで、`menuOrder` の変化には追いつかない（コメントに「ページ遷移で読み直す」とある）。
- `sortTodoListsByMenuOrder`（`todoListManagementOrder.ts`）と、ハンバーガーメニューの `orderHeaderMenuItems` は、どちらも `src/hooks/headerMenuOrder.ts` の `sortByMenuOrder` を使う。各項目の順位は次のとおり。
  - `menuOrder` に載っている項目は、その添字。
  - 載っていない Todoリストで、`menuOrder` に旧来の `todo-lists` があるもの: `todo-lists` の添字 + (自然順の添字 + 1) / (件数 + 1)。
  - それ以外: `menuOrder.length` + 自然順の添字（末尾に回る）。
- 順位は実数で、`sortByMenuOrder` は各項目の順位を 1 回だけ計算してから `Array.prototype.sort` で昇順に並べる（比較の中で順位を計算しないことを既存のテストが固定している）。
- `menuOrder` の中身は、メニュー項目の ID（`journal` など）と Todoリストのメニュー ID（`todo-list-<リストID>`。`toTodoListMenuItemId`）が混ざった配列である（`src/types/routine/settings.ts` の `menuOrder?: string[]`）。
- 設定画面の `MenuOrderSection` が並べるのは `REORDERABLE_MENU_IDS`（`MenuOrderSection.tsx` の 11〜26 行。`sync-management`・`test-matrix` は入っていない）と全リスト（非表示のリストも含む）である。並べ替えると、`handleReorder`（同 61〜66 行）が、自分が並べる項目の ID だけを順に並べた配列を `menuOrder` に保存する。このとき未知の ID・旧来の `todo-lists`・削除済みリストの ID は捨てられる。
- 設定画面で並べ替えて保存した後に作ったリストは `menuOrder` に載っておらず、旧来の `todo-lists` も無いので、順位は `menuOrder.length + 自然順` になる。`MenuOrderSection` が保存する配列には `sync-management`・`test-matrix` が入らないので、この 2 つも載っていない項目として `menuOrder.length + 自然順` になる。自然順ではリストのほうが前なので、新しいリストは「不具合を報告」の後ろに出る（表示していれば「同期履歴管理」「機能テストマトリクス」の前）。例: `… todo-list-A todo-list-B todo-list-management bug-report todo-list-C sync-management test-matrix settings …`。今起きている現象である。管理画面で並べ替えた場合は、`sync-management`・`test-matrix` も `menuOrder` に載るので、新しいリストはそれらの後ろの最下部に出る（「決めたこと」の記述はこちらの場合）。
- `menuOrder` を含む設定（`app-settings`）を書く経路は 3 つある。
  - 設定画面の自動保存: 画面の state が変わるたびに `useSettingsPersistenceEffect.ts`（35〜47 行）から `persistUpdatedSettings`（`settingsPageStateActions.ts` の 120〜131 行）を通して `saveSettings` を呼ぶ。
  - 同期の取り込み: `src/features/sync/sync/localData.ts`（104 行）が設定をまるごと書く。
  - 読み込み（インポート）: `dataTransferGroups.ts`（117〜120 行）が設定をまるごと書く。
- 設定は同期の対象で、取り込みは `normalizeSettings` によるトップレベルの浅いマージである。リモートに `menuOrder` があれば、それがローカルの値を置き換える。`setStorageItem` は保存のたびにローカルの更新時刻を進めるので、同期の「ローカルに変更あり」の判定にも入る。
- 書き出し・読み込み（`dataTransferGroups.ts`）では、`menuOrder` は「設定」のグループに、リストは「Todoリスト」のグループに入る。

### リストの順序を使う箇所（リポジトリ全体を `getTodoLists`・`menuOrder`・`todoLists` で検索した結果）

| 箇所                                                                                                                         | 使う順序                                         | 今回の並び替えの反映                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------- |
| Todoリスト管理画面（`useTodoListManagementOrder`）                                                                           | `menuOrder`                                      | 反映される（今回の対象）                                               |
| ハンバーガーメニュー（`headerMenuItemData.ts` → `buildDynamicTodoMenuItems` → `orderHeaderMenuItems`。非表示のリストは除く） | `menuOrder`（無いリストは配列の順）              | 反映される。メニューを開くたびに `getSettings()` を読み直す            |
| 設定画面の「メニュー並び替え」（`MenuOrderSection`。非表示のリストも含む）                                                   | `menuOrder`                                      | 反映される。画面を開いたときに読む                                     |
| リストが選ばれていないときの既定のリスト（`selectors.ts` の `resolveSelectedTodoListId`）                                    | 配列の順                                         | 反映されない（範囲外）                                                 |
| AI エージェント API（`firebase-functions/src/agentApi/operations/todo/todoListOperations.ts` の一覧）                        | 配列の順                                         | 反映されない（範囲外。API にリストの並び替えも無い）                   |
| 同期・書き出し（`todoListSyncData.ts`・`todoListGroup.ts`）                                                                  | 配列をそのまま                                   | 配列は変えないので影響なし。順序は設定の一部として同期・書き出しされる |
| Todoリスト画面（`TodoListsPage`）                                                                                            | リストの選択 UI を持たない（選択はメニューから） | 関係なし                                                               |

ホーム・統計にはTodoリストを使う箇所が無い。

### カテゴリ管理画面の並び替え（手本）の構成

| 役割           | ファイル                                                                                                                                                                                                                           | 内容                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 純粋な並び替え | `todoCategoryMutations.ts` の `reorderTodoCategories(categories, fromIndex, toIndex)`                                                                                                                                              | 範囲外・同じ位置なら同じ配列参照を返す（L-541）。移動は dnd-kit の `arrayMove`                                                                                                                                                                                        |
| 並び替えと保存 | `todoCategoryCrudPersistActions.ts` の `reorderTodoCategoriesAndPersist`                                                                                                                                                           | 変化が無ければ `null` を返して保存しない                                                                                                                                                                                                                              |
| データの state | `useTodoCategoryManagementDataState.ts` の `handleReorderCategories(fromIndex, toIndex)`                                                                                                                                           | `setCategories` と `saveTodoCategories`                                                                                                                                                                                                                               |
| DnD のフック   | `useTodoCategoryDragAndDrop.ts`                                                                                                                                                                                                    | `useTodoDndSensors`、`handleDragEnd` で `over` が無い・同じ ID・見つからない ID を除いて添字に直して渡す。`activeId` も返すが、画面は使っていない                                                                                                                     |
| センサー       | `useTodoDndSensors.ts`                                                                                                                                                                                                             | Pointer（`distance: 8`）・Touch（`delay: 300, tolerance: 5`）・Keyboard（`sortableKeyboardCoordinates`）                                                                                                                                                              |
| 一覧           | `TodoCategorySortableList.tsx`                                                                                                                                                                                                     | `DndContext`（`closestCenter`）と `SortableContext`（`verticalListSortingStrategy`）の配線と行の描画。空状態の判定は画面に残す                                                                                                                                        |
| 行             | `TodoCategoryManagementItem.tsx`                                                                                                                                                                                                   | `useSortable({ id })`、行の外枠に `setNodeRef`・`transform`・`transition`・ドラッグ中の `opacity: 0.4`。左端に `TodoItemDragHandle`                                                                                                                                   |
| ハンドル       | `TodoItemDragHandle.tsx`                                                                                                                                                                                                           | `<button type="button">` に dnd-kit の `attributes`・`listeners` を展開し、`touchAction: "none"`、`aria-label="並び替え"`、`onTouchStartCapture`・`onMouseDownCapture` で伝播を止める（`.github/copilot-instructions.md` の「ドラッグハンドルとスワイプの競合防止」） |
| テスト         | `todoCategoryMutations.test.ts`・`useTodoCategoryDragAndDrop.test.ts`・`TodoCategorySortableList.test.tsx`（dnd-kit をモック）・`TodoCategoryManagementItem.test.tsx`（モックなし）・`useTodoCategoryManagementPageState.test.tsx` | —                                                                                                                                                                                                                                                                     |
| Storybook      | カテゴリ管理画面のストーリーは無い。Todoリスト管理画面には `TodoListManagementPage.stories.tsx` がある                                                                                                                             | —                                                                                                                                                                                                                                                                     |

リストで踏襲する部分と、リスト固有の違い:

- 踏襲する: 一覧の部品（DnD の配線）・行の `useSortable` とハンドル・共通センサー・ハンドルの部品・「変化が無ければ保存しない」・範囲チェック。
- 違い 1（表示順と元データ）: カテゴリは表示順＝配列の順なので、添字で渡せる。リストは表示順が `menuOrder` で並べ替えた順で、配列の順と違う。このため添字ではなく ID で受け渡す（L-472・L-035）。
- 違い 2（保存先）: カテゴリは配列を保存する。リストは設定の `menuOrder` を保存する。
- 違い 3（非表示のリスト）: 管理画面は非表示のリストも全件表示しているので、並び替えの対象も全件である。絞り込んだ部分配列で計算することは無い（L-460）。
- 違い 4（行の操作）: リストの行には、タイトルのボタン（押すとリストを開く）・タイトル編集の入力欄・表示切替のトグル・編集・削除がある。行全体はボタンではなく、ボタンはタイトルの部分だけである。ドラッグの `listeners` はハンドルだけに付けるので、これらと競合しない（下の「行の中の操作との共存」）。

### Android（タッチ）でのリストの中の Todo の並び替え: 問題は見つからなかった

コードからは、問題は見つからなかった（実機での確認はしていない）。

- ハンドル（`TodoItemDragHandle.tsx`）には `touchAction: "none"` があり、ハンドルの上ではブラウザがスクロールを始めない。行（`SortableTodoListItem.tsx` の `li`）は `touchAction: "pan-y"` なので、ハンドル以外の部分では縦のスクロールができる。ハンドルとスクロールは場所で分かれている（`docs/02-development/drag-reorder-investigation.md` と同じ方式）。
- ハンドルは `onTouchStartCapture` で伝播を止める。React の捕捉段階で `stopPropagation` すると、ネイティブのイベントがルートの捕捉で止まり、同じ要素のバブリング段階のハンドラにも届かない。`.github/copilot-instructions.md` も、同じ理由で `onPointerDownCapture` を付けると PointerSensor が止まると書いている。このため、ハンドルの上では TouchSensor（`delay: 300`）の `onTouchStart` は呼ばれない。タッチは PointerSensor（`onPointerDown`）が受ける。`touch-action: none` の要素の上では `pointercancel` が起きないので、指が 8px 動いた時点でドラッグが始まる。300ms の長押しは要らない。
- ハンドルを出すのは、親子ブロックの先頭（`isBlockAnchor`）だけである。子のTodoにハンドルが無いのは、ブロックの先頭同士でしか並び替えを許さない仕様（`todoListItemReorderAction.ts`）によるもので、不具合ではない。
- DnD を止める条件は無い（`useTodoListInteractionMode.ts` は `disabled` を渡していない）。完了・カテゴリの区分をまたぐ移動は黙って拒否されるが、これも仕様である。
- 結論: リストの中の Todo の並び替えは範囲外とする。Todoリスト管理画面にも同じハンドルとセンサーを使うので、タッチでの動き方は同じになる。管理画面の行はスワイプの部品の中に無いので、ハンドルの伝播の停止は要らない。ただし害も無いので、部品はそのまま使う。

## 設計

### メニューの順位の扱いの拡張

`src/hooks/headerMenuOrder.ts` の `getMenuOrderRank` を、次の 4 段の判定にする。式は 1 つの関数のままで、管理画面（`sortTodoListsByMenuOrder`）・ハンバーガーメニュー（`orderHeaderMenuItems`）・設定画面（`MenuOrderSection`）が同じ `sortByMenuOrder` を通して使う。このため、3 画面の順の一致は今までどおり保たれる。

1. `menuOrder` に載っている項目: その添字（整数）。変更なし。
2. 載っていない Todoリスト（`isTodoListMenuItemId` が真）で、`menuOrder` に旧来の `todo-lists` があるとき: `todo-lists` の添字 + (fallbackIndex + 1) / (totalItems + 1)。変更なし。
3. **新規**: 載っていない Todoリストで、旧来の `todo-lists` は無いが、Todoリストのメニュー ID（`isTodoListMenuItemId` が真の ID）が `menuOrder` に 1 つ以上あるとき: 最後に載っているそのような ID の添字（`lastTodoListIndex`）+ (fallbackIndex + 1) / (totalItems + 1)。
4. それ以外（`menuOrder` が空、リストの ID が 1 つも載っていない、またはリスト以外の項目）: `menuOrder.length` + fallbackIndex。変更なし。

式の具体:

- `lastTodoListIndex` は、`menuOrder` の中で `isTodoListMenuItemId` が真になる最後の要素の添字である。`sortByMenuOrder` の中で 1 回だけ求め、`getMenuOrderRank` に引数で渡す。項目ごとに `menuOrder` を走査しないためで、「順位の計算は項目の数だけ」という既存のテストの性質を保つ。
- 判定は `menuOrder` だけで行い、`naturalOrderIds`（呼び出し元ごとに違う。メニューは表示中のリストだけ、管理画面と設定画面は全リスト）には依存しない。どの呼び出し元でも基準の位置が同じになる。削除済みリストの ID が残っていれば、それも基準になりうる。そこはもともとリストが並んでいた位置なので害は無い。
- 実数の順位で足りる理由: fallbackIndex は 0 から totalItems − 1 なので、(fallbackIndex + 1) / (totalItems + 1) は 1 / (totalItems + 1) 以上、totalItems / (totalItems + 1) 以下になり、0 より大きく 1 より小さい。このため 3 の順位は `lastTodoListIndex` と `lastTodoListIndex + 1` の間に収まる。整数の添字（1 の順位）と等しくならず、`lastTodoListIndex + 1` に載っている項目より前、`lastTodoListIndex` のリストより後ろに出る。4 の順位は `menuOrder.length` 以上なので、3 の順位は 4 より必ず小さく、「設定」より前のメニュー項目の末尾に回らない。
- 載っていないリストが複数あるときは、fallbackIndex が自然順（配列の順）で異なるので順位も異なり、自然順を保つ。
- `sortByMenuOrder` の安定性: `Array.prototype.sort` は安定（ES2019 以降）だが、上の式では呼び出し元が渡す項目どうしで順位が等しくならないので、安定性には依存しない（fallbackIndex は `naturalOrderIds` 上の位置で、どの呼び出し元も全項目を `naturalOrderIds` に含めている）。
- 2 を 3 より先に判定する（旧来の扱いを変えない）。並び替えの結果に旧来の `todo-lists` が残ると、後で作ったリストが 2 によって `todo-lists` の直後、つまり他のリストの前に出る。そのため、並び替えの関数は結果から `todo-lists` を外す（下の「ロジック」の手順 2）。

### ロジック（純粋な関数）の置き場所とシグネチャ

1. `src/hooks/headerMenuOrder.ts` に `buildMenuOrderNaturalIds(todoListMenuIds: string[]): string[]` を足す。
   - 返すもの: `menuConfig.menuItems` の順に、固定の項目（先頭の `home`、末尾の `settings`・`account-admin`。ファイル内の `PINNED_FIRST`・`PINNED_LAST`）を除いた項目の ID を並べた配列。`todo-lists` の位置には、引数のリストのメニュー ID を順に入れる。
   - 表示設定や管理者かどうかでは絞らない。絞ってもメニューに出る項目同士の相対順は変わらないので、全項目を並べてよい。
   - 既存の `orderHeaderMenuItems`・`MenuOrderSection` は変えない。
2. `src/features/todo-lists/todoListManagementReorder.ts`（新規）に `reorderTodoListsInMenuOrder` を置く。

   ```ts
   export const reorderTodoListsInMenuOrder = (params: {
     lists: TodoList[]; // 並べ替える前の生の配列（非表示を含む全件）
     menuOrder: string[];
     activeListId: string;
     overListId: string;
   }): string[] | null
   ```

   手順:
   1. `listMenuIds` = `lists` の各 ID を `toTodoListMenuItemId` で変換した集合。
   2. 候補 = `buildMenuOrderNaturalIds(リストのメニュー ID を配列の順に並べたもの)` の後ろに、`menuOrder` にあって候補に無い ID（重複は 1 つにまとめる）を足したもの。ただし旧来の `todo-lists` は足さない。並び替えの後は今のリストがすべて `menuOrder` に載るので、`todo-lists` が役立つのは後で作るリストの位置だけになる。それを残すと、順位の判定 2 によって後のリストが他のリストの前に出る。外せば判定 3 で他のリストの後ろに出る。
   3. `ordered` = `sortByMenuOrder(候補, (id) => id, 候補, menuOrder)`。
   4. `displayed` = `ordered` からリストのメニュー ID だけを順に抜き出したもの。これは `sortTodoListsByMenuOrder(lists, menuOrder)`（今の管理画面の表示順）と同じ順になる。順位の式は、候補の集合が違っても相対順を変えないため。この一致はテストで固定する。
   5. `fromIndex` = `displayed` での `activeListId` の位置、`toIndex` = `overListId` の位置。どちらかが見つからない、または同じ位置なら、`null` を返す（L-541・L-035）。
   6. `moved` = `arrayMove(displayed, fromIndex, toIndex)`。dnd-kit の `arrayMove` を使い、splice を自前で書かない（カテゴリと同じ方針）。
   7. 返す値 = `ordered` の各要素について、リストのメニュー ID なら `moved` から順に 1 つずつ取り出して入れ、それ以外はそのまま残した配列。リスト以外の項目の位置と、未知の ID は変わらない（旧来の `todo-lists` は手順 2 で候補から外しているので含まれない）。
   - なぜ全項目を並べた配列にするのか: `menuOrder` に載っていない項目は「`menuOrder.length` + 自然順」で末尾に回る。リストの ID だけを `menuOrder` に足すと、載っていない他の項目の順位がずれ、リストがメニューの別の場所へ飛ぶ。全項目を今の順で並べてから書けば、他の項目の相対順は変わらない。
   - 設定画面の `MenuOrderSection` が保存する配列とは形が違う。`MenuOrderSection` は `REORDERABLE_MENU_IDS`（`sync-management`・`test-matrix` を含まない）と全リストだけを保存し、未知の ID・旧来の `todo-lists`・削除済みリストの ID を捨てる。この関数は `menuConfig` の固定以外の全項目（`sync-management`・`test-matrix` を含む）を並べ、未知の ID と削除済みリストの ID を残す（旧来の `todo-lists` は手順 2 のとおり外す）。形は違っても、どちらの配列でも、他のメニュー項目の相対順とリストの表示順は同じ `sortByMenuOrder` で決まり、3 画面で一致する。
   - 削除済みリストの ID が `menuOrder` に残っていても、未知の ID として位置を保って残す（今も残っており、害は無い）。

3. `src/features/settings/storage.ts` に `saveMenuOrder(menuOrder: string[]): void` を足す。中身は `saveSettings({ ...getSettings(), menuOrder })`。呼んだ時点の最新の設定を読んでから `menuOrder` だけを差し替えるので、他の設定を古い値で上書きしない（L-453・L-669）。`saveSettings` を通すので、`SETTINGS_UPDATED_EVENT` の発火とユーザーごとのキーも今の保存と同じになる（L-476）。`src/features/settings/index.ts` から公開する（機能の公開は `index.ts` を通す規約）。

### フックの構成

- `useTodoListManagementMenuOrder({ lists })`（新規 `useTodoListManagementMenuOrder.ts`）が `{ menuOrder: string[]; handleReorderLists: (activeListId: string, overListId: string) => void }` を返す。
  - `menuOrder` は `useState<string[]>(() => getSettings().menuOrder ?? [])` で持つ。
  - `handleReorderLists` は `reorderTodoListsInMenuOrder({ lists, menuOrder, activeListId, overListId })` を呼ぶ。`null` なら何もしない。配列が返ったら `setMenuOrder(next)` と `saveMenuOrder(next)` を呼ぶ（state を先に変え、それから保存する。管理画面の既存の保存と同じ順）。1 回のドラッグで呼ぶ更新は、この 1 組だけである。
- `useTodoListManagementOrder({ lists, menuOrder })` に変える。`getSettings()` を読むのをやめ、引数の `menuOrder` で `sortTodoListsByMenuOrder` を計算する。`useMemo` の依存は `[lists, menuOrder]` にする。state の配列は参照が変わらないので、メモ化は効く。今のコメント（依存から `menuOrder` を外した理由）は新しい方式の説明に書き換える。
- `useTodoListManagementDataState`
  - `const { menuOrder, handleReorderLists } = useTodoListManagementMenuOrder({ lists })` を足す。
  - `useTodoListManagementOrder({ lists, menuOrder })` で表示用の `lists` を作る。
  - 結果（`createTodoListManagementDataStateResult`）に `handleReorderLists` を足す（必須の引数。L-060）。作成・削除・名前変更・表示切替は今のまま生の `lists` を基準にする。
- `useTodoListManagementDragAndDrop({ onReorderLists })`（新規 `useTodoListManagementDragAndDrop.ts`）が `{ sensors, handleDragEnd }` を返す。
  - `sensors` は `useTodoDndSensors()`。
  - `handleDragEnd` の流れ: `over` が無ければ何もしない。`String(active.id)` と `String(over.id)` が同じなら何もしない。それ以外は `onReorderLists(activeId, overId)` を呼ぶ。`useCallback` の依存は `[onReorderLists]`。
  - `activeId`・`handleDragStart`・`handleDragCancel` は作らない。カテゴリのフックの `activeId` は画面で使われておらず、ドラッグ中の見た目は `useSortable` の `isDragging` で足りるため（YAGNI）。
- `useTodoListManagementPageState`
  - `const dnd = useTodoListManagementDragAndDrop({ onReorderLists: dataState.handleReorderLists })` を足す。
  - 結果（`createTodoListManagementPageStateResult`）に `dnd`（`{ sensors, handleDragEnd }`）を必須の引数として足す。

### コンポーネントの構成

- `TodoListManagementSortableList.tsx`（新規。`TodoCategorySortableList.tsx` と同じ役割）: `DndContext`（`sensors`・`collisionDetection={closestCenter}`・`onDragEnd`）と `SortableContext`（`items` は表示順のリスト ID、`verticalListSortingStrategy`）を配線し、`<div className="space-y-2">` の中に `TodoListManagementItem` を並べる。
  - props は `lists`・`sensors`・`onDragEndAction` と、今 `TodoListManagementPage` が行へ渡している 9 つの props（`editingListId`・`editingListTitleValue`・`onChangeTitleValueAction`・`onCommitEditAction`・`onCancelEditAction`・`onOpenListAction`・`onToggleVisibilityAction`・`onStartEditAction`・`onDeleteAction`）。すべて必須にする（L-060）。
- `TodoListManagementPage.tsx`: `lists.map(...)` の部分を `TodoListManagementSortableList` に置き換え、`dnd.sensors`・`dnd.handleDragEnd` を渡す。空状態の判定（`lists.length === 0 && !showForm`）は画面に残す（カテゴリと同じ）。
- `TodoListManagementItem.tsx`
  - `useSortable({ id: list.id })` を使い、行の外枠に `setNodeRef`・`transform`（`CSS.Transform.toString`）・`transition`・ドラッグ中の `opacity: 0.4` を付ける（カテゴリの行と同じ）。
  - 行の左側を `<div className="flex items-center gap-2 min-w-0 flex-1">` にまとめ、その先頭に `TodoItemDragHandle`（`attributes`・`listeners`）を置き、続けてタイトルのボタンか編集の入力欄を置く。右側（表示ラベル・トグル・編集・削除）は変えない。
  - props は増やさない。
  - ハンドルは、編集中の行にも、リストが 1 件のときにも出す（カテゴリと同じ。1 件のときのドラッグは位置が変わらないので保存されない）。

### ドラッグハンドルの UI と a11y

- 部品は `TodoItemDragHandle` をそのまま使う。見た目（⠿・灰色・`cursor-grab`）と `aria-label="並び替え"` は、カテゴリ管理・リストの中の Todo と同じになる。
- キーボード: Tab でハンドルにフォーカスし、Space か Enter で持ち上げ、↑↓ で移動し、Space か Enter で置く。Escape で取り消す（KeyboardSensor と `sortableKeyboardCoordinates`）。ハンドルは `<button>` なのでフォーカスできる。dnd-kit の `attributes`（`aria-roledescription="sortable"`・`aria-describedby` など）はハンドルに展開されるが、`aria-label` は部品の側の指定が後に来るので残る。
- キーリピート（L-408）: Space を押し続けると、持ち上げた直後のリピートで同じ位置に置かれる。同じ位置への移動は `reorderTodoListsInMenuOrder` が `null` を返すので、何も保存しない。確認のダイアログを開く操作や、フォーカスを移す操作は足さない。
- タッチ: ハンドルの `touchAction: "none"` で、ハンドルの上からのドラッグはスクロールと競合しない。ハンドル以外の部分（行の大半）では今までどおりスクロールできる。タッチは、ハンドルが `onTouchStartCapture` で伝播を止めるので TouchSensor（長押し 300ms）には届かず、PointerSensor（8px の移動で開始）が受ける（上の「Android（タッチ）でのリストの中の Todo の並び替え」）。

### 行の中の操作との共存

- ドラッグはハンドルからだけ始まる（`listeners` をハンドルにだけ付ける）。タイトルのボタン（リストを開く）・トグル・編集・削除のボタンのクリックは今のまま動く。PointerSensor の `distance: 8` により、ハンドルを押して離しただけではドラッグにならない。
- タイトル編集の入力欄（Enter・Escape・onBlur・IME の判定）は変えない（L-473・L-474 の既存の実装に手を入れない）。PC では、編集中に別の行のハンドルをマウスで押すと、ボタンにフォーカスが移る。このとき入力欄の onBlur で編集が確定（保存）され、その後にドラッグが始まる。
- `key={list.id}` は変えないので、並び替えの後も行は作り直されない（入力欄の state を失わない）。

### 非表示のリストの扱い

- 並び替えの計算は、生の `lists`（非表示を含む全件）と `menuOrder` から行う。表示中のリストだけに絞った配列は使わない（L-460）。
- 非表示のリストは、ハンバーガーメニューには出ないが、`menuOrder` 上の位置を持つ。表示に戻すと、管理画面で並べた位置でメニューに出る。設定画面の「メニュー並び替え」にも、今と同じく非表示のリストが並ぶ。

### 保存と同期

- 保存は `saveMenuOrder`（設定の `app-settings` の中の `menuOrder`）だけで、`todo-lists` は書かない。保存の形式は変えない（`order` のフィールドは足さない。L-540 は該当しない）。
- 同期: 設定は同期の対象なので、アップロードで `menuOrder` も送られる。他の端末に取り込むと、`normalizeSettings` によってリモートの `menuOrder` で置き換わり、同じ順になる。`todoLists` の配列の順は変えないので、配列の同期とはぶつからない。
- 書き出し・読み込みで順序を移すには、「設定」のグループを含める必要がある（今の「メニュー並び替え」と同じ）。

### 失敗の扱い

- 移動が成り立たないとき（`over` が無い・同じ位置・`lists` に無い ID）: 何も保存せず、state も変えない。
- 保存の失敗（LocalStorage の容量超過など）: `setStorageItem` が失敗を `dispatchStorageWriteFailed` で知らせ、既存の書き込み失敗の通知が出る。state は先に変えているので、再読み込みまでは並べ替えた順で表示される。これは管理画面の既存の保存（作成・削除など）と同じ扱いで、今回は変えない。
- 保存されている設定が壊れている場合（既知の制約・L-669）: `getSettings()` は JSON の解析に失敗すると `DEFAULT_SETTINGS` を返す（`src/features/settings/storage.ts` の 50〜60 行）。この状態で `saveMenuOrder` を呼ぶと、設定を既定値と新しい `menuOrder` で上書きする。設定画面の自動保存でも同じことが起き、新しい危険ではないので、この変更では直さない。
- 画面を開いている間に別の経路で `menuOrder` が書き換わる場合: 管理画面の state は古いままになる（リストの state と同じ既知の制約）。同期の取り込みは、既定でページを再読み込みする（`downloadFromFirestore` の `reload`）。

## テスト

実装を壊すと落ちることを、それぞれのテストで確かめる。

- `src/hooks/__tests__/headerMenuItemHelpers.test.ts` の `sortByMenuOrder`・`orderHeaderMenuItems`（順位の扱いの拡張。既存のテストはすべてそのまま通ること）
  - リスト A・B が `menuOrder` に載っていて、新しいリスト C が載っていない: C は B の直後に出る。`menuOrder` に載っている他のメニュー項目（B より後ろの項目）と、固定の「設定」より前に出る。今の式（末尾に回す）のままだと落ちる。
  - 載っていないリストが複数（C・D）: B の直後に自然順（C → D）で並ぶ。
  - リストの ID が途中にだけある（`["todo-list-a", "journal", "todo-list-b", "budget"]`）: C は B と `budget` の間に出る（最初ではなく最後に載っているリストが基準）。
  - 旧来の `todo-lists` があるとき（リストの ID も載っている場合を含む）: 今までどおり `todo-lists` の直後に自然順で出る。入力は `menuOrder = ["todo-list-a", "todo-lists", "journal", "todo-list-b"]`、項目は a・b・C・journal（C は載っていない）で、期待は a, C, journal, b。判定 2 と 3 の順を入れ替えると a, journal, b, C になって落ちる。
  - `menuOrder` が空: 今までどおり自然順。
  - リスト以外の載っていない項目（`"future-feature"` など）: 今までどおり末尾に自然順。
  - 順位の計算が項目の数だけで済む既存のテスト（`getId` の呼び出し回数）がそのまま通る。
- `src/features/todo-lists/__tests__/todoListManagementOrder.test.ts`: 「menuOrder に存在しない新規リスト」のテストの期待値（b, a, new）は変わらないが、コメント（「末尾（menuOrder.length + fallbackIndex）」）を新しい扱い（最後に載っているリストの直後）に直す。
- `src/hooks/__tests__/headerMenuOrder.test.ts`（新規）の `buildMenuOrderNaturalIds`
  - `home`・`settings`・`account-admin` を含まない。
  - `todo-lists` の位置に、渡したリストの ID がその順で入る。`todo-lists` 自体は含まない。
  - それ以外の項目は `menuConfig` の順のまま。
  - リストが 0 件ならリストの ID を含まない。
- `src/features/todo-lists/__tests__/todoListManagementReorder.test.ts`（新規）の `reorderTodoListsInMenuOrder`。移動が成り立つ各ケースで、`sortTodoListsByMenuOrder(lists, 結果)` の ID の並びが `arrayMove(並べ替え前の表示順, from, to)` と一致すること（表示の性質）を確かめる。あわせて、他のメニュー項目の位置が関わるケースでは、`orderHeaderMenuItems` に代表的な静的項目を渡し、静的項目の相対順が前後で変わらないこと（メニューの性質）を確かめる。動的なリスト（表示中のみ）を含むメニュー全体の並びは、`menuOrder` が空のケース・後で作ったリストのケース・非表示のリストが途中にあるケースで確かめる。
  - `menuOrder` が空（全項目が自然順）: 結果がメニューの他の項目の順を保つ。リストの ID だけを並べた配列を保存する誤りで落ちる。
  - 設定画面で保存済み（全リストが載っている）: リストの枠だけが入れ替わり、他の要素は同じ位置に残る。
  - 一部のリストだけが載っている（作成後に並べていない新しいリストがある）。
  - 旧来の `todo-lists` だけが載っている: 未知の ID（`"future-feature"` など）は同じ相対位置に残り、`todo-lists` は結果から外れる。
  - 旧来の `todo-lists` がある `menuOrder` を並べ替えた結果に、まだ無いリスト X を加えて `sortTodoListsByMenuOrder` と `orderHeaderMenuItems` に渡す: X は並べ替えたリストの最後の直後に出る（`todo-lists` を外し忘れると、X が先頭のリストより前に出て落ちる）。
  - 非表示のリストが途中にある: 非表示のリストが結果から消えず、表示中のリストだけで計算する誤り（L-460）で落ちる。
  - 下へ移動・上へ移動の両方向で、`active` と `over` を取り違える誤りで落ちる。
  - 末尾から先頭・先頭から末尾（範囲の境界）。
  - `activeListId` や `overListId` が `lists` に無い・両者が同じ: `null` を返す（L-541・L-035）。
  - 入力の `lists` と `menuOrder` を変更しない。
- `src/features/settings/__tests__/storage.test.ts` の `saveMenuOrder`: 既存の他の設定（`theme` など）を保ったまま `menuOrder` だけを置き換える。`SETTINGS_UPDATED_EVENT` を発火する。
- `__tests__/useTodoListManagementMenuOrder.test.ts`（新規。`@/features/settings` をモック）
  - 初期の `menuOrder` を `getSettings()` から読む（未設定なら `[]`）。
  - 成り立つ移動で `saveMenuOrder` を正しい配列（`toEqual`）で 1 回呼び、返す `menuOrder` も同じ配列になる。
  - 成り立たない移動（同じ ID・無い ID）では `saveMenuOrder` を呼ばず、`menuOrder` も変わらない。
  - 2 回続けて並べ替えると、2 回目は 1 回目の結果を基準にする（state を使っていることの確認）。
- `__tests__/useTodoListManagementOrder.test.ts`（更新）
  - `getSettings` のモックをやめ、引数の `menuOrder` で並べ替える。
  - `menuOrder` だけを変えて再描画すると並びが変わる（依存に `menuOrder` が無い誤りで落ちる）。
- `__tests__/useTodoListManagementDragAndDrop.test.ts`（新規）
  - `over` が `null` なら `onReorderLists` を呼ばない。
  - `active` と `over` が同じなら呼ばない。
  - 違えば `(activeId, overId)` の順で呼ぶ（取り違えで落ちる）。
  - `sensors` は共通の `useTodoDndSensors` の戻り値をそのまま返す（`useTodoDndSensors` をモックし、`toBe` で同一性を確かめる）。センサーの種類と設定値は `useTodoDndSensors.test.ts` が確かめる。
- `__tests__/TodoListManagementItem.test.tsx`（更新）: 行に「並び替え」のボタンが 1 つある。既存のテスト（開く・トグル・編集・削除・Enter・IME・Escape・打ち消し線）がそのまま通る。
- `__tests__/TodoListManagementSortableList.test.tsx`（新規。`TodoCategorySortableList.test.tsx` と同じく dnd-kit をモック）
  - `DndContext` に渡した `onDragEnd` が `onDragEndAction` と同一（`toBe`）で、`sensors` も同一。
  - `SortableContext` の `items` が渡した `lists` の順の ID。
  - 各行のボタン（開く・トグル・編集・削除）が、正しいリストを引数にして対応する props を呼ぶ。
  - `editingListId` が一致する行だけが入力欄になる。
- 配線のテスト（L-060。渡した値の同一性を `toBe` で確かめる）
  - `useTodoListManagementDataState.test.tsx`・`useTodoListManagementDataStateComposition.test.tsx`・`todoListManagementDataStateResult.test.ts`: `useTodoListManagementMenuOrder` の `menuOrder` が `useTodoListManagementOrder` に、`handleReorderLists` が結果に渡る。並び替えの前の生の `lists` が action handler に渡る既存のテストは保つ。
  - `useTodoListManagementPageStateComposition.test.tsx`・`todoListManagementPageStateResult.test.ts`: `useTodoListManagementDragAndDrop` に `dataState.handleReorderLists` が渡り、結果の `dnd` がその戻り値と同一。`useTodoListManagementPageState.test.tsx` は更新しない（同じ確認を `TodoListManagementPage.reorder.test.tsx` の画面のテストが実物のフックを通して行う）。
- 画面のテスト（`__tests__/TodoListManagementPage.reorder.test.tsx`〔新規。既存の `TodoListManagementPage.test.tsx` は本物の dnd-kit のまま変えない〕。`TodoListsPage.test.tsx` と同じく `@dnd-kit/core` の `DndContext` をモックして `onDragEnd` を受け取る。`@/features/settings` は `getSettings` と `saveMenuOrder` をモックする。`TodoListsPage.test.tsx` の 45〜57 行のように `@dnd-kit/sortable` もモックする場合は、`arrayMove: jest.requireActual("@dnd-kit/sortable").arrayMove` を残す。`todoListManagementReorder.ts` が `arrayMove` を使うため、無いと行の順のテストが TypeError で落ちる）
  - 表示中 2 件と非表示 1 件のリストで `onDragEnd({ active: { id: 末尾 }, over: { id: 先頭 } })` を呼ぶ。画面の行の順が変わる。`saveMenuOrder` が新しい順の配列で呼ばれる。`saveTodoListsToLocal` は呼ばれない。非表示のリストも画面に残る。
  - 並べ替えた後にリストを作成すると、新しいリストは末尾に出る。作成で保存する配列（`saveTodoListsToLocal` の引数）は作成順のままである。
- 説明文: `__tests__/TodoListManagementHeader.test.tsx` の文言を新しい説明に合わせる。
- Storybook（`TodoListManagementPage.stories.tsx`）
  - 非表示のリストを含む `WithHiddenList` を足す。play で、行ごとに「並び替え」のボタンがあることを確かめる。
  - 並べ替えると Storybook の LocalStorage の `app-settings` が変わる。そこで、設定を変えうるストーリーすべての `beforeEach` の後始末で、`saveSettings(DEFAULT_SETTINGS)` を呼んで戻す（`RoutineItem.stories.tsx` と同じやり方）。対象は、リストが表示されて手で並べ替えられるストーリーで、既存の `WithLists` と新しい `WithHiddenList` である。`WithHiddenList` の play 自体は並べ替えないので設定を変えないが、見ている人が手で並べ替えうるので対象に入れる。リストが 0 件の `Default`・`ClickAddList` は並べ替えられないので変えない。
  - Storybook の play は CI で実行されないので、DnD の操作そのものは画面のテストと手動確認で確かめる。
- 全体の検証: `npm run verify:fast`（lint・型・テスト）。シェルの `NODE_ENV=production` で落ちる場合は `NODE_ENV=test` を付けて実行する。

## ドキュメントと確認表の更新

- `src/features/todo-lists/locales/ja.json` の `management.description` を書き換える。案: 「ハンバーガーメニューに表示するTodoリストを管理します。各リストの表示・非表示の切り替えと、⠿ をドラッグしての並び替えができます。並び順はハンバーガーメニューにも反映されます。」
- `docs/04-reference/features.md`
  - 「📝 Todoリスト管理」の「ドラッグ＆ドロップによるリスト自体の並び替え」を、実装に合わせて書き直す。ドラッグハンドル（マウス・タッチ・キーボード）、非表示のリストも並べられること、順がハンバーガーメニューと設定の「メニュー並び替え」に反映されることを書く。
  - 「技術仕様」に、順序は設定（`app-settings` の `menuOrder`）に保存し、`todo-lists` の配列の順は変えないことを足す。
  - 設定画面の「🔀 メニュー並び替え」に、Todoリストの順はTodoリスト管理画面でも並べられ、同じ設定を共有することを足す。あわせて、並び替えの後に作ったTodoリストは、他のTodoリストのすぐ後ろに出ることを足す。
- 手動確認表（3 か所。既存の ID は変えず、振り直さない）に新しい項目 **todo-lists-22「Todoリストの並び替え（Todoリスト管理）」** を足す。
  - `docs/03-testing/test-matrix.md` の「16. Todoリスト」の表の末尾（`todo-lists-21` の後）。状態 🔶、備考「ドラッグハンドル（マウス・タッチ・キーボード）。順はハンバーガーメニューと連動」。
  - `src/features/test-matrix/initialData.ts` の `todo-lists` カテゴリの末尾（`todo-lists-20` の後）。`label` は同じ文言、`pc`・`sp` は `"unchecked"`、`note` は `""`。`todo-lists-21` はアプリ内の表に無いが、今回は足さない（下の「懸念」）。
  - `src/features/test-matrix/detailed-test-cases/group-16-20-21.ts` の `"todo-lists-22"` に、次の詳細ケースを置く（ID は「項目 ID-連番」）。各詳細ケースの `pc`・`sp` はどちらも `"unchecked"`、`note` は下に書くもの以外 `""` にする（PC だけで確かめるケースも、シナリオの文に（PC）と書き、`sp` は `"unchecked"` のままにする。既存の詳細ケースもすべて `"unchecked"`）。
    - **todo-lists-22-1**: リストを 3 件以上作り、Todoリスト管理画面で末尾のリストのハンドル（⠿）をマウスでドラッグして先頭へ置く。→ 画面の順が変わる。ハンバーガーメニューのTodoリストも同じ順になる。再読み込みしても順が保たれる。
    - **todo-lists-22-2**: スマホ（Android の Chrome・iPhone の Safari）で、ハンドルを指で押したまま上下に動かして置く。→ 並び替わる。ハンドル以外の部分を上下になぞると、画面がスクロールしてドラッグは始まらない。
    - **todo-lists-22-3**: Tab でハンドルにフォーカスし、Space → ↓ → Space で 1 つ下へ移す。Space → ↓ → Escape では元の位置に戻る。
    - **todo-lists-22-4**: 非表示のリストを含めて並び替える。→ 非表示のリストは消えずに並べた位置に残る。そのリストを表示に戻すと、並べた位置でハンバーガーメニューに出る。
    - **todo-lists-22-5**: 並び替えの後に設定画面の「メニュー並び替え」を開く。→ Todoリストが同じ順で並ぶ。ジャーナル・家計簿など他の項目の並びは、並び替えの前と変わらない。
    - **todo-lists-22-6**: （PC）タイトルを編集している途中で、別のリストのハンドルをマウスで掴んで並び替える。→ 編集中のタイトルが確定・保存され、その後に並び替わる。
    - **todo-lists-22-7**: 並び替えの後に、新しいリストを作る。→ 管理画面では末尾に出る。ハンバーガーメニューと設定画面の「メニュー並び替え」でも他のTodoリストのすぐ後ろに出て、「不具合を報告」など他のメニュー項目の後ろ（最下部）には出ない。
    - **todo-lists-22-8**: リストが画面に収まらない数（14 件ほど）のとき、管理画面で行のハンドルを掴み、画面の下端まで動かして数秒待つ（上端でも同じ）。→ ページは一番下（上端のときは一番上）で止まり、際限なく伸びたり真っ白になったりしない。掴んだ行は一覧の末尾（先頭）から行の高さの半分ほどまでしかはみ出さず、離すと末尾（先頭）へ並ぶ。`note` は「PR レビューで、実ブラウザでの下端ドラッグのスクロール暴走が見つかった。行の中心を一覧の枠の中に制限する modifier で防いでいる」。
    - **todo-lists-22-9**: タイトルが折り返して 4 行ほどになる長いタイトルのリストを含む 5 件ほどのリストで、管理画面で長いリストのハンドルを一番下（一番上）まで動かして離す。→ 長いリストが末尾（先頭）に並ぶ（末尾から 2 番目〔先頭から 2 番目〕に入らない）。`note` は「PR レビューで、背の高い行が末尾・先頭に置けない退行が見つかった（行の下端を枠で止めていたため）。modifier は行の中心を枠の端まで動かせるようにしている」。
    - 22-2 の `note`（備考）: 「同じ Android の端末で todo-lists-12-1（リストの中のアイテムの並び替え）も確かめる。リストの中のアイテムがタッチで並び替えられないという別の解釈を、実機の結果で退けるため」。todo-lists-12-1 の ID と本文は変えない。

## タスクの分け方

1 つの実装プランに、次の 4 つのタスクを順に置く。

1. **ロジック**: メニューの順位の扱いの拡張（`headerMenuOrder.ts` の `getMenuOrderRank`・`sortByMenuOrder` と `headerMenuItemHelpers.test.ts`、`todoListManagementOrder.test.ts` のコメント）、`buildMenuOrderNaturalIds`（`headerMenuOrder.ts`）、`reorderTodoListsInMenuOrder`（新規 `todoListManagementReorder.ts`）、`saveMenuOrder`（`settings/storage.ts` と `index.ts`）とそれぞれのテスト。
2. **フックと部品**: `useTodoListManagementMenuOrder`・`useTodoListManagementOrder` の引数の変更・`useTodoListManagementDragAndDrop`・`TodoListManagementItem` のハンドル・`TodoListManagementSortableList` とそれぞれのテスト。
3. **画面の配線と Storybook**: `useTodoListManagementDataState`・`useTodoListManagementPageState` とそれぞれの結果の組み立て、`TodoListManagementPage`、説明文、配線と画面のテスト、Storybook のストーリー。
4. **ドキュメント・確認表・最終検証**: `features.md`、手動確認表（3 か所）、`npm run verify:fast`。

## 気をつける知見

dev-flow-kit の `review-lessons.md`:

- L-460（部分配列での並び替えの保存）: 計算は非表示を含む全件の `lists` で行う。テストに、途中に非表示のリストがあるケースを入れる。
- L-472（表示順と元データの添字のずれ）: 表示順（`menuOrder` で並べた順）と配列の順が違うため、添字ではなく ID で受け渡し、表示順は関数の中で同じ式から求め直す。表示の性質のテストで一致を固定する。
- L-540（`order` のフィールド）: `order` は足さない。保存先は既存の `menuOrder`（ID の配列）で、採番は無い。
- L-541（範囲チェック）: 見つからない ID と同じ位置は `null` を返し、移動は `arrayMove` に任せる。
- L-035（位置ベースの識別子）: dnd-kit から受け取るのはリストの ID で、移動の直前に今の `lists` と `menuOrder` で位置を引き直す。
- L-060（省略可能な props の配線漏れ）: 新しい props・引数（`sensors`・`onDragEndAction`・`handleReorderLists`・`dnd`）はすべて必須にする。配線のテストは `toBe` で同一性を確かめ、画面のテストで実物のフックを通して `onDragEnd` から保存までを確かめる。
- L-453（同一ハンドラ内の連続した更新）: 1 回のドラッグで呼ぶ更新は `setMenuOrder` と `saveMenuOrder` の 1 組だけ。`saveMenuOrder` は保存の直前に最新の設定を読み、`menuOrder` 以外を古い値で上書きしない。
- L-669（全項目を書く保存の既定値での上書き）: 同上。`getSettings()` は同期の読み込みで、読み込み前に保存が走ることは無い。
- L-476（高レベルの保存関数を迂回しない）: `localStorage` を直接書かず、`saveSettings` を通す。
- L-459（設定の同期のマージ）: `menuOrder` はトップレベルの配列で、今の `normalizeSettings` のままリモートの値で置き換わる。これで順序は端末間でそろう。新しい入れ子のキーは足さない。
- L-466（`useState` で一度だけ読む設定）: 管理画面は開くたびに作り直されるので、開いたときに読む。常駐する部品（ヘッダー）はメニューを開くたびに読み直すので、保存した順がすぐに反映される。
- L-473・L-474（インライン編集の Enter・blur と IME）: タイトル編集の入力欄には手を入れない。既存の IME の判定（`isImeComposingKeyDown`）とそのテストを保つ。
- L-408（キーリピート）: キーボードでのドラッグはリピートで同じ位置に置かれても保存しない。確認のダイアログやフォーカスの移動は足さない。
- L-538（今日を取り込むハンドラ）: 該当しない（日付を使わない）。
- L-494（ドラッグハンドルの要素の種類・KeyboardSensor・親のスワイプとの干渉）: ハンドルは独立した `<button type="button">`（`TodoItemDragHandle`）で、行全体はボタンではないので入れ子にならない（タイトルのボタンとは兄弟）。センサーは `KeyboardSensor`（`sortableKeyboardCoordinates`）を含む `useTodoDndSensors`。管理画面の行はスワイプを検知する親の中に無く、行に `overflow-hidden` も無い。いずれも設計で満たしている。
- ドラッグハンドルの a11y: `<button>`・`aria-label="並び替え"`・キーボード操作（KeyboardSensor）を、カテゴリ管理と同じ部品で満たす。手動確認 todo-lists-22-3 でキーボード操作を確かめる。

このリポジトリの規約と知見:

- `.github/copilot-instructions.md` の「ドラッグハンドルとスワイプの競合防止」: ハンドルの部品（`TodoItemDragHandle`）をそのまま使い、`onPointerDownCapture` を足さない。
- `docs/02-development/coding-standards.md`: 機能の公開は `index.ts` を通す（`saveMenuOrder` を `@/features/settings` から公開する）。`isImeComposingKeyDown` で IME を判定する（既存の入力欄のまま）。
- `docs/02-development/review-lessons.md` の 1-3 節（日付の検証）・2-3 節（キーと値の二重持ち）: 今回は日付もバケットも扱わないので該当しない。2-3 節の「同じ情報が 2 か所にあるとき、どちらを正とするか決める」の考え方に従い、リストの順序の正は `menuOrder` とし、配列の順は書き換えない（2 か所を同時に書いて食い違わせない）。
- 同じ文書の 5-1 節（1 つの結果を複数の state で表さない）: 順序の state は `menuOrder` 1 つだけにし、並べ替えた後のリストの配列を別の state として持たない（表示用の配列は `useMemo` で導く）。

## 懸念

- 設定画面の「メニュー並び替え」（`MenuOrderSection`）は HTML5 の `draggable` とドラッグイベントで作られていて、タッチ操作の端末では動かない可能性が高い（実機では確認していない）。報告者（Android）が並び替えられなかった理由の一つかもしれない。今回の管理画面の並び替えが使えるようになれば、リストの順はスマホでも変えられる。設定画面の側を直すかどうかは別の課題とする。
- リストが選ばれていないときの既定のリストと、AI エージェント API のリスト一覧は、配列の順（作成順）のままで、管理画面の順と一致しない。今も設定画面で並べ替えたときに同じ状態であり、今回は変えない。
- ドラッグハンドルの読み上げ名はすべての行で「並び替え」で、dnd-kit の読み上げの案内は英語のままである（カテゴリ管理・リストの中の Todo と同じ）。行ごとの名前（「<リスト名> を並び替え」）にするには共通の部品を 3 画面で変える必要があるので、別の課題とする。
- 管理画面のタイトル編集の入力欄には、カテゴリの行にある「Enter・Escape の後の onBlur で二重に確定しない」ガード（`suppressNextBlurCommitRef`）が無い（L-473）。今回の変更とは独立した既存の挙動なので触らない。
- `features.md` の「📝 Todoリスト管理」には、管理画面に無い機能も書かれている（「デフォルト背景色の設定」「新規アイテム追加位置の設定」「完了アイテムの初期非表示設定」）。今回の確認の範囲外なので、並び替えの記述だけを直す。手動確認表の todo-lists-12-4（「完了非表示中はドラッグハンドルが非表示」）も、27a1844（完了済み非表示中も並び替えを可能にする）以降の実装と合っていない可能性がある。`todo-lists-21` は `test-matrix.md` にだけあり、アプリ内の表（`initialData.ts`）には無い。いずれも今回は直さない。
- `useTodoDndSensors` の TouchSensor は、ハンドルの捕捉段階での伝播の停止によって実際には働いていないと読める。不具合ではない（PointerSensor がタッチを受ける）が、設定の意図とは違う。今回は触らない。
- 管理画面で 1 回並べ替えると、`menuOrder` に（固定以外の）メニュー項目の全体を書く。それまで `menuOrder` が空だった利用者は、その後の版でメニューに項目が足されたり既定の順が変わったりしても、足された項目が「設定」の直前に出て、既定の順の変更も反映されなくなる。設定画面の並び替えでも同じことが起きる（今の順位の式では全項目を書くしかない）。リストしか触っていない利用者には予想外になりうるが、設計の判断として受け入れる。
- 削除したリストの ID が `menuOrder` に残ることがある（管理画面の並び替えは未知の ID・削除済みの ID を残す）。残った ID は、新しいリストを置く基準（最後に載っているリスト）になりうる。設定画面で保存すれば消える。害は無いので直さない。
- リストが画面に収まらない長さのとき、`DragOverlay` を使わず行そのものを transform で動かしているため、ハンドルを画面の下端まで動かすと、自動スクロールでページが下がるのに行も付いて下がって文書が伸び続け、画面が真っ白になる（PR レビュー第 6 周で、レビュアーが実ブラウザで発見）。リスト管理画面は、行の中心を一覧の枠の中に制限する modifier（`restrictToSortableListBounds`）を `DndContext` に渡して防ぐ（行は枠から高さの半分までしかはみ出さないので、ページは伸び続けない）。`DragOverlay` と `activeId` は導入しない。カテゴリ管理画面には main から同じ現象が残っており、別の課題とした（同じ modifier を渡すだけで直せる）。確認は todo-lists-22-8。
- 上の modifier は、はじめ行の上端・下端を枠の端で止めていた。dnd-kit は modifier を当てた後の移動量から当たり判定用の矩形を作って `closestCenter` に渡すので、背の高い行（スマホでタイトルが折り返して 4 行ほどになる行。高さ H、他の行 48px）は中心が「枠の下端 − H/2」までしか下がらず、H が 104px 以上だと末尾から 2 番目の行のほうが近いと判定されて末尾に置けなかった（先頭も同じ。PR レビューで、レビュアーが実ブラウザで発見）。上下は行の中心を枠の端まで動かせるように制限する（左右は行の端を枠に収めたまま）。`collisionDetection` を指の位置で判定するものに差し替える案もあったが、modifier の範囲を変えるほうが変更が小さく、キーボード操作にも影響しない。確認は todo-lists-22-9。
- ドラッグハンドル（`TodoItemDragHandle`、3 画面で共通）は押せる範囲が約 10×24px と小さく、色も薄い。Android での押しにくさは todo-lists-22-2 の実機確認で見る。直すなら共通の部品を別の課題として扱う。
