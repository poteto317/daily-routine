# ドキュメント

このフォルダには、プロジェクトの各種ドキュメントが含まれています。

## 📚 ドキュメント構成

ドキュメントは開発フローに沿って4つのカテゴリに整理されています。

### 🚀 [01. セットアップガイド](./01-getting-started/)

プロジェクトを始めるための初期セットアップドキュメント。

- **[SETUP_CHECKLIST.md](./01-getting-started/SETUP_CHECKLIST.md)** - プロジェクトのセットアップ手順チェックリスト
- **[SYNC_SETUP.md](./01-getting-started/SYNC_SETUP.md)** - クラウド同期機能のセットアップガイド
- **[vscode_extensions.md](./01-getting-started/vscode_extensions.md)** - 推奨VSCode拡張機能リスト

### 💻 [02. 開発ガイドライン](./02-development/)

開発におけるコーディング規約とベストプラクティス。

- **[coding-standards.md](./02-development/coding-standards.md)** - React/Next.jsのコーディング規約
- **[refactoring-guide.md](./02-development/refactoring-guide.md)** - コンポーネントのリファクタリングルール
- **[review-lessons.md](./02-development/review-lessons.md)** - レビュー指摘の教訓集（発生条件・原因・修正・チェックリスト）
- **[drag-reorder-investigation.md](./02-development/drag-reorder-investigation.md)** - ルーティン並び替えドラッグ不安定問題の調査・修正記録

### 🧪 [03. テストガイド](./03-testing/)

アプリケーションのテスト方法とマトリクス。

- **[test-matrix.md](./03-testing/test-matrix.md)** - 機能テストマトリクス（120項目以上）

### 📖 [04. リファレンス](./04-reference/)

機能仕様と技術仕様のリファレンス。

- **[openapi.yaml](./04-reference/openapi.yaml)** - 実装済み HTTP API の OpenAPI 3.0.3 定義
- **[agent-api.md](./04-reference/agent-api.md)** - AI エージェント向け API（家計簿・ジャーナル・Todo の CRUD）のリファレンス
- **[features.md](./04-reference/features.md)** - 実装済み全18機能の詳細ドキュメント

---

## 🎯 役割別ガイド

### 新規メンバーの方

1. **[セットアップガイド](./01-getting-started/)** でまず環境構築
2. **[機能リファレンス](./04-reference/features.md)** でアプリの全体像を把握
3. **[開発ガイドライン](./02-development/)** でコーディング規約を確認

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

**最終更新日**: 2026年3月31日
