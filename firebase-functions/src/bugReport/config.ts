import { defineSecret, defineString } from "firebase-functions/params";

export const githubToken = defineSecret("GITHUB_TOKEN");
/** Claude による Issue 整形の API キー。使わない場合は none を登録する */
export const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
export const githubRepo = defineString("GITHUB_REPO", {
  default: "poteto317/daily-routine",
});
