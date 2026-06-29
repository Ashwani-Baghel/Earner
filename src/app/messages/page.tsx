"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { Avatar } from "@/components/ui/Avatar";
import { Send, Loader2, Search, ArrowLeft, MessageSquare } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, writeBatch } from "firebase/firestore";

interface User {
  id: string;
  name: string;
  avatar: string | null;
}

interface Conversation {
  id: string;
  lastMessage: string | null;
  updatedAt: string;
  participants: { userId: string; user: User }[];
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

function MessagesContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetConvId = searchParams.get("c");
  const { refreshUnreadCount } = useNotification();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  // Listen to conversations
  useEffect(() => {
    if (!user || !db) return;
    
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        convs.push({
          id: docSnap.id,
          lastMessage: data.lastMessage || null,
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          participants: (data.participants || []).map((uid: string) => ({
            userId: uid,
            user: {
              id: uid,
              name: data.participantDetails?.[uid]?.name || "User",
              avatar: data.participantDetails?.[uid]?.avatar || null
            }
          }))
        });
      });
      
      // Sort by updatedAt desc
      convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setConversations(convs);
      
      if (targetConvId) {
        const target = convs.find(c => c.id === targetConvId);
        if (target) setActiveConv(target);
      }
    }, (error) => {
      console.error("Firestore Conversations Listener Error:", error.message);
    });

    return () => unsubscribe();
  }, [user, targetConvId]);

  // Listen to active conversation messages
  useEffect(() => {
    if (!user || !activeConv || !db) return;

    const messagesRef = collection(db, "conversations", activeConv.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      const unreadDocs: any[] = [];
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          conversationId: activeConv.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        });
        
        // Collect unread messages to mark as read
        if (data.read === false && data.senderId !== user.uid) {
          unreadDocs.push(docSnap.ref);
        }
      });
      
      setMessages(msgs);
      
      // Mark as read
      if (unreadDocs.length > 0) {
        const batch = writeBatch(db!);
        unreadDocs.forEach(ref => {
          batch.update(ref, { read: true });
        });
        batch.commit()
          .then(() => refreshUnreadCount())
          .catch(console.error);
      }
    }, (error) => {
      console.error("Firestore Messages Listener Error:", error.message);
    });

    return () => unsubscribe();
  }, [activeConv, user, refreshUnreadCount]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, otherTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !user || !db) return;

    const text = newMessage.trim();
    setNewMessage(""); // optimistic clear
    
    // Find recipient
    const recipient = activeConv.participants.find(p => p.userId !== user.uid);
    const recipientId = recipient ? recipient.userId : "";

    try {
      const convRef = doc(db, "conversations", activeConv.id);
      const messagesRef = collection(convRef, "messages");
      
      await addDoc(messagesRef, {
        senderId: user.uid,
        recipientId: recipientId,
        text,
        read: false,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(convRef, {
        lastMessage: text,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  if (loading || !user) return (
    <div className="flex justify-center items-center h-[70vh]">
      <Loader2 className="animate-spin text-[#1dbf73]" size={36} />
    </div>
  );

  return (
    <div className="bg-[#f7f7f7] min-h-[calc(100vh-80px)] p-4 md:p-8 flex justify-center">
      <div className="max-w-6xl w-full bg-white rounded-xl border border-[#e4e5e7] shadow-sm flex overflow-hidden h-[800px] max-h-[85vh]">
        
        {/* ── Left Pane: Conversations List ── */}
        <div className={`w-full md:w-1/3 border-r border-[#e4e5e7] flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#e4e5e7]">
            <h1 className="text-xl font-bold text-[#404145] mb-4">Inbox</h1>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74767e]" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full bg-[#f5f5f5] text-sm text-[#404145] pl-9 pr-4 py-2.5 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-[#1dbf73] transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-[#74767e] text-sm">
                No messages yet.
              </div>
            ) : (
              conversations.map(conv => {
                const otherParticipant = conv.participants.find(p => p.userId !== user.uid)?.user;
                if (!otherParticipant) return null;
                
                const isActive = activeConv?.id === conv.id;

                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-[#f5f5f5] transition-colors border-b border-[#f5f5f5] ${isActive ? 'bg-[#f0f4ff]' : ''}`}
                  >
                    <Avatar src={otherParticipant.avatar} alt={otherParticipant.name} size="md" initials={otherParticipant.name[0]} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm truncate ${isActive ? 'text-[#404145]' : 'text-[#404145]'}`}>
                          {otherParticipant.name}
                        </span>
                        <span className="text-[11px] text-[#b5b6ba]">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${isActive ? 'text-[#74767e]' : 'text-[#74767e]'}`}>
                        {conv.lastMessage || "Started a conversation"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right Pane: Active Chat ── */}
        <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex bg-[#fafafa]' : 'flex'}`}>
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-[#c5c6c9] mb-4" />
              <h2 className="text-xl font-bold text-[#404145] mb-2">Select a conversation</h2>
              <p className="text-sm text-[#74767e]">Choose a conversation from the list to start chatting.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#e4e5e7] flex items-center gap-3">
                <button 
                  className="md:hidden p-1.5 hover:bg-[#f5f5f5] rounded-full text-[#404145]"
                  onClick={() => setActiveConv(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                {(() => {
                  const otherUser = activeConv.participants.find(p => p.userId !== user.uid)?.user;
                  if (!otherUser) return null;
                  return (
                    <>
                      <Avatar src={otherUser.avatar} alt={otherUser.name} size="md" initials={otherUser.name[0]} />
                      <div>
                        <h2 className="font-bold text-[#404145]">{otherUser.name}</h2>
                        {otherTyping ? (
                          <span className="text-xs text-[#1dbf73] font-medium animate-pulse">Typing...</span>
                        ) : (
                          <span className="text-xs text-[#74767e]">Active now</span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Chat Messages */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#fafafa]"
              >
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === user.uid;
                  const showAvatar = !isMine && (index === 0 || messages[index - 1].senderId === user.uid);
                  const otherUser = activeConv.participants.find(p => p.userId !== user.uid)?.user;

                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && showAvatar ? (
                        <Avatar src={otherUser?.avatar} alt={otherUser?.name || "U"} size="sm" initials={otherUser?.name?.[0]} />
                      ) : (
                        !isMine && <div className="w-8" /> // Spacer for alignment
                      )}
                      
                      <div 
                        className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm ${
                          isMine 
                            ? 'bg-[#1a73e8] text-white rounded-br-sm' 
                            : 'bg-white border border-[#e4e5e7] text-[#404145] rounded-bl-sm shadow-sm'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-[#e4e5e7] bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 bg-[#f5f5f5] text-sm text-[#404145] px-4 py-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-[#1dbf73] transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-[#1dbf73] hover:bg-[#19a463] text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-[#1dbf73]" size={36} />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
