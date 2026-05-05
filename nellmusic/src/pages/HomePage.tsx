import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Music2, TrendingUp, ListMusic } from 'lucide-react';
import { Link } from 'wouter';
import { usePlayerStore } from '@/store/playerStore';
import { usePublicPlaylistStore } from '@/store/publicPlaylistStore';
import { Playlist } from '@/types';
import { toast } from 'sonner';

const SAD_SONGS_2026 = [
  { id: 'Gd0xqFv7JNg', title: 'Too Good At Goodbyes', artist: 'Sam Smith', thumbnail: 'https://img.youtube.com/vi/Gd0xqFv7JNg/hqdefault.jpg', duration: 215, youtubeId: 'Gd0xqFv7JNg', addedAt: Date.now() },
  { id: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg', duration: 229, youtubeId: 'RgKAFK5djSk', addedAt: Date.now() },
  { id: 'hLQl3WQQoQ0', title: 'Someone Like You', artist: 'Adele', thumbnail: 'https://img.youtube.com/vi/hLQl3WQQoQ0/hqdefault.jpg', duration: 285, youtubeId: 'hLQl3WQQoQ0', addedAt: Date.now() },
  { id: 'kXYiU_JCYtU', title: 'Numb', artist: 'Linkin Park', thumbnail: 'https://img.youtube.com/vi/kXYiU_JCYtU/hqdefault.jpg', duration: 187, youtubeId: 'kXYiU_JCYtU', addedAt: Date.now() },
  { id: '450p7goxZqg', title: 'Fix You', artist: 'Coldplay', thumbnail: 'https://img.youtube.com/vi/450p7goxZqg/hqdefault.jpg', duration: 295, youtubeId: '450p7goxZqg', addedAt: Date.now() },
  { id: 'pRpeEdMmmQ0', title: 'Shake It Out', artist: 'Florence + The Machine', thumbnail: 'https://img.youtube.com/vi/pRpeEdMmmQ0/hqdefault.jpg', duration: 240, youtubeId: 'pRpeEdMmmQ0', addedAt: Date.now() },
];

function SadSongCard({ track, index }: { track: typeof SAD_SONGS_2026[0]; index: number }) {
  const { playTrack } = usePlayerStore();
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex items-center gap-3 p-3 rounded-xl group cursor-pointer hover:bg-white/5 transition-colors"
      onClick={() => { playTrack(track); toast.success(`Playing "${track.title}"`); }}
    >
      <div className="relative">
        <img src={track.thumbnail} alt={track.title} className="w-14 h-14 rounded-lg object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <Play size={20} fill="white" className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{track.title}</p>
        <p className="text-xs text-white/50 truncate">{track.artist}</p>
      </div>
      <span className="text-xs text-white/30">#{index + 1}</span>
    </motion.div>
  );
}

function PublicPlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  const { playTrack, addToQueue } = usePlayerStore();
  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!playlist.tracks.length) return;
    playTrack(playlist.tracks[0]);
    playlist.tracks.slice(1).forEach(t => addToQueue(t));
    toast.success(`Playing "${playlist.title}"`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/playlist/${playlist.id}`}>
        <div className="rounded-2xl overflow-hidden cursor-pointer" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}>
          <div className="relative aspect-square overflow-hidden">
            <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={handlePlay} className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40 hover:scale-110 transition-transform">
                <Play size={20} fill="white" className="text-white ml-1" />
              </button>
            </div>
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/80 text-white">ADMIN PICK</span>
            </div>
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm truncate">{playlist.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ListMusic size={11} className="text-white/40" />
              <p className="text-xs text-white/40">{playlist.trackCount} lagu</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function HomePage() {
  const { publicPlaylists } = usePublicPlaylistStore();

  return (
    <div className="px-4 py-6 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Halo, Selamat Datang 👋</h1>
        <p className="text-white/50 text-sm">Dengerin musik favoritmu sekarang</p>
      </motion.div>

      {/* Sad Songs 2026 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Music2 size={14} className="text-blue-400" />
          </div>
          <h2 className="font-bold text-base">Lagu Galau 2026 🥺</h2>
        </div>
        <div className="space-y-1">
          {SAD_SONGS_2026.map((t, i) => <SadSongCard key={t.id} track={t} index={i} />)}
        </div>
      </section>

      {/* Public Playlists */}
      {publicPlaylists.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <h2 className="font-bold text-base">Playlist dari NellMusic</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {publicPlaylists.map((pl, i) => <PublicPlaylistCard key={pl.id} playlist={pl} index={i} />)}
          </div>
        </section>
      )}

      {publicPlaylists.length === 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <h2 className="font-bold text-base">Playlist NellMusic</h2>
          </div>
          <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(30,15,50,0.4)', border: '1px dashed rgba(168,85,247,0.2)' }}>
            <ListMusic size={36} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Admin belum upload playlist</p>
          </div>
        </section>
      )}
    </div>
  );
}
