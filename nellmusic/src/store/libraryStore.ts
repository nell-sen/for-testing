import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Track } from '@/types';

interface LibraryState {
  playlists: Playlist[];
  favorites: Track[];
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (id: string) => void;
  isDuplicate: (trackId: string) => boolean;
  toggleFavorite: (track: Track) => void;
  isFavorite: (id: string) => boolean;
  getPlaylistById: (id: string) => Playlist | undefined;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: [],
      favorites: [],

      addPlaylist: (playlist) => {
        set(s => ({
          playlists: [playlist, ...s.playlists.filter(p => p.id !== playlist.id)],
        }));
      },

      removePlaylist: (id) => {
        set(s => ({ playlists: s.playlists.filter(p => p.id !== id) }));
      },

      isDuplicate: (trackId) => {
        return get().playlists.some(p => p.tracks.some(t => t.id === trackId));
      },

      toggleFavorite: (track) => {
        set(s => {
          const exists = s.favorites.some(f => f.id === track.id);
          return { favorites: exists ? s.favorites.filter(f => f.id !== track.id) : [track, ...s.favorites] };
        });
      },

      isFavorite: (id) => get().favorites.some(f => f.id === id),

      getPlaylistById: (id) => get().playlists.find(p => p.id === id),
    }),
    { name: 'nm_library' }
  )
);
