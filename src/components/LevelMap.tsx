import { motion } from "motion/react";
import { Star, Lock, Play, ChevronLeft, Sparkles, Zap, Trophy, Map as MapIcon } from "lucide-react";
import { Level, LEVELS } from "../utils/levels";

interface LevelMapProps {
  completedLevels: number;
  onSelectLevel: (index: number) => void;
  onBack: () => void;
}

export const LevelMap = ({ completedLevels, onSelectLevel, onBack }: LevelMapProps) => {
  // Group levels into sections for the map
  const sections = [
    { title: "Tutorial", range: [0, 4], color: "from-cyan-500 to-blue-500" },
    { title: "Easy", range: [5, 14], color: "from-emerald-500 to-teal-500" },
    { title: "Medium", range: [15, 29], color: "from-yellow-500 to-orange-500" },
    { title: "Hard", range: [30, 44], color: "from-rose-500 to-pink-500" },
    { title: "Expert", range: [45, 49], color: "from-purple-500 to-fuchsia-500" },
  ];

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

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#050510]/80 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold tracking-wider uppercase">Main Menu</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Progress</span>
            <span className="text-sm font-mono font-bold text-cyan-400">{completedLevels}/{LEVELS.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </header>

      {/* Map Content */}
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        <div className="max-w-md mx-auto px-6 pt-12 relative">
          {/* The Path Line */}
          <div className="absolute left-1/2 top-20 bottom-20 w-1 bg-gradient-to-b from-cyan-500/20 via-fuchsia-500/20 to-purple-500/20 -translate-x-1/2 rounded-full" />

          {sections.map((section, sIdx) => (
            <div key={section.title} className="mb-16 relative">
              <div className="flex justify-center mb-12">
                <div className={`px-6 py-2 rounded-full bg-gradient-to-r ${section.color} shadow-lg shadow-black/50 border border-white/20 relative z-10`}>
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white drop-shadow-md">
                    {section.title} Region
                  </h2>
                </div>
              </div>

              <div className="space-y-16">
                {LEVELS.slice(section.range[0], section.range[1] + 1).map((level, lIdx) => {
                  const index = section.range[0] + lIdx;
                  const isUnlocked = index <= completedLevels;
                  const isCompleted = index < completedLevels;
                  const isCurrent = index === completedLevels;
                  
                  // Zig-zag positioning
                  const xOffset = lIdx % 2 === 0 ? "translate-x-12" : "-translate-x-12";

                  return (
                    <div key={level.id} className={`flex justify-center relative ${xOffset}`}>
                      <motion.button
                        whileHover={isUnlocked ? { scale: 1.1 } : {}}
                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                        onClick={() => isUnlocked && onSelectLevel(index)}
                        disabled={!isUnlocked}
                        className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 z-20 ${
                          isUnlocked 
                            ? `bg-gradient-to-br ${section.color} border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]` 
                            : "bg-white/5 border border-white/5 text-white/20"
                        } ${isCurrent ? "ring-4 ring-white/20 animate-pulse" : ""}`}
                      >
                        {isCompleted ? (
                          <Star className="w-8 h-8 text-white fill-white drop-shadow-md" />
                        ) : isUnlocked ? (
                          <span className="text-xl font-black font-mono">{level.id}</span>
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}

                        {/* Level Info Tooltip-like label */}
                        <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 pointer-events-none transition-opacity ${
                          lIdx % 2 === 0 ? "right-full mr-4" : "left-full ml-4"
                        } ${isUnlocked ? "opacity-100" : "opacity-40"}`}>
                          <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{level.name}</div>
                          <div className="text-[8px] text-white/40 font-mono italic">{level.size}x{level.size} {level.type.toUpperCase()}</div>
                        </div>

                        {/* Current Level Indicator */}
                        {isCurrent && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                            <motion.div 
                              animate={{ y: [0, -5, 0] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="bg-fuchsia-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg"
                            >
                              Current
                            </motion.div>
                            <div className="w-2 h-2 bg-fuchsia-500 rotate-45" />
                          </div>
                        )}
                      </motion.button>

                      {/* Decorative elements for the path */}
                      {isUnlocked && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className={`absolute -inset-4 bg-gradient-to-br ${section.color} opacity-20 blur-xl rounded-full`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Final Trophy */}
          <div className="flex justify-center mt-20 mb-32">
            <motion.div 
              animate={completedLevels === LEVELS.length ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 relative ${
                completedLevels === LEVELS.length 
                  ? "bg-gradient-to-br from-yellow-400 to-orange-500 border-white/50 shadow-[0_0_40px_rgba(251,191,36,0.4)]" 
                  : "bg-white/5 border-white/5 text-white/10"
              }`}
            >
              <Trophy className={`w-12 h-12 ${completedLevels === LEVELS.length ? "text-white drop-shadow-lg" : ""}`} />
              <div className="absolute -bottom-10 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                Ultimate Master
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation / Quick Play */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050510] via-[#050510]/90 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectLevel(completedLevels >= LEVELS.length ? LEVELS.length - 1 : completedLevels)}
            className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3 tracking-[0.2em] uppercase text-sm border border-white/20"
          >
            <Play className="w-5 h-5 fill-current" />
            {completedLevels >= LEVELS.length ? "Replay Last" : "Continue Journey"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
