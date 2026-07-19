import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
};

type Manifest = {
  icons: ManifestIcon[];
};

const publicDir = join(process.cwd(), "public");
const manifest = JSON.parse(
  readFileSync(join(publicDir, "manifest.json"), "utf-8"),
) as Manifest;

const androidAnyIconSizes = [
  "48x48",
  "72x72",
  "96x96",
  "128x128",
  "144x144",
  "152x152",
  "192x192",
  "384x384",
  "512x512",
] as const;
const androidMaskableIconSizes = ["192x192", "384x384", "512x512"] as const;

describe("manifest.json のアイコン定義", () => {
  it("すべてのアイコンがPNGである（AndroidのSVGラスタライズ非互換を避ける）", () => {
    for (const icon of manifest.icons) {
      expect(icon.type).toBe("image/png");
      expect(icon.src).toMatch(/\.png$/);
    }
  });

  it("purposeを複合指定（any maskable）していない", () => {
    for (const icon of manifest.icons) {
      expect(icon.purpose.trim().split(/\s+/)).toHaveLength(1);
    }
  });

  it("スプラッシュ画面用に512x512のpurpose=anyアイコンがある", () => {
    const splashIcon = manifest.icons.find(
      (icon) => icon.purpose === "any" && icon.sizes === "512x512",
    );

    expect(splashIcon).toBeDefined();
  });

  it("purpose=maskableの専用アイコンがある", () => {
    const maskableIcons = manifest.icons.filter(
      (icon) => icon.purpose === "maskable",
    );

    expect(maskableIcons.length).toBeGreaterThan(0);
  });

  it("Android起動時に選ばれやすいpurpose=anyのPNGアイコンサイズが揃っている", () => {
    for (const size of androidAnyIconSizes) {
      expect(
        manifest.icons.find(
          (icon) => icon.purpose === "any" && icon.sizes === size,
        ),
      ).toBeDefined();
    }
  });

  it("Androidランチャー向けのpurpose=maskableアイコンサイズが揃っている", () => {
    for (const size of androidMaskableIconSizes) {
      expect(
        manifest.icons.find(
          (icon) => icon.purpose === "maskable" && icon.sizes === size,
        ),
      ).toBeDefined();
    }
  });

  it("参照している全アイコンファイルが存在し、実サイズが宣言と一致する", async () => {
    for (const icon of manifest.icons) {
      const filePath = join(publicDir, icon.src.replace(/^\//, ""));
      expect(existsSync(filePath)).toBe(true);

      const [declaredWidth, declaredHeight] = icon.sizes
        .split("x")
        .map(Number);
      const actual = await sharp(readFileSync(filePath)).metadata();
      expect(actual.width).toBe(declaredWidth);
      expect(actual.height).toBe(declaredHeight);
    }
  });
});
