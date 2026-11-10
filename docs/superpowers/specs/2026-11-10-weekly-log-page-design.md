# 週ごとの業務日誌を独立した画面にする 設計書

作成日: 2026年11月10日

## 背景と目的

PR #216 で、週ごとの業務日誌（Issue #205）をジャーナル画面の中の節として追加した。利用者から「ジャーナルの中ではなく、ハンバーガーメニューにある他の項目と同じレベルに移してほしい」との要望があった。

目的は次の 2 つ。

- 週ごとの業務日誌を、ハンバーガーメニューの独立した項目（ジャーナル・体重記録などと同じ並び）から開ける独立した画面にする。
- ジャーナル画面からは週ごとの業務日誌の節を外し、日次のジャーナルだけの画面に戻す。

保存データ・同期・書き出しの仕組み（`weekly-log-history`、`weeklyLogHistory`）は変えない。

## 決めたこと

利用者への追加の質問はせず、既存の他の項目と同じ扱いになる案を採用した。

| 項目              | 決定                                                                                       | 理由                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| メニューの表示名  | 「業務日誌」                                                                               | メニューの項目名は短い（「体重記録」「家計簿」など）。画面の見出しは従来どおり「🗓️ 週ごとの業務日誌」              |
| アイコン          | 🗒️（メニューと表示設定）                                                                   | 🗓️ は「達成カレンダー」が使っており、メニューで重複するため避ける。画面の見出しの「🗓️ 週ごとの業務日誌」は変えない |
| ページ ID・ルート | `weekly-log`                                                                               | 既存の ID（`weight-tracker` など）と同じケバブケース                                                               |
| メニュー内の位置  | ジャーナルの直後（`menuConfig` の並びで 2 番目の機能項目）                                 | 関連する機能を隣に置く。並び順を自分で変えていない利用者は、この自然順で表示される                                 |
| バッジ            | なし                                                                                       | 正式機能のため（ジャーナルと同じ）                                                                                 |
| 表示設定          | 設定画面の「機能の表示設定」のジャーナルの直後に「業務日誌」を追加。既定はオン             | 他の機能項目と同じく、メニューへの表示を切り替えられる                                                             |
| 並び替え          | 設定画面のメニュー順で並び替え可能な項目に追加                                             | 他の機能項目と同じ                                                                                                 |
| ジャーナル画面    | 週ごとの業務日誌のカードを削除（日次のジャーナルのみ）                                     | 要望どおり「移動」                                                                                                 |
| コードの置き場所  | `src/features/journal/weekly/` のまま。画面コンポーネント `WeeklyLogPage` をここに追加する | 保存・同期の入口が `journal/storage.ts` にあり、フォルダごとの移動は差分が大きいだけで利用者への利点がない         |

## 画面の構成

`WeeklyLogPage`（`src/features/journal/weekly/WeeklyLogPage.tsx`）を新しく作る。構成はジャーナル画面のページ枠と同じ。

- 全体の背景: `JournalPage.tsx` と同じクラス（`min-h-screen bg-linear-to-br from-purple-50 to-pink-100 dark:from-slate-400 dark:to-slate-300`）。`main` は `max-w-4xl mx-auto px-4 py-8`
- `main` の中に `WeeklyLogCard` を 1 枚置く
- 画面の状態は `useWeeklyLogState()` をこの画面のコンポーネントが持つ（ジャーナル画面からは持たなくなる）

`WeeklyLogCard` の見出しは、ジャーナルの h1 の下にある h2 から、画面の見出しとして h1 に変える（画面に h1 が 1 つだけになるようにするため）。その下にある `WeeklyLogWeekNavigator`・`WeeklyLogList` の h3 は h2 に上げ、見出しの階層が飛ばないようにする。文言（`journalTexts.weeklyLog.title`）と見た目（クラス）は変えない。

## 変更の範囲

### 画面とルーティング

- `src/features/routine/pages/types.ts`: `PageType` と `VALID_PAGES` に `"weekly-log"` を追加
- `src/features/routine/pages/lazyPageComponents.ts`: `WeeklyLogPage` の遅延読み込みを追加
- `src/features/routine/pages/pageComponentRegistry.ts`: `"weekly-log": WeeklyLogPage` を登録

### メニューと設定

- `src/config/locales/ja.json`: `menuConfig.menuItems` のジャーナルの直後に `weekly-log` を追加
- `src/hooks/staticHeaderMenuItems.ts`: `FeatureMenuId` と `FEATURE_KEY_MAP` に `weekly-log` → `weeklyLog` を追加
- `src/types/routine/settings.ts`: `visibleFeatures` に `weeklyLog?: boolean` を追加
- `src/features/settings/storage.ts`: 既定の `visibleFeatures` に `weeklyLog: true` を追加
- `src/features/settings/state/featureVisibility.ts`: `VisibleFeaturesState` に必須の `weeklyLog: boolean` を足し、`weeklyLog` を読み込む（保存済みの設定に無ければ `true`）。`settings/storage.ts` の既定値は新規の利用者向けで、保存済みの設定がある利用者には、この `?? true` とメニュー側の `!== false` が効く
- `src/features/settings/state/constants.ts`: `VISIBLE_FEATURE_ITEMS` のジャーナルの直後に追加（`key: "weeklyLog"`、ラベル「業務日誌」、アイコン 🗒️）
- `src/features/settings/components/MenuOrderSection.tsx`: `REORDERABLE_MENU_IDS`（Set。表示順は `menuConfig` の順で決まる）に `weekly-log` を追加

### ジャーナル画面

- `src/features/journal/JournalPage.tsx`: `WeeklyLogCard`・`useWeeklyLogState` の使用を外す
- 日次のジャーナルの state・保存には触れない

### テスト・ドキュメント

- 各テストの固定データ（`visibleFeatures` を全項目書いているもの、メニュー順の自然順 ID、ページ ID の一覧）を新しい項目に合わせる。Storybook の固定データ（`FeatureVisibilitySection.stories.tsx`・`MenuOrderSection.stories.tsx`）も同様
- `JournalPage.test.tsx`・`JournalPage.dateEdit.test.tsx`: `useWeeklyLogState` のモックと、業務日誌のカードに関するテストを外し、同じ確認（業務日誌の操作が日次のジャーナルに影響しないこと）を `WeeklyLogPage` 側のテストに移す。`JournalPage.dateEdit.test.tsx` の「業務日誌のカードにも h3 がある」というコメントは事実でなくなるので直す。代わりに「ジャーナル画面に業務日誌が出ない」テストを足す
- `docs/04-reference/features.md`: 業務日誌をジャーナル節から独立した節に書き換える。画面一覧（全23画面 → 24 画面、表に `weekly-log` を追加）、保存データ表のカテゴリ、ディレクトリ構成、表示設定の説明を更新する
- `docs/02-development/architecture.md`（`PageType` の画面数）、`docs/04-reference/README.md`（機能一覧）を更新する
- テストマトリクス（`docs/03-testing/test-matrix.md`、`src/features/test-matrix/initialData.ts`、`detailed-test-cases/group-01-04.ts`）: 項目 3-7〜3-9 はジャーナルのカテゴリから外し、新しいカテゴリ「27. 業務日誌（Weekly Log）」（`test-matrix.md` の末尾 26 の次。`initialData.ts` には 22〜26 が無いが、2 つの文書で番号が食い違わないよう 27 とする。カテゴリ ID は `weekly-log`、バッジは「実装済」、`test-matrix.md` の見出しは ✅）に移す。項目 ID は 3-7→27-1、3-8→27-2、3-9→27-3 に振り直し、詳細ケースの ID も接頭辞を合わせる（`27-1-1` など。`detailedTestCases.test.ts` が接頭辞を強制している）。詳細ケースは `group-01-04.ts` から取り出す。置き場所は実装プランで決める。詳細ケースの手順（「ジャーナル画面を開く」など）は、メニューから業務日誌を開く手順に直す。保存済みのチェック状態はカテゴリ ID・項目 ID で照合されるため引き継がれないが、3-7〜3-9 は追加して間もなく、チェックはまだ付けていないため許容する
- `docs/superpowers/specs/2026-11-07-weekly-work-log-design.md` など過去の設計書・プランは、記録としてそのまま残す（この設計書で置き場所が変わったことを示す）

## 変えないこと

- 保存データのキー `weekly-log-history`、同期の `weeklyLogHistory`、書き出しの「記録」グループ
- 週の計算・文言・正規化・保存・操作・フックの実装（`weeklyLog*.ts`、`useWeeklyLog*.ts`）
- AI エージェント API（業務日誌は対象外のまま）

## 互換性

- 保存済みの設定に `visibleFeatures.weeklyLog` が無い（この変更より前に保存された設定、または古い端末から同期された設定）場合は、表示する（`true`）として扱う。
- メニュー順を自分で並び替えて保存している利用者は、保存済みの順に `weekly-log` が載っていないため、`sortByMenuOrder` の既存の動作（載っていない項目は保存済みの全項目の後ろに自然順）で、保存済みの全項目の後ろに、保存順に載っていない他の項目（同期履歴管理・テストマトリクスなど）と一緒に `menuConfig` の順で並び、末尾に固定の「設定」の前に表示される。設定画面で並び替えれば位置を変えられる。並び順を変えていない利用者は、ジャーナルの直後に表示される。
- ジャーナル画面で業務日誌を書いていた利用者のデータは、そのまま新しい画面に表示される（保存先が同じ）。

## 気をつける点（知見）

`<dev-flow-kit>/lessons/review-lessons.md` から、今回の変更に関係する項目。

- L-015: 画面から項目を外したとき、保存処理が既存のデータを暗黙に書き換えていないか。ジャーナル画面から業務日誌の節を外しても、日次のジャーナルの保存・同期・書き出しに影響しないことをテストで確かめる。
- L-060: 省略可能な props のせいで配線漏れを検出できなくならないか。`WeeklyLogPage` が `useWeeklyLogState` の結果をカードに渡すところを、画面単位のテストで確かめる。
- L-459: 入れ子の設定（`visibleFeatures`）を古い端末との同期で丸ごと置換しても新しいキーが消えて困らないよう、読み込み側で `?? true` の既定値を持つ。
- L-466: 設定をマウントされ続ける親で 1 回だけ読むと、設定画面での変更が反映されない。メニューの表示は既存の仕組み（`visibleFeatures` の購読）に乗せ、独自に読まない。

## テスト方針

- `WeeklyLogPage`: 見出し（h1 が 1 つ）、カードの表示、保存→一覧の表示が画面として配線されていること。
- `JournalPage`: 業務日誌の見出し・カードが出ないこと、日次の記録の保存・過去の記録の表示が変わらないこと。
- メニュー: `weekly-log` がジャーナルの直後に出る。`visibleFeatures.weeklyLog === false` で出ない。保存済みの設定に `weeklyLog` が無ければ出る。
- 設定: 「機能の表示設定」に出る、並び替え対象になる、既定がオン。
- ページ登録: `PageType`・`VALID_PAGES`・レジストリの 3 か所が揃っている（既存の契約テストに従う）。`lazyPageComponents.test.tsx` の列挙、`pageComponentRegistry.test.ts` の期待マップ、`pageComponentResolver.test.ts` のページ ID 一覧に `weekly-log` を足す。
- キーの取り違え（L-060）: すべて真偽値のキーで型検査を通るため、テストで確かめる。`weeklyLog: false`（他はオン）で `weekly-log` だけがメニューから消えること、`journal: false`（`weeklyLog` はオン）で `weekly-log` が残ること、設定画面の「業務日誌」のトグルを操作すると `weeklyLog` だけが変わること。
- 見出し: `WeeklyLogPage` の画面で h1 が 1 つ、その下の見出しが h2 であること。
- Storybook: `WeeklyLogPage` の story を追加する（既存の `WeeklyLogCard` の story は、見出しが h1 になっても動くことを確かめる）。

## 決めたこと（要約）

- メニュー名は「業務日誌」、ID は `weekly-log`、ジャーナルの直後、バッジなし、表示設定は既定オン、並び替え可能。
- コードは `src/features/journal/weekly/` に置いたまま、画面コンポーネントを追加する。
- 保存・同期・書き出しは変えない。
