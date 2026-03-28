export const getLineNumber = (source, index) =>
  source.slice(0, index).split("\n").length;

export const rewriteClassToken = (classToken, classReplacements) =>
  classReplacements[classToken] ?? classToken;

export const toRelativePath = (filePath, rootDir) =>
  filePath.replace(`${rootDir}\\`, "").replace(/\\/g, "/");
