# README / セットアップ docs 同期 設計書

作成日: 2026年11月14日

対象: [Issue #2](https://github.com/poteto317/daily-routine/issues/2)「docs: READMEの修正」

## 背景と目的

Issue 本文は「新規 PC などの新しい環境で、実際に動作の確認をしながら問題箇所を修正していく」である。調査の結果、ルート `README.md` とセットアップ系 docs（`ONBOARDING.md` / `SETUP_CHECKLIST.md`）に、コード・CI と食い違う記述、入口の導線不足、ローカル認証まわりの落とし穴の記載漏れがある。

目的は、新しい環境の人が **Firebase なしで最短起動できること** を README から辿れ、Firebase 本格セットアップはチェックリスト側で矛盾なく進められるように、ドキュメントを同期することである。

## 決めたこと

利用者への確認で次を採用した。

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| スコープ | README ＋ ONBOARDING ＋ SETUP_CHECKLIST を同期 | 入口・最短経路・チェックリストが分かれているため、README だけ直すとすぐ再びずれる |
| セットアップの入口 | README で「まず Firebase なしで動かす」を主経路にする | ONBOARDING の実績ある手順を README 先頭のセットアップに引き上げる |
| 確認の深さ | このマシンで手順・バージョン・パス・gitignore・ローカル認証条件をコード／CI と突合する | Issue の「新規環境で確認」を、クリーン clone の実走ではなく文書の正確性検証として実施する |
| アプリコードの変更 | しない | 文書の誤りが主因。挙動変更は範囲外 |
| SYNC_SETUP / features.md の全面改訂 | しない | セットアップ入口に必須ではない。矛盾が README／ONBOARDING／SETUP_CHECKLIST に波及するものだけ最小修正 |
| コミット | この feature ステップではしない | `/feature` はコミットしない（後続の `/commit-ja`） |

## 現状で確認した食い違い（実装根拠）

| 問題 | 根拠 |
| --- | --- |
| README の Next.js が 16.3.0 | `package.json` の `next` は `16.4.6` |
| ローカル認証ホストが `localhost` / `127.0.0.1` のみと書かれている箇所がある | `isLocalDevHostname` は `::1` も許可（`src/features/auth/storage.ts`） |
| `.env.local.example` をそのままコピーするとローカル認証が効かない | `isFirebaseConfigured` は apiKey / projectId / appId の truthy 判定のみ。`your-api-key` 等のプレースホルダでも true になる（`src/lib/firebase-modules/config.ts`）。ONBOARDING には注意あり、README／SETUP_CHECKLIST は弱い |
| `cp .env.local.example .env.local` が既存を上書きしうる | L-072。既にある場合は飛ばす案内が必要 |
| README から ONBOARDING へのリンクが無い | `docs/01-getting-started/README.md` では ONBOARDING が最初の入口 |
| clone URL がプレースホルダ | 公開リポジトリは `https://github.com/poteto317/daily-routine.git` |
| SETUP_CHECKLIST 先頭の「完了済み」が個人環境の [x] のまま | 新規環境向けテンプレートとして未チェックであるべき |
| 環境変数表で Firebase 各キーが一律「必須」 | Firebase なし＋ローカル認証経路では不要。経路ごとに必須／任意を分ける |

CI の Node は 22.x / 24.x（`.github/workflows/ci.yml`）。`.nvmrc` は 24。Functions の engines は node 24。Cloud Functions の export 名（`syncRoutines` 等 5 つ）は `firebase-functions/src/index.ts` と SETUP_CHECKLIST の記述は一致。

## 設計

### 文書の役割分担

1. **README.md** — リポジトリの顔。概要・技術スタック・**最短セットアップ（ローカル認証）**・Firebase 本格セットアップへのポインタ・コマンド・ディレクトリ・関連 docs。
2. **ONBOARDING.md** — 初日の読み方とコード入口。セットアップ手順の詳細な注意は README と重複させず、README の該当節へリンクし、食い違いが出ないようにする。
3. **SETUP_CHECKLIST.md** — Firebase / Vercel / Functions を含む本格セットアップのチェックリスト。新規環境用に未チェックから始められる形にし、ローカル認証の条件・プレースホルダ注意・`cp -n`（または同等の上書き防止）を README と揃える。

`docs/01-getting-started/README.md` の「ONBOARDING → SETUP_CHECKLIST」の流れは維持する。README ルート側にも ONBOARDING へのリンクを足す。

### README セットアップ節の構成（案）

1. 前提環境（Node 22/24、`.nvmrc` 24、Functions は 24）
2. インストール（clone URL を実 URL に。`npm install` と `firebase-functions`）
3. **最短: Firebase なしで動かす**
   - 既に `.env.local` が無いときだけ example からコピー（上書きしない）
   - `NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true`
   - Firebase の apiKey / projectId / appId を空にする（プレースホルダ残し禁止）
   - 有効条件: フラグ・Firebase 未設定・ホストが `localhost` / `127.0.0.1` / `::1`
   - `npm run dev` → 匿名またはテストアカウント
4. Firebase を使う場合 → SETUP_CHECKLIST / SYNC_SETUP へ
5. 以降の既存節（Service Worker、コマンド、テスト、同期、デプロイ、ディレクトリ、関連 docs）は事実誤りだけ直す

### ONBOARDING の同期

- セットアップ節は **短い手順＋README へのリンク** を維持する。ホスト一覧（`::1` 含む）・上書き防止・プレースホルダ空の注意だけ README と揃え、手順の全文を二重管理しない。
- 「詳細は README の環境変数の節」リンクが、再構成後の見出しアンカーと一致することを確認する。
- 読む順番表の README 説明を「最短セットアップ含む」に合わせてよい。

### SETUP_CHECKLIST の同期

- 「完了済み」セクションを **新規環境向けの未チェック項目** に戻す（または「自分の環境で確認」と明記したテンプレートにする）。個人の完了状態はリポジトリに残さない。
- npm / Firebase CLI / Vercel CLI の具体バージョン固定が古くなりやすい場合は、「メジャーの目安」か「`npm -v` で確認」に緩め、README の前提と矛盾しないようにする。
- ローカル認証の注意を README と同じ三条件＋プレースホルダ空＋`::1` に揃える。
- 環境変数表: 「Firebase なし経路」「Firebase あり経路」で必須／任意を分ける。または脚注で「ローカル認証のみのときは Firebase キーは空のまま」と明記する。
- 埋め込みの `firestore.rules` 全文は、**リポジトリの `firestore.rules` を正とし、チェックリストからは全文転載をやめて要約＋ファイル参照に寄せる**（L-045）。全文の再同期はしない。

### バージョン表記の対象範囲

受け入れ条件のバージョン整合は、今回触る **README / ONBOARDING / SETUP_CHECKLIST**（およびセットアップ索引 `docs/01-getting-started/README.md` に矛盾があればそこ）に限る。`docs/04-reference/` など他文書の古いバージョン表記は範囲外とする。

### 検証方法（深さ A）

コード変更は無いため `npm run verify` は必須としない。代わりに次を実施し、設計・プランの完了条件とする。

1. `package.json` / `.nvmrc` / CI / Functions engines と README・docs のバージョン記述を突き合わせる。
2. ローカル認証の条件を `storage.ts` / `config.ts` / `localAuthService.ts` と突き合わせる。
3. README・ONBOARDING・SETUP_CHECKLIST 間で、ローカル認証手順・ホスト一覧・上書き防止・プレースホルダ注意が一致することを目視（または検索）で確認する。
4. 文書内の URL ホストを抽出し、許可ホスト（github.com / console.firebase.google.com / localhost / vercel 関連など）と照合する（L-026）。
5. `.gitignore` が `.env*` と `public/firebase-messaging-sw.js` を無視していることを確認し、手順がそれに沿っていることを書く（L-028）。

### 範囲外

- アプリ・設定コードの変更
- クリーンな別ディレクトリへの clone〜install 実走
- SYNC_SETUP.md / features.md / architecture.md の全面更新
- Issue #2 の close（PR 作成後のフローに任せる）
- 秘密情報や実プロジェクトの Firebase 値の記載

## 確認した知見

| ID | 今回の使い方 |
| --- | --- |
| L-072 | `.env.local` 作成は上書きしない（`cp -n` または「既にある場合はスキップ」） |
| L-028 | `.env.local` はリポジトリ直下・gitignore 済みであることを手順で明示。生成 SW をコミットしない注意は維持 |
| L-026 | 手順・チェックリスト内の外部 URL を照合 |
| L-045（参考） | firestore.rules の全文転載は実装とずれやすいので参照寄せを推奨 |

## 受け入れ条件

1. README から Firebase なしで起動する手順が、コード上の有効条件と一致して辿れる。
2. Next.js などバージョン表記が `package.json` / CI / `.nvmrc` と矛盾しない。
3. ONBOARDING・SETUP_CHECKLIST のローカル認証・環境変数の注意が README と矛盾しない。
4. SETUP_CHECKLIST が新規環境用テンプレートとして使える（個人の [x] 完了状態を前提にしない）。
5. アプリのソースコードに変更が無い。
