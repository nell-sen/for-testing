import axios from 'axios';
import { Track, Playlist, SearchResult } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';

const getApiKey = () => {
  const store = useSettingsStore.getState();
  return store.youtubeApiKey || import.meta.env.VITE_YT_API_KEY || '';
};

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

export const extractPlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const parseDuration = (iso: string): number => {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
};

export const fetchPlaylist = async (playlistId: string): Promise<Playlist> => {
  const key = getApiKey();
  const tracks: Track[] = [];
  let pageToken = '';
  let title = '';
  let thumbnail = '';
  let owner = '';

  // Get playlist info
  const infoRes = await axios.get(`${YT_BASE}/playlists`, {
    params: { part: 'snippet', id: playlistId, key },
  });
  const pl = infoRes.data.items?.[0];
  if (pl) {
    title = pl.snippet.title;
    thumbnail = pl.snippet.thumbnails?.high?.url || pl.snippet.thumbnails?.default?.url || '';
    owner = pl.snippet.channelTitle;
  }

  // Get all tracks
  do {
    const res = await axios.get(`${YT_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId,
        maxResults: 50,
        pageToken: pageToken || undefined,
        key,
      },
    });
    const videoIds = res.data.items.map((i: any) => i.contentDetails.videoId).join(',');

    const videoRes = await axios.get(`${YT_BASE}/videos`, {
      params: { part: 'contentDetails,snippet', id: videoIds, key },
    });

    const videoMap: Record<string, any> = {};
    videoRes.data.items.forEach((v: any) => { videoMap[v.id] = v; });

    res.data.items.forEach((item: any) => {
      const vid = videoMap[item.contentDetails.videoId];
      if (!vid) return;
      tracks.push({
        id: vid.id,
        youtubeId: vid.id,
        title: vid.snippet.title,
        artist: vid.snippet.channelTitle,
        thumbnail: vid.snippet.thumbnails?.high?.url || vid.snippet.thumbnails?.default?.url || '',
        duration: parseDuration(vid.contentDetails.duration),
        addedAt: Date.now(),
      });
    });

    pageToken = res.data.nextPageToken || '';
  } while (pageToken);

  return {
    id: `yt-${playlistId}`,
    title,
    description: '',
    thumbnail,
    owner,
    tracks,
    trackCount: tracks.length,
    importedAt: Date.now(),
    youtubePlaylistId: playlistId,
  };
};

export const fetchVideo = async (videoId: string): Promise<Track> => {
  const key = getApiKey();
  const res = await axios.get(`${YT_BASE}/videos`, {
    params: { part: 'snippet,contentDetails', id: videoId, key },
  });
  const v = res.data.items?.[0];
  if (!v) throw new Error('Video not found');
  return {
    id: v.id,
    youtubeId: v.id,
    title: v.snippet.title,
    artist: v.snippet.channelTitle,
    thumbnail: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url || '',
    duration: parseDuration(v.contentDetails.duration),
    addedAt: Date.now(),
  };
};

export const searchYouTube = async (q: string): Promise<SearchResult[]> => {
  const key = getApiKey();
  const res = await axios.get(`${YT_BASE}/search`, {
    params: { part: 'snippet', q, maxResults: 20, type: 'video,playlist', key },
  });
  return res.data.items.map((item: any) => ({
    id: item.id.videoId || item.id.playlistId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
    publishedAt: item.snippet.publishedAt,
    type: item.id.videoId ? 'video' : 'playlist',
  }));
};
