"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "../lib/firebaseClient";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isSeller: boolean;
  /** "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null — null means user hasn't picked a role yet */
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null;
  /** true once user has picked a role */
  hasRole: boolean;
  /** Returns the current Firebase ID token (refreshed if expired) */
  getIdToken: () => Promise<string>;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Save user profile to Firestore ─────────────────────────────────────────
async function saveUserToFirestore(firebaseUser: FirebaseUser, extraData?: { isSeller?: boolean }) {
  if (!db) return;

  try {
    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Create new user document
      await setDoc(ref, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isSeller: extraData?.isSeller ?? false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Update last login
      await setDoc(ref, {
        updatedAt: serverTimestamp(),
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      }, { merge: true });
    }
  } catch (error) {
    console.error("Failed to sync user with Firestore (possibly offline or blocked by adblocker):", error);
    // We deliberately swallow this error so the sign-up/sign-in process does not fail
    // simply because Firestore could not be reached. 
  }
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // ── Block unverified users from being set in state ──
        if (!firebaseUser.emailVerified) {
          setUser(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        // ── Role resolution ──────────────────────────────────────────────
        // Priority: Firestore (live) → localStorage (cached) → null (new user)
        let isSeller = false;
        let role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null = null;
        const cacheKey = `earner_role_${firebaseUser.uid}`;

        if (firebaseUser) {
          try {
            const token = await firebaseUser.getIdToken();
            const res = await fetch("/api/users/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              role = data.role as "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN";
              isSeller = role === "SELLER";
              localStorage.setItem(cacheKey, role ?? "");
            } else if (res.status === 404) {
              // User exists in Firebase but not in Postgres (e.g. database reset)
              role = null;
              isSeller = false;
              localStorage.removeItem(cacheKey);
            } else {
              throw new Error("Failed to fetch user from Postgres");
            }
          } catch {
            // Offline or error — fall back to cached role
            const cached = localStorage.getItem(cacheKey) as "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null;
            role = cached;
            isSeller = cached === "SELLER";
          }
        } else {
          // Should not reach here if firebaseUser is truthy, but keeping structure
          const cached = localStorage.getItem(cacheKey) as "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null;
          role = cached;
          isSeller = cached === "SELLER";
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isSeller,
          role,
          hasRole: role === "BUYER" || role === "SELLER" || role === "ADMIN" || role === "SUPER_ADMIN",
          getIdToken: (forceRefresh?: boolean) => firebaseUser.getIdToken(forceRefresh),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Sign Up ────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) {
      setError("Firebase not configured. Add your API key to .env.local to enable auth.");
      return;
    }
    try {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name
      await updateProfile(cred.user, { displayName: name });
      
      // Send verification email (welcome message)
      try {
        await sendEmailVerification(cred.user);
      } catch (emailErr) {
        console.error("Failed to send verification email:", emailErr);
      }

      // Save to Firestore
      await saveUserToFirestore({ ...cred.user, displayName: name });

      // Enforce email verification by signing them out immediately
      await firebaseSignOut(auth);
      setUser(null);
      throw new Error("auth/verification-required");
    } catch (e: any) {
      if (e.message === "auth/verification-required") {
        throw e;
      }
      
      let errorMessage = "Sign up failed. Please try again.";
      if (e.code === "auth/email-already-in-use" || e.message?.includes("email-already-in-use")) {
        errorMessage = "This email is already registered. Please sign in instead.";
      } else if (e.code === "auth/weak-password" || e.message?.includes("weak-password")) {
        errorMessage = "Password should be at least 6 characters.";
      } else if (e.code === "auth/invalid-email" || e.message?.includes("invalid-email")) {
        errorMessage = "Invalid email address format.";
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ── Sign In ────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    if (!auth) {
      setError("Firebase not configured. Add your API key to .env.local to enable auth.");
      return;
    }
    try {
      setError(null);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!cred.user.emailVerified) {
        try {
          await sendEmailVerification(cred.user);
        } catch (emailErr) {
          console.error("Failed to resend verification email:", emailErr);
        }
        await firebaseSignOut(auth);
        setUser(null);
        throw new Error("auth/verification-required");
      }
    } catch (e: any) {
      if (e.message === "auth/verification-required") {
        throw e;
      }
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password" ||
        e.code === "auth/user-not-found" ||
        e.message?.includes("invalid-credential")
      ) {
        setError("Invalid email or password. Please try again.");
      } else {
        const raw = e instanceof Error ? e.message : "Sign in failed";
        const clean = raw
          .replace("Firebase: ", "")
          .replace(/\(auth\/.*?\)/, "")
          .trim();
        setError(clean || "Sign in failed. Please try again.");
      }
      throw e;
    }
  };

  // ── Google Sign In ─────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      setError("Firebase not configured. Add your API key to .env.local to enable auth.");
      return;
    }
    try {
      setError(null);
      const cred = await signInWithPopup(auth, googleProvider);
      // Save/update in Firestore
      await saveUserToFirestore(cred.user);
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("popup-closed-by-user")) return;
      const raw = e instanceof Error ? e.message : "Google sign in failed";
      setError(raw.replace("Firebase: ", "").replace(/\(auth\/.*?\)/, "").trim());
      throw e;
    }
  };

  // ── Sign Out ───────────────────────────────────────────────────────────
  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setUser(null);
  };

  // ── Reset Password ─────────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    if (!auth) {
      setError("Firebase not configured.");
      return;
    }
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      const raw = e instanceof Error ? e.message : "Password reset failed";
      const clean = raw.replace("Firebase: ", "").replace(/\(auth\/.*?\)/, "").trim();
      setError(clean || "Password reset failed. Please try again.");
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
