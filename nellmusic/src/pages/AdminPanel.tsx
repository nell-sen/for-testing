import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, Upload, Trash2, Plus, Save, Globe, User, Music2, LogOut, Link2, CheckCircle, Loader2 } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { useLibraryStore } from '@/store/libraryStore';
import { usePublicPlaylistStore } from '@/store/publicPlaylistStore';
import { getAdminConfig, saveAdminConfig, uploadPublicPlaylist, deletePublicPlaylist, addNotification } from '@/services/firebase';
import { fetchPlaylist, extractPlaylistId } from '@/services/youtube';
import { AdminConfig, SocialLink } from '@/types';
import { toast } from 'sonner';


const ADMIN_PASSWORD = 'Ishnelsen060906';
const SIDEBAR_ITEMS = [
  { id: 'apikey', label: 'API Key YouTube', icon: Key },
  { id: 'playlists', label: 'Upload Playlist', icon: Upload },
  { id: 'social', label: 'Sosial Media', icon: Globe },
  { id: 'about', label: 'About Me', icon: User },
];

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ======= Login =======
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  const handle = () => {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 1500); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 rounded-3xl"
        style={{ background: 'rgba(30,15,50,0.8)', border: '1px solid rgba(168,85,247,0.2)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-center mb-2">Admin Panel</h2>
        <p className="text-sm text-white/40 text-center mb-8">NellMusic Dashboard</p>

        <div className="space-y-4">
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()}
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors ${err ? 'border-red-500 bg-red-500/10' : 'border-purple-500/20 bg-white/5'} border`}
          />
          {err && <p className="text-xs text-red-400 text-center">Password salah!</p>}
          <button
            onClick={handle}
            className="w-full py-3 rounded-xl bg-purple-500 font-semibold text-sm hover:bg-purple-600 transition-colors"
          >
            Masuk
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ======= API Key Section =======
function ApiKeySection({ config, onChange }: { config: AdminConfig; onChange: (c: AdminConfig) => void }) {
  const [key, setKey] = useState(config.youtubeApiKey);
  const [saving, setSaving] = useState(false);
  const { setYoutubeApiKey } = useSettingsStore();

  const save = async () => {
    setSaving(true);
    try {
      const updated = { ...config, youtubeApiKey: key };
      await saveAdminConfig(updated);
      setYoutubeApiKey(key);
      onChange(updated);
      toast.success('API Key disimpan!');
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-2 block">YouTube Data API v3 Key</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Key size={14} className="text-white/30" />
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20 font-mono"
            />
          </div>
          <button onClick={save} disabled={saving} className="px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2">Dapatkan API key di <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">Google Cloud Console</a></p>
      </div>
    </div>
  );
}

// ======= Upload Playlist Section =======
function UploadPlaylistSection() {
  const { publicPlaylists, setPublicPlaylists } = usePublicPlaylistStore();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const doUpload = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const plId = extractPlaylistId(url);
      if (!plId) { toast.error('URL playlist tidak valid'); return; }
      const pl = await fetchPlaylist(plId);
      pl.isPublic = true;
      pl.uploadedByAdmin = true;
      await uploadPublicPlaylist(pl);
      await addNotification({
        title: '🎵 Playlist Baru!',
        message: `"${pl.title}" telah ditambahkan — ${pl.trackCount} lagu`,
        thumbnail: pl.thumbnail,
        playlistId: pl.id,
      });
      setUrl('');
      toast.success(`"${pl.title}" berhasil diupload!`);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || 'Gagal upload. Cek API key.');
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async (id: string, title: string) => {
    try {
      await deletePublicPlaylist(id);
      toast.success(`"${title}" dihapus`);
    } catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs text-white/50 mb-2 block">URL Playlist YouTube</label>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-3 rounded-xl" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Link2 size={14} className="text-white/30" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://youtube.com/playlist?list=..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
            />
          </div>
          <button onClick={doUpload} disabled={loading || !url.trim()} className="px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          </button>
        </div>
        <p className="text-xs text-white/30 mt-2">Playlist ini akan terlihat oleh semua pengguna di beranda</p>
      </div>

      <div>
        <p className="text-sm font-semibold mb-3">Playlist Publik ({publicPlaylists.length})</p>
        {publicPlaylists.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">Belum ada playlist publik</p>
        ) : (
          <div className="space-y-2">
            {publicPlaylists.map(pl => (
              <div key={pl.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.1)' }}>
                <img src={pl.thumbnail} alt={pl.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{pl.title}</p>
                  <p className="text-xs text-white/40">{pl.trackCount} lagu</p>
                </div>
                <button onClick={() => doDelete(pl.id, pl.title)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ======= Social Links Section =======
function SocialSection({ config, onChange }: { config: AdminConfig; onChange: (c: AdminConfig) => void }) {
  const [links, setLinks] = useState<SocialLink[]>(config.socialLinks || []);
  const [saving, setSaving] = useState(false);

  const update = (i: number, key: keyof SocialLink, val: string) => {
    const updated = [...links];
    updated[i] = { ...updated[i], [key]: val };
    setLinks(updated);
  };

  const add = () => setLinks([...links, { id: uuid(), platform: '', url: '', icon: '' }]);
  const remove = (i: number) => setLinks(links.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const updated = { ...config, socialLinks: links };
      await saveAdminConfig(updated);
      onChange(updated);
      toast.success('Sosial media disimpan!');
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {links.map((link, i) => (
        <div key={link.id} className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(30,15,50,0.6)', border: '1px solid rgba(168,85,247,0.1)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Link #{i + 1}</span>
            <button onClick={() => remove(i)} className="text-white/30 hover:text-red-400"><Trash2 size={14} /></button>
          </div>
          <input value={link.platform} onChange={e => update(i, 'platform', e.target.value)} placeholder="Nama platform (Instagram, TikTok, ...)" className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 outline-none" />
          <input value={link.url} onChange={e => update(i, 'url', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 outline-none" />
        </div>
      ))}
      <button onClick={add} className="w-full py-3 rounded-xl border border-dashed border-purple-500/30 text-purple-400 text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10 transition-colors">
        <Plus size={16} />
        Tambah Link
      </button>
      <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-purple-500 font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Simpan
      </button>
    </div>
  );
}

// ======= About Section =======
function AboutSection({ config, onChange }: { config: AdminConfig; onChange: (c: AdminConfig) => void }) {
  const [text, setText] = useState(config.aboutText);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updated = { ...config, aboutText: text };
      await saveAdminConfig(updated);
      onChange(updated);
      toast.success('About disimpan!');
    } catch { toast.error('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-2 block">Deskripsi NellMusic</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 outline-none resize-none"
          placeholder="Tulis tentang NellMusic..."
        />
      </div>
      <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-purple-500 font-semibold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Simpan
      </button>
    </div>
  );
}

// ======= Main Admin Panel =======
export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [active, setActive] = useState('apikey');
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    getAdminConfig().then(c => { setConfig(c); setLoading(false); }).catch(() => setLoading(false));
  }, [loggedIn]);

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="flex min-h-[80vh]">
      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 p-4 border-r border-white/10 space-y-1">
        <div className="flex items-center gap-2 mb-6 px-2">
          <Music2 size={18} className="text-purple-400" />
          <span className="font-bold text-sm">NellMusic</span>
        </div>
        {SIDEBAR_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${active === item.id ? 'bg-purple-500 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
        <div className="pt-4">
          <button onClick={() => setLoggedIn(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {loading || !config ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={32} className="animate-spin text-purple-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {active === 'apikey' && (
                <div>
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Key size={20} className="text-purple-400" />API Key YouTube</h2>
                  <ApiKeySection config={config} onChange={setConfig} />
                </div>
              )}
              {active === 'playlists' && (
                <div>
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Upload size={20} className="text-purple-400" />Upload Playlist Publik</h2>
                  <UploadPlaylistSection />
                </div>
              )}
              {active === 'social' && (
                <div>
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><Globe size={20} className="text-purple-400" />Sosial Media</h2>
                  <SocialSection config={config} onChange={setConfig} />
                </div>
              )}
              {active === 'about' && (
                <div>
                  <h2 className="font-bold text-lg mb-6 flex items-center gap-2"><User size={20} className="text-purple-400" />About NellMusic</h2>
                  <AboutSection config={config} onChange={setConfig} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
