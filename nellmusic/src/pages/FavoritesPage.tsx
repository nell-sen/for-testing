import { motion } from 'framer-motion';
import { Heart, Play } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

export function FavoritesPage() {
  const { favorites, toggleFavorite } = useLibraryStore();
  const { playTrack, addToQueue, currentTrack, isPlaying } = usePlayerStore();

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
          <Heart size={20} className="text-red-400" fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Favorit</h1>
          <p className="text-sm text-white/40">{favorites.length} lagu</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p>Belum ada lagu favorit</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favorites.map((t, i) => {
            const active = currentTrack?.id === t.id;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-3 rounded-xl group cursor-pointer transition-colors ${active ? 'bg-purple-500/15' : 'hover:bg-white/5'}`}
                onClick={() => { playTrack(t); favorites.slice(i + 1).forEach(f => addToQueue(f)); toast.success(`Playing "${t.title}"`); }}
              >
                <img src={t.thumbnail} alt={t.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${active ? 'text-purple-400' : ''}`}>{t.title}</p>
                  <p className="text-xs text-white/40 truncate">{t.artist}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(t); }}
                  className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <span className="text-xs text-white/30">{formatDuration(t.duration)}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
