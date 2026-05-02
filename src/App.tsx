import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Trophy, RefreshCcw, ArrowRight, Star, Zap, Target, BookOpen, ShoppingBag, List, Crown } from 'lucide-react';
import { COUNTRIES } from './data/countries';
import { CATEGORIES } from './data/categories';
import { getCountryRarity } from './data/rarities';
import { Country, CategorySpec, GameCategory, GameState, GameMode, Round, OwnedCard } from './types';
import { MaxButton, MaxCard, FloatingShape } from './components/MaximalistComponents';
import { calculateRank } from './lib/gameUtils';
import { FlagShuffle } from './components/FlagShuffle';
import { Info, MapPin, Languages, Coins, Landmark, HelpCircle, XCircle, X, Settings, User } from 'lucide-react';
import { getDailySeed, mulberry32 } from './lib/dailySeed';
import { Shop } from './components/Shop';
import { Collection } from './components/Collection';
import { BonusWheel } from './components/BonusWheel';
import { useFirebase } from './components/FirebaseProvider';
import { useTranslation } from './components/TranslationProvider';
import { LanguageSelector } from './components/LanguageSelector';
import { Leaderboard } from './components/Leaderboard';
import { Bonus } from './types';

const getFrenchName = (abbreviation: string | undefined, fallback: string) => {
  try {
    const code = abbreviation?.trim().toUpperCase();
    if (!code || !/^([A-Z]{2}|[0-9]{3})$/.test(code)) return fallback;
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) || fallback;
  } catch (e) {
    return fallback;
  }
};

function AnimatedRank({ targetRank }: { targetRank: number }) {
  const [current, setCurrent] = useState(195);
  
  useEffect(() => {
     let start = 195;
     const end = targetRank;
     if (start === end) {
       setCurrent(end);
       return;
     }
     
     const dur = 1000;
     const frames = 30;
     const stepTime = dur / frames;
     const stepValue = (start - end) / frames;
     
     let i = 0;
     const interval = setInterval(() => {
        i++;
        if (i >= frames) {
           setCurrent(end);
           clearInterval(interval);
        } else {
           setCurrent(Math.floor(start - i * stepValue));
        }
     }, stepTime);
     
     return () => clearInterval(interval);
  }, [targetRank]);

  return <span>{current}</span>;
}

export default function App() {
  const { user, customDisplayName, photoURL, updatePhotoURL, login, logout, coins, setCoins, highScore, setHighScore, ownedCards, loading, connectionStatus, updateDisplayName } = useFirebase();

  useEffect(() => {
    if (customDisplayName) {
      setDisplayNameInput(customDisplayName);
    } else if (user?.displayName) {
      setDisplayNameInput(user.displayName);
    } else if (user?.email) {
      setDisplayNameInput(user.email.split('@')[0]);
    }
  }, [user, customDisplayName]);
  const { t, getCategoryTranslation, getFormattedCountryName, language } = useTranslation();

  const [gameState, setGameState] = useState<GameState>('HOME');
  const [gameMode, setGameMode] = useState<GameMode>('ENDLESS');
  
  const [cheatMode, setCheatMode] = useState(false);

  const [rounds, setRounds] = useState<Round[]>([]);
  const [availableCategories, setAvailableCategories] = useState<GameCategory[]>([]);
  const [currentCountry, setCurrentCountry] = useState<Country | null>(null);
  const [revealStatus, setRevealStatus] = useState<'SHUFFLING' | 'REVEALED' | 'CALCULATING' | 'RESULT' | 'ENDING'>('REVEALED');
  const [showInfo, setShowInfo] = useState(false);
  const [infoCategory, setInfoCategory] = useState<GameCategory | null>(null);
  const [pointLoss, setPointLoss] = useState<number | null>(null);
  const [calculatedRound, setCalculatedRound] = useState<{ category: GameCategory, rank: number, value: number, isMissing?: boolean } | null>(null);
  const [activeBonus, setActiveBonus] = useState<Bonus | null>(null);
  const [bonusUsed, setBonusUsed] = useState<boolean>(false);
  const [bonusActiveRound, setBonusActiveRound] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [doubleNextRound, setDoubleNextRound] = useState<boolean>(false);
  const [nextCountry, setNextCountry] = useState<Country | null>(null);

  const totalRanks = useMemo(() => rounds.reduce((acc, r) => acc + r.rank, 0), [rounds]);
  const currentScore = 200 - totalRanks;
  const isWinner = rounds.length === 6 && currentScore >= 0;

  // Cheat code listener BNZ
  useEffect(() => {
    let buf = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      buf = (buf + e.key).slice(-3).toUpperCase();
      if (buf === 'BNZ') {
        setCheatMode(true);
        buf = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startNewGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    let catsToUse: GameCategory[] = [];
    let firstCountry: Country;

    const gameCountries = COUNTRIES.filter(c => getCountryRarity(c.name) !== 'GEOCHAOS');

    if (mode === 'DAILY') {
      const seed = getDailySeed();
      const rng = mulberry32(seed);

      const shuffledCategories = [...CATEGORIES].sort(() => rng() - 0.5).slice(0, 6);
      catsToUse = shuffledCategories.map(cat => ({
        ...cat,
        direction: rng() > 0.5 ? 'HIGHER' : 'LOWER'
      }));

      firstCountry = gameCountries[Math.floor(Math.random() * gameCountries.length)];
    } else {
      const shuffledCategories = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 6);
      catsToUse = shuffledCategories.map(cat => ({
        ...cat,
        direction: Math.random() > 0.5 ? 'HIGHER' : 'LOWER'
      }));
      firstCountry = gameCountries[Math.floor(Math.random() * gameCountries.length)];
    }

    setAvailableCategories(catsToUse);
    setRounds([]);
    setCurrentCountry(firstCountry);
    setNextCountry(gameCountries[Math.floor(Math.random() * gameCountries.length)]);
    setActiveBonus(null);
    setBonusUsed(false);
    setDoubleNextRound(false);
    setGameState('BONUS_WHEEL');
  }, []);

  const handleBonusSelected = (bonus: Bonus) => {
    setActiveBonus(bonus);
    setGameState('PLAYING');
    setRevealStatus('SHUFFLING');
    setTimeout(() => setRevealStatus('REVEALED'), 1500);
  };

  const handleRevealComplete = () => {
    setRevealStatus('REVEALED');
  };

  const handleActivateBonus = useCallback(() => {
    if (!activeBonus || bonusUsed || revealStatus !== 'REVEALED') return;
    
    if (activeBonus.id === 'RELOCATION') {
      const gameCountries = COUNTRIES.filter(c => getCountryRarity(c.name) !== 'GEOCHAOS');
      const usedCountryNames = rounds.map(r => r.country.name);
      
      let availableCountries = gameCountries.filter(c => !usedCountryNames.includes(c.name));
      if (nextCountry && availableCountries.length > 1) {
         availableCountries = availableCountries.filter(c => c.name !== nextCountry.name);
      }

      const newCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)] || gameCountries[0];
      
      setRevealStatus('SHUFFLING');
      setShowInfo(false);
      setTimeout(() => {
        setCurrentCountry(newCountry);
      }, 750);
      setTimeout(() => setRevealStatus('REVEALED'), 1500);

      setBonusUsed(true);
    } else if (activeBonus.id === 'REROLL') {
      const usedCategoryIds = rounds.map(r => r.category.id);
      const remainingUnplayed = availableCategories.filter(c => !usedCategoryIds.includes(c.id));
      if (remainingUnplayed.length > 0) {
        // pick a random unplayed category
        const catToReplaceIndex = Math.floor(Math.random() * remainingUnplayed.length);
        const catToReplace = remainingUnplayed[catToReplaceIndex];
        
        // pick a completely new category from all categories
        const unassignedCategories = CATEGORIES.filter(c => !availableCategories.find(a => a.id === c.id));
        if (unassignedCategories.length > 0) {
          const newCatBase = unassignedCategories[Math.floor(Math.random() * unassignedCategories.length)];
          const newCat: GameCategory = {
            ...newCatBase,
            direction: Math.random() > 0.5 ? 'HIGHER' : 'LOWER'
          };
          
          setAvailableCategories(cats => cats.map(c => c.id === catToReplace.id ? newCat : c));
          setBonusUsed(true);
        }
      }
    } else if (activeBonus.id === 'ZOMBIE') {
      setBonusUsed(true);
    } else if (activeBonus.id === 'CLAIRVOYANT') {
      setBonusUsed(true);
      setBonusActiveRound(rounds.length);
    } else if (activeBonus.id === 'DOUBLE_OR_NOTHING') {
      setBonusUsed(true);
      setDoubleNextRound(true);

      // Skip the current round
      // advance to next round but simulate 0 rank loss
      const fakeCategory: GameCategory = { 
        id: 'SKIP' as any, 
        direction: 'HIGHER',
        label: 'SKIP',
        labelHigher: 'SKIP',
        labelLower: 'SKIP',
        unit: '',
        description: 'Skip'
      };
      const newRounds = [...rounds, { country: currentCountry!, category: fakeCategory, rank: 0, value: 0 }];
      
      if (newRounds.length === 6) {
        setRevealStatus('ENDING');
        setTimeout(() => {
          setGameState('END');
          const finalScore = 200 - newRounds.reduce((acc, r) => acc + r.rank, 0);
          if (finalScore >= 0) {
            setCoins(c => (c||0) + 15);
            if (highScore === null || finalScore > highScore) setHighScore(finalScore);
          } else {
            setCoins(c => (c||0) + 5);
          }
        }, 1000);
      } else {
        const gameCountries = COUNTRIES.filter(c => getCountryRarity(c.name) !== 'GEOCHAOS');
        const usedCountryNames = newRounds.map(r => r.country.name);
        const availableCountries = gameCountries.filter(c => !usedCountryNames.includes(c.name));
        const _nextCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)] || gameCountries[0];
        setNextCountry(_nextCountry);
        
        setRevealStatus('SHUFFLING');
        setShowInfo(false);
        setTimeout(() => {
          setCurrentCountry(nextCountry || _nextCountry);
        }, 750);
        setTimeout(() => setRevealStatus('REVEALED'), 1500);
      }

    } else if (activeBonus.id === 'FORESHADOWING') {
      setBonusUsed(true);
      setBonusActiveRound(rounds.length);
    }

  }, [activeBonus, bonusUsed, availableCategories, rounds, currentCountry, nextCountry, revealStatus, highScore]);

  const handleCategorySelect = useCallback((category: GameCategory) => {
    if (revealStatus !== 'REVEALED' || !currentCountry) return;

    const isUsed = rounds.some(r => r.category.id === category.id);
    let zombieTriggered = false;
    if (isUsed) {
      if (activeBonus?.id === 'ZOMBIE' && !bonusUsed) {
        zombieTriggered = true;
      } else {
        return;
      }
    }

    let rank = calculateRank(currentCountry, category, COUNTRIES);
    if (doubleNextRound) {
      rank = rank * 2;
    }
    const value = currentCountry[category.id] as number;
    const isMissing = !!currentCountry.isMissing?.[category.id];

    setCalculatedRound({ category, rank, value, isMissing });
    setRevealStatus('CALCULATING');
    if (zombieTriggered) {
      setBonusUsed(true);
    }

    // Durée de l'animation de calcul : 1.5s
    setTimeout(() => {
      setRevealStatus('RESULT');
      setPointLoss(rank);

      if (doubleNextRound) {
        setDoubleNextRound(false);
      }

      const newRounds = [...rounds, { country: currentCountry, category, rank, value }];
      
      // Temps pour regarder le pop-up de score final (1.5s)
      setTimeout(() => {
        setPointLoss(null);
        setCalculatedRound(null);
        setRounds(newRounds);

        if (newRounds.length === 6) {
          setRevealStatus('ENDING');
          if (bonusUsed) {
            setActiveBonus(null);
            setBonusUsed(false);
          }
          setTimeout(() => {
            setGameState('END');
            const finalScore = 200 - newRounds.reduce((acc, r) => acc + r.rank, 0);
            if (finalScore >= 0) {
              setCoins(c => (c||0) + 15);
              if (highScore === null || finalScore > highScore) setHighScore(finalScore);
            } else {
              setCoins(c => (c||0) + 5);
            }
          }, 1000);
        } else {
          const gameCountries = COUNTRIES.filter(c => getCountryRarity(c.name) !== 'GEOCHAOS');
          const usedCountryNames = newRounds.map(r => r.country.name);
          const availableCountries = gameCountries.filter(c => !usedCountryNames.includes(c.name));
          const _nextCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)] || gameCountries[0];
          
          setNextCountry(_nextCountry);
          setRevealStatus('SHUFFLING');
          setShowInfo(false);
          if (bonusUsed) {
            setActiveBonus(null);
            setBonusUsed(false);
          }
          setTimeout(() => {
            setCurrentCountry(nextCountry || _nextCountry);
          }, 750);
          setTimeout(() => setRevealStatus('REVEALED'), 1500);
        }
      }, 1500);
    }, 1500);
  }, [currentCountry, rounds, revealStatus, gameMode, highScore, doubleNextRound, nextCountry]);

  return (
    <div className="min-h-screen w-full relative p-4 pt-28 md:pt-32 md:p-8 flex flex-col items-center justify-center overflow-x-hidden selection:bg-accent-magenta selection:text-white">
      {/* Alpha Badge & Login Widget - Only visible in HOME state */}
      {gameState === 'HOME' && (
        <>
          <div className="absolute top-4 left-4 right-4 z-50 flex flex-wrap items-center justify-between gap-2 sm:gap-4 transition-all duration-500">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => setShowSettings(true)}
                className="bg-max-muted p-2 rounded-xl hover:bg-white/10 transition-colors border-2 border-white/20"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <div className="block">
                {user ? (
                  <div className="flex items-center gap-2 bg-max-muted px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border-2 border-white/20 shadow-lg backdrop-blur-sm group relative">
                    <div className="flex items-center gap-1.5 pr-1 mr-1 border-r border-white/10">
                      <div className={`w-2 h-2 rounded-full ${
                        connectionStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                        connectionStatus === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' : 
                        'bg-yellow-500 animate-pulse'
                      }`} />
                      <div className="absolute top-full left-0 mt-2 bg-max-bg border border-white/20 p-2 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[60]">
                        {connectionStatus === 'online' ? t('sync_online') : 
                         connectionStatus === 'offline' ? t('sync_offline') : 
                         t('sync_checking')}
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm font-bold text-white/80 max-w-[70px] sm:max-w-[150px] truncate">{user.displayName || user.email}</span>
                    <button onClick={logout} className="text-[10px] sm:text-xs bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-2 py-0.5 sm:py-1 rounded font-bold uppercase transition-colors shrink-0">{t('logout')}</button>
                  </div>
                ) : (
                  <button onClick={login} className="text-[10px] sm:text-sm font-black uppercase tracking-wider bg-accent-cyan text-max-bg border-2 border-accent-cyan hover:bg-transparent hover:text-accent-cyan px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-colors shadow-max-cyan shrink-0">
                    {t('login')}
                  </button>
                )}
              </div>
            </div>
            <div className="bg-accent-magenta text-white text-[10px] sm:text-sm font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-max-magenta transform rotate-12 pointer-events-none uppercase border-2 border-white/20 whitespace-nowrap">
              {t('alpha')}
            </div>
          </div>
        </>
      )}

      <FloatingShape type="star" color="#FF3AF2" size="w-24 h-24" top="10%" left="5%" delay={0} />
      <FloatingShape type="circle" color="#00F5D4" size="w-16 h-16" top="20%" left="85%" delay={1} />
      <FloatingShape type="square" color="#FFE600" size="w-20 h-20" top="70%" left="15%" delay={2} />
      <FloatingShape type="star" color="#7B2FFF" size="w-32 h-32" top="80%" left="75%" delay={3} />

      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-center items-center">
        
        {gameState === 'HOME' && (
          <motion.div
            key="home"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center z-10 w-full flex flex-col items-center justify-center flex-1 py-4 px-2"
          >
            <motion.div 
              className="mb-4 sm:mb-6 relative flex flex-col items-center flex-shrink-0"
              animate={{ 
                y: [0, -5, 0],
                rotate: [-0.5, 0.5, -0.5]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="relative flex justify-center items-center -mb-2 sm:-mb-6 z-20">
                <img 
                  src="https://i.postimg.cc/Z0jZ8Kvr/logo-geochaos.png" 
                  alt="Logo GeoChaos"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain pointer-events-none transition-transform duration-1000 animate-blink"
                  style={{ 
                    filter: "drop-shadow(0 0 15px #00F5D4) drop-shadow(0 0 30px #00F5D4)", 
                  }} 
                />
              </div>
              <h1 className="text-[12vw] sm:text-7xl md:text-8xl lg:text-[120px] font-black italic tracking-tighter text-shadow-mega leading-none text-white relative z-10 flex items-center justify-center whitespace-nowrap">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{t('title_geo')}</span>
                <span className="text-accent-yellow ml-1 sm:ml-2">{t('title_chaos')}</span>
              </h1>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
               <div className="flex items-center gap-2 bg-max-muted px-3 py-1.5 rounded-xl border-2 border-accent-yellow text-accent-yellow font-black text-xs sm:text-sm">
                 <Coins size={16} /> {coins} {t('pieces')}
               </div>
               {highScore !== null && (
                 <div className="flex items-center gap-2 bg-max-muted px-3 py-1.5 rounded-xl border-2 border-accent-cyan text-accent-cyan font-black text-xs sm:text-sm">
                   <Crown size={16} /> {t('record')}: {highScore}
                 </div>
               )}
            </div>

            <MaxCard accent="cyan" className="mb-6 w-full max-w-2xl mx-auto p-3 sm:p-5 transition-all duration-300 hover:scale-[1.02]">
              <p className="text-base sm:text-lg md:text-xl font-bold leading-tight">
                {t('subtitle')}
              </p>
            </MaxCard>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 w-full max-w-4xl mx-auto">
              <MaxButton onClick={() => startNewGame('ENDLESS')} className="text-xs sm:text-sm md:text-base h-12 sm:h-14 px-2 sm:px-4 flex items-center justify-center group">
                <Zap className="mr-1 sm:mr-2 group-hover:animate-pulse w-4 h-4 sm:w-5 sm:h-5" /> <span className="truncate">{t('btn_infinite')}</span>
              </MaxButton>
              <MaxButton onClick={() => startNewGame('DAILY')} variant="secondary" className="text-xs sm:text-sm md:text-base h-12 sm:h-14 px-2 sm:px-4 flex items-center justify-center group border-accent-yellow shadow-max-yellow hover:bg-accent-yellow/10">
                <Target className="mr-1 sm:mr-2 group-hover:scale-110 transition-transform w-4 h-4 sm:w-5 sm:h-5" /> <span className="truncate">{t('btn_daily')}</span>
              </MaxButton>
              <MaxButton onClick={() => setGameState('SHOP')} variant="secondary" className="text-xs sm:text-sm md:text-base h-12 sm:h-14 px-2 sm:px-4 flex items-center justify-center border-accent-purple shadow-max-purple hover:bg-accent-purple/10">
                <ShoppingBag className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> <span className="truncate">{t('btn_shop')}</span>
              </MaxButton>
              <MaxButton onClick={() => setGameState('COLLECTION')} variant="secondary" className="text-xs sm:text-sm md:text-base h-12 sm:h-14 px-2 sm:px-4 flex items-center justify-center border-accent-cyan shadow-max-cyan hover:bg-accent-cyan/10">
                <List className="mr-1 sm:mr-2 w-4 h-4 sm:w-5 sm:h-5" /> <span className="truncate">{t('btn_collection')}</span>
              </MaxButton>
            </div>
            
            <div className="mt-4 sm:mt-6 w-full max-w-sm mx-auto flex flex-col gap-4">
              <button 
                onClick={() => setGameState('TUTORIAL')} 
                className="w-full flex items-center justify-center py-2 text-white/50 hover:text-white transition-colors text-xs sm:text-sm font-bold uppercase tracking-wider"
              >
                <BookOpen className="mr-2 w-4 h-4" /> {t('btn_tutorial')}
              </button>

              <Leaderboard />
            </div>
          </motion.div>
        )}

        {gameState === 'SHOP' && (
          <Shop 
            onBack={() => setGameState('HOME')} 
          />
        )}

        {gameState === 'COLLECTION' && (
          <Collection
            onBack={() => setGameState('HOME')} 
          />
        )}

        {gameState === 'TUTORIAL' && (
          <motion.div
            key="tutorial"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center z-10 max-w-2xl px-4 w-full"
          >
            <MaxCard accent="yellow" className="mb-8 text-left space-y-6">
              <h2 className="text-3xl font-black text-accent-magenta uppercase mb-4 text-center border-b-4 border-accent-magenta pb-2">{t('how_to_play')}</h2>
              <div className="space-y-6 text-lg font-medium leading-relaxed text-white flex flex-col">
                <div className="flex items-start gap-4">
                  <Globe className="text-accent-cyan shrink-0 w-8 h-8 mt-1" />
                  <p>
                    {t('step1_title')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <List className="text-accent-magenta shrink-0 w-8 h-8 mt-1" />
                  <p>
                    {t('step2_title')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <Target className="text-accent-yellow shrink-0 w-8 h-8 mt-1" />
                  <p>
                    {t('step3_title')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <Trophy className="text-accent-purple shrink-0 w-8 h-8 mt-1" />
                  <p>
                    {t('step4_title')}
                  </p>
                </div>
              </div>
            </MaxCard>
            <MaxButton onClick={() => setGameState('HOME')} className="text-xl h-16 w-full shadow-max-cyan">
              {t('btn_lets_go')}
            </MaxButton>
          </motion.div>
        )}

        {gameState === 'BONUS_WHEEL' && (
          <motion.div
            key="bonusWheel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full flex justify-center items-center h-full z-10"
          >
            <BonusWheel onBonusSelected={handleBonusSelected} />
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div
            key="playing"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-12 flex flex-row flex-wrap items-center justify-between gap-3 sm:gap-6 mb-4 w-full">
              <button 
                onClick={() => setGameState('HOME')} 
                className="flex items-center justify-center bg-max-bg p-2 sm:p-4 rounded-xl border-2 sm:border-4 border-accent-magenta shadow-max-magenta hover:bg-accent-magenta/20 transition-all shrink-0 z-10"
                title={t('quit_game')}
              >
                <X className="text-accent-magenta shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="flex items-center gap-2 sm:gap-4 bg-max-bg p-2 sm:p-4 rounded-xl border-2 sm:border-4 border-accent-purple shadow-max-cyan flex-1 justify-center min-w-[120px]">
                <Target className="text-accent-cyan shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-black text-xs sm:text-xl md:text-2xl uppercase whitespace-nowrap">{t('round')} {rounds.length + 1}/6</span>
              </div>
              <div className="relative flex items-center gap-2 sm:gap-4 bg-max-bg p-2 sm:p-4 rounded-xl border-2 sm:border-4 border-accent-magenta shadow-max-yellow min-w-[120px] justify-center flex-1 sm:flex-none">
                <Star className="text-accent-yellow shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-black text-xs sm:text-xl md:text-2xl uppercase whitespace-nowrap">{t('score')}: {currentScore}</span>
                <AnimatePresence>
                  {pointLoss !== null && (
                    <motion.div
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -40, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute -top-6 text-2xl md:text-3xl font-black text-accent-magenta drop-shadow-md z-50 pointer-events-none"
                    >
                      -{pointLoss}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {activeBonus && (
              <div className="lg:col-span-12 flex flex-col md:flex-row items-center justify-between bg-max-bg/90 border-2 sm:border-4 border-accent-cyan p-4 rounded-xl shadow-max-cyan gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-accent-cyan p-3 rounded-xl">
                    <span className="font-black text-white">{activeBonus.name}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-300 flex-1 max-w-sm">{activeBonus.description}</p>
                </div>
                {!bonusUsed && activeBonus.id !== 'ZOMBIE' && !(activeBonus.id === 'DOUBLE_OR_NOTHING' && rounds.length === 5) && (
                  <MaxButton 
                    className="!border-0 !shadow-none bg-transparent text-accent-yellow hover:bg-accent-yellow/20 text-sm py-2 px-4 shrink-0"
                    onClick={() => {
                        handleActivateBonus();
                    }}
                  >
                    Utiliser le bonus
                  </MaxButton>
                )}
                {!bonusUsed && activeBonus.id === 'DOUBLE_OR_NOTHING' && rounds.length === 5 && (
                   <div className="text-gray-500 font-bold uppercase text-sm border-2 border-gray-500 px-4 py-2 rounded-xl">
                      Inutilisable (Dernière manche)
                   </div>
                )}
                {activeBonus.id === 'ZOMBIE' && !bonusUsed && (
                   <div className="text-accent-yellow font-bold uppercase text-sm border-2 border-accent-yellow px-4 py-2 rounded-xl">
                      Cliquez sur une catégorie utilisée
                   </div>
                )}
                {activeBonus.id === 'CLAIRVOYANT' && bonusUsed && bonusActiveRound === rounds.length && (
                   <div className="text-accent-cyan font-bold text-sm border-2 border-accent-cyan px-4 py-2 rounded-xl">
                      Stats révélées
                   </div>
                )}
                {activeBonus.id === 'FORESHADOWING' && bonusUsed && nextCountry && bonusActiveRound === rounds.length && (
                   <div className="text-accent-purple font-bold text-sm border-2 border-accent-purple px-4 py-2 rounded-xl">
                      {t('foreshadowing_next')} : {getFormattedCountryName(nextCountry.abbreviation || '', nextCountry.name || '')}
                   </div>
                )}
                {activeBonus.id === 'DOUBLE_OR_NOTHING' && bonusUsed && bonusActiveRound === rounds.length && (
                   <div className="text-accent-yellow font-bold text-sm border-2 border-accent-yellow px-4 py-2 rounded-xl animate-pulse">
                      Points x2 pour cette manche !
                   </div>
                )}
                {bonusUsed && (activeBonus.id === 'RELOCATION' || activeBonus.id === 'REROLL' || activeBonus.id === 'ZOMBIE' || bonusActiveRound !== rounds.length) && (
                  <div className="text-gray-500 font-bold uppercase text-sm border-2 border-gray-500 px-4 py-2 rounded-xl">
                    Utilisé
                  </div>
                )}
              </div>
            )}

            {gameMode === 'DAILY' && (
              <div className="lg:col-span-12 bg-accent-yellow/20 border-2 border-accent-yellow p-3 rounded-xl text-center shadow-max-yellow animate-pulse">
                <p className="text-accent-yellow font-black uppercase text-sm sm:text-base">
                  {t('daily_mode_desc')}
                </p>
              </div>
            )}

            <div className="lg:col-span-12">
              <AnimatePresence mode="wait">
                {revealStatus === 'SHUFFLING' && currentCountry ? (
                  <motion.div
                    key="shuffling"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="w-full"
                  >
                    <FlagShuffle targetCountry={currentCountry} onComplete={handleRevealComplete} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    <div className="lg:col-span-5 h-full">
                      <MaxCard accent="yellow" className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px] lg:min-h-[300px]">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent-magenta rounded-full mb-4 sm:mb-6 flex items-center justify-center border-4 border-white animate-float overflow-hidden shadow-xl shrink-0">
                          {currentCountry && (
                            <img 
                              src={currentCountry.flagUrl || `https://flagcdn.com/w160/${currentCountry.abbreviation.toLowerCase()}.png`} 
                              className="w-full h-full object-cover"
                              alt={`Drapeau de ${getFormattedCountryName(currentCountry?.abbreviation || '', currentCountry?.name || '')}`}
                            />
                          )}
                        </div>
                        
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl mb-2 sm:mb-4 text-shadow-magenta text-white font-black leading-tight break-words w-full">
                          {getFormattedCountryName(currentCountry?.abbreviation || '', currentCountry?.name || '')}
                        </h2>
                        
                        <div className="w-full h-2 bg-max-muted rounded-full overflow-hidden mb-4">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(rounds.length) / 6 * 100}%` }}
                            className="h-full bg-accent-cyan"
                          />
                        </div>

                        <MaxButton 
                          variant="secondary" 
                          className="h-12 w-full mb-4 flex items-center justify-center gap-3 border-dashed border-2 text-sm sm:text-base font-bold truncate rounded-xl px-2"
                          onClick={() => setShowInfo(!showInfo)}
                        >
                          {showInfo ? <XCircle size={20} className="shrink-0" /> : <Info size={20} className="shrink-0" />}
                          <span className="truncate">{showInfo ? t('hide_info') : t('more_info')}</span>
                        </MaxButton>

                        <AnimatePresence>
                          {showInfo && currentCountry && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full bg-max-bg/50 p-4 rounded-2xl border-2 border-accent-cyan text-left space-y-2 overflow-hidden shadow-inner"
                            >
                              <div className="flex items-center gap-3 text-sm font-bold">
                                <Landmark className="text-accent-yellow shrink-0" size={18} />
                                <span className="text-white/60">{t('capital')}:</span> {currentCountry.capital}
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold">
                                <Languages className="text-accent-magenta shrink-0" size={18} />
                                <span className="text-white/60">{t('language_label')}:</span> {currentCountry.officialLanguage || 'N/A'}
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold">
                                <Coins className="text-accent-cyan shrink-0" size={18} />
                                <span className="text-white/60">{t('currency')}:</span> {currentCountry.currency || 'N/A'}
                              </div>
                              <div className="flex items-center gap-3 text-sm font-bold">
                                <MapPin className="text-accent-purple shrink-0" size={18} />
                                <span className="text-white/60">{t('largest_city')}:</span> {currentCountry.largestCity || 'N/A'}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </MaxCard>
                    </div>

                    <div className="lg:col-span-7 relative">
                      <AnimatePresence>
                        {infoCategory && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-max-bg/90 backdrop-blur-sm rounded-xl"
                          >
                            <MaxCard accent="purple" className="w-full max-w-sm flex flex-col items-center text-center !bg-max-bg border-style-solid">
                               <HelpCircle className="text-accent-purple mb-4" size={48} />
                               <h4 className="text-2xl font-black uppercase mb-2 text-white">
                                 {getCategoryTranslation(infoCategory.id).labelHigher} / {getCategoryTranslation(infoCategory.id).labelLower}
                               </h4>
                               <p className="text-sm font-bold opacity-80 leading-relaxed mb-6">
                                 {getCategoryTranslation(infoCategory.id).description}
                               </p>
                               <MaxButton onClick={() => setInfoCategory(null)} className="w-full bg-accent-purple">
                                  {t('understand')}
                               </MaxButton>
                            </MaxCard>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {(revealStatus === 'CALCULATING' || revealStatus === 'RESULT') && calculatedRound && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-max-bg/95 backdrop-blur-sm rounded-xl"
                          >
                            <MaxCard accent="cyan" className="w-full max-w-sm flex flex-col items-center text-center !bg-max-bg border-4 shadow-max-cyan">
                              <h4 className="text-xl font-black uppercase text-white/50 mb-2">
                                {calculatedRound.category.direction === 'HIGHER' ? getCategoryTranslation(calculatedRound.category.id).labelHigher : getCategoryTranslation(calculatedRound.category.id).labelLower}
                              </h4>
                              <div className="text-2xl font-bold text-white mb-6">
                                {calculatedRound.isMissing ? '≈ ' : ''}{calculatedRound.value.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} {getCategoryTranslation(calculatedRound.category.id).unit}
                              </div>
                              <div className="text-6xl sm:text-8xl font-black text-accent-yellow drop-shadow-md mb-2">
                                #<AnimatedRank targetRank={calculatedRound.rank} />
                              </div>
                              <div className="text-sm font-bold text-white/40 uppercase tracking-widest">
                                / {COUNTRIES.length} {t('rank_of_countries')}
                              </div>
                            </MaxCard>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-4">
                        {availableCategories.map((cat, idx) => {
                          const isUsed = rounds.some(r => r.category.id === cat.id);
                          const canZombie = activeBonus?.id === 'ZOMBIE' && !bonusUsed && isUsed;
                          const isDisabled = isUsed && !canZombie;
                          const colors = ['magenta', 'cyan', 'yellow', 'orange', 'purple'];
                          const accent = colors[idx % colors.length];
                          const catT = getCategoryTranslation(cat.id);
                          
                          return (
                            <motion.div
                              key={cat.id}
                              className="relative"
                            >
                              <motion.button
                                disabled={isDisabled}
                                whileHover={!isDisabled ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
                                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                                onClick={() => handleCategorySelect(cat)}
                                className={`relative w-full p-3 sm:p-4 lg:p-6 flex flex-row lg:flex-col items-center lg:items-start justify-between rounded-xl lg:rounded-2xl border-2 sm:border-4 text-left group transition-all duration-300 min-h-[4.5rem] sm:min-h-[5rem] lg:min-h-[11rem] overflow-hidden
                                  ${isUsed && !canZombie
                                    ? 'border-gray-600 bg-gray-600/20 grayscale opacity-40 cursor-not-allowed font-black' 
                                    : canZombie ? 'border-accent-yellow bg-accent-yellow/20 hover:shadow-max-yellow' : `border-accent-${accent} bg-max-muted hover:shadow-max-${accent}`
                                  }
                                `}
                              >
                              <div className="flex items-center lg:items-start lg:justify-between lg:w-full gap-2 w-full pr-2 lg:mb-4">
                                <h3 className={`font-black text-sm sm:text-base md:text-lg lg:text-xl uppercase leading-tight lg:leading-snug truncate lg:whitespace-normal lg:overflow-visible ${isUsed && !canZombie ? 'text-gray-500' : canZombie ? 'text-accent-yellow' : 'text-white'}`}>
                                  {cat.direction === 'HIGHER' ? catT.labelHigher : catT.labelLower}
                                </h3>
                                {!isDisabled && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInfoCategory(cat);
                                    }}
                                    className="z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 hidden lg:flex items-center justify-center text-white transition-colors border border-white/20 select-none cursor-pointer shrink-0"
                                  >
                                     <Info size={16} />
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center lg:justify-between lg:w-full gap-2 shrink-0 lg:mt-auto">
                                {!isDisabled && (
                                  <>
                                    <div className="text-accent-cyan font-bold text-[10px] sm:text-xs lg:text-sm uppercase bg-max-bg/50 px-2 py-1 lg:px-3 lg:py-2 rounded hidden sm:flex items-center backdrop-blur-sm self-start w-fit">
                                       {t('ranking_this_country')} <ArrowRight className="ml-1 w-3 h-3 lg:w-4 lg:h-4 lg:ml-2" />
                                    </div>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInfoCategory(cat);
                                      }}
                                      className="z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex lg:hidden items-center justify-center text-white transition-colors border border-white/20 select-none cursor-pointer shrink-0"
                                    >
                                       <Info size={16} />
                                    </div>
                                  </>
                                )}
                                {isUsed && !canZombie && (
                                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="text-xl sm:text-2xl lg:text-4xl font-black text-white/30 lg:text-white/10 -rotate-12 px-2 shrink-0">{t('used')}</span>
                                   </div>
                                )}
                                {canZombie && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="text-xl sm:text-2xl lg:text-3xl font-black text-accent-yellow -rotate-12 px-2 shrink-0">Zombie</span>
                                  </div>
                                )}
                              </div>
                              {activeBonus?.id === 'CLAIRVOYANT' && bonusUsed && bonusActiveRound === rounds.length && currentCountry && (
                                <div className="absolute font-black text-accent-cyan bottom-2 right-2 text-xs sm:text-sm bg-max-bg/80 px-2 rounded backdrop-blur">
                                  {currentCountry.isMissing?.[cat.id] ? '≈ ' : ''}{(currentCountry[cat.id] as number).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} {catT.unit}
                                </div>
                              )}
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-12 mt-8">
              <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                {rounds.map((round, idx) => (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={idx}
                    className="min-w-[200px] w-64 bg-max-muted border-2 border-accent-purple rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-max-cyan shrink-0"
                  >
                    <span className="text-[10px] md:text-xs font-black text-accent-magenta uppercase mb-2 bg-max-bg/40 px-2 py-1 rounded">
                      {round.category.id === 'SKIP' ? 'Bonus Quitte ou Double' : (round.category.direction === 'HIGHER' ? getCategoryTranslation(round.category.id).labelHigher : getCategoryTranslation(round.category.id).labelLower)}
                    </span>
                    <span className="text-lg font-bold truncate w-full px-2 mb-1">
                       {round.category.id === 'SKIP' ? 'Manche Passée' : getFormattedCountryName(round.country.abbreviation, round.country.name)}
                    </span>
                    <div className="text-sm font-medium text-white/70">
                      {round.category.id === 'SKIP' ? (
                          <span className="text-accent-yellow italic">x2 Prochain Tour</span>
                      ) : round.value !== null && round.value !== undefined ? (
                        <>
                          {round.country.isMissing?.[round.category.id] ? '≈ ' : ''}{round.value.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} {getCategoryTranslation(round.category.id).unit}
                        </>
                      ) : (
                        <span className="text-accent-magenta italic">{t('no_stats')}</span>
                      )}
                    </div>
                    <div className="text-3xl font-black text-accent-yellow mt-3 bg-max-bg/50 px-4 py-2 rounded-xl border border-accent-yellow/20">
                      {round.category.id === 'SKIP' ? '-' : `#${round.rank}`} {round.category.id !== 'SKIP' && <span className="text-sm text-white/50">/ {COUNTRIES.length}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'END' && (
          <motion.div
            key="end"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center z-10 max-w-4xl px-4"
          >
            <div className="mb-8">
              {isWinner ? (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-accent-yellow rounded-full flex items-center justify-center border-4 sm:border-8 border-white mb-4 sm:mb-6"
                  >
                    <Trophy className="w-12 h-12 sm:w-20 sm:h-20 text-max-bg" />
                  </motion.div>
                  <h1 className="text-5xl sm:text-8xl md:text-9xl text-accent-cyan text-shadow-mega mb-4 animate-gradient-shift bg-gradient-to-r from-accent-cyan via-accent-yellow to-accent-magenta bg-clip-text text-transparent leading-tight">
                    {t('victory')}
                  </h1>
                </div>
              ) : (
                <h1 className="text-5xl sm:text-8xl md:text-9xl text-accent-orange text-shadow-mega mb-4 leading-tight">
                  {t('game_over')}
                </h1>
              )}
              <div className="text-4xl md:text-6xl font-black uppercase mb-12">
                {t('final_score')}: <span className={isWinner ? 'text-accent-cyan' : 'text-accent-orange'}>{currentScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
               <MaxCard accent="purple" className="flex flex-col items-center w-full">
                 <p className="text-lg font-bold mb-4 opacity-70">{t('rank_summary')}</p>
                 <div className="space-y-3 w-full pb-2">
                   {rounds.map((r, i) => (
                     <div key={i} className="flex justify-between items-center border-b-[1px] border-dashed border-max-bg/50 pb-2 text-sm sm:text-base">
                       <div className="flex flex-col text-left">
                         <span className="font-bold">{r.category.id === 'SKIP' ? 'Manche Passée' : getFormattedCountryName(r.country.abbreviation, r.country.name)}</span>
                         <span className="text-[10px] text-white/50 uppercase">{r.category.id === 'SKIP' ? 'Bonus Quitte ou Double' : (r.category.direction === 'HIGHER' ? getCategoryTranslation(r.category.id).labelHigher : getCategoryTranslation(r.category.id).labelLower)}</span>
                       </div>
                       <span className="font-black text-accent-yellow text-xl">{r.category.id === 'SKIP' ? '-' : `#${r.rank}`}</span>
                     </div>
                   ))}
                 </div>
               </MaxCard>
               <div className="flex flex-col gap-4">
                 <MaxButton onClick={() => startNewGame(gameMode)} className="h-24 text-3xl">
                   {t('play_again')} <RefreshCcw className="ml-4" />
                 </MaxButton>
                 <MaxButton variant="outline" onClick={() => setGameState('HOME')} className="h-16 text-xl">
                   {t('main_menu')}
                 </MaxButton>
               </div>
            </div>
          </motion.div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-max-dark border-4 border-white/20 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-mega">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-3xl font-black text-white mb-8 select-none tracking-tight uppercase">
              {t('settings') || 'Paramètres'}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Langue</h3>
                <LanguageSelector />
              </div>
              
              {user && (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Photo de profil</h3>
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-full bg-max-bg border-2 border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                        {photoURL ? (
                          <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <label className="cursor-pointer bg-max-bg border-4 border-white/20 hover:border-accent-cyan rounded-xl px-4 py-2 font-bold text-sm transition-colors text-center flex-1">
                        Changer l'image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_SIZE = 150;
                                  let width = img.width;
                                  let height = img.height;
                                  if (width > height) {
                                    if (width > MAX_SIZE) {
                                      height *= MAX_SIZE / width;
                                      width = MAX_SIZE;
                                    }
                                  } else {
                                    if (height > MAX_SIZE) {
                                      width *= MAX_SIZE / height;
                                      height = MAX_SIZE;
                                    }
                                  }
                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                  updatePhotoURL(dataUrl);
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Pseudo (Leaderboard)</h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={displayNameInput}
                        onChange={(e) => setDisplayNameInput(e.target.value)}
                        maxLength={20}
                        placeholder="Ton pseudo..."
                        className="flex-1 bg-max-bg border-4 border-white/20 rounded-xl px-4 py-2 font-bold focus:outline-none focus:border-accent-cyan transition-colors"
                      />
                      <MaxButton 
                        onClick={() => {
                          if (displayNameInput.trim().length > 0) {
                            updateDisplayName(displayNameInput.trim());
                            setShowSettings(false);
                          }
                        }}
                        className="px-6 py-2 border-white/20 text-sm"
                      >
                        OK
                      </MaxButton>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 w-full max-w-7xl mx-auto py-8 px-4 text-center text-white/30 text-xs sm:text-sm font-medium border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white/50 mb-1 tracking-widest uppercase">GEOCHAOS</p>
            <p>{t('subtitle')}</p>
          </div>
          <div className="flex gap-6 uppercase tracking-tighter">
            <span className="hover:text-accent-cyan cursor-default transition-colors">© 2026 GEOCHAOS</span>
            <span className="hover:text-accent-magenta cursor-default transition-colors">Open Data Géo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
