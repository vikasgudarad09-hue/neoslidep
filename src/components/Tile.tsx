import { motion } from "motion/react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface TileProps {
  value: number;
  size: number;
  imageUrl?: string | null;
  onClick: () => void;
  disabled?: boolean;
  isHint?: boolean;
  hintDirection?: 'up' | 'down' | 'left' | 'right' | null;
  type?: 'number' | 'alphabet' | 'image';
  isCorrectPosition?: boolean;
}

export const Tile = ({ value, size, imageUrl, onClick, disabled, isHint, hintDirection, type = 'number', isCorrectPosition }: TileProps) => {
  const isEmpty = value === size * size - 1;
  
  // Calculate position in the solved grid (target position)
  const targetRow = Math.floor(value / size);
  const targetCol = value % size;
  
  // Calculate percentage for background position
  const bgX = size > 1 ? (targetCol / (size - 1)) * 100 : 0;
  const bgY = size > 1 ? (targetRow / (size - 1)) * 100 : 0;

  const getDisplayValue = () => {
    if (type === 'alphabet') {
      return String.fromCharCode(65 + value); // 65 is 'A'
    }
    return value + 1;
  };

  if (isEmpty) {
    return <div className="w-full h-full pointer-events-none" />;
  }

  return (
    <motion.button
      whileHover={!disabled ? { 
        scale: 1.05, 
        zIndex: 10, 
        rotate: [-1, 1, -1, 0],
        filter: [
          "hue-rotate(0deg) brightness(1)",
          "hue-rotate(90deg) brightness(1.2)",
          "hue-rotate(0deg) brightness(1)"
        ]
      } : {}}
      whileTap={!disabled ? { 
        scale: 0.9, 
        rotate: 0,
        filter: "hue-rotate(-45deg) brightness(1.5)"
      } : {}}
      animate={isHint ? { 
        scale: [1, 1.05, 1],
        boxShadow: [
          "0 0 0px rgba(234, 179, 8, 0)",
          "0 0 20px rgba(234, 179, 8, 0.8)",
          "0 0 0px rgba(234, 179, 8, 0)"
        ]
      } : isCorrectPosition ? {
        boxShadow: "0 0 15px rgba(52, 211, 153, 0.4) inset, 0 0 10px rgba(52, 211, 153, 0.2)"
      } : {
        boxShadow: "0 0 0px rgba(0, 0, 0, 0) inset, 0 0 0px rgba(0, 0, 0, 0)"
      }}
      transition={isHint ? { 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut" 
      } : { duration: 0.5 }}
      className={`w-full h-full relative overflow-hidden rounded-lg border transition-all duration-300 ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${
        isHint 
          ? "border-yellow-400 ring-2 ring-yellow-400/50 z-20" 
          : isCorrectPosition
            ? "border-emerald-400/60 ring-1 ring-emerald-400/30"
            : "border-white/10"
      } ${
        !disabled && !isHint && !isCorrectPosition
          ? "hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:border-cyan-400/50"
          : ""
      } ${!imageUrl ? "bg-black/40 backdrop-blur-md flex items-center justify-center group" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none mix-blend-overlay" />
      
      {imageUrl && type === 'image' ? (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
          style={{
            backgroundImage: imageUrl.startsWith("http") || imageUrl.startsWith("blob") || imageUrl.startsWith("data:") 
              ? `url(${imageUrl})` 
              : imageUrl,
            backgroundPosition: `${bgX}% ${bgY}%`,
            backgroundSize: `${size * 100}% ${size * 100}%`,
          }}
        >
          {/* Subtle overlay for better definition */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />
        </div>
      ) : (
        <>
          {/* Neon background effect for numbered/alphabet tiles */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-fuchsia-400 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            {getDisplayValue()}
          </span>
        </>
      )}
      
      {/* Optional: Overlay number on image for easier solving */}
      {imageUrl && type === 'image' && (
        <span className="absolute top-1 left-1 text-[10px] font-mono text-white/70 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
          {value + 1}
        </span>
      )}

      {/* Hint Arrow Overlay */}
      {isHint && hintDirection && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-yellow-500/80 p-2 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-bounce">
            {hintDirection === 'up' && <ArrowUp className="w-6 h-6 text-black" />}
            {hintDirection === 'down' && <ArrowDown className="w-6 h-6 text-black" />}
            {hintDirection === 'left' && <ArrowLeft className="w-6 h-6 text-black" />}
            {hintDirection === 'right' && <ArrowRight className="w-6 h-6 text-black" />}
          </div>
        </div>
      )}

      {/* Correct Position Indicator */}
      {isCorrectPosition && !isHint && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.8)] z-20" />
      )}
    </motion.button>
  );
};
