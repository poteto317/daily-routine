import { join } from "node:path";

import { scanTailwindShorthand } from "./shorthand-scan.mjs";
import { toRelativePath } from "./shorthand-utils.mjs";

const rootDir = process.cwd();
const targetDir = join(rootDir, "src");
const shouldFix = process.argv.includes("--fix");

const { issues } = scanTailwindShorthand({
  rootDir,
  targetDir,
  shouldFix,
});

if (issues.length === 0) {
  console.log("No Tailwind shorthand issues found.");
  process.exit(0);
}

console.log(`Found ${issues.length} Tailwind shorthand issue(s):`);
for (const issue of issues) {
  const relativePath = toRelativePath(issue.filePath, rootDir);
  console.log(
    `- ${relativePath}:${issue.line} ${issue.before} -> ${issue.after}`,
  );
}

if (shouldFix) {
  console.log("Tailwind shorthand issues were fixed.");
  process.exit(0);
}

process.exit(1);
