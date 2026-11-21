import { createAuthUser, createAccountRecord } from "./accountService";
import { getDefaultDisplayNameFromEmail } from "./accountUtils";

interface CreateParams {
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
}

export const executeCreateAccount = async ({
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
}: CreateParams): Promise<void> => {
  const createdUser = await createAuthUser(createEmail, createPassword);

  await createAccountRecord(createdUser.uid, {
    email: createEmail,
    displayName:
      createDisplayName || getDefaultDisplayNameFromEmail(createEmail),
    isAdmin: createIsAdmin,
  });
};
