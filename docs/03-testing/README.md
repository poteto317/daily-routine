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
