import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const workspaceRoot = process.cwd();
const templatePath = join(
  workspaceRoot,
  "public",
  "firebase-messaging-sw.template.js",
);
const outputPath = join(workspaceRoot, "public", "firebase-messaging-sw.js");

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, "utf8");

  return content.split(/\r?\n/).reduce((accumulator, line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return accumulator;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return accumulator;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^['\"]|['\"]$/g, "");

    accumulator[key] = unquotedValue;
    return accumulator;
  }, {});
};

const env = {
  ...parseEnvFile(join(workspaceRoot, ".env")),
  ...parseEnvFile(join(workspaceRoot, ".env.local")),
  ...process.env,
};

const replacements = {
  __NEXT_PUBLIC_FIREBASE_API_KEY__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  ),
  __NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  ),
  __NEXT_PUBLIC_FIREBASE_PROJECT_ID__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  ),
  __NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  ),
  __NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  ),
  __NEXT_PUBLIC_FIREBASE_APP_ID__: JSON.stringify(
    env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  ),
};

const template = readFileSync(templatePath, "utf8");
const output = Object.entries(replacements).reduce(
  (content, [token, value]) => content.replaceAll(token, value),
  template,
);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, output, "utf8");
