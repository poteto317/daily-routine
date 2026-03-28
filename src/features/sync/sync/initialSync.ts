import { doc, getDoc } from "firebase/firestore";
import { getFirestoreInstance, getOrCreateUser } from "@/lib/firebase";
import { getRoutines } from "@/features/routine/storage";
import { downloadFromFirestore } from "./download";
import { uploadToFirestore } from "./upload";

export const initialSync = async (): Promise<void> => {
  try {
    const user = await getOrCreateUser();
    const firestore = getFirestoreInstance();
    const docRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (getRoutines().length === 0) {
        await downloadFromFirestore();
      }
      return;
    }

    if (getRoutines().length > 0) {
      await uploadToFirestore();
    }
  } catch {
    // Initial sync failed
  }
};
