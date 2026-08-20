/**
 * Service Worker をどのスコープに置くかを決め、登録と取得をまとめて扱う。
 *
 * 登録と取得を分けないのは、どちらも「どのスコープに置いたか」という同じ
 * 知識に依存するため。離すとスコープ定数だけが 2 ファイルにまたがり、
 * 置き場所を変えたときに片方だけ直す事故が起きる。
 */

/** アプリ本体（オフライン用のキャッシュと通知スケジューラ）の Service Worker */
export const APP_SHELL_SW_PATH = "/sw.js";

/** FCM の受信専用 Service Worker */
export const FCM_SW_PATH = "/firebase-messaging-sw.js";

/**
 * アプリ本体の SW と併せて登録するときに、FCM の SW を置くスコープ。
 *
 * 同じスコープに 2 つ登録すると後から登録した方で置き換わり、片方が消える。
 * 画面を制御するのはアプリ本体の SW にしたいので、FCM は Firebase の既定と
 * 同じ専用スコープへ寄せる。プッシュの受信はスコープに依らず動く。
 */
export const FCM_SW_SCOPE = "/firebase-cloud-messaging-push-scope";

type RegisterOptions = {
  /** アプリ本体の SW を登録するか。開発中は生成されないため false にする */
  enableAppShell: boolean;
};

/**
 * Service Worker を使える環境か。
 *
 * 判定はここに一本化する。呼び出し側が別の条件で判断すると、片方が
 * 「使えない」と見なした後にもう片方が navigator.serviceWorker へ触れて
 * 例外になる。
 */
export const isServiceWorkerSupported = (): boolean =>
  typeof navigator !== "undefined" && Boolean(navigator.serviceWorker);

/**
 * Service Worker をまとめて登録する。呼び出すたびに渡した指定で登録する。
 *
 * スコープを分けるのはアプリ本体の SW も登録するときだけ。片方しか登録
 * しないなら競合しないので、FCM の SW をスコープ / に置いて画面を制御させる。
 * 専用スコープのままだと画面を制御する SW が無くなり、
 * navigator.serviceWorker.ready が解決しないまま残る。
 *
 * Service Worker 非対応の環境では何もしない。呼び出し側のガードが漏れても
 * ここで落とさないため。取得側と同じ扱いにそろえる。
 */
export const registerServiceWorkers = async ({
  enableAppShell,
}: RegisterOptions): Promise<void> => {
  if (!isServiceWorkerSupported()) return;

  if (!enableAppShell) {
    await navigator.serviceWorker.register(FCM_SW_PATH, { scope: "/" });
    return;
  }

  await navigator.serviceWorker.register(APP_SHELL_SW_PATH, { scope: "/" });
  await navigator.serviceWorker.register(FCM_SW_PATH, { scope: FCM_SW_SCOPE });
};

/** 登録が読み込んでいるスクリプトの URL。有効化前でも見られるようにする */
const getScriptUrl = (
  registration: ServiceWorkerRegistration,
): string | undefined =>
  (registration.active ?? registration.installing ?? registration.waiting)
    ?.scriptURL;

/**
 * FCM のトークン取得に渡す登録を返す。
 *
 * navigator.serviceWorker.ready は「画面を制御している SW」を返すため、
 * アプリ本体の SW が制御している状態では FCM の登録を取れない。
 *
 * getRegistration(スコープ) も使えない。あれはクライアント URL に対する
 * 最長前方一致で探すため、FCM の登録がまだ無いとスコープ "/" のアプリ本体の
 * 登録が返る。それを FCM のものとして渡すと、Firebase は通知を扱えない
 * Service Worker を掴んだまま動き、プッシュを受け取れなくなる。
 *
 * スコープの正規化（末尾スラッシュの有無）にも左右されないよう、
 * 読み込んでいるスクリプトの URL で特定する。
 *
 * 見つからなければ undefined を返す。Firebase は undefined を受け取ると
 * 自分で既定のスコープへ登録するため、誤った登録を渡すより安全。
 */
export const getFcmServiceWorkerRegistration = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  if (!isServiceWorkerSupported()) return undefined;

  const registrations = await navigator.serviceWorker.getRegistrations();

  return registrations.find((registration) =>
    getScriptUrl(registration)?.endsWith(FCM_SW_PATH),
  );
};

let registerPromise: Promise<void> | null = null;

/**
 * このアプリで必要な Service Worker を一度だけ登録する。
 *
 * アプリ本体の Service Worker は本番ビルドでしか生成されない
 * （next.config.ts の InjectManifest が `!dev` のときだけ動く）。
 * 開発中に登録すると、前回のビルドで残った古い sw.js が存在しないチャンクを
 * 先読みしてしまうため、本番だけで有効にする。
 *
 * 何度呼ばれても登録は 1 回。失敗したら次の呼び出しで再試行できるよう、
 * 保持した Promise を捨てる。
 */
export const registerAppServiceWorkers = async (): Promise<void> => {
  if (!registerPromise) {
    registerPromise = registerServiceWorkers({
      enableAppShell: process.env.NODE_ENV === "production",
    });
  }

  try {
    await registerPromise;
  } catch (error) {
    registerPromise = null;
    throw error;
  }
};
