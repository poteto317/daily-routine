# デイリールーティン管理アプリ

**デモ**: https://daily-routine-murex.vercel.app/

日々のルーティン、ライフログ、作業記録を 1 つの PWA で管理する Next.js アプリです。

現在の実装は Next.js 16 App Router、TypeScript、Tailwind CSS v4、Firebase を前提にしています。

詳細なセットアップや開発ルールは [docs/](./docs/) を参照してください。

## 概要

- ルーティン管理を中心に、統計、カレンダー、ポモドーロ、作業記録、家計簿、食事、体重、日記などを 1 つのアプリで扱います。
- Firebase 匿名認証と Firestore を使った同期に対応しています。
- PWA と Service Worker により、インストール、通知、オフラインキャッシュに対応しています。
- 通知用の `public/firebase-messaging-sw.js` は固定ファイルではなく、実行時に環境変数から自動生成されます。

## 主な機能

### コア機能

- **ルーティン管理** — 作成・編集・削除、曜日別・祝日別の表示制御、時刻順表示、カテゴリ分類、週1〜7回の目標設定
- **達成カレンダー・統計** — 日次達成履歴、週次・月次・カテゴリ別レポート、週間目標の進捗と現在・最長ストリーク
- **プリセット管理** — ルーティンをセットとして保存し曜日単位で一括適用
- **Todo リスト・管理** — 複数リスト管理、階層インデント（0〜3段階）、背景色設定、カテゴリ分類、完了切り替え

### ライフログ・生産性

運動記録（筋トレ・ランニング・種目マスター管理） / 家計簿 / ジャーナル / 食事記録 / 体重記録 / 天気表示 / ポモドーロタイマー / 作業トラッカー

### システム

Firebase 匿名認証 / Firestore 同期（スナップショット履歴・復元対応） / 不具合報告（GitHub Issue 自動起票） / API キー管理（CLI・設定画面） / AI エージェント REST API / PWA インストール / 通知 / テーマ切り替え / JSON インポート・エクスポート / アカウント管理

## 技術スタック

- Next.js 16.3.0
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- Firebase Web SDK 12.8.0
- Firebase Cloud Functions (Node.js 24)
- Jest + React Testing Library
- Chart.js / react-chartjs-2
- next-pwa / Workbox

## セットアップ

### 前提環境

- Node.js 22 または 24（CI はこの 2 つで検証しています。`.nvmrc` の推奨は 24）
- npm 最新版を推奨
- Firebase Functions は `firebase-functions/package.json` で Node 24 を指定

ローカルで警告が出ても、フロントエンド開発や verify が通るなら即問題になるわけではありません。ただし Functions の本番実行環境は Node 24 前提です。

### 1. インストール

```bash
git clone <repository-url>
cd daily-routine
npm install
cd firebase-functions
npm install
cd ..
```

### 2. 環境変数の設定

`.env.local.example` をベースに `.env.local` を作成し、Firebase の値を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_ENABLE_LOCAL_AUTH=false
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
NEXT_PUBLIC_FUNCTIONS_URL=
```

`NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` を設定すると、Firebase を用意しなくてもローカル擬似認証（匿名・テストアカウント・メールアドレス）でログインできます。有効になるのは次の 3 つがそろったときだけです（`src/features/auth/storage.ts` の `isLocalAuthEnabled` と `src/services/localAuthService.ts` の `shouldUseLocalAuth`）。

- `NEXT_PUBLIC_ENABLE_LOCAL_AUTH` が `"true"`（既定値は `false`）
- Firebase が未設定（API キー・プロジェクト ID・アプリ ID のどれかが空。設定済みならこのフラグは無視され、Firebase 認証を使います）
- ブラウザで開いているホスト名が `localhost` / `127.0.0.1`

判定は `NODE_ENV` ではなくホスト名で行うため、本番ビルド（`npm start`）でも localhost で開けば有効になります。公開 URL からは有効になりませんが、共有の開発環境や検証環境では有効化しないでください。

通知を使う場合は Firebase Cloud Messaging の設定も必要です。

### 3. Firebase の準備

最低限、以下を有効化してください。

- Authentication の匿名認証
- Firestore Database
- Cloud Messaging
- Cloud Functions

詳細は [docs/01-getting-started/SYNC_SETUP.md](./docs/01-getting-started/SYNC_SETUP.md) と [docs/01-getting-started/SETUP_CHECKLIST.md](./docs/01-getting-started/SETUP_CHECKLIST.md) を参照してください。

### 4. 開発サーバー起動

```bash
npm run dev
```

`npm run dev` の前に `generate:fcm-sw` が自動実行され、`.env.local` の内容から `public/firebase-messaging-sw.js` が生成されます。

ブラウザで `http://localhost:3000` を開いて確認します。

## Firebase Service Worker の扱い

- `public/firebase-messaging-sw.template.js` をリポジトリで管理します。
- `public/firebase-messaging-sw.js` は生成物であり、Git 管理しません。
- `npm run dev`、`npm run build`、`npm start` のたびに自動生成されます。
- Firebase の環境変数が未設定でもアプリ自体は起動できますが、FCM を使う通知機能は無効になります。

公開リポジトリに実プロジェクトの Firebase 値を残さないための設計です。

## よく使うコマンド

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm run typecheck:functions
npm run test -- --runInBand
npm run verify:fast
npm run verify
npm run <private-ops> -- <command>
npm run storybook
npm run test:e2e
```

`npm run verify` は以下を順に実行します（1〜5 は `npm run verify:fast` と同じ）。

1. Tailwind shorthand チェック
2. ESLint
3. TypeScript 型検査（本体 + テスト用 tsconfig）
4. Cloud Functions の TypeScript 型検査
5. Jest（`--runInBand`）
6. Next.js production build

## テスト

- テストフレームワークは Jest + React Testing Library です。
- 各機能のテストは `src/**/__tests__/` にあります。Cloud Functions のテストは `firebase-functions/src/**/__tests__/`、補助スクリプトのテストは `tools/` にあり、`npm test` でまとめて実行されます。
- ブラウザ操作の E2E テストは Playwright（`e2e/`）で実行できます。
- CI 相当の確認は `npm run verify` を使ってください。

```bash
npm run test:watch
npm run test:ci
npm run test:e2e
```

## データと同期

- 各機能のローカル保存は feature 単位の `storage.ts` に集約しています。
- ルーティンを含む全機能データは Firestore クラウド同期に対応しています。
- 設定画面やヘッダー操作から手動同期（アップロード／ダウンロード）が可能です。
- Firestore 上に最新5件の同期スナップショットが保存され、「同期履歴管理」画面から過去のスナップショットへ復元できます。
- 匿名認証のため、ブラウザストレージを消すと別ユーザーとして扱われます。

## デプロイ

### フロントエンド

```bash
vercel --prod
```

### Cloud Functions

```bash
cd firebase-functions
npm run build
cd ..
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## ディレクトリ構成

```text
daily-routine/
├── docs/                  # セットアップ、開発、テスト、仕様ドキュメント
├── firebase-functions/    # Firebase Cloud Functions (Node.js 24)
├── public/                # PWA マニフェスト、アイコン、SW テンプレート
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # 共通 UI コンポーネント
│   ├── config/            # 設定定数
│   ├── features/          # 機能別モジュール
│   ├── hooks/             # 共有フック
│   ├── layouts/           # レイアウト関連
│   ├── lib/               # Firebase、祝日、共通ユーティリティ
│   ├── service-worker/    # 追加の Service Worker 関連コード
│   ├── services/          # 認証サービスなど
│   └── types/             # 型定義
├── tools/                 # 補助スクリプト (api-key CLI, SW 生成, アイコン等)
├── e2e/                   # Playwright E2E テスト
├── firestore.rules        # Firestore セキュリティルール
├── .env.local.example     # 環境変数テンプレート
├── firebase.json
├── next.config.ts
├── package.json
└── README.md
```

## 関連ドキュメント

- [docs/README.md](./docs/README.md)
- [docs/01-getting-started/SETUP_CHECKLIST.md](./docs/01-getting-started/SETUP_CHECKLIST.md)
- [docs/01-getting-started/SYNC_SETUP.md](./docs/01-getting-started/SYNC_SETUP.md)
- [docs/02-development/architecture.md](./docs/02-development/architecture.md)
- [docs/02-development/coding-standards.md](./docs/02-development/coding-standards.md)
- [docs/02-development/storybook-guide.md](./docs/02-development/storybook-guide.md)
- [docs/03-testing/test-matrix.md](./docs/03-testing/test-matrix.md)
- [docs/04-reference/features.md](./docs/04-reference/features.md)
- [（非公開のエージェント API 仕様）](./（非公開のエージェント API 仕様）)
- [（非公開の OpenAPI 仕様）](./（非公開の OpenAPI 仕様）)

## 補足

- GitHub 公開時は `.env.local` と生成済み `public/firebase-messaging-sw.js` をコミットしないでください。
- ルーティン以外にも多くの feature module があり、実装は feature-based architecture で整理されています。
- 最新の運用手順は README より docs 側を優先してください。
