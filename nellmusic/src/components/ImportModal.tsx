import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';
import { extractPlaylistId, extractVideoId, fetchPlaylist, fetchVideo } from '@/services/youtube';
import { incrementBlockedCount } from '@/services/storage';
import { toast } from 'sonner';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal = ({ isOpen, onClose }: ImportModalProps) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; count: number; newCount: number; thumbnail: string } | null>(null);
  const [error, setError] = useState('');

  const { addPlaylist, isDuplicate } = useLibraryStore();

  const handlePreview = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const playlistId = extractPlaylistId(url);
      const videoId = extractVideoId(url);

      if (playlistId) {
        const playlist = await fetchPlaylist(playlistId);
        const newTracks = playlist.tracks.filter(t => !isDuplicate(t.id));
        const blockedCount = playlist.tracks.length - newTracks.length;
        setPreview({
          title: playlist.title,
          count: playlist.tracks.length,
          newCount: newTracks.length,
          thumbnail: playlist.thumbnail,
        });
        if (blockedCount > 0) incrementBlockedCount(blockedCount);
      } else if (videoId) {
        const track = await fetchVideo(videoId);
        const isNew = !isDuplicate(track.id);
        setPreview({
          title: track.title,
          count: 1,
          newCount: isNew ? 1 : 0,
          thumbnail: track.thumbnail,
        });
      } else {
        setError('Invalid YouTube URL. Please paste a valid playlist or video link.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || 'Failed to fetch. Check the URL or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const playlistId = extractPlaylistId(url);
      const videoId = extractVideoId(url);

      if (playlistId) {
        const playlist = await fetchPlaylist(playlistId);
        addPlaylist(playlist);
        toast.success(`Imported "${playlist.title}" — ${playlist.trackCount} tracks added`);
      } else if (videoId) {
        const track = await fetchVideo(videoId);
        const singlePlaylist = {
          id: `single-${track.id}`,
          title: track.title,
          description: '',
          thumbnail: track.thumbnail,
          owner: track.artist,
          tracks: [track],
          trackCount: 1,
          importedAt: Date.now(),
          youtubePlaylistId: undefined,
        };
        addPlaylist(singlePlaylist);
        toast.success(`Added "${track.title}" to library`);
      }
      setUrl('');
      setPreview(null);
      onClose();
    } catch {
      toast.error('Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
          data-testid="import-modal-overlay"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl neon-glow"
            data-testid="import-modal"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Import from YouTube</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                data-testid="btn-close-import"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">YouTube URL (playlist or video)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                    <Link2 size={14} className="text-muted-foreground shrink-0" />
                    <input
                      type="url"
                      value={url}
                      onChange={e => { setUrl(e.target.value); setPreview(null); setError(''); }}
                      placeholder="https://youtube.com/playlist?list=..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                      data-testid="input-youtube-url"
                      onKeyDown={e => e.key === 'Enter' && handlePreview()}
                    />
                  </div>
                  <button
                    onClick={handlePreview}
                    disabled={!url.trim() || loading}
                    className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors disabled:opacity-50"
                    data-testid="btn-preview-import"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Preview'}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Supports: youtube.com/playlist, youtu.be/VIDEO, youtube.com/watch?v=...
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {preview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  data-testid="import-preview"
                >
                  <img src={preview.thumbnail} alt={preview.title} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{preview.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{preview.count} tracks total</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle size={11} className="text-green-400" />
                      <span className="text-[11px] text-green-400">{preview.newCount} new tracks</span>
                      {preview.count - preview.newCount > 0 && (
                        <span className="text-[11px] text-yellow-400 ml-2">
                          {preview.count - preview.newCount} already in library
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleImport}
                disabled={!url.trim() || loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 neon-glow"
                data-testid="btn-confirm-import"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Import to Library
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
