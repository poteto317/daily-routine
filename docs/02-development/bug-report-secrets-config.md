# 報告・問い合わせの起票先設定

`onBugReportCreated` は、スクラムかんばんの daily-routine プロジェクトの Todo にアイテムを作成します。

## デプロイ前の設定

対象の Firebase プロジェクトを選択し、Secret を登録します。

```bash
firebase functions:secrets:set SCRUM_BOARD_CREDENTIALS
firebase functions:secrets:set ANTHROPIC_API_KEY
```

- `SCRUM_BOARD_CREDENTIALS` には、対象プロジェクトへ起票できる Basic 認証の情報を `ユーザー名:パスワード` 形式で入力します。Functions がリクエスト時に Base64 に変換します。
- `ANTHROPIC_API_KEY` には Claude の API キーを入力します。整形が不要なら `none` を入力します。

既定の起票先は `https://scrum-board-jkcejsb6ka-an.a.run.app` のプロジェクト ID `8` です。検証用の起票先を使う場合は、対象の `firebase-functions/.env.<project-id>` に次を設定します。

```dotenv
SCRUM_BOARD_ORIGIN=https://board.example.com
SCRUM_BOARD_PROJECT_ID=8
```

Secret や起票先を変更したら `firebase deploy --only functions:onBugReportCreated` で反映します。開発用エミュレータから送信を試す場合は、`firebase-functions/.env.local` に検証用の起票先を、`firebase-functions/.secret.local` にその認証情報を設定します。Claude を呼ばない検証では、同じ `.secret.local` に `ANTHROPIC_API_KEY=none` を設定します。

## 不具合報告の処理上限

既定では起票先プロジェクトごとに 1 日 50 回、同じ利用者はそのうち 5 回まで処理します。処理開始時点の UTC 日付で集計し、日本時間の 09:00 に次の日の枠へ切り替わります。外部サービスへの依頼が失敗しても処理枠は消費します。

対話形式でデプロイする場合は、Firebase CLI が未設定の上限に既定値を提示します。`--non-interactive` でデプロイする場合や上限を変更する場合は、対象の `firebase-functions/.env.<project-id>` に両方の値を 10 進の非負整数で設定します。上限の変更は `onBugReportCreated` の再デプロイで反映します。

```dotenv
BUG_REPORT_USER_DAILY_LIMIT=5
BUG_REPORT_PROJECT_DAILY_LIMIT=50
```

0 を指定すると対象の処理を停止します。上限に達した報告は Firestore に `status: error` と `errorCode: quota_exceeded` が残り、画像取得・AI 整形・起票を省略します。報告の受付は継続し、上限超過で処理を省略した報告は翌日以降も自動で再処理されません。

## 起票結果の確認

アプリの「報告・問い合わせ」から送信すると、かんばんの対象プロジェクトの Todo にアイテムが追加されます。Firestore の `issueNumber` と `issueUrl` には、公開番号とプロジェクトを指定した詳細 URL が入ります。

関数ログの `content=claude` は整形に成功したことを示します。整形を省略した場合や失敗した場合は `content=fallback` が記録されます。起票の成否は別途 `issued` または `error` で確認できます。API の応答を確認できない場合は、再起票の前に対象プロジェクトで同じ報告が作成済みか確認してください。

## 添付画像を使う環境の設定

Firebase コンソールの Storage で既定バケットを有効にし、`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` に設定します。Cloud Functions の実行サービスアカウントには、同じプロジェクトの既定バケットの読み書き権限が必要です。Storage のルールをデプロイします。

```bash
firebase deploy --only storage
```

Firestore ルールの公開は、[セットアップチェックリスト](../01-getting-started/SETUP_CHECKLIST.md#アカウント管理者の棚卸しと初期設定)の対象環境に合う手順に従ってください。

かんばん本文に埋め込まれる添付画像の URL にはダウンロード用トークンが含まれます。URL を知っている人は、スクラムかんばんの閲覧権限に関わらず、その画像を開けます。

Claude の停止・再開やログの調査方法は [Cloud Functions の運用手順](../../firebase-functions/README.md) を参照してください。
