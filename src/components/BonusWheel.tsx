import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, BarChart, Skull, Eye, Club, Search, Sparkles } from 'lucide-react';
import { MaxButton, MaxCard } from './MaximalistComponents';
import { Bonus } from '../types';
import { BONUSES } from '../data/bonuses';

interface Props {
  onBonusSelected: (bonus: Bonus) => void;
}

const IconMap: Record<string, React.ElementType> = {
  Globe: Globe,
  BarChart: BarChart,
  Skull: Skull,
  Eye: Eye,
  Club: Club,
  Search: Search
};

export function BonusWheel({ onBonusSelected }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const startSpin = () => {
    if (spinning) return;
    setSpinning(true);
    
    // Choose a random bonus
    const targetIndex = Math.floor(Math.random() * BONUSES.length);
    const targetBonus = BONUSES[targetIndex];
    
    // Animate spinning
    let spins = 0;
    const maxSpins = 30 + targetIndex; // random amount of extra spins
    let current = 0;
    
    const interval = setInterval(() => {
      current++;
      setCurrentIndex(current % BONUSES.length);
      
      if (current >= maxSpins) {
        clearInterval(interval);
        setSelectedBonus(targetBonus);
        setTimeout(() => {
          onBonusSelected(targetBonus);
        }, 3000);
      }
    }, 100); // gets slower? we could make it non-linear, but interval is fine for now
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-lg mx-auto bg-max-bg/80 backdrop-blur-md p-6 rounded-3xl">
      <h2 className="text-3xl font-black uppercase text-white mb-8 text-center flex items-center justify-center gap-3">
        <Sparkles className="text-accent-yellow w-8 h-8" />
        Bonus de Partie
        <Sparkles className="text-accent-yellow w-8 h-8" />
      </h2>
      
      {!selectedBonus && (
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 rounded-full"
            >
              {React.createElement(IconMap[BONUSES[currentIndex].icon] || Sparkles, { className: 'w-16 h-16 text-white mb-2' })}
              <span className="text-white font-bold text-center text-xs px-2">{BONUSES[currentIndex].name}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {selectedBonus && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center mb-8 bg-gray-900 p-6 rounded-2xl border-4 border-accent-yellow shadow-max-yellow"
        >
          {React.createElement(IconMap[selectedBonus.icon] || Sparkles, { className: 'w-20 h-20 text-accent-yellow mb-4' })}
          <h3 className="text-2xl font-black text-white text-center mb-2">{selectedBonus.name}</h3>
          <p className="text-gray-300 text-center text-sm font-bold">{selectedBonus.description}</p>
        </motion.div>
      )}

      {!spinning && !selectedBonus && (
        <MaxButton 
          onClick={startSpin}
          className="text-xl px-8 py-4 bg-accent-magenta text-white !border-0 !shadow-none"
        >
          LANCER LA ROUE
        </MaxButton>
      )}
    </div>
  );
}
