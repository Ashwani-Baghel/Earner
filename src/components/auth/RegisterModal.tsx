"use client";

import { useState, FormEvent, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const { signUp, signInWithGoogle, error, clearError, isFirebaseReady } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPassword("");
      setShowPw(false);
      clearError();
    }
  }, [open, clearError]);

  const redirectAfterSignup = async () => {
    try {
      const { auth } = await import("../../lib/firebaseClient");
      const user = auth?.currentUser;
      if (!user) {
        onClose();
        router.push("/buyer/dashboard");
        return;
      }
      
      const token = await user.getIdToken();
      if (!token) {
        onClose();
        router.push("/buyer/dashboard");
        return;
      }

      const role = isSeller ? "SELLER" : "BUYER";
      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          name: name || auth?.currentUser?.displayName || "Anonymous",
          email: email || auth?.currentUser?.email || "",
          avatar: auth?.currentUser?.photoURL || null,
        }),
      });

      if (role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/buyer/dashboard");
      }
    } catch (err) {
      console.error("Failed to assign role:", err);
    } finally {
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { return; }
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      await redirectAfterSignup();
    } catch {
      /* error handled by context */
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      await redirectAfterSignup();
    } catch {
      /* handled */
    }
  };



  return (
    <Modal open={open} onClose={() => { clearError(); setName(""); setEmail(""); setPassword(""); setShowPw(false); onClose(); }} size="sm">
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#404145]">Create an account</h2>
          <p className="text-sm text-[#74767e] mt-1">Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-[#1dbf73] font-semibold hover:underline">Sign in</button>
          </p>
        </div>

        {!isFirebaseReady && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            ⚠️ Firebase not configured. Add your API key to <code className="font-mono">.env.local</code> to enable auth.
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        <button
          onClick={handleGoogle}
          disabled={!isFirebaseReady}
          className="w-full flex items-center justify-center gap-3 border border-[#e4e5e7] rounded-lg py-2.5 text-sm font-medium text-[#404145] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e4e5e7]" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#74767e]">OR</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#404145] mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b6ba]" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 border border-[#e4e5e7] rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404145] mb-1">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b6ba]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email"
                className="w-full pl-9 pr-4 py-2.5 border border-[#e4e5e7] rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404145] mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b6ba]" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 6 characters"
                className="w-full pl-9 pr-10 py-2.5 border border-[#e4e5e7] rounded-lg text-sm focus:outline-none focus:border-[#1dbf73] focus:ring-1 focus:ring-[#1dbf73]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5b6ba] hover:text-[#404145]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="mt-1 text-xs text-red-500">Password must be at least 6 characters</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="isSeller" 
              checked={isSeller} 
              onChange={(e) => setIsSeller(e.target.checked)} 
              className="w-4 h-4 text-[#1dbf73] focus:ring-[#1dbf73] border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="isSeller" className="text-sm font-medium text-[#404145] cursor-pointer">
              Join as a Seller
            </label>
          </div>

          <Button type="submit" className="w-full" loading={submitting} disabled={!isFirebaseReady}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-[#74767e]">
          By joining, you agree to our{" "}
          <a href="#" className="underline hover:text-[#404145]">Terms of Service</a>{" "}and{" "}
          <a href="#" className="underline hover:text-[#404145]">Privacy Policy</a>.
        </p>
      </div>
    </Modal>
  );
}
