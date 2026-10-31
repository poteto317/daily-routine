# テストガイド

アプリケーションのテスト方法とテストマトリクスです。

## 📚 ドキュメント一覧

### テストマトリクス

- **[test-matrix.md](./test-matrix.md)** - 機能テストマトリクス
  - 全26セクション×230項目以上のテスト項目
  - 実装状況（✅実装済み、🔶BETA、🚧開発予定）
  - PC・スマホの動作確認チェックリスト
  - 機能別の詳細テスト項目

## 🧪 テストの種類

### 1. 機能テスト

[test-matrix.md](./test-matrix.md) を使用して、各機能の動作確認を行います。

**テスト対象:**

- 認証機能
- ルーティン管理（CRUD、表示、通知、週間目標・ストリーク）
- ライフログ機能（家計簿、ジャーナル、運動記録、食事記録、体重記録、天気）
- 生産性機能（ポモドーロ、作業記録）
- タスク管理機能（Todoリスト、Todoリスト管理）
- システム機能（クラウド同期、不具合報告、APIキー管理、設定、通知、PWA・オフライン）
- 開発・管理機能（アカウント管理、同期履歴管理、テストマトリクス）

### 2. 自動テスト

`npm test` は `TZ=Asia/Tokyo` 環境下でフロントエンド（`src/`）、Cloud Functions（`firebase-functions/src/`）、および補助ツール（`tools/`）のすべてのユニットテストを一括実行します。Cloud Functions のテストは functions 側の依存を import するため、事前に `npm install --prefix firebase-functions`（CI では `npm ci --prefix firebase-functions`）が必要です。

```bash
# ユニットテスト実行 (TZ=Asia/Tokyo)
npm test

# カバレッジ付きテスト
npm run test:ci

# ウォッチモード
npm run test:watch
```

**git worktree（`.worktrees/` 配下）で実行する場合の注意**

`jest.config.ts` の `testPathIgnorePatterns` は、メインの作業ツリーから worktree 内のテストを重複して拾わないように `/.worktrees/` を除外しています。このため worktree の中で `npm test` を実行すると、テストが 1 件も見つかりません。worktree の中では次のように除外パターンを上書きして実行してください。

```bash
npx cross-env TZ=Asia/Tokyo jest --forceExit --runInBand \
  --testPathIgnorePatterns "/node_modules/" "/firebase-functions/lib/" "/e2e/"
```

`--testPathIgnorePatterns` は後ろに続く引数をすべてパターンとして受け取ります。特定のファイルだけを実行するときは、パターンを `=` でつないで 1 つの引数にし、ファイルは `--runTestsByPath` で指定してください（そうしないとファイルのパスまで除外パターンになり、`e2e/` を含む全テストが実行されます）。

```bash
npx cross-env TZ=Asia/Tokyo jest --forceExit \
  --testPathIgnorePatterns=/node_modules/ \
  --runTestsByPath src/features/routine/__tests__/storageMigration.test.ts
```

**結合テスト（`*.integration.test.ts`）**

複数のモジュールをまたぐ流れは、ファイル名を `*.integration.test.ts(x)` にした結合テストで確かめます。単体テストと違い、原則として各機能の `storage.ts` はモックせず、jsdom の localStorage に実際に読み書きさせます（`groupRoutineConflictCheck` はフォームの元データの取得だけをモックしています）。

| ファイル                                                                           | 確かめる流れ                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/sync/__tests__/snapshotRoundTrip.integration.test.ts`                | ローカル保存 → アップロード → 履歴の一覧・復元・削除 → ダウンロード。ログイン前データのユーザー別キーへの移行、復元で変更ありの表示が消えること、最新の履歴を削除すると 1 つ前の内容がダウンロードされること、履歴が新しい 5 件だけ残ることを確かめる。 |
| `src/features/routine/__tests__/routineInitialization.integration.test.ts`         | 保存済みルーティン → 旧形式の移行・グループ修復 → 今日の完了状態の反映 → 保存し直し。保存データに完了状態が残らないこと、2 回目の起動では何もしないこと、他のユーザーのキーに触れないことを確かめる。                                                   |
| `src/features/routine/__tests__/repairCorruptedGroupRoutines.integration.test.ts`  | 汚染されたグループデータが起動時に修復されること。                                                                                                                                                                                                      |
| `src/features/routine/__tests__/groupRoutineConflictCheck.integration.test.tsx`    | ルーティン編集フォームで、グループルーティンの曜日を変えたときの時刻の重なりの判定。                                                                                                                                                                    |
| `src/features/sync/__tests__/workoutExercises.integration.test.ts`                 | 運動の種目データの同期・バックアップ・復元。                                                                                                                                                                                                            |
| `src/features/budget/__tests__/useBudgetAllowanceItemsReload.integration.test.tsx` | 収入・固定費・変動費の一覧を読み直した後の追加で、読み直した項目が残ること（古い state を基に保存しないこと）と、開いたフォームが閉じること。                                                                                                           |

Firestore を使う流れでは、`snapshotRoundTrip.integration.test.ts` のように `firebase/firestore` をメモリ上の Map で動くフェイクに置き換え、`@/lib/firebase` の `getOrCreateUser` は固定のユーザーを返すようにします。実際の Firebase には接続しません。

**テストの後片付け**

`jest.config.ts` は `restoreMocks` を設定していないため、差し替えたものはテストファイルの中で戻します。戻さないと、同じファイルの後続のテストが差し替えられた値のまま動き、順序によって結果が変わります。

- `global` / `window` / `navigator` / `document` の値の差し替えと、それらのオブジェクトのスパイ（`jest.spyOn(window, "confirm")` など）は、`afterEach` で戻します。`Date.prototype` などのプロトタイプのスパイも同じです。
- `Object.defineProperty` で差し替えるときは、先に `Object.getOwnPropertyDescriptor` で元の定義を控えて `afterEach` で戻します。元の定義が無ければ `delete` します。差し替えには `configurable: true` を付けます。
- `jest.useFakeTimers()` を使ったら `afterEach` で `jest.useRealTimers()` に戻します。
- そのテストの中だけで作ったオブジェクト（DOM 要素やイベント）のスパイは、戻さなくてかまいません。

**外部から入るデータの失敗経路のテスト**

localStorage・Firestore・fetch の応答・Service Worker のメッセージを扱う関数は、成功だけでなく、例外・拒否された Promise・JSON として読めない本文・JSON としては正しいが形が違う値（`null`、配列とオブジェクトの取り違え、必須フィールドの欠落）のテストも書きます。

| ファイル                                                                       | 確かめる失敗経路                                                                                         |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `src/features/weather/__tests__/weather-api/fetchWeatherData.failures.test.ts` | 天気 API の通信失敗・HTTP エラー・読めない本文・`daily` / `hourly` の欠落                                |
| `src/features/weather/__tests__/weather-api/getLocationName.test.ts`           | 地名 API の失敗時に座標の表示へ戻ること、地名の項目の優先順位                                            |
| `src/features/sync/__tests__/remoteStatus.refresh.test.ts`                     | リモートの同期状態の確認で、ユーザー・ドキュメントの取得失敗や不正な `lastModified` を握りつぶすこと     |
| `src/features/sync/__tests__/statusStore.test.ts`                              | 保存された同期状態が壊れている・オブジェクトでない・読み出しが例外になるときにデフォルト値へ戻ること     |
| `src/features/test-matrix/__tests__/storage.test.ts`                           | テストマトリクスの保存データの形が違うときに初期値へ戻ること                                             |
| `src/features/routine/__tests__/routineHelpers.sync.test.ts`                   | ルーティンのサーバー送信で、通信失敗・読めない本文・`success` が厳密に `true` でない応答を失敗とすること |
| `firebase-functions/src/agentApi/__tests__/operations/dataAccess.test.ts`      | 同期ドキュメントのフィールドが想定と違う形のとき、空の配列・オブジェクトとして読むこと                   |

検証が無く例外になる箇所は、テストで現状の振る舞いを固定し、その旨をコメントに残します。検証を足すと振る舞いが変わる場合は、テストの追加とは分けて扱います。テストの書き方の全体は [新しく参加する開発者向けガイド](../01-getting-started/ONBOARDING.md#4-テストの書き方) にまとめています。

**サーバー側（`window` が無い環境）の分岐のテスト**

フロントエンドのテストは既定で jsdom 環境で動きます。`typeof window === "undefined"` の分岐を確かめるときは、ファイル先頭に `@jest-environment node` を書いた別ファイル（例: `src/lib/firebase-modules/__tests__/auth.server.test.ts`、`src/lib/storage/core-modules/__tests__/storageWrite.server.test.ts`）に分けます。

**Cloud Functions のテスト**

`firebase-functions/src/**/__tests__/` のテストは、原則として `@jest-environment node` で実行します。Firestore・FCM・ロガーは `jest.mock` やフェイク（`firebase-functions/src/agentApi/__tests__/fakeFirestore.ts`）に置き換え、実際の Firebase には接続しません。

### 3. E2Eテスト

Playwrightで、実際にブラウザを操作する主要フローを検証します（`e2e/`配下）。

```bash
# E2Eテスト実行（Playwrightがdevサーバーを自動起動）
npm run test:e2e

# UIモードで実行（ブラウザ操作の様子を確認しながらデバッグ）
npm run test:e2e:ui
```

**カバーしているフロー**

| ファイル                            | 内容                                                 |
| ----------------------------------- | ---------------------------------------------------- |
| `e2e/routine-creation.spec.ts`      | 匿名ログイン → ルーティン作成 → 一覧表示             |
| `e2e/todo-list.spec.ts`             | Todoリスト作成 → Todo追加 → 完了操作と進捗更新       |
| `e2e/settings-persistence.spec.ts`  | 設定変更 → リロード後も値が保持される                |
| `e2e/menu-navigation.spec.ts`       | ハンバーガーメニューからの各ページ遷移               |
| `e2e/budget-allowance.spec.ts`      | 家計簿の収入・固定費・変動費項目作成と入力確定       |
| `e2e/data-transfer.spec.ts`         | データ管理画面での JSON エクスポートとインポート復元 |
| `e2e/preset-edit-sort.spec.ts`      | プリセット編集・時刻順並び替えの動作検証             |
| `e2e/storage-write-failure.spec.ts` | ストレージ書き込み失敗時のエラー通知と状態維持       |

ログインやメニュー遷移など共通の操作は `e2e/helpers.ts` にまとめています。

- Firebase未設定でもlocalhostのローカル疑似ログイン（`NEXT_PUBLIC_ENABLE_LOCAL_AUTH`）で動作するため、Firebase認証情報の設定は不要です。
- CIでは`chromium`のみ実行しています。

### 4. ビルド・一括検証テスト

```bash
# 型チェック（本体 + テスト用 tsconfig）
npm run typecheck

# Lintチェック（警告0許容）
npm run lint

# Tailwind shorthand 構文チェック
npm run tailwind:scan

# プロダクションビルドテスト
npm run build

# 高速一括検証（tailwind:scan + lint + typecheck + typecheck:functions + test）
npm run verify:fast

# フル一括検証（verify:fast + build）
npm run verify
```

## 📋 テストマトリクスの使い方

### ステータス凡例

| ステータス | 意味                         |
| ---------- | ---------------------------- |
| ✅         | 実装済み                     |
| 🔶         | BETA（開発途中・不安定）     |
| 🚧         | 開発予定（未実装・実装途中） |
| ⬜         | 未確認                       |

### チェック手順

1. [test-matrix.md](./test-matrix.md) を開く
2. テスト対象の機能を選択
3. PCとスマホで動作確認
4. ステータス欄にチェック結果を記入

### 注意が必要な機能

- **🔶 通知機能**: BETA版・不安定（Service Worker / FCM 設定が必要）

## 🔍 テスト観点

### 基本動作

- [ ] 各機能が正常に動作するか
- [ ] エラーハンドリングが適切か
- [ ] ローディング表示が適切か

### データ永続化

- [ ] LocalStorageに正しく保存されるか
- [ ] ページリロード後もデータが保持されるか
- [ ] Firestore同期が正常に動作するか

### UI/UX

- [ ] レスポンシブデザインが機能するか
- [ ] アクセシビリティが確保されているか
- [ ] エラーメッセージが分かりやすいか

### ブラウザ互換性

- [ ] Chrome（最新版）
- [ ] Safari（最新版）
- [ ] Firefox（最新版）
- [ ] モバイルブラウザ（iOS Safari、Android Chrome）

## 📖 関連ドキュメント

- [機能仕様](../04-reference/features.md) - 各機能の詳細仕様
- [開発ガイドライン](../02-development/) - コーディング規約

---

[📖 ドキュメントトップに戻る](../)
