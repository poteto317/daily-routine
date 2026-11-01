# 不具合報告メニューのアイコン変更 実装プラン（Issue #190）

設計書: `docs/superpowers/specs/2026-11-01-change-bug-report-icon-design.md`
気をつける知見: L-662, L-015, L-057, L-060

## タスク 1: テスト追加（先に失敗させる）

- [x] `src/config/__tests__/index.test.ts` に追加:
  ```ts
  it("不具合報告メニューのアイコンに📣を設定する", () => {
    const item = menuConfig.menuItems.find((i) => i.id === "bug-report");
    expect(item).toBeDefined();
    expect(item?.icon).toBe("📣");
  });
  ```
- [x] `npx jest src/config/__tests__/index.test.ts` が失敗することを確認

## タスク 2: 設定変更

- [x] `src/config/locales/ja.json` の `bug-report` の `icon` を `"📣"` にする
- [x] タスク 1 のテストが通ることを確認

## タスク 3: ドキュメント同期

- [x] `docs/04-reference/README.md`: `🐛 不具合報告` → `📣 不具合報告`
- [x] `docs/04-reference/features.md`: 目次のリンク文言（アンカー `#-不具合報告` は変わらない）、見出し `### 📣 不具合報告`、「📣 不具合を報告」、メニュー ID 表の絵文字
- [x] `grep -rn "🐛" src docs/04-reference docs/03-testing` が 0 件

## タスク 4: 検証

- [x] `npx jest src/config src/hooks`、`npm run format`、`npm run lint`、`npm run typecheck`、全体 `npx jest --maxWorkers=4`、`npm run build`
- [x] コミットはしない
