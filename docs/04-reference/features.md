# 実装機能一覧

デイリールーティン管理アプリで実装されている全機能の詳細ドキュメントです。

## 📋 目次

- [コア機能](#コア機能)
  - [🔄 ルーティン管理](#-ルーティン管理)
  - [📋 ルーティンプリセット管理](#-ルーティンプリセット管理)
- [分析・振り返り機能](#分析振り返り機能)
  - [🗓️ 達成カレンダー](#️-達成カレンダー)
  - [📊 統計・レポート](#-統計レポート)
- [ライフログ機能](#ライフログ機能)
  - [💰 家計簿](#-家計簿)
  - [📔 ジャーナル](#-ジャーナル)
  - [💪 運動記録 (BETA)](#-運動記録-beta)
  - [🍽️ 食事記録 (BETA)](#️-食事記録-beta)
  - [⚖️ 体重記録 (BETA)](#️-体重記録-beta)
  - [🌤️ 天気予報](#️-天気予報)
- [生産性向上機能](#生産性向上機能)
  - [🍅 ポモドーロタイマー (BETA)](#-ポモドーロタイマー-beta)
  - [⏱️ 作業記録タイマー (BETA)](#️-作業記録タイマー-beta)
- [タスク管理機能](#タスク管理機能)
  - [✅ Todoリスト](#-todoリスト)
  - [📝 Todoリスト管理](#-todoリスト管理)
- [システム機能](#システム機能)
  - [🔐 認証](#-認証)
  - [☁️ クラウド同期](#️-クラウド同期)
  - [📣 不具合報告](#-不具合報告)
  - [🔑 APIキー管理](#-apiキー管理)
  - [🔔 通知機能](#-通知機能)
  - [⚙️ 設定](#️-設定)
  - [📱 PWA・オフライン対応](#-pwaオフライン対応)
  - [⚠️ ストレージ書き込みエラー通知](#️-ストレージ書き込みエラー通知)
- [開発・管理機能](#開発管理機能)
  - [📋 機能テストマトリクス](#-機能テストマトリクス)
  - [👥 アカウント管理（管理者専用）](#-アカウント管理管理者専用)
  - [☁️ 同期履歴管理](#️-同期履歴管理)
- [技術スタック](#技術スタック)
- [画面構成と SPA アーキテクチャ](#画面構成と-spa-アーキテクチャ)
- [データストレージ構造](#データストレージ構造)
  - [LocalStorage キー一覧](#localstorage-キー一覧)
  - [Firestore コレクション構造](#firestore-コレクション構造)
- [ファイル構造](#ファイル構造)

---

## コア機能

### 🔄 ルーティン管理

日々の習慣をルーティンとして登録・管理する、本アプリのメイン機能です。

**主な機能**

- ルーティンのCRUD操作（作成・読み取り・更新・削除）
- 時間ベースの管理（開始時間を設定して時系列表示）
- 曜日別・祝日別のルーティン設定
  - 内蔵祝日判定エンジン（`src/lib/holidays.ts`）により、固定祝日、ハッピーマンデー、春分/秋分の天文計算式、振替休日に完全対応（外部API不要でオフライン判定）
- カテゴリ分類（仕事/健康/趣味/勉強/生活/その他）
- ドラッグ&ドロップによる順序変更（ドラッグハンドル方式）
- チェックボックスで達成状態を記録
- 週1〜7回の週間目標を任意で設定
- 同じルーティンを複数曜日に登録している場合、週間目標をグループ全体へ反映
- 日付が変わると自動的にチェックがリセット
- プッシュ通知機能（BETA版・不安定）

**設定項目**

- タイトル（必須）
- 開始時間（HH:mm形式、必須）
- 所要時間（分、必須）
- カテゴリ（必須）
- 実行する曜日・祝日（複数選択可能、必須）
- 説明（任意）
- 週間目標（週1〜7回、任意。未入力で無効）
- 通知（開始時間から何分後か、任意）※BETA版・不安定

**技術仕様**

- ファイル: `src/features/routine/`
- データ保存: LocalStorage（キー: `daily-routines`, `daily-progress`, `daily-history` 等）
- Firestore同期対応
- 通知: Service Worker経由でプッシュ通知（BETA版）
- ドラッグ&ドロップ: @dnd-kit（実装済み）

---

### 📋 ルーティンプリセット管理

複数のルーティンをセットとして保存し、他の曜日にまとめて適用できる機能です。

**主な機能**

- 複数のルーティンをプリセットとして保存
- プリセットに名前と説明を付与
- 保存したプリセットを任意の曜日に一括適用
- プリセットの複製（コピーは元のプリセットから独立し、互いに影響しない）
- プリセットの削除

**使用例**

- 「平日モーニングルーティン」を作成し、月〜金に一括適用
- 「週末ルーティン」を作成し、土日に適用
- 既存プリセットを複製してから一部だけ変更し、別バリエーションを作成

**技術仕様**

- ファイル: `src/features/preset/`
- データ保存: LocalStorage（キー: `routine-presets`）
- Firestore同期対応

---

## 分析・振り返り機能

### 🗓️ 達成カレンダー

月ごとのルーティン達成状況をカレンダー形式で可視化します。

**主な機能**

- カレンダー形式での達成状況表示
- 色分け表示
  - 🟢 緑: 全て達成
  - 🟡 黄: 一部達成
  - ⚪ 灰: 未達成
- 月の切り替え（前月・次月・今月へジャンプ）
- 日付クリックで詳細パネル表示
  - その日のルーティン一覧
  - 達成率表示
  - 完了済み・未完了の表示

**技術仕様**

- ファイル: `src/features/calendar/`
- データ保存: LocalStorage（キー: `daily-history` から集計）
- Firestore同期対応

---

### 📊 統計・レポート

達成記録を週次・月次・カテゴリ別に分析・可視化します。

**主な機能**

**週次レポート**

- 週平均達成率
- 完了したルーティン数
- 総ルーティン数
- 週間目標ごとの達成回数、残り回数、進捗バー
- 現在の連続達成週数と最長連続達成週数

週間目標は月曜日から日曜日までを1週間として集計し、同じグループは1日1回まで数えます。進行中の今週が未達成でも、それまでの現在ストリークは途切れません。目標回数を変更した場合は変更時点から新しいストリークとして集計します。

**月次レポート**

- 月平均達成率
- 最高達成日
- 最低達成日

**カテゴリ別レポート**

- カテゴリごとの達成状況
- Chart.jsによるビジュアル表示
- 月ごとのカテゴリ別サマリー

**表示切替**

- 週次・月次・カテゴリ別の表示モード切替
- 期間選択（今週・今月へジャンプ）

**技術仕様**

- ファイル: `src/features/statistics/`
- データソース: LocalStorage（`daily-history` から算出）
- チャートライブラリ: Chart.js
- react-chartjs-2

---

## ライフログ機能

### 💰 家計簿

日々の支出を記録し、月次予算や固定費・変動費・収入計画と連動してお小遣いを管理する総合家計簿機能です。

**主な機能**

- **支出の記録・編集**
  - 金額入力、日付選択（当月・前月など）、カテゴリ選択、メモ入力、利用時刻（HH:mm）
  - 0 円支出（ノー出費デー）の記録: お金を使わなかった日を 0 円として記録可能（今日より前の日付のみ。「今日」は端末のローカル日付で判定）。記録した日は「1日あたり使える金額」の残り日数から除外され、日割り計算の精度が向上
  - 支出の編集（インライン編集モーダル）および削除（確認付き）
- **月次サマリーとリアルタイム集計**
  - 月の予算、今月の総支出額、予算残り金額（または予算超過額）をカード表示
  - 1日あたり使える金額（当月の未入力日数で自動算出。今日に入力があっても今日だけは日数に含める）
  - 月の切り替え（前月・次月・今月ジャンプ）
- **カテゴリ管理（「カテゴリを管理」画面）**
  - 支出カテゴリの新規追加、名称変更、削除
  - カテゴリカラーのカスタマイズ
  - 未分類や独自カテゴリによる支出の整理
- **固定費・変動費項目管理（「支出項目を管理」画面）**
  - 家賃・保険・サブスクなどの「固定費（fixed）」と、食費・日用品などの「変動費（variable）」を登録・管理
  - 項目ごとの名称と月額想定額のCRUD
- **収入項目管理（「収入項目を管理」画面）**
  - 給与・賞与・副業などの月次収入項目を登録・管理
  - 項目ごとの名称と金額のCRUD
- **収支・お小遣いシミュレーション（「お小遣い設定」画面）**
  - 登録された総収入、固定費合計、変動費合計から、毎月自由に使える「お小遣い（月次予算）」を自動算出
  - 算出された金額をワンクリックで当月の月次予算に適用可能
- **収入・固定費・変動費のエクスポート／インポート（「収入・固定費・変動費の設定」画面）**
  - 登録した収入項目と支出項目を JSON ファイルに書き出し（ファイル名: `daily-routine-budget-allowance-<YYYY-MM-DD>.json`）
  - 読み込むファイルは全件を検証し、件数の確認のうえで、収入項目と支出項目をファイルの内容に置き換える（1 件でも不正なら何も書き込まない。1 MB を超えるファイルや項目が 0 件のファイルは読み込まない）
  - 書き出した項目の `id` と `createdAt` は読み戻しても変わらない
  - 支出履歴やカテゴリも含む家計簿全体のバックアップは、設定画面の「データ管理」で行う

**技術仕様**

- ファイル: `src/features/budget/`
- データ保存: LocalStorage（キー: `budget-data`, `budget-categories`, `budget-income-items`, `budget-expense-items`）
- Firestore同期対応（フィールド: `budgetData`, `budgetCategories`, `budgetIncomeItems`, `budgetExpenseItems`）
- AI エージェント API 対応（`/<redacted-agent-api>/budget/expenses`, `/categories`, `/income-items`, `/expense-items`）
- ステータス: 正式機能

---

### 📔 ジャーナル

日々の思考や出来事を記録する日記機能です。

**主な機能**

- 今日の記録入力
  - タイトル（任意、未入力時は"無題"）
  - 本文（必須）
  - 日付（既定は今日。1900 年 1 月 1 日から今日までの日付を選べる。未来の日付・1900 年より前の日付・空の日付では保存できない）
  - 書き始めた時点の日付で固定（日をまたいでから保存しても、書き始めた日の記録になる）
- 過去の記録一覧表示（日付の新しい順。同じ日付は更新の新しい順。表示は最新の 30 件まで。日付を変えて、30 件目より古い日付の記録にすると、一覧には表示されなくなる）
- 記録の編集・削除
  - 編集でも日付を変えられる（今日の記録・過去の記録とも）。変えた日付に既に記録があっても、確認なしで同じ日付に並ぶ
- 最終更新時刻の表示

**使用例**

- 今日感じたこと、考えたことを自由に記録
- 日々の振り返りに活用

**技術仕様**

- ファイル: `src/features/journal/`
- データ保存: LocalStorage（キー: `journal-history`）
- Firestore同期対応
- AI エージェント API 対応（`/<redacted-agent-api>/journal/entries`）
- ステータス: 正式機能

---

### 💪 運動記録 (BETA)

筋トレやランニングのトレーニング実績を記録・管理する機能です。

**主な機能**

- **運動の記録作成**
  - 運動の種類を選択: 🏋️ 筋トレ（`strength`） / 🏃 ランニング（`running`）
  - 日付（YYYY-MM-DD形式、必須）
  - 種目名（登録済みの種目マスターから選択、必須）
  - 筋トレ固有項目: 重量 (kg)、回数 (reps)、セット数（任意）
  - ランニング固有項目: 消費カロリー (kcal)
- **種目マスターの管理（「種目を管理」開閉領域）**
  - 筋トレ／ランニング別に種目を登録・管理
  - 種目の新規追加（1〜100文字、同種別内の同名重複は不可）
  - 種目名の変更（名前を変更しても過去の運動記録には記録当時の名前を保持）
  - 種目の削除（種目を削除しても過去の運動記録データは保持）
- **記録履歴の閲覧・操作**
  - 日付ごとのグループ化リスト表示（降順）
  - 種別ごとのサマリーフォーマット表示（例: `ベンチプレス 60kg × 10回 (3セット)` / `ジョギング 300kcal`）
  - 個別記録の削除（確認ダイアログ付き）
- **入力バリデーション**
  - 実在する日付の検証
  - 種目選択の必須検証
  - 正の数値入力チェック（重量、回数、セット数、カロリー）

**技術仕様**

- ファイル: `src/features/workout-tracker/`
- データ保存: LocalStorage（キー: `workout-records`, `workout-exercises`）
- Firestore同期対応（フィールド: `workoutRecordHistory`, `workoutExercises`）
  - 古い同期データで種目が欠損している場合は端末の種目を維持し、明示的な空配列は削除として反映
- AI エージェント API 対応（`/<redacted-agent-api>/workout/exercises`, `/<redacted-agent-api>/workout/records`）
- ステータス: BETA版

---

### 🍽️ 食事記録 (BETA)

1日の食事内容を記録する機能です。

**現在の機能**

- 食事の記録（種類・時刻・内容・メモ）
- 食事の種類: 朝食・昼食・夕食・間食
- 今日の食事一覧
- 最近の記録表示（新しい順に最大20件）
- 記録の削除

**今後の予定機能**

- 📷 写真撮影機能（`MealRecord.photo` として型定義のみ存在し、入力UIは未実装）
- 🔢 カロリー計算機能（`MealRecord.calories` として型定義のみ存在し、入力UIは未実装）

**技術仕様**

- ファイル: `src/features/meal/`
- データ保存: LocalStorage（キー: `meal-history`）
- Firestore同期対応
- ステータス: BETA（記録・一覧・削除は利用可能。写真とカロリーは未実装）

---

### ⚖️ 体重記録 (BETA)

日々の体重を記録し、履歴を管理します。

**主な機能**

- 体重の記録（kg単位）
- メモの追加（体調やコメント）
- 今日の記録表示
- 記録履歴一覧
- 記録の編集・削除
- 記録時刻の表示

**技術仕様**

- ファイル: `src/features/weight-tracker/`
- データ保存: LocalStorage（キー: `weight-history`）
- Firestore同期対応
- ステータス: BETA版

---

### 🌤️ 天気予報

現在地または東京の天気予報を表示します。

**主な機能**

- 今日の天気表示
- 降水確率表示
- 位置情報による現在地の天気取得
- デフォルト: 東京の天気
- データのキャッシュ機能
- 最終更新時刻の表示
- 天気の説明文
  - 快晴: 「お出かけ日和ですね！」
  - 雨: 「傘をお忘れなく。」
  - 雪: 「暖かい服装で。」等

**技術仕様**

- ファイル: `src/features/weather/`
- データソース: Open-Meteo API
- 位置情報: Geolocation API
- データ保存: LocalStorage（キャッシュ用）

---

## 生産性向上機能

### 🍅 ポモドーロタイマー (BETA)

集中作業と休憩を管理するポモドーロテクニック実践用タイマーです。

**主な機能**

- 集中時間タイマー（デフォルト: 25分）
- 休憩時間タイマー（デフォルト: 5分）
- タイマー操作
  - スタート
  - 一時停止
  - リセット
  - 休憩へスキップ
- **タイマー完了通知**
  - 効果音通知: タイマー完了時にビープ音（WAV Data URL 形式）を自動再生
  - ブラウザ通知: Notification API を使用し、バックグラウンド時でも集中完了・休憩完了をデスクトップ通知（アプリアイコン `/icon-192.png` 添付）
- 今日の完了ポモドーロ数を記録
- 設定画面で集中時間・休憩時間の変更可能

**技術仕様**

- ファイル: `src/features/pomodoro/`
- データ保存: LocalStorage（キー: `pomodoro-history`）
- Firestore同期対応
- タイマー: setInterval
- ステータス: BETA版

---

### ⏱️ 作業記録タイマー (BETA)

作業時間を計測し、気分やメモとともに記録する機能です。

**主な機能**

- 作業時間の計測（スタート・ストップ）
- 作業内容の記録
  - 作業名（必須）
  - 所要時間（自動計測）
  - 気分・状態（絵文字選択）
  - メモ・理由（任意）
- 今日の作業履歴表示
- 統計情報
  - ベストタイム（最短記録）
  - 平均時間
  - 実施回数
  - 新記録・改善時の表示
- 最近使用した作業名の候補表示

**使用例**

- 作業時間の測定と記録
- 作業効率の可視化
- 改善ポイントの発見

**技術仕様**

- ファイル: `src/features/work-tracker/`
- データ保存: LocalStorage（キー: `work-sessions`, `work-templates`）
- Firestore同期対応
- ステータス: BETA版

---

## タスク管理機能

### ✅ Todoリスト

階層構造・色分け・カテゴリ分類に対応した高機能なTodoリストです。

**主な機能**

- **リストとアイテムの管理**
  - ヘッダーやドロップダウンから複数リストを瞬時に切り替え
  - アイテムの追加（インライン追加入力、リスト設定に応じた先頭/末尾挿入）
  - タイトルのインライン直接編集
  - チェックボックスによる完了切り替え
  - 完了済みアイテムの表示／非表示切り替え
- **階層インデント管理**
  - 最大3段階の階層インデント（子タスク化）
  - 親アイテムの折りたたみ／展開（子アイテムの一括非表示）
  - 親アイテムを移動・並び替えた際、配下の子ブロックも連動して移動
- **ビジュアル装飾 & 分類**
  - アイテム背景色（7色のパレットカラー: 赤・橙・黄・緑・青・紫・桃、または解除）
  - Todoカテゴリによる分類（カテゴリごとの色ラベル表示）
- **高度な編集操作**
  - 任意の位置へのインライン挿入（＋ボタン）
  - クリップボード操作（選択アイテムのカット＆ペースト）
  - 操作の履歴（Undo / Redo キーボードショートカット対応）
  - ドラッグ＆ドロップによる並び替え
  - 個別アイテムの削除

**技術仕様**

- ファイル: `src/features/todo-lists/`
- データ保存: LocalStorage（キー: `todo-lists`, `todo-categories`）
- Firestore同期対応（フィールド: `todoLists`, `todoCategories`）
- AI エージェント API 対応（`/<redacted-agent-api>/todo/lists`, `/items`, `/categories`）

---

### 📝 Todoリスト管理

作成済みのすべてのTodoリストおよびカテゴリを一括管理する画面です。

**主な機能**

- **Todoリストの管理**
  - 新規Todoリストの作成
  - リスト名の変更
  - デフォルト背景色の設定（新規アイテム作成時に自動適用）
  - 新規アイテム追加位置の設定（「先頭」または「末尾」）
  - 完了アイテムの初期非表示設定
  - リストの非表示設定（メニュー一覧から隠す）
  - ドラッグ＆ドロップによるリスト自体の並び替え
  - リストの削除（確認ダイアログ付き、含まれる全アイテムも削除）
- **Todoカテゴリの管理**
  - カテゴリの新規作成・名称変更・削除
  - カテゴリカラーの選択・変更

**技術仕様**

- ファイル: `src/features/todo-lists/`（`useTodoListManagementPageState.ts` 等）
- データ保存: LocalStorage（キー: `todo-lists`, `todo-categories`）
- Firestore同期対応

---

## システム機能

### 🔐 認証

Firebase Authenticationを使用したユーザー認証機能です。

**認証方法**

- メールアドレス・パスワード認証
- 新規アカウント作成
- テストアカウント（test@example.com / test123456）
- 匿名ログイン（アプリ起動時に自動で匿名アカウントを発行）
- ローカル擬似認証（Firebase 未設定時、`NEXT_PUBLIC_ENABLE_LOCAL_AUTH=true` で開発用モックログイン）

**機能**

- 自動ログイン状態維持
- ログアウト
- セッション管理

**技術仕様**

- ファイル: `src/features/auth/`
- サービス: Firebase Authentication
- LocalStorage（ローカル認証時キー: `local-dev-auth-user`）

---

### ☁️ クラウド同期

Firestoreを使用した複数端末間のデータ同期・バックアップ機能です。

**主な機能**

- **手動同期**
  - ⬆️ クラウドにアップロード: ローカルの最新データを Firestore へ保存
  - ⬇️ クラウドからダウンロード: Firestore のデータをローカルへ反映
- **リアルタイム変更検知**
  - Firestore リスナーで他端末からの更新を常時監視
  - 他端末で更新された場合、ヘッダーの同期アイコンや設定画面に「他の端末でデータが更新されています」と通知表示
- **全機能データの包括同期**
  - 同期対象: ルーティン、進捗、履歴、設定、家計簿（データ・カテゴリ・収支項目）、ジャーナル、体重記録、運動記録（記録・種目マスター）、食事記録、ポモドーロ履歴、作業記録（セッション・テンプレート）、プリセット、Todoリスト（リスト・カテゴリ）
- **データ保護・下位互換性設計**
  - リモートデータに特定フィールドが存在しない場合（古いバージョンのアプリやエージェントAPIからの更新時）、ローカルに存在する既存データを消さずに維持
  - 明示的な空配列（ユーザーが全削除した場合）は尊重して空として同期
  - `dailyProgress` は null で上書きしない保護（当日完了状況の誤消失を防止）
- **自動スナップショット保持**
  - アップロードや API 更新のたびに最新5件のスナップショットを Firestore `users/{userId}/syncSnapshots/{snapshotId}` に履歴保存

**技術仕様**

- ファイル: `src/features/sync/`, `src/features/settings/components/CloudSyncSection.tsx`
- サービス: Firebase Firestore（ドキュメント: `users/{userId}`, サブコレクション: `syncSnapshots`）
- Cloud Functions: `firebase-functions/src/sync.ts`（通知用同期 `syncRoutines`）

---

### 📣 不具合報告

アプリ内から直接バグや要望を報告し、GitHub Issue へ自動起票する機能です。

**主な機能**

- **報告フォームUI**
  - ヘッダーメニューの「📣 不具合を報告」からいつでも起動可能
  - 入力項目:
    - 不具合の詳細（必須、1〜2000文字）
    - タイトル（任意、最大100文字。UI省略時はAIが生成）
    - 再現手順（任意、最大2000文字）
    - スクリーンショット画像（任意、PNG・JPEG・WebP・GIF、1枚5MB以下、最大3枚、サムネイルプレビュー・個別削除対応）
- **環境情報の自動収集**
  - 端末情報・再現に必要なコンテキストを自動付与（個人情報は収集しない）
  - アプリバージョン (`appVersion`)
  - ユーザーエージェント (`userAgent`)
  - 発生時URL (`url`)
  - 表示言語 (`locale`)
  - タイムゾーン (`timezone`)
  - クライアント時刻 (`createdAtClient`)
- **GitHub Issue 自動起票連携**
  - 画像が添付されている場合は、クライアントが先に Firebase Storage（`bugReports/{uid}/{reportId}/{fileName}`）へアップロードしてから、Firestore `bugReports/{reportId}` へ `status: "pending"` としてドキュメントを作成（途中失敗時はアップロード済み画像を自動削除）
  - Firestore セキュリティルールおよび Storage セキュリティルールにより不正入力・形式外やサイズ超過の画像・serverTimestamp 改ざんを厳格に拒否
  - Cloud Functions の Firestore トリガー（`onBugReportCreated`）が検知し、添付画像のサイズ・マジックナンバー検証およびダウンロードトークン付き URL の取得を行った上で、GitHub REST API を叩いて `bug`・`user-report` ラベル付き Issue を自動作成（本文の `## スクリーンショット` 節に画像を埋め込み）
  - Issue のタイトルと本文は Claude（Anthropic API）で整形し、添付画像がある場合は画像も Claude に渡して状況把握に活用する（`ANTHROPIC_API_KEY` に `none` を登録すると整形しない）。画像つき整形が失敗した場合は画像なしで1回だけ再整形し、それも失敗した場合は従来の内容（報告文そのまま）で起票する
  - 起票成功時に Firestore を `status: "issued"`, `issueNumber`, `issueUrl` で更新

**技術仕様**

- ファイル: `src/features/bug-report/`, `firebase-functions/src/bugReport/`
- 保存先: Firestore `bugReports/{reportId}`, Firebase Storage `bugReports/{uid}/{reportId}/{fileName}`
- 連携: GitHub REST API（Secret: `GITHUB_TOKEN`、文字列パラメータ: `GITHUB_REPO`）、Anthropic Claude API で Issue を整形（Secret: `ANTHROPIC_API_KEY`。失敗時は従来の内容で起票）

---

### 🔑 APIキー管理

AI エージェントや外部スクリプトからアプリデータを安全に操作するための API キー管理機能です。

**主な機能**

- **設定画面でのキー発行・管理**
  - 設定画面「API キー」セクションからワンクリックで発行
  - 発行時に平文トークン（`[redacted-key-prefix]` 形式、32バイト暗号論的乱数）をモーダルで1回だけ表示（再表示不可、クリップボードコピー対応）
  - キーの再発行（旧キーは即座に失効）および明示的な失効
- **CLI ツール連携（`tools/api-key/cli.mjs`）**
  - `npm run <private-ops> -- <command>` により開発環境やエージェント環境からキー管理が可能
  - `users`: アカウント一覧確認
  - `list`: 紐づくキー一覧
  - `issue`: キーを発行して `.env.local` 等のファイルに直接安全に書き込み（`--replace`, `--env-file` 対応）
  - `revoke`: キーの失効
  - `[redacted]` により `firebase login` 済みの認証情報を利用可能
- **セキュアな設計**
  - 平文トークンはサーバー・Firestore のいずれにも保存せず、SHA-256 ハッシュ値のみを Firestore `apiKeys/{keyHash}` に保存
  - 各キーは発行した Firebase アカウントの uid に紐づき、ユーザー間のデータ分離を保証
  - Firestore セキュリティルールにより認証ユーザー本人の uid のキーのみ作成・削除・照会可能

**技術仕様**

- ファイル: `src/features/api-key/`, `tools/api-key/cli.mjs`, `firebase-functions/src/agentApi/`
- 保存先: Firestore `apiKeys/{keyHash}`

---

### 🔔 通知機能

ルーティンのリマインダーやシステム通知を管理します。

> ⚠️ **注意**: ルーティン通知機能は現在BETA版で不安定です。

**主な機能**

- ルーティン通知（BETA版・不安定）
  - 設定した時間に自動通知
  - 通知内容: 「{ルーティンタイトル} の時間が過ぎています」
- データ変更通知
  - 他の端末でデータ更新時に通知
  - 「他の端末でデータが更新されました。設定画面から同期してください。」
- 通知権限の管理（ブラウザ通知許可の要求・状態確認）
- Service Workerによる確実な配信（`tools/generate-firebase-messaging-sw.mjs` により環境変数から SW を自動生成）

**技術仕様**

- ファイル: `src/features/notification/`
- Service Worker: `public/firebase-messaging-sw.js`（テンプレート: `public/firebase-messaging-sw.template.js`）
- Firebase Cloud Messaging (FCM)
- Cloud Functions: `checkNotifications`, `cleanupNotifications`, `syncRoutines`

---

### ⚙️ 設定

アプリの各種動作や表示をカスタマイズ・管理します。

**設定項目**

- **🎯 機能の表示設定** (`FeatureVisibilitySection`)
  - ヘッダーメニューに表示する機能を選択（不要な機能を非表示にしてシンプル化）
- **🎨 外観設定** (`AppearanceSection`)
  - テーマ切り替え（システム設定連動 / ライト / ダーク）
- **🔀 メニュー並び替え** (`MenuOrderSection`)
  - ドラッグ＆ドロップでメニュー項目の並び順を自由にカスタマイズ
- **🔑 API キー** (`ApiKeySection`)
  - AI エージェント API 用の認証キーの発行・再発行・失効
- **☁️ クラウド同期** (`CloudSyncSection`)
  - 手動アップロード／ダウンロード、最終同期日時、リモート変更検知の表示
- **📤 データ管理** (`DataManagementSection`)
  - **JSON ファイルへのエクスポート**:
    - 選択可能な 8 グループ（チェックボックスで選択した項目のみ出力）:
      1. `routines`: ルーティン登録データ本体 (`routines`)
      2. `progress`: 今日の進捗データ (`progress`。当日進捗が存在する場合のみ出力)
      3. `history`: 達成カレンダー・統計データ全履歴 (`history`)
      4. `settings`: アプリ設定 (`settings`)
      5. `records`: 記録（ジャーナル・体重・運動記録・食事・ポモドーロ・作業）
      6. `todoLists`: Todoリスト（リスト本体・Todoカテゴリ）
      7. `budget`: 家計簿（支出データ・カテゴリ・収入項目・支出項目）
      8. `presets`: プリセット
    - ファイル命名規則: `daily-routine-<types>-<YYYY-MM-DD>.json`（インデント 2 スペースの整形 JSON）
  - **JSON ファイルからのインポート・復元**:
    - ファイル内のグループを自動判別し、含まれているデータのみを安全に復元
    - データ検証: ルーティンの必須フィールド（`title`, `time`, `duration` 等）の形状検証を実施し、壊れたデータの取り込みを拒否
    - 下位互換性: 旧バージョンのバックアップファイルも読み込み可能（ファイルに含まれないグループの手元の既存データは消去せず保持）
    - 進捗保護: `progress` が null の場合はローカルの当日完了状況を保護（当日完了が消えるのを防止）
- **🍅 デフォルト・ポモドーロ設定** (`DefaultAndPomodoroSection`)
  - ルーティンのデフォルト所要時間、通知時間
  - ポモドーロ集中時間（分）、休憩時間（分）
- **🔔 通知テスト** (`NotificationTestSection`)
  - ブラウザ通知・FCMの動作確認テスト
- **🚃 電車遅延通知** (`TrainDelaySection`)
  - 監視する路線の登録・管理（現在UI実装済み。データはモック表示、路線運行情報のAPI連携は今後実装予定）
- **🔒 プライバシーノート** (`PrivacyNoteSection`)
  - 匿名認証とデータ保存に関する説明

**技術仕様**

- ファイル: `src/features/settings/`
- データ保存: LocalStorage（キー: `app-settings`）
- Firestore同期対応

---

### 📱 PWA・オフライン対応

Progressive Web App (PWA) 技術と Workbox による Service Worker を活用し、ネイティブアプリ同様の使い勝手と強力なオフライン耐性を実現しています。

**主な機能**

- **オフラインファースト設計**
  - アプリのすべてのデータは端末の LocalStorage に即座に保存されるため、オフライン環境（機内・電波圏外）でも全機能（ルーティン、家計簿、ジャーナル、運動記録、Todo等）が通常通り動作
  - 通信復帰後に「クラウド同期」から手動で Firestore へ最新状態をアップロード可能
- **Service Worker によるアセット・ドキュメントキャッシュ**
  - Next.js のプロダクションビルド時に Workbox `InjectManifest`（`src/service-worker/custom-sw.js`）を通じて `public/sw.js` を生成
  - 静的アセット（JS, CSS, Webフォント, 各種アイコン画像）の事前キャッシュ（プリキャッシュ、`__WB_MANIFEST`）
  - HTML ドキュメントは `NetworkFirst` 戦略（7日間保持・最大10件）を採用し、Service Worker アクティベート時に事前ウォームアップ（`warmDocumentCache`）を実行することで、リロード時でもオフラインで瞬時に表示
  - スクリプト・スタイルは `StaleWhileRevalidate` 戦略（30日間保持・最大50件）で高速化と最新化を両立
- **ホーム画面への追加（インストール）**
  - `public/manifest.json` による Web App Manifest 定義（アプリアイコン、テーマカラー `#2563eb`、背景色 `#ffffff`、スタンドアロン表示モード、ポートレート固定）
  - 各種デバイス向け解像度アイコン（48px〜512px、iOS 用 Apple Touch Icon、Android 向け maskable アイコン）を完備
- **バックグラウンド通知統合**
  - Firebase Cloud Messaging 用 Service Worker（`public/firebase-messaging-sw.js`）およびカスタム Service Worker のスケジューラ（`custom-sw/schedulerControl.js`）と連携し、ルーティンリマインダーや更新通知を受信可能

**技術仕様**

- サービスワーカー: `src/service-worker/`（`custom-sw.js`, `custom-sw/warmDocumentCache.js`, `custom-sw/schedulerControl.js`, `custom-sw/jstDate.js` 等）
- 生成ツール: `tools/generate-icons.mjs`, `tools/verify-icons-in-sync.mjs`, `tools/generate-firebase-messaging-sw.mjs`
- マニフェスト: `public/manifest.json`
- ライブラリ: `workbox-webpack-plugin`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`

---

### ⚠️ ストレージ書き込みエラー通知

ブラウザの LocalStorage 容量上限（約5MB）到達やプライベートブラウズ制約などによりデータ保存が失敗した際、ユーザーに即座に警告と復旧手順を案内するフェイルセーフ機能です。

**主な機能**

- **書き込み失敗の自動検知とイベント発火**
  - ストレージ操作モジュール（`src/lib/storage/core-modules/storageWrite.ts`）で `setItem` の例外をキャッチ
  - エラー種別を分析（`quota-exceeded`: クォータ容量超過 / `unknown`: 制限やその他のエラー）
  - `STORAGE_WRITE_FAILED_EVENT`（`storage-write-failed` カスタムイベント）をディスパッチ
- **画面下部への警告アラートバナー表示 (`StorageWriteFailureBanner`)**
  - ヘッダー操作やメニューを覆い隠さないよう、画面下部（`fixed bottom-0`）に高優先度アラート（`role="alert"`）として表示
  - 容量超過時: 「保存できる容量の上限に達したため、データを保存できませんでした。不要な記録を削除してから、もう一度お試しください。」と具体的対処法を提示
  - その他エラー時: 「データの保存に失敗しました。ブラウザの設定で保存が制限されている可能性があります。」と提示
  - ユーザーが「閉じる」を押すまで表示を維持し、重要なお知らせの見落としを防止
- **再入ガードとリスナー再送設計**
  - エラーリスナー内での書き込み失敗による無限ループを防ぐ再入ガード
  - React の初回マウント時におけるリスナー登録前の失敗を取りこぼさない直近失敗の再送キャッシュ

**技術仕様**

- ファイル: `src/components/StorageWriteFailureBanner.tsx`, `src/hooks/useStorageWriteFailure.ts`, `src/lib/storage/core-modules/storageWriteFailureEvent.ts`

---

## 開発・管理機能

### 📋 機能テストマトリクス

全機能のテストステータスを管理するQA向け機能です。

**主な機能**

- 機能×端末のマトリクス表示
- ステータス管理
  - ⬜ 未確認
  - ✅ OK（正常動作）
  - ❌ NG（不具合あり）
  - ➖ 対象外（非対応機能）
- セルクリックでステータス切替
- フィルタリング機能
  - 全て表示
  - 未確認のみ
  - NGのみ
  - OKのみ
  - 対象外のみ
- 進捗率表示
- 展開・折りたたみ機能
- リセット機能
- 詳細テストケース管理

**使用例**

- リリース前の動作確認
- 複数端末・ブラウザでの検証
- バグトラッキング

**技術仕様**

- ファイル: `src/features/test-matrix/`
- データ保存: LocalStorage（キー: "test-matrix-data", "test-matrix-detail-data"）

---

### 👥 アカウント管理（管理者専用）

管理者がユーザーアカウントを管理する機能です。

**主な機能**

- アカウント一覧表示
- 新規アカウント作成
- アカウント情報の編集
  - メールアドレス
  - 表示名
  - 管理者権限の付与/剥奪
- アカウント削除
- アクセス制御
  - 管理者のみアクセス可能
  - 自分自身のアカウント削除は不可
  - 自分自身の管理者権限変更は不可

**注意事項**

- 新規アカウント作成後は再ログインが必要
- アカウント削除はデータベース記録のみ削除

**技術仕様**

- ファイル: `src/features/account-admin/`
- サービス: Firebase Authentication, Firestore
- アクセス制御: カスタムクレーム（isAdmin）

---

### ☁️ 同期履歴管理

過去に同期・保存されたスナップショット履歴の閲覧と復元を行う機能です。

**主な機能**

- **スナップショット履歴の一覧表示**
  - Firestore に自動保持されている直近最大5件のスナップショットを表示
  - 作成日時、作成端末ID（`deviceId`）の表示
- **保存データ件数のサマリープレビュー**
  - 各スナップショットに含まれるルーティン件数、家計簿件数、ジャーナル件数、Todoアイテム件数、運動記録件数等を一覧で確認可能
- **ワンクリック復元**
  - 選択した過去のスナップショットからローカルストレージへ即座に復元（確認ダイアログ付き）
  - 復元時も安全なデータマージが行われ、スナップショットに存在しない他機能のデータを誤って消去しない保護設計

**技術仕様**

- ファイル: `src/features/sync/`（`SyncManagementPage.tsx` 等）
- データソース: Firestore `users/{userId}/syncSnapshots/{snapshotId}`

---

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 16.3.0（App Router, React Compiler 有効）
- **言語**: TypeScript 5（strict mode）
- **UIライブラリ**: React 19.2.3
- **スタイリング**: Tailwind CSS 4
- **状態管理**: React Hooks（useState, useEffect, useReducer, カスタムフック）
- **ドラッグ&ドロップ**: @dnd-kit
- **チャート**: Chart.js + react-chartjs-2
- **PWA**: Workbox（InjectManifest による custom-sw.js コンパイルパイプライン）

### バックエンド

- **認証**: Firebase Authentication（メール/パスワード、匿名認証、カスタムクレーム）
- **データベース**: Firebase Firestore
- **ファイルストレージ**: Firebase Storage（不具合報告のスクリーンショット画像保存）
- **通知**: Firebase Cloud Messaging (FCM)
- **サーバーレス関数**: Firebase Cloud Functions（Node.js 24）
- **外部連携**: GitHub REST API（不具合報告の Issue 自動起票）、Anthropic Claude API（不具合報告 Issue の整形。失敗時は従来の内容で起票）

### アーキテクチャ

- **ViewModel分離パターン**: テキスト定数は `locales/ja.json`、ロジックは `helpers.ts`
- **Feature-Based Architecture**: 機能ごとに `src/features/{feature-name}/` に凝集
- **国際化対応**: 各機能に `locales/ja.json` を配置
- **データ永続化**: LocalStorage（機能別モジュール）+ Firestore 同期 + スナップショット履歴
- **AI エージェント連携**: 専用 REST API（`agentApi`）および API キー認証基盤

### ビルド・デプロイ

- **ビルドツール**: Next.js Webpack
- **デプロイ**: Vercel（フロントエンド）、Firebase CLI（Cloud Functions / Rules）
- **CI/CD**: GitHub Actions

### 開発・検証ツール

- **ユニット・統合テスト**: Jest + React Testing Library
- **E2Eテスト**: Playwright
- **コンポーネントカタログ**: Storybook
- **Linter / Formatter**: ESLint 9, Prettier
- **型チェック**: TypeScript (`tsc --noEmit`)
- **ユーティリティ CLI**: `tools/api-key/cli.mjs`（API キー管理）、`tools/tailwind/check-shorthand.mjs`

---

## 画面構成と SPA アーキテクチャ

本アプリは、単一のルートページ（`src/app/page.tsx`）を基盤とした **シングルページアプリケーション（SPA）** です。ヘッダーのナビゲーションや各リンクからの画面遷移は、ブラウザのリロードを伴わずに `PageType` 状態の切り替えによって行われます。

各画面コンポーネントは初期ロード速度を最適化するため、`lazyPageComponents.ts` において Next.js の `dynamic` インポート（コード分割）で定義され、初回表示時にのみオンデマンドで読み込まれます。

### 画面一覧（全23画面）

| 画面識別子 (`PageType`)      | 画面名                               | アイコン | 実装コンポーネント             | カテゴリ             |
| :--------------------------- | :----------------------------------- | :------- | :----------------------------- | :------------------- |
| `home`                       | ルーティン                           | ✅       | `HomePage` / `HomeContent`     | コア機能（ホーム）   |
| `journal`                    | ジャーナル                           | 📔       | `JournalPage`                  | ライフログ           |
| `weight-tracker`             | 体重記録                             | ⚖️       | `WeightTrackerPage`            | ライフログ           |
| `workout-tracker`            | 運動記録                             | 💪       | `WorkoutTrackerPage`           | ライフログ           |
| `pomodoro`                   | ポモドーロ                           | 🍅       | `PomodoroPage`                 | 生産性               |
| `worktracker`                | 作業記録                             | 💼       | `WorkTrackerPage`              | 生産性               |
| `meal`                       | 食事記録                             | 🍽️       | `MealPage`                     | ライフログ           |
| `budget`                     | 家計簿                               | 💰       | `BudgetPage`                   | ライフログ           |
| `budget-category-management` | 家計簿カテゴリ管理                   | 💰       | `BudgetCategoryManagementPage` | ライフログ           |
| `budget-allowance-settings`  | お小遣い設定（収支シミュレーション） | 💰       | `BudgetAllowanceSettingsPage`  | ライフログ           |
| `budget-summary`             | 家計簿サマリー（日次・月次サマリー） | 💰       | `BudgetSummaryPage`            | ライフログ           |
| `weather`                    | 天気予報                             | 🌤️       | `WeatherPage`                  | ライフログ           |
| `calendar`                   | 達成カレンダー                       | 🗓️       | `AchievementCalendar`          | 分析・振り返り       |
| `statistics`                 | 統計・レポート                       | 📊       | `StatisticsPage`               | 分析・振り返り       |
| `preset`                     | プリセット管理                       | 📋       | `PresetPage`                   | コア機能             |
| `todo-lists`                 | Todoリスト                           | ✅       | `TodoListsPage`                | タスク管理           |
| `todo-list-management`       | Todoリスト管理                       | 📝       | `TodoListManagementPage`       | タスク管理           |
| `todo-category-management`   | Todoカテゴリ管理                     | 📝       | `TodoCategoryManagementPage`   | タスク管理           |
| `sync-management`            | 同期履歴管理                         | ☁️       | `SyncManagementPage`           | 開発・管理           |
| `settings`                   | 設定                                 | ⚙️       | `SettingsPage`                 | システム             |
| `bug-report`                 | 不具合を報告                         | 📣       | `BugReportPage`                | システム             |
| `test-matrix`                | 機能テストマトリクス                 | 📋       | `TestMatrixPage`               | 開発・管理           |
| `account-admin`              | アカウント管理                       | 👥       | `AccountAdminPage`             | 開発・管理（管理者） |

---

## データストレージ構造

### LocalStorage キー一覧

すべての機能データはユーザー ID ごとにスコープ化（`user:<uid>:<key>`）または機能キーとして LocalStorage に安全に永続化されます。

| キー                            | 説明                                                 | 機能             |
| ------------------------------- | ---------------------------------------------------- | ---------------- |
| `daily-routines`                | ルーティン登録データ本体                             | ルーティン管理   |
| `daily-progress`                | 今日のルーティン達成・進捗状況                       | ルーティン管理   |
| `daily-history`                 | ルーティン日次達成履歴（過去の全履歴）               | カレンダー・統計 |
| `currentPage`                   | 最後に開いていた画面ルート                           | ナビゲーション   |
| `filterCategory`                | ルーティン一覧のカテゴリ絞り込み状態                 | ルーティン管理   |
| `viewMode`                      | ルーティン表示モード（時系列・カテゴリ別）           | ルーティン管理   |
| `isEditMode`                    | ルーティン編集モードフラグ                           | ルーティン管理   |
| `routine-presets`               | ルーティンプリセット一覧データ                       | プリセット管理   |
| `budget-data`                   | 家計簿データ（支出記録・月次予算）                   | 家計簿           |
| `budget-categories`             | 家計簿のカテゴリ設定一覧                             | 家計簿           |
| `budget-income-items`           | 定期収入項目マスター一覧                             | 家計簿           |
| `budget-expense-items`          | 固定費・変動費項目マスター一覧                       | 家計簿           |
| `journal-history`               | 日記・ジャーナル記録データ                           | ジャーナル       |
| `meal-history`                  | 食事記録データ（朝昼夕間食）                         | 食事記録         |
| `weight-history`                | 体重記録データ                                       | 体重記録         |
| `workout-records`               | 運動記録データ（筋トレ・ランニング履歴）             | 運動記録         |
| `workout-exercises`             | 運動種目マスターデータ（種目一覧）                   | 運動記録         |
| `pomodoro-history`              | ポモドーロ達成回数履歴                               | ポモドーロ       |
| `work-sessions`                 | 作業時間計測セッション履歴                           | 作業記録         |
| `work-templates`                | 作業名テンプレートマスター                           | 作業記録         |
| `todo-lists`                    | Todoリストおよびアイテム一覧データ                   | Todoリスト       |
| `todo-categories`               | Todoカテゴリ設定一覧                                 | Todoリスト       |
| `app-settings`                  | アプリ共通設定（表示機能、テーマ、ポモドーロ時間等） | 設定             |
| `weather_cache`                 | 天気予報 API レスポンスキャッシュ（有効期限30分）    | 天気予報         |
| `weather_preferred_location`    | 天気予報のユーザー選択位置情報                       | 天気予報         |
| `test-matrix-data`              | テストマトリクス動作確認結果                         | テストマトリクス |
| `test-matrix-detail-data`       | 詳細テストケース結果データ                           | テストマトリクス |
| `local-dev-auth-user`           | ローカル開発用の擬似ログインユーザー情報             | 認証             |
| `user:<uid>:_migrated`          | ユーザースコープストレージ移行完了マーカー           | ストレージ基盤   |
| `user:<uid>:_date-key-migrated` | JST 日付キー補正移行完了マーカー                     | ストレージ基盤   |

### Firestore コレクション構造 / Firebase Storage パス構造

```
users/{userId}                         # ユーザー同期データ本体ドキュメント（単一ドキュメントに全機能の最新データを集約）
  ├─ routines: Routine[]
  ├─ dailyProgress: DailyProgress
  ├─ dailyHistory: Record<string, DailyHistory>
  ├─ settings: AppSettings
  ├─ budgetData: BudgetData
  ├─ budgetCategories: BudgetCategory[]
  ├─ budgetIncomeItems: BudgetIncomeItem[]
  ├─ budgetExpenseItems: BudgetExpenseItem[]
  ├─ journalHistory: Record<string, JournalEntry>
  ├─ mealHistory: Record<string, MealRecord[]>
  ├─ weightHistory: Record<string, WeightRecord>
  ├─ workoutRecordHistory: Record<string, WorkoutRecord[]>
  ├─ workoutExercises: WorkoutExercise[]
  ├─ pomodoroHistory: Record<string, number>
  ├─ workSessionHistory: Record<string, WorkSession[]>
  ├─ workTemplates: WorkTemplate[]
  ├─ presets: RoutinePreset[]
  ├─ todoLists: TodoList[]
  ├─ todoCategories: TodoCategory[]
  ├─ lastModified: number
  ├─ deviceId: string
  ├─ updatedAt: Timestamp
  └─ syncSnapshots/{snapshotId}        # 同期スナップショット履歴（最大5件、復元用）

routines/{userId}/...                  # ルーティン通知用データ（Cloud Functions / FCM が参照）

accounts/{accountId}                   # アカウント管理用コレクション（管理者 isAdmin レコード）

bugReports/{reportId}                  # 不具合報告コレクション（クライアント作成 → Cloud Functions が GitHub Issue 起票）
  ├─ uid: string
  ├─ status: "pending" | "processing" | "issued" | "error"
  ├─ title: string
  ├─ description: string
  ├─ stepsToReproduce: string
  ├─ images?: { path: string; contentType: string; size: number }[]
  ├─ meta: { appVersion, userAgent, url, locale, timezone, createdAtClient }
  ├─ issueNumber?: number
  ├─ issueUrl?: string
  ├─ createdAt: Timestamp
  └─ updatedAt: Timestamp

apiKeys/{keyHash}                      # AI エージェント用 API キー（キーの SHA-256 ハッシュを ID として保存）
  ├─ uid: string
  └─ createdAt: Timestamp

# Firebase Storage
bugReports/{uid}/{reportId}/{fileName} # 不具合報告の添付スクリーンショット（最大3枚、各5MB以下、PNG/JPEG/WebP/GIF）
```

---

## ファイル構造

```
daily-routine/
├── docs/                             # プロジェクトドキュメント
│   ├── 01-getting-started/           # 環境構築・初期設定
│   ├── 02-development/               # コーディング規約・設計・教訓
│   ├── 03-testing/                   # テストガイド・マトリクス
│   └── 04-reference/                 # 仕様リファレンス・OpenAPI
├── firebase-functions/               # Firebase Cloud Functions (Node.js 24)
│   └── src/
│       ├── agentApi/                 # AI エージェント用 REST API (CRUD)
│       ├── bugReport/                # 不具合報告 GitHub Issue 起票トリガー
│       ├── notifications.ts          # 通知チェックスケジューラー
│       ├── notificationCleanup.ts    # 通知データ定期クリーンアップ
│       ├── notification-helpers/     # 通知・FCM 配信ユーティリティ
│       ├── sync.ts                   # ルーティン通知用同期
│       └── sync-helpers/             # 同期補助ユーティリティ
├── public/                           # 静的ファイル、PWA マニフェスト、SW テンプレート
├── src/
│   ├── app/                          # Next.js App Router (layout.tsx, page.tsx)
│   ├── components/                   # 共通 UI コンポーネント
│   ├── config/                       # アプリ・メニュー定数設定 (locales/ja.json)
│   ├── features/                     # ドメイン機能別モジュール
│   │   ├── account-admin/            # アカウント管理（管理者専用）
│   │   ├── api-key/                  # API キー管理 UI
│   │   ├── auth/                     # 認証・セッション管理
│   │   ├── budget/                   # 家計簿
│   │   ├── bug-report/               # 不具合報告フォーム・ページ
│   │   ├── calendar/                 # 達成カレンダー
│   │   ├── journal/                  # ジャーナル（日記）
│   │   ├── meal/                     # 食事記録
│   │   ├── notification/             # 通知設定・リクエスト
│   │   ├── pomodoro/                 # ポモドーロタイマー
│   │   ├── preset/                   # ルーティンプリセット
│   │   ├── routine/                  # ルーティン管理（メイン機能）
│   │   ├── settings/                 # アプリ設定
│   │   ├── statistics/               # 統計・週次・月次レポート・ストリーク
│   │   ├── sync/                     # クラウド同期・同期履歴管理
│   │   ├── test-matrix/              # 機能テストマトリクス UI
│   │   ├── todo-lists/               # Todo リスト・Todo リスト管理
│   │   ├── weather/                  # 天気予報
│   │   ├── weight-tracker/           # 体重記録
│   │   ├── work-tracker/             # 作業記録タイマー
│   │   └── workout-tracker/          # 運動記録（筋トレ・ランニング・種目管理）
│   ├── hooks/                        # 共有カスタムフック
│   ├── layouts/                      # ヘッダー・共通レイアウト
│   ├── lib/                          # ストレージ基盤・Firebase・祝日計算
│   └── types/                        # TypeScript 型定義
├── tools/                            # 開発・運用支援スクリプト
│   ├── api-key/                      # API キー発行・管理 CLI (cli.mjs)
│   ├── generate-firebase-messaging-sw.mjs
│   ├── generate-icons.mjs
│   └── tailwind/                     # Tailwind ユーティリティチェック
├── e2e/                              # Playwright E2E テスト
├── firestore.rules                   # Firestore セキュリティルール
├── storage.rules                     # Firebase Storage セキュリティルール
└── package.json
```

---

## 今後の開発予定

### 短期（実装中・近日中）

- 食事記録の写真撮影機能
- 食事記録のカロリー計算機能
- 電車遅延通知のAPI連携

### 中期（検討中）

- 多言語対応（en.json等の追加）
- ルーティンのタグ機能
- 目標設定・進捗管理機能のさらなる拡張
- データの可視化強化

### 長期（構想段階）

- モバイルアプリ化（React Native等）
- ソーシャル機能（友達との共有等）
- AI活用（習慣化アドバイス等）

---

## リンク

- [プロジェクト概要](../../README.md) - ルートREADME
- [セットアップガイド](../01-getting-started/) - 環境構築
- [開発ガイドライン](../02-development/) - コーディング規約
- [テストガイド](../03-testing/) - テスト方法とマトリクス
- [API リファレンス](./agent-api.md) - AI エージェント向け API
- [OpenAPI 仕様書](./openapi.yaml) - OpenAPI 3.0.3 定義

---

[📖 ドキュメントトップに戻る](../)

---

**最終更新日**: 2026年10月10日  
**バージョン**: 0.2.0
