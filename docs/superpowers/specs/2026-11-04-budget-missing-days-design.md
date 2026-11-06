# 家計簿で当月の過ぎた日のうち未入力の日を分かるようにする（Issue #191）

## 概要と解釈

Issue #191 の本文は「家計簿で、未入力の日付があった場合に分かるようにしてほしい。対象は、その月のうち既に過ぎている日。」、題名は「当月の過ぎた日のうち未入力の日付が分かるようにしてほしい」。報告者の端末は Android 10 の Chrome。

この設計では、次のように解釈する。

- **「家計簿」**: アプリの家計簿のトップページ（`src/features/budget/BudgetPage.tsx`。機能一覧 `docs/04-reference/features.md` の「💰 家計簿」）。日付ごとに入力するのは支出（`Expense`）だけで、収入・固定費・変動費（`BudgetIncomeItem`・`BudgetExpenseItem`）は月に紐付かないテンプレートで日付を持たない（`src/types/routine/budget.ts`）。したがって「入力」は支出の記録を指す。
- **「未入力の日」**: その日の日付（`Expense.date`）を持つ支出の記録が 1 件も無い日。金額 0 円の記録（ノー出費デーの記録。今日より前の日付だけ保存できる。`utils/expenseAmountRule.ts` の `isExpenseAmountAllowedOnDate`）も「入力済み」に数える。家計簿にはすでに「お金を使わなかった日を 0 円で記録する」仕組みがあり、既存の「1日あたり使える金額」の未入力日数（`utils/unenteredMonthDays.ts` の `calculateUnenteredMonthDays`）でも、今日より前の 0 円の記録を入力済みに数えている。これと同じ考え方にそろえる。
- **「その月のうち既に過ぎている日」**: 当月の 1 日から昨日まで（今日は含めない。今日はまだ支出が増えうるため。0 円の記録が今日以降に許されない理由と同じ）。「今日」は端末のローカル日付（家計簿の既存の判定 `toDateKey(new Date())` と同じ）。
- **「当月」**: 題名の「当月」に従い、表示するのは家計簿で表示中の月が今月のときだけ。前月・次月を表示しているときは出さない（「ユーザー確認が必要な事項」の 1）。

## 決めたこと

利用者に確認し、推奨案で確定（2026-11-04）:

| 項目                 | 決定                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 表示する月           | 表示中の月が今月のときだけ表示する。前月・次月では表示しない                                                                                                  |
| 「未入力」の定義     | その日付の支出の記録（金額 0 円を含む）が 1 件も無い、今月の 1 日〜昨日の日                                                                                   |
| 見せ方と場所         | 家計簿トップの「1日あたり使える金額・今日の支出」のカードの下、「➕」（支出を記録）ボタンの上に、未入力の日を日付のボタンで並べた欄を出す。見出しに日数を出す |
| 日付のボタンを押すと | 支出の入力フォームを、日付にその日を入れた状態で開く                                                                                                          |

細部として決めたこと（利用者の確認は不要とした）:

| 項目                               | 決定                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 未入力の日が 0 日のとき            | 欄ごと出さない（「すべて入力済み」のような文言も出さない）。今月の 1 日（過ぎた日が無い）も同じ                                                                                                                                                                                                                                                                                          |
| 並び順                             | 日付の昇順（古い日から）                                                                                                                                                                                                                                                                                                                                                                 |
| 日付のボタンの表記                 | `3日(火)`（`toLocaleDateString("ja-JP", { day: "numeric", weekday: "short" })`）。読み上げ用の名前は `11月3日(火)の支出を記録`                                                                                                                                                                                                                                                           |
| 多いとき                           | 折り返して全部並べる（最大 30 個。月末日に今月の記録が 1 件も無いとき）。折りたたみ・「もっと見る」は付けない                                                                                                                                                                                                                                                                            |
| フォームがすでに開いているとき     | 日付だけをその日に差し替え、入力中の金額・カテゴリは残す（既存の `openExpenseForm` はフォームを表示するだけで金額・カテゴリを消さない。その動きのまま）。開く操作（日付のボタン）のたびに、フォームが画面の外にあればもう一度見える位置へスクロールする（同じ日付をもう一度押したときも、フォームが画面の外にあれば動く）                                                                |
| 編集中の支出があるとき             | 編集を閉じてから追加フォームを開く（既存の「➕」と同じ。`useBudgetPageState` の `startAddExpense` の双方向の排他）                                                                                                                                                                                                                                                                       |
| フォームを開いたときのスクロール   | 支出の入力フォーム（`BudgetExpenseForm`）がマウントされたときと、開く操作（日付のボタン・「➕」）が行われるたび（state が数える `formOpenRequest` が増えたとき）に、フォームの外枠を `scrollIntoView({ block: "nearest" })` で見える位置へスクロールする。月の移動や日付欄の手動変更ではスクロールしない。すでに見えているときは動かない（下の「フォームを見える位置へスクロールする」） |
| 「➕」で開くときの日付欄           | 「➕」は、直前に日付ボタンや日付欄で選んだ日付を引き継がず、必ず既定の日付（今月なら今日、他の月ならその月の 1 日。`getDefaultExpenseDate(monthState.currentDate)`）に戻してから開く。日付ボタンで開く `startAddExpenseOnDate` はこの戻し処理を通らず、押した日付で開く（追加・キャンセルの後に日付の state が残っても、次の「➕」には持ち越さない）                                     |
| 「今日」の取り方                   | フックが**描画のたびに** `toDateKey(new Date())` で今日を取り直し、計算の `useMemo` の依存に今日の日付キーを入れる（L-538）。フックは `"use no memo"` で React Compiler の自動メモ化から外す（外さないと今日が初回の値で固定される。「設計 › フック」）。日付の変化を検知するタイマーや `visibilitychange` の購読は足さない（「懸念」の 1）                                              |
| 月の範囲外の日付を持つ支出         | 表示中の月の日付（`date` の先頭 7 文字が表示中の月キー）の支出だけを見る。バケットのキーと `date` が食い違う古いデータ・同期で入ったデータでも、別の月の日を「入力済み」にしない（既存の `calculateUnenteredMonthDays` と同じ）                                                                                                                                                          |
| 未入力の日の判定と既存の未入力日数 | 別の関数にする。既存の `calculateUnenteredMonthDays` は「1日あたり使える金額」の分母（今日・未来の日を含む日数で、今日に入力があっても今日を数える）で、目的が違う。既存の関数は変えない                                                                                                                                                                                                 |

## ユーザー確認が必要な事項（確認済み）

2026-11-04 に利用者に確認し、4 項目とも推奨案（A）で確定した。各項目の選択肢と「変わるところ」は、後で方針を変えるときの手がかりとして残す。

- 回答: 1 は A（今月だけ）、2 は A（0 円を含む記録が無い日）、3 は A（日付のボタンを並べた欄）、4 は A（その日付で支出フォームを開く）。

1. **表示する月**
   - A（推奨）: 表示中の月が今月のときだけ（今月の 1 日〜昨日）。題名の「当月」に合う。過去の月は、アプリを使い始める前の月まで全日が「未入力」に並び、意味が薄い。
   - B: 過去の月も表示する（その月の全日が対象）。
   - C: 過去の月も表示するが、最初の支出の記録の日より前は対象外にする。
   - 変わるところ: フック `useBudgetMissingExpenseDates` の「今月でなければ空」の条件だけ（純粋な関数は過去の月にも正しい結果を返すように作るため）。C は純粋な関数に「最初の記録の日」の引数を足す。テストと確認表 8-15-4 も変わる。
2. **「未入力」の定義**
   - A（推奨）: 支出の記録（0 円を含む）が 1 件も無い日。「使わなかった日」は 0 円で記録すれば消せる（欄の説明文で案内する）。
   - B: 0 円より大きい支出が無い日（0 円の記録も未入力に数える）。この場合、0 円の記録をしても消えず、「使わなかった日」と「入力を忘れた日」を区別する手段が無くなる。
   - 変わるところ: 純粋な関数の「入力済みの日」の集め方と、欄の説明文・テスト。
3. **見せ方と場所**
   - A（推奨）: カードの下・「➕」の上に、日付のボタンを並べた欄（見出しに日数）。どの日が抜けているかが一目で分かり、押してそのまま入力できる。
   - B: 日数だけのバッジ・1 行の文言（押すと日付の一覧を開く）。画面は狭くて済むが、どの日かを見るのに 1 手間増える。
   - C: カレンダー（月の格子）で未入力の日に印を付ける。家計簿にカレンダーの部品は無く（達成カレンダー `features/calendar` の部品は履歴の型に結び付いている）、作る量が大きい。
   - 変わるところ: コンポーネント `BudgetMissingExpenseDays` と文言・Storybook・確認表。ロジックとフックは変わらない。
4. **日付のボタンを押したときの動作**
   - A（推奨）: その日付を入れた支出の入力フォームを開く。
   - B: 何もしない（表示だけ。ボタンではなく文字として並べる）。
   - 変わるところ: B なら `startAddExpenseOnDate` の配線が不要になり、コンポーネントは `onSelectDate` を持たない。

## 範囲

やること:

- 純粋な関数: 表示中の月の、今日より前の日のうち支出の記録が無い日の一覧を求める関数と、日付のボタンの表記・読み上げ名の整形関数。
- フック: 今日を描画のたびに取り直して上の関数を呼ぶフックと、日付を入れて支出フォームを開く操作。
- コンポーネント: 未入力の日の欄（見出し・説明・日付のボタン）。文言（`src/features/budget/locales/ja.json`）。
- 画面の配線（`useBudgetPageState` → `budgetPageStateResult` → `BudgetPage.tsx`）。
- テスト・Storybook。
- 説明と確認表: `docs/04-reference/features.md` の家計簿の節、手動確認表 3 か所。

やらないこと（YAGNI）:

- 通知・リマインダー（「昨日の支出が未入力です」の通知など）。
- 複数の日をまとめて 0 円で記録する一括入力。
- 過去の月の未入力の日の表示（「ユーザー確認が必要な事項」の 1 で B・C が選ばれた場合だけ足す）。
- 月次サマリーページ（`BudgetSummaryPage`）・AI エージェント API・同期・保存の形式の変更（データは変えず、表示だけの機能）。
- 既存の「1日あたり使える金額」の計算（`calculateBudgetMetrics`）の今日の取り方の修正（「懸念」の 2。別の課題）。
- 手動確認表のアプリ内の実体（`initialData.ts`）に、文書の表にだけある 8-8〜8-14 が無い食い違いの解消（「懸念」の 4）。

## 調査で分かった現状

### 家計簿の画面の構成

- `BudgetPage.tsx`（97 行）は、見出し → 「📊 月次サマリー」「🏷️ カテゴリ管理」のリンク → `BudgetMonthNavigation`（「← 前月」・年月・「今月に戻る」・「次月 →」）→ `BudgetDailySummaryCards`（今月のときだけ「1日あたり使える金額」「今日の支出」のカード。今月でなければ `null`）→ 「➕」ボタン（フォームを閉じているとき）または `BudgetExpenseForm` → `BudgetExpenseList`（「📋 支出一覧」。日付の降順）の順に並ぶ。状態はすべて `useBudgetPageState` から受け取る。
- カードの色は `bg-purple-50 dark:bg-purple-100`・`bg-cyan-50 dark:bg-cyan-100` の流儀（ダークモードは背景を少し濃い同系色にし、文字を `dark:text-*-800` にする）。
- `BudgetPage.test.tsx` は `useBudgetPageState` をモックして画面の委譲を確かめる。`BudgetPage.stories.tsx` は `localStorage` に今月（実行時の今日から求める相対の月）のデータを入れる。日付を固定する仕組み（mockdate など）は Storybook に無い。

### 支出のデータ構造

- `Expense = { id, date, amount, categoryId?, createdAt, usedTime? }`。`date` は `"YYYY-MM-DD"`（端末のローカル日付）。
- 保存は `BudgetData = { expenses: { [month: "YYYY-MM"]: Expense[] } }`（LocalStorage `budget-data`。Firestore の `budgetData` に丸ごと同期）。`addExpense` は `date` の先頭 7 文字のバケットへ入れ、`updateExpense` は日付が月をまたぐとバケットを移す（`storageExpenses.ts`）。AI エージェント API も `date.slice(0, 7)` でバケットを決める（`firebase-functions/src/agentApi/operations/expenses/expenseStore.ts`）。ただし古いデータ・同期・インポートでキーと `date` が食い違う可能性は残るため、既存の `calculateUnenteredMonthDays` は `getMonthKeyFromDateValue(expense.date) === 表示中の月キー` で絞っている。
- 画面が持つ支出は表示中の月のバケットだけ（`getMonthStateSnapshot` → `getMonthlyExpenses(monthKey)`）。
- 金額 0 円: 「支出が無かった日」の記録。今日より前の日付だけ保存できる（`isExpenseAmountAllowedOnDate`）。フォームの金額欄の下に説明（`expenseForm.amountHint`）がある。

### 日付を扱う既存の関数（`src/features/budget/utils/date.ts`）

- `toDateKey(date)`: ローカルの `"YYYY-MM-DD"`。`toMonthKey(date)`: `"YYYY-MM"`。
- `daysInMonth(date)` / `daysInMonthByKey(monthKey)`: `new Date(年, 月 + 1, 0).getDate()` でうるう年・月末を扱う。
- `isBeforeToday(dateValue, now)`: 固定長の文字列比較。`isCurrentMonthDate(date, now)`。
- `getMonthKeyFromDateValue`・`getDayFromDateValue`・`buildDateValue(monthKey, day)`。
- `shiftMonthToFirstDay`: 月をずらすときに常に 1 日を返し、月末日のオーバーフローを避ける（L-471 の対策が既にある）。
- ジャーナルの `getTodayDateString`（`features/journal/utils/journalDate.ts`）は家計簿では使っていない。家計簿は `toDateKey(new Date())` で今日を取る。

### 支出フォームの日付

- 日付欄は `BudgetExpenseDateSelect`（「日付（月）」「日付（日）」の 2 つの `<select>`）。月の選択肢は日付欄の値自身の月の前月・当月・翌月、日の選択肢はその月の日数分（`budgetExpenseDateOptions.ts` の `buildAdjacentMonthOptions`・`buildExpenseDayOptions`）。
- 日付の state `expenseDate` は `useBudgetMonthState` が持ち、setter `setExpenseDate` を公開している。初期値・月の移動のたびに `getDefaultExpenseDate`（今月なら今日、それ以外は 1 日）が入る。フォームを開く `openExpenseForm` は表示のフラグを立てるだけで、日付・金額・カテゴリを触らない。閉じる `closeExpenseForm` は金額とカテゴリだけを消す（日付は残る）。このため、日付の state が残ったまま「➕」で開くと直前の日付で開いてしまうので、「➕」は開く前に既定の日付へ戻す（「懸念」の 5）。
- したがって、**日付の初期値を渡してフォームを開くには、`setExpenseDate(日付)` の後に既存の `startAddExpense`（編集を閉じて `openExpenseForm`）を呼べばよい**。フォームの部品の変更は要らない。

### 「今日」と再描画

- `useBudgetPageMetricsState` は `useMemo(() => calculateBudgetMetrics(currentDate, monthBudget, expenses), [currentDate, expenses, monthBudget])` で、中の `new Date()` が依存に入っていない。ページを開いたまま日をまたぐと、月の移動か支出の変更まで「1日あたり使える金額」と `isCurrentMonth` が前日の基準のまま（L-538 に当たる既存の問題。今回は直さない）。
- `BudgetExpenseForm` は描画のたびに `new Date()` を取り、0 円の可否の表示に使っている（描画のたびに取り直す流儀の例）。
- ジャーナルの `useJournalPageState` は描画のたびに `getTodayDateString()` を呼ぶ（Issue #201 の設計書で、L-538 への対処として採用した形）。

### 他の機能の見せ方

- 「日付ごとの入力の抜け」を見せている画面はアプリに無い。近いのは達成カレンダーの格子（`features/calendar/components/CalendarGrid.tsx`。日ごとのボタン、未来は `disabled`、記録のある日に点）で、家計簿には月の格子の部品が無い。
- 文言は機能ごとの `locales/ja.json` に置き、差し込みは `{name}` などを `.replace` で埋める（`categoryManagement.deleteConfirm`、`allowanceSettings.transfer.confirmImportTemplate`）。見出しに絵文字を付ける流儀（「📋 支出一覧」）。

### 手動確認表

- 文書: `docs/03-testing/test-matrix.md` の「## 8. 家計簿（Budget）✅」は 8-1〜8-14。
- アプリ内の項目: `src/features/test-matrix/initialData.ts` の `id: "budget"` は 8-1〜8-7 だけ（8-8〜8-14 は文書にだけある）。
- アプリ内の詳細ケース: `src/features/test-matrix/detailed-test-cases/group-05-09.ts` の `"8-1"`〜`"8-7"`（ID は `8-6-1` のように「項目 ID-連番」）。
- 読み込み時の統合（`testMatrixStoredDataMerge.ts` の `mergeStoredTestMatrixCategories`）は初期データの項目を基準に保存値を重ねるため、新しい項目は確認表を保存済みの端末にも出る。
- 新しい項目の ID は、文書の最大値 8-14 の次の **8-15**。既存の ID は変えない。

## 設計

### 純粋な関数（`src/features/budget/utils/missingExpenseDates.ts`、新規）

```ts
/**
 * 表示中の月のうち、今日より前の日で、支出の記録（金額 0 円を含む）が 1 件も無い日を、
 * 日付の昇順の "YYYY-MM-DD" の配列で返す。
 * - 表示中の月が今日の月より後: []
 * - 表示中の月が今日の月: 1 日〜昨日のうち記録の無い日（今日は含めない。今日が 1 日なら []）
 * - 表示中の月が今日の月より前: その月の全日のうち記録の無い日
 * 支出は date が表示中の月の日付と一致する記録だけを入力済みに数える（別の月の日付を持つ記録は無視する）。
 */
export const listMissingExpenseDates = (
  monthKey: string, // "YYYY-MM"（表示中の月）
  expenses: readonly Expense[],
  todayKey: string, // "YYYY-MM-DD"（端末のローカルの今日）
): string[];

/** "YYYY-MM-DD" → "3日(火)"（日付のボタンの表記） */
export const formatMissingDayLabel = (dateKey: string): string;

/** "YYYY-MM-DD" → "11月3日(火)"（読み上げ名の日付の部分） */
export const formatMissingDayFullLabel = (dateKey: string): string;
```

- 計算: `todayMonthKey = getMonthKeyFromDateValue(todayKey)`。`monthKey > todayMonthKey` なら `[]`。最終日 `lastDay` は、`monthKey === todayMonthKey` なら `getDayFromDateValue(todayKey) - 1`、それ以外は `daysInMonthByKey(monthKey)`。入力済みの日の集合は、全支出の `date` の `Set`。`1..lastDay` の `buildDateValue(monthKey, day)`（表示中の月の日付）のうち集合に無いものを返す。表示中の月の日付だけを照合するので、別の月の日付を持つ記録は集合に入っていても結果に影響しない（月での絞り込みを別に書くと、その条件を壊してもテストで落とせない冗長なコードになる）。月キー・日付キーはどちらも固定長なので、大小を文字列比較で決める。
- `Date` の加減算をしない（日を 1..最終日の整数で回す）ので、月末日のオーバーフロー（L-471）が起きない。月の日数は既存の `daysInMonthByKey`（うるう年を扱う）を使う。
- 引数を `Date` ではなく文字列のキーで受ける: 時刻の部分に結果が左右されない。今日の取得は呼び出し側（フック）の責務にし、関数は時計を読まない。
- 整形関数は `new Date(\`${dateKey}T00:00:00\`)`（ローカル時刻として解釈。既存の `formatExpenseDate`と同じ）を`toLocaleDateString("ja-JP", …)` に渡す。`formatMissingDayLabel`は`{ day: "numeric", weekday: "short" }`、`formatMissingDayFullLabel`は`{ month: "long", day: "numeric", weekday: "short" }`。

### フック（`src/features/budget/useBudgetMissingExpenseDates.ts`、新規）

```ts
type UseBudgetMissingExpenseDatesParams = {
  currentDate: Date; // 表示中の月（useBudgetMonthState の currentDate）
  expenses: Expense[]; // 表示中の月の支出（useBudgetMonthState の expenses）
};

/** 表示中の月が今月のときだけ、未入力の日（今月の 1 日〜昨日で支出の記録が無い日）を返す。今月でなければ []。 */
export const useBudgetMissingExpenseDates = ({
  currentDate,
  expenses,
}: UseBudgetMissingExpenseDatesParams): string[];
```

- 描画のたびに `const todayKey = toDateKey(new Date());` を 1 回だけ取る（同じ描画の中で別々に `new Date()` を呼ばない。L-508）。
- **React Compiler の自動メモ化から外す**（関数の本体の先頭に `"use no memo";`）。このリポジトリは `next.config.ts` で `reactCompiler: true`。`babel-plugin-react-compiler` でこのフックをコンパイルして確かめたところ、引数の無い `toDateKey(new Date())` が `if ($[0] === Symbol.for("react.memo_cache_sentinel"))` の中に入り、**初回の描画の値で固定される**（日付をまたいでも古い今日のまま。L-538 の退行がそのまま本番だけで起きる）。`getTodayDateKey()` のような関数呼び出しに包んでも同じく固定された。`"use no memo"` を付けたコンパイル結果ではメモ化のキャッシュ（`_c(`）が無くなることを確かめた。メモ化は `useMemo` で今日を依存に入れて明示する。Jest（ts-jest）は React Compiler を通さないため、この固定はテストでは検出できない。実装プランでは、コンパイル結果に `_c(` が無いことを確かめる手順を置く。
- `monthKey = toMonthKey(currentDate)`。`monthKey !== getMonthKeyFromDateValue(todayKey)` なら `[]`（「表示する月は今月だけ」の条件。ユーザー確認の 1 で変わるのはここだけ）。
- 計算は `useMemo(() => listMissingExpenseDates(monthKey, expenses, todayKey), [monthKey, expenses, todayKey])`。今日の日付キーを依存に入れるので、日をまたいだ後の最初の再描画（金額の入力・フォームの開閉など、どの state の変更でも）で結果が追いつく（L-538）。
- `isCurrentMonth` は既存の `metrics.isCurrentMonth`（メモ化で日またぎに古くなりうる）を使わず、上の `todayKey` から判定する。
- 「今月でなければ `[]`」の判定は `useMemo` の**中**で行う（`useMemo(() => (monthKey === todayMonthKey ? listMissingExpenseDates(monthKey, expenses, todayKey) : []), [monthKey, expenses, todayKey])`）。`useMemo` より前で早期 return して、フックの呼び出しを条件付きにしない（rules-of-hooks）。今月でないときに毎回新しい `[]` を返して再描画のたびに参照が変わることも、`useMemo` の中で判定すれば起きない。

### 日付を入れてフォームを開く操作（`useBudgetPageState.ts`）

```ts
const startAddExpenseOnDate = (date: string) => {
  monthState.setExpenseDate(date);
  startAddExpense(); // 既存: expenseEdit.cancelEditExpense() → openExpenseForm()
  setFormOpenRequest((n) => n + 1); // フォームを見える位置へスクロールする合図
};

// 「➕」（`openExpenseForm` として公開）。直前の日付を引き継がず、既定の日付に戻してから開く
const startAddExpenseOnDefaultDate = () => {
  monthState.setExpenseDate(getDefaultExpenseDate(monthState.currentDate));
  startAddExpense();
  setFormOpenRequest((n) => n + 1);
};
```

- 別々の state（日付・編集・フォームの表示・開く操作の回数）の setter を順に呼ぶだけで、同じ配列を 2 回保存するような処理は無い（L-453 の古いクロージャの上書きは起きない）。
- `useBudgetPageState` で `useBudgetMissingExpenseDates({ currentDate: monthState.currentDate, expenses: monthState.expenses })` を呼び、結果 `missingExpenseDates: string[]` と `startAddExpenseOnDate: (date: string) => void` を `createBudgetPageStateResult` に渡す。あわせて、開く操作の回数 `formOpenRequest: number`（下の「フォームを見える位置へスクロールする」）も渡す。`budgetPageStateResult.ts` の引数の型と返り値に、この 3 つを**省略不可**で足す（L-060）。

### コンポーネント（`src/features/budget/components/BudgetMissingExpenseDays.tsx`、新規）

```ts
type BudgetMissingExpenseDaysProps = {
  dates: string[]; // 昇順の "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
};
```

- `dates.length === 0` なら `null`（欄ごと出さない）。
- 構造: `<section aria-labelledby={見出しの id}>`（`useId`）の中に、見出し `<h3>`（`📝 未入力の日（{count}日）`）、説明の `<p>`、日付のボタンの `<ul>`（各 `<li>` に `<button type="button">`）。
- ボタンの表記は `formatMissingDayLabel(date)`、`aria-label` は `missingDays.selectDateLabel` の `{date}` を `formatMissingDayFullLabel(date)` で埋めた文字列（例: `11月3日(火)の支出を記録`）。押すと `onSelectDate(date)`。
- 見た目（既存のカードの流儀に合わせる）:
  - 欄: `bg-amber-50 dark:bg-amber-100 rounded-xl p-4 mb-6`
  - 見出し: `font-bold text-amber-800 dark:text-amber-900 mb-1`
  - 説明: `text-xs text-gray-600 dark:text-gray-700 mb-3`
  - 並び: `<ul className="flex flex-wrap gap-2">`（折り返す。横スクロールを出さない）
  - ボタン: `min-h-11 px-3 py-2 rounded-full border border-amber-300 dark:border-amber-500 bg-white dark:bg-white text-sm text-amber-800 dark:text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-blue-500`（タッチの的を高さ 44px 以上にする。フォーカスリングは家計簿の他の入力欄と同じ `blue-500`。`amber-500` は白・amber-50 の背景に対して約 2.1:1 で、非テキストの 3:1 に届かない）
- `BudgetPage.tsx` では `BudgetDailySummaryCards` の直後・「➕」ボタン／`BudgetExpenseForm` の直前に置く。押すとフォームはこの欄のすぐ下に開き、見える位置までスクロールする（マウント時と、開く操作のたび。下の「フォームを見える位置へスクロールする」）。

### 文言（`src/features/budget/locales/ja.json` に `missingDays` を足す）

```json
"missingDays": {
  "titleTemplate": "📝 未入力の日（{count}日）",
  "description": "今月の今日より前の日で、支出の記録が無い日です。日付を押すと、その日の支出を記録できます。お金を使わなかった日は 0 円で記録すると、ここに出なくなります。",
  "selectDateLabel": "{date}の支出を記録"
}
```

### アクセシビリティ

- 欄は見出し付きの `section`（ランドマークとして見出しで名前が付く）。日付のボタンは `<ul>`/`<li>` で個数が読み上げられる。
- ボタンの読み上げ名に月・曜日と操作（「の支出を記録」）を含め、見た目の短い表記（`3日(火)`）だけに頼らない。
- 押した後は、フォームが欄のすぐ下に開き、マウント時・開く操作のたびのスクロール（下の節）で画面の中に入る。フォーカスの移動は引き続き行わない。理由: (1) 既存の「➕」も開いたフォームへフォーカスを移さず、開き方で動きを変えない。(2) 金額欄へフォーカスを移すと、Android の Chrome ではソフトウェアキーボードが自動で開き、画面の半分が隠れる。続けて日付を選び直したい・欄を見直したい利用者の邪魔になる。(3) 今回は、画面を目で見て指で押すタッチ操作の報告者向けの最小の実装を優先した。キーボード・スクリーンリーダーの利用者への配慮は、既知の制約として「懸念」の 9 に残す（フォームは欄の後ろにあり、押したボタンの直後にあるわけではない）。

### フォームを見える位置へスクロールする（`BudgetExpenseForm.tsx`）

- 問題: 日付のボタンを押すと、フォームは欄の下（`BudgetPage.tsx` の「➕」の位置）に開く。欄が長い（幅 375px で日付のボタンが 30 個のとき 8〜10 行・約 400〜500px）と、上の段のボタンを押したときにフォームが画面の外に開き、押しても何も起きないように見える（Android の報告者に当たる）。フォームを開いたまま、一覧の上の方へ戻って別の日付のボタンを押したときも、`expenseDate` が差し替わるだけでフォームは画面の外のままになるため、同じく見える位置へ動かす必要がある。同じ日付のボタンを押し直したときも、フォームが画面の外にあれば同様に動かす（日付が変わらないので、日付の変化は合図にできない）。
- 置き場所: フォームの部品 `BudgetExpenseForm` に置く。理由: (1) `BudgetPage.tsx` では `showExpenseForm` が真のときだけフォームを描画するので、部品のマウントがそのまま「フォームを開いた」に当たる。開く側（`useBudgetPageState`）は state のフックで DOM を持たないので、`ref` は通さず、「開く操作が行われた回数」（`formOpenRequest`）だけを `BudgetPage.tsx` 経由でフォームへ渡し、DOM の操作（スクロール）は部品に残す。(2) 部品に置けば「➕」と日付のボタンの両方に 1 か所で効く。
- 合図（なぜ「日付の変化」でなく「開く操作」か）: フォームのスクロールを `expenseDate` の変化で起こすと、(a) 月の移動は毎回 `setExpenseDate(defaultExpenseDate)` を呼ぶので（フォームは閉じない）、フォームを開いたまま「今月に戻る」を押したとき、未入力の日の欄が現れてフォームが下へ押し出され、effect がページを下へスクロールして押したばかりの月のナビが画面の外へ流れる。日付欄（select）を手で変えたときも、フォームが一部しか見えていないとページが動く。(b) 同じ日付のボタンをもう一度押しても `expenseDate` が変わらず、フォームが画面の外のとき何も起きない。そのため、日付のボタン（`startAddExpenseOnDate`）と「➕」（`startAddExpenseOnDefaultDate`）のハンドラ内で `setFormOpenRequest((n) => n + 1)` を呼ぶカウンタ `formOpenRequest`（`useBudgetPageState` の `useState(0)`）を合図にする。`startAddExpense`（編集を閉じてフォームを開く内部関数）には足さない（編集の開始などに影響させない）。`budgetPageStateResult.ts` が `formOpenRequest: number` を素通しで公開し、`BudgetPage.tsx` が省略不可の props `scrollRequestKey={state.formOpenRequest}` で `BudgetExpenseForm` へ渡す（L-060）。月の移動（`goToNextMonth`・`goToCurrentMonth` など）・日付欄の手動変更・編集の開始では増やさない。
- 実装: 外枠の `<div>` に `ref`（`useRef<HTMLDivElement>(null)`）を付け、`useEffect(() => { formRef.current?.scrollIntoView?.({ block: "nearest" }); }, [scrollRequestKey])` で、マウント時と、`scrollRequestKey` が変わったとき（開く操作が行われたとき）に呼ぶ。`block: "nearest"` は、すでに全体が見えているときは動かさず、下にはみ出しているときはフォームの下端が画面の下端に来るだけ動かす。`behavior` は指定しない（既定の即時。動きを減らす設定の利用者にも配慮が要らない）。依存配列は `scrollRequestKey` だけにし（`formRef` は ref なので入れない）、`expenseDate`・金額・カテゴリの変化では呼ばない。同じ日付のボタンをもう一度押すと `formOpenRequest` が増えるので、フォームが画面の外にあれば動く（すでに見えていれば動かない）。月の移動や日付欄の手動変更ではカウンタが増えないので、ページは動かない。
- テスト環境: jsdom は `scrollIntoView` を実装していない。リポジトリには `scrollIntoView` の既存の利用も `jest.setup.ts` の差し替えも無い。`jest.setup.ts` に全体の差し替えを足すと、他のスイート全部に影響し、未実装の環境で落ちることを確かめる手段もなくなるため、呼び出しを `?.` で守る（`scrollIntoView?.(…)`。古いブラウザ・テスト環境で例外にしない）。動きを確かめるテストでは、そのテストの中で `Element.prototype.scrollIntoView` を `jest.fn()` に差し替え、`afterEach` で元（`undefined`）に戻す。既存の `BudgetExpenseForm.test.tsx`・`BudgetPage.test.tsx` の他のテストは差し替え無しで `?.` により落ちない。

### ダークモード

- 上のクラスのとおり、各色に `dark:` を付ける（既存のカードと同じく、ダークモードは背景が明るい灰色 `dark:from-slate-400` の上に載るため、`dark:bg-amber-100` と `dark:text-amber-900` で読める濃さを保つ）。

## テスト

日付を扱うテストは、`TZ=Asia/Tokyo`（`npm test` が `cross-env TZ=Asia/Tokyo` で付ける）を前提にし、時刻の文字列に `+09:00` を書く（L-181）。フックとコンポーネントの結合では `jest.useFakeTimers().setSystemTime(...)` で時刻を固定する（既存の `useBudgetPageMetricsState.test.tsx` の流儀）。

### 単体（`src/features/budget/__tests__/missingExpenseDates.test.ts`）

`listMissingExpenseDates`:

- 今月の途中（今日 `2026-03-07`）・記録 0 件 → `2026-03-01`〜`2026-03-06` の 6 件（今日を含まない）。
- 今日が 1 日（`2026-03-01`）→ `[]`。
- 今日に記録がある・無いで結果が変わらない（今日は常に対象外）。
- 1 日・3 日に記録 → 2・4・5・6 日。同じ日に複数の記録があっても 1 日分として扱う。
- 0 円の記録の日は入力済み（消える）。0 円と金額ありが同じ日でも 1 日分。
- 過ぎた日すべてに記録 → `[]`。
- 今日が月末（`2026-03-31`）・記録 0 件 → 1〜30 日の 30 件。
- うるう年: 今日 `2028-03-01`、表示中の月 `2028-02` → 2 月 1〜29 日（29 日を含む）。平年 `2026-02` → 28 日まで。
- 過去の月（表示中 `2026-02`、今日 `2026-03-07`）→ その月の全日のうち記録の無い日（関数は過去の月にも正しく答える。フックが今月だけに絞る）。
- 未来の月（表示中 `2026-04`、今日 `2026-03-07`）→ `[]`。年をまたぐ未来（表示中 `2027-01`、今日 `2026-12-15`）→ `[]`。年をまたぐ過去（表示中 `2025-12`、今日 `2026-01-05`）→ 12 月の全日。
- 月の範囲外の日付の記録（表示中 `2026-03` に `2026-02-03`・`2026-04-03` の記録が混ざる）→ 3 日を入力済みにしない。
- 結果が昇順。

`formatMissingDayLabel("2026-11-03")` → `"3日(火)"`、`formatMissingDayFullLabel("2026-11-03")` → `"11月3日(火)"`。

### フック（`src/features/budget/__tests__/useBudgetMissingExpenseDates.test.tsx`）

- 今月を表示 → 1 日〜昨日の記録の無い日を返す。
- 前月・次月を表示 → `[]`（前月に記録の無い日があっても）。
- **日をまたぐ**: `2026-03-07T23:59:00+09:00` で描画（6 日まで）→ 時計を `2026-03-08T00:01:00+09:00` に進めて `rerender`（props は同じ）→ 7 日が加わる。描画と確認を同じ時刻で行わない（L-538 の出典のとおり、同じ時刻のテストは退行を通す）。
- **月をまたぐ**: `currentDate` が 3 月のまま、時計を `2026-03-31T23:59:00+09:00` → `2026-04-01T00:01:00+09:00` に進めて `rerender` → `[]`（表示中の 3 月はもう今月ではない）。

### 状態の組み立て（既存のテストを直す）

- `budgetPageStateResult.test.ts`: 返り値の `toEqual` に `missingExpenseDates`・`startAddExpenseOnDate`・`formOpenRequest` を足す。
- `useBudgetPageStateComposition.test.tsx`（子のフックをモックする流儀）: `useBudgetMissingExpenseDates` をモックし、`monthState.currentDate`・`monthState.expenses` が同一の値（`toBe`）で渡ること、返した配列が `createBudgetPageStateResult` の `missingExpenseDates` に同一の値で届くこと、`startAddExpenseOnDate` が関数で渡ることを確かめる（L-060）。
- `useBudgetPageState.test.tsx`（実際のフックを通す流儀。時刻は `2026-03-07T12:00:00+09:00` に固定済み）:
  - `missingExpenseDates` が表示中の月の支出（3 日だけ記録）から求めた値（1・2・4・5・6 日）になる。次月へ移動すると `[]`。
  - `startAddExpenseOnDate("2026-03-02")` で、`showExpenseForm` が `true`・`expenseDate` が `"2026-03-02"` になる。編集中なら編集が閉じる（`editingExpenseId` が `null`）。入力中の金額は残る。
  - 日付ボタンで開いてキャンセルしたあと `openExpenseForm()`（「➕」）で開くと、`expenseDate` が既定の日付（今日。`"2026-03-07"`）に戻る。日付欄を手で変えて閉じたあとも同様。今月以外を表示中は、その月の 1 日に戻る。`startAddExpenseOnDate` は引き続き押した日付で開く。
  - `formOpenRequest` は初期値 0。`startAddExpenseOnDate`・`openExpenseForm`（「➕」）のたびに 1 増える（同じ日付の押し直しでも増える）。月の移動（`goToPreviousMonth`・`goToNextMonth`・`goToCurrentMonth`）・日付欄の手動変更・編集の開始では増えない。
  - `useBudgetPageStateComposition.test.tsx` では、`openExpenseForm` が `setExpenseDate(既定の日付)` の後に子のフックの `openExpenseForm` を呼ぶことを確かめる（時刻は固定）。
- 時刻はすべて固定する。

### フォームのスクロール（`src/features/budget/__tests__/BudgetExpenseForm.test.tsx`）

- `Element.prototype.scrollIntoView` を `jest.fn()` に差し替える（`afterEach` で元に戻す）。
- マウント時に 1 回、引数 `{ block: "nearest" }` で呼ばれる。呼ばれた要素はフォームの外枠（見出し「支出を記録」を含む要素）。
- `scrollRequestKey` が同じ再描画（金額・カテゴリの入力など）では、呼ばれる回数は 1 回のまま。
- 開いたまま `scrollRequestKey` の props が変わる再描画では、もう 1 回 `{ block: "nearest" }` で呼ばれる（合計 2 回）。その後の、`scrollRequestKey` が同じ再描画では増えない。同じ日付のまま `scrollRequestKey` だけが変わっても呼ばれる。
- `expenseDate` だけが変わる再描画（月の移動・日付欄の手動変更）では呼ばれない（1 回のまま）。
- 差し替えをしない（jsdom の素の）状態でも、描画が例外にならない（既存のテストが通ることで確かめる）。

### コンポーネント（`src/features/budget/__tests__/BudgetMissingExpenseDays.test.tsx`）

- `dates` が空 → 何も描画しない（`container` が空）。
- 見出しに日数（`📝 未入力の日（3日）`）・説明が出る。`getByRole("region", { name: … })` で欄が取れる。
- ボタンが `dates` の順に並び、表記が `3日(火)` 形式、`getByRole("button", { name: "11月3日(火)の支出を記録" })` で取れる。
- ボタンを押すと `onSelectDate` がその日付で 1 回呼ばれる。

### 画面（`src/features/budget/__tests__/BudgetPage.test.tsx`）

- モックした state の `missingExpenseDates` が欄に出る。日付のボタンを押すと state の `startAddExpenseOnDate` がその日付で呼ばれる（props の配線漏れを落とす。L-060）。
- `missingExpenseDates: []` のとき欄が出ない。
- 欄は「➕」より前（文書の順）に出る。
- `showExpenseForm: true` で描画すると、`scrollIntoView` が 1 回 `{ block: "nearest" }` で呼ばれ、`rerender` では増えない（画面に組み込んだフォームでもスクロールが効く）。state の `formOpenRequest` が変わる再描画では 1 回増え（フォームへ配線されている）、`expenseDate` だけが変わる再描画では増えない。
- モックの state の型に 3 つ（`missingExpenseDates`・`startAddExpenseOnDate`・`formOpenRequest`）が必須で増えるため、既存の共通のモックの値にも足す。

### Storybook

- `src/features/budget/components/BudgetMissingExpenseDays.stories.tsx`（新規）: 日付は固定の値を使う（相対日付を使わない。L-502）。ストーリーは「数日」（`2026-11-02`・`2026-11-04`・`2026-11-05`）、「月末に多い」（`2026-10-01`〜`2026-10-30` の 30 件。折り返しの確認）、「0 件」（何も出ない）。`onSelectDate` は `meta.args` の `fn()` で毎回新しく束ねる（L-502）。「数日」に play を付け、ボタンを押すと `onSelectDate` が呼ばれることを確かめる。
- `BudgetPage.stories.tsx` は変えない（実行日の今日から求める相対の月のデータなので、欄の内容が実行日で変わる。ここに欄の内容の assertion を足さない）。

## ドキュメントと確認表の更新

- `docs/04-reference/features.md` の「💰 家計簿」の「月次サマリーとリアルタイム集計」の下に、次の項目を足す:
  - **未入力の日の表示**: 今月を表示しているとき、今月の今日より前の日で支出の記録（0 円を含む）が 1 件も無い日を、「1日あたり使える金額」のカードの下に日付のボタンで並べる（見出しに日数）。今日は含めない。「今日」は端末のローカル日付で判定。日付を押すと、その日付を入れた支出の入力フォームが開く。0 円で記録した日は出ない。前月・次月の表示中と、該当する日が無いときは出さない。
- 手動確認表（3 か所。既存の ID は変えない）:
  - `docs/03-testing/test-matrix.md` の 8 節の表の末尾に `| 8-15 | 未入力の日の表示（今月の過ぎた日） | ✅ | ⬜ | ⬜ | 今月の今日より前で支出の記録（0円含む）が無い日を日付ボタンで表示。押すとその日付で支出フォームが開く |` を足す。
  - `src/features/test-matrix/initialData.ts` の `id: "budget"` の `items` の末尾（8-7 の後）に `{ id: "8-15", label: "未入力の日の表示（今月の過ぎた日）", pc: "unchecked", sp: "unchecked", note: "" }` を足す。
  - `src/features/test-matrix/detailed-test-cases/group-05-09.ts` の `"8-7"` の後に `"8-15"` を足す。詳細ケース（手順は退行が出る条件・開始位置・方向を具体的に書く。L-368）:
    - **8-15-1**: 今日が今月の 4 日以降の日に、今月の 1 日と（今日の 2 日前の日）にだけ支出を記録し、ほかの今月の日は記録しない状態で家計簿を開く（今月の記録がすでにある場合は、先に支出一覧からそれらを削除する。残したまま試すときは、記録の無い日を選んで上の 2 日に代え、期待するボタンの日も実在する記録に合わせて読み替える）→ 「1日あたり使える金額」のカードの下に「📝 未入力の日（N日）」が出て、記録した 2 日・今日・明日以降の日のボタンは無く、それ以外の今月の 1 日〜昨日のボタンが古い日から並ぶ（N はボタンの数と一致）。
    - **8-15-2**: 今日が今月の 5 日以降の日で、8-15-1 の状態（未入力の日が 2 日以上。追加すると欄ごと消えるので、1 日だけだと日数の減りを確認できない）で、一番左の日付のボタンを押す → 「➕」の位置に支出の入力フォームが開き、「日付（月）」が今月・「日付（日）」が押した日になっている。金額 500 を入れて「追加」→ その日のボタンが消え、見出しの日数が 1 減る。支出一覧にその日の 500 円が出る。
    - **8-15-3**: 未入力の日のボタンを押してフォームを開き、金額 0 を入れて「追加」→ 0 円で保存でき（エラー文は出ない）、その日のボタンが消える。
    - **8-15-4**: 未入力の日が出ている状態で「← 前月」を押す → 欄が出ない（前月に記録の無い日があっても）。「今月に戻る」を押す → 欄が再び出る。「次月 →」へ移動しても出ない。
    - **8-15-5**: 今月の 1 日〜昨日のすべてに支出（0 円を含む）を記録した状態 → 欄が出ない。
    - **8-15-6**: 支出の編集（✏️）を開いた状態で未入力の日のボタンを押す → 編集が閉じ、追加のフォームがその日付で開く。追加のフォームに金額を入れたまま別の日付のボタンを押す → 日付だけが変わり、金額は残る。
    - **8-15-7**: 前日に支出の記録が無い状態で、家計簿を開いたまま日付が変わる（0 時をまたぐ）まで待ち、またいだ後に「➕」を押す（または「← 前月」で前月へ移動してから「今月に戻る」を押す。金額欄に 1 文字入力してもよい）→ 欄に前日の日付が加わる（またいだ直後で何も操作していないうちは加わっていなくてよい）。
    - **8-15-8**: SP（幅 375px 前後。Android の Chrome）で、今月の 20 日以降に、今月の記録が少ない（未入力の日が 15 日以上ある）状態で開く → ボタンが複数行に折り返し、ページに横スクロールが出ない。ボタンを指で押しやすい（隣のボタンを誤って押さない）。続けて、ページの一番上までスクロールしてから、欄の一番上の段の左端の日付を押す → 支出の入力フォームが画面の中（下端まで見える位置）に来る（画面の外に開いて何も起きないように見えることがない）。フォームを開いたまま、未入力の日の欄（日付のボタンが並ぶ所）の上の方へ戻って別の日付のボタンを押す → フォームが画面内に来て、日付がその日に変わる。さらに、同じ日付のボタンをもう一度押す（フォームが画面の外にある位置から）→ フォームが画面内に来る。最後に、フォームを開いたまま「← 前月」で前月へ移動し、続けて「今月に戻る」を押す → 「今月に戻る」を押した後も、押した月ナビ（「今月に戻る」を含む行）が画面の中に残り、ページが勝手にスクロールしない。
    - **8-15-9**: ダークモードで 8-15-1 の状態を開く → 欄の背景・見出し・ボタンの文字が読める。
    - **8-15-10**: 今日が 2 日以降の日で、未入力の日のボタンを押してフォームを開き、金額を入れずにキャンセルで閉じる。続けて「➕」を押す → 「日付（日）」が今日になっている（直前に押した過去の日付のままではない）。金額 100 を入れて「追加」すると今日の日付で支出一覧に出る。
- `docs/03-testing/README.md` の結合テストの一覧は、新しい結合テストのファイル（`*.integration.test.tsx`）を足さないので変えない。

## タスクの分け方

実装プランは次の 4 つに分ける（順序はこのとおり）。

1. **ロジック**: `utils/missingExpenseDates.ts`（`listMissingExpenseDates`・`formatMissingDayLabel`・`formatMissingDayFullLabel`）と単体テスト。
2. **コンポーネント**: `components/BudgetMissingExpenseDays.tsx`・文言（`locales/ja.json` の `missingDays`）・部品のテスト・`BudgetMissingExpenseDays.stories.tsx`。
3. **画面の配線**: `useBudgetMissingExpenseDates.ts` とそのテスト（日またぎ・月またぎ）、`useBudgetPageState.ts` の `startAddExpenseOnDate`、`budgetPageStateResult.ts`、`BudgetPage.tsx`、`BudgetExpenseForm.tsx` のスクロール（マウント時と、開く操作のたび。`formOpenRequest` → `scrollRequestKey`）、既存のテスト（`budgetPageStateResult.test.ts`・`useBudgetPageState` のテスト 2 本・`BudgetExpenseForm.test.tsx`・`BudgetPage.test.tsx`）の更新。
4. **ドキュメントと確認表と最終検証**: `features.md`、手動確認表 3 か所、`npm test`（`initialData.test.ts`・`detailedTestCases.test.ts` を含む）・型検査・lint・`npm run build`。Storybook は、テストランナーが無く play 関数がどこでも実行されないため、ストーリーの型は型検査で確かめる（ストーリー自体のビルドは行わない）。

## 気をつける知見

dev-flow-kit の `lessons/review-lessons.md`:

- **L-538**（今日を取り込んだ値が日またぎで古くなる）: フックが描画のたびに `toDateKey(new Date())` で今日を取り直し、`useMemo` の依存に今日の日付キーを入れる。今月かどうかも、メモ化された `metrics.isCurrentMonth` ではなく同じ今日から判定する。テストは描画と確認の時刻をずらす（日またぎ・月またぎ）。手動確認 8-15-7。
- **L-508**（1 回の処理で `new Date()` を別々に呼ぶ）: フックの中で今日を 1 回だけ取り、今月の判定と未入力の日の計算の両方に使う。純粋な関数は時計を読まず、今日を引数で受ける。
- **L-181・L-502**（日付のテストは時刻とタイムゾーンを固定。Storybook で相対日付を使わない）: 単体・フックのテストは `+09:00` 付きの固定時刻と `TZ=Asia/Tokyo`。部品のストーリーは固定の日付を props で渡す。`fn()` は `meta.args` で束ねる。`BudgetPage.stories.tsx` に実行日に依存する assertion を足さない。
- **L-471**（月をずらす計算・月末日）: 純粋な関数は `Date` の加減算をせず、日を 1..最終日の整数で回し、月の日数は既存の `daysInMonthByKey` を使う。うるう年・月末日・年またぎのテストを置く。
- **L-060**（省略可能な props の配線漏れ）: `missingExpenseDates`・`startAddExpenseOnDate`・`dates`・`onSelectDate` をすべて省略不可にする。`useBudgetPageState` のテストで値が返り値に届くこと、`BudgetPage.test.tsx` でボタンを押すと state のハンドラがその日付で呼ばれることを確かめる。
- **L-453**（同じハンドラで複数の更新を続けて呼び、古いクロージャで上書き）: `startAddExpenseOnDate` は別々の state の setter（日付・編集・表示）を呼ぶだけで、同じデータを 2 回計算・保存しない。保存（`localStorage`）にも触らない。
- **L-472**（表示順と元の配列の順の乖離）: 未入力の日の並びは純粋な関数が日付から作る昇順で、支出一覧の並び（日付の降順）や保存の配列の順に依存しない。ボタンが渡すのはインデックスではなく日付の文字列。
- **L-540**（順序フィールドの扱い）: 今回は順序を保存するデータを持たないため、当てはまる変更は無い（確認した結果として記す）。
- **L-368**（手動確認の手順で確かめたい状態を作る）: 確認表の手順に、記録する日（1 日と今日の 2 日前）・今日の位置（4 日以降・20 日以降）・押すボタン（一番左）・入れる金額（500・0）・画面幅（375px 前後）・未入力の日の数（15 日以上）を書き、期待結果は画面に出る文言（`📝 未入力の日（N日）`）で書く。
- **L-203**（説明・確認表・コメントを実装に合わせる）: `features.md`・確認表 3 か所・関数の JSDoc（今日を含めない・月の範囲外の記録を無視する）を実装と同じ言葉で書く。既存の「未入力日数」（1日あたり使える金額の分母。今日・未来を含む）と混同しないよう、新しい関数の名前と JSDoc で「支出の記録が無い過ぎた日」と区別する。

## 懸念

1. **開いたまま日をまたいだときの追いつき**: 今日は描画のたびに取り直すため、日をまたいだ後に何も操作しなければ、前日は欄に加わらない（次の再描画で追いつく）。Android の Chrome でタブを開いたまま翌日に戻った場合、操作の前の表示は前日の基準になる。タイマーや `visibilitychange` での再描画は、既存の「1日あたり使える金額」も同じ制約を持つことから今回は足さない。利用者から「翌日に開いたら出ていない」との報告があれば、家計簿のページ全体の「今日」を `visibilitychange` で取り直す変更を別の課題として扱う。月をまたいだときも同じで、開いたまま月をまたぎ、最初の操作として古い欄に残っている前月の日付のボタンを押すと、前月の日付でフォームが開く（その日付の月のバケットへ正しく保存されるので、害は無い。押した操作の再描画で欄は消える）。月末の夜に開いたまま月をまたいだ場合は、表示中の月が読み込んだ月（前月）のままなので、「➕」は「前月を表示しているときの既定」＝その月の 1 日で開く（例: 10/31 の夜に開き 11/1 の朝に「➕」を押すと、日付欄が 10/1 になる）。変更前の「➕」は読み込んだ日（10/31）で開いていた。どちらも古い表示のままの状態に対する挙動で、表示中の月が今月でない以上「その月の 1 日」は一貫している。表示を今月に追従させるのは別の課題とし、既知の制約として受け入れる。確認表 8-15-7 は月末をまたがない日で行う。
2. **既存の `useBudgetPageMetricsState` の L-538**: `calculateBudgetMetrics` の `useMemo` の依存に今日が無く、「1日あたり使える金額」と `isCurrentMonth` が日またぎで古くなりうる（今回の調査で見つけた既存の問題）。今回の欄は `isCurrentMonth` を使わないので影響を受けないが、欄と「1日あたり使える金額」のカードが日またぎ直後に食い違う表示（欄は今日の基準、カードは前日の基準）になりうる。修正は別の課題にする。
3. **「使っていない日」との区別**: アプリは「入力を忘れた日」と「お金を使わなかった日」を、0 円の記録の有無でしか区別できない。0 円の記録を使っていない利用者には、使わなかった日も「未入力」に並ぶ。欄の説明文で 0 円の記録を案内して対処する（「ユーザー確認が必要な事項」の 2）。
4. **手動確認表の食い違い**: アプリ内の `initialData.ts` の家計簿は 8-1〜8-7 だけで、文書の 8-8〜8-14 が無い。今回は 8-15 だけを足すため、アプリ内では 8-7 の次が 8-15 になる（ID を振り直さない規則を優先）。8-8〜8-14 をアプリ内に足すかどうかは別の課題にする。
5. **追加の後の日付欄（「➕」は既定の日付へ戻す）**: 追加・キャンセルの後も日付の state（`monthState.expenseDate`）は直前の日付のまま残る。変更前は日付の state が利用者が日付欄を操作したときだけ変わったため、「➕」は実質いつも今日で開いていた。日付ボタンで開く操作を足すと、そのまま残る過去の日付が次の「➕」に持ち越され、今日の支出が過去の日付で保存される回帰になる。そのため「➕」（`openExpenseForm` として公開する `startAddExpenseOnDefaultDate`）は、開く前に `getDefaultExpenseDate` の値へ日付を戻す。`getDefaultExpenseDate` は内部で `new Date()` を使うが、イベントハンドラ内の呼び出しなので、React Compiler のメモ化で今日が固定される問題は無い（描画時に値を取らない）。続けて過去の日を埋める使い方は、未入力の日のボタンから開けば日付が入るので損なわれない。日付欄を手で変えて閉じたあとの「➕」も既定の日付に戻る点が、変更前の挙動と変わる（変更前は直前の日付が残っていた）。
6. **追加の後のフォーカス**（既存の制約。L-155）: 支出を追加するとフォームが閉じ、押した日付のボタンも欄から消えるため、フォーカスが `body` に落ちる。キーボード・スクリーンリーダーの利用者は、次の操作の前にページの先頭から辿り直すことになる。既存の「➕」から追加したときも同じ動き（フォームが閉じて「追加」ボタンが消える）なので、この変更では直さない。
7. **別の端末からの同期**（既存の制約）: 別の端末で記録した支出が同期されても、この画面の支出の state は月の移動か追加・編集・削除をするまで読み直されない（`useBudgetAllowanceState.ts` の 51〜72 行の購読は収入・支出の項目だけを読み直す）。そのため、欄にも、支出一覧と同じく、読み直すまで反映されない。
8. **React Compiler とテストの差**: Jest は React Compiler を通さないので、`"use no memo"` を消す・別の書き方に変えて今日がメモ化で固定される退行は、単体テストでは落ちない。実装プランの確認手順（コンパイル結果の確認）と、手動確認 8-15-7（開いたまま日をまたぐ）で補う。
9. **キーボード・スクリーンリーダーの利用者がフォームへ届きにくい**（既知の制約。今回は実装しない）: フォームは欄（`section`）の後ろにあり、押した日付のボタンと同じ `ul` に残りの日付のボタンが並ぶため、フォームの直前にフォーカスの起点があるわけではない。キーボード・スクリーンリーダーの利用者は、日付のボタンを押したあと、残りの日付のボタンを辿らないとフォームに届かない（最大で月の日数分のボタン）。フォームが開いたことを伝える通知もない。画面を目で見て指で押すタッチ操作の報告者向けの最小の実装を優先したため、フォーカスの移動や通知は今回は足さない。必要になったときは、押したあとにフォームの見出しへフォーカスを移す（金額欄へは、ソフトウェアキーボードが開くので移さない）か、フォームが開いたことを `role="status"` で伝える変更を別の課題として扱う。
