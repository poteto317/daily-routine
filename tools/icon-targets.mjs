import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const ICON_TARGETS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180, flatten: true },
];

export const buildIconPipeline = (sharp, svgBuffer, target) => {
  let pipeline = sharp(svgBuffer).resize(target.size, target.size);
  if (target.flatten) {
    // iOSのapple-touch-iconはアルファチャンネルを持たない画像が推奨されるため、
    // 背景色で不透明化してからPNGにエンコードする
    pipeline = pipeline.flatten({ background: "#2563eb" });
  }
  return pipeline;
};

export const readIconSvg = (workspaceRoot) => {
  const svgPath = join(workspaceRoot, "public", "icon.svg");

  if (!existsSync(svgPath)) {
    throw new Error(
      `アイコン生成元のSVGが見つかりません: ${svgPath}\nリポジトリのルートディレクトリで実行しているか確認してください。`,
    );
  }

  return readFileSync(svgPath);
};
