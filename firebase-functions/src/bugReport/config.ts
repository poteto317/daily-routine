import { defineInt, defineSecret, defineString } from "firebase-functions/params";

export const scrumBoardCredentials = defineSecret("SCRUM_BOARD_CREDENTIALS");
export const scrumBoardOrigin = defineString("SCRUM_BOARD_ORIGIN", {
  default: "https://scrum-board-jkcejsb6ka-an.a.run.app",
});
export const scrumBoardProjectId = defineInt("SCRUM_BOARD_PROJECT_ID", {
  default: 8,
});

/** Claude による起票内容の整形に使う。使わない場合は none を登録する */
export const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
