# 実装プラン: 不具合報告への画像添付と Issue への反映（Issue #183）

参照設計書: [2026-10-30-bug-report-images-design.md](../specs/2026-10-30-bug-report-images-design.md)（以下「設計書」。R1〜R17 は設計書の要件番号）

確認した知見（`dev-flow-kit/lessons/review-lessons.md`）の ID: L-001, L-003, L-004, L-017, L-018, L-021, L-022, L-023, L-025, L-031, L-038, L-052, L-054, L-056, L-060, L-181, L-184, L-616。各タスクの「気をつける知見」に対応する ID を書く。

実装は worktree `.worktrees/issue-183-bug-report-images` で行い、コミットは実装後の `/commit-ja` で行う（このプランの実行中はしない）。各タスクは TDD（失敗するテスト → 実装 → 通す）で進める。

検証コマンド（共通）:

- 単体: `npx jest --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ -- <パス>`（`.worktrees` 配下では `package.json` の `npm test` が無視パターンで 0 件になるため、パス指定で実行する）
- 全体（最後のタスク）: 設計書の R17 までの変更が済んだ後に Task 11 で実行する。

## 型・名前の一覧（タスク間で食い違わせない）

サーバー（`firebase-functions/src/bugReport/`）:

| 名前                                                                                                       | 場所                      | 定義                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MAX_REPORT_IMAGES = 3`、`MAX_IMAGE_BYTES = 5 * 1024 * 1024`                                               | `imageFormats.ts`         | 定数                                                                                                                                                         |
| `ImageMediaType`                                                                                           | `imageFormats.ts`         | `"image/png" \| "image/jpeg" \| "image/webp" \| "image/gif"`                                                                                                 |
| `IMAGE_FILE_NAME_PATTERN`                                                                                  | `imageFormats.ts`         | `/^[A-Za-z0-9_-]{1,64}\.(png\|jpg\|webp\|gif)$/`                                                                                                             |
| `sniffImageMediaType(data: Uint8Array): ImageMediaType \| null`                                            | `imageFormats.ts`         | 先頭バイトで判定                                                                                                                                             |
| `ImageStore`                                                                                               | `resolveReportImages.ts`  | `{ getSize(path): Promise<number \| null>; download(path): Promise<Buffer>; getDownloadUrl(path): Promise<string> }`                                         |
| `ResolvedImage`                                                                                            | `resolveReportImages.ts`  | `{ mediaType: ImageMediaType; data: Buffer; url: string }`                                                                                                   |
| `ResolvedImages`                                                                                           | `resolveReportImages.ts`  | `{ images: ResolvedImage[]; skippedCount: number }`                                                                                                          |
| `EMPTY_RESOLVED_IMAGES`                                                                                    | `resolveReportImages.ts`  | `{ images: [], skippedCount: 0 }`（凍結しない。呼び出し側は変更しない）                                                                                      |
| `countReferencedImages(images: unknown): number`                                                           | `resolveReportImages.ts`  | 配列なら `min(length, 3)`、でなければ 0                                                                                                                      |
| `resolveReportImages(params)`                                                                              | `resolveReportImages.ts`  | `params = { uid, reportId, images: unknown, store: ImageStore, logger: { warn(message: string): void } }` → `Promise<ResolvedImages>`                        |
| `createStorageImageStore(bucket, generateToken?)`                                                          | `storageImageStore.ts`    | `ImageStore` を返す。`generateToken` の既定は `crypto.randomUUID`                                                                                            |
| `BugReportContentSource.images?: unknown`                                                                  | `buildIssueContent.ts`    | 報告ドキュメントの未検証の `images`（型は `unknown`。検証は `resolveReportImages` が行う）                                                                   |
| `IssueImageSection`                                                                                        | `buildIssueContent.ts`    | `{ images: ReadonlyArray<{ url: string }>; skippedCount: number }`（`ResolvedImages` が構造的に代入できる）                                                  |
| `buildIssueContent(report, draft?, imageSection?)`                                                         | `buildIssueContent.ts`    | 第 3 引数を追加                                                                                                                                              |
| `DraftImage`                                                                                               | `draftIssueWithClaude.ts` | `{ mediaType: ImageMediaType; data: Buffer }`（`ResolvedImage` が代入できる）                                                                                |
| `buildDraftRequest(report, images?: DraftImage[])` / `draftIssueWithClaude(report, requestDraft, images?)` | `draftIssueWithClaude.ts` | 第 2・3 引数を追加                                                                                                                                           |
| `IssueDrafter.draftIssue(report, images?: DraftImage[])`                                                   | `createIssueDrafter.ts`   | 第 2 引数を追加                                                                                                                                              |
| `ProcessBugReportDeps.resolveImages?` / `draftIssue?`                                                      | `processBugReport.ts`     | `resolveImages?: (report: ProcessableBugReport) => Promise<ResolvedImages>`、`draftIssue?: (report, images: ResolvedImage[]) => Promise<IssueDraft \| null>` |
| `HandleBugReportDeps.createImageStore?`                                                                    | `handleBugReport.ts`      | `() => ImageStore`                                                                                                                                           |

クライアント（`src/features/bug-report/`）:

| 名前                                                                        | 場所                                  | 定義                                                                                                                                                           |
| --------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAX_BUG_REPORT_IMAGES = 3`、`MAX_BUG_REPORT_IMAGE_BYTES = 5 * 1024 * 1024` | `constants.ts`                        | 定数                                                                                                                                                           |
| `BUG_REPORT_IMAGE_EXTENSIONS`                                               | `constants.ts`                        | `{ "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" }`                                                                        |
| `BUG_REPORT_IMAGE_ACCEPT`                                                   | `constants.ts`                        | `Object.keys(BUG_REPORT_IMAGE_EXTENSIONS).join(",")`                                                                                                           |
| `BugReportImage`                                                            | `types.ts`                            | `{ path: string; contentType: string; size: number }`                                                                                                          |
| `BugReportImageError`                                                       | `imageSelection.ts`                   | `"unsupportedType" \| "tooLarge" \| "tooMany"`                                                                                                                 |
| `selectBugReportImages(current: File[], incoming: File[])`                  | `imageSelection.ts`                   | `{ images: File[]; errors: BugReportImageError[] }`                                                                                                            |
| `uploadBugReportImages({ storage, uid, reportId, files, createFileId? })`   | `imageUpload.ts`                      | `Promise<BugReportImage[]>`。失敗時は自分がアップロードした分を削除して例外                                                                                    |
| `deleteBugReportImages(storage, paths)`                                     | `imageUpload.ts`                      | `Promise<void>`（失敗しても投げない）                                                                                                                          |
| `buildBugReportPayload(input, uid, meta, images?: BugReportImage[])`        | `helpers.ts`                          | 第 4 引数を追加。空・未指定なら `images` キーを入れない                                                                                                        |
| `submitBugReport(input, images?: File[])`                                   | `api.ts`                              | 第 2 引数を追加                                                                                                                                                |
| `useBugReportImages()`                                                      | `hooks/useBugReportImages.ts`         | `{ images: File[]; previews: string[]; errors: BugReportImageError[]; addImages(files: File[]): void; removeImage(index: number): void; clearImages(): void }` |
| `BugReportImagePicker`                                                      | `components/BugReportImagePicker.tsx` | props: `images: File[]`, `previews: string[]`, `errors: BugReportImageError[]`, `disabled: boolean`, `onAdd(files: File[])`, `onRemove(index: number)`         |
| `getStorageInstance()`                                                      | `src/lib/firebase-modules/storage.ts` | `FirebaseStorage` を返す。未初期化なら `FirebaseError(..., "storage-not-available")`                                                                           |

## 実装順序

サーバーの純粋なモジュール（Task 1〜2）→ Issue 本文と Claude（Task 3〜4）→ 配線（Task 5）→ ルール・設定（Task 6）→ クライアント（Task 7〜9）→ ドキュメント（Task 10）→ 全体の検証（Task 11）。

---

## Task 1: 画像の形式・マジックナンバー判定・解決（サーバー）

気をつける知見: L-018（検証と実行の値を一致させる。クライアントの申告を信用しない）、L-022（検査できない画像は許可せず飛ばす）、L-023（パスはルールとサーバーの両方）、L-025（デコードしない）、L-031/L-017（ログに出さない）、L-616（変異が生き残らない入力）。

ファイル:

- 新規 `firebase-functions/src/bugReport/imageFormats.ts`
- 新規 `firebase-functions/src/bugReport/resolveReportImages.ts`
- 新規 `firebase-functions/src/bugReport/__tests__/imageFormats.test.ts`
- 新規 `firebase-functions/src/bugReport/__tests__/resolveReportImages.test.ts`

- [ ] 1.1 `imageFormats.test.ts` を先に書く（Red）。
  - `sniffImageMediaType`: PNG（`89 50 4E 47 0D 0A 1A 0A`）、JPEG（`FF D8 FF`）、GIF87a / GIF89a、WebP（`RIFF` + 4 バイト + `WEBP`）をそれぞれ正しく判定する。`RIFF` で始まるが 8〜11 バイト目が `WEBP` でない（例: `WAVE`）は `null`。空・3 バイト未満・テキスト（`<svg`、`<html`）・PDF（`%PDF`）は `null`。PNG の途中まで一致する（`89 50 4E 47` だけ）は `null`。
  - `IMAGE_FILE_NAME_PATTERN`: `a1_-Z.png` / `x.jpg` / `x.webp` / `x.gif` は一致。64 文字は一致、65 文字は不一致。`x.jpeg`・`x.svg`・`../x.png`・`a/b.png`・`x.png.exe`・`.png`・空は不一致。
  - `MAX_REPORT_IMAGES` が 3、`MAX_IMAGE_BYTES` が 5 × 1024 × 1024。
- [ ] 1.2 `imageFormats.ts` を実装する（Green）。正規表現は正規表現リテラル（`\.`）で書く。
- [ ] 1.3 `resolveReportImages.test.ts` を先に書く（Red）。`ImageStore` は `jest.fn` の偽物、`logger` は `{ warn: jest.fn() }`。画像のバイト列は PNG / JPEG のマジックナンバーを持つ `Buffer` を作る関数で用意する。パスは `bugReports/u1/r1/<name>` の形。
  - 正常: 2 件の有効な参照 → `images` が 2 件（`mediaType` はバイト列から判定した値、`data` は取得したバイト列、`url` は `getDownloadUrl` の値）、`skippedCount` 0。順序は参照の順。
  - `images` が配列でない（`undefined`・`null`・文字列・オブジェクト）→ 空の結果（`skippedCount` 0）で `store` は呼ばれない。
  - 4 件の参照 → 先頭 3 件だけを処理し、`store.download` は 3 回まで。`skippedCount` は 0（先頭 3 件がすべて使える場合。4 件目以降は「参照が多すぎる」ため無視し、数えない）。
  - 先頭 3 件の中に不正がある場合の `skippedCount`: パスが別の uid（`bugReports/u2/r1/x.png`）、別の報告 ID（`bugReports/u1/r2/x.png`）、`..` を含む、ファイル名が `IMAGE_FILE_NAME_PATTERN` に合わない、`path` が文字列でない・要素がオブジェクトでない → その要素を飛ばし `skippedCount` に数える。それぞれ別のテストにし、`store` が呼ばれないことも確かめる（パス検証を外す変異で落ちる）。
  - `getSize` が `null` → 飛ばす（`download` は呼ばれない）。`getSize` が例外を投げる → 飛ばし（`download` は呼ばれない）、`skippedCount` に数えられる。`getSize` が 5MB + 1 → 飛ばす（`download` は呼ばれない）。ちょうど 5MB → 通る。
  - `download` が例外 → 飛ばす。バイト列が許可形式でない（テキスト・SVG・PDF）→ 飛ばす。申告された `contentType` が `image/png` でも中身が JPEG なら、`mediaType` は `image/jpeg`（バイト列を正とする）。
  - `getDownloadUrl` が例外 → その画像だけ飛ばす。
  - 1 件目が飛ばされても 2 件目は処理される（途中で止めない）。
  - すべての失敗でも例外を投げない。`logger.warn` は呼ばれ、渡された文字列にパス・URL・バイト列を含まない（`JSON.stringify(warn.mock.calls)` に `bugReports/` や `https://` が含まれない）。
- [ ] 1.4 `resolveReportImages.ts` を実装する（Green）。各画像は順に処理する。ログの文言は枚数と失敗の種別（`invalid_path` / `missing` / `too_large` / `download_failed` / `unsupported_format` / `url_failed`）だけ。`countReferencedImages` も書き出す。
- [ ] 1.5 実行: `npx jest --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/ -- firebase-functions/src/bugReport/__tests__/imageFormats.test.ts firebase-functions/src/bugReport/__tests__/resolveReportImages.test.ts` が通る。変異の確認として、実装のパス検証（uid・報告 ID の一致）、5MB 判定、マジックナンバー判定をそれぞれ一時的に外し、対応するテストが落ちることを確かめてから戻す（結果をレビューログに書く）。

## Task 2: Storage アダプタ（サーバー）

気をつける知見: L-056（例外を成功にしない）、L-184/L-181（トークン生成を注入して固定）、L-616。

ファイル:

- 新規 `firebase-functions/src/bugReport/storageImageStore.ts`
- 新規 `firebase-functions/src/bugReport/__tests__/storageImageStore.test.ts`

- [ ] 2.1 テストを先に書く（Red）。`BucketLike` の偽物（`name: "bucket-1"`、`file(path)` が `getMetadata` / `download` / `setMetadata` の `jest.fn` を持つオブジェクトを返す）を使う。
  - `getSize`: メタデータの `size` が文字列 `"1234"` → `1234`。数値 `1234` → `1234`。`undefined`・`"abc"`・負数・`NaN` → `null`。`getMetadata` が例外 → 例外をそのまま投げる（`resolveReportImages` が飛ばす側で扱う）。
  - `download`: `[Buffer]` の先頭を返す。
  - `getDownloadUrl`: `metadata.metadata.firebaseStorageDownloadTokens` が `"tok-a,tok-b"` → `https://firebasestorage.googleapis.com/v0/b/bucket-1/o/${encodeURIComponent(path)}?alt=media&token=tok-a`（`setMetadata` は呼ばれない）。パスの `/` は `%2F` になる。
  - トークンが無い（`metadata.metadata` が無い、または空文字）→ 注入した `generateToken` の値で `setMetadata({ metadata: { firebaseStorageDownloadTokens: <token> } })` を 1 回呼び、その値の URL を返す。`setMetadata` が例外 → 例外を投げる（トークンが保存できなかった URL を返さない）。
  - `generateToken` を省略したときの既定が `crypto.randomUUID` 形式（UUID の正規表現に一致）。
- [ ] 2.2 `storageImageStore.ts` を実装する（Green）。`BucketLike` / `FileLike` の型は構造的に書く（`getMetadata(): Promise<readonly [{ size?: unknown; metadata?: { firebaseStorageDownloadTokens?: unknown } }, ...unknown[]]>`、`download(): Promise<readonly [Buffer, ...unknown[]]>`、`setMetadata(metadata: object): Promise<unknown>`）。
- [ ] 2.3 実行: `npx jest ... -- firebase-functions/src/bugReport/__tests__/storageImageStore.test.ts` が通る。

## Task 3: Issue 本文への画像の反映と、Claude への画像の受け渡し（サーバー）

気をつける知見: L-022/L-018（画像内の指示に従わない・`media_type` はサーバー判定）、L-017/L-031（本文・URL をログに出さない）、L-054（signal を呼び出しごとに作る既存の挙動を壊さない）、L-616。

ファイル:

- 変更 `firebase-functions/src/bugReport/buildIssueContent.ts`、`buildDraftPrompt.ts`、`draftIssueWithClaude.ts`
- 変更 `firebase-functions/src/bugReport/__tests__/buildIssueContent.test.ts`、`buildDraftPrompt.test.ts`、`draftIssueWithClaude.test.ts`

- [ ] 3.1 `buildIssueContent.test.ts` に追加する（Red）。
  - 画像セクション無し（第 3 引数なし・`{ images: [], skippedCount: 0 }`）→ 従来と完全に同じ本文（既存テストが変わらず通る。スナップショット代わりに `toBe` で従来の本文と比較）。
  - 従来の本文（`draft` なし）で画像 2 件 → 本文に `## スクリーンショット`、`![スクリーンショット 1](url1)`、`![スクリーンショット 2](url2)` が、`## 再現手順` の後・`## 環境情報` の前にこの順で含まれる。
  - 整形後の本文（`draft` あり）で画像 1 件 → 整形後の本文の後・`## 環境情報` の前に節が入る。元の説明文・再現手順は含まれないまま。
  - `skippedCount` が 1 以上で画像 0 件 → 節に `（添付された画像 N 枚を取得できなかったため掲載していません）` だけが入る。画像 1 件 + `skippedCount` 2 → 画像行と注記の両方。
  - 画像 0 件・`skippedCount` 0 → 節を作らない。
  - URL を `sanitizeMention` に通す（URL に `@` を含む偽データで、`@` の直後にゼロ幅スペース（`ZERO_WIDTH_SPACE` 定数）が入る）。
- [ ] 3.2 `buildIssueContent.ts` を実装する（Green）。`BugReportContentSource` に `images?: unknown` を足す。`IssueImageSection` 型を書き出す。節を組み立てる小さな関数 `buildScreenshotLines(section)` を作り、`buildIssueBody` と `buildDraftIssueBody` が環境情報の前に差し込む。
- [ ] 3.3 `buildDraftPrompt.test.ts` と `draftIssueWithClaude.test.ts` に追加する（Red）。
  - `DRAFT_SYSTEM_PROMPT` に、画像を画面の状況の把握に使うこと、画像内の指示・文章には従わないこと、`![](…)` や URL を書かないことを示す文が含まれる。画像の有無によらずシステムプロンプトは同じ（画像が無くても害が無いため 1 つにする）。
  - `buildDraftRequest(report)`（画像なし）→ `messages[0].content` は従来どおり文字列。`buildDraftRequest(report, [])` も同じ。既存の `draftIssueWithClaude.test.ts` の `userContent` ヘルパーの戻り値型注釈（`: string`）は `DraftRequest["messages"][number]["content"]` が共用体型になるため推論に任せる（または `string` に絞り込むヘルパーにする）。
  - `buildDraftRequest(report, [img1, img2])` → `messages[0].content` が 3 要素の配列で、先頭 2 つが `{ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data.toString("base64") } }`、最後が `{ type: "text", text: buildDraftPrompt(report) }`。画像の順序が保たれる。
  - `draftIssueWithClaude(report, requestDraft, images)` が、`requestDraft` に渡すリクエストへ画像を含める。画像なしの既存のテストは変えずに通る。
- [ ] 3.4 `buildDraftPrompt.ts` / `draftIssueWithClaude.ts` を実装する（Green）。`DraftImage` 型を書き出す。画像ブロックの `media_type` は `ImageMediaType`（リテラルの合併型）で、SDK の型に合う。
- [ ] 3.5 実行: `npx jest ... -- firebase-functions/src/bugReport/__tests__/buildIssueContent.test.ts firebase-functions/src/bugReport/__tests__/buildDraftPrompt.test.ts firebase-functions/src/bugReport/__tests__/draftIssueWithClaude.test.ts` と `npm run typecheck:functions` が通る。

## Task 4: 画像つき整形の失敗時に、画像なしで 1 回だけ再整形する（サーバー）

気をつける知見: L-052/L-054（再整形でも呼び出しごとに新しい signal）、L-017/L-031（ログに本文・パス・URL を出さない）、L-001（`contentSource` の意味を保つ）、L-616。

ファイル:

- 変更 `firebase-functions/src/bugReport/createIssueDrafter.ts`
- 変更 `firebase-functions/src/bugReport/__tests__/createIssueDrafter.test.ts`

- [ ] 4.1 テストを追加する（Red）。`requestDraft` の `jest.fn` を使い、呼び出しごとの結果を `mockResolvedValueOnce` / `mockRejectedValueOnce` で並べる。
  - 画像あり・1 回目成功 → `requestDraft` は 1 回、そのリクエストに画像が含まれる。`contentSource()` は `claude`。
  - 画像あり・1 回目が API エラーで失敗・2 回目成功 → `requestDraft` は 2 回。1 回目は画像つき、2 回目は画像なし（`messages[0].content` が文字列）。結果は 2 回目の整形。`contentSource()` は `claude`。`logger.warn` が 1 回呼ばれ、文言に失敗理由の種別（例: `api_error(status=400)`）と「画像なし」を含み、報告の説明文・API キー・画像のバイト列を含まない。
  - 画像あり・1 回目・2 回目とも失敗 → `null`。`contentSource()` は `fallback`。`logger.warn` は 2 回（1 回目の「画像なしで再整形」、2 回目の「従来の内容で起票」）。
  - 画像あり・1 回目が `refusal` などの `IssueDraftError` でも再整形する（理由を問わない）。
  - 画像なし（引数なし・空配列）・失敗 → 再整形せず `requestDraft` は 1 回だけ。従来どおり `null` と `fallback`。
  - Claude 無効（`none`）・説明が空 → 画像があっても `requestDraft` は呼ばれず `null`（従来どおり。`contentSource()` は `fallback`）。
  - 2 回の呼び出しで `createDraftRequester` は 1 回だけ呼ばれる（依頼関数は使い回す）。
- [ ] 4.2 `createIssueDrafter.ts` を実装する（Green）。内側の `attempt(images)`（成功なら採用、失敗なら例外）を作り、画像があるときだけ 2 段で呼ぶ。`createClaudeDraftRequester` の `AbortSignal.timeout` は呼び出しごとに作られる既存の挙動のまま。
- [ ] 4.3 実行: `npx jest ... -- firebase-functions/src/bugReport/__tests__/createIssueDrafter.test.ts firebase-functions/src/bugReport/__tests__/createClaudeDraftRequester.test.ts` が通る。

## Task 5: 配線（サーバー）— 型・processBugReport・handleBugReport・トリガ

気をつける知見: L-060（任意の deps の既定値で配線漏れを見逃さない。組み立て役のテストを書く）、L-052（タイムアウトの合計）、L-001、L-616。

ファイル:

- 変更 `firebase-functions/src/bugReport/types.ts`、`processBugReport.ts`、`handleBugReport.ts`、`onBugReportCreated.ts`、`constants.ts`
- 変更 `firebase-functions/src/bugReport/__tests__/processBugReport.test.ts`、`handleBugReport.test.ts`（必要なら `handleBugReportDraft.test.ts`）、`onBugReportCreated.test.ts`、`types.test.ts`

- [ ] 5.1 `processBugReport.test.ts` に追加する（Red）。
  - `resolveImages` がある → ロック取得（`claimProcessing` が `true`）の後に呼ばれる。結果の `images` が `draftIssue(report, images)` の第 2 引数に渡る。`createIssue` に渡る内容（`content.body`）に `## スクリーンショット` と URL が含まれる。
  - `resolveImages` の結果の `skippedCount` が本文の注記に反映される。
  - `claimProcessing` が `false`・`shouldSkipProcessing` が true の報告 → `resolveImages` は呼ばれない。
  - `resolveImages` が例外 → 例外にならず起票され、本文に `（添付された画像 N 枚を取得できなかったため…）`（N は報告の `images` 配列の先頭 3 件の数。`images` が配列でなければ節なし）。
  - `resolveImages` が無い（deps に無い）→ 従来どおり（画像の節なし）。`draftIssue` には空配列が渡る（既存の `expect(deps.draftIssue).toHaveBeenCalledWith(pendingReport)` も第 2 引数 `[]` を含む形に更新する）。
  - `draftIssue` が画像つきで null → 画像の節は本文に載ったまま従来の内容で起票される。
- [ ] 5.2 `processBugReport.ts` と `types.ts` を実装する（Green）。`ProcessBugReportDeps` に `resolveImages?`、`draftIssue` の型を `(report, images: ResolvedImage[])` に変える。`types.ts` の `BugReport`（サーバー側のドキュメント型）に `images?: BugReportImageRef[]`（`{ path: string; contentType: string; size: number }`）を足す。`types.test.ts` があれば型の整合を確認する。
- [ ] 5.3 `handleBugReport.test.ts` に追加する（Red）。`processBugReport` はモック済みなので、渡された deps を取り出して検証する。
  - `createImageStore` を渡す → `processBugReport` に渡された `deps.resolveImages` を呼ぶと、`resolveReportImages` が `uid`（報告ドキュメントの `uid`）・`reportId`・報告の `images`・`createImageStore()` が返した store・`logger` で呼ばれる（`../resolveReportImages` を `jest.mock` して引数を検証）。
  - `createImageStore` が例外（既定バケットが無い）→ `resolveImages` は例外を投げず、`skippedCount` に参照枚数を入れた結果を返し、`logger.warn` が 1 回（文言に報告 ID を含めてよいが、エラー本文は含めない）。
  - `createImageStore` を渡さない → `processBugReport` の deps に `resolveImages` が無い。
  - `draftIssue` が `drafter.draftIssue` と同じ関数（画像を第 2 引数に受ける）。
- [ ] 5.4 `handleBugReport.ts` を実装する（Green）。`HandleBugReportDeps` に `createImageStore?: () => ImageStore` を足す。`createImageStore()` の呼び出しは `resolveImages` の内側の `try` に置く。
- [ ] 5.5 `onBugReportCreated.test.ts` に追加する（Red）。既存のテストの作り（`__endpoint` の検証・`handleBugReport` のモック）に合わせて、次を検証する。
  - `EndpointLike` に `availableMemoryMb?: number` を足し、`onDocumentCreated` の `__endpoint` が `timeoutSeconds: 180`・`availableMemoryMb: 512`（`memory: "512MiB"` の変換結果）・`secretEnvironmentVariables` に `githubToken` と `anthropicApiKey` を持つこと。
  - `handleBugReport` に渡る deps に `createImageStore` があり、呼ぶと `getStorage().bucket()`（`firebase-admin/storage` をモック）の結果から作った `ImageStore`（`createStorageImageStore` をモックして呼ばれたことを検証）を返す。
- [ ] 5.6 `onBugReportCreated.ts` と `constants.ts` を実装する（Green）。`import { getStorage } from "firebase-admin/storage"` を足し、`createImageStore: () => createStorageImageStore(getStorage().bucket())` を渡す。`timeoutSeconds` のコメントを「Claude 最大 45 秒（画像つきの失敗後に画像なしで再整形して最大 45 秒）+ GitHub 最大 30 秒 + 画像の取得・Firestore の読み書きが収まる長さ」に直す。`constants.ts` の `PROCESSING_LOCK_TIMEOUT_MS` のコメントの「120 秒」を「180 秒」に直す（値は 5 分のまま）。`BugReportContentSource` / `ProcessableBugReport` が `images` を含むことで `handleBugReport` の `latestSnap.data() as ProcessableBugReport` がそのまま画像の参照を運ぶ。
- [ ] 5.7 実行: `npx jest ... -- firebase-functions/src/bugReport` と `npm run typecheck:functions` が通る。

## Task 6: クライアントの Storage の取得

気をつける知見: L-056（初期化の失敗を握りつぶさず、明示のエラー）、L-060。

ファイル:

- 変更 `src/lib/firebase-modules/state.ts`、`initialize.ts`
- 新規 `src/lib/firebase-modules/storage.ts`
- 変更 `src/lib/firebase.ts`、`src/lib/locales/ja.json`
- 新規 `src/lib/firebase-modules/__tests__/storage.test.ts`
- 変更 `src/lib/firebase-modules/__tests__/initialize.test.ts`、`firestore.test.ts`、`auth.test.ts`、`messaging.test.ts`、`src/lib/__tests__/firebase.test.ts`

- [ ] 6.1 `storage.test.ts` を先に書く（Red）。`firestore.test.ts` と同じ作り。状態に `storage` がある → それを返す。無い → `FirebaseError` を投げ、`code` が `"storage-not-available"`、メッセージが `texts.firebaseStorage.notInitialized`。
- [ ] 6.2 `initialize.test.ts` に、`isFirebaseConfigured` かつブラウザ環境のとき `getStorage(app)` が呼ばれ `setFirebaseState({ storage })` されること、サーバー環境（`window` が無い）では呼ばれないことを足す（Red）。また `firestore.test.ts`、`auth.test.ts`、`messaging.test.ts` の `mockGetFirebaseState.mockReturnValue(...)` に `storage: null` を足し、`src/lib/__tests__/firebase.test.ts` の `mockFirebaseSdk()` に `jest.doMock("firebase/storage", () => ({ getStorage: jest.fn() }))` と未設定時の `getStorageInstance` の検証を足す。
- [ ] 6.3 実装する（Green）。`state.ts` の `FirebaseState` に `storage: FirebaseStorage | null`（初期値 `null`）、`initialize.ts` の `window` がある分岐に `storage: getStorage(app)`、`storage.ts`、`src/lib/firebase.ts` の `getStorageInstance` の再エクスポート、`src/lib/locales/ja.json` の `firebaseStorage.notInitialized`（既存の `firebaseFirestore.notInitialized` と同じ書き方の文言）。
- [ ] 6.4 実行: `npx jest ... -- src/lib/firebase-modules src/lib/__tests__/firebase.test.ts` が通る。

## Task 7: クライアントの画像の選択・アップロード・保存

気をつける知見: L-001/L-038/L-003/L-004（成否を返す・途中失敗の後始末・自分がアップロードしたパスだけ消す）、L-023/L-018（アップロード前にも枚数・形式・サイズを検証）、L-025（デコードしない）、L-056、L-181/L-184（ファイル名の乱数を注入）、L-616。

ファイル:

- 変更 `src/features/bug-report/constants.ts`、`types.ts`、`helpers.ts`、`api.ts`、`index.ts`
- 新規 `src/features/bug-report/imageSelection.ts`、`imageUpload.ts`
- 新規 `src/features/bug-report/__tests__/imageSelection.test.ts`、`imageUpload.test.ts`
- 変更 `src/features/bug-report/__tests__/helpers.test.ts`、`api.test.ts`

- [ ] 7.1 `imageSelection.test.ts` を先に書く（Red）。`new File([new Uint8Array(n)], "a.png", { type: "image/png" })` で作る（`n` は小さくし、5MB の検証にはサイズを持つ偽のファイル `Object.defineProperty(file, "size", { value })` を使う）。
  - 許可形式 4 種を受け付ける。`image/svg+xml`・`image/bmp`・`application/pdf`・`type` が空 → 取り除かれ `unsupportedType`。
  - ちょうど 5MB は受け付け、5MB + 1 は取り除かれ `tooLarge`。
  - 現在 2 枚に 2 枚を足す → 1 枚目だけ加わり、2 枚目は取り除かれ `tooMany`。現在 3 枚に 1 枚足す → 加わらず `tooMany`。現在の画像は変更されない（順序・内容）。
  - 形式が不正で、かつ枠が余っている場合、不正な画像は枠を消費しない（不正 1 + 有効 3 → 有効 3 が入る。`unsupportedType` のみで `tooMany` は出ない）。
  - エラー種別は重複せず、`unsupportedType` → `tooLarge` → `tooMany` の順で返す。
  - `current` / `incoming` を破壊的に変更しない。
- [ ] 7.2 `imageSelection.ts` と `constants.ts` の定数を実装する（Green）。
- [ ] 7.3 `imageUpload.test.ts` を先に書く（Red）。`firebase/storage` を `jest.mock` し、`ref`・`uploadBytes`・`deleteObject` の偽物で検証する。
  - 2 枚のアップロード: `ref(storage, "bugReports/u1/r1/<createFileId の値>.png")` の形で、`uploadBytes(ref, file, { contentType: file.type })` が呼ばれ、戻り値が `[{ path, contentType, size }]`（`size` は `file.size`）。拡張子は形式から決まる（jpeg → `jpg`）。`createFileId` を注入して固定する（呼び出しごとに別の値を返す偽物）。
  - 既定の `createFileId` が `^[A-Za-z0-9_-]{16,64}$`（base64url）に一致し、呼び出しごとに異なる。
  - 2 枚目の `uploadBytes` が失敗 → 1 枚目のパスだけ `deleteObject` され（2 枚目はアップロードされていないため削除しない）、元の例外が投げられる。削除が失敗しても元の例外が投げられる（削除の例外で上書きされない）。
  - アップロード前の検証: 4 枚・許可外の形式・5MB 超 → `uploadBytes` を 1 回も呼ばずに例外を投げる（`imageSelection` とは別の防御）。
  - `deleteBugReportImages(storage, paths)`: すべてのパスに対して `deleteObject` を呼び、一部が失敗しても例外を投げず残りも削除する。空配列では何も呼ばない。
- [ ] 7.4 `imageUpload.ts` を実装する（Green）。
- [ ] 7.5 `helpers.test.ts` / `api.test.ts` を変更・追加する（Red）。
  - `buildBugReportPayload(input, uid, meta, images)`: `images` が 1 件以上 → `payload.images` が同じ配列。未指定・空配列 → `payload` に `images` キーが存在しない（`not.toHaveProperty("images")`）。
  - `api.test.ts` は `addDoc` から `doc(collection(...))` で採番した参照に対する `setDoc` に変わる。既存の検証（`uid`・`status: "pending"`・`createdAt` / `updatedAt` が `serverTimestamp()`・サーバー専用フィールドを書かない・タイトル / 再現手順の既定値）を、`setDoc` の第 2 引数に対して維持する。戻り値は採番した ID。
  - 画像なし → `getStorageInstance` が呼ばれず、`uploadBytes` も呼ばれず、`payload` に `images` が無い。
  - 画像あり → `uploadBytes` が先、`setDoc` が後（呼び出し順を `mock.invocationCallOrder` で検証）。`uploadBytes` のパスの報告 ID と `doc` で採番した ID が一致し、`setDoc` の `payload.images` がアップロード結果と一致。
  - アップロードが失敗 → `setDoc` は呼ばれず、例外が伝わる。
  - `setDoc` が失敗 → アップロード済みのパスが `deleteObject` され、元の例外が伝わる。`deleteObject` が失敗しても元の例外が伝わる。
- [ ] 7.6 `types.ts`・`helpers.ts`・`api.ts`・`index.ts` を実装する（Green）。`BugReportImage` 型を `types.ts` に足し、`BugReportCreatePayload` に `images?: BugReportImage[]`、`BugReport` に `images?: BugReportImage[]` を足す。`index.ts` から `selectBugReportImages`・`uploadBugReportImages`・`deleteBugReportImages`・型（`BugReportImage`、`BugReportImageError`）を再エクスポートする。`index.test.ts` があれば再エクスポートの検証を足す。
- [ ] 7.7 実行: `npx jest ... -- src/features/bug-report` が通る。

## Task 8: ルールと設定（Firestore・Storage）

気をつける知見: L-021（`hasOnly` を閉じたまま足す）、L-023、L-018（ルールの正規表現とコードの定数を同じ意味に保つ）、L-616。

ファイル:

- 新規 `storage.rules`
- 変更 `firebase.json`、`firestore.rules`
- 新規 `src/features/bug-report/__tests__/rulesConsistency.test.ts`（`/** @jest-environment node */`）

- [ ] 8.1 `rulesConsistency.test.ts` を先に書く（Red）。`storage.rules` と `firestore.rules` と `firebase.json` をファイルとして読み、次を確認する。
  - `storage.rules`: `request.resource.size <= 5 * 1024 * 1024` を含み、その数が `MAX_BUG_REPORT_IMAGE_BYTES` と等しい（定数から文字列を組み立てて `toContain`）。`request.resource.contentType.matches('image/(png|jpeg|webp|gif)')` を含み、括弧の中身が `BUG_REPORT_IMAGE_EXTENSIONS` のキーの形式部分（`png|jpeg|webp|gif`）と一致する。ファイル名の正規表現が `^[A-Za-z0-9_-]{1,64}\\.(png|jpg|webp|gif)$` で、括弧の中身が `BUG_REPORT_IMAGE_EXTENSIONS` の値から作った文字列と一致する。`allow read, update: if false` と、`bugReports/{uid}/{reportId}/{fileName}` のパス、`request.auth.uid == uid`、末尾の `match /{allPaths=**}` の全拒否を含む。
  - `firestore.rules`: `bugReports` の `create` に `images` の検証（`images is list` と `images.size() <= 3`、数は `MAX_BUG_REPORT_IMAGES` と等しい）があり、`hasOnly` の配列に `"images"` がある。`allow update, delete: if false` が残っている。
  - `firebase.json`: `storage.rules` が `"storage"` の `"rules"` に指定されている。
  - サーバーの定数（`firebase-functions/src/bugReport/imageFormats.ts`）の `MAX_IMAGE_BYTES` / `MAX_REPORT_IMAGES` / `IMAGE_FILE_NAME_PATTERN.source` が、クライアントの定数と同じ値・同じ意味であること（`IMAGE_FILE_NAME_PATTERN.source` と、ルールの文字列の `\\.` を `\.` に戻したものが一致）。
- [ ] 8.2 `storage.rules` を設計書 R7 のとおり新規作成する。`firebase.json` に `"storage": { "rules": "storage.rules" }` を足す（既存のキーの順序・書式は崩さない）。
- [ ] 8.3 `firestore.rules` の `bugReports` の `create` に、`title` / `stepsToReproduce` と同じ書き方で `(!('images' in request.resource.data) || (request.resource.data.images is list && request.resource.data.images.size() <= 3))` を足し、`hasOnly` に `"images"` を加える。
- [ ] 8.4 実行: `npx jest ... -- src/features/bug-report/__tests__/rulesConsistency.test.ts` が通る。Firebase のルールのエミュレータによる自動テストはこのリポジトリに無い。手動の確認項目は Task 10 で `docs/03-testing/test-matrix.md` に足す。

## Task 9: クライアントのフォーム UI

気をつける知見: L-467（レンダー中に副作用を実行しない。`createObjectURL` は effect 内）、L-108（アンマウント時の解放）、L-001（送信の成否で画像の選択を扱う）、L-058（無効化したボタンは実際に押せない）、L-057（入力の拒否は理由を表示する）、L-060（組み立て役 `BugReportPage` の配線をテストする）、L-616。

ファイル:

- 新規 `src/features/bug-report/hooks/useBugReportImages.ts`、`components/BugReportImagePicker.tsx`
- 変更 `src/features/bug-report/hooks/useBugReportForm.ts`、`components/BugReportForm.tsx`、`components/BugReportPage.tsx`、`locales/ja.json`
- 新規 `src/features/bug-report/__tests__/useBugReportImages.test.tsx`、`BugReportImagePicker.test.tsx`
- 変更 `src/features/bug-report/__tests__/useBugReportForm.test.tsx`、`BugReportForm.test.tsx`、`BugReportPage.test.tsx`

- [ ] 9.1 `useBugReportImages.test.tsx` を先に書く（Red）。`URL.createObjectURL` / `URL.revokeObjectURL` は jsdom で未定義のため `URL.createObjectURL = jest.fn(...)` / `URL.revokeObjectURL = jest.fn()`（呼び出しごとに別の文字列を返す）で差し替える。
  - `addImages` で加わった画像が `images` に入り、`previews` が同じ数・同じ順序で `createObjectURL` の値になる。上限超過・不正な形式は `errors` に入り、`images` には加わらない。次の `addImages` の呼び出しで `errors` は新しい結果に置き換わる（古いエラーが残らない）。
  - `removeImage(index)` → その画像だけが外れる。外れた画像の URL は `revokeObjectURL` される。範囲外の index では何も変わらない。
  - `clearImages()` → `images` / `previews` / `errors` が空になり、すべての URL が `revokeObjectURL` される。
  - アンマウントで、残っているすべての URL が `revokeObjectURL` される。
  - `addImages` を 2 回呼んだとき、古い URL が `revokeObjectURL` され、新しい URL が `createObjectURL` で作られる（URL の漏れが無い。`createObjectURL` の呼び出し回数 − `revokeObjectURL` の呼び出し回数 = 残っている画像数）。
- [ ] 9.2 `useBugReportImages.ts` を実装する（Green）。`previews` は `useEffect`（依存: `images`）の中で作り、cleanup で解放する。`selectBugReportImages` を使う。
- [ ] 9.3 `BugReportImagePicker.test.tsx` を先に書く（Red）。
  - ファイル入力に `accept` が `BUG_REPORT_IMAGE_ACCEPT`、`multiple`、`type="file"`、ラベル（`texts.form.imagesLabel`）で取得できる。説明文（`texts.form.imagesHint`）が表示される。
  - ファイルを選ぶ（`fireEvent.change` / `userEvent.upload`）と `onAdd` に選んだ `File[]` が渡り、入力の `value` が空に戻る（同じファイルを続けて選べる）。
  - 画像があるとき、`alt` が `添付画像 1`… のサムネイルと、`aria-label` が `添付画像 1 を外す` のボタンが画像ごとに出る。ボタンを押すと `onRemove(index)`。
  - 画像が `MAX_BUG_REPORT_IMAGES` 枚のとき、追加の入力が `disabled`。`disabled` プロパティが `true` のときも入力・外すボタンが `disabled`。
  - `errors` ごとの文言（`texts.validation.imageUnsupportedType` / `imageTooLarge` / `imageTooMany`）が `role="alert"` の領域に出る。`errors` が空なら出ない。
- [ ] 9.4 `BugReportImagePicker.tsx` と `locales/ja.json` を実装する（Green）。追加する文言: `form.imagesLabel`（「スクリーンショット（任意）」）、`form.imagesHint`（「PNG・JPEG・WebP・GIF、1 枚 5MB まで、最大 3 枚」）、`form.imageAlt`（`添付画像 {n}`）、`form.imageRemove`（`添付画像 {n} を外す`）、`validation.imageUnsupportedType`、`validation.imageTooLarge`、`validation.imageTooMany`。`form.privacyNote` を設計書 R6 に沿って更新する（添付画像は Issue に載りリポジトリのメンバーが見られること、画像の内容が Anthropic の Claude に渡されることがあること、個人情報が写り込まないよう注意すること）。
- [ ] 9.5 `useBugReportForm.test.tsx` / `BugReportForm.test.tsx` / `BugReportPage.test.tsx` を変更・追加する（Red）。`useBugReportForm.test.tsx` と `BugReportPage.test.tsx` では `URL.createObjectURL = jest.fn(...)` / `URL.revokeObjectURL = jest.fn()` を設定する。
  - `useBugReportForm`: `images`（アタッチメントの状態）を公開する。送信時、`submit(input, images)` の第 2 引数にその時点の画像が渡る（画像なしでは空配列）。成功 → 画像の選択が空になる（`clearImages`）。失敗 → 画像の選択が残る。バリデーションエラー（説明が空）→ 送信されず、画像の選択も残る。既存の `submit` の呼び出し検証（`toHaveBeenCalledWith`）は第 2 引数 `[]` を含むように直す。
  - `BugReportForm`: 画像のアタッチメントのための props を受け取り、`BugReportImagePicker` を表示する。送信中は `disabled` が伝わる。既存の props の検証は変えない。
  - `BugReportPage`（組み立て役）: ファイル入力で画像を選んで説明を入力して送信すると、`submitBugReport` が第 2 引数に選んだ `File` の配列を受け取る（`jest.mock("../api")` の `mockedSubmit.mock.calls[0][1]` を検証。既存の `expect(mockedSubmit).toHaveBeenCalledWith(...)` も第 2 引数 `[]` を含むように更新する）。画像を選んで外してから送信すると、外した画像は渡らない。送信成功後、画像のサムネイルが消える。
- [ ] 9.6 `useBugReportForm.ts`・`BugReportForm.tsx`・`BugReportPage.tsx` を実装する（Green）。`useBugReportForm` の `submit` オプションの型は `(input: { description: string; stepsToReproduce: string }, images: File[]) => Promise<string>`。画像の状態は `useBugReportImages` に任せ、フォームには `imageAttachments`（`useBugReportImages` の戻り値のうち表示に必要なもの）を 1 つのオブジェクトとして渡す。
- [ ] 9.7 実行: `npx jest ... -- src/features/bug-report` が通る。

## Task 10: ドキュメント

ファイル:

- 変更 `docs/02-development/bug-report-feature-plan.md`、`docs/02-development/bug-report-secrets-config.md`
- 変更 `docs/04-reference/features.md`、`docs/03-testing/test-matrix.md`
- 必要なら変更 `docs/02-development/architecture.md`（Storage を使うことの記載）、`README.md`

- [ ] 10.1 `bug-report-feature-plan.md`: データモデルに `images?: { path, contentType, size }[]`、パイプラインに「画像のアップロード → 報告の作成 → Functions が画像を検証・取得 → Claude に画像を渡す → Issue 本文に埋め込む」を追記する。進捗の記載（実装した範囲と、未実装の範囲）を書く。
- [ ] 10.2 `bug-report-secrets-config.md`: Storage の有効化手順（Blaze プランが必要。コンソールで既定バケットを作成。`firebase deploy --only storage,firestore:rules`）、Functions のサービスアカウントが既定バケットを読み書きできること、ダウンロードトークン URL の性質（URL を知る人は閲覧できる・推測できない）、GitHub PAT の権限は変えないことを書く。
- [ ] 10.3 `features.md` の「不具合報告」節、データストレージ構造（`bugReports` の `images`、Storage の `bugReports/{uid}/{reportId}/`）、外部連携（Firebase Storage）を更新する。`test-matrix.md` の 23 章に項目を足す: 画像の追加・取り外し・プレビュー、形式 / サイズ / 枚数の拒否と理由の表示、画像つきの送信と Issue への埋め込み、Claude への画像の受け渡し（Issue の説明に反映される）、画像の取得に失敗したときの注記、ルールの手動確認（設計書 5.1 の項目）。
- [ ] 10.4 既知の制約を書く: 起票後も画像は Storage に残る・本人は画像を削除でき削除すると Issue のリンクが切れる・乱用対策は Phase 4・`setDoc` が失敗に見えて成功していた場合は画像が消えうる。
- [ ] 10.5 文書内の言い回しを `grep` で確認する（`画像` の記述が旧仕様「添付不可」と矛盾しない）。

## Task 11: 全体の検証

- [ ] 11.1 `npx prettier --check` を、変更・追加したすべてのファイル（git で一覧を取る）に対して実行し、通らないものは `--write` で整形する（触っていないファイルは整形しない）。
- [ ] 11.2 `npx eslint src firebase-functions/src e2e tools`、`npm run typecheck`、`npm run typecheck:functions` が通る。
- [ ] 11.3 テスト全体: `npx jest --testPathIgnorePatterns=/node_modules/ /firebase-functions/lib/ /e2e/` が通る（`.worktrees` 配下のため、`npm test` ではなくこの形で実行する）。
- [ ] 11.4 `npm run build`（ネットワークが必要なため、サンドボックス外で実行する）が通る。
- [ ] 11.5 `git status` で意図しないファイルが無いこと（`node_modules` のシンボリックリンク、コピーした `AGENTS.md` / `CLAUDE.md` はコミットしない）を確認する。
- [ ] 11.6 ロードマップ（`state.json` に `roadmap` は無い）の更新は不要。
