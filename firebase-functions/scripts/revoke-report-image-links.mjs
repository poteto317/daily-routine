import { parseArgs } from "node:util";
import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import imageFormats from "../lib/bugReport/imageFormats.js";
import imageStore from "../lib/bugReport/storageImageStore.js";

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: "string" },
      bucket: { type: "string" },
      apply: { type: "boolean", default: false },
    },
  });
  if (!values.project || !values.bucket) {
    console.error(
      "Usage: node scripts/revoke-report-image-links.mjs --project PROJECT_ID --bucket BUCKET [--apply]",
    );
    process.exitCode = 1;
    return;
  }

  const app = initializeApp({
    projectId: values.project,
    storageBucket: values.bucket,
  });
  const bucket = getStorage(app).bucket();
  const totals = {
    mode: values.apply ? "apply" : "dry-run",
    scanned: 0,
    needingUpdate: 0,
    failed: 0,
  };

  for (const root of [
    "bugReports",
    imageFormats.MANAGED_REPORT_IMAGES_PREFIX,
  ]) {
    for await (const file of bucket.getFilesStream({ prefix: `${root}/` })) {
      totals.scanned += 1;
      try {
        const result = await imageStore.ensurePrivateReportImage(
          file,
          values.apply,
        );
        if (result.needsUpdate) totals.needingUpdate += 1;
      } catch (error) {
        if (error?.code !== 404) totals.failed += 1;
      }
    }
  }

  console.log(JSON.stringify(totals));
  if (totals.failed) process.exitCode = 1;
}

main().catch(() => {
  console.error("Unable to complete the report image scan");
  process.exitCode = 1;
});
