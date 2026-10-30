# Firebase Cloud Functions

デイリールーティン管理アプリのサーバーサイド処理を担当する Firebase Cloud Functions モジュールです。

## 概要

本ディレクトリの Cloud Functions は Node.js 24 環境で動作し、以下の 5 つの関数を提供します。

| 関数名                 | 種別           | トリガー / エンドポイント      | 主な役割                                          |
| ---------------------- | -------------- | ------------------------------ | ------------------------------------------------- |
| `agentApi`             | HTTPS          | `/agentApi/*`                  | AI エージェント・外部ツール向け CRUD REST API     |
| `onBugReportCreated`   | Firestore      | `bugReports/{reportId}` 作成時 | アプリ内不具合報告から GitHub Issue を自動起票    |
| `syncRoutines`         | HTTPS          | `/syncRoutines`                | クライアントの通知用ルーティンデータ同期受付      |
| `checkNotifications`   | スケジューラー | 毎分 (`every 1 minutes`)       | 通知時刻になったルーティンの FCM プッシュ通知配信 |
| `cleanupNotifications` | スケジューラー | 毎日 00:00 JST (`0 0 * * *`)   | 古い通知送信履歴のクリーンアップ                  |

---

## ディレクトリ構成

```text
firebase-functions/
├── package.json               # Node.js 24 前提、依存関係
├── tsconfig.json              # TypeScript ビルド設定
└── src/
    ├── index.ts               # Cloud Functions エクスポートのエントリーポイント
    ├── firebase-init.ts       # Firebase Admin SDK の初期化
    ├── constants.ts           # 共通定数（祝日の曜日値、users / notifications_sent のコレクション名）
    ├── types.ts               # 共通型定義（通知で使う Routine）
    ├── token-log.ts           # FCM トークンをログ用に短縮する（先頭 20 文字だけ残す）
    ├── agentApi/              # AI エージェント向け REST API
    │   ├── agentApi.ts        # HTTPS エンドポイント定義
    │   ├── handler.ts         # 認証 → ルーティング → 操作の実行 → 応答をつなぐ
    │   ├── authenticate.ts    # Bearer トークン認証・API キー検証
    │   ├── apiKey.ts          # API キー形式・ハッシュ計算
    │   ├── apiKeyLookup.ts    # Firestore apiKeys コレクション照会
    │   ├── bearerToken.ts     # Authorization ヘッダー解析
    │   ├── router.ts          # エンドポイントルーティング
    │   ├── executeOperation.ts# 操作ディスパッチャ（一覧は読み取りのみ、それ以外はトランザクションで書き込み）
    │   ├── errors.ts          # ApiError と共通エラー
    │   ├── errorResponse.ts   # エラーの JSON 応答への変換
    │   ├── firestoreDeps.ts   # ハンドラーが使う Firestore 依存の組み立て
    │   ├── syncWriter.ts      # users/{uid} の更新（トランザクション）
    │   ├── snapshotWriter.ts  # 更新後の同期スナップショット保存
    │   ├── operations/        # リソース別操作ロジック
    │   │   ├── index.ts       # リソース名と操作・許可クエリの対応表
    │   │   ├── budgetCollections.ts # 家計簿のカテゴリ・収入項目・支出項目
    │   │   ├── simpleCollection.ts  # 配列 1 つを CRUD する共通実装
    │   │   ├── expenses/      # 家計簿の支出記録
    │   │   ├── journal/       # ジャーナル
    │   │   ├── todo/          # Todo リスト・アイテム・カテゴリ
    │   │   └── workout/       # 運動種目・運動記録
    │   └── validation/        # 入力値の型・形式チェック（文字列・金額・日付・列挙値・クエリなど）
    ├── bugReport/             # 不具合報告 GitHub Issue 起票
    │   ├── onBugReportCreated.ts # Firestore トリガーと Secret の宣言
    │   ├── handleBugReport.ts    # 最新の報告を読み直し、起票処理を実行して結果を記録する
    │   ├── processBugReport.ts   # 処理ロック → 画像解決 → 整形 → 起票 → 状態更新の手順
    │   ├── resolveReportImages.ts# Storage から添付画像を検証・取得し URL を発行する
    │   ├── storageImageStore.ts  # Firebase Storage Bucket アダプタ（ダウンロードトークン URL 生成）
    │   ├── imageFormats.ts       # 許可画像形式とマジックナンバー判定
    │   ├── draftIssueWithClaude.ts # Claude による Issue の整形（画像入力対応）
    │   └── createGithubIssue.ts  # GitHub REST API の呼び出し
    ├── notifications.ts       # 通知チェックスケジューラー (毎分)
    ├── notificationCleanup.ts # 通知送信履歴の定期クリーンアップ (毎日 00:00 JST)
    ├── notification-helpers/  # 通知対象の判定と FCM 送信・送信履歴の記録
    ├── cleanup-helpers/       # 削除の閾値日時の計算と送信履歴の一括削除
    ├── sync.ts                # 通知用ルーティン同期エンドポイント
    ├── sync-helpers/          # syncRoutines のリクエスト検証・CORS・保存・応答
    └── date-utils/            # 曜日・日本の祝日判定と通知判定用の現在時刻コンテキスト
```

テストは各ディレクトリの `__tests__/` にあり、ルートの `npm test` で一緒に実行されます。Firestore や FCM はモックやフェイク（`agentApi/__tests__/fakeFirestore.ts`）に置き換えて検証します。

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
  2. 処理ロックを取得した後、添付画像（`images`）がある場合は Firebase Storage から取得してサイズ・マジックナンバー検証を行い、ダウンロードトークン付き URL を発行する
  3. Claude（`claude-opus-5-5`）で Issue のタイトルと本文を整形（下記「Claude による整形」）。添付画像がある場合は画像も Claude に渡す
  4. Secret に設定された GitHub Personal Access Token を使用して GitHub REST API を呼び出し、リポジトリに `bug`・`user-report` ラベル付き Issue を自動起票（添付画像は本文の `## スクリーンショット` 節に埋め込む）
  5. 成功時: ドキュメントを `status: "issued"`, `issueNumber`, `issueUrl`, `updatedAt` で更新
  6. 失敗時: `status: "error"`, `errorMessage` を記録。GitHub の応答が 30 秒以内に返らず打ち切った場合、Issue が作られていても `status: "error"`（`issueNumber` なし）になることがある。手で起票し直す前に、同じ時刻・同じ報告者 uid の `user-report` Issue が GitHub に無いか確認する（二重起票を防ぐため）
- **設定値**:
  - `GITHUB_TOKEN`（Secret）: GitHub 個人アクセストークン（`issues:write` 権限）
  - `GITHUB_REPO`（文字列パラメータ）: 対象リポジトリ名（例: `poteto317/daily-routine`。未設定時はデフォルト値を使用）
  - `ANTHROPIC_API_KEY`（Secret）: Claude による整形に使う Anthropic の API キー。Claude を使わない場合は `none` を登録する（Secret の値を変えたら関数の再デプロイが必要。Functions v2 はデプロイ時点の Secret のバージョンを使うため）。止め方・再開の仕方とトラブル対応は「6. Claude による整形の停止・再開とトラブル対応」を参照
  - 設定手順の詳細は `docs/02-development/bug-report-secrets-config.md` を参照
- **Claude による整形**:
  - 説明・再現手順・入力タイトル・画面の URL（および有効な添付画像）を Claude に渡し、要約したタイトル（`[不具合報告] ` を前置）と Markdown の本文を作る。uid や User-Agent は渡さない。環境情報と報告者 uid は今までどおり本文の末尾に付き、注記は「Claude で整形されました」になる
  - 画像つきの整形が失敗した場合は、画像なしで 1 回だけ再整形を試みる。それでも失敗した場合（または画像なしで失敗した場合）は、従来の内容（入力タイトル、無ければ説明の先頭から作るタイトルと、報告文そのままの本文）で起票する（Claude 最大 45 秒 × 最大 2 回、GitHub 最大 30 秒、関数のタイムアウトは 180 秒、メモリは 512MiB）
  - 関数ログの info `Bug report <id> processed: ... (repo=..., content=<値>)` で結果が分かる。`content=claude` は整形できた、`content=fallback` は従来の内容で起票した（失敗、`none`、または説明が空白だけ）、`content=none` はスキップ・ロック取得失敗で整形を試みなかったことを表す（`content` は整形の結果だけを表す。起票の成否は `processed:` の値 `issued` / `error` / `skipped` で判断する）。失敗時は warn `Claude による整形に失敗したため従来の内容で起票します (<理由>)`（画像つき失敗時は `画像つきの整形に失敗したため画像なしで再整形します (<理由>)`）に理由が出る（API キー・報告本文・エラーメッセージ本文は出さない）。理由は API 呼び出しの失敗（`api_error(status=<HTTP ステータス>)`・`timeout`・`connection_error`）か、応答を採用できなかったこと（`refusal`: 拒否応答、`max_tokens`: 出力が上限で打ち切られた、`no_text_output`: テキストの出力が無い、`invalid_output`: JSON でない・形式が合わない、`empty_output`: タイトル（先頭の `[不具合報告]` を除く）か本文が空）のどれか。それ以外の例外は `unknown(<クラス名>)`（SDK の想定外のエラーは `parse_failed`）。理由ごとの対処は「6. Claude による整形の停止・再開とトラブル対応」を参照
  - 注意: ログインユーザーが連投すると、Anthropic 側の月の利用上限を使い切りうる（その後は従来の内容で起票される）。報告のレート制限は未実装

### 3. 通知系関数 (`syncRoutines`, `checkNotifications`, `cleanupNotifications`)

- **`syncRoutines`**（`POST /syncRoutines`）: クライアントから `{ token: FCM トークン, routines: ルーティン配列 }` を受け取り、Firestore `users/{FCM トークン}` に `fcmToken`・`routines`・`updatedAt` を上書き保存する
  - 応答: 成功 `200 { success: true, routinesCount }`、`token` が空でない文字列でない・`routines` が配列でない場合 `400`、POST 以外 `405`、保存失敗 `500`。`OPTIONS`（プリフライト）は `204`
  - CORS は全オリジンからの `POST`（`Content-Type` ヘッダー）を許可する。認証は行わない
  - `users` コレクションには、同期データ（`users/{uid}`、agentApi やアプリの同期が使う）と、この通知用ドキュメント（`users/{FCM トークン}`）が混在する
- **`checkNotifications`**: Cloud Scheduler により毎分起動（スケジュールは JST、リージョン asia-northeast1）。`users` の全ドキュメントを読み、`fcmToken` とルーティンを持つものについて次の条件をすべて満たすルーティンを FCM で通知する
  - 曜日: 祝日なら `daysOfWeek` に `7`（祝日）を含むもの、祝日でなければ今日の曜日（0=日〜6=土）を含むもの。旧形式の `holidayMode`（`only` / `include`）は `daysOfWeek` に読み替える
  - 時刻: `startTime`（HH:mm）に `notificationMinutes`（開始の何分後か。未設定は 0）を足した時・分が現在の時・分と一致する
  - 重複防止: `notifications_sent/{FCM トークン}_{ルーティン ID}_{日付}` が既にあれば送らない。送信に成功したら記録する
  - 祝日判定（`date-utils`）は固定祝日・ハッピーマンデー・春分/秋分の日（概算式）に対応する。振替休日と国民の休日は判定しない
  - 時・分・曜日は `Date` のローカル時刻（関数の実行環境のタイムゾーン）で求める。`onSchedule` の `timeZone` は起動スケジュールにだけ効く。重複防止に使う日付は UTC の日付になる
- **`cleanupNotifications`**: 毎日午前0時 (JST) に実行され、`sentAt` が現在から 1 日より前の `notifications_sent` ドキュメントを 1 つのバッチでまとめて削除する

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

先に「4. Secret と起票先の設定」の Secret 登録を行ってください。

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
firebase functions:secrets:set ANTHROPIC_API_KEY
```

`ANTHROPIC_API_KEY` は**デプロイ前に必ず登録してください**。`onBugReportCreated` が Secret として宣言しているため、未登録のままデプロイすると、対話モードでは値の入力を求められ、非対話モード（`--non-interactive`）では失敗します。事前に `secrets:set` で登録してください。Claude による整形を使わない場合は、値に `none` を登録します（Claude を呼ばず、従来の内容で起票します）。

Claude の月の利用額の上限（例: 100 ドル）は、アプリ側では管理せず、Anthropic Console のワークスペースの利用上限で設定します。上限に達すると API がエラーを返し、従来の内容で起票されます。

起票先を変更する場合は `firebase-functions/.env.<project-id>` に `GITHUB_REPO=owner/repo` を記載し、再デプロイしてください。`<project-id>` は対象のFirebaseプロジェクトIDです。`GITHUB_REPO` は `defineString` の通常パラメータであり、Secretとして登録しません。省略時の起票先は `poteto317/daily-routine` です。

### 5. Claude による整形のデプロイ後の確認

実装時は API キーが無く実 API で確認していないため、デプロイ後に次を確認してください。

1. アプリから不具合報告を 1 件送る
2. 作成された Issue のタイトルが要約（`[不具合報告] <要約>`）になり、本文末尾に「Claude で整形されました」の注記があることを確認する
3. `firebase functions:log --only onBugReportCreated` で info ログに `content=claude` が出ていることを確認する
4. 長めの報告（説明と再現手順がそれぞれ数百文字）と、入力上限近くの報告（説明と再現手順がそれぞれ約 2000 文字）でも `content=claude` になり、warn に `max_tokens` や `timeout` が出ないことを確認する。所要時間（Google Cloud コンソールの Cloud Run の該当サービスのリクエストログの latency、または関数ログの最初と最後の行の時刻の差）も控え、上限近くで 45 秒に近い場合は Claude のタイムアウト（`draftIssueWithClaude.ts`）の見直しを検討する
5. Secret の値を変えたら `firebase deploy --only functions:onBugReportCreated` で再デプロイしてから確認する。`ANTHROPIC_API_KEY` に `none` を登録した場合は `content=fallback` になり、warn は出ないことを確認する。無効なキーを登録した場合は `content=fallback` になり、warn に `api_error(status=401)` が出ることを確認する。warn の理由が `unknown(TypeError)` の場合は、登録したキーに全角文字や途中の改行が混ざっていないか確認する（ヘッダーを組み立てられず SDK が TypeError を投げるため）

### 6. Claude による整形の停止・再開とトラブル対応

整形を止めるとき・再開するとき:

1. 止める: `firebase functions:secrets:set ANTHROPIC_API_KEY` で `none` を登録し、`firebase deploy --only functions:onBugReportCreated` で再デプロイする。info ログが `content=fallback` になり、warn が出なくなれば止まっている。再デプロイせずにすぐ止めたい場合は、Anthropic Console で API キーを無効にする（warn は `api_error(status=401)` になり、従来の内容で起票される）
2. 再開する: `none` で止めた場合は、有効な API キーを登録して再デプロイする。Console でキーを無効にして止めた場合は、キーを有効に戻せば再デプロイなしで再開する。どちらも info ログが `content=claude` になることを確認する

warn の理由ごとの原因と対処（どの場合も Issue は従来の内容で作られる）:

| warn の理由                                                                          | 主な原因                                                               | 対処                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_error(status=400)`・`api_error(status=402)`                                     | 月の利用上限への到達・クレジット不足（想定内）、またはリクエストの誤り | Anthropic Console の Usage / Billing で上限やクレジットを確認する。上限到達なら翌月まで待つか上限を見直す。上限に余裕があるのに 400 が続く場合はリクエストの誤りを疑う |
| `api_error(status=401)`                                                              | API キーの誤り・無効化                                                 | 正しいキーを登録して再デプロイする                                                                                                                                     |
| `api_error(status=403)`                                                              | キーの権限・ワークスペースの設定                                       | Console でキーとワークスペースの権限を確認する                                                                                                                         |
| `api_error(status=404)`                                                              | モデルの廃止など                                                       | `draftIssueWithClaude.ts` のモデル ID を見直し、コードを変更してデプロイする                                                                                           |
| `api_error(status=429)`・`api_error(status=5xx)`（`529` を含む）・`connection_error` | レート制限・API の一時的な障害                                         | 一時的なものなら対応不要。続く場合は Anthropic のステータスページを確認する                                                                                            |
| `timeout`・`max_tokens`                                                              | 長い報告で時間・出力の上限を超えた                                     | 続く場合は Claude のタイムアウト（`CLAUDE_TIMEOUT_MS`）や `CLAUDE_MAX_TOKENS` を見直す。タイムアウトは関数の `timeoutSeconds` との関係がテストで確認される             |
| `refusal`・`invalid_output`・`no_text_output`・`empty_output`                        | 拒否応答や出力の乱れ                                                   | まれなら対応不要。続く場合はプロンプト（`buildDraftPrompt.ts`）を見直す                                                                                                |
| `unknown(TypeError)`                                                                 | 登録したキーに全角文字や途中の改行が混ざっている                       | キーを登録し直して再デプロイする                                                                                                                                       |
| `parse_failed`・その他の `unknown(<クラス名>)`                                       | SDK や実装の想定外のエラー                                             | まれなら対応不要。続く場合はログのクラス名と SDK のバージョンを手がかりに `describeDraftFailure.ts` と呼び出し側を調べる                                               |

---

## 関連ドキュメント

- [AI エージェント向け API 仕様](../（非公開のエージェント API 仕様）)
- [OpenAPI 3.0.3 仕様書](../（非公開の OpenAPI 仕様）)
- [不具合報告機能設計書](../docs/02-development/bug-report-feature-plan.md)
- [GitHub Token / Secret 設定手順](../docs/02-development/bug-report-secrets-config.md)
- [クラウド同期セットアップ](../docs/01-getting-started/SYNC_SETUP.md)
