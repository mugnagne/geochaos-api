import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COUNTRIES } from '../data/countries';
import { getCountryRarity, RARITIES } from '../data/rarities';
import { Country, Rarity } from '../types';
import { MaxButton, MaxCard } from './MaximalistComponents';
import { GachaCard } from './GachaCard';
import { GashaponMachine } from './GashaponMachine';
import { useFirebase } from './FirebaseProvider';
import { useTranslation } from './TranslationProvider';

interface Props {
  cheatMode?: boolean;
  onBack: () => void;
}

export function Shop({ cheatMode = false, onBack }: Props) {
  const { coins, setCoins, ownedCards, addCard } = useFirebase();
  const { t } = useTranslation();

  const [isPulling, setIsPulling] = useState(false);
  const [pulledCard, setPulledCard] = useState<{ country: Country, rarity: Rarity, isNew: boolean } | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  
  const triggerConfetti = (rarity: Rarity) => {
    let scalar = 1;
    let colors = ['#ffffff'];
    let particleCount = 50;

    switch(rarity) {
      case 'GEOCHAOS':
        scalar = 2.5;
        colors = ['#FF3AF2', '#00F5D4', '#FFE600'];
        particleCount = 300;
        setIsShaking(true);
        setIsFlashing(true);
        setTimeout(() => setIsShaking(false), 800);
        setTimeout(() => setIsFlashing(false), 1500);
        break;
      case 'LEGENDAIRE':
        scalar = 1.8;
        colors = ['#FFE600', '#FFA500', '#ffffff'];
        particleCount = 150;
        setIsShaking(true);
        setIsFlashing(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setIsFlashing(false), 800);
        break;
      case 'EPIQUE':
        scalar = 1.2;
        colors = ['#FF3AF2', '#7B2FFF'];
        particleCount = 80;
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 500);
        break;
      case 'RARE':
        colors = ['#00F5D4', '#007BFF'];
        break;
      default:
        colors = ['#aaaaaa', '#ffffff'];
        break;
    }

    confetti({
      particleCount,
      spread: rarity === 'GEOCHAOS' ? 120 : 70,
      origin: { y: 0.6 },
      colors,
      scalar
    });
  };

  const handlePull = useCallback(() => {
    if (coins < 10 && !cheatMode) return;
    
    if (!cheatMode) {
      setCoins(c => c - 10);
    }
    
    setIsPulling(true);
    setPulledCard(null);
    
    setTimeout(() => {
      // Determine rarity based on global chances
      const rand = Math.random() * 100;
      let drawnRarity: Rarity = 'COMMUN';
      
      let accum = 0;
      if (rand < (accum += RARITIES.GEOCHAOS.chance)) drawnRarity = 'GEOCHAOS';
      else if (rand < (accum += RARITIES.LEGENDAIRE.chance)) drawnRarity = 'LEGENDAIRE';
      else if (rand < (accum += RARITIES.EPIQUE.chance)) drawnRarity = 'EPIQUE';
      else if (rand < (accum += RARITIES.RARE.chance)) drawnRarity = 'RARE';
      else drawnRarity = 'COMMUN';

      // Get all countries matching this rarity
      const matchingCountries = COUNTRIES.filter(c => getCountryRarity(c.name) === drawnRarity);
      
      // Fallback if none (shouldn't happen)
      const pool = matchingCountries.length > 0 ? matchingCountries : COUNTRIES;
      
      const drawnCountry = pool[Math.floor(Math.random() * pool.length)];
      
      const existing = ownedCards.find(c => c.countryName === drawnCountry.name);
      const isNew = !existing;
      
      addCard(drawnCountry.name);
      
      setPulledCard({ country: drawnCountry, rarity: drawnRarity, isNew });
      triggerConfetti(drawnRarity);
      setIsPulling(false);
    }, 2000); // 2s animation
  }, [coins, cheatMode, ownedCards, setCoins, addCard]);

  return (
    <div className={`flex flex-col items-center w-full max-w-4xl mx-auto py-8 px-4 ${isShaking ? 'animate-bounce' : ''}`}>
      <AnimatePresence>
         {isFlashing && (
           <motion.div 
             initial={{ opacity: 1 }}
             animate={{ opacity: 0 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 1 }}
             className="fixed inset-0 bg-white z-[100] pointer-events-none mix-blend-overlay"
           />
         )}
      </AnimatePresence>

      <div className="flex w-full justify-between items-center mb-8 z-10">
         <MaxButton onClick={onBack} variant="secondary" className="px-6 h-12 uppercase text-sm">
           {t('btn_back')}
         </MaxButton>
         <div className="flex items-center gap-3 bg-max-muted px-6 py-3 rounded-2xl border-4 border-accent-yellow shadow-max-yellow">
           <Coins className="text-accent-yellow" size={24} />
           <span className="text-2xl font-black">{cheatMode ? '∞' : coins}</span>
         </div>
      </div>
      
      <MaxCard accent="purple" className="flex flex-col items-center w-full mb-12 text-center relative overflow-hidden z-20">
        <h2 className="text-4xl md:text-5xl font-black text-accent-magenta uppercase mb-4 text-shadow-magenta z-10">{t('shop_title')}</h2>
        <p className="text-xl font-bold opacity-80 mb-8 max-w-lg z-10">
          {t('shop_subtitle')} <br/>
          {t('shop_price')}
        </p>

        {cheatMode && (
          <div className="bg-red-500/20 text-red-400 font-bold px-4 py-2 rounded-xl mb-6 flex items-center gap-2 border border-red-500/50 z-10">
            <AlertTriangle size={18} /> {t('shop_cheat_mode')}
          </div>
        )}

        <div className="relative h-96 w-full flex items-center justify-center perspective-1000 mb-8 mt-4 z-10">
          <AnimatePresence mode="wait">
            {(!pulledCard || isPulling) && (
              <motion.div
                key="machine"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute"
              >
                <GashaponMachine isPulling={isPulling} />
              </motion.div>
            )}
            
            {!isPulling && pulledCard && (
              <motion.div
                key="result"
                initial={{ scale: 0, y: 100, rotateY: 180 }}
                animate={{ scale: 1, y: 0, rotateY: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="z-20 relative w-64 sm:w-80"
              >
                {/* Glow effect matching rarity */}
                <div className={`absolute -inset-10 rounded-full blur-3xl opacity-50 -z-10
                  ${pulledCard.rarity === 'GEOCHAOS' ? 'bg-accent-magenta' : 
                    pulledCard.rarity === 'LEGENDAIRE' ? 'bg-accent-yellow' : 
                    pulledCard.rarity === 'EPIQUE' ? 'bg-accent-purple' : 
                    pulledCard.rarity === 'RARE' ? 'bg-accent-cyan' : 'bg-gray-500'}`} 
                />
                <GachaCard 
                  className="w-full"
                  country={pulledCard.country} 
                  rarity={pulledCard.rarity} 
                  isNew={pulledCard.isNew} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MaxButton 
          onClick={handlePull} 
          disabled={isPulling || (coins < 10 && !cheatMode)}
          className="mt-4 text-2xl h-20 px-12 group flex items-center justify-center w-full sm:w-auto z-10"
        >
          {isPulling ? t('shop_pulling') : pulledCard ? t('shop_pull_again') : t('shop_pull_btn')}
        </MaxButton>
      </MaxCard>
    </div>
  );
}
