# ジャーナルの日付を編集・新規追加で選べるようにする（Issue #201）

## 目的

ジャーナルの編集では日付を変えられない。さらに、新規追加の日付は「保存ボタンを押した時点の今日」で決まる（`useJournalSaveEntryAction.ts` の `getToday: getTodayDateString`）ため、深夜をまたいで書くと翌日の日付で保存され、直す手段がない。

編集と新規追加の両方で日付を選べるようにし、あわせて AI エージェント API でも日付を変えられるようにする。

## 決めたこと

利用者の確認済み（2026-11-03）:

| 項目                   | 決定                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| 日付を変えられる範囲   | 今日のエントリの編集でも、過去のエントリの編集でも変えられる                                                |
| 入力方式               | ネイティブの日付入力（`<input type="date">`。運動記録 `WorkoutRecordForm` と同じ方式）                      |
| 日付の範囲             | 1900-01-01 から今日まで。未来の日付は選べない・保存できない（下限は下の「日付の検証」）                     |
| 変更先に既存のエントリ | 同じ日付に共存する（確認は出さない）。現状の保存が同じ日付に複数のエントリを許すため、仕組みを変えない      |
| 新規追加フォーム       | 日付欄を足す                                                                                                |
| AI エージェント API    | 日付も変えられるようにする（`PATCH` の `date`、OpenAPI、`agent-api.md`、`firebase-functions` とそのテスト） |

推奨案を採用したもの（利用者の指定が無かった細部）:

| 項目                           | 決定                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 編集で使うフォーム             | 今日のカードを使うか、過去用の編集カードを使うかは、**編集を始めたときのエントリの日付**で決める（`isPastEditing` の今の判定 `editingEntry.date !== today`。`editingEntry` は編集中は変わらない）。下書きの日付では決めない。編集の途中で日付を変えても、フォームは切り替わらない。保存するとフォームは閉じる                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 新規追加の日付の初期値と固定   | 日付の入力 state は `string \| null`。`null` は「利用者が日付を触っていない」で、日付は今日に従う。**タイトル・本文・日付のどれかを最初に変更した時点で、その時点の今日（日付欄の変更なら選んだ値）を入れて固定する**。日をまたぐ前に書き始めた記録は、またいだ後に保存しても書き始めた日の日付になる                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 日付欄を空にしたとき           | 利用者が日付欄を空にした（OS の「消去」・手入力の途中）は `""` で、`null` とは別。保存は拒否する。「空なら保存の時点の今日」にはしない                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `updatedAt` / `createdAt`      | 日付を変えると `updatedAt` を更新時刻にする。`createdAt` は据え置く。一覧の並びは今の規則（日付の降順 → `updatedAt` の降順）のまま                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 変更先のバケットでの位置       | 新規保存と同じく、変更先の日付の配列の末尾に入れる。日付を変えないときは、今の配列の中の位置のまま更新する                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 日付の検証をする場面           | 新規追加は常に検証する。編集は**日付を変えたとき（日付の入力 state が編集前のエントリの日付と違うとき）だけ**検証する。日付を変えずにタイトルや本文だけ直す保存は、検証しない（API で作った未来日や壊れた日付のエントリを、タイトルを直すだけで保存できなくしない）                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 空の日付・不正な日付の知らせ方 | 保存を拒否し、理由を `alert` で示す（既存の `alertMissingContent` と同じ流儀）。日付欄は `max` に今日を設定し、OS の選択でも未来を選べないようにする                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 見出し                         | 新規追加のフォーム（今日のカードで新規に書くとき）の見出しは、選んだ日付が今日なら `今日の記録 (日付)`、今日以外なら `<日付> の記録`。日付欄の値が空・不正な文字列（年が 6 桁など）のときは、見出しは日付を出さず `今日の記録` だけにする（`Invalid Date` を出さない）。見出しの整形関数 `formatJournalDate` は、不正な入力に対して例外を投げず、入力の文字列をそのまま返す。**編集の見出し（今日のカードを編集で開いたときも、過去用の編集カードも）は今のまま、編集前のエントリの日付が基準で、編集中に日付欄を変えても変わらない**（今日のカードの編集時は今の `formatJournalDate(today)`。編集前の日付が今日なので `editingEntry.date` と同じ結果。過去用の編集カードは `editingEntry.date`）。見出しが日付欄に従うのは新規追加のフォームだけ |
| 「今日」の判定                 | 既存の `getTodayDateString`（端末のローカル）のまま。JST 固定の `getTodayString` への統一は別の課題として扱い、今回は変えない。ページを開いたまま日をまたぐと `max` と見出しの今日が古いままだが、`useJournalPageState` が描画のたびに今日を取り直すので、入力のたびに追いつく（L-538）                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| API の日付の検証               | `PATCH` の `date` は、既存の作成（`POST`）と同じ検証（形式と実在する日付。未来は拒否しない）にそろえる。アプリは未来を拒否し、API は未来を許す、という非対称は意図したもの                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

## 範囲

含めるもの:

- 保存層: `updateJournalEntry` に日付を足し、旧バケットから除いて新バケットへ入れ、`entry.date` も更新する。
- アプリ: 編集フォーム（今日のカードと過去用の編集カード）と新規追加フォームの日付欄、日付の入力 state、更新・保存の処理への日付の受け渡し（下の「配線」の全部の層）、日付の検証と拒否の文言、見出し。
- 文言（`src/features/journal/locales/ja.json`）。
- AI エージェント API: `PATCH` で `date` を受け付ける（`journalInput.ts`・`journalEntity.ts`・`journalStore.ts`・`journalOperations.ts`）。`docs/04-reference/openapi.yaml`・`docs/04-reference/agent-api.md` の更新。
- Storybook（props を足したストーリー）、テスト。
- 説明と確認項目の更新: `docs/03-testing/test-matrix.md` の 3-1・3-6、アプリ内の実体 `src/features/test-matrix/initialData.ts` の 3-1・3-6 と `src/features/test-matrix/detailed-test-cases/group-01-04.ts` の 3-1・3-6、`docs/04-reference/features.md` の「ジャーナル」節、`journalEntity.ts` の `applyJournalPatch` の JSDoc。

含めないもの:

- 「今日」の判定を JST に統一すること。
- 同じ日付にエントリが複数あるときの今日の欄の表示の規則（今日の欄は更新が新しい 1 件。今のまま）。
- 同期（`journalHistory` の丸ごとの同期）・エクスポート・`firestore.rules`（日付の変更でスキーマは変わらず、キーが日付かどうかに依存していないため変更しない）。

## 保存

データは LocalStorage の `journal-history`（`JournalHistory = { [date]: JournalEntry[] }`）で、Firestore へは `journalHistory` として丸ごと同期される。バケットのキーと `entry.date` が二重に日付を持つので、日付を変えるときは両方を更新する。

- `updateJournalEntry(entryId, title, content, date?)`（`storageEntries.ts`）:
  - 全バケットを走査して ID が一致するエントリを見つける（今の動き）。実際の置き場所（バケットのキー）を正とする（`docs/02-development/review-lessons.md` の 2-3 節）。
  - `date` が省略されたとき: `title`・`content`・`updatedAt` だけを更新し、`entry.date` も位置も触らない（今の動き。引数を省略したときに `date` を `undefined` で上書きしない。L-454）。
  - `date` が明示的に渡され、見つけたバケットのキーと同じとき: 位置は変えず、`entry.date = date` に更新する（キーと `entry.date` が食い違う古いデータでも、API の同じ入力の結果と一致する）。
  - `date` が違う日付のとき: 旧バケットから除き（空になったら旧バケットのキーを消す。`deleteJournalEntry` と同じ）、`entry.date` を新しい日付にして、変更先のバケットの末尾に入れる。`updatedAt` は更新時刻、`createdAt` は据え置く。
  - 除去と追加を同じ `history` に対して行い、1 回の書き込みで保存する（途中状態を保存しない。ストレージのキーは 1 つ）。
  - ID が見つからなければ、履歴の内容は変えない（書き込みの有無は今のまま）。
- 家計簿の `updateExpense`（`budget/storageExpenses.ts:39`）が手本。
- 保存層は日付の形式を検査しない（呼び出し側の処理で検査する。`saveJournalEntry` と同じ）。

## 日付の検証（純粋な関数）

`utils/journalDate.ts` に、画面から独立した純粋な関数を足す。保存と更新の両方がこれを使う。

- 関数は 2 つ置く。(1) `getJournalDateError(date, today)`: 理由を返す（`"invalid-format"`〔空を含む〕・`"not-real"`・`"too-old"`・`"future"`・問題なしは `null`。判定の順序はこの並び）。保存・更新の拒否の理由の文言を出し分けるのに使う。(2) `isValidJournalDate(date)`: 形式と実在だけを見る真偽値。見出しの「空・不正なら `今日の記録` だけ」の判定に使う（未来の日付は見出しに出してよい）。
- 実在の判定は、`Date.UTC` の 0〜99 年の補正（1900 年代への化け）を避け、`setUTCFullYear` で年を直接設定する形にする（`firebase-functions/src/agentApi/validation/dateFormats.ts` の `isRealDate` と同じ。`docs/02-development/review-lessons.md` の 1-3 節）。閏日（2/29）・4/31・年 0050 のテストを足す。
- 日付の下限: `JOURNAL_MIN_DATE`（`"1900-01-01"`。`utils/journalDate.ts` から export）より前の日付は、形式と実在が正しくても理由 `"too-old"` で拒否する（どちらも `YYYY-MM-DD` なので文字列の比較で判定する）。デスクトップの Chrome の日付欄は年の欄に 1 文字打つごとに `onChange` を送る（`"202"` まで打つと `0202-11-03`）ため、年を打ちかけたまま保存・更新すると、日付の降順 30 件の一覧から消えて画面から編集・削除できなくなるのを防ぐ。`too-old` は空・形式違い・実在しない日付と同じ `page.alertInvalidDate`（1900 年 1 月 1 日以降を選べる旨を含む）で知らせる。新規追加は常に、編集は日付を変えたときだけ検証する（上の「日付の検証をする場面」のまま）。両方の日付欄に `min={JOURNAL_MIN_DATE}` も付ける。`isValidJournalDate` は形式と実在だけを見るまま（見出しの判定に使うため、下限は見ない）。API（`firebase-functions`）は対象外（作成と更新で同じ `readDate` を使う設計のまま。アプリだけの入力ガード）。
- 見出しの日付の整形（`formatJournalDate`）は、不正な文字列でも例外や `Invalid Date` にならず、入力をそのまま返す。見出しは、日付欄の値が空・不正なら `今日の記録` だけを出す。

## 画面

### 日付の入力 state と「最初の変更で固定する」

- 日付の入力 state（`dateInput: string | null`）を、タイトル・本文の入力 state（`useJournalPageInputState`）と並べて持つ。`null` は未操作（今日に従う）、`""` は利用者が空にした、`YYYY-MM-DD` は選んだ値。
- 固定の置き場所: UI からの変更を受けるハンドラ（`onTitleChange`・`onContentChange`・`onDateChange`）と、フォームを開く・閉じる・保存・再読み込みでのリセットに使う素のセッターを**分ける**。固定は UI 用のハンドラだけが行う（`setDateInput((prev) => prev ?? 固定する日付)` の形の関数更新。固定する日付は、関数更新の外で 1 回だけ取る。StrictMode の二重実行でも値が揺れない）。リセット（`setTitleInput("")` など）は固定を起こさない。素のセッターを包むと、リセットまで「最初の入力」と見なされて日付が固定されるため。
  - **固定する日付**: 新規追加は、固定する時点で `getTodayDateString()` をその場で 1 回呼んだ今日（描画時の `today` をクロージャで使わない。ページを開いたまま日をまたぎ、再描画なしで最初の 1 文字を打っても、その時点の今日になる。固定時の 1 回だけなので L-508 に反しない）。編集は編集対象のエントリの日付（`editingEntry.date`）。
  - **置き場所**: 入力 state と `editingEntry` の両方を知る層（`useJournalPageFormState`）に UI 用ハンドラを置く（入力 state だけの `useJournalPageInputState` は `editingEntry` を知らないため）。素のセッターと UI 用ハンドラは別名にする。UI 用ハンドラ（と `dateInput` の値）は `useJournalPageFormState` の返り値 → `journalPageFormStateResult` → `useJournalPageState` → `journalPageStateResult` → `JournalPage.tsx`（カードの props）へ通し、`journalPageStateResult` からは素のセッター（`setTitleInput` など）を外す（UI が固定しない素のセッターを使い続ける事故を防ぐ。`journalPageStateResult.test` の期待値も変わる）。素のセッターは再読み込み・リセット（`journalPageActionBindings` → `useJournalPageActions`）にだけ渡す。
- 編集では、フォームを開くとき（`createEditingJournalFormState`）に `dateInput` へ編集対象の日付を入れる。キャンセル・保存・削除・再読み込みで `null` に戻す。
- **編集中でも `dateInput` が `null` になりうる**: 編集中に履歴の別のエントリの「削除」を押すと、`deleteJournalEntryAndReload` が再読み込み（`createLoadJournalDataAction`）で `titleInput`・`contentInput` を `""` に戻し、`editingEntry` と `showForm` は残る（今も起きている挙動）。`dateInput` も `null` に戻るが、編集中の日付欄の値・保存・検証は `dateInput ?? editingEntry.date` を使い、`null` でも編集前の日付として扱う（過去のエントリの日付が、利用者の意図なく今日に書き換わらない）。この経路のテストを足す。
- 新規追加の保存は、`dateInput ?? today`（`today` は下の「保存の処理」の 1 回だけ取った今日）を日付として渡す。編集の保存は、日付を**変えたときだけ**日付を渡し（`dateInput` が `null` でも `editingEntry.date` と等しければ変えていない）、変えないときは日付を渡さない（`undefined`。省略）。キーと `entry.date` が食い違う古いデータで、タイトルだけ直した保存がバケットを黙って移さないため（L-454・2-3 節）。

### 日付欄

- 部品: `<input type="date">`。`max` に今日、`value` は、新規追加は `dateInput ?? today`、編集は `dateInput ?? editingEntry.date`。ラベルは新しい文言（`locales/ja.json`）の「日付」。
- 今日のカード（`JournalTodayCard`）と過去用の編集カード（`JournalEditCard`）の両方に置く。props は `dateInput: string | null`・変更のコールバック（`onDateChange`）・`today`（`max` と既定値）を足し、`JournalTodayCard` が `value` と見出しを解決する（フォームを閉じているとき: 見出しは今のとおり `today`・新規: `dateInput ?? today`・編集: `value` は `dateInput ?? editingEntry.date`。見出しは編集前の日付のまま）。Storybook も直す。
- `onDateChange` は固定せず、選んだ値（`""` を含む）をそのまま `dateInput` に入れる。`prev ?? 固定する日付` の関数更新を使うのは `onTitleChange`・`onContentChange` だけ（日付欄の変更は、それ自体が最初の変更で、選んだ値で固定するため）。

### 保存の処理

- 保存・更新のハンドラ（`journalPageMutationHandlers.ts`）の入口で、今日を **1 回だけ**取る（`getToday()`。L-508）。保存は、その `today` を、未操作時の既定値（`date = dateInput ?? today`）と未来の判定の両方に使い、`journalMutationActions` へ `today` と `date` を渡す。更新は、同じ `today` を `journalMutationActions` へ渡す（下の更新の項目）。
- `saveJournalEntryAndReload` は、`date` と `today` を引数に受ける（今の「今日」の関数の代わり）。日付が空・形式が `YYYY-MM-DD` でない・実在しない・今日より後のとき、保存せず、理由を `alert` で示して `false` を返す（文言は `page.alertInvalidDate`・`page.alertFutureDate` のように足す）。
- `useJournalPageMutationActions` が `dateInput` を受け、`useJournalUpdateEntryAction`・`createUpdateJournalEntryHandler` へ `originalDate`（`editingEntry.date`）・`dateInput`・`getToday` を渡す。`updateJournalEntryAndReload` が、`dateInput ?? originalDate` の解決と、`originalDate` との比較を行う。
- `updateJournalEntryAndReload` は、日付を変えたときだけ日付を `updateEntry` へ渡す（変えないときは渡さない）。検証も**日付を変えたときだけ**行う（`dateInput ?? editingEntry.date` が編集前のエントリの日付と違うとき）。日付が元のままなら検証せずに、日付なしで保存する。

### 配線

日付を、次の層のすべてを通して保存層まで渡す。リセットも同じ層を通す。取りこぼしは各層のテストで落とす（L-060）。

- 入力 state: `useJournalPageInputState.ts`・`journalViewStateData.ts`（`createReloadedJournalViewState`・`JournalViewState` 型）・`journalFormViewState.ts`
- フォームの state と処理: `useJournalPageFormState.ts`・`journalPageFormStateResult.ts`・`useJournalPageFormActions.ts`・`journalPageFormActions.ts`（`createOpenJournalFormAction`・`createCancelJournalFormHandler`・`createOpenEditJournalFormAction`）
- 再読み込みとリセット: `useJournalPageReloadAction.ts`・`journalPageReloadActions.ts`（`createLoadJournalDataAction`）・`journalPageDataActions.ts`（`createJournalPageData`・`resetJournalFormInputs`）。保存・更新・削除のたびに入力を戻す経路に、`dateInput` のリセットも入れる
- 保存・更新の処理: `useJournalPageMutationActions.ts`・`useJournalSaveEntryAction.ts`・`useJournalUpdateEntryAction.ts`・`journalPageMutationHandlers.ts`・`journalMutationActions.ts`
- 組み立て: `useJournalPageActions.ts`・`journalPageActionBindings.ts`・`useJournalPageState.ts`・`journalPageStateResult.ts`・`JournalPage.tsx`（`journalPageStateActions.ts` は `export *` だけの barrel、`journalPageReloadActionResult.ts` と `journalPageMutationActionsResult.ts` は `contentInput` を持たないので、変更しない）
- 保存層: `storageEntries.ts`（`storage.ts` は再エクスポートのみ）

## AI エージェント API

- `firebase-functions/src/agentApi/operations/journal/journalInput.ts`: `JOURNAL_UPDATE_KEYS` に `"date"` を足し、「日付は変更できない」のコメントを直す。`date` の検証は、作成（`POST`）と同じ `readDate` を使う。
- `journalEntity.ts` の `applyJournalPatch`: `date` を受け取ったら更新する。JSDoc の「createdAt と date は保つ」を直す（`createdAt` は保つ）。
- バケットの移動（`journalOperations.ts` の `update`）: **`patch.date !== undefined` かつ `patch.date` が見つけたバケットのキー（`findEntry` が返す実際の置き場所）と違うときだけ**、既存の `removeEntry`（旧バケットから除き、空なら消す）→ `addEntry(updated)`（新バケットの末尾）を呼ぶ。それ以外（`date` が無い・キーと同じ）は、今のとおり `replaceEntry` でキーのバケットの中で置き換える。`replaceEntry(history, key, updated)` のシグネチャは変えない（`applyJournalPatch` が `date` を既存値で埋めるので、`updated.date` からは `patch.date` の有無が分からないため）。キーと `entry.date` が食い違う古いデータに対して、`date` を含まない `PATCH`（タイトルだけの更新など）がバケットを移さない（`record.date === key` の比較にしない）。
- `journalOperations.ts`: `PATCH` の入力に `date` を通し、上のバケットの移動を行う。`readDate`（`dateTimeFields.ts`）は `string | undefined` を返し、不正なら `invalid_field` を投げる（`parseJournalPatchInput` で `compact({ ..., date: readDate(input, "date") })` と書ける）。
- `docs/04-reference/openapi.yaml`（`JournalEntryPatch` に `date` プロパティを足す。`pattern` と `format: date` は `JournalEntryCreate` に合わせ、「date は変更不可」の説明を直す）と `docs/04-reference/agent-api.md` を更新する。

## 実装の分け方（タスク）

実装プランは次の 4 つに分ける（順序はこのとおり。API は独立で、どこに置いてもよい）。

1. **保存層・検証関数・文言**: `updateJournalEntry` の日付、`getJournalDateError`・`isValidJournalDate`・`formatJournalDate` の不正入力対応（`utils/journalDate.ts`）、新しい文言のキー（日付ラベル・`<日付> の記録`・`page.alertInvalidDate`・`page.alertFutureDate`）。
2. **画面**: 入力 state・固定・配線（入力 state と処理の層）、カード・`JournalPage.tsx`・Storybook（カードの層）。配線の層とカードの層でレビューの区切りを置く（変更が大きいため）。
3. **AI エージェント API**: `firebase-functions`（別の `package.json`。検証もそこで行う）と OpenAPI・`agent-api.md`。
4. **説明・確認表**: `features.md`・手動確認表（3 か所）・`applyJournalPatch` の JSDoc。

## 失敗の扱い

- 日付が不正（空・形式・実在しない・1900-01-01 より前・未来。検証をする場面のとき）: 保存せず、理由を `alert` で示す。入力は残し、フォームは開いたままにする。
- 保存層の失敗（ID が無い・書き込みの失敗）: 今の更新の失敗の扱い（`entryId` が空なら throw など）を変えない。
- 保存と更新は同期の `localStorage` 書き込みなので、二重送信を防ぐ仕組み（`isSaving` など）は今も無く、今回も足さない。

## テスト

- 保存層（`__tests__/storage.test.ts` など。ストレージをモックする流儀）: 日付を変えるとバケットが移る・旧バケットが空なら消える・`entry.date` と `updatedAt` が更新される・`createdAt` が据え置かれる・同じ日付への変更と `date` 省略は位置を変えない・変更先に既存のエントリがあっても共存する・ID が無ければ変えない・キーと `entry.date` が食い違うデータでも実際の置き場所から動かせる・`date` が明示されてキーと同じで `entry.date` が食い違うデータは、位置を変えず `entry.date` を直す（`date` 省略時は `entry.date` を触らない）。
- 日付の検証の関数（`journalDate.test.ts`。`TZ=Asia/Tokyo` の流儀。L-181）: 形式・実在しない日付（2 月 30 日・4/31）・閏日・年 0050・未来・今日・空。見出しの整形が不正な文字列で壊れない。
- `journalMutationActions.test.ts`: 日付つきの保存・更新が、検証に通れば日付を渡し、通らなければ呼ばず `alert` を出して `false` を返す。編集は日付を変えないときは検証しない（元が未来日でも、タイトルだけ直す保存が通る）。
- 配線のテスト（`useJournalSaveEntryAction.test.tsx`・`useJournalUpdateEntryAction.test.tsx`・`journalPageMutationHandlers.test.ts`・`journalPageFormActions.test.ts`・`journalPageReloadActions` のテスト・`journalPageDataActions` のテスト・`useJournalPageState.test.tsx`・`JournalPage.test.tsx` ほか。`toEqual` で入力 state の形を固定しているテストが、`dateInput` を足すと落ちる。`grep -rln "contentInput" src/features/journal/__tests__` で一覧を出し、`dateInput` を足して全部直す）: 日付が各層を通って保存層まで届く（どこかで日付を落とすと落ちる）。リセットで `dateInput` が `null` に戻る。**新規追加は、最初の変更の時点の今日で固定され、日をまたいでも保存の時点の今日にならない**（時計を固定して確かめる）。リセットのセッターは固定を起こさない。新規で最初の変更が日付欄だった場合は、選んだ値で固定される（今日にならない）。日付欄の変更は `prev ?? 固定する日付` を使わず、選んだ値（`""` を含む）がそのまま入る。編集中に履歴の別のエントリを削除して再読み込みが走り `dateInput` が `null` に戻っても、その後に本文を打ち直した保存で、過去のエントリの日付が今日に書き換わらない。編集の保存は、日付を変えないとき `updateEntry` に日付を渡さない（キーと `entry.date` が食い違うデータでも、バケットを移さない）。
- 部品のテスト（`JournalEditCard.test.tsx`・`JournalTodayCard.test.tsx`）: 日付欄が出る・`max` が今日・変更で `onChange` が呼ばれる・編集の初期値がエントリの日付・見出し: 新規追加（`JournalTodayCard`）は選んだ日付に従う（今日なら `今日の記録 (日付)`、それ以外は `<日付> の記録`、空・不正なら `今日の記録` だけ）。編集（`JournalTodayCard` を編集で開いたとき・`JournalEditCard`）は、日付欄を変えても見出しが変わらない。
- 画面のテスト（`JournalPage.test.tsx`）: 過去のエントリの日付を変えて保存すると、一覧の位置とグループが変わる。今日のエントリを過去へ移すと今日のカードが空になる。
- API（`firebase-functions/src/agentApi/__tests__/journal.test.ts` と `operations/journalInput.test.ts`・`journalEntity.test.ts`・`journalStore.test.ts`。`firebase-functions` は別の `package.json` なので、検証もそこで行う）: `PATCH` で `date` を変えるとバケットが移る・形式不正と実在しない日付は拒否する・`date` 省略は今の動き・`title` / `content` と同時に変えられる・`date` だけの `PATCH` が `empty_patch` にならない・未来の `date` を許す（アプリとの非対称を固定する）・移動で旧バケットが空になったらキーが消える・キーと `entry.date` が食い違うデータに対して `date` なしの `PATCH` はバケットを移さない・`date` がキーと同じなら移動せず `entry.date` を直す。
- Storybook: 日付欄を足したカードのストーリー。固定の日付を使う（相対日付を使わない。L-502）。
- 手動確認表（`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`detailed-test-cases/group-01-04.ts` の 3 か所）に項目を足す: **3-1（新規作成）** に「日付欄で過去日を選んで保存」「日付欄を空・未来にすると保存を拒否」、**3-6（過去エントリの編集）** に日付変更の詳細ケース（3-6-4 以降: 過去へ移動・今日のエントリを過去へ移動・変更先に既存があっても共存）を足し、3-6 の項目名を日付変更を含む名前に直す。3-2 の「1 日 1 エントリ」の記述は実態（同日に複数可）とずれているが、今回は触れない（範囲外）。アプリ内の確認表のテスト（`initialData.test.ts` など）が通ること。
  - 既知の制約（直さない・範囲外）: 確認表は画面を開いた端末で項目（`label` を含む）を丸ごと保存し、読み込み時は `mergeStoredTestMatrixCategories` が保存値を優先する（`{ ...item, ...savedItem }`）。このため、すでに確認表を保存している端末では 3-1・3-6 の項目名の変更が表示されない（ID・確認結果は変わらず、詳細ケースの追加分は `pc`・`sp`・`note` だけを統合するので表示される）。保存・統合の仕組みは他の項目にも関わるため、この変更では変えない。
  - 既知の制約（直さない・範囲外）: 過去の記録の一覧は日付の新しい順の 30 件までで、もとから 31 件目より古い記録は画面に出ない（日がたって押し出される）。日付を変えて 30 件目より古い日付にした記録も同じく一覧に出なくなる（保存・更新は成功し、データは残る。画面の外では書き出し・AI エージェント API で見られる）。一覧を 30 件より先へ辿る手段（「もっと見る」など）は別の機能で、この変更では足さない。features.md の一覧の説明に、この挙動を書く。

## 気をつける知見

dev-flow-kit の `review-lessons.md`:

- L-454: 更新関数の省略可能な引数（`date?`）を、省略時に `undefined` で既存の値を上書きしない。
- L-508: 1 回の処理で「今日」を複数回別々に取らない。保存・更新のハンドラの入口で 1 回だけ取り、未操作時の既定値と未来の判定の両方に使う。
- L-538: 日付をまたいで開いたままのとき `max` と見出しの今日が古くなりうる点は、描画のたびに今日を取り直すことで追いつく（上の「今日の判定」）。
- L-060: 組み立て役（配線）の取りこぼしを、各層のテストで落とす。
- L-181: テストで時刻を固定するときにタイムゾーンを指定する（`TZ=Asia/Tokyo` の流儀）。
- L-502: Storybook のストーリーで相対日付を使わない。
- L-203: 型・コメント・設計書・API の説明（`JOURNAL_UPDATE_KEYS` の「日付は変更できない」、`applyJournalPatch` の JSDoc、OpenAPI、`agent-api.md`、`features.md`、手動確認表）を、実装に合わせて直す。

このリポジトリの `docs/02-development/review-lessons.md`:

- 1-3 節: 日付の実在検査で `Date.UTC` の 0〜99 年の補正を避ける（`setUTCFullYear` を使う）。
- 2-3 節: バケットのキーと `date` の食い違いに耐える実装にする（実際の置き場所を正とする）。
- 5-1 節: 1 つの結果を複数の state で表さない（日付の入力 state を `string | null` の 1 つにする）。

## 手動確認の方針

実機（ブラウザ・スマホ）での確認は、手動確認表の 3-1（新規作成）と 3-6（過去エントリの編集）に足す。
