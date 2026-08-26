"use client";

import { useState } from "react";
import { 
  MessageSquare, Search, Filter, MoreVertical, Send, 
  User, CheckCircle, Clock, AlertCircle, XCircle 
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

type ChatStatus = "Active" | "Waiting" | "Unassigned" | "Closed";

const MOCK_CHATS = [
  {
    id: "CHAT-101",
    user: "Sarah Jenkins",
    email: "sarah.j@example.com",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    status: "Active",
    agent: "Agent Mike",
    lastMessage: "I still can't see the updated gig on my dashboard.",
    time: "2m ago",
    unread: 1,
    messages: [
      { id: 1, sender: "user", text: "Hi, I updated my gig description but it's not showing up.", time: "10:30 AM" },
      { id: 2, sender: "agent", text: "Hello Sarah, let me check that for you right now.", time: "10:32 AM" },
      { id: 3, sender: "user", text: "I still can't see the updated gig on my dashboard.", time: "10:35 AM" },
    ]
  },
  {
    id: "CHAT-102",
    user: "David Miller",
    email: "david.m@example.com",
    avatar: "https://i.pravatar.cc/150?u=david",
    status: "Waiting",
    agent: "Agent Sarah",
    lastMessage: "Are you still there?",
    time: "5m ago",
    unread: 2,
    messages: [
      { id: 1, sender: "user", text: "My payment failed when trying to order.", time: "10:15 AM" },
      { id: 2, sender: "agent", text: "I'm looking into the transaction logs.", time: "10:18 AM" },
      { id: 3, sender: "user", text: "Are you still there?", time: "10:25 AM" },
    ]
  },
  {
    id: "CHAT-103",
    user: "Emma Watson",
    email: "emma@example.com",
    avatar: "https://i.pravatar.cc/150?u=emma",
    status: "Unassigned",
    agent: null,
    lastMessage: "I need help setting up my seller profile.",
    time: "1m ago",
    unread: 1,
    messages: [
      { id: 1, sender: "user", text: "Hi, I need help setting up my seller profile. Is anyone available?", time: "10:40 AM" },
    ]
  },
  {
    id: "CHAT-104",
    user: "Michael Chang",
    email: "mike.c@example.com",
    avatar: "https://i.pravatar.cc/150?u=mike",
    status: "Closed",
    agent: "Agent John",
    lastMessage: "Thank you for the quick resolution!",
    time: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, sender: "user", text: "How do I reset my password?", time: "Yesterday, 3:00 PM" },
      { id: 2, sender: "agent", text: "You can click on 'Forgot Password' on the login screen.", time: "Yesterday, 3:05 PM" },
      { id: 3, sender: "user", text: "Thank you for the quick resolution!", time: "Yesterday, 3:10 PM" },
    ]
  },
  {
    id: "CHAT-105",
    user: "Lisa Ray",
    email: "lisa.r@example.com",
    avatar: "https://i.pravatar.cc/150?u=lisa",
    status: "Active",
    agent: "Agent Mike",
    lastMessage: "Got it, uploading the files now.",
    time: "Just now",
    unread: 0,
    messages: [
      { id: 1, sender: "user", text: "Is there a limit to attachment sizes?", time: "10:38 AM" },
      { id: 2, sender: "agent", text: "Yes, it's 50MB per file.", time: "10:40 AM" },
      { id: 3, sender: "user", text: "Got it, uploading the files now.", time: "10:41 AM" },
    ]
  },
];

export default function LiveChatDashboard() {
  const [activeTab, setActiveTab] = useState<ChatStatus>("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>("CHAT-101");

  const filteredChats = MOCK_CHATS.filter(chat => {
    const matchesTab = chat.status === activeTab;
    const matchesSearch = chat.user.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          chat.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const selectedChat = MOCK_CHATS.find(c => c.id === selectedChatId);

  // Auto-select the first chat if the active tab changes and the current chat isn't in it
  if (selectedChat && selectedChat.status !== activeTab && filteredChats.length > 0) {
    setSelectedChatId(filteredChats[0].id);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-69px)] bg-slate-50">
      
      {/* Top Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-teal-600" size={24} />
            Live Chat Monitoring
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitor active conversations and manage support queues.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search user or chat ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Left Sidebar - Chat List */}
        <div className="w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto hide-scrollbar">
            {["Active", "Waiting", "Unassigned", "Closed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as ChatStatus)}
                className={`flex-1 py-3 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab 
                    ? "border-teal-600 text-teal-700 bg-teal-50/30" 
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
                <span className={`ml-2 text-xs py-0.5 px-2 rounded-full ${
                  activeTab === tab ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {MOCK_CHATS.filter(c => c.status === tab).length}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
                <MessageSquare className="text-slate-300 mb-3" size={32} />
                <p className="text-sm font-medium">No chats found in this queue.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredChats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedChatId === chat.id 
                        ? "bg-slate-50 border-l-2 border-l-teal-600" 
                        : "hover:bg-slate-50 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={chat.avatar} alt={chat.user} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{chat.user}</p>
                          <p className="text-xs text-slate-500 truncate">{chat.id}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <span className="text-[11px] text-slate-400 font-medium">{chat.time}</span>
                        {chat.unread > 0 && (
                          <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 truncate mt-2 pr-4">{chat.lastMessage}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div className="hidden md:flex flex-1 flex-col bg-[#F8FAFC]">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <Avatar src={selectedChat.avatar} alt={selectedChat.user} size="md" />
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedChat.user}</h2>
                    <p className="text-xs text-slate-500">{selectedChat.email}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200 mx-2"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Assigned To:</span>
                    {selectedChat.agent ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                        {selectedChat.agent}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    Reassign
                  </button>
                  {selectedChat.status !== "Closed" && (
                    <button className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors shadow-sm">
                      Close Chat
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                  <div className="text-center">
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-semibold">Today</span>
                  </div>
                  
                  {selectedChat.messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[75%] ${msg.sender === "user" ? "self-start" : "self-end"}`}
                    >
                      <div className="flex items-end gap-2 mb-1">
                        {msg.sender === "user" ? (
                          <span className="text-xs font-semibold text-slate-500 ml-1">{selectedChat.user}</span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 mr-1 self-end w-full text-right">{selectedChat.agent || "Admin"}</span>
                        )}
                      </div>
                      <div 
                        className={`px-4 py-3 rounded-2xl ${
                          msg.sender === "user" 
                            ? "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm" 
                            : "bg-teal-700 text-white rounded-br-none shadow-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <span className={`text-[10px] text-slate-400 mt-1 font-medium ${msg.sender === "user" ? "ml-1" : "text-right mr-1"}`}>
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input (Admin Override) */}
              {selectedChat.status !== "Closed" ? (
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <div className="max-w-3xl mx-auto relative">
                    <div className="absolute -top-8 left-0 text-xs font-bold text-teal-600 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                      Super Admin Override Mode
                    </div>
                    <div className="flex items-end gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all shadow-sm">
                      <textarea 
                        placeholder="Type a message to reply on behalf of the agent..." 
                        rows={1}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-slate-900"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                      <button className="w-10 h-10 shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm mb-0.5">
                        <Send size={18} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0 text-center">
                  <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                    <XCircle size={16} />
                    This conversation has been closed and cannot be replied to.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                <MessageSquare size={32} className="text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-600">No Chat Selected</p>
              <p className="text-sm mt-1">Select a conversation from the sidebar to view details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
