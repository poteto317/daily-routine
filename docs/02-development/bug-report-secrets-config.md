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

## 添付画像の受付と回収

1 報告につき 3 枚、1 枚 5 MiB まで添付できます。画像付き報告は `submitBugReportWithImages` が本人の UID と画像の実サイズを確認し、Firestore の予約を確保してから保存します。本文のみの報告は Web クライアントが Firestore に作成します。

予約中と保管中を合わせて、利用者ごとに 20 枚・50 MiB、プロジェクト全体で 1,000 枚・2 GiB まで受け付けます。提出されなかった画像は予約から 1 時間、提出済み画像は提出から 30 日が経過すると、回収対象になります。`cleanupExpiredBugReportImages` は 15 分ごとに最大 100 件の予約を処理するため、削除の完了時刻は回収状況によって変わります。全ファイルの削除または不存在を確認した予約から枠を返却します。エラー時は関数ログを確認してください。`cleanupLateBugReportImage` は、回収開始後などに Storage で確定した画像を世代を指定して削除します。

報告本文と既に起票した内容は残ります。画像回収後はリンクから画像を開けなくなります。かんばん本文の画像 URL にはダウンロードトークンが含まれ、リンクを知っている人は画像を閲覧できます。既存画像は従来のパスで読み取れます。既存画像とバケットのソフトデリート・バージョニングによる保存分は、この機能の枠に含まれません。

### 切り替え

1. 対象環境の Firebase の既定 Storage バケットを有効にし、作成イベントの関数と同じ `asia-northeast1` を使用します。関数の実行サービスアカウントに、対象バケットで画像の作成・取得・メタデータの更新・削除に必要な権限を付与します。Eventarc が Storage イベントを配信できることを確認します。
2. 起票先とこの文書の設定を確認し、旧・新の画像パスを読める `onBugReportCreated` と新規の受付・回収関数をデプロイします。
3. 新しい Web クライアントを公開し、検証環境で画像付き報告を送信します。画像付きの報告が作成され、起票先で画像を参照できることを確認します。
4. [セットアップチェックリスト](../01-getting-started/SETUP_CHECKLIST.md#アカウント管理者の棚卸しと初期設定)に従って対象環境を照合し、Firestore と Storage のルールを公開します。旧 Web クライアントの画像付き送信はここから失敗するため、更新版の利用を案内します。検証環境で、画像付き報告と本文のみの報告を確認します。

Claude の停止・再開やログの調査方法は [Cloud Functions の運用手順](../../firebase-functions/README.md) を参照してください。
