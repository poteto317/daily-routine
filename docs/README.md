# ドキュメント

このフォルダには、プロジェクトの各種ドキュメントが含まれています。

## 📚 ドキュメント構成

ドキュメントは開発フローに沿って4つのカテゴリに整理されています。

### 🚀 [01. セットアップガイド](./01-getting-started/)

プロジェクトを始めるための初期セットアップドキュメント。

- **[ONBOARDING.md](./01-getting-started/ONBOARDING.md)** - 新しく参加する開発者向けガイド（読む順番・Firebase なしでのセットアップ・主要な流れ・テストの書き方・よくある落とし穴）
- **[SETUP_CHECKLIST.md](./01-getting-started/SETUP_CHECKLIST.md)** - プロジェクトのセットアップ手順チェックリスト
- **[SYNC_SETUP.md](./01-getting-started/SYNC_SETUP.md)** - クラウド同期機能のセットアップガイド
- **[vscode_extensions.md](./01-getting-started/vscode_extensions.md)** - 推奨VSCode拡張機能リスト

### 💻 [02. 開発ガイドライン](./02-development/)

開発におけるコーディング規約とベストプラクティス。

- **[architecture.md](./02-development/architecture.md)** - システム全体構成・オフライン同期・セキュリティ設計
- **[coding-standards.md](./02-development/coding-standards.md)** - React/Next.jsのコーディング規約
- **[refactoring-guide.md](./02-development/refactoring-guide.md)** - コンポーネントのリファクタリングルール
- **[review-lessons.md](./02-development/review-lessons.md)** - レビュー指摘の教訓集（発生条件・原因・修正・チェックリスト）
- **[github-actions-guide.md](./02-development/github-actions-guide.md)** - GitHub Actions CI/CD パイプラインガイド
- **[storybook-guide.md](./02-development/storybook-guide.md)** - Storybook コンポーネントカタログ運用ガイド

### 🧪 [03. テストガイド](./03-testing/)

アプリケーションのテスト方法とマトリクス。

- **[README.md](./03-testing/README.md)** - ユニットテスト、E2Eテスト（Playwright）、ビルドテストの実行ガイド
- **[test-matrix.md](./03-testing/test-matrix.md)** - 機能テストマトリクス（全27セクション×250項目以上）

### 📖 [04. リファレンス](./04-reference/)

機能仕様と技術仕様のリファレンス。

- **[openapi.yaml](./04-reference/openapi.yaml)** - 実装済み HTTP API の OpenAPI 3.0.3 定義
- **[agent-api.md](./04-reference/agent-api.md)** - AI エージェント向け API（家計簿・ジャーナル・Todo・運動記録の CRUD）のリファレンス
- **[features.md](./04-reference/features.md)** - 実装済み全機能の詳細ドキュメント（運動記録、不具合報告、APIキー管理、Todo管理、同期履歴管理等を含む完全仕様）

---

## 🎯 役割別ガイド

### 新規メンバーの方

1. **[新しく参加する開発者向けガイド](./01-getting-started/ONBOARDING.md)** で読む順番と全体の流れを把握
2. **[セットアップガイド](./01-getting-started/)** で環境構築
3. **[機能リファレンス](./04-reference/features.md)** でアプリの全体像を把握
4. **[開発ガイドライン](./02-development/)** でコーディング規約を確認

### 開発者の方

1. **[開発ガイドライン](./02-development/)** でコーディング規約を確認
2. **[リファレンス](./04-reference/)** で既存機能の仕様を確認
3. **[テストガイド](./03-testing/)** で実装後のテスト方法を確認

### テスト担当者の方

1. **[テストマトリクス](./03-testing/test-matrix.md)** でテスト項目を確認
2. **[機能リファレンス](./04-reference/features.md)** で各機能の仕様を把握

---

## 📋 開発フロー

```
1. セットアップ
   └─→ 01-getting-started/

2. 開発
   └─→ 02-development/

3. テスト
   └─→ 03-testing/

4. リファレンス参照
   └─→ 04-reference/
```

---

プロジェクトの概要については、ルートディレクトリの [README.md](../README.md) を参照してください。

---

**最終更新日**: 2026年11月11日
