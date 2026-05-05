import { create } from 'zustand';
import { getAdminConfig } from '@/services/firebase';

interface SettingsState {
  youtubeApiKey: string;
  theme: 'dark' | 'light';
  init: () => Promise<void>;
  setYoutubeApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  youtubeApiKey: '',
  theme: 'dark',
  init: async () => {
    try {
      const config = await getAdminConfig();
      set({ youtubeApiKey: config.youtubeApiKey });
    } catch {
      // use local storage fallback
      const key = localStorage.getItem('nm_yt_api_key') || '';
      set({ youtubeApiKey: key });
    }
  },
  setYoutubeApiKey: (key) => {
    set({ youtubeApiKey: key });
    localStorage.setItem('nm_yt_api_key', key);
  },
}));
