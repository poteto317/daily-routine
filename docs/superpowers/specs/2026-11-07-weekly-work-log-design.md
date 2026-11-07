# 週ごとの業務日誌を記録できるようにする（Issue #205）

## 目的

1 週間ごとの業務日誌をつけたいという要望（Issue #205）に応える。利用者は毎週金曜日または土日に入力する想定で、各日誌が「何月何日開始の週」のものかが分かる必要がある。

## 決めたこと

利用者の確認済み（2026-11-07）:

| 項目         | 決定                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| 置き場所     | 既存のジャーナル画面の中に「週ごとの業務日誌」の節を足す。メニュー・表示切り替え・メニューの並び順は変えない |
| 週の始まり   | 月曜日。月曜〜日曜を 1 週とする（統計の週次表示と同じ）                                                      |
| 1 週間の件数 | 1 週 1 件。その週の日誌が既にあれば、書くボタンではなく編集になる                                            |
| 入力項目     | 本文のみ（タイトルなし）                                                                                     |

推奨案を採用したもの（利用者の指定が無かった細部）:

| 項目                            | 決定                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 「今日」と「今週」の基準        | JST（`@/lib/storage/core` の `getTodayString`）。統計の週次表示（JST 月曜〜日曜）とそろえる。日次のジャーナル（端末のローカル日付）とは基準が違うが、利用者のタイムゾーンは Asia/Tokyo で、差が出るのは JST 以外の端末だけ |
| 最初に表示する週                | 今週（今日を含む週）。金・土・日に開くと、その週（月曜開始）の日誌を書ける                                                                                                                                                 |
| 週の切り替え                    | 「◀ 前の週」「次の週 ▶」のボタンで 1 週ずつ移る（狭い幅〔sm 未満〕では記号だけを見せ、語は読み上げ用に残す）。今週より先（未来の週）へは進めない（「次の週」は今週を表示中は無効）。前の週には制限を設けない               |
| 週の表示                        | `2026年11月2日（月）開始の週`（見出し）と、その下に期間 `11月2日〜11月8日`                                                                                                                                                 |
| 入力中の週の切り替え            | フォームを開いている間は「前の週」「次の週」と過去の日誌の「開く」を無効にする（未保存の本文を週の切り替えで捨てたり、別の週へ保存したりしない。L-012）                                                                    |
| 本文が空                        | 保存を拒否し `alert` で知らせる（日次のジャーナルの `alertMissingContent` と同じ流儀）。空白だけも空とみなす（`trim()` して判定）。保存する本文は入力のまま（trim しない）                                                 |
| 削除                            | `confirm` で確認してから削除する（日次と同じ）                                                                                                                                                                             |
| 過去の業務日誌の一覧            | 節の下部に、記録のある週を新しい週から順に全件並べる（週 1 件なので年 52 件程度）。各行は週の見出し・本文（3 行で省略）・最終更新・「開く」ボタン。「開く」でその週を上の表示に切り替える。編集・削除は上の表示で行う      |
| 開いたまま日をまたいだとき      | 今週は描画のたびに取り直す（L-538）。編集していない間の選択は今週に追いつく（前後の移動・「開く」で選んだ週は保つ）。書き始めた週は保存まで保つ（金曜の夜に書き始めて月曜になっても、書いていた週のまま保存される）        |
| `createdAt` / `updatedAt`       | 新規は両方を保存時刻。更新は `updatedAt` だけ更新し、`createdAt` と `id` は据え置く（L-456）                                                                                                                               |
| 同期                            | Firestore の同期データに `weeklyLogHistory` を足す。リモートに無いとき（古い端末のアップロード）はローカルの値を保つ（既存の `?? get...()` の保護。L-002 / L-459）                                                         |
| JSON のエクスポート・インポート | 「記録」グループ（`recordGroup.ts`）に `weeklyLogHistory` を足す                                                                                                                                                           |
| AI エージェント API             | 対象外（今回は足さない）                                                                                                                                                                                                   |

## 範囲

含めるもの:

- 型 `WeeklyLogEntry` / `WeeklyLogHistory`（`src/types/routine/weeklyLog.ts`。`src/types/routine/index.ts` から export）。
- 保存層（`src/features/journal/weekly/` 配下）。
- 週の計算と表示の純粋な関数。
- 画面: ジャーナル画面に「週ごとの業務日誌」のカード（`WeeklyLogCard`）を足す。置き場所は今日の記録のカード（と過去用の編集カード）の後、過去の記録（日次）の前。
- 同期（`SyncPayload`・正規化・ローカルの収集と保存・ローカルにデータがあるかの判定）。
- JSON のエクスポート・インポート（記録グループ）。
- 文言（`src/features/journal/locales/ja.json` に `weeklyLog` 節を足す）。
- Storybook（新しいカード）、テスト。
- 説明と確認項目: `docs/04-reference/features.md` の「ジャーナル」節と同期対象の列挙、`docs/03-testing/test-matrix.md` の 3 節に 3-7〜3-9 を足す（3-7: 業務日誌を書く・編集する〔1 週 1 件・空の本文の拒否〕、3-8: 週の切り替え〔前後の移動・未来の週へ進めない・入力中は切り替え不可・「何月何日開始の週」の表示〕、3-9: これまでの業務日誌の一覧と削除〔新しい週から順・「開く」・確認ダイアログ〕）。アプリ内の実体 `src/features/test-matrix/initialData.ts` と `src/features/test-matrix/detailed-test-cases/group-01-04.ts` にも同じ項目を足す。

含めないもの:

- AI エージェント API（`firebase-functions`）・OpenAPI。
- 日次のジャーナルの「今日」を JST に統一すること。
- `userScope.ts` の `USER_DATA_KEYS`（ログイン前のデータを移す一覧）には入れない。既存のほかの新しいキー（workout-records・Todo など）と同じ扱いで、未ログインで書いた業務日誌は、初めてのログインの後には移されない（既存の記録と同じ制約）。
- `firestore.rules`（`users/{userId}` の文書を丸ごと読み書きする規則で、フィールドごとの検査が無いため変更不要）。

## データ

```ts
// src/types/routine/weeklyLog.ts
export interface WeeklyLogEntry {
  id: string;
  /** 週の開始日（月曜。JST の YYYY-MM-DD） */
  weekStart: string;
  content: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** 週の開始日（月曜。YYYY-MM-DD）をキーにした、1 週 1 件の業務日誌 */
export interface WeeklyLogHistory {
  [weekStart: string]: WeeklyLogEntry;
}
```

- LocalStorage のキーは `weekly-log-history`。`getStorageItem` / `setStorageItem`（`@/lib/storage/core`）で読み書きする（ユーザーごとのキーの切り替えと同期のための更新時刻の記録は既存の仕組みに任せる）。
- キーと `entry.weekStart` が二重に週を持つ。置き場所（キー）を正とする。
- 検査に通ったエントリは、知らないフィールドも残す（新しい版で足したフィールドを、古い版の保存・同期で消さない）。

## 保存層（`src/features/journal/weekly/weeklyLogStorage.ts` ほか）

構成: ストレージの読み書きは `weeklyLogStorage.ts`、読み込みの正規化と `listWeeklyLogsByLatest` は `weeklyLogHistoryData.ts`、保存・削除の操作（確認・読み直し・フォームを閉じる）は `weeklyLogActions.ts`、文言の組み立ては `weeklyLogTexts.ts` に置く。

- `getWeeklyLogHistory(): WeeklyLogHistory`
  - 読んだ値がオブジェクトでない（`null`・配列・文字列など）ときは `{}` を返す（L-470）。
  - 読み直した結果を保存するので、保存・削除のときに壊れた値は書き込みで取り除かれる（日次のジャーナルの読み込みの正規化と同じ扱い）。
  - 正規化（`weeklyLogHistoryData.ts`）は、各値のうち `id`・`content`・`createdAt`・`updatedAt` が文字列でないもの、キーが実在する暦の日付かつ月曜でないものを捨てる（月曜だけを残す）。`weekStart` はキーで上書きした新しいオブジェクトにして返す（キーを正とする）。
  - 毎回新しいオブジェクトを返す（既定値の定数をそのまま返さない。L-461）。
- `saveWeeklyLogHistory(history): boolean` — `setStorageItem` の戻り値をそのまま返す。
- `saveWeeklyLog(weekStart, content, now = new Date()): boolean`
  - その週の日誌が無ければ、`id`（`generateId("weekly-log")`）・`createdAt`・`updatedAt` を `now.toISOString()` で作って足す。
  - 有れば、`content` と `updatedAt` だけを変える（`id`・`createdAt` は据え置く）。
  - 1 回の書き込みで保存し、その成否（`boolean`）を返す（L-001）。
- `deleteWeeklyLog(weekStart): boolean` — その週のキーを除いて保存し、成否を返す。キーが無ければ書き込まずに `true` を返す。
- `listWeeklyLogsByLatest(history: WeeklyLogHistory): WeeklyLogEntry[]`（`weeklyLogHistoryData.ts`） — 渡した履歴を週の開始日の降順の配列にする純粋な関数（ストレージを読み直さない。画面の state から一覧を作るのに使う）。

保存（`saveWeeklyLog`）は週の開始日が未来でないかを検査しない。画面が選べる週は今週以前に限られるため。読み込み時に月曜でないキーは捨てる。

## 週の計算と表示（純粋な関数）

日付の計算は `src/features/journal/weekly/weeklyLogWeek.ts`、表示の整形は `src/features/journal/weekly/weeklyLogTexts.ts` に置く。整形に使う文字（曜日・年月日・期間の区切り）は `ja.json` の `weeklyLog` 節のテンプレートに置き、コードに直接書かない。

- `getWeeklyLogWeekStart(dateKey: string): string` — `YYYY-MM-DD` を含む週の月曜。統計の `getWeekStartKeyFromDateKey`（`src/features/statistics/statistics/weeklyGoalDateKeys.ts`）と同じ計算。機能をまたいだ依存を作らないため、`addDaysToDateKey` と同じ UTC の日付演算で journal 側に書く（日付の文字列だけで計算し、端末のタイムゾーンに左右されない）。
- `shiftWeeklyLogWeek(weekStart: string, weeks: number): string` — 7 日単位でずらす。
- `formatWeeklyLogWeekDate(weekStart)` → `2026年11月2日（月）`。見出し `2026年11月2日（月）開始の週` は文言 `weeklyLog.weekTitleTemplate`（`{date}{suffix}`）に日付と `weekTitleSuffix`（`開始の週`。週の切り替えの見出しと共用）を埋めて作る。
- `formatWeeklyLogWeekRange(weekStart)` → `11月2日〜11月8日`（年をまたぐ週は `12月28日〜1月3日`。年は見出しにあるので期間には出さない）。
- 整形は `Date.UTC` ベースで行い、端末のタイムゾーンで日付がずれないようにする。

## 画面

### 状態（`src/features/journal/weekly/useWeeklyLogState.ts`）

- `today = useJstTodayKey()`（`@/hooks/useToday`。React Compiler で最初の描画の値に固定されないよう、本体で `getTodayString()` を直接呼ばない）で描画のたびに取り直し、`currentWeekStart = getWeeklyLogWeekStart(today)`。
- 書いている週はフォームの state（`useWeeklyLogForm` の `editingWeekStart`、`open(weekStart, initialContent)` で入り、`close()` で null に戻る）が持つ。
- 週の選択（`useWeeklyLogWeekNavigation`）は `explicitWeekStart`（`useState<string | null>`、null なら今週に追従）を持ち、前後の移動・`openWeek`・保存後の `selectWeek` で明示的な選択になる（前後の移動と `openWeek` はフォームを開いている間は動かさないが、`selectWeek` だけはロックを無視する。今週を選んだときは追従に戻る。今週かどうかは描画時ではなく、呼ばれた時点の今日で判定する）。選んだ週が今週なら `null` に戻して追従に戻る（今週へ戻って開いたまま日をまたいでも、新しい今週を表示する）。
- 表示する週は `selectedWeekStart = form.editingWeekStart ?? navigation.selectedWeekStart`。書いている間だけ書き始めた週を保ち、保存・キャンセルでフォームが閉じたら、前後の移動などで選んでいなければ今週に追従する。保存は書いていた週へ行う。日をまたいだ後に前の週の分を保存したときは、保存した週を表示したままにする（保存の成功後、ロックを無視する `selectWeek` でその週を選ぶ。保存した週が今週なら追従のまま）。キャンセルでは新しい今週に追従する。
- `history`（`useState`。初期値は `getWeeklyLogHistory()` の関数初期化）。
- 日をまたいだ後の今週・`今週` の印・`canGoNext` は、次の再描画（入力・ボタン操作など）で追いつく。日次のジャーナルと同じ水準とし、時刻や `visibilitychange` での再描画は足さない。再描画の無いまま週をまたいでから「書く」を押したときは、画面に見えていた週（前の週）で書き始める。金〜日に開いた週の分を書く用途に合わせ、見えている週に書くことを優先する（「今週」の印は次の描画で外れる）。
- `isEditing`（フォームを開いているか）と `contentInput`。
- 操作:
  - `goToPreviousWeek` / `goToNextWeek` — フォームを開いている間は何もしない。`goToNextWeek` は `selectedWeekStart` が呼ばれた時点の今週以降なら何もしない。
  - `openWeek(weekStart)` — 一覧の「開く」。フォームを開いている間は何もしない。
  - `startEditing` — 選んだ週の日誌があればその本文、無ければ空で、フォームを開く。
  - `cancelEditing` — フォームを閉じ、入力を捨てる。
  - `save` — 本文が `trim()` で空なら `alert(weeklyLog.alertMissingContent)`（`本文を入力してください`。日次の「タイトルまたは本文を…」は使い回さない）で止める。`saveWeeklyLog(selectedWeekStart, contentInput)` が `false` ならフォームを開いたまま入力を残す（書き込みの失敗は既存のストレージの失敗通知に任せ、ここでは閉じない）。`true` ならフォームを閉じる。
  - `remove` — `confirm` で確認し、OK なら `deleteWeeklyLog(selectedWeekStart)`。
  - 保存・削除を実行した後は、成否にかかわらず `getWeeklyLogHistory()` で読み直す（L-039。失敗しても画面とストレージの食い違いを残さない）。確認でキャンセルしたときと、空の本文で止めたときは読み直さない。
- 返す値: `selectedWeekStart`・`currentWeekStart`・選んだ週の日誌（`history[selectedWeekStart] ?? null`）・`entries`（`listWeeklyLogsByLatest(history)`）・`isEditing`・`contentInput`・`canGoNext`（`!isEditing && selectedWeekStart < currentWeekStart`）・`canNavigate`（`!isEditing`）・各操作。

### 表示（`src/features/journal/weekly/components/WeeklyLogCard.tsx` ほか）

`CardPanel` の中に:

1. 見出し `🗓️ 週ごとの業務日誌`。
2. 週の切り替え: 「◀ 前の週」・週の見出しと期間・「次の週 ▶」。今週を表示中は期間の横に `今週` の印を出す。狭い幅（sm 未満）ではボタンを記号だけにし（語は読み上げ用に残す）、見出しを日付と「開始の週」の 2 行に分ける。無効なボタンは `disabled`。
3. 選んだ週の日誌:
   - フォームを閉じているとき: 日誌があれば本文（改行を保つ `whitespace-pre-wrap`）・最終更新・「✏️ 編集」「🗑️ 削除」。無ければ `この週の業務日誌はまだありません` と「➕ 書く」。
   - フォームを開いているとき: 本文の `textarea`（ラベル `本文`、プレースホルダー `今週の業務内容・成果・課題・来週の予定などを書いてください...`）・「保存」・「キャンセル」。キーボードの Enter で送信しない（`textarea` のみで `form` の submit を使わない。L-474）。
4. 過去の業務日誌の一覧（`📚 これまでの業務日誌`）: 各行に週の見出し・本文（`line-clamp-3`）・最終更新・「開く」。表示中の週の行は「開く」を出さない（`表示中` と出す）。記録が無ければ `記録がありません`。

部品は表示だけを受け持つ `WeeklyLogCard`（全体の組み立て）・`WeeklyLogWeekNavigator`（週の切り替え）・`WeeklyLogEditor`（選んだ週の表示。下に `WeeklyLogForm`〔入力〕・`WeeklyLogEmpty`〔日誌が無いとき〕・`WeeklyLogView`〔日誌があるとき〕を持つ）・`WeeklyLogList`（一覧）に分ける。部品はすべて `weekly/components/` に置く。状態は `JournalPage` で `useWeeklyLogState()` を呼んで `WeeklyLogCard` に渡す。props は必須にし、省略可能な props で配線漏れを隠さない（L-060）。

## 同期

- `SyncPayload` に `weeklyLogHistory: WeeklyLogHistory` を足す。
- `CoreSyncData` と `normalizeCoreSyncData` に `weeklyLogHistory: data.weeklyLogHistory ?? getWeeklyLogHistory()` を足す（欠損ならローカルを保つ。明示的な `{}` は全削除の結果として尊重する）。
- `localData.ts` の収集に `weeklyLogHistory: getWeeklyLogHistory()`、保存に `saveWeeklyLogHistory(normalized.weeklyLogHistory)` を足す。
- `localDataHelpers.ts` のローカルにデータがあるかの判定に `Object.keys(data.weeklyLogHistory).length > 0` を足す。
- 同期のテストの固定データ（`SyncPayload` を組み立てているもの）は型エラーに従って足す。

## エクスポート・インポート

- `recordGroup.ts` の収集に `weeklyLogHistory: getWeeklyLogHistory()`、取り込みに `objectField("weeklyLogHistory", saveWeeklyLogHistory, invalid("weeklyLogHistory"))` を足す。取り込んだ値は次に読むときに `getWeeklyLogHistory` の検査を通る。
- 記録グループのラベル（`src/features/settings/state/dataTransferGroups.ts` の「記録（ジャーナル・体重・運動・食事・ポモドーロ・作業）」）を「記録（ジャーナル・業務日誌・体重・運動・食事・ポモドーロ・作業）」にする。`recordGroup.ts` の JSDoc の列挙にも業務日誌を足す。

## テスト

- `weeklyLogWeek`: 月〜日の各曜日から同じ月曜になる、日曜は前の月曜、月・年をまたぐ週、`shiftWeeklyLogWeek` の前後、端末のローカル時刻に左右されないこと。
- `weeklyLogTexts`: 見出しと期間の整形（年またぎを含む）、削除の確認と「開く」の読み上げ名の文言、端末のローカル時刻に左右されないこと。
- `weeklyLogHistoryData`: 壊れたデータ（`null`・配列・欠けたフィールド・実在しない日付や月曜でないキー）を捨てる、キーを正とする、知らないフィールドを残す、毎回新しいオブジェクトを返す、降順の一覧。
- `weeklyLogStorage`: 新規・更新（`id`・`createdAt` 据え置き、`updatedAt` 更新）・削除・書き込みの失敗で `false` を返すこと。
- `weeklyLogActions`: 空の本文で保存しない、保存・削除の後に成否にかかわらず読み直す、保存の失敗でフォームを閉じない、削除の確認でキャンセルすると消えない。
- `useWeeklyLogForm` / `useWeeklyLogWeekNavigation`: 書いている週の保持、前後の移動と未来への制限、入力中は移動しない、今週への追従と選んだ週の保持、呼ばれた時点の今週での判定。
- `useWeeklyLogState`（合成の配線）: 初期が今週、選んだ週への保存、日をまたいだ後の保存・キャンセル・保存の失敗での選択の扱い。
- 部品: 週の見出し・今週の印・ボタンの無効化・日誌の有無での表示の切り替え・一覧の「開く」。
- `JournalPage`: 業務日誌のカードが出て、日次のジャーナルの操作に影響しないこと。
- 同期とエクスポート: `weeklyLogHistory` の欠損でローカルを保つ、`{}` は尊重する、収集と保存に含まれる。
