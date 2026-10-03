# リファレンス

アプリケーションの機能仕様と技術仕様のリファレンスです。

## 📚 ドキュメント一覧

### 機能仕様

- **[agent-api.md](./agent-api.md)** - AI エージェント向け API（家計簿・ジャーナルの CRUD）のリファレンス
- **[features.md](./features.md)** - 実装済み全機能の詳細ドキュメント
  - 18機能の完全仕様
  - 各機能の使い方
  - 技術仕様
  - データ構造
  - ファイル構成

## 📖 機能カテゴリ

### コア機能

- 🔄 ルーティン管理
- 📋 ルーティンプリセット管理

### 分析・振り返り機能

- 🗓️ 達成カレンダー
- 📊 統計・レポート

### ライフログ機能

- 💰 家計簿（BETA）
- 📔 ジャーナル
- 🍽️ 食事記録（開発予定）
- ⚖️ 体重記録
- 🌤️ 天気予報

### 生産性向上機能

- 🍅 ポモドーロタイマー（BETA）
- ⏱️ 作業記録タイマー（BETA）

### タスク管理機能

- 📝 Todoリスト（BETA）

### システム機能

- 🔐 認証
- ☁️ クラウド同期
- 🔔 通知機能（BETA・不安定）
- ⚙️ 設定

### 開発・管理機能

- 📋 機能テストマトリクス
- 👥 アカウント管理（管理者専用）

## 🏗️ 技術スタック

### フロントエンド

- Next.js 16.1.6（App Router）
- React 19.2.3
- TypeScript（strict mode）
- Tailwind CSS 4

### バックエンド

- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Messaging（BETA・不安定）
- Firebase Cloud Functions

### アーキテクチャ

- **ViewModelパターン**: テキスト定数（locales/ja.json）+ ロジック（helpers.ts）
- **国際化対応**: 各機能に locales/ja.json を配置
- **データ永続化**: LocalStorage + Firestore同期

## 💡 使い方

### 機能仕様を確認したい

→ [features.md](./features.md) で該当機能を検索

### 新機能を実装したい

→ [開発ガイドライン](../02-development/) でコーディング規約を確認

### 既存機能をテストしたい

→ [テストガイド](../03-testing/) でテスト方法を確認

## 📊 データ構造

### LocalStorage キー

- `routines` - ルーティン登録データ
- `achievementHistory` - 達成履歴データ
- `expenses` - 支出記録
- `journalEntries` - ジャーナル記録
- その他各機能のデータキー

### Firestore コレクション

```
users/{userId}/
  ├─ profile/
  ├─ syncMetadata/
  ├─ syncData/
  │   ├─ routines
  │   ├─ todayProgress
  │   ├─ achievementHistory
  │   └─ settings
  └─ fcmTokens/
```

## 📖 関連ドキュメント

- [開発ガイドライン](../02-development/) - コーディング規約
- [テストガイド](../03-testing/) - テスト方法
- [セットアップガイド](../01-getting-started/) - 環境構築

---

[📖 ドキュメントトップに戻る](../)
