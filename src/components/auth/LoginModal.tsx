"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const { signIn, signInWithGoogle, error, clearError, loading, isFirebaseReady } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** After sign-in, check Postgres for role and redirect accordingly */
  const redirectAfterLogin = async () => {
    try {
      const { auth } = await import("../../lib/firebaseClient");
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error("No token");

      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.role === "SELLER") {
          router.push("/seller/dashboard");
        } else {
          router.push("/buyer/dashboard");
        }
        return;
      }
    } catch { /* ignore */ } finally {
      onClose();
    }
    // No role found or error → default to BUYER dashboard
    router.push("/buyer/dashboard");
  };

  useEffect(() => {
    if (open) {
      setEmail("");
      setPassword("");
      setShowPw(false);
      clearError();
    }
  }, [open, clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Clear fields on success
      setEmail("");
      setPassword("");
      setShowPw(false);
      const { auth } = await import("../../lib/firebaseClient");
      const user = auth?.currentUser;
      if (!user) {
        onClose();
        router.push("/buyer/dashboard");
        return;
      }
      await redirectAfterLogin();
    } catch {
      /* error handled by context */
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      // Clear fields on success
      setEmail("");
      setPassword("");
      const { auth } = await import("../../lib/firebaseClient");
      const user = auth?.currentUser;
      if (!user) {
        onClose();
        router.push("/buyer/dashboard");
        return;
      }
      await redirectAfterLogin();
    } catch {
      /* error handled by context */
    }
  };



  return (
    <Modal open={open} onClose={() => { clearError(); setEmail(""); setPassword(""); setShowPw(false); onClose(); }} size="sm">
      {/* Branded header */}
      <div className="-mx-6 -mt-6 mb-6 bg-gradient-to-br from-[#0b3a24] to-[#1dbf73] px-8 py-7 text-white text-center rounded-t-2xl">
        <span className="text-3xl font-black tracking-tighter">
          Earner<span className="text-white/70">.</span>
        </span>
        <h2 className="text-xl font-bold mt-1">Sign in to your account</h2>
        <p className="text-white/70 text-sm mt-0.5">
          Don&apos;t have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-white font-semibold underline underline-offset-2 hover:text-white/80">
            Join free
          </button>
        </p>
      </div>

      <div className="space-y-5">
        {/* Firebase warning */}
        {!isFirebaseReady && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            ⚠️ Firebase not configured. Add your API key to <code className="font-mono">.env.local</code> to enable auth.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={!isFirebaseReady}
          className="w-full flex items-center justify-center gap-3 border-2 border-[#e4e5e7] rounded-xl py-3 text-sm font-semibold text-[#404145] hover:border-[#1dbf73] hover:bg-[#f0faf5] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e4e5e7]" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-medium text-[#9ca3af] uppercase tracking-wider">or</span></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#404145] mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-[#e4e5e7] rounded-xl text-sm text-[#404145] focus:outline-none focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/20 transition-all placeholder-[#c5c6c9]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#404145] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-3 border-2 border-[#e4e5e7] rounded-xl text-sm text-[#404145] focus:outline-none focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/20 transition-all placeholder-[#c5c6c9]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#404145] transition-colors">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" loading={submitting} disabled={!isFirebaseReady}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-[#9ca3af]">
          By signing in, you agree to our{" "}
          <a href="#" className="text-[#74767e] underline hover:text-[#404145]">Terms of Service</a>{" "}and{" "}
          <a href="#" className="text-[#74767e] underline hover:text-[#404145]">Privacy Policy</a>.
        </p>
      </div>
    </Modal>
  );
}
