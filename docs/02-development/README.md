# 開発ガイドライン

このアプリの開発におけるコーディング規約とベストプラクティスです。

## 📚 ドキュメント一覧

### アーキテクチャ設計

- **[architecture.md](./architecture.md)** - システム全体構成・データ同期モデル・セキュリティ設計
  - クライアント・Firebase・外部API（GitHub・エージェント）の全体連携図
  - オフラインファースト＆LocalStorage主導の同期メカニズム
  - レイヤード構成と依存関係ルール
  - AI エージェント API とセキュリティ設計

### コーディング規約

- **[coding-standards.md](./coding-standards.md)** - React/Next.jsのコーディング規約
  - ディレクトリ構成の原則
  - 依存関係ルール
  - ViewModelパターンの適用
  - コメント規約（日本語推奨）

### リファクタリング

- **[refactoring-guide.md](./refactoring-guide.md)** - コンポーネントのリファクタリングルール
  - 80行以内の原則
  - ViewModelパターン（locales/ja.json + helpers.ts）
  - 国際化対応の実装方法
  - 8ステップのリファクタリング手順

### レビューの教訓

- **[review-lessons.md](./review-lessons.md)** - レビューで指摘された問題の、発生条件・原因・修正の汎用的な整理
  - 入力の扱い、データの整合、原子性、セキュリティルール、UI・アクセシビリティ、テスト、構造、運用
  - レビュー用チェックリスト

### 調査記録・設計書・運用ガイド

- **[drag-reorder-investigation.md](./drag-reorder-investigation.md)** - ルーティン並び替え（ドラッグ＆ドロップ）不安定問題の調査・修正記録
  - `touchAction: "pan-y"` とブラウザスクロールの競合が根本原因
  - dnd-kit TouchSensor の仕組みと制約
- **[sync-indicator-investigation.md](./sync-indicator-investigation.md)** - 同期インジケーター・状態表示の挙動調査と改善
- **[bug-report-feature-plan.md](./bug-report-feature-plan.md)** - 不具合報告機能の設計と GitHub Issue 自動起票のアーキテクチャ
- **[bug-report-secrets-config.md](./bug-report-secrets-config.md)** - Cloud Functions の GitHub Token / Secret 設定手順ガイド
- **[github-actions-guide.md](./github-actions-guide.md)** - GitHub Actions CI/CD パイプラインの構成と運用ガイド
- **[storybook-guide.md](./storybook-guide.md)** - Storybook コンポーネントカタログガイド（起動・100以上のStory運用）
- **[todo-item-action-menu-unification-plan.md](./todo-item-action-menu-unification-plan.md)** - Todo アイテム操作メニューの共通化・UI 統一設計
- **[2026-10-09-workout-srp-review.md](./2026-10-09-workout-srp-review.md)** - 運動記録モジュールの単一責任原則（SRP）リファクタリングとレビュー記録

## 🎯 開発の基本方針

### 1. ディレクトリ構成

```
src/
├── app/            # Next.js App Router
├── components/     # 共通UIコンポーネント
├── config/         # アプリ設定
├── features/       # 機能別フォルダ（ドメイン単位）
├── hooks/          # 共通カスタムフック
├── layouts/        # レイアウト・ヘッダーコンポーネント
├── lib/            # ユーティリティ
├── services/       # 認証などのサービス
└── types/          # 型定義
```

### 2. 依存関係の原則

- **app** → layouts, features, components, hooks を参照可能
- **features** → components, hooks を参照可能
- **components と hooks** → layouts, features, app を参照不可（独立性を保つ）

### 3. ViewModelパターン

- **テキスト定数** → `locales/ja.json`
- **ビジネスロジック** → `helpers.ts`
- **UIコンポーネント** → 状態管理とロジック呼び出しのみ

### 4. コメント規約

- 関数・クラス・複雑なロジックには**日本語**でコメントを記述
- JSDocコメントも日本語推奨

## 🛠️ 開発ワークフロー

1. **新機能開発前** → [coding-standards.md](./coding-standards.md) で規約を確認
2. **コード肥大化時** → [refactoring-guide.md](./refactoring-guide.md) でリファクタリング
3. **テスト実行** → [テストガイド](../03-testing/) でテスト方法を確認
4. **機能仕様確認** → [リファレンス](../04-reference/) で既存機能を確認

## 📖 関連ドキュメント

- [機能リファレンス](../04-reference/features.md) - 実装済み機能の詳細
- [テストガイド](../03-testing/) - テスト方法とマトリクス

---

[📖 ドキュメントトップに戻る](../)
