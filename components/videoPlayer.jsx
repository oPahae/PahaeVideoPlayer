import { useState, useRef, useEffect, useCallback } from 'react';
import { FileVideo, AlertTriangle, Keyboard, Loader2 } from 'lucide-react';
import Controls from './controls';
import ShortcutsModal from './shortcutsModal';
import SpeedModal from './speedModal';

const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.wmv'];

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function VideoPlayer() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const hideControlsTimeout = useRef(null);

  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playerState, setPlayerState] = useState('noVideo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentVideo = currentIndex >= 0 ? playlist[currentIndex] : null;

  const stateRef = useRef({});
  stateRef.current = {
    playlist,
    currentIndex,
    isPlaying,
    isFullscreen,
    shortcutsOpen,
    speedOpen
  };

  useEffect(() => {
    if (!window.electronAPI) return undefined;

    window.electronAPI.getOpenedFile().then((data) => {
      if (data && data.files && data.files.length > 0) {
        setPlaylist(data.files);
        setCurrentIndex(0);
      }
    });

    const unsubscribeOpen = window.electronAPI.onOpenVideoFile((data) => {
      if (data && data.files && data.files.length > 0) {
        setPlaylist(data.files);
        setCurrentIndex(0);
      }
    });

    const unsubscribeFullscreen = window.electronAPI.onFullscreenChanged
      ? window.electronAPI.onFullscreenChanged((value) => setIsFullscreen(value))
      : null;

    return () => {
      if (unsubscribeOpen) unsubscribeOpen();
      if (unsubscribeFullscreen) unsubscribeFullscreen();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;
    setPlayerState('loading');
    setCurrentTime(0);
    setDuration(0);
    video.src = currentVideo.url;
    video.load();
    video.play().catch(() => { });
  }, [currentVideo]);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    hideControlsTimeout.current = setTimeout(() => {
      const s = stateRef.current;
      if (!s.shortcutsOpen && !s.speedOpen && s.isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  }, []);

  const hideControlsNow = useCallback(() => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    setControlsVisible(false);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.src) return;
    if (video.paused) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, []);

  const seekBy = useCallback((delta) => {
    const video = videoRef.current;
    if (!video || !video.src) return;
    const target = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0);
    video.currentTime = target;
  }, []);

  const seekTo = useCallback((time) => {
    const video = videoRef.current;
    if (!video || !video.src) return;
    video.currentTime = Math.min(Math.max(time, 0), video.duration || 0);
  }, []);

  const changeVolume = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(video.volume + delta, 0), 1);
    video.volume = next;
    video.muted = false;
    setVolume(next);
    setMuted(false);
  }, []);

  const setVolumeDirect = useCallback((value) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(Math.max(value, 0), 1);
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const changeSpeed = useCallback((rate) => {
    const video = videoRef.current;
    if (!video) return;
    if (!rate || isNaN(rate) || rate <= 0) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!window.electronAPI) return;
    window.electronAPI.toggleFullscreen().then((state) => {
      setIsFullscreen(state);
    });
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((idx) => {
      const s = stateRef.current;
      return idx < s.playlist.length - 1 ? idx + 1 : idx;
    });
  }, []);

  const quitPlayer = useCallback(() => {
    if (window.electronAPI) window.electronAPI.quitApp();
  }, []);

  const openFileDialog = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  const loadLocalFiles = useCallback(async (files) => {
    if (!window.electronAPI) return;
    const resolved = [];
    for (const file of files) {
      const parts = file.name.split('.');
      const ext = '.' + parts[parts.length - 1].toLowerCase();
      if (!videoExtensions.includes(ext) || !file.path) continue;
      const data = await window.electronAPI.resolveVideoPath(file.path);
      if (data) resolved.push(data);
    }
    if (resolved.length > 0) {
      setPlaylist(resolved);
      setCurrentIndex(0);
    }
  }, []);

  const handleFileInputChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      loadLocalFiles(files);
      e.target.value = '';
    },
    [loadLocalFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files || []);
      loadLocalFiles(files);
    },
    [loadLocalFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;
      const tag = active ? active.tagName : '';
      const isRange = tag === 'INPUT' && active.type === 'range';
      const isTypingField = tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && !isRange);
      if (isTypingField) return;

      const s = stateRef.current;

      if (e.key === 'Escape') {
        if (s.shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (s.speedOpen) {
          setSpeedOpen(false);
          return;
        }
        if (s.isFullscreen) {
          toggleFullscreen();
          return;
        }
        quitPlayer();
        return;
      }

      if (s.shortcutsOpen || s.speedOpen) return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          seekBy(e.ctrlKey ? 10 : 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seekBy(e.ctrlKey ? -10 : -5);
          break;
        case 'k':
        case 'K':
          seekBy(-0.2);
          break;
        case 'l':
        case 'L':
          seekBy(0.2);
          break;
        case 'F11':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 's':
        case 'S':
          setSpeedOpen(true);
          break;
        case '0':
          seekTo(0);
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.05);
          break;
        default:
          break;
      }

      showControls();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [seekBy, seekTo, togglePlay, toggleMute, toggleFullscreen, changeVolume, quitPlayer, showControls]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setPlayerState('ready');
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setPlayerState('playing');
    showControls();
  };

  const handlePause = () => {
    setIsPlaying(false);
    setPlayerState('paused');
    setControlsVisible(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setPlayerState('ended');
    setControlsVisible(true);
  };

  const handleError = () => {
    setPlayerState('error');
    setIsPlaying(false);
  };

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < playlist.length - 1;

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen bg-black overflow-hidden select-none"
      onMouseMove={showControls}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mkv,.avi,.mov,.webm,.m4v,.wmv"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-black"
        onClick={hideControlsNow}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      <div
        className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <span className="text-white/90 text-sm font-medium tracking-wide truncate max-w-[70%]">
          {currentVideo ? currentVideo.name : 'PahaeVideoPlayer'}
        </span>
        <button
          onClick={() => setShortcutsOpen(true)}
          title="Raccourcis clavier"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors"
        >
          <Keyboard size={18} className="text-white/80" />
        </button>
      </div>

      {playerState === 'noVideo' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <FileVideo size={48} className="text-white/60" />
          </div>
          <p className="text-white/70 text-lg">Aucune vidéo ouverte</p>
          <p className="text-white/40 text-sm">Glissez-déposez un fichier vidéo ou ouvrez-en un</p>
          <button
            onClick={openFileDialog}
            className="mt-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white/90 text-sm font-medium transition-colors"
          >
            Ouvrir une vidéo
          </button>
        </div>
      )}

      {playerState === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <Loader2 size={40} className="text-white/70 animate-spin" />
        </div>
      )}

      {playerState === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/60">
          <div className="p-6 rounded-2xl bg-white/5 border border-red-400/20 backdrop-blur-md">
            <AlertTriangle size={48} className="text-red-400/80" />
          </div>
          <p className="text-white/80 text-lg">Impossible de lire cette vidéo.</p>
          <button
            onClick={openFileDialog}
            className="mt-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white/90 text-sm font-medium transition-colors"
          >
            Ouvrir une autre vidéo
          </button>
        </div>
      )}

      {isDragging && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 border-4 border-dashed border-white/30">
          <p className="text-white/90 text-xl font-medium">Déposez la vidéo ici</p>
        </div>
      )}

      {currentVideo && playerState !== 'error' && (
        <Controls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          visible={controlsVisible}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          formatTime={formatTime}
          onTogglePlay={togglePlay}
          onSeekBy={seekBy}
          onSeekTo={seekTo}
          onVolumeChange={setVolumeDirect}
          onToggleMute={toggleMute}
          onOpenSpeed={() => setSpeedOpen(true)}
          onToggleFullscreen={toggleFullscreen}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <SpeedModal
        open={speedOpen}
        onClose={() => setSpeedOpen(false)}
        currentRate={playbackRate}
        onSelect={changeSpeed}
      />
    </div>
  );
}