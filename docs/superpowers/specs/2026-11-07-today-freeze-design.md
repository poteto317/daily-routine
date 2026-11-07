# React Compiler の「今日固定」の修正 設計書

- 対象 issue: [#208](https://github.com/poteto317/daily-routine/issues/208)「React Compiler のメモ化で、描画時に求めた「今日」が最初の描画の値に固定される箇所がある」
- 作成日: 2026-11-07
- 関連: #191（家計簿の未入力の日。`useBudgetMissingExpenseDates` で同じ問題を `"use no memo"` で避けた）、知見 L-538（今日を古いまま持つ問題と React Compiler）、L-368（手動確認の手順）、L-060（配線テスト）

## 背景と問題

`next.config.ts` に `reactCompiler: true` があり、React Compiler が全フック・コンポーネントを自動でメモ化する。入力（props・state）を持たない式は、結果が最初の描画の値で保たれる。そのため、フックやコンポーネントの本体で描画のたびに「今日」を求めている次のような式は、コンポーネントが作り直されるまで（画面を開き直す・再読み込みまで）最初の描画の今日に固定される。

```ts
const today = getTodayString(); // コンパイル後: 最初の 1 回だけ実行され、以降は同じ値
```

#191 で `babel-plugin-react-compiler`（Next と同じオプション `{environment:{enableNameAnonymousFunctions:false}}`）を使って確かめた結果:

- `"use no memo"` が無いと、`const todayKey = toDateKey(new Date());` は `if ($[0] === Symbol.for("react.memo_cache_sentinel")) { t1 = toDateKey(new Date()); $[0] = t1; }` になる（固定される）
- フック本体の先頭に `"use no memo"` を置くと、コンパイル結果に `_c(` が出ず、描画のたびに取り直される
- 呼ぶ側（コンパイルされるフック）は、`"use no memo"` のフックの戻り値を依存として扱うので、日をまたいだあとの再描画で新しい値が下流まで届く

Jest（ts-jest）はコンパイラを通らないため、フェイクタイマーで日付を進めても固定は再現せず、単体テストでは検出できない。

影響が大きいのは、固定された今日を**保存する日付に使う**箇所。体重・食事の記録は、0 時をまたいだあとに入力すると前日の日付で保存されうる。

## 決めたこと（ユーザーに確認して確定）

1. **対象は 5 か所を直す**（体重・食事・家計簿の指標・カレンダー・ホームの曜日）。家計簿のフォーム 2 つの 0 円警告と、週目標の進捗は、害が小さいので制約として記録して直さない
2. **仕組みは「箇所ごとに今日を取り直す」**。#191 と同じ `"use no memo"` 方式。0 時に自動で再描画する仕組み（タイマー・`visibilitychange`）は作らない。日をまたいだあとは「次の描画（操作・タブの切り替え）で追いつく」
3. **退行を防ぐために、React Compiler を通す契約テストを入れる**。対象ファイルを `babel-plugin-react-compiler` でコンパイルし、今日が固定されないことを Jest で固定する。あわせて `docs/02-development/coding-standards.md` にルールを書く
4. （推奨案を採用。設計レビューで判明）**体重・食事の保存する日付は、イベントの時点の今日で決める**。描画時の今日を取り直すだけでは、再描画のないまま 0 時をまたいだ保存が前日になるため（L-538）

## 設計

### 方針: 今日を取り直す小さな共通フックを 1 つ作り、各箇所はそれを呼ぶ

各箇所のフック・コンポーネント全体を `"use no memo"` にすると、保存からの読み出し（`getTodayWeightRecord()` など。現在はコンパイラが 1 回だけに抑えている）まで毎描画で実行されてしまう。そこで、**今日を返すだけの小さなフック**を `"use no memo"` にし、各箇所はそのフックの戻り値（文字列・数値）を使う。呼ぶ側はコンパイルされたままで、戻り値が変わったときだけ下流が更新される。

新規ファイル `src/hooks/useToday.ts`（コーディング規約「⑤ hooks/（共通ロジック）」の置き場。`docs/02-development/coding-standards.md` の hooks の節。名前は実装プランで確定してよいが、1 ファイルに集める。hooks は features を参照してはならない規約があるため、`src/features/` の関数は import しない）:

- `useJstTodayKey(): string` — `getTodayString()`（JST の `YYYY-MM-DD`。体重・食事・カレンダーが使う基準）
- `useJstDay(): number` — `toJstDay(new Date())`（JST の曜日。ホームが使う基準）
- `useLocalTodayKey(): string` — 端末ローカルの `YYYY-MM-DD`（家計簿が使う基準）。`src/features/budget/utils/date.ts` の `toDateKey` は features なので import せず、ローカルの年月日（`getFullYear`・`getMonth() + 1`・`getDate()`、ゼロ埋め）をフック内で組み立てる。`toDateKey` と同じ結果になることは単体テストで固定する

各フックは本体の**最初の文**に `"use no memo"` を置く（ディレクティブより前に他の文を置かない。コメントは前にあってよい。#191 の `useBudgetMissingExpenseDates.ts` が先例）。中身は 1 行で、副作用はない。

なお、これらの小さなフックは、他のフックを呼ばず JSX も返さないため、`"use no memo"` が無くてもコンパイラの対象にならない（#208 のレビューで確認）。ディレクティブは、将来フックを呼ぶ形に変わったときの保険であり、今日が固定されないことの保証は、**呼ぶ側のコンパイル結果**で確かめる（下の契約テスト）。タイムゾーンの基準は各箇所が今使っているものをそのまま保つ（JST の箇所は JST、家計簿はローカル）。

### 対象 5 か所と変更

| 場所                                                              | 現状                                                                                                                                                                                                               | 変更                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/features/weight-tracker/page/useWeightTrackerDataState.ts:8` | `const today = getTodayDateKey();` を描画時に求め、`saveWeight(today, ...)` まで渡る                                                                                                                               | `const today = useJstTodayKey();` に差し替える。保存の読み出し（`getTodayWeightRecord()` など）はコンパイラの扱いのまま                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/features/meal/useMealPageDataState.ts:8`                     | `const today = getTodayDateString();`                                                                                                                                                                              | `const today = useJstTodayKey();`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/features/budget/useBudgetPageMetricsState.ts:16-19`          | `useMemo(() => calculateBudgetMetrics(currentDate, monthBudget, expenses), [currentDate, expenses, monthBudget])`（今日が依存に無く、計算は `metrics.ts:28` の既定引数 `now: Date = new Date()` の中で今日を取る） | `const todayKey = useLocalTodayKey();` を呼び、`useMemo` の中で `todayKey` からローカル 0 時の Date（`new Date(`${todayKey}T00:00:00`)`）を作り、既存の第 4 引数 `now` に渡す（`calculateBudgetMetrics` のシグネチャは変えない。計算は日付の部分だけを使う（`toDateKey`・`isCurrentMonthDate`・`calculateUnenteredMonthDays`）ので、0 時の Date でも結果は同じ）。`todayKey` を本体で実際に使うため、コンパイラが依存から外さず、lint（`react-hooks/exhaustive-deps`）の「不要な依存」にもならない（#208 のレビューで、依存に足すだけの案はコンパイル結果で `todayKey` が依存から外れ、lint でも落ちることを確認済み） |
| `src/features/calendar/components/CalendarGrid.tsx:34-35,55`      | `const today = new Date(); const todayStr = toDateString(today);` と `isFuture = date > today`                                                                                                                     | `const todayStr = useJstTodayKey();` にし、`isToday = dateStr === todayStr`、`isFuture = dateStr > todayStr`（`YYYY-MM-DD` は固定長なので文字列比較できる）にする。`today` の Date は使わない                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/features/routine/hooks/useHomeViewState.ts:10`               | `const currentDayOfWeek = toJstDay(new Date());`                                                                                                                                                                   | `const currentDayOfWeek = useJstDay();`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

`CalendarGrid` の `isFuture` は、これまで `date`（端末ローカルの真夜中）と `today`（今の時刻）の比較で、JST の `todayStr` とは基準が混ざっていた。文字列比較にすると両方が JST の日付に揃う。端末が JST のときの結果は変わらない（アプリの利用者は日本）。他のタイムゾーンの端末では、未来の判定（日付を押せるかどうか）が JST の日付に揃い、`isToday`（元から JST）と同じ基準になる。

### 直さないもの（制約として記録して受け入れる）

- **家計簿のフォーム 2 つ**（`BudgetExpenseForm.tsx:40`、`BudgetExpenseEditForm.tsx:36`）: `isZeroAmountOnUnavailableDate(..., new Date())` が金額・日付でメモ化される。0 円を「今日以降の日付」で入れたときの警告の判定で、日をまたいだ直後に、金額も日付も変えない状態で 1 回だけ古い判定になりうる。金額か日付を 1 文字でも変えると取り直す。保存時の検証（`isExpenseAmountAllowedOnDate`、`buildExpensePayload` の `now`）は保存の瞬間の今日で行うので、誤った保存にはならない
- **週目標の進捗**（`useWeeklyGoalProgress.ts:20`）: 手書きの `useMemo` の依存が `[selectedDate, now]` で、選択日（`selectedDate`）が変わったときに今日を取り直す設計。`today` は JST の週の開始日（月曜始まり。`weeklyGoalDateKeys.ts` の `getWeekStartKey`）を求めるためだけに使われる（`weeklyGoals.ts`）。結果が古くなるのは JST の月曜 0 時をまたいだときだけで、そのときは、選択日を変えるか開き直すまで、今週の判定（目標の一覧の選び方・連続記録の終わりの週）が前の週を基準にしたままになる。コンパイラの固定ではなく、元からの設計
- **ホームの日付ラベル・祝日フラグ**（`useHomeViewDateState.ts`）: `useState(() => ...)` の初期値でラベルと祝日を求める。コンパイラ以前に、初期 state として最初の 1 回だけ求める作り。ホームの曜日（今回直す）とは別。日をまたぐと「今日の日付ラベル」が古いまま。別 issue の候補（今回の対象外。issue #208 の候補表には無い）
- **日をまたいだ直後の自動更新**: 描画（操作・タブの切り替え・再読み込み）が起きるまで、画面は古い今日のまま。0 時に自動で再描画する仕組みは作らない

### 契約テスト（React Compiler を通す）

新しい Jest のテスト 1 ファイル（例: `src/__tests__/reactCompilerToday.contract.test.ts`。場所は実装プランで確定）。

- 対象ファイルを `babel-plugin-react-compiler`（Next と同じオプション）でコンパイルする。TypeScript・JSX の変換には、`typescript` の `transpileModule`（オプションは `{ jsx: Preserve, target: ESNext, module: ESNext }`。`jsx` だけだと既定の ES5・CommonJS に変換されて、コンパイラがコンポーネント・フックを認識せず、`_c(` が出ないため、判定が空振りで通る。#208 の再レビューで確認済み。あわせて `fileName` に対象のパスを渡す。渡さないと、`jsx` の指定があるとき `module.tsx` とみなされ、`.ts` の対象も TSX として解析される）を使い、その出力を `@babel/core` の `transformSync`（`babel-plugin-react-compiler` のみ。`@babel/preset-typescript` は無い）に通す。`transformSync` には `babelrc: false`・`configFile: false`・`filename`（対象のパス。失敗したときにどのファイルか分かる）・`parserOpts: { plugins: ["jsx"] }` を渡す（渡さないと `.tsx` が「Support for the experimental syntax 'jsx' isn't currently enabled」で失敗する。#208 のレビューで jest 上の再現を確認済み）。テストの環境は `@jest-environment node`。`@babel/core` は `package.json` に宣言が無く、他のパッケージの依存として入っているだけ（`npm ls` で extraneous）なので、`devDependencies` に宣言を足す（インストール済みの 7.29 系に合わせる）。契約テストは `src/` 配下の `.ts` で `tsconfig.test.json` の型検査の対象になるので、型の `@types/babel__core` も同じ理由（推移的な依存で入っているだけ。`package-lock.json` で `"devOptional": true`）で `devDependencies` に宣言する（インストール済みの 7.20 系に合わせる）。`package-lock.json` の差分が、この 2 つの宣言だけであることを実装プランで確認する
- 検証する内容:
  1. `src/hooks/useToday.ts` の 3 つのフックそれぞれで、ソースの関数本体の**最初の文**が `"use no memo"` である（ディレクティブの有無の確認。ファイルを読んで判定する。コンパイル結果では判定できない: フックを呼ばず JSX も無い関数はコンパイラの対象外で、ディレクティブを外しても `_c(` は出ない）
  2. 検証 3 の前提: 直した 5 か所のファイルのコンパイル結果に `_c(` がある（実際にコンパイルされた）。無ければテストを失敗させる（空振りで通ることを防ぐ）
  3. 直した 5 か所のファイルのコンパイル結果で、**今日が固定されていない**。ファイルごとの判定:
     - 体重・食事・カレンダー・ホーム: 今日を求める式（`new Date()`・`getTodayString(`・`getTodayDateString(`・`getTodayDateKey(`・`toJstDay(new Date`）が、メモ化のブロック（`Symbol.for("react.memo_cache_sentinel")` の `if` の中）に入っていない。かつ、ソースが共通フック（`useJstTodayKey(`・`useJstDay(`）を呼んでいる
     - 家計簿の指標: コンパイル結果の依存の比較に `todayKey` がある（`$[n] !== todayKey`）
  4. 変異の確認（実装プランで 1 回行い、結果を記録する。テストには含めない）: 各ファイルで共通フックの呼び出しを元の直接の呼び出し（`getTodayString()` など）に戻したコピーをコンパイルし、検証 3 が落ちること。家計簿の指標は、元のコードが今日を直接取っていない（`calculateBudgetMetrics` の既定引数 `now = new Date()` に任せていた）ので、(a) `useLocalTodayKey()` を `toDateKey(new Date())` に替えた形と、(b) `now` を渡さず `todayKey` も使わない元の形、の 2 つのコピーで、どちらも検証 3 が落ちること
- 判定の実装（正規表現かブロックの切り出しか）は、コンパイル結果の実際の形を見て、誤検出が少ない方法を実装プランで選ぶ
- 将来、対象に新しい箇所を足すときは、ファイル一覧に足す（一覧は 1 か所に置き、`coding-standards.md` からその場所を参照する）

### ドキュメント

- `docs/02-development/coding-standards.md` に「React Compiler と今日・現在時刻」の節を足す: (1) 描画時に「今日」「現在時刻」を求めない（保存する日付に使う値は特に）、(2) 描画時に取る必要があるときは `src/hooks/useToday.ts` のフックを使う、(3) 新しく今日を使うフック・コンポーネントは契約テストの対象一覧に足す、(4) イベントハンドラ内・`useState` の初期化関数内で取る今日は対象外
- 確認表（`docs/03-testing/test-matrix.md`、`src/features/test-matrix/initialData.ts`、`src/features/test-matrix/detailed-test-cases/`）に、5 か所それぞれの「0 時をまたいだあと」の手動確認を足す（体重・食事・家計簿の指標・カレンダー・ホームの曜日。端末の日時を 23:59 付近にして、アプリを開いたまま 0 時をまたぎ、操作して確かめる。月末・年末をまたがない日で行う。前提の状態と、押す・開く順番を具体的に書く。L-368）。**体重・食事は、イベントの時点の今日が保存の日付になることを確かめる手順にする**: 23:59 にフォームを開いて入力を 0 時前に終え、何も触らずに 0 時を過ぎてから保存だけを押す（入力欄への入力は再描画を起こし、描画時の今日も新しくなるので、0 時後の入力では確かめにならない）。期待: 新しい日付で保存され、保存後にラベル・今日の記録・一覧の「今日」バッジが新しい日付で揃う。別の手順として、0 時後に別の操作で再描画してから保存しないとラベルだけ新しくなり、中身は前日のままであること（既知の制約 2）も期待結果に書く。ID は既存のものを変えない・振り直さない。足す場所と ID は実装プランで確定する（既存の各画面の節に合わせる）

### 体重・食事: 保存する日付はイベントの時点の今日で決める

体重・食事の保存は、ハンドラが「最後の描画の `today`」を `useCallback` の依存で持つ形になっている（`useWeightTrackerMutationActions.ts` ほか）。描画時の今日を取り直すだけでは、23:59 にフォームを開き、再描画のないまま 0:01 に保存すると、前日の日付で保存される（L-538: ハンドラが描画時に取った今日を持つ）。そこで、**保存に使う日付は、保存の関数が呼ばれた時点（イベントの時点）で `getTodayString()`（体重は `getTodayDateKey()`、食事は `getTodayDateString()` の経由でもよい）を呼んで決める**。描画時の `today`（共通フックの戻り値）は、表示（食事の今日のラベルなど）にだけ使う。

- 要件: 保存の関数に渡る日付は、**ハンドラの本体の中（呼ばれた時点）で `getTodayDateKey()`・`getTodayDateString()` などを呼んで決める**。描画時の `today` は保存の経路に流さない（`useCallback` の依存からも外す）。純粋関数（体重の `saveWeightAndReload`、食事の `addMealAndReload`。`pageStateActions.ts`）が日付を引数で受ける設計は、テストしやすさのために残してよい（呼び出し元のハンドラが、呼ばれた時点の今日を渡す）
- 変更の候補ファイル（実装プランで、実際の関数名と `today` の受け渡しを確認して確定する）: 体重は `useWeightTrackerActions.ts`・`useWeightTrackerMutationActions.ts`（`useCallback` の依存に `today`）・`weightMutationActions.ts`・`weightPageActionBindings.ts`・`useWeightTrackerState.ts`、食事は `useMealAddAction.ts`（`useCallback` の依存に `today`）・`mealMutationActions.ts`（`createMealAddHandler`）・`useMealPageMutationActions.ts`・`useMealPageActions.ts`・`mealPageActionBindings.ts`・`useMealPageState.ts`。変更が最小になる形を選ぶ。フックが実際に import しているのは再エクスポートの `weightPageStateActions.ts`（体重。`useWeightTrackerMutationActions.ts`）と `mealPageStateActions.ts`（食事。`useMealAddAction.ts`）なので、この 2 ファイルも確認する
- テストの置き場: 既存の `src/features/weight-tracker/__tests__/useWeightTrackerMutationActions.test.tsx` と `src/features/meal/__tests__/useMealAddAction.test.tsx` は、保存の handler を作る関数（`createSaveWeightHandler`・`createMealAddHandler`）をファイル全体で `jest.mock` しているため、足しても保存の関数まで届かない。**新しいテストファイル**（例: `useWeightTrackerMutationActions.saveDate.test.tsx`・`useMealAddAction.saveDate.test.tsx`）を作り、`../storage` だけをモックして本物の handler を通す。既存テストにある `today: "2024-01-12"` を handler に渡す期待は、`today` を保存の経路から外す変更に合わせて書き換える（期待を弱めず、新しい契約＝イベントの時点の今日を渡す、に直す）
- 保存の日付以外（「今日の記録を編集中か」など）で `today` を使う箇所は、実装プランで洗い出し、保存の日付と同じ扱いにするか、描画時の値のままでよいかを個別に判断する

## 既知の制約と懸念

1. 日をまたいだあとは、次の描画まで画面が古い（上記「直さないもの」）。保存する日付は、体重・食事ではイベントの時点の今日になる（上記）。1 つ前の描画から再描画がないまま保存しても、新しい今日で保存される
2. 体重・食事は、0 時をまたいで再描画すると、日付のラベル（`MealTodaySection.tsx` の `formatMealDate(today)` など）が新しい日付になる一方、「今日の記録」のデータ（`useWeightTrackerDataState.ts:15`・`useMealPageDataState.ts:15` の `useState` の初期値）と一覧は前日のままで、保存または再読み込み（`reloadData`）まで更新されない。修正前は、日付も中身も前日で揃っていた。体重では、前日の値が入ったカードを「今日」として編集し、新しい日付で保存する流れになりうる（保存すると今日の記録になり、再読み込みで揃う）。ラベルと中身の食い違いは、日をまたいだあとの最初の保存まで。今回は直さない（今日のデータの再読み込みを描画から起こす設計になり、範囲が広がるため）。手動確認の期待結果にも、この食い違いと、保存後に揃うことを書く
3. ホームは、変わるのは曜日の並び順（`useHomeViewSortedDays` の `useMemo` が `currentDayOfWeek` を使う）だけ。選択中の曜日（`viewMode` は `useState` の初期値）・日付ラベル・祝日フラグ（`useHomeViewDateState`）は、日をまたいでも前日のまま。手動確認・単体テストの期待は、並び順だけが新しい今日を先頭にすることにする
4. 契約テストはコンパイル結果の文字列で判定するため、コンパイラのバージョンアップで出力の形が変わると誤検出・見逃しが起こりうる。テストの失敗メッセージに、判定の意図（今日が固定されていないこと）と、コンパイル結果の見方を書く
5. `"use no memo"` のフックは毎描画で実行されるが、中身は日付の計算 1 行なので、性能への影響は無視できる
6. `useBudgetMissingExpenseDates`（#191）は、自前で `"use no memo"` と今日の取得を持っている。共通フックへの置き換えは今回の対象外（動作は同じ。後で統一してよい）
7. 他にも描画時に今日を求めている箇所が残る可能性がある（issue の調査は `new Date()` を含む実装ファイルの一覧からの手作業）。契約テストの対象は、今回直した箇所と共通フックだけで、リポジトリ全体の自動検出はしない（イベントハンドラ内や `useState` の初期化などの無害な箇所が多く、誤検出が多くなるため）

## テストの方針

- `src/hooks/__tests__/useToday.test.ts(x)`（既存の hooks のテストの置き場に合わせる。実装プランで確認する）: 3 つのフックが、フェイクタイマーで時刻を進めて再描画すると新しい値を返す（`renderHook` と `rerender`。日をまたぐ前後の時刻）。`useJstTodayKey` は `getTodayString()`、`useJstDay` は `toJstDay(new Date())`、`useLocalTodayKey` は `toDateKey(new Date())`（`src/features/budget/utils/date.ts`。テストからは features を import してよい）と同じ値を返すことを固定する。JST とローカルの差は検証しない（`npm test` は `TZ=Asia/Tokyo` で動くので 2 つは同じ日付になり、確かめられない。各フックが今の基準をそのまま保つだけなので、既存の関数と同じ結果であることの確認で足りる）
- 5 か所それぞれ: 日をまたいだあとの再描画で、下流の値（体重・食事の `today`（表示用）、家計簿の指標、カレンダーの今日の強調と `disabled`、ホームの曜日の並び順）が新しい今日になる単体テスト（既存のテストの流儀に合わせ、既存の期待は弱めない。新しい契約は L-060 の流儀で、子フックをモックする合成テストと、実際のフックを通す統合テストのどちらが既存の流儀かを実装プランで確認して合わせる。合成テストでハンドラが本物の `useState` の setter を呼ぶ場合は `act()` で囲む）
- 体重・食事の保存: **23:59 に描画し、再描画せずに時計を 0:01 へ進めてから保存のハンドラを呼ぶと、新しい日付で保存される**単体テスト（L-538）。純粋関数を直接呼ぶのではなく、**ハンドラを作るフック**（体重は `useWeightTrackerMutationActions`、食事は `useMealAddAction`、またはそれより上）を `renderHook` で 23:59 に描画し、再描画せずにフェイクタイマーで 0:01 へ進め、ハンドラ（`handleSaveWeight`・食事の追加のハンドラ）を呼び、保存の関数（`saveWeightRecord`・`addMealRecord` のモック）の第 1 引数が新しい日付であることを確かめる。既存の `useWeightTrackerState.test.tsx` のように子フックをすべてモックする合成テストでは、この退行を検出できないので、そこには足さない。変異の確認（ハンドラが描画時の `today` を使う形に一時的に戻すと、このテストだけが落ちること）を実装プランで 1 回行い、結果を記録する
- 契約テスト（上記）
- 全体: `npm test`（`TZ=Asia/Tokyo`。このワークツリーのように `.worktrees` 配下では、`jest.config.ts` の `testPathIgnorePatterns` に `/\.worktrees/` があるため 0 件になる。`npm test -- --testPathIgnorePatterns '/node_modules/' '/firebase-functions/lib/' '/e2e/'` で上書きして実行する）、`npm run typecheck`、`npm run typecheck:functions`、`npm run lint`、`npm run tailwind:scan`、`npm run build`

## 範囲外

- 0 時に自動で再描画する仕組み（`useToday` のタイマー化、`visibilitychange` での更新）
- ホームの日付ラベル・祝日フラグ（`useState` の初期値）の更新
- 家計簿のフォーム 2 つの 0 円警告、週目標の進捗の依存の見直し
- `useBudgetMissingExpenseDates` の共通フックへの置き換え
- リポジトリ全体の「今日固定」の自動検出
