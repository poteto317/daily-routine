# セットアップガイド

プロジェクトを始めるための初期セットアップドキュメントです。

## 📚 ドキュメント一覧

### はじめに

- **[ONBOARDING.md](./ONBOARDING.md)** - 新しく参加する開発者向けガイド
  - 読む順番と、Firebase なしで動かすまでの手順
  - 画面切り替え・ログイン・保存・起動時の初期化・同期の流れと入口のファイル
  - テストの書き方（失敗経路・後始末・worktree での実行）
  - よくある落とし穴

### 環境構築

- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - プロジェクトのセットアップ手順チェックリスト
  - Node.js、Firebase、Vercelのインストール
  - 環境変数の設定
  - 依存関係のインストール
  - ローカル開発環境の起動

### クラウド機能

- **[SYNC_SETUP.md](./SYNC_SETUP.md)** - クラウド同期機能のセットアップガイド
  - Firebase Firestoreの設定
  - セキュリティルールの設定
  - 同期機能の使い方

### 開発環境

- **[vscode_extensions.md](./vscode_extensions.md)** - 推奨VSCode拡張機能リスト
  - 必須ツール
  - 開発体験向上ツール
  - 推奨設定

## 🚀 セットアップの流れ

1. **全体の把握** → [ONBOARDING.md](./ONBOARDING.md) を読む
2. **環境構築** → [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) を順番に進める
3. **開発環境** → [vscode_extensions.md](./vscode_extensions.md) で拡張機能をインストール
4. **クラウド機能** → [SYNC_SETUP.md](./SYNC_SETUP.md) でFirebase設定（オプション）
5. **次のステップ** → [開発ガイドライン](../02-development/) でコーディング規約を確認

## 💡 ヒント

- 初めての方は **ONBOARDING.md** で全体を把握してから **SETUP_CHECKLIST.md** に進んでください
- クラウド同期を使わない場合、**SYNC_SETUP.md** はスキップして構いません
- VSCode以外のエディタを使用する場合、**vscode_extensions.md** は参考程度にご覧ください

---

[📖 ドキュメントトップに戻る](../)
