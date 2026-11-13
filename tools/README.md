# 開発・運用補助ツール (`tools/`)

デイリールーティン管理アプリの開発・ビルドを補助するスクリプト群です。

## 概要

本ディレクトリには、環境設定・コード品質検証・PWA アセット生成などを担うツールが配置されています。主要なスクリプトは `package.json` の npm スクリプトとして登録されています。

| ツール                               | npm コマンド                    | 役割                                                     |
| ------------------------------------ | ------------------------------- | -------------------------------------------------------- |
| `generate-firebase-messaging-sw.mjs` | `npm run generate:fcm-sw`       | `.env.local` から FCM Service Worker を自動生成          |
| `tailwind/check-shorthand.mjs`       | `npm run tailwind:scan` / `fix` | Tailwind CSS v4 の shorthand クラス構文の検査と自動修正  |
| `generate-icons.mjs`                 | `npm run generate:icons`        | PWA 用アイコン（各サイズ・マスク可能アイコン）の自動生成 |
| `verify-icons-in-sync.mjs`           | `npm run verify:icons`          | 生成されたアイコンと定義の整合性検証                     |

管理者向けの運用 CLI や、エージェント API の詳細仕様は公開リポジトリの対象外です。

---

## ツール詳細

### 1. Firebase Messaging SW 自動生成 (`tools/generate-firebase-messaging-sw.mjs`)

公開リポジトリに実環境の Firebase 秘密設定（API Key 等）を残さないため、Service Worker をビルド・起動時に動的生成します。

- **入力**: `public/firebase-messaging-sw.template.js` および `.env.local`
- **出力**: `public/firebase-messaging-sw.js`（Git 管理外）
- **実行契機**: `npm run dev`, `npm run build`, `npm run start` の実行前に自動実行

---

### 2. Tailwind Shorthand チェッカー (`tools/tailwind/check-shorthand.mjs`)

Tailwind CSS v4 における shorthand クラス（冗長なプロパティ定義）を静的解析し、標準的なクラスへの統一を支援します。

```bash
# 検査のみ（CI や npm run verify で実行）
npm run tailwind:scan

# 自動修正（--fix オプション付きで実行）
npm run tailwind:fix
```

---

### 3. PWA アイコン生成・検証 (`tools/generate-icons.mjs`, `verify-icons-in-sync.mjs`)

PWA マニフェストおよび各種デバイス（iOS, Android）で必要とされるアプリアイコンを統一ルールで生成・検証します。

- **`tools/generate-icons.mjs`**: 各種解像度の PNG アイコン、およびセーフゾーンを考慮したマスク可能（maskable）アイコンを生成
- **`tools/verify-icons-in-sync.mjs`**: 生成された画像群と `src/config` や `manifest.json` の設定が完全に同期しているかを検証（テスト時に実行）

---

## 関連ドキュメント

- [セットアップチェックリスト](../docs/01-getting-started/SETUP_CHECKLIST.md)
- [開発ガイドライン](../docs/02-development/README.md)
