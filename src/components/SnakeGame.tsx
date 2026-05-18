import React, { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

type Point = { x: number; y: number };
type GameState = 'IDLE' | 'PLAYING' | 'GAME_OVER';

export default function SnakeGame({
  speedLevel = 100,
  wallPass = false,
  onStatsChange,
}: {
  speedLevel?: number;
  wallPass?: boolean;
  onStatsChange?: (stats: any) => void;
}) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameState, setGameState] = useState<GameState>('IDLE');
  
  // Refs to handle stale state in intervals and event listeners
  const directionRef = useRef(direction);
  const lastProcessedDirectionRef = useRef(direction);
  const snakeRef = useRef(snake);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({
        length: snake.length,
        score,
        highScore,
        state: gameState
      });
    }
  }, [snake.length, score, highScore, gameState]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on the snake
      const isOnSnake = currentSnake.some(
        seg => seg.x === newFood.x && seg.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    setGameState('PLAYING');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameState !== 'PLAYING') {
        startGame();
        return;
      }

      if (gameState !== 'PLAYING') return;

      const lastDir = lastProcessedDirectionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (lastDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (lastDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (lastDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (lastDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, generateFood]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const currentDir = directionRef.current;
        lastProcessedDirectionRef.current = currentDir;
        
        let nx = head.x + currentDir.x;
        let ny = head.y + currentDir.y;

        // Check Wall Collision
        if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) {
          if (wallPass) {
            nx = (nx + GRID_SIZE) % GRID_SIZE;
            ny = (ny + GRID_SIZE) % GRID_SIZE;
          } else {
            setGameState('GAME_OVER');
            return prevSnake;
          }
        }

        const newHead = { x: nx, y: ny };

        // Check Self Collision
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          setGameState('GAME_OVER');
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    }, speedLevel);

    return () => clearInterval(gameLoop);
  }, [gameState, food, highScore, generateFood, speedLevel, wallPass]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[550px] gap-8 relative z-10 font-vt">
      {/* Score Header */}
      <div className="flex justify-between font-pixel text-sm w-full px-2">
        <div className="text-[#00ffff] bg-black px-3 py-2 border-[4px] border-[#00ffff] shadow-[4px_4px_0_#ff00ff] glitch-text relative z-20">
          SCR: <span className="text-white">{score.toString().padStart(6, '0')}</span>
        </div>
        <div className="text-[#ff00ff] bg-black px-3 py-2 border-[4px] border-[#ff00ff] shadow-[-4px_4px_0_#00ffff] relative z-20">
          HI: <span className="text-white">{highScore.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Game Board */}
      <div 
        className="relative w-full aspect-square bg-[#000] border-[8px] border-[#00ffff] overflow-hidden tear-container"
        style={{
          boxShadow: "15px 15px 0 #ff00ff, -5px -5px 0 rgba(0, 255, 255, 0.4)",
        }}
      >
        <div 
          className="w-full h-full grid absolute inset-0 mix-blend-screen" 
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isSnake = snake.some(p => p.x === x && p.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div key={i} className="w-full h-full flex items-center justify-center relative">
                {isHead && (
                  <div className="w-full h-full bg-[#00ffff] z-10 relative"></div>
                )}
                {isSnake && !isHead && (
                  <div className="w-[80%] h-[80%] bg-[#00ffff]" style={{ boxShadow: "3px 3px 0 #ff00ff" }}></div>
                )}
                {isFood && (
                  <div className="w-[80%] h-[80%] bg-[#ff00ff] flicker rounded-none border-2 border-white"></div>
                )}
                {!isSnake && !isFood && (
                  <div className="w-[1px] h-[1px] bg-[#333] absolute"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overlays */}
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
            <div className="text-center bg-black border-[6px] border-[#ff00ff] p-8 tear-container" style={{ boxShadow: "12px 12px 0 #00ffff" }}>
              {gameState === 'GAME_OVER' && (
                <div className="mb-6">
                  <h2 className="text-3xl sm:text-4xl text-white font-pixel font-bold mb-4 uppercase tracking-widest glitch-text flicker">
                    ERR: DEATH
                  </h2>
                  <p className="text-[#00ffff] font-vt text-2xl tracking-widest mb-1">SCORE.VAL={score}</p>
                </div>
              )}
              
              <button 
                onClick={startGame}
                className="px-8 py-4 bg-[#ff00ff] text-black font-pixel text-base tracking-widest hover:bg-[#00ffff] transition-colors uppercase border-[4px] border-white focus:outline-none"
              >
                {gameState === 'IDLE' ? 'EXECUTE() ->' : 'RETRY() ->'}
              </button>
              <p className="text-gray-400 font-vt text-xl mt-6 tracking-widest uppercase flicker">
                [ INPUT: ARROWS | SPACE ]
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
