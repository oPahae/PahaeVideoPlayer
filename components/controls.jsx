import {
  SkipBack,
  Rewind,
  Play,
  Pause,
  FastForward,
  SkipForward,
  Gauge,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize
} from 'lucide-react';

export default function Controls({
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  isFullscreen,
  visible,
  hasPrevious,
  hasNext,
  formatTime,
  onTogglePlay,
  onSeekBy,
  onSeekTo,
  onVolumeChange,
  onToggleMute,
  onOpenSpeed,
  onToggleFullscreen,
  onPrevious,
  onNext
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = muted ? 0 : volume * 100;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleProgressChange = (e) => {
    onSeekTo(parseFloat(e.target.value));
  };

  const handleVolumeInput = (e) => {
    onVolumeChange(parseFloat(e.target.value) / 100);
  };

  const releaseFocus = (e) => {
    e.target.blur();
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 px-4 pb-5 pt-8 sm:px-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
    >
      <div className="flex flex-col gap-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl px-4 py-4 sm:px-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="text-white/70 text-xs w-12 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleProgressChange}
            onMouseUp={releaseFocus}
            onTouchEnd={releaseFocus}
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.9) ${progress}%, rgba(255,255,255,0.15) ${progress}%)`
            }}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-white outline-none"
          />
          <span className="text-white/70 text-xs w-12 tabular-nums">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              title="Vidéo précédente"
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <SkipBack size={20} className="text-white" />
            </button>
            <button
              onClick={() => onSeekBy(-5)}
              title="Reculer 5 secondes"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Rewind size={20} className="text-white" />
            </button>
            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause' : 'Lecture'}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
            >
              {isPlaying ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white" />}
            </button>
            <button
              onClick={() => onSeekBy(5)}
              title="Avancer 5 secondes"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FastForward size={20} className="text-white" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              title="Vidéo suivante"
              className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <SkipForward size={20} className="text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                title="Muet"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <VolumeIcon size={20} className="text-white" />
              </button>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={volumePercent}
                onChange={handleVolumeInput}
                onMouseUp={releaseFocus}
                onTouchEnd={releaseFocus}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.9) ${volumePercent}%, rgba(255,255,255,0.15) ${volumePercent}%)`
                }}
                className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-white outline-none"
              />
            </div>

            <button
              onClick={onOpenSpeed}
              title="Vitesse de lecture"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
            >
              <Gauge size={18} className="text-white" />
              <span className="text-white text-xs font-medium">{playbackRate}x</span>
            </button>

            <button
              onClick={onToggleFullscreen}
              title="Plein écran"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize size={20} className="text-white" />
              ) : (
                <Maximize size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
