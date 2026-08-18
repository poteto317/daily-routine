// トークンの直後にセミコロンが続く形も受ける。テンプレートは prettier で
// 整形されるため、トークンが式とみなされてセミコロンを付けられる。
const JST_HELPERS_TOKEN = /__JST_DATE_HELPERS__;?/g;

/**
 * FCM の service worker を組み立てる。
 *
 * JST の日付処理は src/service-worker/custom-sw/jstDate.js を唯一の実装とし、
 * ここへ差し込む。テンプレート側にも同じ処理を書くと、片方だけ直したときに
 * custom SW と FCM SW で通知の重複防止キーが食い違う。
 *
 * 差し込む際に export を落とすのは、FCM の service worker がモジュールでは
 * なく素のスクリプトとして読まれるため。
 */
export const buildFirebaseMessagingSw = ({
  template,
  jstHelpers,
  replacements,
}) => {
  const inlinedHelpers = jstHelpers.replace(/^export /gm, "").trim();
  const withHelpers = template.replace(JST_HELPERS_TOKEN, inlinedHelpers);

  return Object.entries(replacements).reduce(
    (content, [token, value]) => content.replaceAll(token, value),
    withHelpers,
  );
};
