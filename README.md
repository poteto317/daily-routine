# デイリールーティン管理アプリ

**デモ**: https://daily-routine-murex.vercel.app/（公開デモ専用の Firebase プロジェクト。個人用データとは分離）

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

運動記録（筋トレ・ランニング・種目マスター管理） / 家計簿 / ジャーナル / 業務日誌 / 食事記録 / 体重記録 / 天気表示 / ポモドーロタイマー / 作業トラッカー

### システム

Firebase 匿名認証 / Firestore 同期（スナップショット履歴・復元対応） / 不具合報告（GitHub Issue 自動起票） / API キー管理（設定画面） / AI エージェント REST API / PWA インストール / 通知 / テーマ切り替え / JSON インポート・エクスポート / アカウント管理

## 技術スタック

- Next.js 16.4.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- Firebase Web SDK 12.8.0
- Firebase Cloud Functions (Node.js 24)
- Jest + React Testing Library
- Chart.js / react-chartjs-2
- Workbox（`workbox-webpack-plugin` による Service Worker 生成）

## セットアップ

初めて参加する場合の読み方は [docs/01-getting-started/ONBOARDING.md](./docs/01-getting-started/ONBOARDING.md) も参照してください。

### 前提環境

- Node.js 22 または 24（CI はこの 2 つで検証しています。`.nvmrc` の推奨は 24）
- npm 最新版を推奨（`npm -v` で確認）
- Firebase Functions は `firebase-functions/package.json` で Node 24 を指定

ローカルで警告が出ても、フロントエンド開発や verify が通るなら即問題になるわけではありません。ただし Functions の本番実行環境は Node 24 前提です。

### 1. インストール

```bash
git clone https://github.com/poteto317/daily-routine.git
cd daily-routine
nvm use   # .nvmrc の Node 24 を使う（任意だが推奨）
npm install
npm install --prefix firebase-functions
```

`.env.local` はリポジトリ直下に置き、Git 管理しません（`.gitignore` の `.env*`）。生成される `public/firebase-messaging-sw.js` もコミットしないでください。

### 2. 最短: Firebase なしで動かす

Firebase プロジェクトが無くても、ローカル擬似認証で画面を一通り動かせます。

```bash
# 既に .env.local がある場合は上書きしない（L-072）
cp -n .env.local.example .env.local
```

`.env.local` を開き、次を設定します。

1. `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`
2. `NEXT_PUBLIC_FIREBASE_API_KEY`・`NEXT_PUBLIC_FIREBASE_PROJECT_ID`・`NEXT_PUBLIC_FIREBASE_APP_ID` の値を**空にする**

`your-api-key` などのプレースホルダが残っていると Firebase 設定済みとみなされ、ローカル擬似認証は使われません（`src/lib/firebase-modules/config.ts` の `isFirebaseConfigured`）。

ローカル擬似認証が有効になるのは、次の 3 つがそろったときだけです（`src/features/auth/storage.ts` の `isLocalAuthEnabled` と `src/services/localAuthService.ts` の `shouldUseLocalAuth`）。

- `NEXT_PUBLIC_ENABLE_LOCAL_AUTH` が `"true"`（既定値は `false`）
- Firebase が未設定（API キー・プロジェクト ID・アプリ ID のどれかが空。設定済みならこのフラグは無視され、Firebase 認証を使います）
- ブラウザのホスト名が `localhost` / `127.0.0.1` / `::1`

判定は `NODE_ENV` ではなくホスト名で行うため、本番ビルド（`npm start`）でも localhost で開けば有効になります。公開 URL からは有効になりません。共有の開発環境や staging・プレビューでは有効化しないでください。

```bash
npm run dev
```

`npm run dev` の前に `generate:fcm-sw` が自動実行され、`.env.local` の内容から `public/firebase-messaging-sw.js` が生成されます。ブラウザで `http://localhost:3000` を開き、「匿名」または「テストアカウント」でログインします。データはブラウザの localStorage に保存されます。クラウド同期・通知・不具合報告など Firebase を使う機能は動きません。

### 3. Firebase を使う場合

同期・通知・不具合報告などを確かめるときは、`.env.local` に Firebase の値を入れ、`NEXT_PUBLIC_ENABLE_LOCAL_AUTH` は `false` のままで構いません（Firebase 設定済みならローカル認証フラグは無視されます）。

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

最低限、次を有効化してください。

- Authentication の匿名認証
- Firestore Database
- Cloud Messaging（通知を使う場合）
- Cloud Functions（通知同期・不具合報告・エージェント API を使う場合）

手順のチェックリストは [docs/01-getting-started/SETUP_CHECKLIST.md](./docs/01-getting-started/SETUP_CHECKLIST.md)、同期の詳細は [docs/01-getting-started/SYNC_SETUP.md](./docs/01-getting-started/SYNC_SETUP.md) を参照してください。
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
├── tools/                 # 補助スクリプト (SW 生成, アイコン等)
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
- [docs/01-getting-started/ONBOARDING.md](./docs/01-getting-started/ONBOARDING.md) — 初めて参加する開発者向け
- [docs/01-getting-started/SETUP_CHECKLIST.md](./docs/01-getting-started/SETUP_CHECKLIST.md)
- [docs/01-getting-started/SYNC_SETUP.md](./docs/01-getting-started/SYNC_SETUP.md)
- [docs/02-development/architecture.md](./docs/02-development/architecture.md)
- [docs/02-development/coding-standards.md](./docs/02-development/coding-standards.md)
- [docs/02-development/storybook-guide.md](./docs/02-development/storybook-guide.md)
- [docs/03-testing/test-matrix.md](./docs/03-testing/test-matrix.md)
- [docs/04-reference/features.md](./docs/04-reference/features.md)

## 補足

- GitHub 公開時は `.env.local` と生成済み `public/firebase-messaging-sw.js` をコミットしないでください。
- ルーティン以外にも多くの feature module があり、実装は feature-based architecture で整理されています。
- 最新の運用手順は README より docs 側を優先してください。
