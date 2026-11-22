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

報告本文と既に起票した内容は残ります。画像の配信には発行から 15 分で失効する Cloud Storage の V4 署名付き URL を使います。期限内はリンクを持つ人が画像を取得できます。起票済みカードからの再発行はありません。既存画像とバケットのソフトデリート・バージョニングによる保存分は、この機能の枠に含まれません。

### 切り替え

1. 対象環境の Firebase の既定 Storage バケットを有効にし、作成イベントの関数と同じ `asia-northeast1` を使用します。関数の実行サービスアカウントに、対象バケットで画像の作成・取得・メタデータの更新・削除に必要な権限を付与します。Eventarc が Storage イベントを配信できることを確認します。起票関数のサービスアカウントには、自身に対する `iam.serviceAccounts.signBlob` も必要です。対象バケットとオブジェクトが匿名で読み取れないことを、Firebase ルールとは別に Cloud Storage の IAM と ACL で確認します。 [Cloud Storage の V4 署名手順](https://docs.cloud.google.com/storage/docs/access-control/signing-urls-with-helpers)
2. 起票先とこの文書の設定を確認し、旧・新の画像パスを読める `onBugReportCreated` と新規の受付・回収関数をデプロイします。
3. 新しい Web クライアントを公開し、検証環境で画像付き報告を送信します。画像付きの報告が作成され、起票先で画像を参照できることを確認します。
4. [セットアップチェックリスト](../01-getting-started/SETUP_CHECKLIST.md#アカウント管理者の棚卸しと初期設定)に従って対象環境を照合し、Firestore と Storage のルールを公開します。旧 Web クライアントの画像付き送信はここから失敗するため、更新版の利用を案内します。検証環境で、画像付き報告と本文のみの報告を確認します。

### 既存の無期限リンクを失効させる

1. 切り替え手順に従って、対象バケットと起票関数の権限を確認します。
2. 署名付き URL を使う `onBugReportCreated` をデプロイし、現行の Storage ルールを公開します。旧版の起票処理と直接アップロードによるトークン発行が停止したことを確認します。
3. バケット名と所属プロジェクトを管理画面または CLI で照合します。移行コマンドの `--project` は SDK のプロジェクト設定で、バケットの所属を検証するオプションではありません。コマンドには対象バケットの `storage.objects.list` とメタデータの読み取りが必要です。まず `firebase-functions` ディレクトリから確認モードを実行します。

   ```sh
   npm run build
   node scripts/revoke-report-image-links.mjs --project PROJECT_ID --bucket BUCKET
   ```

4. 対象は `bugReports/` と `bugReportManagedImages/` の現行オブジェクトです。確認結果を照合後、メタデータ更新権限を持つ実行主体で同じコマンドに `--apply` を追加します。失敗件数があれば原因を調べて再実行し、再度の確認で更新対象が 0 件であることを確認します。古い世代をトークン付きのまま元のパスに復元すると、その直後から旧リンクが再び有効になり得ます。失効を維持する場合は、トークンを含まないバックアップから復元するか、旧トークンを除いたコピーを作ってから元のパスに配置します。Cloud Storage のソフトデリートからの直接復元は旧メタデータを引き継ぎます。復元後は旧 URL が拒否されることを再確認します。 [Cloud Storage の復元 API](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/restore)
5. 検証環境の合成画像で、移行後に旧 Firebase URL が拒否されること、Cloud Storage の同じオブジェクトに無署名でアクセスできないこと、新しい署名付き URL が期限内に開けて期限後に新たな取得を拒否することを確認します。既にダウンロードされた画像や過去に保存されたキャッシュは回収できません。

Claude の停止・再開やログの調査方法は [Cloud Functions の運用手順](../../firebase-functions/README.md) を参照してください。
