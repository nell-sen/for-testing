import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Library, Heart, Settings, Bell, Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ChevronUp, Music2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useNotifStore } from '@/store/notifStore';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { subscribePublicPlaylists, subscribeNotifications } from '@/services/firebase';
import { usePublicPlaylistStore } from '@/store/publicPlaylistStore';
import { sendPlaylistNotification } from '@/services/pushNotifications';
import { formatDuration } from '@/lib/utils';

const NAV = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/library', icon: Library, label: 'Library' },
  { href: '/favorites', icon: Heart, label: 'Favorites' },
];

function DominantColor({ src, onColor }: { src: string; onColor: (c: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      c.width = 50; c.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      const d = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i+1]; b += d[i+2]; }
      const pix = d.length / 4;
      onColor(`rgb(${Math.round(r/pix)},${Math.round(g/pix)},${Math.round(b/pix)})`);
    };
    img.src = src;
  }, [src]);
  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
}

function MiniPlayer() {
  const { currentTrack, isPlaying, volume, progress, duration, repeatMode, shuffle, pause, resume, next, prev, setVolume, toggleRepeat, toggleShuffle, setProgress } = usePlayerStore();
  const { seekTo } = useYouTubePlayer();
  const [expanded, setExpanded] = useState(false);

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* Hidden YT player */}
      <div id="yt-player-hidden" style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, pointerEvents: 'none' }} />

      {/* Expanded Player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(10,5,20,0.97)', backdropFilter: 'blur(40px)' }}
          >
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
              <button onClick={() => setExpanded(false)} className="self-end p-2 text-white/50 hover:text-white">
                <ChevronUp size={24} />
              </button>
              <motion.img
                key={currentTrack.thumbnail}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-72 h-72 rounded-2xl object-cover shadow-2xl"
              />
              <div className="text-center">
                <p className="text-xl font-bold">{currentTrack.title}</p>
                <p className="text-white/60">{currentTrack.artist}</p>
              </div>

              {/* Progress */}
              <div className="w-full max-w-sm space-y-1">
                <input
                  type="range" min={0} max={duration || 100} value={progress}
                  onChange={e => seekTo(Number(e.target.value))}
                  className="w-full h-1 accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>{formatDuration(progress)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                <button onClick={toggleShuffle} className={shuffle ? 'text-purple-400' : 'text-white/40'}>
                  <Shuffle size={20} />
                </button>
                <button onClick={prev} className="text-white/80 hover:text-white"><SkipBack size={28} /></button>
                <button
                  onClick={isPlaying ? pause : resume}
                  className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40 hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={28} fill="white" className="text-white" /> : <Play size={28} fill="white" className="text-white ml-1" />}
                </button>
                <button onClick={next} className="text-white/80 hover:text-white"><SkipForward size={28} /></button>
                <button onClick={toggleRepeat} className={repeatMode !== 'none' ? 'text-purple-400' : 'text-white/40'}>
                  <Repeat size={20} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full max-w-sm">
                <Volume2 size={16} className="text-white/40" />
                <input
                  type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="flex-1 h-1 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-16 left-0 right-0 z-40 px-3"
      >
        <div
          className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer"
          style={{ background: 'rgba(30,15,50,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(168,85,247,0.2)' }}
          onClick={() => setExpanded(true)}
        >
          <img src={currentTrack.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
            <p className="text-xs text-white/50 truncate">{currentTrack.artist}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={e => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
              className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center hover:scale-105 transition-transform">
              {isPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }} className="text-white/60 hover:text-white">
              <SkipForward size={18} />
            </button>
          </div>
        </div>
        {/* thin progress line */}
        <div className="h-0.5 mt-1 rounded-full bg-white/10 mx-2">
          <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </motion.div>
    </>
  );
}

function NotifBell() {
  const { notifications, unread, markAllRead, setNotifications } = useNotifStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeNotifications((notifs) => {
      const prev = useNotifStore.getState().notifications;
      if (notifs.length > prev.length && prev.length > 0) {
        const newest = notifs[0];
        sendPlaylistNotification('🎵 Playlist Baru!', newest.message, newest.thumbnail);
      }
      setNotifications(notifs);
    });
    return unsub;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(v => !v); if (!open) markAllRead(); }}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <Bell size={22} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: 'rgba(20,10,40,0.98)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <div className="p-4 border-b border-white/10">
              <p className="font-bold text-sm">Notifikasi</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-white/40 text-center">Belum ada notifikasi</p>
              ) : notifications.map(n => (
                <div key={n.id} className="flex gap-3 p-3 hover:bg-white/5 border-b border-white/5">
                  <img src={n.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{n.title}</p>
                    <p className="text-xs text-white/50">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentTrack } = usePlayerStore();
  const { setPublicPlaylists } = usePublicPlaylistStore();
  const [bgColor, setBgColor] = useState('rgb(30,15,50)');

  useEffect(() => {
    const unsub = subscribePublicPlaylists(setPublicPlaylists);
    return unsub;
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#080410' }}>
      {/* Dynamic background */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-[3000ms] ease-in-out"
        style={{
          background: currentTrack
            ? `radial-gradient(ellipse 80% 60% at 50% 0%, ${bgColor}88 0%, transparent 70%)`
            : `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(88,28,135,0.4) 0%, transparent 70%)`,
        }}
      />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 50% at 80% 80%, rgba(168,85,247,0.08) 0%, transparent 60%)',
      }} />

      {currentTrack && (
        <DominantColor src={currentTrack.thumbnail} onColor={setBgColor} />
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(8,4,16,0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <Music2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">NellMusic</span>
        </div>
        <div className="flex items-center gap-1">
          <NotifBell />
          <Link href="/admin">
            <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <Settings size={22} />
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16 pb-36">
        {children}
      </main>

      {/* Mini Player */}
      <MiniPlayer />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2"
        style={{ background: 'rgba(8,4,16,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(168,85,247,0.1)' }}>
        <div className="flex">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} className="flex-1">
                <div className={`flex flex-col items-center gap-1 py-2 transition-colors ${active ? 'text-purple-400' : 'text-white/40 hover:text-white/70'}`}>
                  <Icon size={22} className={active ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''} />
                  <span className="text-[10px] font-medium">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
