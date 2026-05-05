import { create } from 'zustand';
import { NotifDoc } from '@/services/firebase';

interface NotifState {
  notifications: NotifDoc[];
  unread: number;
  setNotifications: (n: NotifDoc[]) => void;
  markAllRead: () => void;
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unread: 0,
  setNotifications: (n) => {
    const prev = get().notifications;
    const newCount = n.length - prev.length;
    set({ notifications: n, unread: get().unread + (newCount > 0 ? newCount : 0) });
  },
  markAllRead: () => set({ unread: 0 }),
}));
