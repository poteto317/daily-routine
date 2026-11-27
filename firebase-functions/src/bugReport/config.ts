import {
  defineInt,
  defineSecret,
  defineString,
} from "firebase-functions/params";

export const scrumBoardCredentials = defineSecret("SCRUM_BOARD_CREDENTIALS");
export const scrumBoardOrigin = defineString("SCRUM_BOARD_ORIGIN", {
  default: "https://scrum-board-ajs5phscdq-an.a.run.app",
});
export const scrumBoardProjectId = defineInt("SCRUM_BOARD_PROJECT_ID", {
  default: 8,
});

export const bugReportUserDailyLimit = defineString(
  "BUG_REPORT_USER_DAILY_LIMIT",
  {
    default: "5",
  },
);
export const bugReportProjectDailyLimit = defineString(
  "BUG_REPORT_PROJECT_DAILY_LIMIT",
  {
    default: "50",
  },
);

/** Claude による起票内容の整形に使う。使わない場合は none を登録する */
export const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");
