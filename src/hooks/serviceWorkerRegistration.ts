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
 * FCM の Service Worker を置くスコープ。
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

/** Service Worker をまとめて登録する。呼び出すたびに渡した指定で登録する */
export const registerServiceWorkers = async ({
  enableAppShell,
}: RegisterOptions): Promise<void> => {
  if (enableAppShell) {
    await navigator.serviceWorker.register(APP_SHELL_SW_PATH, { scope: "/" });
  }

  await navigator.serviceWorker.register(FCM_SW_PATH, { scope: FCM_SW_SCOPE });
};

/**
 * FCM のトークン取得に渡す登録を返す。
 *
 * navigator.serviceWorker.ready は「画面を制御している SW」を返すため、
 * アプリ本体の SW が制御している状態では FCM の登録を取れない。
 * スコープを指定して明示的に引く。
 */
export const getFcmServiceWorkerRegistration = async (): Promise<
  ServiceWorkerRegistration | undefined
> => {
  return navigator.serviceWorker.getRegistration(FCM_SW_SCOPE);
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
