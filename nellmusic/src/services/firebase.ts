import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Playlist, AdminConfig, SocialLink } from '@/types';

const firebaseConfig = {
  apiKey: "AIzaSyA1htQRPEeP07arataGdYpr8dPdZg5mezY",
  authDomain: "code-chat-219c7.firebaseapp.com",
  projectId: "code-chat-219c7",
  storageBucket: "code-chat-219c7.firebasestorage.app",
  messagingSenderId: "833143379454",
  appId: "1:833143379454:web:a3751760d3bfc7ee135caf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ======= Admin Config =======
export const getAdminConfig = async (): Promise<AdminConfig> => {
  const docRef = doc(db, 'config', 'admin');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as AdminConfig;
  }
  return {
    youtubeApiKey: '',
    socialLinks: [
      { id: '1', platform: 'Instagram', url: 'https://instagram.com/nellmusic', icon: 'instagram' },
      { id: '2', platform: 'TikTok', url: 'https://tiktok.com/@nellmusic', icon: 'tiktok' },
      { id: '3', platform: 'WhatsApp', url: 'https://wa.me/628xxxxxxxxx', icon: 'whatsapp' },
    ],
    aboutText: 'NellMusic – Music for the soul. Curated playlists and vibes handpicked just for you.',
  };
};

export const saveAdminConfig = async (config: AdminConfig) => {
  await setDoc(doc(db, 'config', 'admin'), config);
};

// ======= Public Playlists =======
export const uploadPublicPlaylist = async (playlist: Playlist) => {
  const data = { ...playlist, uploadedByAdmin: true, isPublic: true, uploadedAt: Timestamp.now() };
  await setDoc(doc(db, 'publicPlaylists', playlist.id), data);
};

export const deletePublicPlaylist = async (id: string) => {
  await deleteDoc(doc(db, 'publicPlaylists', id));
};

export const getPublicPlaylists = async (): Promise<Playlist[]> => {
  const q = query(collection(db, 'publicPlaylists'), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as Playlist);
};

export const subscribePublicPlaylists = (cb: (playlists: Playlist[]) => void) => {
  const q = query(collection(db, 'publicPlaylists'), orderBy('uploadedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => d.data() as Playlist));
  });
};

// ======= Notifications =======
export interface NotifDoc {
  id: string;
  title: string;
  message: string;
  thumbnail: string;
  playlistId: string;
  createdAt: any;
}

export const subscribeNotifications = (cb: (notifs: NotifDoc[]) => void) => {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotifDoc)));
  });
};

export const addNotification = async (data: Omit<NotifDoc, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'notifications'), { ...data, createdAt: Timestamp.now() });
};
