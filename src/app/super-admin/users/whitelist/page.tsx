"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface AllowlistEntry {
  id: string;
  email: string;
  createdAt: string;
}

interface UserEntry {
  id: string;
  email: string;
  name: string;
}

export default function WhitelistPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AllowlistEntry[]>([]);
  const [existingUsers, setExistingUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    fetchWhitelist();
  }, [user]);

  const fetchWhitelist = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/allowlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch whitelist");
      const data = await res.json();
      setEntries(data.allowlist);
      setExistingUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load whitelist");
    } finally {
      setLoading(false);
    }
  };

  const isExistingUser = existingUsers.some(u => u.email.toLowerCase() === newEmail.toLowerCase().trim());

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Please enter or select an email first");
      return;
    }
    setStep(2);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !user || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/admin/allowlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add email");
      
      setEntries([data.entry, ...entries]);
      setNewEmail("");
      setPassword("");
      setConfirmPassword("");
      setStep(1);
      toast.success(isExistingUser ? "Email added and password reset successfully" : "Email added to whitelist and registered successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to remove this email from the whitelist?")) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/allowlist?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error("Failed to delete email");
      
      setEntries(entries.filter(e => e.id !== id));
      toast.success("Email removed from whitelist");
    } catch (error) {
      toast.error("Failed to remove email");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Authentication Whitelist
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage the list of pre-approved emails. Only users with emails in this list can sign up or sign in to the platform.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {step === 1 ? "Add New Email" : (isExistingUser ? "Set Password for Existing User" : "Create Password for New User")}
        </h2>
        
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                required
              />
            </div>
            <div className="relative col-span-1 sm:col-span-2 md:col-span-1">
              <select
                onChange={(e) => setNewEmail(e.target.value)}
                value=""
                className="block w-full py-2 px-3 border border-slate-300 rounded-xl leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all cursor-pointer"
              >
                <option value="" disabled>Select existing user...</option>
                {existingUsers
                  .filter(u => !entries.some(e => e.email === u.email))
                  .map(u => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="col-span-1 sm:col-span-2 pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newEmail}
                className="flex items-center gap-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddEmail} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Mail size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="font-bold text-slate-800">{newEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative col-span-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isExistingUser ? "New Password (min 6 chars)" : "Create Password (min 6 chars)"}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="relative col-span-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setStep(1);
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold px-2 py-2 transition-colors cursor-pointer z-10"
              >
                <ArrowLeft size={18} /> Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !password || password !== confirmPassword}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
              >
                <Plus size={18} />
                {isSubmitting ? "Processing..." : (isExistingUser ? "Confirm Password & Add" : "Create User & Add")}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Mail className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No emails found</h3>
            <p className="mt-2 text-slate-500 max-w-sm mx-auto">
              Your whitelist is empty. Nobody will be able to sign up or sign in until you add an email address here.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">
                  Added On
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <span className="text-indigo-600 font-bold text-sm">
                          {entry.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{entry.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500 font-medium">
                      {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Remove from whitelist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
