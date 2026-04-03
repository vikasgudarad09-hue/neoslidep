import { useState, useEffect, useRef } from "react";
import { PuzzleBoard } from "./components/PuzzleBoard";
import { LevelMap } from "./components/LevelMap";
import { shuffleGrid, moveTile, isSolved, canMove, Grid, getSuggestedMove } from "./utils/puzzle";
import { RefreshCw, Volume2, VolumeX, ArrowRight, ArrowLeft, Clock, Star, Play, Grid3x3, Home, AlertTriangle, Heart, Sparkles, Zap, Lightbulb, Settings, X, BarChart2, Palette, Keyboard, Hand, Leaf, PawPrint, Share2, Check, QrCode, Map as MapIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "motion/react";
import { LEVELS } from "./utils/levels";
import { playMoveSound, playWinSound, playShuffleSound, playHintSound, playErrorSound, setVolume, playBgMusic, stopBgMusic, initAudio } from "./utils/sound";

type Theme = "Cyberpunk" | "Retro" | "Minimal";

interface GameStats {
  levelsCompleted: number;
  hintsUsed: number;
  totalTimePlayed: number;
  movesMade: number;
}

const INITIAL_STATS: GameStats = {
  levelsCompleted: 0,
  hintsUsed: 0,
  totalTimePlayed: 0,
  movesMade: 0,
};

const THEMES: Record<Theme, { label: string; bg: string; tile: string; accent: string }> = {
  Cyberpunk: { label: "Cyberpunk", bg: "bg-[#0a0a15]", tile: "border-cyan-500/30", accent: "text-cyan-400" },
  Retro: { label: "Retro", bg: "bg-[#1a1a1a]", tile: "border-yellow-500/30", accent: "text-yellow-400" },
  Minimal: { label: "Minimal", bg: "bg-[#f0f0f0]", tile: "border-gray-300", accent: "text-black" },
};

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(3);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [hasSave, setHasSave] = useState(false);
  const [theme, setTheme] = useState<Theme>("Cyberpunk");
  
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);

  // Game state
  const [grid, setGrid] = useState<Grid>([]);
  const [solved, setSolved] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  
  // Timer and Score state
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isShaking, setIsShaking] = useState(false);

  const pendingSaveDataRef = useRef<any>(null);

  const currentLevel = LEVELS[currentLevelIndex] || LEVELS[0];
  
  // Derived state for current game settings
  const size = currentLevel?.size || 3;
  const timeLimit = size === 3 ? 120 : size === 4 ? 240 : size === 5 ? 480 : 600;
  
  const imageUrl = currentLevel?.image;

  // Validate level index on mount
  useEffect(() => {
    if (LEVELS.length > 0 && currentLevelIndex >= LEVELS.length) {
      setCurrentLevelIndex(0);
    }
  }, [currentLevelIndex]);

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading System...</h1>
          <p className="text-white/40">Initializing protocols</p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
        >
          Reset Data & Reload
        </button>
      </div>
    );
  }

  // Check for save game on mount
  useEffect(() => {
    try {
      const save = localStorage.getItem("neoslide_save");
      if (save) {
        const data = JSON.parse(save);
        if (data && typeof data.currentLevelIndex === 'number') {
          setHasSave(true);
        }
      }
      const savedStats = localStorage.getItem("neoslide_stats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error("Failed to load save data", e);
    }
  }, []);

  // Save progress
  useEffect(() => {
    if (gameStarted && grid.length > 0) {
      const saveData = {
        currentLevelIndex,
        lives,
        hints,
        grid,
        elapsedTime,
        solved,
        gameOver,
        score,
        activeHintIndex
      };
      localStorage.setItem("neoslide_save", JSON.stringify(saveData));
      setHasSave(true);
    }
  }, [currentLevelIndex, lives, hints, gameStarted, gameOver, grid, elapsedTime, solved, score, activeHintIndex]);

  // Save stats
  useEffect(() => {
    localStorage.setItem("neoslide_stats", JSON.stringify(stats));
  }, [stats]);

  // Manage background music
  useEffect(() => {
    if (gameStarted && soundEnabled) {
      playBgMusic();
    } else {
      stopBgMusic();
    }
    return () => stopBgMusic();
  }, [gameStarted, soundEnabled]);

  // Initialize game when level changes or game starts
  useEffect(() => {
    if (gameStarted) {
      if (pendingSaveDataRef.current) {
        startNewGame(false, pendingSaveDataRef.current);
        pendingSaveDataRef.current = null;
      } else {
        startNewGame();
      }
    }
  }, [currentLevelIndex, gameStarted]);



  const loadGame = () => {
    initAudio();
    try {
      const save = localStorage.getItem("neoslide_save");
      if (save) {
        const data = JSON.parse(save);
        // Validate data
        if (data && typeof data.currentLevelIndex === 'number' && data.currentLevelIndex >= 0 && data.currentLevelIndex < LEVELS.length) {
          pendingSaveDataRef.current = data;
          setCurrentLevelIndex(data.currentLevelIndex);
          setLives(typeof data.lives === 'number' ? data.lives : 3);
          setHints(typeof data.hints === 'number' ? data.hints : 3);
          setGameStarted(true);
        } else {
          console.warn("Invalid save data found, starting new game");
          startNewGame(true);
          setGameStarted(true);
        }
      }
    } catch (e) {
      console.error("Failed to load game", e);
      startNewGame(true);
      setGameStarted(true);
    }
  };

  const startNewGame = (resetLevel = false, saveData?: any) => {
    initAudio();
    if (resetLevel) {
      setCurrentLevelIndex(0);
      setLives(3);
      setHints(3);
      setGameStarted(true);
    }
    
    const targetLevelIndex = resetLevel ? 0 : currentLevelIndex;
    const targetSize = LEVELS[targetLevelIndex].size;

    if (saveData && saveData.grid && Array.isArray(saveData.grid) && saveData.grid.length === targetSize * targetSize) {
      setGrid(saveData.grid);
      setSolved(!!saveData.solved);
      setShowLevelComplete(!!saveData.solved);
      setGameOver(!!saveData.gameOver);
      setScore(saveData.score || 0);
      setElapsedTime(saveData.elapsedTime || 0);
      setStartTime(Date.now() - (saveData.elapsedTime || 0) * 1000);
      setIsPlaying(!saveData.solved && !saveData.gameOver);
      setActiveHintIndex(saveData.activeHintIndex !== undefined ? saveData.activeHintIndex : null);
    } else {
      if (soundEnabled) playShuffleSound();
      const newGrid = shuffleGrid(targetSize, targetLevelIndex);
      setGrid(newGrid);
      setSolved(false);
      setShowLevelComplete(false);
      setGameOver(false);
      setScore(0);
      setStartTime(Date.now());
      setElapsedTime(0);
      setIsPlaying(true);
      setActiveHintIndex(null);
    }
  };
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !solved && !gameOver && gameStarted) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        setStats(prev => ({ ...prev, totalTimePlayed: prev.totalTimePlayed + 1 }));

        if (timeLimit && elapsed >= timeLimit) {
          handleTimeOut();
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, solved, gameOver, startTime, gameStarted, timeLimit]);

  // Auto-advance to next level
  useEffect(() => {
    if (solved && gameStarted) {
      const isImageLevel = currentLevel.type === 'image';
      const delay = isImageLevel ? 5000 : 0;
      
      const showOverlayTimer = setTimeout(() => {
        setShowLevelComplete(true);
      }, delay);

      if (currentLevelIndex < LEVELS.length - 1) {
        const advanceTimer = setTimeout(() => {
          handleNextLevel();
        }, delay + 2500);
        return () => {
          clearTimeout(showOverlayTimer);
          clearTimeout(advanceTimer);
        };
      }
      
      return () => clearTimeout(showOverlayTimer);
    }
  }, [solved, currentLevelIndex, gameStarted, currentLevel.type]);

  const handleTimeOut = () => {
    setGameOver(true);
    setIsPlaying(false);
    setLives(prev => Math.max(0, prev - 1));
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  const handleMove = (index: number) => {
    if (solved || gameOver) return;
    
    // Clear hint if any
    if (activeHintIndex !== null) setActiveHintIndex(null);
    
    const emptyIndex = grid.indexOf(size * size - 1);
    if (canMove(index, emptyIndex, size)) {
      if (soundEnabled) playMoveSound();
      const newGrid = moveTile(grid, index, emptyIndex);
      setGrid(newGrid);
      setStats(prev => ({ ...prev, movesMade: prev.movesMade + 1 }));
      
      if (isSolved(newGrid)) {
        if (soundEnabled) playWinSound();
        setSolved(true);
        setIsPlaying(false);
        setStats(prev => ({ ...prev, levelsCompleted: prev.levelsCompleted + 1 }));
      }
    } else {
      if (soundEnabled) playErrorSound();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || solved || gameOver) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      const emptyIndex = grid.indexOf(size * size - 1);
      const row = Math.floor(emptyIndex / size);
      const col = emptyIndex % size;

      let targetIndex = -1;

      switch (e.key) {
        case "ArrowUp":
          // Move tile BELOW empty space UP
          if (row < size - 1) targetIndex = emptyIndex + size;
          break;
        case "ArrowDown":
          // Move tile ABOVE empty space DOWN
          if (row > 0) targetIndex = emptyIndex - size;
          break;
        case "ArrowLeft":
          // Move tile RIGHT of empty space LEFT
          if (col < size - 1) targetIndex = emptyIndex + 1;
          break;
        case "ArrowRight":
          // Move tile LEFT of empty space RIGHT
          if (col > 0) targetIndex = emptyIndex - 1;
          break;
        case "Escape":
          setSettingsOpen(prev => !prev);
          break;
      }

      if (targetIndex !== -1) {
        handleMove(targetIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, solved, gameOver, grid, size]);


  const handleHint = () => {
    if (hints > 0 && !solved && !gameOver && activeHintIndex === null) {
      const suggestedMove = getSuggestedMove(grid, size);
      if (suggestedMove !== null) {
        if (soundEnabled) playHintSound();
        setActiveHintIndex(suggestedMove);
        setHints(prev => prev - 1);
        setStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      }
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
      setGameStarted(false);
      setShowMap(true);
    } else {
      setGameStarted(false);
      setShowMap(true);
    }
  };

  const getShareUrl = () => {
    // Use the hardcoded shared URL if available, otherwise fallback to current URL
    // This ensures we always share the public link, not the dev link
    if (process.env.SHARED_APP_URL) {
      return process.env.SHARED_APP_URL;
    }
    
    let shareUrl = window.location.href;
    if (shareUrl.includes('ais-dev-')) {
      shareUrl = shareUrl.replace('ais-dev-', 'ais-pre-');
    }
    return shareUrl;
  };

  const handleShare = async () => {
    // Convert dev URL to preview URL for sharing if applicable
    const shareUrl = getShareUrl();

    const shareData = {
      title: 'NeoSlide',
      text: `Check out NeoSlide! I'm on Level ${currentLevel.id}: ${currentLevel.name}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      console.log('Share failed or not supported, falling back to clipboard', err);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        // Optional: You could show a toast here saying "Link copied! Ensure app is deployed/shared to be accessible."
      } catch (clipboardErr) {
        console.error('Failed to copy:', clipboardErr);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!gameStarted && showMap) {
    return (
      <LevelMap 
        completedLevels={stats.levelsCompleted}
        onSelectLevel={(index) => {
          setCurrentLevelIndex(index);
          setShowMap(false);
          setGameStarted(true);
          // We don't call startNewGame(true) because we want to load the specific level
          // But we need to initialize the grid for that level
          const targetSize = LEVELS[index].size;
          if (soundEnabled) playShuffleSound();
          const newGrid = shuffleGrid(targetSize, index);
          setGrid(newGrid);
          setSolved(false);
          setShowLevelComplete(false);
          setGameOver(false);
          setScore(0);
          setElapsedTime(0);
          setStartTime(Date.now());
          setIsPlaying(true);
          setActiveHintIndex(null);
          initAudio();
        }}
        onBack={() => setShowMap(false)}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-[#050510] text-white flex flex-col font-sans selection:bg-fuchsia-500/30 relative overflow-hidden">
        {/* Scanlines Overlay */}
        <div className="absolute inset-0 scanlines opacity-30 mix-blend-overlay pointer-events-none" />

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]" />
          <div className="absolute -inset-[100px] bg-grid-pattern animate-grid-pan opacity-20" />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Neural Network Active</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter mb-4 italic">
              NEO<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">SLIDE</span>
            </h1>
            <p className="text-white/40 max-w-xs mx-auto text-sm font-medium leading-relaxed">
              Deconstruct the grid. Rebuild the reality. A high-fidelity sliding puzzle experience.
            </p>
          </motion.div>

          <div className="w-full max-w-xs space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMap(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-sm border border-white/20 group"
            >
              <MapIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Level Map
            </motion.button>

            {hasSave && (
              <motion.button
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadGame}
                className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-sm border border-white/10 transition-colors"
              >
                <Zap className="w-5 h-5 text-fuchsia-500" />
                Continue
              </motion.button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatsOpen(true)}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2 transition-colors"
              >
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Stats</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettingsOpen(true)}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2 transition-colors"
              >
                <Settings className="w-5 h-5 text-fuchsia-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Setup</span>
              </motion.button>
            </div>
          </div>
        </main>

        <footer className="p-8 text-center relative z-10">
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Levels</span>
              <span className="text-lg font-mono font-bold text-white/60">{stats.levelsCompleted}</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Moves</span>
              <span className="text-lg font-mono font-bold text-white/60">{stats.movesMade}</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">v2.5.0 Stable Build</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center p-2 sm:p-4 font-sans selection:bg-fuchsia-500/30 relative overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 scanlines opacity-30 mix-blend-overlay" />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]" />
        
        {/* Animated Grid */}
        <div className="absolute -inset-[100px] bg-grid-pattern animate-grid-pan" />
      </div>

      <div className="w-full max-w-md lg:max-w-5xl flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 z-10">
        
        {/* Header */}
        <div className="w-full lg:col-span-5 lg:col-start-1 lg:row-start-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-white flex items-center gap-2 italic">
              NEO<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">SLIDE</span>
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono mt-1">
              <span className="text-white/40">LVL.{currentLevel.id.toString().padStart(2, '0')}</span>
              <span className="text-white/20">|</span>
              <span className="text-cyan-400">{currentLevel.name.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className={`flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md ${lives === 1 ? 'animate-pulse' : ''}`}>
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < lives ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "text-white/10"}`} 
                />
              ))}
            </div>
            <button
              onClick={() => setGameStarted(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white relative"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              {copied && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStatsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setGameStarted(false);
                setShowMap(true);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
              title="Level Map"
            >
              <MapIcon className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* QR Code Overlay */}
        <AnimatePresence>
          {qrOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-[90vw] sm:max-w-xs bg-[#0a0a15] border border-white/10 p-6 rounded-3xl shadow-2xl relative flex flex-col items-center"
              >
                <button
                  onClick={() => setQrOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" /> Scan to Play
                </h3>
                
                <div className="bg-white p-4 rounded-xl mb-4">
                  <QRCode value={getShareUrl()} size={200} />
                </div>
                
                <p className="text-white/60 text-center text-sm mb-4">
                  Scan this code with your mobile device to play NeoSlide on the go!
                </p>

                <div className="w-full bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Public Share Link</span>
                  <div className="flex items-center gap-2">
                    <input 
                      readOnly 
                      value={getShareUrl()} 
                      className="flex-1 bg-black/40 text-cyan-400 text-xs font-mono p-2 rounded border border-white/5 outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getShareUrl());
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded border border-white/5 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-white/60" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overlay */}
        <AnimatePresence>
          {statsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-[90vw] sm:max-w-xs bg-[#0a0a15] border border-white/10 p-6 rounded-3xl shadow-2xl relative"
              >
                <button
                  onClick={() => setStatsOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-cyan-400" /> Statistics
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Levels Completed</div>
                    <div className="text-2xl font-mono font-bold text-white">{stats.levelsCompleted}</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Total Time Played</div>
                    <div className="text-2xl font-mono font-bold text-white">
                      {Math.floor(stats.totalTimePlayed / 3600)}h {Math.floor((stats.totalTimePlayed % 3600) / 60)}m {stats.totalTimePlayed % 60}s
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Hints Used</div>
                      <div className="text-xl font-mono font-bold text-fuchsia-400">{stats.hintsUsed}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Moves</div>
                      <div className="text-xl font-mono font-bold text-cyan-400">{stats.movesMade}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Overlay */}
        <AnimatePresence>
          {settingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-[90vw] sm:max-w-xs bg-[#0a0a15] border border-white/10 p-6 rounded-3xl shadow-2xl relative"
              >
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-fuchsia-400" /> Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-white/80">Sound Volume</label>
                      <span className="text-xs font-mono text-white/40">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => {
                        const newVol = parseFloat(e.target.value);
                        setVolumeState(newVol);
                        setVolume(newVol);
                        if (newVol === 0) setSoundEnabled(false);
                        else setSoundEnabled(true);
                      }}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">Mute All Sounds</span>
                    <button
                      onClick={() => {
                        const newSoundEnabled = !soundEnabled;
                        setSoundEnabled(newSoundEnabled);
                        if (!newSoundEnabled) {
                          setVolume(0);
                          setVolumeState(0);
                        } else {
                          setVolume(0.5);
                          setVolumeState(0.5);
                        }
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? "bg-white/10" : "bg-fuchsia-500"}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? "left-1" : "left-7"}`} />
                    </button>
                  </div>

                  {/* Diagnostics Section */}
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Sharing Diagnostics</h4>
                    <div className="space-y-2 text-[10px] font-mono text-white/60 bg-black/20 p-2 rounded overflow-hidden">
                      <div className="flex justify-between">
                        <span>Web Share API:</span>
                        <span className={navigator.share ? "text-emerald-400" : "text-rose-400"}>
                          {navigator.share ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Clipboard API:</span>
                        <span className={navigator.clipboard ? "text-emerald-400" : "text-rose-400"}>
                          {navigator.clipboard ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="break-all">
                        <span className="block text-white/20 mb-1">Generated Share URL:</span>
                        <span className="text-cyan-400/80 select-all">{getShareUrl()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="w-full lg:col-span-5 lg:col-start-1 lg:row-start-2 grid grid-cols-2 gap-4">
          <div className="relative group overflow-hidden rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/60 font-bold mb-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Timer
              </span>
              <span className={`text-3xl font-mono font-bold tracking-tight ${timeLimit && elapsedTime > timeLimit * 0.8 ? "text-rose-400 animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"}`}>
                {timeLimit ? `${formatTime(timeLimit - elapsedTime)}` : formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          
          <div className="relative group overflow-hidden rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-200/60 font-bold mb-1 flex items-center gap-1.5">
                <Grid3x3 className="w-3 h-3" /> Matrix
              </span>
              <span className="text-3xl font-mono font-bold text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                {size}<span className="text-white/40 text-xl mx-1">x</span>{size}
              </span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="w-full lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-3 flex justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLevelIndex}
              initial={{ opacity: 0, x: 50, rotateY: 10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: -50, rotateY: -10 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
              className={`relative ${isShaking ? 'animate-shake' : ''}`}
              style={{ perspective: 1000 }}
            >
              {/* Board Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-[2rem] blur-xl" />
              
              <PuzzleBoard
                grid={grid}
                size={size}
                imageUrl={imageUrl}
                onMove={handleMove}
                isSolved={solved}
                activeHintIndex={activeHintIndex}
                type={currentLevel.type}
              />
              
              {/* Keyboard Hint */}
              <div className="hidden md:flex absolute -bottom-8 left-0 right-0 justify-center items-center gap-2 text-white/20 text-xs font-mono tracking-widest animate-pulse pointer-events-none">
                <Keyboard className="w-3 h-3" />
                <span>USE ARROW KEYS</span>
              </div>

              {/* Mobile Hint */}
              <div className="md:hidden mt-4 flex justify-center items-center gap-2 text-white/20 text-xs font-mono tracking-widest animate-pulse pointer-events-none">
                <Hand className="w-3 h-3" />
                <span>TAP TO MOVE</span>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl" />
                <div className="relative w-full max-w-[90vw] sm:max-w-xs bg-[#0a0a15] border border-rose-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-center">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center ring-1 ring-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">
                      {lives > 0 ? "SYSTEM FAILURE" : "TERMINATED"}
                    </h3>
                    <p className="text-rose-200/60 text-sm font-medium">
                      {lives > 0 ? "Time limit exceeded. Life lost." : "All lives depleted. Game over."}
                    </p>
                  </div>

                  {lives > 0 ? (
                    <button
                      onClick={() => startNewGame()}
                      className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-900/20"
                    >
                      <RefreshCw className="w-4 h-4" /> REBOOT LEVEL
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={() => {
                          setCurrentLevelIndex(0);
                          setLives(3);
                          startNewGame();
                        }}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-900/20"
                      >
                        <RefreshCw className="w-4 h-4" /> RESTART CAMPAIGN
                      </button>
                      <button
                        onClick={() => setGameStarted(false)}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-5 text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                      >
                        <Home className="w-4 h-4" /> RETURN TO BASE
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Level Complete Overlay */}
          <AnimatePresence>
            {showLevelComplete && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center"
              >
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-2xl" 
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 30 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                  className="relative w-full max-w-[90vw] sm:max-w-xs bg-[#0a0a15] border border-emerald-500/30 p-8 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] flex flex-col items-center gap-6 text-center"
                >
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center ring-1 ring-emerald-500/20">
                      <Star className="w-10 h-10 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">COMPLETE</h3>
                    <div className="flex flex-col gap-1">
                      <p className="text-emerald-400 font-mono text-xl font-bold tracking-tighter drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                        PROTOCOL SYNCHRONIZED
                      </p>
                      <p className="text-emerald-200/40 text-[10px] uppercase tracking-[0.2em] font-bold">System Status: Optimal</p>
                    </div>
                  </motion.div>

                  {/* Confetti Effect */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: -20, x: Math.random() * 200 - 100, opacity: 1, rotate: 0, scale: 0 }}
                        animate={{ y: 300, rotate: 360, scale: [0, 1, 1, 0] }}
                        transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                        className="absolute top-0 left-1/2 w-2 h-2 rounded-sm"
                        style={{ backgroundColor: ['#34d399', '#60a5fa', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)] }}
                      />
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="w-full py-4 border-t border-white/5 flex justify-center relative z-10"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold mb-1">Time Elapsed</span>
                      <span className="text-white font-mono text-lg">{formatTime(elapsedTime)}</span>
                    </div>
                  </motion.div>

                  {currentLevelIndex < LEVELS.length - 1 ? (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      onClick={handleNextLevel}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 text-sm rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/20"
                    >
                      NEXT PROTOCOL <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="w-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-white/10 p-3 rounded-xl"
                    >
                      <p className="text-white text-sm font-bold">CAMPAIGN COMPLETE</p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="w-full lg:col-span-5 lg:col-start-1 lg:row-start-3 flex gap-3">
          <motion.button
            whileHover={hints > 0 && !solved && !gameOver && activeHintIndex === null ? { scale: 1.02, boxShadow: "0 0 20px rgba(234,179,8,0.3)" } : {}}
            whileTap={hints > 0 && !solved && !gameOver && activeHintIndex === null ? { scale: 0.95 } : {}}
            onClick={handleHint}
            disabled={hints === 0 || solved || gameOver || activeHintIndex !== null}
            className={`flex-1 py-3 px-4 text-sm rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border ${
              hints > 0 && !solved && !gameOver && activeHintIndex === null
                ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${hints > 0 ? "fill-current" : ""}`} />
            HINT ({hints})
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => startNewGame()}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white py-3 px-4 text-sm rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            RESTART
          </motion.button>
        </div>

      </div>
    </div>
  );
}
