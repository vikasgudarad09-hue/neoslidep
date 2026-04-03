import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  type?: 'particle' | 'ring';
}

interface MoveParticlesProps {
  trigger: number;
  x: number;
  y: number;
  direction?: { x: number; y: number };
  color?: string;
}

export const MoveParticles = ({ trigger, x, y, direction = { x: 0, y: 0 }, color = "#06b6d4" }: MoveParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    const newParticles: Particle[] = [];
    const count = 24; 
    
    const wakeAngle = Math.atan2(-direction.y, -direction.x);
    
    // Add a shockwave ring
    newParticles.push({
      id: Math.random() + trigger + 999,
      x,
      y,
      color,
      size: 0,
      vx: 0,
      vy: 0,
      type: 'ring'
    });

    for (let i = 0; i < count; i++) {
      const isRadial = direction.x === 0 && direction.y === 0;
      const angle = isRadial 
        ? (Math.PI * 2 * i) / count 
        : wakeAngle + (Math.random() - 0.5) * Math.PI * 0.9; 
      
      const speed = isRadial ? 2 + Math.random() * 4 : 5 + Math.random() * 12;
      
      newParticles.push({
        id: Math.random() + i + trigger,
        x,
        y,
        color,
        size: 1 + Math.random() * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'particle'
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);

    return () => clearTimeout(timer);
  }, [trigger, x, y, direction, color]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map((p) => (
          p.type === 'ring' ? (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.6, scale: 0 }}
              animate={{ 
                opacity: 0,
                scale: 3,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute rounded-full border-2"
              style={{
                left: p.x - 50,
                top: p.y - 50,
                width: 100,
                height: 100,
                borderColor: p.color,
                boxShadow: `0 0 20px ${p.color}`,
              }}
            />
          ) : (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
              animate={{ 
                x: p.vx * 25, 
                y: p.vy * 25, 
                opacity: 0,
                scale: [1, 1.5, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute blur-[0.5px]"
              style={{
                left: p.x - p.size / 2,
                top: p.y - p.size / 2,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 15px ${p.color}, 0 0 5px white`,
                borderRadius: Math.random() > 0.3 ? '0px' : '50%',
              }}
            />
          )
        ))}
      </AnimatePresence>
    </div>
  );
};
