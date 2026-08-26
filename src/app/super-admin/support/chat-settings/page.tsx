"use client";

import { useState } from "react";
import { MessageCircle, Save, Power, Zap, Clock, MessageSquareText, Hourglass, Users, FileUp, Paperclip, Database, ShieldAlert, Sparkles } from "lucide-react";

export default function ChatSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    liveChatEnabled: true,
    autoAssignment: true,
    supportHoursStart: "09:00",
    supportHoursEnd: "17:00",
    timezone: "EST",
    welcomeMessage: "Hi there! 👋 How can we help you today?",
    offlineMessage: "We are currently offline. Please leave a detailed message and our team will get back to you as soon as possible.",
    chatTimeout: "15",
    maxQueueSize: "50",
    fileUploadLimit: "25",
    allowedAttachments: ".png, .jpg, .pdf, .docx, .zip",
    chatRetention: "365",
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MessageCircle className="text-indigo-600" size={24} />
            Chat Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Configure the core behavior, security, and messaging rules for your live support system.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Configuration
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Core Operations Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Power size={120} className="text-indigo-600 -rotate-12 translate-x-4 -translate-y-4" />
          </div>
          
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 relative z-10">
            <Sparkles className="text-amber-500" size={20} />
            Core Operations
          </h2>
          
          <div className="space-y-6 relative z-10">
            {/* Live Chat Toggle */}
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <div className="flex-1">
                <label className="block text-sm font-bold text-indigo-950">Enable Live Chat System</label>
                <p className="text-xs text-indigo-800/70 mt-1">Master switch. If disabled, the entire live chat widget will be hidden from users.</p>
              </div>
              <button 
                onClick={() => updateSetting("liveChatEnabled", !settings.liveChatEnabled)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.liveChatEnabled ? 'bg-indigo-600 shadow-inner' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.liveChatEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Auto Assignment Toggle */}
            <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-900">Intelligent Auto-Assignment</label>
                <p className="text-xs text-slate-500 mt-1">Automatically route new chats to the least busy online agent within the target department.</p>
              </div>
              <button 
                onClick={() => updateSetting("autoAssignment", !settings.autoAssignment)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.autoAssignment ? 'bg-emerald-500 shadow-inner' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.autoAssignment ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Messaging & Availability Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <MessageSquareText className="text-blue-500" size={20} />
            Messaging & Availability
          </h2>
          
          <div className="space-y-6">
            
            {/* Support Hours */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <label className="block text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-slate-400" /> Platform Support Hours
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="time" 
                  value={settings.supportHoursStart}
                  onChange={(e) => updateSetting("supportHoursStart", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
                <span className="text-slate-400 font-medium text-sm">to</span>
                <input 
                  type="time" 
                  value={settings.supportHoursEnd}
                  onChange={(e) => updateSetting("supportHoursEnd", e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
                <select 
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-2">Outside these hours, the offline message will be displayed automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Welcome Message</label>
                <textarea 
                  value={settings.welcomeMessage}
                  onChange={(e) => updateSetting("welcomeMessage", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Offline Message</label>
                <textarea 
                  value={settings.offlineMessage}
                  onChange={(e) => updateSetting("offlineMessage", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 leading-relaxed focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors resize-none shadow-inner"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Queue Management Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Users className="text-teal-500" size={20} />
            Queue Management
          </h2>
          
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Hourglass size={16} className="text-teal-500" /> Chat Timeout Limit
                </label>
                <p className="text-xs text-slate-500 mt-1">Automatically close inactive chats after this many minutes.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-32">
                <input 
                  type="number" 
                  value={settings.chatTimeout}
                  onChange={(e) => updateSetting("chatTimeout", e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                  min="1"
                  max="120"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Min</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-teal-500" /> Maximum Queue Size
                </label>
                <p className="text-xs text-slate-500 mt-1">Maximum number of users waiting before chat reverts to offline mode.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-32">
                <input 
                  type="number" 
                  value={settings.maxQueueSize}
                  onChange={(e) => updateSetting("maxQueueSize", e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                  min="0"
                  max="500"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Users</span>
              </div>
            </div>

          </div>
        </div>

        {/* Security & Data Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={20} />
            Security & Data
          </h2>
          
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileUp size={16} className="text-rose-400" /> File Upload Limit
                </label>
                <p className="text-xs text-slate-500 mt-1">Maximum file size allowed for user attachments in chat.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-32">
                <input 
                  type="number" 
                  value={settings.fileUploadLimit}
                  onChange={(e) => updateSetting("fileUploadLimit", e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                  min="1"
                  max="100"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MB</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-2 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div>
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Paperclip size={16} className="text-rose-400" /> Allowed Attachment Types
                </label>
                <p className="text-xs text-slate-500 mt-1">Comma separated list of valid file extensions.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 focus-within:border-indigo-500 shadow-sm w-full mt-2">
                <input 
                  type="text" 
                  value={settings.allowedAttachments}
                  onChange={(e) => updateSetting("allowedAttachments", e.target.value)}
                  className="w-full text-sm font-medium text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex-1">
                <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database size={16} className="text-rose-400" /> Chat Retention Period
                </label>
                <p className="text-xs text-slate-500 mt-1">How long chat transcripts are stored before automated deletion.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 shadow-sm w-32">
                <input 
                  type="number" 
                  value={settings.chatRetention}
                  onChange={(e) => updateSetting("chatRetention", e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 outline-none text-center"
                  min="30"
                  max="3650"
                />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
