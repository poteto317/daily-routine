# React開発におすすめのVS Code拡張機能リスト

React (TypeScript) 開発の生産性を最大限に高めるための推奨拡張機能リストです。

> 💡 このプロジェクトでの開発を効率化するための拡張機能です。

## 1. 必須ツール（効率・品質）

これらはReact開発における「標準装備」といえるツールです。

| 拡張機能名                                 | 用途       | 特徴                                                       |
| :----------------------------------------- | :--------- | :--------------------------------------------------------- |
| **ES7+ React/Redux/React-Native snippets** | スニペット | `rafce` 等のショートカットでコンポーネントの雛形を爆速生成 |
| **Prettier - Code formatter**              | 自動整形   | コードのインデントや改行を保存時に自動で統一               |
| **ESLint**                                 | 静的解析   | 文法ミスや潜在的なバグをリアルタイムで指摘                 |

## 2. 開発体験（DX）の向上

コーディング中のストレスを減らし、デバッグを高速化します。

- **Auto Rename Tag**
  - 開始タグを修正すると、対応する閉じタグも自動で修正されます。JSXの編集に不可欠です。
- **Pretty TypeScript Errors**
  - TypeScriptの読みづらいエラーメッセージを、見やすく装飾して表示します。
- **Error Lens**
  - エラー内容を行末に直接表示。マウスホバーの手間を省きます。

## 3. スタイリング・視覚効果

- **Tailwind CSS IntelliSense**
  - Tailwind CSSを使用する場合のクラス名補完とプレビュー。
- **Material Icon Theme**
  - ファイルツリーのアイコンを視認性の高いものに変更し、ファイルの種類を判別しやすくします。

## 4. Git管理

- **GitLens**
  - コードの各行のコミット履歴をエディタ上に表示。
- **Git Graph**
  - Gitのログを視覚的なグラフで確認・操作。

---

## 推奨設定 (settings.json)

拡張機能を最大限活かすために、VS Codeの `settings.json` に以下の設定を追加することをお勧めします。

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 📖 関連ドキュメント

- [開発ガイドライン](../02-development/) - コーディング規約とリファクタリング
- [セットアップチェックリスト](./SETUP_CHECKLIST.md) - 環境構築手順

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年2月17日
