/**
 * @jest-environment node
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// ダークモードのコントラストの契約テスト: 半透明の暗い背景を使わないこと。
//
// ダークモードでも背景が明るいカード（CardPanel の dark:bg-slate-100 など）があるため、
// `dark:bg-red-900/20` のような半透明の暗い背景は、重ねる先の色しだいで見た目が大きく変わる。
// 明るいカードに重なると、背景はほぼ明るいまま、文字だけが明るい色（dark:text-red-300 など）になり、
// コントラスト比が 1.2 前後まで落ちて読めなくなる（PR #217 のレビューで見つかった不具合）。
// 背景は不透明にし、その背景の明るさに合わせて文字色を決める。
// - 明るいカードの上: dark:bg-<色>-100 などの明るい背景 + 暗い文字
// - 暗い背景の上: 不透明の dark:bg-<色>-900 など + 明るい文字
//
// 失敗したら、上のとおり背景を不透明にする。背景が必ず暗い場所だけで使う正当な例外は、
// ALLOWED に理由付きで足す。
//
// Jest は Tailwind を通さないため、ここでは src/ の .ts/.tsx（テスト・stories を除く）の
// ソースの文字列を調べる。

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/** 禁止するクラス（半透明の暗い背景）。dark:hover:bg-… などの変種、black、任意値の透明度（/[0.2]）も含む */
const FORBIDDEN_PATTERN =
  /dark:(?:[a-z-]+:)*bg-(?:black|[a-z]+-(?:[6-9]00|950))\/(?:\d+|\[[^\]]+\])/g;

/** 禁止する理由（失敗時のメッセージに出す） */
const FORBIDDEN_REASON =
  "半透明の暗い背景（black・600〜950 番台）は明るいカードに重なると文字が読めなくなる";

/** パターンが検出すべきサンプル */
const SHOULD_MATCH = [
  "dark:hover:bg-red-900/20",
  "dark:focus:bg-red-900/20",
  "dark:bg-gray-700/50",
  "dark:bg-gray-800/50",
  "dark:bg-black/30",
  "dark:bg-red-900/[0.2]",
  "dark:bg-red-950/40",
];

/** パターンが検出してはいけないサンプル */
const SHOULD_NOT_MATCH = [
  "dark:bg-red-900",
  "dark:bg-gray-200",
  "dark:bg-gray-200/50",
  "dark:bg-black",
  "dark:text-gray-700/50",
  "dark:hover:text-red-900/20",
  "bg-red-900/20",
  "dark:border-red-900/20",
];

type AllowedEntry = {
  /** リポジトリのルートからのパス */
  file: string;
  /** 許可するクラス */
  className: string;
  /** 許可する理由（背景が必ず暗い、など） */
  reason: string;
};

/** 正当な例外（今は無い） */
const ALLOWED: AllowedEntry[] = [];

const isTarget = (path: string) =>
  /\.(ts|tsx)$/.test(path) &&
  !/\.(test|spec)\.(ts|tsx)$/.test(path) &&
  !/\.stories\.(ts|tsx)$/.test(path) &&
  !path.split("/").includes("__tests__") &&
  !path.endsWith(".d.ts");

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listSourceFiles(path);
    return isTarget(path) ? [path] : [];
  });

/** 1 つのファイルの本文から、違反を「ファイル:行 クラス — 理由」の文字列で返す */
const findViolationMessages = (file: string, source: string): string[] =>
  source
    .split("\n")
    .flatMap((text, index) =>
      [...text.matchAll(FORBIDDEN_PATTERN)].map((match) => ({
        line: index + 1,
        className: match[0],
      })),
    )
    .filter(
      ({ className }) =>
        !ALLOWED.some(
          (entry) => entry.file === file && entry.className === className,
        ),
    )
    .map(
      ({ line, className }) =>
        `${file}:${line} ${className} — ${FORBIDDEN_REASON}`,
    );

const findAllViolationMessages = (): string[] =>
  listSourceFiles(SRC).flatMap((path) =>
    findViolationMessages(relative(ROOT, path), readFileSync(path, "utf-8")),
  );

describe("ダークモードで半透明の暗い背景を使わない（契約テスト）", () => {
  it("対象のファイルが見つかる（空振りで通らない）", () => {
    expect(listSourceFiles(SRC).length).toBeGreaterThan(0);
  });

  it.each(SHOULD_MATCH)("%s を検出する", (sample) => {
    expect(sample.match(FORBIDDEN_PATTERN)).not.toBeNull();
  });

  it.each(SHOULD_NOT_MATCH)("%s を検出しない", (sample) => {
    expect(sample.match(FORBIDDEN_PATTERN)).toBeNull();
  });

  it("違反のメッセージに、ファイル・行・クラス・理由が出る", () => {
    expect(
      findViolationMessages(
        "src/Sample.tsx",
        'const a = "x";\nconst b = "dark:bg-red-900/20";',
      ),
    ).toEqual([`src/Sample.tsx:2 dark:bg-red-900/20 — ${FORBIDDEN_REASON}`]);
  });

  it("src/ に半透明の暗い背景（black・600〜950 番台。変種・任意値の透明度を含む）が無い", () => {
    expect(findAllViolationMessages()).toEqual([]);
  });

  it("ALLOWED の各項目が、実際にソースに残っている（古い例外を残さない）", () => {
    for (const entry of ALLOWED) {
      expect(readFileSync(join(ROOT, entry.file), "utf-8")).toContain(
        entry.className,
      );
    }
  });
});
