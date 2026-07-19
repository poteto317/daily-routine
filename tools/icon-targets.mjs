import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// iconPipelineBuilders.jsはCommonJS（module.exports）のため、
// named importではなくdefault importしてから分割代入する。
// named importはNodeのcjs-module-lexerによる静的解析に依存しており、
// module.exportsの記述方法を変えた際に検出できなくなる可能性がある。
import iconPipelineBuildersModule from "./iconPipelineBuilders.js";

const { buildIconPipeline } = iconPipelineBuildersModule;

export const ICON_TARGETS = [
  { file: "icon-48.png", size: 48 },
  { file: "icon-72.png", size: 72 },
  { file: "icon-96.png", size: 96 },
  { file: "icon-128.png", size: 128 },
  { file: "icon-144.png", size: 144 },
  { file: "icon-152.png", size: 152 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-384.png", size: 384 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-192.png", size: 192, maskable: true },
  { file: "icon-maskable-384.png", size: 384, maskable: true },
  { file: "icon-maskable-512.png", size: 512, maskable: true },
  { file: "apple-touch-icon.png", size: 180, flatten: true },
];

export { buildIconPipeline };

export const readIconSvg = (workspaceRoot) => {
  const svgPath = join(workspaceRoot, "public", "icon.svg");

  if (!existsSync(svgPath)) {
    throw new Error(
      `アイコン生成元のSVGが見つかりません: ${svgPath}\nリポジトリのルートディレクトリで実行しているか確認してください。`,
    );
  }

  return readFileSync(svgPath);
};
