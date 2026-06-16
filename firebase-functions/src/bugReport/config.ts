import { defineSecret, defineString } from "firebase-functions/params";

export const githubToken = defineSecret("GITHUB_TOKEN");
export const githubRepo = defineString("GITHUB_REPO", {
  default: "poteto317/daily-routine",
});
