import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from './TranslationProvider';
import { Rarity } from '../types';

interface Props {
  isPulling: boolean;
  expectedRarity?: Rarity;
}

const RARITY_COLORS: Record<Rarity, string> = {
  'COMMUN': 'bg-gray-400 border-gray-300',
  'RARE': 'bg-accent-cyan border-white shadow-[0_0_10px_#00F5D4]',
  'EPIQUE': 'bg-accent-purple border-white shadow-[0_0_10px_#7B2FFF]',
  'LEGENDAIRE': 'bg-accent-yellow border-white shadow-[0_0_15px_#FFE600]',
  'GEOCHAOS': 'bg-accent-magenta border-white shadow-[0_0_20px_#FF3AF2]',
};

const getWeightedRandomRarity = (): Rarity => {
  const rand = Math.random() * 100;
  if (rand < 2) return 'GEOCHAOS';
  if (rand < 7) return 'LEGENDAIRE';
  if (rand < 18) return 'EPIQUE';
  if (rand < 48) return 'RARE';
  return 'COMMUN';
};

export function GashaponMachine({ isPulling, expectedRarity }: Props) {
  const { language } = useTranslation();
  const [capsuleColors, setCapsuleColors] = useState<Rarity[]>(() => 
    Array(9).fill(null).map(() => getWeightedRandomRarity())
  );

  useEffect(() => {
    if (isPulling) {
      // 1. Shuffling phase
      let shuffleCount = 0;
      const interval = setInterval(() => {
        setCapsuleColors(prev => prev.map(() => getWeightedRandomRarity()));
        shuffleCount++;
        if (shuffleCount > 15) clearInterval(interval);
      }, 100);

      // 2. Lock final result in the "bottom" capsule (index 2 in our circle arrangement)
      setTimeout(() => {
        clearInterval(interval);
        setCapsuleColors(prev => {
          const next = [...prev];
          next[2] = expectedRarity || 'COMMUN'; 
          return next;
        });
      }, 1800);

      return () => clearInterval(interval);
    }
  }, [isPulling, expectedRarity]);

  const capsules = useMemo(() => {
    const radius = 75;
    return Array(9).fill(null).map((_, i) => {
      // Angle so that i=2 is at 90 deg (bottom)
      const angle = (i * 40 - 90) * (Math.PI / 180);
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
  }, []);

  const getFallingCapsuleStyles = () => {
    switch(expectedRarity) {
      case 'GEOCHAOS': return 'bg-accent-magenta shadow-[0_0_20px_#FF3AF2]';
      case 'LEGENDAIRE': return 'bg-accent-yellow shadow-[0_0_20px_#FFE600]';
      case 'EPIQUE': return 'bg-accent-purple shadow-[0_0_15px_#7B2FFF]';
      case 'RARE': return 'bg-accent-cyan shadow-[0_0_15px_#00F5D4]';
      default: return 'bg-gray-400 shadow-md';
    }
  };

  return (
    <div className="relative w-64 h-80 sm:h-96 flex flex-col items-center justify-end">
      <div className="absolute top-0 w-56 h-56 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/30 overflow-hidden shadow-inner z-0">
        <motion.div 
          animate={isPulling ? { rotate: -1080 } : { rotate: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
        >
          {capsules.map((pos, i) => (
            <motion.div 
              key={i} 
              className={`absolute w-12 h-12 rounded-full border-2 ${RARITY_COLORS[capsuleColors[i]]} overflow-hidden shadow-inner transition-colors duration-200`}
              style={{ 
                left: `calc(50% + ${pos.x}px - 24px)`, 
                top: `calc(50% + ${pos.y}px - 24px)`,
              }}
              animate={isPulling ? { rotate: 1080 } : { rotate: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <div className="absolute top-0 w-full h-1/2 bg-white/40 rounded-t-full"></div>
              {(capsuleColors[i] === 'GEOCHAOS' || capsuleColors[i] === 'LEGENDAIRE') && (
                <Sparkles className="absolute top-1 left-2 text-white opacity-50" size={14}/>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <div className="w-64 h-40 sm:h-48 bg-accent-magenta rounded-t-3xl rounded-b-xl border-4 border-white shadow-[0_0_20px_#FF3AF2] relative flex flex-col items-center z-10">
        <div className="absolute top-3 right-4 bg-accent-yellow text-max-bg font-black px-2 py-0.5 sm:py-1 rounded-lg border-2 border-max-bg text-xs sm:text-sm transform rotate-12 shadow-md">
          10 {language === 'fr' ? 'PIÈCES' : 'COINS'}
        </div>

        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-max-bg/50 rounded-full mt-6 sm:mt-8 border-4 border-white/20 flex items-center justify-center relative shadow-inner">
          <motion.div 
            animate={isPulling ? { rotate: 720 } : { rotate: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full border-4 border-accent-cyan relative flex items-center justify-center shadow-md cursor-pointer"
          >
            <div className="absolute w-2 h-4 sm:h-6 bg-accent-cyan top-1 rounded-full"></div>
            <div className="absolute w-4 sm:w-6 h-2 bg-accent-cyan left-1 rounded-full"></div>
            <div className="absolute w-2 h-4 sm:h-6 bg-accent-cyan bottom-1 rounded-full"></div>
            <div className="absolute w-4 sm:w-6 h-2 bg-accent-cyan right-1 rounded-full"></div>
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-accent-magenta border-2 border-white rounded-full z-10"></div>
          </motion.div>
        </div>

        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-max-bg rounded-lg border-2 border-white/40 absolute bottom-3 left-6 flex items-end justify-center overflow-hidden shadow-inner">
          <div className="w-full h-3/4 bg-black/60 rounded-t-lg"></div>
        </div>
      </div>
      
      <AnimatePresence>
        {isPulling && expectedRarity && (
          <motion.div
            initial={{ y: -100, x: -60, opacity: 0, scale: 0.5 }}
            animate={{ 
              y: [null, 60, 30, 60], 
              x: -60,
              opacity: 1, 
              rotate: 360,
              scale: 1 
            }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1, delay: 2.1 }}
            className={`absolute z-20 bottom-3 left-6 sm:left-7 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white flex flex-col items-center justify-center ${getFallingCapsuleStyles()}`}
          >
            <div className="absolute top-0 w-full h-1/2 bg-white/50 rounded-t-full"></div>
            {(expectedRarity === 'GEOCHAOS' || expectedRarity === 'LEGENDAIRE' || expectedRarity === 'EPIQUE') && (
              <Sparkles className="text-white z-10 drop-shadow-md animate-pulse" size={20} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
