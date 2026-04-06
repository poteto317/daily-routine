# 同期インジケーター調査・修正記録

## 概要

ヘッダーの同期ボタン（アップロード/ダウンロード）のインジケーター表示がずれる問題を調査・修正した。

## 同期インジケーターの仕組み

### タイムスタンプ比較方式

ローカルとリモートのタイムスタンプを比較して、アップロード/ダウンロード状態を判定する。

```
ローカル > リモート → アップロードが必要（ローカルに変更あり）
リモート > ローカル → ダウンロードが必要（リモートに変更あり）
```

### イベントチェーン

```
setStorageItem() でデータ保存
  → setLocalDataUpdatedAt(Date.now()) でローカルタイムスタンプ更新
    → LOCAL_DATA_UPDATED_AT_EVENT 発火
      → headerSyncState.ts の recalculateHeaderSyncStatus()
        → refreshSyncStatusFromStoredRemote()
          → setSyncStatusFromComparison() でリモートと比較
            → sync-status-changed イベント発火
              → HeaderSyncButton が状態更新
```

### 主要ファイル

| ファイル                                | 役割                                         |
| --------------------------------------- | -------------------------------------------- |
| `lib/storage/core-modules/storageIO.ts` | ストレージ操作＋ローカルタイムスタンプ管理   |
| `features/sync/sync/remoteStatus.ts`    | ローカル vs リモートのタイムスタンプ比較     |
| `features/sync/sync/localData.ts`       | ローカルデータ収集・保存・タイムスタンプ取得 |
| `features/sync/sync/watchRemote.ts`     | Firestore リアルタイムリスナー               |
| `features/sync/sync/statusStore.ts`     | 同期ステータスの保存・イベント発火           |
| `hooks/headerSyncState.ts`              | ヘッダーUI への状態反映                      |

## 発見されたバグと修正

### Bug 1: Todoリストの変更がアップロードマークを出さない

**原因**: `todo-lists/storage.ts` の `saveTodoLists()` が直接 `localStorage.setItem()` を使用していたため、`setLocalDataUpdatedAt()` が呼ばれていなかった（このPRで修正）。

**修正**: `setStorageItem()` を使用するよう変更（`getUserScopedKey` + 直接 `localStorage` 操作から `getStorageItem/setStorageItem` 委譲への変更）。

### Bug 2: プリセットの変更がアップロードマークを出さない

**原因**: `preset/storageData.ts` の `savePresets()` が直接 `localStorage.setItem()` を使用していたため、`setLocalDataUpdatedAt()` が呼ばれていなかった（このPRで修正）。

**修正**: `setStorageItem()` を使用するよう変更（`getStorageItem/setStorageItem` 委譲）。あわせて `import { RoutinePreset }` を `import type { RoutinePreset }` に修正。

### Bug 3: ルーティン達成履歴の保存がアップロードマークを出さない

**原因**: `routine/storage.ts` の `saveDailyHistory()` が直接 `localStorage.setItem()` を使用していたため、同じキーに書き込む `saveMonthlyHistory()` が使われていなかった（このPRで修正）。

**修正**: `saveMonthlyHistory()` に委譲するよう変更。合わせて `options?: { skipLocalDataUpdatedAt?: boolean }` パラメータを追加し、`saveDailyProgressSilently()` から呼ぶ際に `skipLocalDataUpdatedAt: true` を伝播できるようにした。

### Bug 4: ダウンロード後に誤ってアップロードマークが表示される（クリティカル）

**原因**: `saveSyncDataToLocal()` がダウンロードデータを各機能の save 関数で保存する際、`setStorageItem()` を使う関数がそれぞれ `setLocalDataUpdatedAt(Date.now())` を呼んでいた。`Date.now()`（ダウンロード時の現在時刻）はリモートの `lastModified`（アップロード時の時刻）より新しいため、ローカル > リモートと判定されてアップロードマークが表示されていた。

最後に `setLocalDataUpdatedAt(data.lastModified)` で修正されるが、中間の各保存で既にイベントが発火しUIが不正な状態を表示していた。

**修正**: `storageIO.ts` に `withSyncBatch()` を追加。バッチモード中は `setStorageItem()` が `setLocalDataUpdatedAt()` を呼ばないようにした。`saveSyncDataToLocal()` は全保存を `withSyncBatch()` で囲み、最後に一度だけ `setLocalDataUpdatedAt(data.lastModified)` を呼ぶ。

## 画面ごとのストレージ関数マッピング

### `setStorageItem()` を使用（正しくアップロードマークが出る）

| 機能           | 保存関数                                                     | ファイル                         |
| -------------- | ------------------------------------------------------------ | -------------------------------- |
| ルーティン     | `saveRoutines()`                                             | `routine/storageRoutinesCore.ts` |
| 達成履歴       | `saveMonthlyHistory()`                                       | `routine/storageHistoryQuery.ts` |
| 設定           | `saveSettings()`                                             | `settings/storage.ts`            |
| ポモドーロ     | `savePomodoroHistory()`                                      | `pomodoro/storage.ts`            |
| 勤務テンプレ   | `saveWorkTemplates()`                                        | `work-tracker/storageData.ts`    |
| 勤務履歴       | `saveWorkSessionHistory()`                                   | `work-tracker/storageData.ts`    |
| 体重           | `saveWeightHistory()`                                        | `weight-tracker/storageData.ts`  |
| 日記           | `saveJournalHistory()`                                       | `journal/storageData.ts`         |
| 予算           | `saveBudgetData()`                                           | `budget/storageData.ts`          |
| 食事           | `saveMealHistory()`                                          | `meal/storageData.ts`            |
| **Todoリスト** | `saveTodoLists()` ← **今回修正**                             | `todo-lists/storage.ts`          |
| **プリセット** | `savePresets()` ← **今回修正**                               | `preset/storageData.ts`          |
| **日次履歴**   | `saveDailyHistory()` → `saveMonthlyHistory()` ← **今回修正** | `routine/storage.ts`             |

### `skipLocalDataUpdatedAt: true` を使用（同期用保存）

| 関数                          | 用途                     |
| ----------------------------- | ------------------------ |
| `saveDailyProgressForSync()`  | ダウンロード時のみ使用   |
| `saveDailyProgressSilently()` | 画面表示の一時状態保存用 |

## withSyncBatch の仕組み

```typescript
// storageIO.ts
let syncBatchDepth = 0;

// 型レベルでは async 関数の誤用を完全に防げないため、ランタイムで落とす。
// Promise を返す関数を渡したときの戻り値が never になるオーバーロードで
// 呼び出し側の誤用を一部抑止しているが、渡す行為自体をコンパイルエラーにはできない。
export function withSyncBatch(fn: () => Promise<unknown>): never;
export function withSyncBatch(fn: () => void): void;
export function withSyncBatch(fn: () => unknown): void {
  // 1. async 関数は fn() 実行前に弾く（副作用ゼロで失敗させる）
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    throw new Error("withSyncBatch には同期関数のみ渡してください");
  }
  syncBatchDepth++;
  try {
    const result = fn();
    // 2. () => Promise.resolve() のような通常関数は実行前に検知できない。
    //    fn() の同期部分はすでにバッチ中に実行されている点に注意。
    //    （デクリメントは finally に委ねる）
    if (result instanceof Promise) {
      throw new Error("withSyncBatch には同期関数のみ渡してください");
    }
  } finally {
    syncBatchDepth = Math.max(0, syncBatchDepth - 1);
  }
}

// setStorageItem 内の判定（set/setUnscoped/remove/removeUnscoped で統一）
if (
  !options?.skipLocalDataUpdatedAt &&
  syncBatchDepth === 0 &&
  key !== LOCAL_DATA_UPDATED_AT_KEY
) {
  setLocalDataUpdatedAt(Date.now());
}
```

### ネスト安全性

フラグ（`boolean`）方式では、内側の `withSyncBatch` の `finally` が実行された時点で外側のバッチも終了扱いになる問題があるため、参照カウント（`number`）方式を採用しています。`Math.max(0, ...)` により深度が負になることも防いでいます。

### async 関数の誤用防止

型レベルでは渡す行為を完全に禁止できないため、2段階でランタイム検知します。

1. **`AsyncFunction` 前段チェック** (`Object.prototype.toString`): `fn()` 実行前に検知するため、副作用ゼロで失敗させられる。
2. **`instanceof Promise` フォールバック**: `() => Promise.resolve()` のような通常関数が Promise を返す場合は実行後に検知。この時点で `fn()` の同期部分はすでに実行済みであることに注意。

バッチ深度は `finally` で必ず 1 回だけ戻します。

`withSyncBatch()` 内で呼ばれる save 関数は `setLocalDataUpdatedAt()` をスキップし、バッチ完了後に明示的に一度だけタイムスタンプを設定する。
