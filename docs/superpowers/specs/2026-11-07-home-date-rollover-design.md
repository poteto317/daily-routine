# ホーム画面の日付ラベル・祝日フラグ・選択中の曜日の日またぎ 設計書

- 対象 issue: [#210](https://github.com/poteto317/daily-routine/issues/210)「ホーム画面の日付ラベル・祝日フラグ・選択中の曜日が、0 時をまたいでも前日のまま残る」
- 作成日: 2026-11-07
- 関連: #208 / PR #209（React Compiler の「今日固定」の修正。ホームの曜日の並び順だけを `useJstDay()` で直した）、知見 L-538（今日を古いまま持つ問題）、L-690（コンパイラを通さない単体テストで確かめたつもりになる）、L-368（手動確認の手順）、L-060（配線テスト）、L-686（合成テストの `act()`）、L-685（共有の入力状態を書き換える入口）

## 背景と問題

ホーム画面を開いたまま 0 時をまたぐと、次の 3 つが前日のまま残る（アプリを開き直すか再読み込みするまで）。

- 今日の日付ラベル（`HomeToolbar` の `view.currentDate`。「2026年11月7日土曜日」の形）
- 今日が祝日かどうかのフラグ（`view.isTodayHoliday`。ラベル横の「祝日」バッジと、曜日タブの「🎌 祝日」の位置）
- 選択中の曜日タブ（`view.viewMode`。表示するルーティンの曜日を決めるほか、ルーティン追加フォームの既定の曜日にも使われる。`pageViewModelActions.ts` の `resolveHomeRoutineFormDay(data.view.viewMode)`）

原因（コードで確認済み。実機で再現したものではない）:

- `src/features/routine/hooks/useHomeViewDateState.ts`: `useState(() => createHomeCurrentDateLabel(canUseWindow))` と `useState(() => createInitialIsTodayHoliday(canUseWindow, getIsTodayHoliday))` で、最初の描画で 1 回だけ求めている。React Compiler のメモ化ではなく、初期 state として 1 回だけ求める作りによるもの
- `src/features/routine/hooks/useHomeViewControlInitialState.ts` と `homeViewControlStateActions.ts`: 選択中の曜日（`viewMode`）の初期値を `createInitialHomeViewMode(canUseWindow, getIsTodayHoliday, currentDayOfWeek)`（祝日なら `"holiday"`、そうでなければ今日の曜日）で 1 回だけ求め、`useHomeViewControlRuntimeState` の `useState` に入れている

#208 では、曜日の並び順（`useHomeViewSortedDays` が使う `currentDayOfWeek`）だけを `useJstDay()` に替えた。今回はそれ以外の 3 つを直す。

## 決めたこと（ユーザーに確認して確定）

1. **日付ラベルと祝日フラグは、日をまたいだあとの再描画で新しい今日になる**
2. **選択中の曜日は、利用者が選んでいなければ今日に追従する**。起動直後のまま（既定のタブを表示している）なら、日をまたいだとき新しい今日（祝日なら「祝日」）のタブに切り替わる。利用者がタブを自分で押して選んだ場合は、その選択を保つ
3. **0 時に自動で画面を更新する仕組み（タイマー・`visibilitychange`）は入れない**。#208 と同じ方針で、日をまたいだあとは「次の描画（操作・タブの切り替え）で追いつく」
4. （推奨案を採用。設計で詳細を詰めた結果）**「利用者が選んでいる」のは、押したタブがその時点の既定のタブと違うときだけ**。既定のタブ（今日の曜日、祝日なら「祝日」）を押したときは、選択を「今日に追従」に戻す。理由: 「今日のルーティンを見たい」人が今日のタブを押しても、翌日に前日のタブに固定されないため。今日以外のタブを押した場合は、その選択を保つ

## 設計

### 日付ラベルと祝日フラグ: 描画のたびに求める

`useHomeViewDateState`（`currentDate`・`isTodayHoliday`）を、`useState` ではなく**描画のたびに求める**形にする。

- 求める値は文字列と真偽値（`currentDate: string`・`isTodayHoliday: boolean`）。呼ぶ側（コンパイルされる `useHomeViewState`）は、これらの値の変化をメモ化の依存として扱うので、日をまたいだあとの再描画で新しい値が下流（`HomeToolbar` ほか）まで届く
- React Compiler が有効なため、この関数の本体の**最初の文**に `"use no memo"` を置く（`src/hooks/useToday.ts` の先例。ディレクティブより前に他の文を置かない。コメントは前にあってよい）。この関数は他のフックを呼ばなくなるため、`"use no memo"` が無くてもコンパイラの対象にならない（#208 のレビューで確認）が、将来フックを呼ぶ形に変わったときの保険として置く。「固定されない」の保証は、呼ぶ側のコンパイル結果で確かめる（下の契約テスト）
- この関数は機能側（`src/features/routine/hooks/`）に置く。祝日の判定に機能側の関数（`getIsTodayHoliday`）を呼ぶため、`src/hooks/useToday.ts`（features を参照しない規約）には置けない。規約（`docs/02-development/coding-standards.md` の節「React Compiler と今日・現在時刻」）に、「機能側に置く `"use no memo"` の関数も可。本体の最初の文を契約テストの対象に足す」を追記する（下の「ドキュメント・確認表」）
- 日付ラベルは `createHomeCurrentDateLabel(canUseWindow, now)` を使う（端末ローカルの日付。今と同じ基準）。祝日フラグは `createInitialIsTodayHoliday(canUseWindow, getIsTodayHoliday)` 相当（`getIsTodayHoliday` は `useRoutineQueries` の `isHoliday(getJstToday())`。JST の今日。今と同じ基準）。関数名の「Initial」は実態に合わなくなるので、実装プランで改名してよい（既存の呼び出し・テストを合わせる）
- `canUseWindow` が false（サーバー描画）のとき、ラベルは空文字・祝日フラグは false（今と同じ）

### 選択中の曜日: 「手動で選んだ曜日」と「今日の既定のタブ」を分けて持つ

- state を `selectedViewMode: { mode: HomeViewMode | null }`（`mode` が `null` なら「今日に追従」。初期値は `{ mode: null }`）にする。**タブを押したら必ず再描画させる**ため、押すたびに新しいオブジェクトを入れる。`selectedViewMode` が `null` のまま `setSelectedViewMode(null)` を呼ぶと、React は同じ値として再描画を省くので、再描画のないまま 0 時をまたいだあとに新しい今日のタブを押しても画面（日付ラベル・表示するタブ）が更新されない（今のコードは `setViewMode(数値)` で必ず再描画される。退行になる）。`useReducer` で新しいオブジェクトを返す形でもよい
- **既定のタブ**（`defaultViewMode`）= 祝日なら `"holiday"`、そうでなければ今日の曜日（`currentDayOfWeek`）。`canUseWindow` が false のときは今日の曜日（今の `createInitialHomeViewMode` と同じ）。これは描画のたびに、新しい `currentDayOfWeek` と `isTodayHoliday` から求める（state ではない）
- **表示するタブ**（`view.viewMode`）= `selectedViewMode.mode ?? defaultViewMode`
- `setViewModeAction(mode)`: `mode` が**押した時点の既定のタブと同じ**なら `{ mode: null }`（新しいオブジェクト）を、違うなら `{ mode }` を入れる。保存（`saveViewMode(mode)`）は今のまま、押したタブの値をそのまま保存する（今は保存した値を読み出す箇所が無い。読み出しは範囲外）
- **押した時点の既定のタブは、ハンドラの本体（押した時点）で求める**（L-538）。描画時の `defaultViewMode` をハンドラの `useCallback` の依存に持たせると、再描画のないまま 0 時をまたいだ最初のタブ押下が前日の既定のタブと比べられて誤動作する（例: 23:59 の描画のまま 0 時をまたぎ、表示中の「火曜」を押すと `null` になって「水曜」に飛ぶ。新しい今日の「木曜」を押すと古い既定（水曜）と違うので選択として固定され、翌日も木曜のまま残る）。ハンドラの本体で `createDefaultHomeViewMode(canUseWindow, getIsTodayHoliday(), toJstDay(new Date()))` のように、押した時点の祝日フラグと曜日から求める（イベントハンドラ内で今日を取るのは規約の対象外）。そのため、`getIsTodayHoliday`（`useRoutineQueries` の安定した関数）は `setViewModeAction` を作る側まで渡す経路を残す。描画時の既定のタブ（表示するタブを求める用）は、描画時の `isTodayHoliday`（真偽値）と `currentDayOfWeek` から求める
- 日をまたぐと `defaultViewMode` が変わる。`selectedViewMode.mode` が `null` なら表示するタブが新しい既定のタブになる。`selectedViewMode.mode` が曜日（0〜6）や `"holiday"` なら、そのまま保たれる
- `"holiday"` を選んでいた場合: 翌日が祝日でなくても「祝日」タブは常に存在するので、そのまま保つ
- 境界のケース（いずれも「選択として固定される」。既知の制約 2 に書く）: (a) 祝日の日に、今日の曜日のタブ（例: 祝日の月曜に「月」）を押す — 既定は「祝日」なので、選択として固定され、翌日も月曜のまま残る、(b) 前日に翌日の曜日のタブを押す — 翌日になって既定のタブと同じになっても `selectedViewMode.mode` は `null` に戻らず、翌々日もその曜日のまま残る（押し直したときだけ戻る）、(c) 平日に「祝日」タブを押す — 翌日が祝日になっても、選択として固定されたまま
- 表示するタブが変わると、ルーティン追加フォームの既定の曜日（`resolveHomeRoutineFormDay(view.viewMode)`）も新しい値になる（下流が `view.viewMode` を使っているため。確認表 2-30 の期待結果と配線テストに含める）

関連ファイルの変更（実装プランで関数名・引数を確定する）:

- `useHomeViewControlInitialState.ts`・`homeViewControlStateActions.ts`・`useHomeViewControlRuntimeState.ts`・`useHomeViewControlState.ts`・`useHomeViewControls.ts`・`useHomeViewControlActions.ts`・`homeViewControlRuntimeStateResult.ts`・`homeViewControlsResult.ts`: `viewMode` の初期値を 1 回だけ求める作りをやめる。制御側（`useHomeViewControls` 系）には、描画時の既定のタブを求めるための `isTodayHoliday`（真偽値）と、`setViewModeAction` の本体で押した時点の既定のタブを求めるための `getIsTodayHoliday`（関数）の両方を渡す（`getIsTodayHoliday` を渡す経路は今もあり、`viewMode` の初期値のために使われている。それをハンドラ用に付け替える）。`currentDayOfWeek` は描画時の値を、ハンドラ側は押した時点の `toJstDay(new Date())` を使う。最小になる形を実装プランで選ぶ
- `homeViewStateActions.ts` の `createInitialHomeViewMode`: 「既定のタブを求める純粋関数」（引数: `canUseWindow`・`isTodayHoliday`・`currentDayOfWeek`）と「表示するタブを求める純粋関数」に整理してよい
- `homeViewStateHookActions.ts` の `createSetHomeViewModeAction`・`homeViewStateActions.ts` の `setHomeViewModeState`: 既定のタブとの比較による `{ mode: null }`（新しいオブジェクト）への切り替えを入れる

### 契約テスト（React Compiler を通す）の対象に加える

#208 の `src/__tests__/reactCompilerToday.contract.test.ts` に、今回の変更を加える。役割は、コンパイラの自動メモ化が絡む退行を捕まえることに絞る。**`useState` の初期値に戻す退行は、コンパイラと関係なく起こる**（ディレクティブの確認も依存の確認も通る）ので、契約テストでは捕まえず、Jest の日またぎの単体テスト（`renderHook` と `rerender`。下の「テストの方針」）で捕まえる。

1. **`"use no memo"` の確認の一般化**: 今の判定 `startsWithUseNoMemo` は `src/hooks/useToday.ts` のファイル名（`TODAY_HOOK_FILE`）が固定で入っていて、対象は `it.each(TODAY_HOOK_NAMES)` に固定されている。判定を `(file, 関数名)` の組で受ける形に直し、対象を `{ file, name }` の配列にする（`useToday.ts` の 3 つと、今回の `useHomeViewDateState` を含むファイルの関数）。確かめる対象は「その関数の本体（アロー関数のブロック）の**最初の文**が `"use no memo"`」で、設計「日付ラベルと祝日フラグ」と同じ。`TodayTarget` の形も直す: `dependency: string`（1 つだけ）を `dependencies: string[]` に、必須の `hookCall: string`（「ソースが共通フックを呼んでいる」の確認）を省略できる `hookCall?: string` に変える（`useHomeViewState.ts` は `currentDayOfWeek`・`currentDate`・`isTodayHoliday` の 3 つを確かめ、`useHomeViewControls` 系は共通フックを呼ばないので `hookCall` を持たない）。`hookCall` の説明（共通フック `src/hooks/useToday.ts`）は、機能側の関数を含む形に直す
2. **呼ぶ側のコンパイル結果の依存の確認を、今回の対象に足す**: (a) `useHomeViewState.ts` は #208 から `TODAY_TARGETS` にあり、`currentDayOfWeek` が依存の比較に入っていることを確かめている。そこに、日付ラベルと祝日フラグ（`$[n] !== currentDate`・`$[n] !== isTodayHoliday`）の確認を足す（ただし、これらは今の `useState` の形のコードでもコンパイル結果に現れるので、**退行の検出には使えない**。ディレクティブの確認（1）と日またぎの単体テストが退行を捕まえる。依存の確認は、日付ラベル・祝日フラグが下流へ届く配線の確認として足す）、(b) 既定のタブを求める側（`useHomeViewControls` 系で、描画時の `isTodayHoliday`・`currentDayOfWeek` から求める箇所を含むファイル）のコンパイル結果で、`isTodayHoliday` と `currentDayOfWeek` が依存の比較に入っていること。ここで `getIsTodayHoliday()` を描画時に呼ぶ形に退行すると、依存が `$[n] !== getIsTodayHoliday` に替わり、`!== isTodayHoliday` が消えるので、この確認で捕まえられる。ただし、この退行は**不具合（固定）を起こさない**: その呼び出しは同じメモ化のブロックに `currentDayOfWeek` が入るので、日をまたげば曜日が変わり、ブロックが計算し直されて祝日フラグも新しくなる（#210 の再レビューで jsdom により確認）。この確認が捕まえるのは、規約（描画時に今日に依存する関数を呼ばない）違反と、今は偶然固定されない構造が崩れる将来の変更。どのファイル・変数を確かめるかは、実装プランでコンパイル結果を見て確定する
3. **変異の確認**（実装プランで 1 回行い、結果を記録する。テストには含めない）: (a) `useHomeViewDateState` の `"use no memo"` を外す → 検証 1 が落ちる、(b) 日付ラベル・祝日フラグを `useState` の初期値に戻す → **Jest の日またぎの単体テスト**が落ちる（契約テストは落ちない。それで正しい）、(c) 既定のタブを求める側で、`isTodayHoliday` を描画時の値ではなく `getIsTodayHoliday()` の描画時の呼び出しに替える → 検証 2(b) が落ちる（不具合は起こさないが規約違反として落ちる。上記）

### ドキュメント・確認表

- `docs/02-development/coding-standards.md` の節「React Compiler と今日・現在時刻」を直す。今は「描画時に取る必要があるときは `src/hooks/useToday.ts` のフックを使う」だけだが、今回は機能側の関数（祝日の判定）を毎描画で呼ぶ必要があり、共通フックでは書けない。「機能側の関数を描画のたびに呼ぶ必要があるときは、機能側に `"use no memo"` の関数を置いてよい。本体の最初の文を契約テストの対象に足す」を追記する。**さらに、規約の「対象外」の行（今は「`useState` の初期化関数の中で取る今日は対象外です（描画のたびに求める値ではありません）」）に、「ただし、`useState` の初期化で取る今日を画面に出す今日（日付のラベル・祝日・既定の選択）に使うと、日をまたいでも古いまま残ります（#210）。表示に使う今日は描画のたびに求めてください」を足す**。レビューの観点の 1 行にも同じ趣旨を足す
- **確認表 2-29（#208 で足した「0 時をまたいだ後の曜日の並び順」）から、この修正で正しくなくなる制約の記述を外す**（外すだけにして、日付・選択中のタブの期待は 2-30 に任せる）。実在の文言は次の 2 か所: `docs/03-testing/test-matrix.md` の 2-29 の備考「開いたまま日をまたいで操作すると、新しい今日の曜日が先頭になる（選択中の曜日・日付の表示は前日のまま）」から括弧書きを外す、`src/features/test-matrix/detailed-test-cases/group-01-04.ts` の `2-29-1` の `expected` 末尾「選択中のタブと、画面上部の日付の表示は、またぐ前の日のまま（再読み込みで新しい日に揃う。既知の制約）」の一文を**消すだけ**にする（置き換えの文は足さない。日付・選択中のタブの期待は 2-30 に任せる）。ID は変えない。`useHomeViewState.test.tsx`（59 行付近）と `useHomeViewState.today.test.tsx`（37 行付近）の「選択中の曜日は初期 state のまま（設計書「既知の制約と懸念」3）」のコメントと期待も、新しい契約に直す
- 確認表（`docs/03-testing/test-matrix.md`・`src/features/test-matrix/initialData.ts`・`src/features/test-matrix/detailed-test-cases/group-01-04.ts`）: ホーム（2-C の表。#208 で足した 2-29 の次）に、新しい項目 2-30「0 時をまたいだあとのホームの日付ラベル・祝日・選択中の曜日」を足す。ID は既存のものを変えない・振り直さない。手順は L-368 に従い具体的に書く（端末のタイムゾーンが日本であること、端末の日時を 23:59 付近にして、アプリを開いたまま 0 時をまたぐ、月末・年末をまたがない日、またぐ前後の期待。祝日をまたぐ場合（前日が平日で翌日が祝日、またはその逆）と、利用者がタブを自分で選んでいる場合を別のケースにする）。祝日の日付は、実際の祝日の日付（`src/lib/holidays` の定義）から決めて書く。2-29（曜日の並び順）の期待結果と矛盾しないこと

## 既知の制約と懸念

1. 日をまたいだあとは、次の描画（操作・タブの切り替え）まで画面は古い（決めたこと 3）
2. 利用者がタブを自分で選ぶと（押した時点の既定のタブ以外）、翌日もそのタブが保たれる。押した時点の既定のタブ（今日の曜日、祝日なら「祝日」）を押したときだけ「今日に追従」に戻る（決めたこと 4）。境界のケース: 祝日の日に今日の曜日のタブを押す、前日に翌日の曜日のタブを押す（翌日になって既定のタブと同じになっても `{ mode: null }` に戻らない）、平日に「祝日」タブを押す、は、どれも選択として固定される
3. 起動時に保存した `viewMode`（`localStorage`）を読み出す処理は、今も無い（`getStoredViewMode` は定義だけある）。今回も読み出さない（範囲外）。保存の書き込みは今のまま
4. 日付ラベルは端末ローカルの日付、祝日と曜日は JST の日付で求める（今の基準のまま）。端末のタイムゾーンが JST でないと、0 時をまたぐ時刻が揃わない。今回は基準を変えない
5. 描画のたびに `toLocaleDateString` と `isHoliday` を呼ぶ。どちらも軽い処理で、性能への影響は無視できる

## テストの方針

- 純粋関数（既定のタブを求める、表示するタブを求める、`setHomeViewModeState` の `{ mode: null }` への切り替え）の単体テスト。`homeViewStateActions.test.ts`・`homeViewControlStateActions.test.ts` などの既存のテストを新しい契約に合わせて書き換える（期待を弱めない）
- 日付ラベルと祝日フラグ: フェイクタイマーで描画後に日付を進め、**再描画して**新しい値になる（`renderHook` と `rerender`）。祝日をまたぐケース（前日が平日→翌日が祝日、その逆）で `isTodayHoliday` が切り替わる。これが `useState` の初期値に戻す退行を捕まえるテスト（コンパイラを通さなくても、修正前の形では落ちる）。祝日の判定は、既存の `useHomeViewDateState` のテストのように固定の値を返すスタブではなく、時計に連動する関数（`() => isHoliday(getJstToday())` 相当。`src/lib/holidays` の実際の祝日の日付で、祝日の前日 23:59 JST から当日 0:01 JST へ進める。実装プランで実在の祝日と平日の組を決める）を渡す
- 選択中のタブ: (a) 選んでいなければ、日をまたいだ再描画で新しい今日のタブ（平日→祝日、祝日→平日を含む）、(b) 今日以外のタブを選んでいれば、日をまたいでも保たれる、(c) 今日のタブを押すと、選択が「今日に追従」に戻り、日をまたぐと新しい今日のタブになる、(d) `canUseWindow` が false のとき今日の曜日（今と同じ）、(e) **L-538: 前日に描画し、再描画せずに時計を進めて翌日に `setViewModeAction` を呼ぶ**（描画と最初の入力を同じ時刻にして見逃さない）。期待は、state の内部値ではなく**観測できる値**で書く。観測は `renderHook` の `result.current`（コミット後の値）で行う（描画中に値を写し取るテスト部品は、`null`→`null` で React が描画を捨てるときにも新しい値が見えてしまい、退行を見逃す）: 新しい今日の曜日のタブを押すと、押したあとの `view.viewMode` が新しい今日のタブで、`view.currentDate` が新しい日付になる（「選択中のタブが既に今日に追従していて（`{ mode: null }`）、新しい今日のタブを押す」を独立したケースにする。再描画が省かれると落ちる。先に別のタブを押して戻した状態（`{ mode: 3 }` のあと今日のタブを押して `{ mode: null }` になった状態）からも同じ確認を行う）、表示中の古い今日のタブを押すと、そのタブが `view.viewMode` に残り（選択として固定される。押した時点の既定のタブと比べるため）、(f) 境界のケース（祝日の日に今日の曜日のタブ、平日に「祝日」タブ）が固定される。ハンドラ（`setViewModeAction`）を呼ぶテストは `act()` で囲む（L-686）。ハンドラを作るフックは、`getIsTodayHoliday` を押した時点で呼ぶ形を、描画時の値を使う形に戻すと (e) だけが落ちることを実装プランで確認する。**描画時の曜日は `useJstDay()`、押した時点の曜日は `toJstDay(new Date())` と出どころが違う**ので、`useJstDay` をモックして時計と違う曜日を返す配線テスト（`useHomeViewState.today.test.tsx`）では、`setViewModeAction` の既定のタブとの比較を確かめない（表示の既定と押した時点の既定が食い違うため）。(c)(e)(f) は、フェイクタイマーと本物の `useJstDay` で確かめる別のテストにする
- 配線テスト（L-060）: `useHomeViewState` が日付ラベル・祝日フラグ・表示するタブを正しく `view` に渡す。日をまたいだあと、`view.viewMode` が変わると、ルーティン追加フォームの既定の曜日（`resolveHomeRoutineFormDay(view.viewMode)`）も新しい値になる（下流の `pageViewModelActions` 側のテストか、`useHomeViewState` の戻り値からの確認。既存の配線の流儀に合わせる）。既存の `useHomeViewState.test.tsx`・`useHomeViewState.today.test.tsx` を新しい契約に合わせる。フックをモックする配線テストと、本物のフックで日またぎを確かめるテストの両方の流儀が既にあるので、合わせる
- 書き換える既存テスト（`src/features/routine/hooks/__tests__/`）: `homeViewStateActions.test.ts`・`homeViewControlStateActions.test.ts`・`homeViewStateHookActions.test.ts`・`useHomeViewControlActions.test.tsx`・`useHomeViewControlInitialState.test.tsx`・`useHomeViewControlRuntimeState.test.tsx`・`useHomeViewControlState.test.tsx`・`useHomeViewControls.test.tsx`・`useHomeViewDateState.test.tsx`・`useHomeViewState.test.tsx`・`useHomeViewState.today.test.tsx`、state が `{ mode: HomeViewMode | null }` になるため、setter の型（`Dispatch<SetStateAction<…>>`）を持つ `homeViewControlRuntimeStateResult.test.ts`・`homeViewControlsResult.test.ts`・`useHomeViewControlActions.test.tsx` の型と期待も直す。`getIsTodayHoliday` の渡し方と state の型が変わる影響の洗い出しは実装プランで行う。`setViewModeAction` を呼ぶ既存のテストに `act()` が要るかも洗い出す（L-686）
- 契約テスト（上記）
- 全体: `npm test`（`TZ=Asia/Tokyo`。ワークツリー配下では `jest.config.ts` の `testPathIgnorePatterns` に `/\.worktrees/` があるため 0 件になる。`npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'` で上書きして実行する）、`npm run typecheck`、`npm run typecheck:functions`、`npm run lint`、`npm run tailwind:scan`、`npm run build`

## 範囲外

- 0 時に自動で再描画する仕組み
- 起動時に保存した `viewMode` を読み出す処理
- 日付ラベルと祝日・曜日のタイムゾーン基準の統一
- ホーム以外の画面
