import { create } from 'zustand';

interface UIState {
  activeCommunityId: string | null;
  activeChannelId: string | null;
  activeDmId: string | null;
  setActiveCommunity: (id: string | null) => void;
  setActiveChannel: (id: string | null) => void;
  setActiveDm: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeCommunityId: null,
  activeChannelId: null,
  activeDmId: null,
  setActiveCommunity: (id) => set({ activeCommunityId: id, activeDmId: null }),
  setActiveChannel: (id) => set({ activeChannelId: id }),
  setActiveDm: (id) => set({ activeDmId: id, activeCommunityId: null, activeChannelId: null }),
}));
