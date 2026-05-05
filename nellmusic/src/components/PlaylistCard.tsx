import { motion } from 'framer-motion';
import { Play, ListMusic, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Playlist } from '@/types';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { toast } from 'sonner';

interface PlaylistCardProps {
  playlist: Playlist;
  showDelete?: boolean;
  index?: number;
}

export const PlaylistCard = ({ playlist, showDelete, index }: PlaylistCardProps) => {
  const { playTrack, addToQueue } = usePlayerStore();
  const { removePlaylist } = useLibraryStore();

  const handlePlayAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (playlist.tracks.length === 0) return;
    playTrack(playlist.tracks[0]);
    playlist.tracks.slice(1).forEach(t => addToQueue(t));
    toast.success(`Playing "${playlist.title}"`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    removePlaylist(playlist.id);
    toast.success('Playlist removed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index || 0) * 0.06 }}
      whileHover={{ y: -4 }}
      className="group relative"
      data-testid={`playlist-card-${playlist.id}`}
    >
      <Link href={`/playlist/${playlist.id}`}>
        <div className="glass rounded-2xl overflow-hidden cursor-pointer">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={playlist.thumbnail}
              alt={playlist.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePlayAll}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center neon-glow hover:scale-110 transition-transform"
                data-testid={`btn-play-playlist-${playlist.id}`}
              >
                <Play size={20} fill="white" className="text-white ml-1" />
              </button>
            </div>
            {showDelete && (
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                data-testid={`btn-delete-playlist-${playlist.id}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm truncate">{playlist.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ListMusic size={11} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{playlist.trackCount} tracks</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
