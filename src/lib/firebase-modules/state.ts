import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { Messaging } from "firebase/messaging";

type FirebaseState = {
  app: FirebaseApp | null;
  messaging: Messaging | null;
  firestore: Firestore | null;
  auth: Auth | null;
};

const firebaseState: FirebaseState = {
  app: null,
  messaging: null,
  firestore: null,
  auth: null,
};

export const setFirebaseState = (nextState: Partial<FirebaseState>) => {
  Object.assign(firebaseState, nextState);
};

export const getFirebaseState = (): FirebaseState => firebaseState;
