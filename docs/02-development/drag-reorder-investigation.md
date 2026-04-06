# ルーティン並び替え（ドラッグ＆ドロップ）不安定問題の調査

## 概要

ルーティンの並び替え時にドラッグが安定しない問題を調査・修正した。

**報告された症状:**

- 並び替え対象のルーティンを移動させようとしても、ほんの少し揺れる（ジグル）だけで動作しない
- 一度横に移動させると動く場合があるが、常にそうとは限らない
- 発生条件が不安定（再現性が低い）

---

## 原因分析

### 根本原因: `touchAction: "pan-y"` とブラウザのネイティブスクロールの競合

`SortableRoutineNormalDragItem` コンポーネントで設定されていた `touchAction: "pan-y"` が原因。

#### `touchAction: "pan-y"` の意味

CSS の `touch-action` プロパティは、ブラウザにどのタッチ操作をネイティブに処理するかを指示する。

| 値             | 意味                                                           |
| -------------- | -------------------------------------------------------------- |
| `auto`         | ブラウザがすべてのタッチ操作を処理（デフォルト）               |
| `pan-y`        | **垂直方向のスクロールのみブラウザが処理**、水平は JS に委ねる |
| `none`         | ブラウザはタッチ操作を一切処理しない（すべて JS が制御）       |
| `manipulation` | パン＋ピンチズームを許可、ダブルタップズームなどを無効化       |

#### 発生メカニズム（時系列）

```
1. ユーザーがルーティンアイテムを長押し（タッチ開始）
2. dnd-kit の TouchSensor が 300ms の遅延待機を開始
   └─ この間、指が 5px 以内なら待機を継続
3. 待機中に指がわずかでも垂直方向に動く（1-2px 程度の自然な揺れ）
4. ★ ブラウザが touchAction: "pan-y" に従い、ネイティブスクロールを開始
5. ネイティブスクロール開始後、touchmove イベントの cancelable が false に変わる
6. 300ms 後、dnd-kit がドラッグを有効化
7. dnd-kit が event.preventDefault() を呼ぶが、cancelable: false なので無効
8. 結果: dnd-kit の transform と ブラウザのスクロールが同時に発生
   └─ アイテムが「揺れるだけ」に見える（ジグル現象）
```

#### 横移動で改善する理由

`touchAction: "pan-y"` は「垂直方向のパンのみブラウザが処理」という意味。

- **垂直方向に動かした場合**: ブラウザがスクロールを横取り → ドラッグ失敗
- **水平方向に動かした場合**: ブラウザは水平パンを処理しない → dnd-kit がイベントを確保 → ドラッグ成功

これが「一度横に移動させると動く」現象の原因。

### 副次的原因: tolerance が 5px と厳しすぎた

TouchSensor の `activationConstraint.tolerance` が 5px に設定されていた。モバイルデバイスで指を 300ms 完全に静止させることは困難で、自然な指の揺れで 5px を超えてドラッグがキャンセルされるケースもあった。

### 編集モードの `SortableRoutineEditModeItem` に `touchAction` 未設定

編集モードでは `touchAction` が設定されておらず、ブラウザの `auto` がデフォルトで適用されていた。`auto` もネイティブスクロールを許可するため、同様の問題が発生する可能性があった。

---

## 発生条件

| 条件                                         | 影響                                                          |
| -------------------------------------------- | ------------------------------------------------------------- |
| タッチデバイス（スマホ・タブレット）         | 必須条件。マウス操作では PointerSensor が使われるため問題なし |
| 垂直方向にドラッグしようとする               | 高確率で発生。`pan-y` がブラウザスクロールを発動させる        |
| 300ms の待機中に指が微妙に動く               | tolerance 5px 以内でもブラウザスクロールは発生する            |
| iOS Safari                                   | 特に発生しやすい。iOS のスクロール処理がより積極的            |
| 長いルーティンリスト（スクロール可能な状態） | スクロール領域があるとブラウザがスクロールを開始しやすい      |

---

## 修正内容

### 根本的なアプローチの変更: ドラッグハンドル方式の採用

`touchAction` の競合を回避するために、カード全体でのロングプレス起動を廃止し、**専用のドラッグハンドル（⨿）** をカード左端に配置する方式に変更した。これは TodoListsPage.tsx と同じパターン。

#### touchAction の状態比較

| 領域                         | 旧実装                                                        | 新実装（現在）                                              |
| ---------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- |
| カード全体（NormalDragItem） | `touchAction: "pan-y"`、`{listeners}` をカードに設定          | `touchAction: "pan-y"` 維持、`{listeners}` をハンドルに移動 |
| カード全体（EditModeItem）   | `touchAction` 未設定（=`auto`）、`{listeners}` をカードに設定 | `touchAction: "pan-y"` 追加、`{listeners}` をハンドルに移動 |
| ドラッグハンドル             | —（存在しない）                                               | `touchAction: "none"`（ドラッグ制御）、`{listeners}` を設定 |

### 1. `{listeners}` をカードからハンドルに移動し、EditModeItem に `touchAction: "pan-y"` を追加

**ファイル:** `SortableRoutineNormalDragItem.tsx` / `SortableRoutineEditModeItem.tsx`

```diff
 // カードコンテナ（SortableRoutineNormalDragItem）
 style={{
   transform: CSS.Transform.toString(transform),
   transition,
   opacity: isDragging ? 0.3 : 1,
   touchAction: "pan-y",  // 変更なし（旧実装から継続）
 }}
-{...attributes}
-{...listeners}

 // カードコンテナ（SortableRoutineEditModeItem）
 style={{
   transform: CSS.Transform.toString(transform),
   transition,
   opacity: isDragging ? 0.5 : 1,
+  touchAction: "pan-y",  // 追加（旧実装は未設定 = auto）
 }}
-{...attributes}
-{...listeners}

 // ドラッグハンドルボタン（⨿）を両コンポーネントに追加
+<button
+  type="button"
+  {...attributes}
+  {...listeners}
+  style={{ touchAction: "none" }}  // ハンドル上でのみブラウザ操作を抑制
+  aria-label="並び替え"
+>
+  ⨿
+</button>
```

NormalDragItem はカード側の `touchAction: "pan-y"` を維持したまま `{...listeners}` をハンドルに移動。EditModeItem はそれに加え `touchAction: "pan-y"` も新規追加した。ハンドル（⨿）上でのみ `touchAction: "none"` を設定することで、カード本体のタッチスクロールを維持しつつ、ハンドルからのドラッグを確実に制御できる。

### 2. ドラッグ有効化を delay → distance ベースに変更

**ファイル:** `DraggableRoutineList.tsx`

```diff
 useSensor(TouchSensor, {
-  activationConstraint: { delay: 300, tolerance: 10 },
+  activationConstraint: { distance: 5 },  // ハンドルからの明示的操作のため遅延不要
 }),
 useSensor(PointerSensor, {
+  activationConstraint: { distance: 8 },
 }),
```

ドラッグハンドルを明示的にタップした場合はユーザーの意図が明確なため、ロングプレス遅延（300ms）は不要。5px の移動距離で即座にドラッグを開始する。

### 3. ドラッグ状態管理の分離（SRP 対応）

**追加ファイル:** `useRoutineDragState.ts`

DraggableRoutineList から `activeId`・`activeRoutine` の状態管理と 3 つのイベントハンドラを抽出した専用フック。

### 4. オーバーレイ表現の分離（SRP 対応）

**追加ファイル:** `RoutineDragOverlay.tsx`

`DragOverlay` 内のゴースト要素描画を専用コンポーネントに抽出。DraggableRoutineList からカードスタイルやコンテンツ描画の責務を除去。

---

## トレードオフ

### ドラッグハンドル方式の採用によりトレードオフを解消

旧実装では `touchAction: "none"` をカード全体に適用していたため、アイテム上でのタッチスクロールが無効化されるトレードオフが存在した。

ドラッグハンドル方式では：

- **カード本体** → `touchAction: "pan-y"` でスクロールを維持
- **ドラッグハンドル（⨿）** → `touchAction: "none"` でドラッグを確実に制御

スクロールとドラッグの競合が構造的に解消されており、スクロール機能を制限するトレードオフは発生しない。

---

## 技術的背景: dnd-kit の TouchSensor の仕組み

### 有効化フロー（distance ベース・現在の実装）

```
touchstart（ドラッグハンドル上）→ TouchSensor.attach()
  └─ distance 制約あり → handleMove で移動距離チェック
      ├─ distance < 5px → handlePending（待機継続）
      └─ distance ≥ 5px → handleStart（即時ドラッグ有効化）
          └─ 以降の handleMove で event.preventDefault() を呼ぶ
```

### 重要なポイント

- ドラッグハンドル上では `touchAction: "none"` が設定されているため、ブラウザはタッチ操作を横取りしない
- 待機中（5px 未満）もブラウザスクロールは発生しない（ハンドル領域限定）
- カード本体は `touchAction: "pan-y"` のためスクロールは正常に動作する
- delay ベースを廃止したことで、意図的なハンドルタップは即座にドラッグを開始できる

### iOS Safari 固有の対策

dnd-kit の `TouchSensor.setup()` は、グローバルに non-passive な touchmove リスナーを登録する。これは iOS Safari でデフォルトで touchmove リスナーが passive になり `preventDefault()` が呼べない問題への対策。

```javascript
// dnd-kit 内部コード
static setup() {
  window.addEventListener('touchmove', noop, { passive: false });
  return function teardown() {
    window.removeEventListener('touchmove', noop);
  };
}
```

---

## 関連ファイル

| ファイル                                                            | 役割                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `src/features/routine/pages/DraggableRoutineList.tsx`               | DndContext・センサー設定・リスト描画                          |
| `src/features/routine/pages/useRoutineDragState.ts`                 | ドラッグ状態管理フック（activeId・activeRoutine・各ハンドラ） |
| `src/features/routine/components/RoutineDragOverlay.tsx`            | ドラッグ中オーバーレイカードの描画                            |
| `src/features/routine/components/SortableRoutineNormalDragItem.tsx` | 通常モードのソート可能アイテム（ドラッグハンドル付き）        |
| `src/features/routine/components/SortableRoutineEditModeItem.tsx`   | 編集モードのソート可能アイテム（ドラッグハンドル付き）        |
| `src/features/routine/pages/draggableRoutineListHelpers.ts`         | 並び替え後の startTime 維持ロジック                           |
| `src/components/SwipeableRoutineItem.tsx`                           | 横スワイプジェスチャーのラッパー                              |
| `node_modules/@dnd-kit/core/dist/core.esm.js`                       | dnd-kit のセンサー実装                                        |
