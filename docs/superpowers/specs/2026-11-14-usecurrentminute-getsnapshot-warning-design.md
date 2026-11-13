# useCurrentMinute の getSnapshot 警告を JSDoc に書く 設計書

作成日: 2026年11月14日

対象: [Issue #225](https://github.com/poteto317/daily-routine/issues/225)「chore: useCurrentMinute で、分の変わり目に開発時だけ getSnapshot の警告が出る可能性がある」

## 背景と目的

`useCurrentMinute`（`src/hooks/useCurrentMinute.ts`）は `useSyncExternalStore` の `getSnapshot` に `getCurrentMinute`（毎回 `Date.now()` を読む）を渡している。React は開発時、`getSnapshot` を続けて 2 回呼び、戻り値が同じかを確かめる。同じ分のあいだは値が一致するが、2 回の呼び出しのあいだに分が変わると値がずれ、コンソールに「The result of getSnapshot should be cached」の警告が 1 回出る可能性がある。

Issue は「本番の動作には影響しない」「実際に警告が出るかは未検証」「優先度は低い」としている。対応案は次の 2 つ。

1. ストア側に「いまの分」を持ち、`notifyCurrentMinute()` のときだけ更新する（`getSnapshot` は持っている値を返すだけにする）。
2. 何もしない（開発時だけの、まれな警告として許容する）。フックの JSDoc に書いておく。

目的は、選んだ方針をコード上に残し、後から同じ指摘で実装を変えようとしないようにすることである。

## 決めたこと

利用者への確認で **B（直さず JSDoc に書く）** を採用した。

| 項目 | 決定 | 理由 |
| --- | --- | --- |
| 実装の変更 | しない | 本番影響なし。ストアにキャッシュすると「別の理由で再描画されたときにも値が進む」という今の動作が変わり、#9 / #222 の修正に影響しうる |
| 警告の再現確認 | しない | 方針が「許容して文書化する」なので、再現の有無は文書の結論を変えない。Issue も未検証のまま起票している |
| 書く場所 | `useCurrentMinute` の JSDoc だけ | Issue の対応案どおり。規約（`coding-standards.md`）には、開発時のまれな警告までは書かない（利用者が従う手順ではない） |
| テスト | 追加しない | 挙動を変えない。警告の再現は時刻の境界に依存し、単体テストで安定して再現させる価値が低い |
| 範囲外 | ストアのキャッシュ化、`getCurrentMinute` のシグネチャ変更、規約への追記、呼び出し元の変更 | 直す方針を採らないため |

## 設計

`src/hooks/useCurrentMinute.ts` の `useCurrentMinute` の JSDoc に、次の内容を日本語で足す（既存の箇条書きのあとに 1 項目、または短い段落）。

- 開発時だけ、分の変わり目に React が `getSnapshot` を続けて 2 回呼ぶあいだで値が変わると、「The result of getSnapshot should be cached」の警告が 1 回出ることがある。
- 本番ビルドではこの確認は行われない。無限ループにはならない。
- ストアに値をキャッシュして直すと、別の理由の再描画でも分が進む今の動作が変わるため、意図して直していない（Issue #225）。

コード本体（`subscribe`・`getCurrentMinute`・`notifyCurrentMinute`・`useSyncExternalStore` の呼び出し）は変えない。

## 検証

- 変更後のファイルを読み、JSDoc に上の内容があることを確かめる。
- 既存の `src/hooks/__tests__/useCurrentMinute.test.ts` が通ることを確かめる（挙動変更が無いことの確認）。

## 確認した知見

今回は文書のみで、購読やキャッシュの実装は変えない。関連しうる知見として L-466（設定の購読）・L-538（現在時刻の固定）は、今回の変更の対象外である。
