import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useUIStore } from '../../store/uiStore';
import { evaluateServerPremium } from '../../utils/premiumEvaluator';

export default function SubSidebar() {
  const { activeCommunityId, activeChannelId, setActiveChannel } = useUIStore();
  const [channels, setChannels] = useState<any[]>([]);
  const [currentServer, setCurrentServer] = useState<any>(null);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!activeCommunityId) {
      setCurrentServer(null);
      return;
    }
    
    const serverRef = doc(db, "communities", activeCommunityId);
    const unSubServer = onSnapshot(serverRef, (snapshot) => {
      if(snapshot.exists()) setCurrentServer({ id: snapshot.id, ...snapshot.data() });
    });

    const q = query(collection(db, "channels"), where("communityId", "==", activeCommunityId));
    const unSubChannels = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setChannels(list);
    });

    return () => { unSubServer(); unSubChannels(); };
  }, [activeCommunityId]);

  const premium = currentServer ? evaluateServerPremium(currentServer.metsContributed || 0, currentServer.ownerName || "") : null;

  return (
    <div className="w-60 bg-bgSecondary h-full flex flex-col flex-shrink-0">
      <div className="h-12 border-b border-black/20 flex flex-col justify-center px-4 shadow-sm text-white">
        <div className="font-bold truncate">{currentServer ? currentServer.name : "Direct Messages"}</div>
        {premium && (
          <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            Mets Tier {premium.tier} Activated {premium.tier === 3 && "🚀 Max Features"}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-[2px]">
        {activeCommunityId ? (
          channels.map(chan => (
            <button key={chan.id} onClick={() => setActiveChannel(chan.id)} className={`w-full flex items-center px-2 py-1.5 rounded text-sm ${activeChannelId === chan.id ? 'bg-[#393c43] text-white' : 'text-gray-400 hover:bg-[#34373c]'}`}>
              <span className="text-gray-500 text-lg mr-1.5">#</span>
              <span className="truncate">{chan.name}</span>
            </button>
          ))
        ) : (
          <div className="text-xs text-gray-500 p-2 italic">DMs Dashboard Workspace</div>
        )}
      </div>

      <div className="h-14 bg-[#292b2f] px-2 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-brandGreen flex items-center justify-center text-white font-bold flex-shrink-0">
            {currentUser?.email?.substring(0,1).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate">{currentUser?.email?.split('@')[0]}</span>
            <span className="text-xs text-amber-400 font-medium">Mets: Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
