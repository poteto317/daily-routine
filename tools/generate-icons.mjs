import { join } from "node:path";
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import {
  ICON_TARGETS,
  buildIconPipeline,
  readIconSvg,
} from "./icon-targets.mjs";

const workspaceRoot = process.cwd();
const svgBuffer = readIconSvg(workspaceRoot);

for (const target of ICON_TARGETS) {
  const outputPath = join(workspaceRoot, "public", target.file);
  const png = await buildIconPipeline(sharp, svgBuffer, target)
    .png()
    .toBuffer();
  writeFileSync(outputPath, png);
  console.log(`Generated ${target.file} (${target.size}x${target.size})`);
}
