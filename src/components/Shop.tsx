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
  const { coins, setCoins, ownedCards, addCard, usedPromoCodes, addPromoCode } = useFirebase();
  const { t, language } = useTranslation();

  const [isPulling, setIsPulling] = useState(false);
  const [pulledCard, setPulledCard] = useState<{ country: Country, rarity: Rarity, isNew: boolean } | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  
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
    
    setPulledCard({ country: drawnCountry, rarity: drawnRarity, isNew });
    setIsPulling(true);
    
    setTimeout(() => {
      addCard(drawnCountry.name);
      triggerConfetti(drawnRarity);
      setIsPulling(false);
    }, 3200); // Wait for the new capsule animation to finish before revealing
  }, [coins, cheatMode, ownedCards, setCoins, addCard]);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    
    const PROMO_CODES: Record<string, number> = {
      'BNZ19420': 10,
      'STORYPV': 100,
      'DESOLECONSTANCE': 70,
      'GEOZONE': 100,
      'MOUFFE': 100
    };

    if (code === 'MONDEINVERSE?ETPUISQUOIENCORE') {
      if (usedPromoCodes.includes(code)) {
        setPromoMessage(t('promo_already_used') || 'Code déjà utilisé');
      } else {
        setCoins(c => (c || 0) + 1);
        addCard("Bataillon d'exploration");
        addPromoCode(code);
        setPromoMessage(`Bataillon d'exploration débloqué + 1 ${language === 'fr' ? 'Pièce' : 'Coin'} !`);
      }
    } else if (PROMO_CODES[code]) {
      if (usedPromoCodes.includes(code)) {
        setPromoMessage(t('promo_already_used') || 'Code déjà utilisé');
      } else {
        const reward = PROMO_CODES[code];
        setCoins(c => (c || 0) + reward);
        addPromoCode(code);
        setPromoMessage(`+${reward} ${language === 'fr' ? 'Pièces' : 'Coins'} !`);
      }
    } else {
      setPromoMessage(t('promo_invalid') || 'Code invalide');
    }
    setTimeout(() => setPromoMessage(''), 3000);
    setPromoCode('');
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 ${isShaking ? 'animate-bounce' : ''}`}>
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

      <div className="flex w-full justify-between items-center mb-8 md:mb-10 z-10">
         <MaxButton onClick={onBack} variant="secondary" className="px-4 h-10 uppercase text-xs">
           {t('btn_back')}
         </MaxButton>
         <div className="flex items-center gap-2 bg-max-muted px-4 py-2 rounded-xl border-2 border-accent-yellow shadow-[4px_4px_0px_#FFE600]">
           <Coins className="text-accent-yellow" size={20} />
           <span className="text-xl font-black">{cheatMode ? '∞' : coins}</span>
         </div>
      </div>
      
      <MaxCard accent="purple" className="flex flex-col items-center w-full mb-4 py-4 px-4 text-center relative overflow-hidden z-20">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase mb-2 animate-gradient-shift bg-gradient-to-r from-accent-yellow via-accent-magenta to-accent-cyan bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,58,242,0.6)] z-10">{t('shop_title')}</h2>
        
        {cheatMode && (
          <div className="bg-red-500/20 text-red-400 font-bold px-3 py-1 rounded-lg mb-2 flex items-center gap-2 border border-red-500/50 z-10 text-sm">
            <AlertTriangle size={16} /> {t('shop_cheat_mode')}
          </div>
        )}

        <div className="relative h-72 sm:h-80 w-full flex items-center justify-center perspective-1000 mb-10 z-10">
          <AnimatePresence mode="wait">
            {(!pulledCard || isPulling) && (
              <motion.div
                key="machine"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute"
              >
                <GashaponMachine isPulling={isPulling} expectedRarity={isPulling ? pulledCard?.rarity : undefined} />
              </motion.div>
            )}
            
            {!isPulling && pulledCard && (
              <motion.div
                key="result"
                initial={{ scale: 0, y: 100, rotateY: 180 }}
                animate={{ scale: 1, y: 0, rotateY: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="z-20 relative w-56 sm:w-64"
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
          className="mt-6 text-xl sm:text-2xl h-14 sm:h-16 px-8 group flex items-center justify-center w-full z-10"
        >
          {isPulling ? t('shop_pulling') : pulledCard ? t('shop_pull_again') : t('shop_pull_btn')}
        </MaxButton>
      </MaxCard>

      {/* Promo Code Section */}
      <div className="mt-8 flex flex-col items-center z-10 w-full max-w-sm">
        <form onSubmit={handlePromoSubmit} className="flex w-full gap-2">
          <input 
            type="text" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder={t('promo_placeholder') || 'Promo code'}
            className="flex-1 bg-max-bg border-4 border-white/20 rounded-xl px-4 py-2 font-black uppercase placeholder:text-white/30 focus:outline-none focus:border-accent-cyan transition-colors"
          />
          <MaxButton type="submit" variant="secondary" className="px-6 border-white/20 hover:border-accent-cyan">
            {t('promo_btn') || 'OK'}
          </MaxButton>
        </form>
        <div className="h-6 mt-2">
          {promoMessage && (
            <p className="text-sm font-black text-accent-yellow animate-pulse uppercase tracking-wider">{promoMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
