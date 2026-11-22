import { getAuth } from "firebase-admin/auth";

export const verifySyncUser = async (
  authorization: string | undefined,
): Promise<string | null> => {
  const token = authorization?.match(/^Bearer ([^,\s]+)$/i)?.[1];
  if (!token) return null;

  try {
    const { uid } = await getAuth().verifyIdToken(token);
    return uid || null;
  } catch {
    return null;
  }
};
