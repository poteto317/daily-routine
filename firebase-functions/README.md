# Firebase Cloud Functions

デイリールーティン管理アプリのサーバーサイド処理を担当する Firebase Cloud Functions モジュールです。

## 概要

本ディレクトリの Cloud Functions は Node.js 24 環境で動作し、以下の 5 つの関数を提供します。

| 関数名                 | 種別           | トリガー / エンドポイント      | 主な役割                                          |
| ---------------------- | -------------- | ------------------------------ | ------------------------------------------------- |
| `agentApi`             | HTTPS          | `/agentApi/*`                  | AI エージェント・外部ツール向け CRUD REST API     |
| `onBugReportCreated`   | Firestore      | `bugReports/{reportId}` 作成時 | アプリ内不具合報告から GitHub Issue を自動起票    |
| `syncRoutines`         | HTTPS          | `/syncRoutines`                | クライアントの通知用ルーティンデータ同期受付      |
| `checkNotifications`   | スケジューラー | 毎分 (`every 1 minutes`)       | 設定時刻を過ぎたルーティンの FCM プッシュ通知配信 |
| `cleanupNotifications` | スケジューラー | 毎日 00:00 JST (`0 0 * * *`)   | 期限切れ通知データのクリーンアップ                |

---

## ディレクトリ構成

```text
firebase-functions/
├── package.json               # Node.js 24 前提、依存関係
├── tsconfig.json              # TypeScript ビルド設定
└── src/
    ├── index.ts               # Cloud Functions エクスポートのエントリーポイント
    ├── firebase-init.ts       # Firebase Admin SDK の初期化
    ├── constants.ts           # 共通定数
    ├── types.ts               # 共通型定義
    ├── agentApi/              # AI エージェント向け REST API
    │   ├── agentApi.ts        # HTTPS エンドポイント定義
    │   ├── authenticate.ts    # Bearer トークン認証・API キー検証
    │   ├── apiKey.ts          # API キー形式・ハッシュ計算
    │   ├── apiKeyLookup.ts    # Firestore apiKeys コレクション照会
    │   ├── bearerToken.ts     # Authorization ヘッダー解析
    │   ├── router.ts          # エンドポイントルーティング
    │   ├── executeOperation.ts# 操作ディスパッチャ
    │   ├── operations/        # リソース別操作ロジック
    │   │   ├── budget/        # 家計簿 CRUD
    │   │   ├── journal/       # ジャーナル CRUD
    │   │   ├── todo/          # Todo リスト・アイテム・カテゴリ CRUD
    │   │   └── workout/       # 運動種目・運動記録 CRUD
    │   └── validation/        # 各リソースの入力バリデーション
    ├── bugReport/             # 不具合報告 GitHub Issue 起票
    │   └── onBugReportCreated.ts
    ├── notifications.ts       # 通知チェックスケジューラー (毎分)
    ├── notificationCleanup.ts # 通知データ定期クリーンアップ (毎日 00:00 JST)
    ├── notification-helpers/  # 通知配信・FCM 補助ユーティリティ
    ├── cleanup-helpers/       # 通知ログクリーンアップ補助
    ├── sync.ts                # 通知用ルーティン同期エンドポイント
    ├── sync-helpers/          # 同期補助ユーティリティ
    └── date-utils/            # JST 日時計算ユーティリティ
```

---

## 関数詳細

### 1. `agentApi` (AI エージェント向け REST API)

- **ベース URL**: `https://asia-northeast1-<projectId>.cloudfunctions.net/agentApi`
- **認証方式**: `Authorization: [redacted]`（`apiKeys` コレクション内の SHA-256 ハッシュと照合）
- **操作対象**: Firestore `users/{uid}` ドキュメント（同期データ本体）
- **対応リソース**:
  - 家計簿: `/budget/expenses`, `/categories`, `/income-items`, `/expense-items`
  - ジャーナル: `/journal/entries`
  - Todo: `/todo/lists`, `/items`, `/categories`
  - 運動記録: `/workout/exercises`, `/records`
- **安全設計**:
  - API で書き込む前に、アプリからの同期データが存在することを確認（`404 no_sync_data`）
  - 同期フィールドが存在しない古い同期データへの意図しない追加を防止（`409 outdated_sync_data`）
  - 更新のたびに最新の同期スナップショットを Firestore に自動保存
- **仕様詳細**:
  - 仕様ドキュメント: `（非公開のエージェント API 仕様）`
  - OpenAPI 定義: `（非公開の OpenAPI 仕様）`

### 2. `onBugReportCreated` (GitHub Issue 自動起票)

- **トリガー**: `bugReports/{reportId}` ドキュメントの新規作成（Firestore `onCreate`）
- **動作フロー**:
  1. クライアントが作成した報告ドキュメント（`status: "pending"`）を検知
  2. Secret に設定された GitHub Personal Access Token を使用して GitHub REST API を呼び出し
  3. リポジトリに `bug` ラベル付き Issue を自動起票
  4. 成功時: ドキュメントを `status: "issued"`, `issueNumber`, `issueUrl`, `updatedAt` で更新
  5. 失敗時: `status: "error"`, `errorMessage` を記録
- **設定値**:
  - `GITHUB_TOKEN`（Secret）: GitHub 個人アクセストークン（`repo` スコープ）
  - `GITHUB_REPO`（文字列パラメータ）: 対象リポジトリ名（例: `poteto317/daily-routine`。未設定時はデフォルト値を使用）
  - 設定手順の詳細は `docs/02-development/bug-report-secrets-config.md` を参照

### 3. 通知系関数 (`syncRoutines`, `checkNotifications`, `cleanupNotifications`)

- **`syncRoutines`**: クライアントが設定したルーティンとその通知設定を Firestore `routines/{userId}` へ同期
- **`checkNotifications`**: Cloud Scheduler により毎分起動（JST、リージョン asia-northeast1）。現在時刻に通知すべきルーティンを検索し、FCM 経由でブラウザ・PWA へプッシュ通知を送信
- **`cleanupNotifications`**: 毎日午前0時 (JST) に実行され、不要となった古い通知履歴レコードをパージ

---

## 開発とデプロイ

### 1. 前提条件

- **Node.js**: 24（推奨）
- **Firebase プロジェクト**: Blaze プラン（従量課金）必須
- **Firebase CLI**: 最新版推奨（`npm install -g firebase-tools`）

### 2. インストールとビルド

```bash
cd firebase-functions
npm install
npm run build
```

### 3. デプロイ

```bash
# ルートディレクトリから実行
firebase deploy --only functions

# または特定の関数のみデプロイ
firebase deploy --only functions:agentApi
firebase deploy --only functions:onBugReportCreated
```

デプロイ後、表示された HTTPS URL をルートの `.env.local` の `NEXT_PUBLIC_FUNCTIONS_URL` に設定してください。

### 4. Secret と起票先の設定

```bash
firebase functions:secrets:set GITHUB_TOKEN
```

起票先を変更する場合は `firebase-functions/.env.<project-id>` に `GITHUB_REPO=owner/repo` を記載し、再デプロイしてください。`<project-id>` は対象のFirebaseプロジェクトIDです。`GITHUB_REPO` は `defineString` の通常パラメータであり、Secretとして登録しません。省略時の起票先は `poteto317/daily-routine` です。

---

## 関連ドキュメント

- [AI エージェント向け API 仕様](../（非公開のエージェント API 仕様）)
- [OpenAPI 3.0.3 仕様書](../（非公開の OpenAPI 仕様）)
- [不具合報告機能設計書](../docs/02-development/bug-report-feature-plan.md)
- [GitHub Token / Secret 設定手順](../docs/02-development/bug-report-secrets-config.md)
- [クラウド同期セットアップ](../docs/01-getting-started/SYNC_SETUP.md)
