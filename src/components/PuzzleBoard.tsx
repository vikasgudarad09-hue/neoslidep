import { motion, AnimatePresence } from "motion/react";
import { Tile } from "./Tile";
import { Grid, canMove } from "../utils/puzzle";
import { MoveParticles } from "./MoveParticles";
import { useState, useRef, useEffect } from "react";

interface PuzzleBoardProps {
  grid: Grid;
  size: number;
  imageUrl?: string | null;
  onMove: (index: number) => void;
  isSolved: boolean;
  activeHintIndex?: number | null;
  type?: 'number' | 'alphabet' | 'image';
}

export const PuzzleBoard = ({ grid, size, imageUrl, onMove, isSolved, activeHintIndex, type = 'number' }: PuzzleBoardProps) => {
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [particlePos, setParticlePos] = useState({ x: 0, y: 0 });
  const [particleDir, setParticleDir] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const prevGridRef = useRef<Grid>(grid);

  useEffect(() => {
    if (prevGridRef.current && prevGridRef.current.length > 0) {
      const oldEmptyIndex = prevGridRef.current.indexOf(size * size - 1);
      const newEmptyIndex = grid.indexOf(size * size - 1);
      
      if (oldEmptyIndex !== newEmptyIndex && oldEmptyIndex !== -1 && newEmptyIndex !== -1) {
        // The tile that moved is the one that is now at oldEmptyIndex
        // It moved from newEmptyIndex to oldEmptyIndex
        const oldRow = Math.floor(newEmptyIndex / size);
        const oldCol = newEmptyIndex % size;
        const newRow = Math.floor(oldEmptyIndex / size);
        const newCol = oldEmptyIndex % size;
        
        const dx = newCol - oldCol;
        const dy = newRow - oldRow;
        
        triggerParticles(oldEmptyIndex, { x: dx, y: dy });
      }
    }
    prevGridRef.current = grid;
  }, [grid, size]);

  const triggerParticles = (index: number, direction: { x: number; y: number }) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const row = Math.floor(index / size);
      const col = index % size;
      const tileWidth = rect.width / size;
      const tileHeight = rect.height / size;
      
      setParticlePos({
        x: col * tileWidth + tileWidth / 2,
        y: row * tileHeight + tileHeight / 2,
      });
      setParticleDir(direction);
      setParticleTrigger(prev => prev + 1);
    }
  };

  if (!grid || grid.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/20">
        Initializing Grid...
      </div>
    );
  }

  const emptyIndex = grid.indexOf(size * size - 1);

  return (
    <div
      ref={boardRef}
      className="relative bg-black/40 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 touch-none"
      style={{
        width: "min(calc(100vw - 2.5rem), 70vh, 650px)",
        height: "min(calc(100vw - 2.5rem), 70vh, 650px)",
      }}
    >
      <MoveParticles 
        trigger={particleTrigger} 
        x={particlePos.x} 
        y={particlePos.y} 
        direction={particleDir}
        color={type === 'image' ? "#f472b6" : "#06b6d4"} 
      />
      {/* Corner accents */}
      <div className="absolute -top-px -left-px w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-2xl" />
      <div className="absolute -top-px -right-px w-8 h-8 border-t-2 border-r-2 border-fuchsia-500/50 rounded-tr-2xl" />
      <div className="absolute -bottom-px -left-px w-8 h-8 border-b-2 border-l-2 border-fuchsia-500/50 rounded-bl-2xl" />
      <div className="absolute -bottom-px -right-px w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 rounded-br-2xl" />

      <motion.div
        className={`grid w-full h-full ${size >= 5 ? 'gap-1' : 'gap-2'}`}
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
        layout
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03,
              delayChildren: 0.1
            }
          }
        }}
      >
        {grid.map((tileValue, index) => {
          const isTileEmpty = tileValue === size * size - 1;
          const movable = !isSolved && canMove(index, emptyIndex, size);
          const isHint = activeHintIndex === index;
          const isHintDestination = activeHintIndex !== null && index === emptyIndex;
          const isCorrectPosition = tileValue === index;
          
          let hintDirection: 'up' | 'down' | 'left' | 'right' | null = null;
          if (isHint) {
            const emptyRow = Math.floor(emptyIndex / size);
            const emptyCol = emptyIndex % size;
            const tileRow = Math.floor(index / size);
            const tileCol = index % size;

            if (tileRow < emptyRow) hintDirection = 'down';
            else if (tileRow > emptyRow) hintDirection = 'up';
            else if (tileCol < emptyCol) hintDirection = 'right';
            else if (tileCol > emptyCol) hintDirection = 'left';
          }

          return (
            <motion.div
              key={tileValue}
              layout
              variants={{
                hidden: { scale: 0.8, opacity: 0 },
                visible: { 
                  scale: 1, 
                  opacity: 1,
                  transition: { type: "spring", stiffness: 300, damping: 25 }
                },
                solved: {
                  scale: [1, 1.1, 1],
                  transition: { duration: 0.4, ease: "easeInOut", delay: index * 0.02 }
                }
              }}
              initial="hidden"
              animate={isSolved ? "solved" : "visible"}
              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
              className="w-full h-full"
              style={{ zIndex: isHint ? 20 : 1 }}
            >
              {!isTileEmpty ? (
                <Tile
                  value={tileValue}
                  size={size}
                  imageUrl={imageUrl}
                  onClick={() => movable && onMove(index)}
                  disabled={!movable || isSolved}
                  isHint={isHint}
                  hintDirection={hintDirection}
                  type={type}
                  isCorrectPosition={isCorrectPosition}
                />
              ) : (
                <div className={`w-full h-full rounded-lg transition-all duration-500 relative overflow-hidden ${
                  isHintDestination 
                    ? "border-2 border-dashed border-yellow-400/40 bg-yellow-400/5" 
                    : ""
                }`}>
                  {isHintDestination && activeHintIndex !== null && (
                    <>
                      {/* Ghost Tile Effect */}
                      <div className="absolute inset-0 opacity-30 grayscale">
                         <Tile
                          value={grid[activeHintIndex]}
                          size={size}
                          imageUrl={imageUrl}
                          onClick={() => {}}
                          disabled={true}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-yellow-400/50 rounded-full animate-ping" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Win State Overlay Effect */}
      <AnimatePresence>
        {isSolved && (
          <motion.div key="win-overlay" className="absolute inset-0 z-40 pointer-events-none">
            {type === 'image' && imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-auto"
              >
                <img src={imageUrl} alt="Completed Puzzle" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 1.2] }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="w-full h-full border-4 border-emerald-400/50 rounded-2xl shadow-[0_0_50px_rgba(52,211,153,0.5)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
