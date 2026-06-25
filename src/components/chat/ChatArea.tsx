import React, { useEffect, useState, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useUIStore } from '../../store/uiStore';
import { evaluateServerPremium } from '../../utils/premiumEvaluator';
import MemberList from './MemberList';

export default function ChatArea() {
  const { activeChannelId, activeCommunityId } = useUIStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [currentServer, setCurrentServer] = useState<any>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCommunityId) return;
    return onSnapshot(doc(db, "communities", activeCommunityId), (docSnap) => {
      if (docSnap.exists()) setCurrentServer(docSnap.data());
    });
  }, [activeCommunityId]);

  useEffect(() => {
    if (!activeChannelId) return;
    const q = query(collection(db, "channels", activeChannelId, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setMessages(list);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
  }, [activeChannelId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChannelId) return;
    const user = auth.currentUser;
    const name = user?.email?.split('@')[0] || "User";

    await addDoc(collection(db, "channels", activeChannelId, "messages"), {
      userId: user?.uid,
      username: name,
      content: input.trim(),
      timestamp: Date.now()
    });
    setInput('');
  };

  const premium = evaluateServerPremium(currentServer?.metsContributed || 0, currentServer?.ownerName || "");

  if (!activeChannelId) {
    return (
      <div className="flex-1 bg-bgPrimary flex flex-col items-center justify-center text-center">
        <img src="/branding/drixianlogo.png" className="w-20 h-20 opacity-30 mb-2 object-contain" />
        <h3 className="text-gray-400 font-bold">Select a text channel inside your space to start communicating.</h3>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bgPrimary flex h-full overflow-hidden min-w-0">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="h-12 border-b border-black/20 flex items-center px-4 justify-between font-bold text-white shadow-sm flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-xl">#</span>
            <span className="text-sm">terminal-stream</span>
          </div>
          {premium.hasAnimatedBanner && (
            <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded animate-pulse">
              ✨ Animated Banner & Asset Pipeline Live
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUserBluz = msg.username?.toLowerCase() === 'bluz';
            return (
              <div key={msg.id} className="flex items-start space-x-3 group">
                <div className={`w-10 h-10 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-white ${isUserBluz ? 'border border-amber-400' : ''}`}>
                  {msg.username?.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-sm font-bold cursor-pointer ${isUserBluz || premium.hasGradientNames ? 'premium-gradient-text' : 'text-white'}`}>
                      {msg.username}
                    </span>
                    {isUserBluz && <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-extrabold uppercase">Creator</span>}
                    <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-[#dcddde] mt-0.5">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSendMessage} className="px-4 pb-6">
          <div className="bg-[#40444b] rounded-lg px-4 py-2.5">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Send message..." className="bg-transparent text-sm text-[#dcddde] w-full focus:outline-none" />
          </div>
        </form>
      </div>

      <MemberList hasPremiumRoleIcons={premium.hasCustomRoleIcons} />
    </div>
  );
}
