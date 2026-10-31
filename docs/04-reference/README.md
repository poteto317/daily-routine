# リファレンス

アプリケーションの機能仕様と技術仕様のリファレンスです。

## 📚 ドキュメント一覧

### 機能仕様

- **[openapi.yaml](./openapi.yaml)** - 実装済み HTTP API の OpenAPI 3.0.3 定義（認証・入力・応答・エラー）
- **[agent-api.md](./agent-api.md)** - AI エージェント向け API（家計簿・ジャーナル・Todo・運動記録の CRUD）のリファレンス
- **[features.md](./features.md)** - 実装済み全機能の詳細ドキュメント
  - 実装済み全機能の完全仕様
  - 各機能の使い方
  - 技術仕様
  - データストレージ構造
  - ファイル構成

## 📖 機能カテゴリ

### コア機能

- 🔄 ルーティン管理
- 📋 ルーティンプリセット管理

### 分析・振り返り機能

- 🗓️ 達成カレンダー
- 📊 統計・レポート（週間目標・ストリーク）

### ライフログ機能

- 💰 家計簿
- 📔 ジャーナル
- 💪 運動記録（BETA）
- 🍽️ 食事記録（BETA）
- ⚖️ 体重記録（BETA）
- 🌤️ 天気予報

### 生産性向上機能

- 🍅 ポモドーロタイマー（BETA）
- ⏱️ 作業記録タイマー（BETA）

### タスク管理機能

- ✅ Todoリスト
- 📝 Todoリスト管理

### システム機能

- 🔐 認証（匿名認証・ローカル開発認証）
- ☁️ クラウド同期
- 🐛 不具合報告（GitHub Issue 自動起票）
- 🔑 APIキー管理（設定画面・CLI）
- 🔔 通知機能（BETA・不安定）
- ⚙️ 設定（機能表示、外観テーマ、メニュー並び替え等）
- 📱 PWA・オフライン対応（Service Worker キャッシュ）
- ⚠️ ストレージ書き込みエラー通知（フェイルセーフ警告バナー）

### 開発・管理機能

- 📋 機能テストマトリクス
- 👥 アカウント管理（管理者専用）
- ☁️ 同期履歴管理（スナップショット復元）

## 🏗️ 技術スタック

### フロントエンド

- Next.js 16.3.0（App Router）
- React 19.2.3
- TypeScript 5（strict mode）
- Tailwind CSS 4

### バックエンド

- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Messaging（BETA・不安定）
- Firebase Cloud Functions（Node.js 24）
- GitHub REST API（不具合報告 Issue 起票）

### アーキテクチャ

- **ViewModelパターン**: テキスト定数（`locales/ja.json`）+ ロジック（`helpers.ts`）
- **Feature-Based Architecture**: 機能ごとのディレクトリ分離
- **データ永続化**: LocalStorage + Firestore 同期 + スナップショット履歴
- **AI エージェント連携**: `agentApi` (REST API) + API キー認証

## 💡 使い方

### 機能仕様を確認したい

→ [features.md](./features.md) で該当機能を検索

### API 仕様を確認したい

→ [agent-api.md](./agent-api.md) または [openapi.yaml](./openapi.yaml) を参照

### 新機能を実装したい

→ [開発ガイドライン](../02-development/) でコーディング規約を確認

### 既存機能をテストしたい

→ [テストガイド](../03-testing/) でテスト方法を確認

## 📊 データ構造

### LocalStorage キー

- `daily-routines` - ルーティン登録データ
- `daily-progress` - 今日のルーティン進捗
- `daily-history` - ルーティン達成履歴データ
- `budget-data` - 家計簿データ
- `journal-history` - ジャーナル記録
- `workout-records` - 運動記録データ
- `workout-exercises` - 運動種目マスター
- `todo-lists` - Todoリストデータ
- その他各機能のデータキー（詳細は [features.md](./features.md#localstorage-キー一覧) 参照）

### Firestore コレクション

```
users/{userId}                         # 同期データ本体ドキュメント
  └─ syncSnapshots/{snapshotId}        # スナップショット履歴（最大5件）
routines/{userId}/...                  # 通知用データ
accounts/{accountId}                   # アカウント管理用データ
bugReports/{reportId}                  # 不具合報告データ（GitHub Issue 連携）
apiKeys/{keyHash}                      # AI エージェント API キー
```

## 📖 関連ドキュメント

- [開発ガイドライン](../02-development/) - コーディング規約
- [テストガイド](../03-testing/) - テスト方法
- [セットアップガイド](../01-getting-started/) - 環境構築

---

[📖 ドキュメントトップに戻る](../)
