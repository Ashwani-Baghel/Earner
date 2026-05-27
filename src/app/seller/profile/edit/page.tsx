"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    tagline: "",
    bio: "",
    skills: "",
    languages: "English",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sellerProfile) {
            setFormData({
              tagline: data.sellerProfile.tagline || "",
              bio: data.sellerProfile.bio || "",
              skills: data.sellerProfile.skills?.join(", ") || "",
              languages: data.sellerProfile.languages?.join(", ") || "English",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = await user.getIdToken();
      // Use existing user upsert, but we actually need a seller profile update endpoint
      // Let's create a specific API route or just use a placeholder here for now
      // Assuming we'll build /api/seller/profile
      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tagline: formData.tagline,
          bio: formData.bio,
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
          languages: formData.languages.split(",").map(l => l.trim()).filter(Boolean),
        })
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      setSuccess("Profile updated successfully!");
      setTimeout(() => router.push("/seller/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Loader2 className="animate-spin text-[#1dbf73]" size={36} />
    </div>
  );

  return (
    <div className="bg-[#f7f7f7] min-h-screen pb-20">
      <div className="max-w-[1200px] mx-auto pt-8 px-4">
        <div className="bg-white rounded-lg border border-[#e4e5e7] p-8">
          <h1 className="text-2xl font-bold text-[#404145] mb-6">Public Profile Settings</h1>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-6">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-6">{success}</div>}

          <div className="flex items-center gap-6 mb-8">
            <Avatar src={user?.photoURL} alt={user?.displayName || "U"} size="lg" initials={user?.displayName?.[0]} />
            <div>
              <h2 className="font-bold text-lg text-[#404145]">{user?.displayName}</h2>
              <p className="text-[#74767e] text-sm">Update your public profile information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#404145] mb-2">Tagline</label>
              <input 
                type="text" 
                placeholder="e.g. Expert Web Designer"
                value={formData.tagline}
                onChange={e => setFormData({...formData, tagline: e.target.value})}
                className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
              />
              <p className="text-xs text-[#74767e] mt-1">A short summary of what you do.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#404145] mb-2">Bio / Description</label>
              <textarea 
                rows={5}
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Share a bit about your work experience, cool projects you've completed, and your area of expertise."
                className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#404145] mb-2">Skills</label>
              <input 
                type="text" 
                placeholder="e.g. React, UI Design, Copywriting"
                value={formData.skills}
                onChange={e => setFormData({...formData, skills: e.target.value})}
                className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
              />
              <p className="text-xs text-[#74767e] mt-1">Separate skills with commas.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#404145] mb-2">Languages</label>
              <input 
                type="text" 
                placeholder="e.g. English, Spanish"
                value={formData.languages}
                onChange={e => setFormData({...formData, languages: e.target.value})}
                className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
              />
              <p className="text-xs text-[#74767e] mt-1">Separate languages with commas.</p>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#1dbf73] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#19a463] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
