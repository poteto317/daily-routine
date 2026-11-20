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

## 起票結果の確認

アプリの「報告・問い合わせ」から送信すると、かんばんの対象プロジェクトの Todo にアイテムが追加されます。Firestore の `issueNumber` と `issueUrl` には、公開番号とプロジェクトを指定した詳細 URL が入ります。

関数ログの `content=claude` は整形に成功したことを示します。整形を省略した場合や失敗した場合は `content=fallback` が記録されます。起票の成否は別途 `issued` または `error` で確認できます。API の応答を確認できない場合は、再起票の前に対象プロジェクトで同じ報告が作成済みか確認してください。

## 添付画像を使う環境の設定

Firebase コンソールの Storage で既定バケットを有効にし、`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` に設定します。Cloud Functions の実行サービスアカウントには、同じプロジェクトの既定バケットの読み書き権限が必要です。新規環境ではルールもデプロイします。

```bash
firebase deploy --only storage,firestore:rules
```

かんばん本文に埋め込まれる添付画像の URL にはダウンロード用トークンが含まれます。URL を知っている人は、スクラムかんばんの閲覧権限に関わらず、その画像を開けます。

Claude の停止・再開やログの調査方法は [Cloud Functions の運用手順](../../firebase-functions/README.md) を参照してください。
