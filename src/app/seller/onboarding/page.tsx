"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Briefcase, Link as LinkIcon, CheckCircle, Loader2, ArrowRight, ArrowLeft, Trash2, Plus } from "lucide-react";
import Link from "next/link";

export default function SellerOnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Data for Category / Subcategory dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    bio: "",
    languages: "English",
    website: "",
    linkedin: "",
  });

  // State for Advanced Professional Info
  const [occupations, setOccupations] = useState<any[]>([]);
  const [structuredSkills, setStructuredSkills] = useState<any[]>([]);
  
  // Temp state for adding a skill
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Beginner");

  useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("seller_onboarding_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.occupations) setOccupations(parsed.occupations);
        if (parsed.structuredSkills) setStructuredSkills(parsed.structuredSkills);
      } catch (e) {}
    }
    setIsClientLoaded(true);
  }, []);

  // Save draft to localStorage whenever it changes
  useEffect(() => {
    if (!isClientLoaded) return;
    localStorage.setItem("seller_onboarding_draft", JSON.stringify({
      step,
      formData,
      occupations,
      structuredSkills
    }));
  }, [step, formData, occupations, structuredSkills, isClientLoaded]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error("Failed to load categories", err));
  }, []);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={32} /></div>;
  }

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.name.trim()) return setError("Name is required");
      if (!formData.tagline.trim()) return setError("Tagline is required");
      if (!formData.bio.trim() || formData.bio.length < 50) return setError("Bio must be at least 50 characters long");
      
      // If we move to step 2 and there are no occupations, add a default empty one
      if (occupations.length === 0) {
        addOccupation();
      }
      setStep(2);
    } else if (step === 2) {
      // Validate Occupations
      if (occupations.length === 0) return setError("Please add at least one occupation.");
      
      for (let i = 0; i < occupations.length; i++) {
        const occ = occupations[i];
        if (!occ.categoryId) return setError(`Please select a category for Occupation #${i + 1}`);
        if (!occ.from || !occ.to) return setError(`Please specify From and To years for Occupation #${i + 1}`);
        if (occ.from > occ.to) return setError(`'From' year cannot be greater than 'To' year in Occupation #${i + 1}`);
        if (occ.subcategories.length < 2) return setError(`Please select at least 2 subcategories for Occupation #${i + 1}`);
        if (occ.subcategories.length > 5) return setError(`You can select a maximum of 5 subcategories for Occupation #${i + 1}`);
      }

      setStep(3);
    }
  };

  const handleFinish = async () => {
    setError("");
    setSaving(true);
    try {
      const langsArr = formData.languages.split(",").map(s => s.trim()).filter(Boolean);
      const token = await user?.getIdToken();
      if (!token) throw new Error("Unauthorized. Please sign in.");

      const res = await fetch("/api/seller/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          tagline: formData.tagline,
          bio: formData.bio,
          // Convert structured skills back to a simple string array for backward compatibility
          skills: structuredSkills.map(s => s.name), 
          languages: langsArr,
          website: formData.website,
          linkedin: formData.linkedin,
          occupations: occupations,
          structuredSkills: structuredSkills
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save profile");
      }

      // Clear draft on success
      localStorage.removeItem("seller_onboarding_draft");
      router.push("/seller/dashboard");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  // Occupations Logic
  const addOccupation = () => {
    setOccupations(prev => [...prev, {
      id: Date.now().toString(),
      categoryId: "",
      categoryName: "",
      from: "",
      to: "",
      subcategories: []
    }]);
  };

  const removeOccupation = (id: string) => {
    setOccupations(prev => prev.filter(o => o.id !== id));
  };

  const updateOccupation = (id: string, field: string, value: any) => {
    setOccupations(prev => prev.map(o => {
      if (o.id === id) {
        let updated = { ...o, [field]: value };
        if (field === "categoryId") {
          const cat = categories.find(c => c.id === value);
          updated.categoryName = cat ? cat.name : "";
          updated.subcategories = []; // Reset subcategories when category changes
        }
        return updated;
      }
      return o;
    }));
  };

  const toggleSubcategory = (occId: string, subName: string) => {
    setOccupations(prev => prev.map(o => {
      if (o.id === occId) {
        if (o.subcategories.includes(subName)) {
          return { ...o, subcategories: o.subcategories.filter((s: string) => s !== subName) };
        } else {
          if (o.subcategories.length >= 5) return o; // Max 5 limit
          return { ...o, subcategories: [...o.subcategories, subName] };
        }
      }
      return o;
    }));
  };

  // Skills Logic
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setStructuredSkills(prev => [...prev, {
      id: Date.now().toString(),
      name: newSkillName.trim(),
      level: newSkillLevel
    }]);
    setNewSkillName("");
    setNewSkillLevel("Beginner");
  };

  const removeSkill = (id: string) => {
    setStructuredSkills(prev => prev.filter(s => s.id !== id));
  };

  // Utility for Year dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => currentYear - index);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-tighter text-slate-900">
          fiverr<span className="text-teal-500">.</span>
        </Link>
        <div className="text-sm font-semibold text-slate-500">Seller Onboarding</div>
      </div>

      <div className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <div className="max-w-4xl w-full">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative px-12">
            <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0"></div>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 h-1 bg-teal-500 rounded-full z-0 transition-all duration-500" style={{ width: `calc(${((step - 1) / 2) * 100}% - 2rem)` }}></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {s === 1 && <User size={18} />}
                {s === 2 && <Briefcase size={18} />}
                {s === 3 && <LinkIcon size={18} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-8 sm:p-12">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Info</h2>
                  <p className="text-slate-500 mb-8">Tell us a bit about yourself. This information will appear on your public profile, so that potential buyers can get to know you better.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Professional Tagline *</label>
                      <input type="text" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="e.g. Expert Full Stack Developer" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Bio) *</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all h-32 resize-none" placeholder="Share a bit about your work experience, cool projects you've completed, and your area of expertise." />
                      <p className="text-xs text-slate-400 mt-2 text-right">{formData.bio.length} / 50 min chars</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Info</h2>
                  <p className="text-slate-500 mb-8">This is your time to shine. Let potential buyers know what you do best and how you gained your skills, certifications and experience.</p>
                  
                  {/* Occupations Section */}
                  <div className="mb-12 border-b border-slate-100 pb-10">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
                      Your Occupation *
                    </h3>
                    
                    <div className="space-y-10">
                      {occupations.map((occ, idx) => (
                        <div key={occ.id} className="relative p-6 rounded-xl border border-slate-100 bg-slate-50/50">
                          {occupations.length > 1 && (
                            <button onClick={() => removeOccupation(occ.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          )}
                          
                          <div className="flex flex-col md:flex-row gap-4 mb-6 pr-10">
                            <div className="flex-1">
                              <select 
                                value={occ.categoryId} 
                                onChange={e => updateOccupation(occ.id, "categoryId", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-white text-slate-700"
                              >
                                <option value="" disabled>Select Occupation</option>
                                {categories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-500 font-medium">From</span>
                              <select 
                                value={occ.from} 
                                onChange={e => updateOccupation(occ.id, "from", e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-white text-slate-700 w-28"
                              >
                                <option value="" disabled>Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                              <span className="text-sm text-slate-500 font-medium">To</span>
                              <select 
                                value={occ.to} 
                                onChange={e => updateOccupation(occ.id, "to", e.target.value)}
                                className="px-3 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 outline-none bg-white text-slate-700 w-28"
                              >
                                <option value="" disabled>Year</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Subcategories */}
                          {occ.categoryId && (
                            <div>
                              <p className="text-sm text-slate-600 mb-4 font-medium">
                                Choose <span className="font-bold text-slate-900">two to five</span> of your best skills in {occ.categoryName}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                                {categories.find(c => c.id === occ.categoryId)?.subcategories?.map((sub: any) => (
                                  <label key={sub.id} className="flex items-start gap-2 cursor-pointer group">
                                    <input 
                                      type="checkbox" 
                                      checked={occ.subcategories.includes(sub.name)}
                                      onChange={() => toggleSubcategory(occ.id, sub.name)}
                                      disabled={!occ.subcategories.includes(sub.name) && occ.subcategories.length >= 5}
                                      className="mt-1 border-slate-300 text-teal-600 focus:ring-teal-500 rounded"
                                    />
                                    <span className={`text-sm select-none ${occ.subcategories.includes(sub.name) ? 'text-slate-900 font-medium' : 'text-slate-600 group-hover:text-slate-800'}`}>
                                      {sub.name}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button onClick={addOccupation} className="mt-4 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm">
                      <Plus size={16} /> Add Occupation
                    </button>
                  </div>

                  {/* Skills Section */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Skills *</h3>
                    <p className="text-sm text-slate-500 mb-6">List the skills related to the services you're offering and add your experience level.</p>
                    
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
                      {structuredSkills.length > 0 && (
                        <table className="w-full text-left border-b border-slate-100">
                          <thead className="bg-slate-50/50">
                            <tr>
                              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Skill</th>
                              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</th>
                              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {structuredSkills.map(skill => (
                              <tr key={skill.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="px-6 py-3 text-sm text-slate-800 font-medium">{skill.name}</td>
                                <td className="px-6 py-3 text-sm text-slate-600">{skill.level}</td>
                                <td className="px-6 py-3 text-sm text-right text-slate-400">
                                  <button onClick={() => removeSkill(skill.id)} className="hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      
                      <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center">
                        <input 
                          type="text" 
                          value={newSkillName}
                          onChange={e => setNewSkillName(e.target.value)}
                          placeholder="Add Skill (e.g. Voice Talent)"
                          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 outline-none text-sm w-full"
                          onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <select 
                          value={newSkillLevel}
                          onChange={e => setNewSkillLevel(e.target.value)}
                          className="px-4 py-2.5 rounded-lg border border-slate-200 focus:border-teal-500 outline-none text-sm bg-white w-full sm:w-auto min-w-[150px]"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Expert">Expert</option>
                        </select>
                        <button onClick={addSkill} className="px-6 py-2.5 bg-white border border-teal-500 text-teal-600 font-bold rounded-lg hover:bg-teal-50 transition-colors text-sm w-full sm:w-auto">
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Languages</label>
                    <input type="text" value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="e.g. English, Spanish (comma separated)" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Linked Accounts</h2>
                  <p className="text-slate-500 mb-8">Taking the time to verify and link your accounts can upgrade your credibility and help us provide you with more business.</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Personal Website</label>
                      <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="https://yourwebsite.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">LinkedIn Profile</label>
                      <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" placeholder="https://linkedin.com/in/username" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                  {error}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div></div>
              )}
              
              {step < 3 ? (
                <button onClick={handleNext} className="px-8 py-2.5 rounded-xl font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 flex items-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={saving} className="px-8 py-2.5 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Finish Onboarding
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
