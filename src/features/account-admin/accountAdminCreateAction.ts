import { createAuthUser, createAccountRecord } from "./accountService";
import { getDefaultDisplayNameFromEmail } from "./accountUtils";

interface CreateParams {
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createIsAdmin: boolean;
  hasExistingUser: boolean;
}

export const executeCreateAccount = async ({
  createDisplayName,
  createEmail,
  createIsAdmin,
  createPassword,
  hasExistingUser,
}: CreateParams): Promise<{ needsPageReload: boolean }> => {
  const createdUser = await createAuthUser(createEmail, createPassword);

  await createAccountRecord(createdUser.uid, {
    email: createEmail,
    password: createPassword,
    displayName: createDisplayName || getDefaultDisplayNameFromEmail(createEmail),
    isAdmin: createIsAdmin,
  });

  return { needsPageReload: hasExistingUser };
};
