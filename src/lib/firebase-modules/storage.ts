import { FirebaseError } from "./error";
import { getFirebaseState } from "./state";
import texts from "../locales/ja.json";

export const getStorageInstance = () => {
  const { storage } = getFirebaseState();
  if (!storage) {
    throw new FirebaseError(
      texts.firebaseStorage.notInitialized,
      "storage-not-available",
    );
  }

  return storage;
};
