import { useParams } from 'wouter';
import { motion } from 'framer-motion';
import { Play, Music2, Clock, Heart } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePublicPlaylistStore } from '@/store/publicPlaylistStore';
import { usePlayerStore } from '@/store/playerStore';
import { Track } from '@/types';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

function TrackRow({ track, index, onPlay }: { track: Track; index: number; onPlay: () => void }) {
  const { currentTrack, isPlaying } = usePlayerStore();
  const { toggleFavorite, isFavorite } = useLibraryStore();
  const active = currentTrack?.id === track.id;
  const fav = isFavorite(track.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 p-3 rounded-xl group cursor-pointer transition-colors ${active ? 'bg-purple-500/15' : 'hover:bg-white/5'}`}
      onClick={onPlay}
    >
      <div className="w-6 text-center">
        {active && isPlaying ? (
          <div className="flex gap-0.5 items-end h-4 justify-center">
            {[0.4, 0.7, 1, 0.5].map((h, i) => (
              <div key={i} className="w-0.5 bg-purple-400 animate-pulse rounded-full" style={{ height: `${h * 100}%`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <span className="text-xs text-white/30 group-hover:hidden">{index + 1}</span>
        )}
        {!active && <Play size={14} className="text-white hidden group-hover:block mx-auto" />}
      </div>
      <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${active ? 'text-purple-400' : ''}`}>{track.title}</p>
        <p className="text-xs text-white/40 truncate">{track.artist}</p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); toggleFavorite(track); toast.success(fav ? 'Dihapus dari favorit' : 'Ditambah ke favorit'); }}
        className={`p-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${fav ? 'opacity-100 text-red-400' : 'text-white/30 hover:text-red-400'}`}
      >
        <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
      </button>
      <span className="text-xs text-white/30">{formatDuration(track.duration)}</span>
    </motion.div>
  );
}

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { getPlaylistById } = useLibraryStore();
  const { publicPlaylists } = usePublicPlaylistStore();
  const { playTrack, addToQueue } = usePlayerStore();

  const localPl = getPlaylistById(id!);
  const publicPl = publicPlaylists.find(p => p.id === id);
  const playlist = localPl || publicPl;

  if (!playlist) {
    return (
      <div className="px-4 py-20 text-center text-white/30">
        <Music2 size={48} className="mx-auto mb-4 opacity-30" />
        <p>Playlist tidak ditemukan</p>
      </div>
    );
  }

  const playAll = () => {
    if (!playlist.tracks.length) return;
    playTrack(playlist.tracks[0]);
    playlist.tracks.slice(1).forEach(t => addToQueue(t));
    toast.success(`Playing "${playlist.title}"`);
  };

  return (
    <div>
      {/* Header */}
      <div className="relative">
        <img src={playlist.thumbnail} alt={playlist.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080410] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-bold text-xl truncate">{playlist.title}</p>
          <p className="text-sm text-white/50">{playlist.owner} • {playlist.trackCount} lagu</p>
        </div>
      </div>

      <div className="px-4 py-4">
        <button
          onClick={playAll}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-500 font-semibold text-sm hover:bg-purple-600 transition-colors mb-6 shadow-lg shadow-purple-500/30"
        >
          <Play size={18} fill="white" className="text-white" />
          Putar Semua
        </button>

        <div className="flex items-center gap-2 mb-3 text-xs text-white/30 px-3">
          <span className="w-6 text-center">#</span>
          <span className="w-10">Cover</span>
          <span className="flex-1">Judul</span>
          <Clock size={12} />
        </div>

        <div className="space-y-1">
          {playlist.tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              onPlay={() => {
                playTrack(t);
                addToQueue(...playlist.tracks.slice(i + 1));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
