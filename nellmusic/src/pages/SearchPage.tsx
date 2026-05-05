import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Music2, ListMusic } from 'lucide-react';
import { searchYouTube } from '@/services/youtube';
import { fetchVideo, fetchPlaylist } from '@/services/youtube';
import { usePlayerStore } from '@/store/playerStore';
import { useLibraryStore } from '@/store/libraryStore';
import { SearchResult } from '@/types';
import { toast } from 'sonner';

function ResultCard({ result }: { result: SearchResult }) {
  const { playTrack, addToQueue } = usePlayerStore();
  const { addPlaylist } = useLibraryStore();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      if (result.type === 'video') {
        const track = await fetchVideo(result.id);
        playTrack(track);
        toast.success(`Playing "${track.title}"`);
      } else {
        const pl = await fetchPlaylist(result.id);
        addPlaylist(pl);
        if (pl.tracks.length) { playTrack(pl.tracks[0]); pl.tracks.slice(1).forEach(t => addToQueue(t)); }
        toast.success(`Playing "${pl.title}"`);
      }
    } catch {
      toast.error('Gagal memuat. Cek API key YouTube di Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
      onClick={handle}
    >
      <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 size={16} className="animate-spin text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{result.title}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {result.type === 'video' ? <Music2 size={11} className="text-purple-400" /> : <ListMusic size={11} className="text-purple-400" />}
          <p className="text-xs text-white/50 truncate">{result.channelTitle}</p>
        </div>
      </div>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">
        {result.type === 'video' ? 'Video' : 'Playlist'}
      </span>
    </motion.div>
  );
}

export function SearchPage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const r = await searchYouTube(q);
      setResults(r);
    } catch {
      toast.error('Gagal mencari. Cek API key YouTube di Admin.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Cari Musik</h1>
      <div className="flex gap-2 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <Search size={18} className="text-white/40" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Cari lagu, artis, playlist..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
          />
        </div>
        <button
          onClick={doSearch}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-purple-500 font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Cari'}
        </button>
      </div>

      {!searched && (
        <div className="text-center py-16 text-white/30">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>Cari lagu atau playlist YouTube favorit kamu</p>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="text-center py-16 text-white/30">
          <p>Tidak ada hasil untuk "{q}"</p>
        </div>
      )}

      <div className="space-y-1">
        {results.map(r => <ResultCard key={r.id} result={r} />)}
      </div>
    </div>
  );
}
