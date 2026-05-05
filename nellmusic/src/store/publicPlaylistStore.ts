import { create } from 'zustand';
import { Playlist } from '@/types';

interface PublicPlaylistState {
  publicPlaylists: Playlist[];
  setPublicPlaylists: (p: Playlist[]) => void;
}

export const usePublicPlaylistStore = create<PublicPlaylistState>((set) => ({
  publicPlaylists: [],
  setPublicPlaylists: (p) => set({ publicPlaylists: p }),
}));
