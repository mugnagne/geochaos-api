import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MaxButton, MaxCard } from './MaximalistComponents';
import { GachaCard } from './GachaCard';
import { Country, Rarity } from '../types';
import { COUNTRIES } from '../data/countries';
import { RARITIES, getCountryRarity } from '../data/rarities';
import { CATEGORIES } from '../data/categories';
import { X, Lock } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';
import { useTranslation } from './TranslationProvider';
import { TRANSLATIONS } from '../lib/translations';

interface Props {
  onBack: () => void;
}

export function Collection({ onBack }: Props) {
  const { ownedCards } = useFirebase();
  const { t, getFormattedCountryName, getCategoryTranslation, language } = useTranslation();

  const [filter, setFilter] = useState<Rarity | 'ALL'>('ALL');
  const [inspectingCard, setInspectingCard] = useState<{country: Country, rarity: Rarity} | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const stats = useMemo(() => {
    const total = COUNTRIES.length;
    const owned = ownedCards.length;
    
    const byRarity = {
      COMMUN: { total: 0, owned: 0 },
      RARE: { total: 0, owned: 0 },
      EPIQUE: { total: 0, owned: 0 },
      LEGENDAIRE: { total: 0, owned: 0 },
      GEOCHAOS: { total: 0, owned: 0 }
    };
    
    COUNTRIES.forEach(c => {
      const r = getCountryRarity(c.name);
      byRarity[r].total++;
      if (ownedCards.some(oc => oc.countryName === c.name)) {
        byRarity[r].owned++;
      }
    });

    return { total, owned, byRarity };
  }, [ownedCards]);

  const displayedCountries = useMemo(() => {
    return COUNTRIES.filter(c => filter === 'ALL' || getCountryRarity(c.name) === filter)
      .sort((a, b) => {
        const ownedA = ownedCards.some(oc => oc.countryName === a.name);
        const ownedB = ownedCards.some(oc => oc.countryName === b.name);
        if (ownedA && !ownedB) return -1;
        if (!ownedA && ownedB) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [filter, ownedCards]);

  // Lock scroll when inspecting
  useEffect(() => {
    if (inspectingCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [inspectingCard]);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-8 px-4 h-full">
      <div className="flex w-full justify-between items-center mb-8">
         <MaxButton onClick={onBack} variant="secondary" className="px-6 h-12 uppercase text-sm">
           {t('btn_back')}
         </MaxButton>
         <div className="bg-max-muted px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border-4 border-accent-cyan shadow-max-cyan">
           <span className="text-xl sm:text-2xl font-black">{stats.owned} / {stats.total} {t('rank_of_countries')}</span>
         </div>
      </div>

      <MaxCard accent="cyan" className="w-full flex-1 flex flex-col mb-8 overflow-hidden h-full">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl font-black uppercase text-sm border-2 transition-all ${filter === 'ALL' ? 'bg-white text-black border-transparent' : 'bg-transparent text-white border-white/20 hover:border-white/50'}`}
          >
            {t('rarity_all')}
          </button>
          {Object.entries(RARITIES).map(([key, r]) => {
            const rarityKey = `rarity_${(key === 'EPIQUE' ? 'epique' : key === 'LEGENDAIRE' ? 'legendaire' : key).toLowerCase()}` as keyof typeof TRANSLATIONS['fr'];
            const rarityLabel = t(rarityKey) || r.label;
            
            return (
              <button 
                key={key}
                onClick={() => setFilter(key as Rarity)}
                className={`px-4 py-2 rounded-xl font-black uppercase text-sm border-2 transition-all ${filter === key ? 'border-transparent text-black' : 'bg-transparent border-white/20 hover:border-white/50'}`}
                style={{ 
                  backgroundColor: filter === key ? (r as any).hex : 'transparent', 
                  color: filter === key ? '#000' : (r as any).hex,
                  borderColor: filter === key ? 'transparent' : undefined
                }}
              >
                {rarityLabel} ({stats.byRarity[key as Rarity].owned}/{stats.byRarity[key as Rarity].total})
              </button>
            )
          })}
        </div>

        {/* Grid landscape mapping */}
        <div className="overflow-y-auto pr-2 pb-20 custom-scrollbar flex-1 -mx-2 px-2">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
            {displayedCountries.map((country, idx) => {
              const ownedCard = ownedCards.find(c => c.countryName === country.name);
              const isOwned = !!ownedCard;
              const rarity = getCountryRarity(country.name);

              return (
                <motion.div 
                  key={country.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                  className="relative group"
                >
                  <div className={`transition-all duration-300 h-full ${!isOwned ? 'opacity-30 grayscale blur-[2px] pointer-events-none' : ''}`}>
                    <GachaCard 
                      country={country} 
                      rarity={rarity} 
                      isNew={false}
                      className="w-full"
                      onClick={() => isOwned && setInspectingCard({ country, rarity })}
                    />
                  </div>
                  
                  {isOwned && ownedCard.count > 1 && (
                    <div className="absolute -top-3 -right-3 z-30 bg-accent-magenta text-white font-black text-xs sm:text-sm px-2 py-1 rounded-full border-2 border-white shadow-md transform rotate-12">
                      x{ownedCard.count}
                    </div>
                  )}

                  {!isOwned && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                      <div className="bg-black/80 text-white/50 backdrop-blur-sm p-4 rounded-full border border-white/10 shadow-inner flex flex-col items-center">
                        <Lock size={32} />
                      </div>
                    </div>
                  )}
                  
                  {isOwned && (
                    <div className="absolute inset-x-0 bottom-0 top-0 hidden group-hover:flex items-center justify-center pointer-events-none z-40">
                      <span className="bg-black/60 text-white px-3 py-1 rounded-full font-bold text-sm backdrop-blur-md border border-white/20 transition-opacity">
                        {t('btn_inspect')}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </MaxCard>

      {/* Inspect Modal */}
      <AnimatePresence>
        {inspectingCard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => { setInspectingCard(null); setIsFlipped(false); }}
          >
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[300]">
              <MaxButton onClick={() => { setInspectingCard(null); setIsFlipped(false); }} className="px-6 h-12 uppercase text-sm bg-red-500 hover:bg-red-400 border-red-700 shadow-max-cyan">
                 {t('understand')}
              </MaxButton>
            </div>
            
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-full max-w-5xl flex flex-col md:flex-row items-center md:items-stretch gap-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-2"
              onClick={e => e.stopPropagation()} 
            >
              {/* LEFT SIDE: CARD COMPONENT */}
              <div className="flex flex-col w-full max-w-sm md:w-1/2 flex-shrink-0 items-center">
                <div className="text-center mb-6 pointer-events-none sticky top-0 z-50">
                   <p className="text-white/80 mt-1 text-sm sm:text-base font-black uppercase tracking-wider bg-max-bg/90 px-6 py-3 rounded-xl border border-white/20 shadow-lg">
                    {t('collection_flip')}
                  </p>
                </div>

                <div className="relative w-full cursor-pointer max-w-[320px]" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`absolute inset-0 rounded-full blur-[80px] opacity-40 pointer-events-none -z-10
                    ${inspectingCard.rarity === 'GEOCHAOS' ? 'bg-accent-magenta' : 
                      inspectingCard.rarity === 'LEGENDAIRE' ? 'bg-accent-yellow' : 
                      inspectingCard.rarity === 'EPIQUE' ? 'bg-accent-purple' : 
                      inspectingCard.rarity === 'RARE' ? 'bg-accent-cyan' : 'bg-gray-500'}`} 
                  />
                  
                  <motion.div 
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="w-full relative"
                  >
                    <div style={{ backfaceVisibility: 'hidden' }} className="w-full">
                      <GachaCard 
                        country={inspectingCard.country} 
                        rarity={inspectingCard.rarity} 
                        isNew={false}
                        className="w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none"
                      />
                    </div>
                    
                    <div 
                      className="absolute inset-0 rounded-2xl overflow-hidden border-[4px] border-white/20 bg-[#111111] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-0 bg-cover bg-center"
                      style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', backgroundImage: 'url("https://thotismedia.com/wp-content/uploads/2024/01/audencia-scaled.jpg")' }}
                    >
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
                      <div className="w-24 h-24 rounded-full bg-accent-cyan/20 blur-2xl absolute center" />
                      <div className="text-center relative z-10 p-4">
                        <span className="font-black text-3xl sm:text-4xl uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                          GEOCHAOS
                        </span>
                      </div>
                      <div className="absolute bottom-6 relative z-10 text-white/80 text-sm font-bold uppercase tracking-widest drop-shadow-md">
                        {t('collection_edition')} {inspectingCard.rarity}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* RIGHT SIDE: FULL STATS COMPONENT */}
              <div className="w-full md:w-1/2 flex flex-col h-full">
                <MaxCard accent="purple" className="w-full flex-1 flex flex-col items-start text-left bg-max-bg/95 backdrop-blur-xl border-2 border-accent-purple shadow-max-purple">
                  <h3 className="text-2xl sm:text-3xl font-black mb-6 uppercase text-accent-cyan tracking-wide border-b-2 border-white/10 pb-4 w-full">
                    {t('collection_stats')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    {Object.entries(inspectingCard.country).map(([key, val]) => {
                       // Filter out non-display keys
                       if (key === 'name' || key === 'abbreviation' || key.toLowerCase().includes('url') || typeof val === 'object') return null;
                       
                       const displayVal = typeof val === 'number' ? val.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US') : val;

                       const categoryDef = CATEGORIES.find(c => c.id === key);
                       let label = key;
                       if (categoryDef) label = getCategoryTranslation(categoryDef.id).label;
                       else if (key === 'capital') label = t('capital');
                       else if (key === 'population') label = 'Population';

                       const unit = categoryDef?.unit ? ` ${getCategoryTranslation(categoryDef.id).unit}` : '';

                       return (
                         <div key={key} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-accent-cyan/30 transition-colors">
                           <div className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 truncate">{label}</div>
                           <div className="text-lg font-black truncate text-white">{displayVal}{unit}</div>
                         </div>
                       );
                    })}
                  </div>
                </MaxCard>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
