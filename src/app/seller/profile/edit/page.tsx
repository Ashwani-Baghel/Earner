"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Link as LinkIcon, Download, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [fetchingLinkedin, setFetchingLinkedin] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);

  const [formData, setFormData] = useState({
    tagline: "",
    bio: "",
    skills: "",
    languages: "English",
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
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
              website: data.sellerProfile.website || "",
              linkedin: data.sellerProfile.linkedin || "",
              github: data.sellerProfile.github || "",
              twitter: data.sellerProfile.twitter || "",
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

  const handleFetchLinkedin = async () => {
    if (!linkedinUrl.includes("linkedin.com/in/")) {
      setError("Please enter a valid LinkedIn profile URL");
      return;
    }
    setFetchingLinkedin(true);
    setError("");
    
    // Mocking an API call to fetch LinkedIn data
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        tagline: "Senior Full Stack Developer & UI/UX Expert",
        bio: "Experienced Software Engineer with a demonstrated history of working in the tech industry. Skilled in React, Next.js, Node.js, and Cloud Infrastructure. Strong engineering professional with a Bachelor's Degree in Computer Science.",
        skills: prev.skills ? prev.skills + ", React, Next.js, TypeScript" : "React, Next.js, TypeScript",
      }));
      setFetchingLinkedin(false);
      setLinkedinSuccess(true);
      setTimeout(() => setLinkedinSuccess(false), 3000);
    }, 1500);
  };

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
          website: formData.website,
          linkedin: formData.linkedin,
          github: formData.github,
          twitter: formData.twitter,
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

          {/* Import from LinkedIn */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#0a66c2] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkIcon size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-[#404145] text-lg">Import from LinkedIn</h3>
                <p className="text-sm text-[#74767e]">Save time by importing your summary, headline, and skills directly from your LinkedIn profile.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <input 
                type="url" 
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full sm:w-64 border border-[#c5c6c9] rounded-lg px-4 py-2.5 focus:border-[#0a66c2] outline-none text-sm"
              />
              <button 
                type="button"
                onClick={handleFetchLinkedin}
                disabled={fetchingLinkedin || !linkedinUrl}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-[#004182] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetchingLinkedin ? <Loader2 size={16} className="animate-spin" /> : linkedinSuccess ? <CheckCircle2 size={16} /> : <Download size={16} />}
                {linkedinSuccess ? "Imported!" : "Import"}
              </button>
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

            <div className="pt-6 border-t border-[#e4e5e7]">
              <h3 className="text-lg font-bold text-[#404145] mb-4">Social & Professional Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#404145] mb-2">Personal Website</label>
                  <input 
                    type="url" 
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#404145] mb-2">GitHub Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://github.com/username"
                    value={formData.github}
                    onChange={e => setFormData({...formData, github: e.target.value})}
                    className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#404145] mb-2">Twitter / X Profile URL</label>
                  <input 
                    type="url" 
                    placeholder="https://twitter.com/username"
                    value={formData.twitter}
                    onChange={e => setFormData({...formData, twitter: e.target.value})}
                    className="w-full border border-[#c5c6c9] rounded-md px-4 py-2 focus:border-[#404145] outline-none"
                  />
                </div>
              </div>
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
