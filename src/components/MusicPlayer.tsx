import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Volume1, VolumeX, Music, Disc } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "Neon Skyline", artist: "AI Synthbot", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Cybernetic Groove", artist: "Neural Net", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Digital Horizon", artist: "Auto-Tune Alpha", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const skipPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center gap-4 md:gap-8 px-4 font-vt text-xl max-w-6xl w-full mx-auto">
      {/* Icon & Info */}
      <div className="flex items-center gap-4 shrink-0 bg-[#ff00ff] text-black px-4 py-2 border-[4px] border-[#00ffff] shadow-[6px_6px_0_rgba(0,255,255,0.5)]">
        <Disc className={`w-8 h-8 ${isPlaying ? 'animate-spin' : ''}`} />
        <div className="flex flex-col">
          <span className="font-pixel text-[8px] uppercase tracking-widest mb-1">{currentTrack.title}</span>
          <span className="text-sm font-bold uppercase tracking-widest">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 shrink-0 bg-black border-[4px] border-[#ff00ff] px-6 py-2 shadow-[6px_6px_0_rgba(255,0,255,0.3)]">
        <button onClick={skipPrev} className="text-[#00ffff] hover:text-white focus:outline-none transition-colors hover:scale-110 active:scale-95">
          <SkipBack className="w-6 h-6" />
        </button>
        <button 
          onClick={togglePlay} 
          className="w-12 h-12 bg-[#00ffff] text-black flex items-center justify-center hover:bg-white transition-colors focus:outline-none border-[4px] border-black"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" fill="currentColor" />
          ) : (
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          )}
        </button>
        <button onClick={skipNext} className="text-[#00ffff] hover:text-white focus:outline-none transition-colors hover:scale-110 active:scale-95">
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex-1 flex flex-col gap-1 w-full relative group">
        <div className="flex justify-between text-sm text-[#00ffff] font-pixel text-[10px]">
          <span>{formatTime(progress)}</span>
          <span className="glitch-text">{formatTime(duration)}</span>
        </div>
        <div className="relative flex items-center h-8 bg-black border-[4px] border-[#00ffff] overflow-hidden">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={handleProgressChange}
            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full h-full bg-transparent relative pointer-events-none">
            <div 
              className="absolute top-0 left-0 h-full bg-[#ff00ff]"
              style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
            >
              {/* Scanline pattern on progress bar */}
              <div className="absolute inset-0 scanlines opacity-50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume */}
      <div className="w-[160px] flex items-center shrink-0 bg-black border-[4px] border-[#ff00ff] p-2 gap-2 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
        <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-[#ff00ff] hover:text-white focus:outline-none px-1">
          {volume === 0 ? (
            <VolumeX className="w-6 h-6" />
          ) : volume < 0.5 ? (
            <Volume1 className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
        <div className="relative flex-1 flex items-center h-5">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute z-10 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-full h-3 bg-gray-900 pointer-events-none border-2 border-[#00ffff]">
            <div 
              className="h-full bg-[#ff00ff]"
              style={{ width: `${volume * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={skipNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
}
