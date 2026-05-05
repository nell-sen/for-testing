export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  youtubeId: string;
  addedAt?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  owner?: string;
  tracks: Track[];
  trackCount: number;
  importedAt: number;
  youtubePlaylistId?: string;
  isPublic?: boolean; // playlists uploaded by admin, visible to all
  uploadedByAdmin?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  type: 'video' | 'playlist';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

export interface AdminConfig {
  youtubeApiKey: string;
  socialLinks: SocialLink[];
  aboutText: string;
}
