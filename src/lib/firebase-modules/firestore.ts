import { FirebaseError } from "./error";
import { getFirebaseState } from "./state";
import texts from "../locales/ja.json";

export const getFirestoreInstance = () => {
  const { firestore } = getFirebaseState();
  if (!firestore) {
    throw new FirebaseError(
      texts.firebaseFirestore.notInitialized,
      "firestore-not-available",
    );
  }

  return firestore;
};
