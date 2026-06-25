import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { useUIStore } from '../../store/uiStore';

export default function ServerRail() {
  const [communities, setCommunities] = useState<any[]>([]);
  const { activeCommunityId, setActiveCommunity, setActiveDm } = useUIStore();

  useEffect(() => {
    const q = query(collection(db, "communities"));
    return onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setCommunities(list);
    });
  }, []);

  const createServer = async () => {
    const name = prompt("Enter server name:");
    if (!name) return;
    const currentUser = auth.currentUser;
    const ownerName = currentUser?.email?.split('@')[0] || "Unknown";

    await addDoc(collection(db, "communities"), {
      name: name.trim(),
      ownerId: currentUser?.uid || "",
      ownerName: ownerName,
      metsContributed: ownerName.toLowerCase() === 'bluz' ? 500 : 0, 
      createdAt: Date.now()
    });
  };

  return (
    <div className="w-[72px] bg-bgTertiary h-full flex flex-col items-center py-3 space-y-2 flex-shrink-0">
      <button onClick={() => setActiveDm('home')} className={`w-12 h-12 flex items-center justify-center transition-all ${!activeCommunityId ? 'bg-brandGreen rounded-2xl' : 'bg-bgPrimary rounded-3xl hover:rounded-2xl hover:bg-brandGreen'}`}>
        <img src="/branding/drixianlogo.png" alt="Home" className="w-7 h-7 object-contain" />
      </button>
      <div className="w-8 h-[2px] bg-bgSecondary rounded" />
      <div className="w-full flex flex-col items-center space-y-2 overflow-y-auto flex-1">
        {communities.map((community) => {
          const isActive = activeCommunityId === community.id;
          const isBluzOwned = community.ownerName?.toLowerCase() === 'bluz';
          
          return (
            <button
              key={community.id}
              onClick={() => setActiveCommunity(community.id)}
              className={`relative w-12 h-12 flex items-center justify-center font-bold text-white transition-all ${
                isActive ? 'bg-brandGreen rounded-2xl' : 'bg-bgPrimary rounded-3xl hover:rounded-2xl hover:bg-brandGreen'
              } ${isBluzOwned ? 'border-2 border-amber-400' : ''}`}
            >
              <span>{community.name.substring(0, 2).toUpperCase()}</span>
              {isBluzOwned && <span className="absolute -top-1 -right-1 text-[10px] bg-amber-500 rounded-full px-1 text-black">⭐</span>}
            </button>
          );
        })}
        <button onClick={createServer} className="w-12 h-12 bg-bgPrimary text-brandGreen rounded-3xl hover:rounded-2xl hover:bg-brandGreen hover:text-white transition-all font-light text-2xl flex items-center justify-center">
          +
        </button>
      </div>
    </div>
  );
}
