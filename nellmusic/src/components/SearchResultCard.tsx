import { motion } from 'framer-motion';
import { Play, ListMusic, Plus } from 'lucide-react';
import { SearchResult } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { fetchVideo, fetchPlaylist } from '@/services/youtube';
import { toast } from 'sonner';
import { useState } from 'react';

interface SearchResultCardProps {
  result: SearchResult;
  index?: number;
}

export const SearchResultCard = ({ result, index }: SearchResultCardProps) => {
  const { playTrack, addToQueue } = usePlayerStore();
  const { addPlaylist } = useLibraryStore();
  const [loading, setLoading] = useState(false);

  const handlePlay = async () => {
    if (result.type === 'track') {
      if (result.duration) {
        playTrack({
          id: result.id,
          title: result.title,
          artist: result.artist,
          thumbnail: result.thumbnail,
          duration: result.duration,
          durationFormatted: result.durationFormatted || '0:00',
          addedAt: Date.now(),
        });
      } else {
        setLoading(true);
        try {
          const track = await fetchVideo(result.id);
          playTrack(track);
        } catch {
          toast.error('Failed to play track');
        } finally {
          setLoading(false);
        }
      }
    } else {
      setLoading(true);
      try {
        const playlist = await fetchPlaylist(result.id);
        addPlaylist(playlist);
        if (playlist.tracks.length > 0) {
          playTrack(playlist.tracks[0]);
          playlist.tracks.slice(1).forEach(t => addToQueue(t));
        }
        toast.success(`Imported "${playlist.title}" — ${playlist.trackCount} tracks`);
      } catch {
        toast.error('Failed to import playlist');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index || 0) * 0.04 }}
      onClick={handlePlay}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-all"
      data-testid={`search-result-${result.id}`}
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
        <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={16} fill="white" className="text-white" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{result.title}</p>
        <p className="text-xs text-muted-foreground truncate">{result.artist}</p>
      </div>

      <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${
        result.type === 'track'
          ? 'bg-primary/20 text-primary border-primary/30'
          : 'bg-secondary/20 text-secondary border-secondary/30'
      }`}>
        {result.type === 'track' ? 'Song' : <span className="flex items-center gap-1"><ListMusic size={10} />Playlist</span>}
      </span>

      {result.durationFormatted && (
        <span className="shrink-0 text-xs text-muted-foreground">{result.durationFormatted}</span>
      )}
    </motion.div>
  );
};
