import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [glitchText, setGlitchText] = useState('SYSTEM.ONLINE');
  const [speedLevel, setSpeedLevel] = useState(100);
  const [wallPass, setWallPass] = useState(false);
  const [gameStats, setGameStats] = useState({ length: 3, score: 0, highScore: 0, state: 'IDLE' });

  useEffect(() => {
    const interval = setInterval(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
      if (Math.random() > 0.8) {
        let newText = '';
        for (let i = 0; i < 13; i++) {
          newText += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setGlitchText(newText);
        setTimeout(() => setGlitchText('SYSTEM.ONLINE'), 150);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col font-pixel overflow-hidden relative">
      <div className="absolute inset-0 noise-bg z-[100] mix-blend-overlay pointer-events-none opacity-[0.05]"></div>
      <div className="absolute inset-0 scanlines z-[90] pointer-events-none opacity-40"></div>
      
      {/* Target Tear Effect Elements */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-[#ff00ff] z-30 opacity-70 tear-container"></div>
      <div className="absolute bottom-0 left-0 w-full h-[6px] bg-[#00ffff] z-30 opacity-70"></div>
      <div className="absolute top-0 left-0 w-[6px] h-full bg-[#00ffff] z-30 opacity-70 tear-container"></div>
      <div className="absolute top-0 right-0 w-[6px] h-full bg-[#ff00ff] z-30 opacity-70"></div>

      <header className="h-[60px] border-b-[6px] border-[#ff00ff] flex items-center justify-between px-4 bg-black relative z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#00ffff] text-black flex items-center justify-center font-vt text-2xl flicker">
            !
          </div>
          <h1 className="text-xl md:text-2xl pt-2 glitch-text tracking-tighter">
            SNAKE_ERR.EXE
          </h1>
        </div>
        <div className="hidden md:flex gap-8 text-sm pt-2 text-[#00ffff]">
          <div>STATUS: <span className="text-[#ff00ff]">{glitchText}</span></div>
          <div>MEM: <span className="glitch-text">0xFA21</span></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative z-10 w-full max-w-7xl mx-auto">
        {/* Center Canvas */}
        <section className="flex-[2] flex items-center justify-center relative bg-[#050505] overflow-hidden lg:border-r-[6px] border-[#00ffff]">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#ff00ff 2px, transparent 2px), linear-gradient(90deg, #00ffff 2px, transparent 2px)', backgroundSize: '60px 60px' }}></div>
          <div className="relative w-full h-full p-4 flex items-center justify-center tear-container z-10">
            <SnakeGame speedLevel={speedLevel} wallPass={wallPass} onStatsChange={setGameStats} />
          </div>
        </section>

        {/* Right Drawer - Controls & Stats */}
        <aside className="w-[320px] flex col p-6 bg-black shrink-0 font-vt text-xl hidden lg:flex flex-col">
          <div className="text-[#00ffff] border-b-[4px] border-[#00ffff] pb-2 mb-6 uppercase tracking-widest glitch-text font-pixel text-sm">
            &gt; VAR_DUMP
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-end border-b-[2px] border-gray-800 pb-1">
              <span className="text-gray-400">STATE</span>
              <span className={`font-bold ${gameStats.state === 'PLAYING' ? 'text-[#39ff14]' : gameStats.state === 'GAME_OVER' ? 'text-red-500 flicker' : 'text-gray-400'}`}>
                {gameStats.state}
              </span>
            </div>
            <div className="flex justify-between items-end border-b-[2px] border-gray-800 pb-1">
              <span className="text-gray-400">ENTITY_LEN</span>
              <span className="text-[#00ffff] font-bold">{gameStats.length}</span>
            </div>
            <div className="flex justify-between items-end border-b-[2px] border-gray-800 pb-1">
              <span className="text-gray-400">HIGH_SCORE</span>
              <span className="text-[#ff00ff] font-bold flicker">{gameStats.highScore}</span>
            </div>
          </div>

          <div className="text-[#ff00ff] border-b-[4px] border-dashed border-[#ff00ff] pb-2 mb-6 uppercase tracking-widest font-pixel text-sm mt-auto">
            &gt; PARAMS.CFG
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="text-gray-400 mb-2">RUN_SPEED:</div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSpeedLevel(150)} 
                  className={`flex-1 py-1 px-2 border-[2px] ${speedLevel === 150 ? 'border-[#00ffff] bg-[#00ffff] text-black font-bold' : 'border-gray-700 text-gray-500 hover:border-[#00ffff]'}`}
                >SLOW</button>
                <button 
                  onClick={() => setSpeedLevel(100)} 
                  className={`flex-1 py-1 px-2 border-[2px] ${speedLevel === 100 ? 'border-[#00ffff] bg-[#00ffff] text-black font-bold' : 'border-gray-700 text-gray-500 hover:border-[#00ffff]'}`}
                >NORM</button>
                <button 
                  onClick={() => setSpeedLevel(60)} 
                  className={`flex-1 py-1 px-2 border-[2px] ${speedLevel === 60 ? 'border-[#00ffff] bg-[#00ffff] text-black font-bold' : 'border-gray-700 text-gray-500 hover:border-[#00ffff]'}`}
                >FAST</button>
              </div>
            </div>
            
            <div>
              <div className="text-gray-400 mb-2">GHOST_MODE (WALL PASS):</div>
              <button 
                onClick={() => setWallPass(!wallPass)}
                className={`w-full py-2 border-[2px] font-bold ${wallPass ? 'border-[#ff00ff] bg-[#ff00ff]/20 text-[#ff00ff] shadow-[0_0_10px_#ff00ff]' : 'border-gray-700 text-gray-500 hover:border-[#ff00ff]'}`}
              >
                {wallPass ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </aside>
      </main>

      <footer className="h-[90px] bg-black border-t-[6px] border-[#00ffff] flex items-center shrink-0 justify-center relative z-20 overflow-hidden tear-container">
        <MusicPlayer />
      </footer>
    </div>
  );
}
