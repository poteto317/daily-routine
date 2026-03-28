import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

import {
  classAttributeRegex,
  classReplacements,
  targetExtensions,
} from "./shorthand-config.mjs";
import { getLineNumber, rewriteClassToken } from "./shorthand-utils.mjs";

const collectTargetFiles = (dirPath, files) => {
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const absolutePath = join(dirPath, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      collectTargetFiles(absolutePath, files);
      continue;
    }

    if (targetExtensions.has(extname(absolutePath))) {
      files.push(absolutePath);
    }
  }
};

export const scanTailwindShorthand = ({ rootDir, targetDir, shouldFix }) => {
  const files = [];
  const issues = [];

  collectTargetFiles(targetDir, files);

  for (const filePath of files) {
    const source = readFileSync(filePath, "utf-8");
    let nextSource = source;
    let modified = false;

    nextSource = nextSource.replace(
      classAttributeRegex,
      (fullMatch, open, classList, close, index) => {
        const classTokens = classList.split(/\s+/).filter(Boolean);
        if (classTokens.length === 0) return fullMatch;

        const replacedTokens = classTokens.map((token) =>
          rewriteClassToken(token, classReplacements),
        );

        classTokens.forEach((token, tokenIndex) => {
          const replacement = replacedTokens[tokenIndex];
          if (token !== replacement) {
            issues.push({
              filePath,
              line: getLineNumber(source, index),
              before: token,
              after: replacement,
            });
          }
        });

        if (shouldFix && classTokens.join(" ") !== replacedTokens.join(" ")) {
          modified = true;
          return `${open}${replacedTokens.join(" ")}${close}`;
        }

        return fullMatch;
      },
    );

    if (shouldFix && modified) {
      writeFileSync(filePath, nextSource, "utf-8");
    }
  }

  return { issues, rootDir };
};
