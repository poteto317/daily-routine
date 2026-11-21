import { rejects, strictEqual } from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { deleteApp, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
} from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocsFromServer,
  getFirestore,
  setDoc,
  setLogLevel,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

const projectId = "demo-daily-routine";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const isLoopbackEndpoint = (host) => /^127\.0\.0\.1:\d+$/.test(host ?? "");
if (!isLoopbackEndpoint(authHost) || !isLoopbackEndpoint(firestoreHost)) {
  throw new Error(
    "Run via firebase emulators:exec with both emulators on 127.0.0.1",
  );
}

const requireFunctions = createRequire(
  new URL("../../firebase-functions/package.json", import.meta.url),
);
const { deleteApp: deleteAdminApp, initializeApp: initializeAdminApp } =
  requireFunctions("firebase-admin/app");
const { getFirestore: getAdminFirestore } = requireFunctions(
  "firebase-admin/firestore",
);
const adminApp = initializeAdminApp({ projectId });
const seedDb = getAdminFirestore(adminApp);
const clientApps = [];
const denied = { code: "permission-denied" };
setLogLevel("silent");

const account = (db, uid) => doc(db, "accounts", uid);
const grant = (db, uid) => doc(db, "accountAdminGrants", uid);
const accountList = (db) => getDocsFromServer(collection(db, "accounts"));
const profile = (user) => ({
  email: user.email ?? "",
  displayName: "Test account",
  isAdmin: false,
  isAnonymous: user.isAnonymous,
  isTestUser: false,
  createdAt: "2026-11-22T00:00:00.000Z",
  updatedAt: "2026-11-22T00:00:00.000Z",
});

const client = async (kind = "email") => {
  const id = randomUUID();
  const app = initializeApp({ projectId, apiKey: "demo-key" }, id);
  clientApps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
  const db = getFirestore(app);
  const [host, port] = firestoreHost.split(":");
  connectFirestoreEmulator(db, host, Number(port));
  if (kind === "signed-out") return { db };
  const { user } =
    kind === "anonymous"
      ? await signInAnonymously(auth)
      : await createUserWithEmailAndPassword(
          auth,
          `${id}@example.test`,
          "test-password",
        );
  return { db, user };
};

let authorized;

before(async () => {
  authorized = await client();
  const { uid } = authorized.user;
  await seedDb.collection("accounts").doc(uid).set(profile(authorized.user));
  await seedDb.collection("accountAdminGrants").doc(uid).set({});
});

after(async () => {
  await Promise.all([...clientApps.map(deleteApp), deleteAdminApp(adminApp)]);
});

test("本人登録では明示的な一般権限のみ許可する", async () => {
  const { db, user } = await client();
  const { uid } = user;
  const data = profile(user);
  const { isAdmin, ...withoutRole } = data;
  strictEqual(isAdmin, false);
  await rejects(setDoc(account(db, uid), withoutRole), denied);
  await rejects(
    setDoc(account(db, uid), { ...data, isAdmin: "false" }),
    denied,
  );
  await rejects(setDoc(account(db, uid), { ...data, isAdmin: true }), denied);
  await rejects(setDoc(account(db, "other"), data), denied);
  await rejects(
    setDoc(account(db, uid), { ...data, email: "other@example.test" }),
    denied,
  );
  await rejects(
    setDoc(account(db, uid), { ...data, displayName: { value: "invalid" } }),
    denied,
  );
  await setDoc(account(db, uid), data);
  strictEqual((await getDocFromServer(account(db, uid))).data().isAdmin, false);
  await rejects(updateDoc(account(db, uid), { isAdmin: true }), denied);
  await rejects(setDoc(grant(db, uid), {}), denied);
  const batch = writeBatch(db);
  batch.set(grant(db, uid), {});
  batch.set(grant(db, authorized.user.uid), {});
  await rejects(batch.commit(), denied);
});

test("匿名ユーザーの登録と本人の権限確認は許可する", async () => {
  const { db, user } = await client("anonymous");
  await setDoc(account(db, user.uid), profile(user));
  strictEqual((await getDocFromServer(grant(db, user.uid))).exists(), false);
  await rejects(getDocFromServer(grant(db, authorized.user.uid)), denied);
  await rejects(
    getDocsFromServer(collection(db, "accountAdminGrants")),
    denied,
  );
  const signedOut = await client("signed-out");
  await rejects(getDocFromServer(account(signedOut.db, user.uid)), denied);
  await rejects(getDocFromServer(grant(signedOut.db, user.uid)), denied);
});

test("旧プロフィールの管理者フラグでは権限を得られない", async () => {
  const { db, user } = await client();
  await seedDb
    .collection("accounts")
    .doc(user.uid)
    .set({ ...profile(user), isAdmin: true });
  strictEqual((await getDocFromServer(grant(db, user.uid))).exists(), false);
  await rejects(accountList(db), denied);
  await rejects(getDocFromServer(account(db, authorized.user.uid)), denied);
  await rejects(
    updateDoc(account(db, authorized.user.uid), { displayName: "x" }),
    denied,
  );
  await rejects(deleteDoc(account(db, user.uid)), denied);
  await rejects(setDoc(grant(db, user.uid), {}), denied);
});

test("確認済み管理者からの付与と剥奪がアクセスに反映される", async () => {
  const { db, user } = await client();
  const { db: adminDb, user: adminUser } = authorized;
  await setDoc(account(db, user.uid), profile(user));
  await rejects(setDoc(grant(adminDb, "missing-profile"), {}), denied);
  await rejects(deleteDoc(grant(adminDb, adminUser.uid)), denied);
  await setDoc(grant(adminDb, user.uid), {});
  strictEqual(
    (await getDocFromServer(grant(adminDb, user.uid))).exists(),
    true,
  );
  strictEqual(
    (await accountList(db)).docs.some((entry) => entry.id === adminUser.uid),
    true,
  );
  await deleteDoc(grant(adminDb, user.uid));
  await rejects(accountList(db), denied);
});

test("権限付きプロフィールの作成と削除は一括で処理できる", async () => {
  const { user } = await client();
  const { db } = authorized;
  const creation = writeBatch(db);
  creation.set(account(db, user.uid), profile(user));
  creation.set(grant(db, user.uid), {});
  await creation.commit();
  await rejects(deleteDoc(account(db, user.uid)), denied);
  const deletion = writeBatch(db);
  deletion.delete(account(db, user.uid));
  deletion.delete(grant(db, user.uid));
  await deletion.commit();
  strictEqual((await getDocFromServer(account(db, user.uid))).exists(), false);
  strictEqual((await getDocFromServer(grant(db, user.uid))).exists(), false);
});
