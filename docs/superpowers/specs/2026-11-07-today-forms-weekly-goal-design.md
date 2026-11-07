# 家計簿フォームの 0 円警告と週目標の進捗の日またぎ 設計書

- 対象 issue: [#211](https://github.com/poteto317/daily-routine/issues/211)「家計簿フォームの 0 円警告と週目標の進捗が、0 時をまたいだあと前日の今日を基準にしたまま残る」
- 作成日: 2026-11-07
- 関連: #208 / PR #209（React Compiler の「今日固定」の修正。この 2 か所を「害が小さい」として直さなかった）、#210 / PR #212（ホームの日付ラベル・祝日・選択中の曜日）、知見 L-538（今日を古いまま持つ問題）、L-690（コンパイラを通さないテストで確かめたつもりになる）、L-692（番兵値の再描画が省かれる）、L-368（手動確認の手順）、L-060（配線テスト）

## 背景と問題

アプリを開いたまま 0 時をまたぐと、次の 2 つが前日の今日を基準にしたまま残る（実機で再現したものではなく、コードの読み取りとコンパイル結果による指摘）。

1. **家計簿の支出フォーム（追加・編集）の 0 円警告**: `BudgetExpenseForm.tsx` と `BudgetExpenseEditForm.tsx` が、描画時に `isZeroAmountOnUnavailableDate(金額, 日付, new Date())` を呼んで「0 円を今日以降の日付に入れている」警告を出す。React Compiler がこの式を金額・日付でメモ化するため、日をまたいだ直後に、金額も日付も変えない状態では、前日の今日で判定された警告が残る。保存時の検証（`isExpenseAmountAllowedOnDate`、`buildExpensePayload` の `now`）は保存の瞬間の今日で行うので、誤った保存にはならない
2. **週目標の進捗**: `src/features/statistics/page/useWeeklyGoalProgress.ts` の `useMemo` の依存が `[selectedDate, now]` で、今日（`new Date()`）が依存に入っていない。`today` は JST の週の開始日（月曜始まり。`weeklyGoalDateKeys.ts` の `getWeekStartKey`）を求めるためだけに使われる（`weeklyGoals.ts`）ので、結果が古くなるのは JST の月曜 0 時をまたいだときだけ。そのとき、選択日を変えるか開き直すまで、今週の判定（目標の一覧の選び方・連続記録の終わりの週）が前の週を基準にしたままになる

#208 / #210 と同じく「描画時に求めた今日が古いまま残る」問題で、#208 で作った共通フック（`src/hooks/useToday.ts` の `useJstTodayKey`・`useLocalTodayKey`）で直せる。

## 決めたこと

1. **2 か所とも、共通フックから今日を取り、描画のたびに新しい今日で判定する**（0 時に自動で再描画する仕組みは作らない。日をまたいだあとは「次の描画（操作・タブの切り替え）で追いつく」。#208・#210 と同じ方針）
2. 利用者に確認が必要な選択はない（#211 の対応方針に従う。着手の要否は依頼で決まった）

## 設計

### 家計簿の支出フォーム（追加・編集）

- `BudgetExpenseForm.tsx` と `BudgetExpenseEditForm.tsx` で、`const todayKey = useLocalTodayKey();` を呼び（家計簿は端末ローカルの日付が基準。`toDateKey(new Date())` と同じ結果）、`isZeroAmountOnUnavailableDate(金額, 日付, now)` の第 3 引数に、`todayKey` から作ったローカル 0 時の Date（`new Date(`${todayKey}T00:00:00`)`）を渡す。判定は日付の部分（`isBeforeToday` → `toDateKey(now)`）しか使わないので、0 時の Date でも結果は同じ
- 依存に足すだけではなく、`todayKey` を計算の中で実際に使う（#208 のレビューで、本体で使わない依存はコンパイラが依存から外し、lint でも落ちることを確認済み）
- 保存の検証（`buildExpensePayload` の `now`、`isExpenseAmountAllowedOnDate`）は保存の瞬間の今日のまま変えない

### 週目標の進捗

- `useWeeklyGoalProgress` で、`const todayKey = useJstTodayKey();`（JST の `YYYY-MM-DD`。`getWeekStartKey` の基準と同じ）を呼び、`useMemo` の中で、`options.now` が無いときの `today` を `todayKey` から作った JST の Date（例: `new Date(`${todayKey}T00:00:00+09:00`)`）にして `calculateWeeklyGoalProgress` に渡す。依存は `[selectedDate, now, todayKey]`。`getWeekStartKey` は JST の日付キーから週の開始日を求めるので、JST の 0 時の Date でも結果は同じ
- `options.now`（テストが注入する時計の関数）がある場合は、今まで通り `now()` を使う（既存のテストの流儀を保つ）
- `getRoutines()`・`getMonthlyHistory()` の読み出しは今まで通り `useMemo` の中（今日とは別の既存の挙動。変えない）

### 契約テストの対象に加える

`src/__tests__/reactCompilerToday.contract.test.ts` の `TODAY_TARGETS` に、次の 3 ファイルを足す（#208・#210 の形。コンパイル結果で、今日が固定されないことを確かめる）。#211 の設計レビューで、設計どおりの形をコンパイルして次のとおり確かめ済み。

- `BudgetExpenseForm.tsx`・`BudgetExpenseEditForm.tsx`: `hookCall: "useLocalTodayKey("`、`dependencies: ["todayKey"]`。コンパイル結果は `if ($[0] !== expenseAmount || $[1] !== expenseDate || $[2] !== todayKey)` の中で判定する形になる
- `useWeeklyGoalProgress.ts`: `hookCall: "useJstTodayKey("`、`dependencies: ["todayKey"]`。手書きの `useMemo` だけのフックでもコンパイルの対象になり（`_c(` が出る）、`if ($[2] !== now || $[3] !== selectedDate || $[4] !== todayKey)` の形になる。依存の配列から `todayKey` だけを外すと、コンパイラはこのフックのコンパイルを丸ごと諦めて `_c(` が無くなる（lint も `react-hooks/preserve-manual-memoization` と `exhaustive-deps` で落ちる）ので、契約テストの「コンパイルされている」の確認で落ちる

変異の確認（実装プランで 1 回行い、結果を記録する。テストには含めない。変異ごとの期待を分けて書く: L-690）:

- 共通フックの呼び出しを `new Date()` の直接呼び出しに戻す → `todayKey` の依存の確認と `hookCall` の確認が落ちる
- `useWeeklyGoalProgress` の依存の配列から `todayKey` を外す → 「コンパイルされている」（`_c(`）の確認と「メモ化の依存の比較に `todayKey` がある」の確認の 2 つが落ちる。sentinel の確認は対象が無いので通り、`hookCall` の確認も通る（実際のコンパイル結果で確かめ済み）

### ドキュメント・確認表

- `docs/02-development/coding-standards.md` の節「React Compiler と今日・現在時刻」の変更は不要（規約は変わらない）
- 確認表（`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/`）に、次の手動確認を足す。ID は既存のものを変えない・振り直さない。ID は `8-17`（`8-17-1`・`8-17-2`。家計簿は 8 の表）と `11-8`（`11-8-1`。統計の週目標は統計の表）。足す場所は `8-16`・`11-7` の直後。手順は L-368 に従い具体的に書く（端末のタイムゾーンが日本であること、端末の日時を 23:59 付近にして、アプリを開いたまま 0 時をまたぐ、またぐ前後の期待）
  - 家計簿（`8-17`。追加フォームを `8-17-1`、編集フォームを `8-17-2` の別のケースにする）: 準備として、家計簿のカテゴリを 1 つ以上作っておく（カテゴリは初期値が空で、空のときの選択欄は「選択しない」しか無く、「別のカテゴリを選び直す」操作ができない）。0 円を今日の日付で入力して警告が出ている状態で 0 時をまたぐ → **「カテゴリ（任意）」の選択欄で、今と違う項目（「選択しない」とカテゴリを切り替える）を選ぶ（金額・日付は変えない）**（日をまたいだだけではフォームは再描画されないので、再描画を起こす操作が要る。金額・日付を変えると直す前でも判定し直されるので、金額・日付を変えずにフォームの props が変わるカテゴリの選び直しを使う） → 警告が消える（またいだ後の「昨日」になった日付に 0 円は有効なため）。月末・年末をまたがない日で行う。追加フォームと編集フォームの両方に同じ準備を書く
  - 週目標（統計の表の `11-8`）: 準備として、(a) 週の目標のあるルーティンを用意し、**週間目標は前の週の開始日（月曜）以前に設定しておく**（前の週が連続の数に入るのは、今の `weeklyGoal.startedAt` の週が前の週以前のときだけ。週の目標回数を変えると `startedAt` が変えた時点にリセットされるので、**今週の未達は完了の回数で作り、目標回数は変えない**）、(b) 日曜を含む週の目標を未達にし、その前の週を達成済みにしておく。日曜 23:59 に統計画面を開き、「📅 週次」の表示で「週間目標」のパネルが「現在 N週」（N は 1 以上）になっていることを確かめる → 月曜 0 時をまたぐ → 選択日は変えずに、「📆 月次」に切り替えてから「📅 週次」に戻す（週の表示で「今日」に戻る役目の「今週」ボタンは選択日を変えるので、直す前でも結果が変わり、確かめにならない。使わない）。期待: 「週間目標」の「現在 N週」が「現在 0週」になる（「最長」は変わらない。またいだ後は、その週が「過去の週」として扱われるため。選択日の初期値が `useState(new Date())` のままなので、選択日は変わらない。日曜に開くと期間の表示（ラベル・グラフ）が翌週になるのは現状の挙動で、この確認の対象外）。端末の日時の設定が必要なので、実機で試す手順を具体的に書く
- 既知の制約と範囲外は、ここに書いたとおり

## 既知の制約と懸念

1. 日をまたいだあとは、次の描画まで画面は古い（決めたこと 1）
2. 週目標は、JST の月曜 0 時をまたいだときだけ結果が変わる。ほかの日の 0 時をまたいでも、画面の見た目は変わらない
3. 家計簿のフォームは、日をまたぐと「昨日」になった日付の 0 円が有効になり警告が消える（保存時の検証は元から保存の瞬間の今日で行われる）。日をまたいだだけではフォームは再描画されず、再描画を起こす操作（金額・日付・カテゴリの変更など）か開き直すまで古い
4. `getRoutines()`・`getMonthlyHistory()` の読み出し結果（ルーティンや履歴）は、描画のたびに読み直されるわけではない（今日とは別の既存の挙動。変えない）

## テストの方針

- 家計簿のフォーム: Jest（ts-jest）は React Compiler を通らないので、「描画後にフェイクタイマーで日付を進めて再描画すると、0 円の警告の判定が新しい今日になる」テスト（追加・編集の両方）は、**直す前のコード（描画のたびに `new Date()`）でも通り、赤を作れない**（L-690）。これは本物の経路の固定（直した後も判定が新しい今日になること）として足し、その旨をテストのコメントに書く。赤を作るのは配線テスト（`useLocalTodayKey` をモックして時計と違う日付を返し、判定に反映される）と契約テスト。再描画のないまま日をまたいだ場合は、保存の検証が保存の瞬間の今日で行われることを確かめるテストを `useBudgetPageState.test.tsx` に 2 件足す（追加・編集。直す前でも通る。L-538）。既存の 0 円のテストは変えない。既存のテストの期待を弱めない
- 週目標: フェイクタイマーで描画後に JST の月曜 0 時をまたぎ、再描画すると `calculateWeeklyGoalProgress` に新しい週を基準にした `today` が渡る（`useWeeklyGoalProgress` のテストの流儀に合わせる。`options.now` が無いとき）。手書きの `useMemo` は Jest でも依存を尊重するので、このテストは直す前のコードでは落ちる（本物の赤になる）。ただし、**再描画で `selectedDate` に同じ Date のインスタンスを渡す**（`rerender` の前後で同じ参照）。毎回新しい Date を渡すと、直す前でも再計算されて通ってしまう。`options.now` を渡したときは、今まで通り `now()` が使われる
- 配線テスト（L-060）: 共通フックの戻り値が使われること（フックをモックして時計と違う値を返し、判定・`today` に反映される）
- 契約テスト（上記）
- 全体: `npm test`（`TZ=Asia/Tokyo`。ワークツリー配下では `jest.config.ts` の `testPathIgnorePatterns` に `/\.worktrees/` があるため 0 件になる。`npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'` で上書きして実行する）、`npm run typecheck`、`npm run typecheck:functions`、`npm run lint`、`npm run tailwind:scan`、`npm run build`

## 範囲外

- 0 時に自動で再描画する仕組み
- `getRoutines()`・`getMonthlyHistory()` の読み直し
- 家計簿の保存時の検証（元から保存の瞬間の今日で行われている）
- 統計の `selectedDate` の初期値（`useStatisticsPeriodState` の `useState(new Date())`。利用者が選ぶ日付の初期値で、今日の判定ではない）
