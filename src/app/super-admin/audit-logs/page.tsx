"use client";
import { ActivitySquare } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all platform actions and modifications</p>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-white p-20 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
            <ActivitySquare size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Audit Logs Coming Soon</h2>
          <p className="text-slate-500 max-w-sm">This module will display a comprehensive trail of all administrative actions for accountability and security.</p>
        </div>
      </div>
    </div>
  );
}
