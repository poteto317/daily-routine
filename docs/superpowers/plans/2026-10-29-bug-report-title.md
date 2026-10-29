# 不具合報告のタイトル入力削除 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Issue #182 のタイトル入力をなくす。
**Architecture:** 既存フォームからタイトルのUIと状態、送信引数を削除し、既存APIの空文字保存とサーバー自動生成を利用する。
**Tech Stack:** React 19、Next.js 16、TypeScript、Jest。
**Spec:** docs/superpowers/specs/2026-10-29-bug-report-title-design.md

## Global Constraints

既存API・Firestore・サーバーは変更しない。依存追加なし。L-015/L-060/L-048を適用。コミットはdev-flow-kitのcommit-ja段階にまとめる。

## Review Focus

- 内容のみの送信で title が混入しない（ページ結合テスト）。
- 内容と再現手順の配線と成功時リセット（ページ・フックの既存テスト更新）。
- 失敗時入力保持、空内容と長さ検証（既存テスト維持）。
- API保存時の空titleとサーバー生成（既存API/helper/Functionsテスト）。

## Task 1: タイトル欄と状態を削除

対象: src/features/bug-report/components/{BugReportForm,BugReportPage}.tsx、hooks/{useBugReportInputState,useBugReportForm}.ts、locales/ja.json、および対応する4つの `__tests__` ファイル。
入力: description、stepsToReproduce と既存送信状態。出力: submit({ description: string, stepsToReproduce: string })。

- [x] ページテストでタイトルtextboxが存在せず、内容のみの送信引数にtitleがないことを期待する。
- [x] `npm test -- --runInBand src/features/bug-report/__tests__/BugReportPage.test.tsx` で意図した失敗を確認する。
- [x] タイトルのprops・state・配線・送信引数・専用表示文言を削除する。既存テストの削除欄前提を更新する。
- [x] npm test -- --runInBand src/features/bug-report firebase-functions/src/bugReport で成功を確認する。
- [x] `npm run verify` で全体lint/typecheck/testを確認。Google Fonts取得のネットワーク制限を解消して `npm run build` も成功。
- [ ] SRP、コードレビュー、コミット、PR、PRレビュー、知見整理を指定フローで進める。
