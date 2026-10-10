# 開発・運用補助ツール (`tools/`)

デイリールーティン管理アプリの開発・ビルド・運用を補助するスクリプト群です。

## 概要

本ディレクトリには、環境設定・コード品質検証・PWA アセット生成・エージェント API キー管理などを担うツールが配置されています。主要なスクリプトは `package.json` の npm スクリプトとして登録されています。

| ツール                               | npm コマンド                    | 役割                                                     |
| ------------------------------------ | ------------------------------- | -------------------------------------------------------- |
| `api-key/cli.mjs`                    | `npm run <private-ops> -- <cmd>`      | AI エージェント API 用キーの発行・確認・失効 CLI         |
| `generate-firebase-messaging-sw.mjs` | `npm run generate:fcm-sw`       | `.env.local` から FCM Service Worker を自動生成          |
| `tailwind/check-shorthand.mjs`       | `npm run tailwind:scan` / `fix` | Tailwind CSS v4 の shorthand クラス構文の検査と自動修正  |
| `generate-icons.mjs`                 | `npm run generate:icons`        | PWA 用アイコン（各サイズ・マスク可能アイコン）の自動生成 |
| `verify-icons-in-sync.mjs`           | `npm run verify:icons`          | 生成されたアイコンと定義の整合性検証                     |

---

## ツール詳細

### 1. API キー管理 CLI (`tools/api-key/cli.mjs`)

開発環境や CI、AI エージェント作業環境から Firebase アカウントと連携し、API キーを発行・管理するための CLI です。

```bash
# アカウント一覧を確認
npm run <private-ops> -- users --project <projectId> [redacted]

# 指定メールのアカウントにキーを発行し、.env.local へ安全に書き出す
npm run <private-ops> -- issue --email user@example.com --project <projectId> \
  [redacted] --env-file .env.local

# 発行済みキーの一覧確認
npm run <private-ops> -- list --email user@example.com --project <projectId> [redacted]

# キーの一括失効
npm run <private-ops> -- revoke --email user@example.com --project <projectId> [redacted]
```

**主なオプション:**

- `--project <projectId>`: 対象 Firebase プロジェクト ID（省略時は `GOOGLE_CLOUD_PROJECT` 環境変数を使用）
- `--email <email>` / `--uid <uid>`: 紐づけ先アカウントの指定
- `[redacted]`: `firebase login` 済みの認証情報をメモリ上で直接利用（サービスアカウントキー不要）
- `--replace`: 発行時に既存のキーを失効させて入れ替える
- `--env-file <path>`: 発行したキーを `AGENT_API_KEY` および `AGENT_API_BASE_URL` として指定ファイルに権限 600 で追記/更新

---

### 2. Firebase Messaging SW 自動生成 (`tools/generate-firebase-messaging-sw.mjs`)

公開リポジトリに実環境の Firebase 秘密設定（API Key 等）を残さないため、Service Worker をビルド・起動時に動的生成します。

- **入力**: `public/firebase-messaging-sw.template.js` および `.env.local`
- **出力**: `public/firebase-messaging-sw.js`（Git 管理外）
- **実行契機**: `npm run dev`, `npm run build`, `npm start` の実行前に自動実行

---

### 3. Tailwind Shorthand チェッカー (`tools/tailwind/check-shorthand.mjs`)

Tailwind CSS v4 における shorthand クラス（冗長なプロパティ定義）を静的解析し、標準的なクラスへの統一を支援します。

```bash
# 検査のみ（CI や npm run verify で実行）
npm run tailwind:scan

# 自動修正（--fix オプション付きで実行）
npm run tailwind:fix
```

---

### 4. PWA アイコン生成・検証 (`tools/generate-icons.mjs`, `verify-icons-in-sync.mjs`)

PWA マニフェストおよび各種デバイス（iOS, Android）で必要とされるアプリアイコンを統一ルールで生成・検証します。

- **`tools/generate-icons.mjs`**: 各種解像度の PNG アイコン、およびセーフゾーンを考慮したマスク可能（maskable）アイコンを生成
- **`tools/verify-icons-in-sync.mjs`**: 生成された画像群と `src/config` や `manifest.json` の設定が完全に同期しているかを検証（テスト時に実行）

---

## 関連ドキュメント

- [AI エージェント向け API 仕様](../（非公開のエージェント API 仕様）)
- [セットアップチェックリスト](../docs/01-getting-started/SETUP_CHECKLIST.md)
- [開発ガイドライン](../docs/02-development/README.md)
