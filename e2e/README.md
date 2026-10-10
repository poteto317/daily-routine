# E2E テスト (`e2e/`)

Playwright を使用したブラウザ自動テストスイートです。

## 概要

実際のブラウザ（Chromium）を操作し、ユーザーの主要な利用シナリオ（ログイン、作成、編集、並び替え、データ永続化、エラーハンドリング等）がエンドツーエンドで正常に機能することを検証します。

## 実行方法

```bash
# ヘッドレスモードで全 E2E テストを実行（開発サーバーは自動起動されます）
npm run test:e2e

# UI モードで実行（テストステップの可視化、時間軸での DOM 状態確認、デバッグ）
npm run test:e2e:ui
```

### 前提条件と認証の仕組み

- Firebase 未設定の環境でも動作するよう、ローカル疑似認証（`NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`）に対応しています。
- 各テストの開始前に `e2e/helpers.ts` の `loginAnonymously` および `clearStorageOnFirstNavigation` を呼び出し、独立したクリーンな状態でテストを実行します。

---

## テストスイート一覧

| ファイル                        | テスト内容                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `routine-creation.spec.ts`      | 匿名ログインからルーティン新規作成、バリデーション、一覧表示までのメインフロー |
| `todo-list.spec.ts`             | Todo リスト作成、アイテム追加、インデント、完了チェック、進捗バー更新          |
| `settings-persistence.spec.ts`  | 設定変更（テーマやポモドーロ時間など）後のリロードによる LocalStorage 永続化   |
| `menu-navigation.spec.ts`       | ヘッダーのハンバーガーメニューからの各機能ページへの正常遷移                   |
| `budget-allowance.spec.ts`      | 家計簿における定期収入・固定費・変動費の項目作成、キーボード確定挙動           |
| `data-transfer.spec.ts`         | 設定画面での JSON バックアップエクスポートおよびインポート復元フロー           |
| `preset-edit-sort.spec.ts`      | ルーティンプリセットの編集画面におけるルーティンの時刻順並び替え動作           |
| `storage-write-failure.spec.ts` | LocalStorage 容量超過・書き込み失敗時のエラーバナー通知とフォーム入力の保持    |

---

## 共通ヘルパー (`e2e/helpers.ts`)

テスト間で共通利用されるヘルパー関数群です：

- `loginAnonymously(page)`: 匿名ユーザーとしてのログイン処理
- `navigateViaMenu(page, label)`: ハンバーガーメニューを開いて指定ラベルのページへ遷移
- `clearStorageOnFirstNavigation(page)`: テスト開始時にブラウザの localStorage を初期化

---

## 関連ドキュメント

- [テストガイド](../docs/03-testing/README.md)
- [機能テストマトリクス](../docs/03-testing/test-matrix.md)
