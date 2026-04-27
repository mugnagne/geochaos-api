import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface MaxButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const MaxButton = ({ children, onClick, disabled, className = '', variant = 'primary' }: MaxButtonProps) => {
  const baseStyles = "h-14 px-8 rounded-full font-heading font-black uppercase tracking-widest transition-all duration-300 relative group";
  
  const variants = {
    primary: "bg-gradient-to-r from-accent-magenta via-accent-purple to-accent-cyan border-4 border-accent-yellow text-white shadow-max-magenta hover:scale-110 active:scale-95",
    secondary: "bg-max-muted border-4 border-accent-cyan text-accent-cyan shadow-max-cyan hover:scale-105 active:scale-95",
    outline: "bg-transparent border-4 border-dashed border-accent-yellow text-accent-yellow hover:border-solid hover:bg-accent-yellow hover:text-max-bg"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const MaxCard = ({ children, className = '', accent = 'magenta', onClick }: { children: ReactNode, className?: string, accent?: string, onClick?: () => void }) => {
  const accentColors: Record<string, string> = {
    magenta: 'border-accent-magenta shadow-max-magenta text-accent-magenta',
    cyan: 'border-accent-cyan shadow-max-cyan text-accent-cyan',
    yellow: 'border-accent-yellow shadow-max-yellow text-accent-yellow',
    orange: 'border-accent-orange shadow-max-cyan text-accent-orange',
    purple: 'border-accent-purple shadow-max-magenta text-accent-purple',
  };

  return (
    <motion.div 
      whileHover={onClick ? { scale: 1.02, rotate: 0.5 } : {}}
      onClick={onClick}
      className={`bg-max-muted/90 backdrop-blur-xl border-4 rounded-3xl p-8 transition-all ${accentColors[accent] || accentColors.magenta} ${className} ${onClick ? 'cursor-pointer hover:bg-max-muted' : ''}`}
    >
      {children}
    </motion.div>
  );
};

export const FloatingShape = ({ type, color, size, top, left, delay = 0 }: { type: 'star' | 'circle' | 'square', color: string, size: string, top: string, left: string, delay?: number }) => {
  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{ 
        y: [-10, 10, -10],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 4 + Math.random() * 2, 
        repeat: Infinity, 
        delay 
      }}
      className={`absolute ${size} opacity-30 z-0 pointer-events-none`}
      style={{ top, left, color }}
    >
      {type === 'star' && <div className="w-full h-full" style={{ backgroundColor: 'currentColor', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />}
      {type === 'circle' && <div className="w-full h-full rounded-full" style={{ backgroundColor: 'currentColor' }} />}
      {type === 'square' && <div className="w-full h-full border-4 rotate-45" style={{ borderColor: 'currentColor' }} />}
    </motion.div>
  );
};
