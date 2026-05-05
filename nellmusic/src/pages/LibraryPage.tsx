import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ListMusic, Play, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useLibraryStore } from '@/store/libraryStore';
import { usePlayerStore } from '@/store/playerStore';
import { ImportModal } from '@/components/ImportModal';
import { toast } from 'sonner';

export function LibraryPage() {
  const { playlists, removePlaylist } = useLibraryStore();
  const { playTrack, addToQueue } = usePlayerStore();
  const [importOpen, setImportOpen] = useState(false);

  const handlePlay = (e: React.MouseEvent, pl: any) => {
    e.preventDefault();
    if (!pl.tracks.length) return;
    playTrack(pl.tracks[0]);
    pl.tracks.slice(1).forEach((t: any) => addToQueue(t));
    toast.success(`Playing "${pl.title}"`);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Library Saya</h1>
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-sm font-semibold hover:bg-purple-600 transition-colors"
        >
          <Plus size={16} />
          Import
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <ListMusic size={48} className="mx-auto mb-4 opacity-30" />
          <p className="mb-2">Library masih kosong</p>
          <p className="text-sm">Import playlist YouTube untuk mulai</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {playlists.map((pl, i) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <Link href={`/playlist/${pl.id}`}>
                <div className="rounded-2xl overflow-hidden cursor-pointer" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}>
                  <div className="relative aspect-square">
                    <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => handlePlay(e, pl)} className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center hover:scale-110 transition-transform">
                        <Play size={20} fill="white" className="text-white ml-1" />
                      </button>
                    </div>
                    <button
                      onClick={e => { e.preventDefault(); removePlaylist(pl.id); toast.success('Playlist dihapus'); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{pl.title}</p>
                    <p className="text-xs text-white/40">{pl.trackCount} lagu</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <ImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
