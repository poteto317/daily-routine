import { type User } from "firebase/auth";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAdminLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  signInAsTestUser: () => Promise<void>;
}
