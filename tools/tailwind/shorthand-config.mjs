export const targetExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mdx"]);

export const classReplacements = {
  "flex-grow": "grow",
  "flex-grow-0": "grow-0",
  "flex-shrink": "shrink",
  "flex-shrink-0": "shrink-0",
};

export const classAttributeRegex = /(className\s*=\s*["'`])([^"'`]*)(["'`])/g;
