import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { Target } from 'lucide-react';
import { Country } from '../types';
import { COUNTRIES } from '../data/countries';

interface FlagShuffleProps {
  targetCountry: Country;
  onComplete: () => void;
}

export const FlagShuffle = ({ targetCountry, onComplete }: FlagShuffleProps) => {
  const [shuffledFlags, setShuffledFlags] = useState<Country[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    // Selectionner 20 drapeaux aléatoires + le vrai pays à la fin
    const randomCountries = [...COUNTRIES]
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
    
    setShuffledFlags([...randomCountries, targetCountry]);
    
    const timer = setTimeout(() => {
      setIsFinishing(true);
      setTimeout(onComplete, 1500); // Temps pour la révélation finale
    }, 2000);

    return () => clearTimeout(timer);
  }, [targetCountry, onComplete]);

  return (
    <div className="relative h-64 w-full flex items-center justify-center overflow-hidden bg-max-bg/50 rounded-3xl border-4 border-accent-purple shadow-max-purple">
      <AnimatePresence mode="popLayout">
        {!isFinishing ? (
          <motion.div
            key="shuffling"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 items-center"
          >
            {shuffledFlags.map((country, idx) => (
              <motion.img
                key={`${country.abbreviation}-${idx}`}
                src={country.flagUrl || `https://flagcdn.com/w160/${country.abbreviation.toLowerCase()}.png`}
                alt="Flag"
                initial={{ x: 1000 }}
                animate={{ x: -2000 }}
                transition={{ 
                  duration: 0.4, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: idx * 0.05
                }}
                className="h-28 w-auto rounded-lg border-2 border-white shadow-lg"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="winning"
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
            className="flex flex-col items-center gap-4 py-4"
          >
             <div className="relative group">
               <img 
                 src={targetCountry.flagUrl || `https://flagcdn.com/w320/${targetCountry.abbreviation.toLowerCase()}.png`} 
                 alt={targetCountry.name}
                 className="h-32 w-auto rounded-xl border-4 border-white shadow-2xl"
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="absolute -top-4 -right-4 bg-accent-magenta text-white p-2 rounded-full border-2 border-white"
               >
                 <Target size={20} />
               </motion.div>
             </div>
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="bg-accent-yellow px-8 py-2 rounded-full text-max-bg font-black text-2xl uppercase tracking-widest shadow-max-yellow"
             >
               Cible Détectée !
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative scanning line */}
      <motion.div 
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-1 bg-accent-cyan/50 shadow-[0_0_20px_#00F5D4] z-10 pointer-events-none"
      />
    </div>
  );
};
