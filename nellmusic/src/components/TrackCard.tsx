import { motion } from 'framer-motion';
import { Heart, Plus, Play, MoreHorizontal } from 'lucide-react';
import { Track } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { toast } from 'sonner';

interface TrackCardProps {
  track: Track;
  index?: number;
  showDuplicate?: boolean;
}

export const TrackCard = ({ track, index, showDuplicate }: TrackCardProps) => {
  const { playTrack, addToQueue, currentTrack, isPlaying } = usePlayerStore();
  const { toggleFavorite, favorites, isDuplicate } = useLibraryStore();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = favorites.some(f => f.id === track.id);
  const isDup = showDuplicate && isDuplicate(track.id);

  const handlePlay = () => {
    playTrack(track);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(track);
    toast.success(`Added "${track.title}" to queue`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track);
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04 }}
      onClick={handlePlay}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:bg-white/5 ${
        isCurrent ? 'bg-primary/10 border border-primary/20' : ''
      }`}
      data-testid={`track-card-${track.id}`}
    >
      <div className="w-8 text-center shrink-0">
        {isCurrent ? (
          <div className="flex items-center justify-center gap-0.5">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-0.5 rounded-full bg-primary ${isPlaying ? 'animate-bounce' : ''}`}
                style={{ height: 12, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground group-hover:hidden">{(index || 0) + 1}</span>
        )}
        {!isCurrent && (
          <Play size={14} className="hidden group-hover:block text-foreground mx-auto" />
        )}
      </div>

      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>

      {isDup && (
        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          In Library
        </span>
      )}

      <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${isFav ? 'text-accent' : 'text-muted-foreground'}`}
          data-testid={`btn-favorite-${track.id}`}
        >
          <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={handleAddToQueue}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          data-testid={`btn-queue-${track.id}`}
        >
          <Plus size={14} />
        </button>
      </div>

      <span className="shrink-0 text-xs text-muted-foreground w-10 text-right">{track.durationFormatted}</span>
    </motion.div>
  );
};
