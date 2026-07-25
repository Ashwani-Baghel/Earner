"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import { useChat } from "@/context/ChatContext";
import { Avatar } from "@/components/ui/Avatar";
import { Send, Loader2, Search, ArrowLeft, MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, writeBatch, increment } from "firebase/firestore";

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
  buyerId?: string;
  sellerId?: string;
  unreadCountBuyer?: number;
  unreadCountSeller?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

function useDraggable(isExpanded: boolean) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Reset position when expanded
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [isExpanded]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;
      
      // Constrain dragging so it never goes over the navbar (approx 80px tall)
      // Initial position is bottom: 0, so initial top is window.innerHeight - 500
      const initialTop = window.innerHeight - 500;
      const minNewY = 85 - initialTop; // Stop at 85px from top screen edge
      
      if (newY < minNewY) newY = minNewY;
      
      setPosition({
        x: newX,
        y: newY
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return { position, setPosition, handleMouseDown };
}

export function ChatPopup() {
  const { user, loading } = useAuth();
  const { isChatOpen, activeConvId, closeChat } = useChat();
  const pathname = usePathname();
  const isSellerView = pathname.startsWith("/seller");
  const { refreshUnreadCount } = useNotification();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [smallSize, setSmallSize] = useState({ width: 380, height: 500 });
  const [expandedSize, setExpandedSize] = useState({ width: 850, height: 620 });

  useEffect(() => {
    if (typeof window !== 'undefined' && isExpanded) {
      setExpandedSize({
        width: Math.min(window.innerWidth - 80, 1050),
        height: Math.min(window.innerHeight - 140, 720)
      });
    }
  }, [isExpanded]);

  const { position, setPosition, handleMouseDown } = useDraggable(isExpanded);
  
  const currentSize = isExpanded ? expandedSize : smallSize;
  const setSize = isExpanded ? setExpandedSize : setSmallSize;
  const isWide = currentSize.width >= 600;

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = currentSize.width;
    const startHeight = currentSize.height;
    const startPosX = position.x;
    const startPosY = position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newW = startWidth;
      let newH = startHeight;
      let newX = startPosX;
      let newY = startPosY;

      if (!isExpanded) {
        // Small mode (anchored bottom-right)
        if (direction.includes('left')) {
          newW = Math.max(300, Math.min(window.innerWidth - 40, startWidth - deltaX));
        } else if (direction.includes('right')) {
          newW = Math.max(300, Math.min(window.innerWidth - 40, startWidth + deltaX));
          newX = startPosX + (newW - startWidth);
        }

        if (direction.includes('top')) {
          newH = Math.max(350, Math.min(window.innerHeight - 100, startHeight - deltaY));
        } else if (direction.includes('bottom')) {
          newH = Math.max(350, Math.min(window.innerHeight - 100, startHeight + deltaY));
          newY = startPosY + (newH - startHeight);
        }
      } else {
        // Expanded mode (anchored top-left)
        if (direction.includes('right')) {
          newW = Math.max(400, Math.min(window.innerWidth - 40, startWidth + deltaX));
        } else if (direction.includes('left')) {
          newW = Math.max(400, Math.min(window.innerWidth - 40, startWidth - deltaX));
          newX = startPosX - (newW - startWidth);
        }

        if (direction.includes('bottom')) {
          newH = Math.max(400, Math.min(window.innerHeight - 120, startHeight + deltaY));
        } else if (direction.includes('top')) {
          newH = Math.max(400, Math.min(window.innerHeight - 120, startHeight - deltaY));
          newY = startPosY - (newH - startHeight);
        }
      }

      setSize({ width: newW, height: newH });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      const popup = document.getElementById('chat-popup-container');
      if (popup && popup.contains(e.target as Node)) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalMouseDown, true);
    return () => document.removeEventListener('mousedown', handleGlobalMouseDown, true);
  }, []);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically set active conversation if passed
  useEffect(() => {
    if (activeConvId && conversations.length > 0) {
      const target = conversations.find(c => c.id === activeConvId);
      if (target && target.id !== activeConv?.id) {
        setActiveConv(target);
      }
    }
  }, [activeConvId, conversations]);

  // Listen to conversations
  useEffect(() => {
    if (!user || !db || !isChatOpen) return;
    
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Client-side role filtering to bypass need for composite indexes or rules changes
        if (isSellerView && data.sellerId !== user.uid) return;
        if (!isSellerView && data.buyerId !== user.uid) return;
        convs.push({
          id: docSnap.id,
          lastMessage: data.lastMessage || null,
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          unreadCountBuyer: data.unreadCountBuyer || 0,
          unreadCountSeller: data.unreadCountSeller || 0,
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
    }, (error) => {
      console.error("Firestore Conversations Listener Error:", error.message);
    });

    return () => unsubscribe();
  }, [user, isChatOpen, isSellerView]);

  // Listen to active conversation messages
  useEffect(() => {
    if (!user || !activeConv || !db || !isChatOpen) return;

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
        
        // Also reset conversation-level unread count
        const convRef = doc(db!, "conversations", activeConv.id);
        batch.update(convRef, {
          [isSellerView ? "unreadCountSeller" : "unreadCountBuyer"]: 0
        });
        
        batch.commit()
          .then(() => refreshUnreadCount())
          .catch(console.error);
      }
    }, (error) => {
      console.error("Firestore Messages Listener Error:", error.message);
    });

    return () => unsubscribe();
  }, [activeConv, user, isChatOpen, refreshUnreadCount]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, otherTyping, activeConv]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConv || !user || !db) return;

    const text = newMessage.trim();
    setNewMessage(""); 
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    const recipient = activeConv.participants.find(p => p.userId !== user.uid);
    const recipientId = recipient ? recipient.userId : "";

    try {
      const convRef = doc(db, "conversations", activeConv.id);
      const messagesRef = collection(convRef, "messages");
      
      await addDoc(messagesRef, {
        senderId: user.uid,
        recipientId: recipientId,
        recipientRole: isSellerView ? "buyer" : "seller",
        text,
        read: false,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(convRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        // Increment the *other* person's unread count
        [isSellerView ? "unreadCountBuyer" : "unreadCountSeller"]: increment(1)
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        handleSendMessage();
      }
    }
  };

  if (loading || !user || !isChatOpen) return null;

  // Desktop styles vs Mobile styles
  // Dynamic z-index so it can overlap navbar dropdowns when active, or sit behind when navbar is clicked.
  const zClass = isActive ? 'z-[60]' : 'z-40';
  
  const popupClasses = isExpanded 
    ? `fixed top-[80px] md:top-[100px] left-4 md:left-10 ${zClass} bg-white rounded-xl shadow-2xl flex flex-col overflow-visible border border-[#e4e5e7]`
    : `fixed bottom-0 right-4 md:right-8 ${zClass} bg-white rounded-t-xl shadow-2xl flex flex-col overflow-visible border border-[#e4e5e7]`;

  const popupStyle: React.CSSProperties = {
    width: `${currentSize.width}px`,
    height: `${currentSize.height}px`,
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div 
      id="chat-popup-container"
      className={popupClasses} 
      style={popupStyle}
    >
      {/* ── All Sides & Corners Resize Handles (Works for both Small & Expanded modes!) ── */}
      {/* Edges */}
      <div onMouseDown={(e) => handleResizeStart(e, 'top')} className="absolute -top-1 left-2 right-2 h-2 cursor-ns-resize z-50 hover:bg-teal-500/50 transition-colors" />
      <div onMouseDown={(e) => handleResizeStart(e, 'bottom')} className="absolute -bottom-1 left-2 right-2 h-2 cursor-ns-resize z-50 hover:bg-teal-500/50 transition-colors" />
      <div onMouseDown={(e) => handleResizeStart(e, 'left')} className="absolute top-2 -left-1 bottom-2 w-2 cursor-ew-resize z-50 hover:bg-teal-500/50 transition-colors" />
      <div onMouseDown={(e) => handleResizeStart(e, 'right')} className="absolute top-2 -right-1 bottom-2 w-2 cursor-ew-resize z-50 hover:bg-teal-500/50 transition-colors" />
      
      {/* Corners */}
      <div onMouseDown={(e) => handleResizeStart(e, 'top-left')} className="absolute -top-2 -left-2 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center group">
        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-teal-500 transition-colors" />
      </div>
      <div onMouseDown={(e) => handleResizeStart(e, 'top-right')} className="absolute -top-2 -right-2 w-4 h-4 cursor-nesw-resize z-50 flex items-center justify-center group">
        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-teal-500 transition-colors" />
      </div>
      <div onMouseDown={(e) => handleResizeStart(e, 'bottom-left')} className="absolute -bottom-2 -left-2 w-4 h-4 cursor-nesw-resize z-50 flex items-center justify-center group">
        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-teal-500 transition-colors" />
      </div>
      <div onMouseDown={(e) => handleResizeStart(e, 'bottom-right')} className="absolute -bottom-2 -right-2 w-4 h-4 cursor-nwse-resize z-50 flex items-center justify-center group">
        <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-teal-500 transition-colors" />
      </div>

      {/* Inner Container */}
      <div className={`w-full h-full flex ${isExpanded ? 'rounded-xl' : 'rounded-t-xl'} overflow-hidden bg-white`}>
        {/* ── Left Pane: Conversations List (Hidden when in a chat unless expanded/wide) ── */}
        <div className={`${(activeConv && !isWide) ? 'hidden' : 'flex'} flex-col w-full ${isWide ? 'w-1/3 min-w-[260px] max-w-[320px] border-r border-[#e4e5e7]' : ''} h-full`}>
        <div 
          className="p-4 border-b border-[#e4e5e7] bg-[#222325] text-white flex items-center justify-between cursor-move"
          onMouseDown={handleMouseDown}
        >
          <h1 className="text-lg font-bold pointer-events-none">Messages {isSellerView ? "(Seller)" : "(Buyer)"}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors hidden md:block">
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={closeChat} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="p-3 border-b border-[#e4e5e7] bg-[#fafafa]">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#74767e]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white text-sm text-[#404145] pl-8 pr-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-[#1dbf73] transition-all border border-[#e4e5e7]"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-[#74767e] text-sm">
              No conversations yet.
            </div>
          ) : (
            conversations.map(conv => {
              const otherParticipant = conv.participants.find(p => p.userId !== user.uid)?.user;
              if (!otherParticipant) return null;
              
              const isActive = activeConv?.id === conv.id;
              const unread = isSellerView ? conv.unreadCountSeller : conv.unreadCountBuyer;
              const hasUnread = (unread ?? 0) > 0;

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-[#f5f5f5] transition-colors border-b border-[#f5f5f5] ${isActive ? 'bg-[#f0f4ff]' : ''}`}
                >
                  <Avatar src={otherParticipant.avatar} alt={otherParticipant.name} size="md" initials={otherParticipant.name[0]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold text-sm truncate ${hasUnread ? 'text-[#222325]' : 'text-[#404145]'}`}>
                        {otherParticipant.name}
                      </span>
                      <span className={`text-[10px] ${hasUnread ? 'text-[#1dbf73] font-bold' : 'text-[#b5b6ba]'}`}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate ${hasUnread ? 'font-bold text-[#222325]' : 'text-[#74767e]'}`}>
                        {conv.lastMessage || "Started a conversation"}
                      </p>
                      {hasUnread && (
                        <span className="bg-[#1dbf73] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Pane: Active Chat ── */}
      <div className={`${(!activeConv && !isWide) ? 'hidden' : 'flex'} flex-col flex-1 h-full bg-[#fafafa]`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#fafafa]">
            <MessageSquare size={40} className="text-[#c5c6c9] mb-4" />
            <h2 className="text-lg font-bold text-[#404145] mb-2">Select a conversation</h2>
            <p className="text-sm text-[#74767e]">Choose a conversation from the list to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div 
              className="p-3 border-b border-[#e4e5e7] bg-white flex items-center justify-between shadow-sm z-10 cursor-move"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-3 pointer-events-none">
                <button 
                  className={`${isWide ? 'hidden' : ''} p-1.5 hover:bg-[#f5f5f5] rounded-full text-[#404145] pointer-events-auto`}
                  onClick={() => setActiveConv(null)}
                >
                  <ArrowLeft size={18} />
                </button>
                {(() => {
                  const otherUser = activeConv.participants.find(p => p.userId !== user.uid)?.user;
                  if (!otherUser) return null;
                  return (
                    <div className="flex items-center gap-3">
                      <Avatar src={otherUser.avatar} alt={otherUser.name} size="sm" initials={otherUser.name[0]} />
                      <div>
                        <h2 className="font-bold text-sm text-[#404145] leading-tight">{otherUser.name}</h2>
                        {otherTyping ? (
                          <span className="text-[10px] text-[#1dbf73] font-medium animate-pulse">Typing...</span>
                        ) : (
                          <span className="text-[10px] text-[#74767e]">Active now</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {!isExpanded && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setIsExpanded(true)} className="p-1.5 hover:bg-[#f5f5f5] rounded-md transition-colors hidden md:block">
                    <Maximize2 size={16} className="text-[#74767e]" />
                  </button>
                  <button onClick={closeChat} className="p-1.5 hover:bg-[#f5f5f5] rounded-md transition-colors">
                    <X size={18} className="text-[#74767e]" />
                  </button>
                </div>
              )}
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
                  <div key={msg.id} className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && showAvatar ? (
                        <Avatar src={otherUser?.avatar} alt={otherUser?.name || "U"} size="sm" initials={otherUser?.name?.[0]} />
                      ) : (
                        !isMine && <div className="w-8 flex-shrink-0" />
                      )}
                      
                      <div 
                        className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm break-words ${
                          isMine 
                            ? 'bg-[#1dbf73] text-white rounded-br-sm' 
                            : 'bg-white border border-[#e4e5e7] text-[#404145] rounded-bl-sm'
                        }`}
                        style={{ wordBreak: 'break-word' }}
                      >
                        {msg.text}
                      </div>
                    </div>
                    {/* Timestamp */}
                    <span className={`text-[10px] text-[#b5b6ba] ${isMine ? 'mr-1' : 'ml-10'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-[#e4e5e7] bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-[#f5f5f5] text-sm text-[#404145] px-4 py-2.5 rounded-2xl outline-none focus:bg-white focus:ring-1 focus:ring-[#1dbf73] transition-all border border-transparent focus:border-[#1dbf73] resize-none overflow-y-auto max-h-[120px] break-words [word-break:break-word] [overflow-wrap:anywhere] leading-relaxed"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-[#222325] hover:bg-[#404145] text-white p-2.5 rounded-full transition-colors disabled:opacity-50 flex-shrink-0 mb-0.5"
                >
                  <Send size={16} />
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
