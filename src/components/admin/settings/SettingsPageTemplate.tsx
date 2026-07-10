"use client";
import { Loader2, Save } from "lucide-react";
import React from "react";

export function SettingsPageTemplate({ title, loading, saving, onSave, children }: {
  title: string;
  loading: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {children}
      </div>
    </div>
  );
}
