import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let playerInstance: any = null;
let apiLoaded = false;
let readyCallbacks: (() => void)[] = [];

const ensureApi = () => new Promise<void>((resolve) => {
  if (apiLoaded && window.YT?.Player) { resolve(); return; }
  readyCallbacks.push(resolve);
  if (!document.getElementById('yt-api-script')) {
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      readyCallbacks.forEach(cb => cb());
      readyCallbacks = [];
    };
    const s = document.createElement('script');
    s.id = 'yt-api-script';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
});

export const useYouTubePlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentTrack, isPlaying, volume, setProgress, setDuration, setIsPlaying, next } = usePlayerStore();
  const progressInterval = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!currentTrack) return;

    const createPlayer = async () => {
      await ensureApi();
      const container = document.getElementById('yt-player-hidden');
      if (!container) return;

      if (playerInstance) {
        playerInstance.loadVideoById(currentTrack.youtubeId);
        return;
      }

      playerInstance = new window.YT.Player('yt-player-hidden', {
        height: '0',
        width: '0',
        videoId: currentTrack.youtubeId,
        playerVars: { autoplay: 1, controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume * 100);
            if (isPlaying) e.target.playVideo();
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) next();
            if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
          },
        },
      });
    };

    createPlayer();
  }, [currentTrack?.youtubeId]);

  useEffect(() => {
    if (!playerInstance) return;
    if (isPlaying) playerInstance.playVideo?.();
    else playerInstance.pauseVideo?.();
  }, [isPlaying]);

  useEffect(() => {
    if (!playerInstance) return;
    playerInstance.setVolume?.(volume * 100);
  }, [volume]);

  useEffect(() => {
    clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerInstance && typeof playerInstance.getCurrentTime === 'function') {
        setProgress(playerInstance.getCurrentTime());
        const dur = playerInstance.getDuration?.() || 0;
        if (dur > 0) setDuration(dur);
      }
    }, 1000);
    return () => clearInterval(progressInterval.current);
  }, []);

  const seekTo = (t: number) => {
    playerInstance?.seekTo?.(t, true);
    setProgress(t);
  };

  return { seekTo };
};
