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
  /** RBAC permissions (e.g. ["users.view", "gigs.manage"], or ["*"] for SUPER_ADMIN) */
  permissions: string[];
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

        setLoading(true);
        // ── Role & Permissions resolution ────────────────────────────────
        // Priority: Firestore (live) → localStorage (cached) → null (new user)
        let isSeller = false;
        let role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null = null;
        let permissions: string[] = [];
        const cacheKey = `earner_role_${firebaseUser.uid}`;
        const permsCacheKey = `earner_perms_${firebaseUser.uid}`;

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
              permissions = data.permissions || [];
              localStorage.setItem(cacheKey, role ?? "");
              localStorage.setItem(permsCacheKey, JSON.stringify(permissions));
            } else if (res.status === 404) {
              // User exists in Firebase but not in Postgres (e.g. database reset)
              role = null;
              isSeller = false;
              permissions = [];
              localStorage.removeItem(cacheKey);
              localStorage.removeItem(permsCacheKey);
            } else {
              throw new Error("Failed to fetch user from Postgres");
            }
          } catch {
            // Offline or error — fall back to cached role
            const cached = localStorage.getItem(cacheKey) as "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null;
            role = cached;
            isSeller = cached === "SELLER";
            try {
              const cachedPerms = localStorage.getItem(permsCacheKey);
              if (cachedPerms) permissions = JSON.parse(cachedPerms);
            } catch { /* ignore */ }
          }
        } else {
          // Should not reach here if firebaseUser is truthy, but keeping structure
          const cached = localStorage.getItem(cacheKey) as "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN" | null;
          role = cached;
          isSeller = cached === "SELLER";
          try {
            const cachedPerms = localStorage.getItem(permsCacheKey);
            if (cachedPerms) permissions = JSON.parse(cachedPerms);
          } catch { /* ignore */ }
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isSeller,
          role,
          hasRole: role === "BUYER" || role === "SELLER" || role === "ADMIN" || role === "SUPER_ADMIN",
          permissions,
          getIdToken: (forceRefresh?: boolean) => firebaseUser.getIdToken(forceRefresh),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Helper: Verify Allowlist ───────────────────────────────────────────
  const verifyEmailAllowlist = async (email: string) => {
    try {
      const res = await fetch(`/api/auth/verify-allowlist?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error("Your email is not authorized to access this platform. Please contact the administrator.");
      }
      const data = await res.json();
      if (!data.allowed) {
        throw new Error("Your email is not authorized to access this platform. Please contact the administrator.");
      }
    } catch (error: any) {
      if (error.message.includes("authorized")) {
        throw error;
      }
      // If the API fails for another reason, we might want to block or allow, but for now block to be safe
      throw new Error("Unable to verify authorization. Please try again.");
    }
  };

  // ── Sign Up ────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, name: string) => {
    if (!auth) {
      setError("Firebase not configured. Add your API key to .env.local to enable auth.");
      return;
    }
    try {
      setError(null);
      // Check allowlist before creating user
      await verifyEmailAllowlist(email);

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name
      await updateProfile(cred.user, { displayName: name });
      
      // Save to Firestore
      await saveUserToFirestore({ ...cred.user, displayName: name });
    } catch (e: any) {
      if (e.message === "auth/verification-required") {
        throw e;
      }
      
      let errorMessage = "Sign up failed. Please try again.";
      if (e.message?.includes("authorized")) {
        errorMessage = e.message;
      } else if (e.code === "auth/email-already-in-use" || e.message?.includes("email-already-in-use")) {
        errorMessage = "this email already registred";
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
      // Check allowlist before signing in
      await verifyEmailAllowlist(email);

      const cred = await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      if (e.message?.includes("authorized")) {
        setError(e.message);
        throw e;
      }
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password" ||
        e.code === "auth/user-not-found" ||
        e.message?.includes("invalid-credential")
      ) {
        const errorMsg = "wrong eamail and password";
        setError(errorMsg);
        throw new Error(errorMsg);
      } else {
        const raw = e instanceof Error ? e.message : "Sign in failed";
        const clean = raw
          .replace("Firebase: ", "")
          .replace(/\(auth\/.*?\)/, "")
          .trim();
        const errorMsg = clean || "Sign in failed. Please try again.";
        setError(errorMsg);
        throw new Error(errorMsg);
      }
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
      
      // Since Google sign-in happens via popup, we can't verify the email *before* the popup
      // unless we ask for the email first, which defeats the purpose.
      // So we do the popup first, then verify the email, and if it fails we sign them out immediately.
      
      const cred = await signInWithPopup(auth, googleProvider);
      const userEmail = cred.user.email;
      
      if (!userEmail) {
        await firebaseSignOut(auth);
        throw new Error("Unable to retrieve email from Google.");
      }

      try {
        await verifyEmailAllowlist(userEmail);
      } catch (err: any) {
        // Sign out immediately and delete user if they just signed up, but we'll just sign out
        await firebaseSignOut(auth);
        throw err;
      }

      // Save/update in Firestore
      await saveUserToFirestore(cred.user);
    } catch (e: any) {
      if (e instanceof Error && e.message.includes("popup-closed-by-user")) return;
      
      let errorMessage = "Google sign in failed";
      if (e.message?.includes("authorized")) {
        errorMessage = e.message;
      } else if (e instanceof Error) {
        errorMessage = e.message.replace("Firebase: ", "").replace(/\(auth\/.*?\)/, "").trim();
      }
      
      setError(errorMessage);
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
