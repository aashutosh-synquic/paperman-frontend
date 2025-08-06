import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  await signOut(auth);
};

export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return {
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email || "",
  };
};
